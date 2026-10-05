// src/lib/leadsGeneratorService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface LeadsKPIs {
  totalGenerated: number;
  highlyQualified: number;
  activeSegments: number;
  totalExports: number;
}

export interface LeadEnrichment {
  companyName: string;
  sector: string;
  size: string;
  location: string;
  website: string;
  digitalMaturityScore: 'Faible' | 'Moyen' | 'Élevé' | 'Très élevé';
  aiPotentialScore: 'Faible' | 'Moyen' | 'Élevé' | 'Très élevé';
  purchaseProbability: 'Faible' | 'Moyen' | 'Élevé' | 'Très élevé';
  decisionMakerName?: string;
  decisionMakerFunction?: string;
  technologiesUsed?: string[];
}

export interface LeadsSearchRequest {
  sector: string;
  country: string;
  region?: string;
  companySize?: string;
  revenueRange?: string;
  targetFunction?: string;
  keywords?: string;
  technologies?: string;
  servicesNeeded?: string;
}

/**
 * Récupère les statistiques d'utilisation du générateur de leads.
 */
export async function fetchLeadsKPIs(companyId?: number): Promise<LeadsKPIs> {
  const url = createApiUrl('leads_kpis.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { totalGenerated: 0, highlyQualified: 0, activeSegments: 0, totalExports: 0 };
  }
  return response.json();
}

/**
 * Interroge le moteur de recherche IA pour trouver et qualifier des leads.
 */
export async function searchLeadsAI(
  request: LeadsSearchRequest, 
  companyId?: number
): Promise<LeadEnrichment[]> {
  const response = await fetch(getApiUrl('leads_search.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération de leads indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Exporte la sélection de leads vers le CRM ou en fichier.
 */
export async function exportLeads(
  leads: LeadEnrichment[], 
  format: 'excel' | 'csv' | 'pdf' | 'crm',
  companyId?: number
) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('leads_export.php');
  form.target = '_blank';
  
  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'leads_data';
  dataInput.value = JSON.stringify(leads);

  const compInput = document.createElement('input');
  compInput.type = 'hidden';
  compInput.name = 'company_id';
  compInput.value = companyId?.toString() || '';

  const formatInput = document.createElement('input');
  formatInput.type = 'hidden';
  formatInput.name = 'format';
  formatInput.value = format;

  form.appendChild(dataInput);
  form.appendChild(compInput);
  form.appendChild(formatInput);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
