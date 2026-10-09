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

// Pour le moment, l'intégration du calendrier n'est pas finalisée,
// on retourne un tableau vide pour éviter d'afficher des données fictives aux vrais utilisateurs.
echo json_encode([], JSON_UNESCAPED_UNICODE);
