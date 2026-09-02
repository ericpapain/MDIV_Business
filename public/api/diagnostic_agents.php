<?php
// Fichier : /api/diagnostic_agents.php
// Empêcher config.php d'écraser les headers SSE
define('SKIP_DEFAULT_HEADERS', true);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Pour Nginx/proxy

// Désactiver le buffering de sortie
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
while (ob_get_level() > 0) { ob_end_flush(); }
ob_implicit_flush(1);

require_once __DIR__ . '/groq_client.php';
require_once __DIR__ . '/website_scraper.php';

// Fonction utilitaire pour envoyer un événement SSE
function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    flush();
}

$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;

try {
    $input_raw = $_GET['context'] ?? '{}'; // On passe le contexte via GET car SSE utilise GET
    // Tenter d'abord le JSON direct (URL-encoded par le frontend)
    $context = json_decode($input_raw, true);
    // Fallback : ancien format base64
    if (!$context) {
        $context = json_decode(base64_decode($input_raw), true);
    }
    
    if (!$context) {
        sendSSE('error', ['message' => 'Contexte manquant ou invalide.']);
        exit;
    }

    $website_url = $context['website_url'] ?? '';
    $website_extra = "";
    if (!empty($website_url)) {
        $scraped = scrape_website_content($website_url);
        if ($scraped) {
            $website_extra = "\n\nCONTENU EXTRAIT DE LEUR SITE WEB (" . $website_url . ") :\n" . $scraped;
        }
    }

    $profile_text = json_encode($context, JSON_UNESCAPED_UNICODE) . $website_extra;

    // Initialisation de la conversation des experts
    $messages = [
        ["role" => "system", "content" => "Tu joues le rôle de deux experts en transformation digitale d'entreprise qui débattent pour conseiller un dirigeant non-technique :
- L'Expert Stratégie évalue l'impact business, le gain de temps et le retour sur investissement.
- L'Expert Technique évalue la simplicité de mise en place et les outils adaptés aux équipes non-développeurs.

RÈGLE MAJEURE SUR LE MULTI-CHOIX : L'utilisateur a pu sélectionner PLUSIEURS choix par question. Tu dois obligatoirement prendre en compte l'ENSEMBLE des réponses cochées pour analyser les besoins combinés de l'entreprise.

Voici les réponses et le profil complet de l'entreprise (incluant le contenu analysé de leur site web si disponible) : " . $profile_text]
    ];

    $agents = ["Expert Stratégie", "Expert Technique"];
    $turns = 4; // On limite à 4 échanges pour que ce soit rapide et pertinent
    
    $full_discussion = "";

    for ($i = 0; $i < $turns; $i++) {
        $current_agent = $agents[$i % 2];
        
        $prompt = "C'est à toi de parler, $current_agent. ";
        if ($i == 0) {
            $prompt .= "Fais une première analyse claire et accessible des défis de cette entreprise en tenant compte de TOUS leurs choix exprimés et des informations tirées de leur site web. Propose des pistes concrètes sans jargon. IMPORTANT : Si tu manques d'informations cruciales pour faire un bon diagnostic, au lieu de répondre normalement, réponds UNIQUEMENT avec ce JSON strict : {\"action\":\"interrupt\", \"question\":\"La question supplémentaire que tu veux poser au client, ou demande-lui d'importer un document (ex: devis, facture).\"}";
        } else {
            $prompt .= "Réagis de façon constructive et accessible au message précédent. Fais une réponse fluide, concrète et concise (3-4 phrases max).";
        }

        $messages[] = ["role" => "user", "content" => $prompt];
        
        // Appel à l'API - les agents discutent en texte libre (pas de JSON mode)
        $result = callGroqApi($messages, LLM_MODEL, false, false);
        $reply = $result['choices'][0]['message']['content'];
        
        // Vérifier si c'est une interruption
        if (strpos(trim($reply), '{"action"') === 0 || strpos(trim($reply), '{"action":') !== false) {
            $interrupt_data = json_decode(trim($reply), true);
            if ($interrupt_data && isset($interrupt_data['action']) && $interrupt_data['action'] === 'interrupt') {
                sendSSE('interrupt', [
                    'agent' => $current_agent,
                    'question' => $interrupt_data['question']
                ]);
                exit; // On arrête l'exécution, le front reprendra avec le nouveau contexte
            }
        }
        
        $messages[] = ["role" => "assistant", "content" => $reply];
        
        sendSSE('agent_message', [
            'agent' => $current_agent,
            'message' => $reply
        ]);
        
        $full_discussion .= "**$current_agent**: " . $reply . "\n\n";
        
        // Petite pause pour que le front puisse animer
        usleep(500000); // 0.5 sec
    }

    // Agent final (Synthèse)
    sendSSE('agent_message', ['agent' => 'Synthèse IA', 'message' => 'Génération du rapport d\'audit pédagogique et personnalisé...']);
    
    $messages[] = [
        "role" => "user", 
        "content" => "Maintenant, génère le rapport d'audit final. Rédige avec un ton très pédagogique, clair et professionnel pour un dirigeant d'entreprise NON-technique. Explique chaque outil en détail avec des exemples métiers concrets.

Tu dois OBLIGATOIREMENT répondre en JSON avec ce format exact :
{
    \"score\": 65,
    \"synthesis\": \"Synthèse globale de la maturité numérique de l'entreprise (3-4 phrases claires et encourageantes).\",
    \"deduced_insights\": [
        \"Insight 1 : Constat précis basé sur leurs choix multiples et leur site web\",
        \"Insight 2 : Opportunité concrète identifiée pour leur activité\"
    ],
    \"recommendations\": [
        {
            \"tool_name\": \"Nom de l'outil ou de la solution (ex: Make / Zapier)\",
            \"category\": \"Domaine (ex: Automatisations & Relances clients)\",
            \"reason\": \"Explication détaillée et pédagogique de POURQUOI cet outil est recommandé et ce qu'il va changer au quotidien pour l'entreprise.\",
            \"how_to_start\": \"Conseil simple et pragmatique pour démarrer sans être développeur (ex: Créer un premier flux automatique entre vos formulaires web et votre CRM).\"
        }
    ]
}"
    ];
    
    // Pour la synthèse finale, on veut du JSON strict
    $result = callGroqApi($messages, LLM_MODEL, false, true);
    $final_json = $result['choices'][0]['message']['content'];
    
    // Essayer de parser le JSON (le LLM peut ajouter du texte autour)
    $start = strpos($final_json, '{');
    $end = strrpos($final_json, '}');
    if ($start !== false && $end !== false) {
        $final_json_clean = substr($final_json, $start, $end - $start + 1);
    } else {
        $final_json_clean = $final_json;
    }
    
    $report_data = json_decode($final_json_clean, true);

    if (!$report_data) {
        // Fallback si le JSON est mal formé
        $report_data = [
            "score" => 50,
            "synthesis" => "L'analyse de votre maturité numérique est terminée. Vos réponses montrent un fort potentiel d'optimisation par l'Intelligence Artificielle.",
            "deduced_insights" => ["Des gains de temps significatifs sont identifiés sur vos processus quotidiens."],
            "recommendations" => [
                [
                    "tool_name" => "Automatisations Métier (Zapier / Make)",
                    "category" => "Gain de temps au quotidien",
                    "reason" => "Ces plateformes permettent de connecter vos logiciels actuels sans coder, pour automatiser les relances clients et la facturation.",
                    "how_to_start" => "Identifiez la tâche répétitive qui vous prend le plus de temps chaque semaine et automatisez-la en premier."
                ]
            ]
        ];
    }

    // Sauvegarde en Base de données
    try {
        require_once __DIR__ . '/config.php';
        
        if (isset($pdo)) {
            $stmt = $pdo->prepare("INSERT INTO diagnostics (company_id, diagnostic_type, questions_answers, score, report, status) VALUES (?, 'express', ?, ?, ?, 'completed')");
            $stmt->execute([
                $company_id, 
                json_encode($context, JSON_UNESCAPED_UNICODE), 
                $report_data['score'] ?? 0, 
                json_encode($report_data, JSON_UNESCAPED_UNICODE)
            ]);
        }
    } catch(Exception $db_e) {
        // On ignore l'erreur DB pour ne pas casser le front
    }
    
    // Envoi du résultat final
    sendSSE('complete', $report_data);

} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}

// Fermeture de la connexion SSE
echo "event: close\ndata: {}\n\n";
flush();
?>
