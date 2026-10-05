<?php
// public/api/invoices.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$dbPath = __DIR__ . '/../../dev_db.json';
$useMysql = isset($pdo) && $pdo instanceof PDO;
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;
        
        if ($useMysql) {
            if ($company_id) {
                $stmt = $pdo->prepare("
                    SELECT i.id, i.invoice_number as invoiceNumber, 
                           COALESCE(c.company, c.name, 'Client MDIV') as clientName,
                           i.client_id as clientId,
                           DATE_FORMAT(i.date, '%d/%m/%Y') as date,
                           DATE_FORMAT(i.due_date, '%d/%m/%Y') as dueDate,
                           i.amount_ht as amountHT,
                           i.amount_ttc as amountTTC, 
                           i.downpayment as downpayment,
                           i.status,
                           i.lines
                    FROM invoices i
                    LEFT JOIN clients c ON i.client_id = c.id
                    WHERE i.company_id = ?
                    ORDER BY i.id DESC LIMIT 100
                ");
                $stmt->execute([$company_id]);
            } else {
                $stmt = $pdo->query("
                    SELECT i.id, i.invoice_number as invoiceNumber, 
                           COALESCE(c.company, c.name, 'Client MDIV') as clientName,
                           i.client_id as clientId,
                           DATE_FORMAT(i.date, '%d/%m/%Y') as date,
                           DATE_FORMAT(i.due_date, '%d/%m/%Y') as dueDate,
                           i.amount_ht as amountHT,
                           i.amount_ttc as amountTTC, 
                           i.downpayment as downpayment,
                           i.status,
                           i.lines
                    FROM invoices i
                    LEFT JOIN clients c ON i.client_id = c.id
                    ORDER BY i.id DESC LIMIT 100
                ");
            }
            $dbInvoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($dbInvoices ?: [], JSON_UNESCAPED_UNICODE);
            exit;
        } else {
            $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['invoices' => []];
            $invoices = $db['invoices'] ?? [];
            if ($company_id) {
                $invoices = array_filter($invoices, function($inv) use ($company_id) {
                    return isset($inv['company_id']) && (int)$inv['company_id'] === $company_id;
                });
            }
            echo json_encode(array_values($invoices), JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    if ($method === 'POST') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: [];

        if (isset($data['action']) && $data['action'] === 'delete') {
            $deleteId = $data['id'] ?? '';
            if ($useMysql && $deleteId) {
                $stmt = $pdo->prepare("DELETE FROM invoices WHERE id = ?");
                $stmt->execute([$deleteId]);
            } elseif ($deleteId && file_exists($dbPath)) {
                $db = json_decode(file_get_contents($dbPath), true);
                $db['invoices'] = array_values(array_filter($db['invoices'] ?? [], fn($inv) => (string)$inv['id'] !== (string)$deleteId));
                file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
            echo json_encode(['success' => true, 'message' => "Facture supprimée."]);
            exit;
        }

        $company_id = isset($data['company_id']) ? intval($data['company_id']) : 1;
        $id = !empty($data['id']) ? (string)$data['id'] : ('inv_' . time() . '_' . rand(100, 999));
        $invoiceNumber = $data['invoiceNumber'] ?? ('FAC-' . date('Y') . '-' . rand(1000, 9999));
        $clientId = !empty($data['clientId']) ? $data['clientId'] : null;
        $clientName = $data['clientName'] ?? 'Client Partenaire';
        $date = $data['date'] ?? date('Y-m-d');
        $dueDate = $data['dueDate'] ?? date('Y-m-d', strtotime('+30 days'));
        $amountHT = floatval($data['amountHT'] ?? $data['totalHT'] ?? 0);
        $amountTTC = floatval($data['amountTTC'] ?? $data['totalTTC'] ?? 0);
        $downpayment = floatval($data['downpayment'] ?? 0);
        $lines = $data['lines'] ?? [];
        $status = $data['status'] ?? 'pending';

        $invoice = [
            'id' => $id,
            'company_id' => $company_id,
            'invoiceNumber' => $invoiceNumber,
            'clientId' => $clientId,
            'clientName' => $clientName,
            'date' => $date,
            'dueDate' => $dueDate,
            'amountHT' => $amountHT,
            'amountTTC' => $amountTTC,
            'downpayment' => $downpayment,
            'lines' => $lines,
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if ($useMysql) {
            $stmt = $pdo->prepare("
                INSERT INTO invoices (id, company_id, invoice_number, client_id, date, due_date, amount_ht, amount_ttc, downpayment, lines, status)
                VALUES (:id, :company_id, :invoice_number, :client_id, :date, :due_date, :amount_ht, :amount_ttc, :downpayment, :lines, :status)
                ON DUPLICATE KEY UPDATE
                invoice_number = VALUES(invoice_number), client_id = VALUES(client_id), date = VALUES(date),
                due_date = VALUES(due_date), amount_ht = VALUES(amount_ht), amount_ttc = VALUES(amount_ttc),
                downpayment = VALUES(downpayment), lines = VALUES(lines), status = VALUES(status)
            ");
            $stmt->execute([
                ':id' => $id,
                ':company_id' => $company_id,
                ':invoice_number' => $invoiceNumber,
                ':client_id' => $clientId,
                ':date' => $date,
                ':due_date' => $dueDate,
                ':amount_ht' => $amountHT,
                ':amount_ttc' => $amountTTC,
                ':downpayment' => $downpayment,
                ':lines' => json_encode($lines, JSON_UNESCAPED_UNICODE),
                ':status' => $status
            ]);
        } else {
            $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['invoices' => []];
            if (!isset($db['invoices'])) $db['invoices'] = [];
            
            $idx = -1;
            foreach ($db['invoices'] as $i => $item) {
                if ((string)$item['id'] === (string)$id) {
                    $idx = $i;
                    break;
                }
            }
            if ($idx >= 0) {
                $db['invoices'][$idx] = array_merge($db['invoices'][$idx], $invoice);
            } else {
                $invoice['createdAt'] = date('Y-m-d H:i:s');
                array_unshift($db['invoices'], $invoice);
            }
            file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        echo json_encode(['success' => true, 'invoice' => $invoice], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'DELETE') {
        $deleteId = $_GET['id'] ?? '';
        if ($useMysql && $deleteId) {
            $stmt = $pdo->prepare("DELETE FROM invoices WHERE id = ?");
            $stmt->execute([$deleteId]);
        } elseif ($deleteId && file_exists($dbPath)) {
            $db = json_decode(file_get_contents($dbPath), true);
            $db['invoices'] = array_values(array_filter($db['invoices'] ?? [], fn($inv) => (string)$inv['id'] !== (string)$deleteId));
            file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        echo json_encode(['success' => true, 'message' => "Facture supprimée avec succès."]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

