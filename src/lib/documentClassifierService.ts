// src/lib/documentClassifierService.ts
/**
 * Service de Classification Documentaire & Garde-Fou d'Intention
 * Évalue la nature du document en amont et détecte les incompatibilités avec le module actif.
 */
import { getApiUrl } from './apiConfig';

export interface DocumentClassificationScore {
  [category: string]: number;
}

export interface SuggestedAction {
  title: string;
  route: string;
}

export interface ClassificationResult {
  detected_type: string;
  confidence: number;
  scores: DocumentClassificationScore;
  summary_snippet: string;
  recommended_module?: string;
  recommended_module_id?: string;
  suggested_actions?: SuggestedAction[];
  is_mismatch?: boolean;
}

/**
 * Envoie un extrait textuel pour classification rapide
 * @param text Le texte brut du document ou des notes
 * @param currentModule Identifiant du module actif (ex: 'meeting', 'invoice', 'summarizer')
 */
export async function classifyDocumentContent(
  text: string,
  currentModule: string = ''
): Promise<ClassificationResult> {
  const cleanText = text.trim();
  if (cleanText.length < 15) {
    return {
      detected_type: 'Autre',
      confidence: 100,
      scores: { Autre: 100 },
      summary_snippet: 'Texte trop court pour classification.',
      is_mismatch: false
    };
  }

  const response = await fetch(getApiUrl('classify_document.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: cleanText.slice(0, 3000),
      current_module: currentModule
    })
  });

  if (!response.ok) {
    throw new Error(`Échec de la classification du document (HTTP ${response.status})`);
  }

  return response.json();
}
