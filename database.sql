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
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_siren` (`siren`),
  INDEX `idx_email` (`email`)
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
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
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

-- 3. Table des Clients (par Entreprise)
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

-- 6. Table des Factures IA & Audit Légal
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT DEFAULT NULL,
  `quote_id` INT DEFAULT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `amount_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  `pdp_status` VARCHAR(50) DEFAULT 'DEPOSITED',
  `pdp_operator` VARCHAR(100) DEFAULT 'PDP n° 0039',
  `xml_content` LONGTEXT NULL,
  `legal_check_result` JSON DEFAULT NULL COMMENT 'Rapport de conformité IA',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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


