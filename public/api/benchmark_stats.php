<?php
// public/api/benchmark_stats.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$sector = $_GET['sector'] ?? 'Industrie';

echo json_encode([
    'sector' => $sector,
    'global_avg' => 54,
    'global_top10' => 86,
    'ai_avg' => 42,
    'data_avg' => 48,
    'process_avg' => 61,
    'infra_avg' => 57,
    'culture_avg' => 49,
    'strategy_avg' => 55
], JSON_UNESCAPED_UNICODE);
