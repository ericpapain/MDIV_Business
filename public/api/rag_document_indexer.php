<?php
// public/api/rag_document_indexer.php
/**
 * Point d'entrée API pour l'indexation de documents dans la mémoire vectorielle de l'entreprise
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/vector_store.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $company_id = intval($input['company_id'] ?? 0);
    $document_id = trim($input['document_id'] ?? ('doc_' . bin2hex(random_bytes(6))));
    $document_type = trim($input['document_type'] ?? 'general');
    $document_name = trim($input['document_name'] ?? 'Document sans titre');
    $text = trim($input['text'] ?? '');
    $metadata = is_array($input['metadata'] ?? null) ? $input['metadata'] : [];

    if ($company_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "company_id obligatoire pour garantir l'étanchéité multi-tenant."]);
        exit;
    }

    if (empty($text) || mb_strlen($text) < 15) {
        http_response_code(400);
        echo json_encode(["error" => "Texte de document insuffisant pour vectorisation."]);
        exit;
    }

    $chunksIndexed = index_document_vector($company_id, $document_id, $document_type, $document_name, $text, $metadata);

    echo json_encode([
        'status' => 'success',
        'document_id' => $document_id,
        'chunks_indexed' => $chunksIndexed,
        'model' => 'text-embedding-3-large',
        'dimensions' => 1536,
        'message' => "Document « $document_name » indexé avec succès dans la mémoire vectorielle de l'entreprise (ID $company_id)."
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
