// vite-dev-mail.ts
// Endpoints /api/integrations/* du serveur de développement (équivalent Node des fichiers PHP de production).
// Stockage : dev_mail_store.json (ignoré par git) — jamais dans dev_db.json.

import http from 'http';
import fs from 'fs';
import path from 'path';
import {
  MailboxConfig,
  autoconfigForEmail,
  decryptSecret,
  encryptSecret,
  explainMailError,
  saveDraft,
  sendMail,
  syncMailbox,
  verifyImap,
  verifySmtp
} from './mail-engine';

const STORE_PATH = path.resolve(process.cwd(), 'dev_mail_store.json');

interface MailStore {
  mailboxes: any[];
  threads: any[];
}

function loadStore(): MailStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const s = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      return { mailboxes: s.mailboxes || [], threads: s.threads || [] };
    }
  } catch { /* store corrompu : repart de zéro */ }
  return { mailboxes: [], threads: [] };
}

function saveStore(store: MailStore) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function publicMailbox(m: any) {
  const { password_enc, ...safe } = m;
  return safe;
}

function send(res: http.ServerResponse, status: number, payload: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJson(req: http.IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Authentification : en dev, le jeton est « mdiv_dev_jwt_<companyId>_<timestamp> » ou fallback entreprise 1.
function authenticate(req: http.IncomingMessage, urlObj: URL, body?: Record<string, any>): number | null {
  const auth = String(req.headers.authorization || '');
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token && token !== 'anonymous') {
      const m = token.match(/^mdiv_dev_jwt_(\d+)_/);
      if (m) return parseInt(m[1], 10);
    }
  }
  // En dev local : accepter l'entreprise fournie ou 1 par défaut pour permettre le test direct
  const fromReq = urlObj.searchParams.get('company_id') || (body && (body.company_id ?? body.companyId));
  const id = parseInt(String(fromReq ?? '1'), 10);
  return Number.isFinite(id) ? id : 1;
}

function toConfig(m: any): MailboxConfig {
  return {
    email: m.email,
    display_name: m.display_name,
    provider: m.provider,
    imap_host: m.imap_host, imap_port: m.imap_port, imap_ssl: !!m.imap_ssl, imap_user: m.imap_user,
    smtp_host: m.smtp_host, smtp_port: m.smtp_port, smtp_ssl: !!m.smtp_ssl, smtp_user: m.smtp_user
  };
}

