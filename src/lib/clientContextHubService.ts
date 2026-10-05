// src/lib/clientContextHubService.ts

import { getApiUrl } from './apiConfig';
import { Client } from './quoteService';

export interface ClientInteraction {
  id: number;
  company_id: number;
  client_id: number;
  direction: 'inbound' | 'outbound' | 'internal';
  channel: 'email' | 'meeting' | 'quote' | 'invoice' | 'phone' | 'note';
  subject: string;
  body_text: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'critical';
  reference_id?: string | null;
  created_at: string;
}

export interface ClientQuoteSummary {
  id: number;
  quote_number: string;
  status: string;
  total_ht: number;
  total_ttc: number;
  payment_terms?: string;
  created_at: string;
}

export interface ClientInvoiceSummary {
  id: number;
  invoice_number: string;
  status: string;
  amount_ht: number;
  amount_ttc: number;
  due_date: string;
  created_at: string;
}

export interface ClientFinancialSummary {
  pending_quotes_count: number;
  overdue_invoices_count: number;
  total_overdue_amount: number;
}

export interface Client360Response {
  success: boolean;
  client: Client;
  interactions: ClientInteraction[];
  quotes: ClientQuoteSummary[];
  invoices: ClientInvoiceSummary[];
  financial_summary: ClientFinancialSummary;
  executive_context: string;
}

export interface SaveInteractionPayload {
  company_id?: number;
  client_id: number;
  direction: 'inbound' | 'outbound' | 'internal';
  channel: 'email' | 'meeting' | 'quote' | 'invoice' | 'phone' | 'note';
  subject: string;
  body_text: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'critical';
  reference_id?: string | null;
  metadata?: Record<string, any>;
}

export interface ReplyEmailPayload {
  company_id?: number;
  client_id: number;
  incoming_email_text: string;
  tone?: string;
  objective?: string;
  custom_instructions?: string;
}

export interface ReplyEmailResponse {
  success: boolean;
  reply_text: string;
  context_summary?: {
    client_name: string;
    client_company?: string;
    tone_applied: string;
    has_financial_warning: boolean;
  };
}

export interface BindModulesPayload {
  company_id?: number;
  client_id: number;
  source_module: 'email' | 'meeting' | 'quote' | 'invoice' | 'followup' | 'summarizer' | 'prospecting';
  source_id: string;
  target_module: 'email' | 'meeting' | 'quote' | 'invoice' | 'followup' | 'summarizer' | 'prospecting';
  target_id: string;
  link_type: 'converted_to' | 'referenced_by' | 'replied_to' | 'settled_by' | 'audit_context';
}

/**
 * Récupère le dossier 360° complet d'un client
 */
export async function fetchClient360(clientId: number, companyId?: number): Promise<Client360Response> {
  const url = `${getApiUrl('client_context_hub.php')}?action=get_client_360&client_id=${clientId}&company_id=${companyId || 1}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Impossible de charger le dossier 360° du client.");
  }
  return res.json();
}

/**
 * Enregistre un échange omnicanal dans l'historique du client
 */
export async function saveClientInteraction(payload: SaveInteractionPayload): Promise<{ success: boolean; interaction_id: number; message: string }> {
  const url = getApiUrl('client_context_hub.php');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'save_interaction',
      ...payload
    })
  });
  if (!res.ok) {
    throw new Error("Erreur lors de la sauvegarde de l'interaction client.");
  }
  return res.json();
}

/**
 * Génère une réponse IA contextualisée à un email reçu
 */
export async function generateContextualEmailReply(payload: ReplyEmailPayload): Promise<ReplyEmailResponse> {
  const url = getApiUrl('client_context_hub.php');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'contextual_email_reply',
      ...payload
    })
  });
  if (!res.ok) {
    throw new Error("Erreur lors de la génération de la réponse contextualisée.");
  }
  return res.json();
}

/**
 * Matérialise une liaison transversale entre deux applications
 */
export async function bindCrossModules(payload: BindModulesPayload): Promise<{ success: boolean; link_id: number; message: string }> {
  const url = getApiUrl('client_context_hub.php');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bind_modules',
      ...payload
    })
  });
  if (!res.ok) {
    throw new Error("Erreur lors de la liaison inter-modules.");
  }
  return res.json();
}
