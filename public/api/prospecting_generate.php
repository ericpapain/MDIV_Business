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
    
    $targetCompany = $input['targetCompany'] ?? 'Entreprise cible';
    $sector = $input['sector'] ?? 'Secteur d\'activité';
    $contactRole = $input['contactRole'] ?? 'Directeur Général';
    $objective = $input['objective'] ?? 'Premier contact';
    $offer = $input['offer'] ?? 'Accompagnement IA et automatisation';
    $tone = $input['tone'] ?? 'Professionnel';
    $language = $input['language'] ?? 'Français';
    $company_id = intval($input['company_id'] ?? 1);

    $systemPrompt = "Tu es le meilleur expert en prospection commerciale B2B grand compte pour MDIV Business.
Rédige un email de cold outreach ultra-personnalisé, à fort taux de réponse, dans la langue demandée ($language).
Cible : $targetCompany ($sector)
Destinataire : $contactRole
Objectif : $objective
Offre à valoriser : $offer
Ton : $tone

Règles :
1. Objet irrésistible et court.
2. Accroche ultra personnalisée montrant une vraie compréhension des enjeux du secteur ($sector).
3. Proposition de valeur concrète sans être agressif (focus ROI / gains de temps).
4. Call-to-action simple et sans friction (ex: échange informel de 10 min).

Tu dois répondre UNIQUEMENT par un objet JSON valide avec cette structure :
{
  \"id\": \"camp_" . bin2hex(random_bytes(6)) . "\",
  \"subject\": \"Objet du message\",
  \"content\": \"Corps complet du message prêt à être envoyé...\",
  \"kpis\": {
    \"impactScore\": 92,
    \"clarityScore\": 94,
    \"personalizationScore\": 90,
    \"engagementScore\": 89,
    \"estimatedReadTimeSeconds\": 35,
    \"persuasionLevel\": \"Élevé\",
    \"suggestions\": [\"Relancer à J+4 si absence de réponse\", \"Mettre en avant une étude de cas du secteur $sector\"]
  },
  \"date\": \"" . date('Y-m-d') . "\"
}";

    $userPrompt = "Génère l'email de prospection pour $targetCompany ($contactRole) portant sur : $offer.";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

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
