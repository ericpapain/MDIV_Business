<?php
require_once 'config.php';

header('Content-Type: application/json');

// --- SÉCURITÉ : VÉRIFICATION DU TOKEN JWT ---
$token = get_bearer_token();
if (!$token || !verify_jwt($token)) {
    http_response_code(401);
    echo json_encode(["error" => "Accès refusé. Token invalide ou expiré."]);
    exit;
}
// ---------------------------------------------

// Lire les données JSON envoyées par le frontend
$inputData = json_decode(file_get_contents("php://input"), true);
$history = $inputData['history'] ?? [];

// Le contexte système pour obliger l'IA à jouer son rôle de diagnostiqueur
$systemPrompt = "
Tu es un consultant IA expert en transformation digitale pour les entreprises.
Ton rôle est de mener un diagnostic interactif avec l'utilisateur pour comprendre ses besoins et construire son 'persona'.
L'utilisateur te fournit l'historique de votre conversation.

TA MISSION ACTUELLE :
Générer la prochaine question la plus pertinente à poser à l'utilisateur, en te basant sur ses réponses précédentes.
Tu dois proposer entre 3 et 5 options de réponses sous forme de cases à cocher (choix multiples possibles).

FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :
{
    \"question\": \"La question précise et engageante à poser.\",
    \"options\": [
        \"Option 1\",
        \"Option 2\",
        \"Option 3\"
    ]
}

RÈGLES :
1. Si l'historique est vide, demande toujours en premier le secteur d'activité de l'utilisateur.
2. Si le secteur est connu, pose des questions sur ses défis, la taille de l'équipe, ses outils actuels, ou son budget.
3. Reste concis, clair et direct.
";

// Préparation des messages pour l'API LLM
$messages = [
    ["role" => "system", "content" => $systemPrompt]
];

// On ajoute l'historique de la conversation
foreach ($history as $msg) {
    // On s'assure que le rôle est valide ('user' ou 'assistant')
    $role = in_array($msg['role'], ['user', 'assistant']) ? $msg['role'] : 'user';
    $messages[] = [
        "role" => $role,
        "content" => is_array($msg['content']) ? json_encode($msg['content'], JSON_UNESCAPED_UNICODE) : $msg['content']
    ];
}

try {
    // On appelle notre utilitaire (qui utilise l'API Gratuite Groq par défaut, ou OpenAI si on décommente dans config.php)
    // On active le mode JSON strict en passant `true` en second paramètre
    $response = call_llm_api($messages, true);

    // Extraction du contenu de la réponse (qui est censé être notre JSON structuré)
    $content = $response['choices'][0]['message']['content'];

    // Retour au frontend
    echo $content;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
