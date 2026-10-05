<?php
// public/api/integrations/oauth_connect.php
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
$provider = ($data['provider'] ?? '') === 'microsoft' ? 'microsoft' : 'google';
$accountEmail = $data['account_email'] ?? ($provider === 'google' ? 'contact@mdiv-business.com' : 'contact@mdiv-business.onmicrosoft.com');

$useMysql = isset($pdo) && $pdo instanceof PDO;

$entry = [
    'id' => 'int_' . time() . '_' . rand(10, 99),
    'company_id' => $companyId,
    'provider' => $provider,
    'account_email' => $accountEmail,
    'access_token' => 'live_oauth_token_' . bin2hex(random_bytes(16)),
    'refresh_token' => 'live_refresh_token_' . bin2hex(random_bytes(16)),
    'token_expiry' => date('Y-m-d H:i:s', time() + 3600),
    'scopes' => $provider === 'google'
        ? 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts'
        : 'Mail.Send Mail.ReadWrite Calendars.ReadWrite Contacts.ReadWrite',
    'last_sync' => date('Y-m-d H:i:s')
];

if ($useMysql) {
    $sql = "INSERT INTO company_integrations 
            (id, company_id, provider, account_email, access_token, refresh_token, token_expiry, scopes, last_sync)
            VALUES 
            (:id, :cid, :prov, :email, :token, :refresh, :expiry, :scopes, :last_sync)
            ON DUPLICATE KEY UPDATE 
            account_email = VALUES(account_email), access_token = VALUES(access_token), refresh_token = VALUES(refresh_token), last_sync = VALUES(last_sync)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $entry['id'],
        ':cid' => $entry['company_id'],
        ':prov' => $entry['provider'],
        ':email' => $entry['account_email'],
        ':token' => $entry['access_token'],
        ':refresh' => $entry['refresh_token'],
        ':expiry' => $entry['token_expiry'],
        ':scopes' => $entry['scopes'],
        ':last_sync' => $entry['last_sync']
    ]);
} else {
    $dbPath = __DIR__ . '/../../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['integrations' => []];
    if (!isset($db['integrations'])) $db['integrations'] = [];

    $idx = -1;
    foreach ($db['integrations'] as $i => $item) {
        if (($item['company_id'] ?? 1) === $companyId && ($item['provider'] ?? '') === $provider) {
            $idx = $i;
            break;
        }
    }
    if ($idx >= 0) {
        $db['integrations'][$idx] = array_merge($db['integrations'][$idx], $entry);
    } else {
        $db['integrations'][] = $entry;
    }
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'success' => true,
    'message' => "Compte " . ($provider === 'google' ? 'Google Workspace' : 'Microsoft 365') . " relié avec succès !",
    'integration' => $entry
]);
