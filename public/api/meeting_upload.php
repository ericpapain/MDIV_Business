<?php
require_once __DIR__ . '/multi_llm_orchestrator.php';
// public/api/meeting_upload.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/document_parser.php';
require_once __DIR__ . '/groq_client.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $raw_text = $_POST['raw_text'] ?? '';
    $company_id = intval($_POST['company_id'] ?? 1);

    if (isset($_FILES['media_file']) && $_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['media_file'];
        $filename = $file['name'];
        $file_path = $file['tmp_name'];

        $parsed = parseUploadedFileContent($file_path, $filename, $raw_text);
        if (!empty($parsed)) {
            $raw_text = $parsed;
        }
    }

    $raw_text = trim($raw_text);
    if (empty($raw_text)) {
        throw new Exception("Aucun texte ou fichier de réunion fourni.");
    }

    // FILTRE ANTI-GRIBOUILLAGE
    $isGibberish = strlen($raw_text) < 10
        || preg_match('/^(.)\1{4,}/i', $raw_text)
        || (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!?\'-]{12,}$/i', $raw_text) && !preg_match('/[aeiouy]/i', $raw_text));

    if ($isGibberish) {
        http_response_code(400);
        echo json_encode([
            'error' => "Votre saisie semble incomplète ou incompréhensible. Pour synthétiser une réunion et générer un compte-rendu décisionnel, veuillez fournir des notes de réunion contenant au minimum les sujets abordés, les participants ou les décisions prises."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $systemPrompt = "You are an elite secretary general and executive chief of staff for MDIV Business.
From raw meeting notes, oral transcriptions (which may contain phonetic inaccuracies, unpunctuated voice dictation, or spoken language), or a meeting summary, generate a complete, professional, and polished executive meeting report.
Your role is to:
1. Understand the real context, identify mentioned persons (even phonetically or informally), deadlines, missions, and stakes.
2. Clean, rephrase, and structure this information into a high-level professional executive meeting report.
3. If the input text is completely irrelevant to a meeting (e.g. an official administrative document like a criminal record, completely random gibberish, etc.), you must reject it by returning exactly:
{\"error\": \"Le document fourni ne semble pas être un compte-rendu ou des notes de réunion (ex: document administratif hors contexte). L'IA n'a pas pu identifier le sujet de la réunion. Veuillez importer un fichier pertinent.\"}

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.
YOU MUST ESCAPE ALL DOUBLE QUOTES INSIDE THE JSON STRINGS. DO NOT USE DOUBLE QUOTES INSIDE TEXT WITHOUT ESCAPING THEM LIKE \".
DO NOT WRAP YOUR RESPONSE IN MARKDOWN BLOCKS. START DIRECTLY WITH { AND END WITH }.

You must respond ONLY with a valid JSON object conforming to this structure:
{
  \"id\": \"meet_" . bin2hex(random_bytes(6)) . "\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"subject\": \"<GENERATED_SUBJECT_STRING_FRENCH>\",
  \"participants\": [\"<PARTICIPANT_1>\", \"<PARTICIPANT_2>\"],
  \"agenda\": [\"<AGENDA_POINT_FRENCH_1>\", \"<AGENDA_POINT_FRENCH_2>\"],
  \"executiveSummary\": \"<GENERATED_EXECUTIVE_SUMMARY_STRING_FRENCH>\",
  \"decisions\": [
    {\"decision\": \"<DECISION_FRENCH_1>\", \"context\": \"<CONTEXT_FRENCH_1>\"}
  ],
  \"actions\": [
    {\"task\": \"<TASK_FRENCH_1>\", \"assignee\": \"<ASSIGNEE_1>\", \"deadline\": \"<ESTIMATED_DEADLINE_1>\", \"status\": \"pending\"}
  ],
  \"risks\": [
    {\"risk\": \"<RISK_FRENCH_1>\", \"impact\": \"<IMPACT_LEVEL>\"}
  ]
}";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Voici les notes ou la transcription de réunion :\n\n" . mb_substr($raw_text, 0, 5000)]
    ];

    $response = callGroqApi($messages, null, false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = trim($response['choices'][0]['message']['content']);
        $data = MultiLLMOrchestrator::cleanAndDecodeJson($content);

        if (is_array($data) && isset($data['error'])) {
            http_response_code(400);
            echo json_encode(['error' => $data['error']], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$data || !is_array($data)) {
            throw new Exception("Impossible de structurer le compte-rendu de réunion.");
        }

        // Normalisation et sécurisation absolue des champs attendus par le frontend
        $report_id = $data['id'] ?? ('meet_' . bin2hex(random_bytes(6)));
        $report['id'] = $report_id;

        // Persistance pour la délibération multi-agents en streaming SSE
        $temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_meet_' . $report_id . '.json';
        $local_temp_dir = __DIR__ . '/temp';
        if (!is_dir($local_temp_dir)) {
            @mkdir($local_temp_dir, 0777, true);
        }
        $local_temp_file = $local_temp_dir . '/mdiv_meet_' . $report_id . '.json';
        $data_to_store = [
            'id' => $report_id,
            'raw_text' => $raw_text,
            'report' => $report,
            'created_at' => date('Y-m-d H:i:s')
        ];
        @file_put_contents($temp_file, json_encode($data_to_store, JSON_UNESCAPED_UNICODE));
        @file_put_contents($local_temp_file, json_encode($data_to_store, JSON_UNESCAPED_UNICODE));

        echo json_encode($report, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
