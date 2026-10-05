<?php
// public/api/content_generate.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $sourceType = $input['sourceType'] ?? 'text';
    $sourceContent = trim($input['sourceContent'] ?? '');
    $channels = $input['channels'] ?? ['LinkedIn', 'Twitter/X', 'Newsletter'];
    $brandSettings = $input['brandSettings'] ?? [];
    $targetAudience = $input['targetAudience'] ?? 'Dirigeants de PME et ETI';
    $company_id = intval($input['company_id'] ?? 1);

    // Détection de gribouillage & saisie sans sens métier
    $cleanSource = mb_strtolower($sourceContent, 'UTF-8');
    $isKeyboardSmash = preg_match('/^(asdf|azert|qwerty|wxcv|zxcv|blabla)/i', preg_replace('/[\s\-_0-9]/', '', $cleanSource));
    $isRepeated = preg_match('/(.)\1{4,}/', $cleanSource);
    $isShortMeaningless = mb_strlen($cleanSource, 'UTF-8') < 8;
    $noSpaces = mb_strlen($cleanSource, 'UTF-8') > 10 && strpos($cleanSource, ' ') === false && strpos($cleanSource, 'http') === false;

    if ($isShortMeaningless || $isRepeated || $isKeyboardSmash || $noSpaces) {
        echo json_encode([
            [
                'channel' => 'Alerte Saisie',
                'title' => '⚠️ Sujet source incompréhensible',
                'body' => "Votre texte source semble incomplet ou constitué de caractères aléatoires (« " . substr($sourceContent, 0, 30) . "... »).\n\nPour générer des publications percutantes pour vos réseaux sociaux (LinkedIn, X, Instagram, Newsletter, etc.), veuillez fournir un sujet clair, une actualité de votre entreprise, ou le lien d'un article à vulgariser.",
                'hashtags' => ['#Conseil', '#Communication']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $tone = $brandSettings['tone'] ?? 'Professionnel et inspirant';
    $keywords = $brandSettings['keywords'] ?? 'IA, performance, rentabilité, automatisation';

    $channelList = implode(', ', $channels);

    $systemPrompt = "Tu es un directeur éditorial d'élite et copywriter B2B expert en croissance multicanale pour MDIV Business.
Tu dois décliner le contenu source pour CHACUN des canaux demandés : $channelList.

RÈGLES D'OR DE DÉCLINAISON PAR CANAL :
1. LINKEDIN :
   - Accroche percutante (Hook) dès la 1ère ligne.
   - Aération ligne par ligne avec sauts de lignes pour lecture mobile.
   - 3 à 5 emojis professionnels et stratégiques (📌, 💡, 🚀, 📈, 🤝, 🎯).
   - Enseignement métier à haute valeur ajoutée suivi d'un Call-To-Action engageant.
   - 3 à 5 hashtags professionnels.

2. TWITTER / X :
   - Style ultra-percutant, direct et concis (< 280 caractères) ou structure Thread (1/2, 2/2).
   - Emojis dynamiques (⚡, 🔥, 🧵) et 2-3 hashtags.

3. INSTAGRAM :
   - Récit visuel et humain.
   - Suggestion du visuel en première ligne : \"[📸 Visuel suggéré : ...] \".
   - Emojis expressifs (✨, 🎯, 📸, 🔥) et 8 à 12 hashtags en bas.

4. NEWSLETTER :
   - Objet d'email accrocheur en titre.
   - Salutation chaleureuse, storytelling d'ouverture, 3 enseignements clés à puces, et CTA clair.

5. BLOG :
   - Titre H1 SEO, chapô accrocheur, 2 sous-parties [H2] structurées et conclusion actionnable.

Audience cible : $targetAudience
Ton de marque : $tone
Mots-clés stratégiques : $keywords

Tu dois répondre UNIQUEMENT par un tableau JSON valide de ce format :
[
  {
    \"channel\": \"NomDuCanal\",
    \"title\": \"Titre accrocheur spécifique\",
    \"body\": \"Texte complet et formaté avec sauts de ligne et emojis adaptés au canal...\",
    \"hashtags\": [\"#Hashtag1\", \"#Hashtag2\"]
  }
]";

    $userPrompt = "Contenu source ($sourceType) :\n\n" . mb_substr($sourceContent, 0, 4000);

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\[.*\]/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!is_array($data)) {
            throw new Exception("Format de réponse invalide pour le contenu.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
