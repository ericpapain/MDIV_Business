# AUDIT TECHNIQUE COMPLET & CARTOGRAPHIE DE L'ARCHITECTURE ACTUELLE
## Plateforme MDIV Business (SaaS IA B2B)
**Date de l'audit** : Octobre 2026  
**Auteur** : Antigravity Advanced Agentic Architect  
**Environnement** : Production (OVHcloud Apache/PHP 8.2 + MySQL) & Référentiel Git (`refonte_IA` / `main`)

---

## 1. VUE D'ENSEMBLE & PHILOSOPHIE DU SYSTÈME ACTUEL

L'application **MDIV Business** est conçue comme un portail SaaS B2B hybride associant :
1. Une vitrine institutionnelle de prestige (offres de séjours, événements, charte, partenaires).
2. Une suite d'outils d'accélération et de productivité dopés à l'Intelligence Artificielle (14 modules métiers dédiés aux dirigeants de TPE/PME).
3. Un back-office d'administration pour la gestion des contenus, des KPIs, des partenaires et du moteur d'inférence IA.
4. Un système d'authentification et de multi-tenancy basé sur l'identification certifiée des entreprises via le numéro SIREN (API Recherche Entreprises Gouv / INSEE).

---

## 2. SCHÉMA GLOBAL DE L'ARCHITECTURE ACTUELLE (ASCII ART)

```
+--------------------------------------------------------------------------------------------------+
|                                    NAVIGATEUR CLIENT (FRONTEND SPA)                               |
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   | React 18 + Vite (TypeScript)                                                             |   |
|   | TailwindCSS + Radix UI / Shadcn UI + Lucide Icons + Recharts + Framer Motion             |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                |                                                 |
|          +-------------------------------------+------------------------------------+            |
|          |                                     |                                    |            |
|          v                                     v                                    v            |
|   [Pages Publiques]                 [Pages Services IA]                    [Pages Back-Office]   |
|   Home, Offres, Contact,            Diagnostic, Facturation, Devis,        AdminDashboard,       |
|   Partenaires, Avis, Blog           Comptes-Rendus, Prospection, Leads     AdminAISettings, etc. |
|          |                                     |                                    |            |
|          +-------------------------------------+------------------------------------+            |
|                                                |                                                 |
|                                                v                                                 |
|                          [Couche Services TypeScript (src/lib/)]                                 |
|               apiConfig.ts, diagnosticService.ts, invoiceService.ts, etc.                        |
+--------------------------------------------------------------------------------------------------+
                                                 |
                               HTTP / HTTPS POST/GET / SSE Streams
                                                 v
+--------------------------------------------------------------------------------------------------+
|                                  SERVEUR WEB OVHCLOUD (APACHE / PHP 8.2)                         |
|                                                                                                  |
|   [.htaccess] : RewriteRule SPA (index.html) + Sécurisation Anti-Scraping / Anti-Bots            |
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   |                            BACKEND MODULAIRE PHP (public/api/)                           |   |
|   |                                                                                          |   |
|   |   +----------------------------------------------------------------------------------+   |   |
|   |   | config.php : Headers CORS, Variables d'environnement (.env), Connexion PDO,      |   |   |
|   |   |              Auto-migration MySQL (companies, users, cache), Clés IA Secrètes    |   |   |
|   |   +----------------------------------------------------------------------------------+   |   |
|   |                                            |                                             |   |
|   |             +------------------------------+-------------------------------+             |   |
|   |             |                              |                               |             |   |
|   |             v                              v                               v             |   |
|   |   [Scripts d'Auth & Profil]    [Services Métiers & Exports]      [Passerelle IA LLM]     |   |   |
|   |   auth/login.php               invoices.php, quotes.php          groq_client.php         |   |   |
|   |   auth/register.php            clients.php, expenses.php         ai_test_provider.php    |   |   |
|   |   company_search.php (INSEE)   fec_export.php, pdf_generator     ai_settings.php         |   |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
                 |                                                              |
                 v                                                              v
+------------------------------------+                    +------------------------------------+
|     BASE DE DONNÉES MYSQL (OVH)     |                    |        FOURNISSEURS IA EXTERNES    |
|                                    |                    |                                    |
|  - companies (entreprises/SIREN)   |                    |  1. OpenAI API (gpt-4o-mini /      |
|  - users (comptes dirigeants)      |                    |     gpt-4o) [Moteur Prioritaire]   |
|  - company_api_cache (cache INSEE) |                    |                                    |
|  - diagnostics (historique IA)     |                    |  2. Groq Cloud (Qwen / Llama)      |
|  - clients, products, quotes       |                    |     [Secours / Inférence rapide]   |
|  - invoices, followups, expenses   |                    |                                    |
|  - saved_work (brouillons)         |                    |  3. Mistral AI (mistral-small)     |
+------------------------------------+                    |     [Secours Européen]             |
                                                          +------------------------------------+
```

