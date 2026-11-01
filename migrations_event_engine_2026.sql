-- ==============================================================================
-- MIGRATION MODULE MDIV EVENT ENGINE (ARCHITECTURE MODULAIRE & CRM SYNC)
-- CIBLE : BASE DE DONNÉES MYSQL (PHPMyAdmin / OVH / PRODUCTION)
-- PRINCIPE : 100% Idempotente (IF NOT EXISTS), zéro régression sur les données
-- ==============================================================================

-- 1. ENRICHISSEMENT DE LA TABLE EVENTS (COLONNE JSON CONFIGURATION MODULAIRE)
SET @dbname = DATABASE();

-- Colonne features_config
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'events' AND COLUMN_NAME = 'features_config');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `events` ADD COLUMN `features_config` JSON NULL COMMENT "Catalogue des fonctionnalités activées et leurs paramètres"', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Colonne max_attendees
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'events' AND COLUMN_NAME = 'max_attendees');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `events` ADD COLUMN `max_attendees` INT NULL DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Colonne is_registration_open
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'events' AND COLUMN_NAME = 'is_registration_open');
SET @query = IF(@col_exists = 0, 'ALTER TABLE `events` ADD COLUMN `is_registration_open` TINYINT(1) NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 2. TABLE DU CONSTRUCTEUR DE QUESTIONS SUR-MESURE (EVENT CUSTOM FIELDS)
CREATE TABLE IF NOT EXISTS `event_custom_fields` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `field_key` VARCHAR(64) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `description` VARCHAR(500) NULL,
  `field_type` ENUM('text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'checkbox_group', 'radio', 'checkbox', 'url', 'file', 'photo') NOT NULL DEFAULT 'text',
  `is_required` TINYINT(1) NOT NULL DEFAULT 0,
  `default_value` TEXT NULL,
  `placeholder` VARCHAR(255) NULL,
  `options` JSON NULL COMMENT 'Liste des choix [{label, value}]',
  `validation_rules` JSON NULL COMMENT 'Règles de validation min, max, extensions',
  `conditional_logic` JSON NULL COMMENT 'Affichage conditionnel selon un autre champ',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_evt_fld_order` (`event_id`, `sort_order`, `is_active`),
  INDEX `idx_evt_fld_key` (`event_id`, `field_key`),
  CONSTRAINT `fk_fld_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. TABLE DES PARTICIPANTS ET INSCRIPTIONS (EVENT ATTENDEES)
CREATE TABLE IF NOT EXISTS `event_attendees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `client_id` INT NULL COMMENT 'Lien direct vers la table clients du CRM sans doublon',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `company` VARCHAR(255) NULL,
  `job_title` VARCHAR(255) NULL,
  `sector` VARCHAR(150) NULL,
  `pitch_text` TEXT NULL,
  `expertises` JSON NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `photo_url` VARCHAR(500) NULL,
  `photo_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  `ticket_code` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('registered', 'confirmed', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
  `checked_in_at` DATETIME NULL,
  `checked_in_by` VARCHAR(100) NULL,
  `badge_url` VARCHAR(500) NULL,
  `networking_opt_in` TINYINT(1) NOT NULL DEFAULT 1,
  `photo_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `gdpr_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `acquisition_source` VARCHAR(100) DEFAULT 'website',
  `selected_activities` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_att_evt_status` (`event_id`, `status`),
  INDEX `idx_att_email` (`email`),
  INDEX `idx_att_ticket` (`ticket_code`),
  INDEX `idx_att_client` (`client_id`),
  CONSTRAINT `fk_att_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. TABLE DES RÉPONSES AUX QUESTIONS PERSONNALISÉES (EVENT CUSTOM FIELD ANSWERS)
CREATE TABLE IF NOT EXISTS `event_custom_field_answers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `attendee_id` INT NOT NULL,
  `field_id` INT NOT NULL,
  `field_key` VARCHAR(64) NOT NULL,
  `value_text` TEXT NULL,
  `value_file_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_att_fld` (`attendee_id`, `field_id`),
  INDEX `idx_ans_fld` (`field_id`),
  CONSTRAINT `fk_ans_attendee` FOREIGN KEY (`attendee_id`) REFERENCES `event_attendees`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ans_field` FOREIGN KEY (`field_id`) REFERENCES `event_custom_fields`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5. TABLE DES INTERACTIONS EN DIRECT (EVENT INTERACTIONS : QUIZ, SONDAGES)
CREATE TABLE IF NOT EXISTS `event_interactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `type` ENUM('quiz', 'poll', 'raffle') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('draft', 'active', 'closed') NOT NULL DEFAULT 'draft',
  `config` JSON NOT NULL,
  `results` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_inter_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6. TABLE DES PITCHS ENTREPRISES (EVENT PITCHES)
CREATE TABLE IF NOT EXISTS `event_pitches` (
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
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `speaking_order` INT NOT NULL DEFAULT 99,
  `pitch_time` VARCHAR(50) NULL,
  `moderator_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pitch_evt_status` (`event_id`, `status`),
  CONSTRAINT `fk_pitch_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 7. TABLES DES RENDEZ-VOUS 1-TO-1 (B2B MEETINGS)
CREATE TABLE IF NOT EXISTS `event_meeting_slots` (
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
  INDEX `idx_slot_evt_partner` (`event_id`, `partner_id`),
  CONSTRAINT `fk_slot_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_meeting_bookings` (
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
  `status` ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  `notes` TEXT NULL,
  `appointment_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` DATETIME NULL,
  INDEX `idx_mb_slot` (`slot_id`),
  INDEX `idx_mb_evt` (`event_id`),
  CONSTRAINT `fk_mb_slot` FOREIGN KEY (`slot_id`) REFERENCES `event_meeting_slots`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8. TABLES DE LA TOMBOLA SÉCURISÉE & AUDITABLE (EVENT TOMBOLA)
CREATE TABLE IF NOT EXISTS `event_tombola_prizes` (
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_prize_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_tombola_draws` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `prize_id` INT NOT NULL,
  `prize_title` VARCHAR(255) NOT NULL,
  `winner_attendee_id` INT NOT NULL,
  `winner_name` VARCHAR(255) NOT NULL,
  `winner_company` VARCHAR(255) NULL,
  `winner_email` VARCHAR(255) NOT NULL,
  `winner_ticket_code` VARCHAR(50) NOT NULL,
  `draw_hash` VARCHAR(64) NOT NULL COMMENT 'Empreinte SHA-256 cryptographique inviolable',
  `drawn_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_draw_evt_prize` (`event_id`, `prize_id`),
  CONSTRAINT `fk_draw_prize` FOREIGN KEY (`prize_id`) REFERENCES `event_tombola_prizes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLE DE LA RÉGIE LIVE & ÉCRAN DE DIFFUSION (EVENT LIVE STATES)
CREATE TABLE IF NOT EXISTS `event_live_states` (
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
  `enabled_scenes` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_live_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



