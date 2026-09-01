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
$pdf->SetCreator('BNE · MDIV Business');
$pdf->SetAuthor('MDIV Business');
$pdf->SetTitle('Votre Audit & Diagnostic IA');

// Suppression des entêtes et pieds de page par défaut
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Ajout d'une page
$pdf->AddPage();

// Logo BNE (chemin relatif depuis api/)
$logo_path = __DIR__ . '/../public/favicon.png';
if (file_exists($logo_path)) {
    $pdf->Image($logo_path, 15, 15, 25, '', 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
}

// Header BNE
$pdf->SetFont('helvetica', 'B', 20);
$pdf->SetTextColor(37, 99, 235); // Bleu BNE
$pdf->SetY(18);
$pdf->SetX(45);
$pdf->Cell(0, 10, 'BNE · MDIV Business', 0, 1, 'L');

$pdf->SetFont('helvetica', '', 11);
$pdf->SetTextColor(100, 100, 100);
$pdf->SetX(45);
$pdf->Cell(0, 5, 'Rapport d\'Audit & Diagnostic IA Personnalisé', 0, 1, 'L');

$pdf->Ln(12);
$pdf->SetDrawColor(220, 225, 230);
$pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
$pdf->Ln(8);

// Score
$score = $report['score'] ?? 0;
$pdf->SetFont('helvetica', 'B', 16);
$pdf->SetTextColor(33, 37, 41);
$pdf->Cell(0, 10, 'Score de Maturité IA : ' . $score . ' / 100', 0, 1, 'L');

$pdf->Ln(4);

// Synthèse
$pdf->SetFont('helvetica', 'B', 13);
$pdf->SetTextColor(37, 99, 235);
$pdf->Cell(0, 8, '1. Synthèse Globale', 0, 1, 'L');

$pdf->SetFont('helvetica', '', 11);
$pdf->SetTextColor(50, 50, 50);
$pdf->MultiCell(0, 8, $report['synthesis'] ?? '', 0, 'J', false, 1);
$pdf->Ln(6);

// Déductions (Insights)
if (!empty($report['deduced_insights'])) {
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor(37, 99, 235);
    $pdf->Cell(0, 8, '2. Constats & Opportunités Clés', 0, 1, 'L');
    
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(50, 50, 50);
    foreach ($report['deduced_insights'] as $insight) {
        $pdf->MultiCell(0, 7, '• ' . $insight, 0, 'L', false, 1);
    }
    $pdf->Ln(6);
}

// Recommandations
if (!empty($report['recommendations'])) {
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor(37, 99, 235);
    $pdf->Cell(0, 8, '3. Recommandations d\'Outils & Plan d\'Action', 0, 1, 'L');
    $pdf->Ln(2);

    foreach ($report['recommendations'] as $rec) {
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetTextColor(33, 37, 41);
        
        $title = ($rec['tool_name'] ?? 'Outil');
        if (!empty($rec['category'])) {
            $title .= ' (' . $rec['category'] . ')';
        }
        $pdf->Cell(0, 7, '▶ ' . $title, 0, 1, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(70, 70, 70);
        if (!empty($rec['reason'])) {
            $pdf->MultiCell(0, 6, '   Pourquoi : ' . $rec['reason'], 0, 'L', false, 1);
        }
        if (!empty($rec['how_to_start'])) {
            $pdf->SetFont('helvetica', 'I', 10);
            $pdf->SetTextColor(37, 99, 235);
            $pdf->MultiCell(0, 6, '   Comment démarrer : ' . $rec['how_to_start'], 0, 'L', false, 1);
        }
        $pdf->Ln(3);
    }
}

// Footer
$pdf->SetY(-25);
$pdf->SetFont('helvetica', 'I', 9);
$pdf->SetTextColor(120, 120, 120);
$pdf->Cell(0, 8, 'BNE (Business Network Ecosystem) · MDIV Business — Diagnostic de maturité numérique', 0, 1, 'C');

// Générer le PDF et forcer le téléchargement
$pdf->Output('Audit_IA_Express_BNE.pdf', 'D');
?>
