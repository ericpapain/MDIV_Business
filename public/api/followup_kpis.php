<?php
// public/api/followup_kpis.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    'totalSent' => 38,
    'responseRatePercent' => 74,
    'quotesWon' => 12,
    'invoicesPaid' => 19
], JSON_UNESCAPED_UNICODE);
