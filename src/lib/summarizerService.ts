// src/lib/summarizerService.ts

import { getApiUrl } from './apiConfig';

export type SummaryMode = 'express' | 'standard' | 'detailed' | 'direction' | 'comex';

export interface DocumentSummaryKPIs {
  readabilityScore: number;
  pageCount: number;
  estimatedTimeSavedMinutes: number;
}

export interface DocumentSummaryAction {
  action: string;
  context?: string;
}

export interface DocumentSummaryReport {
  id: string;
  documentName: string;
  mode: SummaryMode;
  date: string;
  
  // KPIs et visuels
  kpis: DocumentSummaryKPIs;
  keywords: string[];
  majorConcepts: string[];
  
  // Contenu structuré
  executiveSummary: string;
  objectives: string[];
  keyPoints: string[];
  risks: string[];
  recommendedActions: DocumentSummaryAction[];
  decisions: string[];
  deadlines: string[];
  stakeholders: string[];
}

export interface SummarizerAgentMessage {
  agent: string;
  message: string;
}

/**
 * Envoie le fichier pour analyse et retourne un ID de traitement
 */
export async function uploadDocumentForSummary(file: File, mode: SummaryMode, extractedText?: string): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('mode', mode);
  if (extractedText) {
    formData.append('extracted_text', extractedText);
  }

  const response = await fetch(getApiUrl('summarizer_upload.php'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = "Service d'analyse documentaire temporairement indisponible.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Lance l'analyse documentaire en simulant la discussion multi-agents via Server-Sent Events.
 */
export function startSummarizerAgentsAnalysis(
  documentId: string,
  mode: SummaryMode,
  companyId: number | undefined,
  onAgentMessage: (msg: SummarizerAgentMessage) => void,
  onComplete: (report: DocumentSummaryReport) => void,
  onError: (error: Error) => void
): () => void {
  const cidParam = companyId ? `&company_id=${companyId}` : '';
  const url = `${getApiUrl('summarizer_agents.php')}?doc_id=${documentId}&mode=${mode}${cidParam}`;
  
  const eventSource = new EventSource(url);

  eventSource.addEventListener('agent_message', (e) => {
    try {
      const data = JSON.parse(e.data);
      onAgentMessage(data);
    } catch (err) {
      console.error("Erreur agent_message", err);
    }
  });

  eventSource.addEventListener('complete', (e) => {
    try {
      const data = JSON.parse(e.data);
      onComplete(data);
      eventSource.close();
    } catch (err) {
      onError(new Error("Erreur de lecture du résumé généré."));
      eventSource.close();
    }
  });

  eventSource.addEventListener('error', (e: any) => {
    let errorMessage = "Erreur de connexion au flux d'analyse.";
    try {
       if(e.data) {
         const data = JSON.parse(e.data);
         if(data.message) errorMessage = data.message;
       }
    } catch(err){}
    
    onError(new Error(errorMessage));
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
}

/**
 * Demande la génération du fichier PDF/Word définitif.
 */
export async function exportDocumentSummary(summaryId: string, format: 'pdf' | 'docx') {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('summarizer_export.php');
  form.target = '_blank';
  
  const idInput = document.createElement('input');
  idInput.type = 'hidden';
  idInput.name = 'summary_id';
  idInput.value = summaryId;

  const formatInput = document.createElement('input');
  formatInput.type = 'hidden';
  formatInput.name = 'format';
  formatInput.value = format;
  
  form.appendChild(idInput);
  form.appendChild(formatInput);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
