<?php
// public/api/ppf/deposit.php
// Gestionnaire du cycle de vie des statuts PPF (State Machine & Piste d'Audit Fiable)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$validStatuses = ['DEPOSEE', 'ACHEMINEE', 'REJETEE', 'REFUSEE', 'MISE_A_DISPOSITION', 'PRISE_EN_CHARGE', 'APPROUVEE', 'PAIEMENT_TRANSMIS', 'PAYEE'];

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$invoiceId = trim($input['invoiceId'] ?? $input['id'] ?? '');
$targetStatus = trim($input['status'] ?? $input['targetStatus'] ?? '');
$rejectionReason = trim($input['rejectionReason'] ?? $input['rejection_reason'] ?? '');

if (empty($invoiceId) || empty($targetStatus)) {
    http_response_code(400);
    echo json_encode(['error' => "L'identifiant de la facture et le statut cible sont obligatoires."]);
    exit;
}

if (!in_array($targetStatus, $validStatuses)) {
    http_response_code(400);
    echo json_encode(['error' => "Statut non reconnu. Statuts légaux autorisés : " . implode(', ', $validStatuses)]);
    exit;
}

$pdo = null;
try {
    $pdo = get_db_connection();
} catch (Exception $e) {}

$depositId = "PPF-DEP-" . time() . "-" . strtoupper(substr(md5(uniqid()), 0, 4));

if ($pdo instanceof PDO) {
    // Vérifier l'état actuel
    $stmt = $pdo->prepare("SELECT id, invoice_number, ppf_status, ppf_deposit_id FROM invoices WHERE id = ? OR invoice_number = ? LIMIT 1");
    $stmt->execute([$invoiceId, $invoiceId]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        http_response_code(404);
        echo json_encode(['error' => "Facture introuvable : $invoiceId"]);
        exit;
    }

    $previousStatus = $invoice['ppf_status'] ?? 'DEPOSEE';

    // Règle d'irréversibilité terminale
    if ($previousStatus === 'PAYEE' && $targetStatus !== 'PAYEE') {
        http_response_code(422);
        echo json_encode(['error' => "Action interdite : une facture avec le statut terminal PAYEE ne peut plus être modifiée."]);
        exit;
    }

    $activeDepositId = !empty($invoice['ppf_deposit_id']) ? $invoice['ppf_deposit_id'] : $depositId;
    $pafHash = hash('sha256', "{$invoice['invoice_number']}|{$previousStatus}|{$targetStatus}|{$activeDepositId}|" . date('c'));

    // Mise à jour de la facture
    $upStmt = $pdo->prepare("
        UPDATE invoices 
        SET ppf_status = ?, ppf_deposit_id = ?, rejection_reason = ? 
        WHERE id = ?
    ");
    $upStmt->execute([$targetStatus, $activeDepositId, $rejectionReason ?: null, $invoice['id']]);

    // Enregistrement Piste d'Audit Fiable (PAF)
    try {
        $pafStmt = $pdo->prepare("
            INSERT INTO paf_invoice_audit_trail (invoice_id, action, previous_status, new_status, payload_hash)
            VALUES (?, 'CHANGEMENT_STATUT_PPF', ?, ?, ?)
        ");
        $pafStmt->execute([$invoice['id'], $previousStatus, $targetStatus, $pafHash]);
    } catch (Exception $ePaf) {}

    echo json_encode([
        'success' => true,
        'invoiceId' => $invoice['id'],
        'invoiceNumber' => $invoice['invoice_number'],
        'previousStatus' => $previousStatus,
        'newStatus' => $targetStatus,
        'depositId' => $activeDepositId,
        'pafHash' => $pafHash,
        'message' => "Statut PPF de la facture {$invoice['invoice_number']} mis à jour : $targetStatus"
    ], JSON_UNESCAPED_UNICODE);
    exit;

} else {
    // Mode local dev_db.json
    $dbPath = __DIR__ . '/../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
    if (!isset($db['invoices'])) $db['invoices'] = [];
    if (!isset($db['pafAuditTrail'])) $db['pafAuditTrail'] = [];

    $idx = -1;
    foreach ($db['invoices'] as $i => $item) {
        if ((string)$item['id'] === (string)$invoiceId || ($item['invoiceNumber'] ?? '') === (string)$invoiceId) {
            $idx = $i;
            break;
        }
    }

    if ($idx === -1) {
        http_response_code(404);
        echo json_encode(['error' => "Facture introuvable : $invoiceId"]);
        exit;
    }

    $previousStatus = $db['invoices'][$idx]['ppf_status'] ?? 'DEPOSEE';
    if ($previousStatus === 'PAYEE' && $targetStatus !== 'PAYEE') {
        http_response_code(422);
        echo json_encode(['error' => "Action interdite : une facture avec le statut terminal PAYEE ne peut plus être modifiée."]);
        exit;
    }

    $activeDepositId = !empty($db['invoices'][$idx]['ppf_deposit_id']) ? $db['invoices'][$idx]['ppf_deposit_id'] : $depositId;
    $pafHash = hash('sha256', "{$db['invoices'][$idx]['invoiceNumber']}|{$previousStatus}|{$targetStatus}|{$activeDepositId}|" . date('c'));

    $db['invoices'][$idx]['ppf_status'] = $targetStatus;
    $db['invoices'][$idx]['ppf_deposit_id'] = $activeDepositId;
    if ($rejectionReason) $db['invoices'][$idx]['rejection_reason'] = $rejectionReason;

    $db['pafAuditTrail'][] = [
        'id' => 'paf_' . time() . '_' . rand(100, 999),
        'invoice_id' => $db['invoices'][$idx]['id'],
        'action' => 'CHANGEMENT_STATUT_PPF',
        'previous_status' => $previousStatus,
        'new_status' => $targetStatus,
        'payload_hash' => $pafHash,
        'timestamp' => date('c')
    ];

    file_put_contents($dbPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'success' => true,
        'invoiceId' => $db['invoices'][$idx]['id'],
        'invoiceNumber' => $db['invoices'][$idx]['invoiceNumber'],
        'previousStatus' => $previousStatus,
        'newStatus' => $targetStatus,
        'depositId' => $activeDepositId,
        'pafHash' => $pafHash,
        'message' => "Statut PPF de la facture mis à jour : $targetStatus"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
