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
    $estimatorPrompt = "Tu es le Métreur & Chiffreur Technique en chef.
Découpe les prestations demandées en tâches opérationnelles claires, quantifiables et réalistes.
Pour chaque tâche, estime les fournitures, la main d'œuvre et les coûts indicatifs hors taxes.
Sois précis et direct (environ 100 à 130 mots)." . $companyPromptInjection;

    $res1 = callGroqApi([
        ['role' => 'system', 'content' => $estimatorPrompt],
        ['role' => 'user', 'content' => "Projet à chiffrer :\nClient : $clientContext\nBudget : " . ($budget ?: 'Non spécifié') . "\nDescription :\n$projectDescription"]
    ], null, false, false);
    $technicalDraft = trim($res1['choices'][0]['message']['content'] ?? "Découpage technique effectué.");

    // Tour 2 : Auditeur des Marges & Risques
    $marginAuditorPrompt = "Tu es l'Auditeur des Marges & Risques de Chantier / Projet.
Examine le découpage technique ci-dessus :
1. Quels frais annexes, consommables ou aléas n'ont pas été pris en compte ?
2. Comment optimiser la rentabilité tout en restant compétitif sur le marché ?
3. Quelles clauses de protection (délai de validité du devis, révision des prix) recommandes-tu ?
Reste concis et incisif (environ 80 à 110 mots)." . $companyPromptInjection;

    $res2 = callGroqApi([
        ['role' => 'system', 'content' => $marginAuditorPrompt],
        ['role' => 'user', 'content' => "Proposition technique :\n" . $technicalDraft]
    ], null, false, false);
    $marginCritique = trim($res2['choices'][0]['message']['content'] ?? "Audit des marges finalisé.");

    // Tour 3 : Directeur Commercial & Consensus Final (JSON)
    $systemPrompt = "Tu es le Directeur Commercial & Négociateur pour MDIV Business.
Tu clôtures l'arbitrage entre le Métreur Technique et l'Auditeur des Marges.
Génère la proposition commerciale définitive avec des lignes de devis réalistes, valorisantes et conformes aux normes du secteur.
$companyPromptInjection

GARDE-FOU ANTI-GRIBOUILLAGE :
Si la saisie client est incohérente, fantaisiste ou dénuée de sens métier, renvoie :
{\"error\": \"Votre saisie semble incomplète ou incompréhensible. Pour générer un devis précis, veuillez indiquer au minimum la nature des prestations souhaitées, le contexte du client et les quantités ou budgets indicatifs.\"}

Tu dois répondre UNIQUEMENT par un objet JSON valide suivant rigoureusement cette structure :
{
  \"suggestedLines\": [
    {
      \"id\": \"1\",
      \"description\": \"Intitulé précis et valorisant de la prestation\",
      \"quantity\": 1,
      \"unitPriceHT\": 1200,
      \"vatRate\": 20,
      \"discountPercentage\": 0
    }
  ],
  \"executiveSummary\": \"Synthèse commerciale valorisante des objectifs, garanties et bénéfices du devis...\",
  \"paymentTerms\": \"Conditions de règlement équilibrées (ex: Acompte 30% à la signature, 40% à mi-parcours, solde à la livraison)\",
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
