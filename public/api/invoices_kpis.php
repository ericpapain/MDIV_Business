<?php
// public/api/invoices_kpis.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    'totalIssued' => 48200,
    'totalPaid' => 36400,
    'totalPending' => 9800,
    'totalOverdue' => 2000
], JSON_UNESCAPED_UNICODE);
