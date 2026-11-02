-- ==============================================================================
-- MDIV EVENT ENGINE v2.0 - SCRIPT SQL DE MIGRATION & TABLES ÉVÉNEMENTIELLES
-- 100% Compatible MySQL 5.7, MySQL 8.0, MariaDB & phpMyAdmin OVH
-- ==============================================================================

-- 1. MISE À NIVEAU DE LA TABLE EVENTS (Colonnes additionnelles)
-- Exécuter ces ALTER individuellement dans phpMyAdmin si les colonnes manquent :
ALTER TABLE `events` ADD `features_config` LONGTEXT DEFAULT NULL;
ALTER TABLE `events` ADD `max_attendees` INT DEFAULT NULL;
ALTER TABLE `events` ADD `registration_deadline` DATETIME DEFAULT NULL;
ALTER TABLE `events` ADD `is_featured` TINYINT(1) DEFAULT 0;
ALTER TABLE `events` ADD `ticket_price` DECIMAL(10,2) DEFAULT 0.00;

-- 2. TABLE DES QUESTIONS SUR-MESURE PAR ÉVÉNEMENT
CREATE TABLE IF NOT EXISTS `event_custom_fields` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `field_key` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `field_type` ENUM('text','textarea','email','phone','number','date','select','checkbox_group','radio','checkbox','url','file','photo') NOT NULL DEFAULT 'text',
  `description` TEXT NULL,
  `placeholder` VARCHAR(255) NULL,
  `default_value` TEXT NULL,
  `options` JSON NULL COMMENT 'Liste des options au format JSON pour select, radio, checkbox_group',
  `validation_rules` JSON NULL,
  `conditional_logic` JSON NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ecf_event` (`event_id`),
  INDEX `idx_ecf_sort` (`event_id`, `sort_order`),
  CONSTRAINT `fk_ecf_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
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
  `gdpr_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `marketing_consent` TINYINT(1) NOT NULL DEFAULT 0,
  `networking_opt_in` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ea_event` (`event_id`),
  INDEX `idx_ea_client` (`client_id`),
  INDEX `idx_ea_email` (`email`),
  INDEX `idx_ea_ticket` (`ticket_code`),
  CONSTRAINT `fk_ea_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLE DES RÉPONSES AUX QUESTIONS SUR-MESURE
CREATE TABLE IF NOT EXISTS `event_custom_field_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attendee_id` INT NOT NULL,
  `field_id` INT NOT NULL,
  `answer_value` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ecfa_attendee` (`attendee_id`),
  INDEX `idx_ecfa_field` (`field_id`),
  CONSTRAINT `fk_ecfa_attendee` FOREIGN KEY (`attendee_id`) REFERENCES `event_attendees`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ecfa_field` FOREIGN KEY (`field_id`) REFERENCES `event_custom_fields`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLE DES CANDIDATURES PITCH B2B
CREATE TABLE IF NOT EXISTS `event_pitches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `attendee_id` INT NULL,
  `client_id` INT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `project_title` VARCHAR(255) NOT NULL,
  `presentation` TEXT NOT NULL,
  `needs` TEXT NULL,
  `speaker_name` VARCHAR(150) NOT NULL,
  `speaker_role` VARCHAR(150) NULL,
  `speaker_bio` TEXT NULL,
  `speaker_photo_url` VARCHAR(500) NULL,
  `slide_deck_url` VARCHAR(500) NULL,
  `video_url` VARCHAR(500) NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `speaking_order` INT NULL,
  `pitch_time` VARCHAR(20) NULL,
  `moderator_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pitch_event` (`event_id`),
  INDEX `idx_pitch_attendee` (`attendee_id`),
  INDEX `idx_pitch_client` (`client_id`),
  CONSTRAINT `fk_pitch_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLE DES CRÉNEAUX DE RENDEZ-VOUS B2B
CREATE TABLE IF NOT EXISTS `event_meeting_slots` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `partner_id` INT NULL,
  `table_number` VARCHAR(50) NULL,
  `start_time` VARCHAR(10) NOT NULL,
  `end_time` VARCHAR(10) NOT NULL,
  `is_booked` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_slot_event` (`event_id`),
  INDEX `idx_slot_partner` (`partner_id`),
  CONSTRAINT `fk_slot_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLE DES RÉSERVATIONS DE RENDEZ-VOUS B2B
CREATE TABLE IF NOT EXISTS `event_meeting_bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slot_id` INT NOT NULL,
  `attendee_id` INT NULL,
  `client_id` INT NULL,
  `partner_id` INT NULL,
  `attendee_name` VARCHAR(150) NOT NULL,
  `attendee_email` VARCHAR(255) NOT NULL,
  `attendee_company` VARCHAR(255) NULL,
  `purpose` TEXT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'confirmed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_booking_slot` (`slot_id`),
  INDEX `idx_booking_attendee` (`attendee_id`),
  INDEX `idx_booking_client` (`client_id`),
  INDEX `idx_booking_partner` (`partner_id`),
  CONSTRAINT `fk_booking_slot` FOREIGN KEY (`slot_id`) REFERENCES `event_meeting_slots`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLE DES LOTS DE LA TOMBOLA
CREATE TABLE IF NOT EXISTS `event_tombola_prizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `donor_name` VARCHAR(255) NULL,
  `donor_logo_url` VARCHAR(500) NULL,
  `value_estimate` DECIMAL(10,2) NULL,
  `display_order` INT NOT NULL DEFAULT 1,
  `winner_attendee_id` INT NULL,
  `winner_name` VARCHAR(150) NULL,
  `winner_ticket_code` VARCHAR(50) NULL,
  `drawn_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_prize_event` (`event_id`),
  INDEX `idx_prize_winner` (`winner_attendee_id`),
  CONSTRAINT `fk_prize_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLE DES TICKETS DE TOMBOLA
CREATE TABLE IF NOT EXISTS `event_tombola_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `attendee_id` INT NOT NULL,
  `ticket_number` VARCHAR(50) NOT NULL,
  `purchased_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ticket_event` (`event_id`),
  INDEX `idx_ticket_attendee` (`attendee_id`),
  CONSTRAINT `fk_tticket_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tticket_attendee` FOREIGN KEY (`attendee_id`) REFERENCES `event_attendees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

