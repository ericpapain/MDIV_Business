<?php
// public/api/email_generate.php
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
    
    $text = trim($input['text'] ?? '');
    $task = $input['task'] ?? 'Réécriture professionnelle';
    $tone = $input['tone'] ?? 'Professionnel';
    $objective = $input['objective'] ?? 'Nouvel email';
    $company_id = intval($input['company_id'] ?? 1);

    $isRepeated = preg_match('/(.)\1{4,}/', $text);
    $noSpaces = strlen($text) > 10 && strpos($text, ' ') === false && strpos($text, '@') === false;
    $isSmash = preg_match('/^[bcdfghjklmnpqrstvwxyz]{6,}$/i', str_replace(' ', '', $text));

    if ($isRepeated || $noSpaces || $isSmash) {
        echo json_encode([
            'success' => true,
            'generatedText' => "⚠️ Votre saisie semble incomplète ou incompréhensible.\n\nPour que l'Assistant Email puisse rédiger un message professionnel percutant, veuillez préciser au minimum :\n• Le destinataire (client, prospect, partenaire, collaborateur)\n• L'objet de votre démarche (relance facture, proposition commerciale, demande de réunion, compte-rendu)\n• Les points clés ou chiffres à aborder."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $systemPrompt = "You are an expert in executive communication and B2B professional writing for MDIV Business.
Write an exceptional email in French following these instructions:
- Task: $task
- Tone: $tone
- Objective: $objective

ANTI-GIBBERISH SAFEGUARD:
If the provided text is gibberish, a random sequence of characters, or totally out of context without business sense:
DO NOT generate an absurd fake email.
Respond STRICTLY with this explicit and polite error message:
\"⚠️ Votre saisie semble incomplète ou incompréhensible. Pour rédiger un email professionnel, veuillez indiquer au minimum l'objet, le destinataire et le message clé à transmettre (ex: relance facture d'acompte, proposition commerciale, confirmation de rendez-vous).\"

STYLE RULES:
1. Clear, punchy, and professional subject line (e.g., \"Objet : ...\" on the first line).
2. Polished greeting suited to the tone ($tone).
3. Fluid body, no unnecessary jargon, value-oriented and displaying professional courtesy.
4. Elegant closing and professional signature.
5. Do not wrap in unnecessary tags, output the text ready to send.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.";

    $userPrompt = "Voici les notes ou l'ébauche de l'email :\n\n" . $text;

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, false);

    $generatedText = '';
    if (isset($response['choices'][0]['message']['content'])) {
        $generatedText = trim($response['choices'][0]['message']['content']);
    } else {
        throw new Exception("Erreur de génération du modèle IA.");
    }

    echo json_encode([
        'success' => true,
        'generatedText' => $generatedText
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
