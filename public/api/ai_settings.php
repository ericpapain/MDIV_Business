<?php
/**
 * Gestion et lecture/écriture des paramètres de modèles IA (Panel Admin MDIV)
 */
require_once __DIR__ . '/config.php';

$settings_file = __DIR__ . '/../../dev_db.json';
if (!file_exists($settings_file)) {
    $settings_file = __DIR__ . '/ai_settings.json';
}

$default_settings = [
    'primaryProvider' => 'groq',
    'groqModel' => 'qwen/qwen3.8-27b',
    'openaiModel' => 'gpt-4o-mini',
    'mistralModel' => 'mistral-small-latest',
    'temperature' => 0.7,
    'fallbackEnabled' => true
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $settings = $default_settings;
    if (file_exists($settings_file)) {
        $content = json_decode(file_get_contents($settings_file), true);
        if (isset($content['aiSettings'])) {
            $settings = array_merge($default_settings, $content['aiSettings']);
        } elseif (is_array($content) && isset($content['primaryProvider'])) {
            $settings = array_merge($default_settings, $content);
        }
    }
    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $new_settings = [
        'primaryProvider' => $input['primaryProvider'] ?? 'groq',
        'groqModel' => $input['groqModel'] ?? 'qwen/qwen3.8-27b',
        'openaiModel' => $input['openaiModel'] ?? 'gpt-4o-mini',
        'mistralModel' => $input['mistralModel'] ?? 'mistral-small-latest',
        'temperature' => isset($input['temperature']) ? floatval($input['temperature']) : 0.7,
        'fallbackEnabled' => isset($input['fallbackEnabled']) ? filter_var($input['fallbackEnabled'], FILTER_VALIDATE_BOOLEAN) : true
    ];

    $existing_data = [];
    if (file_exists($settings_file)) {
        $existing_data = json_decode(file_get_contents($settings_file), true) ?: [];
    }

    if (isset($existing_data['clients']) || isset($existing_data['invoices'])) {
        $existing_data['aiSettings'] = $new_settings;
        file_put_contents($settings_file, json_encode($existing_data, JSON_PRETTY_PRINT));
    } else {
        file_put_contents($settings_file, json_encode($new_settings, JSON_PRETTY_PRINT));
    }

    // Garde également ai_settings.json toujours à jour pour OVH / production
    @file_put_contents(__DIR__ . '/ai_settings.json', json_encode($new_settings, JSON_PRETTY_PRINT));

    echo json_encode([
        'success' => true,
        'message' => 'Configuration IA mise à jour avec succès',
        'settings' => $new_settings
    ]);
    exit(0);
}
