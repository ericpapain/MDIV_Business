<?php
// public/api/fec_export.php
// Moteur de Pré-Comptabilité & Générateur Officiel du Fichier des Écritures Comptables (FEC Art. L. 47 A I du LPF)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$companyId = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;
$fiscalYear = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));
$siren = isset($_GET['siren']) ? preg_replace('/[^0-9]/', '', $_GET['siren']) : '912345678';
if (strlen($siren) < 9) $siren = str_pad($siren, 9, '0', STR_PAD_RIGHT);

// Chargement des données réelles
$dbPath = __DIR__ . '/../../dev_db.json';
$db = file_exists($dbPath) ? json_decode(file_get_contents($dbPath), true) : [];
$invoices = $db['invoices'] ?? [];
$expenses = $db['expenses'] ?? [];

// Entêtes obligatoires officielles du FEC (18 colonnes séparées par des tabulations)
$fecHeader = [
    'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate',
    'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib',
    'PieceRef', 'PieceDate', 'EcritureLib',
    'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate',
    'Montantdevise', 'Idevise'
];

$lines = [];
$lines[] = implode("\t", $fecHeader);

$ecritureIndex = 1;
$totalDebit = 0.0;
$totalCredit = 0.0;

// 1. Écritures de VENTES (Journal VE)
foreach ($invoices as $inv) {
    if (($inv['company_id'] ?? 1) !== $companyId) continue;
    
    $dateStr = date('Ymd', strtotime($inv['date'] ?? 'now'));
    $ref = $inv['invoice_number'] ?? $inv['invoiceNumber'] ?? ('FAC-' . $inv['id']);
    $client = $inv['client_name'] ?? $inv['clientName'] ?? 'Client B2B';
    $auxCode = '411' . substr(preg_replace('/[^a-zA-Z0-9]/', '', strtoupper($client)), 0, 8);
    
    $totalHT = floatval($inv['amount_ht'] ?? $inv['totalHT'] ?? 0);
    $totalVAT = floatval($inv['amount_tva'] ?? $inv['totalVAT'] ?? 0);
    $totalTTC = floatval($inv['amount_ttc'] ?? $inv['totalTTC'] ?? ($totalHT + $totalVAT));

    if ($totalTTC <= 0) continue;

    // Ligne Débit : Client (Compte 411000)
    $lines[] = implode("\t", [
        'VE', 'Journal des Ventes', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
        '411000', 'Clients', $auxCode, $client,
        $ref, $dateStr, "Facture de vente $ref - $client",
        number_format($totalTTC, 2, ',', ''), '0,00', '', '', $dateStr, '', 'EUR'
    ]);
    $totalDebit += $totalTTC;

    // Ligne Crédit : Chiffre d'Affaires / Prestations de Services (Compte 706000)
    $lines[] = implode("\t", [
        'VE', 'Journal des Ventes', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
        '706000', 'Prestations de services et ventes', '', '',
        $ref, $dateStr, "Prestations HT $ref - $client",
        '0,00', number_format($totalHT, 2, ',', ''), '', '', $dateStr, '', 'EUR'
    ]);
    $totalCredit += $totalHT;

    // Ligne Crédit : TVA Collectée (Compte 445710)
    if ($totalVAT > 0) {
        $lines[] = implode("\t", [
            'VE', 'Journal des Ventes', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
            '445710', 'TVA collectee a 20%', '', '',
            $ref, $dateStr, "TVA collectee $ref",
            '0,00', number_format($totalVAT, 2, ',', ''), '', '', $dateStr, '', 'EUR'
        ]);
        $totalCredit += $totalVAT;
    }
    $ecritureIndex++;
}

// 2. Écritures des ACHATS & DÉPENSES (Journal AC)
foreach ($expenses as $exp) {
    if (($exp['company_id'] ?? 1) !== $companyId) continue;

    $dateStr = date('Ymd', strtotime($exp['date'] ?? 'now'));
    $ref = $exp['invoice_number'] ?? $exp['id'];
    $supplier = $exp['supplier'] ?? $exp['merchant'] ?? 'Fournisseur';
    $auxCode = '401' . substr(preg_replace('/[^a-zA-Z0-9]/', '', strtoupper($supplier)), 0, 8);

    $totalHT = floatval($exp['amount_ht'] ?? $exp['total_ht'] ?? 0);
    $totalVAT = floatval($exp['amount_tva'] ?? $exp['total_vat'] ?? 0);
    $totalTTC = floatval($exp['amount_ttc'] ?? $exp['total_ttc'] ?? ($totalHT + $totalVAT));

    if ($totalTTC <= 0) continue;

    // Attribution du compte de charge PCG selon la catégorie
    $cat = strtolower($exp['category'] ?? '');
    $compteCharge = '606000';
    $libelleCharge = 'Achats de fournitures et matieres';
    if (strpos($cat, 'deplacement') !== false || strpos($cat, 'carburant') !== false) {
        $compteCharge = '625100';
        $libelleCharge = 'Voyages et deplacements';
    } elseif (strpos($cat, 'restaurant') !== false || strpos($cat, 'repas') !== false) {
        $compteCharge = '625700';
        $libelleCharge = 'Receptions et repas d affaires';
    } elseif (strpos($cat, 'service') !== false || strpos($cat, 'logiciel') !== false) {
        $compteCharge = '615000';
        $libelleCharge = 'Entretien reparations et abonnements SaaS';
    }

    // Ligne Débit : Compte de Charge (Classe 6)
    $lines[] = implode("\t", [
        'AC', 'Journal des Achats', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
        $compteCharge, $libelleCharge, '', '',
        $ref, $dateStr, "Achat $ref - $supplier",
        number_format($totalHT, 2, ',', ''), '0,00', '', '', $dateStr, '', 'EUR'
    ]);
    $totalDebit += $totalHT;

    // Ligne Débit : TVA Déductible (Compte 445660)
    if ($totalVAT > 0) {
        $lines[] = implode("\t", [
            'AC', 'Journal des Achats', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
            '445660', 'TVA deductible sur autres biens et services', '', '',
            $ref, $dateStr, "TVA deductible $ref",
            number_format($totalVAT, 2, ',', ''), '0,00', '', '', $dateStr, '', 'EUR'
        ]);
        $totalDebit += $totalVAT;
    }

    // Ligne Crédit : Fournisseur (Compte 401000)
    $lines[] = implode("\t", [
        'AC', 'Journal des Achats', str_pad($ecritureIndex, 6, '0', STR_PAD_LEFT), $dateStr,
        '401000', 'Fournisseurs', $auxCode, $supplier,
        $ref, $dateStr, "Facture fournisseur $ref - $supplier",
        '0,00', number_format($totalTTC, 2, ',', ''), '', '', $dateStr, '', 'EUR'
    ]);
    $totalCredit += $totalTTC;

    $ecritureIndex++;
}

