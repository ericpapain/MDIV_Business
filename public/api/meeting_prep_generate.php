<?php
// public/api/meeting_prep_generate.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/multi_llm_orchestrator.php';

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
    $company_id = intval($input['company_id'] ?? 0);
    if (!$company_id) {
        throw new Exception("Authentification requise pour préparer une réunion.");
    }

    $systemPrompt = "You are a strategic negotiation coach and pre-sales director for MDIV Business.
Write a comprehensive and immediately actionable pre-meeting briefing for the sales rep or executive.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON object strictly following this structure:
{
  \"oneLinerSummary\": \"<GENERATED_ONE_LINER_SUMMARY_FRENCH>\",
  \"clientSummary\": \"<GENERATED_CLIENT_SUMMARY_FRENCH>\",
  \"opportunities\": [\"<OPPORTUNITY_1>\", \"<OPPORTUNITY_2>\"],
  \"risks\": [\"<RISK_1>\", \"<RISK_2>\"],
  \"probableObjections\": [\"<OBJECTION_AND_RESPONSE_FRENCH>\"],
  \"recommendedQuestions\": [\"<RECOMMENDED_QUESTION_FRENCH_1>\", \"<RECOMMENDED_QUESTION_FRENCH_2>\"],
  \"discoveryStrategy\": \"<GENERATED_DISCOVERY_STRATEGY_FRENCH>\",
  \"meetingObjectives\": [\"<MINIMUM_OBJECTIVE_FRENCH>\", \"<IDEAL_OBJECTIVE_FRENCH>\"],
  \"recommendedActions\": [\"<IMMEDIATE_RECOMMENDED_ACTION_FRENCH>\"]
}";

    $userPrompt = "Client : $clientName\nDate du RDV : $meetingDate\nObjectif visé : $meetingObjective\nContexte / Notes : " . ($meetingContext ?: 'Premier rendez-vous de négociation.');

    $orchestrator = new MultiLLMOrchestrator();
    $response = $orchestrator->executePrompt('meeting_prep', $systemPrompt, $userPrompt, $company_id, null);

    if (isset($response['success']) && $response['success']) {
        $content = $response['content'];
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
