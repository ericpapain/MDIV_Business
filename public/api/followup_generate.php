<?php
// public/api/followup_generate.php
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
    
    $targetId = $input['targetId'] ?? '';
    $type = $input['type'] ?? 'invoice';
    $clientName = $input['clientName'] ?? 'Monsieur / Madame';
    $reference = $input['reference'] ?? 'Dossier en cours';
    $tone = $input['tone'] ?? 'Professionnel';
    $urgencyLevel = $input['urgencyLevel'] ?? 'medium';
    $company_id = intval($input['company_id'] ?? 1);

    $systemPrompt = "Tu es un spécialiste de la relation client et du recouvrement bienveillant pour MDIV Business.
Rédige un message de relance ultra efficace et adapté :
- Type de dossier : $type (facture impayée, devis en attente, client inactif, suite de réunion)
- Client : $clientName
- Référence : $reference
- Ton : $tone
- Niveau d'urgence : $urgencyLevel

Tu dois répondre UNIQUEMENT par un objet JSON valide avec ce format :
{
  \"subject\": \"Objet clair et percutant de la relance\",
  \"body\": \"Corps complet de l'email de relance, poli, argumenté, avec appel à l'action précis.\"
}";

    $userPrompt = "Génère la relance pour $clientName concernant $type ($reference) avec un ton $tone et urgence $urgencyLevel.";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!$data || !isset($data['body'])) {
            throw new Exception("Réponse IA non valide.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Erreur de réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
