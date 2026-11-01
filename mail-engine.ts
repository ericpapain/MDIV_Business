// mail-engine.ts
// Moteur de messagerie universel (serveur de développement Node).
// - Autoconfiguration IMAP/SMTP pour n'importe quel domaine
// - Vrai test de connexion (login IMAP + login SMTP)
// - Synchronisation IMAP (Boîte de réception + Envoyés)
// - Envoi SMTP réel
// - Chiffrement AES-256-GCM des mots de passe stockés
// Les bibliothèques (imapflow, nodemailer, mailparser) sont chargées à la demande.
// L'équivalent de production est en PHP : public/api/integrations/mail_lib.php

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';

export interface MailboxConfig {
  email: string;
  display_name?: string;
  provider?: string;
  imap_host: string;
  imap_port: number;
  imap_ssl: boolean;
  imap_user: string;
  smtp_host: string;
  smtp_port: number;
  smtp_ssl: boolean;
  smtp_user: string;
}

export interface SyncedMessage {
  message_id: string;
  direction: 'inbound' | 'outbound';
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  snippet: string;
  body_text: string;
  received_at: string;
  is_read: boolean;
  has_attachments: boolean;
  folder: string;
}

export interface AutoconfigResult {
  provider: string;
  display_name: string;
  imap_host: string;
  imap_port: number;
  imap_ssl: boolean;
  imap_user: string;
  smtp_host: string;
  smtp_port: number;
  smtp_ssl: boolean;
  smtp_user: string;
  source: 'known' | 'ispdb' | 'provider_autoconfig' | 'mx' | 'guess';
  needs_app_password: boolean;
  note: string | null;
}

// ---------------------------------------------------------------------------
// 1. Chiffrement des mots de passe (AES-256-GCM)
// ---------------------------------------------------------------------------
const DEV_KEY_PATH = path.resolve(process.cwd(), '.mail_dev_key');

