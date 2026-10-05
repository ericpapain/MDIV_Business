<?php
// public/api/integrations/status.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : 1;
$useMysql = isset($pdo) && $pdo instanceof PDO;

if ($useMysql) {
    $stmt = $pdo->prepare("SELECT * FROM company_integrations WHERE company_id = :cid");
    $stmt->execute([':cid' => $companyId]);
    $integrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $dbPath = __DIR__ . '/../../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['integrations' => []];
    $integrations = array_filter($db['integrations'] ?? [], fn($i) => ($i['company_id'] ?? 1) === $companyId);
    $integrations = array_values($integrations);
}

$google = null;
$microsoft = null;

foreach ($integrations as $item) {
    if (($item['provider'] ?? '') === 'google') $google = $item;
    if (($item['provider'] ?? '') === 'microsoft') $microsoft = $item;
}

echo json_encode([
    'success' => true,
    'company_id' => $companyId,
    'google' => [
        'connected' => !empty($google),
        'email' => $google['account_email'] ?? null,
        'last_sync' => $google['last_sync'] ?? null
    ],
    'microsoft' => [
        'connected' => !empty($microsoft),
        'email' => $microsoft['account_email'] ?? null,
        'last_sync' => $microsoft['last_sync'] ?? null
    ],
    'integrations' => $integrations
]);
