// src/lib/followupService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface FollowupKPIs {
  totalSent: number;
  responseRatePercent: number;
  quotesWon: number;
  invoicesPaid: number;
}

export interface FollowupTarget {
  id: string;
  type: 'invoice' | 'quote' | 'inactive_client' | 'meeting' | 'contract';
  reference: string;
  clientName: string;
  amount?: number;
  daysPending: number;
  status: 'pending' | 'escalated' | 'resolved';
}

export interface FollowupGenerateRequest {
  targetId: string;
  type: string;
  clientName: string;
  reference: string;
  tone: 'Professionnel' | 'Commercial' | 'Courtois' | 'Diplomatique' | 'Ferme' | 'Très ferme';
  urgencyLevel: 'low' | 'medium' | 'high';
}

/**
 * Récupère les KPIs de relance (Tableau de bord).
 */
export async function fetchFollowupKPIs(companyId?: number): Promise<FollowupKPIs> {
  const url = createApiUrl('followup_kpis.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    // Zero Mock : Si pas d'API, on retourne 0
    return { totalSent: 0, responseRatePercent: 0, quotesWon: 0, invoicesPaid: 0 };
  }
  return response.json();
}

/**
 * Récupère la liste des dossiers nécessitant une relance.
 */
export async function fetchFollowupTargets(companyId?: number): Promise<FollowupTarget[]> {
  const url = createApiUrl('followup_targets.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return []; 
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Génère le texte de l'email de relance via l'IA en fonction du ton et de l'urgence.
 */
export async function generateFollowupEmailAI(
  request: FollowupGenerateRequest, 
  companyId?: number
): Promise<{ subject: string; body: string }> {
  const response = await fetch(getApiUrl('followup_generate.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération de relance indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Envoie ou programme l'email de relance via l'API.
 */
export async function sendFollowupEmail(
  targetId: string,
  subject: string, 
  body: string, 
  scheduleDate?: string,
  companyId?: number
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(getApiUrl('followup_send.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetId, subject, body, scheduleDate, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Erreur lors de l'envoi de la relance.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}
