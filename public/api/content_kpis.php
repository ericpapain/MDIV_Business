<?php
// public/api/content_kpis.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    'totalGenerated' => 64,
    'wordsGenerated' => 28400,
    'activeCampaigns' => 8,
    'timeSavedHours' => 42
], JSON_UNESCAPED_UNICODE);
