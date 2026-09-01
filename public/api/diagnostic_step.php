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

    $history = $input['history']; // Tableau du type [{role: "user", content: "..."}, ...]
    
    $system_prompt = "Tu es un consultant senior en stratégie digitale et Intelligence Artificielle pour les TPE et PME.
Ton rôle est de mener un diagnostic pragmatique, fluide et pertinent.
Pose UNE SEULE question claire à la fois pour comprendre l'activité, les freins, les outils et les objectifs du dirigeant.

RÈGLES CAPITALES :
1. L'utilisateur peut cocher PLUSIEURS options dans ses réponses. Lorsque l'utilisateur sélectionne plusieurs éléments (ex: 'Gestion client, Relances factures, Rédaction de devis'), lis et analyse l'ENSEMBLE de ses choix pour poser une question suivante qui synthétise intelligemment ces besoins combinés.
2. Propose toujours entre 3 et 5 choix de réponses concrètes et distinctes sous forme de cases à cocher.
3. Termine TOUJOURS la liste des options par 'Autre (précisez)'.
4. Détermine dynamiquement le nombre total de questions estimées nécessaires (entre 3 et 7 questions).

Structure de réponse JSON STRICTE :
{
    \"question\": \"La question claire et accessible à poser\",
    \"options\": [\"Choix 1\", \"Choix 2\", \"Choix 3\", \"Autre (précisez)\"],
    \"total_questions\": 5
}
Ne génère AUCUN texte en dehors du JSON.";

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
        // S'assurer que "Autre" est bien présent
        $hasAutre = false;
        foreach ($parsed['options'] as $opt) {
            $lower = strtolower(trim($opt));
            if ($lower === 'autre' || $lower === 'other' || strpos($lower, 'autre') === 0) {
                $hasAutre = true;
                break;
            }
        }
        if (!$hasAutre) {
            $parsed['options'][] = 'Autre (précisez)';
        }
        // S'assurer que total_questions est valide
        if (!isset($parsed['total_questions']) || $parsed['total_questions'] < 3 || $parsed['total_questions'] > 7) {
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
