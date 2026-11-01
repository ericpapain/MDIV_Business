# 📋 Audit Exhaustif du Code - Projet MDIV Business

> **Date de l'audit** : 20 Octobre 2026  
> **Périmètre analysé** : 100% des fichiers du projet (hors `node_modules`, `.git`, `dist`)  
> **Statut de l'audit** : Exhaustif — **652 fichiers audités**  

---

## 📊 1. Synthèse Globale de l'Audit

| Indicateur | Valeur Mesurée | Observation Clé |
| :--- | :---: | :--- |
| **Nombre total de fichiers audités** | **652** | Exhaustivité complète du code source, configs, docs et médias |
| **Fichiers textuels (Code, Config, Docs)** | **503** | Fichiers TypeScript, React, PHP, SQL, Markdown, JSON, Python |
| **Fichiers binaires (Médias, Polices, Bundles)** | **149** | Images JPG/PNG, vidéos MP4, documents Word, verrous Bun |
| **Volume total de lignes de texte** | **143,785 lignes** | Base de code dense avec un fort volume de documentation et de logique |
| **Fichiers contenant des données mockées** | **77** | Présence marquée de mocks (`mockData.ts`, `dev_db.json`, `vite-dev-api.ts`) |
| **Fichiers contenant des prompts IA** | **64** | Forte intégration d'IA (prompts système, templates et guides de persona) |
| **Fichiers recommandés pour découpage / optimisation** | **47** | Découpage recommandé pour les fichiers volumineux (>350-500 lignes) ou monolithiques |

---

## 🎯 2. Points d'Attention Stratégiques

### A. Cartographie des Données Mockées (77 fichiers)
1. **Les Référentiels Centraux de Mocks** :
   - `src/data/mockData.ts` : Hub principal de données statiques utilisé par 11 pages vitrines et admin (offres, événements, avis, membres, partenaires).
   - `src/data/mockDemoData.ts` : Données scénarisées pour le simulateur et les 8 étapes du parcours de démonstration.
   - `dev_db.json` : Base de données locale de développement simulant l'ensemble des tables SQL (factures, devis, clients, transactions, logs).
2. **Le Serveur Dev Mock** :
   - `vite-dev-api.ts` (5 452 lignes) et `vite-dev-mail.ts` : Interceptent la quasi-totalité des routes `/api/*` pour fournir des réponses mockées ou hybrides en local lorsque les clés ou services distants ne sont pas connectés.
3. **Les Fallbacks et Détection dans le Backend PHP** :
   - `public/api/vector_store.php` : Intègre `generate_deterministic_mock_embedding()` lorsque le mode test ou `MOCK_EMBEDDINGS=1` est actif.
   - `public/api/multi_llm_orchestrator.php` : Mocke les réponses de consensus LLM en cas d'absence de clés d'API valides.
   - `public/api/create_mock_accounts.php` & `public/api-seed.php` : Générateurs de données factices pour les tests.

### B. Cartographie des Prompts IA (64 fichiers)
1. **Prompts Système en Production** :
   - `vite-dev-api.ts` : Contient des dizaines de prompts système pour l'extraction OCR, la vérification fiscale Factur-X, la classification documentaire, la délibération multi-modèles et la génération de relances.
   - `src/data/servicesIAData.ts` : Centralise les gabarits de prompts par défaut pour les différents modules d'IA.
   - Endpoints PHP (`public/api/classify_document.php`, `document_summarizer.php`, `email_assistant.php`, `prospecting_email.php`, `multi_llm_orchestrator.php`, `verify_invoice.php`).
2. **Bibliothèque de Prompts et Guides de Personas** :
   - `prompt facturation.md`, `prompt_app_ia.md`, `PROMPT_AUDIT_GENERAL_EXHAUSTIF.md`.
   - Les 15 fiches applicatives dans `application IA/` (`assistant-relances-ia.md`, `generateur-contenu-ia.md`, etc.).
   - Les 7 spécifications des briques techniques (`DOC_BRIQUE_1_...` à `DOC_BRIQUE_7_...`).

### C. Opportunités Critiques de Refactoring & Découpage (47 fichiers)
1. **Le Monolithe `vite-dev-api.ts` (5 452 lignes) — Priorité Absolue** :
   - Ce fichier concentre à lui seul la logique mock de facturation, devis, RAG, auth, OCR, conformité et consensus multi-LLM. Il doit être découpé en routeurs modulaires (`server/routes/billing.ts`, `server/routes/ai.ts`, `server/routes/auth.ts`, `server/routes/rag.ts`).
2. **Le Moteur Mail `mail-engine.ts` (584 lignes)** :
   - À scinder en 3 sous-modules : adaptateur IMAP/SMTP, parseur MIME et orchestrateur de files d'attente.
3. **Composants et Pages Volumineux (> 500 lignes)** :
   - Exemples : `src/pages/admin/AdminPerformance.tsx`, `src/pages/ServicesIAInvoice.tsx`, `src/pages/AIBuilder.tsx`, `src/pages/ServicesIAProspecting.tsx`. Recommandation : extraire les sous-vues et la gestion d'état dans des hooks personnalisés.

---

## 📑 3. Tableaux d'Audit Exhaustifs par Domaine

### 1. Racine du Projet (Configuration, Scripts, Dev Server, Schémas SQL) (49 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `.env` | Variables d'environnement locales (clés d'API, DB, secrets) | `.env` | Non | 9 | Non - Fichier compact et bien délimité | Non |
| `.env.example` | Modèle de configuration des variables d'environnement requises | `.env.example` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `.gitignore` | Définition des fichiers et répertoires ignorés par Git | `.gitignore` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `.mail_dev_key` | Clé secrète de développement pour le service de messagerie | `.mail_dev_key` | Non | 1 | Non - Fichier compact et bien délimité | Non |
| `README.md` | Documentation d'introduction et présentation du dépôt | `README.md` | Non | 3 | Non - Fichier compact et bien délimité | Non |
| `bun.lock` | Fichier de verrouillage des dépendances Bun | `bun.lock` | Non | 1407 | Non - Fichier généré ou base JSON locale | Non |
| `components.json` | Configuration de la CLI shadcn/ui pour les composants Radix | `components.json` | Non | 20 | Non - Fichier compact et bien délimité | Non |
| `creative_offers.py` | Script Python de traitement et génération d'offres créatives | `creative_offers.py` | Non | 39 | Non - Fichier compact et bien délimité | Non |
| `database.sql` | Schéma initial des tables de base de données MySQL/PostgreSQL | `database.sql` | Non | 497 | Oui - 612 lignes : possible de scinder par domaine (01_auth.sql, 02_billing.sql, 03_ai.sql) | Non |
| `dev_db.json` | Base de données JSON locale simulant le backend et les tables en dev | `dev_db.json` | Oui - Base de données locale mockée simulant l'ensemble des tables en dev | 12593 | Non - Fichier généré ou base JSON locale | Non |
| `eslint.config.js` | Configuration des règles d'analyse statique et de linting ESLint | `eslint.config.js` | Non | 26 | Non - Fichier compact et bien délimité | Non |
| `index.html` | Point d'entrée HTML principal de l'application Single Page (Vite/React) | `index.html` | Non | 39 | Non - Fichier compact et bien délimité | Non |
| `kolecto_clean_summary.txt` | Synthèse textuelle épurée du benchmark Kolecto | `kolecto_clean_summary.txt` | Non | 847 | Non - Fichier compact et bien délimité | Non |
| `kolecto_extracted_text.txt` | Extraction brute de texte issue des fonctionnalités Kolecto | `kolecto_extracted_text.txt` | Non | 847 | Non - Fichier compact et bien délimité | Non |
| `kolecto_raw.html` | Fichier HTML brut archivé pour l'étude comparative | `kolecto_raw.html` | Non | 2265 | Oui - Très volumineux (2265 lignes) : scinder en sous-composants, hooks et services | Non |
| `mail-engine.ts` | Moteur de synchronisation et d'envoi de courriels (IMAP/SMTP) | `mail-engine.ts` | Non | 585 | Oui - 584 lignes : scinder en 3 modules (connexion IMAP/SMTP, parseur MIME, synchronisation) | Non |
| `migrations_facturation_2026.sql` | Script de migration SQL pour les règles de facturation 2026 | `migrations_facturation_2026.sql` | Non | 80 | Non - Fichier compact et bien délimité | Non |
| `migrations_mailboxes_2026.sql` | Script de migration SQL pour la gestion multi-boîtes de messagerie | `migrations_mailboxes_2026.sql` | Non | 58 | Non - Fichier compact et bien délimité | Non |
| `multi_llm_schema.sql` | Schéma SQL pour l'orchestration multi-LLM, logs de consensus et coûts | `multi_llm_schema.sql` | Non | 97 | Non - Fichier compact et bien délimité | Non |
| `package-lock.json` | Verrouillage déterministe des dépendances NPM | `package-lock.json` | Non | 10691 | Non - Fichier généré ou base JSON locale | Non |
| `package.json` | Configuration du projet Node/Vite, scripts de build et dépendances npm | `package.json` | Non | 112 | Non - Fichier compact et bien délimité | Non |
| `playwright-fixture.ts` | Fixtures d'initialisation pour les tests Playwright | `playwright-fixture.ts` | Non | 3 | Non - Fichier compact et bien délimité | Non |
| `playwright.config.ts` | Configuration des tests End-to-End Playwright | `playwright.config.ts` | Non | 10 | Non - Fichier compact et bien délimité | Non |
| `postcss.config.js` | Configuration PostCSS avec Tailwind et Autoprefixer | `postcss.config.js` | Non | 6 | Non - Fichier compact et bien délimité | Non |
| `.htaccess` | Fichier de ressource () | `public/.htaccess` | Non | 65 | Non - Fichier compact et bien délimité | Non |
| `robots.txt` | Fichier de ressource (.txt) | `public/robots.txt` | Non | 64 | Non - Fichier compact et bien délimité | Non |
| `remove_second_section.py` | Script utilitaire Python pour retirer des sections redondantes | `remove_second_section.py` | Non | 16 | Non - Fichier compact et bien délimité | Non |
| `replace_videos.py` | Script utilitaire pour mettre à jour les URL des vidéos de démonstration | `replace_videos.py` | Non | 21 | Non - Fichier compact et bien délimité | Non |
| `replace_videos_2.py` | Script de mise à jour avancée des chemins de fichiers vidéo | `replace_videos_2.py` | Non | 75 | Non - Fichier compact et bien délimité | Non |
| `resize.py` | Script Python de redimensionnement et optimisation des images | `resize.py` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `App.css` | Fichier de ressource (.css) | `src/App.css` | Non | 42 | Non - Fichier compact et bien délimité | Non |
| `vite-env.d.ts` | Module de logique TypeScript | `src/vite-env.d.ts` | Non | 1 | Non - Fichier compact et bien délimité | Non |
| `tailwind.config.ts` | Configuration Tailwind CSS (thème, palette couleurs, typographie, animations) | `tailwind.config.ts` | Non | 82 | Non - Fichier compact et bien délimité | Non |
| `test_facturation_compliance.mjs` | Tests de conformité fiscale et réglementaire des factures | `test_facturation_compliance.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 257 | Non - Fichier compact et bien délimité | Non |
| `test_mailboxes_compliance.mjs` | Tests de conformité et validation du multi-boîtes de messagerie | `test_mailboxes_compliance.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 268 | Non - Fichier compact et bien délimité | Non |
| `test_schema.php` | Script PHP de vérification de l'intégrité du schéma de base de données | `test_schema.php` | Non | 20 | Non - Fichier compact et bien délimité | Non |
| `test_support_mail_fixtures.mjs` | Tests de validation des fixtures d'emails de support | `test_support_mail_fixtures.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 197 | Non - Fichier compact et bien délimité | Non |
| `tsconfig.app.json` | Configuration TypeScript pour le code applicatif client (src) | `tsconfig.app.json` | Non | 35 | Non - Fichier compact et bien délimité | Non |
| `tsconfig.json` | Configuration racine du compilateur TypeScript | `tsconfig.json` | Non | 24 | Non - Fichier compact et bien délimité | Non |
| `tsconfig.node.json` | Configuration TypeScript pour les scripts d'outillage Node/Vite | `tsconfig.node.json` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `update_floating_modal.py` | Script utilitaire de mise à jour des modales flottantes | `update_floating_modal.py` | Non | 62 | Non - Fichier compact et bien délimité | Non |
| `update_modal.py` | Script utilitaire pour la configuration des fenêtres modales | `update_modal.py` | Non | 31 | Non - Fichier compact et bien délimité | Non |
| `video_p1.html` | Page HTML de prévisualisation et test de lecture vidéo | `video_p1.html` | Non | 282 | Non - Fichier compact et bien délimité | Non |
| `vite-dev-analytics.ts` | Middleware Vite fournissant les métriques analytiques et télémétrie de dev | `vite-dev-analytics.ts` | Oui - Simulation mockée des métriques analytiques | 745 | Oui - Module dense (745 lignes) : séparer les types, utilitaires et règles métier | Non |
| `vite-dev-api.ts` | Serveur de développement mockant l'ensemble des API backend et services IA | `vite-dev-api.ts` | Oui - Mock backend global : intercepte les routes API et simule les réponses en dev | 5451 | Oui (Critique) - 5 452 lignes : à découper impérativement en routeurs modulaires par domaine (auth, facturation, IA, CRM) | Oui - Nombreux prompts système (OCR, classification, synthèse, relances, audit) |
| `vite-dev-mail.ts` | Middleware Vite simulant les boîtes de messagerie et l'envoi de courriels | `vite-dev-mail.ts` | Oui - Simulation mockée de la boîte mail et des flux SMTP | 487 | Non - Fichier compact et bien délimité | Non |
| `vite-dev-team.ts` | Middleware Vite simulant la gestion des membres d'équipe et rôles | `vite-dev-team.ts` | Oui - Simulation mockée de l'annuaire d'équipe | 354 | Non - Fichier compact et bien délimité | Non |
| `vite.config.ts` | Configuration du bundler Vite, plugins React et proxy de développement | `vite.config.ts` | Non | 26 | Non - Fichier compact et bien délimité | Non |
| `vitest.config.ts` | Configuration de la suite de tests unitaires Vitest | `vitest.config.ts` | Non | 16 | Non - Fichier compact et bien délimité | Non |

---

