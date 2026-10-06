<?php
// Fichier : /api/diagnostic_step.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once __DIR__ . '/groq_client.php';
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
    
        $system_prompt = "Tu es un consortium d'auditeurs seniors et d'experts sectoriels de référence pour les entreprises (TPE, PME, ETI).

RÈGLE ABSOLUE POUR LE DÉROULEMENT DU DIAGNOSTIC :
- ÉTAPE 1 (Première question de la conversation) : Tu DOIS IMPÉRATIVEMENT demander \"Quel est votre domaine d'activité ?\" et proposer des secteurs d'activité généraux en options (ex: BTP, Industrie, Commerce, Services, Autre).
- ÉTAPE 2 (Deuxième question) : Tu DOIS IMPÉRATIVEMENT demander \"Qu'est-ce que vous souhaitez auditer ou améliorer en priorité dans votre activité ?\" (propose des options comme: Les processus internes, La relation client, La gestion financière/facturation, La production, Autre).
- ÉTAPES SUIVANTES : À partir de là, utilise tes connaissances sectorielles pour proposer de nouvelles questions très pointues et innovantes basées sur les problèmes soulevés.

À chaque étape du diagnostic :
1. POSITIONNE-TOI COMME UN EXPERT DE HAUT NIVEAU DANS LE DOMAINE SPÉCIFIQUE DE L'ENTREPRISE : adapte instantanément ton ton, ton vocabulaire professionnel, les problématiques sectorielles et le niveau de conseil selon le secteur révélé.
2. NE LIMITE PAS LE NOMBRE DE QUESTIONS : continue d'explorer de manière approfondie, fluide et captivante tant qu'il y a des leviers à creuser (processus de travail, goulets d'étranglement, outils logiciels existants, relation client/commerciale, gestion financière/facturation, sécurité, adoption IA et objectifs stratégiques).
3. À chaque question, fournis :
   - 'expert_domain' : Le titre de ta spécialité d'expert activée pour cette question (ex: 'Expertise Processus Opérationnels', 'Audit Infrastructure', 'Stratégie Commerciale', etc.).
   - 'expert_insight' : Une observation experte courte (1 à 2 phrases percutantes) qui valide ou commente la réponse précédente en montrant une compréhension pointue des réalités du métier.
   - 'question' : Une question d'approfondissement claire, précise et percutante.
   - 'options' : 3 à 5 choix de réponses concrètes et adaptées au secteur, en terminant TOUJOURS par 'Autre (précisez)'.
   - 'precision_score' : Le niveau de précision estimé du diagnostic (augmente progressivement : 30%, 50%, 70%, 85%, 92%, 96%, etc.)." . $website_info . "

Structure de réponse JSON STRICTE :
{
    \"expert_domain\": \"Expertise Optimisation Métier & Rentabilité\",
    \"expert_insight\": \"Votre retour met en lumière un gisement de productivité clé sur vos flux opérationnels.\",
    \"question\": \"Quelle est la principale contrainte rencontrée au quotidien dans ce processus ?\",
    \"options\": [\"Choix concret 1\", \"Choix concret 2\", \"Choix concret 3\", \"Autre (précisez)\"],
    \"precision_score\": 45
}
Ne génère AUCUN texte en dehors du JSON.";

    $messages = [
        ["role" => "system", "content" => $system_prompt]
    ];
    
    foreach($history as $msg) {
        $messages[] = [
            "role" => $msg['role'] === 'user' ? 'user' : 'assistant',
            "content" => $msg['content']
        ];
    }
    
    $result = callGroqApi($messages);
    
    $content = $result['choices'][0]['message']['content'];
    
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
