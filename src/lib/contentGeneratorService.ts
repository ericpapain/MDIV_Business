// src/lib/contentGeneratorService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface ContentKPIs {
  totalGenerated: number;
  wordsGenerated: number;
  activeCampaigns: number;
  timeSavedHours: number;
}

export interface ContentHistoryItem {
  id: string;
  sourceType: string;
  sourceTitle: string;
  date: string;
  channels: string[];
  isFavorite: boolean;
}

export interface BrandSettings {
  tone: string;
  editorialGuide: string;
  keywords: string;
}

export interface GeneratedContent {
  channel: string;
  title?: string;
  body: string;
  hashtags?: string[];
}

export interface ContentGenerateRequest {
  sourceType: 'text' | 'url' | 'file';
  sourceContent: string; // URL, text, or base64 if file
  channels: string[];
  brandSettings: BrandSettings;
  targetAudience: string;
}

/**
 * Récupère les KPIs d'utilisation du générateur de contenu.
 */
export async function fetchContentKPIs(companyId?: number): Promise<ContentKPIs> {
  const url = createApiUrl('content_kpis.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { totalGenerated: 0, wordsGenerated: 0, activeCampaigns: 0, timeSavedHours: 0 };
  }
  return response.json();
}

/**
 * Récupère l'historique des générations SQL.
 */
export async function fetchContentHistory(companyId?: number): Promise<ContentHistoryItem[]> {
  const url = createApiUrl('content_history.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) return []; 
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Récupère les réglages de la marque (guide éditorial) depuis la DB.
 */
export async function fetchBrandSettings(companyId?: number): Promise<BrandSettings> {
  const url = createApiUrl('content_brand_settings.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    return { tone: 'Professionnel', editorialGuide: '', keywords: '' };
  }
  return response.json();
}

/**
 * Génère le contenu multi-canal via l'IA.
 */
export async function generateContentMultiChannelAI(
  request: ContentGenerateRequest, 
  companyId?: number
): Promise<GeneratedContent[]> {
  const response = await fetch(getApiUrl('content_generate.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, company_id: companyId }),
  });

  if (!response.ok) {
    let errorMsg = "Service de génération de contenu indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("Erreur de parsing de la réponse serveur.");
  }
  
  if (!Array.isArray(data)) {
    // Si l'IA a retourné un objet avec le tableau à l'intérieur (ex: { "data": [...] } )
    if (data && typeof data === 'object') {
      // S'il y a un message d'erreur explicite renvoyé par le backend
      if (data.error) throw new Error(data.error);
      
      // Si l'IA a renvoyé un seul objet au lieu d'un tableau
      if (data.channel && data.body) return [data];

      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.channels)) return data.channels;
      
      // Chercher n'importe quelle clé qui contient un tableau
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    if (data && data.status === 'success') return [];
    console.error("Format inattendu reçu de l'IA :", data);
    throw new Error("Le serveur n'a pas retourné un tableau de résultats.");
  }

  return data;
}

/**
 * Exporte le contenu généré en Word via le backend.
 */
export async function exportContentWord(contentData: GeneratedContent[], companyId?: number) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('content_export.php');
  form.target = '_blank';
  
  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'content_data';
  dataInput.value = JSON.stringify(contentData);

  const compInput = document.createElement('input');
  compInput.type = 'hidden';
  compInput.name = 'company_id';
  compInput.value = companyId?.toString() || '';

  const formatInput = document.createElement('input');
  formatInput.type = 'hidden';
  formatInput.name = 'format';
  formatInput.value = 'word';

  form.appendChild(dataInput);
  form.appendChild(compInput);
  form.appendChild(formatInput);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
