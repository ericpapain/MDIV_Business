<?php
// public/api/create_mock_accounts.php
require_once 'config.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $pdo = get_db_connection();
    
    // Le mot de passe de test universel : "demo2026"
    $password_plain = "demo2026";
    $password_hash = password_hash($password_plain, PASSWORD_DEFAULT);
    
    $mock_accounts = [
        [
            'siren' => '111111111',
            'company_name' => 'Demo Creator (Gratuit)',
            'email' => 'creator@demo.com',
            'plan_tier' => 'free',
            'first_name' => 'Jean',
            'last_name' => 'Creator'
        ],
        [
            'siren' => '222222222',
            'company_name' => 'Demo Independent (Starter)',
            'email' => 'independent@demo.com',
            'plan_tier' => 'starter',
            'first_name' => 'Sophie',
            'last_name' => 'Independent'
        ],
        [
            'siren' => '333333333',
            'company_name' => 'Demo TPE (Pro)',
            'email' => 'tpe@demo.com',
            'plan_tier' => 'pro',
            'first_name' => 'Marc',
            'last_name' => 'Pro'
        ],
        [
            'siren' => '444444444',
            'company_name' => 'Demo PME (Enterprise - TOUS DROITS)',
            'email' => 'pme@demo.com',
            'plan_tier' => 'enterprise',
            'first_name' => 'Emma',
            'last_name' => 'Enterprise'
        ]
    ];
    
    $results = [];
    
    foreach ($mock_accounts as $acc) {
        // 1. Vérifier si l'entreprise existe déjà par email
        $stmt = $pdo->prepare("SELECT id FROM companies WHERE email = ?");
        $stmt->execute([$acc['email']]);
        $existing_company = $stmt->fetch();
        
        if ($existing_company) {
            // Mettre à jour le plan si l'entreprise existe
            $update = $pdo->prepare("UPDATE companies SET plan_tier = ?, password_hash = ? WHERE id = ?");
            $update->execute([$acc['plan_tier'], $password_hash, $existing_company['id']]);
            $company_id = $existing_company['id'];
            $results[] = "Entreprise {$acc['email']} mise à jour (Plan: {$acc['plan_tier']})";
        } else {
            // Créer l'entreprise
            $insertComp = $pdo->prepare("
                INSERT INTO companies (siren, company_name, email, plan_tier, password_hash, status) 
                VALUES (?, ?, ?, ?, ?, 'active')
            ");
            $insertComp->execute([$acc['siren'], $acc['company_name'], $acc['email'], $acc['plan_tier'], $password_hash]);
            $company_id = $pdo->lastInsertId();
            $results[] = "Entreprise {$acc['email']} créée (Plan: {$acc['plan_tier']})";
        }
        
        // 2. Créer l'utilisateur admin associé
        $stmtUser = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmtUser->execute([$acc['email']]);
        if (!$stmtUser->fetch()) {
            $insertUser = $pdo->prepare("
                INSERT INTO users (company_id, first_name, last_name, email, password_hash, role) 
                VALUES (?, ?, ?, ?, ?, 'ADMIN')
            ");
            $insertUser->execute([$company_id, $acc['first_name'], $acc['last_name'], $acc['email'], $password_hash]);
        }
    }
    
    echo json_encode([
        "success" => true, 
        "message" => "Comptes fictifs injectés avec succès.", 
        "password" => $password_plain,
        "logs" => $results
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
