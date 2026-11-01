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

function normalizeChannelId(ch: string): string {
  const c = String(ch || '').toLowerCase().trim();
  if (c.includes('link')) return 'linkedin';
  if (c.includes('twit') || c === 'x') return 'x';
  if (c.includes('insta')) return 'instagram';
  if (c.includes('face')) return 'facebook';
  if (c.includes('news')) return 'newsletter';
  if (c.includes('blog') || c.includes('article')) return 'blog';
  if (c.includes('yout') || c.includes('video') || c.includes('script')) return 'youtube';
  if (c.includes('tele')) return 'telegram';
  return c || 'linkedin';
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

  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("Erreur de parsing de la réponse serveur.");
  }

  let rawList: any[] | null = null;

  if (Array.isArray(data)) {
    rawList = data;
  } else if (data && typeof data === 'object') {
    if (data.error) throw new Error(data.error);

    if (Array.isArray(data.content)) rawList = data.content;
    else if (Array.isArray(data.data)) rawList = data.data;
    else if (Array.isArray(data.results)) rawList = data.results;
    else if (Array.isArray(data.channels)) rawList = data.channels;
    else if (data.channel && (data.body || data.content || data.text)) {
      rawList = [data];
    } else {
      // Rechercher la première clé contenant un tableau
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          rawList = data[key];
          break;
        }
      }

      // Si le contenu est une chaîne (texte brut ou JSON stringifié)
      if (!rawList) {
        const textContent = typeof data.content === 'string' ? data.content :
                            typeof data.generatedText === 'string' ? data.generatedText :
                            typeof data.text === 'string' ? data.text : null;
        if (textContent) {
          try {
            const parsed = JSON.parse(textContent);
            if (Array.isArray(parsed)) rawList = parsed;
          } catch {
            const match = textContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (match) {
              try { rawList = JSON.parse(match[0]); } catch {}
            }
          }

          if (!rawList) {
            const targetChans = request.channels && request.channels.length > 0 ? request.channels : ['linkedin'];
            rawList = targetChans.map(ch => ({
              channel: ch,
              title: `Publication ${ch}`,
              body: textContent,
              hashtags: ['#Business', '#Innovation']
            }));
          }
        }
      }
    }
  }

  if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
    const targetChans = request.channels && request.channels.length > 0 ? request.channels : ['linkedin'];
    rawList = targetChans.map(ch => ({
      channel: ch,
      title: `Publication ${ch}`,
      body: `🎯 ${request.sourceContent || "Découvrez notre nouvelle offre d'accompagnement."}\n\nUn accompagnement ciblé pour optimiser vos opérations et accélérer votre développement.`,
      hashtags: ['#Business', '#Innovation']
    }));
  }

  return rawList.map((item: any, idx: number) => {
    const fallbackChannel = request.channels?.[idx] || 'linkedin';
    const chan = normalizeChannelId(item.channel || fallbackChannel);
    return {
      channel: chan,
      title: item.title || `Publication ${chan}`,
      body: item.body || item.content || item.text || '',
      hashtags: Array.isArray(item.hashtags) ? item.hashtags : ['#Business', '#Innovation']
    };
  });
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
