<?php
// Fichier : /api/groq_client.php
require_once __DIR__ . '/config.php';

function callLlmProvider($url, $apiKey, $data, $providerName, $stream = false) {
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if ($stream) {
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
            echo $chunk;
            ob_flush();
            flush();
            return strlen($chunk);
        });
        curl_exec($ch);
        if(curl_errno($ch)) {
            throw new Exception("Erreur cURL stream $providerName: " . curl_error($ch));
        }
        curl_close($ch);
        return null;
    } else {
        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new Exception("Erreur cURL $providerName: " . $error_msg);
        }
        
        curl_close($ch);
        
        if ($httpcode >= 400) {
            throw new Exception("Erreur API $providerName ($httpcode): " . $response);
        }
        
        return json_decode($response, true);
    }
}

function callGroqApi($messages, $model = 'mixtral-8x7b-32768', $stream = false) {
    $errors = [];
    
    // 1. Essai avec Groq
    try {
        $data = [
            'model' => $model,
            'messages' => $messages,
            'stream' => $stream
        ];
        if (!$stream) {
            $data['response_format'] = ['type' => 'json_object'];
        }
        return callLlmProvider('https://api.groq.com/openai/v1/chat/completions', GROQ_API_KEY, $data, 'Groq', $stream);
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
    
    // 2. Essai avec Mistral en fallback (Drop-in replacement)
    try {
        $data = [
            'model' => 'open-mistral-nemo', // Modèle standard Mistral rapide
            'messages' => $messages,
            'stream' => $stream
        ];
        if (!$stream) {
            $data['response_format'] = ['type' => 'json_object'];
        }
        return callLlmProvider('https://api.mistral.ai/v1/chat/completions', MISTRAL_API_KEY, $data, 'Mistral', $stream);
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
    
    // 3. Essai avec HuggingFace en dernier recours (Compatibilité OpenAI)
    try {
        $data = [
            'model' => 'mistralai/Mixtral-8x7B-Instruct-v0.1',
            'messages' => $messages,
            'stream' => $stream
        ];
        // HF ne gère pas toujours response_format, on l'omet pour éviter une erreur 400
        return callLlmProvider('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1/v1/chat/completions', HF_API_KEY, $data, 'HuggingFace', $stream);
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }

    // Si tout échoue
    throw new Exception("Toutes les APIs ont échoué : " . implode(" | ", $errors));
}
?>
