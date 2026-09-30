<?php
// public/api/integrations/disconnect.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$companyId = (int)($data['company_id'] ?? 1);
$provider = $data['provider'] ?? '';

$useMysql = isset($pdo) && $pdo instanceof PDO;

if ($useMysql) {
    $stmt = $pdo->prepare("DELETE FROM company_integrations WHERE company_id = :cid AND provider = :prov");
    $stmt->execute([':cid' => $companyId, ':prov' => $provider]);
} else {
    $dbPath = __DIR__ . '/../../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['integrations' => []];
    $db['integrations'] = array_values(array_filter($db['integrations'] ?? [], function($i) use ($companyId, $provider) {
        return !(($i['company_id'] ?? 1) === $companyId && ($i['provider'] ?? '') === $provider);
    }));
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'success' => true,
    'message' => "Intégration $provider déconnectée avec succès."
]);
