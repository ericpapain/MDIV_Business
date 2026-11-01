<?php
// public/api/calendar.php
// Gestion du calendrier, des réunions et des rappels programmés
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();
$dbPath = __DIR__ . '/../../dev_db.json';
$useMysql = isset($pdo) && $pdo instanceof PDO;
$method = $_SERVER['REQUEST_METHOD'];
$companyId = intval($_GET['company_id'] ?? 1);

if ($method === 'GET') {
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
    $all = $db['calendar_events'] ?? [];
    $events = array_values(array_filter($all, fn($e) => (int)($e['company_id'] ?? 1) === $companyId));
    echo json_encode(['success' => true, 'events' => $events]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $targetCompanyId = intval($data['company_id'] ?? $companyId);
    $id = !empty($data['id']) ? $data['id'] : 'event_' . time() . '_' . rand(100, 999);

    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
    if (!isset($db['calendar_events'])) $db['calendar_events'] = [];

    $event = [
        'id' => $id,
        'company_id' => $targetCompanyId,
        'user_id' => $data['user_id'] ?? 'admin',
        'client_id' => $data['client_id'] ?? null,
        'client_name' => $data['client_name'] ?? '',
        'project_id' => $data['project_id'] ?? null,
        'project_title' => $data['project_title'] ?? '',
        'title' => $data['title'] ?? 'Rappel',
        'description' => $data['description'] ?? '',
        'event_type' => $data['event_type'] ?? 'reminder',
        'event_date' => $data['event_date'] ?? date('Y-m-d'),
        'start_time' => $data['start_time'] ?? '09:00',
        'end_time' => $data['end_time'] ?? '10:00',
        'reminder_time' => $data['reminder_time'] ?? '08:00',
        'send_sms' => !empty($data['send_sms']),
        'send_email' => $data['send_email'] !== false,
        'ai_draft_message' => $data['ai_draft_message'] ?? '',
        'status' => $data['status'] ?? 'scheduled',
        'created_at' => date('c')
    ];

    $existing = false;
    foreach ($db['calendar_events'] as $idx => $e) {
        if ($e['id'] === $id) {
            $db['calendar_events'][$idx] = array_merge($e, $event);
            $existing = true;
            break;
        }
    }
    if (!$existing) $db['calendar_events'][] = $event;
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['success' => true, 'event' => $event]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id && file_exists($dbPath)) {
        $db = json_decode(file_get_contents($dbPath), true);
        $db['calendar_events'] = array_values(array_filter($db['calendar_events'] ?? [], fn($e) => (string)$e['id'] !== (string)$id));
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true, 'message' => 'Événement supprimé']);
    exit;
}
