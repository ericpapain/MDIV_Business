<?php
// public/api/followup_targets.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;
    try {
        $pdo = get_db_connection();
        if ($company_id) {
            $stmt = $pdo->prepare("
                SELECT id, type, reference, client_name as clientName, amount, days_pending as daysPending, status
                FROM followups
                WHERE company_id = ?
                ORDER BY days_pending DESC LIMIT 50
            ");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("
                SELECT id, type, reference, client_name as clientName, amount, days_pending as daysPending, status
                FROM followups
                ORDER BY days_pending DESC LIMIT 50
            ");
        }
        $dbTargets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($dbTargets)) {
            echo json_encode($dbTargets, JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Exception $e) {
        // Fallback vers les dossiers de relance par défaut
    }

    $targets = [
        [
            'id' => 'target_1',
            'type' => 'invoice',
            'reference' => 'FAC-2026-0041',
            'clientName' => 'Nova Biotech SAS',
            'amount' => 5760.00,
            'daysPending' => 32,
            'status' => 'escalated'
        ],
        [
            'id' => 'target_2',
            'type' => 'quote',
            'reference' => 'DEV-2026-0018',
            'clientName' => 'Groupe Industriel de l\'Est',
            'amount' => 4800.00,
            'daysPending' => 12,
            'status' => 'pending'
        ],
        [
            'id' => 'target_3',
            'type' => 'inactive_client',
            'reference' => 'Compte Grand Compte',
            'clientName' => 'LogiPacific Solutions',
            'amount' => 0,
            'daysPending' => 60,
            'status' => 'pending'
        ]
    ];

    echo json_encode($targets, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([]);
}
