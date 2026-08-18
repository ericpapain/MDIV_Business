# Diagnostic IA Express

## 1. Objectif
Fournir aux visiteurs professionnels un audit rapide et personnalisé de leur maturité numérique et de leur potentiel d'automatisation IA, généré dynamiquement par un modèle de langage, et non basé sur un simple calcul statique.

## 2. Utilisateur cible
TPE, PME, indépendants, fondateurs et dirigeants cherchant à comprendre où l'IA peut les aider (gain de temps, argent, productivité) sans avoir de connaissances techniques.

## 3. Problème résolu
Les prospects entendent parler de l'IA mais ne savent pas par où commencer ni ce qui s'applique à *leur* secteur d'activité spécifique. L'application transforme des réponses vagues en recommandations actionnables.

## 4. Fonctionnalités
- **Questionnaire adaptatif et intelligent** : Construction du persona au fur et à mesure. Chaque nouvelle question (avec des cases à cocher) est générée dynamiquement par l'IA en fonction de la réponse précédente.
- **Discussion Multi-Agents** : Une fois les informations collectées, le système lance une discussion entre plusieurs "agents experts" (ex: Expert Stratégie, Expert Technique) qui échangent entre eux (environ 10 itérations) pour formuler le diagnostic.
- **Interactions en cours de diagnostic** : Possibilité pour les agents de s'interrompre pour poser une question supplémentaire à l'utilisateur s'il manque une donnée cruciale.
- **Effet "Wow" (Insights déduits)** : Le système déduit et révèle à l'utilisateur des problèmes ou caractéristiques de son entreprise qu'il n'a pas explicitement déclarés, prouvant ainsi la puissance de l'analyse IA.
- Restitution d'un score de maturité, d'un plan d'action (3 outils à tester) et des gains estimés issus de la synthèse des agents.
- Enregistrement des résultats en base de données pour suivi commercial (génération de leads).

## 5. Parcours utilisateur
1. L'utilisateur arrive sur la page `/diagnostic` et entre sa première information (ex: son secteur).
2. L'IA analyse cette réponse et lui renvoie la question suivante la plus pertinente avec des choix à cocher. Ce cycle se répète pour construire le persona.
3. Quand l'IA a assez d'infos, elle déclenche la phase "Panel d'experts". L'utilisateur voit (ou patiente pendant que) les agents IA discutent en arrière-plan.
4. Si un agent a un doute, il peut poser une question supplémentaire à l'utilisateur.
5. Une fois les 10 tours de discussion terminés, le résultat s'affiche sous forme de tableau de bord esthétique (Score, Recommandations personnalisées, Synthèse des experts).
6. (Optionnel) Possibilité de s'envoyer le rapport par email ou de prendre rendez-vous.

## 6. Architecture technique

### Frontend
- Page existante : `ServicesIADiagnostic.tsx` (à refactoriser pour supprimer la logique de calcul factice).
- Appel `fetch` POST vers l'endpoint `/api/diagnostic`.
- Affichage des états de chargement (loading) et gestion des erreurs (Toast).

### Backend
- Micro-backend **PHP** (dans un sous-dossier `api/`).
- Validation des entrées.
- Création du prompt système avec les données de l'utilisateur.

### Base de données
- MySQL (Hébergement OVH).
- Table `DiagnosticResult` (id, secteur, taille, defis, score_generé, recommandations, email_contact, created_at).

### Services externes
- Base de données MySQL OVH.

### IA
- Appel API à **Groq (modèle Llama 3)** via des requêtes `cURL` en PHP. L'API Groq est gratuite, ultra-rapide et compatible avec le format OpenAI.

## 7. Modèle(s) IA

Pour le modèle LLM :
- **nom** : `llama-3.1-8b-instant` ou `llama-3.1-70b-versatile`
- **fournisseur** : Groq (Meta)
- **type** : LLM Text-to-Text
- **utilisation** : Génération des questions, multi-agents, et structuration des recommandations.
- **coût** : **Gratuit** (free tier très généreux).
- **pourquoi ce modèle** : Groq offre des vitesses d'inférence parmi les plus rapides du marché, ce qui est crucial pour le SSE et la génération dynamique. De plus, son API est identique à celle d'OpenAI, ce qui facilite l'intégration en PHP, tout en étant 100% gratuit.

## 8. RAG
**Non applicable.**
*Pourquoi ?* Le diagnostic se base sur le contexte donné par l'utilisateur et la connaissance générale du modèle sur les processus métier. Nous n'avons pas besoin d'indexer de vastes bases de documents internes pour ce module précis.

## 9. Workflow IA

**Phase 1 : Formulaire Adaptatif**
Utilisateur donne une réponse
→ Frontend envoie la conversation actuelle à `/api/diagnostic_step.php`
→ Backend PHP interroge le LLM via Groq
→ Le LLM renvoie la question suivante et les options (JSON)
→ Frontend affiche les cases à cocher.

