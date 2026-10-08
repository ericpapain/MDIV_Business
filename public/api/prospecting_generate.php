<?php
// public/api/prospecting_generate.php
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
    
    $targetCompany = trim($input['targetCompany'] ?? '');
    $sector = trim($input['sector'] ?? 'Secteur d\'activité');
    $contactRole = trim($input['contactRole'] ?? 'Directeur Général');
    $objective = trim($input['objective'] ?? 'Premier contact');
    $offer = trim($input['offer'] ?? '');
    $tone = trim($input['tone'] ?? 'Professionnel');
    $language = trim($input['language'] ?? 'Français');
    $company_id = intval($input['company_id'] ?? 1);

    // FILTRE ANTI-GRIBOUILLAGE
    $isGibberish = strlen($targetCompany) < 3
        || preg_match('/^(.)\1{3,}/i', $targetCompany)
        || strlen($offer) < 6
        || preg_match('/^(.)\1{4,}/i', $offer)
        || (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!?\'-]{10,}$/i', $offer) && !preg_match('/[aeiouy]/i', $offer));

    if ($isGibberish) {
        http_response_code(400);
        echo json_encode([
            'error' => "Votre saisie semble incomplète ou incompréhensible. Pour générer un email de prospection B2B percutant, veuillez indiquer au minimum l'entreprise ou secteur cible, le rôle du destinataire et la proposition de valeur de votre offre."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $systemPrompt = "You are the top B2B enterprise sales prospecting expert for MDIV Business.
Write a highly personalized, high-conversion cold outreach email in the requested language ($language).
Target: $targetCompany ($sector)
Recipient: $contactRole
Objective: $objective
Value Proposition: $offer
Tone: $tone

ANTI-GIBBERISH SAFEGUARD:
If the provided information is absurd or lacks business sense, DO NOT GENERATE a fake email. Return:
{\"error\": \"Votre saisie semble incomplète ou incompréhensible. Pour générer un email de prospection B2B percutant, veuillez indiquer au minimum l'entreprise ou secteur cible, le rôle du destinataire et la proposition de valeur de votre offre.\"}

RULES:
1. Irresistible and short subject line.
2. Ultra-personalized hook demonstrating a real understanding of the sector's challenges ($sector).
3. Concrete value proposition without being aggressive (focus on ROI / time-saving).
4. Simple, friction-less call-to-action (e.g., a 10-min informal chat).

CRITICAL REQUIREMENT: YOU MUST GENERATE YOUR FINAL RESPONSE AND ALL USER-FACING TEXT STRICTLY IN FRENCH.

You must respond ONLY with a valid JSON object matching this structure:
{
  \"id\": \"camp_" . bin2hex(random_bytes(6)) . "\",
  \"subject\": \"<GENERATED_SUBJECT_STRING_FRENCH>\",
  \"content\": \"<GENERATED_FULL_EMAIL_BODY_STRING_FRENCH>\",
  \"kpis\": {
    \"impactScore\": <CALCULATED_INTEGER_BETWEEN_1_AND_100>,
    \"clarityScore\": <CALCULATED_INTEGER_BETWEEN_1_AND_100>,
    \"personalizationScore\": <CALCULATED_INTEGER_BETWEEN_1_AND_100>,
    \"engagementScore\": <CALCULATED_INTEGER_BETWEEN_1_AND_100>,
    \"estimatedReadTimeSeconds\": <CALCULATED_INTEGER_SECONDS>,
    \"persuasionLevel\": \"<CALCULATED_LEVEL_FRENCH>\",
    \"suggestions\": [\"<ACTIONABLE_SUGGESTION_FRENCH_1>\", \"<ACTIONABLE_SUGGESTION_FRENCH_2>\"]
  },
  \"date\": \"" . date('Y-m-d') . "\"
}";

    $userPrompt = "Génère l'email de prospection pour $targetCompany ($contactRole) portant sur : $offer.";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\{.*\}/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!$data || !isset($data['content'])) {
            throw new Exception("Format de réponse IA invalide pour la prospection.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
