<?php
// public/api/rag_query.php
/**
 * Point d'entrée API pour la recherche sémantique multi-tenant hermétique
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/vector_store.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_REQUEST;

    $company_id = intval($input['company_id'] ?? 0);
    $query = trim($input['query'] ?? ($input['q'] ?? ''));
    $top_k = intval($input['top_k'] ?? 4);
    $min_score = floatval($input['min_score'] ?? 0.65);
    $document_type = !empty($input['document_type']) ? trim($input['document_type']) : null;

    if ($company_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "company_id obligatoire."]);
        exit;
    }

    if (empty($query)) {
        http_response_code(400);
        echo json_encode(["error" => "Requête sémantique vide."]);
        exit;
    }

    $results = search_company_semantic_memory($company_id, $query, $top_k, $min_score, $document_type);

    echo json_encode([
        'status' => 'success',
        'company_id' => $company_id,
        'query' => $query,
        'results_count' => count($results),
        'results' => $results
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
