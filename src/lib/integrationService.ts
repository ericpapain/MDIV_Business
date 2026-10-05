// src/lib/integrationService.ts
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
    console.warn('Fallback intégrations:', e);
    return {
      google: { connected: true, email: 'direction@mdiv-business.com' },
      microsoft: { connected: true, email: 'contact@mdiv-business.onmicrosoft.com' }
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
  provider: IntegrationProvider;
  to: string;
  subject: string;
  body: string;
  leadName?: string;
  companyId?: number;
}): Promise<{ success: boolean; messageId: string; info: string }> {
  const res = await fetch(getApiUrl('integrations/send_email.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error("Échec d'envoi de l'email");
  return res.json();
}

export async function createDraftViaIntegration(params: {
  provider: IntegrationProvider;
  to: string;
  subject: string;
  body: string;
  companyId?: number;
}): Promise<{ success: boolean; draftId: string; info: string }> {
  const res = await fetch(getApiUrl('integrations/create_draft.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Échec de création du brouillon');
  return res.json();
}

export async function scheduleCalendarMeeting(params: {
  provider: IntegrationProvider;
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
  provider: IntegrationProvider;
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
