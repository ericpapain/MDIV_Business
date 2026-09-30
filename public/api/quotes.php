<?php
// public/api/quotes.php
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
        
        $quote_company_id = isset($input['company_id']) ? intval($input['company_id']) : ($company_id ?: 1);
        $client_id = !empty($input['clientId']) ? intval($input['clientId']) : null;
        $client_name = $input['clientName'] ?? 'Client';
        $quote_number = $input['quoteNumber'] ?? ('DEV-' . date('Y') . '-' . rand(1000, 9999));
        $date = $input['date'] ?? date('Y-m-d');
        $total_ht = floatval($input['totalHT'] ?? 0);
        $total_vat = floatval($input['totalVAT'] ?? 0);
        $total_ttc = floatval($input['totalTTC'] ?? 0);
        $status = $input['status'] ?? 'draft';
        $executive_summary = $input['executiveSummary'] ?? '';
        $payment_terms = $input['paymentTerms'] ?? '30 jours net';
        $lines = $input['lines'] ?? [];

        try {
            $pdo = get_db_connection();
            $stmt = $pdo->prepare("
                INSERT INTO quotes (company_id, client_id, quote_number, status, total_ht, total_vat, total_ttc, executive_summary, payment_terms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$quote_company_id, $client_id, $quote_number, $status, $total_ht, $total_vat, $total_ttc, $executive_summary, $payment_terms]);
            $newId = $pdo->lastInsertId();

            $newQuote = [
                'id' => $newId,
                'company_id' => $quote_company_id,
                'clientId' => $client_id,
                'clientName' => $client_name,
                'quoteNumber' => $quote_number,
                'date' => $date,
                'totalHT' => $total_ht,
                'totalVAT' => $total_vat,
                'totalTTC' => $total_ttc,
                'status' => $status,
                'executiveSummary' => $executive_summary,
                'paymentTerms' => $payment_terms,
                'lines' => $lines,
                'createdAt' => date('c')
            ];

            echo json_encode(['success' => true, 'quote' => $newQuote], JSON_UNESCAPED_UNICODE);
            exit(0);
        } catch (Exception $e) {
            $devDbPath = __DIR__ . '/../../dev_db.json';
            if (file_exists($devDbPath)) {
                $db = json_decode(file_get_contents($devDbPath), true) ?: [];
                if (!isset($db['quotes'])) $db['quotes'] = [];
                $newQuote = [
                    'id' => 'dev_' . time(),
                    'company_id' => $quote_company_id,
                    'clientId' => $client_id,
                    'clientName' => $client_name,
                    'quoteNumber' => $quote_number,
                    'date' => $date,
                    'totalHT' => $total_ht,
                    'totalVAT' => $total_vat,
                    'totalTTC' => $total_ttc,
                    'status' => $status,
                    'executiveSummary' => $executive_summary,
                    'paymentTerms' => $payment_terms,
                    'lines' => $lines,
                    'createdAt' => date('c')
                ];
                array_unshift($db['quotes'], $newQuote);
                file_put_contents($devDbPath, json_encode($db, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true, 'quote' => $newQuote], JSON_UNESCAPED_UNICODE);
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
                $stmt = $pdo->prepare("DELETE FROM quotes WHERE id = ? AND company_id = ?");
                $stmt->execute([$id, $company_id]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM quotes WHERE id = ?");
                $stmt->execute([$id]);
            }
            echo json_encode(['success' => true]);
            exit(0);
        } catch (Exception $e) {
            $devDbPath = __DIR__ . '/../../dev_db.json';
            if (file_exists($devDbPath)) {
                $db = json_decode(file_get_contents($devDbPath), true) ?: [];
                $db['quotes'] = array_values(array_filter($db['quotes'] ?? [], function($q) use ($id, $company_id) {
                    return !($q['id'] == $id && (!$company_id || $q['company_id'] == $company_id));
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
                SELECT q.*, c.name as clientName, c.company as clientCompany 
                FROM quotes q 
                LEFT JOIN clients c ON q.client_id = c.id 
                WHERE q.company_id = ? 
                ORDER BY q.id DESC LIMIT 100
            ");
            $stmt->execute([$company_id]);
        } else {
            $stmt = $pdo->query("
                SELECT q.*, c.name as clientName, c.company as clientCompany 
                FROM quotes q 
                LEFT JOIN clients c ON q.client_id = c.id 
                ORDER BY q.id DESC LIMIT 100
            ");
        }
        $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($quotes ?: [], JSON_UNESCAPED_UNICODE);
        exit(0);
    } catch (Exception $e) {
        $devDbPath = __DIR__ . '/../../dev_db.json';
        if (file_exists($devDbPath)) {
            $db = json_decode(file_get_contents($devDbPath), true) ?: [];
            $quotes = $db['quotes'] ?? [];
            if ($company_id) {
                $quotes = array_values(array_filter($quotes, function($q) use ($company_id) {
                    return isset($q['company_id']) ? ($q['company_id'] == $company_id) : true;
                }));
            }
            echo json_encode($quotes, JSON_UNESCAPED_UNICODE);
            exit(0);
        }
        echo json_encode([]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
