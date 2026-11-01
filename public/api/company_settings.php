<?php
// public/api/company_settings.php
// Paramètres de personnalisation de l'entreprise (Logo, signature, modules actifs, heures de rappel)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
if (!isset($db['company_settings'])) $db['company_settings'] = [];

$foundIdx = -1;
foreach ($db['company_settings'] as $idx => $s) {
    if ((int)($s['company_id'] ?? 0) === $companyId) {
        $foundIdx = $idx;
        break;
    }
}

if ($foundIdx === -1) {
    $defaultSetting = [
        'company_id' => $companyId,
        'logo_url' => '',
        'company_signature' => "Bien cordialement,\nL'équipe MDIV Business",
        'personal_signature' => '',
        'active_modules' => ['invoices', 'quotes', 'clients', 'projects'],
        'reminder_preferences' => [
            'morning_hour' => '08:00',
            'evening_hour' => '18:00',
            'notify_email' => true,
            'notify_sms' => false
        ]
    ];
    $db['company_settings'][] = $defaultSetting;
    $foundIdx = count($db['company_settings']) - 1;
}

if ($method === 'GET') {
    echo json_encode(['success' => true, 'settings' => $db['company_settings'][$foundIdx]]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    
    $cur = &$db['company_settings'][$foundIdx];
    if (isset($data['logo_url'])) $cur['logo_url'] = $data['logo_url'];
    if (isset($data['company_signature'])) $cur['company_signature'] = $data['company_signature'];
    if (isset($data['personal_signature'])) $cur['personal_signature'] = $data['personal_signature'];
    if (isset($data['active_modules']) && is_array($data['active_modules'])) $cur['active_modules'] = $data['active_modules'];
    if (isset($data['reminder_preferences'])) {
        $cur['reminder_preferences'] = array_merge($cur['reminder_preferences'], $data['reminder_preferences']);
    }

    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['success' => true, 'settings' => $cur]);
    exit;
}
