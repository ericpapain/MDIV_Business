<?php
// public/api/content_history.php
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
        'id' => 'cont_1',
        'sourceType' => 'text',
        'sourceTitle' => 'Comment l\'IA libère 30% du temps des dirigeants de PME',
        'date' => date('d/m/Y H:i'),
        'channels' => ['LinkedIn', 'Twitter/X'],
        'isFavorite' => true
    ],
    [
        'id' => 'cont_2',
        'sourceType' => 'url',
        'sourceTitle' => 'Guide de sélection d\'un LLM souverain en 2026',
        'date' => date('d/m/Y', strtotime('-2 days')),
        'channels' => ['Blog', 'Newsletter'],
        'isFavorite' => false
    ]
], JSON_UNESCAPED_UNICODE);