---

## 3. CARTOGRAPHIE DES COMPOSANTS FRONTEND (`src/pages/*`)

| N° | Fichier Page | Route URL | Rôle & Fonctionnalités | Services Associés |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `Home.tsx` | `/` | Page d'accueil, Hero section, Compteurs animés, Témoignages, Statistiques | `api-public.php`, `api-visites.php` |
| **2** | `Login.tsx` | `/login` | Connexion dirigeants par Email ou SIREN avec mot de passe | `auth/login.php`, `AuthContext.tsx` |
| **3** | `Register.tsx` | `/register` | Inscription étape par étape avec enrichissement INSEE automatique par SIREN | `company_search.php`, `auth/register.php` |
| **4** | `Dashboard.tsx` | `/dashboard` | Espace client dirigeant, KPIs d'utilisation, historique des diagnostics | `user/diagnostics.php`, `user/profile.php` |
| **5** | `ServicesIA.tsx` | `/services-ia` | Hub central des 14 applications d'Intelligence Artificielle MDIV | `useGuestQuota.ts`, `SavedWorkDrawer.tsx` |
| **6** | `ServicesIADiagnostic.tsx` | `/services-ia/diagnostic` | Audit IA conversationnel d'entreprise en temps réel avec scoring | `diagnosticService.ts`, `deepDiveService.ts` |
| **7** | `ServicesIAInvoice.tsx` | `/services-ia/facturation` | Création de factures, vérification de conformité IA, export Factur-X & FEC | `invoiceService.ts`, `pdfExportService.ts` |
| **8** | `ServicesIAQuote.tsx` | `/services-ia/devis` | Générateur de devis avec assistance IA de chiffrage, export PDF | `quoteService.ts`, `pdfExportService.ts` |
| **9** | `ServicesIAMeetings.tsx` | `/services-ia/comptes-rendus` | Transformation de notes vocales/audio/texte en comptes-rendus décisionnels | `meetingReportService.ts` |
| **10** | `ServicesIASummarizer.tsx` | `/services-ia/synthese` | Synthèse multi-agents de documents volumineux (PDF, Word, Scan) | `summarizerService.ts`, `documentParserService.ts` |
| **11** | `ServicesIAProspecting.tsx` | `/services-ia/prospection` | Génération d'emails d'outreach commercial B2B hyper-ciblés | `prospectingEmailService.ts` |
| **12** | `ServicesIAContent.tsx` | `/services-ia/contenu` | Générateur de posts multi-canaux (LinkedIn, Blog, Newsletter, X) | `contentGeneratorService.ts` |
| **13** | `ServicesIALeads.tsx` | `/services-ia/leads` | Recherche et qualification IA de prospects sectoriels B2B | `leadsGeneratorService.ts` |
| **14** | `ServicesIAEmail.tsx` | `/services-ia/emails` | Assistant de rédaction et d'analyse d'emails professionnels | `emailAssistantService.ts` |
| **15** | `ServicesIAFollowup.tsx` | `/services-ia/relances` | Système de relances intelligentes de factures et devis en souffrance | `followupService.ts` |
| **16** | `ServicesIAMeetingPrep.tsx` | `/services-ia/preparation-reunion` | Préparateur d'ordre du jour, fiches d'objectifs et questions pièges | `meetingPrepService.ts` |
| **17** | `ServicesIACalcROI.tsx` | `/services-ia/calculateur-roi` | Simulateur de gain de temps et retour sur investissement des solutions IA | Calculateur interne |
| **18** | `ServicesIABenchmark.tsx` | `/services-ia/benchmark` | Comparateur sectoriel de maturité IA et positionnement concurrentiel | `benchmarkService.ts` |
| **19** | `ServicesIAPricing.tsx` | `/services-ia/tarifs` | Grille tarifaire des offres IA et options Fintech Kolecto | `fintechKolectoService.ts` |
| **20** | `ServicesIACategory.tsx` | `/services-ia/categorie/:id` | Vue filtrée des modules par pôle (Finance, Ventes, Productivité, etc.) | Navigation interne |
| **21** | `AIBuilder.tsx` | `/experience` | Configurateur de séjours et projets personnalisés assisté par IA | `api-public.php` |
| **22** | `Offers.tsx` | `/offres` | Présentation des offres d'accompagnement BNE et séjours d'affaires | Composant vitrine |
| **23** | `Events.tsx` | `/evenements` | Calendrier des événements d'affaires et sessions de networking | `api-public.php` |
| **24** | `EventReplay.tsx` | `/revivre/:id` | Galerie multimédia et replays vidéo des événements passés | `api-public.php`, `api-avis.php` |
| **25** | `Partners.tsx` | `/partenaires` | Annuaire des partenaires officiels et formulaire de candidature | `api-public.php` |
| **26** | `Contact.tsx` | `/contact` | Formulaire de contact avec envoi sécurisé Web3Forms | `Web3Forms API` |
| **27** | `Avis.tsx` | `/avis` | Mur des avis clients vérifiés et dépôt d'avis avec notation | `api-avis.php` |
| **28** | `Blog.tsx` | `/blog` | Articles de veille, actualités économiques et dossiers IA | Données locales / CMS |
| **29** | `Charte.tsx` | `/charte` | Charte éthique et engagements RSE du réseau MDIV | Page de conformité |
| **30** | `AdminDashboard.tsx` | `/admin` | Vue globale administrateur, statistiques d'inscriptions et visites | `api-admin.php` |
| **31** | `AdminAISettings.tsx` | `/admin/ai-settings` | Panel de contrôle du moteur IA, sélection OpenAI/Groq et banc de test | `ai_settings.php`, `ai_test_provider.php` |
| **32** | `AdminReviews.tsx` | `/admin/reviews` | Modération des avis clients déposés sur la plateforme | `api-admin.php` |
| **33** | `AdminPartners.tsx` | `/admin/partners` | Gestion et validation des fiches partenaires et candidatures | `api-admin.php` |

