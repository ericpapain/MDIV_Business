// src/lib/feedbackService.ts
/**
 * Service Client pour la Boucle Human-in-the-Loop & Apprentissage Continu Few-Shot (Brique 6)
 */

import { getApiUrl } from './apiConfig';

export interface FewShotExemplar {
  id: number;
  company_id: number;
  tool_type: string;
  title: string;
  input_summary: string;
  human_approved_output: string;
  correction_notes: string;
  rating: number;
  created_at: string;
}

export interface FeedbackSubmissionParams {
  companyId: number;
  toolType: string;
  title?: string;
  inputSummary?: string;
  originalAiOutput?: any;
  humanApprovedOutput: any;
  correctionNotes?: string;
  rating?: number;
}

export interface FeedbackSubmissionResult {
  status: 'success' | 'error';
  few_shot_id?: number;
  company_id?: number;
  chunks_vectorized?: number;
  message?: string;
  error?: string;
}

export class FeedbackService {
  /**
   * Enregistre une correction humaine d'un livrable et l'intègre dans la mémoire Few-Shot continue
   */
  static async submitCorrection(params: FeedbackSubmissionParams): Promise<FeedbackSubmissionResult> {
    const url = getApiUrl('feedback_loop.php');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: params.companyId,
        tool_type: params.toolType,
        title: params.title || 'Correction validée par la direction',
        input_summary: params.inputSummary || '',
        original_ai_output: params.originalAiOutput || '',
        human_approved_output: typeof params.humanApprovedOutput === 'object'
          ? JSON.stringify(params.humanApprovedOutput, null, 2)
          : String(params.humanApprovedOutput),
        correction_notes: params.correctionNotes || '',
        rating: params.rating ?? 5
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erreur lors de l\'enregistrement du feedback' }));
      throw new Error(err.error || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Récupère la liste des exemples de référence validés par l'entreprise
   */
  static async getFewShotExamples(companyId: number, toolType?: string): Promise<FewShotExemplar[]> {
    const endpoint = toolType
      ? `feedback_loop.php?company_id=${companyId}&tool_type=${encodeURIComponent(toolType)}`
      : `feedback_loop.php?company_id=${companyId}`;
    
    const url = getApiUrl(endpoint);
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.examples || [];
  }
}
