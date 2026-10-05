<?php
// public/api/ai_telemetry.php
/**
 * Observabilité, Télémétrie d'Arbitrage & Token Economics (Brique 7)
 * 
 * RÔLE :
 * 1. Tracer l'intégralité des délibérations multi-agents (Consensus Trail, Agent 1 à 4).
 * 2. Suivre les coûts exacts d'inférence (Token Economics en €), volumes d'entrées/sorties.
 * 3. Mesurer les latences d'exécution et le respect des SLAs opérationnels.
 * 4. Fournir un tableau de bord d'audit hermétique par entreprise.
 */

require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * Calcule le coût estimé en euros pour un volume de tokens selon le modèle
 */
function calculate_token_cost_eur($model, $promptTokens, $completionTokens) {
    // Tarifs approximatifs par million de tokens convertis en EUR (~1.08 USD/EUR)
    $rates = [
        'gpt-4o-mini' => ['input' => 0.00000014, 'output' => 0.00000055],
        'gpt-4o' => ['input' => 0.0000023, 'output' => 0.0000092],
        'qwen/qwen3.8-27b' => ['input' => 0.00000018, 'output' => 0.00000018],
        'mistral-small-latest' => ['input' => 0.00000019, 'output' => 0.00000057],
        'text-embedding-3-large' => ['input' => 0.00000012, 'output' => 0.0]
    ];

    $m = strtolower($model);
    $selectedRate = $rates['gpt-4o-mini'];
    foreach ($rates as $key => $rate) {
        if (strpos($m, $key) !== false) {
            $selectedRate = $rate;
            break;
        }
    }

    $cost = ($promptTokens * $selectedRate['input']) + ($completionTokens * $selectedRate['output']);
    return round($cost, 6);
}

/**
 * Enregistre une délibération complète dans la table d'audit
 */
function log_ai_deliberation(array $data) {
    try {
        $pdo = get_db_connection();
        
        $company_id = intval($data['company_id'] ?? 1);
        $user_id = isset($data['user_id']) ? intval($data['user_id']) : null;
        $session_id = trim($data['session_id'] ?? ('sess_' . bin2hex(random_bytes(6))));
        $tool_type = trim($data['tool_type'] ?? 'general');
        $document_name = trim($data['document_name'] ?? 'Document');
        $provider = trim($data['provider'] ?? 'openai');
        $model = trim($data['model'] ?? 'gpt-4o-mini');
        $total_latency_ms = intval($data['total_latency_ms'] ?? 0);
        $prompt_tokens = intval($data['prompt_tokens'] ?? 0);
        $completion_tokens = intval($data['completion_tokens'] ?? 0);
        $total_tokens = $prompt_tokens + $completion_tokens;
        
        $cost_eur = isset($data['cost_estimate_eur']) 
            ? floatval($data['cost_estimate_eur']) 
            : calculate_token_cost_eur($model, $prompt_tokens, $completion_tokens);
            
        $consensus_status = in_array($data['consensus_status'] ?? '', ['UNANIMOUS', 'ARBITRATED', 'FLAGGED_RISK', 'FAILED']) 
            ? $data['consensus_status'] 
            : 'ARBITRATED';
            
        $agents_trail = is_array($data['agents_trail_json'] ?? null) 
            ? json_encode($data['agents_trail_json'], JSON_UNESCAPED_UNICODE) 
            : ($data['agents_trail_json'] ?? '{}');

        $stmt = $pdo->prepare("
            INSERT INTO ai_audit_logs 
            (company_id, user_id, session_id, tool_type, document_name, provider, model, total_latency_ms, prompt_tokens, completion_tokens, total_tokens, cost_estimate_eur, consensus_status, agents_trail_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $company_id,
            $user_id,
            $session_id,
            $tool_type,
            $document_name,
            $provider,
            $model,
            $total_latency_ms,
            $prompt_tokens,
            $completion_tokens,
            $total_tokens,
            $cost_eur,
            $consensus_status,
            $agents_trail
        ]);

        return $pdo->lastInsertId();
    } catch (Exception $e) {
        // Enregistrement télémétrique asynchrone non-bloquant
        return false;
    }
}

