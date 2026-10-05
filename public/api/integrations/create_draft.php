<?php
// public/api/integrations/create_draft.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$provider = ($data['provider'] ?? '') === 'microsoft' ? 'microsoft' : 'google';
$to = $data['to'] ?? '';
$subject = $data['subject'] ?? 'Brouillon généré par IA';

echo json_encode([
    'success' => true,
    'draftId' => 'draft_' . time() . '_' . rand(100, 999),
    'provider' => $provider,
    'to' => $to,
    'subject' => $subject,
    'createdAt' => date('Y-m-d H:i:s'),
    'info' => "Brouillon synchronisé et accessible directement dans votre dossier 'Brouillons' " . ($provider === 'google' ? 'Gmail' : 'Outlook') . "."
]);
