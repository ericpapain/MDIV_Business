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

    if (empty($text)) {
        throw new Exception("Le texte d'entrée ne peut pas être vide.");
    }

    $systemPrompt = "Tu es un expert en communication exécutive et en rédaction professionnelle B2B pour MDIV Business.
Rédige un email exceptionnel en français selon les consignes :
- Tâche demandée : $task
- Ton : $tone
- Objectif : $objective

Règles de style :
1. Objet d'email clair, percutant et professionnel (ex: « Objet : ... » en première ligne).
2. Salutation soignée et adaptée au ton ($tone).
3. Corps fluide, sans jargon superflu, orienté valeur et courtoisie professionnelle.
4. Formule de politesse élégante et signature professionnelle.
5. Ne pas entourer de balises inutiles, fournir le texte prêt à l'envoi.";

    $userPrompt = "Voici les notes ou l'ébauche de l'email :\n\n" . $text;

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, false);

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
