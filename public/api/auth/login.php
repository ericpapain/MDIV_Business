<?php
require_once '../config.php';

// Lire les données JSON
$inputData = json_decode(file_get_contents("php://input"), true);

// Accepte soit 'identifier' soit 'email' (Email ou SIREN)
$rawIdentifier = trim($inputData['identifier'] ?? $inputData['email'] ?? $inputData['siren'] ?? '');
$password = $inputData['password'] ?? '';

if (empty($rawIdentifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Veuillez fournir un email professionnel ou un numéro SIREN et votre mot de passe."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // Nettoyer pour tester si c'est un SIREN (9 chiffres sans espaces)
    $cleanSiren = preg_replace('/[^0-9]/', '', $rawIdentifier);
    $isSiren = (strlen($cleanSiren) === 9 && !str_contains($rawIdentifier, '@'));

    $company = null;
    $user = null;

    if ($isSiren) {
        // Recherche par SIREN officiel de l'entreprise
        $stmt = $pdo->prepare("SELECT * FROM companies WHERE siren = ? LIMIT 1");
        $stmt->execute([$cleanSiren]);
        $company = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($company) {
            // Chercher l'utilisateur principal (ADMIN)
            $stmtUser = $pdo->prepare("SELECT * FROM users WHERE company_id = ? ORDER BY id ASC LIMIT 1");
            $stmtUser->execute([$company['id']]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
        }
    } else {
        // Recherche par email professionnel (dans users d'abord, puis rétro-compatibilité dans companies)
        $stmtUser = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmtUser->execute([$rawIdentifier]);
        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $stmtComp = $pdo->prepare("SELECT * FROM companies WHERE id = ? LIMIT 1");
            $stmtComp->execute([$user['company_id']]);
            $company = $stmtComp->fetch(PDO::FETCH_ASSOC);
        } else {
            // Rétro-compatibilité : recherche directe dans la table companies
            $stmtComp = $pdo->prepare("SELECT * FROM companies WHERE email = ? LIMIT 1");
            $stmtComp->execute([$rawIdentifier]);
            $company = $stmtComp->fetch(PDO::FETCH_ASSOC);
        }
    }

    if (!$company) {
        http_response_code(401);
        echo json_encode(["error" => "Identifiants incorrects ou aucun compte associé à ce " . ($isSiren ? "SIREN" : "email") . "."]);
        exit;
    }

    if ($company['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["error" => "Ce compte entreprise est inactif ou suspendu."]);
        exit;
    }

    // Détermination du hash de mot de passe (priorité au compte utilisateur, puis entreprise)
    $hashToCheck = $user['password_hash'] ?? $company['password_hash'] ?? '';

    if (empty($hashToCheck) || !password_verify($password, $hashToCheck)) {
        http_response_code(401);
        echo json_encode(["error" => "Mot de passe incorrect."]);
        exit;
    }

    // Génération du token JWT
    $payload = [
        "company_id" => (int)$company['id'],
        "company_name" => $company['company_name'],
        "siren" => $company['siren'] ?? null,
        "email" => $user['email'] ?? $company['email'],
        "user_id" => $user['id'] ?? null,
        "role" => $user['role'] ?? 'ADMIN'
    ];
    
    $token = generate_jwt($payload);

    echo json_encode([
        "success" => true,
        "token" => $token,
        "company" => [
            "id" => (int)$company['id'],
            "name" => $company['company_name'],
            "email" => $user['email'] ?? $company['email'],
            "siren" => $company['siren'] ?? null,
            "siret" => $company['siret'] ?? null,
            "city" => $company['city'] ?? null,
            "plan_tier" => $company['plan_tier'] ?? 'free',
            "role" => $user['role'] ?? 'ADMIN'
        ],
        "user" => $user ? [
            "id" => (int)$user['id'],
            "first_name" => $user['first_name'],
            "last_name" => $user['last_name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "job_title" => $user['job_title']
        ] : null
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur Serveur : " . $e->getMessage()]);
}
