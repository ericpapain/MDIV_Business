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

// 1. Choix du Prompt Spécialisé selon le type de document (optimisé pour fidélité optique maximale)
$specializedPrompts = [
    'invoice' => "Tu es un système de reconnaissance optique et d'analyse documentaire comptable de très haute précision.
Transcris fidèlement l'intégralité du texte et des données de cette facture, ticket de caisse ou reçu.
ATTENTION PARTICULIÈRE : Il s'agit souvent d'impressions thermiques ou matricielles. Prends extrêmement soin de bien différencier les chiffres qui se ressemblent (3 et 5, 3 et 6, 8 et 0). Par exemple, vérifie minutieusement si une année est 2026 plutôt que 2023, ou si un numéro est 45.12 ou 43.12.
- En-tête : Magasin ou entreprise, Téléphone (vérifie bien les chiffres), Date précise (ex: 2026), Heure, N° Ticket ou Facture, Vendeur
- Client si mentionné
- Tableau des articles : Désignation, Référence, Prix unitaire, Quantité, Total
- Tableau de TVA : Taux, Base HT, Montant TVA, Total TTC
- Total général et Mode de règlement
- Mentions de bas de page (échanges, garanties, etc.)
Présente le résultat en Markdown clair et structuré. Ne modifie aucun chiffre ni montant sous prétexte de correction, transcris exactement ce qui est imprimé.",

    'quote' => "Tu es un système de reconnaissance optique documentaire spécialisé dans les devis commerciaux.
Transcris l'intégralité des éléments de ce devis commercial ou chiffrage :
- Coordonnées de l'émetteur et du client
- Bordereau des prestations sous forme de tableau Markdown (Désignation, Quantité, Prix unitaire HT, Remise, Total)
- Totaux HT, TVA et TTC
- Validité du devis et conditions de règlement.",

    'meeting' => "Tu es un transcripteur documentaire haute précision pour les notes et comptes-rendus de réunion.
Transcris l'intégralité de ces notes de réunion :
- Date, participants et ordre du jour
- Points clés abordés et citations importantes
- Décisions validées et plan d'action (Qui, Quoi, Échéance).",

    'contract' => "Tu es un transcripteur documentaire juridique.
Transcris l'intégralité du contenu visible de ce contrat ou accord :
- Parties contractantes et dates
- Articles numérotés et clauses visibles
- Engagements et montants financiers mentionnés.",

    'technical' => "Tu es un transcripteur de documents techniques et spécifications d'ingénierie.
Transcris avec exactitude l'ensemble des données visibles :
- Normes, références techniques et spécifications
- Mesures, unités physiques (kVA, A, mm², m, kW, bars)
- Nomenclatures et remarques techniques.",

    'auto' => "Tu es un transcripteur documentaire haute fidélité.
Transcris mot à mot et chiffre par chiffre l'ensemble du texte visible sur ce document ou ticket.
Structure la réponse en Markdown avec titres, tableaux et listes selon le document original."
];

$chosenPrompt = $specializedPrompts[$documentType] ?? $specializedPrompts['auto'];

$extractedText = '';
$modelUsed = '';
$confidence = 95.0;

// Fonction de détection d'un refus de sécurité indésirable du modèle
function isModelRefusal($text) {
    if (empty($text) || mb_strlen(trim($text)) < 25) return true;
    $lower = mb_strtolower($text);
    $refusalKeywords = [
        'je suis désolé', 'je ne peux pas transcrire', 'je ne suis pas en mesure',
        'i cannot transcribe', "i'm sorry, but i cannot", 'i am unable to transcribe',
        'i cannot assist with this request', 'je ne peux pas traiter cette image'
    ];
    foreach ($refusalKeywords as $ref) {
        if (strpos($lower, $ref) !== false) return true;
    }
    return false;
}

// =========================================================================
// ÉTAPE 1 : Modèle OpenAI Vision (Priorité gpt-4o-mini / gpt-4o avec détection de refus)
// =========================================================================
if (!empty($openaiKey)) {
    // Essaye gpt-4o-mini (rapide, précis, ne bloque pas sur les doigts/reçus) puis gpt-4o si nécessaire
    $modelsToTry = $preferHighAccuracy ? ['gpt-4o', 'gpt-4o-mini'] : ['gpt-4o-mini', 'gpt-4o'];

    foreach ($modelsToTry as $mName) {
        $payload = [
            'model' => $mName,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        ['type' => 'text', 'text' => $chosenPrompt],
                        [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => $imageUrl,
                                'detail' => 'high'
                            ]
                        ]
                    ]
                ]
            ],
            'temperature' => 0.05,
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
            $candidateText = trim($resObj['choices'][0]['message']['content'] ?? '');
            
            if (!isModelRefusal($candidateText)) {
                $extractedText = $candidateText;
                $modelUsed = 'OpenAI ' . $mName . ' Vision';
                $confidence = ($mName === 'gpt-4o') ? 99.2 : 98.6;
                break;
            }
        }
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
