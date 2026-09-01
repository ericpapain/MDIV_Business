<?php
// Fichier : /api/config.php

// Affichage des erreurs en développement (à commenter en production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Clé API Groq fournie par l'utilisateur
define('GROQ_API_KEY', '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');

// Configuration de la base de données (A remplacer par les vrais identifiants OVH en production)
// S'ils sont définis dans les variables d'environnement (ex: par le serveur OVH), on les utilise
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_name = getenv('DB_NAME') ?: 'mdiv_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    // Configurer PDO pour lancer des exceptions en cas d'erreur
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Configurer le mode de récupération par défaut en tableau associatif
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Si la connexion échoue, on retourne une erreur JSON proprement
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]);
    exit;
}
?>
