<?php
require_once '../config.php';

// Lire les données JSON
$inputData = json_decode(file_get_contents("php://input"), true);

// 1. Données Entreprise
$rawSiren = trim($inputData['siren'] ?? '');
$cleanSiren = !empty($rawSiren) ? preg_replace('/[^0-9]/', '', $rawSiren) : null;
if ($cleanSiren && strlen($cleanSiren) !== 9) {
    http_response_code(400);
    echo json_encode(["error" => "Le numéro SIREN doit comporter exactement 9 chiffres."]);
    exit;
}

$companyName = trim($inputData['company_name'] ?? $inputData['legal_name'] ?? '');
$tradeName = trim($inputData['trade_name'] ?? '');
$siret = trim($inputData['siret'] ?? '');
$legalForm = trim($inputData['legal_form'] ?? '');
$nafCode = trim($inputData['naf_code'] ?? '');
$activity = trim($inputData['activity'] ?? '');
$address = trim($inputData['address'] ?? '');
$postalCode = trim($inputData['postal_code'] ?? '');
$city = trim($inputData['city'] ?? '');
$creationDate = trim($inputData['creation_date'] ?? '');
$employeeRange = trim($inputData['employee_range'] ?? '');
$capital = trim($inputData['capital'] ?? '');
$dataSource = trim($inputData['data_source'] ?? ($cleanSiren ? 'INSEE' : 'MANUAL'));
$companyStatus = !empty($cleanSiren) ? 'ACTIVE' : 'MANUAL';
$officialData = !empty($inputData['official_data']) ? json_encode($inputData['official_data']) : null;

// 2. Données Utilisateur (Responsable du compte)
$firstName = trim($inputData['first_name'] ?? '');
$lastName = trim($inputData['last_name'] ?? '');
$userEmail = trim($inputData['email'] ?? '');
$userPhone = trim($inputData['phone'] ?? '');
$jobTitle = trim($inputData['job_title'] ?? $inputData['function'] ?? 'Dirigeant');
$password = $inputData['password'] ?? '';

// Validation de base
if (empty($companyName)) {
    http_response_code(400);
    echo json_encode(["error" => "Le nom de l'entreprise ou la raison sociale est obligatoire."]);
    exit;
}

if (empty($userEmail) || !filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Veuillez fournir une adresse email professionnelle valide."]);
    exit;
}

if (empty($password) || strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["error" => "Le mot de passe doit comporter au moins 8 caractères."]);
    exit;
}

try {
    $pdo = get_db_connection();

    // 3. Vérification unicité de l'email
    $stmtEmail = $pdo->prepare("SELECT id FROM companies WHERE email = ? UNION SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmtEmail->execute([$userEmail, $userEmail]);
    if ($stmtEmail->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "Un compte existe déjà avec cette adresse email. Veuillez vous connecter."]);
        exit;
    }

    // 4. Vérification unicité du SIREN (si renseigné)
    if (!empty($cleanSiren)) {
        $stmtSiren = $pdo->prepare("SELECT id, company_name FROM companies WHERE siren = ? LIMIT 1");
        $stmtSiren->execute([$cleanSiren]);
        $existingSiren = $stmtSiren->fetch(PDO::FETCH_ASSOC);
        if ($existingSiren) {
            http_response_code(409);
            echo json_encode([
                "error" => "Cette entreprise (SIREN " . $cleanSiren . ") possède déjà un compte (" . $existingSiren['company_name'] . "). Connectez-vous ou contactez votre administrateur."
            ]);
            exit;
        }
    }

    // 5. Hachage sécurisé du mot de passe
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $pdo->beginTransaction();

    // 6. Insertion de l'Entreprise
    $stmtComp = $pdo->prepare("
        INSERT INTO companies (
            siren, siret, company_name, trade_name, legal_form, naf_code, activity,
            address, postal_code, city, country, creation_date, employee_range, capital,
            email, phone, company_status, data_source, official_data, password_hash, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'France', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    ");
    $stmtComp->execute([
        $cleanSiren, $siret, $companyName, $tradeName, $legalForm, $nafCode, $activity,
        $address, $postalCode, $city, $creationDate, $employeeRange, $capital,
        $userEmail, $userPhone, $companyStatus, $dataSource, $officialData, $passwordHash
    ]);

    $companyId = (int)$pdo->lastInsertId();

    // 7. Insertion de l'Utilisateur Responsable (Rôle ADMIN)
    $stmtUser = $pdo->prepare("
        INSERT INTO users (
            company_id, first_name, last_name, email, phone, job_title, password_hash, role, email_verified, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ADMIN', 1, 'active')
    ");
    $stmtUser->execute([
        $companyId,
        $firstName ?: 'Responsable',
        $lastName ?: $companyName,
        $userEmail,
        $userPhone,
        $jobTitle,
        $passwordHash
    ]);

    $userId = (int)$pdo->lastInsertId();

    $pdo->commit();

    // 8. Génération du JWT immédiat
    $payload = [
        "company_id" => $companyId,
        "company_name" => $companyName,
        "siren" => $cleanSiren,
        "email" => $userEmail,
        "user_id" => $userId,
        "role" => 'ADMIN'
    ];
    $token = generate_jwt($payload);

    echo json_encode([
        "success" => true,
        "message" => "Compte entreprise et profil administrateur créés avec succès.",
        "token" => $token,
        "company" => [
            "id" => $companyId,
            "name" => $companyName,
            "siren" => $cleanSiren,
            "siret" => $siret,
            "email" => $userEmail,
            "city" => $city,
            "plan_tier" => 'free',
            "role" => 'ADMIN'
        ],
        "user" => [
            "id" => $userId,
            "first_name" => $firstName,
            "last_name" => $lastName,
            "email" => $userEmail,
            "role" => 'ADMIN',
            "job_title" => $jobTitle
        ]
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de la création du compte : " . $e->getMessage()]);
}
