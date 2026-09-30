# AUDIT COMPLET & GUIDE OPÉRATIONNEL DE DÉPLOIEMENT — MDIV BUSINESS

Ce document regroupe les conclusions de l'audit technique réel de MDIV Business, ainsi que le **guide pas à pas détaillé pour appliquer chacune des recommandations** avant et pendant la mise en production sur OVH.

---

## 1. Synthèse de l'Audit Réalisé

- **Compilation Production** : `npm run build` réussit avec succès (Code 0, bundle généré dans `dist/`).
- **Fournisseur IA Réel** : Groq API avec le modèle `qwen/qwen3.8-27b` (réponse en ~1.4s en JSON strict).
- **Routage** : 13 applications IA actives raccordées sans aucune redirection bloquante ni erreur console.
- **Sécurité & Secrets** : Retrait des clés et mots de passe en clair dans le code suivi par Git.
- **Base de Données** : Schéma relationnel `database.sql` complété pour les clients, devis, factures et relances.
- **OCR Documentaire** : Reconnaissance optique fonctionnelle sur photos mobiles et captures via Tesseract.js.

---

## 2. Guide d'Application Pas à Pas des Recommandations

---

### Recommandation 1 : Configuration des Variables d'Environnement sur OVH

#### Objectif :
Permettre à l'API PHP en production de communiquer avec Groq et MySQL **sans jamais écrire de clés en clair dans le code**.

#### Méthode A — Via un fichier `.env` sur le serveur (Le plus rapide) :
1. Connectez-vous à votre serveur OVH via votre client FTP (FileZilla ou Cyberduck) avec vos identifiants FTP habituels.
2. Rendez-vous dans le dossier racine de votre site (généralement `./www/` ou le répertoire parent `./`).
3. Créez un fichier nommé exactement `.env` (notez le point au début).
4. Remplissez-le avec vos identifiants réels :
   ```env
   GROQ_API_KEY=votre_vraie_cle_groq_obtenue_sur_console.groq.com
   DB_HOST=zwpvaah279.mysql.db
   DB_NAME=zwpvaah279
   DB_USER=zwpvaah279
   DB_PASS=votre_mot_de_passe_base_de_donnees
   JWT_SECRET=une_cle_secrete_aleatoire_de_plus_de_32_caracteres
   ```
5. Enregistrez et assurez-vous que les permissions du fichier sont définies sur `640` ou `600` (lecture seule pour le propriétaire).

