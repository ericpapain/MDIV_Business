# Guide d'Activation Google OAuth 2.0 pour IT4WORK / MDIV Business

Ce guide vous accompagne pas à pas pour activer la connexion avec le bouton Google existant en moins de 3 minutes.

---

## 1. Accéder à Google Cloud Console

1. Rendez-vous sur la console Google Cloud : **[https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)**
2. Connectez-vous avec votre compte Google (ou compte Google Workspace).
3. En haut à gauche, sélectionnez ou créez un projet (ex: `IT4WORK-Business` ou `MDIV-Business`).

---

## 2. Configurer l'Écran de Consentement OAuth

Si ce n'est pas déjà fait sur votre projet Google Cloud :
1. Dans le menu de gauche, cliquez sur **Écran de consentement OAuth** (*OAuth consent screen*).
2. Choisissez le type d'utilisateur : **Externe** (ou *Interne* si réservé à votre organisation Workspace).
3. Cliquez sur **Créer**.
4. Remplissez les champs requis :
   - **Nom de l'application** : `IT4WORK` (ou `MDIV Business`)
   - **Adresse email d'assistance utilisateur** : votre adresse email (ex: `contact@mdiv-business.fr` ou votre Gmail)
   - **Coordonnées du développeur** : votre adresse email
5. Cliquez sur **Enregistrer et continuer**.
6. **Champs d'application (Scopes)** :
   - Cliquez sur **Ajouter ou supprimer des champs d'application**.
   - Cochez les 3 scopes standards :
     - `.../auth/userinfo.email` (Voir l'adresse email principale)
     - `.../auth/userinfo.profile` (Voir les informations personnelles du profil)
     - `openid` (Associer à votre compte Google)
   - Cliquez sur **Mettre à jour** puis **Enregistrer et continuer**.
7. En mode Test, ajoutez votre propre adresse Gmail dans **Utilisateurs tests** afin de pouvoir tester immédiatement.

---

## 3. Créer les Identifiants OAuth 2.0 (Web)

1. Dans le menu de gauche, cliquez sur **Identifiants** (*Credentials*).
2. Cliquez sur **+ CRÉER DES IDENTIFIANTS** en haut, puis choisissez **ID client OAuth**.
3. Dans **Type d'application**, choisissez : **Application Web**.
4. **Nom** : `IT4WORK Web Client`

### Origines JavaScript autorisées (URIs d'origine) :
Ajoutez les URLs d'où l'application peut appeler Google :
- `http://localhost:8080` *(développement local)*
- `http://localhost:5173` *(si port standard Vite)*
- `https://mdiv-business.fr` *(production)*
- `https://www.mdiv-business.fr` *(production)*

### URI de redirection autorisés :
- `http://localhost:8080/login`
- `https://mdiv-business.fr/login`
- `https://www.mdiv-business.fr/login`

5. Cliquez sur **CRÉER**.
6. Une modale s'affiche avec votre **ID client** (se terminant par `.apps.googleusercontent.com`) et votre **Code secret du client**.

---

## 4. Coller les Clés dans votre fichier `.env`

Ouvrez le fichier `.env` à la racine du projet et collez vos clés :

```env
# Configuration Google OAuth 2.0
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=http://localhost:8080/login
```

> **Astuce** : `VITE_GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_ID` ont la même valeur (votre Client ID Google). Le préfixe `VITE_` permet à Vite d'injecter la clé de manière sécurisée côté frontend.

---

## 5. Fonctionnement Architectural & Sécurité

1. **Expérience Utilisateur 100% native** :
   - Le bouton existant conserve l'intégralité de son design, ses classes CSS Tailwind et son SVG officiel.
   - Au clic, Google ouvre la fenêtre native de sélection de compte (`select_account`).
   - L'utilisateur choisit son compte Gmail / Google Workspace.

2. **Validation côté Backend (Zéro confiance client)** :
   - Le jeton reçu est transmis à `/api/auth/google_auth.php`.
   - Le backend interroge directement l'API officielle Google `https://www.googleapis.com/oauth2/v3/userinfo` avec le jeton d'accès.
   - Les données certifiées (`google_id`, `email`, `nom`, `prénom`, `avatar_url`) sont extraites.

3. **Fusion & Liaison de compte automatique (Account Linking)** :
   - Si un compte existe déjà avec cette adresse email (créé par email/mot de passe classique), le compte Google lui est automatiquement lié sans créer de doublon. L'utilisateur peut indifféremment se connecter par mot de passe ou via Google !
   - Si l'utilisateur n'a pas encore de compte, le backend crée automatiquement l'Entreprise et le profil Dirigeant (ADMIN).
   - Une session JWT officielle est émise et l'utilisateur est redirigé vers son Dashboard.

4. **Compatibilité Double Environnement** :
   - **Local** (`npm run dev`) : intercepté et géré via `vite-dev-api.ts` et `dev_db.json`.
   - **Production OVH** : exécuté par `public/api/auth/google_auth.php` et la base MySQL.
