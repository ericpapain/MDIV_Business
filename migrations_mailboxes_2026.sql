-- ==============================================================================
-- Migration SQL : Hub de Messagerie Universelle & Historique des Échanges (OBJ-2)
-- Compatibilité : MySQL 5.7+ / MySQL 8.0 / MariaDB / OVH PHPMyAdmin
-- Idempotent : Peut être exécuté plusieurs fois sans erreur
-- ==============================================================================

-- 1. Table des Boîtes de Messagerie Connectées (Multi-fournisseurs universel)
CREATE TABLE IF NOT EXISTS `company_mailboxes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(150) DEFAULT NULL,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'custom_imap' COMMENT 'gmail, itid_ovh, ovh, outlook, yahoo, icloud, custom_imap',
  `imap_host` VARCHAR(255) NOT NULL,
  `imap_port` INT NOT NULL DEFAULT 993,
  `imap_ssl` TINYINT(1) NOT NULL DEFAULT 1,
  `imap_user` VARCHAR(255) NOT NULL,
  `imap_password` TEXT NOT NULL,
  `smtp_host` VARCHAR(255) NOT NULL,
  `smtp_port` INT NOT NULL DEFAULT 465,
  `smtp_ssl` TINYINT(1) NOT NULL DEFAULT 1,
  `smtp_user` VARCHAR(255) NOT NULL,
  `smtp_password` TEXT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_sync_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mailbox_company` (`company_id`),
  INDEX `idx_mailbox_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table d'Indexation et d'Historique des Échanges d'Emails (Inbound & Outbound)
CREATE TABLE IF NOT EXISTS `email_threads_cache` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `mailbox_id` INT NOT NULL,
  `message_id` VARCHAR(255) NOT NULL,
  `direction` ENUM('inbound', 'outbound') NOT NULL DEFAULT 'inbound',
  `sender_email` VARCHAR(255) NOT NULL,
  `sender_name` VARCHAR(150) DEFAULT NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `recipient_name` VARCHAR(150) DEFAULT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `snippet` TEXT DEFAULT NULL,
  `body_text` LONGTEXT DEFAULT NULL,
  `body_html` LONGTEXT DEFAULT NULL,
  `received_at` DATETIME NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `has_attachments` TINYINT(1) NOT NULL DEFAULT 0,
  `raw_headers` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_thread_company` (`company_id`),
  INDEX `idx_thread_mailbox` (`mailbox_id`),
  INDEX `idx_thread_sender` (`sender_email`),
  INDEX `idx_thread_recipient` (`recipient_email`),
  INDEX `idx_thread_date` (`received_at`),
  UNIQUE KEY `uniq_msg_mailbox` (`mailbox_id`, `message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