function getEncryptionKey(): Buffer {
  const envKey = process.env.MAIL_ENCRYPTION_KEY;
  if (envKey && envKey.trim()) {
    return crypto.createHash('sha256').update(envKey.trim()).digest();
  }
  try {
    if (fs.existsSync(DEV_KEY_PATH)) {
      return crypto.createHash('sha256').update(fs.readFileSync(DEV_KEY_PATH, 'utf-8').trim()).digest();
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(DEV_KEY_PATH, generated, 'utf-8');
    return crypto.createHash('sha256').update(generated).digest();
  } catch {
    throw new Error("Clé de chiffrement indisponible : définissez MAIL_ENCRYPTION_KEY.");
  }
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

export function decryptSecret(token: string): string {
  const parts = String(token || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('Secret illisible.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(parts[1], 'base64'));
  decipher.setAuthTag(Buffer.from(parts[2], 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(parts[3], 'base64')), decipher.final()]).toString('utf8');
}

// ---------------------------------------------------------------------------
// 2. Messages d'erreur compréhensibles
// ---------------------------------------------------------------------------
export interface MailErrorInfo {
  kind: 'AUTH' | 'HOST' | 'TIMEOUT' | 'TLS' | 'OTHER';
  message: string;
}

export function explainMailError(err: any, protocol: 'IMAP' | 'SMTP', provider?: string, host?: string): MailErrorInfo {
  const code = String(err?.code || '');
  const raw = String(err?.responseText || err?.response || err?.message || err || '');
  const lower = raw.toLowerCase();
  const target = host ? ` (${host})` : '';

  const isNetwork = /ENOTFOUND|EAI_AGAIN|EDNS|getaddrinfo|ECONNREFUSED|ETIMEDOUT|ECONNRESET|EHOSTUNREACH|ENETUNREACH/i.test(code + ' ' + raw);
  const isAuth =
    err?.authenticationFailed === true ||
    code === 'EAUTH' ||
    (!isNetwork && /auth|login failed|credentials|password|application-specific|username/i.test(lower));

  if (/ENOTFOUND|EAI_AGAIN|EDNS|getaddrinfo/i.test(code + ' ' + raw)) {
    return { kind: 'HOST', message: `Serveur ${protocol}${target} introuvable. Vérifiez le nom du serveur.` };
  }
  if (/ECONNREFUSED/i.test(code + ' ' + raw)) {
    return { kind: 'HOST', message: `Connexion ${protocol}${target} refusée. Vérifiez le port et l'option SSL/TLS.` };
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT' || /timeout|timed out/i.test(lower)) {
    return { kind: 'TIMEOUT', message: `Le serveur ${protocol}${target} ne répond pas (délai dépassé). Vérifiez le serveur, le port et votre pare-feu.` };
  }
  if (/cert|tls|ssl|self.signed|altname|wrong version number/i.test(lower) || /CERT|TLS|SSL/i.test(code)) {
    return { kind: 'TLS', message: `Problème de sécurité TLS/SSL avec le serveur ${protocol}${target}. Vérifiez le port et l'option SSL (993/465 = SSL, 143/587 = STARTTLS).` };
  }
  if (isAuth) {
    if (provider === 'gmail') {
      return { kind: 'AUTH', message: "Gmail a refusé la connexion. Gmail n'accepte pas le mot de passe habituel : activez la validation en 2 étapes puis créez un « mot de passe d'application » (16 lettres) sur myaccount.google.com/apppasswords." };
    }
    if (provider === 'outlook') {
      return { kind: 'AUTH', message: "Microsoft a refusé la connexion. Utilisez un mot de passe d'application (compte Outlook.com avec validation en 2 étapes). Les comptes Microsoft 365 d'entreprise peuvent avoir désactivé l'accès par mot de passe : contactez votre administrateur." };
    }
    if (provider === 'yahoo' || provider === 'icloud') {
      return { kind: 'AUTH', message: `${provider === 'yahoo' ? 'Yahoo' : 'iCloud'} a refusé la connexion. Créez un mot de passe d'application dans les paramètres de sécurité de votre compte.` };
    }
    return { kind: 'AUTH', message: `Identifiant ou mot de passe refusé par le serveur ${protocol}${target}.` };
  }
  return { kind: 'OTHER', message: `Erreur ${protocol}${target} : ${raw.slice(0, 200) || 'inconnue'}` };
}

// ---------------------------------------------------------------------------
// 3. Autoconfiguration pour n'importe quel domaine
// ---------------------------------------------------------------------------
interface KnownProvider {
  provider: string;
  display_name: string;
  imap_host: string; imap_port: number; imap_ssl: boolean;
  smtp_host: string; smtp_port: number; smtp_ssl: boolean;
  needs_app_password: boolean;
  note: string | null;
}

const OVH: KnownProvider = {
  provider: 'ovh', display_name: 'OVHcloud', imap_host: 'ssl0.ovh.net', imap_port: 993, imap_ssl: true,
  smtp_host: 'ssl0.ovh.net', smtp_port: 465, smtp_ssl: true, needs_app_password: false, note: null
};
const GMAIL: KnownProvider = {
  provider: 'gmail', display_name: 'Gmail / Google Workspace', imap_host: 'imap.gmail.com', imap_port: 993, imap_ssl: true,
  smtp_host: 'smtp.gmail.com', smtp_port: 465, smtp_ssl: true, needs_app_password: true,
  note: "Gmail exige un mot de passe d'application (validation en 2 étapes requise) : myaccount.google.com/apppasswords"
};
const OUTLOOK: KnownProvider = {
  provider: 'outlook', display_name: 'Microsoft Outlook / 365', imap_host: 'outlook.office365.com', imap_port: 993, imap_ssl: true,
  smtp_host: 'smtp.office365.com', smtp_port: 587, smtp_ssl: false, needs_app_password: true,
  note: "Outlook.com : utilisez un mot de passe d'application. Microsoft 365 d'entreprise : l'accès par mot de passe peut être désactivé par votre administrateur."
};
const YAHOO: KnownProvider = {
  provider: 'yahoo', display_name: 'Yahoo Mail', imap_host: 'imap.mail.yahoo.com', imap_port: 993, imap_ssl: true,
  smtp_host: 'smtp.mail.yahoo.com', smtp_port: 465, smtp_ssl: true, needs_app_password: true,
  note: "Yahoo exige un mot de passe d'application (Sécurité du compte)."
};
const ICLOUD: KnownProvider = {
  provider: 'icloud', display_name: 'Apple iCloud Mail', imap_host: 'imap.mail.me.com', imap_port: 993, imap_ssl: true,
  smtp_host: 'smtp.mail.me.com', smtp_port: 587, smtp_ssl: false, needs_app_password: true,
  note: "iCloud exige un mot de passe d'application (appleid.apple.com)."
};

const KNOWN_DOMAINS: Record<string, KnownProvider> = {
  'gmail.com': GMAIL, 'googlemail.com': GMAIL,
  'outlook.com': OUTLOOK, 'hotmail.com': OUTLOOK, 'hotmail.fr': OUTLOOK, 'live.com': OUTLOOK,
  'live.fr': OUTLOOK, 'msn.com': OUTLOOK, 'office365.com': OUTLOOK,
  'yahoo.com': YAHOO, 'yahoo.fr': YAHOO, 'ymail.com': YAHOO,
  'icloud.com': ICLOUD, 'me.com': ICLOUD, 'mac.com': ICLOUD,
  'itid-france.com': { ...OVH, display_name: 'ITID France (OVHcloud)' }
};

// Détection par enregistrement MX (domaines d'entreprise hébergés chez un fournisseur connu)
const MX_RULES: Array<{ test: RegExp; value: KnownProvider }> = [
  { test: /(google\.com|googlemail\.com)\.?$/i, value: { ...GMAIL, display_name: 'Google Workspace' } },
  { test: /(protection\.outlook\.com|mail\.protection\.outlook\.com)\.?$/i, value: { ...OUTLOOK, display_name: 'Microsoft 365' } },
  { test: /(\.mail\.ovh\.net|\.ovh\.net|\.ovh\.com)\.?$/i, value: OVH },
  { test: /(\.mail\.ionos\.fr|\.kundenserver\.de|\.ionos\.com)\.?$/i, value: {
      provider: 'custom_imap', display_name: 'IONOS', imap_host: 'imap.ionos.fr', imap_port: 993, imap_ssl: true,
      smtp_host: 'smtp.ionos.fr', smtp_port: 465, smtp_ssl: true, needs_app_password: false, note: null } },
  { test: /(mail\.gandi\.net|gandi\.net)\.?$/i, value: {
      provider: 'custom_imap', display_name: 'Gandi Mail', imap_host: 'mail.gandi.net', imap_port: 993, imap_ssl: true,
      smtp_host: 'mail.gandi.net', smtp_port: 465, smtp_ssl: true, needs_app_password: false, note: null } },
  { test: /(zoho\.com|zoho\.eu)\.?$/i, value: {
      provider: 'custom_imap', display_name: 'Zoho Mail', imap_host: 'imap.zoho.com', imap_port: 993, imap_ssl: true,
      smtp_host: 'smtp.zoho.com', smtp_port: 465, smtp_ssl: true, needs_app_password: false,
      note: "Zoho : activez l'accès IMAP dans les paramètres. Pour un compte européen, utilisez imap.zoho.eu / smtp.zoho.eu." } }
];

function fromKnown(k: KnownProvider, email: string, source: AutoconfigResult['source']): AutoconfigResult {
  return {
    provider: k.provider, display_name: k.display_name,
    imap_host: k.imap_host, imap_port: k.imap_port, imap_ssl: k.imap_ssl, imap_user: email,
    smtp_host: k.smtp_host, smtp_port: k.smtp_port, smtp_ssl: k.smtp_ssl, smtp_user: email,
    source, needs_app_password: k.needs_app_password, note: k.note
  };
}

async function fetchText(url: string, timeoutMs = 4500): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(t);
    if (!res.ok) return null;
    const text = await res.text();
    return text.includes('<clientConfig') ? text : null;
  } catch {
    return null;
  }
}

// Lecture d'un fichier autoconfig au format Mozilla (ISPDB ou autoconfig du fournisseur)
export function parseMozillaAutoconfig(xml: string, email: string): Partial<AutoconfigResult> | null {
  const [localPart, domain] = email.split('@');
  const section = (type: 'incomingServer' | 'outgoingServer', proto: string) => {
    const re = new RegExp(`<${type}\\s+type="${proto}"[^>]*>([\\s\\S]*?)</${type}>`, 'i');
    const m = xml.match(re);
    return m ? m[1] : null;
  };
  const tag = (block: string, name: string) => {
    const m = block.match(new RegExp(`<${name}>([^<]*)</${name}>`, 'i'));
    return m ? m[1].trim() : '';
  };
  const subst = (v: string) => v
    .replace(/%EMAILADDRESS%/gi, email)
    .replace(/%EMAILLOCALPART%/gi, localPart)
    .replace(/%EMAILDOMAIN%/gi, domain);

  const imap = section('incomingServer', 'imap');
  const smtp = section('outgoingServer', 'smtp');
  if (!imap || !smtp) return null;

  const imapHost = subst(tag(imap, 'hostname'));
  const smtpHost = subst(tag(smtp, 'hostname'));
  if (!imapHost || !smtpHost) return null;
  const imapSocket = tag(imap, 'socketType').toUpperCase();
  const smtpSocket = tag(smtp, 'socketType').toUpperCase();

  return {
    imap_host: imapHost,
    imap_port: parseInt(tag(imap, 'port'), 10) || (imapSocket === 'SSL' ? 993 : 143),
    imap_ssl: imapSocket === 'SSL',
    imap_user: subst(tag(imap, 'username')) || email,
    smtp_host: smtpHost,
    smtp_port: parseInt(tag(smtp, 'port'), 10) || (smtpSocket === 'SSL' ? 465 : 587),
    smtp_ssl: smtpSocket === 'SSL',
    smtp_user: subst(tag(smtp, 'username')) || email
  };
}

export async function autoconfigForEmail(rawEmail: string): Promise<AutoconfigResult> {
  const email = rawEmail.trim().toLowerCase();
  const domain = email.split('@')[1] || '';
  if (!domain || !email.includes('@')) throw new Error('Adresse email invalide.');

  // 1. Fournisseurs connus
  if (KNOWN_DOMAINS[domain]) return fromKnown(KNOWN_DOMAINS[domain], email, 'known');

  // 2. Fichier autoconfig du fournisseur lui-même, puis base ISPDB de Mozilla (des milliers de fournisseurs)
  const candidates = [
    `https://autoconfig.${domain}/mail/config-v1.1.xml?emailaddress=${encodeURIComponent(email)}`,
    `https://autoconfig.thunderbird.net/v1.1/${domain}`
  ];
  const results = await Promise.all(candidates.map((u) => fetchText(u)));
  for (let i = 0; i < results.length; i++) {
    const xml = results[i];
    if (!xml) continue;
    const parsed = parseMozillaAutoconfig(xml, email);
    if (parsed) {
      return {
        provider: 'custom_imap',
        display_name: `Messagerie ${domain}`,
        imap_host: parsed.imap_host!, imap_port: parsed.imap_port!, imap_ssl: !!parsed.imap_ssl, imap_user: parsed.imap_user!,
        smtp_host: parsed.smtp_host!, smtp_port: parsed.smtp_port!, smtp_ssl: !!parsed.smtp_ssl, smtp_user: parsed.smtp_user!,
        source: i === 0 ? 'provider_autoconfig' : 'ispdb',
        needs_app_password: false,
        note: null
      };
    }
  }

  // 3. Enregistrement MX (domaine d'entreprise hébergé chez un fournisseur connu)
  try {
    const mx = await dns.resolveMx(domain);
    mx.sort((a, b) => a.priority - b.priority);
    for (const rec of mx) {
      const rule = MX_RULES.find((r) => r.test.test(rec.exchange));
      if (rule) return fromKnown(rule.value, email, 'mx');
    }
  } catch { /* pas de MX */ }

  // 4. Supposition raisonnable, à confirmer par le test de connexion
  return {
    provider: 'custom_imap',
    display_name: `Messagerie ${domain}`,
    imap_host: `imap.${domain}`, imap_port: 993, imap_ssl: true, imap_user: email,
    smtp_host: `smtp.${domain}`, smtp_port: 465, smtp_ssl: true, smtp_user: email,
    source: 'guess',
    needs_app_password: false,
    note: "Serveurs non reconnus automatiquement : nous avons proposé imap./smtp.votre-domaine. Si le test échoue, renseignez les serveurs indiqués par votre hébergeur."
  };
}

// ---------------------------------------------------------------------------
// 4. Test de connexion réel
// ---------------------------------------------------------------------------
function isLoopback(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|::1)$/i.test(host.trim());
}

