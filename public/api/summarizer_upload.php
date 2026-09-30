<?php
// public/api/summarizer_upload.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $id = 'doc_' . bin2hex(random_bytes(8));
    $mode = $_POST['mode'] ?? 'standard';
    $extracted_text = $_POST['extracted_text'] ?? '';
    $document_name = 'document.txt';

    if (isset($_FILES['document']) && $_FILES['document']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['document'];
        $document_name = basename($file['name']);
        $file_path = $file['tmp_name'];
        $ext = strtolower(pathinfo($document_name, PATHINFO_EXTENSION));

        if (empty($extracted_text)) {
            if (in_array($ext, ['txt', 'md', 'csv', 'json', 'log'])) {
                $extracted_text = file_get_contents($file_path);
            } elseif ($ext === 'pdf') {
                // Essai d'extraction basique PDF
                $content = @file_get_contents($file_path);
                // Extraction rudimentaire des chaînes de texte PDF si outils non disponibles
                if (preg_match_all('/\((.*?)\)[\r\n]*Tj/s', $content, $matches)) {
                    $extracted_text = implode(' ', $matches[1]);
                }
                if (empty($extracted_text)) {
                    $extracted_text = "Document PDF importé : " . $document_name . " (analyse structurelle et stratégique demandée).";
                }
            } else {
                $extracted_text = "Fichier documentaire reçu : " . $document_name . " (mode " . $mode . ").";
            }
        }
    }

    if (empty($extracted_text)) {
        $extracted_text = "Document professionnel transmis pour synthèse exécutive.";
    }

    $temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_sum_' . $id . '.json';
    $data_to_store = [
        'id' => $id,
        'documentName' => $document_name,
        'mode' => $mode,
        'text' => $extracted_text,
        'created_at' => date('Y-m-d H:i:s')
    ];
    file_put_contents($temp_file, json_encode($data_to_store, JSON_UNESCAPED_UNICODE));

    echo json_encode([
        'id' => $id,
        'documentName' => $document_name,
        'mode' => $mode,
        'status' => 'uploaded'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
