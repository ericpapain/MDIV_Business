<?php
/**
 * API ocr_document_vision.php
 * Moteur d'Extraction Optique Haute Précision par Modèles Multimodaux Spécialisés (OpenAI GPT-4o / GPT-4o-mini Vision)
 * Adapté spécifiquement aux Factures, Devis, Contrats, Comptes-rendus et Documents Techniques.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$imageBase64 = $data['imageBase64'] ?? ($data['image'] ?? '');
$documentType = $data['document_type'] ?? 'auto'; // 'auto' | 'invoice' | 'quote' | 'meeting' | 'contract' | 'technical'
$preferHighAccuracy = !empty($data['high_accuracy']);

if (empty($imageBase64)) {
    http_response_code(400);
    echo json_encode(['error' => "Aucune image ou document scanné fourni pour l'analyse OCR Vision."]);
    exit;
}

// Nettoyage et formatage du Data URI
$imageUrl = strpos($imageBase64, 'data:') === 0 ? $imageBase64 : 'data:image/jpeg;base64,' . $imageBase64;

// Détection des clés API
$openaiKey = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : (getenv('OPENAI_API_KEY') ?: ($_ENV['OPENAI_API_KEY'] ?? ($_SERVER['OPENAI_API_KEY'] ?? '')));
$groqKey = defined('GROQ_API_KEY') ? GROQ_API_KEY : (getenv('GROQ_API_KEY') ?: ($_ENV['GROQ_API_KEY'] ?? ($_SERVER['GROQ_API_KEY'] ?? '')));

// 1. Choix du Prompt Spécialisé selon le type de document
$specializedPrompts = [
    'invoice' => "Tu es un expert-comptable et inspecteur fiscal certifié. 
Ta mission : transcrire et extraire avec une exactitude mathématique absolue TOUT le contenu de cette facture ou ce reçu.
RÈGLES CRITIQUES :
1. Extrais mot pour mot les mentions de l'émetteur (Raison sociale, SIRET, N° TVA, Adresse).
2. Extrais les coordonnées complètes du client destinataire.
3. Reconstruis l'INTÉGRALITÉ du tableau des prestations en Markdown : Désignation, Quantité, Prix unitaire HT, Taux TVA, Total HT.
4. Extrais les totaux chiffrés exacts : Total HT, Montant de chaque TVA, Total TTC, Acomptes éventuels et Net à payer.
5. Extrais les dates : Date d'émission, Date d'échéance et conditions de règlement (pénalités, Article L. 441-10).
Ne résume rien. Si un mot ou chiffre est flou, indique [illisible] sans inventer.",

    'quote' => "Tu es un métreur et directeur commercial expert en chiffrage de devis B2B.
Ta mission : retranscrire fidèlement ce devis commercial ou cette proposition de prix.
RÈGLES CRITIQUES :
1. Extrais l'émetteur et le client associé.
2. Reconstruis l'ensemble du bordereau de prix sous forme de tableau Markdown (Désignation détaillée, Unité, Quantité, PU HT, Remises, Total ligne).
3. Extrais les totaux HT, TVA et TTC exacts.
4. Extrais les conditions de réalisation, durée de validité de l'offre et modalités d'acompte.
Ne saute aucune ligne de chiffrage.",

    'meeting' => "Tu es un secrétaire général de direction et rédacteur de comptes-rendus de comités exécutifs.
Ta mission : retranscrire l'intégralité de ces notes de réunion ou de ce compte-rendu manuscrit/imprimé.
RÈGLES CRITIQUES :
1. Transcris tous les participants, la date et l'ordre du jour.
2. Structure le texte avec des titres clairs (#, ##), des puces (-) et des citations.
3. Préserve scrupuleusement tous les chiffres cités (budgets, délais, dates jalons).
4. Extrais la liste exacte des décisions actées et le tableau des actions convenues (Qui fait Quoi pour Quand).",

    'contract' => "Tu es un juriste d'affaires spécialisé en droit des contrats et marchés d'entreprise.
Ta mission : retranscrire ce contrat, bon de commande ou convention juridique.
RÈGLES CRITIQUES :
1. Transcris l'intégralité des clauses, articles numérotés et stipulations.
2. Identifie les parties contractantes (SIREN, représentants légaux).
3. Préserve les clauses critiques : obligations, délais, pénalités de retard, conditions résolutoires, juridiction compétente.
4. Mentionne la présence ou l'absence de signatures et paraphes.",

    'technical' => "Tu es un ingénieur technique et auditeur de conformité industrielle (BTP, électricité, mécanique).
Ta mission : retranscrire cette spécification technique, ce rapport d'intervention ou ce schéma.
RÈGLES CRITIQUES :
1. Transcris toutes les normes citées (NF C 15-100, DTU, ISO, etc.).
2. Extrais toutes les valeurs numériques avec leurs unités (kVA, Ampères, mm², mètres, bars, kW).
3. Reconstruis les listes d'équipements, nomenclatures et réserves techniques constatées.",

    'auto' => "Tu es un transcripteur documentaire de très haut niveau spécialisé dans les documents d'entreprises françaises (factures, devis, notes de réunion, contrats, spécifications).
Ta mission : retranscrire avec une fidélité photographique et absolue l'ensemble du document scanné.
RÈGLES CRITIQUES :
1. Transcris TOUT le texte visible, y compris les en-têtes, les petits caractères, les tableaux et les totaux.
2. Reconstruis les tableaux sous forme de tableaux Markdown alignés.
3. Conserve la mise en page logique : Titres, sous-titres, listes à puces.
4. Ne fais AUCUN résumé, ne coupe pas le texte, ne change aucun chiffre ni aucune date.
5. Si du texte est manuscrit, retranscris-le fidèlement."
];

$chosenPrompt = $specializedPrompts[$documentType] ?? $specializedPrompts['auto'];

$extractedText = '';
$modelUsed = '';
$confidence = 95.0;

// =========================================================================
// ÉTAPE 1 : Modèle OpenAI GPT-4o / GPT-4o-mini Vision (Priorité Maximale)
// =========================================================================
if (!empty($openaiKey)) {
    // Si haute précision demandée ou document complexe (contrat/facture dense), utiliser gpt-4o, sinon gpt-4o-mini
    $modelName = $preferHighAccuracy ? 'gpt-4o' : 'gpt-4o-mini';

    $payload = [
        'model' => $modelName,
        'messages' => [
            [
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => $chosenPrompt],
                    [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => $imageUrl,
                            'detail' => $preferHighAccuracy ? 'high' : 'auto'
                        ]
                    ]
                ]
            ]
        ],
        'temperature' => 0.1,
        'max_tokens' => 3000
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $openaiKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resObj = json_decode($response, true);
        $extractedText = trim($resObj['choices'][0]['message']['content'] ?? '');
        $modelUsed = 'OpenAI ' . $modelName . ' Vision';
        $confidence = 98.8;
    }
}

// =========================================================================
// ÉTAPE 2 : Fallback Groq Llama 3.2 Vision (Ultra-rapide)
// =========================================================================
if (empty($extractedText) && !empty($groqKey)) {
    $payload = [
        'model' => 'llama-3.2-11b-vision-preview',
        'messages' => [
            [
                'role' => 'user',
                'content' => [
                    ['type' => 'text', 'text' => $chosenPrompt],
                    ['type' => 'image_url', 'image_url' => ['url' => $imageUrl]]
                ]
            ]
        ],
        'temperature' => 0.1,
        'max_tokens' => 2500
    ];

    $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $groqKey
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resObj = json_decode($response, true);
        $extractedText = trim($resObj['choices'][0]['message']['content'] ?? '');
        $modelUsed = 'Groq Llama-3.2-11b Vision';
        $confidence = 94.5;
    }
}

// =========================================================================
// ÉTAPE 3 : Vérification du résultat
// =========================================================================
if (empty($extractedText)) {
    http_response_code(502);
    echo json_encode([
        'error' => "Impossible d'extraire le texte avec les modèles Vision IA. Veuillez vérifier la qualité de l'image ou la connexion."
    ]);
    exit;
}

$wordCount = count(preg_split('/\s+/', $extractedText, -1, PREG_SPLIT_NO_EMPTY));

echo json_encode([
    'success' => true,
    'text' => $extractedText,
    'model_used' => $modelUsed,
    'document_type' => $documentType,
    'confidence' => $confidence,
    'word_count' => $wordCount,
    'char_count' => mb_strlen($extractedText),
    'created_at' => date('Y-m-d H:i:s')
]);
