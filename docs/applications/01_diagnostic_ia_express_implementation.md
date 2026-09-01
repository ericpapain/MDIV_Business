# Documentation Technique : Diagnostic IA Express

Ce document décrit l'implémentation technique du module "Diagnostic IA Express", développé pour interagir avec l'API Groq (Llama 3.1) en intégrant un formulaire dynamique et un système multi-agents en Server-Sent Events (SSE).

## 1. Architecture Globale

L'application est divisée en deux parties principales :
- **Frontend (React / Vite)** : Interface utilisateur responsable de la collecte des données et de l'affichage de la discussion IA en temps réel.
- **Backend (PHP natif)** : Scripts d'API servant de proxy sécurisé entre le frontend, la base de données MySQL et l'API Groq.

## 2. Dossier Backend (`/api`)

Le backend a été conçu pour être léger et se déployer facilement sur un hébergement mutualisé classique (ex: OVH).

### Fichiers
- **`api/config.php`** : Contient la clé de l'API Groq et initialise la connexion `PDO` à la base de données MySQL. Il est configuré pour lire les variables d'environnement (`DB_HOST`, `DB_NAME`, etc.).
- **`api/groq_client.php`** : Fonction utilitaire `callGroqApi()` enveloppant l'utilisation de `cURL`. Gère les requêtes standard JSON ainsi que les requêtes en streaming.
- **`api/diagnostic_step.php`** : 
  - *Rôle* : Étape 1 du parcours. Reçoit l'historique de la conversation utilisateur/assistant.
  - *Action* : Interroge Groq avec un prompt système pour générer dynamiquement la *prochaine* question la plus pertinente et ses choix multiples.
  - *Retour* : JSON strict contenant `{"question": "...", "options": [...]}`.
- **`api/diagnostic_agents.php`** :
  - *Rôle* : Étape 2 du parcours (Multi-Agents).
  - *Action* : Déclare le header `text/event-stream` pour le SSE. Simule une boucle de 4 échanges entre un "Expert Stratégie" et un "Expert Technique".
  - *Retour* : Diffuse les événements `agent_message` en temps réel au frontend, puis génère une synthèse finale (événement `complete`) qu'il enregistre en base de données.

## 3. Dossier Frontend (`/src`)

L'intégration React utilise les hooks natifs pour gérer l'état complexe d'une conversation asynchrone et d'un flux SSE.

### Fichiers
- **`src/lib/diagnosticService.ts`** :
  - Service réseau encapsulant la logique d'appel.
  - Fonction `fetchNextDiagnosticStep(history)` pour appeler le script PHP étape par étape.
  - Fonction `startAgentsDiscussion(context, onMessage, onComplete, onError)` qui instancie un objet natif `EventSource` pour écouter les messages en temps réel. Gère proprement la fermeture de la connexion.
- **`src/pages/ServicesIADiagnostic.tsx`** :
  - Composant de vue principal, divisé en 3 états (`phase`):
    - `form` : Affiche la question dynamique en cours et gère l'historique des réponses. Affiche un écran de chargement (`Loader2`) entre chaque question.
    - `agents` : Affiche l'interface de discussion. Au fur et à mesure que les événements SSE arrivent, les bulles de messages apparaissent, colorées selon l'agent (Stratège ou Technique).
    - `result` : Affiche le dashboard final comprenant le score, les déductions (insights) et les recommandations d'outils avec un design soigné.

## 4. Gestion de la Base de Données

Le backend enregistre les résultats via PDO dans la table `diagnostics`.
Le script SQL de création se trouve dans le fichier `database.sql` à la racine du projet. 
La requête préparée dans `diagnostic_agents.php` insère l'historique de conversation et le rapport JSON directement dans les colonnes prévues.

## 5. Intégration Continue (Déploiement)

Le fichier `.github/workflows/deploy.yml` a été modifié :
- Une étape `Copy API to dist` a été ajoutée juste après `npm run build`.
- Commande : `cp -r api ./dist/api`
- *Objectif* : Permettre au déploiement FTP existant (qui copie le dossier `dist` vers OVH) d'embarquer automatiquement les scripts PHP de l'API.

## 6. Variables à configurer en production (OVH)

Pour que la sauvegarde en base de données fonctionne, assurez-vous que les variables suivantes sont accessibles par PHP (via l'interface OVH ou en modifiant manuellement le fichier `api/config.php` de manière sécurisée) :
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
## 7. Fonctionnalités Avancées (Phase 2)

Lors de la seconde phase, les fonctionnalités expertes ont été intégrées :

### 7.1 Gestion des dépendances PHP (Composer)
Le dossier `api/` dispose désormais d'un fichier `composer.json` pour charger des bibliothèques externes sans polluer le dépôt de code. Le fichier `deploy.yml` a été mis à jour pour exécuter automatiquement `composer install` avant de transférer l'API sur le serveur OVH.

### 7.2 Upload et Analyse de Document (PDF)
- Fichier : `api/diagnostic_upload.php`
- Bibliothèque : `smalot/pdfparser`
- Logique : Le fichier PDF est reçu, sa taille est vérifiée (max 2MB). Le parser l'ouvre et vérifie qu'il ne dépasse pas **3 pages** (limite Freemium). Si c'est le cas, l'API renvoie un avertissement propre géré par le Frontend. Sinon, le texte est extrait, tronqué à 5000 caractères, et réinjecté dans le contexte Groq.

### 7.3 Interruption Dynamique des Agents
- Fichier : `api/diagnostic_agents.php`
- Logique : L'Expert IA "Stratégie" a reçu l'instruction (dans son prompt système) que s'il lui manque une donnée cruciale pour poser son diagnostic, il doit émettre le JSON `{"action":"interrupt", "question":"..."}`. 
- Lorsque l'API PHP détecte cette action, elle émet un événement SSE `interrupt` et arrête son exécution.
- Le frontend bascule alors sur l'interface de pause, affichant la question de l'agent et offrant à l'utilisateur deux choix : répondre par texte OU uploader un fichier métier (qui passe alors par `diagnostic_upload.php`). Une fois l'information transmise, l'interface relance la phase Multi-Agents en fournissant le nouveau contexte enrichi.

### 7.4 Génération du Rapport PDF
- Fichier : `api/diagnostic_pdf.php`
- Bibliothèque : `tecnickcom/tcpdf`
- Logique : Lors du clic sur "Télécharger mon PDF", le frontend soumet dynamiquement (via POST) le rapport JSON final (Score, Insights, Recommandations) à ce script. Le script PHP utilise `TCPDF` pour dessiner un document propre avec le logo du projet, puis force le téléchargement du fichier directement dans le navigateur du client (`Content-Disposition: attachment`).

