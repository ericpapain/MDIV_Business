<?php
// public/api/upcoming_meetings.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode([
    [
        'id' => 'meet_up_1',
        'title' => 'Cadrage Stratégique & Audit IA',
        'dateTime' => date('d/m/Y 14:30', strtotime('+2 days')),
        'clientName' => 'Groupe Industriel de l\'Est',
        'clientId' => 1,
        'location' => 'Visioconférence Teams',
        'source' => 'teams'
    ],
    [
        'id' => 'meet_up_2',
        'title' => 'Présentation Solution sur mesure',
        'dateTime' => date('d/m/Y 10:00', strtotime('+4 days')),
        'clientName' => 'Nova Biotech SAS',
        'clientId' => 2,
        'location' => 'Siège Nova Biotech (Lyon)',
        'source' => 'outlook'
    ]
], JSON_UNESCAPED_UNICODE);
