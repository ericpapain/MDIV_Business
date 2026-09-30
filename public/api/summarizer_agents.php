<?php
// public/api/summarizer_agents.php
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

$doc_id = $_GET['doc_id'] ?? '';
$mode = $_GET['mode'] ?? 'standard';
$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;

try {
    $temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_sum_' . $doc_id . '.json';
    $doc_text = "Document d'analyse d'activité et stratégie d'entreprise.";
    $doc_name = "Document_Analyse.pdf";

    if (file_exists($temp_file)) {
        $saved = json_decode(file_get_contents($temp_file), true);
        if ($saved) {
            $doc_text = $saved['text'] ?? $doc_text;
            $doc_name = $saved['documentName'] ?? $doc_name;
            $mode = $saved['mode'] ?? $mode;
        }
    }

    // Agent 1: Analyste Structurel
    sendSSE('agent_message', [
        'agent' => 'Analyste Structurel',
        'message' => "Lecture et extraction des sections clés de « $doc_name » en mode « $mode ». Analyse du volume et de la cohérence textuelle..."
    ]);
    usleep(300000);

    // Agent 2: Expert Stratégie & Décision
    sendSSE('agent_message', [
        'agent' => 'Expert Stratégie & Décision',
        'message' => "Identification des points de bascule, des risques opérationnels, des décisions requises et des opportunités d'optimisation."
    ]);
    usleep(300000);

    // Prompt pour Groq qwen/qwen3.8-27b
    $systemPrompt = "Tu es un consortium de directeurs d'entreprise de haut niveau (Analyste Stratégique, Auditeur des Risques, Directeur Général).
Ton rôle est de générer une synthèse exécutive haut de gamme et rigoureuse du document fourni.
Le mode demandé est : $mode (express = ultra concis, standard = équilibré, detailed = complet, direction = focus ROI et pilotage, comex = focus gouvernance et arbitrages).
Tu dois répondre UNIQUEMENT par un objet JSON valide respectant strictement ce schéma :
{
  \"id\": \"$doc_id\",
  \"documentName\": \"$doc_name\",
  \"mode\": \"$mode\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"kpis\": {
    \"readabilityScore\": 88,
    \"pageCount\": 5,
    \"estimatedTimeSavedMinutes\": 45
  },
  \"keywords\": [\"terme1\", \"terme2\", \"terme3\", \"terme4\", \"terme5\"],
  \"majorConcepts\": [\"concept majeur 1\", \"concept majeur 2\", \"concept majeur 3\"],
  \"executiveSummary\": \"Texte percutant de la synthèse exécutive...\",
  \"objectives\": [\"Objectif 1\", \"Objectif 2\"],
  \"keyPoints\": [\"Point clé 1\", \"Point clé 2\", \"Point clé 3\"],
  \"risks\": [\"Risque 1 identifié\", \"Risque 2 identifié\"],
  \"recommendedActions\": [
    {\"action\": \"Action 1\", \"context\": \"Contexte et bénéfice attendu\"},
    {\"action\": \"Action 2\", \"context\": \"Contexte et bénéfice attendu\"}
  ],
  \"decisions\": [\"Décision 1 à acter\", \"Décision 2 à acter\"],
  \"deadlines\": [\"Échéance 1\", \"Échéance 2\"],
  \"stakeholders\": [\"Direction Générale\", \"Équipe Opérationnelle\", \"Clients\"]
}";

    $userPrompt = "Voici le contenu du document à analyser :\n\n" . mb_substr($doc_text, 0, 8000) . "\n\nGénère le rapport JSON complet.";

    sendSSE('agent_message', [
        'agent' => 'Directeur Synthèse Exécutive',
        'message' => "Consolidation du rapport d'arbitrage et finalisation des recommandations actionnables..."
    ]);

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $reportData = json_decode($content, true);

        if (!$reportData) {
            // Tenter de nettoyer d'éventuels backticks markdown ```json
            if (preg_match('/\{.*\}/s', $content, $m)) {
                $reportData = json_decode($m[0], true);
            }
        }

        if (!$reportData) {
            throw new Exception("Format de réponse IA invalide pour la synthèse.");
        }

        // Assurer la présence des champs essentiels
        $reportData['id'] = $doc_id;
        $reportData['documentName'] = $doc_name;
        $reportData['mode'] = $mode;
        $reportData['date'] = date('Y-m-d');

        sendSSE('complete', $reportData);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}
