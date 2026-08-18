<?php
require_once 'config.php';
require_once 'mail/mailer.php';

// Désactiver le buffer de sortie pour pouvoir envoyer les données en temps réel (SSE / Streaming)
ob_implicit_flush(1);
while (ob_get_level()) {
    ob_end_clean();
}

// Le frontend va faire un POST en utilisant fetch et récupérer le flux en continu.
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

$inputData = json_decode(file_get_contents("php://input"), true);
$history = $inputData['history'] ?? [];
$services = $inputData['services'] ?? "Outils non fournis.";

// --- SÉCURITÉ : VÉRIFICATION DU TOKEN JWT ---
$token = get_bearer_token();
if (!$token) {
    http_response_code(401);
    send_sse_event('error', ['message' => 'Accès refusé. Aucun token fourni.']);
    exit;
}

$payload = verify_jwt($token);
if (!$payload || !isset($payload['company_id'])) {
    http_response_code(401);
    send_sse_event('error', ['message' => 'Token invalide ou expiré. Veuillez vous reconnecter.']);
    exit;
}
$company_id = $payload['company_id'];
$company_name = $payload['company_name'] ?? 'Entreprise';
$company_email = $payload['email'] ?? '';
// --------------------------------------------- // La liste des services IA du site envoyée par le frontend

/**
 * Fonction utilitaire pour envoyer un événement SSE au frontend
 */
function send_sse_event($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    flush();
}

try {
    send_sse_event('status', ['message' => 'Lancement de la phase d\'analyse par les experts...']);
    
    // On construit le contexte global du profil (Persona) à partir de l'historique
    $persona = "";
    foreach ($history as $msg) {
        if ($msg['role'] === 'user') {
            $persona .= "- Réponse utilisateur : " . (is_array($msg['content']) ? implode(", ", $msg['content']) : $msg['content']) . "\n";
        } elseif ($msg['role'] === 'assistant') {
            $content = json_decode($msg['content'], true);
            if ($content && isset($content['question'])) {
                $persona .= "- Question : " . $content['question'] . "\n";
            }
        }
    }

    $agents = [
        ["name" => "Agent Stratège", "role" => "Analyser la vision globale, le ROI et la compétitivité."],
        ["name" => "Agent Technique", "role" => "Analyser la faisabilité technique, les outils et l'automatisation."],
        ["name" => "Agent Financier", "role" => "Évaluer les coûts, le budget et la rentabilité."]
    ];

    $discussionHistory = "Profil établi :\n$persona\n\nDébut de la discussion :\n";
    
    // Boucle de discussion (simulation de 3 tours pour rester dans un temps raisonnable, max 10 si nécessaire)
    $tours = 3; 

    for ($i = 0; $i < $tours; $i++) {
        foreach ($agents as $agent) {
            $prompt = "
            Tu joues le rôle de l'{$agent['name']} ({$agent['role']}).
            Voici le profil du prospect et la discussion en cours :
            $discussionHistory
            
            DONNE TON AVIS en 1 paragraphe très percutant (pas de blabla). Réagis à ce qui vient d'être dit si tu n'es pas d'accord, ou apporte un nouvel angle.
            ";

            $messages = [
                ["role" => "system", "content" => "Tu es un expert dans un panel de diagnostic IA."],
                ["role" => "user", "content" => $prompt]
            ];

            // Appel au LLM (Groq) SANS mode JSON pour avoir du texte pur
            $response = call_llm_api($messages, false);
            $agentSpeech = $response['choices'][0]['message']['content'];
            
            $discussionHistory .= "{$agent['name']} : $agentSpeech\n";
            
            // Envoi en temps réel au frontend
            send_sse_event('agent_message', [
                'agent' => $agent['name'],
                'message' => $agentSpeech
            ]);
            
            // On attend 1 seconde pour éviter de se faire bloquer par l'API pour spam
            sleep(1); 
        }
    }

    send_sse_event('status', ['message' => 'Synthèse et recommandation en cours...']);

    // Agent final qui génère le rapport structuré
    $finalPrompt = "
    En tant que Coordinateur Principal, lis la discussion suivante :
    $discussionHistory
    
    Et connaissant les services IA que nous proposons :
    $services
    
    TA MISSION :
    1. Fais une synthèse.
    2. DÉDUIS des informations que l'utilisateur N'A PAS déclarées explicitement mais que tu devines grâce à ton expertise (ex: goulots d'étranglements cachés, pertes financières probables liées à son secteur). C'est l'effet 'Wow' qui prouve qu'on comprend son business mieux que lui-même.
    3. Recommande des outils de notre catalogue pertinents.

    Génère le rapport final au format JSON strict avec la structure suivante :
    {
        \"score\": 85, // Note sur 100 de maturité IA
        \"synthesis\": \"Synthèse globale du panel...\",
        \"deduced_insights\": [
            \"Je remarque que bien que vous ne l'ayez pas mentionné, la gestion de vos devis dans votre secteur engendre probablement une perte de 5h par semaine...\"
        ],
        \"recommendations\": [
            { \"tool_name\": \"Nom d'un outil de notre catalogue pertinent\", \"reason\": \"Pourquoi c'est pertinent\" }
        ]
    }
    ";

    $finalMessages = [
        ["role" => "system", "content" => "Tu es le coordinateur qui génère le JSON final."],
        ["role" => "user", "content" => $finalPrompt]
    ];

    // Appel avec mode JSON forcé
    $finalResponse = call_llm_api($finalMessages, true);
    $finalJson = json_decode($finalResponse['choices'][0]['message']['content'], true);

    // Envoi du rapport final
    send_sse_event('final_report', $finalJson);
    
    // --- SAUVEGARDE DANS LA BASE DE DONNÉES ---
    try {
        $pdo = get_db_connection();
        $stmt = $pdo->prepare("
            INSERT INTO diagnostics (company_id, diagnostic_type, questions_answers, score, report, status) 
            VALUES (?, 'express', ?, ?, ?, 'completed')
        ");
        
        // On sauvegarde l'historique complet en JSON et le rapport final en JSON
        $stmt->execute([
            $company_id,
            json_encode($history, JSON_UNESCAPED_UNICODE),
            $finalJson['score'] ?? 0,
            json_encode($finalJson, JSON_UNESCAPED_UNICODE)
        ]);
        
        // --- ENVOI DE L'E-MAIL ---
        if (!empty($company_email)) {
            send_diagnostic_report($company_email, $company_name, $finalJson);
        }

    } catch (Exception $dbError) {
        // On n'interrompt pas le flux pour l'utilisateur, mais on peut logguer l'erreur côté serveur
        error_log("Erreur de sauvegarde DB : " . $dbError->getMessage());
    }

    send_sse_event('status', ['message' => 'Terminé']);
    
} catch (Exception $e) {
    send_sse_event('error', ['message' => $e->getMessage()]);
}
