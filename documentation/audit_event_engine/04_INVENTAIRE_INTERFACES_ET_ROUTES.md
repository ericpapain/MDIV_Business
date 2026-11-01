# INVENTAIRE DES INTERFACES UTILISATEUR, ROUTES ET COMPOSANTS RÉELS
## Cartographie Complète des Écrans Accessibles dans MDIV EVENT ENGINE

**Date d'audit :** 1er Novembre 2026  
**Serveur de référence :** `http://localhost:8080`  
**Branche Git :** `event_subscribe`  

---

## 1. CARTOGRAPHIE DES ROUTES DE L'APPLICATION (FRONTEND)

Les routes suivantes ont été testées et validées dans le routeur principal [`src/App.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/App.tsx) :

### A. Espace Public & Participants

| Route URL | Composant React associé | Description de l'interface | Rôle / Accès | Statut Test |
| :--- | :--- | :--- | :---: | :---: |
| `/` | `src/pages/Home.tsx` | Page d'accueil avec widget des 3 prochains événements dans l'agenda. | Tout public | **200 OK** |
| `/evenements` | `src/pages/Events.tsx` | Catalogue public des événements avec filtres à venir / passés. | Tout public | **200 OK** |
| `/evenements/:id` | `src/pages/EventHubPage.tsx` | Hub d'un événement avec navigation par onglets (`?tab=...`). | Tout public | **200 OK** |
| `/evenements/:id/inscription` | `src/pages/EventRegistrationPage.tsx` | Page dédiée d'inscription au format multi-étapes avec photo et RGPD. | Tout public | **200 OK** |
| `/evenements/:id/reserver` | `src/pages/EventHubPage.tsx` | Alias pointant sur l'onglet des rendez-vous B2B partenaires (`?tab=meetings`). | Tout public | **200 OK** |
| `/evenements/:id/tombola` | `src/pages/EventHubPage.tsx` | Alias pointant sur l'arène publique de tombola (`?tab=tombola`). | Tout public | **200 OK** |
| `/evenements/:id/networking`| `src/pages/EventHubPage.tsx` | Alias pointant sur le mur des décideurs (`?tab=networking`). | Tout public | **200 OK** |
| `/evenements/:id/pitches` | `src/pages/EventHubPage.tsx` | Alias pointant sur le programme des pitchs (`?tab=pitches`). | Tout public | **200 OK** |
| `/evenements/:id/live` | `src/pages/EventLiveDisplayPage.tsx` | Écran de diffusion géant scénique 1080p (sans barre de menu). | Tout public / Scène | **200 OK** |

### B. Espace Administration Privé

| Route URL | Composant React associé | Description de l'interface | Rôle / Accès | Statut Test |
| :--- | :--- | :--- | :---: | :---: |
| `/admin/login` | `src/pages/admin/AdminLogin.tsx` | Page de connexion administrateur (`champion` / `Champion2018#`). | Public | **200 OK** |
| `/admin` | `src/pages/admin/AdminDashboard.tsx` | Tableau de bord général de la plateforme. | Rôle `ADMIN` | **200 OK** |
| `/admin/events` | `src/pages/admin/AdminEvents.tsx` | Gestion CMS des événements + Tiroir Moteur Événementiel. | Rôle `ADMIN` | **200 OK** |
| `/admin/events/:id/regie` | `src/pages/admin/EventRegiePage.tsx` | Pupitre régie privée pour télécommander l'écran de scène. | Rôle `ADMIN` | **200 OK** |

---

## 2. INVENTAIRE DES COMPOSANTS PAR PANNEAU D'ADMINISTRATION

Sur la page `/admin/events`, deux interfaces cohabitent :

### Interface 1 : Le Formulaire Standard (Colonne Gauche de `/admin/events`)
- **Titre du bloc :** *Créer un Événement* ou *Modifier l'Événement*
- **Onglet 1 : Infos Générales**
  - Titre (FR et EN)
  - Date & Heure (`datetime-local`)
  - Lieu (Texte libre)
  - Image de couverture (Composant `ImageUpload` avec preview)
  - Prix et Code événement
  - URL Billetterie externe de secours
  - Description (FR et EN)
  - Accordéon « Programme de l'événement » (Journées et créneaux horaires)
  - Bouton : **« CRÉER L'ÉVÉNEMENT »** ou **« METTRE À JOUR »**
- **Onglet 2 : Modules (11)**
  - Liste d'interrupteurs à bascule (Toggle Switches) permettant d'activer ou désactiver les 11 modules disponibles par défaut.

---

### Interface 2 : Le Tiroir Modal « Moteur Événementiel » (Plein Écran)
Ce panneau s'ouvre **uniquement** lors d'un clic sur le bouton doré **« Moteur Événementiel »** présent sur chaque carte d'événement à droite :

- **Composant conteneur :** Modal plein écran dans [`AdminEvents.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/admin/AdminEvents.tsx#L533-L903)
- **Barre d'onglets intégrée (8 onglets réels) :**
  1. **1. Catalogue** : [`EventFeaturesTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventFeaturesTab.tsx) — Grille des modules avec badges de dépendances et boutons « Paramètres ».
  2. **2. Champs & Questions** : [`CustomFieldsBuilder.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/CustomFieldsBuilder.tsx) — Constructeur dynamique de questions avec types, options et ordre de tri.
  3. **3. Inscrits & CRM** : [`EventAttendeesView.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventAttendeesView.tsx) — Tableau de bord des participants, filtre par statut, recherche plein texte, émargement manuel et export CSV.
  4. **4. Pitchs Entreprises** : [`EventPitchesAdminTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventPitchesAdminTab.tsx) — Liste des candidatures reçues, boutons Valider / Refuser, créneau de passage et notes de modération.
  5. **5. Rendez-vous B2B** : [`EventMeetingsAdminTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventMeetingsAdminTab.tsx) — Grille des créneaux partenaires, ajout de créneaux et affichage des QR codes pour stands.
  6. **6. Tombola** : [`EventTombolaAdminTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventTombolaAdminTab.tsx) — Formulaire de création de lots, configuration des règles (présents émargés) et registre d'audit des tirages.
  7. **7. Régie LIVE (1080p)** : [`EventRegieControlTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventRegieControlTab.tsx) — Pupitre de régie avec sélecteur de scène, ticker en direct et moniteur de contrôle.
  8. **8. Diffusion & Liens** : Section de copie des URLs publiques d'accès direct avec boutons « Copier ».

---

## 3. INVENTAIRE DES COMPOSANTS PUBLICS ASSOCIÉS

Les composants publics suivants sont réellement intégrés et montés dans les pages publiques :

1. **Modal d'inscription complète :**  
   [`PublicEventRegistrationModal.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/PublicEventRegistrationModal.tsx)
   - Étape 1 : Coordonnées standards + Cadre d'upload photo avec canvas de recadrage/compression.
   - Étape 2 : Champs sur-mesure dynamiques + Pitch de présentation + Cases à cocher RGPD et Networking opt-in haute visibilité.
   - Étape 3 : Rendu du pass d'accès officiel avec bouton d'impression et téléchargement du QR code PNG.
2. **Carte du pass participant :**  
   [`DigitalBadgeCard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/DigitalBadgeCard.tsx)
   - Carte de format carte de crédit avec liseré doré, photo détourée, nom, entreprise et grand QR code d'accès sécurisé.
3. **Mur de réseautage interactif :**  
   [`EventNetworkingWall.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventNetworkingWall.tsx)
   - Grille de vignettes des participants ayant consenti, avec filtres par secteur d'activité et moteur de recherche.
4. **Candidature aux pitchs :**  
   [`EventPitchModal.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventPitchModal.tsx)
   - Formulaire modal avec saisie du nom d'entreprise, problématique, besoins et lien vers le support de pitch (PDF).
5. **Réservation de créneau 1-to-1 :**  
   [`EventMeetingBookingModal.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventMeetingBookingModal.tsx)
   - Sélecteur de créneaux horaires libres par partenaire, avec validation instantanée et synchronisation CRM.
6. **Animation scénique de la tombola :**  
   [`EventTombolaAnimation.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventTombolaAnimation.tsx)
   - Rendu de l'arène de suspense avec défilement accéléré des noms, confettis dorés et affichage du hash d'audit SHA-256.
7. **Écran scénique Full HD 1080p :**  
   [`EventLiveDisplayPage.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/EventLiveDisplayPage.tsx)
   - Contient les 11 scènes réelles : `welcome`, `presentation`, `members`, `partners`, `speakers`, `networking`, `pitches`, `qr_booking`, `statistics`, `tombola`, `closing`.

