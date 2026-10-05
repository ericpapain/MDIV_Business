<?php
// public/api/meeting_prep_generate.php
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
    
    $clientName = $input['clientName'] ?? 'Client MDIV';
    $meetingDate = $input['meetingDate'] ?? date('d/m/Y');
    $meetingContext = $input['meetingContext'] ?? '';
    $meetingObjective = $input['meetingObjective'] ?? 'Concrétiser le contrat de prestations';
    $company_id = intval($input['company_id'] ?? 1);

    $systemPrompt = "Tu es un coach en négociation stratégique et directeur d'avant-vente pour MDIV Business.
Rédige un briefing d'avant-RDV complet et immédiatement exploitable par le commercial ou dirigeant.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  \"oneLinerSummary\": \"Synthèse en une phrase de l'enjeu capital de ce rendez-vous.\",
  \"clientSummary\": \"Résumé concis de la situation du client et de ses attentes prioritaires.\",
  \"opportunities\": [\"Opportunité 1\", \"Opportunité 2\"],
  \"risks\": [\"Risque 1 à anticiper\", \"Risque 2\"],
  \"probableObjections\": [\"Objection prévisible (ex: coût, délais, sécurité) et comment y répondre.\"],
  \"recommendedQuestions\": [\"Question ouverte percutante 1\", \"Question 2\"],
  \"discoveryStrategy\": \"Conseil tactique d'écoute active et de posture commerciale...\",
  \"meetingObjectives\": [\"Objectif minimum : ...\", \"Objectif idéal : ...\"],
  \"recommendedActions\": [\"Action immédiate à engager à la fin du RDV\"]
}";

    $userPrompt = "Client : $clientName\nDate du RDV : $meetingDate\nObjectif visé : $meetingObjective\nContexte / Notes : " . ($meetingContext ?: 'Premier rendez-vous de négociation.');

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

        if (!$data || !isset($data['oneLinerSummary'])) {
            throw new Exception("Réponse IA non valide pour le briefing.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
