# PLAN DE CORRECTION DOCUMENTAIRE DU MANUEL MDIV EVENT ENGINE
## Feuille de Route pour l'Alignement Strict du Manuel sur l'Application Réelle

**Document cible :** `event_organisation_1_11_2026.md`  
**Date d'audit :** 1er Novembre 2026  
**Règle :** Aucune modification de code n'est effectuée durant cet audit. Ce document définit les actions éditoriales nécessaires pour rendre le manuel 100% fiable, factuel et opérationnel pour un administrateur.

---

## 1. PRINCIPES DE LA RÉÉCRITURE DU MANUEL

1. **Supprimer toute promesse fictive :** Ne mentionner que les fonctionnalités dont l'interface et le parcours sont réellement utilisables ou explicitement indiqués comme partiels.
2. **Corriger la navigation administrateur :** Expliquer clairement le parcours physique dans l'écran :
   - Expliquer que la création/modification standard se fait dans la colonne de gauche.
   - Expliquer explicitement que pour accéder aux réglages fins (Champs sur-mesure, Inscrits, Pitchs, B2B, Tombola, Régie), l'administrateur **doit cliquer sur le bouton doré « Moteur Événementiel » sur la carte de l'événement**.
3. **Mettre à jour le catalogue modulaire :** Remplacer la liste fictive de 16 modules par les **13 modules réels** de `eventFeatureCatalog.ts`, avec leurs identifiants techniques exacts.
4. **Clarifier le statut des fonctionnalités dépendantes de l'authentification :** Documenter l'état actuel de la Tombola et des Rendez-vous B2B (interface présente, mais requiert la synchronisation du jeton d'authentification API pour l'enregistrement).

---

## 2. DÉTAIL DES ACTIONS PAR CATÉGORIE

### A. Fonctionnalités à Conserver dans le Manuel (Opérationnelles & Vérifiées)

