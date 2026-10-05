<?php
// public/api/leads_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$raw_data = $_POST['leads_data'] ?? '[]';
$leads = json_decode($raw_data, true) ?: [];
$format = $_POST['format'] ?? 'csv';

if ($format === 'csv') {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="Leads_MDIV_' . date('Ymd_His') . '.csv"');
    
    // Output BOM for Excel UTF-8
    echo "\xEF\xBB\xBF";
    $output = fopen('php://output', 'w');
    fputcsv($output, ['Entreprise', 'Secteur', 'Taille', 'Localisation', 'Site Web', 'Score Maturite', 'Potentiel IA', 'Probabilite Achat', 'Contact', 'Fonction'], ';');
    
    foreach ($leads as $l) {
        fputcsv($output, [
            $l['companyName'] ?? '',
            $l['sector'] ?? '',
            $l['size'] ?? '',
            $l['location'] ?? '',
            $l['website'] ?? '',
            $l['digitalMaturityScore'] ?? '',
            $l['aiPotentialScore'] ?? '',
            $l['purchaseProbability'] ?? '',
            $l['decisionMakerName'] ?? '',
            $l['decisionMakerFunction'] ?? ''
        ], ';');
    }
    fclose($output);
    exit;
} else {
    header('Content-Type: text/html; charset=UTF-8');
    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Export Leads</title><style>body{font-family: system-ui; padding: 20px;} table{width: 100%; border-collapse: collapse;} th, td{border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left;} th{background: #f1f5f9;}</style></head><body><h2>Export des Leads Qualifiés MDIV Business</h2><table><tr><th>Entreprise</th><th>Secteur</th><th>Localisation</th><th>Contact</th><th>Score IA</th></tr>";
    foreach ($leads as $l) {
        echo "<tr><td>" . htmlspecialchars($l['companyName'] ?? '') . "</td><td>" . htmlspecialchars($l['sector'] ?? '') . "</td><td>" . htmlspecialchars($l['location'] ?? '') . "</td><td>" . htmlspecialchars(($l['decisionMakerName'] ?? '') . ' (' . ($l['decisionMakerFunction'] ?? '') . ')') . "</td><td>" . htmlspecialchars($l['aiPotentialScore'] ?? '') . "</td></tr>";
    }
    echo "</table></body></html>";
    exit;
}
