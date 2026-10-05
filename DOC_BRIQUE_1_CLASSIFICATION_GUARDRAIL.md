# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 1 : Classification Documentaire & Aiguillage d'Intention (Intent Guardrail)

---

## 1. Vue d'Ensemble & Objectifs Stratégiques

La **Brique 1** constitue la première ligne de défense et d'orientation cognitive de la plateforme MDIV Business. Dans un environnement d'entreprise où des milliers de collaborateurs déposent des fichiers hétérogènes (factures, devis, comptes-rendus de réunion, contrats, relevés bancaires, emails, diagnostics), un système d'IA générative non supervisé court deux risques critiques :
1. **L'inadéquation fonctionnelle (Prompt Hijacking / Garbage In Garbage Out)** : Traiter une facture de 50 000 € avec un prompt conçu pour résumer des réunions produit des hallucinations sévères, omet les mentions légales et ignore le calcul de TVA.
2. **La friction utilisateur** : Forcer l'utilisateur à naviguer manuellement entre 10 pages pour trouver le bon outil génère de l'abandon.

### Objectifs Clés
- **Détection probabiliste multimodale** du type documentaire avant toute exécution de pipeline IA lourd.
- **Garde-fou d'incohérence (Intent Guardrail)** : Alerte visuelle non bloquante dès lors que le document déposé ne correspond pas au module actif avec une certitude $\ge 75\%$.
- **Routage en 1 clic** : Redirection transparente de l'utilisateur vers le module métier dédié avec transfert automatique du fichier ou du texte déjà extrait.

---

## 2. Technologies & Dépendances

| Composant | Technologie | Rôle & Rationale |
| :--- | :--- | :--- |
| **Backend API** | PHP 8.x / cURL | Endpoint léger [classify_document.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/classify_document.php) pour inférence ultra-rapide (< 600ms). |
| **Modèle LLM de Classification** | OpenAI GPT-4o-mini | Modèle ultra-rapide à faible coût avec mode `response_format: { type: "json_object" }` déterministe (`temperature: 0.1`). |
| **Fallback Déterministe** | Groq LPU (Qwen 2.5 27B / Llama 3.3) | Cascade de bascule automatique en cas d'indisponibilité ou d'épuisement de quota OpenAI. |
| **Client Frontend** | TypeScript / React 18 | Service [documentClassifierService.ts](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/documentClassifierService.ts). |
| **Composant UI Modal** | TailwindCSS / Lucide React / Radix UI | Modal interactive [DocumentMismatchModal.tsx](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/common/DocumentMismatchModal.tsx). |

---

## 3. Schéma Architectural & Diagramme de Flux

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  UTILISATEUR (Navigateur)                   │
   │      Dépose un fichier PDF/DOCX ou colle un texte brut       │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
      ┌───────────────────────────────────────────────────────┐
      │  Frontend : ServicesIAMeetings / Invoice / Quote      │
      │  - Extraction texte OCR / Mammoth / TextReader        │
      │  - Appel async : classifyDocumentContent()            │
      └───────────────────────────┬───────────────────────────┘
                                  │ POST /api/classify_document.php
                                  ▼
      ┌───────────────────────────────────────────────────────┐
      │  Backend : classify_document.php                      │
      │  - Validation d'entrée (taille min, sanitation UTF-8) │
      │  - Prompt d'ingénierie classifieur structuré          │
      │  - Inférence GPT-4o-mini (temperature: 0.1)           │
      └───────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
      ┌───────────────────────────────────────────────────────┐
      │  Analyse de la Distribution de Probabilités           │
      │  Scores : [Facture: 94%, Devis: 3%, Réunion: 1%, ...] │
      │  Type détecté : "Facture"                             │
      └───────────────────────────┬───────────────────────────┘
                                  │
                     ┌────────────┴────────────┐
                     │                         │
     [Type == Module Actif]     [Type != Module Actif & Confiance >= 75%]
                     │                         │
                     ▼                         ▼
        Exécution nominale        Affichage DocumentMismatchModal
        du pipeline IA            - Badge de confiance (ex: 94%)
                                  - Snippet explicatif du classifieur
                                  - Bouton 1 : "Basculer vers Facturation"
                                  - Bouton 2 : "Forcer l'analyse actuelle"
```

---

## 4. Prompt d'Ingénierie du Classifieur & Strict JSON Schema

Le classifieur repose sur des règles de taxonomie strictes et doit retourner **exclusivement** un objet JSON valide.

```json
{
  "detected_type": "Facture",
  "confidence": 94,
  "scores": {
    "Facture": 94,
    "Devis": 3,
    "Compte-rendu": 1,
    "Contrat": 1,
    "Email": 1,
    "Autre": 0
  },
  "summary_snippet": "Facture n° FAC-2026-001 émise le 04/10/2026 pour un montant de 12 500 € HT avec mentions de TVA.",
  "recommended_module": "/services-ia/facturation",
  "suggested_actions": [
    {
      "title": "Vérifier la conformité fiscale et Factur-X",
      "route": "/services-ia/facturation"
    },
    {
      "title": "Créer un calendrier de relance client",
      "route": "/services-ia/relance"
    }
  ]
}
```

---

## 5. Détail du Code & Implémentation

### A. Point d'entrée Backend : `public/api/classify_document.php`
- Analyse les 4000 premiers caractères du document (suffisants pour repérer l'en-tête, les mentions légales ou les participants).
- Convertit les types documentaires en routes d'atterrissage optimisées :
  - `Facture` ➔ `/services-ia/facturation`
  - `Devis` ➔ `/services-ia/devis`
  - `Compte-rendu` ➔ `/services-ia/compte-rendu`
  - `Contrat` / `Rapport` ➔ `/services-ia/resume`

### B. Service Frontend : `src/lib/documentClassifierService.ts`
- Compare `detected_type` avec le module courant (`invoice`, `meeting`, `quote`, `summarizer`).
- Déclenche `is_mismatch = true` uniquement si `confidence >= 75` et que la catégorie diverge.

### C. Modal d'Aiguillage : `src/components/common/DocumentMismatchModal.tsx`
- Affiche une interface fluide et rassurante en Dark Mode avec les teintes ambrées de précaution.
- Préserve le texte ou le fichier en mémoire session via `sessionStorage.setItem('mdiv_pending_document', ...)` pour que l'utilisateur n'ait pas à le re-sélectionner après redirection.

---

## 6. Cas de Tests et Validation (Brique 1)

Dans la suite de tests automatisée `tests/test_brick1_classifier.mjs` :
1. **Nominal Réunion** : Des notes de réunion déposées dans le module Réunion ➔ Pas de mismatch (`is_mismatch = false`).
2. **Mismatch Facture dans Réunion** : Une facture d'électricien avec TVA et numéro SIRET déposée dans le module Réunion ➔ Détection `Facture` (95% confiance), mismatch déclenché, redirection recommandée `/services-ia/facturation`.
3. **Mismatch Devis dans Réunion** : Une proposition commerciale avec tableau de prix et acompte ➔ Détection `Devis` (95% confiance), mismatch déclenché.
