<?php
// public/api/booking_links.php
// Liens de réservation personnalisés (Génération en < 1 min, token unique)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();
$devDbPath = __DIR__ . '/../../dev_db.json';
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Récupération par token (pour le client) ou par company_id (pour le pro)
if ($method === 'GET') {
    $token = $_GET['token'] ?? null;
    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];

    if (!$token) {
        $companyIdParam = $_GET['company_id'] ?? null;
        $list = $db['booking_links'] ?? [];
        if ($companyIdParam) {
            $cId = intval($companyIdParam);
            $list = array_values(array_filter($list, fn($l) => intval($l['company_id'] ?? 4) === $cId));
        }
        echo json_encode($list, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $allLinks = $db['booking_links'] ?? [];
    $link = null;
    foreach ($allLinks as $l) {
        if (($l['token'] ?? '') === $token) {
            $link = $l;
            break;
        }
    }

    if (!$link) {
        http_response_code(404);
        echo json_encode(['error' => 'Lien de réservation introuvable ou expiré.']);
        exit;
    }

    // Enrichir avec infos entreprise
    $company = [
        'id' => $link['company_id'] ?? 4,
        'name' => 'MDIV Consulting',
        'email' => 'contact@mdiv-consulting.fr',
        'phone' => '01 80 90 20 26',
        'city' => 'Paris',
        'logo_url' => ''
    ];

    if (!empty($db['companies'])) {
        foreach ($db['companies'] as $c) {
            if (intval($c['id'] ?? 0) === intval($link['company_id'] ?? 4)) {
                $company = [
                    'id' => $c['id'],
                    'name' => $c['company_name'] ?? ($c['name'] ?? 'MDIV Business'),
                    'email' => $c['email'] ?? 'contact@mdiv-business.fr',
                    'phone' => $c['phone'] ?? '01 80 90 20 26',
                    'city' => $c['city'] ?? 'Paris',
                    'logo_url' => $c['logo_url'] ?? ($c['logo'] ?? '')
                ];
                break;
            }
        }
    }

    echo json_encode([
        'success' => true,
        'link' => $link,
        'company' => $company,
        'settings' => $db['appointment_settings'] ?? []
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. POST: Création d'un lien d'invitation personnalisé
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $fields = json_decode($raw, true) ?: $_POST;

    $companyId = intval($fields['company_id'] ?? 4);
    $token = 'rdv-' . substr(bin2hex(random_bytes(6)), 0, 10);

    $newLink = [
        'id' => 'link-' . time() . '-' . rand(100, 999),
        'token' => $token,
        'company_id' => $companyId,
        'client_id' => $fields['client_id'] ?? null,
        'client_name' => trim($fields['client_name'] ?? ''),
        'client_phone' => trim($fields['client_phone'] ?? ''),
        'client_email' => trim($fields['client_email'] ?? ''),
        'duration_minutes' => intval($fields['duration_minutes'] ?? 30),
        'appointment_type' => $fields['appointment_type'] ?? 'standard',
        'title' => trim($fields['title'] ?? 'Rendez-vous'),
        'notes' => trim($fields['notes'] ?? ''),
        'status' => 'active',
        'created_at' => date('c')
    ];

    $db = file_exists($devDbPath) ? json_decode(file_get_contents($devDbPath), true) : [];
    if (!isset($db['booking_links'])) $db['booking_links'] = [];
    array_unshift($db['booking_links'], $newLink);

    file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'link' => $newLink], JSON_UNESCAPED_UNICODE);
    exit;
}
