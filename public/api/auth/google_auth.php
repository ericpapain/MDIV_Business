<?php
/**
 * ==============================================================================
 * MDIV Business - Backend d'Authentification OAuth 2.0 Google
 * ==============================================================================
 * 
 * RÔLE ARCHITECTURAL :
 * - Reçoit le token OAuth 2.0 (access_token ou id_token) émis par Google après
 *   sélection du compte par l'utilisateur.
 * - Vérifie de manière sécurisée la validité du token directement auprès des
 *   serveurs officiels de Google (API UserInfo / TokenInfo).
 * - Récupère l'identité vérifiée de l'utilisateur (google_id, email vérifié, nom, prénom, avatar).
 * - Gère l'association intelligente des comptes (Account Linking) :
 *     * Si un utilisateur ou une entreprise existe déjà avec ce compte Google -> Connexion directe.
 *     * Si un utilisateur ou une entreprise existe déjà avec la même adresse email (créé par mot de passe)
 *       -> Fusion / liaison automatique du compte avec Google sans doublon.
 *     * Si le compte n'existe pas -> Création automatique de l'Entreprise et du profil Dirigeant (ADMIN).
 * - Émet une session JWT officielle MDIV Business conforme à la connexion standard.
 */

require_once '../config.php';

// Ne traiter que les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Méthode non autorisée. Seul le protocole POST est accepté."]);
    exit;
}

// 1. Récupération et parsing du payload JSON
$rawInput = file_get_contents("php://input");
$inputData = json_decode($rawInput, true);

if (!is_array($inputData)) {
    http_response_code(400);
    echo json_encode(["error" => "Données de requête invalides (JSON attendu)."]);
    exit;
}

$accessToken = trim($inputData['access_token'] ?? '');
$idToken = trim($inputData['id_token'] ?? '');

if (empty($accessToken) && empty($idToken)) {
    http_response_code(400);
    echo json_encode(["error" => "Token d'autorisation Google manquant (access_token ou id_token requis)."]);
    exit;
}

// 2. Vérification et validation du token auprès des serveurs Google
$googleUserData = null;

if (!empty($accessToken)) {
    // Vérification de l'access_token via l'endpoint officiel Google UserInfo v3
    $userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    $ch = curl_init($userInfoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer " . $accessToken,
        "Accept: application/json"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode === 200 && !empty($response)) {
        $googleUserData = json_decode($response, true);
    }
}

// Fallback sur id_token si l'access_token n'a pas été fourni ou n'a pas répondu
if (!$googleUserData && !empty($idToken)) {
    $tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($idToken);
    $ch = curl_init($tokenInfoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($response)) {
        $googleUserData = json_decode($response, true);
    }
}

if (!$googleUserData || empty($googleUserData['sub']) || empty($googleUserData['email'])) {
    http_response_code(401);
    echo json_encode([
        "error" => "Échec de validation Google OAuth : Token invalide, expiré ou révoqué.",
        "details" => "Impossible de vérifier l'identité auprès des serveurs Google."
    ]);
    exit;
}

// Vérifier que l'adresse email est bien validée par Google
if (isset($googleUserData['email_verified']) && $googleUserData['email_verified'] !== true && $googleUserData['email_verified'] !== 'true' && $googleUserData['email_verified'] !== 1) {
    http_response_code(403);
    echo json_encode(["error" => "Cette adresse Google n'est pas vérifiée par Google."]);
    exit;
}

// Extraction des données certifiées
$googleId = (string)$googleUserData['sub'];
$email = strtolower(trim($googleUserData['email']));
$firstName = trim($googleUserData['given_name'] ?? '');
$lastName = trim($googleUserData['family_name'] ?? '');
$fullName = trim($googleUserData['name'] ?? ($firstName . ' ' . $lastName));
$avatarUrl = trim($googleUserData['picture'] ?? '');

// Si nom/prénom manquent, on extrait depuis l'adresse email
if (empty($firstName) && empty($lastName)) {
    $parts = explode('@', $email);
    $firstName = ucfirst($parts[0] ?? 'Utilisateur');
    $lastName = 'Google';
    $fullName = $firstName . ' ' . $lastName;
} elseif (empty($firstName)) {
    $firstName = $fullName;
} elseif (empty($lastName)) {
    $lastName = 'Google';
}

