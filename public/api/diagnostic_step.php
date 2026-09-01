<?php
// Fichier : /api/diagnostic_step.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/groq_client.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['history'])) {
        http_response_code(400);
        echo json_encode(["error" => "Historique de conversation manquant."]);
        exit;
    }

    $history = $input['history']; // Tableau du type [{role: "user", content: "je suis artisan"}, ...]
    
    $system_prompt = "Tu es un expert en transformation digitale et en Intelligence Artificielle pour les TPE/PME.
Ton objectif est de poser UNE SEULE question à la fois à l'utilisateur pour comprendre son besoin métier, ses défis et déterminer sa maturité numérique.
À chaque tour, tu dois proposer 3 ou 4 options de réponses sous forme de cases à cocher (courtes et pertinentes).
Tu dois répondre STRICTEMENT en JSON avec la structure suivante :
{
    \"question\": \"La question à poser\",
    \"options\": [\"Option 1\", \"Option 2\", \"Option 3\"]
}
Sois direct et n'ajoute pas de texte hors du JSON.";

    $messages = [
        ["role" => "system", "content" => $system_prompt]
    ];
    
    foreach($history as $msg) {
        $messages[] = [
            "role" => $msg['role'] === 'user' ? 'user' : 'assistant',
            "content" => $msg['content']
        ];
    }
    
    $result = callGroqApi($messages);
    
    $content = $result['choices'][0]['message']['content'];
    
    echo $content;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
