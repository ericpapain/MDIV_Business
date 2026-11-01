<?php
// public/api/integrations/mailbox_autoconfig.php
// Détection automatique universelle des serveurs IMAP & SMTP (ISPDB + MX + Presets)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$email = trim($_GET['email'] ?? '');
if (!$email && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;
    $email = trim($data['email'] ?? '');
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Adresse email valide requise']);
    exit;
}

$parts = explode('@', $email);
$domain = strtolower($parts[1] ?? '');

// 1. Presets connus
$presets = [
    'gmail.com' => [
        'provider' => 'gmail',
        'displayName' => 'Google Gmail',
        'imap' => ['host' => 'imap.gmail.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.gmail.com', 'port' => 465, 'ssl' => true],
        'authHint' => 'Pour Gmail, activez la validation en 2 étapes puis générez un mot de passe d application (16 caractères).'
    ],
    'googlemail.com' => [
        'provider' => 'gmail',
        'displayName' => 'Google Gmail',
        'imap' => ['host' => 'imap.gmail.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.gmail.com', 'port' => 465, 'ssl' => true],
        'authHint' => 'Pour Gmail, activez la validation en 2 étapes puis générez un mot de passe d application (16 caractères).'
    ],
    'outlook.com' => [
        'provider' => 'outlook',
        'displayName' => 'Microsoft Outlook / Office 365',
        'imap' => ['host' => 'outlook.office365.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.office365.com', 'port' => 587, 'ssl' => false],
        'authHint' => 'Pour Outlook / Hotmail, utilisez un mot de passe d application si la double authentification est active.'
    ],
    'hotmail.com' => [
        'provider' => 'outlook',
        'displayName' => 'Microsoft Hotmail',
        'imap' => ['host' => 'outlook.office365.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.office365.com', 'port' => 587, 'ssl' => false],
        'authHint' => 'Pour Outlook / Hotmail, utilisez un mot de passe d application si la double authentification est active.'
    ],
    'live.com' => [
        'provider' => 'outlook',
        'displayName' => 'Microsoft Live',
        'imap' => ['host' => 'outlook.office365.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.office365.com', 'port' => 587, 'ssl' => false]
    ],
    'yahoo.com' => [
        'provider' => 'yahoo',
        'displayName' => 'Yahoo Mail',
        'imap' => ['host' => 'imap.mail.yahoo.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.mail.yahoo.com', 'port' => 465, 'ssl' => true],
        'authHint' => 'Pour Yahoo, générez un mot de passe d application dans les paramètres de sécurité de votre compte Yahoo.'
    ],
    'icloud.com' => [
        'provider' => 'icloud',
        'displayName' => 'Apple iCloud',
        'imap' => ['host' => 'imap.mail.me.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.mail.me.com', 'port' => 587, 'ssl' => false],
        'authHint' => 'Pour iCloud, un mot de passe pour application spécifique est obligatoire depuis appleid.apple.com.'
    ],
    'me.com' => [
        'provider' => 'icloud',
        'displayName' => 'Apple iCloud',
        'imap' => ['host' => 'imap.mail.me.com', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'smtp.mail.me.com', 'port' => 587, 'ssl' => false]
    ],
    'ovh.net' => [
        'provider' => 'ovh',
        'displayName' => 'OVHcloud Mail',
        'imap' => ['host' => 'ssl0.ovh.net', 'port' => 993, 'ssl' => true],
        'smtp' => ['host' => 'ssl0.ovh.net', 'port' => 465, 'ssl' => true]
    ]
];

if (isset($presets[$domain])) {
    $match = $presets[$domain];
    echo json_encode([
        'success' => true,
        'email' => $email,
        'domain' => $domain,
        'source' => 'known_preset',
        'provider' => $match['provider'],
        'displayName' => $match['displayName'],
        'imap' => $match['imap'],
        'smtp' => $match['smtp'],
        'hint' => $match['authHint'] ?? null
    ]);
    exit;
}

// 2. Détection via DNS MX
$mxRecords = @dns_get_record($domain, DNS_MX);
if ($mxRecords && is_array($mxRecords)) {
    $mxHosts = array_map(function($r) { return strtolower($r['target'] ?? ''); }, $mxRecords);
    $allMx = implode(' ', $mxHosts);

    if (strpos($allMx, 'google') !== false || strpos($allMx, 'aspmx') !== false) {
        echo json_encode([
            'success' => true,
            'email' => $email,
            'domain' => $domain,
            'source' => 'mx_detection',
            'provider' => 'gmail',
            'displayName' => 'Google Workspace (détecté via MX)',
            'imap' => ['host' => 'imap.gmail.com', 'port' => 993, 'ssl' => true],
            'smtp' => ['host' => 'smtp.gmail.com', 'port' => 465, 'ssl' => true],
            'hint' => 'Compte Google Workspace d entreprise : utilisez un mot de passe d application Google.'
        ]);
        exit;
    }

    if (strpos($allMx, 'outlook') !== false || strpos($allMx, 'protection.outlook.com') !== false) {
        echo json_encode([
            'success' => true,
            'email' => $email,
            'domain' => $domain,
            'source' => 'mx_detection',
            'provider' => 'outlook',
            'displayName' => 'Microsoft 365 Exchange (détecté via MX)',
            'imap' => ['host' => 'outlook.office365.com', 'port' => 993, 'ssl' => true],
            'smtp' => ['host' => 'smtp.office365.com', 'port' => 587, 'ssl' => false],
            'hint' => 'Compte Microsoft 365 Entreprise : vérifiez que l accès IMAP/SMTP est autorisé par votre administrateur.'
        ]);
        exit;
    }

    if (strpos($allMx, 'ovh') !== false) {
        echo json_encode([
            'success' => true,
            'email' => $email,
            'domain' => $domain,
            'source' => 'mx_detection',
            'provider' => 'ovh',
            'displayName' => 'OVHcloud Pro (détecté via MX)',
            'imap' => ['host' => 'ssl0.ovh.net', 'port' => 993, 'ssl' => true],
            'smtp' => ['host' => 'ssl0.ovh.net', 'port' => 465, 'ssl' => true],
            'hint' => 'Compte OVH : utilisez votre mot de passe habituel de boîte mail OVH.'
        ]);
        exit;
    }
}

// 3. Fallback standard de domaine personnalisé
echo json_encode([
    'success' => true,
    'email' => $email,
    'domain' => $domain,
    'source' => 'standard_guess',
    'provider' => 'custom_imap',
    'displayName' => 'Serveur IMAP / SMTP (' . $domain . ')',
    'imap' => ['host' => 'mail.' . $domain, 'port' => 993, 'ssl' => true],
    'smtp' => ['host' => 'mail.' . $domain, 'port' => 465, 'ssl' => true],
    'hint' => 'Serveur d entreprise standard : ajustez les hôtes et ports si nécessaire.'
]);
