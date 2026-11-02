-- ==============================================================================
-- MDIV EVENT ENGINE v2.0 - SCRIPT SQL 100% COMPATIBLE PHPMYADMIN & OVH MYSQL
-- Compatible MySQL 5.5, 5.6, 5.7, 8.0 & MariaDB 10.x
-- ==============================================================================

-- 1. TABLES DU SYSTÈME ÉVÉNEMENTIEL (Exécutables directement dans phpMyAdmin)

-- Table des questions sur-mesure par événement
CREATE TABLE IF NOT EXISTS `event_custom_fields` (
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
  INDEX `idx_ecf_evt_order` (`event_id`, `sort_order`, `is_active`),
  INDEX `idx_ecf_key` (`event_id`, `field_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des participants et inscriptions officielles
CREATE TABLE IF NOT EXISTS `event_attendees` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des réponses aux formulaires personnalisés
CREATE TABLE IF NOT EXISTS `event_custom_field_answers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `attendee_id` INT NOT NULL,
  `field_id` INT NOT NULL,
  `field_key` VARCHAR(64) NOT NULL,
  `value_text` TEXT NULL,
  `value_file_url` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ans_att_fld` (`attendee_id`, `field_id`),
  INDEX `idx_ans_fld` (`field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des candidatures Pitch & Showcase
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
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `speaking_order` INT NOT NULL DEFAULT 99,
  `pitch_time` VARCHAR(50) NULL,
  `moderator_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL,
  INDEX `idx_pitch_evt_status` (`event_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables Rendez-vous B2B (Créneaux & Réservations)
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
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_slot_evt_partner` (`event_id`, `partner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `status` VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  `notes` TEXT NULL,
  `appointment_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancelled_at` DATETIME NULL,
  INDEX `idx_mb_slot` (`slot_id`),
  INDEX `idx_mb_evt` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tables Tombola Interactive
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
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `draw_hash` VARCHAR(64) NOT NULL,
  `drawn_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_draw_evt_prize` (`event_id`, `prize_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table Régie & Diffusion Live Écran Géant
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
  `enabled_scenes` LONGTEXT NOT NULL,
  `updated_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