---

## 4. CARTOGRAPHIE DES SERVICES CLIENTS FRONTEND (`src/lib/*`)

```
src/lib/
├── apiConfig.ts               # Construction centralisée des URLs API relatives/absolues (/api/...)
├── diagnosticService.ts       # Orchestration des étapes de questions-réponses du diagnostic
├── invoiceService.ts          # CRUD factures, calcul des totaux, vérification légale IA
├── quoteService.ts            # CRUD devis, chiffrage intelligent et conversion en facture
├── meetingReportService.ts    # Envoi de dictées/transcriptions et streaming multi-agents
├── summarizerService.ts       # Upload de fichiers volumineux et synthèse de documents
├── prospectingEmailService.ts # Génération d'outreach commercial et scoring d'impact
├── contentGeneratorService.ts # Création multi-canal (LinkedIn, X, Blog, Newsletter)
├── leadsGeneratorService.ts   # Recherche de prospects et extraction de critères cibles
├── emailAssistantService.ts   # Analyse de sentiment, ton et reformulation d'emails
├── followupService.ts         # Relances automatiques avec personnalisation selon ancienneté
├── meetingPrepService.ts      # Génération de briefs de réunion et ordres du jour
├── documentParserService.ts   # Extraction texte côté client (PDF, Word, TXT)
├── ocrService.ts / ocrVision  # Traitement d'images et OCR via vision par ordinateur
├── pdfExportService.ts        # Moteur d'export PDF haute définition avec jsPDF / html2canvas
├── companySearchService.ts    # Interrogation du service SIREN et parsing des dirigeants
├── guestQuotaService.ts       # Gestion des 3 essais gratuits en mode invité (localStorage)
├── savedWorkService.ts        # Sauvegarde et synchronisation des brouillons de travail
├── benchmarkService.ts        # Calcul des scores comparatifs sectoriels
├── fintechKolectoService.ts   # Règles de facturation électronique et tarification Fintech
└── utils.ts                   # Utilitaires Tailwind (cn, class merge)
```

---

## 5. CARTOGRAPHIE DES ENDPOINTS BACKEND PHP (`public/api/*`)

