# Générateur de Comptes-Rendus de Réunion IA

## 1. Résumé de l'application

- **Nom :** Générateur de Comptes-Rendus de Réunion IA (Secrétariat Exécutif Multi-Agents)
- **Objectif :** Transformer des notes de réunion brutes, des comptes-rendus vocaux ou des verbatims en procès-verbaux structurés avec plan d'action RACI, décisions actées et matrice des risques.
- **Problème résolu :** La perte de mémoire collective post-réunion, le manque de suivi des tâches assignées et les heures passées par les managers à rédiger et reformuler des comptes-rendus après de longues séances de travail.
- **Utilisateurs concernés :** Chefs de projet, directeurs de département, consultants, secrétaires généraux, responsables d'équipes agiles.
- **Cas d'utilisation :** Synthèse d'un comité de pilotage (COPIL), cadrage d'un point hebdomadaire d'équipe, formalisation des arbitrages d'une réunion client ou d'un conseil d'administration.
- **Valeur ajoutée :** Restitution instantanée d'un compte-rendu professionnel sans aucun temps mort, responsabilisation immédiate avec attribution des tâches par collaborateur et date limite.
- **Type d'application :** Application web SaaS de productivité collaborative intégrant saisie textuelle / téléversement de médias, streaming SSE et orchestration multi-agents.
- **Niveau d'automatisation :** Génération 100% automatisée à partir des notes fournies avec relecture et export immédiat.
- **Rôle de l'IA :** Modélisation d'une équipe de secrétariat exécutif (Secrétaire de séance, Auditeur des Décisions, Directeur des Opérations) pour extraire l'agenda, les participants, les arbitrages, les tâches et les risques.

> **Description commerciale (2-3 phrases) :**
> Ne terminez plus jamais une réunion sans compte-rendu clair et engageant. Collez vos notes brutes ou vos enregistrements : notre secrétariat IA multi-agents rédige en quelques secondes un procès-verbal parfait avec les décisions prises, les actions assignées et les échéances clés. Transformez vos discussions en actions concrètes.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Combien de réunions d'une heure se concluent sans qu'aucun écrit ne soit partagé ? Les participants repartent avec des interprétations divergentes, les tâches ne sont pas clairement attribuées et deux semaines plus tard, rien n'a avancé. Rédiger un bon compte-rendu prend en moyenne 45 minutes par réunion, un temps que personne ne veut ou ne peut prendre.

### Quel problème elle résout
1. **L'effet "réunionite stérile" :** Des heures passées à échanger sans trace écrite pérenne ni engagement formel des participants.
2. **Le flou des responsabilités :** Savoir exactement "qui fait quoi et pour quand" sans ambiguïté.
3. **La corvée de rédaction :** La mise en forme de notes manuscrites brouillonnes en un document digne d'être envoyé à la direction générale.

### Dans quel contexte elle est utilisée
- Immédiatement à la fin d'un échange client ou d'une réunion interne.
- Lors de comités de direction ou de revues budgétaires trimestrielles.
- Pour archiver les décisions d'un projet informatique ou organisationnel.

### Quels utilisateurs peuvent l'utiliser
- Tout manager ou chef de projet animant des réunions.
- Les assistants de direction et secrétaires de séance.
- Les consultants animant des ateliers de cadrage chez leurs clients.

### Quelles tâches elle permet de réaliser
- Coller des notes informelles, puces ou retranscriptions orales.
- Téléverser un fichier audio ou bloc de notes.
- Déclencher le consortium d'agents IA via Server-Sent Events.
- Visualiser un compte-rendu hiérarchisé : Ordre du jour, Synthèse exécutive, Décisions fermes, Tableau des actions (Tâche / Responsable / Échéance / Statut), et Risques détectés.
- Exporter instantanément le résultat au format PDF ou document Word.

---

## 3. Fonctionnalités complètes

