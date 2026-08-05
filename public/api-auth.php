<?php
// api-auth.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'api-config.php';
session_start();

$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $data->username ?? '';
    $password = $data->password ?? '';

    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD_PLAIN) {
        // Régénérer l'ID de session pour éviter les fixations de session
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        echo json_encode(['success' => true, 'message' => 'Connexion réussie']);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Identifiants incorrects']);
    }
    exit();
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
    exit();
}

if ($action === 'check') {
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        echo json_encode(['success' => true, 'authenticated' => true]);
    } else {
        echo json_encode(['success' => true, 'authenticated' => false]);
    }
    exit();
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action invalide']);
