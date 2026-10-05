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

echo json_encode([
    'totalGenerated' => 142,
    'highlyQualified' => 68,
    'activeSegments' => 6,
    'totalExports' => 18
], JSON_UNESCAPED_UNICODE);
