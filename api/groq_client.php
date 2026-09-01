<?php
// Fichier : /api/groq_client.php
require_once __DIR__ . '/config.php';

function callGroqApi($messages, $model = 'llama-3.1-8b-instant', $stream = false) {
    $url = 'https://api.groq.com/openai/v1/chat/completions';
    
    $data = [
        'model' => $model,
        'messages' => $messages,
        'stream' => $stream
    ];

    if (!$stream) {
        $data['response_format'] = ['type' => 'json_object'];
    }

    $headers = [
        'Authorization: Bearer ' . GROQ_API_KEY,
        'Content-Type: application/json'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    // Timeout
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if ($stream) {
        // En mode stream, on utilise une fonction de callback
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
            echo $data;
            ob_flush();
            flush();
            return strlen($data);
        });
        
        curl_exec($ch);
        if(curl_errno($ch)) {
            echo "data: " . json_encode(["error" => curl_error($ch)]) . "\n\n";
            ob_flush();
            flush();
        }
        curl_close($ch);
        return null;
    } else {
        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error_msg = curl_error($ch);
            curl_close($ch);
            throw new Exception("Erreur cURL: " . $error_msg);
        }
        
        curl_close($ch);
        
        if ($httpcode >= 400) {
            throw new Exception("Erreur API Groq ($httpcode): " . $response);
        }
        
        return json_decode($response, true);
    }
}
?>
