<?php
// public/api/team_activity.php
// Tour de contrôle d'activité transverse pour l'administrateur
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$dbPath = __DIR__ . '/../../dev_db.json';
$companyId = intval($_GET['company_id'] ?? 1);

$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
$invoices = array_values(array_filter($db['invoices'] ?? [], fn($i) => (int)($i['company_id'] ?? 1) === $companyId));
$quotes = array_values(array_filter($db['quotes'] ?? [], fn($q) => (int)($q['company_id'] ?? 1) === $companyId));
$followups = array_values(array_filter($db['followups'] ?? [], fn($f) => (int)($f['company_id'] ?? 1) === $companyId));
$calendarEvents = array_values(array_filter($db['calendar_events'] ?? [], fn($e) => (int)($e['company_id'] ?? 1) === $companyId));

$activities = [];
foreach (array_slice($invoices, 0, 5) as $inv) {
    $activities[] = [
        'type' => 'invoice',
        'title' => 'Facture ' . ($inv['invoice_number'] ?? ($inv['invoiceNumber'] ?? 'F-2026')),
        'client' => $inv['clientName'] ?? 'Client',
        'amount' => $inv['amount_ttc'] ?? ($inv['amountTTC'] ?? 0),
        'status' => $inv['status'] ?? 'pending',
        'date' => $inv['date'] ?? date('Y-m-d')
    ];
}
foreach (array_slice($quotes, 0, 5) as $q) {
    $activities[] = [
        'type' => 'quote',
        'title' => 'Devis ' . ($q['quote_number'] ?? ($q['quoteNumber'] ?? 'D-2026')),
        'client' => $q['clientName'] ?? 'Client',
        'amount' => $q['total_ttc'] ?? ($q['totalTTC'] ?? 0),
        'status' => $q['status'] ?? 'draft',
        'date' => $q['date'] ?? date('Y-m-d')
    ];
}

echo json_encode([
    'success' => true,
    'company_id' => $companyId,
    'summary' => [
        'pendingInvoicesCount' => count(array_filter($invoices, fn($i) => in_array($i['status'] ?? '', ['pending', 'overdue']))),
        'pendingQuotesCount' => count(array_filter($quotes, fn($q) => in_array($q['status'] ?? '', ['draft', 'sent']))),
        'followupsCount' => count(array_filter($followups, fn($f) => ($f['status'] ?? '') === 'pending')),
        'upcomingEventsCount' => count(array_filter($calendarEvents, fn($e) => ($e['status'] ?? '') === 'scheduled'))
    ],
    'latestActivities' => $activities
]);
