<?php
/**
 * Test de connectivité et latence des fournisseurs IA pour l'interface Admin
 */
require_once __DIR__ . '/config.php';

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$provider = $input['provider'] ?? 'groq';
$model = $input['model'] ?? null;
$start_time = microtime(true);

$test_messages = [
    ['role' => 'system', 'content' => 'Tu es un assistant de test de connectivité MDIV Business.'],
    ['role' => 'user', 'content' => 'Réponds uniquement par le mot "Connecté".']
];

try {
    $url = '';
    $key = '';
    $chosen_model = '';

    if ($provider === 'groq') {
        $url = 'https://api.groq.com/openai/v1/chat/completions';
        $key = GROQ_API_KEY;
        $chosen_model = $model ?: 'qwen/qwen3.8-27b';
    } elseif ($provider === 'openai') {
        $url = 'https://api.openai.com/v1/chat/completions';
        $key = OPENAI_API_KEY;
        $chosen_model = $model ?: 'gpt-4o-mini';
    } elseif ($provider === 'mistral') {
        $url = 'https://api.mistral.ai/v1/chat/completions';
        $key = MISTRAL_API_KEY;
        $chosen_model = $model ?: 'mistral-small-latest';
    } else {
        throw new Exception("Fournisseur {$provider} inconnu");
    }

    if (empty($key)) {
        throw new Exception("Clé API pour {$provider} non configurée dans le fichier d'environnement");
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'model' => $chosen_model,
        'messages' => $test_messages,
        'temperature' => 0.1,
        'max_tokens' => 10
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $key,
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_err = curl_error($ch);
    curl_close($ch);

    $latency_ms = round((microtime(true) - $start_time) * 1000);

    if ($http_code !== 200) {
        $err_text = $response ? substr($response, 0, 150) : $curl_err;
        throw new Exception("Réponse HTTP {$http_code} : {$err_text}");
    }

    $data = json_decode($response, true);
    $reply = $data['choices'][0]['message']['content'] ?? 'Connecté';

    echo json_encode([
        'success' => true,
        'provider' => $provider,
        'latency' => $latency_ms,
        'response' => trim($reply)
    ]);
    exit(0);

} catch (Exception $e) {
    $latency_ms = round((microtime(true) - $start_time) * 1000);
    echo json_encode([
        'success' => false,
        'provider' => $provider,
        'latency' => $latency_ms,
        'error' => $e->getMessage()
    ]);
    exit(0);
}
