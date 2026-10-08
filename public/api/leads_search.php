<?php
// public/api/leads_search.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/multi_llm_orchestrator.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $sector = $input['sector'] ?? 'Industrie / Manufacturing';
    $country = $input['country'] ?? 'France';
    $region = $input['region'] ?? 'Toutes régions';
    $companySize = $input['companySize'] ?? '50 à 250 salariés (PME / ETI)';
    $targetFunction = $input['targetFunction'] ?? 'Directeur Général / DSI';
    $keywords = $input['keywords'] ?? 'automatisation, digitalisation';
    $company_id = intval($input['company_id'] ?? 0);
    if (!$company_id) {
        throw new Exception("Authentification requise pour générer des leads.");
    }

    $systemPrompt = "You are a specialized B2B prospecting and sales intelligence engine for MDIV Business.
Based on the requested targeting filters, generate a list of 4 to 6 credible, highly qualified target companies with their AI enrichment profile.

ABSOLUTE RULE FOR WEBSITES (ZERO 404 DEAD LINKS):
Strictly forbidden to invent fictional deep URLs or fictional domains (like 'https://example.fr' or 'https://entreprise-inventee.fr').
For each company:
- If the company is very well known, provide its official verified domain (e.g., 'https://www.bouygues.com', 'https://www.sncf.com', 'https://www.veolia.fr').
- In all other cases, you MUST generate a direct Google Search URL using this exact format:
  \"https://www.google.com/search?q=\" followed by the URL-encoded company name and city (e.g., \"https://www.google.com/search?q=Eiffage+Lyon+site+officiel\").
This link must work 100% of the time when clicked.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON array strictly following this schema:
[
  {
    \"companyName\": \"<GENERATED_COMPANY_NAME>\",
    \"sector\": \"$sector\",
    \"size\": \"$companySize\",
    \"location\": \"<GENERATED_CITY>, $country\",
    \"website\": \"<VERIFIED_DOMAIN_OR_GOOGLE_SEARCH_URL>\",
    \"digitalMaturityScore\": \"<CALCULATED_SCORE_FRENCH>\",
    \"aiPotentialScore\": \"<CALCULATED_SCORE_FRENCH>\",
    \"purchaseProbability\": \"<CALCULATED_SCORE_FRENCH>\",
    \"decisionMakerName\": \"<GENERATED_FIRSTNAME_LASTNAME>\",
    \"decisionMakerFunction\": \"$targetFunction\",
    \"technologiesUsed\": [\"<TECH_1>\", \"<TECH_2>\", \"<TECH_3>\"]
  }
]";

    $userPrompt = "Cible demandée :\nSecteur : $sector\nPays : $country\nRégion : $region\nTaille : $companySize\nFonction visée : $targetFunction\nMots-clés : $keywords";

    $orchestrator = new MultiLLMOrchestrator();
    $response = $orchestrator->executePrompt('leads_generator', $systemPrompt, $userPrompt, $company_id, null);

    if (isset($response['success']) && $response['success']) {
        $content = $response['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\[.*\]/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!is_array($data)) {
            throw new Exception("Format de réponse invalide pour les leads.");
        }

        // Post-traitement de sécurité absolue sur les liens
        foreach ($data as &$lead) {
            $site = trim($lead['website'] ?? '');
            if (empty($site) || strpos($site, 'exemple') !== false || strpos($site, 'example') !== false || strpos($site, 'http') !== 0) {
                $comp = $lead['companyName'] ?? 'Entreprise';
                $loc = $lead['location'] ?? $country;
                $lead['website'] = "https://www.google.com/search?q=" . urlencode("{$comp} {$loc} site officiel");
            }
        }
        unset($lead);

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
