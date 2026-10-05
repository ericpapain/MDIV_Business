<?php
// public/api/feedback_loop.php
/**
 * Boucle de Rétroaction Human-in-the-Loop & Apprentissage Continu Few-Shot (Brique 6)
 * 
 * RÔLE :
 * 1. Enregistrer les corrections manuelles apportées par les dirigeants et experts métiers sur les livrables IA.
 * 2. Créer une base d'exemples de référence (Few-Shot Exemplars) étanche par entreprise.
 * 3. Vectoriser automatiquement ces corrections approuvées dans la mémoire vectorielle (RAG).
 * 4. Permettre la réinjection immédiate de ces préférences dans les futures délibérations d'agents.
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
    $pdo = get_db_connection();

    // =========================================================================
    // 1. LECTURE DES EXEMPLES FEW-SHOT D'UNE ENTREPRISE (GET)
    // =========================================================================
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $company_id = intval($_GET['company_id'] ?? 0);
        $tool_type = trim($_GET['tool_type'] ?? '');
        $limit = min(20, max(1, intval($_GET['limit'] ?? 10)));

        if ($company_id <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "company_id obligatoire."]);
            exit;
        }

        $sql = "SELECT id, company_id, tool_type, title, input_summary, human_approved_output, correction_notes, rating, created_at 
                FROM company_few_shot_examples 
                WHERE company_id = ?";
        $params = [$company_id];

        if (!empty($tool_type)) {
            $sql .= " AND tool_type = ?";
            $params[] = $tool_type;
        }

        $sql .= " ORDER BY id DESC LIMIT " . $limit;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $examples = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'company_id' => $company_id,
            'count' => count($examples),
            'examples' => $examples
        ], JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    // =========================================================================
    // 2. ENREGISTREMENT D'UNE CORRECTION DIRIGEANT / FEW-SHOT (POST)
    // =========================================================================
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $company_id = intval($input['company_id'] ?? 0);
    $tool_type = trim($input['tool_type'] ?? 'general');
    $title = trim($input['title'] ?? 'Correction validée par la direction');
    $input_summary = trim($input['input_summary'] ?? '');
    $original_ai_output = is_array($input['original_ai_output'] ?? null) 
        ? json_encode($input['original_ai_output'], JSON_UNESCAPED_UNICODE) 
        : trim($input['original_ai_output'] ?? '');
    $human_approved_output = is_array($input['human_approved_output'] ?? null) 
        ? json_encode($input['human_approved_output'], JSON_UNESCAPED_UNICODE) 
        : trim($input['human_approved_output'] ?? '');
    $correction_notes = trim($input['correction_notes'] ?? '');
    $rating = max(1, min(5, intval($input['rating'] ?? 5)));

    if ($company_id <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "company_id obligatoire pour garantir l'étanchéité multi-tenant."]);
        exit;
    }

    if (empty($human_approved_output)) {
        http_response_code(400);
        echo json_encode(["error" => "Le livrable validé par le dirigeant ('human_approved_output') est requis."]);
        exit;
    }

    // 1. Insertion dans la table relationnelle de Few-Shot
    $stmt = $pdo->prepare("
        INSERT INTO company_few_shot_examples 
        (company_id, tool_type, title, input_summary, original_ai_output, human_approved_output, correction_notes, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $company_id,
        $tool_type,
        $title,
        $input_summary,
        $original_ai_output,
        $human_approved_output,
        $correction_notes,
        $rating
    ]);
    $fewShotId = $pdo->lastInsertId();

    // 2. Indexation vectorielle automatique dans la mémoire d'entreprise
    $vectorText = "DOCUMENT DE RÉFÉRENCE VALIDÉ PAR LE DIRIGEANT (Module: $tool_type, Titre: $title)\n";
    if (!empty($correction_notes)) {
        $vectorText .= "Exigences et corrections formulées : $correction_notes\n";
    }
    $vectorText .= "Contenu approuvé :\n" . $human_approved_output;

    $chunksIndexed = 0;
    try {
        $chunksIndexed = index_document_vector(
            $company_id,
            "fewshot_" . $fewShotId,
            "few_shot_exemplar",
            $title,
            $vectorText,
            [
                'tool_type' => $tool_type,
                'fewshot_id' => $fewShotId,
                'rating' => $rating,
                'is_executive_validated' => true
            ]
        );
    } catch (Exception $eVect) {
        // Enregistrement relationnel préservé même si le cluster vectoriel externe a une latence
    }

    echo json_encode([
        'status' => 'success',
        'few_shot_id' => $fewShotId,
        'company_id' => $company_id,
        'chunks_vectorized' => $chunksIndexed,
        'message' => "La validation et les corrections du dirigeant ont été intégrées dans l'apprentissage continu de l'entreprise."
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
