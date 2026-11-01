import { callLLM } from '../../integrations/llm/llm-orchestrator';
import { getDb } from '../../database/db-connection';
import { ApiError } from '../../shared/errors/api-error';
import { resolveBackendPersona, buildBackendPersonaSystemPrompt } from '../../shared/persona/persona-prompt.builder';

export interface StoredDoc {
  id: string;
  documentName: string;
  mode: string;
  text: string;
  createdAt: number;
}

export const docStore = new Map<string, StoredDoc>();
export const meetingStore = new Map<string, { id: string; text: string; filename?: string; createdAt: number }>();

export class MeetingService {
  async classifyDocument(text: string, filename = 'document.txt') {
    if (!text || text.trim().length === 0) {
      throw ApiError.badRequest("Le document est vide ou illisible.");
    }

    const prompt = `Tu es un système expert de classification documentaire d'entreprise.
Analyse cet extrait de document :
"""\n${text.slice(0, 3000)}\n"""
Classifie le type exact parmi : "invoice", "quote", "meeting", "contract", "technical", "general".
Indique ton indice de confiance (0-100) et un résumé en 1 phrase.
Réponds STRICTEMENT par un JSON valide :
{
  "documentType": "meeting",
  "confidence": 95,
  "summary": "Résumé du document"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Classifie ce document.' }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  saveUploadedDoc(docName: string, text: string, mode = 'standard') {
    const id = 'doc_' + Date.now();
    docStore.set(id, {
      id,
      documentName: docName || 'Document sans titre',
      mode,
      text,
      createdAt: Date.now(),
    });
    return { id, documentName: docName, charCount: text.length };
  }

  async runSummarizerAgents(docId: string, customText?: string, companyId?: number) {
    const doc = docId ? docStore.get(docId) : null;
    const textToAnalyze = doc?.text || customText || '';
    if (!textToAnalyze) {
      throw ApiError.notFound("Document introuvable ou texte vide.");
    }

    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Collège des 4 Agents d'Arbitrage & Synthèse de documents d'entreprise");

    const prompt = `${personaPrompt}

=== MISSION : DÉLIBÉRATION DES 4 AGENTS EXPERTS POUR ${persona.companyName.toUpperCase()} ===
Tu incarnes le collège de 4 agents experts analysant ce document avec le prisme métier (${persona.metierLabel} — ${persona.specificActivity}) :
1. Agent Factuel : Synthétise les données brutes, chiffres clés, dates, livrables et contraintes techniques propres au métier.
2. Agent Critique : Détecte les risques réels (juridiques, contractuels, pénalités, sécurité chantier/prestation, vices, conformité sectorielle).
3. Agent Stratégique : Identifie les opportunités de valorisation, rentabilité, fidélisation et renforcement de l'activité.
4. Agent Arbitre Exécutif : Fournit la synthèse finale et un plan d'action pragmatique calibré pour une entreprise de taille "${persona.profileLabel}".

Document à analyser :
"""\n${textToAnalyze.slice(0, 8000)}\n"""

Réponds STRICTEMENT en JSON :
{
  "title": "Titre du compte-rendu adapté au document",
  "executiveSummary": "Synthèse de direction globale orientée métier",
  "agent1_factual": "Faits clés & données techniques/chiffrées",
  "agent2_critical": "Points de vigilance et risques sectoriels",
  "agent3_strategic": "Leviers stratégiques et gains potentiels",
  "agent4_executive": "Décisions actées et plan d'action concret"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère la délibération multi-agents adaptée à mon activité.' }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  saveUploadedMeeting(filename: string, text: string) {
    const id = 'meet_' + Date.now();
    meetingStore.set(id, {
      id,
      filename,
      text,
      createdAt: Date.now(),
    });
    return { id, filename, charCount: text.length };
  }

  async runMeetingAgents(meetId: string, customText?: string, companyId?: number) {
    const meeting = meetId ? meetingStore.get(meetId) : null;
    const textToAnalyze = meeting?.text || customText || '';
    if (!textToAnalyze) {
      throw ApiError.notFound("Réunion introuvable ou audio vide.");
    }

    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Synthèse et compte-rendu de réunion ou mémo vocal terrain");

    const prompt = `${personaPrompt}

=== MISSION : COMPTE-RENDU OU MÉMO VOCAL OPÉRATIONNEL ===
Tu es l'assistant de direction et de gestion pour ${persona.companyName} (${persona.metierLabel} — ${persona.specificActivity}).
Analyse la transcription de réunion, d'échange client, de visite chantier ou de mémo vocal suivante :
"""\n${textToAnalyze.slice(0, 8000)}\n"""

Consignes d'adaptation :
1. Reste ancré dans la réalité du terrain (${persona.specificActivity || persona.metierLabel}).
2. Si l'utilisateur est seul / artisan indépendant (${persona.profile}), les actions doivent être attribuées directement à lui-même ("Moi", "Artisan") ou à son client/fournisseur, de façon claire et sans lourdeur administrative.
3. Si l'entreprise compte des salariés, attribue les tâches aux intervenants ou rôles mentionnés.

Réponds STRICTEMENT en JSON :
{
  "title": "Titre du compte-rendu / mémo",
  "date": "${new Date().toISOString().split('T')[0]}",
  "summary": "Synthèse opérationnelle claire et concise",
  "decisions": ["Décision ou accord 1", "Décision ou accord 2"],
  "actionItems": [
    { "task": "Action concrète à réaliser", "assignee": "Responsable ou 'Moi'", "deadline": "Délai réaliste" }
  ]
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère le compte-rendu structuré adapté.' }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  async generateMeetingPrep(clientName: string, meetingObjective: string, contextInfo = '', companyId?: number) {
    const persona = resolveBackendPersona(companyId);
    const personaPrompt = buildBackendPersonaSystemPrompt(persona, "Préparation stratégique et cadrage de rendez-vous client / chantier");

    const prompt = `${personaPrompt}

=== MISSION : PRÉPARATION & BRIEFING DE RENDEZ-VOUS COMMERCIAL / CHANTIER ===
Entreprise : ${persona.companyName} (${persona.metierLabel} — ${persona.specificActivity})
Client / Interlocuteur : "${clientName}"
Objectif du rendez-vous : "${meetingObjective}"
${contextInfo ? `Contexte et notes préalables : "${contextInfo}"` : ''}

Directives d'excellence :
1. Mobilise le vocabulaire technique et la réalité commerciale de la profession (${persona.metierLabel}).
2. Fournis des arguments solides pour défendre la valeur du travail, le respect des normes et la qualité d'exécution de l'entreprise.
3. Anticipe les objections réelles des clients dans ce secteur (budget, délais, comparaisons de devis, imprévus).

Réponds STRICTEMENT en JSON :
{
  "clientName": "${clientName}",
  "briefingSummary": "Synthèse de cadrage et posture recommandée",
  "talkingPoints": ["Point d'accroche 1", "Point clé 2"],
  "keyQuestions": ["Question de découverte / technique 1", "Question 2"],
  "objectionHandling": [
    { "objection": "Objection client courante", "recommendedResponse": "Argumentaire de réponse professionnel" }
  ],
  "targetClosing": "Objectif d'engagement à valider à la fin du rendez-vous"
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère le dossier de préparation.' }
    ], true);

    const content = aiRes?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }
    return parsed;
  }

  getUpcomingMeetings(companyId: number) {
    const db = getDb();
    const apts = (db.appointments || []).filter((a: any) => (!a.company_id || a.company_id === companyId) && a.status !== 'cancelled');
    return apts.slice(0, 5);
  }
}

export const meetingService = new MeetingService();