#### Méthode B — Via l'espace client OVH (Pour mutualisé avec support SetEnv) :
1. Connectez-vous sur [l'Espace Client OVH](https://www.ovh.com/manager/).
2. Allez dans **Web Cloud** > **Hébergements** > Choisissez votre nom de domaine.
3. Dans le fichier `.htaccess` situé à la racine du dossier `www/`, vous pouvez également définir des variables Apache si supporté :
   ```apache
   SetEnv GROQ_API_KEY "votre_cle_groq"
   SetEnv DB_HOST "zwpvaah279.mysql.db"
   SetEnv DB_NAME "zwpvaah279"
   SetEnv DB_USER "zwpvaah279"
   SetEnv DB_PASS "votre_mot_de_passe"
   SetEnv JWT_SECRET "votre_jwt_secret"
   ```
*(La Méthode A avec le fichier `.env` est recommandée car elle est prise en charge nativement par le chargeur automatique de `config.php`).*

---

### Recommandation 2 : Import du Schéma MySQL dans PHPMyAdmin OVH

#### Objectif :
Créer immédiatement toutes les tables de la base de données (`companies`, `diagnostics`, `clients`, `products`, `quotes`, `invoices`, `followups`).

#### Procédure détaillée :
1. Dans l'Espace Client OVH, allez dans **Hébergements** > votre domaine > onglet **Bases de données**.
2. Cliquez sur les **trois petits points (...)** à droite de votre base `zwpvaah279` et choisissez **Accéder à phpMyAdmin**.
3. Saisissez votre nom d'utilisateur (`zwpvaah279`) et votre mot de passe de base de données.
4. Dans le menu de gauche de phpMyAdmin, cliquez sur le nom de votre base `zwpvaah279` pour la sélectionner.
5. Cliquez sur l'onglet **Importer** en haut :
   - Cliquez sur **Choisir un fichier** et sélectionnez le fichier `database.sql` situé à la racine du projet MDIV Business.
   - Laissez le jeu de caractères sur `utf-8`.
   - Cliquez sur **Exécuter** tout en bas de la page.
6. **Vérification** :
   - Vérifiez que la liste des tables à gauche affiche bien :
     - `companies`
     - `diagnostics`
     - `clients`
     - `products`
     - `quotes`
     - `invoices`
     - `followups`

---

### Recommandation 3 : Vérification du Déploiement Continu (GitHub Actions)

#### Objectif :
Garantir que chaque mise à jour poussée sur Git déploie le frontend compilé ET les dépendances PHP Composer sans action manuelle.

#### Procédure de vérification :
1. Rendez-vous sur votre dépôt GitHub : `Settings` > `Secrets and variables` > `Actions`.
2. Vérifiez que les 3 secrets suivants sont bien renseignés :
   - `FTP_SERVER` : L'adresse de votre serveur FTP OVH (ex: `ftp.cluster030.hosting.ovh.net`).
   - `FTP_USERNAME` : Votre identifiant de connexion FTP OVH.
   - `FTP_PASSWORD` : Votre mot de passe FTP OVH.
3. Le fichier de workflow `.github/workflows/deploy.yml` exécute déjà automatiquement :
   - `composer install --no-dev --optimize-autoloader` dans `public/api/`
   - `npm install` et `npm run build`
   - Le transfert de `dist/` vers `./www/` via FTP.
4. **Si vous devez faire un déploiement manuel sans GitHub Actions** :
   - N'oubliez pas de transférer le dossier `dist/` à la racine de votre site distant.
   - Transférez également le dossier `vendor/` généré par Composer dans votre dossier distant `api/vendor/`.

---

### Recommandation 4 : Gestion et Rotation des Clés API

#### Procédure :
1. Rendez-vous sur la console [Groq Cloud Console](https://console.groq.com/keys).
2. Si la clé actuelle a été partagée ou manipulée sur plusieurs postes, générez une nouvelle clé en cliquant sur **Create API Key**.
3. Donnez-lui un nom explicite (ex: `MDIV_PROD_2026`).
4. Remplacez immédiatement la valeur dans votre fichier `.env` sur le serveur.
5. Supprimez l'ancienne clé dans la console Groq pour garantir une étanchéité totale.

---

### Recommandation 5 : Optimisation des Chunks Vite (Optionnel mais Recommandé)

#### Objectif :
Éviter l'avertissement de taille de chunk supérieure à 500 kB lors du `npm run build` pour optimiser le temps de chargement sur les réseaux mobiles 4G/3G.

#### Procédure dans `vite.config.ts` :
Vous pouvez configurer `rollupOptions` pour découper les grosses bibliothèques (Recharts, Lucide, Three.js) en fichiers séparés mis en cache :
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor_react: ['react', 'react-dom', 'react-router-dom'],
        vendor_charts: ['recharts'],
        vendor_icons: ['lucide-react'],
        vendor_ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', 'framer-motion']
      }
    }
  }
}
```

---

## 3. Checklist Finale Avant Ouverture aux Utilisateurs

- [x] Compilation sans erreur (`npm run build` validé).
- [x] Test unitaire validé (`npm test` validé).
- [x] Sécurisation des credentials dans Git (validé).
- [x] Accès direct sans boucle de login sur les 13 services IA (validé).
- [ ] Base de données importée sur OVH via phpMyAdmin (`database.sql`).
- [ ] Variables du fichier `.env` renseignées sur le serveur OVH.
- [ ] Test d'un appel réel en ligne une fois le déploiement FTP terminé.
