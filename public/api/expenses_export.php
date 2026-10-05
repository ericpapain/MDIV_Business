<?php
// public/api/expenses_export.php
require_once __DIR__ . '/config.php';

$companyId = isset($_GET['company_id']) ? (int)$_GET['company_id'] : 1;
$useMysql = isset($pdo) && $pdo instanceof PDO;

if ($useMysql) {
    $stmt = $pdo->prepare("SELECT * FROM company_expenses WHERE company_id = :cid ORDER BY date DESC");
    $stmt->execute([':cid' => $companyId]);
    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $dbPath = __DIR__ . '/../../dev_db.json';
    $db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : ['expenses' => []];
    $expenses = array_filter($db['expenses'] ?? [], fn($e) => ($e['company_id'] ?? 1) === $companyId);
}

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="export_depenses_' . date('Y-m-d') . '.csv"');

// BOM UTF-8 pour ouverture directe dans Excel
echo "\xEF\xBB\xBF";

$output = fopen('php://output', 'w');
fputcsv($output, [
    'ID',
    'Date',
    'Fournisseur / Enseigne',
    'Catégorie',
    'N° Facture / Ticket',
    'Montant HT (€)',
    'Taux TVA (%)',
    'Montant TVA (€)',
    'Montant TTC (€)',
    'Moyen Paiement',
    'Chantier / Projet',
    'Client ID',
    'Notes'
], ';');

foreach ($expenses as $e) {
    fputcsv($output, [
        $e['id'] ?? '',
        $e['date'] ?? '',
        $e['merchant'] ?? '',
        $e['category'] ?? '',
        $e['invoice_number'] ?? '',
        number_format((float)($e['amount_ht'] ?? 0), 2, ',', ''),
        number_format((float)($e['tva_rate'] ?? 20), 2, ',', ''),
        number_format((float)($e['amount_tva'] ?? 0), 2, ',', ''),
        number_format((float)($e['amount_ttc'] ?? 0), 2, ',', ''),
        $e['payment_method'] ?? 'cb',
        $e['project_id'] ?? '',
        $e['client_id'] ?? '',
        $e['notes'] ?? ''
    ], ';');
}

fclose($output);
exit;