### 1. Ingestion de Notes Brutes & Téléversement Multimédia
- **Objectif :** Faciliter la saisie sans imposer de formalisme rigide à l'utilisateur.
- **Ce que fait l'utilisateur :** Saisit ou colle ses notes dans une zone de texte dédiée, ou téléverse un fichier média/texte de compte-rendu.
- **Ce que fait l'application :** Traite les données entrantes et transmet les arguments au service `meeting_upload.php` ou initialise le flux d'analyse en direct via `startMeetingAgentsAnalysis`.
- **Ce que fait l'IA :** N/A au stade de la collecte.
- **Résultat obtenu :** Le corpus de discussion est prêt pour le pipeline d'extraction.
- **Technologies utilisées :** HTML5 Textarea, FormData API, TypeScript.

### 2. Consortium Multi-Agents en Streaming (SSE)
- **Objectif :** Offrir une restitution visuelle et vivante de la décomposition analytique de la réunion.
- **Ce que fait l'utilisateur :** Lance la génération et observe le déroulement.
- **Ce que fait l'application :** Se connecte à `meeting_agents.php` et écoute les événements `agent_message` et `complete`.
- **Ce que fait l'IA :**
  - **Secrétaire de séance IA :** Isole les thèmes abordés, reconstitue l'ordre du jour et déduit la liste des participants.
  - **Auditeur des Décisions :** Identifie chaque phrase d'accord ou d'arbitrage pour en extraire des décisions concrètes.
  - **Directeur des Opérations :** Structure le plan d'action (assignataire, tâche, délai) et isole les points de vigilance (risques).
- **Résultat obtenu :** Affichage en temps réel de l'état d'avancement des trois rôles avant affichage du document finalisé.
- **Technologies utilisées :** Server-Sent Events (SSE), Groq API, PHP ob_flush.

### 3. Matrice Opérationnelle des Actions (Plan RACI)
- **Objectif :** Rendre les livrables opérationnels et suivables dans le temps.
- **Ce que fait l'utilisateur :** Consulte le tableau récapitulatif des actions générées.
- **Ce que fait l'application :** Présente chaque action sous forme de ligne interactive :
  - **Intitulé de l'action :** Descriptif clair du travail à accomplir.
  - **Responsable :** Personne ou équipe désignée (ex: "Lead Dev", "Direction Financière").
  - **Échéance :** Date calculée ou délai explicite (ex: J+7).
  - **Statut :** Badge dynamique `pending`, `in_progress` ou `done`.
- **Ce que fait l'IA :** Qualification sémantique de l'urgence et identification de l'acteur responsable à partir du contexte.
- **Technologies utilisées :** Composants React, Lucide Icons, badges de statut.

### 4. Registre des Décisions et Matrice des Risques
- **Objectif :** Figer les arbitrages et anticiper les points de blocage.
- **Ce que fait l'utilisateur :** Consulte les encarts spécifiques "Décisions validées" et "Risques & Vigilances".
- **Ce que fait l'application :** Met en forme les décisions avec leur contexte d'approbation et classe les risques par niveau de sévérité (Faible, Moyen, Élevé).
- **Ce que fait l'IA :** Détection des compromis, accords budgétaires et alertes formulées durant la discussion.
- **Technologies utilisées :** TailwindCSS, React State.

### 5. Exportation Multi-Format (PDF / DOCX) & Historique
- **Objectif :** Partager le document sous forme officielle aux participants ou le stocker dans les archives de l'entreprise.
- **Ce que fait l'utilisateur :** Clique sur "Exporter PDF" ou "Exporter Word".
- **Ce que fait l'application :** Soumet le formulaire vers `meeting_export.php` avec l'identifiant unique de la réunion.
- **Ce que fait l'IA :** N/A.
- **Résultat obtenu :** Document prêt pour signature ou archivage officiel.
- **Technologies utilisées :** REST API, bibliothèques de génération documentaire.

---

## 4. Parcours utilisateur complet