### A. Cœur d'Inférence IA & Configuration
| Fichier Endpoint | Méthode | Rôle & Traitement | Modèle / Dépendances |
| :--- | :--- | :--- | :--- |
| `config.php` | Importé | Initialisation globale, sécurité CORS, chargement des secrets, connexion PDO MySQL, auto-migrations. | PDO MySQL, Base64 Fallback Keys |
| `groq_client.php` | Importé | Moteur d'exécution universel : routage vers OpenAI (`gpt-4o-mini`), Groq (`qwen3.8-27b`) ou Mistral avec fallback automatique. | cURL avec headers navigateurs |
| `ai_settings.php` | `GET` / `POST` | Lecture et écriture de la configuration IA (`ai_settings.json` et `dev_db.json`). | Système de fichiers JSON |
| `ai_test_provider.php`| `POST` | Banc de test de latence et connectivité en direct pour l'interface administrateur. | cURL, calcul de latence microtime |

### B. Modules Métiers d'Intelligence Artificielle
| Fichier Endpoint | Méthode | Rôle & Traitement | Sortie / Format |
| :--- | :--- | :--- | :--- |
| `diagnostic_step.php` | `POST` | Évalue la réponse précédente, adapte le persona expert et formule la question suivante. | JSON `{expert_domain, question, options}` |
| `diagnostic_agents.php` | `GET` (SSE) | Simulation d'un collège d'experts en streaming Server-Sent Events pour le bilan final. | Flux SSE `event: agent_message` |
| `diagnostic_upload.php` | `POST` | Parse les documents d'entreprise fournis lors du diagnostic. | JSON extrait textuel |
| `meeting_upload.php` | `POST` | Transforme notes, transcriptions orales et dictées vocales en compte-rendu décisionnel complet. | JSON `{subject, decisions, actions, risks}` |
| `meeting_agents.php` | `GET` (SSE) | Discussion multi-agents en direct (Secrétaire, Auditeur, Dir. Opérations) sur la réunion. | Flux SSE `complete` |
| `summarizer_agents.php`| `POST` (SSE)| Analyse et synthétise section par section les documents volumineux (PDF, Word). | Flux SSE avec progression en % |
| `summarizer_upload.php`| `POST` | Réceptionne les fichiers volumineux pour la synthèse. | JSON avec file_id |
| `invoice_ai_check.php` | `POST` | Audit légal et comptable d'une facture (mentions obligatoires, cohérence montants/TVA). | JSON `{isValid, errors, warnings}` |
| `quote_ai_assist.php` | `POST` | Proposition automatique de lignes de prestations, quantités et prix à partir du besoin. | JSON `{suggestedLines, paymentTerms}` |
| `prospecting_generate.php`| `POST` | Rédige un email de cold outreach B2B personnalisé avec calcul des KPIs d'impact. | JSON `{subject, content, kpis}` |
| `content_generate.php` | `POST` | Décline un contenu source en posts adaptés à LinkedIn, Blog, X et Newsletter. | JSON `[{channel, title, body, hashtags}]` |
| `leads_search.php` | `POST` | Génère une matrice de prospects qualifiés selon un secteur d'activité et une région. | JSON `[{companyName, contact, score}]` |
| `email_generate.php` | `POST` | Générateur de correspondances professionnelles (négociation, remerciement, relance). | Texte brut formaté |
| `email_analyze.php` | `POST` | Analyse le ton, la clarté et l'impact émotionnel d'un brouillon d'email. | JSON `{clarity, sentiment, advice}` |
| `followup_generate.php`| `POST` | Rédige l'email de relance adapté au niveau de retard d'une créance. | JSON `{emailBody, suggestedTone}` |
| `meeting_prep_generate.php`| `POST`| Rédige le conducteur stratégique d'une réunion (objectifs, ordre du jour, pièges). | JSON `{agenda, keyQuestions, risks}` |

