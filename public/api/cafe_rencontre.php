<?php
// public/api/cafe_rencontre.php
// Contrôleur de production PHP / MySQL pour le module CAFÉ RENCONTRE (MDIV Business)

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-auth-token');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

date_default_timezone_set('Europe/Paris');

require_once __DIR__ . '/config.php';
$pdo = get_db_connection();

/**
 * Auto-initialisation garantie des tables Café Rencontre
 */
function ensure_cafe_rencontre_tables(PDO $pdo) {
    try {
        // 1. Table des Campagnes Café Rencontre
        $pdo->exec("CREATE TABLE IF NOT EXISTS `cafe_rencontre_campaigns` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(120) NOT NULL UNIQUE,
            `title` VARCHAR(255) NOT NULL,
            `description` TEXT NULL,
            `event_date` DATE NULL,
            `location` VARCHAR(255) NULL,
            `image_url` VARCHAR(500) NULL,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `validity_type` VARCHAR(50) NOT NULL DEFAULT '12h',
            `starts_at` DATETIME NOT NULL,
            `expires_at` DATETIME NULL,
            `contact_redirect_url` VARCHAR(255) NOT NULL DEFAULT '/contact',
            `views_count` INT NOT NULL DEFAULT 0,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NULL,
            INDEX `idx_cr_slug` (`slug`),
            INDEX `idx_cr_status` (`is_active`, `expires_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 2. Table des Intervenants sélectionnés par campagne
        $pdo->exec("CREATE TABLE IF NOT EXISTS `cafe_rencontre_speakers` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `campaign_id` INT NOT NULL,
            `attendee_id` INT NULL,
            `display_name` VARCHAR(255) NOT NULL,
            `job_title` VARCHAR(255) NULL,
            `company` VARCHAR(255) NULL,
            `photo_url` VARCHAR(500) NULL,
            `bio` TEXT NULL,
            `expertises` TEXT NULL,
            `topics` TEXT NULL,
            `location_zone` VARCHAR(255) NULL,
            `sort_order` INT NOT NULL DEFAULT 1,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_cr_spk_camp` (`campaign_id`, `is_active`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 3. Table des Demandes de Rendez-vous
        $pdo->exec("CREATE TABLE IF NOT EXISTS `cafe_rencontre_requests` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `campaign_id` INT NOT NULL,
            `speaker_id` INT NOT NULL,
            `requester_name` VARCHAR(255) NOT NULL,
            `company_name` VARCHAR(255) NOT NULL,
            `job_title` VARCHAR(255) NULL,
            `email` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(50) NULL,
            `website` VARCHAR(255) NULL,
            `sector` VARCHAR(100) NULL,
            `main_topic` VARCHAR(255) NOT NULL,
            `secondary_topics` TEXT NULL,
            `need_description` TEXT NULL,
            `meeting_format` VARCHAR(100) NOT NULL DEFAULT 'client_premises',
            `city` VARCHAR(150) NOT NULL,
            `postal_code` VARCHAR(20) NULL,
            `availability` VARCHAR(100) NULL DEFAULT 'flexible',
            `preferred_date` VARCHAR(100) NULL,
            `additional_comment` TEXT NULL,
            `consent_accepted` TINYINT(1) NOT NULL DEFAULT 1,
            `consent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `status` VARCHAR(50) NOT NULL DEFAULT 'new',
            `admin_notes` TEXT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NULL,
            INDEX `idx_cr_req_camp` (`campaign_id`),
            INDEX `idx_cr_req_spk` (`speaker_id`),
            INDEX `idx_cr_req_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // 4. Table des Visites Anonymisées
        $pdo->exec("CREATE TABLE IF NOT EXISTS `cafe_rencontre_visits` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `campaign_id` INT NOT NULL,
            `session_hash` VARCHAR(64) NOT NULL,
            `ip_hash` VARCHAR(64) NULL,
            `visited_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_cr_vis_camp` (`campaign_id`, `visited_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    } catch (Throwable $e) {
        error_log("ensure_cafe_rencontre_tables error: " . $e->getMessage());
    }
}

ensure_cafe_rencontre_tables($pdo);

$action = $_GET['action'] ?? '';
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: $_POST;
if (empty($action) && isset($data['action'])) {
    $action = $data['action'];
}

// Fonction utilitaire de slugification robuste avec conversion des accents français
function slugify($text) {
    $text = str_replace(
        ['é', 'è', 'ê', 'ë', 'à', 'â', 'ä', 'î', 'ï', 'ô', 'ö', 'ù', 'û', 'ü', 'ç', 'É', 'È', 'Ê', 'Ë', 'À', 'Â', 'Ä', 'Î', 'Ï', 'Ô', 'Ö', 'Ù', 'Û', 'Ü', 'Ç'],
        ['e', 'e', 'e', 'e', 'a', 'a', 'a', 'i', 'i', 'o', 'o', 'u', 'u', 'u', 'c', 'e', 'e', 'e', 'e', 'a', 'a', 'a', 'i', 'i', 'o', 'o', 'u', 'u', 'u', 'c'],
        $text
    );
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return empty($text) ? 'campagne-' . time() : $text;
}

// Calcule la date d'expiration en fonction du type de validité
function compute_expiration_date($validityType, $startsAtStr, $customExpiresAt = null) {
    if ($validityType === 'unlimited') {
        return null;
    }
    if ($validityType === 'custom' && !empty($customExpiresAt)) {
        return date('Y-m-d H:i:s', strtotime($customExpiresAt));
    }

    $startTime = strtotime($startsAtStr ?: 'now');
    $hoursMap = [
        '1h' => 1,
        '3h' => 3,
        '6h' => 6,
        '12h' => 12,
        '24h' => 24,
        '48h' => 48,
        '7d'  => 168
    ];
    $hours = $hoursMap[$validityType] ?? 12;
    return date('Y-m-d H:i:s', $startTime + ($hours * 3600));
}

// Calcule le statut dynamique de la campagne
function compute_campaign_status($c) {
    if (!$c['is_active']) {
        return 'disabled';
    }
    $now = time();
    $starts = strtotime($c['starts_at']);
    if ($now < $starts) {
        return 'upcoming';
    }
    if (!empty($c['expires_at'])) {
        $expires = strtotime($c['expires_at']);
        if ($now > $expires) {
            return 'expired';
        }
    }
    return 'active';
}

try {
    // 0. INITIALISATION DU SCHEMA
    if ($action === 'init_schema') {
        ensure_cafe_rencontre_tables($pdo);
        echo json_encode(['success' => true, 'message' => 'Schéma Café Rencontre initialisé avec succès']);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 1. CAMPAGNES : LISTE & GESTION (ADMIN)
    // ─────────────────────────────────────────────────────────────
    if ($action === 'list_campaigns') {
        $stmt = $pdo->query("
            SELECT c.*, 
                   (SELECT COUNT(*) FROM cafe_rencontre_speakers s WHERE s.campaign_id = c.id AND s.is_active = 1) AS speakers_count,
                   (SELECT COUNT(*) FROM cafe_rencontre_requests r WHERE r.campaign_id = c.id) AS requests_count
            FROM cafe_rencontre_campaigns c
            ORDER BY c.created_at DESC
        ");
        $campaigns = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

        foreach ($campaigns as &$c) {
            $c['id'] = intval($c['id']);
            $c['is_active'] = (bool)intval($c['is_active']);
            $c['views_count'] = intval($c['views_count']);
            $c['speakers_count'] = intval($c['speakers_count']);
            $c['requests_count'] = intval($c['requests_count']);
            $c['status_computed'] = compute_campaign_status($c);
            $c['is_expired'] = ($c['status_computed'] === 'expired');
        }
        unset($c);

        echo json_encode(['success' => true, 'campaigns' => $campaigns]);
        exit();
    }

    if ($action === 'get_campaign') {
        $id = intval($_GET['id'] ?? ($data['id'] ?? 0));
        $slug = trim($_GET['slug'] ?? ($data['slug'] ?? ''));

        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE id = ?");
            $stmt->execute([$id]);
        } elseif (!empty($slug)) {
            $stmt = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE slug = ?");
            $stmt->execute([$slug]);
        } else {
            throw new Exception("Identifiant ou slug de campagne manquant");
        }

        $campaign = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$campaign) throw new Exception("Campagne introuvable");

        $campaign['id'] = intval($campaign['id']);
        $campaign['is_active'] = (bool)intval($campaign['is_active']);
        $campaign['views_count'] = intval($campaign['views_count']);
        $campaign['status_computed'] = compute_campaign_status($campaign);
        $campaign['is_expired'] = ($campaign['status_computed'] === 'expired');

        // Récupérer les intervenants associés
        $stmtS = $pdo->prepare("
            SELECT s.*, 
                   (SELECT COUNT(*) FROM cafe_rencontre_requests r WHERE r.speaker_id = s.id) AS requests_count
            FROM cafe_rencontre_speakers s
            WHERE s.campaign_id = ?
            ORDER BY s.sort_order ASC, s.id ASC
        ");
        $stmtS->execute([$campaign['id']]);
        $speakers = $stmtS->fetchAll(PDO::FETCH_ASSOC);

        foreach ($speakers as &$s) {
            $s['id'] = intval($s['id']);
            $s['campaign_id'] = intval($s['campaign_id']);
            $s['attendee_id'] = $s['attendee_id'] ? intval($s['attendee_id']) : null;
            $s['sort_order'] = intval($s['sort_order']);
            $s['is_active'] = (bool)intval($s['is_active']);
            $s['requests_count'] = intval($s['requests_count']);
            if (!empty($s['expertises']) && is_string($s['expertises'])) {
                $decoded = json_decode($s['expertises'], true);
                $s['expertises'] = is_array($decoded) ? $decoded : array_map('trim', explode(',', $s['expertises']));
            } else {
                $s['expertises'] = [];
            }
        }
        unset($s);

        echo json_encode([
            'success' => true,
            'campaign' => $campaign,
            'speakers' => $speakers
        ]);
        exit();
    }

    if ($action === 'save_campaign' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = intval($data['id'] ?? 0);
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $eventDate = !empty($data['event_date']) ? $data['event_date'] : null;
        $location = trim($data['location'] ?? '');
        $imageUrl = trim($data['image_url'] ?? '');
        $isActive = isset($data['is_active']) ? (intval($data['is_active']) ? 1 : 0) : 1;
        $validityType = trim($data['validity_type'] ?? '12h');
        $startsAt = !empty($data['starts_at']) ? date('Y-m-d H:i:s', strtotime($data['starts_at'])) : date('Y-m-d H:i:s');
        $contactUrl = trim($data['contact_redirect_url'] ?? '/contact') ?: '/contact';

        if (empty($title)) throw new Exception("Le titre de la campagne est obligatoire");

        // Calcul de l'expiration
        $customExpires = !empty($data['expires_at']) ? $data['expires_at'] : null;
        $expiresAt = compute_expiration_date($validityType, $startsAt, $customExpires);

        // Génération ou conservation du slug unique
        $rawSlug = !empty($data['slug']) ? trim($data['slug']) : slugify($title);
        $slug = $rawSlug;
        $counter = 1;
        while (true) {
            $stmtSlug = $pdo->prepare("SELECT id FROM cafe_rencontre_campaigns WHERE slug = ? AND id != ?");
            $stmtSlug->execute([$slug, $id]);
            if (!$stmtSlug->fetch()) break;
            $slug = $rawSlug . '-' . (++$counter);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE cafe_rencontre_campaigns SET
                    slug = ?,
                    title = ?,
                    description = ?,
                    event_date = ?,
                    location = ?,
                    image_url = ?,
                    is_active = ?,
                    validity_type = ?,
                    starts_at = ?,
                    expires_at = ?,
                    contact_redirect_url = ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $slug,
                $title,
                $description,
                $eventDate,
                $location,
                $imageUrl,
                $isActive,
                $validityType,
                $startsAt,
                $expiresAt,
                $contactUrl,
                $id
            ]);
            $campaignId = $id;
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO cafe_rencontre_campaigns (
                    slug, title, description, event_date, location, image_url,
                    is_active, validity_type, starts_at, expires_at, contact_redirect_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $slug,
                $title,
                $description,
                $eventDate,
                $location,
                $imageUrl,
                $isActive,
                $validityType,
                $startsAt,
                $expiresAt,
                $contactUrl
            ]);
            $campaignId = intval($pdo->lastInsertId());
        }

        echo json_encode([
            'success' => true,
            'campaign_id' => $campaignId,
            'slug' => $slug,
            'message' => 'Campagne enregistrée avec succès'
        ]);
        exit();
    }

    if ($action === 'delete_campaign' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = intval($data['id'] ?? 0);
        if ($id <= 0) throw new Exception("ID de campagne invalide");

        // Supprimer la campagne et ses intervenants associés
        $pdo->prepare("DELETE FROM cafe_rencontre_speakers WHERE campaign_id = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM cafe_rencontre_campaigns WHERE id = ?")->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Campagne supprimée avec succès']);
        exit();
    }

    if ($action === 'toggle_campaign_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = intval($data['id'] ?? 0);
        if ($id <= 0) throw new Exception("ID de campagne invalide");

        $stmt = $pdo->prepare("UPDATE cafe_rencontre_campaigns SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Statut mis à jour']);
        exit();
    }

    if ($action === 'extend_campaign_validity' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = intval($data['id'] ?? 0);
        $hoursToAdd = intval($data['hours'] ?? 12);
        if ($id <= 0) throw new Exception("ID de campagne invalide");

        $stmt = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE id = ?");
        $stmt->execute([$id]);
        $campaign = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$campaign) throw new Exception("Campagne introuvable");

        $baseTime = (!empty($campaign['expires_at']) && strtotime($campaign['expires_at']) > time())
            ? strtotime($campaign['expires_at'])
            : time();

        $newExpiresAt = date('Y-m-d H:i:s', $baseTime + ($hoursToAdd * 3600));

        $stmtUp = $pdo->prepare("
            UPDATE cafe_rencontre_campaigns SET 
                expires_at = ?, 
                is_active = 1, 
                updated_at = NOW() 
            WHERE id = ?
        ");
        $stmtUp->execute([$newExpiresAt, $id]);

        echo json_encode([
            'success' => true, 
            'expires_at' => $newExpiresAt,
            'message' => "Campagne prolongée de $hoursToAdd heures (jusqu'au " . date('d/m/Y H:i', strtotime($newExpiresAt)) . ")"
        ]);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. INTERVENANTS : SELECTION DEPUIS EVENT_ATTENDEES & GESTION
    // ─────────────────────────────────────────────────────────────
    if ($action === 'list_eligible_attendees') {
        // Liste les personnes inscrites dans le CMS pour que l'admin puisse les sélectionner
        $search = trim($_GET['search'] ?? '');
        $campaignId = intval($_GET['campaign_id'] ?? 0);

        $sql = "SELECT id, event_id, first_name, last_name, email, phone, company, job_title, sector, photo_url, created_at 
                FROM event_attendees WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR company LIKE ? OR job_title LIKE ? OR email LIKE ?)";
            $term = "%$search%";
            $params = array_fill(0, 5, $term);
        }

        $sql .= " ORDER BY created_at DESC LIMIT 200";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $attendees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Identifiants des intervenants déjà ajoutés à cette campagne
        $selectedAttendeeIds = [];
        if ($campaignId > 0) {
            $stmtSel = $pdo->prepare("SELECT attendee_id FROM cafe_rencontre_speakers WHERE campaign_id = ? AND attendee_id IS NOT NULL");
            $stmtSel->execute([$campaignId]);
            $selectedAttendeeIds = array_map('intval', $stmtSel->fetchAll(PDO::FETCH_COLUMN));
        }

        foreach ($attendees as &$att) {
            $att['id'] = intval($att['id']);
            $att['full_name'] = trim(($att['first_name'] ?? '') . ' ' . ($att['last_name'] ?? ''));
            $att['is_already_selected'] = in_array($att['id'], $selectedAttendeeIds);
        }
        unset($att);

        echo json_encode(['success' => true, 'attendees' => $attendees]);
        exit();
    }

    if ($action === 'add_speakers_to_campaign' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $campaignId = intval($data['campaign_id'] ?? 0);
        $attendeeIds = $data['attendee_ids'] ?? [];

        if ($campaignId <= 0) throw new Exception("ID de campagne invalide");
        if (empty($attendeeIds) || !is_array($attendeeIds)) throw new Exception("Aucun participant sélectionné");

        // Récupérer le sort_order maximum actuel
        $maxStmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) FROM cafe_rencontre_speakers WHERE campaign_id = ?");
        $maxStmt->execute([$campaignId]);
        $currentOrder = intval($maxStmt->fetchColumn());

        $insertedCount = 0;
        foreach ($attendeeIds as $attId) {
            $attId = intval($attId);
            if ($attId <= 0) continue;

            // Vérifier s'il est déjà dans la campagne
            $chk = $pdo->prepare("SELECT id FROM cafe_rencontre_speakers WHERE campaign_id = ? AND attendee_id = ?");
            $chk->execute([$campaignId, $attId]);
            if ($chk->fetch()) continue;

            // Récupérer le profil de l'inscrit
            $attStmt = $pdo->prepare("SELECT * FROM event_attendees WHERE id = ?");
            $attStmt->execute([$attId]);
            $att = $attStmt->fetch(PDO::FETCH_ASSOC);
            if (!$att) continue;

            $displayName = trim(($att['first_name'] ?? '') . ' ' . ($att['last_name'] ?? ''));
            $jobTitle = trim($att['job_title'] ?? '');
            $company = trim($att['company'] ?? '');
            $photoUrl = trim($att['photo_url'] ?? '');
            $bio = trim($att['pitch_text'] ?? '');
            $expertises = json_encode([$att['sector'] ?? 'Entrepreneuriat']);
            $topics = "Développement d'activité, stratégie et opportunités de partenariat.";
            $currentOrder++;

            $ins = $pdo->prepare("
                INSERT INTO cafe_rencontre_speakers (
                    campaign_id, attendee_id, display_name, job_title, company, 
                    photo_url, bio, expertises, topics, location_zone, sort_order, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ");
            $ins->execute([
                $campaignId,
                $attId,
                $displayName,
                $jobTitle,
                $company,
                $photoUrl,
                $bio,
                $expertises,
                $topics,
                '',
                $currentOrder
            ]);
            $insertedCount++;
        }

        echo json_encode([
            'success' => true, 
            'inserted_count' => $insertedCount,
            'message' => "$insertedCount intervenant(s) ajouté(s) à la campagne"
        ]);
        exit();
    }

    if ($action === 'update_speaker' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $speakerId = intval($data['id'] ?? 0);
        if ($speakerId <= 0) throw new Exception("ID d'intervenant invalide");

        $displayName = trim($data['display_name'] ?? '');
        $jobTitle = trim($data['job_title'] ?? '');
        $company = trim($data['company'] ?? '');
        $photoUrl = trim($data['photo_url'] ?? '');
        $bio = trim($data['bio'] ?? '');
        $topics = trim($data['topics'] ?? '');
        $locationZone = trim($data['location_zone'] ?? '');
        $sortOrder = intval($data['sort_order'] ?? 1);
        $isActive = isset($data['is_active']) ? (intval($data['is_active']) ? 1 : 0) : 1;

        $expertises = $data['expertises'] ?? [];
        if (is_array($expertises)) {
            $expertisesJson = json_encode(array_values(array_filter(array_map('trim', $expertises))));
        } else {
            $expertisesJson = json_encode(array_values(array_filter(array_map('trim', explode(',', strval($expertises))))));
        }

        if (empty($displayName)) throw new Exception("Le nom de l'intervenant est obligatoire");

        $stmt = $pdo->prepare("
            UPDATE cafe_rencontre_speakers SET
                display_name = ?,
                job_title = ?,
                company = ?,
                photo_url = ?,
                bio = ?,
                expertises = ?,
                topics = ?,
                location_zone = ?,
                sort_order = ?,
                is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $displayName,
            $jobTitle,
            $company,
            $photoUrl,
            $bio,
            $expertisesJson,
            $topics,
            $locationZone,
            $sortOrder,
            $isActive,
            $speakerId
        ]);

        echo json_encode(['success' => true, 'message' => 'Profil intervenant mis à jour']);
        exit();
    }

    if ($action === 'remove_speaker' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $speakerId = intval($data['id'] ?? 0);
        if ($speakerId <= 0) throw new Exception("ID d'intervenant invalide");

        $stmt = $pdo->prepare("DELETE FROM cafe_rencontre_speakers WHERE id = ?");
        $stmt->execute([$speakerId]);

        echo json_encode(['success' => true, 'message' => 'Intervenant retiré de la campagne']);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 3. PAGE PUBLIQUE : ACCÈS SÉCURISÉ CÔTÉ SERVEUR (SCAN QR CODE)
    // ─────────────────────────────────────────────────────────────
    if ($action === 'get_public_campaign') {
        $slug = trim($_GET['slug'] ?? ($data['slug'] ?? ''));
        if (empty($slug)) throw new Exception("Identifiant de campagne manquant");

        $stmt = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE slug = ? OR slug = ? OR slug = ? OR REPLACE(slug, 'e', '') = REPLACE(?, 'e', '') ORDER BY id DESC LIMIT 1");
        $stmt->execute([$slug, str_replace('rseau', 'reseau', $slug), str_replace('reseau', 'rseau', $slug), $slug]);
        $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

        // Fallback : si non trouvé par slug exact et une campagne active existe
        if (!$campaign) {
            $stmtFallback = $pdo->query("SELECT * FROM cafe_rencontre_campaigns WHERE is_active = 1 ORDER BY id DESC LIMIT 1");
            $campaign = $stmtFallback ? $stmtFallback->fetch(PDO::FETCH_ASSOC) : null;
        }

        if (!$campaign) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'status' => 'not_found',
                'message' => 'Cette session Café Rencontre est introuvable.'
            ]);
            exit();
        }

        $now = time();
        $starts = strtotime($campaign['starts_at']);
        $expires = !empty($campaign['expires_at']) ? strtotime($campaign['expires_at']) : null;
        $contactUrl = $campaign['contact_redirect_url'] ?: '/contact';

        // 1. Campagne désactivée manuellement
        if (!$campaign['is_active']) {
            echo json_encode([
                'success' => true,
                'status' => 'disabled',
                'contact_url' => $contactUrl,
                'message' => 'Désolé, cette session de prise de rendez-vous est actuellement fermée.'
            ]);
            exit();
        }

        // 2. Campagne pas encore ouverte
        if ($now < $starts) {
            echo json_encode([
                'success' => true,
                'status' => 'upcoming',
                'contact_url' => $contactUrl,
                'starts_at' => $campaign['starts_at'],
                'message' => "Cette session de prise de rendez-vous n'est pas encore ouverte. Revenez prochainement."
            ]);
            exit();
        }

        // 3. Campagne expirée
        if ($expires !== null && $now > $expires) {
            echo json_encode([
                'success' => true,
                'status' => 'expired',
                'contact_url' => $contactUrl,
                'expires_at' => $campaign['expires_at'],
                'message' => 'Désolé, cette session de prise de rendez-vous est maintenant fermée.'
            ]);
            exit();
        }

        // 4. Campagne active et valide -> Enregistrement de la visite
        try {
            $sessHash = hash('sha256', session_id() . ($_SERVER['REMOTE_ADDR'] ?? ''));
            $pdo->prepare("INSERT INTO cafe_rencontre_visits (campaign_id, session_hash) VALUES (?, ?)")
                ->execute([$campaign['id'], $sessHash]);
            $pdo->prepare("UPDATE cafe_rencontre_campaigns SET views_count = views_count + 1 WHERE id = ?")
                ->execute([$campaign['id']]);
        } catch (Throwable $t) {}

        // Récupérer UNIQUEMENT les intervenants sélectionnés actifs (coordonnées privées strictement exclues)
        $stmtS = $pdo->prepare("
            SELECT id, display_name, job_title, company, photo_url, bio, expertises, topics, location_zone, sort_order 
            FROM cafe_rencontre_speakers 
            WHERE campaign_id = ? AND is_active = 1 
            ORDER BY sort_order ASC, id ASC
        ");
        $stmtS->execute([$campaign['id']]);
        $speakers = $stmtS->fetchAll(PDO::FETCH_ASSOC);

        foreach ($speakers as &$s) {
            $s['id'] = intval($s['id']);
            $s['sort_order'] = intval($s['sort_order']);
            if (!empty($s['expertises']) && is_string($s['expertises'])) {
                $decoded = json_decode($s['expertises'], true);
                $s['expertises'] = is_array($decoded) ? $decoded : array_map('trim', explode(',', $s['expertises']));
            } else {
                $s['expertises'] = [];
            }
        }
        unset($s);

        echo json_encode([
            'success' => true,
            'status' => 'active',
            'campaign' => [
                'id' => intval($campaign['id']),
                'slug' => $campaign['slug'],
                'title' => $campaign['title'],
                'description' => $campaign['description'],
                'event_date' => $campaign['event_date'],
                'location' => $campaign['location'],
                'image_url' => $campaign['image_url'],
                'starts_at' => $campaign['starts_at'],
                'expires_at' => $campaign['expires_at'],
                'contact_redirect_url' => $contactUrl
            ],
            'speakers' => $speakers
        ]);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SOUMISSION D'UNE DEMANDE DE RENDEZ-VOUS 30 MINUTES
    // ─────────────────────────────────────────────────────────────
    if ($action === 'submit_booking_request' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $campaignSlug = trim($data['campaign_slug'] ?? '');
        $campaignId = intval($data['campaign_id'] ?? 0);
        $speakerId = intval($data['speaker_id'] ?? 0);

        // Retrouver la campagne
        if ($campaignId > 0) {
            $stmtC = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE id = ?");
            $stmtC->execute([$campaignId]);
        } elseif (!empty($campaignSlug)) {
            $stmtC = $pdo->prepare("SELECT * FROM cafe_rencontre_campaigns WHERE slug = ? OR slug = ? OR slug = ? OR REPLACE(slug, 'e', '') = REPLACE(?, 'e', '') ORDER BY id DESC LIMIT 1");
            $stmtC->execute([$campaignSlug, str_replace('rseau', 'reseau', $campaignSlug), str_replace('reseau', 'rseau', $campaignSlug), $campaignSlug]);
            $campaign = $stmtC->fetch(PDO::FETCH_ASSOC);
            if (!$campaign) {
                $stmtFallback = $pdo->query("SELECT * FROM cafe_rencontre_campaigns WHERE is_active = 1 ORDER BY id DESC LIMIT 1");
                $campaign = $stmtFallback ? $stmtFallback->fetch(PDO::FETCH_ASSOC) : null;
            }
        } else {
            throw new Exception("Campagne non spécifiée");
        }
        $campaign = $stmtC->fetch(PDO::FETCH_ASSOC);
        if (!$campaign) throw new Exception("Campagne introuvable");

        // VÉRIFICATION STRICTE CÔTÉ SERVEUR DE L'EXPIRATION
        $now = time();
        $starts = strtotime($campaign['starts_at']);
        $expires = !empty($campaign['expires_at']) ? strtotime($campaign['expires_at']) : null;

        if (!$campaign['is_active']) {
            http_response_code(403);
            throw new Exception("Cette session de prise de rendez-vous est fermée.");
        }
        if ($now < $starts) {
            http_response_code(403);
            throw new Exception("Cette session de prise de rendez-vous n'est pas encore ouverte.");
        }
        if ($expires !== null && $now > $expires) {
            http_response_code(403);
            throw new Exception("La période de réservation pour cette rencontre est expirée.");
        }

        // Vérifier l'intervenant
        $stmtS = $pdo->prepare("SELECT * FROM cafe_rencontre_speakers WHERE id = ? AND campaign_id = ? AND is_active = 1");
        $stmtS->execute([$speakerId, $campaign['id']]);
        $speaker = $stmtS->fetch(PDO::FETCH_ASSOC);
        if (!$speaker) throw new Exception("Intervenant sélectionné introuvable ou inactif");

        // Champs du demandeur
        $requesterName = trim($data['requester_name'] ?? '');
        $companyName = trim($data['company_name'] ?? '');
        $jobTitle = trim($data['job_title'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $website = trim($data['website'] ?? '');
        $sector = trim($data['sector'] ?? '');
        $mainTopic = trim($data['main_topic'] ?? '');
        $secondaryTopics = $data['secondary_topics'] ?? [];
        $secondaryJson = is_array($secondaryTopics) ? json_encode(array_values($secondaryTopics)) : '[]';
        $needDesc = trim($data['need_description'] ?? '');
        $meetingFormat = trim($data['meeting_format'] ?? 'client_premises');
        $city = trim($data['city'] ?? '');
        $postalCode = trim($data['postal_code'] ?? '');
        $availability = trim($data['availability'] ?? 'flexible');
        $preferredDate = trim($data['preferred_date'] ?? '');
        $comment = trim($data['additional_comment'] ?? '');
        $consent = isset($data['consent_accepted']) ? (intval($data['consent_accepted']) ? 1 : 0) : 0;

        // Validations obligatoires
        if (empty($requesterName)) throw new Exception("Votre nom et prénom sont obligatoires");
        if (empty($companyName)) throw new Exception("Le nom de votre entreprise est obligatoire");
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception("Adresse e-mail valide obligatoire");
        if (empty($mainTopic)) throw new Exception("Veuillez choisir un sujet pour votre échange");
        if (empty($city)) throw new Exception("Veuillez renseigner votre ville");
        if (!$consent) throw new Exception("Veuillez accepter l'utilisation de vos informations pour organiser le rendez-vous");

        // Protection anti double soumission (même email, même intervenant, il y a moins de 2 minutes)
        $chkDup = $pdo->prepare("
            SELECT id FROM cafe_rencontre_requests 
            WHERE campaign_id = ? AND speaker_id = ? AND email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
        ");
        $chkDup->execute([$campaign['id'], $speakerId, $email]);
        if ($chkDup->fetch()) {
            throw new Exception("Votre demande vient déjà d'être enregistrée. Nous revenons vers vous rapidement !");
        }

        // Enregistrement en base de données
        $stmtIns = $pdo->prepare("
            INSERT INTO cafe_rencontre_requests (
                campaign_id, speaker_id, requester_name, company_name, job_title, 
                email, phone, website, sector, main_topic, secondary_topics, 
                need_description, meeting_format, city, postal_code, availability, 
                preferred_date, additional_comment, consent_accepted, status
            ) VALUES (
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, 
                ?, ?, ?, 'new'
            )
        ");
        $stmtIns->execute([
            $campaign['id'],
            $speakerId,
            $requesterName,
            $companyName,
            $jobTitle,
            $email,
            $phone,
            $website,
            $sector,
            $mainTopic,
            $secondaryJson,
            $needDesc,
            $meetingFormat,
            $city,
            $postalCode,
            $availability,
            $preferredDate,
            $comment,
            1
        ]);
        $requestId = intval($pdo->lastInsertId());

        // Notifications par e-mail
        try {
            $formatLabels = [
                'client_premises' => 'Dans les locaux de votre entreprise (nous nous déplaçons)',
                'cafe_public' => 'Dans un café ou lieu convivial',
                'both' => 'Les deux me conviennent'
            ];
            $formatDisplay = $formatLabels[$meetingFormat] ?? $meetingFormat;

            // 1. E-mail au demandeur (Accusé de réception)
            $subjectRequester = "Votre demande de Café Rencontre a bien été reçue — MDIV Network";
            $messageRequester = "
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;'>
                    <h2 style='color: #d97706; margin-top: 0;'>Bonjour $requesterName,</h2>
                    <p>Nous vous confirmons la bonne réception de votre demande de <strong>Café Rencontre (30 minutes)</strong> dans le cadre de l'opération <em>{$campaign['title']}</em>.</p>
                    
                    <div style='background: #f8fafc; border-left: 4px solid #d97706; padding: 14px 18px; margin: 20px 0;'>
                        <p style='margin: 0 0 8px 0;'><strong>Intervenant choisi :</strong> {$speaker['display_name']} ({$speaker['company']})</p>
                        <p style='margin: 0 0 8px 0;'><strong>Sujet d'échange :</strong> $mainTopic</p>
                        <p style='margin: 0 0 8px 0;'><strong>Format privilégié :</strong> $formatDisplay</p>
                        <p style='margin: 0;'><strong>Lieu / Ville :</strong> $city</p>
                    </div>

                    <p>Notre équipe et votre interlocuteur reviendront vers vous dans les meilleurs délais pour convenir ensemble d'une date et d'une heure précises.</p>
                    
                    <p style='margin-top: 30px; font-size: 13px; color: #64748b;'>
                        À très bientôt,<br>
                        <strong>L'équipe MDIV Business & BNE</strong><br>
                        <a href='https://www.mdiv-network.com' style='color: #d97706;'>www.mdiv-network.com</a>
                    </p>
                </div>
            </body>
            </html>";

            $headers = "MIME-Version: 1.0\r\n";
            $headers .= "Content-type: text/html; charset=UTF-8\r\n";
            $headers .= "From: MDIV Network <contact@mdiv-network.com>\r\n";
            @mail($email, $subjectRequester, $messageRequester, $headers);

            // 2. Notification administrateur
            $adminEmail = "contact@mdiv-network.com";
            $subjectAdmin = "[Café Rencontre] Nouvelle demande de $requesterName ($companyName)";
            $messageAdmin = "
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2>Nouvelle demande de Café Rencontre</h2>
                <p><strong>Demandeur :</strong> $requesterName</p>
                <p><strong>Entreprise :</strong> $companyName ($jobTitle)</p>
                <p><strong>Email :</strong> $email | <strong>Tél :</strong> $phone</p>
                <p><strong>Intervenant :</strong> {$speaker['display_name']}</p>
                <p><strong>Campagne :</strong> {$campaign['title']}</p>
                <p><strong>Sujet :</strong> $mainTopic</p>
                <p><strong>Format :</strong> $formatDisplay - Ville: $city</p>
                <p><strong>Description du besoin :</strong> $needDesc</p>
                <p><a href='https://www.mdiv-network.com/admin/cafe-rencontre/demandes'>Consulter la demande dans le CMS</a></p>
            </body>
            </html>";
            @mail($adminEmail, $subjectAdmin, $messageAdmin, $headers);

        } catch (Throwable $mailErr) {
            error_log("Café Rencontre Mail Error: " . $mailErr->getMessage());
        }

        echo json_encode([
            'success' => true,
            'request_id' => $requestId,
            'speaker_name' => $speaker['display_name'],
            'campaign_title' => $campaign['title'],
            'meeting_format' => $meetingFormat,
            'message' => 'Merci pour votre demande ! Elle a bien été enregistrée.'
        ]);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 5. SUIVI & GESTION DES DEMANDES (ADMIN)
    // ─────────────────────────────────────────────────────────────
    if ($action === 'list_requests') {
        $campaignId = intval($_GET['campaign_id'] ?? 0);
        $speakerId = intval($_GET['speaker_id'] ?? 0);
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $city = trim($_GET['city'] ?? '');

        $sql = "
            SELECT r.*, 
                   c.title AS campaign_title, c.slug AS campaign_slug,
                   s.display_name AS speaker_name, s.company AS speaker_company
            FROM cafe_rencontre_requests r
            LEFT JOIN cafe_rencontre_campaigns c ON c.id = r.campaign_id
            LEFT JOIN cafe_rencontre_speakers s ON s.id = r.speaker_id
            WHERE 1=1
        ";
        $params = [];

        if ($campaignId > 0) {
            $sql .= " AND r.campaign_id = ?";
            $params[] = $campaignId;
        }
        if ($speakerId > 0) {
            $sql .= " AND r.speaker_id = ?";
            $params[] = $speakerId;
        }
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND r.status = ?";
            $params[] = $status;
        }
        if (!empty($city)) {
            $sql .= " AND r.city LIKE ?";
            $params[] = "%$city%";
        }
        if (!empty($search)) {
            $sql .= " AND (r.requester_name LIKE ? OR r.company_name LIKE ? OR r.email LIKE ? OR r.phone LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY r.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Compteurs statistiques par statut
        $stats = [
            'total' => count($requests),
            'new' => 0,
            'to_contact' => 0,
            'contact_established' => 0,
            'to_schedule' => 0,
            'confirmed' => 0,
            'completed' => 0,
            'closed' => 0,
            'cancelled' => 0
        ];

        foreach ($requests as &$req) {
            $req['id'] = intval($req['id']);
            $req['campaign_id'] = intval($req['campaign_id']);
            $req['speaker_id'] = intval($req['speaker_id']);
            $req['consent_accepted'] = (bool)intval($req['consent_accepted']);
            if (isset($stats[$req['status']])) {
                $stats[$req['status']]++;
            }
            if (!empty($req['secondary_topics']) && is_string($req['secondary_topics'])) {
                $dec = json_decode($req['secondary_topics'], true);
                $req['secondary_topics'] = is_array($dec) ? $dec : [];
            } else {
                $req['secondary_topics'] = [];
            }
        }
        unset($req);

        echo json_encode([
            'success' => true,
            'requests' => $requests,
            'stats' => $stats
        ]);
        exit();
    }

    if ($action === 'update_request_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $requestId = intval($data['id'] ?? 0);
        $status = trim($data['status'] ?? '');
        $adminNotes = isset($data['admin_notes']) ? trim($data['admin_notes']) : null;

        if ($requestId <= 0) throw new Exception("ID de demande invalide");

        $validStatuses = ['new', 'to_contact', 'contact_established', 'to_schedule', 'confirmed', 'completed', 'closed', 'cancelled'];
        if (!in_array($status, $validStatuses)) throw new Exception("Statut non reconnu");

        if ($adminNotes !== null) {
            $stmt = $pdo->prepare("UPDATE cafe_rencontre_requests SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $adminNotes, $requestId]);
        } else {
            $stmt = $pdo->prepare("UPDATE cafe_rencontre_requests SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $requestId]);
        }

        echo json_encode(['success' => true, 'message' => 'Statut de la demande mis à jour']);
        exit();
    }

    // ─────────────────────────────────────────────────────────────
    // 6. EXPORT CSV DES DEMANDES (UTF-8 BOM & SANITIZED)
    // ─────────────────────────────────────────────────────────────
    if ($action === 'export_requests_csv') {
        $campaignId = intval($_GET['campaign_id'] ?? 0);
        $speakerId = intval($_GET['speaker_id'] ?? 0);
        $status = trim($_GET['status'] ?? '');
        $includeNotes = (isset($_GET['include_notes']) && $_GET['include_notes'] === '1');

        $sql = "
            SELECT r.*, 
                   c.title AS campaign_title,
                   s.display_name AS speaker_name, s.company AS speaker_company
            FROM cafe_rencontre_requests r
            LEFT JOIN cafe_rencontre_campaigns c ON c.id = r.campaign_id
            LEFT JOIN cafe_rencontre_speakers s ON s.id = r.speaker_id
            WHERE 1=1
        ";
        $params = [];
        if ($campaignId > 0) { $sql .= " AND r.campaign_id = ?"; $params[] = $campaignId; }
        if ($speakerId > 0) { $sql .= " AND r.speaker_id = ?"; $params[] = $speakerId; }
        if (!empty($status) && $status !== 'all') { $sql .= " AND r.status = ?"; $params[] = $status; }

        $sql .= " ORDER BY r.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="cafe_rencontre_demandes_' . date('Y-m-d') . '.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $out = fopen('php://output', 'w');
        // UTF-8 BOM pour Excel
        fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));

        $headers = [
            'ID', 'Date Soumission', 'Campagne', 'Intervenant Souhaité', 'Entreprise Intervenant', 'Statut',
            'Nom & Prénom', 'Entreprise Demandeur', 'Fonction', 'Email', 'Téléphone', 'Site Web',
            'Secteur Activité', 'Sujet Principal', 'Sujets Secondaires', 'Format de Rencontre', 'Ville', 'Code Postal',
            'Disponibilités', 'Créneau Souhaité', 'Besoin Détaillé', 'Commentaire', 'Consentement RGPD', 'Date Consentement'
        ];
        if ($includeNotes) {
            $headers[] = 'Notes Internes CMS';
        }
        fputcsv($out, $headers, ';');

        $sanitize = function($val) {
            $val = strval($val ?? '');
            // Protection anti-injection de formule CSV (=, +, -, @)
            if (isset($val[0]) && in_array($val[0], ['=', '+', '-', '@'])) {
                $val = "'" . $val;
            }
            return $val;
        };

        foreach ($rows as $r) {
            $formatMap = [
                'client_premises' => 'Dans les locaux du client',
                'cafe_public' => 'Dans un café convivial',
                'both' => 'Les deux me conviennent'
            ];
            $secondaryFormatted = '';
            if (!empty($r['secondary_topics'])) {
                $dec = is_string($r['secondary_topics']) ? json_decode($r['secondary_topics'], true) : $r['secondary_topics'];
                $secondaryFormatted = is_array($dec) ? implode(', ', $dec) : strval($r['secondary_topics']);
            }

            $line = [
                $r['id'],
                $r['created_at'],
                $sanitize($r['campaign_title'] ?? ''),
                $sanitize($r['speaker_name'] ?? ''),
                $sanitize($r['speaker_company'] ?? ''),
                $sanitize($r['status'] ?? ''),
                $sanitize($r['requester_name'] ?? ''),
                $sanitize($r['company_name'] ?? ''),
                $sanitize($r['job_title'] ?? ''),
                $sanitize($r['email'] ?? ''),
                $sanitize($r['phone'] ?? ''),
                $sanitize($r['website'] ?? ''),
                $sanitize($r['sector'] ?? ''),
                $sanitize($r['main_topic'] ?? ''),
                $sanitize($secondaryFormatted),
                $sanitize($formatMap[$r['meeting_format']] ?? $r['meeting_format']),
                $sanitize($r['city'] ?? ''),
                $sanitize($r['postal_code'] ?? ''),
                $sanitize($r['availability'] ?? ''),
                $sanitize($r['preferred_date'] ?? ''),
                $sanitize($r['need_description'] ?? ''),
                $sanitize($r['additional_comment'] ?? ''),
                $r['consent_accepted'] ? 'Oui' : 'Non',
                $sanitize($r['consent_at'] ?? $r['created_at'])
            ];
            if ($includeNotes) {
                $line[] = $sanitize($r['admin_notes']);
            }
            fputcsv($out, $line, ';');
        }

        fclose($out);
        exit();
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Action non reconnue : $action"]);

} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit();
}

