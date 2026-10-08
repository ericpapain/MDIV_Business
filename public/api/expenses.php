<?php
// public/api/expenses.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$dbPath = __DIR__ . '/../../dev_db.json';

// Si MySQL est configuré via config.php
$useMysql = isset($pdo) && $pdo instanceof PDO;

if ($method === 'GET') {
    $companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : 0;
    
    if (!$companyId) {
        echo json_encode(['success' => false, 'error' => 'Unauthorized or missing company_id']);
        exit;
    }

    $projectId = $_GET['project_id'] ?? null;
    $clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : null;
    $category = $_GET['category'] ?? null;

    if ($useMysql) {
        $sql = "SELECT * FROM company_expenses WHERE company_id = :cid";
        $params = [':cid' => $companyId];
        if ($projectId) {
            $sql .= " AND project_id = :pid";
            $params[':pid'] = $projectId;
        }
        if ($clientId) {
            $sql .= " AND client_id = :clid";
            $params[':clid'] = $clientId;
        }
        if ($category) {
            $sql .= " AND category = :cat";
            $params[':cat'] = $category;
        }
        $sql .= " ORDER BY date DESC, id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['expenses' => []];
        $all = $db['expenses'] ?? [];
        $expenses = array_filter($all, function($exp) use ($companyId, $projectId, $clientId, $category) {
            if ($companyId && ($exp['company_id'] ?? 1) !== $companyId) return false;
            if ($projectId && ($exp['project_id'] ?? '') !== $projectId) return false;
            if ($clientId && ($exp['client_id'] ?? 0) !== $clientId) return false;
            if ($category && ($exp['category'] ?? '') !== $category) return false;
            return true;
        });
        $expenses = array_values($expenses);
    }

    $totalHT = 0.0;
    $totalTVA = 0.0;
    $totalTTC = 0.0;
    $byCategory = [];

    foreach ($expenses as $item) {
        $ht = (float)($item['amount_ht'] ?? $item['total_ht'] ?? 0);
        $tva = (float)($item['amount_tva'] ?? $item['total_vat'] ?? 0);
        $ttc = (float)($item['amount_ttc'] ?? $item['total_ttc'] ?? 0);
        $cat = $item['category'] ?? 'autre';

        $totalHT += $ht;
        $totalTVA += $tva;
        $totalTTC += $ttc;
        $byCategory[$cat] = ($byCategory[$cat] ?? 0.0) + $ttc;
    }


    echo json_encode([
        'success' => true,
        'expenses' => $expenses,
        'stats' => [
            'totalHT' => $totalHT,
            'totalTVA' => $totalTVA,
            'totalTTC' => $totalTTC,
            'count' => count($expenses),
            'byCategory' => $byCategory
        ]
    ]);
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $companyId = (int)($data['company_id'] ?? 0);
    
    if (!$companyId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized or missing company_id']);
        exit;
    }

    $expense = [
        'id' => $data['id'] ?? ('exp_' . time() . '_' . rand(100, 999)),
        'company_id' => $companyId,
        'project_id' => $data['project_id'] ?? null,
        'client_id' => isset($data['client_id']) ? (int)$data['client_id'] : null,
        'merchant' => $data['merchant'] ?? 'Fournisseur Inconnu',
        'category' => $data['category'] ?? 'materiaux',
        'invoice_number' => $data['invoice_number'] ?? ('REC-' . time()),
        'date' => $data['date'] ?? date('Y-m-d'),
        'amount_ht' => (float)($data['amount_ht'] ?? 0),
        'amount_tva' => (float)($data['amount_tva'] ?? 0),
        'tva_rate' => (float)($data['tva_rate'] ?? 20),
        'amount_ttc' => (float)($data['amount_ttc'] ?? 0),
        'payment_method' => $data['payment_method'] ?? 'cb',
        'receipt_url' => $data['receipt_url'] ?? null,
        'notes' => $data['notes'] ?? '',
        'created_at' => date('Y-m-d H:i:s')
    ];

    if ($useMysql) {
        $sql = "INSERT INTO company_expenses 
                (id, company_id, project_id, client_id, merchant, category, invoice_number, date, amount_ht, amount_tva, tva_rate, amount_ttc, payment_method, receipt_url, notes)
                VALUES 
                (:id, :company_id, :project_id, :client_id, :merchant, :category, :invoice_number, :date, :amount_ht, :amount_tva, :tva_rate, :amount_ttc, :payment_method, :receipt_url, :notes)
                ON DUPLICATE KEY UPDATE 
                merchant = VALUES(merchant), category = VALUES(category), date = VALUES(date), amount_ht = VALUES(amount_ht), amount_tva = VALUES(amount_tva), amount_ttc = VALUES(amount_ttc), notes = VALUES(notes)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $expense['id'],
            ':company_id' => $expense['company_id'],
            ':project_id' => $expense['project_id'],
            ':client_id' => $expense['client_id'],
            ':merchant' => $expense['merchant'],
            ':category' => $expense['category'],
            ':invoice_number' => $expense['invoice_number'],
            ':date' => $expense['date'],
            ':amount_ht' => $expense['amount_ht'],
            ':amount_tva' => $expense['amount_tva'],
            ':tva_rate' => $expense['tva_rate'],
            ':amount_ttc' => $expense['amount_ttc'],
            ':payment_method' => $expense['payment_method'],
            ':receipt_url' => $expense['receipt_url'],
            ':notes' => $expense['notes']
        ]);
    } else {
        $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['expenses' => []];
        if (!isset($db['expenses'])) $db['expenses'] = [];
        
        $idx = -1;
        foreach ($db['expenses'] as $i => $item) {
            if ($item['id'] === $expense['id']) {
                $idx = $i;
                break;
            }
        }
        if ($idx >= 0) {
            $db['expenses'][$idx] = $expense;
        } else {
            array_unshift($db['expenses'], $expense);
        }
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    echo json_encode(['success' => true, 'expense' => $expense]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($useMysql && $id) {
        $stmt = $pdo->prepare("DELETE FROM company_expenses WHERE id = :id");
        $stmt->execute([':id' => $id]);
    } elseif ($id && file_exists($dbPath)) {
        $db = json_decode(file_get_contents($dbPath), true);
        $db['expenses'] = array_values(array_filter($db['expenses'] ?? [], fn($e) => $e['id'] !== $id));
        file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    echo json_encode(['success' => true, 'message' => "Dépense supprimée."]);
    exit;
}
