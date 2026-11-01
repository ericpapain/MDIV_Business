-- ==============================================================================
-- Structure de la base de données MySQL pour MDIV Business SaaS
-- À importer dans le PHPMyAdmin d'OVH ou exécuté automatiquement par le backend
-- ==============================================================================

-- 1. Table des Entreprises (Comptes Entreprises & Multi-tenant hermétique)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siren` VARCHAR(9) UNIQUE DEFAULT NULL,
  `siret` VARCHAR(14) DEFAULT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `trade_name` VARCHAR(255) DEFAULT NULL,
  `legal_form` VARCHAR(150) DEFAULT NULL,
  `naf_code` VARCHAR(20) DEFAULT NULL,
  `activity` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `city` VARCHAR(150) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'France',
  `creation_date` VARCHAR(50) DEFAULT NULL,
  `administrative_status` VARCHAR(50) DEFAULT 'ACTIVE',
  `employee_range` VARCHAR(100) DEFAULT NULL,
  `capital` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(30) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `iban` VARCHAR(40) DEFAULT NULL,
  `bic` VARCHAR(15) DEFAULT NULL,
  `plan_tier` ENUM('free', 'starter', 'pro', 'enterprise') DEFAULT 'free',
  `company_status` ENUM('ACTIVE', 'SIREN_PENDING', 'MANUAL', 'INACTIVE') DEFAULT 'ACTIVE',
  `data_source` ENUM('INSEE', 'INPI', 'BODACC', 'PAPPERS', 'MANUAL') DEFAULT 'INSEE',
  `official_data` JSON DEFAULT NULL COMMENT 'Snapshot brut certifié des sources officielles',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mot de passe principal ou rétro-compatible',
  `google_id` VARCHAR(100) DEFAULT NULL COMMENT 'Identifiant unique Google OAuth 2.0 (sub)',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT 'Photo de profil Google',
  `auth_provider` ENUM('local', 'google', 'microsoft', 'apple') DEFAULT 'local',
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_siren` (`siren`),
  INDEX `idx_email` (`email`),
  INDEX `idx_comp_google` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1b. Table des Utilisateurs / Collaborateurs (1 Entreprise -> N Utilisateurs)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `job_title` VARCHAR(150) DEFAULT 'Dirigeant',
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'MANAGER', 'USER') DEFAULT 'ADMIN',
  `email_verified` TINYINT(1) DEFAULT 1,
  `verification_token` VARCHAR(255) DEFAULT NULL,
  `google_id` VARCHAR(100) DEFAULT NULL COMMENT 'Identifiant unique Google OAuth 2.0 (sub)',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT 'Photo de profil Google',
  `auth_provider` ENUM('local', 'google', 'microsoft', 'apple') DEFAULT 'local',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_google` (`google_id`),
  CONSTRAINT `fk_users_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1c. Table Cache des Requêtes API SIREN (Évite les quotas et requêtes inutiles)
