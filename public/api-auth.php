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

    // Auto-création de la table admins si elle n'existe pas
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Injecter un compte admin par défaut si la table est vide (le mot de passe initial sera 'Champion2018#')
    $stmt = $pdo->query("SELECT COUNT(*) FROM admins");
    if ($stmt->fetchColumn() == 0) {
        $defaultHash = password_hash('Champion2018#', PASSWORD_DEFAULT);
        $insert = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES ('champion', ?)");
        $insert->execute([$defaultHash]);
    }

    $stmt = $pdo->prepare("SELECT id, password_hash FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        // Régénérer l'ID de session pour éviter les fixations de session
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_id'] = $admin['id'];
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
