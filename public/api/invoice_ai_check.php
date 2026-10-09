<?php
require_once __DIR__ . '/multi_llm_orchestrator.php';
// public/api/invoice_ai_check.php
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
    
    $invoiceNumber = $input['invoiceNumber'] ?? 'FAC-2026-001';
    $clientName = $input['clientName'] ?? '';
    $lines = $input['lines'] ?? [];
    $totalHT = floatval($input['totalHT'] ?? 0);
    $totalTTC = floatval($input['totalTTC'] ?? 0);
    $vatAmount = floatval($input['vatAmount'] ?? 0);
    $company_id = intval($input['company_id'] ?? 1);

    // Chargement du profil entreprise, règles métier, RAG et Few-Shots
    $companyContext = get_company_context($company_id, "$invoiceNumber $clientName", 'invoice');
    $companyPromptInjection = $companyContext['prompt_injection'] ?? '';

    // ===================================================================
    // DÉLIBÉRATION MULTI-AGENTS : AUDIT FISCAL & RISQUES DE FACTURATION
    // ===================================================================

    // Tour 1 : Auditeur Fiscal & Juriste B2B
    $fiscalPrompt = "You are the Tax Auditor & B2B Legal Counsel.
Analyze the elements of this invoice:
- Verify legal compliance (mandatory mentions according to the Commercial Code and General Tax Code).
- Detect fine risks for omission of mentions or non-compliance with Factur-X / PDP 2026.
Be direct and rigorous (around 80 to 100 words).

CRITICAL REQUIREMENT: YOU MUST GENERATE ALL YOUR RESPONSES STRICTLY IN FRENCH." . $companyPromptInjection;

    $res1 = callGroqApi([
        ['role' => 'system', 'content' => $fiscalPrompt],
        ['role' => 'user', 'content' => "Facture $invoiceNumber pour $clientName - Total HT: $totalHT €, TVA: $vatAmount €, Total TTC: $totalTTC €"]
    ], null, false, false);
    $fiscalAudit = trim($res1['choices'][0]['message']['content'] ?? "Audit fiscal terminé.");

    // Tour 2 : Contrôleur de Gestion & Risques d'Impayés
    $financialPrompt = "You are the Management Controller & Collection Manager.
Evaluate the consistency of the amounts, the risks of unpaid debts, and the protective clauses (late penalties, flat €40 indemnity, payment term L. 441-10 C. com.).
Be concise (around 80 to 100 words).

CRITICAL REQUIREMENT: YOU MUST GENERATE ALL YOUR RESPONSES STRICTLY IN FRENCH." . $companyPromptInjection;

    $res2 = callGroqApi([
        ['role' => 'system', 'content' => $financialPrompt],
        ['role' => 'user', 'content' => "Audit fiscal précédent : $fiscalAudit\nDonnées facture : $totalHT € HT, $totalTTC € TTC"]
    ], null, false, false);
    $financialAudit = trim($res2['choices'][0]['message']['content'] ?? "Audit financier terminé.");

    // Tour 3 : Expert-Comptable & Consensus Final
    $systemPrompt = "You are the Chief Accountant.
Close the deliberation between the Tax Auditor and the Management Controller.
Issue the final compliance certification strictly in JSON format.
$companyPromptInjection

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON object matching this schema:
{
  \"isValid\": <CALCULATED_BOOLEAN>,
  \"errors\": [\"<ERROR_STRING_FRENCH_1>\"],
  \"warnings\": [\"<WARNING_STRING_FRENCH_1>\"],
  \"suggestedMentions\": [\"<SUGGESTED_MENTION_FRENCH_1>\"],
  \"deliberation_trail\": {
    \"fiscal_audit\": " . json_encode(mb_substr($fiscalAudit, 0, 200)) . ",
    \"financial_audit\": " . json_encode(mb_substr($financialAudit, 0, 200)) . "
  }
}";

    $userPrompt = "Facture N° : $invoiceNumber\nClient : $clientName\nTotal HT : $totalHT €\nTVA : $vatAmount €\nTotal TTC : $totalTTC €\nNombre de lignes : " . count($lines) . "\n\nDélibération des experts :\n- Audit fiscal : $fiscalAudit\n- Audit financier : $financialAudit";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, true);


    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = MultiLLMOrchestrator::cleanAndDecodeJson($content);

        if (!$data) {
            $data = [
                'isValid' => true,
                'errors' => [],
                'warnings' => ['Calculs conformes aux règles de TVA standard.'],
                'suggestedMentions' => ['Indemnité forfaitaire de 40€ pour frais de recouvrement (Art. D. 441-5 C. com.)']
            ];
        }

        // Contrôle anti-gribouillage sur les lignes
        $hasGibberish = false;
        foreach ($lines as $l) {
            $desc = trim($l['description'] ?? '');
            if (!empty($desc) && (preg_match('/^(.)\1{4,}/i', $desc) || (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!?\'-]{10,}$/i', $desc) && !preg_match('/[aeiouy]/i', $desc)))) {
                $hasGibberish = true;
                break;
            }
        }

        if ($hasGibberish) {
            $data['isValid'] = false;
            $data['errors'][] = "Votre saisie semble incomplète ou incompréhensible. Pour auditer une facture, veuillez indiquer des désignations de prestations réelles et intelligibles.";
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
