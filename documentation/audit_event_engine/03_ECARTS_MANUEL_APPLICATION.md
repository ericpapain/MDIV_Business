# INVENTAIRE DÉTAILLÉ DES ÉCARTS ENTRE LE MANUEL ET L'APPLICATION RÉELLE
## Analyse Contradictoire, Gravité des Écarts et Justifications Techniques

**Document audité :** `event_organisation_1_11_2026.md`  
**Environnement :** MDIV Business / Network (Branche `event_subscribe`)  
**Date d'audit :** 1er Novembre 2026  

---

## 1. TABLEAU SYNTHÉTIQUE DES ÉCARTS PAR ORDRE DE GRAVITÉ

| N° | Sujet / Fonctionnalité | Affirmation dans le manuel | Constat dans l'application réelle | Gravité | Impact Utilisateur |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **01** | **Authentification API Admin (Tombola & B2B)** | *"Ajoutez des lots... lancez le tirage au sort certifié d'un clic depuis la régie."* | Les requêtes POST de gestion admin échouent avec une erreur HTTP **401 UNAUTHORIZED**. | 🔴 **CRITIQUE** | L'administrateur ne peut ni créer de lot de tombola, ni lancer de tirage, ni ajouter de créneau B2B. |
| **02** | **Emplacement des Outils d'Administration** | *"Rendez-vous dans l'onglet Tombola Officielle... Accédez à l'onglet Rendez-vous B2B..."* | Aucun onglet Tombola, B2B, Pitch ou Questions n'existe sur la page `/admin/events`. Ils sont isolés dans une modale tiroir accessible via un bouton secondaire. | 🔴 **CRITIQUE** | L'utilisateur est désorienté et pense à juste titre que les fonctionnalités sont totalement absentes. |
| **03** | **Apple Wallet & Google Wallet** | *"Boutons dédiés : « Ajouter à Apple Wallet / Google Wallet »"* | **Totalement inexistant.** Aucun composant, aucun service PassKit Apple, aucune API Google Wallet Pass. | 🔴 **MAJEUR** | Promesse non tenue, fonctionnalité fantôme. |
| **04** | **Exportation des Badges en PDF** | *"cliquez sur le bouton « Exporter Badges PDF »"* | **Totalement inexistant.** Seul un export CSV des inscrits est codé. Aucun générateur PDF de badges en lot n'existe. | 🔴 **MAJEUR** | L'organisateur ne peut pas imprimer les badges en planche PDF. |
| **05** | **Nombre et Identifiants des Modules du Catalogue** | *"Le catalogue centralise 16 briques modulaires : registration, photo_upload, participant_profile, etc."* | Le catalogue (`eventFeatureCatalog.ts`) ne comporte que **13 modules** avec des IDs différents (`online_registration`, `pitch_directory`, etc.). Le formulaire en affiche **11**. | 🟠 **ÉLEVÉ** | Documentation discordante avec le code et la console d'administration. |
| **06** | **Quiz Compétitifs & Sondages en Direct** | *"Quiz et sondages interactifs avec vote en direct pour l'auditoire."* | **Inexistant au niveau UI.** Déclaré comme simple constante textuelle dans le catalogue, mais aucun écran de vote, de question ou de score. | 🟠 **ÉLEVÉ** | L'organisateur tente d'animer un quiz qui n'a pas d'interface. |
| **07** | **Diagnostic Professionnel / Audit IA Événementiel** | *"Bilan d'alignement stratégique et maturité IA réalisé sur place."* | Le diagnostic IA n'est pas intégré à l'événement. C'est un module SaaS séparé situé dans `/services-ia`. | 🟠 **ÉLEVÉ** | Confusion entre le SaaS B2B général et le module événementiel. |
| **08** | **Nommage des Tables SQL & Architecture de Données** | *"Tables : `event_features`, `event_registrations`, `event_tombola_lots`..."* | Les tables réelles sont `event_attendees`, `event_tombola_prizes`, et la configuration modulaire est une colonne JSON `features_config` dans `events`. | 🟡 **MOYEN** | Documentation technique trompeuse pour les développeurs et administrateurs de bases de données. |
| **09** | **Scan QR Code par Caméra Embarquée** | *"utiliser un smartphone pour scanner le QR code de son badge numérique"* | Aucune bibliothèque de capture vidéo (type `html5-qrcode` ou `@zxing`) n'est installée. Seule une saisie de code ticket ou douchette USB fonctionne. | 🟡 **MOYEN** | Nécessite une douchette filaire/bluetooth ou une saisie manuelle. |
| **10** | **Téléchargement du Badge en PDF Individuel** | *"Télécharger le Badge (PDF/Image)"* | Le bouton télécharge uniquement l'image PNG du QR code. L'impression du badge passe par la boîte de dialogue système `window.print()`. | 🟢 **MINEUR** | Différence de format (print HTML vs fichier PDF autonome). |