```
[1. Fin de la réunion -> Accès à /services-ia/comptes-rendus]
                          │
                          ▼
[2. Saisie ou collage des notes brutes / points clés dans la zone de texte]
                          │
                          ▼
[3. Clic sur "Générer le compte-rendu avec le consortium IA"]
                          │
                          ▼
[4. Streaming SSE en direct : Interventions successives des 3 agents]
    - Secrétaire de séance : Ordre du jour & participants
    - Auditeur des Décisions : Arbitrages & accords
    - Directeur des Opérations : RACI, dates et risques
                          │
                          ▼
[5. Affichage dynamique du procès-verbal structuré]
                          │
                          ▼
[6. Relecture des actions et vérification des échéances]
                          │
                          ▼
[7. Export en 1 clic au format PDF ou DOCX]
                          │
                          ▼
[8. Envoi immédiat aux participants par email]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle :** `qwen/qwen3.8-27b`
- **Moteur d'inférence :** Groq Cloud API
- **Structure :** Réponse JSON stricte décodée en temps réel.

### Prompt Système du Secrétariat Multi-Agents
```text
Tu es un consortium de directeurs d'entreprise préparant le compte-rendu officiel de réunion.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant rigoureusement ce schéma :
{
  "id": "meet_...",
  "date": "YYYY-MM-DD",
  "subject": "Titre explicite de la réunion",
  "participants": ["..."],
  "agenda": ["Point 1", "Point 2"],
  "executiveSummary": "Synthèse des arbitrages et priorités définies en séance...",
  "decisions": [
    {"decision": "Intitulé décision", "context": "Justification et consensus"}
  ],
  "actions": [
    {"task": "Action à mener", "assignee": "Rôle ou Nom", "deadline": "JJ/MM/AAAA", "status": "pending"}
  ],
  "risks": [
    {"risk": "Risque soulevé", "impact": "Low" | "Medium" | "High"}
  ]
}
```

---

## 6. Architecture technique

### Frontend
- **Composant principal :** `src/pages/ServicesIAMeetings.tsx`
- **Service API :** `src/lib/meetingReportService.ts`
- **Flux temps réel :** `EventSource` pour écoute des événements `agent_message` et `complete`.
- **Interface graphique :** TailwindCSS, Lucide Icons, Sonner Toasts.

### Backend
- **Endpoint streaming :** `public/api/meeting_agents.php` (et implémentation locale `vite-dev-api.ts`)
- **Endpoint upload :** `public/api/meeting_upload.php`
- **Endpoint historique :** `public/api/meeting_history.php`
- **Endpoint export :** `public/api/meeting_export.php`
- **Client IA :** `public/api/groq_client.php`

### Base de données
- Stockage des sessions de réunion, liaisons avec l'entreprise (`company_id`) et statut des actions d'exécution.

---

## 7. Architecture fonctionnelle

```
Générateur de Comptes-Rendus IA
│
├── Module de Saisie
│   ├── Éditeur de notes rapides
│   └── Téléversement de transcriptions
│
├── Consortium IA en Streaming
│   ├── Secrétaire de séance (Sujet, Agenda, Participants)
│   ├── Auditeur des Décisions (Consensus, Arbitrages)
│   └── Directeur des Opérations (Attribution des tâches, Échéances)
│
├── Visualiseur de Procès-Verbal
│   ├── Synthèse exécutive
│   ├── Registre formel des décisions
│   ├── Tableau RACI des actions
│   └── Cartographie des risques & vigilances
│
└── Module de Diffusion
    ├── Exporteur PDF officiel
    ├── Exporteur Word (.docx)
    └── Historique des réunions passées
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- Notes manuscrites numérisées, transcriptions vocales ou points de discussion bruts.
- Identifiant entreprise (`company_id`) pour l'isolation multi-tenant.

### Traitements
- Segmentation des propos par thématique.
- Identification des verbes d'action et des désignations de personnes ("Marc s'occupe de...", "Valider d'ici vendredi").
- Structuration et normalisation des dates relatives en dates formelles.

### Données sortantes
- Objet complet `MeetingReport` :
  - Métadonnées (id, date, sujet, participants, ordre du jour).
  - Synthèse managériale rédigée.
  - Liste d'actions assorties de leur responsable et date d'exigibilité.
  - Registre des décisions actées.
  - Liste des risques avec classification de criticité.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Réunion de cadrage projet Web
- **Utilisateur :** Julien, chef de projet digital.
- **Action :** Colle les 5 puces griffonnées pendant la réunion avec son client (validation maquettes, retard sur les textes, mise en ligne le 15 du mois prochain).
- **Traitement :** Les 3 agents analysent les puces.
- **Résultat :** L'application génère un compte-rendu formel :
  - *Décision :* Validation de la charte graphique V2 sans modification supplémentaire.
  - *Action 1 :* Rédiger les textes des 4 pages clés (Assignée à : Client, Échéance : 10 jours).
  - *Action 2 :* Intégrer les maquettes Figma validées (Assignée à : Équipe Dév, Échéance : 14 jours).
  - *Risque :* Risque moyen de glissement de planning si les textes ne sont pas livrés à temps.

