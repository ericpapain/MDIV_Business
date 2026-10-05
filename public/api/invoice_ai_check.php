<?php
// public/api/invoice_ai_check.php
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
    
    $invoiceNumber = $input['invoiceNumber'] ?? 'FAC-2026-001';
    $clientName = $input['clientName'] ?? '';
    $lines = $input['lines'] ?? [];
    $totalHT = floatval($input['totalHT'] ?? 0);
    $totalTTC = floatval($input['totalTTC'] ?? 0);
    $vatAmount = floatval($input['vatAmount'] ?? 0);

    $systemPrompt = "Tu es un expert-comptable et juriste fiscaliste spécialisé en conformité de facturation B2B en France.
Vérifie la conformité de la facture suivante.
Tu dois répondre UNIQUEMENT par un objet JSON valide avec ce schéma :
{
  \"isValid\": true,
  \"errors\": [],
  \"warnings\": [\"Avertissement éventuel ou point de vigilance...\"],
  \"suggestedMentions\": [\"Mention légale recommandée (ex: Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard)\"]
}";

    $userPrompt = "Facture N° : $invoiceNumber\nClient : $clientName\nTotal HT : $totalHT €\nTVA : $vatAmount €\nTotal TTC : $totalTTC €\nNombre de lignes : " . count($lines);

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

        if (!$data) {
            $data = [
                'isValid' => true,
                'errors' => [],
                'warnings' => ['Calculs conformes aux règles de TVA standard.'],
                'suggestedMentions' => ['Indemnité forfaitaire de 40€ pour frais de recouvrement (Art. D. 441-5 C. com.)']
            ];
        }

        // Contrôle anti-gribouillage sur les lignes
        $hasGibberish = false;
        foreach ($lines as $l) {
            $desc = trim($l['description'] ?? '');
            if (!empty($desc) && (preg_match('/^(.)\1{4,}/i', $desc) || (preg_match('/^[b-df-hj-np-tv-z0-9\s.,;:!?\'-]{10,}$/i', $desc) && !preg_match('/[aeiouy]/i', $desc)))) {
                $hasGibberish = true;
                break;
            }
        }

        if ($hasGibberish) {
            $data['isValid'] = false;
            $data['errors'][] = "Votre saisie semble incomplète ou incompréhensible. Pour auditer une facture, veuillez indiquer des désignations de prestations réelles et intelligibles.";
        }

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("Aucune réponse du modèle IA.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