Ces fonctionnalités ont été testées et fonctionnent de bout en bout :
1. **Création, modification et suppression des événements** depuis `/admin/events`.
2. **Programme chronologique dynamique** (définition des journées, horaires, types d'activités et icônes).
3. **Hub Public Événementiel** (`/evenements/:id`) avec onglets interactifs.
4. **Tunnel d'inscription publique** (`/evenements/:id/inscription`) :
   - Étape 1 : Coordonnées et upload photo avec prévisualisation.
   - Étape 2 : Réponse aux questions personnalisées et cases à cocher RGPD.
   - Étape 3 : Confirmation immédiate avec numéro de billet unique (`EVT-...`).
5. **Badge Numérique Dématérialisé** ([`DigitalBadgeCard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/DigitalBadgeCard.tsx)) avec affichage haute définition et QR Code d'accès.
6. **Bouton d'impression du pass** (`window.print()`) et téléchargement du QR Code en image PNG.
7. **Mur de réseautage public (Networking Wall)** (`/evenements/:id?tab=networking`) avec filtrage par secteur d'activité et respect strict du consentement opt-in.
8. **Candidature aux pitchs entreprises** ([`EventPitchModal.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/EventPitchModal.tsx)) et modération administrateur.
9. **Réservation publique d'un créneau 1-to-1** avec un partenaire depuis le Hub public.
10. **Écran public de diffusion scénique 1080p** (`/evenements/:id/live`) avec ses **11 scènes réelles** et son bandeau ticker défilant.
11. **Pupitre régie privée** (`/admin/events/:id/regie`) avec retour miniature 16:9 et télécommande par `BroadcastChannel`.
12. **Raccourcis clavier d'urgence en régie** (`1` à `0`, `F11`).
13. **Export CSV complet des inscrits** depuis le tableau de bord CRM des participants.
14. **Conformité des contrastes sombres WCAG AA** sur l'ensemble des formulaires et cases à cocher.

---

### B. Fonctionnalités à Reformuler comme Partielles ou Conditionnelles

Ces fonctionnalités existent dans le code mais ont des limitations opérationnelles :
1. **Tombola & Tirage au sort :**
   - *Reformulation :* Préciser que l'algorithme cryptographique CSPRNG et le scellement SHA-256 sont codés côté serveur, mais que l'enregistrement de nouveaux lots et le déclenchement du tirage depuis l'interface nécessitent une session API authentifiée (en cours de fiabilisation).
   - L'animation de suspense dorée grand format est opérationnelle.
2. **Création de créneaux B2B partenaires :**
   - *Reformulation :* Préciser que la consultation et la réservation publique fonctionnent, mais que l'ajout de créneaux côté administration est soumis aux mêmes règles d'authentification API.
3. **Constructeur de champs sur-mesure :**
   - *Reformulation :* Le rendu des questions dynamiques (texte, menu déroulant, case unique, nombre) dans le formulaire d'inscription est 100% opérationnel. L'ajout de nouveaux champs depuis l'interface est temporairement restreint par le middleware API.
4. **Émargement à l'accueil :**
   - *Reformulation :* Retirer la mention de "scan par smartphone caméra intégrée". Indiquer que l'émargement s'effectue soit par validation manuelle 1-clic dans la liste des inscrits, soit à l'aide d'une douchette code-barres USB connectée au poste d'accueil.
5. **Gestion des partenaires et conférenciers :**
   - *Reformulation :* Préciser que les partenaires sont gérés au niveau global (`/admin/partners`) et rattachés aux créneaux B2B, et que les conférenciers sont renseignés dans le programme chronologique.

---

### C. Fonctionnalités à Supprimer du Manuel (Inexistantes)

Ces éléments doivent être **purement et simplement retirés** du manuel pour éviter toute tromperie :
1. **Bouton « Ajouter à Apple Wallet »** (Aucun fichier `.pkpass`).
2. **Bouton « Ajouter à Google Wallet »** (Aucune intégration Google Pay Passes).
3. **Bouton « Exporter Badges PDF »** (Seul l'export CSV existe).
4. **Quiz compétitifs et sondages en direct avec vote de l'auditoire** (Aucune interface n'existe).
5. **Diagnostic IA sur place pour l'événement** (Module inexistant dans la suite événementielle).
6. **Bouton « Dupliquer un événement »** (Fonction non codée).
7. **Tables SQL fictives `event_features` et `event_registrations`** (Remplacer par `events.features_config` et `event_attendees`).

---

### D. Fonctionnalités à Présenter comme Évolutions Futures (Roadmap)

Ces points pourront figurer dans une section dédiée « Évolutions prévues / Roadmap v2.1 » :
1. **Génération de badges PDF vectoriels en planche A4** pour impression groupée avant l'événement.
2. **Génération de pass dématérialisés Apple Wallet (`.pkpass`) et Google Wallet**.
3. **Application de check-in mobile avec scanner caméra WebRTC** intégré pour smartphone organisateur.
4. **Module interactif de vote et sondage de salle (Live Polling)** projeté sur l'écran 1080p.
5. **Diagnostic de maturité IA embarqué directement dans le tunnel d'inscription**.

---

## 3. TABLEAU DES MODIFICATIONS CHAPITRE PAR CHAPITRE

| Chapitre du Manuel | Titre de section | Action éditoriale recommandée |
| :---: | :--- | :--- |
| **Chapitre 2** | Architecture & Schéma | Remplacer les noms de tables erronés (`event_registrations` -> `event_attendees`, `event_features` -> colonne JSON `features_config`). |
| **Chapitre 3** | Catalogue des modules | Remplacer le tableau des 16 modules par le tableau officiel des 13 modules réels (`eventFeatureCatalog.ts`). Supprimer photo_upload et profil comme modules séparés. |
| **Chapitre 4.1 & 4.2** | Accès et Création | Décrire précisément la séparation entre le formulaire de base à gauche et le tiroir modal « Moteur Événementiel » ouvert par le bouton doré. |
| **Chapitre 4.4** | Champs sur-mesure | Préciser les types de champs supportés et la méthode de rendu dans le formulaire public. |
| **Chapitre 4.5** | Rendez-vous B2B | Expliquer le rattachement aux partenaires existants et la génération des QR codes pour les stands. |
| **Chapitre 4.7** | Tombola | Décrire l'algorithme réel (CSPRNG + SHA-256) et reformuler la procédure opérationnelle. |
| **Chapitre 5.3** | Badge Numérique | Supprimer les mentions Apple Wallet, Google Wallet et téléchargement PDF natif. Conserver l'impression pass et le téléchargement PNG du QR code. |
| **Chapitre 6.3** | 11 Scènes Événementielles | Conserver l'intégralité (les 11 scènes existent réellement dans `EventLiveDisplayPage.tsx`). |
| **Chapitre 6.6** | Résilience & Raccourcis | Conserver l'explication du `BroadcastChannel`, du cache local et des touches 1 à 0. |
| **Chapitre 7.1** | Schéma Relationnel | Mettre à jour le diagramme ERD avec les véritables noms de tables et colonnes réelles. |
| **Chapitre 9** | FAQ & Dépannage | Corriger la réponse sur l'émargement (retirer le scan smartphone caméra) et la réponse sur l'export des badges (retirer la mention PDF). |

