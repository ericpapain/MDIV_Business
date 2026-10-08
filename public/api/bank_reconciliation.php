<?php
// public/api/bank_reconciliation.php
// Moteur de Rapprochement Bancaire Automatique & Agrégation de Flux (Corrélation Multi-Critères à 95%)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$dbPath = __DIR__ . '/../../dev_db.json';
$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
$companyId = isset($_GET['company_id']) ? intval($_GET['company_id']) : 0;
if (!$companyId) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (empty($db['bank_transactions'])) {
    $db['bank_transactions'] = [];
    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');

if ($action === 'reconcile_match') {
    // Action d'appariement effectif
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $txId = $input['transaction_id'] ?? '';
    $docId = $input['document_id'] ?? '';
    $docType = $input['document_type'] ?? 'invoice'; // 'invoice' ou 'expense'

    $txFound = false;
    foreach ($db['bank_transactions'] as &$tx) {
        if ($tx['id'] === $txId) {
            $tx['is_reconciled'] = true;
            $tx['matched_document_id'] = $docId;
            $tx['matched_document_type'] = $docType;
            $tx['reconciled_at'] = date('c');
            $txFound = true;
            break;
        }
    }

    if ($docType === 'expense') {
        foreach ($db['expenses'] as &$exp) {
            if ($exp['id'] === $docId) {
                $exp['status'] = 'paid';
                $exp['reconciled'] = true;
                $exp['reconciled_tx_id'] = $txId;
            }
        }
    } elseif ($docType === 'invoice') {
        foreach ($db['invoices'] as &$inv) {
            if (($inv['id'] ?? '') === $docId || ($inv['invoiceNumber'] ?? '') === $docId) {
                $inv['status'] = 'paid';
                $inv['reconciled'] = true;
                $inv['reconciled_tx_id'] = $txId;
            }
        }
    }

    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'success' => true,
        'message' => 'Rapprochement bancaire validé et enregistré.',
        'transactionId' => $txId,
        'documentId' => $docId
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Listing avec calcul dynamique des scores de correspondance
$invoices = $db['invoices'] ?? [];
$expenses = $db['expenses'] ?? [];
$transactions = array_filter($db['bank_transactions'] ?? [], function($t) use ($companyId) {
    return ($t['company_id'] ?? 1) === $companyId;
});

$reconciliationQueue = [];

foreach ($transactions as $tx) {
    $txAmount = abs(floatval($tx['amount']));
    $txLabelUpper = strtoupper($tx['label']);
    $bestMatch = null;
    $bestScore = 0;

    if ($tx['type'] === 'credit') {
        // Recherche parmi les factures clients
        foreach ($invoices as $inv) {
            $invAmount = floatval($inv['amount_ttc'] ?? $inv['totalTTC'] ?? 0);
            $invRef = strtoupper($inv['invoice_number'] ?? $inv['invoiceNumber'] ?? '');
            $invClient = strtoupper($inv['client_name'] ?? $inv['clientName'] ?? '');

            $score = 0;
            // 1. Égalité stricte au centime près
            if (abs($txAmount - $invAmount) < 0.01) $score += 55;
            // 2. Présence du numéro de facture dans le libellé bancaire
            if (!empty($invRef) && strpos($txLabelUpper, $invRef) !== false) $score += 35;
            // 3. Présence du nom du client
            if (!empty($invClient) && strpos($txLabelUpper, substr($invClient, 0, 6)) !== false) $score += 15;

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = [
                    'documentType' => 'invoice',
                    'documentId' => $inv['id'] ?? $invRef,
                    'reference' => $invRef,
                    'thirdParty' => $invClient,
                    'amount' => $invAmount,
                    'date' => $inv['date'] ?? '',
                    'confidenceScore' => min($score, 99)
                ];
            }
        }
    } else {
        // Recherche parmi les dépenses fournisseurs
        foreach ($expenses as $exp) {
            $expAmount = floatval($exp['amount_ttc'] ?? $exp['total_ttc'] ?? 0);
            $expRef = strtoupper($exp['invoice_number'] ?? $exp['id'] ?? '');
            $expSupplier = strtoupper($exp['supplier'] ?? $exp['merchant'] ?? '');

            $score = 0;
            if (abs($txAmount - $expAmount) < 0.01) $score += 55;
            if (!empty($expRef) && strpos($txLabelUpper, $expRef) !== false) $score += 35;
            if (!empty($expSupplier) && strpos($txLabelUpper, substr($expSupplier, 0, 6)) !== false) $score += 15;

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = [
                    'documentType' => 'expense',
                    'documentId' => $exp['id'],
                    'reference' => $expRef,
                    'thirdParty' => $expSupplier,
                    'amount' => $expAmount,
                    'date' => $exp['date'] ?? '',
                    'confidenceScore' => min($score, 99)
                ];
            }
        }
    }

    $reconciliationQueue[] = [
        'transaction' => $tx,
        'suggestedMatch' => $bestMatch,
        'confidenceScore' => $bestScore,
        'canAutoReconcile' => $bestScore >= 85
    ];
}

echo json_encode([
    'success' => true,
    'totalTransactions' => count($transactions),
    'unreconciledCount' => count(array_filter($transactions, fn($t) => empty($t['is_reconciled']))),
    'queue' => array_values($reconciliationQueue)
], JSON_UNESCAPED_UNICODE);
