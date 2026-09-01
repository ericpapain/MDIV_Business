<?php
// Fichier : /api/diagnostic_agents.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configuration SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
// Désactiver le buffering de sortie
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', 1);
}
@ini_set('zlib.output_compression', 0);
@ini_set('implicit_flush', 1);
for ($i = 0; $i < ob_get_level(); $i++) { ob_end_flush(); }
ob_implicit_flush(1);

require_once __DIR__ . '/groq_client.php';

// Fonction utilitaire pour envoyer un événement SSE
function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data) . "\n\n";
    flush();
}

$company_id = 1; // Temporaire, à adapter avec l'auth

try {
    $input_raw = $_GET['context'] ?? '{}'; // On passe le contexte via GET car SSE utilise GET
    $context = json_decode(base64_decode($input_raw), true);
    
    if (!$context) {
        sendSSE('error', ['message' => 'Contexte manquant ou invalide.']);
        exit;
    }

    $profile_text = json_encode($context);

    // Initialisation de la conversation des experts
    $messages = [
        ["role" => "system", "content" => "Tu joues le rôle de deux experts IA qui débattent. L'Expert Stratégie évalue l'impact business, l'Expert Technique évalue la faisabilité et les outils. Voici le profil de l'entreprise : " . $profile_text]
    ];

    $agents = ["Expert Stratégie", "Expert Technique"];
    $turns = 4; // On limite à 4 échanges pour que ce soit rapide et pertinent
    
    $full_discussion = "";

    for ($i = 0; $i < $turns; $i++) {
        $current_agent = $agents[$i % 2];
        
        $prompt = "C'est à toi de parler, $current_agent. ";
        if ($i == 0) {
            $prompt .= "Fais une première analyse rapide des défis de cette entreprise et propose une direction. IMPORTANT : Si tu manques d'informations cruciales pour faire un bon diagnostic, au lieu de répondre normalement, réponds UNIQUEMENT avec ce JSON strict : {\"action\":\"interrupt\", \"question\":\"La question supplémentaire que tu veux poser au client, ou demande-lui d'importer un document (ex: devis, facture).\"}";
        } else {
            $prompt .= "Réagis de façon constructive (mais critique si nécessaire) au message précédent. Fais une réponse concise (3-4 phrases max).";
        }

        $messages[] = ["role" => "user", "content" => $prompt];
        
        // Appel à l'API Groq
        $result = callGroqApi($messages, LLM_MODEL, false);
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
    sendSSE('agent_message', ['agent' => 'Synthèse IA', 'message' => 'Génération du rapport d\'audit final en cours...']);
    
    $messages[] = [
        "role" => "user", 
        "content" => "Maintenant, génère la synthèse finale. Tu dois OBLIGATOIREMENT répondre en JSON avec ce format exact : { \"score\": 75, \"synthesis\": \"texte court\", \"deduced_insights\": [\"insight 1\", \"insight 2\"], \"recommendations\": [ { \"tool_name\": \"Nom Outil\", \"reason\": \"Raison...\"} ] }"
    ];
    
    $result = callGroqApi($messages, 'llama-3.1-8b-instant', false);
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
            "synthesis" => "Une erreur de formatage s'est produite lors de la synthèse.",
            "deduced_insights" => [],
            "recommendations" => []
        ];
    }

    // Sauvegarde en Base de données
    try {
        require_once __DIR__ . '/config.php';
        
        if (isset($pdo)) {
            $stmt = $pdo->prepare("INSERT INTO diagnostics (company_id, diagnostic_type, questions_answers, score, report, status) VALUES (?, 'express', ?, ?, ?, 'completed')");
            $stmt->execute([
                $company_id, 
                json_encode($context), 
                $report_data['score'] ?? 0, 
                json_encode($report_data)
            ]);
        }
    } catch(Exception $db_e) {
        // On ignore l'erreur DB pour ne pas casser le front, mais on pourrait la logguer
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
