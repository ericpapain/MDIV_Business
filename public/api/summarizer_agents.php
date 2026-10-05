<?php
// public/api/summarizer_agents.php
define('SKIP_DEFAULT_HEADERS', true);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

if (function_exists('apache_setenv')) {
    @apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
while (ob_get_level() > 0) { ob_end_flush(); }
ob_implicit_flush(1);

require_once __DIR__ . '/groq_client.php';

function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    flush();
}

$doc_id = $_GET['doc_id'] ?? '';
$mode = $_GET['mode'] ?? 'standard';
$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;

try {
    $temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_sum_' . $doc_id . '.json';
    $doc_text = "Document d'analyse d'activité et stratégie d'entreprise.";
    $doc_name = "Document_Analyse.pdf";

    if (file_exists($temp_file)) {
        $saved = json_decode(file_get_contents($temp_file), true);
        if ($saved) {
            $doc_text = $saved['text'] ?? $doc_text;
            $doc_name = $saved['documentName'] ?? $doc_name;
            $mode = $saved['mode'] ?? $mode;
        }
    }

// Configuration des modes spécialisés
$modeTitle = "Standard";
$agent1Msg = "Lecture approfondie de « $doc_name » en mode « $mode ». Extraction des métriques et segmentation textuelle...";
$agent2Msg = "Évaluation des enjeux critiques, détection des risques et formalisation des arbitrages requis...";
$modeInstructions = "";

if ($mode === 'express') {
    $modeTitle = "Express (Max 10 lignes)";
    $agent1Msg = "Filtrage chirurgical de « $doc_name » en mode Express. Élimination immédiate de tout détail secondaire...";
    $agent2Msg = "Extraction condensée : focus exclusif sur les 2-3 informations vitales et urgences absolues.";
    $modeInstructions = "
DIRECTIVES STRICTES POUR LE MODE EXPRESS :
- OBJECTIF : Résumé ultra-court, percutant, assimilable en 30 secondes chrono.
- LONGUEUR : La 'executiveSummary' doit faire STRICTEMENT MAXIMUM 10 LIGNES (entre 60 et 100 mots au total). Style direct et télégraphique.
- CONTENU : Ne conserver que l'essentiel vital (le problème central, le résultat majeur, l'urgence). Supprimer impérativement tout bavardage, contexte secondaire ou chiffres anecdotiques.
- 'keyPoints' : Exactement 2 ou 3 points clés vitaux (pas plus).
- 'objectives' : 1 ou 2 objectifs capitaux.
- 'risks' : 1 ou 2 risques critiques majeurs.
- 'recommendedActions' : 1 ou 2 actions prioritaires directes.
- 'decisions' : 1 décision clé à trancher immédiatement.
- 'kpis' : {\"readabilityScore\": 95, \"pageCount\": 1, \"estimatedTimeSavedMinutes\": 15}";
} else if ($mode === 'detailed') {
    $modeTitle = "Détaillé (Dossier Exhaustif)";
    $agent1Msg = "Analyse exhaustive de « $doc_name » en mode Détaillé. Indexation intégrale des chiffres, dates, clauses et annexes...";
    $agent2Msg = "Audit de fond : cartographie des risques multidimensionnels, ventilation des responsabilités et plan d'action approfondi.";
    $modeInstructions = "
DIRECTIVES STRICTES POUR LE MODE DÉTAILLÉ :
- OBJECTIF : Synthèse approfondie et complète pour audit technique, juridique ou financier.
- LONGUEUR : La 'executiveSummary' doit être très structurée et détaillée en 4 à 5 paragraphes denses (450 à 650 mots).
- CONTENU : Conserver scrupuleusement tous les éléments contextuels, pourcentages, montants financiers, articles, dates, contraintes opérationnelles et clauses mentionnées dans le texte.
- 'keyPoints' : 6 à 8 points clés précis, détaillés et chiffrés.
- 'objectives' : 4 à 6 objectifs et sous-objectifs découpés.
- 'risks' : 4 à 6 risques catégorisés (Financier, Juridique, Technique, RH/Opérationnel).
- 'recommendedActions' : 5 à 7 actions concrètes avec contexte détaillé, livrables attendus et jalons.
- 'decisions' : 3 à 5 décisions d'arbitrage opérationnelles.
- 'deadlines' : Toutes les échéances et dates repérées dans le document.
- 'stakeholders' : Toutes les parties prenantes et équipes mentionnées.
- 'kpis' : {\"readabilityScore\": 82, \"pageCount\": 5, \"estimatedTimeSavedMinutes\": 75}";
} else if ($mode === 'direction') {
    $modeTitle = "Direction (Prise de Décision & ROI)";
    $agent1Msg = "Cadrage décisionnel de « $doc_name » pour la Direction. Extraction des impacts business, rentabilité et ROI...";
    $agent2Msg = "Analyse managériale : identification des arbitrages critiques, risques d'inaction et priorités d'investissement.";
    $modeInstructions = "
DIRECTIVES STRICTES POUR LE MODE DIRECTION :
- OBJECTIF : Note de synthèse d'aide à la décision pour Directeur Général, VP ou Manager exécutif.
- LONGUEUR : La 'executiveSummary' doit être orientée business et arbitrage (250 à 400 mots, 3-4 paragraphes).
- ANGLE D'ANALYSE : Focaliser sur l'impact business, la rentabilité, le retour sur investissement (ROI), les risques d'inaction et les priorités de déploiement.
- 'keyPoints' : 4 à 5 leviers stratégiques et impacts sur le chiffre d'affaires / les marges / l'efficacité.
- 'objectives' : 3 objectifs stratégiques orientés résultats et rentabilité.
- 'risks' : 3 à 5 risques de rentabilité, de gouvernance ou de conformité avec leur degré de criticité.
- 'recommendedActions' : 3 à 5 actions managériales priorisées (Quick Wins vs Projets de fond) avec responsables cibles.
- 'decisions' : 3 arbitrages décisionnels majeurs que la Direction doit valider.
- 'kpis' : {\"readabilityScore\": 90, \"pageCount\": 3, \"estimatedTimeSavedMinutes\": 45}";
} else if ($mode === 'comex') {
    $modeTitle = "Comex (Synthèse Stratégique < 2 min)";
    $agent1Msg = "Préparation du briefing Comité Exécutif sur « $doc_name ». Synthèse macroscopique à très fort impact...";
    $agent2Msg = "Focalisation Comex : arbitrage des 2 enjeux vitaux, vision gouvernance et résolution stratégique à voter.";
    $modeInstructions = "
DIRECTIVES STRICTES POUR LE MODE COMEX :
- OBJECTIF : Briefing exécutif ultra-condensé pour le Comité Exécutif / Conseil d'Administration, conçu pour être lu en moins de 2 minutes.
- LONGUEUR : La 'executiveSummary' doit faire 150 à 250 mots maximum.
- TON ET VOCABULAIRE : Vocabulaire de haute gouvernance, percutant, focalisé sur la vision globale, les indicateurs macroscopiques, l'impact sur la valeur de l'entreprise et les équilibres stratégiques.
- 'keyPoints' : Strictement 3 points d'arbitrage Comex fondamentaux.
- 'objectives' : 2 impératifs stratégiques de gouvernance.
- 'risks' : 2 risques majeurs / systémiques de haut niveau.
- 'recommendedActions' : 2 ou 3 résolutions stratégiques à soumettre au vote du Comex.
- 'decisions' : Les arbitrages formels attendus des membres du Comex.
- 'kpis' : {\"readabilityScore\": 94, \"pageCount\": 1, \"estimatedTimeSavedMinutes\": 60}";
} else {
    $modeTitle = "Standard (Équilibré ~1 page)";
    $agent1Msg = "Lecture équilibrée de « $doc_name » en mode Standard. Synthèse des sections clés et des enseignements...";
    $agent2Msg = "Extraction équilibrée : analyse du contexte, des objectifs, des points clés et des recommandations opérationnelles.";
    $modeInstructions = "
DIRECTIVES STRICTES POUR LE MODE STANDARD :
- OBJECTIF : Résumé équilibré d'environ une page (200 à 300 mots, 3 paragraphes bien découpés).
- CONTENU : Présenter les points clés avec un niveau de détail moyen, une excellente clarté et un bon équilibre entre contexte et actions.
- 'keyPoints' : 4 ou 5 points clés bien argumentés.
- 'objectives' : 2 ou 3 objectifs identifiés.
- 'risks' : 2 à 4 risques identifiés avec impact opérationnel.
- 'recommendedActions' : 3 ou 4 actions recommandées avec justification contextuelle.
- 'decisions' : 2 ou 3 décisions à acter.
- 'kpis' : {\"readabilityScore\": 88, \"pageCount\": 2, \"estimatedTimeSavedMinutes\": 35}";
}

// Agent 1: Analyste Structurel
sendSSE('agent_message', [
    'agent' => 'Analyste Structurel',
    'message' => $agent1Msg
]);
usleep(300000);

// Agent 2: Expert Stratégie & Décision
sendSSE('agent_message', [
    'agent' => 'Expert Stratégie & Décision',
    'message' => $agent2Msg
]);
usleep(300000);

$systemPrompt = "Tu es un consortium d'experts et directeurs d'entreprise de haut niveau (Analyste Stratégique, Auditeur des Risques, Directeur Général).
Ton rôle est de générer la synthèse exécutive du document fourni selon le mode strictement sélectionné : $modeTitle.

$modeInstructions

RÈGLE ABSOLUE DE VÉRACITÉ : Base-toi UNIQUEMENT et EXCLUSIVEMENT sur les informations réellement présentes dans le document fourni. Ne cite aucun fait ou chiffre non mentionné.
Tu dois répondre UNIQUEMENT par un objet JSON valide respectant rigoureusement ce schéma :
{
  \"id\": \"$doc_id\",
  \"documentName\": \"$doc_name\",
  \"mode\": \"$mode\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"kpis\": {
    \"readabilityScore\": 88,
    \"pageCount\": 1,
    \"estimatedTimeSavedMinutes\": 35
  },
  \"keywords\": [\"terme1\", \"terme2\", \"terme3\", \"terme4\", \"terme5\"],
  \"majorConcepts\": [\"concept majeur 1\", \"concept majeur 2\", \"concept majeur 3\"],
  \"executiveSummary\": \"Texte rédigé selon les règles strictes de longueur, de structure et de ton du mode $mode...\",
  \"objectives\": [\"Objectif 1 extrait du document\"],
  \"keyPoints\": [\"Point clé 1 structuré selon le mode $mode\"],
  \"risks\": [\"Risque réel identifié\"],
  \"recommendedActions\": [
    {\"action\": \"Action 1\", \"context\": \"Contexte et bénéfice attendu\"}
  ],
  \"decisions\": [\"Décision 1 à acter\"],
  \"deadlines\": [\"Échéance 1\"],
  \"stakeholders\": [\"Direction Générale\", \"Équipes Opérationnelles\"]
}";

$userPrompt = "Voici le contenu intégral du document à analyser en mode « " . strtoupper($mode) . " » :\n\n" . mb_substr($doc_text, 0, 8000) . "\n\nGénère le rapport JSON strictement conforme au mode $mode.";

sendSSE('agent_message', [
    'agent' => 'Directeur Synthèse Exécutive',
    'message' => "Consolidation finale du rapport au format $modeTitle..."
]);

$messages = [
    ['role' => 'system', 'content' => $systemPrompt],
    ['role' => 'user', 'content' => $userPrompt]
];

$response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

if (isset($response['choices'][0]['message']['content'])) {
    $content = $response['choices'][0]['message']['content'];
    $reportData = json_decode($content, true);

    if (!$reportData) {
        if (preg_match('/\{.*\}/s', $content, $m)) {
            $reportData = json_decode($m[0], true);
        }
    }

    if (!$reportData) {
        throw new Exception("Format de réponse IA invalide pour la synthèse.");
    }

    // Assurer la présence des champs essentiels et la conformité du mode
    $reportData['id'] = $doc_id;
    $reportData['documentName'] = $doc_name;
    $reportData['mode'] = $mode;
    $reportData['date'] = date('Y-m-d');

    sendSSE('complete', $reportData);
} else {
    throw new Exception("Aucune réponse du modèle IA.");
}

} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}

