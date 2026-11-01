<?php
// public/api/appointment_settings.php
// Configuration des disponibilités et paramètres de prise de rendez-vous en ligne
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
    $settings = $db['appointment_settings'] ?? [];
    echo json_encode(['success' => true, 'settings' => $settings], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $fields = json_decode($raw, true) ?: $_POST;

    $current = $db['appointment_settings'] ?? [];
    $updated = array_merge($current, $fields, ['updated_at' => date('c')]);
    $db['appointment_settings'] = $updated;

    file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'settings' => $updated], JSON_UNESCAPED_UNICODE);
    exit;
}
