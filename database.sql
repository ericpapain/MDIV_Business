-- Structure de la base de données MySQL pour MDIV Business SaaS
-- À importer dans le PHPMyAdmin d'OVH

-- 1. Table des Entreprises (Comptes Utilisateurs)
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des Diagnostics réalisés
CREATE TABLE IF NOT EXISTS `diagnostics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `diagnostic_type` VARCHAR(100) NOT NULL DEFAULT 'express',
  `questions_answers` JSON NOT NULL COMMENT 'Historique de la conversation',
  `score` INT NOT NULL,
  `report` JSON NOT NULL COMMENT 'Synthèse, insights et recommandations',
  `status` ENUM('completed', 'failed', 'pending') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Clé étrangère pour lier le diagnostic à l'entreprise
  CONSTRAINT `fk_company_diagnostic` 
    FOREIGN KEY (`company_id`) 
    REFERENCES `companies`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
