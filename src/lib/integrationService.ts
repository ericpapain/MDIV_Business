// src/lib/integrationService.ts
// Service d'Intégration Messagerie Universelle & Historique des Échanges (Zero Mock Data)
import { getApiUrl } from './apiConfig';

export type IntegrationProvider = 'google' | 'microsoft';

export interface IntegrationAccount {
  connected: boolean;
  email: string | null;
  last_sync?: string | null;
}

export interface CompanyIntegrationsState {
  google: IntegrationAccount;
  microsoft: IntegrationAccount;
}

export interface UniversalMailbox {
  id: number | string;
  company_id: number;
  email: string;
  display_name: string;
  provider: 'gmail' | 'itid_ovh' | 'ovh' | 'outlook' | 'yahoo' | 'icloud' | 'custom_imap';
  imap_host: string;
  imap_port: number;
  imap_ssl: boolean;
  imap_user: string;
  smtp_host: string;
  smtp_port: number;
  smtp_ssl: boolean;
  smtp_user: string;
  is_active: boolean;
  last_sync_at?: string | null;
  created_at?: string;
}

export interface EmailThreadMessage {
  id: number | string;
  company_id: number;
  mailbox_id: number | string;
  message_id: string;
  direction: 'inbound' | 'outbound';
  sender_email: string;
  sender_name?: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  snippet: string;
  body_text?: string;
  body_html?: string;
  received_at: string;
  is_read: boolean;
  has_attachments: boolean;
}

/**
 * Détection automatique intelligente des paramètres de serveurs (IMAP/SMTP)
 * selon le nom de domaine de l'adresse saisie.
 */
export function detectMailboxPreset(email: string): Partial<UniversalMailbox> {
  const cleaned = email.trim().toLowerCase();
  const domain = cleaned.split('@')[1] || '';

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return {
      provider: 'gmail',
      display_name: 'Compte Google / Gmail',
      imap_host: 'imap.gmail.com',
      imap_port: 993,
      imap_ssl: true,
      imap_user: cleaned,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 465,
      smtp_ssl: true,
      smtp_user: cleaned
    };
  }

  if (domain === 'itid-france.com' || domain.includes('ovh')) {
    return {
      provider: 'itid_ovh',
      display_name: domain === 'itid-france.com' ? 'ITID France (OVHcloud)' : 'Messagerie OVHcloud',
      imap_host: 'ssl0.ovh.net',
      imap_port: 993,
      imap_ssl: true,
      imap_user: cleaned,
      smtp_host: 'ssl0.ovh.net',
      smtp_port: 465,
      smtp_ssl: true,
      smtp_user: cleaned
    };
  }

  if (['outlook.com', 'hotmail.com', 'live.com', 'office365.com'].includes(domain)) {
    return {
      provider: 'outlook',
      display_name: 'Microsoft Outlook / Office 365',
      imap_host: 'outlook.office365.com',
      imap_port: 993,
      imap_ssl: true,
      imap_user: cleaned,
      smtp_host: 'smtp.office365.com',
      smtp_port: 587,
      smtp_ssl: false,
      smtp_user: cleaned
    };
  }

  if (domain === 'yahoo.com' || domain === 'yahoo.fr') {
    return {
      provider: 'yahoo',
      display_name: 'Yahoo Mail',
      imap_host: 'imap.mail.yahoo.com',
      imap_port: 993,
      imap_ssl: true,
      imap_user: cleaned,
      smtp_host: 'smtp.mail.yahoo.com',
      smtp_port: 465,
      smtp_ssl: true,
      smtp_user: cleaned
    };
  }

  if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') {
    return {
      provider: 'icloud',
      display_name: 'Apple iCloud Mail',
      imap_host: 'imap.mail.me.com',
      imap_port: 993,
      imap_ssl: true,
      imap_user: cleaned,
      smtp_host: 'smtp.mail.me.com',
      smtp_port: 587,
      smtp_ssl: false,
      smtp_user: cleaned
    };
  }

  // Domaine personnalisé d'entreprise : suggestion basée sur le nom de domaine
  const domainPart = domain || 'mon-entreprise.fr';
  return {
    provider: 'custom_imap',
    display_name: `Messagerie Pro (${domainPart})`,
    imap_host: `mail.${domainPart}`,
    imap_port: 993,
    imap_ssl: true,
    imap_user: cleaned,
    smtp_host: `mail.${domainPart}`,
    smtp_port: 465,
    smtp_ssl: true,
    smtp_user: cleaned
  };
}