### Exemple 2 : Comité de direction hebdomadaire
- **Utilisateur :** Béatrice, directrice générale adjointe.
- **Action :** Insère le verbatim de 45 minutes de discussion sur les recrutements et le budget matériel.
- **Traitement :** L'IA extrait la synthèse exécutive, fige les 3 recrutements validés et liste les 2 devis de matériel à signer par la direction financière.
- **Résultat :** Export immédiat en PDF partagé à l'ensemble du CODIR dans les 5 minutes suivant la fin de la réunion.

---

## 10. Valeur ajoutée

- **Suppression du délai de diffusion :** Les comptes-rendus sont envoyés 5 minutes après la réunion, au lieu de plusieurs jours d'attente.
- **Zéro déperdition d'information :** Chaque engagement oral est transformé en tâche assignée.
- **Image professionnelle renforcée :** Les clients et partenaires reçoivent des documents clairs et chartés.
- *Gain quantifié :* Économie estimée de 30 à 45 minutes par réunion tenue.

---

## 11. Limites actuelles

- **Transcription audio intégrée en direct (speech-to-text natif dans le navigateur) :** Fonctionnalité prévue / non implémentée (l'utilisateur fournit aujourd'hui les notes textuelles ou la retranscription).
- **Assignation automatique dans Trello / Jira / Notion via webhook :** Fonctionnalité prévue / non implémentée.
- **Reconnaissance biométrique vocale des intervenants :** Non disponible (les intervenants sont déduits du contexte textuel).

---

## 12. Évolutions possibles

### Déjà implémenté
- Saisie de notes et retranscriptions brutes.
- Moteur multi-agents en streaming SSE.
- Extraction structurée RACI (tâche, responsable, date, statut).
- Analyse des risques et registre des décisions.
- Export PDF et Word.

### Prévu mais non implémenté
- Module d'enregistrement vocal direct avec Whisper AI intégré.
- Synchronisation bi-directionnelle avec les calendriers Microsoft Outlook et Google Calendar.
- Envoi d'emails automatiques de rappel aux personnes assignées à une tâche à l'approche de la date limite.

### Proposition d'évolution
- Intégration d'un bot Teams / Google Meet qui assiste en direct à la réunion et génère automatiquement le compte-rendu à la fin de l'appel.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Transformez vos notes de réunion brouillonnes en un compte-rendu exécutif avec plan d'action RACI en moins de 30 secondes.

### Pitch en 30 secondes
Combien de réunions d'équipe se terminent dans le flou total, sans qu'aucun compte-rendu ne soit jamais rédigé ? Avec le Générateur de Comptes-Rendus IA de MDIV Business, collez simplement vos notes de séance. Notre consortium d'agents IA organise immédiatement la discussion : ordre du jour, synthèse, décisions actées et tableau complet des tâches avec responsables et dates limites. Fini la réunionite, place à l'action.

### Présentation en 1 minute
Dans toutes les entreprises, le même scénario se répète : on passe des heures en réunion, on prend des notes sur un coin de table, et une fois la porte refermée, personne ne prend le temps de rédiger un compte-rendu. Résultat : deux semaines plus tard, personne ne sait qui devait faire quoi, et les projets prennent du retard.
Le Générateur de Comptes-Rendus de Réunion IA de MDIV Business met fin à ce gaspillage d'énergie. En analysant vos notes orales ou écrites en quelques secondes, notre consortium d'agents intelligents produit un document officiel complet : synthèse managériale, décisions fermes, calendrier et tableau de répartition des rôles. Vos équipes savent exactement ce qu'elles ont à faire, et vos clients sont bluffés par votre rigueur.

### Problème
Les réunions sans écrit clair entraînent des retards d'exécution, des malentendus et font perdre un temps précieux en rédaction manuelle.

### Solution
Une IA qui convertit instantanément des notes brutes en un procès-verbal structuré orienté action et responsabilités.

