<?php
// public/api/clients.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
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
        $notes = trim($input['notes'] ?? '');
        $client_company_id = isset($input['company_id']) ? intval($input['company_id']) : ($company_id ?: 1);

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nom du client est obligatoire']);
            exit(0);
        }

        try {
            $pdo = get_db_connection();
            $stmt = $pdo->prepare("
                INSERT INTO clients (company_id, name, company, email, phone, address, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$client_company_id, $name, $company, $email, $phone, $address, $notes]);
            $newId = $pdo->lastInsertId();

            $newClient = [
                'id' => $newId,
                'company_id' => $client_company_id,
                'name' => $name,
                'company' => $company,
                'email' => $email,
                'phone' => $phone,
                'address' => $address,
                'notes' => $notes
            ];

            echo json_encode(['success' => true, 'client' => $newClient], JSON_UNESCAPED_UNICODE);
            exit(0);
        } catch (Exception $e) {
            // Sauvegarde dans dev_db.json si MySQL n'est pas configuré
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
            $stmt = $pdo->prepare("SELECT id, company_id, name, email, phone, company, address, notes FROM clients WHERE company_id = ? ORDER BY id DESC LIMIT 100");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("SELECT id, company_id, name, email, phone, company, address, notes FROM clients ORDER BY id DESC LIMIT 100");
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