/**
 * Récupère le jeton JWT d'authentification stocké
 */
export function getStoredAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('mdiv_token') ||
    localStorage.getItem('mdiv_auth_token') ||
    sessionStorage.getItem('mdiv_token') ||
    sessionStorage.getItem('mdiv_auth_token') ||
    ''
  );
}

/**
 * Autoconfiguration intelligente d'une adresse email via l'API (ISPDB, MX, presets)
 */
export async function fetchMailboxAutoconfig(email: string, companyId?: number): Promise<{
  success: boolean;
  config: Partial<UniversalMailbox> & {
    source?: string;
    needs_app_password?: boolean;
    note?: string | null;
  };
}> {
  const cid = companyId || 1;
  const token = getStoredAuthToken();
  try {
    const res = await fetch(getApiUrl(`integrations/mailbox_autoconfig.php?email=${encodeURIComponent(email)}&company_id=${cid}`), {
      headers: {
        'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        return { success: true, config: data.config };
      }
    }
  } catch (e) {
    // Fallback local en cas d'indisponibilité réseau
  }
  const local = detectMailboxPreset(email);
  return { success: true, config: local };
}

/**
 * Récupère la liste des boîtes emails réelles connectées pour l'entreprise
 */
export async function fetchMailboxes(companyId?: number): Promise<UniversalMailbox[]> {
  const cid = companyId || 1;
  const token = getStoredAuthToken();
  try {
    const res = await fetch(getApiUrl(`integrations/mailboxes.php?company_id=${cid}`), {
      headers: {
        'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.mailboxes) ? data.mailboxes : [];
  } catch (e) {
    console.error('Erreur récupération boîtes:', e);
    return [];
  }
}

/**
 * Enregistre et teste une boîte de messagerie réelle
 */
export async function saveAndTestMailbox(params: {
  mailbox: Partial<UniversalMailbox>;
  password: string;
  companyId?: number;
}): Promise<{ success: boolean; mailbox?: UniversalMailbox; message: string }> {
  const cid = params.companyId || 1;
  const token = getStoredAuthToken();
  const res = await fetch(getApiUrl('integrations/mailboxes.php'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
    },
    body: JSON.stringify({
      company_id: cid,
      ...params.mailbox,
      password: params.password
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Échec de connexion à la boîte de messagerie");
  }
  return data;
}

/**
 * Supprime/déconnecte une boîte de messagerie
 */
export async function deleteMailbox(id: number | string, companyId?: number): Promise<{ success: boolean }> {
  const cid = companyId || 1;
  const token = getStoredAuthToken();
  const res = await fetch(getApiUrl(`integrations/mailboxes.php?id=${id}&company_id=${cid}`), {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
    }
  });
  return res.json();
}

/**
 * Déclenche une synchronisation IMAP réelle (INBOX + Sent)
 */
export async function syncMailboxHistory(params: {
  mailboxId?: number | string;
  contactEmail?: string;
  sinceDays?: number;
  limit?: number;
  companyId?: number;
}): Promise<{ success: boolean; imported: number; fetched: number; message?: string }> {
  const cid = params.companyId || 1;
  const token = getStoredAuthToken();
  const res = await fetch(getApiUrl('integrations/sync_mailbox.php'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
    },
    body: JSON.stringify({
      company_id: cid,
      mailbox_id: params.mailboxId,
      contact_email: params.contactEmail,
      since_days: params.sinceDays || 60,
      limit: params.limit || (params.contactEmail ? 200 : 100)
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Échec de synchronisation de la boîte mail.");
  }
  return data;
}

/**
 * Récupère l'historique complet des emails (fils de discussion par contact ou tous les emails)
 */
export async function fetchEmailHistoryThread(params: {
  mailboxId?: number | string;
  contactEmail?: string;
  search?: string;
  limit?: number;
  companyId?: number;
}): Promise<{ success: boolean; messages: EmailThreadMessage[]; count: number }> {
  const cid = params.companyId || 1;
  const token = getStoredAuthToken();
  const searchParams = new URLSearchParams({
    company_id: String(cid),
    ...(params.mailboxId ? { mailbox_id: String(params.mailboxId) } : {}),
    ...(params.contactEmail ? { contact_email: params.contactEmail } : {}),
    ...(params.search ? { search: params.search } : {}),
    ...(params.limit ? { limit: String(params.limit) } : {})
  });

  try {
    const res = await fetch(getApiUrl(`integrations/fetch_emails.php?${searchParams.toString()}`), {
      headers: {
        'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
      }
    });
    if (!res.ok) return { success: false, messages: [], count: 0 };
    const data = await res.json();
    return {
      success: true,
      messages: Array.isArray(data.messages) ? data.messages : [],
      count: Number(data.count || (data.messages ? data.messages.length : 0))
    };
  } catch (e) {
    console.error('Erreur chargement emails:', e);
    return { success: false, messages: [], count: 0 };
  }
}

/**
 * Récupération du statut d'intégration des comptes (ZÉRO MOCK : pas de faux comptes par défaut)
 */
export async function fetchCompanyIntegrations(companyId?: number): Promise<CompanyIntegrationsState> {
  const cid = companyId || 1;
  try {
    const res = await fetch(getApiUrl(`integrations/status.php?company_id=${cid}`));
    if (!res.ok) throw new Error('Erreur récupération intégrations');
    const data = await res.json();
    return {
      google: data.google || { connected: false, email: null },
      microsoft: data.microsoft || { connected: false, email: null }
    };
  } catch (e) {
    // ZÉRO MOCK : ne jamais renvoyer de faux emails inventés
    return {
      google: { connected: false, email: null },
      microsoft: { connected: false, email: null }
    };
  }
}

export async function connectProvider(
  provider: IntegrationProvider,
  accountEmail?: string,
  companyId?: number
): Promise<{ success: boolean; message: string }> {
  const cid = companyId || 1;
  const res = await fetch(getApiUrl('integrations/oauth_connect.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: cid,
      provider,
      account_email: accountEmail
    })
  });
  if (!res.ok) throw new Error('Échec de la connexion');
  return res.json();
}

export async function disconnectProvider(
  provider: IntegrationProvider,
  companyId?: number
): Promise<{ success: boolean; message: string }> {
  const cid = companyId || 1;
  const res = await fetch(getApiUrl('integrations/disconnect.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: cid,
      provider
    })
  });
  if (!res.ok) throw new Error('Échec de la déconnexion');
  return res.json();
}

export async function sendEmailViaIntegration(params: {
  provider?: string;
  mailboxId?: number | string;
  to: string;
  subject: string;
  body: string;
  leadName?: string;
  companyId?: number;
}): Promise<{ success: boolean; messageId: string; info: string }> {
  const token = getStoredAuthToken();
  const res = await fetch(getApiUrl('integrations/send_email.php'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || "Échec d'envoi de l'email via le serveur SMTP");
  }
  return res.json();
}

export async function createDraftViaIntegration(params: {
  provider?: string;
  mailboxId?: number | string;
  to: string;
  subject: string;
  body: string;
  companyId?: number;
}): Promise<{ success: boolean; draftId: string; info: string }> {
  const token = getStoredAuthToken();
  const res = await fetch(getApiUrl('integrations/create_draft.php'), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : 'Bearer anonymous'
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Échec de création du brouillon');
  return res.json();
}

export async function scheduleCalendarMeeting(params: {
  provider?: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  durationMinutes?: number;
  attendees?: string[];
  companyId?: number;
}): Promise<{ success: boolean; eventId: string; meetingUrl?: string; info: string }> {
  const res = await fetch(getApiUrl('integrations/schedule_calendar.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error("Échec de planification dans l'agenda");
  return res.json();
}

export async function syncContactViaIntegration(params: {
  provider?: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  role?: string;
  companyId?: number;
}): Promise<{ success: boolean; contactId: string; info: string }> {
  const res = await fetch(getApiUrl('integrations/sync_contact.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Échec de synchronisation du contact');
  return res.json();
}