---

## 2. ANALYSE DÉTAILLÉE DES ÉCARTS MAJEURS

### Écart n°1 : Le Verrouillage 401 Unauthorized sur les Requêtes Admin

#### Texte du Manuel :
> *« Dans le pupitre régie, cliquez sur le bouton doré Lancer le Tirage au Sort Sécurisé... Le serveur interroge la liste des participants éligibles, le générateur CSPRNG désigne le gagnant, le serveur enregistre le résultat en base. »* (Manuel, Section 6.5)

#### Réalité Constatée :
Dans `server/shared/middleware/auth.middleware.ts`, les routes publiques autorisées sont expressément listées :
```ts
const publicActions = [
  'register', 'get_event', 'get_custom_fields', 'get_networking_wall',
  'get_meeting_slots', 'book_meeting', 'cancel_meeting', 'submit_pitch',
  'get_pitches', 'get_tombola_history', 'get_tombola_config', 'get_live_state'
];
```
Toute action ne figurant pas dans cette liste (notamment `save_tombola_prize`, `execute_tombola_draw`, `create_meeting_slot`, `check_in`) exige un en-tête `Authorization: Bearer <mdiv_token>`.
Or, dans les composants React de l'espace administration ([`EventTombolaAdminTab.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventTombolaAdminTab.tsx#L69-L71)), les requêtes sont envoyées de manière standard :
```tsx
const res = await fetch('/api/event_engine.php?action=save_tombola_prize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```
Sans jeton Bearer dans l'en-tête, le serveur répond systématiquement :
```json
{
  "success": false,
  "authenticated": false,
  "error": "Authentification requise. Veuillez vous connecter pour accéder à cette ressource ou fonctionnalité.",
  "code": "UNAUTHORIZED"
}
```
**Conséquence directe :** L'interface affiche un chargement infini ou une alerte toast d'échec. L'administrateur ne peut ajouter aucun lot ni lancer aucun tirage.

---

### Écart n°2 : L'Incohérence Structurelle d'Accès à l'Administration

#### Texte du Manuel :
> *« 4.5 Configuration des Rendez-vous B2B : Accédez à l'onglet Rendez-vous B2B. »*  
> *« 4.6 Configuration des Sessions Pitchs : Rendez-vous dans l'onglet Pitchs Entreprises. »*  
> *« 4.7 Paramétrage de la Tombola : Rendez-vous dans l'onglet Tombola Officielle. »* (Manuel, Sections 4.5 à 4.7)

#### Réalité Constatée :
Sur la page `/admin/events`, l'écran est structuré en 2 zones :
1. À gauche : Un formulaire unique pour créer/modifier un événement comportant uniquement 2 onglets : `1. Infos` et `2. Modules (11)`.
2. À droite : La liste des événements existants.
Pour accéder aux fameux onglets (Tombola, B2B, Pitchs, Inscrits, Champs, Régie), l'administrateur **doit obligatoirement :**
1. Repérer sur la carte de l'événement à droite un bouton secondaire avec une icône d'engrenage intitulé **« Moteur Événementiel »**.
2. Cliquer sur ce bouton pour ouvrir un grand tiroir modal noir plein écran.
3. Découvrir alors la barre de 8 onglets internes de l'événement sélectionné.

