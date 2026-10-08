<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once 'groq_client.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
if (!$data) $data = $_POST;

$ocrText = $data['ocr_text'] ?? '';

if (empty($ocrText)) {
    http_response_code(400);
    echo json_encode(["error" => "Aucun texte OCR fourni."]);
    exit;
}

// GARDE-FOU ANTI-GRIBOUILLAGE
$isGibberish = 
    strlen($ocrText) < 8 ||
    preg_match('/^(.)\1{4,}/i', $ocrText) ||
    (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!\?\'\-]{10,}$/i', $ocrText) && !preg_match('/[aeiouy]/i', $ocrText));

if ($isGibberish) {
    http_response_code(400);
    echo json_encode([
        "error" => "Le texte OCR semble incompréhensible ou illisible. Veuillez fournir un scan de facture lisible."
    ]);
    exit;
}

$systemPrompt = "Tu es un expert comptable et un spécialiste de la facturation.
Ta mission est d'extraire les articles, produits ou services d'un texte généré par OCR (reconnaissance optique) d'un ticket de caisse ou d'une facture.

RÈGLE D'OR :
Tu ne dois inventer aucune prestation (NE GÉNÈRE PAS de tâches génériques comme 'Extraction de facture', 'Calcul de la TVA' ou 'Audit' !). Tu dois te baser UNIQUEMENT sur les articles listés dans le texte fourni.
Pour chaque article, extrait la désignation, la quantité, le prix unitaire HT et le taux de TVA estimé. Si tu ne trouves pas le prix HT mais seulement le TTC, essaie de déduire le HT selon la TVA ou fournis le TTC.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

Réponds STRICTEMENT par un objet JSON valide avec la structure suivante, sans aucun autre texte (pas de markdown) :
{
  \"suggestedLines\": [
    { \"id\": \"1\", \"description\": \"Nom exact de l'article sur le ticket\", \"quantity\": 1, \"unitPriceHT\": 15.00, \"vatRate\": 20, \"discountPercentage\": 0 }
  ]
}";

$userPrompt = "TEXTE OCR DE LA FACTURE / TICKET DE CAISSE :\n\"\"\"\n" . $ocrText . "\n\"\"\"\nExtrais les articles en JSON.";

try {
    $messages = [
        ["role" => "system", "content" => $systemPrompt],
        ["role" => "user", "content" => $userPrompt]
    ];
    
    $response = callGroqApi($messages, "mixtral-8x7b-32768");
    $content = $response['choices'][0]['message']['content'] ?? '{}';
    
    // Nettoyage Markdown potentiel
    $content = preg_replace('/```json\s*/', '', $content);
    $content = preg_replace('/```\s*/', '', $content);
    
    $parsed = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        preg_match('/\{.*\}/s', $content, $matches);
        if (!empty($matches)) {
            $parsed = json_decode($matches[0], true);
        }
    }
    
    if (!$parsed || !isset($parsed['suggestedLines'])) {
        http_response_code(500);
        echo json_encode(["error" => "Échec du formatage JSON des lignes extraites."]);
        exit;
    }
    
    echo json_encode($parsed);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur lors de l'extraction OCR : " . $e->getMessage()]);
}
