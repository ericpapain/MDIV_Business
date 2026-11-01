# RAPPORT D’INTERVENTION TECHNIQUE — 22 OCTOBRE 2026

**Projet** : MDIV Business (IT4WORK)  
**Objectif** : Implémentation du contrôle de déconnexion depuis le badge utilisateur, normalisation du bouton de connexion du menu principal, et fiabilisation de l'enregistrement de l'entreprise en base de données lors de la connexion Google OAuth 2.0.  
**Règle appliquée** : Audit préalable obligatoire avant modification (zéro doublon, réutilisation des briques existantes).

---

## 1. DEMANDES UTILISATEUR TRAITÉES

1. **Déconnexion depuis le badge entreprise** :
   - Rendre le badge utilisateur `<span className="... truncate max-w-[120px]">E P</span>` dans le questionnaire d'onboarding/diagnostic cliquable pour permettre la déconnexion directe de la session.
2. **Enregistrement en base de données (Table `companies`) lors de la connexion Google** :
   - Garantir que lors d'une authentification via Google OAuth 2.0, l'entreprise et son responsable administrateur soient systématiquement et intégralement persistés en base de données avec tous les attributs requis.
3. **Bouton d'accès dans le menu du site vitrine Services IA** :
   - Sur l'en-tête de `ServicesIA.tsx`, remplacer « Mon espace » par **« Connectez-vous »** (redirigeant vers `/services-ia/diagnostic/login`) dès lors que l'utilisateur n'est pas authentifié. Afficher « Mon espace » uniquement si l'utilisateur est réellement connecté.
