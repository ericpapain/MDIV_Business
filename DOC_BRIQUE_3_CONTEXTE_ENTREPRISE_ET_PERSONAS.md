# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 3 : Moteur de Contexte d'Entreprise & Injection de Persona Métier Dynamique

---

## 1. Vue d'Ensemble & Problématique Métier

Un modèle de langage générique (ex: ChatGPT brut) génère des réponses vagues, généralistes et déconnectées du contexte sectoriel de l'entreprise. 
- Pour un **artisan électricien**, omettre la norme française **NF C 15-100** ou l'attestation **Consuel** constitue une faute professionnelle.
- Pour une **clinique vétérinaire**, ignorer la **déontologie ordinale**, le secret médical ou la gestion des **DASRI** rend le document inutilisable.
- Pour un **éditeur SaaS**, ne pas mentionner les **SLA 99.9%** ou la certification **ISO 27001** disqualifie une proposition commerciale.

La **Brique 3** résout ce défi en injectant dynamiquement la **carte d'identité légale de l'entreprise**, son **code NAF** et une **posture d'expert sectoriel ultra-spécifique** au cœur des prompts de tous les agents IA.

---

## 2. Schéma de la Base de Données Relationnelle (MySQL / OVH)

### Table `companies` (Profil de l'entreprise active)
```sql
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siren` VARCHAR(9) NULL,
  `siret` VARCHAR(14) NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `trade_name` VARCHAR(255) DEFAULT NULL,
  `legal_form` VARCHAR(150) DEFAULT NULL,
  `naf_code` VARCHAR(20) DEFAULT NULL,
  `activity` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `city` VARCHAR(150) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'France',
  `plan_tier` ENUM('free', 'starter', 'pro', 'enterprise') DEFAULT 'free',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_siren` (`siren`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table `saved_work` (Mémoire opérationnelle des précédents livrables)
```sql
CREATE TABLE IF NOT EXISTS `saved_work` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `tool_type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_savedwork_company` (`company_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Matrice de Détection des Personas & Règles Sectorielles

Le moteur [context_engine.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/context_engine.php) analyse les champs `activity`, `naf_code` et `company_name` via expressions régulières pour assigner instantanément la posture experte adéquate :

| Secteur Détecté | Code NAF / Mots-clés | Posture Experte Assignée | Directives Métier Injectées |
| :--- | :--- | :--- | :--- |
| **Électricité & Domotique** | `43.21A`, `electri`, `cablage`, `differentiel` | **Expert Technique Électricité & Normes Électriques** | - Réfère-toi aux normes françaises (NF C 15-100, NF C 18-510, directives Consuel).<br>- Vérifie disjoncteurs 30mA, section câbles, prise de terre.<br>- Mentionne garantie décennale et RGE/Qualifelec. |
| **Santé & Vétérinaire** | `75.00Z`, `86.x`, `veterinaire`, `clinique`, `soin` | **Expert Santé & Déontologie Médicale / Vétérinaire** | - Respecte le code de déontologie ordinale et traçabilité des soins.<br>- Vérifie conformité DASRI et ordonnancier des stupéfiants.<br>- Ton empathique, scientifique et rigoureux. |
| **Bâtiment & Génie Civil** | `41.x`, `43.x`, `batiment`, `maconnerie`, `plomberie` | **Expert BTP, Gros-Œuvre & Génie Civil** | - Respect strict des DTU (Documents Techniques Unifiés).<br>- Sécurité chantier (PPSPS, EPI), assurances décennales et pénalités de retard. |
| **Droit & Conseil** | `69.x`, `70.x`, `avocat`, `juridique`, `audit`, `fiscal` | **Expert Légal, Conformité & Droit des Affaires** | - Conformité au Code de commerce et RGPD.<br>- Détection de clauses abusives et déséquilibres contractuels. |
| **Tech & SaaS** | `62.x`, `software`, `saas`, `cloud`, `informatique` | **Architecte Systèmes d'Information, SaaS & Cybersécurité** | - Normes ISO 27001, NIS 2, RGPD et SLAs (99.9%).<br>- Propriété intellectuelle et scalabilité technique. |

---

## 4. Format du Bloc d'Injection Contextuelle

Le moteur génère dynamiquement la chaîne suivante, injectée en en-tête des prompts de chaque agent :

```text
==================================================
CONTEXTE DU COMPTE ENTREPRISE ACTIVE :
- Raison Sociale : Volt & Co Électricité
- SIREN : 912345678
- Forme juridique : SASU
- Activité déclarée : Travaux d'installation électrique dans tous locaux
- Siège / Implantation : Lyon (69003)
- POSTURE EXPERTE ASSIGNÉE : Expert Technique Électricité & Normes Électriques

RÈGLES SECTORIELLES ÉLECTRICITÉ :
- Réfère-toi aux normes françaises en vigueur (notamment la norme NF C 15-100, NF C 18-510 pour les habilitations, et les directives Consuel).
- Vérifie toujours la sécurité des personnes (disjoncteurs différentiels 30mA, section des conducteurs, mise à la terre).
- Mentionne systématiquement les obligations de garantie décennale et les certifications RGE / Qualifelec si pertinent.

HISTORIQUE RÉCENT DES LIVRABLES DE L'ENTREPRISE (pour cohérence continue) :
  * [QUOTE] Rénovation tableau atelier : Remplacement armoire et passage en triphasé...
  * [INVOICE] Facture FAC-2026-042 : Pose de goulottes et raccordement 32A...
==================================================
```

---

## 5. Validation Automatisée (Suite de Tests Brique 3)

La suite `tests/test_brick3_context_engine.mjs` vérifie :
1. La correspondance parfaite entre les codes NAF et les postures expertes.
2. La présence systématique des normes obligatoires dans les sorties d'agents.
3. L'isolation stricte des profils : deux entreprises distinctes reçoivent des contextes 100% étanches.
