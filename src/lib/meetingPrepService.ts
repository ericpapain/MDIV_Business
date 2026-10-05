// src/lib/meetingPrepService.ts
// Complément de meetingReportService.ts — gère la PRÉPARATION avant RDV
// (meetingReportService gère les comptes-rendus APRÈS le RDV)

import { getApiUrl, createApiUrl } from './apiConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UpcomingMeeting {
  id: string;
  title: string;
  dateTime: string;
  clientName?: string;
  clientId?: number;
  location?: string;
  source: 'outlook' | 'teams' | 'manual';
}

export interface ClientHistory {
  clientId: number;
  clientName: string;
  sector?: string;
  lastContact?: string;
  openQuotes: number;
  unpaidInvoices: number;
  totalRevenue: number;
  notes?: string;
  interactions: { date: string; type: string; summary: string }[];
}

export interface MeetingBriefing {
  oneLinerSummary: string;          // Synthèse "1 minute"
  clientSummary: string;            // Résumé détaillé du client
  opportunities: string[];          // Opportunités identifiées
  risks: string[];                  // Risques potentiels
  probableObjections: string[];     // Objections probables
  recommendedQuestions: string[];   // Questions recommandées
  discoveryStrategy: string;        // Stratégie de découverte
  meetingObjectives: string[];      // Objectifs de la réunion
  recommendedActions: string[];     // Actions recommandées post-RDV
}

export interface MeetingPrepRequest {
  clientId?: number;
  clientName?: string;
  meetingDate: string;
  meetingContext?: string;          // Notes manuelles de l'utilisateur
  meetingObjective?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Récupère les RDV à venir depuis le calendrier connecté (Outlook/Teams).
 */
export async function fetchUpcomingMeetings(companyId?: number): Promise<UpcomingMeeting[]> {
  const url = createApiUrl('upcoming_meetings.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Récupère l'historique complet d'un client depuis la base SQL.
 */
export async function fetchClientHistory(
  clientId: number,
  companyId?: number
): Promise<ClientHistory | null> {
  const url = createApiUrl('meeting_history.php');
  url.searchParams.append('client_id', clientId.toString());
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) return null;
  return response.json();
}

/**
 * Génère le briefing complet de préparation au RDV via l'IA.
 */
export async function generateMeetingBriefing(
  request: MeetingPrepRequest,
  companyId?: number
): Promise<MeetingBriefing> {
  const response = await fetch(getApiUrl('meeting_prep_generate.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de préparation RDV indisponible.";
    try {
      const err = await response.json();
      if (err.error) errorMsg = err.error;
    } catch (_) { /* ignore */ }
    throw new Error(errorMsg);
  }

  return response.json();
}