try {
    $pdo = get_db_connection();

    $company = null;
    $user = null;

    // -------------------------------------------------------------------------
    // ÉTAPE A : Recherche d'un compte déjà associé au Google ID
    // -------------------------------------------------------------------------
    $stmtUserByGoogle = $pdo->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
    $stmtUserByGoogle->execute([$googleId]);
    $user = $stmtUserByGoogle->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $stmtComp = $pdo->prepare("SELECT * FROM companies WHERE id = ? LIMIT 1");
        $stmtComp->execute([$user['company_id']]);
        $company = $stmtComp->fetch(PDO::FETCH_ASSOC);
    } else {
        // Recherche dans companies par google_id (pour les comptes créés avant séparation)
        $stmtCompByGoogle = $pdo->prepare("SELECT * FROM companies WHERE google_id = ? LIMIT 1");
        $stmtCompByGoogle->execute([$googleId]);
        $company = $stmtCompByGoogle->fetch(PDO::FETCH_ASSOC);

        if ($company) {
            $stmtUser = $pdo->prepare("SELECT * FROM users WHERE company_id = ? ORDER BY id ASC LIMIT 1");
            $stmtUser->execute([$company['id']]);
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
        }
    }

    // -------------------------------------------------------------------------
    // ÉTAPE B : Compte existant par Email (Fusion / Account Linking automatique)
    // Si l'utilisateur s'était inscrit par email/mot de passe avec ce Gmail
    // -------------------------------------------------------------------------
    if (!$company && !$user) {
        $stmtUserByEmail = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmtUserByEmail->execute([$email]);
        $user = $stmtUserByEmail->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Relier le google_id et mettre à jour l'avatar
            $updateUser = $pdo->prepare("
                UPDATE users 
                SET google_id = ?, 
                    avatar_url = COALESCE(NULLIF(avatar_url, ''), ?), 
                    auth_provider = CASE WHEN auth_provider = 'local' THEN 'google' ELSE auth_provider END
                WHERE id = ?
            ");
            $updateUser->execute([$googleId, $avatarUrl, $user['id']]);

            $stmtComp = $pdo->prepare("SELECT * FROM companies WHERE id = ? LIMIT 1");
            $stmtComp->execute([$user['company_id']]);
            $company = $stmtComp->fetch(PDO::FETCH_ASSOC);

            // Mettre à jour aussi la société si elle n'avait pas encore de google_id
            if ($company && empty($company['google_id'])) {
                $updateComp = $pdo->prepare("UPDATE companies SET google_id = ?, avatar_url = COALESCE(NULLIF(avatar_url, ''), ?) WHERE id = ?");
                $updateComp->execute([$googleId, $avatarUrl, $company['id']]);
            }
        } else {
            // Chercher si l'entreprise existe par son email principal
            $stmtCompByEmail = $pdo->prepare("SELECT * FROM companies WHERE email = ? LIMIT 1");
            $stmtCompByEmail->execute([$email]);
            $company = $stmtCompByEmail->fetch(PDO::FETCH_ASSOC);

            if ($company) {
                // Relier l'entreprise
                $updateComp = $pdo->prepare("UPDATE companies SET google_id = ?, avatar_url = COALESCE(NULLIF(avatar_url, ''), ?) WHERE id = ?");
                $updateComp->execute([$googleId, $avatarUrl, $company['id']]);

                // Vérifier s'il y a un utilisateur associé
                $stmtUser = $pdo->prepare("SELECT * FROM users WHERE company_id = ? ORDER BY id ASC LIMIT 1");
                $stmtUser->execute([$company['id']]);
                $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    $updateUser = $pdo->prepare("UPDATE users SET google_id = ?, avatar_url = COALESCE(NULLIF(avatar_url, ''), ?) WHERE id = ?");
                    $updateUser->execute([$googleId, $avatarUrl, $user['id']]);
                } else {
                    // Créer l'utilisateur rattaché
                    $randomPassword = bin2hex(random_bytes(16));
                    $passHash = password_hash($randomPassword, PASSWORD_BCRYPT);
                    $insUser = $pdo->prepare("
                        INSERT INTO users (
                            company_id, first_name, last_name, email, job_title, 
                            password_hash, role, email_verified, google_id, avatar_url, auth_provider, status
                        ) VALUES (?, ?, ?, ?, 'Dirigeant', ?, 'ADMIN', 1, ?, ?, 'google', 'active')
                    ");
                    $insUser->execute([$company['id'], $firstName, $lastName, $email, $passHash, $googleId, $avatarUrl]);
                    $userId = (int)$pdo->lastInsertId();
                    $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ?");
                    $stmtUser->execute([$userId]);
                    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // ÉTAPE C : Nouvel utilisateur -> Création automatique Entreprise + Dirigeant
    // -------------------------------------------------------------------------
    if (!$company) {
        $pdo->beginTransaction();

        $companyName = !empty($fullName) ? $fullName : ("Entreprise " . $firstName);
        $randomPassword = bin2hex(random_bytes(16));
        $passHash = password_hash($randomPassword, PASSWORD_BCRYPT);

        // Insertion Entreprise
        $stmtInsComp = $pdo->prepare("
            INSERT INTO companies (
                company_name, email, password_hash, plan_tier, company_status,
                data_source, google_id, avatar_url, logo_url, auth_provider, status
            ) VALUES (?, ?, ?, 'free', 'MANUAL', 'MANUAL', ?, ?, ?, 'google', 'active')
        ");
        $stmtInsComp->execute([$companyName, $email, $passHash, $googleId, $avatarUrl, $avatarUrl]);
        $companyId = (int)$pdo->lastInsertId();

        // Insertion Utilisateur Dirigeant
        $stmtInsUser = $pdo->prepare("
            INSERT INTO users (
                company_id, first_name, last_name, email, job_title, 
                password_hash, role, email_verified, google_id, avatar_url, auth_provider, status
            ) VALUES (?, ?, ?, ?, 'Dirigeant', ?, 'ADMIN', 1, ?, ?, 'google', 'active')
        ");
        $stmtInsUser->execute([$companyId, $firstName, $lastName, $email, $passHash, $googleId, $avatarUrl]);
        $userId = (int)$pdo->lastInsertId();

        $pdo->commit();

        // Synchronisation miroir dans dev_db.json
        $devDbPath = __DIR__ . '/../../dev_db.json';
        if (file_exists($devDbPath)) {
            $dbContent = json_decode(file_get_contents($devDbPath), true) ?: [];
            if (!isset($dbContent['companies'])) $dbContent['companies'] = [];
            $devCompRecord = [
                'id' => $companyId,
                'company_name' => $companyName,
                'name' => $companyName,
                'email' => $email,
                'google_id' => $googleId,
                'avatar_url' => $avatarUrl,
                'logo_url' => $avatarUrl,
                'logo' => $avatarUrl,
                'auth_provider' => 'google',
                'plan_tier' => 'free',
                'status' => 'active',
                'first_name' => $firstName,
                'last_name' => $lastName,
                'job_title' => 'Dirigeant',
                'role' => 'ADMIN',
                'created_at' => date('c'),
                'updated_at' => date('c')
            ];
            $dbContent['companies'][] = $devCompRecord;
            file_put_contents($devDbPath, json_encode($dbContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        // Récupérer les entités fraîchement créées
        $stmtComp = $pdo->prepare("SELECT * FROM companies WHERE id = ?");
        $stmtComp->execute([$companyId]);
        $company = $stmtComp->fetch(PDO::FETCH_ASSOC);

        $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmtUser->execute([$userId]);
        $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
    } else {
        // Si l'utilisateur ou l'avatar a évolué, mise à jour discrète
        if (!empty($avatarUrl) && $user && (empty($user['avatar_url']) || $user['avatar_url'] !== $avatarUrl)) {
            $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?")->execute([$avatarUrl, $user['id']]);
            $user['avatar_url'] = $avatarUrl;
        }
    }

    // Vérifier le statut du compte
    if ($company['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["error" => "Ce compte entreprise est inactif ou suspendu. Veuillez contacter le support."]);
        exit;
    }

    // -------------------------------------------------------------------------
    // ÉTAPE D : Génération du JWT de session standard MDIV Business
    // -------------------------------------------------------------------------
    $payload = [
        "company_id"   => (int)$company['id'],
        "company_name" => $company['company_name'],
        "siren"        => $company['siren'] ?? null,
        "email"        => $user['email'] ?? $company['email'],
        "user_id"      => $user['id'] ?? null,
        "role"         => $user['role'] ?? 'ADMIN'
    ];

    $token = generate_jwt($payload);

    // -------------------------------------------------------------------------
    // ÉTAPE E : Réponse finale conforme au schéma attendu par le frontend
    // -------------------------------------------------------------------------
    echo json_encode([
        "success" => true,
        "token" => $token,
        "company" => [
            "id"        => (int)$company['id'],
            "name"      => $company['company_name'],
            "email"     => $user['email'] ?? $company['email'],
            "siren"     => $company['siren'] ?? null,
            "siret"     => $company['siret'] ?? null,
            "city"      => $company['city'] ?? null,
            "plan_tier" => $company['plan_tier'] ?? 'free',
            "role"      => $user['role'] ?? 'ADMIN'
        ],
        "user" => $user ? [
            "id"         => (int)$user['id'],
            "first_name" => $user['first_name'],
            "last_name"  => $user['last_name'],
            "email"      => $user['email'],
            "role"       => $user['role'],
            "job_title"  => $user['job_title'] ?? 'Dirigeant',
            "avatar_url" => $user['avatar_url'] ?? $avatarUrl
        ] : null
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["error" => "Erreur Serveur lors de l'authentification Google : " . $e->getMessage()]);
}
