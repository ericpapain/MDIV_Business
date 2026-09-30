<?php
// public/api/quote_ai_assist.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $clientContext = trim($input['clientContext'] ?? '');
    $projectDescription = trim($input['projectDescription'] ?? '');
    $budget = trim($input['budget'] ?? '');
    $company_id = intval($input['company_id'] ?? 1);

    if (empty($projectDescription)) {
        throw new Exception("La description du projet est requise pour générer les lignes de devis.");
    }

    $systemPrompt = "Tu es un directeur commercial et tarificateur expert pour MDIV Business.
À partir du contexte client et de la description du projet, génère une proposition commerciale et des lignes de devis détaillées et réalistes.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant rigoureusement cette structure :
{
  \"suggestedLines\": [
    {
      \"id\": \"1\",
      \"description\": \"Intitulé précis de la prestation ou module\",
      \"quantity\": 1,
      \"unitPriceHT\": 1200,
      \"vatRate\": 20,
      \"discountPercentage\": 0
    }
  ],
  \"executiveSummary\": \"Court résumé exécutif des objectifs et livrables du devis...\",
  \"paymentTerms\": \"Conditions de règlement (ex: Acompte 30% à la commande, solde à la livraison sous 30 jours)\"
}";

    $userPrompt = "Client / Contexte : $clientContext\nBudget indicatif : " . ($budget ?: 'Non spécifié') . "\nDescription du projet :\n$projectDescription";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!$data || !isset($data['suggestedLines'])) {
            throw new Exception("Réponse IA non conforme.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
