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
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $typeFilter = $type ? " AND type = " . $pdo->quote($type) : "";
    
    // upcoming
    $stmtUp = $pdo->query("SELECT * FROM events WHERE date >= NOW() $typeFilter ORDER BY date ASC");
    $upcoming = $stmtUp->fetchAll();
    
    // past
    $stmtPast = $pdo->query("SELECT * FROM events WHERE date < NOW() $typeFilter ORDER BY date DESC");
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

if ($action === 'members') {
    $stmt = $pdo->query("SELECT * FROM members ORDER BY created_at ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'partners') {
    $stmt = $pdo->query("SELECT * FROM partners ORDER BY created_at ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'reviews') {
    $stmt = $pdo->query("SELECT id, nom as name, role, commentaire as quote, pays as country, note as rating, evenement as event FROM avis ORDER BY date_creation DESC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'ambassadors') {
    $stmt = $pdo->query("SELECT * FROM ambassadors ORDER BY country ASC");
    echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
    exit();
}

if ($action === 'submit_application' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400); echo json_encode(['success' => false, 'error' => 'Données invalides']); exit();
    }
    
    $type = $data['type'] ?? 'unknown';
    $formData = json_encode($data['data'] ?? []);
    
    $stmt = $pdo->prepare("INSERT INTO applications (type, data) VALUES (?, ?)");
    if ($stmt->execute([$type, $formData])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500); echo json_encode(['success' => false, 'error' => 'Erreur BDD']);
    }
    exit();
}

if ($action === 'site_stats') {
    $stmt = $pdo->query("SELECT * FROM site_stats WHERE id = 1");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $stats]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
