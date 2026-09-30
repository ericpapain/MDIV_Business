<?php
// public/api/meeting_upload.php
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
    $raw_text = $_POST['raw_text'] ?? '';
    $company_id = intval($_POST['company_id'] ?? 1);

    if (isset($_FILES['media_file']) && $_FILES['media_file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['media_file'];
        $filename = $file['name'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (empty($raw_text)) {
            if (in_array($ext, ['txt', 'md', 'log'])) {
                $raw_text = file_get_contents($file['tmp_name']);
            } else {
                $raw_text = "Fichier audio / vidéo / note de réunion reçu : $filename. Analyse des échanges et synthèses des décisions et tâches.";
            }
        }
    }

    if (empty($raw_text)) {
        $raw_text = "Réunion de coordination stratégique d'entreprise : cadrage des priorités, validation des budgets, répartition des tâches opérationnelles.";
    }

    $systemPrompt = "Tu es un secrétaire général et chef de cabinet de direction pour MDIV Business.
À partir des notes, de la transcription ou du résumé de réunion, génère un compte-rendu exécutif de réunion complet.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  \"id\": \"meet_" . bin2hex(random_bytes(6)) . "\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"subject\": \"Objet de la réunion\",
  \"participants\": [\"Participant 1\", \"Participant 2\"],
  \"agenda\": [\"Point 1 abordé\", \"Point 2 abordé\"],
  \"executiveSummary\": \"Synthèse globale des échanges...\",
  \"decisions\": [
    {\"decision\": \"Décision 1 actée\", \"context\": \"Contexte de la décision\"}
  ],
  \"actions\": [
    {\"task\": \"Tâche à accomplir\", \"assignee\": \"Responsable\", \"deadline\": \"Échéance\", \"status\": \"pending\"}
  ],
  \"risks\": [
    {\"risk\": \"Risque ou point de blocage\", \"impact\": \"High\"} // Low | Medium | High
  ]
}";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Voici les notes de réunion :\n\n" . mb_substr($raw_text, 0, 5000)]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!$data || !isset($data['subject'])) {
            throw new Exception("Format de compte-rendu invalide.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
