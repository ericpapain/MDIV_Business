<?php
// Fichier : /api/diagnostic_pdf.php
header("Access-Control-Allow-Origin: *");

// On suppose que Composer a été installé et autoload.php généré
$autoload_path = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload_path)) {
    die("Dépendances PHP non installées. Exécutez composer install dans le dossier api/.");
}

require_once $autoload_path;
require_once __DIR__ . '/config.php';

$report_raw = $_POST['report'] ?? null;
if (!$report_raw) {
    die("Aucune donnée de rapport fournie.");
}

$report = json_decode($report_raw, true);
if (!$report) {
    die("Format de données invalide.");
}

// Initialisation de TCPDF
$pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Informations du document
$pdf->SetCreator('MDIV Business');
$pdf->SetAuthor('MDIV Business');
$pdf->SetTitle('Votre Diagnostic IA Express');

// Suppression des entêtes et pieds de page par défaut
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Ajout d'une page
$pdf->AddPage();

// Logo BNE (chemin relatif depuis api/)
$logo_path = __DIR__ . '/../public/favicon.png'; // Utilisation temporaire du favicon comme logo
if (file_exists($logo_path)) {
    $pdf->Image($logo_path, 15, 15, 30, '', 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
}

// Titre
$pdf->SetFont('helvetica', 'B', 24);
$pdf->SetTextColor(33, 37, 41);
$pdf->SetY(25);
$pdf->SetX(50);
$pdf->Cell(0, 15, 'Votre Audit IA Express', 0, 1, 'L');

$pdf->Ln(15);

// Score
$pdf->SetFont('helvetica', 'B', 20);
$pdf->SetTextColor(37, 99, 235); // Bleu
$pdf->Cell(0, 10, 'Score de Maturité : ' . ($report['score'] ?? 0) . '/100', 0, 1, 'C');
$pdf->Ln(10);

// Synthèse
$pdf->SetFont('helvetica', 'B', 14);
$pdf->SetTextColor(33, 37, 41);
$pdf->Cell(0, 10, 'Synthèse des experts', 0, 1, 'L');

$pdf->SetFont('helvetica', '', 12);
$pdf->MultiCell(0, 10, $report['synthesis'] ?? '', 0, 'J', false, 1);
$pdf->Ln(10);

// Déductions (Insights)
if (!empty($report['deduced_insights'])) {
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 10, 'Déductions de l\'IA', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 12);
    foreach ($report['deduced_insights'] as $insight) {
        $pdf->MultiCell(0, 8, '- ' . $insight, 0, 'L', false, 1);
    }
    $pdf->Ln(10);
}

// Recommandations
if (!empty($report['recommendations'])) {
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 10, 'Recommandations & Outils', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 12);
    foreach ($report['recommendations'] as $rec) {
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, $rec['tool_name'] ?? '', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 11);
        $pdf->MultiCell(0, 8, $rec['reason'] ?? '', 0, 'L', false, 1);
        $pdf->Ln(4);
    }
}

// Footer d'action
$pdf->SetY(-30);
$pdf->SetFont('helvetica', 'I', 10);
$pdf->SetTextColor(100, 100, 100);
$pdf->Cell(0, 10, 'Généré par BNE (Business Network Ecosystem) - MDIV Business', 0, 1, 'C');

// Générer le PDF et forcer le téléchargement
$pdf->Output('Diagnostic_IA_BNE.pdf', 'D');