### Fonctionnement
Collez vos notes -> Les agents IA structurent la séance en streaming -> Exportez le document PDF/Word et diffusez-le.

### Public cible
Managers, chefs de projet, consultants, directeurs et assistants de direction.

### Cas d'utilisation
Comités de direction, réunions de suivi de projet, bilans clients, ateliers de travail.

### Proposition de valeur
Divisez par 10 le temps de rédaction de vos comptes-rendus et garantissez l'exécution sans faille de vos projets.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan serré sur une feuille de papier remplie de gribouillis incompréhensibles, manager qui soupire devant son écran.
- **Texte à l'écran :** "Qui devait faire quoi déjà ?"
- **Voix off :** "Vous sortez d'une réunion de 2 heures... et personne ne va rédiger le compte-rendu ?"
- **Animation CapCut :** Zoom brusque + effet son "Ding" d'interrogation.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Deux collègues qui haussent les épaules lors d'une réunion suivante en disant "Ah bon, c'était à moi de le faire ?".
- **Texte :** "Le flou total post-réunion..."
- **Voix off :** "Sans trace écrite claire, les décisions s'évaporent et les projets prennent des semaines de retard."

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Interface MDIV Business "Comptes-Rendus IA" avec son design moderne et épuré.
- **Texte :** "Générateur de Comptes-Rendus IA"
- **Voix off :** "Voici le Générateur de Comptes-Rendus IA de MDIV Business : votre secrétaire de séance intelligent."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Collage rapide de 4 lignes de notes -> Clic sur "Générer" -> Animation des agents en streaming -> Apparition du tableau complet avec les colonnes Tâche, Responsable et Deadline.
- **Action utilisateur :** Collage, clic sur le bouton bleu, survol du tableau des actions.
- **Texte :** "De 4 notes brouillonnes à un plan d'action officiel"
- **Voix off :** "Collez vos notes brutes : nos agents IA extraient les décisions, assignent les tâches à chaque collaborateur et fixent les échéances automatiquement."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Plan d'action RACI automatisé.
- **Fonctionnalité 2 :** Détection proactive des risques.
- **Fonctionnalité 3 :** Export Word et PDF en 1 clic.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Le PDF officiel généré avec logo, prêt à être partagé, équipe souriante recevant le compte-rendu sur smartphone.
- **Texte :** "Envoyé 2 minutes après la réunion."
- **Voix off :** "Vos réunions deviennent enfin productives et vos collaborateurs savent exactement ce qu'ils doivent accomplir."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Essayez le Générateur de Comptes-Rendus sur mdiv-business.fr"
- **Voix off :** "Gagnez 45 minutes par réunion dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton cliquable "Tester gratuitement".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Page d'accueil des Services IA, clic sur la carte "Comptes-Rendus IA" (3 sec).
- **Capture 2 :** Zone de saisie : collage d'un texte court de prise de notes informelles (3 sec).
- **Capture 3 :** Clic sur le bouton de génération bleu avec effet d'onde (2 sec).
- **Capture 4 :** Défilement des bulles de streaming SSE montrant les messages des 3 agents (4 sec).
- **Capture 5 :** Zoom sur le bloc "Synthèse exécutive" et "Décisions validées" (3 sec).
- **Capture 6 :** Plan rapproché sur le tableau des actions montrant les badges d'assignation et dates (4 sec).
- **Capture 7 :** Clic sur "Exporter PDF" et ouverture du document généré (3 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Shorts / Reels) et 16:9 (LinkedIn).
- **Résolution :** 1080x1920 / 4K.
- **Durée totale :** 56 secondes.
- **Rythme :** Accéléré et percutant durant le problème, fluide et valorisant pendant la démo.
- **Transitions :** Effets "Volet rapide" et "Zoom progressif" sur les éléments clés du tableau d'actions.
- **Sous-titres :** Sous-titres bicolores dynamiques avec police "Montserrat Semi-Bold" au bas de la vidéo.
- **Effets audio :** Bruitages de dactylographie rapide, clic souris, et "Swoosh" de transition.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Combien de réunions se terminent sans compte-rendu ? Collez vos notes brutes, notre IA rédige le procès-verbal avec tâches et dates limites en 30 secondes. Essayez sur MDIV Business.

