<?php
// public/api/clients.php - Gestion des Tiers & Clients B2B (Conformité PPF & Réforme 2026)
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

function is_valid_luhn($code) {
    $cleaned = preg_replace('/\s+/', '', (string)$code);
    if (!ctype_digit($cleaned) || strlen($cleaned) === 0) return false;
    $sum = 0;
    $len = strlen($cleaned);
    for ($i = 0; $i < $len; $i++) {
        $digit = intval($cleaned[$len - 1 - $i]);
        if ($i % 2 === 1) {
            $digit *= 2;
            if ($digit > 9) $digit -= 9;
        }
        $sum += $digit;
    }
    return ($sum % 10 === 0);
}

function compute_french_vat($siren) {
    $cleaned = substr(preg_replace('/\s+/', '', (string)$siren), 0, 9);
    if (strlen($cleaned) !== 9 || !ctype_digit($cleaned)) return '';
    $num = intval($cleaned);
    $key = (12 + 3 * ($num % 97)) % 97;
    $keyStr = ($key < 10) ? '0' . $key : (string)$key;
    return 'FR' . $keyStr . $cleaned;
}

try {
    $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $name = trim($input['name'] ?? '');
        $company = trim($input['company'] ?? $name);
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $address = trim($input['address'] ?? '');
        $postal_code = trim($input['postal_code'] ?? '');
        $city = trim($input['city'] ?? '');
        $country_code = strtoupper(trim($input['country_code'] ?? 'FR')) ?: 'FR';
        $siret = preg_replace('/\s+/', '', trim($input['siret'] ?? ''));
        $siren = preg_replace('/\s+/', '', trim($input['siren'] ?? ''));
        if (empty($siren) && strlen($siret) >= 9) {
            $siren = substr($siret, 0, 9);
        }
        $vat_number = strtoupper(trim($input['vat_number'] ?? ''));
        if (empty($vat_number) && !empty($siren)) {
            $vat_number = compute_french_vat($siren);
        }
        $ppf_routing_id = trim($input['ppf_routing_id'] ?? '');
        $notes = trim($input['notes'] ?? '');
        $client_company_id = isset($input['company_id']) ? intval($input['company_id']) : ($company_id ?: 1);

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom du client est obligatoire']);
            exit(0);
        }

        if (!empty($siret) && !is_valid_luhn($siret)) {
            http_response_code(422);
            echo json_encode(['error' => 'Le numéro SIRET fourni est invalide (contrôle de clé de Luhn échoué).']);
            exit(0);
        }

        try {
            $pdo = get_db_connection();
            $stmt = $pdo->prepare("
                INSERT INTO clients (company_id, name, company, siren, siret, vat_number, country_code, postal_code, city, ppf_routing_id, email, phone, address, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $client_company_id, $name, $company, 
                $siren ?: null, $siret ?: null, $vat_number ?: null, 
                $country_code, $postal_code ?: null, $city ?: null, 
                $ppf_routing_id ?: null, $email, $phone, $address, $notes
            ]);
            $newId = $pdo->lastInsertId();

            $newClient = [
                'id' => $newId,
                'company_id' => $client_company_id,
                'name' => $name,
                'company' => $company,
                'siren' => $siren,
                'siret' => $siret,
                'vat_number' => $vat_number,
                'country_code' => $country_code,
                'postal_code' => $postal_code,
                'city' => $city,
                'ppf_routing_id' => $ppf_routing_id,
                'email' => $email,
                'phone' => $phone,
                'address' => $address,
                'notes' => $notes
            ];

            echo json_encode(['success' => true, 'client' => $newClient], JSON_UNESCAPED_UNICODE);
            exit(0);
        } catch (Exception $e) {
            // Sauvegarde de secours dans dev_db.json
            $devDbPath = __DIR__ . '/../../dev_db.json';
            if (file_exists($devDbPath)) {
                $db = json_decode(file_get_contents($devDbPath), true) ?: [];
                if (!isset($db['clients'])) $db['clients'] = [];
                $newId = count($db['clients']) + 1;
                $newClient = [
                    'id' => $newId,
                    'company_id' => $client_company_id,
                    'name' => $name,
                    'company' => $company,
                    'siren' => $siren,
                    'siret' => $siret,
                    'vat_number' => $vat_number,
                    'country_code' => $country_code,
                    'postal_code' => $postal_code,
                    'city' => $city,
                    'ppf_routing_id' => $ppf_routing_id,
                    'email' => $email,
                    'phone' => $phone,
                    'address' => $address,
                    'notes' => $notes,
                    'createdAt' => date('c')
                ];
                $db['clients'][] = $newClient;
                file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true, 'client' => $newClient], JSON_UNESCAPED_UNICODE);
                exit(0);
            }
            throw $e;
        }
    }

    // GET
    try {
        $pdo = get_db_connection();
        if ($company_id) {
            $stmt = $pdo->prepare("SELECT id, company_id, name, company, siren, siret, vat_number, country_code, postal_code, city, ppf_routing_id, email, phone, address, notes FROM clients WHERE company_id = ? ORDER BY id DESC LIMIT 100");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("SELECT id, company_id, name, company, siren, siret, vat_number, country_code, postal_code, city, ppf_routing_id, email, phone, address, notes FROM clients ORDER BY id DESC LIMIT 100");
        }
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($clients ?: [], JSON_UNESCAPED_UNICODE);
        exit(0);
    } catch (Exception $e) {
        $devDbPath = __DIR__ . '/../../dev_db.json';
        if (file_exists($devDbPath)) {
            $db = json_decode(file_get_contents($devDbPath), true) ?: [];
            $clients = $db['clients'] ?? [];
            if ($company_id) {
                $clients = array_values(array_filter($clients, function($c) use ($company_id) {
                    return isset($c['company_id']) ? ($c['company_id'] == $company_id) : true;
                }));
            }
            echo json_encode($clients, JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        echo json_encode([]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
