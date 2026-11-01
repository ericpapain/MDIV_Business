<?php
// public/api/appointment_notifications.php
// Alertes et notifications de réservation en temps réel
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$devDbPath = __DIR__ . '/../../dev_db.json';
$method = $_SERVER['REQUEST_METHOD'];

$db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];

if ($method === 'GET') {
    $companyId = isset($_GET['company_id']) ? intval($_GET['company_id']) : 4;
    $all = $db['appointment_notifications'] ?? [];
    $filtered = array_values(array_filter($all, fn($n) => empty($n['company_id']) || intval($n['company_id']) === $companyId));
    echo json_encode($filtered, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $fields = json_decode($raw, true) ?: $_POST;
    $action = $fields['action'] ?? '';

    if ($action === 'mark_read') {
        if (!empty($db['appointment_notifications'])) {
            foreach ($db['appointment_notifications'] as &$n) {
                $n['read'] = true;
            }
            unset($n);
            file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'clear') {
        $db['appointment_notifications'] = [];
        file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}
