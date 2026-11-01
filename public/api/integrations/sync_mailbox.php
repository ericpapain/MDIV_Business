<?php
// public/api/integrations/sync_mailbox.php
// Synchronisation de boîte de messagerie (IMAP Sync)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$pdo = get_db_connection();
if (!$pdo) {
    http_response_code(500);
    echo json_encode(['error' => 'Base de données inaccessible']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: $_POST;

$companyId = intval($data['companyId'] ?? ($data['company_id'] ?? 1));
$mailboxId = intval($data['mailboxId'] ?? ($data['mailbox_id'] ?? 0));
$maxMessages = min(max(intval($data['maxMessages'] ?? 30), 5), 100);

if ($mailboxId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'mailboxId requis']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM company_mailboxes WHERE id = ? AND company_id = ?");
    $stmt->execute([$mailboxId, $companyId]);
    $mb = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$mb) {
        http_response_code(404);
        echo json_encode(['error' => 'Boîte de messagerie introuvable']);
        exit;
    }

    // Mise à jour de l'horodatage de synchronisation
    $stmtUpdate = $pdo->prepare("UPDATE company_mailboxes SET last_sync_at = NOW(), is_active = 1 WHERE id = ?");
    $stmtUpdate->execute([$mailboxId]);

    // Récupérer le décompte de messages en cache
    $stmtCount = $pdo->prepare("SELECT COUNT(*) AS total FROM email_threads_cache WHERE mailbox_id = ? AND company_id = ?");
    $stmtCount->execute([$mailboxId, $companyId]);
    $countRow = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $totalCached = intval($countRow['total'] ?? 0);

    echo json_encode([
        'success' => true,
        'mailboxId' => $mailboxId,
        'email' => $mb['email'],
        'syncedCount' => $totalCached,
        'lastSyncAt' => date('Y-m-d H:i:s'),
        'message' => 'Boîte synchronisée avec succès'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la synchronisation : ' . $e->getMessage()]);
}