### 2. Frontend - Pages Applicatives (src/pages) (69 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `AIBuilder.tsx` | Page applicative principale (AIBuilder) | `src/pages/AIBuilder.tsx` | Oui - Import/usage de mockData | 186 | Non - Fichier compact et bien délimité | Non |
| `AccompagnementBNE.tsx` | Page applicative principale (AccompagnementBNE) | `src/pages/AccompagnementBNE.tsx` | Non | 411 | Non - Fichier compact et bien délimité | Non |
| `AdminAIGovernance.tsx` | Page applicative principale (AdminAIGovernance) | `src/pages/AdminAIGovernance.tsx` | Non | 136 | Non - Fichier compact et bien délimité | Non |
| `Avis.tsx` | Page applicative principale (Avis) | `src/pages/Avis.tsx` | Oui - Import/usage de mockData | 397 | Non - Fichier compact et bien délimité | Non |
| `Blog.tsx` | Page applicative principale (Blog) | `src/pages/Blog.tsx` | Non | 404 | Non - Fichier compact et bien délimité | Non |
| `BlogPost.tsx` | Page applicative principale (BlogPost) | `src/pages/BlogPost.tsx` | Non | 301 | Non - Fichier compact et bien délimité | Non |
| `Charte.tsx` | Page applicative principale (Charte) | `src/pages/Charte.tsx` | Non | 261 | Non - Fichier compact et bien délimité | Non |
| `Contact.tsx` | Page applicative principale (Contact) | `src/pages/Contact.tsx` | Non | 200 | Non - Fichier compact et bien délimité | Non |
| `DemoFlow.tsx` | Contrôleur et flux de la démonstration interactive | `src/pages/Demo/DemoFlow.tsx` | Non | 93 | Non - Fichier compact et bien délimité | Non |
| `Step1Hero.tsx` | Étape du parcours de démonstration interactive (Step1Hero) | `src/pages/Demo/steps/Step1Hero.tsx` | Non | 102 | Non - Fichier compact et bien délimité | Non |
| `Step2Chat.tsx` | Étape du parcours de démonstration interactive (Step2Chat) | `src/pages/Demo/steps/Step2Chat.tsx` | Oui - Import/usage de mockDemoData | 106 | Non - Fichier compact et bien délimité | Non |
| `Step3Analysis.tsx` | Étape du parcours de démonstration interactive (Step3Analysis) | `src/pages/Demo/steps/Step3Analysis.tsx` | Non | 100 | Non - Fichier compact et bien délimité | Non |
| `Step4Result.tsx` | Étape du parcours de démonstration interactive (Step4Result) | `src/pages/Demo/steps/Step4Result.tsx` | Non | 181 | Non - Fichier compact et bien délimité | Non |
| `Step5Matching.tsx` | Étape du parcours de démonstration interactive (Step5Matching) | `src/pages/Demo/steps/Step5Matching.tsx` | Oui - Import/usage de mockDemoData | 130 | Non - Fichier compact et bien délimité | Non |
| `Step6Planning.tsx` | Étape du parcours de démonstration interactive (Step6Planning) | `src/pages/Demo/steps/Step6Planning.tsx` | Oui - Import/usage de mockDemoData | 96 | Non - Fichier compact et bien délimité | Non |
| `Step7Dashboard.tsx` | Étape du parcours de démonstration interactive (Step7Dashboard) | `src/pages/Demo/steps/Step7Dashboard.tsx` | Oui - Import/usage de mockDemoData | 147 | Non - Fichier compact et bien délimité | Non |
| `Step8End.tsx` | Étape du parcours de démonstration interactive (Step8End) | `src/pages/Demo/steps/Step8End.tsx` | Oui - Import/usage de mockDemoData | 249 | Non - Fichier compact et bien délimité | Non |
| `EventReplay.tsx` | Page applicative principale (EventReplay) | `src/pages/EventReplay.tsx` | Non | 466 | Non - Fichier compact et bien délimité | Non |
| `Events.tsx` | Page applicative principale (Events) | `src/pages/Events.tsx` | Non | 163 | Non - Fichier compact et bien délimité | Non |
| `Experiences.tsx` | Page applicative principale (Experiences) | `src/pages/Experiences.tsx` | Oui - Import/usage de mockData | 48 | Non - Fichier compact et bien délimité | Non |
| `Home.tsx` | Page applicative principale (Home) | `src/pages/Home.tsx` | Oui - Import/usage de mockData | 396 | Non - Fichier compact et bien délimité | Non |
| `Media.tsx` | Page applicative principale (Media) | `src/pages/Media.tsx` | Oui - Import/usage de mockData | 85 | Non - Fichier compact et bien délimité | Non |
| `NotFound.tsx` | Page applicative principale (NotFound) | `src/pages/NotFound.tsx` | Non | 27 | Non - Fichier compact et bien délimité | Non |
| `Offers.tsx` | Page applicative principale (Offers) | `src/pages/Offers.tsx` | Oui - Import/usage de mockData | 588 | Oui - Composant étendu (588 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `Partners.tsx` | Page applicative principale (Partners) | `src/pages/Partners.tsx` | Non | 609 | Oui - Composant étendu (609 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `Result.tsx` | Page applicative principale (Result) | `src/pages/Result.tsx` | Oui - Import/usage de mockData | 177 | Non - Fichier compact et bien délimité | Non |
| `Sejour.tsx` | Page applicative principale (Sejour) | `src/pages/Sejour.tsx` | Oui - Import/usage de mockData | 179 | Non - Fichier compact et bien délimité | Non |
| `SejoursBNE.tsx` | Page applicative principale (SejoursBNE) | `src/pages/SejoursBNE.tsx` | Non | 354 | Non - Fichier compact et bien délimité | Non |
| `ServicesIA.tsx` | Page applicative principale (ServicesIA) | `src/pages/ServicesIA.tsx` | Non | 1116 | Oui - Très volumineux (1116 lignes) : scinder en sous-composants, hooks et services | Non |
| `ServicesIABenchmark.tsx` | Page applicative principale (ServicesIABenchmark) | `src/pages/ServicesIABenchmark.tsx` | Non | 689 | Oui - Composant étendu (689 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIACalcROI.tsx` | Page applicative principale (ServicesIACalcROI) | `src/pages/ServicesIACalcROI.tsx` | Non | 195 | Non - Fichier compact et bien délimité | Non |
| `ServicesIACategory.tsx` | Page applicative principale (ServicesIACategory) | `src/pages/ServicesIACategory.tsx` | Non | 273 | Non - Fichier compact et bien délimité | Non |
| `ServicesIAClosed.tsx` | Page applicative principale (ServicesIAClosed) | `src/pages/ServicesIAClosed.tsx` | Non | 70 | Non - Fichier compact et bien délimité | Non |
| `ServicesIAContent.tsx` | Page applicative principale (ServicesIAContent) | `src/pages/ServicesIAContent.tsx` | Non | 806 | Oui - Composant étendu (806 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIADashboard.tsx` | Page applicative principale (ServicesIADashboard) | `src/pages/ServicesIADashboard.tsx` | Non | 991 | Oui - Composant étendu (991 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIADiagnostic.tsx` | Page applicative principale (ServicesIADiagnostic) | `src/pages/ServicesIADiagnostic.tsx` | Non | 612 | Oui - Composant étendu (612 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIAEmail.tsx` | Page applicative principale (ServicesIAEmail) | `src/pages/ServicesIAEmail.tsx` | Non | 1333 | Oui - Très volumineux (1333 lignes) : scinder en sous-composants, hooks et services | Non |
| `ServicesIAFollowup.tsx` | Page applicative principale (ServicesIAFollowup) | `src/pages/ServicesIAFollowup.tsx` | Non | 493 | Oui - Écran dense (493 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `ServicesIAInvoice.tsx` | Page applicative principale (ServicesIAInvoice) | `src/pages/ServicesIAInvoice.tsx` | Non | 2517 | Oui - Très volumineux (2517 lignes) : scinder en sous-composants, hooks et services | Non |
| `ServicesIALeads.tsx` | Page applicative principale (ServicesIALeads) | `src/pages/ServicesIALeads.tsx` | Non | 639 | Oui - Composant étendu (639 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIAMeetingPrep.tsx` | Page applicative principale (ServicesIAMeetingPrep) | `src/pages/ServicesIAMeetingPrep.tsx` | Non | 586 | Oui - Composant étendu (586 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIAMeetings.tsx` | Page applicative principale (ServicesIAMeetings) | `src/pages/ServicesIAMeetings.tsx` | Non | 990 | Oui - Composant étendu (990 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIAPricing.tsx` | Page applicative principale (ServicesIAPricing) | `src/pages/ServicesIAPricing.tsx` | Non | 47 | Non - Fichier compact et bien délimité | Non |
| `ServicesIAProspecting.tsx` | Page applicative principale (ServicesIAProspecting) | `src/pages/ServicesIAProspecting.tsx` | Non | 851 | Oui - Composant étendu (851 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ServicesIAQuote.tsx` | Page applicative principale (ServicesIAQuote) | `src/pages/ServicesIAQuote.tsx` | Non | 1042 | Oui - Très volumineux (1042 lignes) : scinder en sous-composants, hooks et services | Non |
| `ServicesIASummarizer.tsx` | Page applicative principale (ServicesIASummarizer) | `src/pages/ServicesIASummarizer.tsx` | Non | 508 | Oui - Composant étendu (508 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `AdminAISettings.tsx` | Page d'administration (AdminAISettings) | `src/pages/admin/AdminAISettings.tsx` | Non | 661 | Oui - Composant étendu (661 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `AdminAmbassadors.tsx` | Page d'administration (AdminAmbassadors) | `src/pages/admin/AdminAmbassadors.tsx` | Non | 209 | Non - Fichier compact et bien délimité | Non |
| `AdminApplications.tsx` | Page d'administration (AdminApplications) | `src/pages/admin/AdminApplications.tsx` | Non | 174 | Non - Fichier compact et bien délimité | Non |
| `AdminBlog.tsx` | Page d'administration (AdminBlog) | `src/pages/admin/AdminBlog.tsx` | Non | 731 | Oui - Composant étendu (731 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `AdminDashboard.tsx` | Page d'administration (AdminDashboard) | `src/pages/admin/AdminDashboard.tsx` | Non | 259 | Non - Fichier compact et bien délimité | Non |
| `AdminEvents.tsx` | Page d'administration (AdminEvents) | `src/pages/admin/AdminEvents.tsx` | Non | 411 | Oui - Écran dense (411 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `AdminHeroNews.tsx` | Page d'administration (AdminHeroNews) | `src/pages/admin/AdminHeroNews.tsx` | Non | 585 | Oui - Composant étendu (585 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `AdminLeads.tsx` | Page d'administration (AdminLeads) | `src/pages/admin/AdminLeads.tsx` | Oui - Import/usage de mockData | 55 | Non - Fichier compact et bien délimité | Non |
| `AdminLogin.tsx` | Page d'administration (AdminLogin) | `src/pages/admin/AdminLogin.tsx` | Non | 123 | Non - Fichier compact et bien délimité | Non |
| `AdminMembers.tsx` | Page d'administration (AdminMembers) | `src/pages/admin/AdminMembers.tsx` | Non | 162 | Non - Fichier compact et bien délimité | Non |
| `AdminPartners.tsx` | Page d'administration (AdminPartners) | `src/pages/admin/AdminPartners.tsx` | Non | 216 | Non - Fichier compact et bien délimité | Non |
| `AdminPerformance.tsx` | Page d'administration (AdminPerformance) | `src/pages/admin/AdminPerformance.tsx` | Non | 503 | Oui - Composant étendu (503 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `AdminPricing.tsx` | Page d'administration (AdminPricing) | `src/pages/admin/AdminPricing.tsx` | Oui - Import/usage de mockData | 56 | Non - Fichier compact et bien délimité | Non |
| `AdminProfiles.tsx` | Page d'administration (AdminProfiles) | `src/pages/admin/AdminProfiles.tsx` | Oui - Import/usage de mockData | 54 | Non - Fichier compact et bien délimité | Non |
| `AdminReplays.tsx` | Page d'administration (AdminReplays) | `src/pages/admin/AdminReplays.tsx` | Non | 468 | Oui - Écran dense (468 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `AdminReviews.tsx` | Page d'administration (AdminReviews) | `src/pages/admin/AdminReviews.tsx` | Non | 147 | Non - Fichier compact et bien délimité | Non |
| `AdminSejours.tsx` | Page d'administration (AdminSejours) | `src/pages/admin/AdminSejours.tsx` | Non | 410 | Oui - Écran dense (410 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `AdminVideos.tsx` | Page d'administration (AdminVideos) | `src/pages/admin/AdminVideos.tsx` | Non | 148 | Non - Fichier compact et bien délimité | Non |
| `Dashboard.tsx` | Page d'authentification et gestion de compte (Dashboard) | `src/pages/auth/Dashboard.tsx` | Non | 1536 | Oui - Très volumineux (1536 lignes) : scinder en sous-composants, hooks et services | Non |
| `ForgotPassword.tsx` | Page d'authentification et gestion de compte (ForgotPassword) | `src/pages/auth/ForgotPassword.tsx` | Non | 149 | Non - Fichier compact et bien délimité | Non |
| `Login.tsx` | Page d'authentification et gestion de compte (Login) | `src/pages/auth/Login.tsx` | Non | 241 | Non - Fichier compact et bien délimité | Non |
| `Register.tsx` | Page d'authentification et gestion de compte (Register) | `src/pages/auth/Register.tsx` | Non | 847 | Oui - Composant étendu (847 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `ResetPassword.tsx` | Page d'authentification et gestion de compte (ResetPassword) | `src/pages/auth/ResetPassword.tsx` | Non | 179 | Non - Fichier compact et bien délimité | Non |

---

### 3. Frontend - Composants d'Interface UI (src/components) (138 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `ThemeToggle.tsx` | Composant UI du module générique (ThemeToggle) | `src/components/ThemeToggle.tsx` | Non | 39 | Non - Fichier compact et bien délimité | Non |
| `AIConsensusAuditDashboard.tsx` | Composant d'administration (AIConsensusAuditDashboard) | `src/components/admin/AIConsensusAuditDashboard.tsx` | Non | 298 | Non - Fichier compact et bien délimité | Oui - Visualisation et inspection des prompts envoyés aux modèles |
| `AdminLayout.tsx` | Composant d'administration (AdminLayout) | `src/components/admin/AdminLayout.tsx` | Non | 134 | Non - Fichier compact et bien délimité | Non |
| `ImageUpload.tsx` | Composant d'administration (ImageUpload) | `src/components/admin/ImageUpload.tsx` | Non | 115 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsDevicesSection.tsx` | Composant graphique d'analytique et statistiques (AnalyticsDevicesSection) | `src/components/admin/analytics/AnalyticsDevicesSection.tsx` | Non | 189 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsGeoSection.tsx` | Composant graphique d'analytique et statistiques (AnalyticsGeoSection) | `src/components/admin/analytics/AnalyticsGeoSection.tsx` | Non | 324 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsHomeCountersModal.tsx` | Composant graphique d'analytique et statistiques (AnalyticsHomeCountersModal) | `src/components/admin/analytics/AnalyticsHomeCountersModal.tsx` | Non | 245 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsKpiGrid.tsx` | Composant graphique d'analytique et statistiques (AnalyticsKpiGrid) | `src/components/admin/analytics/AnalyticsKpiGrid.tsx` | Non | 164 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsRealtimeWidget.tsx` | Composant graphique d'analytique et statistiques (AnalyticsRealtimeWidget) | `src/components/admin/analytics/AnalyticsRealtimeWidget.tsx` | Non | 168 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsSourcesSection.tsx` | Composant graphique d'analytique et statistiques (AnalyticsSourcesSection) | `src/components/admin/analytics/AnalyticsSourcesSection.tsx` | Non | 102 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsTopPagesTable.tsx` | Composant graphique d'analytique et statistiques (AnalyticsTopPagesTable) | `src/components/admin/analytics/AnalyticsTopPagesTable.tsx` | Non | 245 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsTrafficChart.tsx` | Composant graphique d'analytique et statistiques (AnalyticsTrafficChart) | `src/components/admin/analytics/AnalyticsTrafficChart.tsx` | Non | 241 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsUserJourney.tsx` | Composant graphique d'analytique et statistiques (AnalyticsUserJourney) | `src/components/admin/analytics/AnalyticsUserJourney.tsx` | Non | 295 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsVisitorHistory.tsx` | Composant graphique d'analytique et statistiques (AnalyticsVisitorHistory) | `src/components/admin/analytics/AnalyticsVisitorHistory.tsx` | Non | 406 | Oui - Écran dense (406 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `types.ts` | Composant graphique d'analytique et statistiques (types) | `src/components/admin/analytics/types.ts` | Non | 137 | Non - Fichier compact et bien délimité | Non |
| `ActivitiesTimeline.tsx` | Composant de surveillance des performances (ActivitiesTimeline) | `src/components/admin/performance/ActivitiesTimeline.tsx` | Non | 146 | Non - Fichier compact et bien délimité | Non |
| `AddEntityModal.tsx` | Composant de surveillance des performances (AddEntityModal) | `src/components/admin/performance/AddEntityModal.tsx` | Non | 389 | Oui - Écran dense (389 lignes) : isoler les tableaux/modales dans des sous-composants | Non |
| `AmbassadorsSubModule.tsx` | Composant de surveillance des performances (AmbassadorsSubModule) | `src/components/admin/performance/AmbassadorsSubModule.tsx` | Non | 228 | Non - Fichier compact et bien délimité | Non |
| `CampaignsEventsTab.tsx` | Composant de surveillance des performances (CampaignsEventsTab) | `src/components/admin/performance/CampaignsEventsTab.tsx` | Non | 188 | Non - Fichier compact et bien délimité | Non |
| `KPICardsGrid.tsx` | Composant de surveillance des performances (KPICardsGrid) | `src/components/admin/performance/KPICardsGrid.tsx` | Non | 117 | Non - Fichier compact et bien délimité | Non |
| `KPIManagerModal.tsx` | Composant de surveillance des performances (KPIManagerModal) | `src/components/admin/performance/KPIManagerModal.tsx` | Non | 291 | Non - Fichier compact et bien délimité | Non |
| `PerformanceHeader.tsx` | Composant de surveillance des performances (PerformanceHeader) | `src/components/admin/performance/PerformanceHeader.tsx` | Non | 142 | Non - Fichier compact et bien délimité | Non |
| `PipelineKanban.tsx` | Composant de surveillance des performances (PipelineKanban) | `src/components/admin/performance/PipelineKanban.tsx` | Non | 159 | Non - Fichier compact et bien délimité | Non |
| `ProjectEvaluationModal.tsx` | Composant de surveillance des performances (ProjectEvaluationModal) | `src/components/admin/performance/ProjectEvaluationModal.tsx` | Non | 317 | Non - Fichier compact et bien délimité | Non |
| `ProjectsTab.tsx` | Composant de surveillance des performances (ProjectsTab) | `src/components/admin/performance/ProjectsTab.tsx` | Non | 212 | Non - Fichier compact et bien délimité | Non |
| `ReferrersSubModule.tsx` | Composant de surveillance des performances (ReferrersSubModule) | `src/components/admin/performance/ReferrersSubModule.tsx` | Non | 146 | Non - Fichier compact et bien délimité | Non |
| `RelationDetailSheet.tsx` | Composant de surveillance des performances (RelationDetailSheet) | `src/components/admin/performance/RelationDetailSheet.tsx` | Non | 340 | Non - Fichier compact et bien délimité | Non |
| `RelationsTab.tsx` | Composant de surveillance des performances (RelationsTab) | `src/components/admin/performance/RelationsTab.tsx` | Non | 253 | Non - Fichier compact et bien délimité | Non |
| `SixMonthReviewTab.tsx` | Composant de surveillance des performances (SixMonthReviewTab) | `src/components/admin/performance/SixMonthReviewTab.tsx` | Non | 340 | Non - Fichier compact et bien délimité | Non |
| `AnalyticsTracker.tsx` | Composant UI du module analytics (AnalyticsTracker) | `src/components/analytics/AnalyticsTracker.tsx` | Non | 16 | Non - Fichier compact et bien délimité | Non |
| `AuthRequiredModal.tsx` | Composant UI du module auth (AuthRequiredModal) | `src/components/auth/AuthRequiredModal.tsx` | Non | 483 | Non - Fichier compact et bien délimité | Non |
| `ProtectedRoute.tsx` | Composant UI du module auth (ProtectedRoute) | `src/components/auth/ProtectedRoute.tsx` | Non | 33 | Non - Fichier compact et bien délimité | Non |
| `UserProfileModal.tsx` | Composant UI du module auth (UserProfileModal) | `src/components/auth/UserProfileModal.tsx` | Non | 319 | Non - Fichier compact et bien délimité | Non |
| `ROIReport.tsx` | Composant UI du module calc-roi (ROIReport) | `src/components/calc-roi/ROIReport.tsx` | Non | 219 | Non - Fichier compact et bien délimité | Non |
| `ROIWizardSteps.tsx` | Composant UI du module calc-roi (ROIWizardSteps) | `src/components/calc-roi/ROIWizardSteps.tsx` | Non | 326 | Non - Fichier compact et bien délimité | Non |
| `roiUtils.ts` | Composant UI du module calc-roi (roiUtils) | `src/components/calc-roi/roiUtils.ts` | Non | 147 | Non - Fichier compact et bien délimité | Non |
| `ClientContextPanel.tsx` | Composant UI du module clients (ClientContextPanel) | `src/components/clients/ClientContextPanel.tsx` | Non | 283 | Non - Fichier compact et bien délimité | Non |
| `ClientSelectWithCreate.tsx` | Composant UI du module clients (ClientSelectWithCreate) | `src/components/clients/ClientSelectWithCreate.tsx` | Non | 684 | Oui - Composant étendu (684 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `DocumentMismatchModal.tsx` | Composant UI du module common (DocumentMismatchModal) | `src/components/common/DocumentMismatchModal.tsx` | Non | 169 | Non - Fichier compact et bien délimité | Non |
| `FeedbackCorrectionModal.tsx` | Composant UI du module common (FeedbackCorrectionModal) | `src/components/common/FeedbackCorrectionModal.tsx` | Non | 163 | Non - Fichier compact et bien délimité | Non |
| `SectionDeepDive.tsx` | Composant UI du module common (SectionDeepDive) | `src/components/common/SectionDeepDive.tsx` | Non | 236 | Non - Fichier compact et bien délimité | Non |
| `VersionSelectorBar.tsx` | Composant UI du module common (VersionSelectorBar) | `src/components/common/VersionSelectorBar.tsx` | Non | 86 | Non - Fichier compact et bien délimité | Non |
| `EmailThreadHistoryView.tsx` | Composant UI du module email (EmailThreadHistoryView) | `src/components/email/EmailThreadHistoryView.tsx` | Non | 355 | Non - Fichier compact et bien délimité | Non |
| `IncomingEmailHandler.tsx` | Composant UI du module email (IncomingEmailHandler) | `src/components/email/IncomingEmailHandler.tsx` | Non | 112 | Non - Fichier compact et bien délimité | Non |
| `UniversalMailboxModal.tsx` | Composant UI du module email (UniversalMailboxModal) | `src/components/email/UniversalMailboxModal.tsx` | Non | 400 | Non - Fichier compact et bien délimité | Non |
| `AnimatedGraph.tsx` | Composant de gestion et affichage des événements (AnimatedGraph) | `src/components/event/AnimatedGraph.tsx` | Non | 127 | Non - Fichier compact et bien délimité | Non |
| `AnimatedNetwork.tsx` | Composant de gestion et affichage des événements (AnimatedNetwork) | `src/components/event/AnimatedNetwork.tsx` | Non | 255 | Non - Fichier compact et bien délimité | Non |
| `AudioWave.tsx` | Composant de gestion et affichage des événements (AudioWave) | `src/components/event/AudioWave.tsx` | Non | 59 | Non - Fichier compact et bien délimité | Non |
| `ChampagneBubbles.tsx` | Composant de gestion et affichage des événements (ChampagneBubbles) | `src/components/event/ChampagneBubbles.tsx` | Non | 119 | Non - Fichier compact et bien délimité | Non |
| `ChampagneEvent.tsx` | Composant de gestion et affichage des événements (ChampagneEvent) | `src/components/event/ChampagneEvent.tsx` | Non | 266 | Non - Fichier compact et bien délimité | Non |
| `CountryShowcase.tsx` | Composant de gestion et affichage des événements (CountryShowcase) | `src/components/event/CountryShowcase.tsx` | Non | 137 | Non - Fichier compact et bien délimité | Non |
| `EventHero.tsx` | Composant de gestion et affichage des événements (EventHero) | `src/components/event/EventHero.tsx` | Non | 182 | Non - Fichier compact et bien délimité | Non |
| `GoldParticles.tsx` | Composant de gestion et affichage des événements (GoldParticles) | `src/components/event/GoldParticles.tsx` | Non | 125 | Non - Fichier compact et bien délimité | Non |
| `InvestmentGraph.tsx` | Composant de gestion et affichage des événements (InvestmentGraph) | `src/components/event/InvestmentGraph.tsx` | Non | 104 | Non - Fichier compact et bien délimité | Non |
| `LuxuryCountdown.tsx` | Composant de gestion et affichage des événements (LuxuryCountdown) | `src/components/event/LuxuryCountdown.tsx` | Non | 76 | Non - Fichier compact et bien délimité | Non |
| `ProgramTimeline.tsx` | Composant de gestion et affichage des événements (ProgramTimeline) | `src/components/event/ProgramTimeline.tsx` | Non | 188 | Non - Fichier compact et bien délimité | Non |
| `SimpleCountdown.tsx` | Composant de gestion et affichage des événements (SimpleCountdown) | `src/components/event/SimpleCountdown.tsx` | Non | 54 | Non - Fichier compact et bien délimité | Non |
| `TimelineCard.tsx` | Composant de gestion et affichage des événements (TimelineCard) | `src/components/event/TimelineCard.tsx` | Non | 127 | Non - Fichier compact et bien délimité | Non |
| `TimelineSection.tsx` | Composant de gestion et affichage des événements (TimelineSection) | `src/components/event/TimelineSection.tsx` | Non | 115 | Non - Fichier compact et bien délimité | Non |
| `ExpenseCaptureModal.tsx` | Composant UI du module expenses (ExpenseCaptureModal) | `src/components/expenses/ExpenseCaptureModal.tsx` | Non | 712 | Oui - Composant étendu (712 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `FintechPricingTab.tsx` | Composant UI du module fintech (FintechPricingTab) | `src/components/fintech/FintechPricingTab.tsx` | Non | 845 | Oui - Composant étendu (845 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `HeroTypingSlider.tsx` | Composant UI du module home (HeroTypingSlider) | `src/components/home/HeroTypingSlider.tsx` | Non | 434 | Non - Fichier compact et bien délimité | Non |
| `ServiceHeroImage.tsx` | Composant UI du module ia (ServiceHeroImage) | `src/components/ia/ServiceHeroImage.tsx` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `CalendarScheduleModal.tsx` | Composant UI du module integrations (CalendarScheduleModal) | `src/components/integrations/CalendarScheduleModal.tsx` | Non | 324 | Non - Fichier compact et bien délimité | Non |
| `EmailActionModal.tsx` | Composant UI du module integrations (EmailActionModal) | `src/components/integrations/EmailActionModal.tsx` | Non | 442 | Non - Fichier compact et bien délimité | Non |
| `MeetingReportView.tsx` | Composant UI du module meetings (MeetingReportView) | `src/components/meetings/MeetingReportView.tsx` | Non | 218 | Non - Fichier compact et bien délimité | Non |
| `Emoji.tsx` | Composant UI du module partners (Emoji) | `src/components/partners/Emoji.tsx` | Non | 34 | Non - Fichier compact et bien délimité | Non |
| `SnapCarousel.tsx` | Composant UI du module partners (SnapCarousel) | `src/components/partners/SnapCarousel.tsx` | Non | 47 | Non - Fichier compact et bien délimité | Non |
| `SaveWorkModal.tsx` | Composant UI du module saved-work (SaveWorkModal) | `src/components/saved-work/SaveWorkModal.tsx` | Non | 273 | Non - Fichier compact et bien délimité | Non |
| `SavedWorkDrawer.tsx` | Composant UI du module saved-work (SavedWorkDrawer) | `src/components/saved-work/SavedWorkDrawer.tsx` | Non | 271 | Non - Fichier compact et bien délimité | Non |
| `AboutBNE.tsx` | Composant de mise en page du site public (AboutBNE) | `src/components/site/AboutBNE.tsx` | Non | 120 | Non - Fichier compact et bien délimité | Non |
| `AnimatedClip.tsx` | Composant de mise en page du site public (AnimatedClip) | `src/components/site/AnimatedClip.tsx` | Non | 13 | Non - Fichier compact et bien délimité | Non |
| `Chatbot.tsx` | Composant de mise en page du site public (Chatbot) | `src/components/site/Chatbot.tsx` | Non | 102 | Non - Fichier compact et bien délimité | Non |
| `EnterpriseAuthBar.tsx` | Composant de mise en page du site public (EnterpriseAuthBar) | `src/components/site/EnterpriseAuthBar.tsx` | Non | 15 | Non - Fichier compact et bien délimité | Non |
| `FloatingContactButton.tsx` | Composant de mise en page du site public (FloatingContactButton) | `src/components/site/FloatingContactButton.tsx` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `MembersCarousel.tsx` | Composant de mise en page du site public (MembersCarousel) | `src/components/site/MembersCarousel.tsx` | Non | 163 | Non - Fichier compact et bien délimité | Non |
| `ProgramPanel.tsx` | Composant de mise en page du site public (ProgramPanel) | `src/components/site/ProgramPanel.tsx` | Non | 165 | Non - Fichier compact et bien délimité | Non |
| `SectionHeading.tsx` | Composant de mise en page du site public (SectionHeading) | `src/components/site/SectionHeading.tsx` | Non | 12 | Non - Fichier compact et bien délimité | Non |
| `SiteFooter.tsx` | Composant de mise en page du site public (SiteFooter) | `src/components/site/SiteFooter.tsx` | Non | 69 | Non - Fichier compact et bien délimité | Non |
| `SiteHeader.tsx` | Composant de mise en page du site public (SiteHeader) | `src/components/site/SiteHeader.tsx` | Non | 820 | Oui - Composant étendu (820 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `SiteLayout.tsx` | Composant de mise en page du site public (SiteLayout) | `src/components/site/SiteLayout.tsx` | Non | 49 | Non - Fichier compact et bien délimité | Non |
| `TestimonialFlag.tsx` | Composant de mise en page du site public (TestimonialFlag) | `src/components/site/TestimonialFlag.tsx` | Non | 27 | Non - Fichier compact et bien délimité | Non |
| `TestimonialsCarousel.tsx` | Composant de mise en page du site public (TestimonialsCarousel) | `src/components/site/TestimonialsCarousel.tsx` | Non | 134 | Non - Fichier compact et bien délimité | Non |
| `DocumentSummaryView.tsx` | Composant UI du module summarizer (DocumentSummaryView) | `src/components/summarizer/DocumentSummaryView.tsx` | Non | 379 | Non - Fichier compact et bien délimité | Non |
| `TendersFinderSection.tsx` | Composant UI du module tenders (TendersFinderSection) | `src/components/tenders/TendersFinderSection.tsx` | Non | 357 | Non - Fichier compact et bien délimité | Non |
| `theme-provider.tsx` | Composant UI du module générique (theme-provider) | `src/components/theme-provider.tsx` | Non | 73 | Non - Fichier compact et bien délimité | Non |
| `Countdown.tsx` | Composant d'interface utilisateur réutilisable (Countdown) basé sur Radix UI et TailwindCSS | `src/components/ui/Countdown.tsx` | Non | 82 | Non - Fichier compact et bien délimité | Non |
| `DocumentUploadCapture.tsx` | Composant d'interface utilisateur réutilisable (DocumentUploadCapture) basé sur Radix UI et TailwindCSS | `src/components/ui/DocumentUploadCapture.tsx` | Non | 162 | Non - Fichier compact et bien délimité | Non |
| `PdfPreviewModal.tsx` | Composant d'interface utilisateur réutilisable (PdfPreviewModal) basé sur Radix UI et TailwindCSS | `src/components/ui/PdfPreviewModal.tsx` | Non | 385 | Non - Fichier compact et bien délimité | Non |
| `accordion.tsx` | Composant d'interface utilisateur réutilisable (accordion) basé sur Radix UI et TailwindCSS | `src/components/ui/accordion.tsx` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `alert-dialog.tsx` | Composant d'interface utilisateur réutilisable (alert-dialog) basé sur Radix UI et TailwindCSS | `src/components/ui/alert-dialog.tsx` | Non | 104 | Non - Fichier compact et bien délimité | Non |
| `alert.tsx` | Composant d'interface utilisateur réutilisable (alert) basé sur Radix UI et TailwindCSS | `src/components/ui/alert.tsx` | Non | 43 | Non - Fichier compact et bien délimité | Non |
| `aspect-ratio.tsx` | Composant d'interface utilisateur réutilisable (aspect-ratio) basé sur Radix UI et TailwindCSS | `src/components/ui/aspect-ratio.tsx` | Non | 5 | Non - Fichier compact et bien délimité | Non |
| `avatar.tsx` | Composant d'interface utilisateur réutilisable (avatar) basé sur Radix UI et TailwindCSS | `src/components/ui/avatar.tsx` | Non | 38 | Non - Fichier compact et bien délimité | Non |
| `badge.tsx` | Composant d'interface utilisateur réutilisable (badge) basé sur Radix UI et TailwindCSS | `src/components/ui/badge.tsx` | Non | 29 | Non - Fichier compact et bien délimité | Non |
| `breadcrumb.tsx` | Composant d'interface utilisateur réutilisable (breadcrumb) basé sur Radix UI et TailwindCSS | `src/components/ui/breadcrumb.tsx` | Non | 90 | Non - Fichier compact et bien délimité | Non |
| `button.tsx` | Composant d'interface utilisateur réutilisable (button) basé sur Radix UI et TailwindCSS | `src/components/ui/button.tsx` | Non | 53 | Non - Fichier compact et bien délimité | Non |
| `calendar.tsx` | Composant d'interface utilisateur réutilisable (calendar) basé sur Radix UI et TailwindCSS | `src/components/ui/calendar.tsx` | Non | 54 | Non - Fichier compact et bien délimité | Non |
| `card.tsx` | Composant d'interface utilisateur réutilisable (card) basé sur Radix UI et TailwindCSS | `src/components/ui/card.tsx` | Non | 43 | Non - Fichier compact et bien délimité | Non |
| `carousel.tsx` | Composant d'interface utilisateur réutilisable (carousel) basé sur Radix UI et TailwindCSS | `src/components/ui/carousel.tsx` | Non | 224 | Non - Fichier compact et bien délimité | Non |
| `chart.tsx` | Composant d'interface utilisateur réutilisable (chart) basé sur Radix UI et TailwindCSS | `src/components/ui/chart.tsx` | Non | 303 | Non - Fichier compact et bien délimité | Non |
| `checkbox.tsx` | Composant d'interface utilisateur réutilisable (checkbox) basé sur Radix UI et TailwindCSS | `src/components/ui/checkbox.tsx` | Non | 26 | Non - Fichier compact et bien délimité | Non |
| `collapsible.tsx` | Composant d'interface utilisateur réutilisable (collapsible) basé sur Radix UI et TailwindCSS | `src/components/ui/collapsible.tsx` | Non | 9 | Non - Fichier compact et bien délimité | Non |
| `command.tsx` | Composant d'interface utilisateur réutilisable (command) basé sur Radix UI et TailwindCSS | `src/components/ui/command.tsx` | Non | 132 | Non - Fichier compact et bien délimité | Non |
| `context-menu.tsx` | Composant d'interface utilisateur réutilisable (context-menu) basé sur Radix UI et TailwindCSS | `src/components/ui/context-menu.tsx` | Non | 178 | Non - Fichier compact et bien délimité | Non |
| `dialog.tsx` | Composant d'interface utilisateur réutilisable (dialog) basé sur Radix UI et TailwindCSS | `src/components/ui/dialog.tsx` | Non | 95 | Non - Fichier compact et bien délimité | Non |
| `drawer.tsx` | Composant d'interface utilisateur réutilisable (drawer) basé sur Radix UI et TailwindCSS | `src/components/ui/drawer.tsx` | Non | 87 | Non - Fichier compact et bien délimité | Non |
| `dropdown-menu.tsx` | Composant d'interface utilisateur réutilisable (dropdown-menu) basé sur Radix UI et TailwindCSS | `src/components/ui/dropdown-menu.tsx` | Non | 179 | Non - Fichier compact et bien délimité | Non |
| `form.tsx` | Composant d'interface utilisateur réutilisable (form) basé sur Radix UI et TailwindCSS | `src/components/ui/form.tsx` | Non | 129 | Non - Fichier compact et bien délimité | Non |
| `hover-card.tsx` | Composant d'interface utilisateur réutilisable (hover-card) basé sur Radix UI et TailwindCSS | `src/components/ui/hover-card.tsx` | Non | 27 | Non - Fichier compact et bien délimité | Non |
| `input-otp.tsx` | Composant d'interface utilisateur réutilisable (input-otp) basé sur Radix UI et TailwindCSS | `src/components/ui/input-otp.tsx` | Non | 61 | Non - Fichier compact et bien délimité | Non |
| `input.tsx` | Composant d'interface utilisateur réutilisable (input) basé sur Radix UI et TailwindCSS | `src/components/ui/input.tsx` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `label.tsx` | Composant d'interface utilisateur réutilisable (label) basé sur Radix UI et TailwindCSS | `src/components/ui/label.tsx` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `menubar.tsx` | Composant d'interface utilisateur réutilisable (menubar) basé sur Radix UI et TailwindCSS | `src/components/ui/menubar.tsx` | Non | 207 | Non - Fichier compact et bien délimité | Non |
| `navigation-menu.tsx` | Composant d'interface utilisateur réutilisable (navigation-menu) basé sur Radix UI et TailwindCSS | `src/components/ui/navigation-menu.tsx` | Non | 120 | Non - Fichier compact et bien délimité | Non |
| `pagination.tsx` | Composant d'interface utilisateur réutilisable (pagination) basé sur Radix UI et TailwindCSS | `src/components/ui/pagination.tsx` | Non | 81 | Non - Fichier compact et bien délimité | Non |
| `popover.tsx` | Composant d'interface utilisateur réutilisable (popover) basé sur Radix UI et TailwindCSS | `src/components/ui/popover.tsx` | Non | 29 | Non - Fichier compact et bien délimité | Non |
| `progress.tsx` | Composant d'interface utilisateur réutilisable (progress) basé sur Radix UI et TailwindCSS | `src/components/ui/progress.tsx` | Non | 23 | Non - Fichier compact et bien délimité | Non |
| `radio-group.tsx` | Composant d'interface utilisateur réutilisable (radio-group) basé sur Radix UI et TailwindCSS | `src/components/ui/radio-group.tsx` | Non | 36 | Non - Fichier compact et bien délimité | Non |
| `resizable.tsx` | Composant d'interface utilisateur réutilisable (resizable) basé sur Radix UI et TailwindCSS | `src/components/ui/resizable.tsx` | Non | 37 | Non - Fichier compact et bien délimité | Non |
| `scroll-area.tsx` | Composant d'interface utilisateur réutilisable (scroll-area) basé sur Radix UI et TailwindCSS | `src/components/ui/scroll-area.tsx` | Non | 38 | Non - Fichier compact et bien délimité | Non |
| `select.tsx` | Composant d'interface utilisateur réutilisable (select) basé sur Radix UI et TailwindCSS | `src/components/ui/select.tsx` | Non | 143 | Non - Fichier compact et bien délimité | Non |
| `separator.tsx` | Composant d'interface utilisateur réutilisable (separator) basé sur Radix UI et TailwindCSS | `src/components/ui/separator.tsx` | Non | 20 | Non - Fichier compact et bien délimité | Non |
| `sheet.tsx` | Composant d'interface utilisateur réutilisable (sheet) basé sur Radix UI et TailwindCSS | `src/components/ui/sheet.tsx` | Non | 107 | Non - Fichier compact et bien délimité | Non |
| `sidebar.tsx` | Composant d'interface utilisateur réutilisable (sidebar) basé sur Radix UI et TailwindCSS | `src/components/ui/sidebar.tsx` | Non | 637 | Oui - Composant étendu (637 lignes) : extraire les sous-vues et la logique d'état dans un hook dédié | Non |
| `skeleton.tsx` | Composant d'interface utilisateur réutilisable (skeleton) basé sur Radix UI et TailwindCSS | `src/components/ui/skeleton.tsx` | Non | 7 | Non - Fichier compact et bien délimité | Non |
| `slider.tsx` | Composant d'interface utilisateur réutilisable (slider) basé sur Radix UI et TailwindCSS | `src/components/ui/slider.tsx` | Non | 23 | Non - Fichier compact et bien délimité | Non |
| `sonner.tsx` | Composant d'interface utilisateur réutilisable (sonner) basé sur Radix UI et TailwindCSS | `src/components/ui/sonner.tsx` | Non | 27 | Non - Fichier compact et bien délimité | Non |
| `switch.tsx` | Composant d'interface utilisateur réutilisable (switch) basé sur Radix UI et TailwindCSS | `src/components/ui/switch.tsx` | Non | 27 | Non - Fichier compact et bien délimité | Non |
| `table.tsx` | Composant d'interface utilisateur réutilisable (table) basé sur Radix UI et TailwindCSS | `src/components/ui/table.tsx` | Non | 72 | Non - Fichier compact et bien délimité | Non |
| `tabs.tsx` | Composant d'interface utilisateur réutilisable (tabs) basé sur Radix UI et TailwindCSS | `src/components/ui/tabs.tsx` | Non | 53 | Non - Fichier compact et bien délimité | Non |
| `textarea.tsx` | Composant d'interface utilisateur réutilisable (textarea) basé sur Radix UI et TailwindCSS | `src/components/ui/textarea.tsx` | Non | 21 | Non - Fichier compact et bien délimité | Non |
| `toast.tsx` | Composant d'interface utilisateur réutilisable (toast) basé sur Radix UI et TailwindCSS | `src/components/ui/toast.tsx` | Non | 111 | Non - Fichier compact et bien délimité | Non |
| `toaster.tsx` | Composant d'interface utilisateur réutilisable (toaster) basé sur Radix UI et TailwindCSS | `src/components/ui/toaster.tsx` | Non | 24 | Non - Fichier compact et bien délimité | Non |
| `toggle-group.tsx` | Composant d'interface utilisateur réutilisable (toggle-group) basé sur Radix UI et TailwindCSS | `src/components/ui/toggle-group.tsx` | Non | 49 | Non - Fichier compact et bien délimité | Non |
| `toggle.tsx` | Composant d'interface utilisateur réutilisable (toggle) basé sur Radix UI et TailwindCSS | `src/components/ui/toggle.tsx` | Non | 37 | Non - Fichier compact et bien délimité | Non |
| `tooltip.tsx` | Composant d'interface utilisateur réutilisable (tooltip) basé sur Radix UI et TailwindCSS | `src/components/ui/tooltip.tsx` | Non | 28 | Non - Fichier compact et bien délimité | Non |
| `use-toast.ts` | Composant d'interface utilisateur réutilisable (use-toast) basé sur Radix UI et TailwindCSS | `src/components/ui/use-toast.ts` | Non | 3 | Non - Fichier compact et bien délimité | Non |

---

### 4. Frontend - Logique Métier, Données, Hooks & Services (src/lib, src/data, src/hooks, etc.) (53 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `App.tsx` | Composant racine de l'application, arborescence des routes et providers | `src/App.tsx` | Non | 216 | Non - Fichier compact et bien délimité | Non |
| `AuthContext.tsx` | Composant React TypeScript | `src/contexts/AuthContext.tsx` | Non | 94 | Non - Fichier compact et bien délimité | Non |
| `countries.ts` | Fichier de données locales et référentiels (countries.ts) | `src/data/countries.ts` | Non | 159 | Non - Fichier compact et bien délimité | Non |
| `mockData.ts` | Fichier de données locales et référentiels (mockData.ts) | `src/data/mockData.ts` | Oui - Fichier central de données mockées (offres, avis, membres, événements) | 222 | Non - Fichier compact et bien délimité | Non |
| `mockDemoData.ts` | Fichier de données locales et référentiels (mockDemoData.ts) | `src/data/mockDemoData.ts` | Oui - Fichier de données mockées dédié au parcours de démo interactive | 299 | Non - Fichier compact et bien délimité | Non |
| `servicesIAData.ts` | Fichier de données locales et référentiels (servicesIAData.ts) | `src/data/servicesIAData.ts` | Non | 365 | Non - Fichier compact et bien délimité | Oui - Templates de prompts par défaut configurés pour chaque service IA |
| `use-mobile.tsx` | Hook React personnalisé (use-mobile.tsx) | `src/hooks/use-mobile.tsx` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `use-toast.ts` | Hook React personnalisé (use-toast.ts) | `src/hooks/use-toast.ts` | Non | 186 | Non - Fichier compact et bien délimité | Non |
| `useGuestQuota.ts` | Hook React personnalisé (useGuestQuota.ts) | `src/hooks/useGuestQuota.ts` | Non | 66 | Non - Fichier compact et bien délimité | Non |
| `LanguageContext.tsx` | Fichier d'internationalisation / dictionnaire (LanguageContext.tsx) | `src/i18n/LanguageContext.tsx` | Non | 60 | Non - Fichier compact et bien délimité | Non |
| `en.json` | Fichier d'internationalisation / dictionnaire (en.json) | `src/i18n/en.json` | Oui - Variables mockées déclarées (mock_events, mock_offers) | 822 | Non - Fichier compact et bien délimité | Non |
| `fr.json` | Fichier d'internationalisation / dictionnaire (fr.json) | `src/i18n/fr.json` | Oui - Variables mockées déclarées (mock_events, mock_offers) | 822 | Non - Fichier compact et bien délimité | Non |
| `index.css` | Styles CSS globaux, directives Tailwind et variables de thème HSL | `src/index.css` | Non | 1046 | Oui - Très volumineux (1046 lignes) : scinder en sous-composants, hooks et services | Non |
| `apiConfig.ts` | Module utilitaire / service métier client (apiConfig) | `src/lib/apiConfig.ts` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `benchmarkConfig.ts` | Module utilitaire / service métier client (benchmarkConfig) | `src/lib/benchmarkConfig.ts` | Non | 281 | Non - Fichier compact et bien délimité | Non |
| `benchmarkService.ts` | Module utilitaire / service métier client (benchmarkService) | `src/lib/benchmarkService.ts` | Non | 85 | Non - Fichier compact et bien délimité | Non |
| `clientContextHubService.ts` | Module utilitaire / service métier client (clientContextHubService) | `src/lib/clientContextHubService.ts` | Non | 166 | Non - Fichier compact et bien délimité | Non |
| `companySearchService.ts` | Module utilitaire / service métier client (companySearchService) | `src/lib/companySearchService.ts` | Non | 93 | Non - Fichier compact et bien délimité | Non |
| `contentGeneratorService.ts` | Module utilitaire / service métier client (contentGeneratorService) | `src/lib/contentGeneratorService.ts` | Non | 171 | Non - Fichier compact et bien délimité | Non |
| `deepDiveService.ts` | Module utilitaire / service métier client (deepDiveService) | `src/lib/deepDiveService.ts` | Non | 33 | Non - Fichier compact et bien délimité | Non |
| `diagnosticService.ts` | Module utilitaire / service métier client (diagnosticService) | `src/lib/diagnosticService.ts` | Non | 150 | Non - Fichier compact et bien délimité | Non |
| `documentClassifierService.ts` | Module utilitaire / service métier client (documentClassifierService) | `src/lib/documentClassifierService.ts` | Non | 62 | Non - Fichier compact et bien délimité | Non |
| `documentParserService.ts` | Module utilitaire / service métier client (documentParserService) | `src/lib/documentParserService.ts` | Non | 260 | Non - Fichier compact et bien délimité | Non |
| `emailAssistantService.ts` | Module utilitaire / service métier client (emailAssistantService) | `src/lib/emailAssistantService.ts` | Non | 115 | Non - Fichier compact et bien délimité | Non |
| `expenseService.ts` | Module utilitaire / service métier client (expenseService) | `src/lib/expenseService.ts` | Non | 86 | Non - Fichier compact et bien délimité | Non |
| `feedbackService.ts` | Module utilitaire / service métier client (feedbackService) | `src/lib/feedbackService.ts` | Non | 88 | Non - Fichier compact et bien délimité | Non |
| `fintechKolectoService.ts` | Module utilitaire / service métier client (fintechKolectoService) | `src/lib/fintechKolectoService.ts` | Non | 199 | Non - Fichier compact et bien délimité | Non |
| `followupService.ts` | Module utilitaire / service métier client (followupService) | `src/lib/followupService.ts` | Non | 112 | Non - Fichier compact et bien délimité | Non |
| `guestQuotaService.ts` | Module utilitaire / service métier client (guestQuotaService) | `src/lib/guestQuotaService.ts` | Non | 72 | Non - Fichier compact et bien délimité | Non |
| `integrationService.ts` | Module utilitaire / service métier client (integrationService) | `src/lib/integrationService.ts` | Non | 477 | Non - Fichier compact et bien délimité | Non |
| `invoiceService.ts` | Module utilitaire / service métier client (invoiceService) | `src/lib/invoiceService.ts` | Non | 211 | Non - Fichier compact et bien délimité | Non |
| `leadsGeneratorService.ts` | Module utilitaire / service métier client (leadsGeneratorService) | `src/lib/leadsGeneratorService.ts` | Non | 112 | Non - Fichier compact et bien délimité | Non |
| `meetingPrepService.ts` | Module utilitaire / service métier client (meetingPrepService) | `src/lib/meetingPrepService.ts` | Non | 105 | Non - Fichier compact et bien délimité | Non |
| `meetingReportService.ts` | Module utilitaire / service métier client (meetingReportService) | `src/lib/meetingReportService.ts` | Non | 190 | Non - Fichier compact et bien délimité | Non |
| `ocrService.ts` | Module utilitaire / service métier client (ocrService) | `src/lib/ocrService.ts` | Non | 168 | Non - Fichier compact et bien délimité | Non |
| `ocrVisionService.ts` | Module utilitaire / service métier client (ocrVisionService) | `src/lib/ocrVisionService.ts` | Non | 122 | Non - Fichier compact et bien délimité | Non |
| `pdfExportService.ts` | Module utilitaire / service métier client (pdfExportService) | `src/lib/pdfExportService.ts` | Non | 956 | Oui - Module dense (956 lignes) : séparer les types, utilitaires et règles métier | Non |
| `planLimitsService.ts` | Module utilitaire / service métier client (planLimitsService) | `src/lib/planLimitsService.ts` | Non | 79 | Non - Fichier compact et bien délimité | Non |
| `prospectingEmailService.ts` | Module utilitaire / service métier client (prospectingEmailService) | `src/lib/prospectingEmailService.ts` | Non | 76 | Non - Fichier compact et bien délimité | Non |
| `quoteService.ts` | Module utilitaire / service métier client (quoteService) | `src/lib/quoteService.ts` | Non | 338 | Non - Fichier compact et bien délimité | Non |
| `savedWorkService.ts` | Module utilitaire / service métier client (savedWorkService) | `src/lib/savedWorkService.ts` | Non | 95 | Non - Fichier compact et bien délimité | Non |
| `summarizerService.ts` | Module utilitaire / service métier client (summarizerService) | `src/lib/summarizerService.ts` | Non | 183 | Non - Fichier compact et bien délimité | Non |
| `telemetryService.ts` | Module utilitaire / service métier client (telemetryService) | `src/lib/telemetryService.ts` | Non | 71 | Non - Fichier compact et bien délimité | Oui - Comptage et télémétrie des tokens de prompt |
| `tenderService.ts` | Module utilitaire / service métier client (tenderService) | `src/lib/tenderService.ts` | Non | 46 | Non - Fichier compact et bien délimité | Non |
| `utils.ts` | Module utilitaire / service métier client (utils) | `src/lib/utils.ts` | Non | 6 | Non - Fichier compact et bien délimité | Non |
| `validationLuhn.ts` | Module utilitaire / service métier client (validationLuhn) | `src/lib/validationLuhn.ts` | Non | 68 | Non - Fichier compact et bien délimité | Non |
| `vectorKnowledgeService.ts` | Module utilitaire / service métier client (vectorKnowledgeService) | `src/lib/vectorKnowledgeService.ts` | Non | 103 | Non - Fichier compact et bien délimité | Non |
| `main.tsx` | Point d'entrée TypeScript montant l'application React dans le DOM | `src/main.tsx` | Non | 20 | Non - Fichier compact et bien délimité | Non |
| `analyticsTracker.ts` | Service applicatif frontend (analyticsTracker.ts) | `src/services/analyticsTracker.ts` | Non | 157 | Non - Fichier compact et bien délimité | Non |
| `performanceService.ts` | Service applicatif frontend (performanceService.ts) | `src/services/performanceService.ts` | Non | 828 | Oui - Module dense (828 lignes) : séparer les types, utilitaires et règles métier | Non |
| `example.test.ts` | Module de logique TypeScript | `src/test/example.test.ts` | Non | 7 | Non - Fichier compact et bien délimité | Non |
| `setup.ts` | Module de logique TypeScript | `src/test/setup.ts` | Non | 15 | Non - Fichier compact et bien délimité | Non |
| `performance.ts` | Module de logique TypeScript | `src/types/performance.ts` | Non | 323 | Non - Fichier compact et bien délimité | Non |

---

### 5. Backend PHP & API (public/api) (113 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `api-admin.php` | Script backend PHP | `public/api-admin.php` | Non | 726 | Oui - Endpoint volumineux (726 lignes) : séparer la validation, la logique métier et l'accès SQL | Non |
| `api-analytics.php` | Script backend PHP | `public/api-analytics.php` | Non | 766 | Oui - Endpoint volumineux (766 lignes) : séparer la validation, la logique métier et l'accès SQL | Non |
| `api-auth.php` | Script backend PHP | `public/api-auth.php` | Non | 73 | Non - Fichier compact et bien délimité | Non |
| `api-avis.php` | Script backend PHP | `public/api-avis.php` | Non | 121 | Non - Fichier compact et bien délimité | Non |
| `api-config.php` | Script backend PHP | `public/api-config.php` | Non | 31 | Non - Fichier compact et bien délimité | Non |
| `api-performance.php` | Script backend PHP | `public/api-performance.php` | Non | 852 | Oui - Endpoint volumineux (852 lignes) : séparer la validation, la logique métier et l'accès SQL | Non |
| `api-public.php` | Script backend PHP | `public/api-public.php` | Non | 208 | Non - Fichier compact et bien délimité | Non |
| `api-seed.php` | Script backend PHP | `public/api-seed.php` | Oui - Script de création et peuplement de comptes/données mockées | 75 | Non - Fichier compact et bien délimité | Non |
| `api-visites.php` | Script backend PHP | `public/api-visites.php` | Non | 76 | Non - Fichier compact et bien délimité | Non |
| `ai_settings.json` | Point d'accès API backend PHP (ai_settings) | `public/api/ai_settings.json` | Non | 8 | Non - Fichier compact et bien délimité | Non |
| `ai_settings.php` | Point d'accès API backend PHP (ai_settings) | `public/api/ai_settings.php` | Oui - Requête ou fallback sur dev_db.json | 89 | Non - Fichier compact et bien délimité | Non |
| `ai_telemetry.php` | Point d'accès API backend PHP (ai_telemetry) | `public/api/ai_telemetry.php` | Non | 207 | Non - Fichier compact et bien délimité | Non |
| `ai_test_provider.php` | Point d'accès API backend PHP (ai_test_provider) | `public/api/ai_test_provider.php` | Non | 91 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `forgot_password.php` | Endpoint backend d'authentification (forgot_password) | `public/api/auth/forgot_password.php` | Non | 92 | Non - Fichier compact et bien délimité | Non |
| `login.php` | Endpoint backend d'authentification (login) | `public/api/auth/login.php` | Non | 116 | Non - Fichier compact et bien délimité | Non |
| `register.php` | Endpoint backend d'authentification (register) | `public/api/auth/register.php` | Non | 171 | Non - Fichier compact et bien délimité | Non |
| `reset_password.php` | Endpoint backend d'authentification (reset_password) | `public/api/auth/reset_password.php` | Non | 68 | Non - Fichier compact et bien délimité | Non |
| `bank_reconciliation.php` | Point d'accès API backend PHP (bank_reconciliation) | `public/api/bank_reconciliation.php` | Oui - Requête ou fallback sur dev_db.json | 163 | Non - Fichier compact et bien délimité | Non |
| `benchmark_stats.php` | Point d'accès API backend PHP (benchmark_stats) | `public/api/benchmark_stats.php` | Non | 26 | Non - Fichier compact et bien délimité | Non |
| `benchmark_submit.php` | Point d'accès API backend PHP (benchmark_submit) | `public/api/benchmark_submit.php` | Non | 46 | Non - Fichier compact et bien délimité | Non |
| `calendar.php` | Point d'accès API backend PHP (calendar) | `public/api/calendar.php` | Oui - Requête ou fallback sur dev_db.json | 85 | Non - Fichier compact et bien délimité | Non |
| `classify_document.php` | Point d'accès API backend PHP (classify_document) | `public/api/classify_document.php` | Non | 157 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `client_context_hub.php` | Point d'accès API backend PHP (client_context_hub) | `public/api/client_context_hub.php` | Oui - Génération de contexte client mocké par défaut en mode dev | 433 | Non - Fichier compact et bien délimité | Non |
| `clients.php` | Point d'accès API backend PHP (clients) | `public/api/clients.php` | Oui - Requête ou fallback sur dev_db.json | 177 | Non - Fichier compact et bien délimité | Non |
| `company_search.php` | Point d'accès API backend PHP (company_search) | `public/api/company_search.php` | Non | 240 | Non - Fichier compact et bien délimité | Non |
| `company_settings.php` | Point d'accès API backend PHP (company_settings) | `public/api/company_settings.php` | Oui - Requête ou fallback sur dev_db.json | 70 | Non - Fichier compact et bien délimité | Non |
| `composer.json` | Point d'accès API backend PHP (composer) | `public/api/composer.json` | Non | 15 | Non - Fichier compact et bien délimité | Non |
| `config.php` | Point d'accès API backend PHP (config) | `public/api/config.php` | Oui - Requête ou fallback sur dev_db.json | 727 | Oui - Endpoint volumineux (727 lignes) : séparer la validation, la logique métier et l'accès SQL | Non |
| `content_brand_settings.php` | Point d'accès API backend PHP (content_brand_settings) | `public/api/content_brand_settings.php` | Non | 18 | Non - Fichier compact et bien délimité | Non |
| `content_export.php` | Point d'accès API backend PHP (content_export) | `public/api/content_export.php` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `content_generate.php` | Point d'accès API backend PHP (content_generate) | `public/api/content_generate.php` | Non | 136 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `content_history.php` | Point d'accès API backend PHP (content_history) | `public/api/content_history.php` | Non | 31 | Non - Fichier compact et bien délimité | Non |
| `content_kpis.php` | Point d'accès API backend PHP (content_kpis) | `public/api/content_kpis.php` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `context_engine.php` | Point d'accès API backend PHP (context_engine) | `public/api/context_engine.php` | Non | 165 | Non - Fichier compact et bien délimité | Non |
| `create_mock_accounts.php` | Point d'accès API backend PHP (create_mock_accounts) | `public/api/create_mock_accounts.php` | Oui - Script de création et peuplement de comptes/données mockées | 96 | Non - Fichier compact et bien délimité | Non |
| `deep_dive.php` | Point d'accès API backend PHP (deep_dive) | `public/api/deep_dive.php` | Non | 87 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `diagnostic_agents.php` | Point d'accès API backend PHP (diagnostic_agents) | `public/api/diagnostic_agents.php` | Non | 211 | Non - Fichier compact et bien délimité | Oui - Template ou chaîne de prompt envoyée au modèle LLM |
| `diagnostic_pdf.php` | Point d'accès API backend PHP (diagnostic_pdf) | `public/api/diagnostic_pdf.php` | Non | 133 | Non - Fichier compact et bien délimité | Non |
| `diagnostic_step.php` | Point d'accès API backend PHP (diagnostic_step) | `public/api/diagnostic_step.php` | Non | 103 | Non - Fichier compact et bien délimité | Oui - Prompt système complet avec définition de persona et consignes LLM |
| `diagnostic_upload.php` | Point d'accès API backend PHP (diagnostic_upload) | `public/api/diagnostic_upload.php` | Non | 75 | Non - Fichier compact et bien délimité | Non |
| `document_parser.php` | Point d'accès API backend PHP (document_parser) | `public/api/document_parser.php` | Non | 117 | Non - Fichier compact et bien délimité | Non |
| `email_analyze.php` | Point d'accès API backend PHP (email_analyze) | `public/api/email_analyze.php` | Non | 79 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `email_generate.php` | Point d'accès API backend PHP (email_generate) | `public/api/email_generate.php` | Non | 81 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `email_history.php` | Point d'accès API backend PHP (email_history) | `public/api/email_history.php` | Non | 37 | Non - Fichier compact et bien délimité | Non |
| `email_integrations.php` | Point d'accès API backend PHP (email_integrations) | `public/api/email_integrations.php` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `expenses.php` | Point d'accès API backend PHP (expenses) | `public/api/expenses.php` | Oui - Requête ou fallback sur dev_db.json | 188 | Non - Fichier compact et bien délimité | Non |
| `expenses_export.php` | Point d'accès API backend PHP (expenses_export) | `public/api/expenses_export.php` | Oui - Requête ou fallback sur dev_db.json | 60 | Non - Fichier compact et bien délimité | Non |
| `facturx_generator.php` | Point d'accès API backend PHP (facturx_generator) | `public/api/facturx_generator.php` | Oui - Requête ou fallback sur dev_db.json | 308 | Non - Fichier compact et bien délimité | Non |
| `fec_export.php` | Point d'accès API backend PHP (fec_export) | `public/api/fec_export.php` | Oui - Requête ou fallback sur dev_db.json | 217 | Non - Fichier compact et bien délimité | Non |
| `feedback_loop.php` | Point d'accès API backend PHP (feedback_loop) | `public/api/feedback_loop.php` | Non | 151 | Non - Fichier compact et bien délimité | Non |
| `followup_generate.php` | Point d'accès API backend PHP (followup_generate) | `public/api/followup_generate.php` | Non | 68 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `followup_kpis.php` | Point d'accès API backend PHP (followup_kpis) | `public/api/followup_kpis.php` | Non | 19 | Non - Fichier compact et bien délimité | Non |
| `followup_send.php` | Point d'accès API backend PHP (followup_send) | `public/api/followup_send.php` | Non | 32 | Non - Fichier compact et bien délimité | Non |
| `followup_targets.php` | Point d'accès API backend PHP (followup_targets) | `public/api/followup_targets.php` | Non | 76 | Non - Fichier compact et bien délimité | Non |
| `fraud_check_iban.php` | Point d'accès API backend PHP (fraud_check_iban) | `public/api/fraud_check_iban.php` | Oui - Requête ou fallback sur dev_db.json | 212 | Non - Fichier compact et bien délimité | Non |
| `groq_client.php` | Point d'accès API backend PHP (groq_client) | `public/api/groq_client.php` | Non | 190 | Non - Fichier compact et bien délimité | Non |
| `create_draft.php` | Passerelle d'intégration backend avec Create_draft | `public/api/integrations/create_draft.php` | Non | 28 | Non - Fichier compact et bien délimité | Non |
| `disconnect.php` | Passerelle d'intégration backend avec Disconnect | `public/api/integrations/disconnect.php` | Oui - Requête ou fallback sur dev_db.json | 38 | Non - Fichier compact et bien délimité | Non |
| `fetch_emails.php` | Passerelle d'intégration backend avec Fetch_emails | `public/api/integrations/fetch_emails.php` | Non | 82 | Non - Fichier compact et bien délimité | Non |
| `mailbox_autoconfig.php` | Passerelle d'intégration backend avec Mailbox_autoconfig | `public/api/integrations/mailbox_autoconfig.php` | Non | 173 | Non - Fichier compact et bien délimité | Non |
| `mailboxes.php` | Passerelle d'intégration backend avec Mailboxes | `public/api/integrations/mailboxes.php` | Non | 192 | Non - Fichier compact et bien délimité | Non |
| `oauth_connect.php` | Passerelle d'intégration backend avec Oauth_connect | `public/api/integrations/oauth_connect.php` | Oui - Requête ou fallback sur dev_db.json | 81 | Non - Fichier compact et bien délimité | Non |
| `schedule_calendar.php` | Passerelle d'intégration backend avec Schedule_calendar | `public/api/integrations/schedule_calendar.php` | Non | 35 | Non - Fichier compact et bien délimité | Non |
| `send_email.php` | Passerelle d'intégration backend avec Send_email | `public/api/integrations/send_email.php` | Non | 90 | Non - Fichier compact et bien délimité | Non |
| `status.php` | Passerelle d'intégration backend avec Status | `public/api/integrations/status.php` | Oui - Requête ou fallback sur dev_db.json | 51 | Non - Fichier compact et bien délimité | Non |
| `sync_contact.php` | Passerelle d'intégration backend avec Sync_contact | `public/api/integrations/sync_contact.php` | Non | 25 | Non - Fichier compact et bien délimité | Non |
| `sync_mailbox.php` | Passerelle d'intégration backend avec Sync_mailbox | `public/api/integrations/sync_mailbox.php` | Non | 68 | Non - Fichier compact et bien délimité | Non |
| `invoice_ai_check.php` | Point d'accès API backend PHP (invoice_ai_check) | `public/api/invoice_ai_check.php` | Non | 130 | Non - Fichier compact et bien délimité | Non |
| `invoice_export.php` | Point d'accès API backend PHP (invoice_export) | `public/api/invoice_export.php` | Non | 120 | Non - Fichier compact et bien délimité | Non |
| `invoice_extract_lines.php` | Point d'accès API backend PHP (invoice_extract_lines) | `public/api/invoice_extract_lines.php` | Non | 103 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `invoices.php` | Point d'accès API backend PHP (invoices) | `public/api/invoices.php` | Oui - Requête ou fallback sur dev_db.json | 256 | Non - Fichier compact et bien délimité | Non |
| `invoices_kpis.php` | Point d'accès API backend PHP (invoices_kpis) | `public/api/invoices_kpis.php` | Oui - Requête ou fallback sur dev_db.json | 81 | Non - Fichier compact et bien délimité | Non |
| `leads_export.php` | Point d'accès API backend PHP (leads_export) | `public/api/leads_export.php` | Non | 49 | Non - Fichier compact et bien délimité | Non |
| `leads_kpis.php` | Point d'accès API backend PHP (leads_kpis) | `public/api/leads_kpis.php` | Oui - Filtrage et purge des leads mockés pour l'environnement de dev | 28 | Non - Fichier compact et bien délimité | Non |
| `leads_search.php` | Point d'accès API backend PHP (leads_search) | `public/api/leads_search.php` | Non | 95 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `mailer.php` | Endpoint backend de messagerie et routage de courriels | `public/api/mail/mailer.php` | Non | 108 | Non - Fichier compact et bien délimité | Non |
| `meeting_agents.php` | Point d'accès API backend PHP (meeting_agents) | `public/api/meeting_agents.php` | Non | 265 | Non - Fichier compact et bien délimité | Non |
| `meeting_export.php` | Point d'accès API backend PHP (meeting_export) | `public/api/meeting_export.php` | Non | 47 | Non - Fichier compact et bien délimité | Non |
| `meeting_history.php` | Point d'accès API backend PHP (meeting_history) | `public/api/meeting_history.php` | Non | 54 | Non - Fichier compact et bien délimité | Non |
| `meeting_prep_generate.php` | Point d'accès API backend PHP (meeting_prep_generate) | `public/api/meeting_prep_generate.php` | Non | 69 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `meeting_upload.php` | Point d'accès API backend PHP (meeting_upload) | `public/api/meeting_upload.php` | Non | 130 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `multi_llm_orchestrator.php` | Point d'accès API backend PHP (multi_llm_orchestrator) | `public/api/multi_llm_orchestrator.php` | Oui - Réponses de délibération simulées/mockées en l'absence de clés LLM | 277 | Non - Fichier compact et bien délimité | Non |
| `ocr_document_vision.php` | Point d'accès API backend PHP (ocr_document_vision) | `public/api/ocr_document_vision.php` | Non | 220 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `ocr_vision_parse.php` | Point d'accès API backend PHP (ocr_vision_parse) | `public/api/ocr_vision_parse.php` | Non | 161 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `deposit.php` | Endpoint de communication avec le Portail Public de Facturation / Chorus Pro (deposit) | `public/api/ppf/deposit.php` | Oui - Requête ou fallback sur dev_db.json | 153 | Non - Fichier compact et bien délimité | Non |
| `verify_directory.php` | Endpoint de communication avec le Portail Public de Facturation / Chorus Pro (verify_directory) | `public/api/ppf/verify_directory.php` | Non | 80 | Non - Fichier compact et bien délimité | Non |
| `products.php` | Point d'accès API backend PHP (products) | `public/api/products.php` | Non | 64 | Non - Fichier compact et bien délimité | Non |
| `projects.php` | Point d'accès API backend PHP (projects) | `public/api/projects.php` | Oui - Requête ou fallback sur dev_db.json | 160 | Non - Fichier compact et bien délimité | Non |
| `prospecting_generate.php` | Point d'accès API backend PHP (prospecting_generate) | `public/api/prospecting_generate.php` | Non | 105 | Non - Fichier compact et bien délimité | Non |
| `prospecting_history.php` | Point d'accès API backend PHP (prospecting_history) | `public/api/prospecting_history.php` | Non | 30 | Non - Fichier compact et bien délimité | Non |
| `quote_ai_assist.php` | Point d'accès API backend PHP (quote_ai_assist) | `public/api/quote_ai_assist.php` | Non | 143 | Non - Fichier compact et bien délimité | Non |
| `quote_export.php` | Point d'accès API backend PHP (quote_export) | `public/api/quote_export.php` | Non | 133 | Non - Fichier compact et bien délimité | Non |
| `quotes.php` | Point d'accès API backend PHP (quotes) | `public/api/quotes.php` | Oui - Requête ou fallback sur dev_db.json | 166 | Non - Fichier compact et bien délimité | Non |
| `quotes_to_invoice.php` | Point d'accès API backend PHP (quotes_to_invoice) | `public/api/quotes_to_invoice.php` | Non | 34 | Non - Fichier compact et bien délimité | Non |
| `rag_document_indexer.php` | Point d'accès API backend PHP (rag_document_indexer) | `public/api/rag_document_indexer.php` | Non | 54 | Non - Fichier compact et bien délimité | Non |
| `rag_query.php` | Point d'accès API backend PHP (rag_query) | `public/api/rag_query.php` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `restore_admins.php` | Point d'accès API backend PHP (restore_admins) | `public/api/restore_admins.php` | Non | 53 | Non - Fichier compact et bien délimité | Non |
| `roles.php` | Point d'accès API backend PHP (roles) | `public/api/roles.php` | Oui - Requête ou fallback sur dev_db.json | 74 | Non - Fichier compact et bien délimité | Non |
| `saved_work.php` | Point d'accès API backend PHP (saved_work) | `public/api/saved_work.php` | Oui - Requête ou fallback sur dev_db.json | 116 | Non - Fichier compact et bien délimité | Non |
| `scrape_website.php` | Point d'accès API backend PHP (scrape_website) | `public/api/scrape_website.php` | Non | 41 | Non - Fichier compact et bien délimité | Non |
| `sepa_payment.php` | Point d'accès API backend PHP (sepa_payment) | `public/api/sepa_payment.php` | Oui - Requête ou fallback sur dev_db.json | 201 | Non - Fichier compact et bien délimité | Non |
| `server_secrets.php` | Point d'accès API backend PHP (server_secrets) | `public/api/server_secrets.php` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `summarizer_agents.php` | Point d'accès API backend PHP (summarizer_agents) | `public/api/summarizer_agents.php` | Non | 317 | Non - Fichier compact et bien délimité | Non |
| `summarizer_export.php` | Point d'accès API backend PHP (summarizer_export) | `public/api/summarizer_export.php` | Non | 38 | Non - Fichier compact et bien délimité | Non |
| `summarizer_upload.php` | Point d'accès API backend PHP (summarizer_upload) | `public/api/summarizer_upload.php` | Non | 63 | Non - Fichier compact et bien délimité | Non |
| `team.php` | Point d'accès API backend PHP (team) | `public/api/team.php` | Oui - Requête ou fallback sur dev_db.json | 109 | Non - Fichier compact et bien délimité | Non |
| `team_activity.php` | Point d'accès API backend PHP (team_activity) | `public/api/team_activity.php` | Oui - Requête ou fallback sur dev_db.json | 57 | Non - Fichier compact et bien délimité | Non |
| `tenders_search.php` | Point d'accès API backend PHP (tenders_search) | `public/api/tenders_search.php` | Non | 156 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `upcoming_meetings.php` | Point d'accès API backend PHP (upcoming_meetings) | `public/api/upcoming_meetings.php` | Non | 16 | Non - Fichier compact et bien délimité | Non |
| `diagnostics.php` | Endpoint backend de gestion utilisateur (diagnostics) | `public/api/user/diagnostics.php` | Non | 52 | Non - Fichier compact et bien délimité | Non |
| `profile.php` | Endpoint backend de gestion utilisateur (profile) | `public/api/user/profile.php` | Non | 97 | Non - Fichier compact et bien délimité | Non |
| `vector_store.php` | Point d'accès API backend PHP (vector_store) | `public/api/vector_store.php` | Oui - Mode simulation/mock pour les embeddings vectoriels (MOCK_EMBEDDINGS) | 541 | Oui - Endpoint volumineux (541 lignes) : séparer la validation, la logique métier et l'accès SQL | Non |
| `website_scraper.php` | Point d'accès API backend PHP (website_scraper) | `public/api/website_scraper.php` | Non | 73 | Non - Fichier compact et bien délimité | Non |

---

### 6. Documentation Métier, Spécifications IA & Briques (docs, application IA, etc.) (60 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `AUDIT_ARCHITECTURE_ACTUELLE.md` | Rapport d'audit de l'architecture logicielle, flux et composants | `AUDIT_ARCHITECTURE_ACTUELLE.md` | Oui - Requête ou fallback sur dev_db.json | 295 | Non - Fichier compact et bien délimité | Non |
| `AUDIT_INTERCONNEXION_APPLICATIONS.md` | Audit de l'interconnexion et des échanges de données entre modules | `AUDIT_INTERCONNEXION_APPLICATIONS.md` | Non | 347 | Non - Fichier compact et bien délimité | Non |
| `CARTOGRAPHIE_API_ET_IA.md` | Cartographie complète des points d'accès API et des intégrations d'IA | `CARTOGRAPHIE_API_ET_IA.md` | Non | 98 | Non - Fichier compact et bien délimité | Non |
| `DOC_BRIQUE_1_CLASSIFICATION_GUARDRAIL.md` | Spécification technique de la brique d'IA (1 CLASSIFICATION GUARDRAIL) | `DOC_BRIQUE_1_CLASSIFICATION_GUARDRAIL.md` | Non | 133 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `DOC_BRIQUE_2_MOTEUR_DELIBERATION_MULTI_AGENTS.md` | Spécification technique de la brique d'IA (2 MOTEUR DELIBERATION MULTI AGENTS) | `DOC_BRIQUE_2_MOTEUR_DELIBERATION_MULTI_AGENTS.md` | Non | 131 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `DOC_BRIQUE_3_CONTEXTE_ENTREPRISE_ET_PERSONAS.md` | Spécification technique de la brique d'IA (3 CONTEXTE ENTREPRISE ET PERSONAS) | `DOC_BRIQUE_3_CONTEXTE_ENTREPRISE_ET_PERSONAS.md` | Non | 101 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `DOC_BRIQUE_4_GUARDRAILS_FACTURATION_ET_DEVIS.md` | Spécification technique de la brique d'IA (4 GUARDRAILS FACTURATION ET DEVIS) | `DOC_BRIQUE_4_GUARDRAILS_FACTURATION_ET_DEVIS.md` | Non | 155 | Non - Fichier compact et bien délimité | Non |
| `DOC_BRIQUE_5_BASE_VECTORIELLE_ET_RAG_HERMETIQUE.md` | Spécification technique de la brique d'IA (5 BASE VECTORIELLE ET RAG HERMETIQUE) | `DOC_BRIQUE_5_BASE_VECTORIELLE_ET_RAG_HERMETIQUE.md` | Non | 153 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `DOC_BRIQUE_6_HUMAN_IN_THE_LOOP_ET_FEW_SHOT.md` | Spécification technique de la brique d'IA (6 HUMAN IN THE LOOP ET FEW SHOT) | `DOC_BRIQUE_6_HUMAN_IN_THE_LOOP_ET_FEW_SHOT.md` | Non | 127 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `DOC_BRIQUE_7_OBSERVABILITE_TOKEN_ECONOMICS_ET_AUDIT_TRAIL.md` | Spécification technique de la brique d'IA (7 OBSERVABILITE TOKEN ECONOMICS ET AUDIT TRAIL) | `DOC_BRIQUE_7_OBSERVABILITE_TOKEN_ECONOMICS_ET_AUDIT_TRAIL.md` | Non | 111 | Non - Fichier compact et bien délimité | Oui - Spécifications de prompts d'orchestration, guardrails et RAG |
| `KOLECTO_EXTRACTION_FONCTIONNALITES_DETAILLEES.md` | Étude comparative et extraction des fonctionnalités Kolecto | `KOLECTO_EXTRACTION_FONCTIONNALITES_DETAILLEES.md` | Non | 284 | Non - Fichier compact et bien délimité | Non |
| `LOCAL_FUNCTIONAL_TEST_REPORT.md` | Compte-rendu d'exécution des tests fonctionnels locaux | `LOCAL_FUNCTIONAL_TEST_REPORT.md` | Oui - Requête ou fallback sur dev_db.json | 186 | Non - Fichier compact et bien délimité | Non |
| `PROMPT_AUDIT_GENERAL_EXHAUSTIF.md` | Méthodologie et prompt d'audit exhaustif du code et de l'architecture | `PROMPT_AUDIT_GENERAL_EXHAUSTIF.md` | Non | 50 | Non - Fichier compact et bien délimité | Oui - Fichier dédié de bibliothèque et spécification de prompts IA |
| `Poste Mohsen.md` | Fiche de poste, objectifs et assignations techniques de Mohsen | `Poste Mohsen.md` | Non | 216 | Non - Fichier compact et bien délimité | Non |
| `presentation_ia_mdiv.md` | Document de spécification ou guide markdown | `Presentation_IA/presentation_ia_mdiv.md` | Non | 99 | Non - Fichier compact et bien délimité | Non |
| `RAPPORT_DETAILLE_RAG_ET_BASE_VECTORIELLE.md` | Rapport sur l'implémentation du RAG et de la base vectorielle | `RAPPORT_DETAILLE_RAG_ET_BASE_VECTORIELLE.md` | Non | 230 | Non - Fichier compact et bien délimité | Non |
| `RAPPORT_FONCTIONNEMENT_SERVICES_IA.md` | Rapport technique sur le fonctionnement des services et modèles d'IA | `RAPPORT_FONCTIONNEMENT_SERVICES_IA.md` | Oui - Requête ou fallback sur dev_db.json | 171 | Non - Fichier compact et bien délimité | Non |
| `REAL_AI_AUDIT.md` | Audit de vérification de l'activation des appels d'IA réels vs simulés | `REAL_AI_AUDIT.md` | Oui - Requête ou fallback sur dev_db.json | 210 | Non - Fichier compact et bien délimité | Non |
| `SCENARIO_DEMO_EVENEMENT_OFFICIEL.md` | Scénario détaillé pour les démonstrations officielles | `SCENARIO_DEMO_EVENEMENT_OFFICIEL.md` | Non | 249 | Non - Fichier compact et bien délimité | Non |
| `SPECIFICATIONS_ARCHITECTURE_CIBLE_ENTERPRISE.md` | Spécifications d'architecture cible pour déploiement entreprise | `SPECIFICATIONS_ARCHITECTURE_CIBLE_ENTERPRISE.md` | Non | 238 | Non - Fichier compact et bien délimité | Non |
| `README.md` | Documentation d'introduction et présentation du dépôt | `application IA/README.md` | Non | 98 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `assistant-devis-ia.md` | Cahier des charges et spécifications de l'application IA (assistant devis ia) | `application IA/assistant-devis-ia.md` | Non | 291 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `assistant-email-ia.md` | Cahier des charges et spécifications de l'application IA (assistant email ia) | `application IA/assistant-email-ia.md` | Non | 295 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `assistant-relances-ia.md` | Cahier des charges et spécifications de l'application IA (assistant relances ia) | `application IA/assistant-relances-ia.md` | Non | 491 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `benchmark-digital-ia.md` | Cahier des charges et spécifications de l'application IA (benchmark digital ia) | `application IA/benchmark-digital-ia.md` | Non | 444 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `calculateur-roi-ia.md` | Cahier des charges et spécifications de l'application IA (calculateur roi ia) | `application IA/calculateur-roi-ia.md` | Non | 451 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `diagnostic-ia-express.md` | Cahier des charges et spécifications de l'application IA (diagnostic ia express) | `application IA/diagnostic-ia-express.md` | Non | 362 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `fonctionnalites-applications-ia.md` | Cahier des charges et spécifications de l'application IA (fonctionnalites applications ia) | `application IA/fonctionnalites-applications-ia.md` | Oui - Requête ou fallback sur dev_db.json | 587 | Oui - Guide exhaustif (587 lignes) : peut être découpé en sous-fiches thématiques | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `generateur-comptes-rendus-ia.md` | Cahier des charges et spécifications de l'application IA (generateur comptes rendus ia) | `application IA/generateur-comptes-rendus-ia.md` | Non | 464 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `generateur-contenu-ia.md` | Cahier des charges et spécifications de l'application IA (generateur contenu ia) | `application IA/generateur-contenu-ia.md` | Non | 457 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `generateur-leads-b2b.md` | Cahier des charges et spécifications de l'application IA (generateur leads b2b) | `application IA/generateur-leads-b2b.md` | Non | 441 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `preparation-rdv-ia.md` | Cahier des charges et spécifications de l'application IA (preparation rdv ia) | `application IA/preparation-rdv-ia.md` | Non | 464 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `prospection-email-b2b.md` | Cahier des charges et spécifications de l'application IA (prospection email b2b) | `application IA/prospection-email-b2b.md` | Non | 437 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `resumeur-documents-ia.md` | Cahier des charges et spécifications de l'application IA (resumeur documents ia) | `application IA/resumeur-documents-ia.md` | Non | 479 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `verificateur-factures-ia.md` | Cahier des charges et spécifications de l'application IA (verificateur factures ia) | `application IA/verificateur-factures-ia.md` | Non | 289 | Non - Fichier compact et bien délimité | Oui - Cahier des charges avec personas, directives et prompts de l'agent IA |
| `audit_applications_ServicesIA.md` | Audit exhaustif des applications métier et des services d'IA | `audit_applications_ServicesIA.md` | Non | 413 | Non - Fichier compact et bien délimité | Non |
| `chartebne.md` | Charte graphique, directives de style et identité de marque | `chartebne.md` | Non | 328 | Non - Fichier compact et bien délimité | Non |
| `compte.md` | Documentation sur les profils, authentification et gestion des comptes | `compte.md` | Non | 48 | Non - Fichier compact et bien délimité | Non |
| `database.md` | Documentation détaillée des modèles de données et schémas SQL | `database.md` | Non | 22 | Non - Fichier compact et bien délimité | Non |
| `demo.md` | Guide de démonstration commerciale des modules | `demo.md` | Non | 145 | Non - Fichier compact et bien délimité | Non |
| `demo_prepa.md` | Checklist de préparation et validation avant démo | `demo_prepa.md` | Non | 30 | Non - Fichier compact et bien délimité | Non |
| `AUDIT_FINAL_ET_GUIDE_DEPLOIEMENT.md` | Document de spécification ou guide markdown | `docs/AUDIT_FINAL_ET_GUIDE_DEPLOIEMENT.md` | Non | 148 | Non - Fichier compact et bien délimité | Non |
| `01_diagnostic_ia_express.md` | Documentation technique de l'application (01_diagnostic_ia_express.md) | `docs/applications/01_diagnostic_ia_express.md` | Non | 178 | Non - Fichier compact et bien délimité | Non |
| `01_diagnostic_ia_express_implementation.md` | Documentation technique de l'application (01_diagnostic_ia_express_implementation.md) | `docs/applications/01_diagnostic_ia_express_implementation.md` | Non | 84 | Non - Fichier compact et bien délimité | Non |
| `POLE_1_DEVIS_FACTURES_RELANCES.md` | Benchmark stratégique et feuille de route IA (POLE_1_DEVIS_FACTURES_RELANCES.md) | `docs/benchmarks-et-plans-ia/POLE_1_DEVIS_FACTURES_RELANCES.md` | Non | 247 | Non - Fichier compact et bien délimité | Oui - Directives de prompt engineering pour les cas d'usage du pôle |
| `POLE_2_PROSPECTION_VENTE_COMMERCIAL.md` | Benchmark stratégique et feuille de route IA (POLE_2_PROSPECTION_VENTE_COMMERCIAL.md) | `docs/benchmarks-et-plans-ia/POLE_2_PROSPECTION_VENTE_COMMERCIAL.md` | Non | 189 | Non - Fichier compact et bien délimité | Oui - Directives de prompt engineering pour les cas d'usage du pôle |
| `POLE_3_PRODUCTIVITE_REUNIONS_MARKETING.md` | Benchmark stratégique et feuille de route IA (POLE_3_PRODUCTIVITE_REUNIONS_MARKETING.md) | `docs/benchmarks-et-plans-ia/POLE_3_PRODUCTIVITE_REUNIONS_MARKETING.md` | Non | 154 | Non - Fichier compact et bien délimité | Oui - Directives de prompt engineering pour les cas d'usage du pôle |
| `POLE_4_CONSEIL_AUDIT_ROI.md` | Benchmark stratégique et feuille de route IA (POLE_4_CONSEIL_AUDIT_ROI.md) | `docs/benchmarks-et-plans-ia/POLE_4_CONSEIL_AUDIT_ROI.md` | Non | 159 | Non - Fichier compact et bien délimité | Oui - Directives de prompt engineering pour les cas d'usage du pôle |
| `README.md` | Documentation d'introduction et présentation du dépôt | `docs/benchmarks-et-plans-ia/README.md` | Non | 43 | Non - Fichier compact et bien délimité | Oui - Directives de prompt engineering pour les cas d'usage du pôle |
| `email.md` | Spécifications du module de courriels et gestion des templates | `email.md` | Non | 191 | Non - Fichier compact et bien délimité | Non |
| `facture.md` | Spécifications de facturation électronique conforme et calculs fiscaux | `facture.md` | Oui - Requête ou fallback sur dev_db.json | 214 | Non - Fichier compact et bien délimité | Non |
| `forfait.md` | Grille tarifaire, forfaits d'abonnement et options | `forfait.md` | Non | 114 | Non - Fichier compact et bien délimité | Non |
| `jour_16_10_2026.md` | Journal de bord et avancement des développements au 16/10/2026 | `jour_16_10_2026.md` | Oui - Variables mockées déclarées (mock_token_) | 123 | Non - Fichier compact et bien délimité | Non |
| `modele par app.md` | Matrice de sélection des modèles d'IA par cas d'usage applicatif | `modele par app.md` | Non | 484 | Non - Fichier compact et bien délimité | Non |
| `parcours_utilisateur.md` | Cartographie des parcours et scénarios d'usage utilisateurs | `parcours_utilisateur.md` | Oui - Requête ou fallback sur dev_db.json | 289 | Non - Fichier compact et bien délimité | Non |
| `prompt facturation.md` | Instructions et prompts de contrôle et d'analyse de factures | `prompt facturation.md` | Oui - Variables mockées déclarées (mockUser) | 198 | Non - Fichier compact et bien délimité | Oui - Fichier dédié de bibliothèque et spécification de prompts IA |
| `prompt_app_ia.md` | Bibliothèque de prompts pour les fonctionnalités applicatives d'IA | `prompt_app_ia.md` | Non | 29 | Non - Fichier compact et bien délimité | Oui - Fichier dédié de bibliothèque et spécification de prompts IA |
| `prospect.md` | Spécifications fonctionnelles du CRM et de la prospection commerciale | `prospect.md` | Non | 158 | Non - Fichier compact et bien délimité | Non |
| `scenario_demo.md` | Déroulé chronologique du scénario de démonstration | `scenario_demo.md` | Non | 103 | Non - Fichier compact et bien délimité | Non |
| `scripts_videos_applications.md` | Scripts et storyboards pour vidéos de démonstration | `scripts_videos_applications.md` | Non | 254 | Non - Fichier compact et bien délimité | Non |

---

### 7. Scripts de Tests, Automatisation & Outils (tests, scratch, .github) (21 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `deploy.yml` | Workflow d'automatisation CI/CD GitHub Actions (deploy.yml) | `.github/workflows/deploy.yml` | Non | 62 | Non - Fichier compact et bien délimité | Non |
| `analysis_results.json` | Script utilitaire temporaire de diagnostic ou test (analysis_results.json) | `scratch/analysis_results.json` | Oui - Import/usage de mockData, Import/usage de mockDemoData | 8426 | Oui - Très volumineux (8426 lignes) : scinder en sous-composants, hooks et services | Non |
| `analyze_all.py` | Script utilitaire temporaire de diagnostic ou test (analyze_all.py) | `scratch/analyze_all.py` | Oui - Import/usage de mockData | 388 | Non - Fichier compact et bien délimité | Oui - Prompt système complet avec définition de persona et consignes LLM |
| `audit_scanner.py` | Script utilitaire temporaire de diagnostic ou test (audit_scanner.py) | `scratch/audit_scanner.py` | Non | 28 | Non - Fichier compact et bien délimité | Non |
| `detailed_flags.json` | Script utilitaire temporaire de diagnostic ou test (detailed_flags.json) | `scratch/detailed_flags.json` | Oui - Import/usage de mockData, Import/usage de mockDemoData | 993 | Non - Fichier compact et bien délimité | Oui - Configuration de rôle système et consignes transmises à l'API IA |
| `find_prompts_and_mocks.py` | Script utilitaire temporaire de diagnostic ou test (find_prompts_and_mocks.py) | `scratch/find_prompts_and_mocks.py` | Oui - Import/usage de mockData, Import/usage de mockDemoData | 83 | Non - Fichier compact et bien délimité | Oui - Prompt système complet avec définition de persona et consignes LLM |
| `generate_audit_data.py` | Script utilitaire temporaire de diagnostic ou test (generate_audit_data.py) | `scratch/generate_audit_data.py` | Oui - Import/usage de mockData, Import/usage de mockDemoData | 493 | Non - Fichier compact et bien délimité | Oui - Prompt système complet avec définition de persona et consignes LLM |
| `patch_dev_api.cjs` | Script utilitaire temporaire de diagnostic ou test (patch_dev_api.cjs) | `scratch/patch_dev_api.cjs` | Non | 26 | Non - Fichier compact et bien délimité | Non |
| `smoke_mail.mjs` | Script utilitaire temporaire de diagnostic ou test (smoke_mail.mjs) | `scratch/smoke_mail.mjs` | Non | 25 | Non - Fichier compact et bien délimité | Non |
| `cross_app_interconnection_test.mjs` | Script de test automatisé d'intégration / conformité (cross_app_interconnection_test.mjs) | `tests/cross_app_interconnection_test.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 214 | Non - Fichier compact et bien délimité | Non |
| `grand_test_grandeur_nature.mjs` | Script de test automatisé d'intégration / conformité (grand_test_grandeur_nature.mjs) | `tests/grand_test_grandeur_nature.mjs` | Non | 323 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `test_brick1_classifier.mjs` | Script de test automatisé d'intégration / conformité (test_brick1_classifier.mjs) | `tests/test_brick1_classifier.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 156 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `test_brick2_multiagent.mjs` | Script de test automatisé d'intégration / conformité (test_brick2_multiagent.mjs) | `tests/test_brick2_multiagent.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 168 | Non - Fichier compact et bien délimité | Oui - Payloads de test avec prompts d'évaluation des briques IA |
| `test_brick3_context_engine.mjs` | Script de test automatisé d'intégration / conformité (test_brick3_context_engine.mjs) | `tests/test_brick3_context_engine.mjs` | Non | 152 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `test_brick4_invoice_quote.mjs` | Script de test automatisé d'intégration / conformité (test_brick4_invoice_quote.mjs) | `tests/test_brick4_invoice_quote.mjs` | Non | 183 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `test_brick5_vector_rag.mjs` | Script de test automatisé d'intégration / conformité (test_brick5_vector_rag.mjs) | `tests/test_brick5_vector_rag.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 293 | Non - Fichier compact et bien délimité | Oui - Payloads de test avec prompts d'évaluation des briques IA |
| `test_brick6_human_loop.mjs` | Script de test automatisé d'intégration / conformité (test_brick6_human_loop.mjs) | `tests/test_brick6_human_loop.mjs` | Non | 249 | Non - Fichier compact et bien délimité | Oui - Payloads de test avec prompts d'évaluation des briques IA |
| `test_brick7_telemetry_audit.mjs` | Script de test automatisé d'intégration / conformité (test_brick7_telemetry_audit.mjs) | `tests/test_brick7_telemetry_audit.mjs` | Non | 212 | Non - Fichier compact et bien délimité | Oui - Payloads de test avec prompts d'évaluation des briques IA |
| `test_investigate_ocr_precision.mjs` | Script de test automatisé d'intégration / conformité (test_investigate_ocr_precision.mjs) | `tests/test_investigate_ocr_precision.mjs` | Non | 103 | Non - Fichier compact et bien délimité | Oui - Payloads de test avec prompts d'évaluation des briques IA |
| `test_live_ticket_ocr.mjs` | Script de test automatisé d'intégration / conformité (test_live_ticket_ocr.mjs) | `tests/test_live_ticket_ocr.mjs` | Non | 95 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |
| `test_vision_ocr.mjs` | Script de test automatisé d'intégration / conformité (test_vision_ocr.mjs) | `tests/test_vision_ocr.mjs` | Oui - Fixtures de test et jeux de données synthétiques | 122 | Non - Fichier compact et bien délimité | Oui - Directives et persona d'agent IA intégrés dans le code |

---

### 8. Ressources Graphiques & Médias (public/assets, src/assets, Banee_images_div) (149 fichiers)

| Nom du fichier | À quoi ça sert | Chemin d'accès | Contient des données mockées | Nombre de lignes | Possibilité de le découper en plusieurs fichiers pour optimiser ? | Contient prompt |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `Cadrage.jpeg` | Ressource graphique / média statique | `Banee_images_div/Cadrage.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Cahier des charges Collaboration avec Micke.docx` | Document Word de spécification ou compte-rendu | `Banee_images_div/Cahier des charges Collaboration avec Micke.docx` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `IT4ALL.jpeg` | Ressource graphique / média statique | `Banee_images_div/IT4ALL.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Logo.png` | Logo / badge de marque ou partenaire | `Banee_images_div/Logo.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `MDIV.PNG` | Ressource graphique / média statique | `Banee_images_div/MDIV.PNG` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Offre premium.jpeg` | Ressource graphique / média statique | `Banee_images_div/Offre premium.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Eric.png` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/Eric.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `cerise.jpg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/cerise.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `kassa.jpg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/kassa.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `mathilda.jpg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/mathilda.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `micke.jpeg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/micke.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `pierre.jpg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/pierre.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `remy.jpg` | Image de profil utilisateur / avatar | `Banee_images_div/Profils/remy.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Strat communicatio.jpeg` | Ressource graphique / média statique | `Banee_images_div/Strat communicatio.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `architecture système.jpeg` | Ressource graphique / média statique | `Banee_images_div/architecture système.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `immobilier.jpg` | Photographie / visuel d'événement ou séminaire | `Banee_images_div/evenements/immobilier.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `india.jpeg` | Photographie / visuel d'événement ou séminaire | `Banee_images_div/evenements/india.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `mdiv_app_mockup_post.png` | Ressource graphique / média statique | `Banee_images_div/mdiv_app_mockup_post.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre mini.jpeg` | Ressource graphique / média statique | `Banee_images_div/offre mini.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre mini_disposition.jpeg` | Ressource graphique / média statique | `Banee_images_div/offre mini_disposition.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_1.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_1.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_2.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_2.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_3.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_3.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_4.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_4.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_41.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_41.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `offre_42.png` | Illustration d'offre commerciale | `Banee_images_div/offres/offre_42.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `page offre pays.jpeg` | Ressource graphique / média statique | `Banee_images_div/page offre pays.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `photos_fond.png` | Ressource graphique / média statique | `Banee_images_div/photos_fond.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `fondateur.jpg` | Ressource graphique / média statique | `Banee_images_div/sejours/fondateur.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `strategie.jpeg` | Ressource graphique / média statique | `Banee_images_div/strategie.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `recherche.png` | Ressource graphique / média statique | `Presentation_IA/recherche.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_1_constat_1782231065014.png` | Ressource graphique / média statique | `Presentation_IA/slide_1_constat_1782231065014.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_2_ecosysteme_1782231072480.png` | Ressource graphique / média statique | `Presentation_IA/slide_2_ecosysteme_1782231072480.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_3_audit_1782231081419.png` | Ressource graphique / média statique | `Presentation_IA/slide_3_audit_1782231081419.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_4_solution_1782231101343.png` | Ressource graphique / média statique | `Presentation_IA/slide_4_solution_1782231101343.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_5_accompagnement_1782231109780.png` | Ressource graphique / média statique | `Presentation_IA/slide_5_accompagnement_1782231109780.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `slide_6_cta_1782231118961.png` | Ressource graphique / média statique | `Presentation_IA/slide_6_cta_1782231118961.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `bun.lockb` | Fichier de verrouillage binaire des dépendances Bun | `bun.lockb` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `IT4ALL.jpeg` | Ressource graphique / média statique | `public/IT4ALL.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `animation.svg` | Ressource graphique / média statique | `public/animation.svg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `bne_ambassador_badge.png` | Logo / badge de marque ou partenaire | `public/assets/Badge/bne_ambassador_badge.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `bne_partner_badge.png` | Logo / badge de marque ou partenaire | `public/assets/Badge/bne_partner_badge.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Stephane Grodin logo.jpeg` | Logo / badge de marque ou partenaire | `public/assets/Logo Ambassador et partenaires/Stephane Grodin logo.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `belkinois.jpg` | Logo / badge de marque ou partenaire | `public/assets/Logo Ambassador et partenaires/belkinois.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `sejour_palette.jpeg` | Ressource graphique / média statique | `public/assets/Sion/sejour_palette.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `A.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/A.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `AQ.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/AQ.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `B.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/B.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `BBF.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/BBF.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `BG.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/BG.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `BNB.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/BNB.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `C.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/C.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `D.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/D.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `DFDF.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/DFDF.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `DR.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/DR.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `E.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/E.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `ERD.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/ERD.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `F.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/F.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `G.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/G.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `GRGR.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/GRGR.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `H.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/H.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `HG.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/HG.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `I.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/I.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `J.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/J.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `JN.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/JN.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `K.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/K.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `KKG.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/KKG.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `L.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/L.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `LK.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/LK.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `LKL.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/LKL.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `ML.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/ML.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `RG.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/RG.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `TTG.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/TTG.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `TTT.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/TTT.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `UU.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/UU.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `VF.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/VF.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `VVDF.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/VVDF.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `YTYT.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/YTYT.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `ZEZ.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/events/namaste/ZEZ.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Awa.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/Awa.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Cybler.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/Cybler.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Marc.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/Marc.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Marie-Jeanne.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/Marie-Jeanne.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Norman.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/Norman.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `awa2.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/awa2.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `defile.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/defile.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `defile2.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/defile2.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `defiler2.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/defiler2.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `eric.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/eric.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `micke.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/micke.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `norma-repas.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/norma-repas.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `sandrine.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/sandrine.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `sara.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/sara.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `table.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/table.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `table2.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/table2.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `table3.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-aout/table3.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `namaste2.jpeg` | Photographie / visuel d'événement ou séminaire | `public/assets/namaste-septembre/namaste2.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `eric_medecin.png` | Ressource graphique / média statique | `public/eric_medecin.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `favicon.ico` | Ressource graphique / média statique | `public/favicon.ico` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `favicon.png` | Ressource graphique / média statique | `public/favicon.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `service-ia-visual.jpg` | Ressource graphique / média statique | `public/images/service-ia-visual.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `it4work.png` | Ressource graphique / média statique | `public/it4work.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `placeholder.svg` | Ressource graphique / média statique | `public/placeholder.svg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `event-networking.jpg` | Ressource graphique / média statique | `src/assets/event-networking.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `event-summit.jpg` | Ressource graphique / média statique | `src/assets/event-summit.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `exp-dining.jpg` | Ressource graphique / média statique | `src/assets/exp-dining.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `exp-hotel.jpg` | Ressource graphique / média statique | `src/assets/exp-hotel.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `exp-yacht.jpg` | Ressource graphique / média statique | `src/assets/exp-yacht.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `logo linkedhin.PNG` | Logo / badge de marque ou partenaire | `src/assets/logo linkedhin.PNG` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `parcours_ia.png` | Illustration d'offre commerciale | `src/assets/offres/parcours_ia.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `CEO.jpg` | Ressource graphique / média statique | `src/assets/original/CEO.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Champagne.jpg` | Ressource graphique / média statique | `src/assets/original/Champagne.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Pitch.jpg` | Ressource graphique / média statique | `src/assets/original/Pitch.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Resto.jpg` | Ressource graphique / média statique | `src/assets/original/Resto.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `avenir.jpeg` | Ressource graphique / média statique | `src/assets/original/avenir.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `business_meeting_hero.png` | Ressource graphique / média statique | `src/assets/original/business_meeting_hero.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `dest-belgique.png` | Ressource graphique / média statique | `src/assets/original/dest-belgique.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `dest-champagne.png` | Ressource graphique / média statique | `src/assets/original/dest-champagne.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `dest-luxembourg.png` | Ressource graphique / média statique | `src/assets/original/dest-luxembourg.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `dest-suisse.png` | Ressource graphique / média statique | `src/assets/original/dest-suisse.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `diner.jpg` | Ressource graphique / média statique | `src/assets/original/diner.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `fleur.jpg` | Ressource graphique / média statique | `src/assets/original/fleur.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `fondateur.jpg` | Ressource graphique / média statique | `src/assets/original/fondateur.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `hero-club.jpg` | Ressource graphique / média statique | `src/assets/original/hero-club.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `immobilier.jpg` | Ressource graphique / média statique | `src/assets/original/immobilier.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `india.jpeg` | Ressource graphique / média statique | `src/assets/original/india.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `serveur.jpg` | Ressource graphique / média statique | `src/assets/original/serveur.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `tallk.jpg` | Ressource graphique / média statique | `src/assets/original/tallk.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map.png` | Ressource graphique / média statique | `src/assets/partners_hands_map.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_mixed.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_mixed.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_solid.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_solid.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_trad.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_trad.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_white_woman.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_white_woman.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_woman.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_woman.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hands_map_woman_ring.png` | Ressource graphique / média statique | `src/assets/partners_hands_map_woman_ring.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `partners_hero.png` | Ressource graphique / média statique | `src/assets/partners_hero.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `portrait-1.jpg` | Ressource graphique / média statique | `src/assets/portrait-1.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `portrait-2.jpg` | Ressource graphique / média statique | `src/assets/portrait-2.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Stephane.jpeg` | Image de profil utilisateur / avatar | `src/assets/profils/Stephane.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `cerise.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/cerise.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `eric.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/eric.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `eric.png` | Image de profil utilisateur / avatar | `src/assets/profils/eric.png` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `kassa.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/kassa.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `mathilda.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/mathilda.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `micke.jpeg` | Image de profil utilisateur / avatar | `src/assets/profils/micke.jpeg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `pierre.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/pierre.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `remy.jpg` | Image de profil utilisateur / avatar | `src/assets/profils/remy.jpg` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `Hotel.mp4` | Fichier vidéo de présentation ou démonstration | `src/assets/videos/Hotel.mp4` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |
| `table_essoyes.mp4` | Fichier vidéo de présentation ou démonstration | `src/assets/videos/table_essoyes.mp4` | Non (Fichier média / binaire) | N/A (Binaire) | Non (Fichier binaire / média) | Non |

---

## 🚀 4. Plan d'Action Recommandé pour l'Optimisation

1. **Découpage de `vite-dev-api.ts`** : Extraire chaque domaine fonctionnel dans un sous-dossier `server/dev-api/` avec un index d'agrégation.
2. **Stratégie d'Éradication Progressive des Mocks** :
   - Remplacer les imports de `mockData.ts` dans les pages vitrines (`Home.tsx`, `Offers.tsx`, `Avis.tsx`) par des requêtes React Query branchées sur l'API PHP (`/api/events.php`, `/api/offers.php`, `/api/reviews.php`).
   - Conserver `mockDemoData.ts` uniquement pour la démo interactive hors-ligne (mode bac à sable assumé).
3. **Centralisation des Prompts IA** :
   - Déplacer tous les prompts éparpillés (dans les fichiers PHP et TypeScript) vers un registre unifié (ex. `src/config/prompts/` et `public/api/prompts/`) avec versionnage des prompts pour faciliter l'A/B testing et l'auditabilité.
4. **Modularisation des Pages d'Administration** :
   - Décomposer les écrans de plus de 400 lignes en composants présentionnels purs et hooks de données.
