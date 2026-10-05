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

RÈGLE ABSOLUE POUR LES SITES WEB (ZÉRO LIEN MORT 404) :
Interdiction formelle d'inventer des URLs profondes fictives ou des noms de domaine fantaisistes (comme 'https://exemple.fr' ou 'https://entreprise-inventee.fr').
Pour chaque entreprise :
- Si l'entreprise est très connue, renseigne son domaine officiel vérifié (ex: 'https://www.bouygues.com', 'https://www.sncf.com', 'https://www.veolia.fr').
- Dans tous les autres cas, génère OBLIGATOIREMENT une URL Google Search directe au format exact :
  \"https://www.google.com/search?q=\" suivi du nom de l'entreprise et de sa ville encodés (ex: \"https://www.google.com/search?q=Eiffage+Lyon+site+officiel\").
Ce lien doit impérativement fonctionner à 100% lors du clic.

Tu dois répondre UNIQUEMENT par un tableau JSON valide respectant rigoureusement ce schéma :
[
  {
    \"companyName\": \"Nom de l'entreprise\",
    \"sector\": \"$sector\",
    \"size\": \"$companySize\",
    \"location\": \"Ville, $country\",
    \"website\": \"URL officielle ou https://www.google.com/search?q=NomEntreprise+Ville\",
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

        // Post-traitement de sécurité absolue sur les liens
        foreach ($data as &$lead) {
            $site = trim($lead['website'] ?? '');
            if (empty($site) || strpos($site, 'exemple') !== false || strpos($site, 'example') !== false || strpos($site, 'http') !== 0) {
                $comp = $lead['companyName'] ?? 'Entreprise';
                $loc = $lead['location'] ?? $country;
                $lead['website'] = "https://www.google.com/search?q=" . urlencode("{$comp} {$loc} site officiel");
            }
        }
        unset($lead);

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
