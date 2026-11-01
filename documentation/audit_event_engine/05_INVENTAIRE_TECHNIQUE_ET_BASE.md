# INVENTAIRE TECHNIQUE, SERVICES BACKEND ET SCHÉMA DE BASE DE DONNÉES
## Référentiel Technique Exhaustif du Moteur MDIV EVENT ENGINE

**Date d'audit :** 1er Novembre 2026  
**Branche Git :** `event_subscribe`  

---

## 1. INVENTAIRE DES FICHIERS SOURCES LIÉS AU MOTEUR ÉVÉNEMENTIEL

### A. Fichiers Frontend (React / TypeScript)

| Emplacement du fichier | Rôle principal |
| :--- | :--- |
| `src/types/eventEngine.ts` | Définitions TypeScript de tous les modèles : modules, inscrits, pitchs, créneaux B2B, tombola et état régie. |
| `src/lib/eventFeatureCatalog.ts` | Catalogue officiel des 13 fonctionnalités avec dépendances, métadonnées et configurations par défaut. |
| `src/pages/admin/AdminEvents.tsx` | Page principale d'administration des événements et drawer modal MDIV EVENT ENGINE (8 onglets). |
| `src/pages/admin/EventRegiePage.tsx` | Page autonome du pupitre de régie LIVE réservée à l'administrateur. |
| `src/pages/EventHubPage.tsx` | Hub public interactif avec navigation multi-onglets (`?tab=...`). |
| `src/pages/EventRegistrationPage.tsx` | Page dédiée du tunnel d'inscription publique. |
| `src/pages/EventLiveDisplayPage.tsx` | Écran de diffusion géant 1920 × 1080 sans bordures pour vidéo-projecteur. |
| `src/components/admin/events/EventFeaturesTab.tsx` | Composant d'administration du catalogue de fonctionnalités. |
| `src/components/admin/events/CustomFieldsBuilder.tsx`| Constructeur visuel de questions et champs personnalisés. |
| `src/components/admin/events/EventAttendeesView.tsx` | Tableau de bord des participants, émargement et export CSV. |
| `src/components/admin/events/EventPitchesAdminTab.tsx`| Console de modération des pitchs entreprises. |
| `src/components/admin/events/EventMeetingsAdminTab.tsx`| Gestion des créneaux B2B et génération des QR codes pour les stands. |
| `src/components/admin/events/EventTombolaAdminTab.tsx`| Interface de gestion des lots, configuration des règles et déclenchement du tirage. |
| `src/components/admin/events/EventRegieControlTab.tsx`| Télécommande scénique avec `BroadcastChannel` et moniteur miniature 16:9. |
| `src/components/events/PublicEventRegistrationModal.tsx`| Modal d'inscription multi-étapes avec recadrage photo et consentements RGPD. |
| `src/components/events/DigitalBadgeCard.tsx` | Carte du pass numérique officiel avec QR code d'accès. |
| `src/components/events/EventNetworkingWall.tsx` | Mur interactif des décideurs émargés. |
| `src/components/events/EventPitchModal.tsx` | Modal de candidature au pitch entreprise. |
| `src/components/events/EventMeetingBookingModal.tsx` | Modal de réservation de rendez-vous B2B avec un partenaire. |
| `src/components/events/EventTombolaAnimation.tsx` | Animation scénique dorée de révélation du tirage de tombola. |

---

### B. Fichiers Backend & Contrôleurs (Node / TypeScript & PHP)

| Emplacement du fichier | Rôle technique |
| :--- | :--- |
| `server/modules/events/event.controller.ts` | Contrôleur Node.js gérant l'ensemble des actions de `/api/event_engine.php` et `/api-public.php?action=events`. |
| `server/modules/events/event.service.ts` | Logique métier complète : calculs CSPRNG, hash SHA-256, déduplication CRM, synchronisation agenda. |
| `server/shared/middleware/auth.middleware.ts` | Middleware d'authentification API (cause du rejet 401 sur les routes admin non pourvues de Bearer JWT). |
| `public/api/event_engine.php` | Contrôleur PHP MySQL équivalent pour les environnements LAMP/OVH de production. |
| `migrations_event_engine_2026.sql` | Script SQL d'application des tables MySQL avec contraintes d'intégrité et clés étrangères. |

---

## 2. INVENTAIRE DES ACTIONS DE L'API CENTRALISÉE (`/api/event_engine.php`)

