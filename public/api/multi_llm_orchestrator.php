<?php
// public/api/multi_llm_orchestrator.php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/groq_client.php'; // Used for generic API calls if needed

class MultiLLMOrchestrator {
    private $db;

    public function __construct() {
        // En mode réel, on se connecte à la DB MySQL
        // $this->db = new PDO('mysql:host=...;dbname=...', 'user', 'pass');
    }

    /**
     * Point d'entrée principal pour une application
     */
    public function executePrompt($appKey, $systemPrompt, $userPrompt, $companyId = null, $userId = null) {
        $startTime = microtime(true);
        $config = $this->getAppConfig($appKey);
        
        $mode = $config['execution_mode']; // 'Single', 'Challenge', 'Fusion'
        $modelsToRun = $this->selectModelsBasedOnIntelligence($config);

        // 1. Exécution en Parallèle
        $responses = $this->runParallelRequests($modelsToRun, $systemPrompt, $userPrompt);

        $finalResponse = "";
        $winningModelId = null;
        $evaluations = [];

        if ($mode === 'Single') {
            $winningModelId = $responses[0]['model_id'];
            $finalResponse = $responses[0]['raw_response'];
        } 
        else if ($mode === 'Challenge') {
            // Meta-Evaluation Croisée
            $evaluations = $this->crossEvaluateResponses($responses, $systemPrompt, $userPrompt, $config['custom_scoring_weights']);
            $winner = $this->getBestResponse($evaluations);
            $winningModelId = $winner['model_id'];
            $finalResponse = $winner['raw_response'];
        } 
        else if ($mode === 'Fusion') {
            // Fusion de toutes les réponses par un Master Model
            $evaluations = $this->crossEvaluateResponses($responses, $systemPrompt, $userPrompt, $config['custom_scoring_weights']);
            $finalResponse = $this->fuseResponses($evaluations, $systemPrompt, $userPrompt);
            $winningModelId = null; // C'est une fusion
        }

        $duration = round((microtime(true) - $startTime) * 1000);

        // Journalisation
        $this->logRequest([
            'app_key' => $appKey,
            'mode_used' => $mode,
            'user_id' => $userId,
            'company_id' => $companyId,
            'prompt_hash' => hash('sha256', $systemPrompt . $userPrompt),
            'winning_model_id' => $winningModelId,
            'duration_ms' => $duration,
            'fusion_applied' => ($mode === 'Fusion'),
            'final_response' => $finalResponse,
            'evaluations' => $evaluations
        ]);

        return [
            'success' => true,
            'mode' => $mode,
            'content' => $finalResponse,
            'duration_ms' => $duration,
            'models_used' => count($modelsToRun)
        ];
    }

    private function getAppConfig($appKey) {
        // En mode réel, fetch dans `ai_app_configs`
        // Pour l'instant, on mock en fonction de la spec
        $configs = [
            'leads_generator' => ['intelligence_level' => 'Research', 'execution_mode' => 'Fusion', 'custom_scoring_weights' => ['confidence'=>30,'reasoning'=>25,'completeness'=>25,'source'=>20]],
            'diagnostic' => ['intelligence_level' => 'Research', 'execution_mode' => 'Fusion', 'custom_scoring_weights' => ['confidence'=>20,'reasoning'=>40,'completeness'=>20,'source'=>20]],
            'email_analyze' => ['intelligence_level' => 'Expert', 'execution_mode' => 'Challenge', 'custom_scoring_weights' => ['confidence'=>30,'reasoning'=>30,'completeness'=>20,'source'=>20]]
        ];
        return $configs[$appKey] ?? ['intelligence_level' => 'Standard', 'execution_mode' => 'Single', 'custom_scoring_weights' => null];
    }

    private function selectModelsBasedOnIntelligence($config) {
        // D'après la règle métier : Standard = 1, Advanced = 2, Expert = 3, Research = 3
        $level = $config['intelligence_level'];
        $models = [];
        
        // Mock de récupération DB des modèles actifs
        $gptAstra = ['id' => 1, 'code' => 'gpt-6-astra', 'provider' => 'OpenAI'];
        $mistral = ['id' => 4, 'code' => 'mistral-large-latest', 'provider' => 'Mistral'];
        $groqMixtral = ['id' => 5, 'code' => 'mixtral-8x7b-32768', 'provider' => 'Groq'];

        if ($level === 'Standard') {
            $models[] = $gptAstra;
        } else if ($level === 'Advanced') {
            $models = [$gptAstra, $mistral];
        } else {
            // Expert & Research = 3 models
            $models = [$gptAstra, $mistral, $groqMixtral];
        }
        return $models;
    }

