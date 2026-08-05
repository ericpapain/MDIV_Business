<?php
// api-config.php
// Ne pas exposer ce fichier directement.

$db_host = 'zwpvaah279.mysql.db';
$db_name = 'zwpvaah279';
$db_user = 'zwpvaah279';
$db_pass = 'Champion2018';
$db_charset = 'utf8mb4';

// Identifiants administrateur
// En production, il est recommandé de stocker le hash (généré par password_hash)
// Ici nous gardons la logique pour hacher et vérifier de manière sécurisée.
define('ADMIN_USERNAME', 'champion');
// Le mot de passe en clair (à ne pas exposer). Pour une vraie sécurité, on peut le remplacer par son hash généré : $2y$10$...
define('ADMIN_PASSWORD_PLAIN', 'Champion2018#'); 

$dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion BDD']);
    exit;
}

// Configuration des sessions sécurisées
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 1); // A activer en production (HTTPS)