CREATE TABLE IF NOT EXISTS `company_api_cache` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siren` VARCHAR(9) NOT NULL UNIQUE,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'INSEE_RECHERCHE_GOUV',
  `response_json` LONGTEXT NOT NULL,
  `fetched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  INDEX `idx_cache_siren` (`siren`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des Diagnostics IA réalisés
CREATE TABLE IF NOT EXISTS `diagnostics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `diagnostic_type` VARCHAR(100) NOT NULL DEFAULT 'express',
  `questions_answers` JSON NOT NULL COMMENT 'Historique de la conversation',
  `score` INT NOT NULL,
  `report` JSON NOT NULL COMMENT 'Synthèse, insights et recommandations',
  `status` ENUM('completed', 'failed', 'pending') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_company_diagnostic` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des Clients (par Entreprise - Conformité Annuaire Central PPF & Facturation 2026)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `siren` VARCHAR(9) NULL,
  `siret` VARCHAR(14) NULL,
  `vat_number` VARCHAR(30) NULL,
  `country_code` VARCHAR(2) NOT NULL DEFAULT 'FR',
  `address` TEXT DEFAULT NULL,
  `postal_code` VARCHAR(10) NULL,
  `city` VARCHAR(100) NULL,
  `ppf_routing_id` VARCHAR(50) NULL COMMENT 'Identifiant Annuaire Central PPF/PDP',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_clients_siret` (`siret`),
  INDEX `idx_clients_siren` (`siren`),
  CONSTRAINT `fk_clients_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des Produits & Services (Catalogue)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `default_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `category` VARCHAR(100) DEFAULT 'service',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table des Devis IA
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT DEFAULT NULL,
  `quote_number` VARCHAR(100) NOT NULL,
  `status` ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
  `total_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `executive_summary` TEXT DEFAULT NULL,
  `payment_terms` VARCHAR(255) DEFAULT '30 jours net',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_quotes_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_quotes_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table des Factures IA & Audit Légal (Conformité Facturation Électronique 2026 / PPF & PDP)
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT DEFAULT NULL,
  `quote_id` INT DEFAULT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `operation_nature` ENUM('goods', 'services', 'mixed') NOT NULL DEFAULT 'services',
  `vat_payment_on_debit` TINYINT(1) NOT NULL DEFAULT 0,
  `amount_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
  `invoice_type_code` VARCHAR(5) NOT NULL DEFAULT '380' COMMENT '380: Facture, 381: Avoir, 384: Rectificative, 389: Acompte',
  `status` ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  `ppf_deposit_id` VARCHAR(100) NULL COMMENT 'Identifiant unique transaction PPF',
  `ppf_status` ENUM('DEPOSEE', 'ACHEMINEE', 'REJETEE', 'REFUSEE', 'MISE_A_DISPOSITION', 'PRISE_EN_CHARGE', 'APPROUVEE', 'PAIEMENT_TRANSMIS', 'PAYEE') NOT NULL DEFAULT 'DEPOSEE',
  `rejection_reason` TEXT NULL,
  `sha256_hash` VARCHAR(64) NULL COMMENT 'Empreinte cryptographique Piste d Audit Fiable',
  `previous_invoice_hash` VARCHAR(64) NULL COMMENT 'Chaînage séquentiel inaltérable',
  `pdp_status` VARCHAR(50) DEFAULT 'DEPOSITED',
  `pdp_operator` VARCHAR(100) DEFAULT 'PDP n° 0039',
  `xml_content` LONGTEXT NULL,
  `legal_check_result` JSON DEFAULT NULL COMMENT 'Rapport de conformité IA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_invoices_ppf_status` (`ppf_status`),
  INDEX `idx_invoices_number` (`invoice_number`),
  CONSTRAINT `fk_invoices_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_invoices_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6b. Table des Lignes d'Articles (Items conformes norme sémantique EN 16931)
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `line_number` INT NOT NULL DEFAULT 1,
  `description` TEXT NOT NULL,
  `quantity` DECIMAL(12,4) NOT NULL DEFAULT 1.0000,
  `unit_code` VARCHAR(10) NOT NULL DEFAULT 'H87' COMMENT 'Code UN/ECE Rec 20 (H87: pièce, HUR: heure, MTK: m2)',
  `unit_price_ht` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `vat_rate` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `vat_category_code` VARCHAR(5) NOT NULL DEFAULT 'S' COMMENT 'S: Standard, Z: Zéro, E: Exonéré, AE: Autoliquidation',
  `vat_exemption_reason` VARCHAR(255) NULL COMMENT 'Motif légal d exonération obligatoire si taux zéro',
  `discount_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `line_total_ht` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  INDEX `idx_items_invoice` (`invoice_id`),
  CONSTRAINT `fk_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6c. Table des Règlements & E-Reporting des Prestations de Services
CREATE TABLE IF NOT EXISTS `invoice_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `company_id` INT NOT NULL,
  `payment_date` DATE NOT NULL,
  `amount_paid` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('transfer', 'check', 'card', 'direct_debit', 'cash') NOT NULL DEFAULT 'transfer',
  `transaction_reference` VARCHAR(100) NULL,
  `e_reporting_transmitted` TINYINT(1) NOT NULL DEFAULT 0,
  `e_reporting_date` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_payments_invoice` (`invoice_id`),
  INDEX `idx_payments_company` (`company_id`),
  CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6d. Table du Journal d'Audit Inaltérable (Piste d'Audit Fiable - PAF Art. 289-VII-1° CGI)
CREATE TABLE IF NOT EXISTS `paf_invoice_audit_trail` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'CREATION, SIGNATURE, DEPOT_PPF, CHANGEMENT_STATUT, PAIEMENT',
  `previous_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `payload_hash` VARCHAR(64) NOT NULL,
  `operator_id` INT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_paf_invoice` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table des Relances de Paiement & Dossiers Impayés
CREATE TABLE IF NOT EXISTS `followups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `type` ENUM('invoice', 'quote', 'meeting', 'inactive_client') DEFAULT 'invoice',
  `reference` VARCHAR(100) NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `days_pending` INT NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'sent', 'escalated', 'resolved') DEFAULT 'pending',
  `tone` VARCHAR(50) DEFAULT 'cordial',
  `generated_email` TEXT DEFAULT NULL,
  `last_sent_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_followups_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table des Projets & Travaux
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT DEFAULT NULL,
  `quote_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `budget` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('draft', 'in_progress', 'completed', 'cancelled') DEFAULT 'in_progress',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_projects_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_projects_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table des Intégrations Google Workspace & Microsoft 365 (OAuth 2.0 Multi-Tenant)
