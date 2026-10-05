<?php
// public/api/invoices_kpis.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;
$dbPath = __DIR__ . '/../../dev_db.json';
$useMysql = isset($pdo) && $pdo instanceof PDO;

$totalIssued = 0.0;
$totalPaid = 0.0;
$totalPending = 0.0;
$totalOverdue = 0.0;

try {
    if ($useMysql) {
        $sql = "SELECT amount_ttc, status, due_date FROM invoices";
        $params = [];
        if ($company_id) {
            $sql .= " WHERE company_id = ?";
            $params = [$company_id];
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $today = date('Y-m-d');
        foreach ($rows as $r) {
            $amt = floatval($r['amount_ttc'] ?? 0);
            $st = $r['status'] ?? 'pending';
            $dueDate = $r['due_date'] ?? $today;

            $totalIssued += $amt;
            if ($st === 'paid') {
                $totalPaid += $amt;
            } elseif ($st === 'overdue' || ($st === 'pending' && $dueDate < $today)) {
                $totalOverdue += $amt;
            } else {
                $totalPending += $amt;
            }
        }
    } else {
        $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['invoices' => []];
        $invoices = $db['invoices'] ?? [];
        if ($company_id) {
            $invoices = array_filter($invoices, fn($inv) => isset($inv['company_id']) && (int)$inv['company_id'] === $company_id);
        }
        $today = date('Y-m-d');
        foreach ($invoices as $inv) {
            $amt = floatval($inv['amountTTC'] ?? $inv['amount_ttc'] ?? 0);
            $st = $inv['status'] ?? 'pending';
            $dueDate = $inv['dueDate'] ?? $inv['due_date'] ?? $today;

            $totalIssued += $amt;
            if ($st === 'paid') {
                $totalPaid += $amt;
            } elseif ($st === 'overdue' || ($st === 'pending' && $dueDate < $today)) {
                $totalOverdue += $amt;
            } else {
                $totalPending += $amt;
            }
        }
    }
} catch (Exception $e) {}

echo json_encode([
    'totalIssued' => round($totalIssued, 2),
    'totalPaid' => round($totalPaid, 2),
    'totalPending' => round($totalPending, 2),
    'totalOverdue' => round($totalOverdue, 2)
], JSON_UNESCAPED_UNICODE);

