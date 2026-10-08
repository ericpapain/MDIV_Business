<?php
// public/api/quote_ai_assist.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php';
require_once __DIR__ . '/context_engine.php';

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

    // FILTRE ANTI-GRIBOUILLAGE
    $isGibberish = strlen($projectDescription) < 8
        || preg_match('/^(.)\1{4,}/i', $projectDescription)
        || (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!?\'-]{10,}$/i', $projectDescription) && !preg_match('/[aeiouy]/i', $projectDescription));

    if ($isGibberish) {
        http_response_code(400);
        echo json_encode([
            'error' => "Votre saisie semble incomplète ou incompréhensible. Pour générer un devis précis, veuillez indiquer au minimum la nature des prestations souhaitées, le contexte du client et les quantités ou budgets indicatifs."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Chargement du profil de l'entreprise, des normes sectorielles, du RAG et des Few-Shots
    $companyContext = get_company_context($company_id, $projectDescription, 'quote');
    $companyPromptInjection = $companyContext['prompt_injection'] ?? '';

    // ===================================================================
    // DÉLIBÉRATION MULTI-AGENTS POUR LE CHIFFRAGE COMMERCIAL
    // ===================================================================

    // Tour 1 : Métreur & Chiffreur Technique
    $estimatorPrompt = "You are the Chief Technical Estimator.
Break down the requested services into clear, quantifiable, and realistic operational tasks.
For each task, estimate supplies, labor, and indicative costs (excluding tax).
Be precise and direct (around 100 to 130 words).

CRITICAL REQUIREMENT: YOU MUST GENERATE ALL YOUR RESPONSES STRICTLY IN FRENCH." . $companyPromptInjection;

    $res1 = callGroqApi([
        ['role' => 'system', 'content' => $estimatorPrompt],
        ['role' => 'user', 'content' => "Projet à chiffrer :\nClient : $clientContext\nBudget : " . ($budget ?: 'Non spécifié') . "\nDescription :\n$projectDescription"]
    ], null, false, false);
    $technicalDraft = trim($res1['choices'][0]['message']['content'] ?? "Découpage technique effectué.");

    // Tour 2 : Auditeur des Marges & Risques
    $marginAuditorPrompt = "You are the Project/Site Margins & Risks Auditor.
Examine the technical breakdown above:
1. What additional costs, consumables, or contingencies have not been considered?
2. How can profitability be optimized while remaining competitive in the market?
3. What protective clauses (quote validity period, price revision) do you recommend?
Be concise and incisive (around 80 to 110 words).

CRITICAL REQUIREMENT: YOU MUST GENERATE ALL YOUR RESPONSES STRICTLY IN FRENCH." . $companyPromptInjection;

    $res2 = callGroqApi([
        ['role' => 'system', 'content' => $marginAuditorPrompt],
        ['role' => 'user', 'content' => "Proposition technique :\n" . $technicalDraft]
    ], null, false, false);
    $marginCritique = trim($res2['choices'][0]['message']['content'] ?? "Audit des marges finalisé.");

    // Tour 3 : Directeur Commercial & Consensus Final (JSON)
    $systemPrompt = "You are the Commercial Director & Negotiator for MDIV Business.
You finalize the arbitration between the Technical Estimator and the Margin Auditor.
Generate the final commercial proposal with realistic, value-adding quote lines compliant with industry standards.
$companyPromptInjection

ANTI-GIBBERISH SAFEGUARD:
If the client input is incoherent, fanciful, or lacks business sense, return:
{\"error\": \"Votre saisie semble incomplète ou incompréhensible. Pour générer un devis précis, veuillez indiquer au minimum la nature des prestations souhaitées, le contexte du client et les quantités ou budgets indicatifs.\"}

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON object strictly following this structure:
{
  \"suggestedLines\": [
    {
      \"id\": \"<GENERATED_LINE_ID>\",
      \"description\": \"<GENERATED_DESCRIPTION_STRING_FRENCH>\",
      \"quantity\": <CALCULATED_INTEGER_QUANTITY>,
      \"unitPriceHT\": <CALCULATED_FLOAT_PRICE>,
      \"vatRate\": <CALCULATED_FLOAT_VAT>,
      \"discountPercentage\": <CALCULATED_FLOAT_DISCOUNT>
    }
  ],
  \"executiveSummary\": \"<GENERATED_EXECUTIVE_SUMMARY_STRING_FRENCH>\",
  \"paymentTerms\": \"<GENERATED_PAYMENT_TERMS_STRING_FRENCH>\",
  \"consensus_deliberation\": {
    \"technical_estimation\": " . json_encode(mb_substr($technicalDraft, 0, 250)) . ",
    \"margin_audit\": " . json_encode(mb_substr($marginCritique, 0, 250)) . "
  }
}";

    $userPrompt = "Client / Contexte : $clientContext\nBudget : " . ($budget ?: 'Non spécifié') . "\nDescription du projet :\n$projectDescription\n\nDélibération des experts :\n- Chiffrage technique : $technicalDraft\n- Audit des marges : $marginCritique\n\nGénère le devis JSON final certifié.";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = trim($response['choices'][0]['message']['content']);
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{[\s\S]*\}/', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (is_array($data) && isset($data['error'])) {
            http_response_code(400);
            echo json_encode(['error' => $data['error']], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!$data || !is_array($data) || !isset($data['suggestedLines'])) {
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
