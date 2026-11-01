<?php
// public/api/roles.php
// Gestion des rôles personnalisés et permissions par fonctionnalité
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$dbPath = __DIR__ . '/../../dev_db.json';
$method = $_SERVER['REQUEST_METHOD'];
$companyId = intval($_GET['company_id'] ?? 1);

$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
if (!isset($db['company_roles'])) {
    $db['company_roles'] = [
        ['id' => 'role_admin', 'company_id' => $companyId, 'name' => 'Administrateur', 'description' => 'Accès total à tous les services', 'permissions' => ['all']],
        ['id' => 'role_rh', 'company_id' => $companyId, 'name' => 'Ressources Humaines', 'description' => 'Factures et notes de frais', 'permissions' => ['invoices', 'expenses']],
        ['id' => 'role_sav', 'company_id' => $companyId, 'name' => 'Support & SAV', 'description' => 'Messagerie et calendrier', 'permissions' => ['emails', 'calendar']],
        ['id' => 'role_com', 'company_id' => $companyId, 'name' => 'Commercial', 'description' => 'Devis, clients et prospection', 'permissions' => ['quotes', 'clients', 'leads', 'calendar']]
    ];
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($method === 'GET') {
    $roles = array_values(array_filter($db['company_roles'], fn($r) => (int)($r['company_id'] ?? 0) === $companyId || (int)($r['company_id'] ?? 0) === 0));
    echo json_encode(['success' => true, 'roles' => $roles]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $id = !empty($data['id']) ? $data['id'] : 'role_' . time() . '_' . rand(100, 999);

    $role = [
        'id' => $id,
        'company_id' => intval($data['company_id'] ?? $companyId),
        'name' => trim($data['name'] ?? 'Nouveau Rôle'),
        'description' => trim($data['description'] ?? ''),
        'permissions' => is_array($data['permissions'] ?? null) ? $data['permissions'] : ['invoices', 'quotes'],
        'created_at' => date('c')
    ];

    $existing = false;
    foreach ($db['company_roles'] as $idx => $r) {
        if ($r['id'] === $id) {
            $db['company_roles'][$idx] = array_merge($r, $role);
            $existing = true;
            break;
        }
    }
    if (!$existing) $db['company_roles'][] = $role;

    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'role' => $role]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        $db['company_roles'] = array_values(array_filter($db['company_roles'] ?? [], fn($r) => (string)$r['id'] !== (string)$id));
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true, 'message' => 'Rôle supprimé']);
    exit;
}
