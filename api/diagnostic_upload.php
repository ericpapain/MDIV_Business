<?php
// Fichier : /api/diagnostic_upload.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// On suppose que Composer a été installé et autoload.php généré
$autoload_path = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload_path)) {
    http_response_code(500);
    echo json_encode(["error" => "Dépendances PHP non installées. Exécutez composer install dans le dossier api/."]);
    exit;
}

require_once $autoload_path;

if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "Aucun fichier reçu ou erreur d'upload."]);
    exit;
}

$file = $_FILES['document'];

// Vérification de la taille (ex: max 2MB)
if ($file['size'] > 2 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["error" => "Le fichier est trop volumineux. Maximum 2MB."]);
    exit;
}

// Vérification du format
$mime = mime_content_type($file['tmp_name']);
if ($mime !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(["error" => "Format non supporté. Seul le format PDF est accepté."]);
    exit;
}

try {
    $parser = new \Smalot\PdfParser\Parser();
    $pdf    = $parser->parseFile($file['tmp_name']);
    $pages  = $pdf->getPages();

    // Vérification de la restriction Freemium
    if (count($pages) > 3) {
        // Au lieu de bloquer avec une erreur 400, on renvoie une réponse indiquant le blocage freemium
        echo json_encode([
            "status" => "premium_required",
            "message" => "Cette fonctionnalité avancée (plus de 3 pages) est réservée aux utilisateurs Premium.",
            "extracted_text" => ""
        ]);
        exit;
    }

    $text = $pdf->getText();
    
    // Nettoyer un peu le texte
    $text = substr(trim($text), 0, 5000); // Limiter la longueur pour ne pas exploser le token limit de Groq

    echo json_encode([
        "status" => "success",
        "message" => "Document analysé avec succès.",
        "extracted_text" => $text
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de la lecture du PDF : " . $e->getMessage()]);
}
?>
