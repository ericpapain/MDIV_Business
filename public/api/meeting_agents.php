<?php
// public/api/meeting_agents.php
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
require_once __DIR__ . '/context_engine.php';

function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    flush();
}

$context = $_GET['context'] ?? '';
$company_id = isset($_GET['company_id']) ? intval($_GET['company_id']) : 1;

// Chargement du profil de l'entreprise et de sa posture d'expert sectoriel
$companyContext = get_company_context($company_id);
$companyPromptInjection = $companyContext['prompt_injection'] ?? '';

try {
    $meeting_text = $context;
    $initial_report = null;

    // Tentative de récupération depuis le stockage temporaire par ID
    if (!empty($context) && (strpos($context, 'meet_') === 0 || strlen($context) < 60)) {
        $temp_file = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'mdiv_meet_' . $context . '.json';
        $local_temp_file = __DIR__ . '/temp/mdiv_meet_' . $context . '.json';
        if (!file_exists($temp_file) && file_exists($local_temp_file)) {
            $temp_file = $local_temp_file;
        }

        if (file_exists($temp_file)) {
            $saved = json_decode(file_get_contents($temp_file), true);
            if ($saved) {
                $meeting_text = $saved['raw_text'] ?? $meeting_text;
                $initial_report = $saved['report'] ?? null;
            }
        }
    }

    if (empty($meeting_text)) {
        $meeting_text = "Réunion de coordination opérationnelle.";
    }

    // Rechargement dynamique du profil de l'entreprise, des règles sectorielles et des Few-Shots
    $companyContext = get_company_context($company_id, mb_substr($meeting_text, 0, 400), 'meeting');
    $companyPromptInjection = $companyContext['prompt_injection'] ?? '';

    $sample = mb_substr($meeting_text, 0, 7000);
    $startTime = microtime(true);

    // ===================================================================
    // TOUR 1 : Agent 1 - Secrétaire de séance & Extraction Verbatim
    // ===================================================================
    sendSSE('agent_message', [
        'agent' => 'Agent 1 : Secrétaire de séance',
        'message' => "Analyse du verbatim de la réunion, identification des intervenants et structuration de l'ordre du jour..."
    ]);

    $agent1Prompt = "Tu es le Secrétaire Général de séance pour un comité de direction d'entreprise.
Analyse les notes ou transcriptions orales de la réunion suivante :
1. Identifie les participants réels ou implicites et l'objet principal
2. Extrais les faits saillants, annonces et points abordés
3. Liste les premières tâches et engagements évoqués
Sois précis, direct et professionnel (environ 110 à 150 mots)." . $companyPromptInjection;

    $res1 = callGroqApi([
        ['role' => 'system', 'content' => $agent1Prompt],
        ['role' => 'user', 'content' => "Notes de réunion :\n\n" . $sample]
    ], null, false, false);
    $agent1Draft = trim($res1['choices'][0]['message']['content'] ?? "Extraction des sujets de séance effectuée.");

    sendSSE('agent_message', [
        'agent' => 'Agent 1 : Secrétaire de séance',
        'message' => $agent1Draft
    ]);

    // ===================================================================
    // TOUR 2 : Agent 2 - Auditeur Critique & Risques Opérationnels
    // ===================================================================
    sendSSE('agent_message', [
        'agent' => 'Agent 2 : Auditeur des Risques & Échéances',
        'message' => "Challenger les engagements pris, identifier les délais irréalistes et les risques opérationnels..."
    ]);

    $agent2Prompt = "Tu es l'Auditeur des Risques Opérationnels & Échéances d'entreprise.
Examine la proposition du Secrétaire de séance par rapport aux notes sources :
1. Quelles actions manquent de clarté quant au porteur (assignee) ou à la date limite (deadline) ?
2. Quels risques critiques (techniques, financiers, d'approvisionnement, RH) n'ont pas été formulés ?
3. Quelles zones de flou méritent un arbitrage ferme ?
Reste concis, constructif et rigoureux (environ 90 à 130 mots)." . $companyPromptInjection;

    $res2 = callGroqApi([
        ['role' => 'system', 'content' => $agent2Prompt],
        ['role' => 'user', 'content' => "Notes de réunion :\n" . $sample . "\n\nProposition d'Agent 1 :\n" . $agent1Draft]
    ], null, false, false);
    $agent2Critique = trim($res2['choices'][0]['message']['content'] ?? "Audit des risques finalisé.");

    sendSSE('agent_message', [
        'agent' => 'Agent 2 : Auditeur des Risques & Échéances',
        'message' => $agent2Critique
    ]);

    // ===================================================================
    // TOUR 3 : Agent 3 - Directeur des Opérations & Arbitrage RACI
    // ===================================================================
    sendSSE('agent_message', [
        'agent' => 'Agent 3 : Directeur des Opérations (RACI)',
        'message' => "Arbitrage des responsabilités, calage des livrables et validation de la gouvernance..."
    ]);

    $agent3Prompt = "Tu es le Directeur des Opérations (COO).
Prends en compte l'analyse du Secrétaire et les alertes de l'Auditeur des Risques.
Rends tes arbitrages opérationnels :
- Précise les responsabilités claires (qui fait quoi et pour quand)
- Fixe les priorités d'action pour sécuriser les livrables
Rédige ta synthèse d'arbitrage exécutif (environ 90 à 120 mots)." . $companyPromptInjection;

    $res3 = callGroqApi([
        ['role' => 'system', 'content' => $agent3Prompt],
        ['role' => 'user', 'content' => "Proposition Secrétaire :\n" . $agent1Draft . "\n\nCritique Risques :\n" . $agent2Critique]
    ], null, false, false);
    $agent3Arbitration = trim($res3['choices'][0]['message']['content'] ?? "Matrice des responsabilités validée.");

    sendSSE('agent_message', [
        'agent' => 'Agent 3 : Directeur des Opérations (RACI)',
        'message' => $agent3Arbitration
    ]);

    // ===================================================================
    // TOUR 4 : Agent 4 - Juge Suprême & Compte-Rendu Certifié
    // ===================================================================
    sendSSE('agent_message', [
        'agent' => 'Directeur Général & Validation Finale',
        'message' => "Consolidation du consensus des 3 auditeurs. Génération du compte-rendu décisionnel officiel..."
    ]);

    $systemPrompt = "Tu es le Directeur Général certifiant le compte-rendu officiel de réunion.
Tu disposes des délibérations entre le Secrétaire, l'Auditeur des Risques et le Directeur des Opérations.
Tu dois consolider l'ensemble pour produire un compte-rendu exécutif irréprochable.
$companyPromptInjection

Réponds UNIQUEMENT par un objet JSON valide suivant rigoureusement ce schéma :
{
  \"id\": \"meet_" . bin2hex(random_bytes(6)) . "\",
  \"date\": \"" . date('Y-m-d') . "\",
  \"subject\": \"Revue Stratégique & Avancement Opérationnel\",
  \"participants\": [\"Nom / Fonction 1\", \"Nom / Fonction 2\"],
  \"agenda\": [\"Sujet clé 1\", \"Sujet clé 2\"],
  \"executiveSummary\": \"Synthèse fluide, valorisante et structurée des arbitrages et priorités actées en séance...\",
  \"decisions\": [
    {\"decision\": \"Décision formelle actée\", \"context\": \"Justification et consensus de séance\"}
  ],
  \"actions\": [
    {\"task\": \"Tâche concrète à accomplir\", \"assignee\": \"Responsable identifié\", \"deadline\": \"" . date('d/m/Y', strtotime('+7 days')) . "\", \"status\": \"pending\"}
  ],
  \"risks\": [
    {\"risk\": \"Risque opérationnel ou financier identifié\", \"impact\": \"High\"}
  ],
  \"consensus_deliberation\": {
    \"agent1_verbatim\": " . json_encode(mb_substr($agent1Draft, 0, 300)) . ",
    \"agent2_risks\": " . json_encode(mb_substr($agent2Critique, 0, 300)) . ",
    \"agent3_raci\": " . json_encode(mb_substr($agent3Arbitration, 0, 300)) . "
  }
}";


    $userPrompt = "Notes de réunion source :\n" . $sample . "\n\nDélibération du comité :\n- Secrétaire : " . $agent1Draft . "\n- Auditeur des Risques : " . $agent2Critique . "\n- Directeur des Opérations : " . $agent3Arbitration . "\n\nGénère le compte-rendu JSON certifié.";

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

        if (!$data || !is_array($data)) {
            throw new Exception("Erreur de formatage du compte-rendu final.");
        }

        $report = [
            'id' => $data['id'] ?? ('meet_' . bin2hex(random_bytes(6))),
            'date' => $data['date'] ?? date('Y-m-d'),
            'subject' => !empty($data['subject']) ? $data['subject'] : 'Revue Stratégique & Avancement Opérationnel',
            'participants' => (isset($data['participants']) && is_array($data['participants']) && count($data['participants']) > 0) ? $data['participants'] : ['Direction Générale', 'Équipe Opérationnelle'],
            'agenda' => (isset($data['agenda']) && is_array($data['agenda']) && count($data['agenda']) > 0) ? $data['agenda'] : ['Points clés et jalons'],
            'executiveSummary' => $data['executiveSummary'] ?? ($data['summary'] ?? 'Synthèse des décisions et responsabilités partagées.'),
            'decisions' => (isset($data['decisions']) && is_array($data['decisions'])) ? $data['decisions'] : [],
            'actions' => (isset($data['actions']) && is_array($data['actions'])) ? $data['actions'] : [],
            'risks' => (isset($data['risks']) && is_array($data['risks'])) ? $data['risks'] : [],
            'consensus_deliberation' => $data['consensus_deliberation'] ?? null
        ];

        // Enregistrement de l'Observabilité & Token Economics (Brique 7)
        try {
            require_once __DIR__ . '/ai_telemetry.php';
            $durationMs = intval((microtime(true) - $startTime) * 1000);
            log_ai_deliberation([
                'company_id' => $company_id,
                'session_id' => $report['id'],
                'tool_type' => 'meeting',
                'document_name' => $report['subject'],
                'provider' => 'groq',
                'model' => LLM_MODEL,
                'total_latency_ms' => $durationMs,
                'prompt_tokens' => intval(mb_strlen($sample . $systemPrompt) / 4),
                'completion_tokens' => intval(mb_strlen($content) / 4),
                'consensus_status' => !empty($report['risks']) ? 'ARBITRATED' : 'UNANIMOUS',
                'agents_trail_json' => [
                    'agent1_factuel' => $agent1Draft,
                    'agent2_critique' => $agent2Critique,
                    'agent3_arbitre' => $agent3Arbitration,
                    'agent4_dg' => $report['executiveSummary']
                ]
            ]);
        } catch (Exception $eTel) {
            // Télémétrie non-bloquante
        }

        sendSSE('complete', $report);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    sendSSE('error', ['message' => $e->getMessage()]);
}
