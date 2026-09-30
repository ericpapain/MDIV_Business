<?php
// public/api/meeting_agents.php
define('SKIP_DEFAULT_HEADERS', true);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
while (ob_get_level() > 0) { ob_end_flush(); }
ob_implicit_flush(1);

require_once __DIR__ . '/groq_client.php';

function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    flush();
}

$context = $_GET['context'] ?? '';
$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;

try {
    sendSSE('agent_message', [
        'agent' => 'Secrétaire de séance IA',
        'message' => "Analyse du verbatim de la réunion, identification des intervenants et structuration de l'ordre du jour..."
    ]);
    usleep(300000);

    sendSSE('agent_message', [
        'agent' => 'Auditeur des Décisions',
        'message' => "Extraction des arbitrages formels, assignation des livrables et calcul des dates cibles..."
    ]);
    usleep(300000);

    $systemPrompt = "Tu es un consortium de directeurs d'entreprise préparant le compte-rendu officiel de réunion.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant rigoureusement ce schéma :
{
  \"id\": \"meet_" . bin2hex(random_bytes(6)) . "\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"subject\": \"Revue Stratégique & Avancement Opérationnel\",
  \"participants\": [\"Direction Générale\", \"Responsable Projet\", \"Équipe Technique\"],
  \"agenda\": [\"Validation des jalons\", \"Revue budgétaire\", \"Plan de déploiement IA\"],
  \"executiveSummary\": \"Synthèse des arbitrages et priorités définies en séance...\",
  \"decisions\": [
    {\"decision\": \"Validation du calendrier de déploiement au Q4\", \"context\": \"Alignement des ressources approuvé\"}
  ],
  \"actions\": [
    {\"task\": \"Finaliser le cahier des charges technique\", \"assignee\": \"Lead Dev\", \"deadline\": \"" . date('d/m/Y', strtotime('+7 days')) . "\", \"status\": \"pending\"},
    {\"task\": \"Envoyer l'avenant contractuel\", \"assignee\": \"Direction Financière\", \"deadline\": \"" . date('d/m/Y', strtotime('+5 days')) . "\", \"status\": \"pending\"}
  ],
  \"risks\": [
    {\"risk\": \"Délai d'approvisionnement des licences logicielles\", \"impact\": \"Medium\"}
  ]
}";

    $userPrompt = "Contenu ou sujet de la réunion :\n\n" . ($context ?: "Réunion de coordination générale.");

    sendSSE('agent_message', [
        'agent' => 'Directeur des Opérations',
        'message' => "Consolidation finale de la matrice des responsabilités (RACI) et clôture du compte-rendu..."
    ]);

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

        if (!$data) {
            throw new Exception("Erreur de parsing du compte-rendu.");
        }

        sendSSE('complete', $data);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}
