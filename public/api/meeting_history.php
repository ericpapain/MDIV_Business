<?php
// public/api/meeting_history.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$client_id = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;

if ($client_id > 0) {
    // ClientHistory pour meetingPrepService.ts
    echo json_encode([
        'clientId' => $client_id,
        'clientName' => 'Groupe Industriel de l\'Est',
        'sector' => 'Industrie & Énergie',
        'lastContact' => date('d/m/Y', strtotime('-10 days')),
        'openQuotes' => 2,
        'unpaidInvoices' => 1,
        'totalRevenue' => 34200,
        'notes' => 'Client très attentif au respect des délais et à la rentabilité immédiate des outils IA.',
        'interactions' => [
            ['date' => date('d/m/Y', strtotime('-10 days')), 'type' => 'Appel', 'summary' => 'Échange sur le périmètre du projet d\'automatisation'],
            ['date' => date('d/m/Y', strtotime('-25 days')), 'type' => 'Réunion', 'summary' => 'Présentation de la solution MDIV Business']
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Liste de réunions passées pour meetingReportService.ts
echo json_encode([
    [
        'id' => 'meet_1',
        'date' => date('d/m/Y'),
        'subject' => 'Comité de pilotage Transformation IA',
        'participants' => ['Direction Générale', 'Directeur Technique', 'MDIV Business'],
        'agenda' => ['Bilan des flux automatisés', 'Validation du planning Q4'],
        'executiveSummary' => 'Réunion constructive ayant permis de valider les 3 priorités stratégiques du trimestre.',
        'decisions' => [
            ['decision' => 'Lancement de la phase pilote sur le site de Strasbourg', 'context' => 'Budget approuvé']
        ],
        'actions' => [
            ['task' => 'Déploiement des connecteurs API', 'assignee' => 'Tech Lead', 'deadline' => date('d/m/Y', strtotime('+7 days')), 'status' => 'pending']
        ],
        'risks' => [
            ['risk' => 'Disponibilité des référents métiers', 'impact' => 'Medium']
        ]
    ]
], JSON_UNESCAPED_UNICODE);
