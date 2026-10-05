import fs from 'fs';
import path from 'path';

// Parse .env natively without external dependencies
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

const systemPrompt = `Tu es un classifieur documentaire et routeur d'intention ultra-précis pour une plateforme IA d'entreprise.
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
  "detected_type": "Facture",
  "confidence": 94,
  "scores": {
    "Facture": 94,
    "Devis": 3,
    "Compte-rendu": 1,
    "Contrat": 1,
    "Email": 1,
    "Autre": 0
  },
  "summary_snippet": "Facture avec numéro d'émission, mention de TVA et total à payer.",
  "recommended_module": "/services-ia/facturation",
  "suggested_actions": [
    {"title": "Analyser et vérifier la facture", "route": "/services-ia/facturation"},
    {"title": "Générer une relance client", "route": "/services-ia/relances"}
  ]
}`;

async function classify(text, currentModule) {
  const sample = text.slice(0, 3000);
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
        { role: "system", content: systemPrompt },
        { role: "user", content: `Texte du document à classifier :\n\n${sample}` }
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
    'email': ['Email'],
    'summarizer': ['Compte-rendu', 'Rapport', 'Contrat', 'Autre']
  };

  const expected = moduleTypes[currentModule] || [];
  const is_mismatch = (data.confidence >= 70 && !expected.includes(data.detected_type));

  return { ...data, is_mismatch };
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TEST AUTOMATISÉ BRIQUE 1 : CLASSIFICATION & GARDE-FOU");
  console.log("==================================================");

  // Test 1 : Réunion valide dans module meeting (Nominal)
  console.log("\n▶ TEST 1: Notes de réunion dans module 'meeting'...");
  const t1 = await classify(
    "Réunion stratégique de rentrée du 12 octobre 2026. Présents: Marc, Sophie et Alexandre. Ordre du jour: arbitrage budget marketing Q4 et validation du jalon technique. Décisions actées: validation de l'enveloppe de 45k€, livraison prévue le 15 novembre.",
    "meeting"
  );
  console.log(`- Type détecté : ${t1.detected_type} (Confiance: ${t1.confidence}%)`);
  console.log(`- Mismatch détecté : ${t1.is_mismatch}`);
  if (t1.detected_type === "Compte-rendu" && !t1.is_mismatch) {
    console.log("✅ TEST 1 RÉUSSI (Nominal - Pas d'alerte)");
  } else {
    console.error("❌ TEST 1 ÉCHOUÉ", t1);
    process.exit(1);
  }

  // Test 2 : Facture soumise dans module meeting (Mismatch intention)
  console.log("\n▶ TEST 2: Facture d'entreprise soumise par erreur dans module 'meeting'...");
  const t2 = await classify(
    "FACTURE N° FAC-2026-889\nÉmetteur: SAS NOVA TECH - SIREN 812 345 678\nClient: Cabinet Mezat\nDate d'émission: 04/10/2026\nPrestation d'audit d'infrastructure Cloud: 2 500,00 € HT\nTVA 20%: 500,00 €\nNet à payer: 3 000,00 € TTC\nConditions: Paiement à 30 jours fin de mois.",
    "meeting"
  );
  console.log(`- Type détecté : ${t2.detected_type} (Confiance: ${t2.confidence}%)`);
  console.log(`- Mismatch détecté : ${t2.is_mismatch}`);
  console.log(`- Route recommandée : ${t2.recommended_module}`);
  console.log(`- Snippet : \"${t2.summary_snippet}\"`);
  if (t2.detected_type === "Facture" && t2.is_mismatch && t2.confidence >= 80) {
    console.log("✅ TEST 2 RÉUSSI (Aiguillage Mismatch Facture -> Meeting correctement déclenché)");
  } else {
    console.error("❌ TEST 2 ÉCHOUÉ", t2);
    process.exit(1);
  }

  // Test 3 : Devis soumis dans module meeting (Mismatch intention)
  console.log("\n▶ TEST 3: Devis soumis dans module 'meeting'...");
  const t3 = await classify(
    "DEVIS COMMERCIAL N° DEV-2026-042\nValable jusqu'au 30/11/2026\nDescription: Création d'application mobile Flutter - 15 jours homme à 650€/jour: 9 750,00 € HT\nTotal TTC: 11 700,00 €\nBon pour accord signature du client:",
    "meeting"
  );
  console.log(`- Type détecté : ${t3.detected_type} (Confiance: ${t3.confidence}%)`);
  console.log(`- Mismatch détecté : ${t3.is_mismatch}`);
  if (t3.detected_type === "Devis" && t3.is_mismatch) {
    console.log("✅ TEST 3 RÉUSSI (Aiguillage Mismatch Devis -> Meeting correctement déclenché)");
  } else {
    console.error("❌ TEST 3 ÉCHOUÉ", t3);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎯 TOUS LES TESTS DE LA BRIQUE 1 SONT AU VERT !");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Erreur d'exécution des tests:", err);
  process.exit(1);
});
