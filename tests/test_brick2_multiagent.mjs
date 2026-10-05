import fs from 'fs';

// Parse .env natively
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('OPENAI_API_KEY=')) {
      OPENAI_API_KEY = trimmed.split('=')[1].trim();
      break;
    }
  }
}

if (!OPENAI_API_KEY) {
  console.error("❌ ERREUR: OPENAI_API_KEY absente du .env");
  process.exit(1);
}

async function callAgent(systemPrompt, userPrompt, temperature = 0.3) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI error: ${JSON.stringify(data)}`);
  }
  return data.choices?.[0]?.message?.content || "";
}

async function runMultiAgentConsensus(documentText, mode = "direction") {
  console.log(`\n==================================================`);
  console.log(`🤖 DÉMARRAGE DE LA DÉLIBÉRATION MULTI-AGENTS (Mode: ${mode.toUpperCase()})`);
  console.log(`==================================================`);

  // Tour 1: Agent 1 - Analyste Factuel & Extraction
  console.log(`\n[Agent 1: Analyste Factuel & Extraction] en cours...`);
  const t0 = Date.now();
  const agent1Prompt = `Tu es l'Analyste Factuel en chef pour une direction d'entreprise.
Analyse le document ci-après et propose une première synthèse brute en 3 sections :
1. Faits, montants financiers et chiffres irréfutables
2. Enjeux et objectifs principaux
3. Actions et décisions immédiates suggérées
Sois direct, factuel et précis (environ 100 à 140 mots).`;

  const agent1Draft = await callAgent(agent1Prompt, `Document source :\n\n${documentText}`);
  console.log(`⏱️ (${Date.now() - t0}ms) Réponse Agent 1 :\n${agent1Draft}\n`);

  // Tour 2: Agent 2 - Auditeur Critique & Challenger des Risques
  console.log(`[Agent 2: Auditeur Critique & Risques] en cours...`);
  const t1 = Date.now();
  const agent2Prompt = `Tu es l'Auditeur Critique & Challenger de Risques.
Tu as pour rôle d'évaluer avec exigence la proposition de l'Analyste Factuel par rapport au document source.
Identifie :
1. Une omission ou imprécision dans sa lecture des faits
2. Un risque opérationnel, juridique ou financier critique qui mérite d'être renforcé
3. Une question d'arbitrage que la direction doit impérativement trancher
Reste constructif et incisif (environ 90 à 130 mots).`;

  const agent2Critique = await callAgent(
    agent2Prompt,
    `Document source :\n${documentText}\n\nProposition d'Agent 1 (Analyste) :\n${agent1Draft}`
  );
  console.log(`⏱️ (${Date.now() - t1}ms) Réponse Agent 2 :\n${agent2Critique}\n`);

  // Tour 3: Agent 3 - Stratège Métier & Arbitre Exécutif
  console.log(`[Agent 3: Stratège Exécutif & Arbitre] en cours...`);
  const t2 = Date.now();
  const agent3Prompt = `Tu es le Stratège Exécutif & Arbitre Métier.
Prends en compte la proposition initiale d'Agent 1 et les objections critiques formulées par Agent 2.
Rends un arbitrage exécutif clair :
- Quelles critiques d'Agent 2 sont retenues et intégrées ?
- Quels compromis opérationnels ou financiers doivent être actés pour maximiser le ROI et sécuriser l'exécution ?
Rédige ta synthèse d'arbitrage (environ 90 à 120 mots).`;

  const agent3Arbitration = await callAgent(
    agent3Prompt,
    `Proposition Agent 1 :\n${agent1Draft}\n\nCritique Agent 2 :\n${agent2Critique}`
  );
  console.log(`⏱️ (${Date.now() - t2}ms) Réponse Agent 3 :\n${agent3Arbitration}\n`);

  // Tour 4: Agent 4 - Directeur Général & Synthèse Finale de Consensus
  console.log(`[Agent 4: Directeur Général & Juge de Consensus] Génération du JSON certifié...`);
  const t3 = Date.now();
  const agent4SystemPrompt = `Tu es le Directeur Général & Juge de Synthèse.
Tu clôtures la délibération entre l'Analyste, l'Auditeur des Risques et le Stratège.
Intègre leurs consensus et arbitrages pour produire la note de synthèse exécutive finale.
Réponds STRICTEMENT par un objet JSON valide suivant exactement cette structure :
{
  "documentName": "Rapport_Stratégie_2026.docx",
  "mode": "${mode}",
  "executiveSummary": "Synthèse consolidée intégrant les arbitrages...",
  "keyPoints": ["Point 1 validé par le consensus", "Point 2"],
  "objectives": ["Objectif 1"],
  "risks": ["Risque majeur consolidé"],
  "recommendedActions": [
    {"action": "Action concrète validée", "context": "Justification d'arbitrage"}
  ],
  "decisions": ["Arbitrage clé à signer"],
  "consensus_trail": {
    "agent1_summary": "Extrait clé Agent 1",
    "agent2_challenge": "Extrait clé Agent 2",
    "agent3_arbitration": "Extrait clé Agent 3"
  }
}`;

  const finalConsensusJson = await callAgent(
    agent4SystemPrompt,
    `Document source :\n${documentText}\n\nDélibération des agents :\n- Agent 1: ${agent1Draft}\n- Agent 2: ${agent2Critique}\n- Agent 3: ${agent3Arbitration}`,
    0.1
  );

  console.log(`⏱️ (${Date.now() - t3}ms) Rapport JSON Final généré !`);
  const parsed = JSON.parse(finalConsensusJson);
  console.log(`\n📋 RÉSULTAT CONSOLIDÉ :\n`, JSON.stringify(parsed, null, 2));

  return parsed;
}

async function main() {
  const sampleDoc = `
RAPPORT D'AVANCEMENT STRATÉGIQUE - PROJET TITAN
Date: 05 Octobre 2026
Direction des Systèmes d'Information & Direction Financière

1. Contexte & Budgets :
Le budget initial alloué de 450 000 € a été engagé à hauteur de 68% (306 000 € consommés).
Un dépassement prévisionnel de 45 000 € est anticipé en raison de l'intégration imprévue du chiffrement bancaire de bout en bout.

2. Délais & Jalons :
La mise en production de la V1 était fixée au 15 novembre 2026. Le retard actuel sur les tests de charge imposera un décalage de 2 semaines (livraison le 30 novembre) si aucun renfort externe n'est mobilisé.

3. Risques identifiés :
- Risque de pénalités contractuelles de 5 000 € par semaine de retard au-delà du 1er décembre avec le client pilote.
- Risque de surcharge de l'équipe backend (taux d'occupation actuel à 120%).

4. Recommandations :
Recruter 2 consultants externes spécialisés pour 3 semaines (coût 18 000 €) pour tenir la date du 15 novembre, OU accepter le report au 30 novembre qui évite les pénalités contractuelles tout en préservant la trésorerie.
`;

  const result = await runMultiAgentConsensus(sampleDoc, "direction");

  if (result.executiveSummary && result.decisions?.length > 0 && result.consensus_trail?.agent2_challenge) {
    console.log(`\n✅ TEST MULTI-AGENTS BRIQUE 2 : 100% SUCCÈS !`);
  } else {
    console.error(`\n❌ ÉCHEC DU TEST MULTI-AGENTS BRIQUE 2`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
