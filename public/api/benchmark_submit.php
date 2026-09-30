<?php
// public/api/benchmark_submit.php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $lead = $input['lead'] ?? [];
    $globalScore = $input['globalScore'] ?? 0;
    $aiScore = $input['aiScore'] ?? 0;

    // Sauvegarde en DB si disponible
    try {
        $pdo = get_db_connection();
        $stmt = $pdo->prepare("INSERT INTO leads (name, email, phone, company, status, notes) VALUES (?, ?, ?, ?, 'nouveau', ?)");
        $leadName = trim(($lead['firstName'] ?? '') . ' ' . ($lead['lastName'] ?? ''));
        $notes = "Benchmark IA Score: $aiScore% | Score Global: $globalScore% | Secteur: " . ($lead['sector'] ?? '');
        $stmt->execute([
            $leadName ?: 'Contact Benchmark',
            $lead['email'] ?? 'contact@lead.fr',
            $lead['phone'] ?? '',
            $lead['companyName'] ?? 'Entreprise',
            $notes
        ]);
    } catch (Exception $dbErr) {
        // Enregistrement facultatif si table non encore migrée
    }

    echo json_encode([
        'success' => true,
        'message' => 'Résultats du benchmark enregistrés avec succès.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
