<?php
// public/api/email_generate.php
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
    
    $text = trim($input['text'] ?? '');
    $task = $input['task'] ?? 'Réécriture professionnelle';
    $tone = $input['tone'] ?? 'Professionnel';
    $objective = $input['objective'] ?? 'Nouvel email';
    $company_id = intval($input['company_id'] ?? 1);

    $isRepeated = preg_match('/(.)\1{4,}/', $text);
    $noSpaces = strlen($text) > 10 && strpos($text, ' ') === false && strpos($text, '@') === false;
    $isSmash = preg_match('/^[bcdfghjklmnpqrstvwxyz]{6,}$/i', str_replace(' ', '', $text));

    if ($isRepeated || $noSpaces || $isSmash) {
        echo json_encode([
            'success' => true,
            'generatedText' => "⚠️ Votre saisie semble incomplète ou incompréhensible.\n\nPour que l'Assistant Email puisse rédiger un message professionnel percutant, veuillez préciser au minimum :\n• Le destinataire (client, prospect, partenaire, collaborateur)\n• L'objet de votre démarche (relance facture, proposition commerciale, demande de réunion, compte-rendu)\n• Les points clés ou chiffres à aborder."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $systemPrompt = "Tu es un expert en communication exécutive et en rédaction professionnelle B2B pour MDIV Business.
Rédige un email exceptionnel en français selon les consignes :
- Tâche demandée : $task
- Ton : $tone
- Objectif : $objective

GARDE-FOU ANTI-GRIBOUILLAGE :
Si le texte fourni est du charabia, une suite aléatoire de caractères sans signification, ou un texte totalement hors contexte sans aucun sens métier :
Ne génère PAS de faux email absurde.
Réponds STRICTEMENT par ce message d'erreur explicite et bienveillant :
\"⚠️ Votre saisie semble incomplète ou incompréhensible. Pour rédiger un email professionnel, veuillez indiquer au minimum l'objet, le destinataire et le message clé à transmettre (ex: relance facture d'acompte, proposition commerciale, confirmation de rendez-vous).\"

Règles de style :
1. Objet d'email clair, percutant et professionnel (ex: « Objet : ... » en première ligne).
2. Salutation soignée et adaptée au ton ($tone).
3. Corps fluide, sans jargon superflu, orienté valeur et courtoisie professionnelle.
4. Formule de politesse élégante et signature professionnelle.
5. Ne pas entourer de balises inutiles, fournir le texte prêt à l'envoi.";

    $userPrompt = "Voici les notes ou l'ébauche de l'email :\n\n" . $text;

    $messages = [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userPrompt]
    ];

    $response = callGroqApi($messages, null, false, false);

    $generatedText = '';
    if (isset($response['choices'][0]['message']['content'])) {
        $generatedText = trim($response['choices'][0]['message']['content']);
    } else {
        throw new Exception("Erreur de génération du modèle IA.");
    }

    echo json_encode([
        'success' => true,
        'generatedText' => $generatedText
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
