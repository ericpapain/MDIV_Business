<?php
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

    $systemPrompt = "Tu es un secrétaire général et chef de cabinet de direction d'élite pour MDIV Business.
À partir des notes de réunion brutes, de transcriptions orales (pouvant comporter des imprécisions phonétiques, de la dictée vocale sans ponctuation ou du langage parlé) ou d'un résumé de réunion, génère un compte-rendu exécutif de réunion complet, professionnel et soigné.
Ton rôle est de :
1. Comprendre le contexte réel, identifier les personnes mentionnées (même phonétiquement ou informellement), les délais, les missions et les enjeux.
2. Nettoyer, reformuler et structurer ces informations en un compte-rendu exécutif de réunion professionnel de haut niveau.
3. Seul le charabia total et purement aléatoire (ex: suites de touches 'asdfghjk' sans aucun mot compréhensible) doit renvoyer :
{\"error\": \"Votre saisie semble totalement illisible. Veuillez fournir des notes contenant au minimum quelques informations compréhensibles.\"}

Tu dois répondre UNIQUEMENT par un objet JSON valide conforme à cette structure :
{
  \"id\": \"meet_" . bin2hex(random_bytes(6)) . "\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"subject\": \"Objet clair et professionnel de la réunion\",
  \"participants\": [\"Participant 1\", \"Participant 2\"],
  \"agenda\": [\"Point 1 abordé\", \"Point 2 abordé\"],
  \"executiveSummary\": \"Synthèse globale claire et valorisante des échanges...\",
  \"decisions\": [
    {\"decision\": \"Décision actée\", \"context\": \"Contexte de la décision\"}
  ],
  \"actions\": [
    {\"task\": \"Tâche concrète à accomplir\", \"assignee\": \"Responsable identifié\", \"deadline\": \"Échéance estimée\", \"status\": \"pending\"}
  ],
  \"risks\": [
    {\"risk\": \"Risque ou point d'attention identifié\", \"impact\": \"High\"}
  ]
}";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Voici les notes ou la transcription de réunion :\n\n" . mb_substr($raw_text, 0, 5000)]
    ];

    $response = callGroqApi($messages, null, false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = trim($response['choices'][0]['message']['content']);
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{[\s\S]*\}/', $content, $m)) {
            $data = json_decode($m[0], true);
        }

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
