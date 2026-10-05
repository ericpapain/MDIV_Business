# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 4 : Garde-Fous Fiscaux & Délibération Multi-Agents sur Factures et Devis

---

## 1. Vue d'Ensemble & Défis Réglementaires 2026

La facturation et le chiffrage commercial sont des activités hautement sensibles. En France, la réforme de la **facturation électronique obligatoire (Factur-X / PDP 2026)** et le renforcement des sanctions pour omission de mentions légales (amendes de 15 € par mention manquante selon l'art. 1737 II du CGI) imposent une rigueur sans faille.

La **Brique 4** dote la plateforme de deux pipelines d'arbitrage dédiés :
1. **Module Audit Facture (`invoice_ai_check.php`)** : Un comité d'experts juridiques et financiers traque les non-conformités, vérifie le calcul de TVA et valide les mentions obligatoires.
2. **Module Chiffrage Devis (`quote_ai_assist.php`)** : Un comité métreur et négociateur commercial découpe les prestations, protège les marges et formule des conditions de paiement sécurisantes.

---

## 2. Délibération Multi-Agents pour la Facturation

```
   ┌────────────────────────────────────────────────────────────────┐
   │                     FACTURE SOUMISE À L'AUDIT                  │
   │        Montants HT/TVA/TTC, Siret, Date, Modalités             │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ ⚖️ AGENT 1 : AUDITEUR FISCAL & JURISTE B2B                    │
   │ Rôle : Contrôle rigoureux des mentions obligatoires            │
   │ (Code de commerce L. 441-9, Factur-X, N° TVA intracommunautaire│
   │ pénalités de retard à 3x le taux légal + 40€ d'indemnité).     │
   └───────────────────────────────┬────────────────────────────────┘
                                   │ Audit de conformité fiscale
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ 📉 AGENT 2 : CONTRÔLEUR DE GESTION & RISQUES D'IMPAYÉS         │
   │ Rôle : Vérifie la cohérence arithmétique des lignes, analyse   │
   │ le risque de solvabilité du client et la date d'échéance.      │
   └───────────────────────────────┬────────────────────────────────┘
                                   │ Analyse de risque trésorerie
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ 🏛️ AGENT 3 : DIRECTEUR ADMINISTRATIF ET FINANCIER (DAF)       │
   │ Rôle : Synthétise le verdict final (Conforme / Réserves / Rejet│
   │ et fournit la liste des rectifications impératives.            │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │                    RAPPORT DE CONFORMITÉ FISCALE               │
   │           Score /100, Statut de conformité & Mentions          │
   └────────────────────────────────────────────────────────────────┘
```

---

## 3. Délibération Multi-Agents pour le Chiffrage Commercial (Devis)

Dans [quote_ai_assist.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/quote_ai_assist.php), le chiffrage s'effectue en 3 étapes :

1. **Tour 1 : Métreur & Chiffreur Technique** :
   - Découpe le besoin en fournitures et main d'œuvre quantifiables.
   - Intègre les exigences du métier (ex: NF C 15-100 pour un électricien).
2. **Tour 2 : Négociateur Commercial & Risques de Marge** :
   - Évalue la compétitivité du prix et les risques de surcoûts d'approvisionnement.
   - Suggère l'ajout d'une clause d'imprévision ou d'un acompte renforcé.
3. **Tour 3 : Directeur Commercial & Validation du Devis** :
   - Émet le devis finalisé avec lignes chiffrées, résumé exécutif et conditions de règlement (`payment_terms`).

---

## 4. Schéma de la Base de Données

```sql
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `client_id` INT DEFAULT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `amount_ht` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_vat` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_ttc` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  `legal_check_result` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_invoice_tenant` (`company_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  INDEX `idx_quote_tenant` (`company_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Exemple Concret de Payload & Sortie

### Requête de Chiffrage Devis
```json
{
  "company_id": 1,
  "clientContext": "Boutique Prêt-à-Porter (Centre-ville)",
  "projectDescription": "Remplacement du tableau électrique vétuste et pose de 8 spots LED basse consommation",
  "budget": "4000 €"
}
```

### Réponse Consolidée du Comité Commercial
```json
{
  "quoteNumber": "DEV-2026-081",
  "executiveSummary": "Mise en conformité intégrale selon la norme NF C 15-100 comprenant la dépose de l'ancien tableau, la pose d'un tableau divisionnaire 3 rangées avec protection différentielle 30mA et l'éclairage LED haute efficacité.",
  "items": [
    {
      "description": "Tableau électrique divisionnaire 3 rangées + 2 disjoncteurs différentiels 30mA 40A type A/AC + disjoncteurs divisionnaires",
      "quantity": 1,
      "unitPrice": 1450.00,
      "vatRate": 20.0
    },
    {
      "description": "Fourniture et pose de 8 spots LED encastrés basse consommation avec alimentation sécurisée",
      "quantity": 8,
      "unitPrice": 95.00,
      "vatRate": 20.0
    },
    {
      "description": "Main d'œuvre qualifiée, mise en sécurité, repérage des circuits et essais d'isolement",
      "quantity": 12,
      "unitPrice": 65.00,
      "vatRate": 20.0
    }
  ],
  "paymentTerms": "Acompte de 40% à la signature du devis, solde à réception des travaux."
}
```

---

## 6. Validation Automatisée (Suite de Tests Brique 4)

Dans `tests/test_brick4_invoice_quote.mjs` :
- Test 1 : Aiguillage d'un compte-rendu soumis dans la facturation ➔ Guardrail actif.
- Test 2 : Aiguillage d'une facture soumise dans le chiffrage de devis ➔ Guardrail actif.
- Test 3 : Chiffrage d'un devis électrique avec respect des normes NF C 15-100 et acompte exigé.