### C. Gestion d'Entreprise, Facturation & SIREN
| Fichier Endpoint | Méthode | Rôle & Traitement | Tables SQL / APIs |
| :--- | :--- | :--- | :--- |
| `company_search.php` | `GET` | Recherche SIREN sur l'API officielle Recherche Entreprises Gouv, extraction INSEE & RNE. | API Gouv.fr, `company_api_cache`, `companies` |
| `invoices.php` | `GET`/`POST`/`DELETE` | CRUD complet des factures de l'entreprise avec filtrage par statut et calculs financiers. | Table `invoices` |
| `quotes.php` | `GET`/`POST`/`DELETE` | CRUD complet des devis commerciaux. | Table `quotes` |
| `quotes_to_invoice.php`| `POST` | Conversion instantanée d'un devis accepté en facture officielle. | Tables `quotes` et `invoices` |
| `clients.php` | `GET`/`POST` | Annuaire clients et prospects rattachés au compte entreprise. | Table `clients` |
| `products.php` | `GET`/`POST` | Catalogue des articles, taux de TVA et tarifs unitaires. | Table `products` |
| `expenses.php` | `GET`/`POST` | Suivi des dépenses et notes de frais professionnelles. | Table `company_expenses` |
| `facturx_generator.php`| `POST` | Génération de factures conformes à la norme Factur-X (PDF/A-3 avec XML embarqué). | Librairie interne TCPDF / XML |
| `fec_export.php` | `GET` | Export du Fichier des Écritures Comptables (FEC) légal français pour l'expert-comptable. | Table `invoices`, format tabulé légal |
| `bank_reconciliation.php`| `POST` | Rapprochement automatique des lignes bancaires avec les factures émises. | Algorithme de scoring flou |
| `sepa_payment.php` | `POST` | Génération de fichiers de virement et prélèvement bancaire SEPA XML (pain.008). | XML SEPA ISO 20022 |
| `saved_work.php` | `GET`/`POST` | Synchronisation des brouillons de travail de l'utilisateur entre sessions. | Table `saved_work` |

### D. Authentification & Espace Utilisateur
| Fichier Endpoint | Méthode | Rôle & Traitement |
| :--- | :--- | :--- |
| `auth/register.php` | `POST` | Inscription sécurisée d'une entreprise avec mot de passe haché (Bcrypt) et liaison SIREN. |
| `auth/login.php` | `POST` | Authentification double (par Email ou par numéro SIREN) et délivrance de token JWT. |
| `user/profile.php` | `GET`/`POST` | Consultation et mise à jour des coordonnées de l'entreprise et de son dirigeant. |
| `user/diagnostics.php`| `GET` | Historique des bilans de diagnostics IA réalisés par l'entreprise. |

---

## 6. MODÈLE DE DONNÉES MYSQL ACTUEL

```
+------------------------------------+          +------------------------------------+
|             COMPANIES              |          |               USERS                |
+------------------------------------+          +------------------------------------+
| id (PK)                            |<---+     | id (PK)                            |
| siren VARCHAR(9) UNIQUE            |    |     | company_id (FK -> companies.id)    |
| siret VARCHAR(14)                  |    +-----| email VARCHAR(255) UNIQUE          |
| company_name VARCHAR(255)          |          | first_name, last_name              |
| legal_form VARCHAR(150)            |          | password_hash                      |
| address, postal_code, city         |          | role ENUM('ADMIN', 'USER')         |
| email VARCHAR(255) UNIQUE          |          | created_at                         |
| password_hash                      |          +------------------------------------+
| plan_tier ENUM('free', 'pro', ...) |
| created_at                         |
+------------------------------------+
         |                 |
         | 1:N             | 1:N
         v                 v
+------------------+   +------------------+   +------------------+   +------------------+
|     CLIENTS      |   |     PRODUCTS     |   |      QUOTES      |   |     INVOICES     |
+------------------+   +------------------+   +------------------+   +------------------+
| id (PK)          |   | id (PK)          |   | id (PK)          |   | id (PK)          |
| company_id (FK)  |   | company_id (FK)  |   | company_id (FK)  |   | company_id (FK)  |
| name, email      |   | name, default_pr |   | client_id (FK)   |   | client_id (FK)   |
| company, phone   |   | vat_rate         |   | quote_number     |   | invoice_number   |
| address, notes   |   | category         |   | total_ht, ttc    |   | amount_ht, ttc   |
+------------------+   +------------------+   +------------------+   | status (pending) |
                                                                     +------------------+
```

---

## 7. INVENTAIRE DE LA PILE TECHNOLOGIQUE & BIBLIOTHÈQUES

