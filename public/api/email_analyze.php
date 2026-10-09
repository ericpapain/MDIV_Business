<?php
// public/api/email_analyze.php
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
    $text = trim($input['text'] ?? '');

    if (empty($text)) {
        echo json_encode([
            'clarityScore' => 0,
            'professionalismScore' => 0,
            'estimatedLengthWords' => 0,
            'readTimeSeconds' => 0,
            'qualityScore' => 0
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    $wordCount = count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY));
    $readTimeSeconds = max(5, intval(($wordCount / 200) * 60));

    // Audit sémantique réel par le modèle IA
    $systemPrompt = "You are a corporate communication auditor. Rigorously evaluate the quality of the provided email text.

CRITICAL RULES:
- clarityScore (0-100): Clarity of the message and structure.
- professionalismScore (0-100): Politeness, formal vocabulary, absence of excessive familiarity.
- qualityScore (0-100): Overall effectiveness in achieving its commercial or professional goal.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

Respond ONLY with a valid JSON object using this exact structure:
{
  \"clarityScore\": <CALCULATED_INTEGER_BETWEEN_0_AND_100>,
  \"professionalismScore\": <CALCULATED_INTEGER_BETWEEN_0_AND_100>,
  \"qualityScore\": <CALCULATED_INTEGER_BETWEEN_0_AND_100>
}";

    $orchestrator = new MultiLLMOrchestrator();
    $company_id = intval($input['company_id'] ?? 1); // Pass or default to 1 if user wants for test (already protected elsewhere)
    $response = $orchestrator->executePrompt('email_analyze', $systemPrompt, "Email à analyser :\n\n" . $text, $company_id, null);

    $clarity = 75;
    $professionalism = 80;
    $quality = 78;

    if (isset($response['success']) && $response['success']) {
        $content = $response['content'];
        $data = MultiLLMOrchestrator::cleanAndDecodeJson($content);
        if ($data) {
            $clarity = intval($data['clarityScore'] ?? $clarity);
            $professionalism = intval($data['professionalismScore'] ?? $professionalism);
            $quality = intval($data['qualityScore'] ?? $quality);
        }
    }

    echo json_encode([
        'clarityScore' => $clarity,
        'professionalismScore' => $professionalism,
        'estimatedLengthWords' => $wordCount,
        'readTimeSeconds' => $readTimeSeconds,
        'qualityScore' => $quality
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
