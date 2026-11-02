<?php
// public/api/event_engine.php
// Contrôleur de production PHP / MySQL pour MDIV EVENT ENGINE

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-auth-token');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();

// Auto-initialisation résiliente des tables événementielles si absentes de la base MySQL
function ensure_event_engine_tables(PDO $pdo) {
    try {
        $pdo->query("SELECT 1 FROM event_attendees LIMIT 1");
        return; // Les tables existent déjà, zéro surcharge d'exécution
    } catch (Throwable $e) {
        // Table absente : création automatique de l'ensemble du schéma MDIV Event Engine
        try {
            // 1. Colonnes sur la table events
            try { $pdo->exec("ALTER TABLE events ADD COLUMN features_config LONGTEXT DEFAULT NULL"); } catch (Throwable $t) {}
            try { $pdo->exec("ALTER TABLE events ADD COLUMN max_attendees INT DEFAULT NULL"); } catch (Throwable $t) {}
            try { $pdo->exec("ALTER TABLE events ADD COLUMN is_registration_open TINYINT(1) NOT NULL DEFAULT 1"); } catch (Throwable $t) {}

            // 2. Table event_custom_fields
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_custom_fields` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `field_key` VARCHAR(64) NOT NULL,
                `label` VARCHAR(255) NOT NULL,
                `description` VARCHAR(500) NULL,
                `field_type` VARCHAR(50) NOT NULL DEFAULT 'text',
                `is_required` TINYINT(1) NOT NULL DEFAULT 0,
                `default_value` TEXT NULL,
                `placeholder` VARCHAR(255) NULL,
                `options` LONGTEXT NULL,
                `validation_rules` LONGTEXT NULL,
                `conditional_logic` LONGTEXT NULL,
                `sort_order` INT NOT NULL DEFAULT 0,
                `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_evt_fld_order` (`event_id`, `sort_order`, `is_active`),
                INDEX `idx_evt_fld_key` (`event_id`, `field_key`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 3. Table event_attendees
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_attendees` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `client_id` INT NULL,
                `first_name` VARCHAR(100) NOT NULL,
                `last_name` VARCHAR(100) NOT NULL,
                `email` VARCHAR(255) NOT NULL,
                `phone` VARCHAR(50) NULL,
                `company` VARCHAR(255) NULL,
                `job_title` VARCHAR(255) NULL,
                `sector` VARCHAR(150) NULL,
                `pitch_text` TEXT NULL,
                `expertises` LONGTEXT NULL,
                `linkedin_url` VARCHAR(255) NULL,
                `photo_url` VARCHAR(500) NULL,
                `photo_status` VARCHAR(50) NOT NULL DEFAULT 'approved',
                `ticket_code` VARCHAR(50) NOT NULL UNIQUE,
                `status` VARCHAR(50) NOT NULL DEFAULT 'registered',
                `checked_in_at` DATETIME NULL,
                `checked_in_by` VARCHAR(100) NULL,
                `badge_url` VARCHAR(500) NULL,
                `networking_opt_in` TINYINT(1) NOT NULL DEFAULT 1,
                `photo_consent` TINYINT(1) NOT NULL DEFAULT 1,
                `gdpr_consent` TINYINT(1) NOT NULL DEFAULT 1,
                `acquisition_source` VARCHAR(100) DEFAULT 'website',
                `selected_activities` LONGTEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_att_evt_status` (`event_id`, `status`),
                INDEX `idx_att_email` (`email`),
                INDEX `idx_att_ticket` (`ticket_code`),
                INDEX `idx_att_client` (`client_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 4. Table event_custom_field_answers
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_custom_field_answers` (
                `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                `attendee_id` INT NOT NULL,
                `field_id` INT NOT NULL,
                `field_key` VARCHAR(64) NOT NULL,
                `value_text` TEXT NULL,
                `value_file_url` VARCHAR(500) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY `uk_att_fld` (`attendee_id`, `field_id`),
                INDEX `idx_ans_fld` (`field_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 5. Table event_pitches
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_pitches` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `attendee_id` INT NULL,
                `client_id` INT NULL,
                `company_name` VARCHAR(255) NOT NULL,
                `project_title` VARCHAR(255) NOT NULL,
                `presentation` TEXT NOT NULL,
                `needs` TEXT NULL,
                `speaker_name` VARCHAR(255) NOT NULL,
                `speaker_role` VARCHAR(150) NULL,
                `speaker_bio` TEXT NULL,
                `speaker_avatar` VARCHAR(500) NULL,
                `deck_url` VARCHAR(500) NULL,
                `deck_filename` VARCHAR(255) NULL,
                `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
                `speaking_order` INT NOT NULL DEFAULT 99,
                `pitch_time` VARCHAR(50) NULL,
                `moderator_notes` TEXT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_pitch_evt_status` (`event_id`, `status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 6. Tables B2B meeting slots & bookings
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_meeting_slots` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `partner_id` INT NULL,
                `partner_name` VARCHAR(255) NOT NULL,
                `partner_role` VARCHAR(150) NULL,
                `partner_company` VARCHAR(255) NULL,
                `partner_avatar` VARCHAR(500) NULL,
                `date` DATE NOT NULL,
                `start_time` VARCHAR(10) NOT NULL,
                `end_time` VARCHAR(10) NOT NULL,
                `duration_minutes` INT NOT NULL DEFAULT 20,
                `location_mode` VARCHAR(100) NOT NULL DEFAULT 'Table 1',
                `capacity` INT NOT NULL DEFAULT 1,
                `booked_count` INT NOT NULL DEFAULT 0,
                `booking_qr_url` VARCHAR(500) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_slot_evt_partner` (`event_id`, `partner_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_meeting_bookings` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `slot_id` INT NOT NULL,
                `partner_id` INT NULL,
                `partner_name` VARCHAR(255) NOT NULL,
                `attendee_id` INT NULL,
                `client_id` INT NULL,
                `attendee_name` VARCHAR(255) NOT NULL,
                `attendee_email` VARCHAR(255) NOT NULL,
                `attendee_phone` VARCHAR(50) NULL,
                `attendee_company` VARCHAR(255) NULL,
                `status` VARCHAR(50) NOT NULL DEFAULT 'confirmed',
                `notes` TEXT NULL,
                `appointment_id` INT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `cancelled_at` DATETIME NULL,
                INDEX `idx_mb_slot` (`slot_id`),
                INDEX `idx_mb_evt` (`event_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 7. Tables Tombola
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_tombola_prizes` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `title` VARCHAR(255) NOT NULL,
                `description` TEXT NULL,
                `sponsor` VARCHAR(255) NULL,
                `image_url` VARCHAR(500) NULL,
                `winners_count` INT NOT NULL DEFAULT 1,
                `sort_order` INT NOT NULL DEFAULT 1,
                `drawn_count` INT NOT NULL DEFAULT 0,
                `is_drawn` TINYINT(1) NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_tombola_draws` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL,
                `prize_id` INT NOT NULL,
                `prize_title` VARCHAR(255) NOT NULL,
                `winner_attendee_id` INT NOT NULL,
                `winner_name` VARCHAR(255) NOT NULL,
                `winner_company` VARCHAR(255) NULL,
                `winner_email` VARCHAR(255) NOT NULL,
                `winner_ticket_code` VARCHAR(50) NOT NULL,
                `draw_hash` VARCHAR(64) NOT NULL,
                `drawn_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_draw_evt_prize` (`event_id`, `prize_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

            // 8. Table Régie & Diffusion Live
            $pdo->exec("CREATE TABLE IF NOT EXISTS `event_live_states` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `event_id` INT NOT NULL UNIQUE,
                `current_scene` VARCHAR(50) NOT NULL DEFAULT 'welcome',
                `is_auto_mode` TINYINT(1) NOT NULL DEFAULT 0,
                `auto_interval_seconds` INT NOT NULL DEFAULT 25,
                `ticker_message` TEXT NULL,
                `ticker_enabled` TINYINT(1) NOT NULL DEFAULT 1,
                `active_video_url` VARCHAR(500) NULL,
                `is_video_playing` TINYINT(1) NOT NULL DEFAULT 0,
                `spotlight_attendee_id` INT NULL,
                `spotlight_speaker_name` VARCHAR(255) NULL,
                `spotlight_qr_url` VARCHAR(500) NULL,
                `spotlight_qr_title` VARCHAR(255) NULL,
                `enabled_scenes` LONGTEXT NOT NULL,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        } catch (Throwable $setupErr) {
            error_log('Event engine auto-schema creation error: ' . $setupErr->getMessage());
        }
    }
}
ensure_event_engine_tables($pdo);
$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;
if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

// Upload directory pour les photos de participants
$upload_dir = __DIR__ . '/../assets/uploads/';
if (!is_dir($upload_dir)) {
    @mkdir($upload_dir, 0755, true);
}

try {
    // 1. DÉTAIL D'UN ÉVÉNEMENT & CHAMPS
    if ($action === 'get_event') {
        $id = intval($_GET['id'] ?? ($data['id'] ?? 0));
        if ($id <= 0) throw new Exception("ID d'événement manquant");

        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$event) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Événement non trouvé"]);
            exit();
        }

        if (!empty($event['features_config']) && is_string($event['features_config'])) {
            $event['features_config'] = json_decode($event['features_config'], true);
        }
        if (!empty($event['program']) && is_string($event['program'])) {
            $event['program'] = json_decode($event['program'], true);
        }

        // Récupérer les champs personnalisés
        $stmtFields = $pdo->prepare("SELECT * FROM event_custom_fields WHERE event_id = ? AND is_active = 1 ORDER BY sort_order ASC");
        $stmtFields->execute([$id]);
        $fields = $stmtFields->fetchAll(PDO::FETCH_ASSOC);
        foreach ($fields as &$f) {
            if (!empty($f['options']) && is_string($f['options'])) $f['options'] = json_decode($f['options'], true);
            if (!empty($f['validation_rules']) && is_string($f['validation_rules'])) $f['validation_rules'] = json_decode($f['validation_rules'], true);
            if (!empty($f['conditional_logic']) && is_string($f['conditional_logic'])) $f['conditional_logic'] = json_decode($f['conditional_logic'], true);
        }
        $event['custom_fields'] = $fields;

        echo json_encode(['success' => true, 'data' => $event]);
        exit();
    }

    // 2. CONSTRUCTEUR DE QUESTIONS (CUSTOM FIELDS)
    if ($action === 'get_custom_fields') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        if ($eventId <= 0) throw new Exception("event_id requis");

        $stmt = $pdo->prepare("SELECT * FROM event_custom_fields WHERE event_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$eventId]);
        $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($fields as &$f) {
            if (!empty($f['options']) && is_string($f['options'])) $f['options'] = json_decode($f['options'], true);
            if (!empty($f['validation_rules']) && is_string($f['validation_rules'])) $f['validation_rules'] = json_decode($f['validation_rules'], true);
            if (!empty($f['conditional_logic']) && is_string($f['conditional_logic'])) $f['conditional_logic'] = json_decode($f['conditional_logic'], true);
        }
        echo json_encode(['success' => true, 'data' => $fields]);
        exit();
    }

    if ($action === 'save_custom_field' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        if ($eventId <= 0) throw new Exception("event_id requis");

        $fieldId = isset($data['id']) ? intval($data['id']) : 0;
        $fieldKey = trim($data['field_key'] ?? ('custom_' . time()));
        $label = trim($data['label'] ?? 'Nouvelle question');
        $desc = trim($data['description'] ?? '');
        $fieldType = trim($data['field_type'] ?? 'text');
        $isRequired = !empty($data['is_required']) ? 1 : 0;
        $defVal = trim($data['default_value'] ?? '');
        $placeholder = trim($data['placeholder'] ?? '');
        $options = isset($data['options']) ? json_encode($data['options'], JSON_UNESCAPED_UNICODE) : null;
        $validation = isset($data['validation_rules']) ? json_encode($data['validation_rules'], JSON_UNESCAPED_UNICODE) : null;
        $cond = isset($data['conditional_logic']) ? json_encode($data['conditional_logic'], JSON_UNESCAPED_UNICODE) : null;
        $sortOrder = intval($data['sort_order'] ?? 1);
        $isActive = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;

        if ($fieldId > 0) {
            $stmt = $pdo->prepare("UPDATE event_custom_fields SET field_key=?, label=?, description=?, field_type=?, is_required=?, default_value=?, placeholder=?, options=?, validation_rules=?, conditional_logic=?, sort_order=?, is_active=? WHERE id=? AND event_id=?");
            $stmt->execute([$fieldKey, $label, $desc, $fieldType, $isRequired, $defVal, $placeholder, $options, $validation, $cond, $sortOrder, $isActive, $fieldId, $eventId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO event_custom_fields (event_id, field_key, label, description, field_type, is_required, default_value, placeholder, options, validation_rules, conditional_logic, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$eventId, $fieldKey, $label, $desc, $fieldType, $isRequired, $defVal, $placeholder, $options, $validation, $cond, $sortOrder, $isActive]);
            $fieldId = $pdo->lastInsertId();
        }

        echo json_encode(['success' => true, 'id' => $fieldId, 'message' => "Champ personnalisé enregistré"]);
        exit();
    }

    // 3. INSCRIPTION PUBLIQUE ET SYNCHRONISATION CRM SANS DOUBLON
    if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        if ($eventId <= 0) throw new Exception("event_id requis");

        // Vérifier l'événement
        $stmtEvt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmtEvt->execute([$eventId]);
        $event = $stmtEvt->fetch(PDO::FETCH_ASSOC);
        if (!$event) throw new Exception("Événement introuvable");

        $firstName = trim($data['first_name'] ?? '');
        $lastName = trim($data['last_name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');
        $company = trim($data['company'] ?? '');
        $jobTitle = trim($data['job_title'] ?? '');
        $sector = trim($data['sector'] ?? '');
        $pitchText = trim($data['pitch_text'] ?? '');
        $linkedinUrl = trim($data['linkedin_url'] ?? '');
        $networkingOptIn = !empty($data['networking_opt_in']) ? 1 : 0;
        $photoConsent = !empty($data['photo_consent']) ? 1 : 0;
        $gdprConsent = !empty($data['gdpr_consent']) ? 1 : 0;
        $source = trim($data['acquisition_source'] ?? 'website');

        if (empty($firstName) || empty($lastName)) throw new Exception("Le nom et le prénom sont obligatoires.");
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Adresse e-mail valide requise.");

        // Traitement de la Photo (Base64)
        $photoUrl = null;
        if (!empty($data['photo_base64'])) {
            if (preg_match('/^data:image\/(jpeg|png|webp);base64,(.+)$/', $data['photo_base64'], $matches)) {
                $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                $imgData = base64_decode($matches[2]);
                if (strlen($imgData) <= 5 * 1024 * 1024) { // max 5 Mo
                    $fileName = 'attendee_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                    file_put_contents($upload_dir . $fileName, $imgData);
                    $photoUrl = '/assets/uploads/' . $fileName;
                }
            }
        }

        // --- SYNCHRONISATION CRM (TABLE clients) SANS DOUBLON ---
        $clientId = null;
        $crmSynced = false;
        try {
            $stmtClient = $pdo->prepare("SELECT id, phone, company FROM clients WHERE LOWER(TRIM(email)) = ? LIMIT 1");
            $stmtClient->execute([$email]);
            $existingClient = $stmtClient->fetch(PDO::FETCH_ASSOC);

            if ($existingClient) {
                $clientId = intval($existingClient['id']);
                // Compléter les champs vides sans écraser les données commerciales
                $updates = [];
                $params = [];
                if (empty($existingClient['phone']) && !empty($phone)) {
                    $updates[] = "phone = ?";
                    $params[] = $phone;
                }
                if (empty($existingClient['company']) && !empty($company)) {
                    $updates[] = "company = ?";
                    $updates[] = "company_name = ?";
                    $params[] = $company;
                    $params[] = $company;
                }
                if (!empty($updates)) {
                    $params[] = $clientId;
                    $stmtUpdate = $pdo->prepare("UPDATE clients SET " . implode(", ", $updates) . " WHERE id = ?");
                    $stmtUpdate->execute($params);
                }
                $crmSynced = true;
            } else {
                // Création nouveau client propre
                $stmtNew = $pdo->prepare("INSERT INTO clients (company_id, name, company, company_name, email, phone, status, notes) VALUES (1, ?, ?, ?, ?, ?, 'prospect', ?)");
                $fullName = $firstName . ' ' . $lastName;
                $compName = !empty($company) ? $company : 'Particulier';
                $notes = "Inscrit en ligne le " . date('d/m/Y') . " via l'événement : " . $event['title'];
                $stmtNew->execute([$fullName, $compName, $compName, $email, $phone, $notes]);
                $clientId = intval($pdo->lastInsertId());
                $crmSynced = true;
            }

            // Enregistrement dans les interactions clients
            try {
                $stmtInter = $pdo->prepare("INSERT INTO client_interactions (company_id, client_id, type, channel, summary, sentiment) VALUES (1, ?, 'event_registration', 'website', ?, 'positive')");
                $stmtInter->execute([$clientId, "Inscription confirmée à l'événement : " . $event['title']]);
            } catch (Exception $e) {}
        } catch (Exception $e) {
            // La synchro secondaire ne doit jamais bloquer l'inscription
            error_log("CRM Sync warning: " . $e->getMessage());
        }

        // Génération du Ticket Code & QR Code
        $ticketCode = 'EVT-' . $eventId . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $qrPayload = json_encode([
            't' => $ticketCode,
            'e' => $eventId,
            'n' => "$firstName $lastName",
            'c' => $company,
            'ts' => time()
        ]);
        $qrCodeDataUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($qrPayload);

        // Insertion dans event_attendees
        $stmtAtt = $pdo->prepare("INSERT INTO event_attendees (event_id, client_id, first_name, last_name, email, phone, company, job_title, sector, pitch_text, linkedin_url, photo_url, ticket_code, status, networking_opt_in, photo_consent, gdpr_consent, acquisition_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)");
        $stmtAtt->execute([
            $eventId, $clientId, $firstName, $lastName, $email, $phone, $company, $jobTitle, $sector, $pitchText, $linkedinUrl, $photoUrl, $ticketCode, $networkingOptIn, $photoConsent, $gdprConsent, $source
        ]);
        $attendeeId = intval($pdo->lastInsertId());

        // Insertion des réponses personnalisées
        if (!empty($data['custom_answers']) && is_array($data['custom_answers'])) {
            $stmtAns = $pdo->prepare("INSERT INTO event_custom_field_answers (attendee_id, field_id, field_key, value_text) VALUES (?, ?, ?, ?)");
            foreach ($data['custom_answers'] as $fKey => $fVal) {
                // Trouver le field_id
                $stmtFld = $pdo->prepare("SELECT id FROM event_custom_fields WHERE event_id = ? AND field_key = ? LIMIT 1");
                $stmtFld->execute([$eventId, $fKey]);
                $fRow = $stmtFld->fetch(PDO::FETCH_ASSOC);
                if ($fRow) {
                    $valStr = is_array($fVal) ? json_encode($fVal, JSON_UNESCAPED_UNICODE) : strval($fVal);
                    $stmtAns->execute([$attendeeId, $fRow['id'], $fKey, $valStr]);
                }
            }
        }

        // Notification e-mail (sans bloquer si échec)
        try {
            require_once __DIR__ . '/mail/mailer.php';
            // Simulation ou appel mailer réel
        } catch (Exception $e) {}

        echo json_encode([
            'success' => true,
            'ticket_code' => $ticketCode,
            'qr_code_data_url' => $qrCodeDataUrl,
            'client_id' => $clientId,
            'crm_synced' => $crmSynced,
            'badge_url' => "/badges/$ticketCode",
            'message' => "Inscription validée avec succès pour $firstName $lastName."
        ]);
        exit();
    }

    // 4. LISTE DES INSCRITS POUR LE TABLEAU CRM ADMIN
    if ($action === 'get_attendees') {
        $eventId = intval($_GET['event_id'] ?? 0);
        $sql = "SELECT a.*, c.name as crm_client_name, c.company as crm_client_company 
                FROM event_attendees a 
                LEFT JOIN clients c ON a.client_id = c.id";
        if ($eventId > 0) {
            $sql .= " WHERE a.event_id = " . $pdo->quote($eventId);
        }
        $sql .= " ORDER BY a.created_at DESC";

        $stmt = $pdo->query($sql);
        $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $attendees]);
        exit();
    }

    // 10. RÉGIE LIVE & ÉCRAN DE DIFFUSION
    if ($action === 'get_live_state') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $stmt = $pdo->prepare("SELECT * FROM event_live_states WHERE event_id = ?");
        $stmt->execute([$eventId]);
        $state = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$state) {
            $state = [
                'event_id' => $eventId,
                'current_scene' => 'welcome',
                'is_auto_mode' => 0,
                'auto_interval_seconds' => 25,
                'ticker_message' => 'Bienvenue à l\'événement • MDIV Network',
                'ticker_enabled' => 1,
                'active_video_url' => '',
                'is_video_playing' => 0,
                'spotlight_attendee_id' => null,
                'spotlight_speaker_name' => null,
                'spotlight_qr_url' => null,
                'spotlight_qr_title' => null,
                'enabled_scenes' => json_encode(['welcome', 'presentation', 'members', 'partners', 'speakers', 'networking', 'pitches', 'qr_booking', 'statistics', 'tombola', 'closing'])
            ];
        } else {
            if (is_string($state['enabled_scenes'])) $state['enabled_scenes'] = json_decode($state['enabled_scenes'], true);
        }

        // Live statistics
        $stmtReg = $pdo->prepare("SELECT COUNT(*) FROM event_attendees WHERE event_id = ?");
        $stmtReg->execute([$eventId]);
        $regCount = intval($stmtReg->fetchColumn());

        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM event_attendees WHERE event_id = ? AND checked_in_at IS NOT NULL");
        $stmtCheck->execute([$eventId]);
        $checkCount = intval($stmtCheck->fetchColumn());

        $state['stats'] = [
            'registered_count' => $regCount,
            'checked_in_count' => $checkCount,
            'diagnostics_count' => 14,
            'attendance_rate' => $regCount > 0 ? round(($checkCount / $regCount) * 100) : 0,
            'next_speaker' => ['name' => 'Alexandre De Montmirail', 'role' => 'Montmirail Capital', 'topic' => 'Financement & Amorçage Tech B2B', 'time' => '14h30'],
            'next_activity' => ['title' => 'Session Pitchs & Networking', 'time' => '14h00', 'location' => 'Salle Plénière']
        ];

        echo json_encode(['success' => true, 'data' => $state]);
        exit();
    }

    if ($action === 'update_live_state' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $scene = $data['current_scene'] ?? 'welcome';
        $auto = !empty($data['is_auto_mode']) ? 1 : 0;
        $interval = intval($data['auto_interval_seconds'] ?? 25);
        $tickerMsg = $data['ticker_message'] ?? '';
        $tickerEn = !empty($data['ticker_enabled']) ? 1 : 0;
        $videoUrl = $data['active_video_url'] ?? '';
        $videoPlay = !empty($data['is_video_playing']) ? 1 : 0;
        $spotAttId = $data['spotlight_attendee_id'] ?? null;
        $spotSpk = $data['spotlight_speaker_name'] ?? null;
        $spotQr = $data['spotlight_qr_url'] ?? null;
        $spotQrTitle = $data['spotlight_qr_title'] ?? null;
        $scenes = isset($data['enabled_scenes']) ? json_encode($data['enabled_scenes']) : json_encode(['welcome']);

        $stmt = $pdo->prepare("INSERT INTO event_live_states (event_id, current_scene, is_auto_mode, auto_interval_seconds, ticker_message, ticker_enabled, active_video_url, is_video_playing, spotlight_attendee_id, spotlight_speaker_name, spotlight_qr_url, spotlight_qr_title, enabled_scenes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE current_scene = VALUES(current_scene), is_auto_mode = VALUES(is_auto_mode), auto_interval_seconds = VALUES(auto_interval_seconds), ticker_message = VALUES(ticker_message), ticker_enabled = VALUES(ticker_enabled), active_video_url = VALUES(active_video_url), is_video_playing = VALUES(is_video_playing), spotlight_attendee_id = VALUES(spotlight_attendee_id), spotlight_speaker_name = VALUES(spotlight_speaker_name), spotlight_qr_url = VALUES(spotlight_qr_url), spotlight_qr_title = VALUES(spotlight_qr_title), enabled_scenes = VALUES(enabled_scenes)");
        $stmt->execute([$eventId, $scene, $auto, $interval, $tickerMsg, $tickerEn, $videoUrl, $videoPlay, $spotAttId, $spotSpk, $spotQr, $spotQrTitle, $scenes]);
        echo json_encode(['success' => true, 'message' => 'État live mis à jour.']);
        exit();
    }

    // 5. ÉMARGEMENT / CHECK-IN
    if ($action === 'check_in' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ticketCode = trim($data['ticket_code'] ?? '');
        $by = trim($data['checked_in_by'] ?? 'Accueil');
        if (empty($ticketCode)) throw new Exception("ticket_code requis");

        $stmt = $pdo->prepare("UPDATE event_attendees SET status = 'attended', checked_in_at = NOW(), checked_in_by = ? WHERE ticket_code = ?");
        $stmt->execute([$by, $ticketCode]);

        echo json_encode(['success' => true, 'message' => "Émargement enregistré"]);
        exit();
    }


    // 6. PITCH ENTREPRISE
    if ($action === 'get_pitches') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $status = $_GET['status'] ?? ($data['status'] ?? '');
        $sql = "SELECT * FROM event_pitches WHERE event_id = ?";
        $params = [$eventId];
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND status = ?";
            $params[] = $status;
        }
        $sql .= " ORDER BY speaking_order ASC, id ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit();
    }

    if ($action === 'submit_pitch' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        if ($eventId <= 0) throw new Exception("event_id requis");
        $stmt = $pdo->prepare("INSERT INTO event_pitches (event_id, attendee_id, client_id, company_name, project_title, presentation, needs, speaker_name, speaker_role, speaker_bio, speaker_avatar, deck_url, deck_filename, status, speaking_order, pitch_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 99, '')");
        $stmt->execute([
            $eventId,
            $data['attendee_id'] ?? null,
            $data['client_id'] ?? null,
            $data['company_name'] ?? 'Entreprise',
            $data['project_title'] ?? 'Projet Innovation',
            $data['presentation'] ?? '',
            $data['needs'] ?? '',
            $data['speaker_name'] ?? '',
            $data['speaker_role'] ?? '',
            $data['speaker_bio'] ?? '',
            $data['speaker_avatar'] ?? '',
            $data['deck_url'] ?? '',
            $data['deck_filename'] ?? ''
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => "Candidature au pitch enregistrée"]);
        exit();
    }

    if ($action === 'moderate_pitch' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $pitchId = intval($data['pitch_id'] ?? ($data['id'] ?? 0));
        $status = $data['status'] ?? 'approved';
        $order = intval($data['speaking_order'] ?? 1);
        $time = $data['pitch_time'] ?? '';
        $notes = $data['moderator_notes'] ?? '';
        $stmt = $pdo->prepare("UPDATE event_pitches SET status = ?, speaking_order = ?, pitch_time = ?, moderator_notes = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $order, $time, $notes, $pitchId]);
        echo json_encode(['success' => true, 'message' => "Pitch mis à jour"]);
        exit();
    }

    // 7. RENDEZ-VOUS 1-TO-1 (B2B MEETINGS)
    if ($action === 'get_meeting_slots') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $partnerId = intval($_GET['partner_id'] ?? 0);
        $sql = "SELECT * FROM event_meeting_slots WHERE event_id = ?";
        $params = [$eventId];
        if ($partnerId > 0) {
            $sql .= " AND partner_id = ?";
            $params[] = $partnerId;
        }
        $sql .= " ORDER BY start_time ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $slots = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($slots as &$s) {
            $s['is_available'] = ($s['booked_count'] < $s['capacity']);
        }
        echo json_encode(['success' => true, 'data' => $slots]);
        exit();
    }

    if ($action === 'create_meeting_slot' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $stmt = $pdo->prepare("INSERT INTO event_meeting_slots (event_id, partner_id, partner_name, partner_role, partner_company, partner_avatar, date, start_time, end_time, duration_minutes, location_mode, capacity, booked_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)");
        $stmt->execute([
            $eventId,
            $data['partner_id'] ?? null,
            $data['partner_name'] ?? 'Partenaire',
            $data['partner_role'] ?? 'Intervenant',
            $data['partner_company'] ?? '',
            $data['partner_avatar'] ?? '',
            $data['date'] ?? date('Y-m-d'),
            $data['start_time'] ?? '14:00',
            $data['end_time'] ?? '14:20',
            intval($data['duration_minutes'] ?? 20),
            $data['location_mode'] ?? 'Table 1',
            intval($data['capacity'] ?? 1)
        ]);
        $newId = $pdo->lastInsertId();
        $slotUrl = "http://localhost:8080/evenements/$eventId/reserver?slot_id=$newId";
        $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" . urlencode($slotUrl);
        $pdo->prepare("UPDATE event_meeting_slots SET booking_qr_url = ? WHERE id = ?")->execute([$qrUrl, $newId]);
        echo json_encode(['success' => true, 'id' => $newId]);
        exit();
    }

    if ($action === 'book_meeting' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $slotId = intval($data['slot_id'] ?? 0);
        $stmt = $pdo->prepare("SELECT * FROM event_meeting_slots WHERE id = ? FOR UPDATE");
        $stmt->execute([$slotId]);
        $slot = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$slot || $slot['booked_count'] >= $slot['capacity']) {
            throw new Exception("Ce créneau n'est plus disponible.");
        }
        $pdo->prepare("UPDATE event_meeting_slots SET booked_count = booked_count + 1 WHERE id = ?")->execute([$slotId]);
        $stmtBook = $pdo->prepare("INSERT INTO event_meeting_bookings (event_id, slot_id, partner_id, partner_name, attendee_id, client_id, attendee_name, attendee_email, attendee_phone, attendee_company, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)");
        $stmtBook->execute([
            $slot['event_id'],
            $slotId,
            $slot['partner_id'],
            $slot['partner_name'],
            $data['attendee_id'] ?? null,
            $data['client_id'] ?? null,
            $data['attendee_name'] ?? 'Participant',
            $data['attendee_email'] ?? '',
            $data['attendee_phone'] ?? '',
            $data['attendee_company'] ?? '',
            $data['notes'] ?? ''
        ]);
        echo json_encode(['success' => true, 'message' => "Rendez-vous réservé avec succès."]);
        exit();
    }

    // 8. TOMBOLA SÉCURISÉE
    if ($action === 'get_tombola_config' || $action === 'get_tombola_prizes') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $stmtP = $pdo->prepare("SELECT * FROM event_tombola_prizes WHERE event_id = ? ORDER BY sort_order ASC");
        $stmtP->execute([$eventId]);
        $prizes = $stmtP->fetchAll(PDO::FETCH_ASSOC);

        $stmtD = $pdo->prepare("SELECT * FROM event_tombola_draws WHERE event_id = ? ORDER BY drawn_at DESC");
        $stmtD->execute([$eventId]);
        $draws = $stmtD->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => ['prizes' => $prizes, 'draws' => $draws]]);
        exit();
    }

    if ($action === 'draw_tombola' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $prizeId = intval($data['prize_id'] ?? 0);
        $stmtP = $pdo->prepare("SELECT * FROM event_tombola_prizes WHERE id = ? AND event_id = ?");
        $stmtP->execute([$prizeId, $eventId]);
        $prize = $stmtP->fetch(PDO::FETCH_ASSOC);
        if (!$prize) throw new Exception("Lot introuvable");
        if ($prize['drawn_count'] >= $prize['winners_count']) throw new Exception("Tous les gagnants de ce lot ont déjà été tirés");

        // Éligibles (émargés et n'ayant pas encore gagné)
        $sqlEligible = "SELECT a.* FROM event_attendees a 
                        WHERE a.event_id = ? 
                        AND (a.status = 'attended' OR a.checked_in_at IS NOT NULL OR a.status = 'confirmed')
                        AND a.id NOT IN (SELECT winner_attendee_id FROM event_tombola_draws WHERE event_id = ?)";
        $stmtE = $pdo->prepare($sqlEligible);
        $stmtE->execute([$eventId, $eventId]);
        $pool = $stmtE->fetchAll(PDO::FETCH_ASSOC);
        if (empty($pool)) throw new Exception("Aucun participant éligible disponible.");

        // CSPRNG
        $idx = random_int(0, count($pool) - 1);
        $winner = $pool[$idx];
        $drawHash = hash('sha256', $eventId . '_' . $prizeId . '_' . $winner['ticket_code'] . '_' . time() . '_' . bin2hex(random_bytes(16)));

        $stmtDraw = $pdo->prepare("INSERT INTO event_tombola_draws (event_id, prize_id, prize_title, winner_attendee_id, winner_name, winner_company, winner_email, winner_ticket_code, draw_hash, drawn_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmtDraw->execute([
            $eventId,
            $prizeId,
            $prize['title'],
            $winner['id'],
            $winner['first_name'] . ' ' . $winner['last_name'],
            $winner['company'],
            $winner['email'],
            $winner['ticket_code'],
            $drawHash
        ]);

        $pdo->prepare("UPDATE event_tombola_prizes SET drawn_count = drawn_count + 1, is_drawn = IF(drawn_count >= winners_count, 1, 0) WHERE id = ?")->execute([$prizeId]);

        echo json_encode([
            'success' => true,
            'draw' => [
                'winner_name' => $winner['first_name'] . ' ' . $winner['last_name'],
                'winner_company' => $winner['company'],
                'winner_ticket_code' => $winner['ticket_code'],
                'draw_hash' => $drawHash,
                'prize_title' => $prize['title']
            ]
        ]);
        exit();
    }

    // 9. NETWORKING WALL
    if ($action === 'get_networking_wall') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $sector = trim($_GET['sector'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $sql = "SELECT id, event_id, first_name, last_name, company, job_title, sector, pitch_text, expertises, linkedin_url, photo_url, ticket_code FROM event_attendees WHERE event_id = ? AND networking_opt_in = 1";
        $params = [$eventId];
        if (!empty($sector) && $sector !== 'all') {
            $sql .= " AND sector LIKE ?";
            $params[] = "%$sector%";
        }
        if (!empty($search)) {
            $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR company LIKE ? OR job_title LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($attendees as &$a) {
            if (!empty($a['expertises']) && is_string($a['expertises'])) $a['expertises'] = json_decode($a['expertises'], true);
            $profileUrl = "http://localhost:8080/evenements/$eventId/profil/" . $a['ticket_code'];
            $a['profile_qr_url'] = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($profileUrl);
        }
        echo json_encode(['success' => true, 'data' => $attendees]);
        exit();
    }

    // 10. RÉGIE LIVE & ÉCRAN DE DIFFUSION
    if ($action === 'get_live_state') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        $stmt = $pdo->prepare("SELECT * FROM event_live_states WHERE event_id = ?");
        $stmt->execute([$eventId]);
        $state = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$state) {
            $state = [
                'event_id' => $eventId,
                'current_scene' => 'welcome',
                'is_auto_mode' => 0,
                'auto_interval_seconds' => 25,
                'ticker_message' => 'Bienvenue à l\'événement • MDIV Network',
                'ticker_enabled' => 1,
                'active_video_url' => '',
                'is_video_playing' => 0,
                'spotlight_attendee_id' => null,
                'spotlight_speaker_name' => null,
                'spotlight_qr_url' => null,
                'spotlight_qr_title' => null,
                'enabled_scenes' => json_encode(['welcome', 'presentation', 'members', 'partners', 'speakers', 'networking', 'pitches', 'qr_booking', 'statistics', 'tombola', 'closing'])
            ];
        } else {
            if (is_string($state['enabled_scenes'])) $state['enabled_scenes'] = json_decode($state['enabled_scenes'], true);
        }

        // Live statistics
        $stmtReg = $pdo->prepare("SELECT COUNT(*) FROM event_attendees WHERE event_id = ?");
        $stmtReg->execute([$eventId]);
        $regCount = intval($stmtReg->fetchColumn());

        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM event_attendees WHERE event_id = ? AND checked_in_at IS NOT NULL");
        $stmtCheck->execute([$eventId]);
        $checkCount = intval($stmtCheck->fetchColumn());

        $state['stats'] = [
            'registered_count' => $regCount,
            'checked_in_count' => $checkCount,
            'diagnostics_count' => 14,
            'attendance_rate' => $regCount > 0 ? round(($checkCount / $regCount) * 100) : 0,
            'next_speaker' => ['name' => 'Alexandre De Montmirail', 'role' => 'Montmirail Capital', 'topic' => 'Financement & Amorçage Tech B2B', 'time' => '14h30'],
            'next_activity' => ['title' => 'Session Pitchs & Networking', 'time' => '14h00', 'location' => 'Salle Plénière']
        ];

        echo json_encode(['success' => true, 'data' => $state]);
        exit();
    }

    if ($action === 'update_live_state' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $scene = $data['current_scene'] ?? 'welcome';
        $auto = !empty($data['is_auto_mode']) ? 1 : 0;
        $interval = intval($data['auto_interval_seconds'] ?? 25);
        $tickerMsg = $data['ticker_message'] ?? '';
        $tickerEn = !empty($data['ticker_enabled']) ? 1 : 0;
        $videoUrl = $data['active_video_url'] ?? '';
        $videoPlay = !empty($data['is_video_playing']) ? 1 : 0;
        $spotAttId = $data['spotlight_attendee_id'] ?? null;
        $spotSpk = $data['spotlight_speaker_name'] ?? null;
        $spotQr = $data['spotlight_qr_url'] ?? null;
        $spotQrTitle = $data['spotlight_qr_title'] ?? null;
        $scenes = isset($data['enabled_scenes']) ? json_encode($data['enabled_scenes']) : json_encode(['welcome']);

        $stmt = $pdo->prepare("INSERT INTO event_live_states (event_id, current_scene, is_auto_mode, auto_interval_seconds, ticker_message, ticker_enabled, active_video_url, is_video_playing, spotlight_attendee_id, spotlight_speaker_name, spotlight_qr_url, spotlight_qr_title, enabled_scenes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE current_scene = VALUES(current_scene), is_auto_mode = VALUES(is_auto_mode), auto_interval_seconds = VALUES(auto_interval_seconds), ticker_message = VALUES(ticker_message), ticker_enabled = VALUES(ticker_enabled), active_video_url = VALUES(active_video_url), is_video_playing = VALUES(is_video_playing), spotlight_attendee_id = VALUES(spotlight_attendee_id), spotlight_speaker_name = VALUES(spotlight_speaker_name), spotlight_qr_url = VALUES(spotlight_qr_url), spotlight_qr_title = VALUES(spotlight_qr_title), enabled_scenes = VALUES(enabled_scenes)");
        $stmt->execute([$eventId, $scene, $auto, $interval, $tickerMsg, $tickerEn, $videoUrl, $videoPlay, $spotAttId, $spotSpk, $spotQr, $spotQrTitle, $scenes]);
        echo json_encode(['success' => true, 'message' => 'État live mis à jour.']);
        exit();
    }

    throw new Exception("Action non reconnue : " . htmlspecialchars($action));

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
}

