# 🗺️ Cartographie et Emplacements de l'IA & des Données API — MDIV Business

Ce document récapitule l'ensemble des fichiers, configurations et endpoints régissant l'Intelligence Artificielle et les appels API dans le projet **MDIV Business**.

---

## 1. 🔑 Clé API & Variables Secrètes (Fichier `.env`)

- **Fichier local actif** : [`.env`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/.env) *(à la racine, non suivi par Git pour des raisons de sécurité)*
- **Fichier modèle d'exemple** : [`.env.example`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/.env.example)
- **Contenu géré** :
  ```env
  GROQ_API_KEY=gsk_...
  DB_HOST=localhost
  DB_NAME=mdiv_business
  DB_USER=root
  DB_PASS=
  JWT_SECRET=...
  ```
  *(C'est ici que vous définissez votre clé API active pour Groq ou OpenAI).*

---

## 2. ⚙️ Configuration Centrale du Modèle & Fournisseur IA

### En Production (Serveur Apache / PHP OVH)
- **Fichier principal** : [`public/api/config.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/config.php)
  - Charge dynamiquement le fichier `.env`.
  - Définit l'URL du fournisseur IA :
    ```php
    define('LLM_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
    ```
  - Définit le modèle actif utilisé :
    ```php
    define('LLM_MODEL', getenv('LLM_MODEL') ?: 'qwen/qwen3.8-27b');
    ```
  - Fournit la fonction générique d'appel IA : `call_llm_api($messages, $jsonMode)`.
- **Fichier de fallback multi-modèles** : [`public/api/groq_client.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/groq_client.php)
  - Assure le basculement automatique en cas d'indisponibilité d'un modèle (Groq -> fallback -> Mistral/HuggingFace).

> **💡 Comment basculer sur OpenAI payant dans ce fichier ?**  
> Dans [`public/api/config.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/config.php), il suffit de remplacer :  
> `LLM_API_URL` par `'https://api.openai.com/v1/chat/completions'`  
> `LLM_MODEL` par `'gpt-4o-mini'`  
> et de renseigner votre clé OpenAI `sk-...` dans votre `.env`.

### En Développement Local (Vite / Node.js)
- **Fichier** : [`vite-dev-api.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/vite-dev-api.ts) *(à la racine)*
  - Intercepte toutes les requêtes locales envoyées vers `http://localhost:8080/api/*`.
  - Lit la clé présente dans `.env` et interroge l'IA directement sans avoir besoin d'un serveur PHP local.

---

## 3. 🎯 Emplacements des Prompts & Endpoints de chaque Application IA

Tous les endpoints de traitement des requêtes et les prompts système des fonctionnalités IA se trouvent dans le dossier [`public/api/`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/) :

| Fonctionnalité | Rôle & Traitement IA | Fichier Backend |
| :--- | :--- | :--- |
| **Diagnostic IA Express** | Génération dynamique des questions d'audit et débat d'agents | [`diagnostic_step.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/diagnostic_step.php) & [`diagnostic_agents.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/diagnostic_agents.php) |
| **Assistant Email IA** | Rédaction contextuelle d'emails, détection de ton et analyse | [`email_generate.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/email_generate.php) & [`email_analyze.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/email_analyze.php) |
| **Assistant Devis IA** | Suggestion de produits, up-selling et argumentaires de vente | [`quote_ai_assist.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/quote_ai_assist.php) & [`quote_export.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/quote_export.php) |
| **Vérificateur Factures IA** | Audit de conformité légale, contrôle TVA, SIRET et mentions | [`invoice_ai_check.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/invoice_ai_check.php) & [`invoices.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/invoices.php) |
| **Assistant Relances IA** | Rédaction d'emails de recouvrement selon le niveau d'urgence | [`followup_generate.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/followup_generate.php) & [`followup_targets.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/followup_targets.php) |
| **Générateur Contenu IA** | Production de publications LinkedIn, web et newsletters | [`content_generate.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/content_generate.php) |
| **Prospection B2B** | Séquences de prospection commerciale en 3 phases | [`prospecting_generate.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/prospecting_generate.php) |
| **Préparation RDV IA** | Briefing pré-réunion, objections prévisibles et questions | [`meeting_prep_generate.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/meeting_prep_generate.php) |
| **Comptes-Rendus IA** | Synthèse de réunion et matrice de décisions/actions | [`meeting_agents.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/meeting_agents.php) |
| **Résumeur de Documents** | Synthèse multi-documents et extraction de points d'action | [`summarizer_agents.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/summarizer_agents.php) |

---

## 4. 💻 Côté Frontend (React / TypeScript)

### Centralisation des URLs d'API
- **Fichier** : [`src/lib/apiConfig.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/apiConfig.ts)
  - Contient les fonctions `getApiUrl('nom_du_fichier.php')` et `createApiUrl()`.
  - Assure que les requêtes fonctionnent de manière unifiée en local (`http://localhost:8080/api/...`) et en production sur OVH (`/api/...`).

### Services Frontend (Appels HTTP)
Situés dans le dossier [`src/lib/`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/) :
- [`diagnosticService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/diagnosticService.ts) : Dialogue avec `diagnostic_step.php`.
- [`emailAssistantService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/emailAssistantService.ts) : Envoi du contexte et réception de l'email rédigé.
- [`quoteService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/quoteService.ts) : Gestion des devis, clients, produits et assistance IA.
- [`invoiceService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/invoiceService.ts) : Gestion des factures et audit de conformité légale.
- [`followupService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/followupService.ts) : Gestion des impayés et relances.
- [`ocrService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/ocrService.ts) : Moteur de reconnaissance optique client via Tesseract.js.
- [`meetingPrepService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/meetingPrepService.ts) : Préparation des briefings commerciaux.

---

## 5. 🗄️ Base de Données & Persistance (MySQL)

- **Script SQL d'initialisation** : [`database.sql`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/database.sql) *(à la racine)*
  - Définit les tables `companies`, `diagnostics`, `clients`, `products`, `quotes`, `invoices` et `followups`.
- **Connexion PDO multi-tenant** :
  - Configurée dans [`public/api/config.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/config.php) via `get_db_connection()`.
  - Toutes les données sont isolées par entreprise grâce à la colonne `company_id`.
