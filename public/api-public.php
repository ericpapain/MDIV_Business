<?php
// api-public.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'videos') {
    $stmt = $pdo->query("SELECT id, title, youtube_id as youtubeId, category FROM videos ORDER BY created_at DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'events') {
    // upcoming
    $stmtUp = $pdo->query("SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC");
    $upcoming = $stmtUp->fetchAll();
    
    // past
    $stmtPast = $pdo->query("SELECT * FROM events WHERE date < NOW() ORDER BY date DESC");
    $past = $stmtPast->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'upcoming' => $upcoming,
            'past' => $past
        ]
    ]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
