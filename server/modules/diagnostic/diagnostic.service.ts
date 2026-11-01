import { callLLM } from '../../integrations/llm/llm-orchestrator';

export class DiagnosticService {
  async processDiagnosticStep(answers: any[], step: number) {
    const prompt = `Tu es le Directeur du Diagnostic IA & Stratégie d'Entreprise pour MDIV Business.
Étape actuelle : ${step}. Réponses fournies jusqu'ici : ${JSON.stringify(answers)}.
Génère la question suivante pertinente et analyse les premières forces et faiblesses décelées.
Réponds STRICTEMENT par un JSON valide :
{
  "nextStep": ${step + 1},
  "isComplete": ${step >= 5},
  "question": "Question suivante ciblée",
  "category": "Organisation & Automatisation",
  "options": ["Option A", "Option B", "Option C"]
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Traite l étape de diagnostic.' }
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

  async runDiagnosticAgents(answers: any[]) {
    const prompt = `Tu es le collège des 4 Agents d'Audit et Diagnostic Stratégique MDIV Business :
1. Agent Diagnostic Organisationnel (analyse des goulots d'étranglement).
2. Agent Performance Commerciale (prospection, conversion, devis).
3. Agent Rentabilité & Gestion Financière (marges, facturation).
4. Agent Synthèse Exécutive (plan d'action à 30, 60, 90 jours).

Réponses du dirigeant : ${JSON.stringify(answers)}.

Réponds STRICTEMENT par un JSON valide :
{
  "maturityScore": 72,
  "summary": "Synthèse exécutive claire et percutante",
  "strengths": ["Force 1", "Force 2"],
  "bottlenecks": ["Point de blocage 1", "Point de blocage 2"],
  "roadmap": {
    "days30": ["Action prioritaire 1"],
    "days60": ["Action d optimisation 2"],
    "days90": ["Action de transformation 3"]
  },
  "recommendedTools": ["rdv_online", "facturation", "devis"]
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère le rapport multi-agents.' }
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

  async runDeepDive(answers: any[], sector: string) {
    const prompt = `Tu es un consultant en stratégie et intelligence artificielle senior.
Réalise un Diagnostic Approfondi pour une entreprise du secteur "${sector}".
Réponses : ${JSON.stringify(answers)}.
Génère une analyse détaillée des processus clés, du potentiel d'automatisation IA, des risques concurrentiels et du plan de déploiement.
Réponds STRICTEMENT en JSON :
{
  "executiveAudit": "Audit complet",
  "digitalReadinessIndex": 78,
  "automationOpportunities": [
    { "process": "Facturation & Devis", "gainHoursWeek": 5, "priority": "Haute" }
  ],
  "implementationPlan": ["Phase 1 : Cadrage", "Phase 2 : Déploiement", "Phase 3 : Formation"]
}`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: 'Génère le diagnostic approfondi.' }
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
}

export const diagnosticService = new DiagnosticService();
