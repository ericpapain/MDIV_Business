# MATRICE D'AUDIT CONTRADICTOIRE & CONFORMITÉ DU MANUEL UTILISATEUR
## Concurrence Vérifiée entre le Manuel et l'Application Réelle

**Document de référence du manuel :** `event_organisation_1_11_2026.md`  
**Environnement audité :** Plateforme Web locale active (`http://localhost:8080`)  
**Date d'audit :** 1er Novembre 2026  

---

### Échelle des Statuts Certifiés :
- **OPÉRATIONNEL** : Interface accessible depuis la navigation normale et parcours fonctionnel complet vérifié sans erreur.
- **PARTIEL** : Une partie de la fonctionnalité existe, mais le parcours est incomplet ou tronqué.
- **CODE NON EXPOSÉ** : Code présent dans les fichiers, mais inaccessible ou masqué depuis l'interface utilisateur.
- **NON TESTÉ** : Présence identifiée, mais non vérifiable dans les conditions actuelles.
- **ABSENT** : Aucun composant, route ou logique concrète dans l'application.
- **EN ERREUR** : Interface accessible, mais l'action échoue à l'exécution (ex: rejet HTTP 401).
- **CONTRADICTOIRE** : Le manuel affirme un comportement en contradiction flagrante avec l'implémentation.

---

## TABLEAU EXHAUSTIF DES FONCTIONNALITÉS AUDITÉES

