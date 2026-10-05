# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 7 : Observabilité, Traçabilité d'Arbitrage & Token Economics (Audit Trail)

---

## 1. Vue d'Ensemble & Gouvernance d'Entreprise

L'adoption de l'IA en entreprise ne peut s'effectuer sans une **gouvernance financière et opérationnelle rigoureuse** :
1. **Contrôle des Coûts (Token Economics)** : Chaque appel d'agent consomme des tokens d'entrée (*Prompt*) et de sortie (*Completion*). Sans observabilité fine, les factures d'API peuvent déraper de façon imprévisible.
2. **Auditabilité Juridique (Consensus Trail)** : Si une décision financière ou un devis litigieux a été produit par l'IA, la direction doit être en mesure d'auditer l'historique complet : *Quel agent a alerté sur le risque ? Quel arbitrage a été retenu ? Pourquoi la décision a-t-elle été validée ?*
3. **Respect des SLAs de Latence** : Les délibérations à 4 agents doivent respecter un temps de réponse acceptable (< 8 secondes).

La **Brique 7** dote MDIV Business d'une pile d'observabilité complète intégrée au cœur du moteur d'inférence.

---

## 2. Métriques Clés & Formules de Token Economics

Les coûts sont calculés en temps réel et stockés en **euros (€)** dans la base de données :

$$\text{Coût Total (€)} = (N_{\text{prompt}} \times \text{Tarif}_{\text{in}}) + (N_{\text{completion}} \times \text{Tarif}_{\text{out}})$$

### Grille Tarifaire Embarquée :
| Modèle | Tarif Input (par 1M tokens) | Tarif Output (par 1M tokens) | Profil d'Usage |
| :--- | :--- | :--- | :--- |
| **OpenAI GPT-4o-mini** | 0,14 € | 0,55 € | Économique & structuré |
| **OpenAI GPT-4o** | 2,30 € | 9,20 € | Raisonnement complexe & audits |
| **Groq Qwen 2.5 27B** | 0,18 € | 0,18 € | Vitesse maximale (LPU) |
| **Mistral Small Latest** | 0,19 € | 0,57 € | Souveraineté européenne |
| **text-embedding-3-large** | 0,12 € | 0,00 € | Indexation vectorielle RAG |

---

## 3. Schéma de la Base de Données (`ai_audit_logs`)

```sql
CREATE TABLE IF NOT EXISTS `ai_audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `session_id` VARCHAR(100) NOT NULL,
  `tool_type` VARCHAR(50) NOT NULL COMMENT 'meeting, invoice, quote, summarizer',
  `document_name` VARCHAR(255) DEFAULT NULL,
  `provider` VARCHAR(50) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `total_latency_ms` INT NOT NULL,
  `prompt_tokens` INT DEFAULT 0,
  `completion_tokens` INT DEFAULT 0,
  `total_tokens` INT DEFAULT 0,
  `cost_estimate_eur` DECIMAL(10, 6) DEFAULT 0.000000,
  `consensus_status` ENUM('UNANIMOUS', 'ARBITRATED', 'FLAGGED_RISK', 'FAILED') DEFAULT 'ARBITRATED',
  `agents_trail_json` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_company` (`company_id`, `created_at`),
  INDEX `idx_audit_tool` (`tool_type`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. Structure du Consensus Trail & Exemple d'Audit

Chaque ligne de journalisation contient le verbatim exact produit par les 4 agents du comité exécutif virtuel :

```json
{
  "id": 142,
  "company_id": 1,
  "session_id": "sess_meeting_692c81",
  "tool_type": "meeting",
  "document_name": "Comité de Direction Q4",
  "provider": "groq",
  "model": "qwen/qwen3.8-27b",
  "total_latency_ms": 3820,
  "total_tokens": 2130,
  "prompt_tokens": 1450,
  "completion_tokens": 680,
  "cost_estimate_eur": 0.000383,
  "consensus_status": "ARBITRATED",
  "agents_trail": {
    "agent1_factuel": "Budget initial : 450 000 €, 306 000 € consommés. Retard prévisionnel de 2 semaines.",
    "agent2_critique": "Alerte : Pénalités contractuelles de 5 000 € par semaine après le 1er décembre.",
    "agent3_arbitre": "Arbitrage COO : Recrutement immédiat de 2 consultants externes (18 000 €) pour respecter la date.",
    "agent4_dg": "Synthèse certifiée validant l'enveloppe de 18 000 € et figeant la matrice de responsabilités RACI."
  },
  "created_at": "2026-10-05 23:25:00"
}
```

---

## 5. Dashboard d'Observabilité : `AIConsensusAuditDashboard.tsx`

Accessible directement dans le panneau d'administration ([AdminAISettings.tsx](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/admin/AdminAISettings.tsx)), le dashboard offre :
1. **4 Cartes KPI en Direct** :
   - Nombre total de délibérations et répartition des statuts (`ARBITRATED`, `UNANIMOUS`, `FLAGGED_RISK`).
   - Coût d'inférence cumulé (€) et coût moyen par session.
   - Tokens consommés (Prompt vs Completion).
   - Latence moyenne du pipeline et conformité au SLA (< 8s).
2. **Inspecteur de Consensus Trail** :
   - Sélection d'une session à gauche.
   - Affichage visuel séquencé des cartes des 4 agents avec leurs couleurs distinctives (Bleu = Factuel, Ambre = Risques, Violet = Arbitrage, Émeraude = Décision finale).

---

## 6. Validation Automatisée (Suite de Tests Brique 7)

La suite `tests/test_brick7_telemetry_audit.mjs` valide :
1. L'exactitude des calculs arithmétiques de conversion de tokens en euros (€).
2. L'étanchéité multi-tenant : une entreprise ne peut en aucun cas consulter les dépenses ou les délibérations d'une autre entreprise.
3. L'intégrité séquentielle du Consensus Trail : aucun agent ne manque dans la chaîne de décision.
