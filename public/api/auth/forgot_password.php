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
$email = trim($inputData['email'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Veuillez fournir une adresse email valide."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // Vérifier si l'utilisateur existe dans 'users' ou 'companies'
    $stmtUser = $pdo->prepare("SELECT id, 'user' as type FROM users WHERE email = ? LIMIT 1");
    $stmtUser->execute([$email]);
    $account = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$account) {
        $stmtComp = $pdo->prepare("SELECT id, 'company' as type FROM companies WHERE email = ? LIMIT 1");
        $stmtComp->execute([$email]);
        $account = $stmtComp->fetch(PDO::FETCH_ASSOC);
    }

    // Sécurité: Toujours renvoyer un succès même si l'email n'existe pas (protection contre l'énumération de comptes)
    if (!$account) {
        echo json_encode(["success" => true, "message" => "Si un compte est associé à cet email, un lien de réinitialisation vient d'être envoyé."]);
        exit;
    }

    // Générer un token unique
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', time() + 3600); // 1 heure

    // Enregistrer le token dans la bonne table
    if ($account['type'] === 'user') {
        $update = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $update->execute([$token, $expires, $account['id']]);
    } else {
        $update = $pdo->prepare("UPDATE companies SET reset_token = ?, reset_expires = ? WHERE id = ?");
        $update->execute([$token, $expires, $account['id']]);
    }

    // Préparer l'envoi de l'email
    $app_url = "https://mdiv-network.com"; // L'URL de base de la plateforme
    $reset_link = $app_url . "/reset-password?token=" . $token;
    
    $subject = "Réinitialisation de votre mot de passe - MDIV Business";
    
    $message = "
    <html>
    <head>
      <title>Réinitialisation de votre mot de passe</title>
    </head>
    <body>
      <h2>Bonjour,</h2>
      <p>Vous avez demandé à réinitialiser votre mot de passe sur MDIV Business.</p>
      <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <p><a href='{$reset_link}'>Réinitialiser mon mot de passe</a></p>
      <p>Ou copiez ce lien dans votre navigateur :<br>{$reset_link}</p>
      <p>Ce lien est valide pendant 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
      <br>
      <p>L'équipe MDIV Business</p>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: MDIV Business <noreply@mdiv-network.com>" . "\r\n";

    // Envoi via la fonction native de PHP (OVH)
    mail($email, $subject, $message, $headers);

    echo json_encode(["success" => true, "message" => "Si un compte est associé à cet email, un lien de réinitialisation vient d'être envoyé."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur Serveur."]);
}
