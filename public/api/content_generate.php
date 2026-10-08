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

    // Construire dynamiquement les règles d'or en fonction des canaux demandés
    $rules = "";
    $channelNames = [];
    foreach ($channels as $c) {
        $c = strtolower($c);
        if (in_array($c, ['linkedin'])) {
            $channelNames[] = "LinkedIn";
            $rules .= "1. LINKEDIN: Punchy hook, line breaks for mobile reading, 3-5 emojis, high-value insight, CTA, 3-5 hashtags.\n";
        } elseif (in_array($c, ['x', 'twitter'])) {
            $channelNames[] = "X (Twitter)";
            $rules .= "2. TWITTER / X: Ultra-punchy, direct (< 280 chars) or Thread structure. Dynamic emojis, 2-3 hashtags.\n";
        } elseif (in_array($c, ['instagram'])) {
            $channelNames[] = "Instagram";
            $rules .= "3. INSTAGRAM: Visual storytelling, start with \"[📸 Visuel suggéré : ...] \", expressive emojis, 8-12 hashtags.\n";
        } elseif (in_array($c, ['facebook'])) {
            $channelNames[] = "Facebook";
            $rules .= "4. FACEBOOK: Engaging community post, ask a question to generate comments, 2-3 emojis, link in first comment or end of post.\n";
        } elseif (in_array($c, ['newsletter'])) {
            $channelNames[] = "Newsletter";
            $rules .= "5. NEWSLETTER: Catchy email subject as title, warm greeting, 3 bulleted key takeaways, clear CTA.\n";
        } elseif (in_array($c, ['blog', 'article blog'])) {
            $channelNames[] = "Article Blog";
            $rules .= "6. BLOG: SEO H1 Title, catchy intro, 2 structured [H2] sub-sections, actionable conclusion.\n";
        } elseif (in_array($c, ['youtube', 'script vidéo'])) {
            $channelNames[] = "Script Vidéo (YouTube)";
            $rules .= "7. YOUTUBE: Hook (first 5 seconds), intro, main content broken down into bullet points, outro with subscribe CTA.\n";
        } elseif (in_array($c, ['telegram'])) {
            $channelNames[] = "Telegram";
            $rules .= "8. TELEGRAM: Direct, concise, action-oriented, bold text for key elements, 1-2 emojis, direct link.\n";
        } else {
            $channelNames[] = ucfirst($c);
            $rules .= "- $c: Adapt tone for this specific channel.\n";
        }
    }

    $channelList = implode(', ', $channelNames);

    $systemPrompt = "You are an elite editorial director and B2B copywriter expert in multi-channel growth for MDIV Business.
You must adapt the source content ONLY for the following requested channels: $channelList.
DO NOT generate content for any other channel.

GOLDEN RULES FOR REQUESTED CHANNELS:
$rules

Target audience: $targetAudience
Brand tone: $tone
Strategic keywords: $keywords

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON array of this format:
[
  {
    \"channel\": \"<CHANNEL_NAME>\",
    \"title\": \"<GENERATED_CATCHY_TITLE_FRENCH>\",
    \"body\": \"<GENERATED_FORMATTED_BODY_TEXT_FRENCH>\",
    \"hashtags\": [\"<HASHTAG_1>\", \"<HASHTAG_2>\"]
  }
]";

    $userPrompt = "Contenu source ($sourceType) :\n\n" . mb_substr($sourceContent, 0, 4000);

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, true);

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
