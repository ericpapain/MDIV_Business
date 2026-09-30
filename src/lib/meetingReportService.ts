// src/lib/meetingReportService.ts

import { getApiUrl, createApiUrl } from './apiConfig';

export interface MeetingAction {
  task: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'done';
}

export interface MeetingDecision {
  decision: string;
  context?: string;
}

export interface MeetingRisk {
  risk: string;
  impact: 'Low' | 'Medium' | 'High';
}

export interface MeetingReport {
  id: string;
  date: string;
  subject: string;
  participants: string[];
  agenda: string[];
  executiveSummary: string;
  decisions: MeetingDecision[];
  actions: MeetingAction[];
  risks: MeetingRisk[];
  rawTranscriptUrl?: string;
}

/**
 * Envoie un fichier ou du texte pour analyse IA afin de générer le compte-rendu.
 */
export async function analyzeMeetingMedia(file: File | null, text: string, companyId?: number): Promise<MeetingReport> {
  const formData = new FormData();
  if (file) formData.append('media_file', file);
  if (text) formData.append('raw_text', text);
  if (companyId) formData.append('company_id', companyId.toString());

  const response = await fetch(getApiUrl('meeting_upload.php'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = "Service d'analyse IA temporairement indisponible ou erreur serveur.";
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export interface AgentMessage {
  agent: string;
  message: string;
}

/**
 * Lance l'analyse de la réunion en simulant la discussion multi-agents via Server-Sent Events.
 * Le backend doit retourner un événement 'complete' avec le MeetingReport à la fin.
 */
export function startMeetingAgentsAnalysis(
  fileIdOrText: string, // Un identifiant de fichier uploadé ou le texte
  companyId: number | undefined,
  onAgentMessage: (msg: AgentMessage) => void,
  onComplete: (report: MeetingReport) => void,
  onError: (error: Error) => void
): () => void {
  const contextStr = encodeURIComponent(fileIdOrText);
  const cidParam = companyId ? `&company_id=${companyId}` : '';
  const eventSource = new EventSource(`${getApiUrl('meeting_agents.php')}?context=${contextStr}${cidParam}`);

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
      onError(new Error("Erreur de lecture du rapport."));
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
 * Récupère l'historique des réunions pour le tableau de bord.
 */
export async function fetchMeetingHistory(companyId?: number): Promise<MeetingReport[]> {
  const url = createApiUrl('meeting_history.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    // Zero mock: si l'API n'existe pas ou échoue, on retourne tableau vide ou erreur selon besoin.
    // L'interface affichera qu'aucun historique n'est disponible.
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Demande la génération du fichier PDF/Word définitif.
 */
export async function exportMeetingReport(reportId: string, format: 'pdf' | 'docx') {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = getApiUrl('meeting_export.php');
  form.target = '_blank';
  
  const idInput = document.createElement('input');
  idInput.type = 'hidden';
  idInput.name = 'report_id';
  idInput.value = reportId;

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
