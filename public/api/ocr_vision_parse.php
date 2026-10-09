<?php
// public/api/ocr_vision_parse.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$imageBase64 = $data['imageBase64'] ?? $data['image'] ?? '';

if (empty($imageBase64)) {
    http_response_code(400);
    echo json_encode(['error' => "Aucune image reçue pour l'analyse OCR Vision."]);
    exit;
}

require_once __DIR__ . '/config.php';
$groqKey = defined('GROQ_API_KEY') ? GROQ_API_KEY : (getenv('GROQ_API_KEY') ?: '');
$openaiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : (getenv('OPENAI_API_KEY') ?: '');

$extractedData = null;

$imageUrl = strpos($imageBase64, 'data:') === 0 ? $imageBase64 : 'data:image/jpeg;base64,' . $imageBase64;

$prompt = "Tu es un expert comptable et fiscaliste spécialisé dans l'analyse de reçus, tickets de caisse et factures fournisseurs françaises (BTP, artisans, PME, commerçants).
Analyse minutieusement cette photo ou ce scan de reçu. Extrais avec une précision chirurgicale les informations comptables.
Catégories autorisées: \"carburant\", \"peage\", \"materiaux\", \"outillage\", \"location\", \"restauration\", \"sous_traitance\", \"autre\".

Réponds EXCLUSIVEMENT avec un JSON valide suivant cette structure exacte :
{
  \"merchant\": \"Nom officiel du commerçant ou enseigne\",
  \"date\": \"YYYY-MM-DD\",
  \"invoice_number\": \"Numéro de facture ou ticket\",
  \"category\": \"carburant|peage|materiaux|outillage|location|restauration|sous_traitance|autre\",
  \"amount_ht\": 0.00,
  \"tva_rate\": 20.0,
  \"amount_tva\": 0.00,
  \"amount_ttc\": 0.00,
  \"payment_method\": \"cb|virement|cheque|especes|prelevement\",
  \"raw_text\": \"Résumé textuel\"
}";

if (!empty($groqKey)) {
    $payload = [
        'model' => 'llama-3.2-11b-vision-preview',
        'messages' => [
            [
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => $prompt],
                    ['type' => 'image_url', 'image_url' => ['url' => $imageUrl]]
                ]
            ]
        ],
        'temperature' => 0.1,
        'max_tokens' => 800
    ];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $groqKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resObj = json_decode($response, true);
        $content = $resObj['choices'][0]['message']['content'] ?? '';
        require_once __DIR__ . '/multi_llm_orchestrator.php';
        $extractedData = MultiLLMOrchestrator::cleanAndDecodeJson($content);
    }
}

if (!$extractedData) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => "L'IA n'a pas pu extraire de manière fiable les données du reçu."
    ]);
    exit;
}

// Correction du TTC (garantir la cohérence mathématique)
$ht = (float)($extractedData['amount_ht'] ?? 0);
$tva = (float)($extractedData['amount_tva'] ?? 0);
$extractedData['amount_ht'] = round($ht, 2);
$extractedData['amount_tva'] = round($tva, 2);
$extractedData['amount_ttc'] = round($ht + $tva, 2);

echo json_encode([
    'success' => true,
    'extracted' => $extractedData
]);
