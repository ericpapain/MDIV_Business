<?php
// public/api/summarizer_export.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$summary_id = $_POST['summary_id'] ?? $_GET['summary_id'] ?? 'doc';
$format = $_POST['format'] ?? $_GET['format'] ?? 'pdf';

$temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_sum_' . $summary_id . '.json';
$doc_name = "Synthese_Executive_" . date('Y-m-d');
$text_content = "Synthèse documentaire MDIV Business\nDate : " . date('d/m/Y');

if (file_exists($temp_file)) {
    $data = json_decode(file_get_contents($temp_file), true);
    if ($data) {
        $doc_name = "Synthese_" . preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['documentName'] ?? 'Doc');
        $text_content = "MDIV BUSINESS - SYNTHÈSE EXÉCUTIVE\n";
        $text_content .= "Document source : " . ($data['documentName'] ?? 'N/A') . "\n";
        $text_content .= "Mode : " . ($data['mode'] ?? 'Standard') . "\n";
        $text_content .= "Date : " . date('d/m/Y H:i') . "\n\n";
        $text_content .= "CONTENU DU DOCUMENT :\n" . ($data['text'] ?? '');
    }
}

if ($format === 'docx') {
    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="' . $doc_name . '.doc"');
    echo "<html><head><meta charset='utf-8'></head><body><pre style='font-family: Arial; white-space: pre-wrap;'>" . htmlspecialchars($text_content) . "</pre></body></html>";
} else {
    header('Content-Type: text/html; charset=UTF-8');
    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>$doc_name</title><style>body{font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; max-width: 800px; margin: auto;} h1{color: #b45309; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;} .btn{background: #d97706; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;} @media print{.btn{display:none;}}</style></head><body><button class='btn' onclick='window.print()'>Imprimer / Enregistrer en PDF</button><h1>MDIV Business - Synthèse Exécutive</h1><pre style='white-space: pre-wrap; font-family: inherit; font-size: 15px;'>" . htmlspecialchars($text_content) . "</pre></body></html>";
}
