<?php
// public/api/email_analyze.php
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
    $systemPrompt = "Tu es un auditeur de communication d'entreprise. Évalue rigoureusement la qualité du texte d'email fourni.
Critères :
- clarityScore (0-100) : Clarté du propos et structure.
- professionalismScore (0-100) : Politesse, vocabulaire soutenu, absence de familiarité excessive.
- qualityScore (0-100) : Efficacité globale pour atteindre son objectif commercial ou professionnel.
Réponds UNIQUEMENT par un objet JSON valide avec ce format :
{
  \"clarityScore\": 85,
  \"professionalismScore\": 90,
  \"qualityScore\": 88
}";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Email à analyser :\n\n" . $text]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    $clarity = 75;
    $professionalism = 80;
    $quality = 78;

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);
        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }
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
