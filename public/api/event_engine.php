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
function ensure_event_engine_tables(PDO $pdo, $force = false) {
    if (!$force) {
        try {
            $test = $pdo->query("SELECT 1 FROM `event_attendees` LIMIT 1");
            if ($test) return; // Tables déjà créées
        } catch (Throwable $e) {
            // Continuer pour créer les tables
        }
    }

    // 1. Colonnes sécurisées sur la table events (évite toute erreur de syntaxe IF NOT EXISTS)
    try {
        $existingCols = [];
        $colStmt = $pdo->query("SHOW COLUMNS FROM `events`");
        if ($colStmt) {
            while ($c = $colStmt->fetch(PDO::FETCH_ASSOC)) {
                $existingCols[] = strtolower($c['Field']);
            }
        }
        if (!in_array('features_config', $existingCols)) {
            try { $pdo->exec("ALTER TABLE `events` ADD `features_config` LONGTEXT DEFAULT NULL"); } catch (Throwable $t) {}
        }
        if (!in_array('max_attendees', $existingCols)) {
            try { $pdo->exec("ALTER TABLE `events` ADD `max_attendees` INT DEFAULT NULL"); } catch (Throwable $t) {}
        }
        if (!in_array('is_registration_open', $existingCols)) {
            try { $pdo->exec("ALTER TABLE `events` ADD `is_registration_open` TINYINT(1) NOT NULL DEFAULT 1"); } catch (Throwable $t) {}
        }
    } catch (Throwable $colErr) {}

    // 2. Table event_custom_fields
    try {
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
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_evt_fld_order` (`event_id`, `sort_order`, `is_active`),
            INDEX `idx_evt_fld_key` (`event_id`, `field_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {
        error_log("event_custom_fields creation: " . $e->getMessage());
    }

    // 3. Table event_attendees (DATETIME universel compatible MySQL 5.5 à 8.0+)
    try {
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
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NULL,
            INDEX `idx_att_evt_status` (`event_id`, `status`),
            INDEX `idx_att_email` (`email`),
            INDEX `idx_att_ticket` (`ticket_code`),
            INDEX `idx_att_client` (`client_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {
        error_log("event_attendees creation: " . $e->getMessage());
    }

    // 4. Table event_custom_field_answers
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `event_custom_field_answers` (
            `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
            `attendee_id` INT NOT NULL,
            `field_id` INT NOT NULL,
            `field_key` VARCHAR(64) NOT NULL,
            `value_text` TEXT NULL,
            `value_file_url` VARCHAR(500) NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_ans_att_fld` (`attendee_id`, `field_id`),
            INDEX `idx_ans_fld` (`field_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {
        error_log("event_custom_field_answers creation: " . $e->getMessage());
    }

    // 5. Table event_pitches
    try {
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
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NULL,
            INDEX `idx_pitch_evt_status` (`event_id`, `status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {
        error_log("event_pitches creation: " . $e->getMessage());
    }

    // 6. Tables B2B meeting slots & bookings
    try {
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
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_slot_evt_partner` (`event_id`, `partner_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    try {
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
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `cancelled_at` DATETIME NULL,
            INDEX `idx_mb_slot` (`slot_id`),
            INDEX `idx_mb_evt` (`event_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    // 7. Tables Tombola
    try {
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
            `value` VARCHAR(100) NULL DEFAULT NULL,
            `draw_rank` VARCHAR(100) NULL DEFAULT '1er Prix',
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `images` TEXT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // Migration progressive des colonnes si la table existait déjà
        $tombolaCols = [
            'value' => 'VARCHAR(100) NULL DEFAULT NULL',
            'draw_rank' => "VARCHAR(100) NULL DEFAULT '1er Prix'",
            'is_active' => 'TINYINT(1) NOT NULL DEFAULT 1',
            'images' => 'TEXT NULL'
        ];
        foreach ($tombolaCols as $col => $def) {
            try { $pdo->exec("ALTER TABLE `event_tombola_prizes` ADD COLUMN `$col` $def"); } catch (Throwable $t) {}
        }
    } catch (Throwable $e) {}

    try {
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
            `drawn_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_draw_evt_prize` (`event_id`, `prize_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}

    // 8. Table Régie & Diffusion Live
    try {
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
            `updated_at` DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Throwable $e) {}
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
            $f['is_required'] = ($f['is_required'] == 1 || $f['is_required'] === true || $f['is_required'] === '1' || $f['is_required'] === 'true');
            $f['is_active'] = ($f['is_active'] == 1 || $f['is_active'] === true || $f['is_active'] === '1' || $f['is_active'] === 'true');
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
            $f['is_required'] = ($f['is_required'] == 1 || $f['is_required'] === true || $f['is_required'] === '1' || $f['is_required'] === 'true');
            $f['is_active'] = ($f['is_active'] == 1 || $f['is_active'] === true || $f['is_active'] === '1' || $f['is_active'] === 'true');
            if (!empty($f['options']) && is_string($f['options'])) $f['options'] = json_decode($f['options'], true);
            if (!empty($f['validation_rules']) && is_string($f['validation_rules'])) $f['validation_rules'] = json_decode($f['validation_rules'], true);
            if (!empty($f['conditional_logic']) && is_string($f['conditional_logic'])) $f['conditional_logic'] = json_decode($f['conditional_logic'], true);
        }
        echo json_encode(['success' => true, 'data' => $fields]);
        exit();
    }

    if ($action === 'save_custom_field' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $f = isset($data['field']) && is_array($data['field']) ? array_merge($data, $data['field']) : $data;
        $eventId = intval($f['event_id'] ?? ($data['event_id'] ?? 0));
        if ($eventId <= 0) throw new Exception("event_id requis");

        $fieldId = isset($f['id']) ? intval($f['id']) : (isset($f['field_id']) ? intval($f['field_id']) : 0);
        $fieldKey = trim($f['field_key'] ?? ('custom_' . time()));
        $label = trim($f['label'] ?? 'Nouvelle question');
        $desc = trim($f['description'] ?? '');
        $fieldType = trim($f['field_type'] ?? 'text');
        $rawReq = $f['is_required'] ?? false;
        $isRequired = ($rawReq === true || $rawReq === 1 || $rawReq === '1' || $rawReq === 'true') ? 1 : 0;
        $defVal = trim($f['default_value'] ?? '');
        $placeholder = trim($f['placeholder'] ?? '');
        $options = isset($f['options']) ? (is_string($f['options']) ? $f['options'] : json_encode($f['options'], JSON_UNESCAPED_UNICODE)) : null;
        $validation = isset($f['validation_rules']) ? (is_string($f['validation_rules']) ? $f['validation_rules'] : json_encode($f['validation_rules'], JSON_UNESCAPED_UNICODE)) : null;
        $cond = isset($f['conditional_logic']) ? (is_string($f['conditional_logic']) ? $f['conditional_logic'] : json_encode($f['conditional_logic'], JSON_UNESCAPED_UNICODE)) : null;
        $sortOrder = intval($f['sort_order'] ?? 1);
        $rawAct = $f['is_active'] ?? true;
        $isActive = ($rawAct === false || $rawAct === 0 || $rawAct === '0' || $rawAct === 'false') ? 0 : 1;

        if ($fieldId > 0) {
            $stmt = $pdo->prepare("UPDATE event_custom_fields SET field_key=?, label=?, description=?, field_type=?, is_required=?, default_value=?, placeholder=?, options=?, validation_rules=?, conditional_logic=?, sort_order=?, is_active=? WHERE id=? AND event_id=?");
            $stmt->execute([$fieldKey, $label, $desc, $fieldType, $isRequired, $defVal, $placeholder, $options, $validation, $cond, $sortOrder, $isActive, $fieldId, $eventId]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO event_custom_fields (event_id, field_key, label, description, field_type, is_required, default_value, placeholder, options, validation_rules, conditional_logic, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$eventId, $fieldKey, $label, $desc, $fieldType, $isRequired, $defVal, $placeholder, $options, $validation, $cond, $sortOrder, $isActive]);
            $fieldId = intval($pdo->lastInsertId());
        }

        echo json_encode(['success' => true, 'id' => $fieldId, 'message' => "Champ personnalisé enregistré"]);
        exit();
    }

    if ($action === 'delete_custom_field' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $fieldId = intval($data['id'] ?? ($data['field_id'] ?? ($_GET['id'] ?? 0)));
        $eventId = intval($data['event_id'] ?? ($_GET['event_id'] ?? 0));
        if ($fieldId <= 0) throw new Exception("ID de champ requis");

        // Supprimer d'abord les réponses associées
        $pdo->prepare("DELETE FROM event_custom_field_answers WHERE field_id = ?")->execute([$fieldId]);

        // Supprimer la question
        if ($eventId > 0) {
            $pdo->prepare("DELETE FROM event_custom_fields WHERE id = ? AND event_id = ?")->execute([$fieldId, $eventId]);
        } else {
            $pdo->prepare("DELETE FROM event_custom_fields WHERE id = ?")->execute([$fieldId]);
        }

        echo json_encode(['success' => true, 'message' => "Question supprimée avec succès"]);
        exit();
    }

    if ($action === 'duplicate_custom_field' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $fieldId = intval($data['field_id'] ?? ($data['id'] ?? 0));
        if ($fieldId <= 0) throw new Exception("field_id requis");
        $stmt = $pdo->prepare("SELECT * FROM event_custom_fields WHERE id = ?");
        $stmt->execute([$fieldId]);
        $orig = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$orig) throw new Exception("Question source introuvable");

        $newKey = $orig['field_key'] . '_copie_' . substr(bin2hex(random_bytes(2)), 0, 4);
        $newLabel = $orig['label'] . ' (Copie)';
        $newOrder = intval($orig['sort_order']) + 1;

        $stmtIns = $pdo->prepare("INSERT INTO event_custom_fields (event_id, field_key, label, description, field_type, is_required, default_value, placeholder, options, validation_rules, conditional_logic, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtIns->execute([$orig['event_id'], $newKey, $newLabel, $orig['description'], $orig['field_type'], $orig['is_required'], $orig['default_value'], $orig['placeholder'], $orig['options'], $orig['validation_rules'], $orig['conditional_logic'], $newOrder, 1]);
        $newId = intval($pdo->lastInsertId());
        echo json_encode(['success' => true, 'id' => $newId, 'message' => "Question dupliquée"]);
        exit();
    }

    if ($action === 'reorder_custom_fields' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $orderedIds = $data['ordered_ids'] ?? [];
        if (is_array($orderedIds)) {
            $stmt = $pdo->prepare("UPDATE event_custom_fields SET sort_order = ? WHERE id = ?");
            foreach ($orderedIds as $idx => $fId) {
                $stmt->execute([$idx + 1, intval($fId)]);
            }
        }
        echo json_encode(['success' => true, 'message' => "Ordre mis à jour"]);
        exit();
    }

    if ($action === 'duplicate_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? ($data['id'] ?? 0));
        if ($eventId <= 0) throw new Exception("event_id requis");
        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$eventId]);
        $orig = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$orig) throw new Exception("Événement introuvable");

        $newTitle = $orig['title'] . ' (Copie)';
        $stmtIns = $pdo->prepare("INSERT INTO events (title, title_en, date, location, description, description_en, image_url, type, price, billetterie_url, program, status, features_config, max_attendees, is_registration_open) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, ?)");
        $stmtIns->execute([
            $newTitle, $orig['title_en'], $orig['date'], $orig['location'], $orig['description'], $orig['description_en'], $orig['image_url'], $orig['type'], $orig['price'], $orig['billetterie_url'], $orig['program'], $orig['features_config'], $orig['max_attendees'], $orig['is_registration_open']
        ]);
        $newEventId = intval($pdo->lastInsertId());

        // Dupliquer les questions personnalisées
        $stmtF = $pdo->prepare("SELECT * FROM event_custom_fields WHERE event_id = ?");
        $stmtF->execute([$eventId]);
        $origFields = $stmtF->fetchAll(PDO::FETCH_ASSOC);
        $stmtInsF = $pdo->prepare("INSERT INTO event_custom_fields (event_id, field_key, label, description, field_type, is_required, default_value, placeholder, options, validation_rules, conditional_logic, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($origFields as $of) {
            $stmtInsF->execute([$newEventId, $of['field_key'], $of['label'], $of['description'], $of['field_type'], $of['is_required'], $of['default_value'], $of['placeholder'], $of['options'], $of['validation_rules'], $of['conditional_logic'], $of['sort_order'], $of['is_active']]);
        }

        echo json_encode(['success' => true, 'id' => $newEventId, 'message' => "Événement dupliqué avec succès"]);
        exit();
    }

    if ($action === 'archive_event' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? ($data['id'] ?? 0));
        if ($eventId <= 0) throw new Exception("event_id requis");
        $stmt = $pdo->prepare("SELECT status FROM events WHERE id = ?");
        $stmt->execute([$eventId]);
        $cur = $stmt->fetchColumn();
        $newStatus = ($cur === 'past' || $cur === 'archived') ? 'upcoming' : 'past';
        $pdo->prepare("UPDATE events SET status = ? WHERE id = ?")->execute([$newStatus, $eventId]);
        echo json_encode(['success' => true, 'status' => $newStatus, 'message' => "Statut mis à jour"]);
        exit();
    }

    // 3. INSCRIPTION PUBLIQUE ET SYNCHRONISATION CRM SANS DOUBLON
    if ($action === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        ensure_event_engine_tables($pdo);
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

        // Génération du Ticket Code & QR Code riche et structuré
        $ticketCode = 'EVT-' . $eventId . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $qrPayload = json_encode([
            'system' => 'MDIV_EVENT_ENGINE',
            'version' => '2.0',
            'ticket' => [
                'code' => $ticketCode,
                'issued_at' => date('c'),
                'event_id' => $eventId,
                'event_title' => $event['title']
            ],
            'attendee' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'company' => $company,
                'job_title' => $jobTitle,
                'client_id' => $clientId
            ],
            'checkin' => [
                'status' => 'valid',
                'security_hash' => hash('sha256', "$ticketCode|$eventId|$email")
            ]
        ], JSON_UNESCAPED_UNICODE);
        $qrCodeDataUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($qrPayload);

        // Insertion dans event_attendees
        $stmtAtt = $pdo->prepare("INSERT INTO event_attendees (event_id, client_id, first_name, last_name, email, phone, company, job_title, sector, pitch_text, linkedin_url, photo_url, ticket_code, status, networking_opt_in, photo_consent, gdpr_consent, acquisition_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)");
        $stmtAtt->execute([
            $eventId, $clientId, $firstName, $lastName, $email, $phone, $company, $jobTitle, $sector, $pitchText, $linkedinUrl, $photoUrl, $ticketCode, $networkingOptIn, $photoConsent, $gdprConsent, $source
        ]);
        $attendeeId = intval($pdo->lastInsertId());

        // Synchronisation de la photo dans la table CRM clients
        if (!empty($photoUrl) && !empty($clientId)) {
            try {
                $pdo->prepare("UPDATE clients SET photo_url = ? WHERE id = ?")->execute([$photoUrl, $clientId]);
            } catch (Exception $e) {}
        }

        // Auto-alimentation du module Pitch si pitch_text est renseigné
        if (!empty($pitchText)) {
            try {
                $stmtPitch = $pdo->prepare("INSERT INTO event_pitches (event_id, attendee_id, client_id, company_name, project_title, presentation, speaker_name, speaker_role, speaker_avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
                $stmtPitch->execute([
                    $eventId,
                    $attendeeId,
                    $clientId,
                    !empty($company) ? $company : "$firstName $lastName",
                    "Pitch Entreprise - " . (!empty($company) ? $company : "$firstName $lastName"),
                    $pitchText,
                    "$firstName $lastName",
                    !empty($jobTitle) ? $jobTitle : "Dirigeant",
                    $photoUrl
                ]);
            } catch (Exception $e) {
                error_log("Pitch auto-creation notice: " . $e->getMessage());
            }
        }

        // Insertion des réponses personnalisées
        if (!empty($data['custom_answers']) && is_array($data['custom_answers'])) {
            $stmtAns = $pdo->prepare("INSERT INTO event_custom_field_answers (attendee_id, field_id, field_key, value_text) VALUES (?, ?, ?, ?)");
            foreach ($data['custom_answers'] as $fKey => $fVal) {
                $numId = is_numeric($fKey) ? intval($fKey) : 0;
                $stmtFld = $pdo->prepare("SELECT id, field_key, label FROM event_custom_fields WHERE event_id = ? AND (field_key = ? OR id = ?) LIMIT 1");
                $stmtFld->execute([$eventId, $fKey, $numId]);
                $fRow = $stmtFld->fetch(PDO::FETCH_ASSOC);
                $fieldId = $fRow ? intval($fRow['id']) : 0;
                $canonKey = $fRow ? $fRow['field_key'] : strval($fKey);
                $valStr = is_array($fVal) ? json_encode($fVal, JSON_UNESCAPED_UNICODE) : strval($fVal);
                $stmtAns->execute([$attendeeId, $fieldId, $canonKey, $valStr]);
            }
        }

        // Envoi effectif de l'e-mail de confirmation
        try {
            $emailSubject = "Confirmation de votre inscription : " . $event['title'];
            $emailBody = "Bonjour $firstName $lastName,

"
                       . "Votre inscription à l'événement \"" . $event['title'] . "\" est bien confirmée !

"
                       . "DÉTAILS DE VOTRE PASS :
"
                       . "- Numéro de billet : $ticketCode
"
                       . "- Date : " . date('d/m/Y', strtotime($event['date'])) . "
"
                       . "- Lieu : " . ($event['location'] ?? 'Voir informations événement') . "

"
                       . "Présentez simplement votre badge numérique ou votre QR Code lors de votre arrivée à l'accueil.

"
                       . "Cordialement,
L'équipe d'organisation MDIV Network & BNE.";

            $headers = "From: MDIV Network <contact@mdiv-business.com>\r\n"
                     . "Reply-To: contact@mdiv-business.com\r\n"
                     . "Content-Type: text/plain; charset=UTF-8\r\n"
                     . "X-Mailer: PHP/" . phpversion();
            @mail($email, $emailSubject, $emailBody, $headers);
        } catch (Exception $e) {
            error_log("Confirmation email warning: " . $e->getMessage());
        }

        $attendeeObj = [
            'id' => $attendeeId,
            'event_id' => $eventId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'company' => $company,
            'job_title' => $jobTitle,
            'sector' => $sector,
            'photo_url' => $photoUrl,
            'ticket_code' => $ticketCode,
            'status' => 'confirmed'
        ];

        echo json_encode([
            'success' => true,
            'ticket_code' => $ticketCode,
            'attendee' => $attendeeObj,
            'qr_code_data_url' => $qrCodeDataUrl,
            'qr_payload' => json_decode($qrPayload, true),
            'client_id' => $clientId,
            'crm_synced' => $crmSynced,
            'badge_url' => "/badges/$ticketCode",
            'message' => "Votre inscription a bien été prise en compte."
        ]);
        exit();
    }

    // 4. LISTE DES INSCRITS POUR LE TABLEAU CRM ADMIN AVEC RÉPONSES & COMPTEURS DYNAMIQUES
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

        $registeredCount = count($attendees);
        $attendedCount = 0;
        $waitlistCount = 0;

        // Récupérer la liste des questions personnalisées pour cet événement (avec labels complets)
        $eventCustomFields = [];
        if ($eventId > 0) {
            $stmtF = $pdo->prepare("SELECT id, event_id, field_key, label, field_type, sort_order, options, is_required FROM event_custom_fields WHERE event_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC");
            $stmtF->execute([$eventId]);
            $eventCustomFields = $stmtF->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $stmtF = $pdo->query("SELECT id, event_id, field_key, label, field_type, sort_order, options, is_required FROM event_custom_fields WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
            $eventCustomFields = $stmtF->fetchAll(PDO::FETCH_ASSOC);
        }

        foreach ($attendees as &$att) {
            if ($att['status'] === 'attended') $attendedCount++;
            if ($att['status'] === 'cancelled' || $att['status'] === 'pending') $waitlistCount++;

            $stmtAns = $pdo->prepare("
                SELECT a.field_id, a.field_key, a.value_text, 
                       f.label, f.field_type, f.options, f.sort_order 
                FROM event_custom_field_answers a
                LEFT JOIN event_custom_fields f ON (a.field_id = f.id OR (a.field_key = f.field_key AND f.event_id = ?))
                WHERE a.attendee_id = ?
                ORDER BY COALESCE(f.sort_order, 999) ASC, a.id ASC
            ");
            $stmtAns->execute([$att['event_id'], $att['id']]);
            $ansRows = $stmtAns->fetchAll(PDO::FETCH_ASSOC);
            $cAnswers = [];
            $cDetails = [];
            foreach ($ansRows as $ar) {
                $dec = json_decode($ar['value_text'], true);
                $val = ($dec !== null) ? $dec : $ar['value_text'];
                $cAnswers[$ar['field_key']] = $val;
                $questionLabel = !empty($ar['label']) ? $ar['label'] : $ar['field_key'];
                $cDetails[] = [
                    'field_id' => intval($ar['field_id']),
                    'field_key' => $ar['field_key'],
                    'label' => $questionLabel,
                    'value' => $val,
                    'field_type' => $ar['field_type'] ?? 'text',
                    'options' => $ar['options'] ?? null
                ];
            }
            $att['custom_answers'] = $cAnswers;
            $att['custom_answers_details'] = $cDetails;
        }

        $absentCount = max(0, $registeredCount - $attendedCount - $waitlistCount);

        echo json_encode([
            'success' => true, 
            'data' => $attendees,
            'custom_fields' => $eventCustomFields,
            'stats' => [
                'total_registered' => $registeredCount,
                'total_attended' => $attendedCount,
                'total_absent' => $absentCount,
                'waitlist_count' => $waitlistCount,
                'attendance_rate' => $registeredCount > 0 ? round(($attendedCount / $registeredCount) * 100) : 0
            ]
        ]);
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

    
    // Action: Diagnostic et migration du schéma
    if ($action === 'init_schema' || $action === 'migrate_tables') {
        ensure_event_engine_tables($pdo, true);
        $tables = ['events', 'event_attendees', 'event_custom_fields', 'event_custom_field_answers', 'event_pitches', 'event_meeting_slots', 'event_meeting_bookings', 'event_tombola_prizes', 'event_tombola_draws', 'event_live_states'];
        $report = [];
        foreach ($tables as $t) {
            try {
                $check = $pdo->query("SELECT COUNT(*) FROM `$t`");
                $report[$t] = ['status' => 'ok', 'count' => intval($check->fetchColumn())];
            } catch (Throwable $err) {
                $report[$t] = ['status' => 'missing_or_error', 'error' => $err->getMessage()];
            }
        }
        echo json_encode(['success' => true, 'tables' => $report, 'message' => "Schéma vérifié et tables créées avec succès."]);
        exit();
    }

    // Action: Supprimer définitivement un participant (CRM & Tables événementielles)
    if ($action === 'delete_attendee' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $attendeeId = intval($data['attendee_id'] ?? ($data['id'] ?? ($_GET['attendee_id'] ?? ($_GET['id'] ?? 0))));
        if ($attendeeId <= 0) throw new Exception("attendee_id requis");

        // 1. Supprimer les réponses personnalisées
        try {
            $pdo->prepare("DELETE FROM event_custom_field_answers WHERE attendee_id = ?")->execute([$attendeeId]);
        } catch (Throwable $e) {}

        // 2. Supprimer les réservations de meeting B2B
        try {
            $pdo->prepare("DELETE FROM event_meeting_bookings WHERE attendee_id = ?")->execute([$attendeeId]);
        } catch (Throwable $e) {}

        // 3. Supprimer les candidatures pitch liées
        try {
            $pdo->prepare("DELETE FROM event_pitches WHERE attendee_id = ?")->execute([$attendeeId]);
        } catch (Throwable $e) {}

        // 4. Supprimer les tirages tombola liés
        try {
            $pdo->prepare("DELETE FROM event_tombola_draws WHERE winner_attendee_id = ?")->execute([$attendeeId]);
        } catch (Throwable $e) {}

        // 5. Supprimer l'inscription dans event_attendees
        $stmtDel = $pdo->prepare("DELETE FROM event_attendees WHERE id = ?");
        $stmtDel->execute([$attendeeId]);

        echo json_encode(['success' => true, 'message' => "Inscription supprimée avec succès du CRM."]);
        exit();
    }

    // 5. ÉMARGEMENT / CHECK-IN (SCANNER ACCUEIL SANDRA & BORNE ENTRÉE)
    if ($action === 'check_in' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $ticketCode = trim($data['ticket_code'] ?? '');
        $attendeeId = intval($data['attendee_id'] ?? 0);
        $by = trim($data['checked_in_by'] ?? 'Sandra / Accueil');

        if (empty($ticketCode) && $attendeeId <= 0) {
            throw new Exception("ticket_code ou attendee_id requis");
        }

        // Recherche du participant
        if (!empty($ticketCode)) {
            $stmt = $pdo->prepare("SELECT a.*, e.title as event_title, e.date as event_date, e.location as event_location FROM event_attendees a LEFT JOIN events e ON a.event_id = e.id WHERE a.ticket_code = ? LIMIT 1");
            $stmt->execute([$ticketCode]);
        } else {
            $stmt = $pdo->prepare("SELECT a.*, e.title as event_title, e.date as event_date, e.location as event_location FROM event_attendees a LEFT JOIN events e ON a.event_id = e.id WHERE a.id = ? LIMIT 1");
            $stmt->execute([$attendeeId]);
        }
        $attendee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$attendee) {
            echo json_encode([
                'success' => false,
                'error' => "Billet introuvable pour ce QR Code (" . htmlspecialchars($ticketCode) . ")"
            ]);
            exit();
        }

        $already = ($attendee['status'] === 'attended');

        if (!$already) {
            $upd = $pdo->prepare("UPDATE event_attendees SET status = 'attended', checked_in_at = NOW(), checked_in_by = ? WHERE id = ?");
            $upd->execute([$by, $attendee['id']]);
            $attendee['status'] = 'attended';
            $attendee['checked_in_at'] = date('Y-m-d H:i:s');
            $attendee['checked_in_by'] = $by;
        }

        echo json_encode([
            'success' => true,
            'already_checked_in' => $already,
            'message' => $already 
                ? "Participant déjà émargé le " . date('d/m/Y à H:i', strtotime($attendee['checked_in_at']))
                : "Émargement validé avec succès pour " . $attendee['first_name'] . " " . $attendee['last_name'],
            'attendee' => $attendee
        ]);
        exit();
    }

    // 5.b SELF CHECK-IN BORNE ENTRÉE (PAR SCAN QR KAKEMONO + EMAIL OU DÉBUT EMAIL)
    if ($action === 'self_check_in' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $emailQuery = trim(strtolower($data['email_query'] ?? ''));

        if ($eventId <= 0) throw new Exception("event_id requis");
        if (empty($emailQuery)) throw new Exception("Veuillez saisir votre email d'inscription ou votre identifiant");

        // Recherche tolérante : email exact OU préfixe (ex: jean.dupont pour jean.dupont@gmail.com)
        $cleanPrefix = explode('@', $emailQuery)[0];

        $stmt = $pdo->prepare("
            SELECT a.*, e.title as event_title, e.date as event_date, e.location as event_location 
            FROM event_attendees a
            JOIN events e ON a.event_id = e.id
            WHERE a.event_id = ? 
              AND (
                LOWER(a.email) = ?
                OR LOWER(a.email) LIKE ?
                OR LOWER(SUBSTRING_INDEX(a.email, '@', 1)) = ?
              )
            LIMIT 5
        ");
        $stmt->execute([$eventId, $emailQuery, $emailQuery . '%', $cleanPrefix]);
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($matches) === 0) {
            echo json_encode([
                'success' => false,
                'error' => "Aucune inscription trouvée avec cet identifiant pour cet événement. Veuillez vérifier votre saisie ou vous rapprocher de l'accueil Sandra."
            ]);
            exit();
        }

        if (count($matches) > 1) {
            echo json_encode([
                'success' => false,
                'ambiguous' => true,
                'error' => "Plusieurs participants correspondent à cette saisie. Veuillez saisir votre adresse email complète (avec le @)."
            ]);
            exit();
        }

        $attendee = $matches[0];
        $already = ($attendee['status'] === 'attended');

        if (!$already) {
            $upd = $pdo->prepare("UPDATE event_attendees SET status = 'attended', checked_in_at = NOW(), checked_in_by = 'Borne Entrée (Self-Checkin)' WHERE id = ?");
            $upd->execute([$attendee['id']]);
            $attendee['status'] = 'attended';
            $attendee['checked_in_at'] = date('Y-m-d H:i:s');
            $attendee['checked_in_by'] = 'Borne Entrée (Self-Checkin)';
        }

        echo json_encode([
            'success' => true,
            'already_checked_in' => $already,
            'message' => $already 
                ? "Vous avez déjà validé votre présence le " . date('d/m/Y à H:i', strtotime($attendee['checked_in_at'])) . ". Bienvenue !"
                : "Bienvenue " . $attendee['first_name'] . " " . $attendee['last_name'] . " ! Votre présence est confirmée.",
            'attendee' => $attendee
        ]);
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

        $attendeeEmail = strtolower(trim($data['attendee_email'] ?? ''));
        $attendeeId = !empty($data['attendee_id']) ? intval($data['attendee_id']) : null;
        $clientId = !empty($data['client_id']) ? intval($data['client_id']) : null;
        $attendeeCompany = trim($data['attendee_company'] ?? '');
        $attendeeName = trim($data['attendee_name'] ?? 'Participant');

        // Résolution automatique des relations pour éviter toute clé orpheline
        if (!empty($attendeeEmail)) {
            if (!$attendeeId) {
                $stmtAtt = $pdo->prepare("SELECT id, client_id, company, first_name, last_name FROM event_attendees WHERE event_id = ? AND LOWER(TRIM(email)) = ? LIMIT 1");
                $stmtAtt->execute([$slot['event_id'], $attendeeEmail]);
                $attRow = $stmtAtt->fetch(PDO::FETCH_ASSOC);
                if ($attRow) {
                    $attendeeId = intval($attRow['id']);
                    if (!$clientId && !empty($attRow['client_id'])) $clientId = intval($attRow['client_id']);
                    if (empty($attendeeCompany) && !empty($attRow['company'])) $attendeeCompany = $attRow['company'];
                    if ($attendeeName === 'Participant') $attendeeName = $attRow['first_name'] . ' ' . $attRow['last_name'];
                }
            }

            if (!$clientId) {
                $stmtCli = $pdo->prepare("SELECT id, company, name FROM clients WHERE LOWER(TRIM(email)) = ? LIMIT 1");
                $stmtCli->execute([$attendeeEmail]);
                $cliRow = $stmtCli->fetch(PDO::FETCH_ASSOC);
                if ($cliRow) {
                    $clientId = intval($cliRow['id']);
                    if (empty($attendeeCompany) && !empty($cliRow['company'])) $attendeeCompany = $cliRow['company'];
                }
            }
        }

        $pdo->prepare("UPDATE event_meeting_slots SET booked_count = booked_count + 1 WHERE id = ?")->execute([$slotId]);
        $stmtBook = $pdo->prepare("INSERT INTO event_meeting_bookings (event_id, slot_id, partner_id, partner_name, attendee_id, client_id, attendee_name, attendee_email, attendee_phone, attendee_company, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)");
        $stmtBook->execute([
            $slot['event_id'],
            $slotId,
            $slot['partner_id'],
            $slot['partner_name'],
            $attendeeId,
            $clientId,
            $attendeeName,
            $attendeeEmail,
            $data['attendee_phone'] ?? '',
            $attendeeCompany,
            $data['notes'] ?? ''
        ]);
        echo json_encode([
            'success' => true, 
            'attendee_id' => $attendeeId,
            'client_id' => $clientId,
            'message' => "Rendez-vous réservé avec succès."
        ]);
        exit();
    }

    // 8. TOMBOLA SÉCURISÉE & GESTION DES LOTS
    if ($action === 'get_tombola_config' || $action === 'get_tombola_prizes' || $action === 'get_tombola_history' || $action === 'get_public_tombola_prizes') {
        $eventId = intval($_GET['event_id'] ?? ($data['event_id'] ?? 0));
        
        if ($eventId > 0) {
            $stmtP = $pdo->prepare("SELECT * FROM event_tombola_prizes WHERE event_id = ? ORDER BY sort_order ASC, id ASC");
            $stmtP->execute([$eventId]);
            $prizes = $stmtP->fetchAll(PDO::FETCH_ASSOC);

            $stmtD = $pdo->prepare("SELECT * FROM event_tombola_draws WHERE event_id = ? ORDER BY drawn_at DESC");
            $stmtD->execute([$eventId]);
            $draws = $stmtD->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Vue globale (tous les lots actifs ou de tous les événements)
            $onlyActive = ($action === 'get_public_tombola_prizes') ? "WHERE p.is_active = 1" : "";
            $stmtP = $pdo->query("SELECT p.*, e.title as event_title, e.date as event_date 
                                  FROM event_tombola_prizes p 
                                  LEFT JOIN events e ON e.id = p.event_id 
                                  $onlyActive 
                                  ORDER BY p.sort_order ASC, p.id DESC");
            $prizes = $stmtP ? $stmtP->fetchAll(PDO::FETCH_ASSOC) : [];
            $draws = [];
        }

        foreach ($prizes as &$pz) {
            $pz['id'] = intval($pz['id']);
            $pz['event_id'] = intval($pz['event_id']);
            $pz['winners_count'] = intval($pz['winners_count'] ?? 1);
            $pz['quantity'] = $pz['winners_count'];
            $pz['sort_order'] = intval($pz['sort_order'] ?? 1);
            $pz['drawn_count'] = intval($pz['drawn_count'] ?? 0);
            $pz['is_drawn'] = (bool)($pz['is_drawn'] ?? 0);
            $pz['is_active'] = isset($pz['is_active']) ? intval($pz['is_active']) : 1;
            $pz['value'] = $pz['value'] ?? '';
            $pz['draw_rank'] = $pz['draw_rank'] ?? '1er Prix';
            if (isset($pz['images']) && is_string($pz['images']) && trim($pz['images']) !== '') {
                $decoded = json_decode($pz['images'], true);
                $pz['images'] = is_array($decoded) ? $decoded : ($pz['image_url'] ? [$pz['image_url']] : []);
            } else {
                $pz['images'] = !empty($pz['image_url']) ? [$pz['image_url']] : [];
            }
        }
        unset($pz);

        echo json_encode([
            'success' => true, 
            'prizes' => $prizes, 
            'draws' => $draws,
            'data' => [
                'prizes' => $prizes, 
                'draws' => $draws
            ]
        ]);
        exit();
    }

    // AJOUT / MODIFICATION D'UN LOT DE TOMBOLA
    if ($action === 'save_tombola_prize' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $prizeId = intval($data['id'] ?? ($data['prize_id'] ?? 0));
        $eventId = intval($data['event_id'] ?? 0);
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $sponsor = trim($data['sponsor'] ?? '');
        $value = trim($data['value'] ?? ($data['estimated_value'] ?? ''));
        $drawRank = trim($data['draw_rank'] ?? '1er Prix');
        $winnersCount = max(1, intval($data['winners_count'] ?? ($data['quantity'] ?? 1)));
        $sortOrder = intval($data['sort_order'] ?? 1);
        $isActive = isset($data['is_active']) ? (intval($data['is_active']) ? 1 : 0) : 1;
        $imageUrl = trim($data['image_url'] ?? '');

        // Gestion de la galerie d'images
        $images = [];
        if (!empty($data['images'])) {
            $images = is_array($data['images']) ? $data['images'] : json_decode($data['images'], true);
            if (!is_array($images)) $images = [];
        }
        if (empty($imageUrl) && !empty($images[0])) {
            $imageUrl = $images[0];
        } elseif (!empty($imageUrl) && !in_array($imageUrl, $images)) {
            array_unshift($images, $imageUrl);
        }
        $imagesJson = json_encode(array_values(array_unique(array_filter($images))));

        if ($eventId <= 0) throw new Exception("L'identifiant d'événement (event_id) est requis");
        if (empty($title)) throw new Exception("Le titre du lot est requis");

        if ($prizeId > 0) {
            // Modification
            $stmt = $pdo->prepare("UPDATE event_tombola_prizes SET 
                event_id = ?, 
                title = ?, 
                description = ?, 
                sponsor = ?, 
                value = ?, 
                draw_rank = ?, 
                image_url = ?, 
                images = ?, 
                winners_count = ?, 
                sort_order = ?, 
                is_active = ? 
                WHERE id = ?");
            $stmt->execute([
                $eventId,
                $title,
                $description,
                $sponsor,
                $value,
                $drawRank,
                $imageUrl,
                $imagesJson,
                $winnersCount,
                $sortOrder,
                $isActive,
                $prizeId
            ]);
        } else {
            // Nouveau lot
            if ($sortOrder <= 1) {
                $maxStmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM event_tombola_prizes WHERE event_id = ?");
                $maxStmt->execute([$eventId]);
                $sortOrder = intval($maxStmt->fetchColumn());
            }

            $stmt = $pdo->prepare("INSERT INTO event_tombola_prizes 
                (event_id, title, description, sponsor, value, draw_rank, image_url, images, winners_count, sort_order, is_active, drawn_count, is_drawn, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())");
            $stmt->execute([
                $eventId,
                $title,
                $description,
                $sponsor,
                $value,
                $drawRank,
                $imageUrl,
                $imagesJson,
                $winnersCount,
                $sortOrder,
                $isActive
            ]);
            $prizeId = intval($pdo->lastInsertId());
        }

        // Récupération de l'enregistrement frais
        $fetchStmt = $pdo->prepare("SELECT * FROM event_tombola_prizes WHERE id = ?");
        $fetchStmt->execute([$prizeId]);
        $savedPrize = $fetchStmt->fetch(PDO::FETCH_ASSOC);
        if ($savedPrize) {
            $savedPrize['id'] = intval($savedPrize['id']);
            $savedPrize['winners_count'] = intval($savedPrize['winners_count']);
            $savedPrize['quantity'] = $savedPrize['winners_count'];
            $savedPrize['is_active'] = intval($savedPrize['is_active'] ?? 1);
            $savedPrize['images'] = json_decode($savedPrize['images'] ?? '[]', true) ?: [];
        }

        echo json_encode(['success' => true, 'data' => $savedPrize, 'prize' => $savedPrize, 'message' => "Lot enregistré avec succès"]);
        exit();
    }

    // SUPPRESSION D'UN LOT DE TOMBOLA
    if ($action === 'delete_tombola_prize' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $prizeId = intval($data['prize_id'] ?? ($data['id'] ?? ($_GET['id'] ?? 0)));
        if ($prizeId <= 0) throw new Exception("Identifiant de lot manquant");

        // Supprimer les tirages liés d'abord
        $pdo->prepare("DELETE FROM event_tombola_draws WHERE prize_id = ?")->execute([$prizeId]);
        // Supprimer le lot
        $pdo->prepare("DELETE FROM event_tombola_prizes WHERE id = ?")->execute([$prizeId]);

        echo json_encode(['success' => true, 'message' => "Lot supprimé avec succès"]);
        exit();
    }

    // ACTIVER / DÉSACTIVER UN LOT DE TOMBOLA
    if ($action === 'toggle_tombola_prize_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $prizeId = intval($data['prize_id'] ?? ($data['id'] ?? 0));
        if ($prizeId <= 0) throw new Exception("Identifiant de lot manquant");

        $status = isset($data['is_active']) ? (intval($data['is_active']) ? 1 : 0) : null;
        if ($status === null) {
            $stmt = $pdo->prepare("UPDATE event_tombola_prizes SET is_active = IF(is_active = 1, 0, 1) WHERE id = ?");
            $stmt->execute([$prizeId]);
        } else {
            $stmt = $pdo->prepare("UPDATE event_tombola_prizes SET is_active = ? WHERE id = ?");
            $stmt->execute([$status, $prizeId]);
        }

        $valStmt = $pdo->prepare("SELECT is_active FROM event_tombola_prizes WHERE id = ?");
        $valStmt->execute([$prizeId]);
        $newStatus = intval($valStmt->fetchColumn());

        echo json_encode(['success' => true, 'is_active' => $newStatus, 'message' => "Statut mis à jour"]);
        exit();
    }

    // RÉORDONNANCER LES LOTS DE TOMBOLA
    if ($action === 'reorder_tombola_prizes' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $prizesList = $data['prizes'] ?? [];
        if (!is_array($prizesList)) throw new Exception("Liste de lots invalide");

        $pdo->beginTransaction();
        $upStmt = $pdo->prepare("UPDATE event_tombola_prizes SET sort_order = ? WHERE id = ?");
        foreach ($prizesList as $idx => $pItem) {
            $pId = intval(is_array($pItem) ? ($pItem['id'] ?? 0) : $pItem);
            $order = is_array($pItem) && isset($pItem['sort_order']) ? intval($pItem['sort_order']) : ($idx + 1);
            if ($pId > 0) {
                $upStmt->execute([$order, $pId]);
            }
        }
        $pdo->commit();

        echo json_encode(['success' => true, 'message' => "Ordre des lots mis à jour"]);
        exit();
    }

    // TIRAGE AU SORT CSPRNG SÉCURISÉ
    if (($action === 'draw_tombola' || $action === 'execute_tombola_draw') && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $prizeId = intval($data['prize_id'] ?? 0);
        $rules = $data['rules'] ?? [];
        $eligibility = $rules['eligibility'] ?? 'checked_in_only';
        $excludePreviousWinners = !isset($rules['exclude_previous_winners']) || $rules['exclude_previous_winners'];

        $stmtP = $pdo->prepare("SELECT * FROM event_tombola_prizes WHERE id = ? AND event_id = ?");
        $stmtP->execute([$prizeId, $eventId]);
        $prize = $stmtP->fetch(PDO::FETCH_ASSOC);
        if (!$prize) throw new Exception("Lot introuvable");
        if ($prize['drawn_count'] >= $prize['winners_count']) throw new Exception("Tous les gagnants de ce lot ont déjà été tirés");

        // Éligibles (selon statut émargé ou confirmé)
        $statusCondition = ($eligibility === 'all')
            ? "AND a.status != 'cancelled'"
            : "AND (a.status = 'attended' OR a.checked_in_at IS NOT NULL OR a.status = 'confirmed')";

        $excludeCondition = $excludePreviousWinners 
            ? "AND a.id NOT IN (SELECT winner_attendee_id FROM event_tombola_draws WHERE event_id = ?)" 
            : "";

        $sqlEligible = "SELECT a.* FROM event_attendees a 
                        WHERE a.event_id = ? 
                        $statusCondition
                        $excludeCondition";

        $stmtE = $pdo->prepare($sqlEligible);
        $params = $excludePreviousWinners ? [$eventId, $eventId] : [$eventId];
        $stmtE->execute($params);
        $pool = $stmtE->fetchAll(PDO::FETCH_ASSOC);

        if (empty($pool)) {
            // Fallback souple si le pool est vide pour éviter le blocage
            $stmtFallback = $pdo->prepare("SELECT a.* FROM event_attendees a WHERE a.event_id = ? AND a.status != 'cancelled'");
            $stmtFallback->execute([$eventId]);
            $pool = $stmtFallback->fetchAll(PDO::FETCH_ASSOC);
        }

        if (empty($pool)) throw new Exception("Aucun participant inscrit éligible n'a été trouvé pour cet événement.");

        // CSPRNG cryptographiquement fort
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
            $winner['company'] ?? '',
            $winner['email'] ?? '',
            $winner['ticket_code'] ?? 'TKT-' . $winner['id'],
            $drawHash
        ]);

        $pdo->prepare("UPDATE event_tombola_prizes SET drawn_count = drawn_count + 1, is_drawn = IF(drawn_count >= winners_count, 1, 0) WHERE id = ?")->execute([$prizeId]);

        echo json_encode([
            'success' => true,
            'draw' => [
                'winner_name' => $winner['first_name'] . ' ' . $winner['last_name'],
                'winner_company' => $winner['company'] ?? '',
                'winner_ticket_code' => $winner['ticket_code'] ?? 'TKT-' . $winner['id'],
                'draw_hash' => $drawHash,
                'prize_title' => $prize['title']
            ],
            'message' => "Gagnant tiré au sort avec succès !"
        ]);
        exit();
    }

    // RÉINITIALISER LES TIRAGES
    if ($action === 'reset_tombola_draws' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $eventId = intval($data['event_id'] ?? 0);
        $prizeId = intval($data['prize_id'] ?? 0);
        if ($eventId <= 0) throw new Exception("event_id requis");

        if ($prizeId > 0) {
            $pdo->prepare("DELETE FROM event_tombola_draws WHERE event_id = ? AND prize_id = ?")->execute([$eventId, $prizeId]);
            $pdo->prepare("UPDATE event_tombola_prizes SET drawn_count = 0, is_drawn = 0 WHERE id = ? AND event_id = ?")->execute([$prizeId, $eventId]);
        } else {
            $pdo->prepare("DELETE FROM event_tombola_draws WHERE event_id = ?")->execute([$eventId]);
            $pdo->prepare("UPDATE event_tombola_prizes SET drawn_count = 0, is_drawn = 0 WHERE event_id = ?")->execute([$eventId]);
        }

        echo json_encode(['success' => true, 'message' => "Tirages réinitialisés avec succès."]);
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

