<?php
require_once '../config.php';

header('Content-Type: application/json');

// Vérification de sécurité
$token = get_bearer_token();
if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Token manquant."]);
    exit;
}

$payload = verify_jwt($token);
if (!$payload || !isset($payload['company_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Token invalide ou expiré."]);
    exit;
}

$company_id = $payload['company_id'];

try {
    $pdo = get_db_connection();
    
    // Récupérer l'historique des diagnostics pour cette entreprise, du plus récent au plus ancien
    $stmt = $pdo->prepare("
        SELECT id, diagnostic_type, score, report, created_at 
        FROM diagnostics 
        WHERE company_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$company_id]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir les chaînes JSON 'report' en objets PHP pour le frontend
    foreach ($results as &$row) {
        if (!empty($row['report'])) {
            $row['report'] = json_decode($row['report'], true);
        }
    }

    echo json_encode([
        "success" => true,
        "diagnostics" => $results
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur serveur lors de la récupération de l'historique."]);
}
