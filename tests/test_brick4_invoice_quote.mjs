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

const classifierSystemPrompt = `Tu es un classifieur documentaire et routeur d'intention ultra-précis pour une plateforme IA d'entreprise.
Analyse le texte fourni et détermine avec rigueur à quelle catégorie il appartient :
Catégories autorisées :
- 'Facture'
- 'Devis'
- 'Compte-rendu' (notes de réunion, transcriptions orales, ordres du jour)
- 'Contrat' (accords, CGV, baux, contrats de travail ou de prestation)
- 'Email' (correspondance, lettre professionnelle)
- 'CV' (profil professionnel, candidature)
- 'Rapport' (audit, diagnostic stratégique, bilan d'activité)
- 'Autre'

RÈGLES STRICTES :
1. Attribue une distribution de probabilité en pourcentages (la somme des scores doit être égale à 100).
2. Fournis un court extrait explicatif ('summary_snippet') qui justifie ton choix.
3. Si le document appartient de façon évidente à une catégorie avec un score >= 75%, indique le module d'atterrissage recommandé et 2 à 3 actions logiques pour l'utilisateur.

Tu dois répondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  \"detected_type\": \"Facture\",
  \"confidence\": 94,
  \"scores\": {\"Facture\": 94, \"Devis\": 3, \"Compte-rendu\": 1, \"Contrat\": 1, \"Email\": 1, \"Autre\": 0},
  \"summary_snippet\": \"Facture avec numéro d'émission, mention de TVA et total à payer.\",
  \"recommended_module\": \"/services-ia/facturation\",
  \"suggested_actions\": [{\"title\": \"Vérifier la facture\", \"route\": \"/services-ia/facturation\"}]
}`;

async function classify(text, currentModule) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: classifierSystemPrompt },
        { role: "user", content: `Texte du document à classifier :\n\n${text.slice(0, 3000)}` }
      ]
    })
  });

  const resJson = await response.json();
  const raw = resJson.choices?.[0]?.message?.content || '{}';
  const data = JSON.parse(raw);

  const moduleTypes = {
    'meeting': ['Compte-rendu'],
    'invoice': ['Facture'],
    'quote': ['Devis'],
    'summarizer': ['Compte-rendu', 'Rapport', 'Contrat', 'Autre']
  };

  const expected = moduleTypes[currentModule] || [];
  const is_mismatch = (data.confidence >= 70 && !expected.includes(data.detected_type));

  return { ...data, is_mismatch };
}

async function testMultiAgentQuoteGeneration() {
  const quoteSystemPrompt = `Tu es le Directeur Commercial & Négociateur pour MDIV Business.
POSTURE EXPERTE ASSIGNÉE : Expert Technique Électricité & Normes Électriques
RÈGLES SECTORIELLES :
- Réfère-toi aux normes françaises en vigueur (notamment la norme NF C 15-100 et les directives Consuel).
- Vérifie toujours la sécurité des personnes (disjoncteurs différentiels 30mA, section des conducteurs, mise à la terre).

Délibération interne des experts :
- Métreur : Rénovation tableau 3 rangées + 4 départs circuits cuisines avec disjoncteurs 16A/20A et différentiel type A.
- Auditeur des marges : Intégrer les goulottes de passage et prévoir 10% d'aléa fournitures. Acompte 30%.

Génère le devis JSON certifié avec ce schéma :
{
  "suggestedLines": [
    {"id": "1", "description": "Remplacement tableau électrique...", "quantity": 1, "unitPriceHT": 1450, "vatRate": 10, "discountPercentage": 0}
  ],
  "executiveSummary": "Mise en conformité complète selon norme NF C 15-100...",
  "paymentTerms": "Acompte 30% à la signature, solde à réception Consuel."
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: quoteSystemPrompt },
        { role: "user", content: "Chiffrage rénovation électrique restaurant Le Gourmet." }
      ]
    })
  });

  const resJson = await response.json();
  return JSON.parse(resJson.choices?.[0]?.message?.content || '{}');
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TEST AUTOMATISÉ BRIQUE 4 : FACTURATION & DEVIS");
  console.log("==================================================");

  // Test 1 : Mismatch dans Facturation (utilisateur soumet des notes de réunion)
  console.log("\n▶ TEST 1: Notes de réunion soumises dans module 'invoice'...");
  const t1 = await classify(
    "Ordre du jour de la réunion du 15 octobre : arbitrage sur les recrutements et revue du planning produit avec Marc et Julie. Décisions prises : report du jalon au 30 novembre.",
    "invoice"
  );
  console.log(`- Type détecté : ${t1.detected_type} (Confiance: ${t1.confidence}%)`);
  console.log(`- Mismatch détecté : ${t1.is_mismatch}`);
  console.log(`- Redirection recommandée : ${t1.recommended_module}`);
  if (t1.detected_type === "Compte-rendu" && t1.is_mismatch) {
    console.log("✅ TEST 1 RÉUSSI (Aiguillage Facture -> Réunion fonctionnel)");
  } else {
    console.error("❌ TEST 1 ÉCHOUÉ", t1);
    process.exit(1);
  }

  // Test 2 : Mismatch dans Devis (utilisateur soumet une facture établie)
  console.log("\n▶ TEST 2: Facture émise soumise dans module 'quote'...");
  const t2 = await classify(
    "FACTURE DÉFINITIVE N° FAC-2026-904\nÉmetteur: Mezat Conseil\nClient: Cabinet Vétérinaire\nMontant net à payer : 3 450,00 € TTC\nÉchéance : 30 jours.",
    "quote"
  );
  console.log(`- Type détecté : ${t2.detected_type} (Confiance: ${t2.confidence}%)`);
  console.log(`- Mismatch détecté : ${t2.is_mismatch}`);
  console.log(`- Redirection recommandée : ${t2.recommended_module}`);
  if (t2.detected_type === "Facture" && t2.is_mismatch) {
    console.log("✅ TEST 2 RÉUSSI (Aiguillage Devis -> Facture fonctionnel)");
  } else {
    console.error("❌ TEST 2 ÉCHOUÉ", t2);
    process.exit(1);
  }

  // Test 3 : Chiffrage Multi-Agents avec Contexte Métier
  console.log("\n▶ TEST 3: Chiffrage Devis Multi-Agents avec Persona Électricien...");
  const t3 = await testMultiAgentQuoteGeneration();
  console.log(`- Lignes générées : ${t3.suggestedLines?.length || 0}`);
  console.log(`- Résumé exécutif : "${t3.executiveSummary}"`);
  console.log(`- Conditions de paiement : "${t3.paymentTerms}"`);
  const hasNorm = /15-100|consuel|conforme/i.test(t3.executiveSummary + ' ' + (t3.suggestedLines?.[0]?.description || ''));
  if (t3.suggestedLines?.length > 0 && hasNorm) {
    console.log("✅ TEST 3 RÉUSSI (Chiffrage multi-agents enrichi validé)");
  } else {
    console.error("❌ TEST 3 ÉCHOUÉ", t3);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎯 TOUS LES TESTS DE LA BRIQUE 4 SONT AU VERT !");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Erreur critique :", err);
  process.exit(1);
});