4. **Verrouillage fixe de la barre latérale (`<aside>`) & défilement indépendant du tableau de bord** :
   - Le menu de gauche (`<aside class="bg-[#142B52] ...">`) doit rester strictement figé en fonction de la hauteur d'écran (`h-screen`), sans être entraîné lors du défilement.
   - Seul le bloc de droite du tableau de bord (recherche, statistiques, facturation, cartes d'actions) doit défiler verticalement (`overflow-y-auto`).

---

## 2. AUDIT PRÉALABLE AVANT DÉVELOPPEMENT

| Composant / Module | Fichier existant | État constaté avant intervention |
| :--- | :--- | :--- |
| **Badge Entreprise Diagnostic** | `src/pages/ServicesIADiagnostic.tsx` | Le badge affichant le nom de l'entreprise (`company?.name`) était un simple élément `<span>` textuel statique. La méthode `logout()` existait dans `AuthContext.tsx` mais n'était pas connectée à ce niveau. |
| **Menu Services IA** | `src/pages/ServicesIA.tsx` | La condition d'affichage vérifiait `savedProfile \|\| isAuthenticated`. Un utilisateur déconnecté ayant un profil mis en cache continuait de voir « Mon espace » et était redirigé vers `/services-ia/dashboard`. |
| **Backend Google Dev (Node)** | `vite-dev-api.ts` | La création de l'entreprise omettait la synchronisation des champs `name`, `logo_url`, `role` et `updated_at`. |
| **Backend Google Prod (PHP)** | `public/api/auth/google_auth.php` | L'insertion SQL n'enregistrait pas `logo_url` et ne répliquait pas les créations dans le fichier miroir local `dev_db.json`. |
| **Page de Login** | `src/pages/auth/Login.tsx` | La redirection par défaut pointait vers l'ancien chemin `/dashboard` au lieu du nouveau tableau de bord unifié `/services-ia/dashboard`. |

---

## 3. MODIFICATIONS RÉALISÉES

### A. [`src/pages/ServicesIADiagnostic.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/ServicesIADiagnostic.tsx)
- Import de l'icône `LogOut` depuis `lucide-react`.
- Récupération de la méthode `logout` depuis le hook `useAuth()`.
- Remplacement du `<span>` statique par un bouton interactif stylisé :
  - Affiche le nom ou les initiales de l'entreprise (`E P`).
  - Affiche une icône de sortie discrète au repos qui s'anime en couleur rose/rouge au survol.
  - Déclenche au clic : `logout()`, notification de succès via `toast.success("Vous avez été déconnecté avec succès.")`, et bascule instantanée de l'en-tête vers le bouton de connexion.

### B. [`src/pages/ServicesIA.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/ServicesIA.tsx)
- Remplacement de la condition `savedProfile || isAuthenticated ? ...` par un aiguillage strict sur `isAuthenticated` :
  - **Non connecté** : bouton textuel **« Connectez-vous »** pointant vers `/services-ia/diagnostic/login`.
  - **Connecté** : bouton **« Mon espace »** pointant vers `/services-ia/dashboard`.

### C. [`src/pages/auth/Login.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/auth/Login.tsx)
- Mise à jour de la destination par défaut post-connexion :
  - Remplacement de `'/dashboard'` par `'/services-ia/dashboard'`.

### D. [`vite-dev-api.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/vite-dev-api.ts)
- Dans le gestionnaire d'authentification Google (`pathname === '/api/auth/google_auth.php'`) :
  - Enregistrement immédiat dans `db.companies` avec l'ensemble des champs normés :
    `id`, `company_name`, `name`, `email`, `google_id`, `avatar_url`, `logo_url`, `logo`, `auth_provider: 'google'`, `plan_tier: 'free'`, `status: 'active'`, `role: 'ADMIN'`, `first_name`, `last_name`, `job_title: 'Dirigeant'`, `created_at`, `updated_at`.
  - Sauvegarde immédiate dans `dev_db.json`.

### E. [`public/api/auth/google_auth.php`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/public/api/auth/google_auth.php)
- Ajout de la colonne `logo_url` lors de l'insertion dans la table MySQL `companies`.
- Ajout de la synchronisation de secours miroir dans `dev_db.json` pour garantir la persistance quel que soit l'environnement d'exécution.

### F. [`src/pages/ServicesIADashboard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/ServicesIADashboard.tsx)
- Verrouillage du conteneur parent sur écran desktop : `min-h-screen md:h-screen md:max-h-screen md:overflow-hidden`.
- Stabilisation de la barre latérale `<aside>` : `relative w-full md:h-screen md:max-h-screen md:sticky md:top-0 bg-[#142B52] ... shrink-0 overflow-hidden` avec conservation de la poignée de redimensionnement manuel draggable (`GripVertical`) et défilement autonome interne de la liste des outils.
- Isolation du défilement sur le bloc droit : `flex-1 flex flex-col min-w-0 w-full md:h-screen md:max-h-screen md:overflow-y-auto`.
- Fixation de l'en-tête de recherche/profil : `shrink-0 sticky top-0 z-20` pour un accès permanent lors du défilement du contenu droit.

### G. Intégration de la nouvelle famille **« Gains de temps & Économies »** (Anciennement Audit & ROI)
- **Reformulation artisan-friendly (langage clair et concret)** :
  - La famille et ses outils ont été débarrassés du jargon technique pour adopter un vocabulaire immédiat et orienté bénéfices terrain (plombier, électricien, maçon, commerçant, artisan) :
    1. **Famille** : **« Gains de temps & Économies »** (*Bilan en 2 min, calcul de vos heures économisées et comparatif métier*)
    2. **Outil 1** : **« Bilan express de mon entreprise »** (`/services-ia/diagnostic`) — *Faites le point en 2 minutes sur votre organisation pour repérer où vous perdez du temps et découvrir les aides adaptées.*
    3. **Outil 2** : **« Calculer mon temps gagné & mes économies »** (`/services-ia/calc-roi`) — *Voyez clairement combien d'heures de paperasse vous pouvez récupérer chaque semaine et l'argent économisé sur l'année.*
    4. **Outil 3** : **« Me comparer aux pros de mon secteur »** (`/services-ia/benchmark`) — *Regardez comment travaillent et s'organisent les autres artisans de votre métier pour ne pas vous laisser distancer.*
- **Source de vérité (`servicesIAMapping.ts`)** :
  - Catégorie : `'Gains de temps & Économies'`
  - Noms, descriptions, conseils et automatisations vulgarisés pour les artisans.
  - Calcul d'estimation des heures économisées (`calculateHoursSaved`) enrichi (+1.5h).
- **Tableau de bord & Modale (`ServicesIADashboard.tsx`)** :
  - Famille `Gains de temps & Économies` intégrée dans `SERVICE_FAMILIES` avec thème violet fidèle à la capture.
  - Affichage dans la modale **« Personnaliser mes outils »** et dans la barre latérale sous « MES OUTILS ».
  - Raccourcis d'actions rapides et recherche vocale/textuelle branchés sur le vocabulaire naturel (`bilan`, `temps gagné`, `économies`, `comparer`, `métier`).

---

## 4. VALIDATION TECHNIQUE ET TESTS

Tous les contrôles qualité ont été exécutés avec succès depuis la racine du projet :

```bash
# 1. Vérification du typage strict TypeScript
npx tsc --noEmit
# Résultat : 0 erreur

# 2. Exécution de la suite de tests unitaires
npm test
# Résultat : 1/1 test passé (Vitest)

# 3. Compilation du build de production Vite
npm run build
# Résultat : Build réussi (Exit code 0, bundle généré sous dist/)
```

---

## 5. ÉTAT FINAL

---

## 6. REFONTE SPA MASTER-DETAIL & AGRANDISSEMENT TYPOGRAPHIQUE (22 OCTOBRE 2026)

### A. Besoin Utilisateur
1. **Menu de gauche persistant sur toutes les pages** : Le bloc de gauche (`<aside>`) doit rester en évidence et fixe en continu. Lorsqu'un outil est sélectionné, il doit s'afficher directement dans le panneau de droite sans redirection plein écran qui ferait disparaître le menu.
2. **Augmentation de la police des outils dans le `aside`** : Lisibilité accrue pour les artisans et professionnels (titres de familles, noms des outils, puces et liens de navigation agrandis).

### B. Architecture implémentée (Master-Detail SPA)
- **Routage par vue active (`view=<tool_id>`)** :
  - L'affichage dans [`src/pages/ServicesIADashboard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/ServicesIADashboard.tsx) est désormais piloté par URL Search Params (`useSearchParams`) :
    - `view=overview` (ou vide) : Tableau de bord principal (KPIs, alertes 2026, actions rapides, checklist, grille des outils).
    - `view=devis` : Écran d'édition et chiffrage des devis.
    - `view=factures` : Facturation électronique Factur-X & suivi paiements.
    - `view=expenses` (ou `tab=achats`) : Achats, tickets et dépenses fournisseurs.
    - `view=relance` : Relances automatiques et impayés.
    - `view=clients` : Détection de clients & leads.
    - `view=prospection` : Messages de prospection email & SMS.
    - `view=rdv` : Préparation de rendez-vous client.
    - `view=visible` : Site vitrine & communication chantier.
    - `view=mails` : Assistant emails professionnels.
    - `view=docs` : Résumé et synthèse documentaire.
    - `view=reunions` : Comptes-rendus vocaux de chantiers / réunions.
    - `view=diagnostic_express` : Bilan express de l'entreprise.
    - `view=calc_roi` : Calculateur d'économies et gains de temps.
    - `view=benchmark` : Comparatif secteur / métier.
    - `view=company` : Paramètres de l'entreprise (SIRET, logo, coordonnées).
- **Chargement dynamique différé (`lazy` + `Suspense`)** :
  - Chaque outil est encapsulé dans `Suspense` avec indicateur de chargement (`EmbeddedLoader`), assurant des temps de réponse instantanés sans surcharger la mémoire.
- **Sous-en-tête de retour contextuel** :
  - Lors de la consultation d'un outil, un bandeau discret affiche le fil d'Ariane (`Mon espace > [Titre de l'outil]`) et un bouton clair **« ← Revenir à la vue d'ensemble »** pour retourner au tableau de bord sans perte d'état.
- **Redirection automatique des routes autonomes (`src/App.tsx`)** :
  - Les anciennes routes directes (`/services-ia/factures`, `/services-ia/devis`, etc.) redirigent automatiquement vers `/services-ia/dashboard?view=...`, garantissant qu'aucun lien externe ou rechargement F5 ne perde le menu de gauche.
- **Neutralisation des marges et en-têtes externes (`SiteLayout.tsx` & `index.css`)** :
  - `/services-ia/dashboard` exclu des headers/footers publics du site vitrine (`100vh`).
  - Règle CSS `.dashboard-embedded-view .ia-page` supprimant le padding supérieur statique `pt-20` pour un affichage natif et fluide dans le panneau droit.

### C. Rehausse typographique de la barre latérale (`<aside>`)
- **Largeur par défaut élargie** : Portée de 330px à **350px** (toujours redimensionnable manuellement de 260px à 560px avec double-clic de réinitialisation).
- **Liens principaux** (« Mon espace », « Mes documents », « Mes achats & dépenses ») : Passés de `text-sm` à `text-sm sm:text-[15px] md:text-base font-bold` avec padding confortable `px-3.5 py-3`.
- **En-têtes de familles** : Passés de `text-xs sm:text-[13px]` à `text-sm sm:text-[15px] md:text-base font-extrabold`, avec conteneurs d'icônes `w-9 h-9` et chevrons `size={18}`.
- **Intitulés des outils** : Passés de `text-xs sm:text-[13px] md:text-sm` à **`text-sm sm:text-[15px] md:text-base font-semibold leading-snug`** avec puces de statut élargies à `w-2.5 h-2.5`, espacement aéré `px-3.5 py-3` et flèche directrice visible `→`.
- **Bouton « Personnaliser mes outils »** : Typographie rehaussée à `text-sm sm:text-[15px] font-bold py-3`.
- **Section « M'AIDER »** : Liens agrandis à `text-sm sm:text-[15px] font-semibold py-2.5`.

---

## 7. CORRECTION DES CONNEXIONS D'OUTILS, SYNCHRONISATION DU MENU BLANC & CHEVRON DE MASQUAGE DU ASIDE

### A. Correction des connexions d'outils (Capture Bleue)
1. **Suivi des paiements & encaissements (`?view=paiements`)** :
   - Auparavant, le composant `ServicesIAInvoice` ne lisait pas `view=paiements` et restait bloqué sur l'onglet par défaut (éditeur de facture).
   - Désormais, `resolveCurrentTab` et `renderEmbeddedView` activent directement l'onglet `'banking'` (*Suivi de trésorerie & Rapprochements bancaires automatisés*).
2. **Achats fournisseurs & Dépenses (Scan OCR) (`?view=expenses`)** :
   - Désormais, l'onglet `'expenses'` (*Achats, justificatifs de dépenses, notes de frais et Scan OCR*) s'affiche directement avec les statistiques et la grille de tickets.
3. **Gestion du recouvrement & litiges (`?view=impayes`)** :
   - Le composant `ServicesIAFollowup` accepte désormais le mode `initialFilter="litiges"`. Il cible automatiquement les impayés critiques (> 15 jours de retard), configure le ton par défaut sur *Ferme* et adapte l'en-tête vers *« Gestion du Recouvrement & Litiges »*.
4. **Facturation conforme PPF 2026 (`?view=facturation`)** :
   - Ouvre directement l'éditeur de facturation Factur-X avec calcul des taxes et génération conforme.

### B. Fiabilisation du Menu Intérieur Blanc (Capture Blanche)
1. **Synchronisation bidirectionnelle (`handleTabChange`)** :
   - Cliquer sur un onglet du menu blanc (*Accueil, Ventes, Achats, Suivi de trésorerie, Transactions, Comptabilité, Grille Tarifaire*) met à jour à la fois l'état local et les paramètres d'URL (`searchParams`), synchronisant en temps réel le fil d'Ariane et l'élément actif du menu bleu.
2. **Bouton « Documents & Factures »** :
   - Le gestionnaire auparavant vide (`onClick={() => {}}`) est désormais connecté pour ouvrir la liste complète des factures et justificatifs émis avec recherche et téléchargement PDF.
3. **Bouton « Revenir à l'accueil » (anciennement Quitter)** :
   - Remplacement du lien sortant vers le site vitrine par un retour fluide vers la vue d'ensemble du tableau de bord (`view=overview`).

### C. Chevron de Masquage / Repliement de la Barre Latérale (`<aside>`)
1. **Bouton replier dans le `<aside>`** :
   - Un bouton chevron `<ChevronLeft>` a été ajouté en haut à droite du bloc entreprise.
   - Au clic, la barre latérale se replie avec une animation fluide (`transition-all duration-300`), libérant 100% de la largeur de l'écran pour la zone de travail de droite.
2. **Bouton déplier dans la Topbar** :
   - Lorsque le menu est replié, un bouton d'accès rapide **`[> Afficher le menu]`** apparaît à gauche de la barre de recherche dans l'en-tête supérieur pour ré-afficher le menu instantanément.
   - L'état de repliement est sauvegardé dans `localStorage ('mdiv_sidebar_collapsed')` pour persister les préférences de l'utilisateur entre les sessions.

---

## 8. SUPPRESSION DU MENU INTÉRIEUR BLANC REDONDANT DANS LE CONTENEUR DROIT

À la demande de l'utilisateur, le menu secondaire blanc vertical (`<div className="hidden lg:flex w-64 bg-slate-50/50 border-r border-slate-200 flex-col shrink-0">`) situé à l'intérieur du conteneur de facturation a été complètement supprimé :

1. **Suppression du doublon de navigation** :
   - Ce menu (`w-64`) créait une double barre latérale côte à côte avec le menu principal bleu (`<aside>`), réduisant l'espace horizontal utile.
   - Tous les outils et services (Facturation, Suivi des paiements, Achats & Dépenses, Trésorerie, Tarifs, Documents) sont désormais pilotés directement et exclusivement par le menu latéral principal à gauche.

2. **Élargissement à 100% de la zone de travail** :
   - Le conteneur principal de [`ServicesIAInvoice.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/ServicesIAInvoice.tsx) a été réajusté en pleine largeur (`w-full`), permettant aux formulaires, tableaux de prestations, totaux et audits IA de bénéficier d'une ergonomie optimale sans défilement horizontal encombrant.

---

## 9. HARMONISATION COMPLÈTE DU MENU : /dashboard ALIGNÉ SUR /services-ia/dashboard?view=company

À la demande de l'utilisateur, l'accès à `http://localhost:8080/dashboard` a été harmonisé pour correspondre fidèlement à l'environnement et au menu de `http://localhost:8080/services-ia/dashboard?view=company` :

1. **Routage centralisé et préservation des paramètres** :
   - Mise en place du composant intelligent `DashboardRedirect` dans [`App.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/App.tsx) qui redirige de manière fluide `/dashboard` vers `/services-ia/dashboard?view=company` en conservant tous les paramètres d'URL (onglets, filtres, etc.).
   - La route `/dasbord` pointe également directement sur ce dashboard unifié.

2. **Suppression de l'en-tête du site vitrine sur le tableau de bord** :
   - Mise à jour de [`SiteLayout.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/components/site/SiteLayout.tsx) pour inclure `/dashboard` dans les pages immersives en plein écran (100vh sans en-tête public).

3. **Menu latéral unifié et persistant** :
   - Toute navigation vers `/dashboard` affiche désormais la barre latérale Services IA complète (*Mon Entreprise, Mon espace, Mes documents, Mes achats, Mes outils personnalisables, M'Aider, etc.*) ainsi que la barre supérieure de recherche globale, de notifications et de profil.
   - Les liens dans l'en-tête du site (`SiteHeader.tsx`) et dans l'inscription (`Register.tsx`) ont été synchronisés pour pointer directement vers ce tableau de bord d'entreprise unifié.

---

## 10. CORRECTION DE L'ACTIVATION DES ONGLETS DE L'ENTREPRISE DANS /services-ia/dashboard?view=company

### A. Problème Identifié
Sur l'URL `http://localhost:8080/services-ia/dashboard?view=company`, lors d'un clic sur l'un des onglets horizontaux (*Fiche Entreprise & Logo, Mes Devis, Projets & Missions, Mes Clients, Facturation, Diagnostics IA, Dépenses & Frais*) :
- L'URL perdait le paramètre `view=company` (devenait par exemple `?tab=clients` au lieu de `?view=company&tab=clients`).
- Le composant parent `ServicesIADashboard` réinitialisait alors la vue active sur sa valeur par défaut (`overview` / *« Mon espace »*).
- L'utilisateur était ainsi renvoyé intempestivement vers le tableau de bord d'accueil au lieu d'afficher le contenu propre à l'onglet sélectionné.

### B. Cause Racine
Dans [`Dashboard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet MDIV Business/Mdiv Business/Site web/MDIV_Business/src/pages/auth/Dashboard.tsx), les gestionnaires de clic appelaient `setSearchParams({ tab: 'clients' })`. En React Router v6, passer un nouvel objet écrase l'ensemble des paramètres d'URL existants si ceux-ci ne sont pas réinjectés explicitement.

### C. Solution Appliquée & Validée
1. **Implémentation d'une fonction dédiée `handleTabSwitch`** :
   - Maintient l'état interne React `setActiveTab(tab)`.
   - Utilise une fonction de mise à jour basée sur les paramètres précédents (`setSearchParams(prev => ...)`).
   - Préserve impérativement `view=company` (ou la vue courante) en même temps qu'elle enregistre `tab=[valeur]`.
2. **Harmonisation de tous les déclencheurs d'onglets** :
   - Mise à jour des boutons d'onglets horizontaux (*Mes Devis, Projets & Missions, Mes Clients, Facturation, Diagnostics IA, Dépenses & Frais, Fiche Entreprise & Logo*) ainsi que du clic sur l'avatar et le libellé de l'entreprise.
3. **Synchronisation bidirectionnelle du `useEffect`** :
   - Prise en charge explicite du paramètre `tab=quotes` dans la détection d'URL.
4. **Validation par tests automatisés de navigation** :
   - Clic sur **Mes Clients (0)** -> affichage immédiat du *Répertoire Clients de l'Entreprise* avec l'URL `?view=company&tab=clients`.
   - Clic sur **Projets & Missions (0)** -> affichage immédiat du *Suivi des Projets & Missions* avec l'URL `?view=company&tab=projects`.
   - Clic sur **Fiche Entreprise & Logo** -> affichage immédiat de la *Configuration Entreprise* avec l'URL `?view=company&tab=company`.
   - Le menu latéral bleu `<aside>` et l'enveloppe générale du dashboard restent stables et actifs sans aucun renvoi indésirable vers *« Mon espace »*.

---

## 11. CRÉATION & INTÉGRATION DE LA PAGE « PRISE DE RENDEZ-VOUS EN LIGNE 24H/24 » (?view=rdv_online)

### A. Contexte & Problématique
- Auparavant, l'URL `http://localhost:8080/services-ia/dashboard?view=rdv_online` n'avait pas de composant dédié et renvoyait vers le générateur de prospects (`ServicesIALeads`).
- L'utilisateur a demandé la création d'une page complète répondant au concept exact :
  > **« Trouver des clients | ✓ Activé | Prise de rendez-vous en ligne 24h/24 »**  
  > *« Vos clients bloquent un rendez-vous ou demandent un devis sans vous déranger sur le chantier. »*
- Les rendez-vous pris doivent être persistés en base de données et apparaître dynamiquement sur le tableau de bord d'accueil (`overview`).

### B. Réalisations & Architecture Déployée

1. **Persistance en Base de Données (`dev_db.json`) & Endpoints API (`vite-dev-api.ts`)** :
   - Initialisation des collections `appointments` et `appointment_settings` dans `dev_db.json`.
   - Création de l'endpoint `GET /api/appointments.php` : récupération chronologique des rendez-vous.
   - Création de l'endpoint `POST /api/appointments.php` : création d'un rendez-vous avec calcul des créneaux, génération automatique de lien visio Meet/Teams, détection automatique du client et synchronisation avec le CRM (`db.clients`).
   - Création des endpoints `PUT` et `DELETE /api/appointments.php` : modification de statut (*Confirmé, En attente, Terminé, Annulé*) et suppression.
   - Création de `GET/POST /api/appointment_settings.php` : réglage des plages horaires de travail, temps de battement, délais de prévenance et types de rendez-vous.
   - Connexion de `GET /api/upcoming_meetings.php` : renvoie désormais les vrais rendez-vous de la base de données.

2. **Couche Service TypeScript ([`src/lib/appointmentService.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/appointmentService.ts))** :
   - Interfaces complètes et typées (`Appointment`, `AppointmentTypeConfig`, `AppointmentSettings`).
   - Méthodes CRUD robustes : `fetchAppointments`, `createAppointment`, `updateAppointment`, `deleteAppointment`, `fetchAppointmentSettings`, `saveAppointmentSettings`.

3. **Page Dédiée ([`src/pages/ServicesIAAppointments.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIAAppointments.tsx))** :
   - **Bandeau Concept Conforme** : badge *« Trouver des clients »*, pilule active animée *« ✓ Activé »*, titre *« Prise de rendez-vous en ligne 24h/24 »* et sous-titre explicatif.
   - **Barre de lien public client** : affichage de l'URL autonome personnalisée (`https://mdiv-business.fr/rdv/...`), bouton de copie rapide avec retour visuel, et bouton d'accès rapide au simulateur.
   - **Indicateurs clés (KPIs)** : rendez-vous programmés, heures de travail préservées sur chantier, 100% de rappels SMS/emails et synchronisation d'agenda en temps réel.
   - **Onglet 1 — Planning & Rendez-vous** : recherche instantanée, filtres par statut (*Tous, Confirmés, En attente, Terminés*), cartes détaillées avec date/heure, coordonnées client, lieu chantier, bouton « Préparer avec l'IA » (connecté au briefing IA) et gestion des statuts.
   - **Onglet 2 — Nouveau Rendez-vous (Manuel)** : formulaire complet de prise de RDV par téléphone ou visite directe.
   - **Onglet 3 — Simulateur Client 24/7** : parcours interactif en 3 étapes reproduisant l'expérience vécue par le client sur mobile/ordinateur (choix du motif, créneau horaire, coordonnées et confirmation en un clic enregistrée en direct en BD).
   - **Onglet 4 — Créneaux & Paramètres** : réglage des heures de début/fin des visites, temps de déplacement, prévenance et rappels automatiques.

4. **Intégration au Panneau Central & Tableau de Bord d'Accueil ([`src/pages/ServicesIADashboard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIADashboard.tsx))** :
   - Routage de la vue `case 'rdv_online':` directement vers `<ServicesIAAppointments />`.
   - Mise à jour de `TOOL_QUICK_ACTIONS` et `servicesIAMapping.ts` pour pointer vers `/services-ia/dashboard?view=rdv_online`.
   - **Nouveau Widget d'Accueil « Mes prochains rendez-vous de chantier & clients »** :
     - Affiche en temps réel sur la page principale (*« Mon espace »*) les rendez-vous confirmés issus de la base de données.
     - Cartes visuelles avec badge date/heure, client, type de travaux, adresse du chantier et bouton « Préparer avec l'IA ».
     - Lien direct vers la gestion du planning 24h/24.

5. **Validation & Tests** :
   - `npx tsc --noEmit` : 0 erreur de compilation.
   - Navigation et enregistrement validés dans le navigateur.

---

## 12. DISSOCIATION & CONNEXION DU DIAGNOSTIC IA APPROFONDI (BILAN EXPRESS D'ENTREPRISE)

### A. Problématique & Besoin Utilisateur
L'outil **« Bilan express de mon entreprise »** (*« Faites le point en 2 minutes sur votre organisation pour repérer où vous perdez du temps et découvrir les aides adaptées »*) renvoyait auparavant vers `/services-ia/diagnostic`, qui présentait le questionnaire initial en 4 étapes destiné aux visiteurs non connectés pour la création d'un compte.
L'utilisateur a demandé de :
1. **Dissocier nettement les deux démarches** :
   - **Diagnostic 1 (Questionnaire d'onboarding / création de compte)** : les 4 questions de cadrage simples pour les visiteurs anonymes menant à la création de compte.
   - **Diagnostic 2 (Diagnostic IA Approfondi)** : l'audit connecté complet qui utilise les agents d'intelligence artificielle, évalue la maturité digitale de l'entreprise (/100), orchestre une délibération multi-agents en direct et livre une feuille de route opérationnelle avec des recommandations d'outils activables.
2. **Re-connecter fidèlement l'application du Diagnostic IA Approfondi** à l'outil « Bilan express de mon entreprise » accessible depuis le tableau de bord, le menu latéral et la barre de navigation.

### B. Architecture & Composants Développés

1. **Création du Composant Dédié [`src/pages/ServicesIADeepDiagnostic.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIADeepDiagnostic.tsx)** :
   - **Étape 1 — Cadrage & Paramétrage Entreprise** :
     - Récupération contextuelle des données de l'entreprise connectée (`company.name`).
     - Sélecteurs de domaine d'activité (*BTP, Commerce, Restauration, Services, etc.*) et d'objectif prioritaire (*Processus internes & gain de temps, Facturation PPF 2026, Prospection & devis, Organisation des plannings*).
     - Champ optionnel d'analyse de site web ou fiche Google My Business.
   - **Étape 2 — Audit Intelligent & Questions Dynamiques IA** :
     - Consommation de `fetchNextDiagnosticStep()` (endpoint `/api/diagnostic_step.php`) avec questions adaptatives selon l'historique d'échange et insights d'experts en temps réel.
     - Choix interactifs à réponse unique avec option de précision libre ou champ personnalisé.
     - Jauge de précision progressive (+25% par question).
   - **Étape 3 — Délibération Multi-Agents en Direct (SSE Streaming)** :
     - Connexion en streaming via `startAgentsDiscussion()` (`/api/diagnostic_agents.php`).
     - Visualisation animée des 3 agents experts intervenants (*Consultant Stratégie & Organisation, Expert Automatisation & No-Code, Contrôleur de Gestion & Rentabilité*).
     - Transcription dynamique de leurs analyses contradictoires et convergence vers un consensus chiffré.
   - **Étape 4 — Rapport Stratégique & Feuille de Route Opérationnelle** :
     - Jauge circulaire de maturité globale sur 100 avec mention qualitative (*En transition, Avancé, Pionnier*).
     - Synthèse exécutive rédigée par l'IA.
     - Points de friction détectés avec niveau d'impact (*Élevé, Moyen*).
     - Feuille de route par phases (*Court terme / Immédiat, Moyen terme*) intégrant des boutons d'action directe vers les modules correspondants de MDIV Business (*Devis IA, Facturation 2026, Planning 24h/24*).
     - Sauvegarde automatique du rapport dans `localStorage` (`mdiv_audit_report_${companyId}`) et validation de la checklist d'accueil.
     - Bouton d'exportation PDF avec mise en page imprimable soignée.

2. **Intégration au Panneau Central de Droite ([`src/pages/ServicesIADashboard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIADashboard.tsx))** :
   - Enregistrement du composant en chargement différé (`React.lazy`).
   - Routage des vues `diagnostic_express` et `diagnostic` dans `renderEmbeddedView` pour afficher le composant sans perdre la barre latérale ni la barre supérieure.
   - Configuration des actions rapides `TOOL_QUICK_ACTIONS.diagnostic_express` pointant vers `/services-ia/dashboard?view=diagnostic_express`.

3. **Mise à Jour du Référentiel des Outils ([`src/lib/servicesIAMapping.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/lib/servicesIAMapping.ts))** :
   - Redirection de l'outil `diagnostic_express` :
     - `link` : `/services-ia/dashboard?view=diagnostic_express`
     - `quickAction.link` : `/services-ia/dashboard?view=diagnostic_express`
     - `checklistStep.link` : `/services-ia/dashboard?view=diagnostic_express`

4. **Routage Intelligent & Redirection Conditionnelle ([`src/pages/ServicesIADiagnostic.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIADiagnostic.tsx))** :
   - Si un utilisateur authentifié tente d'accéder à `/services-ia/diagnostic` ou `/diagnostic-ia` sans paramètre de bilan post-inscription (`?bilan=true`), il est automatiquement et instantanément redirigé vers `/services-ia/dashboard?view=diagnostic_express`.
   - Les visiteurs non authentifiés conservent l'accès au questionnaire d'onboarding préliminaire.

5. **Mise à Jour de la Barre de Navigation Globale ([`src/components/site/SiteHeader.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/site/SiteHeader.tsx))** :
   - Dans le menu déroulant *« Audit & ROI »* (version desktop et mobile), le lien *« Diagnostic IA Express »* pointe de manière dynamique vers `/services-ia/dashboard?view=diagnostic_express` lorsque l'utilisateur est connecté, et vers `/services-ia/diagnostic` lorsqu'il s'agit d'un visiteur public.

### C. Validation & Contrôle Qualité
- Compilation TypeScript : validation sans erreur (`npx tsc --noEmit` code de sortie 0).
- Navigation et chargement de la vue validés dans le navigateur (`http://localhost:8080/services-ia/dashboard?view=diagnostic_express`).

---

## 13. TRANSFORMATION COMPLÈTE DE LA PRISE DE RENDEZ-VOUS : EXPÉRIENCE ULTRA SIMPLE (< 60s CÔTÉ PRO, 2 CLICS CÔTÉ CLIENT)

### A. Objectif & Vision Produit
Transformer l’application de prise de rendez-vous en ligne en un outil fluide, immédiat et sans aucune friction technique :
- **Côté Professionnel (Propriétaire)** : Générer et envoyer une invitation personnalisée avec créneaux automatiques en **moins de 60 secondes**.
- **Côté Client (Public)** : Ouvrir le lien sur mobile ou ordinateur, visualiser directement les créneaux réellement disponibles, et confirmer en **maximum 2 clics** (moins de 30 secondes).

---

### B. Parcours Propriétaire & Tableau de Bord Pro

1. **Écran « Mes disponibilités » ([`ServicesIAAppointments.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/ServicesIAAppointments.tsx))** :
   - **Jours ouvrables & horaires** : Activation/désactivation de chaque jour de la semaine (Lundi à Dimanche) avec heures de début et de fin configurables indépendamment.
   - **Durée des rendez-vous** : Sélecteur rapide (15 min, 30 min, 45 min, 60 min, ou durée personnalisée).
   - **Jours d'absence & congés** : Blocage de dates complètes en 1 clic (immédiatement retirées du calendrier client).
   - **Créneaux bloqués ponctuels** : Blocage de plages spécifiques (ex. *Vendredi 14h-17h : Chantier privé*).
   - **Règles de confort & conflits** : Réglage du temps de battement (buffer 10, 15, 30 min) et délai minimum de prévenance (1h, 2h, 12h, 24h).
   - Détection et exclusion automatique des créneaux déjà réservés.

2. **Envoi Rapide d'une Invitation (Moins de 60 secondes)** :
   - Bouton principal mis en avant : **« ⚡ Planifier un rendez-vous »**.
   - Modale intuitive :
     - Recherche instantanée parmi les contacts existants du carnet d'adresses (`db.clients`).
     - Saisie libre ultra rapide (Nom, Téléphone mobile, E-mail, durée et motif).
   - Après validation : génération automatique d'un jeton unique sécurisé (`token`).
   - Écran de partage multicanal instantané :
     - **WhatsApp** : ouvre directement la conversation avec le texte standardisé (*« Bonjour [Nom], choisissez simplement le créneau qui vous convient à partir du calendrier ci-dessous : [Lien] »*).
     - **SMS Mobile** : déclenche le SMS natif sur smartphone.
     - **E-mail** : prépare l'e-mail avec objet et corps formatés.
     - **Copier le lien** : copie immédiate dans le presse-papier avec confirmation visuelle.

3. **Tableau de Bord Moderne & Statuts de Réservation** :
   - **5 KPIs dynamiques** : *À venir, Aujourd'hui, En attente, Passés/Terminés, Total Réservations*.
   - **Volet de notifications en temps réel** : Cloche avec pastille rouge dynamique alertant immédiatement lors d'une nouvelle réservation, reprogrammation ou annulation.
   - **Filtres rapides et recherche** par nom, téléphone, statut (*Confirmé, En attente, Annulé, Reprogrammé, Terminé*).
   - **Détection des conflits** : Alerte visuelle orange si deux rendez-vous se chevauchent.
   - Actions directes : *Confirmer, Terminer, Reprogrammer, Annuler, Préparer avec l'IA, Appeler / WhatsApp*.

---

### C. Parcours Client (Expérience Publique & Mobile First)

1. **Route Publique Autonome ([`src/pages/PublicClientBooking.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/PublicClientBooking.tsx))** :
   - Accessible directement sur `/rdv/:token` ou `/rdv` sans nécessiter de compte ni d'authentification.
   - Mise en page épurée (100vh sans navigation externe via [`SiteLayout.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/site/SiteLayout.tsx)).

2. **Calendrier Simplifié & Zéro Friction** :
   - Message d'accueil personnalisé (*« Bonjour [Nom], choisissez simplement le créneau qui vous convient à partir du calendrier ci-dessous. »*).
   - Calendrier dynamique : seules les dates avec créneaux réels disponibles sont cliquables ; les dates passées, week-ends fermés, congés et jours complets sont grisées et barrées.
   - Clic sur une date ➔ affichage immédiat des créneaux horaires disponibles.
   - Clic sur un créneau ➔ **Validation instantanée en 1 clic** si le contact était déjà renseigné dans l'invitation (ou 2 champs légers si nouveau client).

3. **Confirmation & Export Agenda** :
   - Écran de validation avec coche animée et résumé complet (Date, Heure, Durée, Entreprise, Contact).
   - Bouton **[📅 Ajouter à Google Calendar]** (génère le lien web direct pré-rempli).
   - Bouton **[🍏 Ajouter à Apple / Outlook (.ics)]** (téléchargement instantané du fichier iCalendar conforme).
   - Boutons pour **reprogrammer** ou **annuler** le rendez-vous en direct.

---

### D. Base de Données & Endpoints Développés

1. **Entités implémentées dans la persistance (`dev_db.json`)** :
   - `appointments` : Stocke les rendez-vous avec `id, company_id, client_id, booking_link_token, client_name, client_phone, client_email, date, time, duration_minutes, location, status, source`.
   - `booking_links` : Stocke les liens uniques d'invitation avec `token, company_id, client_name, duration_minutes, status, created_at`.
   - `appointment_settings` : Stocke les jours ouverts (`working_days`), horaires par jour (`day_schedules`), congés (`holidays: string[]`), créneaux bloqués (`blocked_slots: BlockedSlot[]`), durée par défaut et délais de prévenance.
   - `appointment_notifications` : Historique des notifications en temps réel pour le propriétaire.

2. **Endpoints API REST (`vite-dev-api.ts`)** :
   - `POST /api/booking_links.php` : Génère le lien personnalisé avec token unique.
   - `GET /api/booking_links.php?token=...` : Récupère les informations pour le client.
   - `POST /api/appointments.php` : Crée le RDV, auto-enregistre le client dans le CRM (`db.clients`), et crée la notification en temps réel.
   - `PUT /api/appointments.php?id=...` : Met à jour le statut, et crée une notification en cas d'annulation ou reprogrammation.
   - `GET/POST /api/appointment_settings.php` : Lecture et sauvegarde des disponibilités.
   - `GET/POST /api/appointment_notifications.php` : Gestion des alertes et du marquage comme lu.

---

### E. Validation & Contrôle Qualité

- **TypeScript** : 0 erreur de compilation (`npx tsc --noEmit` code 0).
- **Test Navigateur Automatisé (Browser Subagent)** :
  - Dashboard Pro : vérification des 5 KPIs, du bouton de planification, et de l'onglet de disponibilités.
---

## 14. Refactorisation Complète & Architecture Modulaire Backend (`server/`)

### A. Contexte & Problématique Résolue
Le fichier [`vite-dev-api.ts`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/vite-dev-api.ts) dépassait **6 120 lignes** et concentrait l'intégralité des responsabilités backend : routes, contrôleurs, accès aux fichiers JSON, appels LLM, OCR vision et génération XML réglementaire.

### B. Principes Appliqués
1. **Clean Architecture & Separation of Concerns (SoC)** : Découplage strict entre la réception de la requête, la logique métier, la persistance et les intégrations externes.
2. **Domain-Driven Design (DDD)** : Regroupement par domaines métier verticaux autonomes.
3. **SOLID & DRY** : Élimination des 300 lignes en double, mutualisation du parsing HTTP, des algorithmes de contrôle (Luhn, TVA, hashes) et de l'orchestration IA.
4. **Taille bornée** : Aucun fichier ne dépasse **250 lignes** (moyenne : 80 à 160 lignes).

### C. Nouvelle Arborescence Créée (`server/`)
- **`server/config/`** : `env.ts` (validation et typage des variables d'environnement et endpoints IA).
- **`server/shared/`** : 
  - `types/` : `http.types.ts` (`RequestContext`, `ParsedRequest`, `ApiResponse`).
  - `errors/` : `api-error.ts` (`ApiError`), `error-handler.ts` (`sendJson`, `handleHttpError`).
  - `utils/` : `crypto.utils.ts` (SHA-256, tokens), `luhn.utils.ts` (Luhn SIRET/SIREN), `vat.utils.ts` (TVA FR), `body-parser.utils.ts` (JSON + multipart boundary + DOCX mammoth & PDF zlib).
- **`server/database/`** :
  - `db-connection.ts` : Gestionnaire thread-safe de `dev_db.json` avec mise en cache mémoire.
  - `repositories/base.repository.ts` : Interface générique CRUD pour les collections.
- **`server/integrations/`** :
  - `llm/` : `llm-client.interface.ts`, `groq.provider.ts`, `openai.provider.ts`, `mistral.provider.ts`, `llm-orchestrator.ts` (fallback automatique + directive absolue anti-prix).
  - `search/` : `insee-siren.client.ts` (API officielle Recherche Entreprises avec cache).
  - `export/` : `facturx-xml.builder.ts` (Factur-X EN 16931), `sepa-pain-xml.builder.ts` (ISO 20022), `fec-text.builder.ts` (Art. L. 47 A I LPF).
- **`server/modules/` (14 Domaines DDD)** :
  1. `appointments/` : `appointment.service.ts` & `appointment.controller.ts` (Prise de RDV 24h/24, tokens, notifications).
  2. `auth/` : `auth.service.ts` & `auth.controller.ts` (Login, Google OAuth, Register, sessions).
  3. `companies/` : `company.service.ts` & `company.controller.ts` (Profils, paramètres, recherche INSEE).
  4. `customers/` : `customer.service.ts` & `customer.controller.ts` (CRM B2B, SIRET/Luhn, Client 360°, réponses contextuelles).
  5. `quotes/` : `quote.service.ts` & `quote.controller.ts` (Devis, projets, chiffrage IA).
  6. `invoices/` : `invoice.service.ts` & `invoice.controller.ts` (Cycle factures, audit IA, Factur-X, PPF).
  7. `expenses/` : `expense.service.ts` & `expense.controller.ts` (Frais chantiers, extraction OCR lignes, vision).
  8. `fintech/` : `fintech.service.ts` & `fintech.controller.ts` (SEPA, rapprochement bancaire, export FEC).
  9. `diagnostic/` : `diagnostic.service.ts` & `diagnostic.controller.ts` (Audit express et deep dive).
  10. `meetings/` : `meeting.service.ts` & `meeting.controller.ts` (Classification documentaire, résumés, comptes-rendus).
  11. `prospecting/` : `prospecting.service.ts` & `prospecting.controller.ts` (Leads B2B, pitchs, marchés publics, relances).
  12. `rag/` : `rag.service.ts` & `rag.controller.ts` (Indexation vectorielle et feedback loop).
  13. `ai-governance/` : `ai-governance.service.ts` & `ai-governance.controller.ts` (Réglages, tests ping, télémétrie).
  14. `cms-public/` : `cms.service.ts` & `cms.controller.ts` (Travaux sauvegardés et benchmarks sectoriels).
- **`server/app.ts`** : Routeur central dispatcher de requêtes.
- **`server/index.ts`** : Point d'entrée Vite `devApiPlugin()` (< 50 lignes).
- **`vite-dev-api.ts`** : Réduit de **6 126 lignes à 6 lignes** de proxy rétrocompatible.

### D. Résultats & Validation
- **Code TypeScript** : 0 erreur (`npx tsc --noEmit` code 0).
- **Build de Production** : `npm run build` réussi sans aucun avertissement bloquant.
- **Rétrocompatibilité** : 100% préservée avec `vite.config.ts`, `dev_db.json` et toutes les interfaces frontend.

### E. Résolution du Bug Runtime Vite (`Cannot set headers after they are sent to the client`)
- **Symptôme** : Vite signalait des erreurs `Internal server error: Cannot set headers after they are sent to the client at applyHeaders ... at corsMiddleware` à chaque requête de tracking/ping ou rechargement de page.
- **Cause racine identifiée** :
  1. Dans `vite-dev-analytics.ts`, les actions `track` et `ping` traitaient les streams de corps de requête avec des callbacks (`req.on('data')` / `req.on('end')`) sans renvoyer de `Promise`. La fonction renvoyait immédiatement `undefined` (falsy) de manière synchrone.
  2. Le middleware appelant dans `server/index.ts` considérait la requête comme non gérée (`if (...) return;` échouait) et appelait `next()`.
  3. Le middleware suivant dans la chaîne Vite (`corsMiddleware`) tentait de positionner les en-têtes CORS (`res.setHeader('Access-Control-Allow-Origin', ...)`) alors que le callback de fin de requête avait déjà envoyé ou était en train d'envoyer la réponse (`res.end()`).
- **Correctifs appliqués** :
  1. `vite-dev-analytics.ts` : Fonctions `track` et `ping` converties en async/await avec lecture asynchrone sécurisée du JSON et retour explicite de `true`.
  2. `vite-dev-team.ts` : Ajout du traitement explicite des requêtes preflight HTTP `OPTIONS` avec réponse 204.
  3. `server/index.ts` :
     - Filtrage en tête : toutes les requêtes d'assets/pages non-API (`!pathname.startsWith('/api/') && !pathname.startsWith('/api-')`) sont immédiatement redirigées vers Vite (`return next()`).
     - Gestion centralisée des preflights `OPTIONS` pour toute l'API dev.
     - Les requêtes API inconnues renvoient désormais un JSON 404 propre sans jamais appeler `next()`, évitant tout conflit avec les middlewares internes de Vite.
  4. `server/shared/errors/error-handler.ts` : Protection préventive `if (res.headersSent) return;` dans `sendJson` et `handleHttpError`.
- **Validation** :
  - Suite de tests d'intégration `test_dev.mjs` validée avec succès (HTML 200, Track 200, Ping 200, Settings 200, Appointments 200, KPIs 200, OPTIONS 204).
  - Serveur de dev actif sans aucune erreur en console.





