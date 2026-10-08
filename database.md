# Cartographie de la Base de Données (MDIV Business & IA)

Ce document répertorie l'ensemble des tables de la base de données (incluant celles de l'application SaaS MDIV Business, des services IA, et du socle WordPress existant), ainsi que leurs correspondances avec les différents modules de l'application.

| Nom de la table en BD | Application / Module (MDIV & IA) | Explication (À quoi ça sert) |
| :--- | :--- | :--- |
| **`companies`** | **MDIV Core** (SaaS Multi-tenant) | Gère les entreprises inscrites sur le SaaS. C'est la table centrale pour séparer les données (multi-tenant) de chaque client (SIRET, adresse, plan tarifaire). |
| **`users`** | **MDIV Core** (Authentification SaaS) | Contient les comptes utilisateurs (collaborateurs, dirigeants) rattachés à une entreprise (login, mot de passe sécurisé, rôles). |
| **`admins`** | **MDIV Core** (Super Admin) | Gère les accès super-administrateurs de l'application globale (accès créés manuellement avec hash `bcrypt`). Protège l'accès back-office global. |
| **`company_api_cache`** | **IA / Data** (Enrichissement) | Sert de cache pour les requêtes à l'API SIREN/INSEE. Évite de faire des requêtes externes payantes ou limitées en stockant les données d'entreprise déjà cherchées. |
| **`diagnostics`** | **IA Consultative** (Audit & Stratégie) | Sauvegarde les sessions de l'agent IA "Diagnostic Express". Conserve l'historique des questions/réponses et les rapports stratégiques générés par l'IA. |
| **`clients`** | **MDIV CRM** (Ventes) | Stocke le carnet d'adresses et le répertoire des clients pour chaque entreprise. Utilisé par les modules devis et facturation. |
| **`products`** | **MDIV Catalogue** (Ventes) | Catalogue de produits et de services de l'entreprise avec prix par défaut et taux de TVA. |
| **`quotes`** | **IA Devis** (Ventes / Productivité) | Table des devis (draft, envoyés, acceptés). L'IA génère et aide à la rédaction de résumés exécutifs (Executive Summary) enregistrés ici. |
| **`invoices`** | **IA Factur-X & Juridique** (Finance) | Stocke les factures émises. Intègre la génération du format XML hybride (Factur-X / Norme EN 16931) et les rapports de conformité juridique IA (Legal Check). |
| **`followups`** | **IA Agent Relance** (Finance / CRM) | Enregistre les dossiers de factures impayées et les relances générées automatiquement par l'IA avec un ton adapté (cordial, strict). |
| **`projects`** | **MDIV Opérations** (Productivité) | Table pour la gestion des chantiers ou missions. Permet de regrouper les devis et de calculer la rentabilité brute en y rattachant les dépenses. |
| **`company_integrations`**| **MDIV Sync** (Productivité) | Stocke les tokens de connexion OAuth 2.0 (Google Workspace, Microsoft 365) pour que l'IA puisse scanner les emails et préparer des réunions. |
| **`company_expenses`**| **IA Vision OCR** (Achats / Finance) | Enregistre les factures fournisseurs et reçus scannés par l'IA Vision Multimodale (qui extrait montants HT, TVA et TTC). Sert à calculer la rentabilité des projets. |
| **`ai_audit_logs`** | **Observabilité IA** (Sécurité & Tokenomics) | Journal d'audit (Audit Trail) de toutes les actions IA réalisées sur le système. Traque l'utilisation, le type d'outil utilisé, l'utilisateur et l'entreprise pour la traçabilité. |
| **`mod161_*`** (multiples) | **WordPress Core** (Site Vitrine) | Ensemble des tables natives du CMS WordPress (pages, posts, plugins, configurations du site vitrine d'origine avant la couche SaaS). |
| **`perf_*`** (multiples) | **Ancien Système** (Héritage) | Tables issues potentiellement de plugins de performance, d'analytics ou de l'ancien système de gestion. |
