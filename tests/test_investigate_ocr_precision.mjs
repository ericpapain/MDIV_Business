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
const groqKey = process.env.GROQ_API_KEY;
const imagePath = 'C:\\Users\\mezat\\.gemini\\antigravity-ide\\brain\\5e962df7-e62d-43f0-8ad5-08ca76c3305e\\.user_uploaded\\media_1791273199509.jpg';
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

console.log('--- TEST A : Pourquoi Groq Vision a échoué ? ---');
if (groqKey) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Transcris exactement le texte de ce ticket de caisse, chiffre par chiffre, sans aucune erreur.' },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }],
        temperature: 0.0
      })
    });
    const d = await res.json();
    console.log('Groq 90b status:', res.status, JSON.stringify(d).slice(0, 300));
  } catch (e) {
    console.error('Groq err:', e);
  }
}

console.log('\n--- TEST B : Pourquoi GPT-4o refuse et comment le débloquer ? ---');
// OpenAI vision refusal est souvent dû à : "transcris le nom de la personne" ou "reconnais la personne"
// Si on lui dit : "Voici une image d'un reçu d'achat imprimé thermique. Transcris le texte imprimé en faisant une attention extrême aux chiffres de l'imprimante matricielle (distingue bien 5 et 3, 6 et 8, 2026 vs 2023, 45 vs 43, MEZATIO vs MEZIATO)."
const promptChirurgical = `Cette image montre un reçu papier imprimé en imprimante thermique matricielle.
Effectue une lecture optique ultra-précise de chaque caractère :
- Fais attention aux caractères matriciels où le '5' ressemble parfois au '3', et le '6' au '8' ou '3'.
- Lis attentivement la date (année exacte), le numéro de téléphone, le numéro de ticket et le nom du client.
- Transcris chaque ligne exactement comme imprimée.`;

try {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: promptChirurgical },
          { type: 'image_url', image_url: { url: base64Image, detail: 'high' } }
        ]
      }],
      temperature: 0.0
    })
  });
  const d = await res.json();
  console.log('GPT-4o status:', res.status, d.choices?.[0]?.message?.content || JSON.stringify(d).slice(0, 300));
} catch (e) {
  console.error('GPT-4o err:', e);
}

console.log('\n--- TEST C : GPT-4o-mini avec instruction d\'attention matricielle maximale ---');
try {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: promptChirurgical },
          { type: 'image_url', image_url: { url: base64Image, detail: 'high' } }
        ]
      }],
      temperature: 0.0
    })
  });
  const d = await res.json();
  console.log('GPT-4o-mini status:', res.status, d.choices?.[0]?.message?.content);
} catch (e) {
  console.error('GPT-4o-mini err:', e);
}