function bool(v: any, fallback: boolean): boolean {
  if (v === undefined || v === null || v === '') return fallback;
  if (typeof v === 'string') return !['false', '0', 'no', 'non'].includes(v.toLowerCase());
  return !!v;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Retourne true si la requête a été traitée. */
export async function handleDevMailRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  urlObj: URL,
  pathname: string
): Promise<boolean> {
  if (!pathname.startsWith('/api/integrations/')) return false;
  const endpoint = pathname.replace('/api/integrations/', '');
  const handled = [
    'mailboxes.php', 'mailbox_autoconfig.php', 'sync_mailbox.php', 'fetch_emails.php',
    'send_email.php', 'create_draft.php', 'status.php', 'disconnect.php', 'oauth_connect.php'
  ];
  if (!handled.includes(endpoint)) return false;

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 200;
    res.end();
    return true;
  }

  const body = (req.method === 'POST' || req.method === 'DELETE') ? await readJson(req) : {};
  const companyId = authenticate(req, urlObj, body);
  if (companyId === null) {
    send(res, 401, { error: 'Authentification requise. Connectez-vous pour gérer vos boîtes mail.' });
    return true;
  }

  const store = loadStore();

  // -------------------------------------------------------------------------
  // Autoconfiguration d'un domaine
  // -------------------------------------------------------------------------
  if (endpoint === 'mailbox_autoconfig.php' && req.method === 'GET') {
    const email = (urlObj.searchParams.get('email') || '').trim();
    if (!EMAIL_RE.test(email)) {
      send(res, 422, { error: 'Adresse email invalide.' });
      return true;
    }
    try {
      send(res, 200, { success: true, config: await autoconfigForEmail(email) });
    } catch (e: any) {
      send(res, 500, { error: e.message || 'Autoconfiguration impossible.' });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Boîtes : liste / ajout avec test réel / suppression
  // -------------------------------------------------------------------------
  if (endpoint === 'mailboxes.php') {
    if (req.method === 'GET') {
      const list = store.mailboxes.filter((m) => m.company_id === companyId).map(publicMailbox);
      send(res, 200, { success: true, company_id: companyId, mailboxes: list });
      return true;
    }

    if (req.method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      let password = String(body.password || '').trim();
      const provider = String(body.provider || 'custom_imap').trim();

      if (!EMAIL_RE.test(email)) {
        send(res, 422, { error: 'Adresse email invalide ou obligatoire.' });
        return true;
      }
      const imapHost = String(body.imap_host || '').trim();
      const smtpHost = String(body.smtp_host || '').trim();
      if (!imapHost || !smtpHost) {
        send(res, 422, { error: 'Les serveurs IMAP et SMTP doivent être spécifiés.' });
        return true;
      }
      if (provider === 'gmail' || imapHost.includes('gmail.com') || smtpHost.includes('gmail.com')) {
        password = password.replace(/\s+/g, '');
      }
      if (!password) {
        send(res, 422, { error: "Le mot de passe de messagerie (ou mot de passe d'application) est requis." });
        return true;
      }

      const cfg: MailboxConfig = {
        email,
        display_name: String(body.display_name || email).trim(),
        provider,
        imap_host: imapHost,
        imap_port: parseInt(String(body.imap_port || 993), 10),
        imap_ssl: bool(body.imap_ssl, true),
        imap_user: String(body.imap_user || email).trim(),
        smtp_host: smtpHost,
        smtp_port: parseInt(String(body.smtp_port || 465), 10),
        smtp_ssl: bool(body.smtp_ssl, true),
        smtp_user: String(body.smtp_user || email).trim()
      };

      // Test réel : login IMAP + login SMTP
      const [imapRes, smtpRes] = await Promise.allSettled([verifyImap(cfg, password), verifySmtp(cfg, password)]);
      const details: Record<string, string> = {};
      if (imapRes.status === 'rejected') details.imap = explainMailError(imapRes.reason, 'IMAP', provider, cfg.imap_host).message;
      if (smtpRes.status === 'rejected') details.smtp = explainMailError(smtpRes.reason, 'SMTP', provider, cfg.smtp_host).message;
      if (details.imap || details.smtp) {
        const sameReason = details.imap && details.smtp &&
          details.imap.replace(/\((imap|smtp)[^)]*\)/gi, '').replace(/IMAP|SMTP/g, '') ===
          details.smtp.replace(/\((imap|smtp)[^)]*\)/gi, '').replace(/IMAP|SMTP/g, '');
        send(res, 422, {
          error: sameReason
            ? details.imap
            : [details.imap && `Réception (IMAP) : ${details.imap}`, details.smtp && `Envoi (SMTP) : ${details.smtp}`]
                .filter(Boolean).join(' — '),
          details
        });
        return true;
      }

      const now = new Date().toISOString();
      const idx = store.mailboxes.findIndex((m) => m.company_id === companyId && String(m.email).toLowerCase() === email);
      const record = {
        id: idx >= 0 ? store.mailboxes[idx].id : Date.now(),
        company_id: companyId,
        ...cfg,
        password_enc: encryptSecret(password),
        is_active: true,
        last_sync_at: null,
        last_error: null,
        created_at: idx >= 0 ? store.mailboxes[idx].created_at : now
      };
      if (idx >= 0) store.mailboxes[idx] = record; else store.mailboxes.push(record);
      saveStore(store);

      send(res, 200, {
        success: true,
        message: `La boîte ${email} est connectée : connexion IMAP et SMTP vérifiées.`,
        mailbox: publicMailbox(record)
      });
      return true;
    }

    if (req.method === 'DELETE') {
      const id = urlObj.searchParams.get('id');
      if (!id) {
        send(res, 400, { error: 'ID de boîte invalide.' });
        return true;
      }
      store.mailboxes = store.mailboxes.filter((m) => !(String(m.id) === String(id) && m.company_id === companyId));
      store.threads = store.threads.filter((t) => !(String(t.mailbox_id) === String(id) && t.company_id === companyId));
      saveStore(store);
      send(res, 200, { success: true, message: 'Boîte de messagerie déconnectée.' });
      return true;
    }
  }

  // -------------------------------------------------------------------------
  // Synchronisation IMAP (boîte entière ou historique d'un contact)
  // -------------------------------------------------------------------------
  if (endpoint === 'sync_mailbox.php' && req.method === 'POST') {
    const mailboxId = body.mailbox_id ?? body.mailboxId;
    const mailbox = store.mailboxes.find((m) =>
      m.company_id === companyId && (mailboxId ? String(m.id) === String(mailboxId) : m.is_active)
    );
    if (!mailbox) {
      send(res, 404, { error: "Aucune boîte mail connectée. Connectez d'abord une boîte." });
      return true;
    }
    const contactEmail = String(body.contact_email || body.contactEmail || '').trim().toLowerCase();

    try {
      const password = decryptSecret(mailbox.password_enc);
      const { messages, folders } = await syncMailbox(toConfig(mailbox), password, {
        contactEmail: contactEmail || undefined,
        sinceDays: parseInt(String(body.since_days || 60), 10),
        limit: parseInt(String(body.limit || (contactEmail ? 200 : 100)), 10),
        lockKey: `${companyId}:${mailbox.id}`
      });

      let imported = 0;
      for (const m of messages) {
        const exists = store.threads.some((t) => String(t.mailbox_id) === String(mailbox.id) && t.message_id === m.message_id);
        if (exists) continue;
        store.threads.push({
          id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
          company_id: companyId,
          mailbox_id: mailbox.id,
          message_id: m.message_id,
          direction: m.direction,
          sender_email: m.sender_email,
          sender_name: m.sender_name,
          recipient_email: m.recipient_email,
          recipient_name: m.recipient_name,
          subject: m.subject,
          snippet: m.snippet,
          body_text: m.body_text,
          received_at: m.received_at,
          is_read: m.is_read,
          has_attachments: m.has_attachments
        });
        imported++;
      }
      mailbox.last_sync_at = new Date().toISOString();
      mailbox.last_error = null;
      saveStore(store);

      send(res, 200, {
        success: true,
        imported,
        fetched: messages.length,
        folders,
        contact_email: contactEmail || null,
        mailbox: publicMailbox(mailbox)
      });
    } catch (e: any) {
      const info = explainMailError(e, 'IMAP', mailbox.provider, mailbox.imap_host);
      const message = /déjà en cours/.test(String(e?.message)) ? e.message : info.message;
      mailbox.last_error = message;
      saveStore(store);
      send(res, 502, { error: message });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Lecture de l'historique (cache local)
  // -------------------------------------------------------------------------
  if (endpoint === 'fetch_emails.php' && req.method === 'GET') {
    const mailboxId = urlObj.searchParams.get('mailbox_id');
    const contact = (urlObj.searchParams.get('contact_email') || '').trim().toLowerCase();
    const search = (urlObj.searchParams.get('search') || '').trim().toLowerCase();
    const limit = Math.min(Math.max(parseInt(urlObj.searchParams.get('limit') || '50', 10) || 50, 1), 200);

    let threads = store.threads.filter((t) => t.company_id === companyId);
    if (mailboxId) threads = threads.filter((t) => String(t.mailbox_id) === String(mailboxId));
    if (contact) {
      threads = threads.filter((t) =>
        String(t.sender_email || '').toLowerCase() === contact ||
        String(t.recipient_email || '').toLowerCase() === contact
      );
    }
    if (search) {
      threads = threads.filter((t) =>
        [t.subject, t.sender_email, t.recipient_email, t.snippet, t.body_text]
          .some((f) => String(f || '').toLowerCase().includes(search))
      );
    }
    threads.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
    threads = threads.slice(0, limit).map((t) => {
      const mb = store.mailboxes.find((m) => String(m.id) === String(t.mailbox_id));
      return { ...t, mailbox_name: mb?.display_name || null, mailbox_email: mb?.email || null };
    });

    send(res, 200, { success: true, count: threads.length, contact_email: contact || null, search: search || null, messages: threads });
    return true;
  }

  // -------------------------------------------------------------------------
  // Envoi SMTP réel
  // -------------------------------------------------------------------------
  if (endpoint === 'send_email.php' && req.method === 'POST') {
    const to = String(body.to || '').trim();
    const subject = String(body.subject || 'Message').trim();
    const text = String(body.body || '').trim();
    const leadName = String(body.leadName || body.lead_name || '').trim();
    const mailboxId = body.mailboxId ?? body.mailbox_id;

    if (!EMAIL_RE.test(to)) {
      send(res, 422, { error: 'Adresse email du destinataire invalide.' });
      return true;
    }
    if (!text) {
      send(res, 422, { error: 'Le contenu du message ne peut pas être vide.' });
      return true;
    }
    const mailbox = store.mailboxes.find((m) =>
      m.company_id === companyId && (mailboxId ? String(m.id) === String(mailboxId) : m.is_active)
    );
    if (!mailbox) {
      send(res, 422, { error: "Aucune boîte mail connectée : impossible d'envoyer. Connectez d'abord une boîte." });
      return true;
    }

    try {
      const info = await sendMail(toConfig(mailbox), decryptSecret(mailbox.password_enc), {
        to, subject, body: text,
        inReplyTo: body.inReplyTo || undefined,
        references: body.references || undefined
      });

      store.threads.push({
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
        company_id: companyId,
        mailbox_id: mailbox.id,
        message_id: info.messageId,
        direction: 'outbound',
        sender_email: mailbox.email,
        sender_name: mailbox.display_name || mailbox.email,
        recipient_email: to.toLowerCase(),
        recipient_name: leadName || to,
        subject,
        snippet: text.replace(/\s+/g, ' ').slice(0, 200),
        body_text: text,
        received_at: new Date().toISOString(),
        is_read: true,
        has_attachments: false
      });
      saveStore(store);

      send(res, 200, {
        success: true,
        messageId: info.messageId,
        from: mailbox.email,
        to,
        subject,
        sentAt: new Date().toISOString(),
        info: `Email remis au serveur SMTP de ${mailbox.email} (${mailbox.smtp_host}) pour ${to}.`
      });
    } catch (e: any) {
      const info = explainMailError(e, 'SMTP', mailbox.provider, mailbox.smtp_host);
      send(res, 502, { error: `Envoi impossible. ${info.message}` });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Brouillon réel dans le dossier Brouillons de la boîte
  // -------------------------------------------------------------------------
  if (endpoint === 'create_draft.php' && req.method === 'POST') {
    const mailboxId = body.mailboxId ?? body.mailbox_id;
    const mailbox = store.mailboxes.find((m) =>
      m.company_id === companyId && (mailboxId ? String(m.id) === String(mailboxId) : m.is_active)
    );
    if (!mailbox) {
      send(res, 422, { error: "Aucune boîte mail connectée : impossible de créer un brouillon." });
      return true;
    }
    try {
      const out = await saveDraft(toConfig(mailbox), decryptSecret(mailbox.password_enc), {
        to: String(body.to || '').trim(),
        subject: String(body.subject || 'Brouillon').trim(),
        body: String(body.body || '')
      });
      send(res, 200, {
        success: true,
        draftId: `${mailbox.id}:${out.folder}:${Date.now()}`,
        folder: out.folder,
        info: `Brouillon enregistré dans le dossier « ${out.folder} » de ${mailbox.email}.`
      });
    } catch (e: any) {
      const info = explainMailError(e, 'IMAP', mailbox.provider, mailbox.imap_host);
      send(res, 502, { error: /Brouillons/.test(String(e?.message)) ? e.message : info.message });
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Compatibilité avec l'ancien écran « Google / Microsoft »
  // -------------------------------------------------------------------------
  if (endpoint === 'status.php') {
    const mine = store.mailboxes.filter((m) => m.company_id === companyId);
    const google = mine.find((m) => m.provider === 'gmail');
    const ms = mine.find((m) => m.provider === 'outlook');
    send(res, 200, {
      success: true,
      company_id: companyId,
      google: { connected: !!google, email: google ? google.email : null, last_sync: google ? google.last_sync_at : null },
      microsoft: { connected: !!ms, email: ms ? ms.email : null, last_sync: ms ? ms.last_sync_at : null },
      mailboxes: mine.map(publicMailbox),
      total_mailboxes: mine.length
    });
    return true;
  }

  if (endpoint === 'disconnect.php' && req.method === 'POST') {
    const provider = body.provider === 'microsoft' ? 'outlook' : body.provider === 'google' ? 'gmail' : String(body.provider || '');
    const removed = store.mailboxes.filter((m) => m.company_id === companyId && m.provider === provider).map((m) => String(m.id));
    store.mailboxes = store.mailboxes.filter((m) => !removed.includes(String(m.id)));
    store.threads = store.threads.filter((t) => !removed.includes(String(t.mailbox_id)));
    saveStore(store);
    send(res, 200, { success: true, message: 'Boîte déconnectée.' });
    return true;
  }

  if (endpoint === 'oauth_connect.php') {
    send(res, 501, {
      error: "La connexion OAuth Google/Microsoft n'est pas disponible. Utilisez « Connecter une boîte » avec un mot de passe d'application."
    });
    return true;
  }

  send(res, 405, { error: 'Méthode non autorisée.' });
  return true;
}
