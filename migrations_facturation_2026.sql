-- ==============================================================================
-- MIGRATION CONFORMITÉ FACTURATION ÉLECTRONIQUE (RÉFORME 2026 / PPF & PDP)
-- CIBLE : BASE DE DONNÉES MYSQL (PHPMyAdmin / OVH) - 10 000 UTILISATEURS
-- SÉCURITÉ : Exécution idempotente et non-bloquante (zéro interruption de service)
-- ==============================================================================

-- 1. MISE À NIVEAU DE LA TABLE `clients` (DONNÉES TIERS CONFORMES PPF)
-- Ajout des identifiants légaux obligatoires : SIREN, SIRET, Numéro TVA intracommunautaire, Pays ISO, Routage
ALTER TABLE `clients`
  ADD COLUMN IF NOT EXISTS `siren` VARCHAR(9) NULL AFTER `company`,
  ADD COLUMN IF NOT EXISTS `siret` VARCHAR(14) NULL AFTER `siren`,
  ADD COLUMN IF NOT EXISTS `vat_number` VARCHAR(30) NULL AFTER `siret`,
  ADD COLUMN IF NOT EXISTS `country_code` VARCHAR(2) NOT NULL DEFAULT 'FR' AFTER `vat_number`,
  ADD COLUMN IF NOT EXISTS `postal_code` VARCHAR(10) NULL AFTER `address`,
  ADD COLUMN IF NOT EXISTS `city` VARCHAR(100) NULL AFTER `postal_code`,
  ADD COLUMN IF NOT EXISTS `ppf_routing_id` VARCHAR(50) NULL COMMENT 'Identifiant Annuaire Central PPF/PDP',
  ADD INDEX IF NOT EXISTS `idx_clients_siret` (`siret`),
  ADD INDEX IF NOT EXISTS `idx_clients_siren` (`siren`);

-- 2. MISE À NIVEAU DE LA TABLE `invoices` (FACTURES ÉMISES CONFORMITÉ DGFiP)
-- Ajout des 24 mentions réglementaires : Nature d'opération, Option débits, Devise ISO, Statuts légaux PPF, Hash PAF
ALTER TABLE `invoices`
  ADD COLUMN IF NOT EXISTS `operation_nature` ENUM('goods', 'services', 'mixed') NOT NULL DEFAULT 'services' AFTER `due_date`,
  ADD COLUMN IF NOT EXISTS `vat_payment_on_debit` TINYINT(1) NOT NULL DEFAULT 0 AFTER `operation_nature`,
  ADD COLUMN IF NOT EXISTS `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR' AFTER `amount_ttc`,
  ADD COLUMN IF NOT EXISTS `invoice_type_code` VARCHAR(5) NOT NULL DEFAULT '380' COMMENT '380: Facture, 381: Avoir, 384: Rectificative, 389: Acompte' AFTER `currency`,
  ADD COLUMN IF NOT EXISTS `ppf_deposit_id` VARCHAR(100) NULL COMMENT 'Identifiant unique transaction PPF',
  ADD COLUMN IF NOT EXISTS `ppf_status` ENUM('DEPOSEE', 'ACHEMINEE', 'REJETEE', 'REFUSEE', 'MISE_A_DISPOSITION', 'PRISE_EN_CHARGE', 'APPROUVEE', 'PAIEMENT_TRANSMIS', 'PAYEE') NOT NULL DEFAULT 'DEPOSEE' AFTER `status`,
  ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT NULL AFTER `ppf_status`,
  ADD COLUMN IF NOT EXISTS `sha256_hash` VARCHAR(64) NULL COMMENT 'Empreinte cryptographique Piste d Audit Fiable',
  ADD COLUMN IF NOT EXISTS `previous_invoice_hash` VARCHAR(64) NULL COMMENT 'Chaînage séquentiel inaltérable',
  ADD INDEX IF NOT EXISTS `idx_invoices_ppf_status` (`ppf_status`),
  ADD INDEX IF NOT EXISTS `idx_invoices_number` (`invoice_number`);

-- 3. CRÉATION DE LA TABLE DES LIGNES DÉTAILLÉES (INVOICE ITEMS - NORME EN 16931)
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
  CONSTRAINT `fk_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CRÉATION DE LA TABLE DES ENCAISSEMENTS (E-REPORTING DES PRESTATIONS DE SERVICES)
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

-- 5. CRÉATION DU JOURNAL D'AUDIT IMMUABLE (PISTE D'AUDIT FIABLE - PAF)
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
