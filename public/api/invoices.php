<?php
// public/api/invoices.php - Moteur de Persistance des Factures (Norme Factur-X & Réforme 2026)
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
$pdo = null;
try {
    $pdo = get_db_connection();
} catch (Exception $e) {
    $pdo = null;
}
$useMysql = isset($pdo) && $pdo instanceof PDO;
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : null;
        
        if ($useMysql) {
            $sql = "
                SELECT i.id, i.invoice_number as invoiceNumber, 
                       COALESCE(c.company, c.name, 'Client MDIV') as clientName,
                       i.client_id as clientId,
                       c.siret as buyerSiret,
                       c.vat_number as buyerVat,
                       DATE_FORMAT(i.date, '%Y-%m-%d') as date,
                       DATE_FORMAT(i.due_date, '%Y-%m-%d') as dueDate,
                       i.operation_nature,
                       i.vat_payment_on_debit,
                       i.amount_ht as amountHT,
                       i.amount_ttc as amountTTC, 
                       i.currency,
                       i.invoice_type_code,
                       i.status,
                       i.ppf_status,
                       i.ppf_deposit_id,
                       i.sha256_hash,
                       i.created_at
                FROM invoices i
                LEFT JOIN clients c ON i.client_id = c.id
            ";
            if ($company_id) {
                $sql .= " WHERE i.company_id = ? ORDER BY i.id DESC LIMIT 100";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$company_id]);
            } else {
                $sql .= " ORDER BY i.id DESC LIMIT 100";
                $stmt = $pdo->query($sql);
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
        $invoiceNumber = trim($data['invoiceNumber'] ?? ('FAC-' . date('Y') . '-' . rand(1000, 9999)));
        $clientId = !empty($data['clientId']) ? intval($data['clientId']) : null;
        $clientName = trim($data['clientName'] ?? 'Client Partenaire');
        $date = $data['date'] ?? date('Y-m-d');
        $dueDate = $data['dueDate'] ?? date('Y-m-d', strtotime('+30 days'));
        $operationNature = in_array($data['operation_nature'] ?? '', ['goods', 'services', 'mixed']) ? $data['operation_nature'] : 'services';
        $vatPaymentOnDebit = !empty($data['vat_payment_on_debit']) ? 1 : 0;
        $amountHT = floatval($data['amountHT'] ?? $data['totalHT'] ?? 0);
        $amountTTC = floatval($data['amountTTC'] ?? $data['totalTTC'] ?? 0);
        $amountVAT = max(0, $amountTTC - $amountHT);
        $currency = $data['currency'] ?? 'EUR';
        $invoiceTypeCode = $data['invoice_type_code'] ?? '380';
        $ppfStatus = $data['ppf_status'] ?? 'DEPOSEE';
        $ppfDepositId = $data['ppf_deposit_id'] ?? ('PPF-' . time() . '-' . rand(1000, 9999));
        $lines = $data['lines'] ?? [];
        $status = $data['status'] ?? 'pending';

        // Calcul de l'empreinte cryptographique inaltérable (PAF)
        $shaPayload = "{$invoiceNumber}|{$date}|{$amountHT}|{$amountTTC}|{$operationNature}|{$currency}";
        $computedHash = hash('sha256', $shaPayload);

        $projectId = !empty($data['projectId']) ? $data['projectId'] : (!empty($data['project_id']) ? $data['project_id'] : null);
        $projectName = trim($data['projectName'] ?? ($data['project_name'] ?? ''));

        $invoice = [
            'id' => $id,
            'company_id' => $company_id,
            'invoiceNumber' => $invoiceNumber,
            'clientId' => $clientId,
            'clientName' => $clientName,
            'projectId' => $projectId,
            'projectName' => $projectName,
            'date' => $date,
            'dueDate' => $dueDate,
            'operation_nature' => $operationNature,
            'vat_payment_on_debit' => $vatPaymentOnDebit,
            'amountHT' => $amountHT,
            'amountTTC' => $amountTTC,
            'currency' => $currency,
            'invoice_type_code' => $invoiceTypeCode,
            'ppf_status' => $ppfStatus,
            'ppf_deposit_id' => $ppfDepositId,
            'sha256_hash' => $computedHash,
            'lines' => $lines,
            'status' => $status,
            'updated_at' => date('Y-m-d H:i:s')
        ];

        if ($useMysql) {
            // Insertion ou mise à jour avec les colonnes conformes PPF
            $stmt = $pdo->prepare("
                INSERT INTO invoices (
                    company_id, client_id, invoice_number, date, due_date, 
                    operation_nature, vat_payment_on_debit, amount_ht, amount_vat, amount_ttc, 
                    currency, invoice_type_code, status, ppf_status, ppf_deposit_id, sha256_hash
                ) VALUES (
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, ?
                )
                ON DUPLICATE KEY UPDATE
                    client_id = VALUES(client_id), date = VALUES(date), due_date = VALUES(due_date),
                    operation_nature = VALUES(operation_nature), vat_payment_on_debit = VALUES(vat_payment_on_debit),
                    amount_ht = VALUES(amount_ht), amount_vat = VALUES(amount_vat), amount_ttc = VALUES(amount_ttc),
                    status = VALUES(status), ppf_status = VALUES(ppf_status), sha256_hash = VALUES(sha256_hash)
            ");
            $stmt->execute([
                $company_id, $clientId, $invoiceNumber, $date, $dueDate,
                $operationNature, $vatPaymentOnDebit, $amountHT, $amountVAT, $amountTTC,
                $currency, $invoiceTypeCode, $status, $ppfStatus, $ppfDepositId, $computedHash
            ]);
            $insertedId = $pdo->lastInsertId() ?: $id;
            $invoice['id'] = $insertedId;

            // Inscription inaltérable dans le registre Piste d'Audit Fiable (PAF)
            try {
                $pafStmt = $pdo->prepare("
                    INSERT INTO paf_invoice_audit_trail (invoice_id, action, previous_status, new_status, payload_hash)
                    VALUES (?, 'ENREGISTREMENT_FACTURE', NULL, ?, ?)
                ");
                $pafStmt->execute([$insertedId, $ppfStatus, $computedHash]);
            } catch (Exception $ePaf) {}

            // Enregistrement des lignes d'articles EN 16931
            if (!empty($lines) && is_array($lines)) {
                try {
                    $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?")->execute([$insertedId]);
                    $itemStmt = $pdo->prepare("
                        INSERT INTO invoice_items (invoice_id, line_number, description, quantity, unit_code, unit_price_ht, vat_rate, vat_category_code, vat_exemption_reason, discount_rate, line_total_ht)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ");
                    foreach ($lines as $idx => $line) {
                        $q = floatval($line['quantity'] ?? 1);
                        $p = floatval($line['unitPriceHT'] ?? 0);
                        $vr = floatval($line['vatRate'] ?? 20);
                        $disc = floatval($line['discountPercentage'] ?? 0);
                        $tot = round($q * $p * (1 - $disc / 100), 2);
                        $itemStmt->execute([
                            $insertedId, $idx + 1, $line['description'] ?? 'Article',
                            $q, $line['unitCode'] ?? 'H87', $p, $vr,
                            $vr == 0 ? 'E' : 'S', $vr == 0 ? ($line['vatExemptionReason'] ?? null) : null,
                            $disc, $tot
                        ]);
                    }
                } catch (Exception $eItems) {}
            }

        } else {
            $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['invoices' => []];
            if (!isset($db['invoices'])) $db['invoices'] = [];
            if (!isset($db['pafAuditTrail'])) $db['pafAuditTrail'] = [];
            
            $idx = -1;
            foreach ($db['invoices'] as $i => $item) {
                if ((string)$item['id'] === (string)$id || (isset($item['invoiceNumber']) && $item['invoiceNumber'] === $invoiceNumber)) {
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

            // PAF Log
            $db['pafAuditTrail'][] = [
                'id' => 'paf_' . time() . '_' . rand(100, 999),
                'invoice_id' => $id,
                'action' => $idx >= 0 ? 'MISE_A_JOUR' : 'CREATION',
                'new_status' => $ppfStatus,
                'payload_hash' => $computedHash,
                'timestamp' => date('c')
            ];

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