### Publicité LinkedIn
Pourquoi 60% des réunions d'entreprise ne débouchent sur aucune action concrète ?
Parce que rédiger un compte-rendu complet prend trop de temps, et que personne ne s'y colle.
Avec le **Générateur de Comptes-Rendus IA** de MDIV Business, transformez vos notes informelles en un procès-verbal parfait :
- Ordre du jour et synthèse managériale
- Registre formel des décisions
- Tableau complet des actions : Tâche, Responsable, Date limite
- Matrice des risques identifiés
Envoyez le compte-rendu à vos équipes avant même qu'elles n'aient quitté la salle.
Découvrez la démo en direct : [Lien MDIV Business]

### Publicité Instagram
Vos réunions ressemblent à ça ? "On se redit ça !" -> Et personne ne fait rien. Mettez fin au flou avec notre IA de compte-rendu instantané. Lien en bio.

### Publicité Facebook
Ne perdez plus 45 minutes à rédiger vos comptes-rendus après chaque réunion. Collez vos notes, notre IA s'occupe de tout : synthèse, décisions et plan d'action prêt à envoyer. Testez-le gratuitement sur MDIV Business.

### Description vidéo
Démonstration de notre Générateur de Comptes-Rendus IA : comment transformer des notes brouillonnes en plan d'action RACI en 30 secondes. #Productivité #Management #IA #MDIVBusiness

### CTA
"Rendez vos réunions enfin efficaces sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle automatise la rédaction intégrale des comptes-rendus de réunion à partir de simples notes manuscrites ou verbatims.
- **Comment les tâches sont-elles attribuées ?**
  L'IA détecte dans le texte les mentions de rôles, de prénoms ou de services, et les associe directement aux actions concrètes avec une date butoir calculée.
- **Peut-on modifier le compte-rendu généré ?**
  Oui, le document s'affiche sous forme modifiable et peut être affiné avant son export officiel en PDF ou Word.
- **L'application gère-t-elle l'anglais ?**
  Oui, l'IA s'adapte à la langue des notes saisies (français, anglais, etc.).
- **Quelles données sont sauvegardées ?**
  Les comptes-rendus générés sont rattachés au compte de votre entreprise pour vous permettre de consulter l'historique de vos réunions à tout moment.

---

# 19. FICHE COMMERCIALE

- **Nom :** Générateur de Comptes-Rendus de Réunion IA
- **Catégorie :** Productivité Managériale & Gestion de Projet
- **Public cible :** Managers, Chefs de Projet, Consultants, Cadres Dirigeants
- **Problème :** Réunions sans suite, absence d'engagements écrits et perte de temps en rédaction
- **Solution :** Consortium IA transformant des notes brutes en procès-verbaux structurés avec plan RACI
- **Fonctionnalités clés :** Streaming SSE multi-agents, matrice des actions avec assignataire et échéance, registre des décisions, export PDF/DOCX
- **Technologies IA :** Groq Cloud API, Qwen 3.8 27B, parsing JSON structuré
- **Type d'IA :** Traitement du langage naturel (NLP), raisonnement multi-agents
- **Cas d'utilisation :** COPIL, réunions d'équipe hebdomadaires, cadrage client, comités de direction
- **Valeur ajoutée :** Diffusion immédiate du compte-rendu, responsabilisation des équipes, 45 min économisées par réunion
- **Statut :** Opérationnel en production (route `/services-ia/comptes-rendus`)
- **CTA :** "Générez vos comptes-rendus en 1 clic sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Exemple de notes brutes prêt pour la démonstration
- [ ] Captures d'écran de l'interface et du tableau d'actions préparées
- [ ] Script vidéo prêt pour l'enregistrement
- [ ] Voix off enregistrée ou générée
- [ ] Montage CapCut effectué avec mise en valeur du plan d'action
- [ ] Sous-titres bicolores et animations ajoutés
- [ ] CTA clair intégré en fin de vidéo
- [ ] Versions 9:16 et 16:9 exportées
- [ ] Post LinkedIn prêt avec focus sur la "réunionite"
- [ ] Campagne Meta / Instagram paramétrée