export async function verifyImap(cfg: MailboxConfig, password: string): Promise<void> {
  const { ImapFlow } = await import('imapflow');
  const client = new ImapFlow({
    host: cfg.imap_host,
    port: cfg.imap_port,
    secure: !!cfg.imap_ssl,
    auth: { user: cfg.imap_user || cfg.email, pass: password },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 20000
  });
  client.on('error', () => { /* géré par le rejet de connect() */ });
  try {
    await client.connect();
  } finally {
    try { await client.logout(); } catch { try { client.close(); } catch { /* noop */ } }
  }
}

function buildTransport(cfg: MailboxConfig, password: string, nodemailer: any) {
  return nodemailer.createTransport({
    host: cfg.smtp_host,
    port: cfg.smtp_port,
    secure: !!cfg.smtp_ssl,
    // STARTTLS obligatoire, sauf boucle locale (le trafic ne quitte pas la machine)
    requireTLS: !cfg.smtp_ssl && !isLoopback(cfg.smtp_host),
    auth: { user: cfg.smtp_user || cfg.email, pass: password },
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 25000
  });
}

export async function verifySmtp(cfg: MailboxConfig, password: string): Promise<void> {
  const nodemailer = (await import('nodemailer')).default;
  const transport = buildTransport(cfg, password, nodemailer);
  try {
    await transport.verify();
  } finally {
    transport.close();
  }
}

