<?php
require_once '../config.php';

// Lire les données JSON
$inputData = json_decode(file_get_contents("php://input"), true);

$email = trim($inputData['email'] ?? '');
$password = $inputData['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Veuillez fournir un email et un mot de passe."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // Chercher l'entreprise par email
    $stmt = $pdo->prepare("SELECT id, company_name, password_hash, status FROM companies WHERE email = ?");
    $stmt->execute([$email]);
    $company = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$company) {
        http_response_code(401);
        echo json_encode(["error" => "Identifiants incorrects."]);
        exit;
    }

    if ($company['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["error" => "Ce compte est inactif ou banni."]);
        exit;
    }

    // Vérification du mot de passe
    if (!password_verify($password, $company['password_hash'])) {
        http_response_code(401);
        echo json_encode(["error" => "Identifiants incorrects."]);
        exit;
    }

    // Le mot de passe est bon, on génère le JWT
    $payload = [
        "company_id" => $company['id'],
        "company_name" => $company['company_name'],
        "email" => $email
    ];
    
    $token = generate_jwt($payload);

    echo json_encode([
        "success" => true,
        "token" => $token,
        "company" => [
            "id" => $company['id'],
            "name" => $company['company_name'],
            "email" => $email
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur DB: " . $e->getMessage()]);
}
