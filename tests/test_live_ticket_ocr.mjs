import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const openaiKey = process.env.OPENAI_API_KEY;
const imagePath = 'C:\\Users\\mezat\\.gemini\\antigravity-ide\\brain\\5e962df7-e62d-43f0-8ad5-08ca76c3305e\\.user_uploaded\\media_1791273199509.jpg';
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

console.log('================================================================================');
console.log('🧪 VALIDATION DU PIPELINE COMPLET SUR LE TICKET DE CAISSE RÉEL');
console.log('================================================================================');

const payload = {
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Tu es un système de reconnaissance optique et d'analyse documentaire comptable haute précision.
Transcris fidèlement l'intégralité du texte et des données de cette facture, ticket de caisse ou reçu :
- En-tête : Magasin ou entreprise, Téléphone, Date, Heure, N° Ticket ou Facture, Vendeur
- Client si mentionné
- Tableau des articles : Désignation, Référence, Prix unitaire, Quantité, Total
- Tableau de TVA : Taux, Base HT, Montant TVA, Total TTC
- Total général et Mode de règlement
- Mentions de bas de page (échanges, garanties, etc.)
Présente le résultat en Markdown clair et structuré. Ne modifie aucun chiffre ni montant.`
        },
        {
          type: 'image_url',
          image_url: { url: base64Image, detail: 'high' }
        }
      ]
    }
  ],
  temperature: 0.05,
  max_tokens: 2500
};

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openaiKey}`
  },
  body: JSON.stringify(payload)
});

const data = await res.json();
const extracted = data.choices[0]?.message?.content || '';

console.log('✅ RÉSULTAT OBTENU PAR L\'IA MULTIMODALE VISION :\n');
console.log(extracted);
console.log('\n================================================================================');

// Vérification de conformité
const verifications = [
  { label: 'Téléphone', regex: /03\.25\./i },
  { label: 'Date', regex: /05\/10\//i },
  { label: 'Nom Client', regex: /MEZ/i },
  { label: 'Article', regex: /BLUE BLACK/i },
  { label: 'Prix Article', regex: /19\.99/i },
  { label: 'Base HT', regex: /16\.66/i },
  { label: 'Montant TVA', regex: /3\.33/i },
  { label: 'Taux TVA 20%', regex: /20/i },
  { label: 'Conditions échange', regex: /30 jours/i }
];

console.log('📊 TEST DE CONFORMITÉ DES CHAMPS EXTRAITS :');
let passed = 0;
for (const v of verifications) {
  const ok = v.regex.test(extracted);
  console.log(`  - ${v.label.padEnd(20)} : ${ok ? '✅ EXACT' : '❌ ERREUR'}`);
  if (ok) passed++;
}

console.log(`\nScore global : ${passed} / ${verifications.length} (${Math.round((passed / verifications.length) * 100)}% de précision)`);
