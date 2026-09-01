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
À chaque tour, tu dois proposer 3 à 5 options de réponses sous forme de cases à cocher (courtes et pertinentes).
L'utilisateur peut sélectionner PLUSIEURS options, donc les options ne doivent PAS être mutuellement exclusives.
Tu dois TOUJOURS inclure une option \"Autre\" en dernière position pour laisser la possibilité à l'utilisateur de préciser quelque chose qui n'est pas dans la liste.
Tu dois aussi évaluer dynamiquement combien de questions au total tu estimes nécessaires pour faire un bon diagnostic (entre 3 et 8 questions).
Tu dois répondre STRICTEMENT en JSON avec la structure suivante :
{
    \"question\": \"La question à poser\",
    \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", \"Autre\"],
    \"total_questions\": 5
}
Le champ total_questions doit être un entier entre 3 et 8 représentant le nombre total de questions que tu prévois de poser.
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
    
    // Tenter de parser pour valider le JSON
    $parsed = json_decode($content, true);
    if ($parsed && isset($parsed['question']) && isset($parsed['options'])) {
        // S'assurer que "Autre" est présent
        $hasAutre = false;
        foreach ($parsed['options'] as $opt) {
            $lower = strtolower(trim($opt));
            if ($lower === 'autre' || $lower === 'other' || strpos($lower, 'autre') === 0) {
                $hasAutre = true;
                break;
            }
        }
        if (!$hasAutre) {
            $parsed['options'][] = 'Autre';
        }
        // S'assurer que total_questions est valide
        if (!isset($parsed['total_questions']) || $parsed['total_questions'] < 3 || $parsed['total_questions'] > 8) {
            $parsed['total_questions'] = 5;
        }
        echo json_encode($parsed, JSON_UNESCAPED_UNICODE);
    } else {
        // Fallback : renvoyer le contenu brut tel quel
        echo $content;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
