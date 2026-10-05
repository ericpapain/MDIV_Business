<?php
// public/api/email_history.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Si la table existe dans la DB, on peut requêter, sinon retourner les items récents
    $history = [
        [
            'id' => 'mail_1',
            'date' => date('d/m/Y H:i'),
            'objective' => 'Proposition commerciale',
            'contentSnippet' => 'Suite à notre échange, je vous transmets les détails de notre offre d\'accompagnement...',
            'isFavorite' => true
        ],
        [
            'id' => 'mail_2',
            'date' => date('d/m/Y', strtotime('-1 day')),
            'objective' => 'Relance client',
            'contentSnippet' => 'Je me permets de revenir vers vous concernant notre proposition transmise la semaine dernière...',
            'isFavorite' => false
        ]
    ];

    echo json_encode($history, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([]);
}
