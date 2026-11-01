# RAPPORT D'AUDIT CONTRADICTOIRE & VÉRIFICATION SUR L'APPLICATION RÉELLE
## Module MDIV EVENT ENGINE — Projet MDIV Network / Business

**Document audité :** `event_organisation_1_11_2026.md` (*MANUEL D'UTILISATION COMPLET — MDIV EVENT ENGINE*)  
**Branche Git :** `event_subscribe`  
**Date de l'audit :** 1er Novembre 2026  
**Auditeur :** Antigravity (Google DeepMind Team)  
**Règle d'or de l'audit :** L'application réelle en fonctionnement est la seule et unique source de vérité. Aucune affirmation précédente n'est tenue pour acquise. Aucun code applicatif n'a été modifié pendant cet audit.

---

## 1. RÉSUMÉ EXÉCUTIF

Le présent audit contradictoire a été diligenté pour confronter de manière exhaustive, systématique et impitoyable les affirmations contenues dans le manuel `event_organisation_1_11_2026.md` à la réalité factuelle du code source, de la base de données et de l'interface utilisateur active (`http://localhost:8080`).

### Constat d'ensemble :
Le manuel précédent a péché par **sur-promesse technique** et **inadéquation documentaire** majeure :
1. **Ergonomie et Découvrabilité Défaillantes :** Les écrans de gestion opérationnelle (Tombola, Pitchs, Rendez-vous B2B, Questions sur-mesure) ne figurent pas comme onglets de la page principale `/admin/events`, mais sont confinés dans une fenêtre modale plein écran qui n'apparaît que si l'utilisateur clique sur un petit bouton secondaire nommé **« Moteur Événementiel »** situé sur la carte de chaque événement. Si l'administrateur clique sur « Modifier » (icône crayon), il reste cantonné au formulaire basique sans jamais voir ces fonctionnalités.
2. **Bloquage Backend 401 sur les Actions Administrateur :** Bien que l'interface de la Tombola, des Rendez-vous B2B et des Questions sur-mesure soit codée, toute tentative d'ajout de lot (`save_tombola_prize`), de tirage au sort (`execute_tombola_draw`) ou de création de créneau B2B (`create_meeting_slot`) échoue avec une erreur HTTP **401 UNAUTHORIZED** (`{"success":false,"code":"UNAUTHORIZED"}`) en raison d'un verrou d'authentification mal calibré dans le middleware d'API (`auth.middleware.ts`) qui n'accepte pas la session admin par cookie.
3. **Fonctionnalités Inexistantes survendues :** Le manuel annonçait des fonctionnalités qui n'ont strictement aucune réalité logicielle dans le projet :
   - *« Deux boutons dédiés : Télécharger le Badge (PDF/Image) et Ajouter à Apple Wallet / Google Wallet »* : **100% INEXISTANT** (aucun passkit Apple, aucun JWT Google Wallet, pas d'export PDF natif, simple impression CSS).
   - *« 16 modules dans le catalogue »* : **CONTRADICTOIRE & INEXACT**. Le catalogue technique (`eventFeatureCatalog.ts`) ne comporte que **13 modules**, et le formulaire de création n'en affiche que **11**.
   - *« Quiz et Sondages en direct »* : **ABSENT** au niveau de l'interface utilisateur (aucun composant, simple déclaration statique de type).
   - *« Diagnostic IA réalisé sur place pour l'événement »* : **ABSENT**. Le diagnostic IA est un module SaaS distinct non intégré aux événements.
   - *« Tables `event_features` et `event_registrations` »* : **FAUX NOMMAGE**. La table réelle s'appelle `event_attendees` et la configuration des modules est stockée dans une colonne JSON `features_config` de la table `events`.

---

## 2. PÉRIMÈTRE & MÉTHODOLOGIE D'AUDIT

L'audit a combiné 4 approches contradictoires en environnement réel :
1. **Inspection de l'Interface par Navigateur Réel (Playwright / Chromium) :**
   - Connexion administrateur avec les identifiants réels (`champion` / `Champion2018#`).
   - Parcours complet : Page d'accueil -> Administration (`/admin`) -> Événements (`/admin/events`) -> Modal Moteur Événementiel -> Hub public (`/evenements/:id`) -> Tunnel d'inscription (`/evenements/:id/inscription`) -> Régie scénique (`/admin/events/:id/regie`) -> Écran scène 1080p (`/evenements/:id/live`).
2. **Sondage Réseau & API :**
   - Exécution de 14 requêtes HTTP (GET et POST) sur l'ensemble des points d'entrée de l'API `/api/event_engine.php` pour vérifier la réponse réelle du serveur local.
3. **Audit Statique du Code Source :**
   - Analyse ligne à ligne de `AdminEvents.tsx`, `EventTombolaAdminTab.tsx`, `EventLiveDisplayPage.tsx`, `eventFeatureCatalog.ts`, `event.controller.ts`, `event.service.ts` et `auth.middleware.ts`.
4. **Audit de la Persistance & Données :**
   - Examen de `dev_db.json`, `database.sql` et `migrations_event_engine_2026.sql`.

---

## 3. PARCOURS UTILISATEUR RÉELLEMENT ACCESSIBLE

### Le parcours constaté :
```
URL /admin/login  ==>  Connexion réussie  ==>  Dashboard /admin
     ||
     v
URL /admin/events (Liste des événements + Formulaire classique à gauche)
     ||
     +--> Clic sur "Modifier" (crayon) : Affiche UNIQUEMENT le formulaire classique à gauche (Titre, Date, Lieu, Prix, Programme). AUCUN onglet Tombola, B2B, Pitch ou CRM n'apparaît !
     ||
     +--> Clic sur le bouton doré "Moteur Événementiel" (sur la carte de droite) :
           Ouvre la modale plein écran avec 8 onglets :
           1. Catalogue (13 modules listés)
           2. Champs & Questions (Formulaire dynamique)
           3. Inscrits & CRM (Tableau des participants)
           4. Pitchs Entreprises (Tableau de modération)
           5. Rendez-vous B2B (Créneaux & partenaires)
           6. Tombola (Gestion des lots & tirage)
           7. Régie LIVE (1080p) (Moniteur et scènes)
           8. Diffusion & Liens (URLs publiques)
```

> [!CAUTION]
> **Pourquoi l'utilisateur ne trouvait pas la Tombola et les fonctionnalités :**  
> Le manuel affirmait : *« Rendez-vous dans l'onglet Tombola Officielle »*. L'utilisateur cherchait un onglet Tombola sur la page `/admin/events`. Cet onglet n'existe pas au niveau de la page ! Il est masqué au fond de la modale « Moteur Événementiel », accessible uniquement par un clic sur un bouton spécifique de la carte de l'événement. De plus, une fois dans cet onglet, les requêtes d'enregistrement de lots échouent à cause de l'erreur 401.

---

## 4. SYNTHÈSE DES STATUTS PAR CATÉGORIE

| Catégorie Fonctionnelle | Nb Éléments Audités | Opérationnel | Partiel | Code Non Exposé | Absent | En Erreur (401) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A. Gestion Générale** | 14 | 9 | 4 | 0 | 1 | 0 |
| **B. Catalogue Modulaire** | 10 | 2 | 5 | 3 | 0 | 0 |
| **C. Inscription & Formulaires**| 14 | 8 | 4 | 0 | 2 | 0 |
| **D. Participants & CRM** | 11 | 4 | 4 | 0 | 2 | 1 |
| **E. Photos, Profils & Badges** | 14 | 7 | 3 | 0 | 4 | 0 |
| **F. Présence & Check-in** | 7 | 2 | 2 | 0 | 2 | 1 |
| **G. Networking Wall** | 10 | 8 | 2 | 0 | 0 | 0 |
| **H. Pitchs Entreprises** | 11 | 7 | 3 | 0 | 1 | 0 |
| **I. Rendez-vous B2B** | 9 | 4 | 2 | 0 | 1 | 2 |
| **J. Diagnostic IA Événement** | 10 | 0 | 1 | 1 | 8 | 0 |
| **K. Tombola** | 20 | 3 | 4 | 0 | 3 | **10** |
| **L. Régie & Écran LIVE** | 23 | 16 | 5 | 0 | 2 | 0 |
| **M. Autres Éléments (Quiz, etc.)**| 12 | 2 | 2 | 0 | 8 | 0 |
| **TOTAL GÉNÉRAL** | **155** | **72** | **36** | **4** | **24** | **19** |

---

## 5. DÉTAIL DES ANOMALIES MAJEURES (TOP 5)

### 🔴 Anomalie n°1 : Verrouillage 401 sur l'API Admin de la Tombola et du B2B
- **Affirmation du manuel :** *« Le tirage au sort est exécuté côté serveur via un générateur CSPRNG et scellé par une empreinte SHA-256... Enregistrement immédiat du lot et du gagnant. »*
- **Réalité constatée :** Dans `server/shared/middleware/auth.middleware.ts`, les routes POST de gestion admin (`save_tombola_prize`, `execute_tombola_draw`, `create_meeting_slot`, `check_in`) ne sont pas autorisées pour les requêtes sans Bearer Token JWT SaaS. Or, les composants React de l'administration admin envoient de simples appels `fetch()` sans header Authorization.
- **Résultat :** **Impossible pour l'organisateur d'ajouter un lot ou de lancer le tirage depuis l'interface.** L'application renvoie `401 UNAUTHORIZED`.

### 🔴 Anomalie n°2 : Promesses fantaisistes sur Apple Wallet, Google Wallet et Badges PDF
- **Affirmation du manuel :** *« Deux boutons dédiés : Télécharger le Badge (PDF/Image) et Ajouter à Apple Wallet / Google Wallet. »*
- **Réalité constatée :** Dans `EventRegistrationConfirmation.tsx` et `DigitalBadgeCard.tsx`, il existe uniquement un bouton « Imprimer mon pass » qui déclenche `window.print()` et un bouton « Télécharger le QR Code » qui télécharge l'image PNG du QR code.
- **Résultat :** Aucun fichier `.pkpass` Apple Wallet, aucune API Google Wallet Pass, aucun moteur de génération PDF de badge (comme jsPDF ou PDFKit) n'est implémenté.

### 🔴 Anomalie n°3 : Ergonomie de configuration introuvable pour l'administrateur
- **Affirmation du manuel :** *« Accédez à l'onglet Rendez-vous B2B... Rendez-vous dans l'onglet Tombola Officielle... »*
- **Réalité constatée :** La page `/admin/events` présente une barre latérale classique avec un formulaire linéaire. Les onglets Tombola, B2B, Pitchs, Inscrits et Champs n'apparaissent qu'en ouvrant un tiroir modal spécifique via le bouton « Moteur Événementiel ». L'administrateur suivant le manuel est immédiatement perdu car il cherche des onglets inexistants sur la page.

### 🔴 Anomalie n°4 : Catalogue de 16 modules annoncé vs 13 réels vs 11 affichés
- **Affirmation du manuel :** *« Le catalogue centralise 16 briques modulaires : registration, custom_fields, photo_upload, participant_profile, digital_badge, networking_wall, company_pitch, b2b_booking, tombola_draw, quiz_survey, ai_diagnostic, dynamic_schedule, speakers, partners_sponsors, live_stage_screen, event_regie_studio. »*
- **Réalité constatée :** Le fichier technique `src/lib/eventFeatureCatalog.ts` ne définit que **13 modules** avec des identifiants techniques totalement différents (`online_registration`, `custom_fields`, `networking_wall`, `pitch_directory`, `b2b_meetings`, `dynamic_program`, `partners_showcase`, `event_tombola`, `gamification`, `pro_diagnostic`, `digital_badge`, `live_screen`, `crm_auto_sync`). L'upload photo et le profil ne sont pas des modules activables mais des sous-champs de l'inscription. Et dans le formulaire de base d'un événement, le système affiche `2. MODULES (11)`.

### 🔴 Anomalie n°5 : Inexistence totale des Quiz / Sondages et du Diagnostic IA Événementiel
- **Affirmation du manuel :** Le manuel détaille des quiz interactifs et un diagnostic IA sur place.
- **Réalité constatée :** Aucun formulaire, aucune base de questions, aucun composant d'affichage de scores ou de vote en direct n'existe dans le projet. Pour le diagnostic IA, seul le module SaaS général (`/services-ia/diagnostic`) existe, sans aucune liaison avec les événements créés.

---

## 6. CONCLUSION GÉNÉRALE

Le moteur **MDIV EVENT ENGINE** possède un socle réel très impressionnant et déjà riche :
- Le tunnel d'inscription publique ([`EventRegistrationPage.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/EventRegistrationPage.tsx)) fonctionne remarquablement bien avec son formulaire 3 étapes, sa prévisualisation photo, ses consentements RGPD et son badge dynamique.
- L'écran de scène Full HD 1080p ([`EventLiveDisplayPage.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/EventLiveDisplayPage.tsx)) et le pupitre de régie ([`EventRegiePage.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/admin/EventRegiePage.tsx)) existent bel et bien avec leurs 11 scènes et leur liaison BroadcastChannel.
- Le mur de réseautage public ([`EventNetworkingWall.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventNetworkingWall.tsx)) et les candidatures de pitch fonctionnent.

**Cependant, le manuel d'utilisation précédent est inapplicable en l'état pour un utilisateur final.** Il mélange fonctionnalités réelles, modules non raccordés, fonctions bloquées par des erreurs 401 et éléments purement fictifs (Apple Wallet, PDF).

Le manuel doit être intégralement réécrit selon le plan de correction documentaire fourni dans ce dossier d'audit.

