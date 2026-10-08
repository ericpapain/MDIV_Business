<?php
// public/api/leads_kpis.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : 0;
if (!$companyId) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// TODO: fetch actual stats from DB once `leads` table is implemented.
// Pour l'instant, on retourne 0 pour effacer les fausses données ("mocks").
echo json_encode([
    'totalGenerated' => 0,
    'highlyQualified' => 0,
    'activeSegments' => 0,
    'totalExports' => 0
], JSON_UNESCAPED_UNICODE);
