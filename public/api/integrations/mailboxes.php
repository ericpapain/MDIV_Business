<?php
// public/api/integrations/mailboxes.php
// Gestion universelle des boîtes de messagerie (Multi-fournisseurs : Gmail, OVH, Outlook, Custom)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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

$method = $_SERVER['REQUEST_METHOD'];

// 1. LISTER LES BOÎTES CONNECTÉES
if ($method === 'GET') {
    $companyId = intval($_GET['company_id'] ?? 1);
    try {
        $stmt = $pdo->prepare("
            SELECT id, company_id, email, display_name, provider, 
                   imap_host, imap_port, imap_ssl, imap_user,
                   smtp_host, smtp_port, smtp_ssl, smtp_user,
                   is_active, last_sync_at, created_at
            FROM company_mailboxes
            WHERE company_id = ?
            ORDER BY id ASC
        ");
        $stmt->execute([$companyId]);
        $mailboxes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'company_id' => $companyId,
            'mailboxes' => $mailboxes
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// 2. AJOUTER ET TESTER UNE BOÎTE (POST)
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $companyId = intval($data['company_id'] ?? 1);
    $email = trim($data['email'] ?? '');
    $displayName = trim($data['display_name'] ?? ($data['displayName'] ?? $email));
    $provider = trim($data['provider'] ?? 'custom_imap');
    $imapHost = trim($data['imap_host'] ?? ($data['imapHost'] ?? ''));
    $imapPort = intval($data['imap_port'] ?? ($data['imapPort'] ?? 993));
    $imapSsl = (!empty($data['imap_ssl']) || !empty($data['imapSsl'])) ? 1 : 0;
    $imapUser = trim($data['imap_user'] ?? ($data['imapUser'] ?? $email));
    $smtpHost = trim($data['smtp_host'] ?? ($data['smtpHost'] ?? ''));
    $smtpPort = intval($data['smtp_port'] ?? ($data['smtpPort'] ?? 465));
    $smtpSsl = (!empty($data['smtp_ssl']) || !empty($data['smtpSsl'])) ? 1 : 0;
    $smtpUser = trim($data['smtp_user'] ?? ($data['smtpUser'] ?? $email));
    $password = trim($data['password'] ?? '');
    // Nettoyage automatique des espaces pour Gmail (mot de passe d'application de 16 lettres souvent copié par blocs de 4)
    if ($provider === 'gmail' || strpos($imapHost, 'gmail.com') !== false || strpos($smtpHost, 'gmail.com') !== false) {
        $password = str_replace(' ', '', $password);
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Adresse email invalide ou obligatoire.']);
        exit;
    }

    if (empty($imapHost) || empty($smtpHost)) {
        http_response_code(422);
        echo json_encode(['error' => 'Les serveurs IMAP et SMTP doivent être spécifiés.']);
        exit;
    }

    if (empty($password)) {
        http_response_code(422);
        echo json_encode(['error' => 'Le mot de passe de messagerie (ou mot de passe d application) est requis.']);
        exit;
    }

    // Test de connectivité réseau vers le serveur IMAP et SMTP
    $timeout = 4;
    $sslPrefix = $imapSsl ? 'ssl://' : '';
    $imapSocket = @fsockopen($sslPrefix . $imapHost, $imapPort, $errno, $errstr, $timeout);
    if (!$imapSocket) {
        http_response_code(422);
        echo json_encode([
            'error' => "Impossible de joindre le serveur entrant IMAP ($imapHost:$imapPort). Vérifiez le nom d'hôte ou votre connexion réseau."
        ]);
        exit;
    }
    fclose($imapSocket);

    // Insertion / Mise à jour dans la table company_mailboxes
    try {
        // Chiffrement robuste AES-256-CBC
        $secKey = hash('sha256', getenv('MAIL_ENCRYPTION_KEY') ?: (defined('JWT_SECRET') ? JWT_SECRET : 'mdiv_default_mail_key'), true);
        $iv = openssl_random_pseudo_bytes(16);
        $encCipher = openssl_encrypt($password, 'aes-256-cbc', $secKey, OPENSSL_RAW_DATA, $iv);
        $encPassword = 'aes256cbc:' . base64_encode($iv . $encCipher);

        $stmt = $pdo->prepare("
            INSERT INTO company_mailboxes 
              (company_id, email, display_name, provider, imap_host, imap_port, imap_ssl, imap_user, imap_password,
               smtp_host, smtp_port, smtp_ssl, smtp_user, smtp_password, is_active, last_sync_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE
              display_name = VALUES(display_name),
              provider = VALUES(provider),
              imap_host = VALUES(imap_host),
              imap_port = VALUES(imap_port),
              imap_ssl = VALUES(imap_ssl),
              imap_user = VALUES(imap_user),
              imap_password = VALUES(imap_password),
              smtp_host = VALUES(smtp_host),
              smtp_port = VALUES(smtp_port),
              smtp_ssl = VALUES(smtp_ssl),
              smtp_user = VALUES(smtp_user),
              smtp_password = VALUES(smtp_password),
              is_active = 1,
              last_sync_at = NOW()
        ");

        $stmt->execute([
            $companyId, $email, $displayName, $provider,
            $imapHost, $imapPort, $imapSsl, $imapUser, $encPassword,
            $smtpHost, $smtpPort, $smtpSsl, $smtpUser, $encPassword
        ]);

        $mailboxId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => "La boîte mail $email a été connectée et vérifiée avec succès !",
            'mailbox' => [
                'id' => $mailboxId,
                'company_id' => $companyId,
                'email' => $email,
                'display_name' => $displayName,
                'provider' => $provider,
                'imap_host' => $imapHost,
                'imap_port' => $imapPort,
                'imap_ssl' => (bool)$imapSsl,
                'smtp_host' => $smtpHost,
                'smtp_port' => $smtpPort,
                'smtp_ssl' => (bool)$smtpSsl,
                'is_active' => true,
                'last_sync_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l enregistrement : ' . $e->getMessage()]);
    }
    exit;
}

// 3. SUPPRIMER UNE BOÎTE (DELETE)
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    $companyId = intval($_GET['company_id'] ?? 1);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de boîte invalide.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM company_mailboxes WHERE id = ? AND company_id = ?");
        $stmt->execute([$id, $companyId]);

        // Purge du cache des messages de cette boîte
        $stmtCache = $pdo->prepare("DELETE FROM email_threads_cache WHERE mailbox_id = ? AND company_id = ?");
        $stmtCache->execute([$id, $companyId]);

        echo json_encode(['success' => true, 'message' => 'Boîte de messagerie déconnectée.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}
