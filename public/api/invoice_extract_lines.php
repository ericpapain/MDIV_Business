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
Tu ne dois inventer aucune prestation. Tu dois te baser UNIQUEMENT sur les articles listés dans le texte fourni.
Pour chaque article, extrait la désignation, la quantité, le prix unitaire HT et le taux de TVA estimé.

ATTENTION CRITIQUE CONCERNANT LES PRIX HT vs TTC :
Le système qui va recevoir ces données ajoute automatiquement la TVA par-dessus le `unitPriceHT` que tu fournis.
Si les prix affichés sur le ticket (comme dans les restaurants ou supermarchés) sont en TTC, tu DOIS ABSOLUMENT calculer et renvoyer le prix Unitaire HORS TAXE (HT).
Formule : Prix HT = Prix TTC / (1 + (Taux TVA / 100)).
Exemple : Si un plat coûte 8.90€ TTC avec 10% de TVA, tu dois renvoyer 8.09 dans `unitPriceHT`. NE RENVOIE JAMAIS LE PRIX TTC dans le champ `unitPriceHT`, sinon la comptabilité sera faussée !

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

INSTRUCTION DE HAUTE PRÉCISION (PRENDS TON TEMPS) :
L'extraction doit être chirurgicale et mathématiquement parfaite. Avant de générer les lignes, utilise le champ `_thinking` pour faire ton raisonnement étape par étape.
1. Identifie chaque article et son prix affiché.
2. Détermine si le prix affiché est HT ou TTC (regarde les totaux du ticket pour comprendre).
3. Pose le calcul exact de conversion TTC -> HT pour CHAQUE article. (ex: 8.90 / 1.10 = 8.09)
4. Vérifie que la somme de tes HT + TVA correspond au total du ticket.

Réponds STRICTEMENT par un objet JSON valide avec la structure suivante, sans aucun autre texte (pas de markdown) :
{
  \"_thinking\": \"Ton raisonnement mathématique étape par étape ici...\",
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
