<?php
// Fichier : /api/diagnostic_step.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/multi_llm_orchestrator.php';
require_once __DIR__ . '/website_scraper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['history'])) {
        http_response_code(400);
        echo json_encode(["error" => "Historique de conversation manquant."]);
        exit;
    }

    $history = $input['history']; // Tableau du type [{role: "user", content: "..."}, ...]
    $website_url = $input['website_url'] ?? '';
    
    $website_info = "";
    if (!empty($website_url)) {
        $scraped = scrape_website_content($website_url);
        if ($scraped) {
            $website_info = "\n\nDONNÉES EXTRAITES DU SITE WEB DE L'ENTREPRISE (" . $website_url . ") :\n" . $scraped . "\nUtilise ces informations réelles pour poser des questions hyper-ciblées sur l'activité spécifique de l'entreprise.";
        }
    }
    
        $system_prompt = "You are a consortium of senior auditors and top-tier industry experts for small to medium enterprises (SMEs, mid-caps).

CRITICAL WORKFLOW RULES:
- STEP 1 (First question in the conversation): You MUST ask \"Quel est votre domaine d'activité ?\" and provide general industry sectors as options (e.g., BTP, Industrie, Santé, Commerce, Services, Autre, add more than 6 options).
- STEP 2 (Second question): You MUST ask \"Qu'est-ce que vous souhaitez auditer ou améliorer en priorité dans votre activité ?\" (provide options like: Les processus internes, La relation client, La gestion financière/facturation, La production, Autre).
- SUBSEQUENT STEPS: From here, leverage your deep industry expertise to ask highly specific, innovative, and targeted questions based on the identified pain points.

BEHAVIOR AT EACH STEP:
1. POSITION YOURSELF AS A TOP EXPERT IN THE USER'S SPECIFIC INDUSTRY: instantly adapt your tone, professional vocabulary, industry challenges, and consulting level to match their sector.
2. QUESTION LIMITS: If the user explicitly asks for their report or summary, YOU MUST NOT ask more than 3 follow-up questions. In general, your follow-up deep-dive questions should dynamically vary between 1 and 5 maximum depending on the missing information.
3. For each question, provide:
   - 'expert_domain': The title of your activated expertise.
   - 'expert_insight': A brief expert observation (1-2 impactful sentences) validating or commenting on the previous answer, demonstrating acute understanding of their business reality.
   - 'question': A clear, precise, and impactful follow-up question.
   - 'options': 3 to 5 concrete response choices tailored to the sector, ALWAYS ending with 'Autre (précisez)'.
   - 'precision_score': The estimated diagnostic precision level (gradually increasing: 30%, 50%, 70%, 85%, 92%, 96%, etc.)." . $website_info . "

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

STRICT JSON RESPONSE STRUCTURE:
{
    \"expert_domain\": \"<SPECIFIC_EXPERT_DOMAIN_STRING>\",
    \"expert_insight\": \"<GENERATED_EXPERT_INSIGHT_STRING_FRENCH>\",
    \"question\": \"<GENERATED_QUESTION_STRING_FRENCH>\",
    \"options\": [\"<RELEVANT_OPTION_STRING_1>\", \"<RELEVANT_OPTION_STRING_2>\", \"<RELEVANT_OPTION_STRING_3>\", \"Autre (précisez)\"],
    \"precision_score\": <CALCULATED_INTEGER_BETWEEN_10_AND_100>
}
Do NOT generate ANY text outside of this JSON structure.";

    $userPromptHistory = json_encode($history, JSON_UNESCAPED_UNICODE);

    $orchestrator = new MultiLLMOrchestrator();
    $result = $orchestrator->executePrompt('diagnostic', $system_prompt, "Voici l'historique de la conversation : " . $userPromptHistory, null, null);
    
    if (!isset($result['success']) || !$result['success']) {
        throw new Exception("Erreur lors du diagnostic IA.");
    }
    
    $content = $result['content'];
    
    // Tenter de parser pour valider le JSON
    $parsed = json_decode($content, true);
    if ($parsed && isset($parsed['question']) && isset($parsed['options'])) {
        // S'assurer que "Autre" est bien présent
        $hasAutre = false;
        foreach ($parsed['options'] as $opt) {
            $lower = strtolower(trim($opt));
            if ($lower === 'autre' || $lower === 'other' || strpos($lower, 'autre') === 0) {
                $hasAutre = true;
                break;
            }
        }
        if (!$hasAutre) {
            $parsed['options'][] = 'Autre (précisez)';
        }
        // S'assurer que total_questions est valide
        if (!isset($parsed['total_questions']) || $parsed['total_questions'] < 3 || $parsed['total_questions'] > 7) {
            $parsed['total_questions'] = 5;
        }
        echo json_encode($parsed, JSON_UNESCAPED_UNICODE);
    } else {
        // Fallback : renvoyer le contenu brut tel quel
        echo $content;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