// ---------------------------------------------------------------------------
// 5. Envoi SMTP réel
// ---------------------------------------------------------------------------
export async function sendMail(
  cfg: MailboxConfig,
  password: string,
  msg: { to: string; subject: string; body: string; inReplyTo?: string; references?: string }
): Promise<{ messageId: string; accepted: string[]; response: string }> {
  const nodemailer = (await import('nodemailer')).default;
  const transport = buildTransport(cfg, password, nodemailer);
  try {
    const info = await transport.sendMail({
      from: { name: cfg.display_name || cfg.email, address: cfg.email },
      to: msg.to,
      subject: msg.subject,
      text: msg.body,
      inReplyTo: msg.inReplyTo || undefined,
      references: msg.references || undefined
    });
    const accepted = (info.accepted || []).map(String);
    if (accepted.length === 0) {
      throw new Error(`Le serveur a refusé le destinataire ${msg.to}.`);
    }
    return { messageId: info.messageId, accepted, response: String(info.response || '') };
  } finally {
    transport.close();
  }
}

// ---------------------------------------------------------------------------
// 6. Synchronisation IMAP (Boîte de réception + Envoyés)
// ---------------------------------------------------------------------------
const syncLocks = new Set<string>();

function addr(a: any): { email: string; name: string } {
  const first = a?.value?.[0];
  return { email: String(first?.address || '').toLowerCase(), name: String(first?.name || '') };
}

