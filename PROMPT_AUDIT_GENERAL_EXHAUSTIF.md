# PROMPT D'AUDIT GÉNÉRAL EXHAUSTIF — PLATEFORME MDIV BUSINESS

> **Utilisation :** Copiez-collez l'instruction ci-dessous dans l'assistant IA pour déclencher un audit complet, interactif et sans concession de toutes les applications de la plateforme.

---

```markdown
Exécute un audit général approfondi et sans concession de toutes les applications de la plateforme MDIV Business (Devis IA, Synthèse, Réunions & CR, Prospection & Appels d'Offres, Assistant Email, Diagnostic IA, Studio Multi-Canal, Générateur de Leads, Facturation, Relances).

Pour chaque application, valide rigoureusement les 5 piliers suivants :

1. ZÉRO DONNÉE MOCKÉE & BACKEND RÉEL :
   - Vérifie que chaque appel réseau pointe vers un endpoint API fonctionnel (PHP en production et dev-server local).
   - Assure-toi que les réponses proviennent de vrais modèles LLM / OCR / Vision / Scrapers sans templates statiques figés.

2. PERSISTANCE EN BASE DE DONNÉES & LIAISON CLIENT / PROJET :
   - Teste le bouton de sauvegarde universelle (SaveWorkModal) et vérifie l'écriture en base.
   - Vérifie la liaison avec le sélecteur client interactif (ClientSelectWithCreate) et le nom de projet.
   - Teste l'ouverture du tiroir d'historique (SavedWorkDrawer) et le rechargement en 1 clic.

3. MULTI-PROPOSITIONS & SECTION DEEP-DIVE :
   - Teste le bouton « Proposer une autre version » (VersionSelectorBar) et le passage entre Version 1, 2, 3.
   - Teste le micro-chat interactif (SectionDeepDive) sous chaque bloc de résultat (risques, pitch, reco...).

4. ZONES DE SAISIE, UPLOADS & TÉLÉCHARGEMENTS :
   - Vérifie tous les inputs, formulaires, uploads de fichiers (PDF, Word, OCR photo) et presets.
   - Vérifie tous les exports et téléchargements (PDF, DOCX, TXT, FEC, Factur-X) ainsi que les boutons « Copier ».

5. RECHERCHE D'APPELS D'OFFRES & DIRECT LINKS :
   - Vérifie que les liens générés sont directs et cliquables (BOAMP, TED Europa, Marchés Publics) sans descriptif parasite.

Fournis un tableau récapitulatif avec captures d'écran, logs de compilation TypeScript (npm run build) et validation de conformité.
```

---

## 🧭 Référence des Routes & Endpoints Associés

| Application | Route Frontend | Endpoints PHP / Dev API | Fonctionnalités Clés |
| :--- | :--- | :--- | :--- |
| **Devis IA** | `/services-ia/devis` | `quote_ai_assist.php`, `quotes.php`, `saved_work.php` | Few-Shot presets/upload, multi-versions, deep-dive lignes/pitch, PDF/TXT |
| **Prospection & Appels d'Offres** | `/services-ia/prospection-email` | `prospecting_generate.php`, `tenders_search.php`, `saved_work.php` | Veille BOAMP/TED liens directs, email sur-mesure, deep-dive |
| **Synthèse de Documents** | `/services-ia/resume-documents` | `summarizer_agents.php`, `summarizer_upload.php`, `saved_work.php` | 5 formats (Express/Standard/Détaillé/Direction/Comex), upload OCR/PDF |
| **Réunions & CR** | `/services-ia/comptes-rendus` | `meeting_agents.php`, `meeting_upload.php`, `saved_work.php` | Upload audio/doc, compte-rendu décisionnel, deep-dive actions |
| **Assistant Email** | `/services-ia/assistant-email` | `email_generate.php`, `email_analyze.php`, `saved_work.php` | Analyse de ton, reformulation, négociation, copie 1-clic |
| **Diagnostic IA** | `/services-ia/diagnostic` | `diagnostic_step.php`, `diagnostic_agents.php`, `saved_work.php` | Audit interactif, score /100, PDF complet, deep-dive recommandations |
| **Studio Multi-Canal** | `/services-ia/generateur-contenu` | `content_generate.php`, `content_export.php`, `saved_work.php` | Déclinaison multi-réseaux (LinkedIn, Blog, Newsletter, X), export Word |
| **Générateur de Leads** | `/services-ia/generateur-leads` | `leads_search.php`, `leads_export.php` | Recherche B2B live, scoring, export CSV |
| **Factures & Factur-X** | `/services-ia/factures` | `facturx_generator.php`, `fec_export.php`, `invoices.php` | OCR Vision, génération Factur-X conforme 2026, export FEC |
| **Relances Impayés** | `/services-ia/relances` | `followup_generate.php`, `followup_send.php` | Analyse de risque de retard, séquences de relance graduées |
