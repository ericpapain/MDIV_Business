// Fichier : src/lib/diagnosticService.ts

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost/mdiv_business/api'; // Adapter si besoin pour le dev local

export interface DiagnosticMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DiagnosticNextStepResponse {
  question: string;
  options: string[];
}

export interface AgentMessage {
  agent: string;
  message: string;
}

export interface DiagnosticFinalReport {
  score: number;
  synthesis: string;
  deduced_insights: string[];
  recommendations: Array<{
    tool_name: string;
    reason: string;
  }>;
}

/**
 * Appelle l'API pour générer la prochaine question dynamique.
 */
export async function fetchNextDiagnosticStep(history: DiagnosticMessage[]): Promise<DiagnosticNextStepResponse> {
  const response = await fetch(`${API_BASE_URL}/diagnostic_step.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ history }),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de la question suivante.");
  }

  return response.json();
}

/**
 * Upload un document PDF pour l'analyse.
 */
export async function uploadDiagnosticDocument(file: File): Promise<{status: string, message: string, extracted_text: string}> {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE_URL}/diagnostic_upload.php`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Erreur lors de l'envoi du document.");
  }

  return response.json();
}

/**
 * Lance la discussion Multi-Agents via Server-Sent Events.
 * @param context Objet représentant les réponses de l'utilisateur.
 * @param onAgentMessage Callback appelé à chaque message d'un agent.
 * @param onComplete Callback appelé à la fin avec le rapport.
 * @param onInterrupt Callback appelé si un agent met en pause pour poser une question.
 * @param onError Callback en cas d'erreur.
 */
export function startAgentsDiscussion(
  context: any,
  onAgentMessage: (msg: AgentMessage) => void,
  onComplete: (report: DiagnosticFinalReport) => void,
  onInterrupt: (data: {agent: string, question: string}) => void,
  onError: (error: Error) => void
): () => void {
  // Encodage du contexte pour le passer en GET
  const contextStr = btoa(JSON.stringify(context));
  const eventSource = new EventSource(`${API_BASE_URL}/diagnostic_agents.php?context=${contextStr}`);

  eventSource.addEventListener('agent_message', (e) => {
    try {
      const data = JSON.parse(e.data);
      onAgentMessage(data);
    } catch (err) {
      console.error("Erreur de parsing de l'événement agent_message", err);
    }
  });

  eventSource.addEventListener('interrupt', (e) => {
    try {
      const data = JSON.parse(e.data);
      onInterrupt(data);
      eventSource.close();
    } catch (err) {
      console.error("Erreur de parsing de l'événement interrupt", err);
    }
  });

  eventSource.addEventListener('complete', (e) => {
    try {
      const data = JSON.parse(e.data);
      onComplete(data);
      eventSource.close();
    } catch (err) {
      onError(new Error("Erreur lors de la lecture du rapport final."));
      eventSource.close();
    }
  });

  eventSource.addEventListener('error', (e: any) => {
    // L'événement d'erreur par défaut ou personnalisé
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

  // Retourne une fonction pour fermer la connexion manuellement si l'utilisateur quitte la page
  return () => {
    eventSource.close();
  };
}