function allAddrs(a: any): Array<{ email: string; name: string }> {
  const out: Array<{ email: string; name: string }> = [];
  const list = Array.isArray(a) ? a : a ? [a] : [];
  for (const group of list) {
    for (const v of group?.value || []) {
      if (v?.address) out.push({ email: String(v.address).toLowerCase(), name: String(v.name || '') });
    }
  }
  return out;
}

export async function syncMailbox(
  cfg: MailboxConfig,
  password: string,
  opts: { contactEmail?: string; sinceDays?: number; limit?: number; lockKey: string }
): Promise<{ messages: SyncedMessage[]; folders: string[] }> {
  if (syncLocks.has(opts.lockKey)) {
    throw new Error('Une synchronisation est déjà en cours pour cette boîte.');
  }
  syncLocks.add(opts.lockKey);

  const { ImapFlow } = await import('imapflow');
  const { simpleParser } = await import('mailparser');
  const limit = Math.min(Math.max(opts.limit || 100, 1), 500);
  const contact = (opts.contactEmail || '').trim().toLowerCase();
  const since = !contact && opts.sinceDays
    ? new Date(Date.now() - opts.sinceDays * 86400000)
    : null;
  const myEmail = cfg.email.toLowerCase();

  const client = new ImapFlow({
    host: cfg.imap_host,
    port: cfg.imap_port,
    secure: !!cfg.imap_ssl,
    auth: { user: cfg.imap_user || cfg.email, pass: password },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 60000
  });
  client.on('error', () => { /* géré par les rejets */ });

  const messages: SyncedMessage[] = [];
  const folders: string[] = [];

  try {
    await client.connect();

    const list = await client.list();
    const sentBox = list.find((b: any) => b.specialUse === '\\Sent')
      || list.find((b: any) => /^(inbox\.)?(sent|envoy|éléments envoyés|elements envoyes|gesendet|sent items|sent messages)/i.test(b.name || b.path || ''));

    const targets: Array<{ path: string; sent: boolean }> = [{ path: 'INBOX', sent: false }];
    if (sentBox) targets.push({ path: sentBox.path, sent: true });

    for (const target of targets) {
      let lock;
      try {
        lock = await client.getMailboxLock(target.path);
      } catch {
        continue;
      }
      try {
        folders.push(target.path);

        const criteria: any = {};
        if (contact) criteria.or = [{ from: contact }, { to: contact }, { cc: contact }];
        if (since) criteria.since = since;
        if (!contact && !since) criteria.all = true;

        const found = (await client.search(criteria, { uid: true })) || [];
        const uids = (found as number[]).slice(-limit);
        if (uids.length === 0) continue;

        for await (const m of client.fetch(uids.join(','), {
          uid: true, flags: true, envelope: true, internalDate: true,
          source: { maxLength: 2 * 1024 * 1024 }
        } as any, { uid: true })) {
          try {
            const parsed = await simpleParser((m as any).source);
            const from = addr(parsed.from);
            const toList = allAddrs(parsed.to as any);
            const ccList = allAddrs(parsed.cc as any);
            const everyone = [...toList, ...ccList];

            const outbound = target.sent || from.email === myEmail;
            let recipient = toList[0] || { email: myEmail, name: '' };
            if (contact) {
              const hit = everyone.find((x) => x.email === contact);
              if (hit) recipient = hit;
            }

            const text = String(parsed.text || '').replace(/\r\n/g, '\n').trim();
            const date = parsed.date || (m as any).internalDate || (m as any).envelope?.date || new Date();
            const flags: Set<string> = (m as any).flags || new Set();

            messages.push({
              message_id: parsed.messageId || `<uid-${target.path}-${(m as any).uid}@${cfg.imap_host}>`,
              direction: outbound ? 'outbound' : 'inbound',
              sender_email: from.email,
              sender_name: from.name,
              recipient_email: outbound ? recipient.email : (toList[0]?.email || myEmail),
              recipient_name: outbound ? recipient.name : (toList[0]?.name || ''),
              subject: String(parsed.subject || '').slice(0, 500),
              snippet: text.replace(/\s+/g, ' ').slice(0, 200),
              body_text: text.slice(0, 30000),
              received_at: new Date(date).toISOString(),
              is_read: flags.has('\\Seen'),
              has_attachments: (parsed.attachments || []).length > 0,
              folder: target.path
            });
          } catch {
            /* message illisible : ignoré */
          }
        }
      } finally {
        lock.release();
      }
    }
  } finally {
    syncLocks.delete(opts.lockKey);
    try { await client.logout(); } catch { try { client.close(); } catch { /* noop */ } }
  }

  return { messages, folders };
}

