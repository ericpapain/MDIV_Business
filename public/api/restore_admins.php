<?php
require_once __DIR__ . '/../api-config.php';

header('Content-Type: application/json');

try {
    // S'assurer que la table existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Liste des administrateurs à créer
    $admins = [
        ['username' => 'micke', 'password' => 'micke2026'],
        ['username' => 'eric', 'password' => 'eric2026']
    ];

    $results = [];

    foreach ($admins as $admin) {
        $username = $admin['username'];
        $password = $admin['password'];
        $hash = password_hash($password, PASSWORD_BCRYPT);

        // Vérifier si l'utilisateur existe déjà
        $stmt = $pdo->prepare("SELECT id FROM admins WHERE username = ?");
        $stmt->execute([$username]);
        $exists = $stmt->fetchColumn();

        if ($exists) {
            // Mise à jour du mot de passe
            $update = $pdo->prepare("UPDATE admins SET password_hash = ? WHERE username = ?");
            $update->execute([$hash, $username]);
            $results[] = "Compte '$username' mis à jour avec succès.";
        } else {
            // Création du compte
            $insert = $pdo->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)");
            $insert->execute([$username, $hash]);
            $results[] = "Compte '$username' créé avec succès.";
        }
    }

    echo json_encode(["success" => true, "messages" => $results]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erreur base de données : " . $e->getMessage()]);
}
