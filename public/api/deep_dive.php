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

$systemPrompt = "Tu es un directeur de cabinet et consultant exécutif senior en stratégie opérationnelle et gestion d'entreprise pour MDIV Business, expert dans le domaine \"{$toolType}\".
L'utilisateur souhaite approfondir une section précise d'un livrable IA.

Section concernée : \"{$sectionTitle}\"
Contenu actuel de la section :
\"\"\"
" . substr($sectionContent, 0, 3000) . "
\"\"\"
" . ($globalContext ? "Contexte global du projet : \"\"\"" . substr($globalContext, 0, 1500) . "\"\"\"" : "") . "

CONSIGNE ABSOLUE ZÉRO GÉNÉRALITÉ :
Interdiction formelle de fournir des banalités, des généralités creuses ou des évidences théoriques (ex: \"il faut former les équipes\", \"il est important d'optimiser ses coûts\").
Chaque réponse d'approfondissement doit être :
1. ULTRA-CONCRÈTE : méthodes précises, exemples de formulation, barèmes de prix réalistes, clauses types.
2. CHIFFRÉE : ordres de grandeur réels en euros, pourcentages d'impact et de marge, délais précis en jours/semaines.
3. STRUCTURÉE : exactement 3 étapes d'actions immédiates, numérotées [1], [2], [3], applicables dès demain matin.
4. CONTEXTUALISÉE : directement calibrée sur le secteur d'activité exact de l'utilisateur.

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
    $res = callGroqLLM([
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ], true);
    
    echo $res;
} catch (Exception $e) {
    echo json_encode([
        'answer' => "Approfondissement pour {$sectionTitle} : " . $question . "\n\nAnalyse détaillée : Nous recommandons une démarche par étapes ciblée pour sécuriser ce point clé.",
        'key_takeaways' => ["Vérification des jalons opérationnels", "Attribution d'un responsable dédié"]
    ]);
}
