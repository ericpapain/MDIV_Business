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

    if (empty($sourceContent)) {
        throw new Exception("Le contenu source ne peut pas être vide.");
    }

    $tone = $brandSettings['tone'] ?? 'Professionnel et inspirant';
    $keywords = $brandSettings['keywords'] ?? 'IA, performance, rentabilité, automatisation';

    $channelList = implode(', ', $channels);

    $systemPrompt = "Tu es un directeur éditorial et expert copywriter B2B d'élite pour MDIV Business.
À partir du sujet ou contenu source fourni, génère une déclinaison de contenu adaptée spécifiquement aux canaux demandés : $channelList.
Audience cible : $targetAudience
Ton de marque : $tone
Mots-clés stratégiques : $keywords

Pour chaque canal sélectionné ($channelList) :
- Adapte les codes natifs du réseau (LinkedIn : accroche puissante + aération + appel aux commentaires ; Twitter/X : concis, percutant ; Newsletter : chaleureux, instructif ; Blog : structuré avec sous-titres ; etc.).
- Ajoute des hashtags pertinents si applicable.

Tu dois répondre UNIQUEMENT par un tableau JSON valide de ce format :
[
  {
    \"channel\": \"NomDuCanal\",
    \"title\": \"Titre accrocheur éventuel\",
    \"body\": \"Texte complet et formaté du post / article / email\",
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
