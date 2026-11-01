<?php
// public/api/team.php
// Gestion des collaborateurs et membres d'équipe de l'entreprise
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
    if ($useMysql) {
        $stmt = $pdo->prepare("SELECT id, company_id, first_name, last_name, email, role, job_title, status, created_at FROM users WHERE company_id = ? ORDER BY id ASC");
        $stmt->execute([$companyId]);
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'company_id' => $companyId, 'members' => $members]);
    } else {
        $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
        $all = $db['team_members'] ?? [];
        $members = array_values(array_filter($all, fn($m) => (int)($m['company_id'] ?? 1) === $companyId));
        echo json_encode(['success' => true, 'company_id' => $companyId, 'members' => $members]);
    }
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $targetCompanyId = intval($data['company_id'] ?? $companyId);
    $firstName = trim($data['first_name'] ?? ($data['firstName'] ?? 'Collaborateur'));
    $lastName = trim($data['last_name'] ?? ($data['lastName'] ?? ''));
    $email = trim($data['email'] ?? '');
    $role = trim($data['role'] ?? 'USER');
    $jobTitle = trim($data['job_title'] ?? ($data['jobTitle'] ?? 'Collaborateur'));
    $permissions = $data['permissions'] ?? ['invoices', 'quotes'];

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Adresse email valide requise']);
        exit;
    }

    $id = !empty($data['id']) ? $data['id'] : 'user_' . time() . '_' . rand(100, 999);

    if ($useMysql) {
        $pwd = password_hash('PassTemp2026!', PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO users (company_id, first_name, last_name, email, password_hash, role, job_title, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), role = VALUES(role), job_title = VALUES(job_title)
        ");
        $stmt->execute([$targetCompanyId, $firstName, $lastName, $email, $pwd, $role, $jobTitle]);
        $member = ['id' => $id, 'company_id' => $targetCompanyId, 'first_name' => $firstName, 'last_name' => $lastName, 'email' => $email, 'role' => $role, 'job_title' => $jobTitle];
    } else {
        $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
        if (!isset($db['team_members'])) $db['team_members'] = [];
        $member = [
            'id' => $id,
            'company_id' => $targetCompanyId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'role' => $role,
            'job_title' => $jobTitle,
            'permissions' => $permissions,
            'status' => 'active',
            'created_at' => date('c')
        ];
        $existing = false;
        foreach ($db['team_members'] as $idx => $m) {
            if ($m['id'] === $id || $m['email'] === $email) {
                $db['team_members'][$idx] = array_merge($m, $member);
                $existing = true;
                break;
            }
        }
        if (!$existing) $db['team_members'][] = $member;
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    echo json_encode(['success' => true, 'member' => $member]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($useMysql && $id) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
    } else if ($id && file_exists($dbPath)) {
        $db = json_decode(file_get_contents($dbPath), true);
        $db['team_members'] = array_values(array_filter($db['team_members'] ?? [], fn($m) => (string)$m['id'] !== (string)$id));
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true, 'message' => 'Membre supprimé']);
    exit;
}
