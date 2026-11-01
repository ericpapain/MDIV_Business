-- ==============================================================================
-- MIGRATION MODULE PRISE DE RENDEZ-VOUS EN LIGNE 24H/24 & LIENS D'INVITATION
-- CIBLE : BASE DE DONNÉES MYSQL (PHPMyAdmin / OVH / PRODUCTION)
-- SÉCURITÉ : Idempotente (IF NOT EXISTS), compatible multi-tenant (company_id)
-- ==============================================================================

-- 1. TABLE DES RENDEZ-VOUS (APPOINTMENTS)
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(100) PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT NULL,
  `booking_link_token` VARCHAR(100) NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_email` VARCHAR(255) NULL,
  `client_phone` VARCHAR(50) NULL,
  `appointment_type` VARCHAR(100) NOT NULL DEFAULT 'visite_chantier',
  `title` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `time` VARCHAR(10) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 45,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Sur place / Chantier',
  `notes` TEXT NULL,
  `cancellation_reason` TEXT NULL,
  `status` ENUM('confirmed', 'pending', 'completed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'confirmed',
  `source` ENUM('online_booking', 'manual', 'phone', 'website', 'link_invitation') NOT NULL DEFAULT 'online_booking',
  `meeting_url` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_apt_company_date` (`company_id`, `date`),
  INDEX `idx_apt_status` (`status`),
  INDEX `idx_apt_token` (`booking_link_token`),
  CONSTRAINT `fk_apt_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLE DES LIENS D'INVITATION RAPIDES (BOOKING LINKS - CRÉATION < 1 MIN)
CREATE TABLE IF NOT EXISTS `booking_links` (
  `id` VARCHAR(100) PRIMARY KEY,
  `token` VARCHAR(100) NOT NULL UNIQUE,
  `company_id` INT NOT NULL,
  `client_id` INT NULL,
  `client_name` VARCHAR(255) NULL,
  `client_phone` VARCHAR(50) NULL,
  `client_email` VARCHAR(255) NULL,
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `appointment_type` VARCHAR(100) NOT NULL DEFAULT 'standard',
  `title` VARCHAR(255) NOT NULL DEFAULT 'Rendez-vous',
  `notes` TEXT NULL,
  `status` ENUM('active', 'used', 'expired', 'revoked') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_link_token` (`token`),
  INDEX `idx_link_company` (`company_id`),
  CONSTRAINT `fk_link_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLE DES PARAMÈTRES ET DISPONIBILITÉS (APPOINTMENT SETTINGS)
CREATE TABLE IF NOT EXISTS `appointment_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL UNIQUE,
  `booking_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `public_slug` VARCHAR(100) NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Prendre rendez-vous en ligne',
  `description` TEXT NULL,
  `working_days` JSON NOT NULL COMMENT '[1,2,3,4,5]',
  `working_hours` JSON NOT NULL COMMENT '{"start":"08:30","end":"18:30"}',
  `day_schedules` JSON NULL COMMENT 'Horaires détaillés jour par jour',
  `slot_duration` INT NOT NULL DEFAULT 45,
  `buffer_between_slots` INT NOT NULL DEFAULT 15,
  `notice_hours_min` INT NOT NULL DEFAULT 2,
  `max_days_ahead` INT NOT NULL DEFAULT 60,
  `holidays` JSON NULL COMMENT 'Jours de congés / absences format YYYY-MM-DD',
  `blocked_slots` JSON NULL COMMENT 'Créneaux ponctuels bloqués',
  `appointment_types` JSON NULL COMMENT 'Catalogue des types de RDV configurés',
  `auto_reminders` JSON NULL COMMENT 'Paramètres des rappels automatiques email/SMS',
  `calendar_sync` JSON NULL COMMENT 'Statut synchronisation Google / Outlook',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_settings_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLE DES NOTIFICATIONS DE RENDEZ-VOUS EN TEMPS RÉEL (APPOINTMENT NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS `appointment_notifications` (
  `id` VARCHAR(100) PRIMARY KEY,
  `company_id` INT NOT NULL,
  `appointment_id` VARCHAR(100) NULL,
  `type` ENUM('new_booking', 'cancelled', 'rescheduled', 'reminder') NOT NULL DEFAULT 'new_booking',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_company` (`company_id`, `is_read`),
  CONSTRAINT `fk_notif_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
