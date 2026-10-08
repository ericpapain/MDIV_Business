<?php
// public/api/classify_document.php
/**
 * Service de Classification Documentaire & Garde-Fou d'Intention
 * Détecte le type réel du document soumis (Facture, Devis, Compte-rendu, Contrat, etc.)
 * et son score de confiance probabiliste pour éviter les erreurs d'aiguillage.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $raw_text = trim($input['text'] ?? ($input['raw_text'] ?? ''));
    $current_module = trim($input['current_module'] ?? ''); // ex: 'meeting', 'summarizer', 'invoice', etc.

    if (empty($raw_text)) {
        http_response_code(400);
        echo json_encode(["error" => "Aucun texte ou document fourni pour classification."]);
        exit;
    }

    // Échantillon suffisant pour classifier rapidement (jusqu'à 3000 caractères)
    $sample = mb_substr($raw_text, 0, 3000);

    $systemPrompt = "You are an ultra-precise document classifier and intent router for an enterprise AI platform.
Analyze the provided text and rigorously determine which category it belongs to:
Allowed categories:
- 'Facture'
- 'Devis'
- 'Compte-rendu' (meeting notes, oral transcriptions, agendas)
- 'Contrat' (agreements, T&Cs, leases, employment or service contracts)
- 'Email' (correspondence, professional letter)
- 'CV' (professional profile, job application)
- 'Rapport' (audit, strategic diagnostic, activity report)
- 'Autre'

STRICT RULES:
1. Assign a probability distribution in percentages (the sum of scores must equal 100).
2. Provide a short explanatory excerpt ('summary_snippet') justifying your choice.
3. If the document obviously belongs to a category with a score >= 75%, indicate the recommended landing module and 2 to 3 logical actions for the user.

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON object strictly following this structure:
{
  \"detected_type\": \"<DETECTED_CATEGORY_STRING>\",
  \"confidence\": <CALCULATED_INTEGER_CONFIDENCE_SCORE>,
  \"scores\": {
    \"Facture\": <CALCULATED_INTEGER_SCORE>,
    \"Devis\": <CALCULATED_INTEGER_SCORE>,
    \"Compte-rendu\": <CALCULATED_INTEGER_SCORE>,
    \"Contrat\": <CALCULATED_INTEGER_SCORE>,
    \"Email\": <CALCULATED_INTEGER_SCORE>,
    \"CV\": <CALCULATED_INTEGER_SCORE>,
    \"Rapport\": <CALCULATED_INTEGER_SCORE>,
    \"Autre\": <CALCULATED_INTEGER_SCORE>
  },
  \"summary_snippet\": \"<GENERATED_EXPLANATORY_SNIPPET_FRENCH>\",
  \"recommended_module\": \"<RECOMMENDED_APP_ROUTE>\",
  \"suggested_actions\": [
    {\"title\": \"<ACTION_TITLE_FRENCH_1>\", \"route\": \"<ACTION_ROUTE_1>\"},
    {\"title\": \"<ACTION_TITLE_FRENCH_2>\", \"route\": \"<ACTION_ROUTE_2>\"}
  ]
}";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Texte du document à classifier :\n\n" . $sample]
    ];

    $response = callGroqApi($messages, null, false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = trim($response['choices'][0]['message']['content']);
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{[\s\S]*\}/', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!$data || !isset($data['detected_type'])) {
            throw new Exception("Classification impossible.");
        }

        // Mappage automatique du module recommandé en fonction du type
        $typeMapping = [
            'Facture' => [
                'route' => '/services-ia/facturation',
                'module_id' => 'invoice',
                'actions' => [
                    ['title' => 'Vérifier la conformité de cette facture', 'route' => '/services-ia/facturation'],
                    ['title' => 'Préparer une relance pour cette facture', 'route' => '/services-ia/relances']
                ]
            ],
            'Devis' => [
                'route' => '/services-ia/devis',
                'module_id' => 'quote',
                'actions' => [
                    ['title' => 'Optimiser ou convertir ce devis', 'route' => '/services-ia/devis']
                ]
            ],
            'Compte-rendu' => [
                'route' => '/services-ia/comptes-rendus',
                'module_id' => 'meeting',
                'actions' => [
                    ['title' => 'Générer le compte-rendu décisionnel & plan d\'action', 'route' => '/services-ia/comptes-rendus']
                ]
            ],
            'Contrat' => [
                'route' => '/services-ia/synthese',
                'module_id' => 'summarizer',
                'actions' => [
                    ['title' => 'Auditer les clauses et risques du contrat', 'route' => '/services-ia/synthese']
                ]
            ],
            'Email' => [
                'route' => '/services-ia/emails',
                'module_id' => 'email',
                'actions' => [
                    ['title' => 'Analyser le ton et rédiger une réponse', 'route' => '/services-ia/emails']
                ]
            ]
        ];

        $detectedType = $data['detected_type'];
        if (isset($typeMapping[$detectedType])) {
            $data['recommended_module'] = $typeMapping[$detectedType]['route'];
            $data['recommended_module_id'] = $typeMapping[$detectedType]['module_id'];
            if (empty($data['suggested_actions'])) {
                $data['suggested_actions'] = $typeMapping[$detectedType]['actions'];
            }
        }

        // Détection de conflit avec le module actuel de l'utilisateur
        $isMismatch = false;
        if (!empty($current_module) && isset($data['recommended_module_id'])) {
            if ($current_module !== $data['recommended_module_id'] && ($data['confidence'] ?? 0) >= 70) {
                $isMismatch = true;
            }
        }
        $data['is_mismatch'] = $isMismatch;

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du classifieur IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur de classification : " . $e->getMessage()]);
}
