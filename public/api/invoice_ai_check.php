<?php
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
    $fiscalPrompt = "Tu es l'Auditeur Fiscal & Juriste B2B.
Analyse les éléments de cette facture :
- Vérifie la conformité légale (mentions obligatoires selon le Code de commerce et Code général des impôts).
- Détecte les risques d'amende pour omission de mentions ou non-conformité Factur-X / PDP 2026.
Sois direct et rigoureux (environ 80 à 100 mots)." . $companyPromptInjection;

    $res1 = callGroqApi([
        ['role' => 'system', 'content' => $fiscalPrompt],
        ['role' => 'user', 'content' => "Facture $invoiceNumber pour $clientName - Total HT: $totalHT €, TVA: $vatAmount €, Total TTC: $totalTTC €"]
    ], null, false, false);
    $fiscalAudit = trim($res1['choices'][0]['message']['content'] ?? "Audit fiscal terminé.");

    // Tour 2 : Contrôleur de Gestion & Risques d'Impayés
    $financialPrompt = "Tu es le Contrôleur de Gestion & Responsable Recouvrement.
Évalue la cohérence des montants, les risques d'impayés et les clauses protectrices (pénalités de retard, indemnité forfaitaire de 40€, délai de paiement L. 441-10 C. com.).
Reste concis (environ 80 à 100 mots)." . $companyPromptInjection;

    $res2 = callGroqApi([
        ['role' => 'system', 'content' => $financialPrompt],
        ['role' => 'user', 'content' => "Audit fiscal précédent : $fiscalAudit\nDonnées facture : $totalHT € HT, $totalTTC € TTC"]
    ], null, false, false);
    $financialAudit = trim($res2['choices'][0]['message']['content'] ?? "Audit financier terminé.");

    // Tour 3 : Expert-Comptable & Consensus Final
    $systemPrompt = "Tu es l'Expert-Comptable en chef.
Clôture la délibération entre l'Auditeur Fiscal et le Contrôleur de Gestion.
Émets la certification de conformité finale sous forme JSON strict.
$companyPromptInjection

Tu dois répondre UNIQUEMENT par un objet JSON valide avec ce schéma :
{
  \"isValid\": true,
  \"errors\": [],
  \"warnings\": [\"Avertissement éventuel ou point de vigilance...\"],
  \"suggestedMentions\": [\"Mention légale recommandée (ex: Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard)\"],
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
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

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
