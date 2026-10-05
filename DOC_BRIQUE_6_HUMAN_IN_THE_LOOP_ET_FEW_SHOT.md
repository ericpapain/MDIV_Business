# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 6 : Human-in-the-Loop, Feedback Loop & Apprentissage Continu Few-Shot

---

## 1. Vue d'Ensemble & Problématique Métier

Dans la plupart des logiciels IA du marché, lorsqu'un dirigeant relit une proposition générée par l'IA et en modifie une phrase ou un montant, **cette correction humaine est perdue** :
- L'IA reproduira la même formulation erronée lors de la prochaine génération.
- L'utilisateur est contraint de corriger manuellement les mêmes points indéfiniment.

La **Brique 6** met en place une **Boucle de Rétroaction Continue (Human-in-the-Loop / RLHF Périphérique)** :
1. Chaque livrable édité par le dirigeant peut être validé en un clic comme **"Modèle de Référence (Few-Shot Exemplar)"**.
2. Les corrections formulées ("Ce qu'il faut retenir / Exigences de la direction") sont stockées et étanches par entreprise.
3. Ces exemples approuvés sont automatiquement réinjectés en tête de prompt lors des délibérations suivantes des agents IA.
4. Les agents imitent scrupuleusement le style, le niveau d'exigence et les arbitrages du dirigeant.

---

## 2. Diagramme du Cycle d'Apprentissage Continu

```
    ┌─────────────────────────────────────────────────────────────┐
    │ 1. GÉNÉRATION INITIALE PAR LES 4 AGENTS                     │
    │    L'IA propose un brouillon de devis ou de compte-rendu    │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ 2. RELECTURE & RETOUCHES PAR LE DIRIGEANT (HUMAN-IN-THE-LOOP│
    │    Le dirigeant ajuste l'acompte à 40% et ajoute Consuel    │
    └──────────────────────────────┬──────────────────────────────┘
                                   │ Clic sur "Valider & Entraîner l'IA"
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ 3. ENREGISTREMENT & VECTORISATION (feedback_loop.php)       │
    │    - Stockage dans `company_few_shot_examples`              │
    │    - Auto-vectorisation dans la mémoire RAG de l'entreprise │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ 4. RÉINJECTION DYNAMIQUE FEW-SHOT (context_engine.php)      │
    │    Les 2 derniers exemples validés sont injectés dans       │
    │    le prompt système de la prochaine session d'agents       │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ 5. PROCHAINE GÉNÉRATION D'AGENTS                            │
    │    L'agent applique automatiquement l'acompte de 40% et     │
    │    les clauses validées par la direction !                  │
    └─────────────────────────────────────────────────────────────┘
```

---

## 3. Schéma de la Base de Données (`company_few_shot_examples`)

```sql
CREATE TABLE IF NOT EXISTS `company_few_shot_examples` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `tool_type` VARCHAR(50) NOT NULL COMMENT 'meeting, invoice, quote, summarizer',
  `title` VARCHAR(255) DEFAULT 'Exemple validé par la direction',
  `input_summary` TEXT NOT NULL,
  `original_ai_output` TEXT DEFAULT NULL,
  `human_approved_output` TEXT NOT NULL,
  `correction_notes` TEXT DEFAULT NULL,
  `rating` TINYINT DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_fewshot_company_tool` (`company_id`, `tool_type`),
  INDEX `idx_fewshot_created` (`company_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. API Backend & Double Persistance : `public/api/feedback_loop.php`

Lorsqu'un utilisateur soumet un retour :
1. **Persistance Relationnelle** : Sauvegarde dans `company_few_shot_examples` avec note de 1 à 5, texte original, texte validé et commentaires du dirigeant.
2. **Auto-Indexation Vectorielle** :
   ```php
   $vectorText = "DOCUMENT DE RÉFÉRENCE VALIDÉ PAR LE DIRIGEANT (Module: $tool_type, Titre: $title)\n";
   if (!empty($correction_notes)) {
       $vectorText .= "Exigences et corrections formulées : $correction_notes\n";
   }
   $vectorText .= "Contenu approuvé :\n" . $human_approved_output;

   index_document_vector($company_id, "fewshot_" . $fewShotId, "few_shot_exemplar", $title, $vectorText, [
       'tool_type' => $tool_type,
       'is_executive_validated' => true
   ]);
   ```

---

## 5. Injection dans le Moteur de Contexte : `context_engine.php`

Le moteur de contexte charge automatiquement les exemples les plus récents de l'entreprise :

```text
DIRECTIVES & EXEMPLES DE RÉFÉRENCE VALIDÉS PAR LA DIRECTION (HUMAN-IN-THE-LOOP / FEW-SHOT) :
Voici comment les dirigeants de cette entreprise exigent que leurs livrables soient rédigés et arbitrés :
  * [RÉFÉRENCE APPROUVÉE : Chiffrage Standard Rénovation Tableau | Exigences du dirigeant : Exiger 40% d'acompte au lieu de 30% et mentionner systématiquement les démarches administratives Consuel.] :
    "Remplacement complet du tableau avec disjoncteurs différentiels 30mA type A/AC conformes NF C 15-100, y compris constitution et dépôt du dossier d'attestation Consuel. Modalités : Acompte obligatoire de 40%..."
-> Applique impérativement ce niveau d'exigence, ce style et ces arbitrages dans ta génération.
```

---

## 6. Composant Frontend : `FeedbackCorrectionModal.tsx`

Le composant modal [FeedbackCorrectionModal.tsx](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/common/FeedbackCorrectionModal.tsx) permet au dirigeant :
- D'attribuer une note de 1 à 5 étoiles sur la version préliminaire.
- De saisir en langage naturel ses exigences d'amélioration.
- D'envoyer le livrable d'un clic pour mettre à jour la mémoire active de l'IA.

---

## 7. Validation Automatisée (Suite de Tests Brique 6)

Dans `tests/test_brick6_human_loop.mjs` :
- Enregistrement d'un exemple pour l'entreprise 101 (Électricien - Acompte 40% + Consuel).
- Vérification de l'étanchéité : L'entreprise 202 ne reçoit aucun exemple de l'entreprise 101.
- **Test d'inférence en direct** : L'agent reçoit une nouvelle demande de devis et génère spontanément la clause des 40% d'acompte et l'attestation Consuel sans qu'on lui répète dans le prompt de base !