### Frontend
- **Framework** : React 18.3 + TypeScript + Vite 5.4.
- **Routage** : React Router DOM 6.26 (Code-splitting avec `React.lazy` et `Suspense`).
- **Composants d'interface** : Radix UI Primitives (Dialog, Dropdown, Popover, Tooltip, Tabs, Accordion, Slider, etc.).
- **Styles & Design System** : TailwindCSS 3.4 + animations `tailwindcss-animate`.
- **Gestion des Requêtes** : TanStack Query (React Query) v5.
- **Visualisation de Données** : Recharts 2.12 (Graphiques de KPIs, diagrammes radar d'audit).
- **Rendu Documentaire & Export** : `jspdf`, `jspdf-autotable`, `html2canvas`, `dompurify`.
- **Typographie & Icônes** : Lucide React (plus de 100 icônes vectorielles dynamiques).

### Backend
- **Langage & Environnement** : PHP 8.2 tournant sur serveur mutualisé Apache Linux (OVHcloud).
- **Base de Données** : MySQL 8 (moteur InnoDB, charset utf8mb4).
- **Driver SQL** : PHP Data Objects (PDO) avec requêtes préparées systématiques.
- **Manipulation PDF & Parsing** : `smalot/pdfparser`, `tecnickcom/tcpdf` (installés via Composer).
- **Sécurité Serveur** : Fichier `.htaccess` avec masquage des répertoires, forçage HTTPS, injection d'en-tête d'autorisation et filtrage anti-bots par User-Agent.

### Intégration IA Actuelle
- **Moteur Prioritaire** : OpenAI API (`gpt-4o-mini`).
- **Moteurs Secondaires / Fallbacks** : Groq API (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`), Mistral AI (`mistral-small-latest`).

---

## 8. COMMENT ÇA MARCHE AUJOURD'HUI (FLUX DE BOUT EN BOUT)

Prenons l'exemple du module **Comptes-Rendus de Réunion** (`/services-ia/comptes-rendus`) :
1. **Saisie utilisateur** : L'utilisateur colle des notes de réunion ou dicte du texte dans le composant React `ServicesIAMeetings.tsx`.
2. **Appel Service** : Le composant invoque `analyzeMeetingMedia()` dans `src/lib/meetingReportService.ts`, qui construit un objet `FormData` avec le texte et l'envoie en HTTP POST vers `/api/meeting_upload.php`.
3. **Réception Backend** : Le script PHP `meeting_upload.php` charge `config.php` (qui vérifie la connexion SQL et charge la clé OpenAI/Groq).
4. **Appel Inférence** : La fonction universelle `callGroqApi()` dans `groq_client.php` envoie le prompt système et les notes à l'API OpenAI via cURL.
5. **Normalisation JSON** : Le script PHP extrait le JSON de la réponse OpenAI, applique des valeurs par défaut si certaines clés manquent, et retourne l'objet au navigateur.
6. **Rendu Visuel** : Le frontend React reçoit les données et affiche le tableau de bord avec les participants identifiés, les décisions actées, les actions à mener et les risques.

---

## 9. BILAN CRITIQUE DE L'ARCHITECTURE ACTUELLE

### Forces
- **Grande richesse fonctionnelle** : 14 applications IA déjà maquettées et connectées, couvrant l'ensemble des besoins d'un chef d'entreprise.
- **Résilient & Prêt pour la Production** : Système de fallback multi-fournisseurs (si Groq est bloqué ou Mistral saturé, OpenAI prend le relais de manière transparente).
- **Expérience Utilisateur Moderne** : Interface soignée, typographies premium, mode sombre, responsive mobile optimisé.
- **Déploiement Automatisé** : Pipeline CI/CD GitHub Actions qui compile et déploie automatiquement sur OVH via FTP lors d'un push sur `main`.

### Limites & Faiblesses Actuelles (Ce qu'il faut surmonter)
1. **Absence de Mémoire Sémantique Long Terme** : Chaque requête est actuellement "amnésique". L'IA ne se souvient pas des devis rédigés la semaine précédente ni du vocabulaire spécifique de l'entreprise.
2. **Inférence en "One-Shot" (Sans délibération)** : Une seule requête produit la réponse. Il n'y a pas d'équipe d'agents qui débattent ou se challengent en arrière-plan pour peaufiner et auditer la qualité du résultat.
3. **Absence de Garde-Fou Documentaire en Amont** : Si un utilisateur colle une facture dans le module de comptes-rendus, le système tente tant bien que mal de traiter le texte au lieu de refuser poliment et d'orienter l'utilisateur vers le bon outil.
4. **Absence de Diarisation Audio Réelle** : Le module audio repose sur l'extraction textuelle standard sans découpage précis par locuteur (`[00:12] Eric : ...`).
5. **Stockage Relationnel Standard (MySQL sans vecteurs)** : Impossibilité de faire une recherche sémantique par similarité cosinus (pgvector).
