<?php
// public/api/projects.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $prj_company_id = isset($input['company_id']) ? intval($input['company_id']) : ($company_id ?: 1);
        $client_id = !empty($input['clientId']) ? intval($input['clientId']) : null;
        $quote_id = !empty($input['quoteId']) ? intval($input['quoteId']) : null;
        $title = trim($input['title'] ?? 'Nouveau Chantier / Projet');
        $description = trim($input['description'] ?? '');
        $budget = floatval($input['budget'] ?? 0);
        $status = $input['status'] ?? 'in_progress';
        $start_date = $input['startDate'] ?? date('Y-m-d');
        $end_date = $input['endDate'] ?? null;
        $client_name = $input['clientName'] ?? 'Client';

        try {
            $pdo = get_db_connection();
            $stmt = $pdo->prepare("
                INSERT INTO projects (company_id, client_id, quote_id, title, description, budget, status, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$prj_company_id, $client_id, $quote_id, $title, $description, $budget, $status, $start_date, $end_date]);
            $newId = $pdo->lastInsertId();

            $newProject = [
                'id' => $newId,
                'company_id' => $prj_company_id,
                'clientId' => $client_id,
                'clientName' => $client_name,
                'quoteId' => $quote_id,
                'title' => $title,
                'description' => $description,
                'budget' => $budget,
                'status' => $status,
                'startDate' => $start_date,
                'endDate' => $end_date,
                'createdAt' => date('c')
            ];

            echo json_encode(['success' => true, 'project' => $newProject], JSON_UNESCAPED_UNICODE);
            exit(0);
        } catch (Exception $e) {
            $devDbPath = __DIR__ . '/../../dev_db.json';
            if (file_exists($devDbPath)) {
                $db = json_decode(file_get_contents($devDbPath), true) ?: [];
                if (!isset($db['projects'])) $db['projects'] = [];
                $newProject = [
                    'id' => 'prj_' . time(),
                    'company_id' => $prj_company_id,
                    'clientId' => $client_id,
                    'clientName' => $client_name,
                    'quoteId' => $quote_id,
                    'title' => $title,
                    'description' => $description,
                    'budget' => $budget,
                    'status' => $status,
                    'startDate' => $start_date,
                    'endDate' => $end_date,
                    'createdAt' => date('c')
                ];
                array_unshift($db['projects'], $newProject);
                file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true, 'project' => $newProject], JSON_UNESCAPED_UNICODE);
                exit(0);
            }
            throw $e;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Identifiant requis']);
            exit(0);
        }

        try {
            $pdo = get_db_connection();
            if ($company_id) {
                $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ? AND company_id = ?");
                $stmt->execute([$id, $company_id]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
                $stmt->execute([$id]);
            }
            echo json_encode(['success' => true]);
            exit(0);
        } catch (Exception $e) {
            $devDbPath = __DIR__ . '/../../dev_db.json';
            if (file_exists($devDbPath)) {
                $db = json_decode(file_get_contents($devDbPath), true) ?: [];
                $db['projects'] = array_values(array_filter($db['projects'] ?? [], function($p) use ($id, $company_id) {
                    return !($p['id'] == $id && (!$company_id || $p['company_id'] == $company_id));
                }));
                file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true]);
                exit(0);
            }
        }
    }

    // GET
    try {
        $pdo = get_db_connection();
        if ($company_id) {
            $stmt = $pdo->prepare("
                SELECT p.*, c.name as clientName, c.company as clientCompany 
                FROM projects p 
                LEFT JOIN clients c ON p.client_id = c.id 
                WHERE p.company_id = ? 
                ORDER BY p.id DESC LIMIT 100
            ");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("
                SELECT p.*, c.name as clientName, c.company as clientCompany 
                FROM projects p 
                LEFT JOIN clients c ON p.client_id = c.id 
                ORDER BY p.id DESC LIMIT 100
            ");
        }
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($projects ?: [], JSON_UNESCAPED_UNICODE);
        exit(0);
    } catch (Exception $e) {
        $devDbPath = __DIR__ . '/../../dev_db.json';
        if (file_exists($devDbPath)) {
            $db = json_decode(file_get_contents($devDbPath), true) ?: [];
            $projects = $db['projects'] ?? [];
            if ($company_id) {
                $projects = array_values(array_filter($projects, function($p) use ($company_id) {
                    return isset($p['company_id']) ? ($p['company_id'] == $company_id) : true;
                }));
            }
            echo json_encode($projects, JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        echo json_encode([]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