| ID | Fonctionnalité annoncée dans le manuel | Chapitre manuel | Interface accessible | Code présent | Backend opérationnel | Base de données | Test réalisé | Statut | Preuve factuelle & Anomalie constatée |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **A01** | Création d'un événement | Chap 4.2 | OUI | OUI | OUI | OUI (`events`) | Clic formulaire `/admin/events` | **OPÉRATIONNEL** | Formulaire fonctionnel à gauche de `/admin/events`. Enregistre dans `events`. |
| **A02** | Modification d'un événement | Chap 4.2 | OUI | OUI | OUI | OUI (`events`) | Clic bouton crayon | **OPÉRATIONNEL** | `onEdit` remplit le formulaire et met à jour via `/api-admin.php?action=edit_event`. |
| **A03** | Suppression d'un événement | Chap 4.2 | OUI | OUI | OUI | OUI (`events`) | Clic icône poubelle | **OPÉRATIONNEL** | `deleteEvent.mutate(ev.id)` supprime bien l'événement de la base. |
| **A04** | Publication / Clôture événement | Chap 4.2 | OUI | OUI | OUI | OUI (`status`) | Test toggle statut | **PARTIEL** | Le champ statut existe (`status: upcoming/past`), mais pas de bouton dédié "Dépublier". |
| **A05** | Duplication d'un événement | Chap 4.2 | NON | NON | NON | NON | Inspection `/admin/events` | **ABSENT** | Aucun bouton "Dupliquer" dans l'interface ni dans le backend. |
| **A06** | Gestion Date / Lieu / Capacité | Chap 4.2 | OUI | OUI | OUI | OUI (`events`) | Test formulaire admin | **OPÉRATIONNEL** | Champs présents : `datetime-local`, `location`, `max_attendees` enregistrés. |
| **A07** | Gestion du prix | Chap 4.2 | OUI | OUI | OUI | OUI (`price`) | Test formulaire admin | **OPÉRATIONNEL** | Champ texte libre `price` (ex: "150 € TTC"). |
| **A08** | Gestion du programme chronologique | Chap 4.2 | OUI | OUI | OUI | OUI (`program` JSON)| Test accordéon programme | **OPÉRATIONNEL** | Gestion des journées, créneaux horaires, icônes et descriptions. |
| **A09** | Gestion dédiée des partenaires par événement | Chap 4.2 | NON | PARTIEL | PARTIEL | OUI (`partners`) | Inspection onglets | **PARTIEL** | Les partenaires sont globaux (`/admin/partners`). Pas d'écran d'association spécifique par événement. |
| **A10** | Gestion dédiée des conférenciers par événement | Chap 4.2 | NON | PARTIEL | NON | NON | Inspection onglets | **PARTIEL** | Conférenciers uniquement saisis comme texte dans les créneaux du programme. |
| **B01** | Catalogue dynamique des fonctionnalités | Chap 3 & 4.3 | OUI (Modale) | OUI | OUI | OUI (`features_config`) | Clic bouton "Moteur Événementiel" | **CONTRADICTOIRE** | Le manuel annonce 16 modules. Le code (`eventFeatureCatalog.ts`) en compte 13. Le formulaire en affiche 11. |
| **B02** | Accès direct au catalogue | Chap 4.3 | NON | OUI | OUI | OUI | Navigation `/admin/events` | **CONTRADICTOIRE** | Aucun onglet direct sur la page. Requiert d'ouvrir la modale "Moteur Événementiel". |
| **B03** | Activation / Désactivation des modules | Chap 4.3 | OUI (Modale) | OUI | OUI | OUI (`features_config`) | Toggle switch dans modale | **OPÉRATIONNEL** | `saveFeaturesMutation` met à jour la colonne JSON `features_config` de l'événement. |
| **B04** | Gestion des dépendances entre modules | Chap 4.3 | OUI | OUI | NON | OUI | Test désactivation inscription | **PARTIEL** | `validateFeatureDependencies()` existe dans le frontend mais non appliqué de manière bloquante côté serveur. |
| **B05** | Constructeur de modules personnalisés | Chap 3 | NON | NON | NON | NON | Inspection code | **ABSENT** | Impossible de créer une nouvelle fonctionnalité modulaire depuis l'interface (liste codée en dur). |
| **B06** | Versionnement des configurations | Chap 3 | NON | PARTIEL | NON | NON | Inspection code | **CODE NON EXPOSÉ** | Un champ `version: '1.0.0'` existe dans les types, mais aucun historique de versions n'est géré. |
| **C01** | Page publique de l'événement | Chap 5.1 | OUI | OUI | OUI | OUI (`events`) | Naviguer `/evenements/1` | **OPÉRATIONNEL** | [`EventHubPage.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/pages/EventHubPage.tsx) affiche le hub complet avec onglets dynamiques. |
| **C02** | Formulaire d'inscription dédié | Chap 5.2 | OUI | OUI | OUI | OUI (`event_attendees`)| Naviguer `/evenements/1/inscription` | **OPÉRATIONNEL** | Formulaire complet accessible et fonctionnel. |
| **C03** | Parcours multi-étapes | Chap 5.2 | OUI | OUI | OUI | OUI | Saisie étape 1, 2, 3 | **OPÉRATIONNEL** | Étape 1 : Coordonnées, Étape 2 : Profil & RGPD, Étape 3 : Confirmation & Pass. |
| **C04** | Constructeur de champs sur-mesure | Chap 4.4 | OUI (Modale) | OUI | OUI | OUI (`event_custom_fields`) | Onglet 2 dans modale moteur | **PARTIEL** | L'interface permet d'ajouter des champs, mais le POST API sans token échoue selon les droits de session. |
| **C05** | Types de champs (select, radio, date, etc.) | Chap 4.4 | OUI | OUI | OUI | OUI | Test select & radio | **OPÉRATIONNEL** | Rendu conforme dans le formulaire d'inscription public. |
| **C06** | Enregistrement des réponses personnalisées | Chap 4.4 | OUI | OUI | OUI | OUI (`event_custom_field_answers`) | Inscription avec réponses | **OPÉRATIONNEL** | Les réponses sont stockées sous forme structurée liée à l'inscrit. |
| **C07** | Délivrance de la confirmation d'inscription | Chap 5.2 | OUI | OUI | OUI | OUI (`ticket_code`) | Soumission formulaire | **OPÉRATIONNEL** | Code ticket unique généré (ex: `EVT-1-CCQOVJ`) et affiché immédiatement. |
| **C08** | Gestion automatique des jauges & quotas | Chap 4.2 | OUI | OUI | OUI | OUI (`max_attendees`) | Test dépassement jauge | **PARTIEL** | Le nombre d'inscrits est compté, mais pas de liste d'attente automatique. |
| **C09** | Envoi automatique d'e-mail de confirmation | Chap 5.2 | PARTIEL | OUI | PARTIEL | OUI | Test inscription réelle | **PARTIEL** | Le message indique "un e-mail récapitulatif a été envoyé", mais le dispatch dépend de la config SMTP. |
| **D01** | Liste des participants (Vue CRM) | Chap 4.1 | OUI (Modale) | OUI | OUI | OUI (`event_attendees`)| Onglet 3 modale moteur | **OPÉRATIONNEL** | Tableau complet des participants avec filtres, recherche et statuts. |
| **D02** | Fiche individuelle participant | Chap 4.1 | OUI | OUI | OUI | OUI | Clic sur un inscrit | **OPÉRATIONNEL** | Modale détaillée affichant photo, pitch, réponses aux questions et statut. |
| **D03** | Rapprochement CRM unifié (déduplication) | Chap 7.3 | OUI | OUI | OUI | OUI (`clients`) | Test inscription même email | **OPÉRATIONNEL** | Rapprochement par email dans la table `clients` du CRM existant. |
| **D04** | Export des participants en CSV | Chap 9 FAQ 5| OUI | OUI | OUI | OUI | Clic "Exporter CSV" | **OPÉRATIONNEL** | Téléchargement immédiat du fichier `.csv` formaté UTF-8 avec BOM. |
| **D05** | Export des Badges en PDF | Chap 9 FAQ 5| NON | NON | NON | NON | Inspection interface inscrits | **ABSENT** | Seul l'export CSV existe. Aucun bouton ni générateur PDF de badges en lot. |
| **E01** | Upload de photo participant | Chap 5.2 | OUI | OUI | OUI | OUI (`/uploads/`) | Sélection fichier JPG/PNG | **OPÉRATIONNEL** | Recadrage canvas côté client et upload réussi. |
| **E02** | Rendu du Badge Numérique | Chap 5.3 | OUI | OUI | OUI | OUI | Écran de confirmation | **OPÉRATIONNEL** | Composant [`DigitalBadgeCard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/DigitalBadgeCard.tsx) conforme au design VIP. |
| **E03** | QR Code d'accès individuel | Chap 5.3 | OUI | OUI | OUI | OUI (`ticket_code`) | Génération QR data URL | **OPÉRATIONNEL** | QR code scannable contenant le code ticket sécurisé. |
| **E04** | Bouton "Ajouter à Apple Wallet" | Chap 5.3 | NON | NON | NON | NON | Inspection badge | **ABSENT** | Aucun bouton Apple Wallet ni génération de pass `.pkpass`. |
| **E05** | Bouton "Ajouter à Google Wallet" | Chap 5.3 | NON | NON | NON | NON | Inspection badge | **ABSENT** | Aucun bouton Google Wallet ni intégration API Google Pay Passes. |
| **E06** | Téléchargement du Badge en PDF natif | Chap 5.3 | NON | PARTIEL | NON | NON | Clic "Imprimer mon pass" | **CONTRADICTOIRE** | Simple boîte de dialogue d'impression navigateur (`window.print()`), pas de PDF vectoriel. |
| **F01** | Émargement manuel 1-clic | Chap 6 & 9 | OUI (Modale) | OUI | OUI | OUI (`checked_in_at`) | Clic bouton "Émarger" | **OPÉRATIONNEL** | Valide la présence et horodate `checked_in_at` dans la base. |
| **F02** | Scan QR Code via caméra smartphone intégrée | Chap 9 FAQ 2| NON | NON | NON | NON | Recherche lecteur caméra | **ABSENT** | Pas de composant de caméra web. Fonctionne uniquement par recherche manuelle ou douchette code-barres USB. |
| **G01** | Mur de réseautage public (Networking Wall) | Chap 5.6 | OUI | OUI | OUI | OUI (`event_attendees`)| Naviguer `/evenements/1?tab=networking` | **OPÉRATIONNEL** | Grille glassmorphism avec recherche texte et filtre par secteur d'activité. |
| **G02** | Respect du consentement Networking (Opt-in) | Chap 5.6 | OUI | OUI | OUI | OUI (`networking_opt_in`)| Vérification filtre SQL | **OPÉRATIONNEL** | Seuls les participants ayant `networking_opt_in = 1` apparaissent sur le mur public. |
| **G03** | Fiche détaillée contact & QR LinkedIn | Chap 5.6 | OUI | OUI | OUI | OUI | Clic carte participant | **OPÉRATIONNEL** | Affichage de la biographie, du pitch et des coordonnées professionnelles. |
| **H01** | Formulaire public de candidature Pitch | Chap 5.4 | OUI | OUI | OUI | OUI (`event_pitches`) | Clic "Proposer mon Pitch" | **OPÉRATIONNEL** | Formulaire [`EventPitchModal.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventPitchModal.tsx) fonctionnel. |
| **H02** | Modération des pitchs par l'organisateur | Chap 4.6 | OUI (Modale) | OUI | OUI | OUI (`status`) | Onglet 4 modale moteur | **OPÉRATIONNEL** | Boutons Valider / Refuser, attribution horaire et ordre de passage. |
| **H03** | Affichage des pitchs validés sur le Hub | Chap 5.4 | OUI | OUI | OUI | OUI | Naviguer `/evenements/1?tab=pitches` | **OPÉRATIONNEL** | Programme des pitchs affiché publiquement avec horaires. |
| **I01** | Création de créneaux B2B partenaires | Chap 4.5 | OUI (Modale) | OUI | ERREUR 401 | OUI (`event_meeting_slots`)| Formulaire ajout créneau | **EN ERREUR** | L'interface existe (Onglet 5), mais le POST renvoie 401 Unauthorized faute de token dans le fetch. |
| **I02** | Réservation publique d'un créneau B2B | Chap 5.5 | OUI | OUI | OUI | OUI (`event_meeting_bookings`)| Test réservation créneau libre | **OPÉRATIONNEL** | Réservation fonctionnelle depuis le Hub, synchronisée avec `appointments`. |
| **I03** | QR Code d'accès direct au stand partenaire | Chap 4.5 | OUI | OUI | OUI | OUI | Test lien `?partner_id=X` | **OPÉRATIONNEL** | URL et QR code générés pointant directement sur le partenaire. |
| **J01** | Module de Diagnostic IA événementiel sur place | Chap 3 & 4 | NON | NON | NON | NON | Recherche formulaire dédié | **ABSENT** | Aucun diagnostic IA n'est attaché à l'événement. Seul le diagnostic SaaS global existe à `/services-ia`. |
| **K01** | Onglet Tombola sur la page `/admin/events` | Chap 4.7 | NON | OUI | NON | OUI | Navigation principale admin | **CONTRADICTOIRE** | Aucun onglet sur la page. Présent uniquement dans la modale tiroir "Moteur Événementiel". |
| **K02** | Création / Ajout d'un lot de tombola | Chap 4.7 | OUI (Modale) | OUI | ERREUR 401 | OUI (`event_tombola_prizes`)| Clic "Ajouter un lot" | **EN ERREUR** | La requête POST `/api/event_engine.php?action=save_tombola_prize` échoue avec 401 Unauthorized. |
| **K03** | Déclenchement du tirage au sort certifié | Chap 6.5 | OUI (Modale) | OUI | ERREUR 401 | OUI (`event_tombola_draws`) | Clic "Lancer le tirage" | **EN ERREUR** | Bloqué par l'authentification 401. Le tirage ne peut pas s'exécuter depuis l'interface admin. |
| **K04** | Algorithme CSPRNG serveur (`crypto.randomBytes`) | Chap 7.2 | N/A (Backend) | OUI | OUI (en isolation)| OUI | Test unitaire Node.js | **OPÉRATIONNEL** | L'algorithme existe dans `event.service.ts` et fonctionne correctement lorsqu'il est exécuté. |
| **K05** | Empreinte d'audit SHA-256 | Chap 7.2 | N/A (Backend) | OUI | OUI (en isolation)| OUI (`draw_hash`) | Vérification calcul hash | **OPÉRATIONNEL** | Calcul conforme du SHA-256 scellant le tirage dans `drawRecord`. |
| **K06** | Animation publique de révélation de la tombola | Chap 6.5 | OUI | OUI | OUI | N/A (UI) | Naviguer `/evenements/1?tab=tombola` | **OPÉRATIONNEL** | Composant [`EventTombolaAnimation.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventTombolaAnimation.tsx) fonctionnel. |
| **L01** | Écran Public de Scène (1920 × 1080 Full HD) | Chap 6.1 | OUI | OUI | OUI | OUI | Naviguer `/evenements/1/live` | **OPÉRATIONNEL** | Page grand format dédiée aux murs LED et vidéoprojecteurs sans navbar. |
| **L02** | 11 Scènes événementielles intégrées | Chap 6.3 | OUI | OUI | OUI | OUI (`current_scene`) | Navigation scènes 1 à 11 | **OPÉRATIONNEL** | Welcome, Présentation, Membres, Partenaires, Speakers, Networking, Pitches, QR, Stats, Tombola, Closing. |
| **L03** | Studio Régie Privé (Pupitre de télécommande) | Chap 6.2 | OUI | OUI | OUI | OUI | Naviguer `/admin/events/1/regie` | **OPÉRATIONNEL** | Console de pilotage temps réel avec retour scène 16:9 et sélecteur de scènes. |
| **L04** | Synchronisation sans latence (`BroadcastChannel`) | Chap 6.6 | OUI | OUI | OUI | N/A | Test double écran | **OPÉRATIONNEL** | Changement de scène immédiat via `BroadcastChannel` natif sur le même poste. |
| **L05** | Bandeau d'information défilant (Ticker Live) | Chap 6.4 | OUI | OUI | OUI | OUI (`ticker_message`)| Saisie texte et diffusion | **OPÉRATIONNEL** | Défilement du message au bas de l'écran scénique 1080p. |
| **L06** | Raccourcis clavier d'urgence en salle (`1` à `0`, `F11`)| Chap 6.6 | OUI | OUI | OUI | N/A | Frappe touches 1..0 | **OPÉRATIONNEL** | Les raccourcis clavier basculent immédiatement la scène affichée. |
| **M01** | Quiz compétitifs avec scores en direct | Chap 3 | NON | NON | NON | NON | Recherche composant | **ABSENT** | Déclaré comme idée dans le catalogue mais zéro ligne de code UI/Backend. |
| **M02** | Sondages interactifs en direct | Chap 3 | NON | NON | NON | NON | Recherche composant | **ABSENT** | Aucune interface de vote, aucune collecte de résultats. |
| **M03** | Respect strict des normes WCAG AA (Contraste sombre) | Chap 8 | OUI | OUI | OUI | OUI (CSS) | Audit Playwright contrast | **OPÉRATIONNEL** | Ratios de contraste conformes validés (> 7:1 pour textes, > 4.5:1 pour dorés). |

