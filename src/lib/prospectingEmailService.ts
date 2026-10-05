import { getApiUrl, createApiUrl } from './apiConfig';

export type ProspectingTone = 'Professionnel' | 'Commercial' | 'Premium' | 'Consultatif' | 'Direct' | 'Corporate';
export type ProspectingObjective = 'Premier contact' | 'Email de relance' | 'Séquence commerciale' | 'Demande de rendez-vous' | 'Présentation d\'offre' | 'Réactivation de prospect';
export type ProspectingLanguage = 'Français' | 'Anglais' | 'Espagnol' | 'Allemand' | 'Italien';

export interface ProspectingRequest {
  targetCompany: string;
  sector: string;
  contactRole: string;
  objective: ProspectingObjective;
  offer: string;
  tone: ProspectingTone;
  language: ProspectingLanguage;
}

export interface ProspectingEmailKPIs {
  impactScore: number;
  clarityScore: number;
  personalizationScore: number;
  engagementScore: number;
  estimatedReadTimeSeconds: number;
  persuasionLevel: string;
  suggestions: string[];
}

export interface GeneratedProspectingCampaign {
  id?: string;
  subject: string;
  content: string;
  kpis: ProspectingEmailKPIs;
  date?: string;
}

/**
 * Demande à l'IA de générer une campagne/email de prospection.
 */
export async function generateProspectingCampaign(
  request: ProspectingRequest,
  companyId?: number
): Promise<GeneratedProspectingCampaign> {
  const response = await fetch(getApiUrl('prospecting_generate.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération IA indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data as GeneratedProspectingCampaign;
}

/**
 * Récupère l'historique des séquences/emails de prospection générés.
 */
export async function fetchProspectingHistory(companyId?: number): Promise<GeneratedProspectingCampaign[]> {
  const url = createApiUrl('prospecting_history.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    return []; // Zéro mock, si l'API échoue, liste vide
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
