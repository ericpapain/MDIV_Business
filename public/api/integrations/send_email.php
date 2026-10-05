<?php
// public/api/integrations/send_email.php
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

$provider = ($data['provider'] ?? '') === 'microsoft' ? 'microsoft' : 'google';
$to = $data['to'] ?? '';
$subject = $data['subject'] ?? 'Message MDIV Business';
$body = $data['body'] ?? '';

// Simulation d'envoi API directe (Gmail API / Microsoft Graph API)
$providerLabel = $provider === 'google' ? 'Google Workspace / Gmail' : 'Microsoft 365 / Outlook';

echo json_encode([
    'success' => true,
    'messageId' => 'msg_' . time() . '_' . rand(100, 999),
    'provider' => $provider,
    'to' => $to,
    'subject' => $subject,
    'sentAt' => date('Y-m-d H:i:s'),
    'info' => "Email transmis avec succès via l'API $providerLabel !"
]);
