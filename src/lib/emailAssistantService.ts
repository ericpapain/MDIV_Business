// src/lib/emailAssistantService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export type EmailTone = 'Professionnel' | 'Commercial' | 'Institutionnel' | 'Technique' | 'Amical' | 'Directif' | 'Diplomatique';
export type EmailObjective = 'Nouvel email' | 'Réponse à email' | 'Relance client' | 'Réclamation' | 'Proposition commerciale' | 'Compte-rendu' | 'Invitation réunion' | 'Email RH' | 'Email recrutement';
export type AITask = 'Amélioration du ton' | 'Correction orthographique' | 'Réécriture professionnelle' | 'Traduction multilingue' | 'Version plus courte' | 'Version plus persuasive' | 'Version plus diplomatique' | 'Version plus commerciale';

export interface EmailAnalysisKPIs {
  clarityScore: number;
  professionalismScore: number;
  estimatedLengthWords: number;
  readTimeSeconds: number;
  qualityScore: number;
}

export interface EmailHistoryItem {
  id: string;
  date: string;
  objective: string;
  contentSnippet: string;
  isFavorite: boolean;
}

export interface IntegrationsStatus {
  outlook: boolean;
  microsoft365: boolean;
  exchange: boolean;
  gmail: boolean;
}

/**
 * Analyse le texte en cours de rédaction pour en tirer des KPIs.
 */
export async function analyzeEmailText(text: string, companyId?: number): Promise<EmailAnalysisKPIs> {
  const response = await fetch(getApiUrl('email_analyze.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, company_id: companyId }),
  });

  if (!response.ok) {
    throw new Error("Service d'analyse d'email indisponible.");
  }

  return response.json();
}

/**
 * Demande à l'IA de générer ou modifier le contenu de l'email.
 */
export async function generateEmailContent(
  text: string, 
  task: AITask, 
  tone: EmailTone, 
  objective: EmailObjective, 
  companyId?: number
): Promise<string> {
  const response = await fetch(getApiUrl('email_generate.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, task, tone, objective, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération IA indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.generatedText || "";
}

/**
 * Récupère l'historique des emails générés par l'utilisateur.
 */
export async function fetchEmailHistory(companyId?: number): Promise<EmailHistoryItem[]> {
  const url = createApiUrl('email_history.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    return []; // Zéro mock, si pas d'API, on affiche un historique vide proprement.
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Vérifie l'état des intégrations connectées (OAuth) pour l'utilisateur.
 */
export async function fetchIntegrationsStatus(companyId?: number): Promise<IntegrationsStatus> {
  const url = createApiUrl('email_integrations.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    // Si l'API n'existe pas, on retourne que rien n'est connecté. Zéro Mock.
    return {
      outlook: false,
      microsoft365: false,
      exchange: false,
      gmail: false
    };
  }

  return response.json();
}
