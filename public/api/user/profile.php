<?php
// Fichier : /api/user/profile.php
require_once '../config.php';

header('Content-Type: application/json');

// Vérification de sécurité (JWT Token)
$token = get_bearer_token();
if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Token manquant."]);
    exit;
}

$payload = verify_jwt($token);
if (!$payload || !isset($payload['company_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Token invalide ou expiré."]);
    exit;
}

$company_id = $payload['company_id'];

try {
    $pdo = get_db_connection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->prepare("SELECT id, company_name AS name, email, created_at FROM companies WHERE id = ?");
        $stmt->execute([$company_id]);
        $company = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$company) {
            http_response_code(404);
            echo json_encode(["error" => "Entreprise introuvable."]);
            exit;
        }
        
        echo json_encode([
            "success" => true,
            "company" => $company
        ]);
        exit;
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $new_password = trim($input['password'] ?? '');
        
        if (empty($name) || empty($email)) {
            http_response_code(400);
            echo json_encode(["error" => "Le nom et l'email sont obligatoires."]);
            exit;
        }
        
        // Vérifier si l'email existe déjà chez un autre utilisateur
        $stmt = $pdo->prepare("SELECT id FROM companies WHERE email = ? AND id != ?");
        $stmt->execute([$email, $company_id]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Cette adresse e-mail est déjà utilisée par une autre entreprise."]);
            exit;
        }
        
        if (!empty($new_password)) {
            if (strlen($new_password) < 8) {
                http_response_code(400);
                echo json_encode(["error" => "Le mot de passe doit faire au moins 8 caractères."]);
                exit;
            }
            $password_hash = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE companies SET company_name = ?, email = ?, password_hash = ? WHERE id = ?");
            $stmt->execute([$name, $email, $password_hash, $company_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE companies SET company_name = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $company_id]);
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Profil mis à jour avec succès.",
            "company" => [
                "id" => $company_id,
                "name" => $name,
                "email" => $email
            ]
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur lors de la mise à jour du profil : " . $e->getMessage()]);
}
?>
