<?php
// api-config.php
// Ne pas exposer ce fichier directement.

$db_host = 'zwpvaah279.mysql.db';
$db_name = 'zwpvaah279';
$db_user = 'zwpvaah279';
$db_pass = 'France2026';
$db_charset = 'utf8mb4';

// Les identifiants administrateur sont désormais gérés de manière sécurisée en base de données.

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion BDD : ' . $e->getMessage()]);
    exit;
}

// Configuration des sessions sécurisées
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1); // A activer en production (HTTPS)
