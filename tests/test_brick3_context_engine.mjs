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

function detectDomainExpertise(activityText) {
  const text = activityText.toLowerCase();
  if (/(electri|cablage|domotique|courant|43\.21a)/i.test(text)) {
    return {
      domain_expertise: "Expert Technique Électricité & Normes Électriques",
      mandatory_standard: "NF C 15-100",
      rules: "Vérifier la conformité à la norme NF C 15-100, les habilitations NF C 18-510 et l'assurance décennale."
    };
  }
  if (/(veterinaire|clinique|medical|sante|soin|dent|pharma|75\.00z|86\.)/i.test(text)) {
    return {
      domain_expertise: "Expert Santé & Déontologie Médicale / Vétérinaire",
      mandatory_standard: "Déontologie ordinale",
      rules: "Respecter la déontologie ordinale, le secret médical et la traçabilité des soins."
    };
  }
  if (/(software|saas|informatique|tech|developpement|cloud|ia|cyber|62\.)/i.test(text)) {
    return {
      domain_expertise: "Architecte Systèmes d'Information, SaaS & Cybersécurité",
      mandatory_standard: "ISO 27001 / SLA",
      rules: "Respecter les standards Cloud, la sécurité ISO 27001 et les garanties SLA."
    };
  }
  return {
    domain_expertise: "Directeur Général & Stratège d'Entreprise",
    mandatory_standard: "Gouvernance",
    rules: "Maximiser le ROI et préserver la trésorerie."
  };
}

async function testDomainEnrichment(companyName, activity, userQuery, expectedNorm) {
  const expertise = detectDomainExpertise(activity);
  
  const systemPrompt = `Tu es l'expert métier IA de référence pour l'entreprise "${companyName}".
POSTURE EXPERTE ASSIGNÉE : ${expertise.domain_expertise}
RÈGLES SECTORIELLES STRICTES :
${expertise.rules}

Réponds à la demande ci-dessous en adoptant rigoureusement le niveau d'exigence et le vocabulaire technique de ton domaine.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ]
    })
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || "";
  return { expertise, answer };
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TEST AUTOMATISÉ BRIQUE 3 : MOTEUR DE CONTEXTE MÉTIER");
  console.log("==================================================");

  // Cas 1 : Entreprise Électricien
  console.log("\n▶ TEST 1: Entreprise d'Électricité (Volt & Co - Travaux d'installation électrique)...");
  const t1 = await testDomainEnrichment(
    "SAS VOLT & CO",
    "Installation électrique et domotique courant fort/faible (NAF 43.21A)",
    "Nous devons rénover le tableau électrique d'un restaurant et créer 4 nouveaux circuits de cuisine. Rédige les points de vigilance clés.",
    "15-100"
  );
  console.log(`- Posture experte : ${t1.expertise.domain_expertise}`);
  const hasNFC15100 = /15-100|différentiel|terre|consuel/i.test(t1.answer);
  console.log(`- Mention des normes électriques : ${hasNFC15100 ? 'OUI (NF C 15-100 / Sécurité)' : 'NON'}`);
  console.log(`- Extrait : "${t1.answer.slice(0, 160).replace(/\n/g, ' ')}..."`);
  if (hasNFC15100 && t1.expertise.domain_expertise.includes("Électricité")) {
    console.log("✅ TEST 1 RÉUSSI (Spécialisation Électricien validée)");
  } else {
    console.error("❌ TEST 1 ÉCHOUÉ");
    process.exit(1);
  }

  // Cas 2 : Clinique Vétérinaire
  console.log("\n▶ TEST 2: Clinique Vétérinaire (Clinique du Parc - Santé Animale)...");
  const t2 = await testDomainEnrichment(
    "Clinique Vétérinaire du Parc",
    "Activités vétérinaires et soins chirurgicaux pour animaux de compagnie (NAF 75.00Z)",
    "Préparation du protocole d'anesthésie et gestion des urgences post-opératoires. Quelles sont les obligations ?",
    "déontologie"
  );
  console.log(`- Posture experte : ${t2.expertise.domain_expertise}`);
  const hasMedicalCare = /traçabilité|ordonnance|déontologie|surveillance|consentement/i.test(t2.answer);
  console.log(`- Déontologie & traçabilité des soins : ${hasMedicalCare ? 'OUI' : 'NON'}`);
  console.log(`- Extrait : "${t2.answer.slice(0, 160).replace(/\n/g, ' ')}..."`);
  if (hasMedicalCare && t2.expertise.domain_expertise.includes("Santé")) {
    console.log("✅ TEST 2 RÉUSSI (Spécialisation Santé / Clinique validée)");
  } else {
    console.error("❌ TEST 2 ÉCHOUÉ");
    process.exit(1);
  }

  // Cas 3 : Éditeur SaaS / Tech
  console.log("\n▶ TEST 3: Entreprise SaaS / Cloud (CloudWave Technologies)...");
  const t3 = await testDomainEnrichment(
    "CloudWave SAS",
    "Édition de logiciels applicatifs SaaS et infrastructure Cloud (NAF 62.01Z)",
    "Revue des exigences pour l'onboarding d'un client bancaire grand compte sur notre plateforme.",
    "SLA"
  );
  console.log(`- Posture experte : ${t3.expertise.domain_expertise}`);
  const hasTechSla = /SLA|ISO|chiffrement|sécurité|disponibilité|GDPR|RGPD/i.test(t3.answer);
  console.log(`- Conformité Cloud / SLA / Sécurité : ${hasTechSla ? 'OUI' : 'NON'}`);
  console.log(`- Extrait : "${t3.answer.slice(0, 160).replace(/\n/g, ' ')}..."`);
  if (hasTechSla && t3.expertise.domain_expertise.includes("Systèmes d'Information")) {
    console.log("✅ TEST 3 RÉUSSI (Spécialisation Tech / SaaS validée)");
  } else {
    console.error("❌ TEST 3 ÉCHOUÉ");
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎯 TOUS LES TESTS DE LA BRIQUE 3 SONT AU VERT !");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Erreur d'exécution :", err);
  process.exit(1);
});