**Phase 2 : Multi-Agents (Le cœur du problème technique)**
*Attention Architecte : Une discussion de 10 tours entre LLM prend du temps (20 à 60 secondes). En PHP classique, cela va bloquer la requête HTTP et provoquer un Timeout serveur.*
*Solution prévue : Utiliser le "Server-Sent Events" (SSE) en PHP pour envoyer les messages de la discussion un par un au frontend en temps réel, évitant ainsi le timeout et créant un effet "wow" pour l'utilisateur qui voit les IA réfléchir.*

L'utilisateur valide la dernière question
→ Frontend appelle `/api/diagnostic_agents.php` (en mode flux SSE)
→ Backend PHP lance la boucle : 
   - Agent A donne son avis
   - Backend envoie l'avis au Frontend
   - Agent B contredit ou complète Agent A
   - (Répété 10 fois)
→ Si l'Agent A a besoin d'info, le flux se met en pause et demande au Frontend d'afficher une question.
→ Synthèse finale générée par un Agent C.
→ Sauvegarde dans MySQL.

## 10. API

**POST /api/diagnostic_step.php**
- **objectif** : Générer la question suivante en fonction de l'historique.
- **paramètres** : Historique des questions/réponses.
- **réponse** : JSON avec la nouvelle question et ses options.

**GET /api/diagnostic_agents.php** (EventStream)
- **objectif** : Lancer la discussion multi-agents en temps réel.
- **objectif** : Générer l'audit IA
- **paramètres (Body JSON)** :
  ```json
  {
    "industry": "Immobilier",
    "companySize": "1-10",
    "mainChallenges": ["Prospection", "Administratif"],
    "currentTools": "Excel, Word"
  }
  ```
- **réponse (JSON)** :
  ```json
  {
    "score": 65,
    "synthesis": "Votre secteur est très propice...",
    "deduced_insights": [
      "Vous perdez probablement X heures par semaine sur la gestion documentaire (déduit de votre taille d'équipe et secteur)."
    ],
    "recommendations": [
      { "tool_name": "Devis IA", "reason": "..." }
    ]
  }
  ```
- **erreurs possibles** : `400 Bad Request` (input invalide), `500 Internal Error` (échec API OpenAI).

## 11. Base de données

**Table : DiagnosticResult**
- `id` (UUID, PK)
- `industry` (String)
- `companySize` (String)
- `mainChallenges` (String[])
- `score` (Int)
- `analysis` (Text)
- `recommendations` (JSON)
- `createdAt` (DateTime)

## 12. Variables d'environnement

GROQ_API_KEY=gsk_....
DATABASE_URL=mysql://user:password@serveur-ovh:3306/mdiv_db

## 13. Sécurité
- Rate limiting basique en PHP (via l'IP de l'utilisateur).
- Validation stricte des champs du formulaire côté PHP pour éviter la fraude.

## 14. Gestion des erreurs
- Si l'API Groq échoue (timeout, limite de requêtes), le backend doit renvoyer une erreur au frontend de manière gracieuse.
- Le frontend affiche un message clair pour éviter tout crash.

## 15. Tests
- Test API pour vérifier la connexion à Groq et le parsing du JSON.
- Vérification que les données sont bien insérées dans MySQL.

## 16. Critères de validation
- [ ] Le formulaire de la page `ServicesIADiagnostic` fait un appel réseau.
- [ ] Le LLM génère une réponse différente selon que l'on indique être "Artisan" ou "Agence Web".
- [ ] Le résultat est affiché proprement sans texte tronqué.
- [ ] L'entrée est visible dans la base de données.

## 17. Déploiement
- Le backend (dossier `api/`) sera déployé en FTP (le workflow GitHub le copie tel quel).
- La DB utilisera le service MySQL d'OVH existant.

## 18. Coût estimé
- Modèle IA (Groq) : 0€ (utilisation de l'offre gratuite).
- Base de données : 0€ (inclus dans l'offre OVH).

## 19. Alternatives si besoin de plus de puissance
- Si les limites gratuites de Groq sont atteintes, possibilité de passer sur Gemini 1.5 Flash (également gratuit) ou un modèle payant (OpenAI).

## 20. Ce que je vais apprendre
1. Créer un **formulaire dynamique généré par l'IA** (Dynamic UI generation).
2. Mettre en place un système **Multi-Agents** (Agent basé sur le rôle : Stratège, Technicien, etc.).
3. Gérer les temps de réponse longs avec le **Server-Sent Events (SSE)** en PHP pour streamer la discussion des IA en temps réel.
4. Gérer l'état de la conversation (Mémoire) pour que le LLM sache quelles questions ont déjà été posées.
5. Persister des données dans une base MySQL via PDO en PHP.
