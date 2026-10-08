<?php
// Fichier : /api/groq_client.php
// Système de fallback multi-fournisseurs : Groq -> Mistral -> HuggingFace
require_once __DIR__ . '/config.php';

function callLlmProvider($url, $apiKey, $data, $providerName, $stream = false) {
    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

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

/**
 * Appel API IA avec routage dynamique piloté par l'Admin (/admin/ai-settings).
 * @param array $messages Les messages de la conversation
 * @param string|null $model Le modèle spécifique (ou null pour utiliser celui de l'admin)
 * @param bool $stream Mode streaming SSE
 * @param bool $useJsonMode Activer le mode JSON strict (response_format)
 */
function callGroqApi($messages, $model = null, $stream = false, $useJsonMode = true) {
    // Injection d'une directive globale pour bloquer les prix et forcer le renvoi vers le contact
    $globalConstraint = "\n\nCRITICAL DIRECTIVE: NEVER mention exact costs, prices, or financial estimates. Instead, if pricing or costs are relevant, direct the user to 'Nous contacter pour une étude de prix' using exactly this markdown link: [Nous contacter pour une étude de prix](/contact)";
    foreach ($messages as &$msg) {
        if (isset($msg['role']) && $msg['role'] === 'system') {
            $msg['content'] .= $globalConstraint;
        }
    }
    unset($msg);

    $settings = function_exists('get_active_ai_settings') ? get_active_ai_settings() : [
        'primaryProvider' => 'openai',
        'groqModel' => 'qwen/qwen3.8-27b',
        'openaiModel' => 'gpt-4o-mini',
        'mistralModel' => 'mistral-small-latest',
        'temperature' => 0.7,
        'fallbackEnabled' => true
    ];

    $primary = $settings['primaryProvider'] ?? 'openai';
    $fallback = ($settings['fallbackEnabled'] ?? true) !== false;
    $temperature = floatval($settings['temperature'] ?? 0.7);

    // Définition de l'ordre d'inférence en fonction du choix de l'administrateur
    $sequence = [];
    if ($primary === 'openai') {
        $sequence[] = 'openai';
        if ($fallback) { $sequence[] = 'groq'; $sequence[] = 'mistral'; }
    } elseif ($primary === 'mistral') {
        $sequence[] = 'mistral';
        if ($fallback) { $sequence[] = 'openai'; $sequence[] = 'groq'; }
    } elseif ($primary === 'groq') {
        $sequence[] = 'groq';
        if ($fallback) { $sequence[] = 'openai'; $sequence[] = 'mistral'; }
    } else {
        // Mode auto cascade (priorité OpenAI puis Groq puis Mistral)
        $sequence[] = 'openai';
        $sequence[] = 'groq';
        $sequence[] = 'mistral';
    }

    $errors = [];

    foreach ($sequence as $prov) {
        if ($prov === 'groq' && !empty(GROQ_API_KEY)) {
            $groqModel = $model ?: ($settings['groqModel'] ?? 'qwen/qwen3.8-27b');
            try {
                $data = [
                    'model' => $groqModel,
                    'messages' => $messages,
                    'temperature' => $temperature,
                    'stream' => $stream
                ];
                if (!$stream && $useJsonMode) {
                    $data['response_format'] = ['type' => 'json_object'];
                }
                return callLlmProvider('https://api.groq.com/openai/v1/chat/completions', GROQ_API_KEY, $data, 'Groq (' . $groqModel . ')', $stream);
            } catch (Exception $e) {
                $errors[] = 'Groq (' . $groqModel . '): ' . $e->getMessage();
                // Si le modèle Qwen est indisponible ou rate limited, basculer immédiatement sur llama-3.3-70b-versatile
                if ($groqModel !== 'llama-3.3-70b-versatile') {
                    try {
                        $data['model'] = 'llama-3.3-70b-versatile';
                        return callLlmProvider('https://api.groq.com/openai/v1/chat/completions', GROQ_API_KEY, $data, 'Groq (llama-3.3-70b-versatile)', $stream);
                    } catch (Exception $e2) {
                        $errors[] = 'Groq (llama-3.3-70b-versatile): ' . $e2->getMessage();
                    }
                }
            }
        }

        if ($prov === 'openai' && !empty(OPENAI_API_KEY)) {
            $openaiModel = $settings['openaiModel'] ?? 'gpt-4o-mini';
            try {
                $data = [
                    'model' => $openaiModel,
                    'messages' => $messages,
                    'temperature' => $temperature,
                    'stream' => $stream
                ];
                if (!$stream && $useJsonMode) {
                    $data['response_format'] = ['type' => 'json_object'];
                }
                return callLlmProvider('https://api.openai.com/v1/chat/completions', OPENAI_API_KEY, $data, 'OpenAI (' . $openaiModel . ')', $stream);
            } catch (Exception $e) {
                $errors[] = 'OpenAI: ' . $e->getMessage();
            }
        }

        if ($prov === 'mistral' && !empty(MISTRAL_API_KEY)) {
            $mistralModel = $settings['mistralModel'] ?? 'mistral-small-latest';
            try {
                $data = [
                    'model' => $mistralModel,
                    'messages' => $messages,
                    'temperature' => $temperature,
                    'stream' => $stream
                ];
                if (!$stream && $useJsonMode) {
                    $data['response_format'] = ['type' => 'json_object'];
                }
                return callLlmProvider('https://api.mistral.ai/v1/chat/completions', MISTRAL_API_KEY, $data, 'Mistral (' . $mistralModel . ')', $stream);
            } catch (Exception $e) {
                $errors[] = 'Mistral: ' . $e->getMessage();
            }
        }
    }

    // Fallback HuggingFace si tout a échoué et que HF est configuré
    if (!empty(HF_API_KEY)) {
        try {
            $data = [
                'model' => 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                'messages' => $messages,
                'stream' => $stream,
                'max_tokens' => 1024
            ];
            return callLlmProvider('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1/v1/chat/completions', HF_API_KEY, $data, 'HuggingFace', $stream);
        } catch (Exception $e) {
            $errors[] = 'HuggingFace: ' . $e->getMessage();
        }
    }

    if (empty($errors)) {
        throw new Exception("Aucune clé API IA (GROQ_API_KEY ou OPENAI_API_KEY) n'est activement configurée sur le serveur.");
    }

    throw new Exception("Toutes les APIs IA ont échoué. Détails : " . implode(" | ", $errors));
}
?>
