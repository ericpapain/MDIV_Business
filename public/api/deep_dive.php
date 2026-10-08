<?php
/**
 * API deep_dive.php - Approfondissement contextuel d'une section IA
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw = json_decode(file_get_contents('php://input'), true) ?: [];
$sectionTitle = $raw['sectionTitle'] ?? ($raw['section_title'] ?? 'Section');
$sectionContent = is_array($raw['sectionContent'] ?? null) ? json_encode($raw['sectionContent']) : ($raw['sectionContent'] ?? '');
$question = trim($raw['question'] ?? '');
$toolType = $raw['toolType'] ?? ($raw['tool_type'] ?? 'Général');
$globalContext = $raw['globalContext'] ?? '';

if (empty($question)) {
    http_response_code(400);
    echo json_encode(['error' => "Veuillez poser une question pour approfondir cette section."]);
    exit;
}

$systemPrompt = "You are a Chief of Staff and senior executive consultant in operational strategy and business management for MDIV Business, expert in the field \"{$toolType}\".
The user wants to deep dive into a specific section of an AI deliverable.

Concerned section: \"{$sectionTitle}\"
Current content of the section:
\"\"\"
" . substr($sectionContent, 0, 3000) . "
\"\"\"
" . ($globalContext ? "Contexte global du projet : \"\"\"" . substr($globalContext, 0, 1500) . "\"\"\"" : "") . "

ABSOLUTE ZERO GENERALITY RULE:
Strictly forbidden to provide trivialities, empty generalities, or theoretical obviousness (e.g., \"you must train teams\", \"it is important to optimize costs\").
Every deep dive response MUST be:
1. ULTRA-CONCRETE: precise methods, formulation examples, standard clauses.
2. ACTION-ORIENTED: precise deadlines in days/weeks, impact and margin percentages. NO FINANCIAL COSTS.
3. STRUCTURED: exactly 3 immediate action steps, numbered [1], [2], [3], actionable tomorrow morning.
4. CONTEXTUALIZED: directly calibrated to the user's exact industry sector.

CRITICAL PRICING DIRECTIVE:
NEVER provide exact costs, prices, or financial estimates (in euros, dollars, etc.). If the user asks for prices, costs, or estimates, YOU MUST respond by directing them to our contact page using exactly this markdown link: [Nous contacter pour une étude de prix](/contact).

GARDE-FOU ANTI-GRIBOUILLAGE :
Si la question posée est du gribouillage (suite de lettres sans signification comme \"asdfgh\", \"blabla\", \"aze rty\", etc.) ou totalement incohérente :
Tu DOIS répondre poliment dans \"answer\" :
\"⚠️ Votre question semble incomplète ou incompréhensible. Pour approfondir la section \\\"{$sectionTitle}\\\", veuillez poser une question précise (par exemple sur le chiffrage, les délais de mise en œuvre, les obligations légales ou les risques associés).\"
avec \"key_takeaways\": [\"Préciser votre question\"].

Réponds STRICTEMENT par un JSON valide :
{
  \"answer\": \"Texte détaillé, chiffré et structuré en 3 étapes d'action...\",
  \"key_takeaways\": [
    \"Point clé chiffré 1\",
    \"Point clé opérationnel 2\",
    \"Point clé décisionnel 3\"
  ]
}";

$userPrompt = "Question d'approfondissement sur la section \"{$sectionTitle}\" :\n{$question}";

try {
    $res = callGroqApi([
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ], null, false, true);
    
    // Si la réponse n'est pas un tableau, la décoder (au cas où)
    if (is_array($res)) {
        echo json_encode($res);
    } else {
        echo $res;
    }
} catch (Exception $e) {
    echo json_encode([
        'answer' => "Approfondissement pour {$sectionTitle} : " . $question . "\n\nAnalyse détaillée : Nous recommandons une démarche par étapes ciblée pour sécuriser ce point clé.",
        'key_takeaways' => ["Vérification des jalons opérationnels", "Attribution d'un responsable dédié"]
    ]);
}
