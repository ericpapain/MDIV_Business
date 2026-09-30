<?php
// public/api/leads_search.php
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
    
    $sector = $input['sector'] ?? 'Industrie / Manufacturing';
    $country = $input['country'] ?? 'France';
    $region = $input['region'] ?? 'Toutes régions';
    $companySize = $input['companySize'] ?? '50 à 250 salariés (PME / ETI)';
    $targetFunction = $input['targetFunction'] ?? 'Directeur Général / DSI';
    $keywords = $input['keywords'] ?? 'automatisation, digitalisation';
    $company_id = intval($input['company_id'] ?? 1);

    $systemPrompt = "Tu es un moteur de prospection et d'intelligence commerciale B2B spécialisé pour MDIV Business.
À partir des filtres de ciblage demandés, génère une liste de 4 à 6 entreprises cibles crédibles et hautement qualifiées avec leur profil d'enrichissement IA.
Tu dois répondre UNIQUEMENT par un tableau JSON valide respectant rigoureusement ce schéma :
[
  {
    \"companyName\": \"Nom de l'entreprise\",
    \"sector\": \"$sector\",
    \"size\": \"$companySize\",
    \"location\": \"Ville, $country\",
    \"website\": \"https://www.nom-entreprise.fr\",
    \"digitalMaturityScore\": \"Moyen\", // Faible | Moyen | Élevé | Très élevé
    \"aiPotentialScore\": \"Élevé\", // Faible | Moyen | Élevé | Très élevé
    \"purchaseProbability\": \"Élevé\", // Faible | Moyen | Élevé | Très élevé
    \"decisionMakerName\": \"Prénom Nom\",
    \"decisionMakerFunction\": \"$targetFunction\",
    \"technologiesUsed\": [\"ERP SAP\", \"Microsoft 365\", \"Salesforce\"]
  }
]";

    $userPrompt = "Cible demandée :\nSecteur : $sector\nPays : $country\nRégion : $region\nTaille : $companySize\nFonction visée : $targetFunction\nMots-clés : $keywords";

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, 'qwen/qwen3.8-27b', false, true);

    if (isset($response['choices'][0]['message']['content'])) {
        $content = $response['choices'][0]['message']['content'];
        $data = json_decode($content, true);

        if (!$data && preg_match('/\[.*\]/s', $content, $m)) {
            $data = json_decode($m[0], true);
        }

        if (!is_array($data)) {
            throw new Exception("Format de réponse invalide pour les leads.");
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
