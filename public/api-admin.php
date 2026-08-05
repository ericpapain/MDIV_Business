<?php
// api-admin.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';
session_start();

// Protection de l'API
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"));

// Création des tables si elles n'existent pas
$pdo->exec("CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    youtube_id VARCHAR(50),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$pdo->exec("CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    date DATETIME,
    location VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
    type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// --- Gestion des Vidéos ---
if ($action === 'add_video' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $data->title ?? 'Sans titre';
    $url = $data->url ?? '';
    
    // Extraction de l'ID YouTube
    preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $match);
    $youtube_id = $match[1] ?? '';

    if ($youtube_id) {
        $stmt = $pdo->prepare("INSERT INTO videos (title, youtube_id, category) VALUES (?, ?, 'general')");
        if ($stmt->execute([$title, $youtube_id])) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erreur BDD']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Lien YouTube invalide']);
    }
    exit();
}

if ($action === 'delete_video' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0;
    $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// --- Gestion des Événements ---
if ($action === 'add_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $data->title ?? '';
    $date = $data->date ?? '';
    $location = $data->location ?? '';
    $description = $data->description ?? '';
    $type = $data->type ?? 'Événement';
    
    $stmt = $pdo->prepare("INSERT INTO events (title, date, location, description, type) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$title, $date, $location, $description, $type])) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur BDD']);
    }
    exit();
}

if ($action === 'delete_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $data->id ?? 0;
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

// --- Statistiques ---
if ($action === 'stats' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stats = [];
    $stmt = $pdo->query("SELECT country, COUNT(*) as count FROM visites GROUP BY country ORDER BY count DESC LIMIT 10");
    $stats['countries'] = $stmt->fetchAll();
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM visites");
    $stats['total_visits'] = $stmt->fetch()['total'];

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM videos");
    $stats['total_videos'] = $stmt->fetch()['total'];

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM events WHERE date >= NOW()");
    $stats['upcoming_events'] = $stmt->fetch()['total'];

    echo json_encode(['success' => true, 'data' => $stats]);
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action inconnue']);