// ---------------------------------------------------------------------------
// 7. Brouillon dans la boîte (dossier Brouillons via IMAP APPEND)
// ---------------------------------------------------------------------------
export async function saveDraft(
  cfg: MailboxConfig,
  password: string,
  msg: { to: string; subject: string; body: string }
): Promise<{ folder: string }> {
  const { ImapFlow } = await import('imapflow');
  const MailComposer = (await import('nodemailer/lib/mail-composer/index.js')).default as any;

  const raw: Buffer = await new Promise((resolve, reject) => {
    new MailComposer({
      from: { name: cfg.display_name || cfg.email, address: cfg.email },
      to: msg.to || undefined,
      subject: msg.subject,
      text: msg.body
    }).compile().build((err: Error | null, message: Buffer) => (err ? reject(err) : resolve(message)));
  });

  const client = new ImapFlow({
    host: cfg.imap_host,
    port: cfg.imap_port,
    secure: !!cfg.imap_ssl,
    auth: { user: cfg.imap_user || cfg.email, pass: password },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 30000
  });
  client.on('error', () => { /* géré par les rejets */ });

  try {
    await client.connect();
    const list = await client.list();
    const drafts = list.find((b: any) => b.specialUse === '\\Drafts')
      || list.find((b: any) => /^(inbox\.)?(drafts?|brouillons?|entw[uü]rfe)/i.test(b.name || b.path || ''));
    if (!drafts) throw new Error("Aucun dossier Brouillons trouvé dans cette boîte.");
    await client.append(drafts.path, raw, ['\\Draft', '\\Seen']);
    return { folder: drafts.path };
  } finally {
    try { await client.logout(); } catch { try { client.close(); } catch { /* noop */ } }
  }
}
