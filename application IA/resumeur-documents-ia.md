# Résumeur de Documents IA (Multi-Agents)

## 1. Résumé de l'application

- **Nom :** Résumeur de Documents IA (Consortium Multi-Agents)
- **Objectif :** Transformer des documents denses, volumineux ou scannés (contrats, rapports d'audit, bilans financiers, présentations) en synthèses exécutives décisionnelles haut de gamme.
- **Problème résolu :** La surcharge cognitive et la perte de temps colossale liée à la lecture intégrale de dizaines de pages de documents techniques, juridiques ou stratégiques par les dirigeants et cadres.
- **Utilisateurs concernés :** Directeurs généraux, membres de COMEX/CODIR, directeurs juridiques, consultants, directeurs des opérations, chefs de projet.
- **Cas d'utilisation :** Synthèse d'un appel d'offres de 60 pages avant réunion, extraction des risques majeurs d'un contrat de prestation, résumé décisionnel d'un rapport financier annuel, digestion de notes techniques complexes.
- **Valeur ajoutée :** Gain de temps immédiat (jusqu'à 80% de temps de lecture économisé), extraction structurée des points de bascule, des risques et des décisions à trancher.
- **Type d'application :** Application web décisionnelle intégrant OCR natif client, streaming temps réel Server-Sent Events (SSE) et modélisation multi-agents LLM.
- **Niveau d'automatisation :** Analyse et synthèse 100% automatisées avec sélection préalable de l'angle de lecture par l'utilisateur.
- **Rôle de l'IA :** Simulation d'un collège de directeurs (Analyste Structurel, Auditeur des Risques, Directeur Synthèse Exécutive) pour extraire l'essence stratégique, évaluer les risques et proposer un plan d'action.

> **Description commerciale (2-3 phrases) :**
> Ne perdez plus des heures à lire des rapports de 50 pages avant vos réunions stratégiques. Notre consortium d'agents IA lit, filtre et décortique vos documents PDF, Word ou scannés pour vous livrer une synthèse exécutive structurée, orientée risques, décisions et plan d'action. Prenez des décisions éclairées en quelques minutes.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Les dirigeants et managers passent en moyenne 25% de leur temps de travail hebdomadaire à compulser de la documentation complexe. Très souvent, 90% du texte n'est que de l'enrobage ou des détails secondaires, alors que l'essentiel réside dans 3 décisions, 4 risques et un calendrier d'exécution.

### Quel problème elle résout
1. **L'infobésité documentaire :** Impossibilité humaine de tout lire et assimiler dans des délais contraints.
2. **L'angle mort des risques :** Dans un contrat ou un cahier des charges, une clause d'exonération de responsabilité ou une pénalité financière peut facilement passer inaperçue.
3. **Le manque d'orientation action :** Les résumés traditionnels se contentent de raccourcir le texte sans identifier "qui doit faire quoi et pour quand".

### Dans quel contexte elle est utilisée
- En amont d'un comité de direction ou d'un conseil d'administration.
- Lors de l'instruction d'un appel d'offres ou de l'audit d'un fournisseur.
- Lors de l'analyse préalable d'un projet de fusion-acquisition ou de partenariat.

### Quels utilisateurs peuvent l'utiliser
- Dirigeants de TPE/PME et cadres dirigeants (COMEX, CODIR).
- Juristes d'entreprise et avocats d'affaires.
- Auditeurs, experts-comptables et contrôleurs de gestion.

### Quelles tâches elle permet de réaliser
- Téléverser un fichier PDF, DOCX, TXT ou capturer un document papier via la caméra du smartphone (OCR Tesseract.js intégré).
- Choisir parmi 5 modes d'analyse : *Express*, *Standard*, *Détaillé*, *Direction (focus ROI/Pilotage)*, *Comex (focus Gouvernance/Arbitrages)*.
- Suivre en direct la réflexion des agents IA via un canal de streaming Server-Sent Events.
- Consulter un rapport dynamique avec score de lisibilité, temps gagné estimé, concepts majeurs, risques relevés, décisions requises et plan d'actions.
- Exporter la synthèse au format PDF ou DOCX pour diffusion immédiate.

---

## 3. Fonctionnalités complètes

### 1. Ingestion Multi-Format & OCR Caméra Client-Side
- **Objectif :** Permettre l'ingestion de tout type de document, qu'il soit numérique natif ou imprimé sur papier.
- **Ce que fait l'utilisateur :** Dépose un fichier (PDF, Word, TXT) ou clique sur le bouton caméra pour photographier un document physique via son smartphone ou webcam.
- **Ce que fait l'application :** Si une image est fournie, le composant `DocumentUploadCapture.tsx` déclenche le moteur OCR Tesseract.js directement dans le navigateur client pour extraire le texte sans saturer la bande passante serveur.
- **Ce que fait l'IA :** Extraction OCR haute fidélité en français.
- **Résultat obtenu :** Le texte intégral est prêt à être transmis avec le fichier.
- **Technologies utilisées :** Tesseract.js v5, Web Workers, HTML5 File API.

### 2. Sélection de l'Angle d'Analyse (Modes Exécutifs)
- **Objectif :** Adapter le prisme d'analyse de l'IA aux enjeux spécifiques du lecteur.
- **Ce que fait l'utilisateur :** Sélectionne l'une des 5 options disponibles :
  - `express` : Synthèse ultra-concise en 3 points.
  - `standard` : Format équilibré avec vue d'ensemble.
  - `detailed` : Analyse exhaustive section par section.
  - `direction` : Focalisation sur la rentabilité, les coûts, le ROI et le pilotage.
  - `comex` : Focalisation sur la gouvernance, les arbitrages stratégiques et la conformité.
- **Ce que fait l'application :** Stocke le paramètre et configure le prompt du consortium d'agents.
- **Technologies utilisées :** React state, TypeScript enums.

### 3. Streaming Multi-Agents en Temps Réel (SSE)
- **Objectif :** Offrir une transparence totale sur le cheminement analytique des agents IA et fluidifier l'expérience d'attente.
- **Ce que fait l'utilisateur :** Observe l'écran pendant le traitement.
- **Ce que fait l'application :** Ouvre une connexion `EventSource` vers `summarizer_agents.php`.
- **Ce que fait l'IA :** 
  - *Agent 1 (Analyste Structurel) :* Décortique l'architecture du texte, le volume et la cohérence.
  - *Agent 2 (Expert Stratégie & Décision) :* Isole les points critiques, les menaces et opportunités.
  - *Agent 3 (Directeur Synthèse Exécutive) :* Agrège l'ensemble et finalise la rédaction structurée.
- **Résultat obtenu :** Les bulles d'activité de chaque agent apparaissent dynamiquement à l'écran avant l'affichage du rapport.
- **Technologies utilisées :** Server-Sent Events (SSE), PHP ob_flush, React hooks.

### 4. Rapport d'Arbitrage et Métriques d'Impact
- **Objectif :** Rendre les conclusions du document immédiatement consommables.
- **Ce que fait l'utilisateur :** Consulte les différents modules du rapport affiché :
  - **KPIs visuels :** Score de lisibilité (sur 100), volume de pages, temps économisé (en minutes).
  - **Nuage de concepts :** Mots-clés et grands concepts d'entreprise.
  - **Synthèse exécutive :** Paragraphe de cadrage rédigé avec rigueur.
  - **Tableau des risques :** Liste rouge des menaces juridiques, financières ou opérationnelles.
  - **Recommandations & Actions :** Plan avec contexte et bénéfices attendus.
  - **Décisions & Échéances :** Arbitrages urgents et calendrier d'exécution.
- **Technologies utilisées :** TailwindCSS, Lucide Icons, React Components.

### 5. Exportation Professionnelle (PDF & DOCX)
- **Objectif :** Exporter le rapport pour l'insérer dans un dossier de présentation ou l'envoyer par email.
- **Ce que fait l'utilisateur :** Clique sur "Exporter en PDF" ou "Exporter en Word".
- **Ce que fait l'application :** Génère un formulaire POST vers `summarizer_export.php` avec l'identifiant du rapport généré.
- **Ce que fait l'IA :** N/A (mise en page documentaire backend).
- **Résultat obtenu :** Téléchargement instantané d'un document charté MDIV Business.
- **Technologies utilisées :** PHP FPDF / PHPWord, HTML Form generation.

---

## 4. Parcours utilisateur complet

```
[1. Accès au service /services-ia/resume-documents]
                      │
                      ▼
[2. Sélection du document : Glisser-déposer PDF/Word OU Prise de photo caméra]
                      │
                      ▼
[3. Extraction OCR instantanée (si photo/scan) via Tesseract.js]
                      │
                      ▼
[4. Choix de la perspective : Standard, Direction, COMEX, etc.]
                      │
                      ▼
[5. Clic sur "Lancer l'analyse multi-agents"]
                      │
                      ▼
[6. Streaming temps réel SSE : Écoute des interventions des 3 agents IA]
                      │
                      ▼
[7. Restitution du rapport complet avec KPIs, risques et arbitrages]
                      │
                      ▼
[8. Consultation interactive et déploiement du plan d'action]
                      │
                      ▼
[9. Export PDF ou Word pour diffusion au conseil ou aux équipes]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle LLM :** `qwen/qwen3.8-27b`
- **Moteur d'inférence :** Groq Cloud API LPU
- **Format :** Inférence JSON structuré strict avec fallback regex robuste.

### Architecture Multi-Agents du Backend
1. **Analyste Structurel :** Contrôle l'intégrité du document, le nombre de mots, l'articulation logique des chapitres.
2. **Expert Stratégie & Décision :** Évalue la portée business, les risques légaux, les clauses financières et les engagements contractuels.
3. **Directeur Synthèse Exécutive :** Rédige la synthèse consolidée et organise le retour sous format JSON.

### Prompt Système du Consortium
```text
Tu es un consortium de directeurs d'entreprise de haut niveau (Analyste Stratégique, Auditeur des Risques, Directeur Général).
Ton rôle est de générer une synthèse exécutive haut de gamme et rigoureuse du document fourni.
Le mode demandé est : {mode} (express, standard, detailed, direction, comex).
Tu dois répondre UNIQUEMENT par un objet JSON valide respectant strictement ce schéma :
{
  "id": "...",
  "documentName": "...",
  "mode": "...",
  "date": "YYYY-MM-DD",
  "kpis": {
    "readabilityScore": 88,
    "pageCount": 5,
    "estimatedTimeSavedMinutes": 45
  },
  "keywords": ["..."],
  "majorConcepts": ["..."],
  "executiveSummary": "...",
  "objectives": ["..."],
  "keyPoints": ["..."],
  "risks": ["..."],
  "recommendedActions": [{"action": "...", "context": "..."}],
  "decisions": ["..."],
  "deadlines": ["..."],
  "stakeholders": ["..."]
}
```

---

## 6. Architecture technique

### Frontend
- **Page principale :** `src/pages/ServicesIASummarizer.tsx`
- **Composant capture & OCR :** `src/components/ui/DocumentUploadCapture.tsx`
- **Service TypeScript :** `src/lib/summarizerService.ts`
- **Moteur OCR client :** `tesseract.js` exécuté dans un thread Worker dédié
- **Gestion des flux :** API navigateur `EventSource` (Server-Sent Events)

### Backend
- **Upload initial :** `public/api/summarizer_upload.php` (sauvegarde temporaire dans `sys_get_temp_dir()`)
- **Flux multi-agents :** `public/api/summarizer_agents.php` (génération SSE streaming)
- **Export :** `public/api/summarizer_export.php`
- **Client IA :** `public/api/groq_client.php`

### Base de données
- Stockage de l'historique et des métadonnées de synthèse associées à l'entreprise (`company_id`).

---

## 7. Architecture fonctionnelle

```
Résumeur de Documents IA
│
├── Module d'Ingestion
│   ├── Téléversement PDF, DOCX, TXT
│   └── Module OCR Tesseract.js (scan mobile & webcam)
│
├── Dispatcher Multi-Agents
│   ├── Définition du prisme (Express, Standard, Détaillé, Direction, Comex)
│   ├── Pipeline SSE en streaming direct
│   └── Inférence LLM Qwen 3.8
│
├── Moteur de Restitution Exécutive
│   ├── Métriques & KPIs (lisibilité, temps gagné)
│   ├── Cartographie des concepts clés
│   ├── Registre des risques identifiés
│   ├── Matrice des décisions à trancher
│   └── Plan d'action chronologique
│
└── Passerelle d'Export Documentaire
    ├── Exporteur PDF officiel
    └── Exporteur Microsoft Word (.docx)
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- Fichier source (PDF, DOCX, TXT) ou cliché photographique (JPEG, PNG).
- Texte brut extrait par l'OCR si document numérisé.
- Mode sélectionné (`express`, `standard`, `detailed`, `direction`, `comex`).

### Traitements
- Nettoyage et vectorisation textuelle du corpus (troncature sécurisée à 8 000 caractères par segment pour respecter la fenêtre de contexte).
- Orchestration séquentielle des messages d'agents par Server-Sent Events.
- Évaluation comparative des risques et recommandations.

### Données sortantes
- Synthèse exécutive rédigée.
- Listes structurées : objectifs, points clés, risques majeurs, actions prioritaires avec contexte d'application, arbitrages à réaliser.
- Indicateurs chiffrés : score de lisibilité, temps économisé.
- Fichiers téléchargeables (PDF, DOCX).

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Décryptage d'un contrat de sous-traitance de 35 pages
- **Utilisateur :** Marc, directeur général d'une société d'ingénierie.
- **Action :** Téléverse le PDF du contrat proposé par un grand donneur d'ordre et sélectionne le mode "Direction".
- **Traitement :** L'IA analyse les clauses de pénalités, les garanties et les modalités de paiement.
- **Résultat :** 
  - Risque mis en lumière : clause de pénalité de retard non plafonnée à l'article 14.
  - Décision à acter : exiger un avenant limitant la responsabilité civile à 10% du montant du contrat.
  - Temps de lecture économisé estimé : 65 minutes.

### Exemple 2 : Synthèse d'une présentation de stratégie marketing
- **Utilisateur :** Sophie, directrice commerciale.
- **Action :** Photographie 4 diapositives imprimées avec son smartphone via le module OCR intégré, sélectionne le mode "Express".
- **Traitement :** Tesseract.js transcrit le texte des photos en quelques secondes, puis les agents IA synthétisent les priorités du trimestre.
- **Résultat :** Une fiche récapitulative claire avec les 3 objectifs de vente et les 2 dates limites de lancement de campagne.

---

## 10. Valeur ajoutée

- **Élimination de la fatigue informationnelle :** Permet d'assimiler l'essentiel d'un dossier lourd en 3 minutes.
- **Détection infaillible des risques cachés :** L'IA traque spécifiquement les engagements contraignants et les pièges contractuels.
- **Orientation décisionnelle :** Ne se limite pas à résumer, formule les questions concrètes que la direction doit trancher.
- **Zéro ressaisie papier :** L'OCR client intégré supprime toute barrière entre documents papier et numérique.
- *Gain quantifié :* En moyenne 45 à 90 minutes économisées par document complexe traité.

---

## 11. Limites actuelles

- **Taille maximale du corpus par appel :** Limité à 8 000 caractères dans la fenêtre de prompt principale (les documents de plus de 50 pages nécessitent une segmentation préalable).
- **RAG sémantique complet (Recherche vectorielle multi-documents) :** Fonctionnalité prévue / non implémentée (l'analyse s'effectue document par document).
- **Extraction automatique des tableaux complexes scannés :** L'OCR extrait le texte séquentiel mais ne reconstitue pas toujours la géométrie parfaite des grilles comptables très intriquées.

---

## 12. Évolutions possibles

### Déjà implémenté
- Ingestion PDF, Word et TXT.
- OCR client Tesseract.js avec déclencheur caméra mobile.
- 5 modes d'analyse stratégique.
- Streaming SSE simulant le dialogue multi-agents.
- Tableau de bord des risques, actions et décisions.
- Export PDF / Word.

### Prévu mais non implémenté
- Indexation vectorielle (RAG) avec recherche sémantique multi-documents simultanée.
- Comparateur de versions (diff intelligent entre deux contrats successifs).
- Envoi automatique du compte-rendu aux participants via l'intégration Outlook.

### Proposition d'évolution
- Synthèse audio vocale (podcast exécutif de 2 minutes généré par synthèse vocale pour écoute en voiture).

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Transformez n'importe quel document complexe de 50 pages en un arbitrage stratégique clair et actionnable en moins de 60 secondes.

### Pitch en 30 secondes
Combien de dossiers urgents s'empilent sur votre bureau sans que vous ayez le temps de les ouvrir ? Grâce au Résumeur de Documents IA de MDIV Business, déposez un contrat, un rapport financier ou même une photo de document papier. Notre consortium d'agents IA extrait instantanément les risques cachés, les décisions à prendre et les actions prioritaires. Vous maîtrisez vos dossiers en un coup d'œil, sans y sacrifier vos soirées.

### Présentation en 1 minute
Dans le monde des affaires actuel, celui qui détient l'information le plus rapidement prend l'avantage. Mais comment faire quand les rapports d'audit, les contrats et les dossiers techniques font des dizaines de pages ?
Le Résumeur de Documents IA de MDIV Business a été conçu spécialement pour les décideurs pressés. Grâce à son architecture multi-agents exclusive, il simule le travail d'une équipe d'analystes chevronnés. Il ne se contente pas de raccourcir le texte : il isole les risques juridiques, chiffre le temps économisé et vous dresse la liste exacte des décisions à prendre. Qu'il s'agisse d'un fichier PDF numérique ou d'une note papier prise en photo avec votre téléphone, vous obtenez une synthèse d'exception prête à être présentée en comité de direction.

### Problème
L'abondance de documents volumineux paralyse la prise de décision rapide des dirigeants et engendre des risques contractuels non décelés.

### Solution
Un consortium d'agents IA qui synthétise tout document selon l'angle souhaité (Express, Direction, COMEX) avec identification proactive des risques.

### Fonctionnement
Déposez le fichier ou prenez une photo -> Choisissez l'angle -> Les agents analysent en direct -> Exportez votre rapport décisionnel.

### Public cible
Dirigeants, membres de COMEX/CODIR, juristes, directeurs financiers et chefs de projets.

### Cas d'utilisation
Revue de contrats, synthèse d'appels d'offres, analyse de rapports financiers et notes stratégiques.

### Proposition de valeur
Ne subissez plus la complexité documentaire : pilotez avec clarté, gagnez 1h30 par dossier et sécurisez vos engagements.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan sur un classeur énorme de 100 pages qui s'abat sur un bureau avec fracas, gros plan sur le visage découragé d'un manager.
- **Texte à l'écran :** "60 pages à lire avant 14h ?"
- **Voix off :** "Encore un pavé de 60 pages à lire avant votre réunion de cet après-midi ?"
- **Animation CapCut :** Secousse de caméra (Camera Shake) + effet sonore d'impact.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Scrolling infini d'un document PDF illisible, surlignage de clauses complexes incompréhensibles.
- **Texte :** "Le piège des clauses cachées..."
- **Voix off :** "Vous n'avez pas le temps de tout lire, et c'est exactement là que se glissent les pires risques contractuels."

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Écran MDIV Business "Résumeur de Documents IA" avec son design moderne et ses options d'analyse.
- **Texte :** "Le Consortium Multi-Agents IA"
- **Voix off :** "Voici le Résumeur de Documents IA de MDIV Business : le premier consortium d'agents conçu pour les décideurs."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:33 (15 sec)
- **Visuel à enregistrer dans l'application :** Glisser-déposer d'un fichier PDF -> Sélection du mode "Comex" -> Visualisation des bulles de réflexion des 3 agents en direct -> Apparition du rapport final structuré.
- **Action utilisateur :** Dépôt du fichier, clic sur "Lancer l'analyse", défilement du rapport.
- **Texte :** "Risques • Décisions • Plan d'action"
- **Voix off :** "En 30 secondes, les agents analysent le texte, isolent les risques majeurs et vous livrent les arbitrages exacts à opérer."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:33 – 00:43 (10 sec)
- **Fonctionnalité 1 :** Scanner photo OCR mobile intégré.
- **Fonctionnalité 2 :** 5 modes d'analyse stratégique (de l'Express au COMEX).
- **Fonctionnalité 3 :** Export direct en PDF et Word chartés.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Plan du manager souriant en salle de réunion, sa tablette à la main avec la fiche de synthèse MDIV affichée.
- **Texte :** "Prêt pour décider en 3 minutes."
- **Voix off :** "Vous arrivez en réunion parfaitement préparé, avec les arguments clés et zéro angle mort."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Testez le Résumeur IA sur mdiv-business.fr"
- **Voix off :** "Gagnez des heures précieuses dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton d'action "Essai immédiat".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Arrivée sur `/services-ia/resume-documents`, présentation de l'en-tête (3 sec, zoom léger).
- **Capture 2 :** Dépose d'un fichier PDF volumineux dans la zone de téléversement (3 sec, mouvement fluide).
- **Capture 3 :** Démonstration du bouton "Caméra / Scan" (2 sec, focus sur l'icône appareil photo).
- **Capture 4 :** Clic sur le sélecteur de mode et choix de "COMEX / Gouvernance" (3 sec, gros plan).
- **Capture 5 :** Animation de streaming SSE : apparition des messages des 3 agents (Analyste, Auditeur, Directeur) (5 sec).
- **Capture 6 :** Découverte du rapport généré : focus sur le bloc rouge "Risques identifiés" et le tableau des "Recommandations" (5 sec).
- **Capture 7 :** Clic sur "Exporter en PDF" (3 sec, confirmation visuelle du document téléchargé).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Reels / TikTok) et 16:9 (LinkedIn / YouTube).
- **Résolution :** 1080x1920 / 4K.
- **Durée totale :** 58 secondes.
- **Rythme :** Très dynamique au hook, posé et professionnel durant la démonstration de l'interface.
- **Sous-titres :** Sous-titres automatiques CapCut, style "Tech Glow" avec surlignage des mots clés en cyan ou jaune.
- **Effets audio :** Effet "Woosh" sur chaque changement d'agent, "Pop" sur l'apparition des badges de risques.
- **Musique :** Style bande-son cinéma technologique (type Hans Zimmer moderne ou néo-électro corporate).

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
60 pages de contrat à lire ? Laissez notre consortium d'agents IA extraire les risques cachés et les décisions clés en 30 secondes. Testez le Résumeur de Documents sur MDIV Business.

### Publicité LinkedIn
En tant que dirigeant ou cadre, votre temps est votre ressource la plus chère. Pourtant, vous passez encore des heures à lire des rapports techniques et des projets de contrats interminables.
Découvrez le **Résumeur de Documents IA** de MDIV Business :
1. Déposez votre document (PDF, Word ou photo mobile).
2. Choisissez votre mode de lecture (Standard, Direction, COMEX).
3. Obtenez instantanément une synthèse exécutive structurée avec la liste des risques et les décisions à arbitrer.
Sécurisez vos décisions et gagnez jusqu'à 2 heures par jour.
Lien vers la démo en commentaire !

### Publicité Instagram
Fini la torture des PDF de 50 pages ! Notre IA fait le tri pour vous et vous donne l'essentiel en 30 secondes chrono. Lien en bio.

### Publicité Facebook
Comment les dirigeants modernes préparent-ils leurs réunions en 3 minutes ? Ils utilisent le Résumeur de Documents IA de MDIV Business pour dénicher les points clés et les risques sans lire des pavés entiers. Essayez-le gratuitement !

### Description vidéo
Démonstration de notre système multi-agents IA capable de résumer et d'auditer n'importe quel document d'entreprise en temps réel. #Productivité #IA #Entreprise #Business

### CTA
"Passez à la synthèse documentaire intelligente sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle analyse et synthétise automatiquement des documents d'entreprise denses pour fournir aux dirigeants un rapport décisionnel clair axé sur les risques, les décisions et les actions.
- **Quels types de fichiers sont acceptés ?**
  Les fichiers PDF, Word (.docx), fichiers texte (.txt), ainsi que les photos de documents prises directement avec un smartphone grâce à notre module OCR intégré.
- **Comment fonctionne l'architecture multi-agents ?**
  Trois rôles spécialisés interviennent en cascade : l'Analyste Structurel, l'Expert Stratégie & Risques, et le Directeur de Synthèse qui consolide les arbitrages finaux.
- **Mes documents restent-ils confidentiels ?**
  Oui, les fichiers sont traités dans un environnement sécurisé temporaire et ne sont jamais réutilisés pour entraîner publiquement des modèles tiers.
- **Peut-on exporter le résultat ?**
  Absolument, un clic permet d'exporter le compte-rendu sous format PDF ou document Microsoft Word (.docx).
- **L'IA remplace-t-elle la relecture d'un avocat ?**
  Non, pour un contrat à très haut enjeu juridique, l'IA sert d'outil d'alerte et de pré-audit rapide, mais ne se substitue pas au conseil juridique formel d'un professionnel du droit.

---

# 19. FICHE COMMERCIALE

- **Nom :** Résumeur de Documents IA (Multi-Agents)
- **Catégorie :** Décisionnel, Productivité & Audit Documentaire
- **Public cible :** Dirigeants de PME, Directeurs Généraux, COMEX, Cadres, Juristes
- **Problème :** Perte de temps colossale à la lecture de pavés documentaires et risque d'omettre des clauses critiques
- **Solution :** Ingestion multi-formats + OCR mobile + consortium d'agents IA générant une synthèse orientée action
- **Fonctionnalités clés :** OCR client Tesseract.js, streaming SSE temps réel, 5 modes exécutifs, registre des risques, export PDF/DOCX
- **Technologies IA :** Groq Cloud API, Qwen 3.8 27B, Tesseract.js v5 OCR
- **Type d'IA :** Traitement automatique du langage naturel (NLP), raisonnement multi-agents, vision par ordinateur (OCR)
- **Cas d'utilisation :** Analyse de contrats, synthèse d'audits, préparation de comités de direction
- **Valeur ajoutée :** 80% de temps gagné en lecture, sécurisation contre les clauses piégées, lisibilité immédiate
- **Statut :** Opérationnel en production (route `/services-ia/resume-documents`)
- **CTA :** "Analysez vos documents avec l'IA sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Démo prête avec un document PDF d'exemple (ex: contrat de prestation ou rapport financier)
- [ ] Capture d'écran de l'appareil photo avec l'OCR mobile Tesseract.js
- [ ] Script vidéo validé pour le pitch dirigeant
- [ ] Voix off enregistrée ou générée
- [ ] Montage CapCut avec sous-titrage bicolore et effets sonores de réflexion agents
- [ ] Transitions et zooms calibrés sur les alertes de risques
- [ ] CTA ajouté avec adresse web claire
- [ ] Formats 9:16 et 16:9 exportés
- [ ] Post LinkedIn prêt avec accroche sur la surcharge d'informations
- [ ] Publication Reels / TikTok programmée
