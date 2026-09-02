<?php
// Fichier : /api/scrape_website.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/website_scraper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $url = $input['url'] ?? '';

    if (empty($url)) {
        http_response_code(400);
        echo json_encode(["error" => "URL du site web manquante."]);
        exit;
    }

    $scraped_text = scrape_website_content($url);

    if ($scraped_text === null) {
        http_response_code(422);
        echo json_encode(["error" => "Impossible d'accéder au site web. Vérifiez l'adresse saisie."]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "url" => $url,
        "scraped_content" => $scraped_text
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de l'analyse du site web : " . $e->getMessage()]);
}
?>