Si l'administrateur clique sur le bouton **Modifier** (icône crayon), le tiroir modal ne s'ouvre **jamais** ; l'application charge simplement les données dans le formulaire de gauche, sans aucun accès à la Tombola ou aux Rendez-vous B2B.

---

### Écart n°3 : Les 16 Modules Fantômes vs 13 Modules Réels

#### Texte du Manuel :
Le manuel liste 16 modules avec une nomenclature inventée :
- `registration`, `custom_fields`, `photo_upload`, `participant_profile`, `digital_badge`, `networking_wall`, `company_pitch`, `b2b_booking`, `tombola_draw`, `quiz_survey`, `ai_diagnostic`, `dynamic_schedule`, `speakers`, `partners_sponsors`, `live_stage_screen`, `event_regie_studio`.

#### Réalité Constatée :
Le catalogue officiel du projet (`src/lib/eventFeatureCatalog.ts`) déclare **13 modules** :
1. `online_registration`
2. `custom_fields`
3. `networking_wall`
4. `pitch_directory`
5. `b2b_meetings`
6. `dynamic_program`
7. `partners_showcase`
8. `event_tombola`
9. `gamification`
10. `pro_diagnostic`
11. `digital_badge`
12. `live_screen`
13. `crm_auto_sync`

Dans ce catalogue :
- L'upload de photo n'est pas un module séparé : c'est un champ standard du formulaire d'inscription.
- Le profil participant n'est pas un module séparé : il fait corps avec le mur de réseautage.
- L'écran live et la régie sont regroupés sous l'unique module `live_screen`.
- Et dans le formulaire de création à gauche, le badge indique `2. Modules (11)` car 2 modules sont désactivés par défaut.

---

### Écart n°4 : Les Fonctionnalités Énoncées Sans Aucun Code Support

1. **Apple Wallet / Google Wallet :**
   Le manuel affirme qu'un bouton « Ajouter à Apple Wallet / Google Wallet » est présent sur le badge numérique. Dans le code ([`DigitalBadgeCard.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/events/DigitalBadgeCard.tsx)), aucun bouton ni service de ce type n'existe.
2. **Export Badges PDF :**
   Le manuel affirme que l'organisateur peut exporter les badges en PDF en un clic. Seul l'export CSV existe dans [`EventAttendeesView.tsx`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/admin/events/EventAttendeesView.tsx#L77-L112).
3. **Quiz & Sondages (Gamification) :**
   Le manuel présente une animation de salle avec scores en direct. Aucun composant d'affichage de questions, aucun vote en direct, aucune interface de scoring n'a été développée.
4. **Diagnostic IA sur place :**
   Le manuel annonce un diagnostic d'évaluation sur place. Ce module n'a jamais été raccordé aux événements : il s'agit du diagnostic SaaS accessible sur `/services-ia/diagnostic`.

---

### Écart n°5 : Dénomination Fictive des Tables dans le Schéma de Base

#### Texte du Manuel (Section 7.1) :
Le manuel présente un schéma relationnel avec les tables suivantes :
- `event_features`
- `event_registrations`
- `event_tombola_lots`

#### Réalité Constatée dans la Base de Données :
En vérifiant `migrations_event_engine_2026.sql` et `dev_db.json` :
1. `event_features` **N'EXISTE PAS** : La configuration des modules est stockée au format JSON dans la colonne `features_config` de la table `events`.
2. `event_registrations` **N'EXISTE PAS** : La table réelle des participants se nomme **`event_attendees`**.
3. `event_tombola_lots` **N'EXISTE PAS** : La table réelle des lots se nomme **`event_tombola_prizes`**.
4. La table d'état de régie se nomme **`event_live_states`** (au pluriel) dans le schéma JSON local.