    private function runParallelRequests($models, $systemPrompt, $userPrompt) {
        $mh = curl_multi_init();
        $handles = [];
        $responses = [];

        foreach ($models as $idx => $model) {
            $ch = curl_init();
            
            // Configuration de la requête selon le provider
            if ($model['provider'] === 'OpenAI') {
                $url = 'https://api.openai.com/v1/chat/completions';
                $key = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : getenv('OPENAI_API_KEY');
            } else if ($model['provider'] === 'Groq' || $model['provider'] === 'Mistral') {
                // Pour l'exemple, on simule via Groq
                $url = 'https://api.groq.com/openai/v1/chat/completions';
                $key = defined('GROQ_API_KEY') ? GROQ_API_KEY : getenv('GROQ_API_KEY');
            }
            
            $payload = json_encode([
                'model' => $model['code'],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt]
                ],
                'temperature' => 0.2
            ]);

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $key
            ]);

            curl_multi_add_handle($mh, $ch);
            $handles[$idx] = ['ch' => $ch, 'model' => $model];
        }

        $active = null;
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);

        while ($active && $mrc == CURLM_OK) {
            if (curl_multi_select($mh) != -1) {
                do {
                    $mrc = curl_multi_exec($mh, $active);
                } while ($mrc == CURLM_CALL_MULTI_PERFORM);
            }
        }

        foreach ($handles as $idx => $handleData) {
            $ch = $handleData['ch'];
            $model = $handleData['model'];
            $result = curl_multi_getcontent($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            $rawResponse = "";
            if ($httpCode === 200) {
                $resJson = json_decode($result, true);
                $rawResponse = $resJson['choices'][0]['message']['content'] ?? '';
            }

            $responses[] = [
                'model_id' => $model['id'],
                'model_code' => $model['code'],
                'raw_response' => $rawResponse
            ];
            
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }

        curl_multi_close($mh);
        return $responses;
    }

    private function crossEvaluateResponses($responses, $systemPrompt, $userPrompt, $weights) {
        // En mode réel, on enverrait une 2ème requête aux LLM pour noter le JSON des réponses.
        // Ici on simule l'évaluation croisée avec le système de scoring.
        foreach ($responses as &$res) {
            // Simulated scores
            $res['confidence_score'] = rand(80, 99);
            $res['reasoning_score'] = rand(75, 95);
            $res['completeness_score'] = rand(80, 98);
            $res['source_quality_score'] = rand(85, 100);

            // Application des poids
            $wConf = ($weights['confidence'] ?? 25) / 100;
            $wReas = ($weights['reasoning'] ?? 25) / 100;
            $wComp = ($weights['completeness'] ?? 25) / 100;
            $wSrc  = ($weights['source'] ?? 25) / 100;

            $res['final_aggregated_score'] = 
                ($res['confidence_score'] * $wConf) + 
                ($res['reasoning_score'] * $wReas) + 
                ($res['completeness_score'] * $wComp) + 
                ($res['source_quality_score'] * $wSrc);
        }
        return $responses;
    }

    private function getBestResponse($evaluations) {
        $best = $evaluations[0];
        foreach ($evaluations as $ev) {
            if ($ev['final_aggregated_score'] > $best['final_aggregated_score']) {
                $best = $ev;
            }
        }
        return $best;
    }

    private function fuseResponses($evaluations, $systemPrompt, $userPrompt) {
        // Le modèle le plus puissant (ex: GPT-6 Astra) fusionne les réponses
        // En production on ferait un appel à $this->runParallelRequests avec 1 seul modèle de fusion
        // Ici on retourne une concaténation ou une réponse du meilleur modèle enrichie pour l'exemple
        $best = $this->getBestResponse($evaluations);
        return $best['raw_response']; // Simulé
    }

    private function logRequest($logData) {
        // Insertion dans la base MySQL (tables ai_request_logs et ai_model_evaluations)
        // file_put_contents('multi_llm_logs.txt', json_encode($logData) . "\n", FILE_APPEND);
    }
}
