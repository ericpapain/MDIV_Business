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

    $systemPrompt = "Tu es un classifieur documentaire et routeur d'intention ultra-précis pour une plateforme IA d'entreprise.
Analyse le texte fourni et détermine avec rigueur à quelle catégorie il appartient :
Catégories autorisées :
- 'Facture'
- 'Devis'
- 'Compte-rendu' (notes de réunion, transcriptions orales, ordres du jour)
- 'Contrat' (accords, CGV, baux, contrats de travail ou de prestation)
- 'Email' (correspondance, lettre professionnelle)
- 'CV' (profil professionnel, candidature)
- 'Rapport' (audit, diagnostic stratégique, bilan d'activité)
- 'Autre'

RÈGLES STRICTES :
1. Attribue une distribution de probabilité en pourcentages (la somme des scores doit être égale à 100).
2. Fournis un court extrait explicatif ('summary_snippet') qui justifie ton choix.
3. Si le document appartient de façon évidente à une catégorie avec un score >= 75%, indique le module d'atterrissage recommandé et 2 à 3 actions logiques pour l'utilisateur.

Tu dois répondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  \"detected_type\": \"Facture\",
  \"confidence\": 94,
  \"scores\": {
    \"Facture\": 94,
    \"Devis\": 3,
    \"Compte-rendu\": 1,
    \"Contrat\": 1,
    \"Email\": 1,
    \"Autre\": 0
  },
  \"summary_snippet\": \"Facture avec numéro d'émission, mention de TVA et total à payer.\",
  \"recommended_module\": \"/services-ia/facturation\",
  \"suggested_actions\": [
    {\"title\": \"Analyser et vérifier la facture\", \"route\": \"/services-ia/facturation\"},
    {\"title\": \"Générer une relance client\", \"route\": \"/services-ia/relances\"}
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