$fecContent = implode("\r\n", $lines) . "\r\n";

// Nom de fichier normalisé légal : SIRENFECYYYYMMDD.txt
$officialFilename = $siren . 'FEC' . $fiscalYear . '1231.txt';

if (isset($_GET['download'])) {
    header('Content-Type: text/plain; charset=iso-8859-15');
    header('Content-Disposition: attachment; filename="' . $officialFilename . '"');
    header('Content-Length: ' . strlen(utf8_decode($fecContent)));
    echo utf8_decode($fecContent);
    exit;
}

// Calcul de la synthèse des comptes PCG
$totalVentes = 0.0;
$totalClients = 0.0;
$totalTvaCollectee = 0.0;
$totalAchats = 0.0;
$totalFournisseurs = 0.0;
$totalTvaDeductible = 0.0;

foreach ($invoices as $inv) {
    if (($inv['company_id'] ?? 1) !== $companyId) continue;
    $ht = floatval($inv['amount_ht'] ?? $inv['totalHT'] ?? $inv['amountHT'] ?? 0);
    $vat = floatval($inv['amount_tva'] ?? $inv['totalVAT'] ?? 0);
    $ttc = floatval($inv['amount_ttc'] ?? $inv['totalTTC'] ?? $inv['amountTTC'] ?? ($ht + $vat));
    $totalVentes += $ht;
    $totalTvaCollectee += $vat;
    $totalClients += $ttc;
}

foreach ($expenses as $exp) {
    if (($exp['company_id'] ?? 1) !== $companyId) continue;
    $ht = floatval($exp['amount_ht'] ?? $exp['total_ht'] ?? 0);
    $vat = floatval($exp['amount_tva'] ?? $exp['total_vat'] ?? 0);
    $ttc = floatval($exp['amount_ttc'] ?? $exp['total_ttc'] ?? ($ht + $vat));
    $totalAchats += $ht;
    $totalTvaDeductible += $vat;
    $totalFournisseurs += $ttc;
}

$accountsSummary = [
    ['code' => '411000', 'name' => 'Clients (Créances)', 'debit' => round($totalClients, 2), 'credit' => 0.0],
    ['code' => '706000', 'name' => 'Prestations de services et ventes', 'debit' => 0.0, 'credit' => round($totalVentes, 2)],
    ['code' => '445710', 'name' => 'TVA collectée (20%)', 'debit' => 0.0, 'credit' => round($totalTvaCollectee, 2)],
    ['code' => '401000', 'name' => 'Fournisseurs (Dettes)', 'debit' => 0.0, 'credit' => round($totalFournisseurs, 2)],
    ['code' => '606000', 'name' => 'Achats & Fournitures d\'exploitation', 'debit' => round($totalAchats, 2), 'credit' => 0.0],
    ['code' => '445660', 'name' => 'TVA déductible sur autres biens et services', 'debit' => round($totalTvaDeductible, 2), 'credit' => 0.0]
];

// Réponse JSON de diagnostic et audit de pré-comptabilité
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'filename' => $officialFilename,
    'fiscalYear' => $fiscalYear,
    'siren' => $siren,
    'entriesCount' => $ecritureIndex - 1,
    'linesCount' => max(0, count($lines) - 1),
    'totalDebit' => round($totalDebit, 2),
    'totalCredit' => round($totalCredit, 2),
    'isBalanced' => abs($totalDebit - $totalCredit) < 0.05,
    'preview' => array_slice($lines, 0, 15),
    'accountsSummary' => $accountsSummary,
    'downloadUrl' => 'api/fec_export.php?download=1&company_id=' . $companyId . '&year=' . $fiscalYear . '&siren=' . $siren,
    'compatibleSoftware' => ['Cegid Expert', 'Sage 100', 'Pennylane', 'ACD Conseil', 'Ibiza', 'MyUnisoft', 'Agiris']
], JSON_UNESCAPED_UNICODE);