CREATE TABLE IF NOT EXISTS `company_integrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `provider` ENUM('google', 'microsoft') NOT NULL,
  `account_email` VARCHAR(255) NOT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT DEFAULT NULL,
  `token_expires_at` DATETIME NOT NULL,
  `scopes` TEXT DEFAULT NULL,
  `status` ENUM('connected', 'expired', 'revoked') DEFAULT 'connected',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_company_provider` (`company_id`, `provider`),
  CONSTRAINT `fk_integrations_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table des Factures Reçues, Dépenses & Frais Chantier (Artisans & PME)
CREATE TABLE IF NOT EXISTS `company_expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `project_id` INT DEFAULT NULL COMMENT 'Rattachement au chantier pour calcul marge',
  `client_id` INT DEFAULT NULL,
  `merchant` VARCHAR(255) NOT NULL COMMENT 'Nom du marchand / fournisseur',
  `category` ENUM('carburant', 'peage', 'materiaux', 'location_materiel', 'repas', 'outillage', 'sous_traitance', 'autre') NOT NULL DEFAULT 'autre',
  `date` DATE NOT NULL,
  `invoice_number` VARCHAR(100) DEFAULT NULL,
  `total_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `vat_details` JSON DEFAULT NULL COMMENT 'Ventilation des taux TVA (ex: 20%, 10%, 5.5%)',
  `payment_method` VARCHAR(50) DEFAULT 'CB',
  `receipt_image_path` VARCHAR(500) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `confidence_score` DECIMAL(4,2) DEFAULT 0.95,
  `status` ENUM('valide', 'a_verifier') DEFAULT 'valide',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expenses_company` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_expenses_project` 
    FOREIGN KEY (`project_id`) 
    REFERENCES `projects`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_expenses_client` 
    FOREIGN KEY (`client_id`) 
    REFERENCES `clients`(`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table des Actualités Principales du Hero (Slider d'accueil)
CREATE TABLE IF NOT EXISTS `hero_news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `comment` TEXT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500) DEFAULT NULL,
  `tag` VARCHAR(100) DEFAULT 'Actualité Principale',
  `order_num` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table des Articles de Blog / Actualités BNE
CREATE TABLE IF NOT EXISTS `blog_articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'BNE BUSINESS',
  `color` VARCHAR(50) DEFAULT 'gold',
  `date` VARCHAR(50) NOT NULL,
  `desc` TEXT NOT NULL,
  `img` VARCHAR(500) NOT NULL,
  `tags` JSON DEFAULT NULL,
  `sections` JSON DEFAULT NULL COMMENT 'Sections alternées {image, subtitle, text}',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'Article principal / À la une du blog',
  `show_in_slider` TINYINT(1) DEFAULT 0 COMMENT 'Afficher dans le slider hero de l\'accueil',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Table des Visites & Événements Analytics (Tableau de bord de type GA4/Matomo/Plausible)
CREATE TABLE IF NOT EXISTS `analytics_visits` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) NOT NULL,
  `visitor_id` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'France',
  `country_code` VARCHAR(10) DEFAULT 'FR',
  `city` VARCHAR(150) DEFAULT 'Paris',
  `page_path` VARCHAR(255) NOT NULL,
  `page_title` VARCHAR(255) DEFAULT '',
  `referrer` VARCHAR(500) DEFAULT '',
  `referrer_source` VARCHAR(100) DEFAULT 'Direct',
  `user_agent` TEXT,
  `browser` VARCHAR(100) DEFAULT 'Chrome',
  `os` VARCHAR(100) DEFAULT 'Windows',
  `device_type` VARCHAR(50) DEFAULT 'Desktop',
  `duration_seconds` INT DEFAULT 0,
  `is_exit` TINYINT(1) DEFAULT 0,
  `is_bounce` TINYINT(1) DEFAULT 0,
  `conversion_event` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_analytics_session` (`session_id`),
  INDEX `idx_analytics_visitor` (`visitor_id`),
  INDEX `idx_analytics_created` (`created_at`),
  INDEX `idx_analytics_page` (`page_path`),
  INDEX `idx_analytics_country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table des Partenaires & Alliances
CREATE TABLE IF NOT EXISTS `partners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(150) DEFAULT 'Partenaire',
  `country` VARCHAR(100) DEFAULT 'France',
  `flag` VARCHAR(10) DEFAULT '🇫🇷',
  `sector` VARCHAR(255) DEFAULT '',
  `website` VARCHAR(255) DEFAULT '',
  `logo_url` VARCHAR(500) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `partners` (`name`, `category`, `country`, `flag`, `sector`, `website`, `logo_url`) 
VALUES 
  ('ITID France', 'Santé & Médecine Interventionnelle', 'France', '🇫🇷', 'Institut de la Douleur · Dr Jerry Mezat', 'https://itid-france.com', '/assets/logos/logo-itid.png'),
  ('Belkinois', 'Hospitalité & Prestige', 'France', '🇫🇷', 'Gastronomie & Réception Privée', '', '/assets/Logo Ambassador et partenaires/belkinois.jpg'),
  ('Stéphane Grodin', 'Stratégie & Affaires', 'France', '🇫🇷', 'Partenaire & Ambassadeur BNE', '', '/assets/Logo Ambassador et partenaires/Stephane Grodin logo.jpeg'),
  ('IT4ALL', 'Numérique & IA', 'Europe', '🇪🇺', 'Technologies Digitales & Solutions SaaS', '', '/IT4ALL.jpeg')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- 14. Table des Boîtes de Messagerie Connectées (Multi-fournisseurs universel)
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

-- 15. Table d'Indexation et d'Historique des Échanges d'Emails (Inbound & Outbound)
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



