<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

$inputData = json_decode(file_get_contents("php://input"), true);
$token = trim($inputData['token'] ?? '');
$password = $inputData['password'] ?? '';

if (empty($token) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Données manquantes ou invalides."]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Le mot de passe doit contenir au moins 6 caractères."]);
    exit;
}

try {
    $pdo = get_db_connection();
    $currentDate = date('Y-m-d H:i:s');

    // Vérifier dans users
    $stmtUser = $pdo->prepare("SELECT id, 'user' as type FROM users WHERE reset_token = ? AND reset_expires > ? LIMIT 1");
    $stmtUser->execute([$token, $currentDate]);
    $account = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$account) {
        // Vérifier dans companies
        $stmtComp = $pdo->prepare("SELECT id, 'company' as type FROM companies WHERE reset_token = ? AND reset_expires > ? LIMIT 1");
        $stmtComp->execute([$token, $currentDate]);
        $account = $stmtComp->fetch(PDO::FETCH_ASSOC);
    }

    if (!$account) {
        http_response_code(400);
        echo json_encode(["error" => "Ce lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande."]);
        exit;
    }

    // Hasher le nouveau mot de passe
    $new_hash = password_hash($password, PASSWORD_DEFAULT);

    // Mettre à jour le mot de passe et supprimer le token
    if ($account['type'] === 'user') {
        $update = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        $update->execute([$new_hash, $account['id']]);
    } else {
        $update = $pdo->prepare("UPDATE companies SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
        $update->execute([$new_hash, $account['id']]);
    }

    echo json_encode(["success" => true, "message" => "Votre mot de passe a été réinitialisé avec succès."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur Serveur."]);
}
