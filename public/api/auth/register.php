<?php
require_once '../config.php';

// Lire les données JSON
$inputData = json_decode(file_get_contents("php://input"), true);

$company_name = trim($inputData['company_name'] ?? '');
$email = trim($inputData['email'] ?? '');
$password = $inputData['password'] ?? '';

// Validation basique
if (empty($company_name) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Tous les champs sont obligatoires."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Format d'email invalide."]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["error" => "Le mot de passe doit contenir au moins 8 caractères."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // Vérifier si l'email existe déjà
    $stmt = $pdo->prepare("SELECT id FROM companies WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode(["error" => "Un compte existe déjà avec cet email."]);
        exit;
    }

    // Hachage sécurisé du mot de passe (règle absolue : jamais en clair)
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insertion
    $stmt = $pdo->prepare("INSERT INTO companies (company_name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$company_name, $email, $password_hash]);

    echo json_encode([
        "success" => true,
        "message" => "Compte entreprise créé avec succès."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur DB: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine()]);
}