| Méthode | Action (`?action=...`) | Rôle métier | Authentification requise | Statut Test Réel |
| :---: | :--- | :--- | :---: | :---: |
| `GET` | `get_event` | Récupère la fiche événement, son programme et ses champs custom. | Public | **200 OK** |
| `GET` | `get_custom_fields` | Récupère la liste des questions configurées pour le formulaire. | Public | **200 OK** |
| `POST` | `save_custom_field` | Enregistre ou modifie une question personnalisée. | Admin | **401 UNAUTHORIZED** |
| `POST` | `delete_custom_field` | Supprime une question du formulaire d'inscription. | Admin | **401 UNAUTHORIZED** |
| `POST` | `register` | Traite l'inscription publique, génère le code ticket et lie au CRM. | Public | **200 OK** |
| `GET` | `get_attendees` | Liste les participants inscrits avec leurs statuts d'émargement. | Admin | **401 UNAUTHORIZED** |
| `POST` | `check_in` | Valide l'arrivée d'un participant à l'accueil (scan / 1-clic). | Admin | **401 UNAUTHORIZED** |
| `GET` | `get_pitches` | Récupère les pitchs entreprises (filtrables par statut). | Public | **200 OK** |
| `POST` | `submit_pitch` | Enregistre une candidature publique de pitch. | Public | **200 OK** |
| `POST` | `moderate_pitch` | Valide ou refuse un pitch avec attribution de l'heure de passage. | Admin | **401 UNAUTHORIZED** |
| `GET` | `get_meeting_slots` | Liste les créneaux B2B partenaires (libres ou réservés). | Public | **200 OK** |
| `POST` | `create_meeting_slot` | Crée un nouveau créneau de rendez-vous pour un stand partenaire. | Admin | **401 UNAUTHORIZED** |
| `POST` | `book_meeting` | Réserve un créneau 1-to-1 et l'insère dans `appointments`. | Public | **200 OK** |
| `GET` | `get_tombola_config` | Renvoie les règles de tombola, la liste des lots et gagnants. | Public | **200 OK** |
| `POST` | `save_tombola_prize` | Ajoute ou met à jour un lot de tombola. | Admin | **401 UNAUTHORIZED** |
| `POST` | `execute_tombola_draw` | Déclenche le tirage CSPRNG côté serveur et calcule le hash SHA-256. | Admin | **401 UNAUTHORIZED** |
| `GET` | `get_tombola_history` | Renvoie le registre d'audit des tirages effectués. | Public | **200 OK** |
| `GET` | `get_networking_wall` | Annuaire des participants ayant activé l'option networking. | Public | **200 OK** |
| `GET` | `get_live_state` | État en temps réel de la scène diffusée et du ticker d'alerte. | Public | **200 OK** |
| `POST` | `update_live_state` | Télécommande de régie : change la scène active ou le message ticker. | Admin | **401 UNAUTHORIZED** |

---

## 3. INVENTAIRE DE LA BASE DE DONNÉES & SCHÉMA RÉEL

### Tableau de Correspondance des Noms de Tables

| Nom erroné dans le Manuel | Nom réel dans le Code / SQL | Type de stockage réel | Commentaire technique |
| :--- | :--- | :--- | :--- |
| `event_features` | `events.features_config` | Colonne `JSON` dans `events` | Il n'y a pas de table séparée ; les modules actifs sont sérialisés dans la table `events`. |
| `event_registrations` | `event_attendees` | Table SQL / Collection JSON | La table réelle des participants et billets est `event_attendees`. |
| `event_tombola_lots` | `event_tombola_prizes` | Table SQL / Collection JSON | La table réelle des lots mis en jeu est `event_tombola_prizes`. |
| `event_live_state` | `event_live_states` | Table SQL / Collection JSON | Stocke l'état instantané de la scène active et du ticker. |

### Schéma Réel des Tables du Moteur :
1. **`events`** :
   - `id` (PK, INT)
   - `title`, `title_en` (VARCHAR)
   - `date` (DATETIME)
   - `location` (VARCHAR)
   - `price` (VARCHAR)
   - `billetterie_url` (VARCHAR)
   - `max_attendees` (INT)
   - `features_config` (JSON) : Catalogue des modules activés avec leurs réglages.
   - `program` (JSON) : Déroulé chronologique par journée et créneau horaire.
2. **`event_custom_fields`** :
   - `id` (PK, INT), `event_id` (FK)
   - `field_key`, `label`, `description`, `field_type`, `is_required`, `options`, `sort_order`
3. **`event_attendees`** :
   - `id` (PK, INT), `event_id` (FK), `client_id` (FK nullable vers `clients`)
   - `first_name`, `last_name`, `email`, `phone`, `company`, `job_title`, `sector`
   - `ticket_code` (VARCHAR UNIQUE, ex: `EVT-1-CCQOVJ`)
   - `photo_url` (VARCHAR vers `/assets/uploads/`)
   - `networking_opt_in`, `photo_consent`, `gdpr_consent` (TINYINT)
   - `status` (`registered`, `confirmed`, `attended`, `cancelled`)
   - `checked_in_at` (DATETIME)
4. **`event_custom_field_answers`** :
   - `id` (PK, BIGINT), `attendee_id` (FK), `field_id` (FK), `value_text` (TEXT)
5. **`event_pitches`** :
   - `id` (PK, INT), `event_id` (FK), `attendee_id` (FK)
   - `company_name`, `project_title`, `pitch_summary`, `needs_description`, `deck_url`
   - `status` (`pending`, `approved`, `rejected`), `speaking_order`, `scheduled_time`
6. **`event_meeting_slots` & `event_meeting_bookings`** :
   - Slots : `id`, `event_id`, `partner_id`, `start_time`, `end_time`, `max_capacity`
   - Bookings : `id`, `slot_id`, `attendee_id`, `status`
7. **`event_tombola_prizes` & `event_tombola_draws`** :
   - Prizes : `id`, `event_id`, `title`, `description`, `sponsor`, `winners_count`, `drawn_count`
   - Draws : `id`, `event_id`, `prize_id`, `winner_attendee_id`, `draw_hash` (SHA-256), `drawn_at`
8. **`event_live_states`** :
   - `event_id` (PK), `current_scene`, `is_auto_mode`, `auto_interval_seconds`, `ticker_message`, `ticker_enabled`