// Traitement API HTTP
try {
    $pdo = get_db_connection();

    // =========================================================================
    // 1. GET : Statistiques agrégées & Logs récents
    // =========================================================================
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $company_id = intval($_GET['company_id'] ?? 0);
        $tool_type = trim($_GET['tool_type'] ?? '');
        $limit = min(100, max(1, intval($_GET['limit'] ?? 20)));

        $where = [];
        $params = [];

        if ($company_id > 0) {
            $where[] = "company_id = ?";
            $params[] = $company_id;
        }

        if (!empty($tool_type)) {
            $where[] = "tool_type = ?";
            $params[] = $tool_type;
        }

        $whereSql = count($where) > 0 ? "WHERE " . implode(" AND ", $where) : "";

        // KPIs globaux
        $kpiSql = "
            SELECT 
                COUNT(*) as total_runs,
                COALESCE(SUM(total_tokens), 0) as total_tokens,
                COALESCE(SUM(prompt_tokens), 0) as total_prompt_tokens,
                COALESCE(SUM(completion_tokens), 0) as total_completion_tokens,
                COALESCE(SUM(cost_estimate_eur), 0) as total_cost_eur,
                COALESCE(AVG(total_latency_ms), 0) as avg_latency_ms,
                SUM(CASE WHEN consensus_status = 'ARBITRATED' THEN 1 ELSE 0 END) as arbitrated_count,
                SUM(CASE WHEN consensus_status = 'UNANIMOUS' THEN 1 ELSE 0 END) as unanimous_count,
                SUM(CASE WHEN consensus_status = 'FLAGGED_RISK' THEN 1 ELSE 0 END) as flagged_risk_count
            FROM ai_audit_logs 
            $whereSql
        ";
        $stmtKpi = $pdo->prepare($kpiSql);
        $stmtKpi->execute($params);
        $kpi = $stmtKpi->fetch(PDO::FETCH_ASSOC);

        // Liste des dernières délibérations
        $logsSql = "
            SELECT id, company_id, session_id, tool_type, document_name, provider, model, total_latency_ms, total_tokens, prompt_tokens, completion_tokens, cost_estimate_eur, consensus_status, agents_trail_json, created_at
            FROM ai_audit_logs 
            $whereSql 
            ORDER BY id DESC 
            LIMIT $limit
        ";
        $stmtLogs = $pdo->prepare($logsSql);
        $stmtLogs->execute($params);
        $rawLogs = $stmtLogs->fetchAll(PDO::FETCH_ASSOC);

        $logs = array_map(function($row) {
            $row['agents_trail'] = json_decode($row['agents_trail_json'] ?? '{}', true);
            unset($row['agents_trail_json']);
            return $row;
        }, $rawLogs);

        echo json_encode([
            'status' => 'success',
            'company_id' => $company_id,
            'kpis' => [
                'total_runs' => intval($kpi['total_runs']),
                'total_tokens' => intval($kpi['total_tokens']),
                'total_prompt_tokens' => intval($kpi['total_prompt_tokens']),
                'total_completion_tokens' => intval($kpi['total_completion_tokens']),
                'total_cost_eur' => round(floatval($kpi['total_cost_eur']), 4),
                'avg_latency_ms' => round(floatval($kpi['avg_latency_ms']), 0),
                'arbitrated_rate' => $kpi['total_runs'] > 0 ? round(($kpi['arbitrated_count'] / $kpi['total_runs']) * 100, 1) : 0,
                'unanimous_rate' => $kpi['total_runs'] > 0 ? round(($kpi['unanimous_count'] / $kpi['total_runs']) * 100, 1) : 0
            ],
            'recent_logs' => $logs
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // =========================================================================
    // 2. POST : Enregistrement manuel ou client
    // =========================================================================
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $id = log_ai_deliberation($input);

    echo json_encode([
        'status' => 'success',
        'audit_id' => $id,
        'message' => 'Télémétrie d\'arbitrage enregistrée avec succès.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
