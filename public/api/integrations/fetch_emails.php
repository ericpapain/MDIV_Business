<?php
// public/api/integrations/fetch_emails.php
// Récupération de l'historique complet des emails et fils de discussion par contact
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$companyId = intval($_GET['company_id'] ?? 1);
$mailboxId = isset($_GET['mailbox_id']) ? intval($_GET['mailbox_id']) : null;
$contactEmail = trim($_GET['contact_email'] ?? '');
$search = trim($_GET['search'] ?? '');
$limit = min(max(intval($_GET['limit'] ?? 50), 1), 200);

try {
    $conditions = ["c.company_id = ?"];
    $params = [$companyId];

    if ($mailboxId) {
        $conditions[] = "c.mailbox_id = ?";
        $params[] = $mailboxId;
    }

    if (!empty($contactEmail)) {
        $conditions[] = "(LOWER(c.sender_email) = LOWER(?) OR LOWER(c.recipient_email) = LOWER(?))";
        $params[] = $contactEmail;
        $params[] = $contactEmail;
    }

    if (!empty($search)) {
        $conditions[] = "(c.subject LIKE ? OR c.sender_email LIKE ? OR c.recipient_email LIKE ? OR c.snippet LIKE ?)";
        $wildcard = "%$search%";
        $params[] = $wildcard;
        $params[] = $wildcard;
        $params[] = $wildcard;
        $params[] = $wildcard;
    }

    $whereClause = implode(" AND ", $conditions);

    $sql = "
        SELECT c.id, c.company_id, c.mailbox_id, c.message_id, c.direction,
               c.sender_email, c.sender_name, c.recipient_email, c.recipient_name,
               c.subject, c.snippet, c.body_text, c.body_html, c.received_at,
               c.is_read, c.has_attachments,
               m.display_name AS mailbox_name, m.email AS mailbox_email
        FROM email_threads_cache c
        LEFT JOIN company_mailboxes m ON c.mailbox_id = m.id
        WHERE $whereClause
        ORDER BY c.received_at DESC
        LIMIT $limit
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'count' => count($messages),
        'contact_email' => $contactEmail ?: null,
        'search' => $search ?: null,
        'messages' => $messages
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur récupération messages : ' . $e->getMessage()]);
}
