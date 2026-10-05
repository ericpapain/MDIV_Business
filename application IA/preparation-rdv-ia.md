# Préparation de Réunions IA (Briefing Stratégique Avant-Vente)

## 1. Résumé de l'application

- **Nom :** Préparation de Réunions IA (Coach Tactique & Briefing Avant-Vente)
- **Objectif :** Générer en quelques secondes un dossier de briefing complet pour aborder n'importe quel rendez-vous commercial ou stratégique en position de force, avec anticipation des objections et formulation des questions percutantes.
- **Problème résolu :** Arriver en rendez-vous client mal préparé par manque de temps, ignorer l'historique financier du client (factures impayées, devis refusés), subir les objections imprévues et rater la phase de découverte des besoins.
- **Utilisateurs concernés :** Ingénieurs commerciaux, directeurs d'agence, consultants, dirigeants de TPE/PME, négociateurs B2B.
- **Cas d'utilisation :** Préparer un rendez-vous de négociation contractuelle décisif en 3 minutes dans un taxi ou entre deux portes, anticiper les objections d'un prospect méfiant sur les prix, synthétiser l'historique d'un client fidèle avant son bilan annuel.
- **Valeur ajoutée :** Synthèse flash en "1 minute", croisement automatique avec l'historique comptable et commercial du CRM/ERP, anticipation des objections courantes et stratégie de posture commerciale.
- **Type d'application :** Application web SaaS d'aide à la négociation commerciale intégrant synchronisation de calendrier, lecture de base de données SQL et inférence LLM.
- **Niveau d'automatisation :** Semi-automatisé : détection automatique des rendez-vous inscrits à l'agenda ou saisie libre de la cible, génération instantanée du briefing par l'IA.
- **Rôle de l'IA :** Directeur avant-vente et coach en négociation stratégique modélisant les dynamiques relationnelles d'affaires pour armer le négociateur.

> **Description commerciale (2-3 phrases) :**
> N'arrivez plus jamais en rendez-vous client sans savoir exactement quoi dire. En 30 secondes, le module Préparation de Réunions IA analyse votre interlocuteur, croise son historique commercial et génère votre briefing stratégique complet : enjeux clés, objections probables et questions percutantes à poser. Arrivez en maître de la négociation et augmentez votre taux de closing.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Les meilleurs négociateurs ne sont pas ceux qui parlent le plus, mais ceux qui sont les mieux préparés. Pourtant, dans le quotidien d'un commercial ou d'un dirigeant, les réunions s'enchaînent sans répit. Prendre 45 minutes pour éplucher les anciens devis, vérifier les impayés et imaginer les objections est souvent impossible. Résultat : on improvise, et l'on perd des contrats évitables.

### Quel problème elle résout
1. **L'improvisation coûteuse :** Se faire déstabiliser par une objection sur les prix ou les délais que l'on aurait pu anticiper.
2. **La méconnaissance de l'historique client :** Proposer un nouveau projet à un client qui a justement une facture en litige non réglée.
3. **Le manque de questions ouvertes percutantes :** Monopoliser la parole au lieu de faire exprimer les véritables douleurs et motivations d'achat du prospect.

### Dans quel contexte elle est utilisée
- 10 minutes avant un rendez-vous commercial, physique ou en visioconférence.
- Lors de la préparation d'une soutenance d'appel d'offres face à un jury d'achat.
- Lors des comités de revue de comptes clés (*Key Account Review*).

### Quels utilisateurs peuvent l'utiliser
- Commerciaux terrain et grands comptes (Account Executives).
- Dirigeants d'entreprise rencontrant des prospects stratégiques.
- Consultants et chefs de projet en avant-vente.

### Quelles tâches elle permet de réaliser
- Synchroniser les rendez-vous à venir depuis Microsoft Outlook / Teams ou renseigner manuellement le contexte.
- Interroger la base de données pour afficher l'historique du client : devis ouverts, factures impayées, chiffre d'affaires cumulé.
- Générer un briefing complet en 9 blocs stratégiques via l'IA :
  1. *One-Liner Summary* (synthèse en 1 phrase à retenir impérativement).
  2. Résumé de la situation client.
  3. Opportunités identifiées.
  4. Risques opérationnels et relationnels.
  5. Objections probables et contre-arguments recommandés.
  6. Questions ouvertes d'exploration puissantes.
  7. Stratégie de découverte et posture d'écoute.
  8. Objectif minimum vs Objectif idéal de la réunion.
  9. Actions immédiates à valider avant de quitter la pièce.

---

## 3. Fonctionnalités complètes

### 1. Synchronisation des Réunions du Calendrier (Outlook / Teams)
- **Objectif :** Récupérer automatiquement son planning sans saisie redondante.
- **Ce que fait l'utilisateur :** Consulte la liste "Rendez-vous à venir".
- **Ce que fait l'application :** Appelle `upcoming_meetings.php` et liste les réunions planifiées avec nom du contact, date, heure et canal.
- **Ce que fait l'IA :** N/A.
- **Résultat obtenu :** Sélection en 1 clic de la réunion à préparer.
- **Technologies utilisées :** REST API, TypeScript interfaces.

### 2. Réconciliation Historique Client & Créances (CRM / ERP)
- **Objectif :** Éviter les impairs en intégrant la réalité financière de la relation client.
- **Ce que fait l'utilisateur :** Sélectionne un client existant.
- **Ce que fait l'application :** Interroge `meeting_history.php?client_id=X` et extrait le volume des devis en attente, le montant des factures impayées et l'historique des interactions passées.
- **Ce que fait l'IA :** Intègre ces données financières comme contraintes directes dans le briefing.
- **Résultat obtenu :** Vue d'ensemble financière claire et alertes immédiates en cas de créance en retard.
- **Technologies utilisées :** Requêtes SQL relationnelles, API PHP.

### 3. Moteur IA de Génération de Briefing Stratégique
- **Objectif :** Rédiger un guide d'entretien sur-mesure pour remporter la négociation.
- **Ce que fait l'utilisateur :** Ajuste l'objectif visé (ex: "Valider la signature du contrat annuel") et clique sur "Générer le briefing IA".
- **Ce que fait l'application :** Transmet la requête à `meeting_prep_generate.php`.
- **Ce que fait l'IA :** Le modèle Groq Qwen 3.8 se glisse dans le rôle d'un directeur d'avant-vente et livre un dossier décomposé en 9 rubriques tactiques indispensables.
- **Résultat obtenu :** Affichage d'un tableau de bord de préparation aéré, structuré et immédiatement lisible.
- **Technologies utilisées :** Groq Cloud API, LLM Qwen 3.8 27B, parsing JSON.

### 4. Matrice "Objectif Idéal vs Objectif Minimum"
- **Objectif :** Donner un cadre de négociation clair au commercial pour ne jamais repartir les mains vides.
- **Ce que fait l'utilisateur :** Consulte le bloc des objectifs.
- **Ce que fait l'application :** Affiche la distinction entre :
  - **L'objectif idéal :** La signature ferme du contrat ou l'accord budgétaire complet.
  - **L'objectif minimum acceptable (*BATNA*) :** Fixer une date pour la présentation à la direction générale ou obtenir le cahier des charges technique.
- **Technologies utilisées :** Composants React, Lucide Icons.

### 5. Simulateur d'Objections et Réponses Clés
- **Objectif :** Désarmer les réticences du client avant même qu'il ne les formule.
- **Ce que fait l'utilisateur :** Parcourt la liste des objections probables.
- **Ce que fait l'application :** Présente chaque objection avec la réplique argumentative recommandée formulée par l'IA.
- **Technologies utilisées :** Cartes TailwindCSS, badges d'alerte.

---

## 4. Parcours utilisateur complet

```
[1. Accès au module /services-ia/prepa-reunion]
                         │
                         ▼
[2. Choix d'un rendez-vous synchronisé OU Saisie d'une réunion manuelle]
                         │
                         ▼
[3. Affichage instantané de l'historique client (Devis ouverts, Factures impayées)]
                         │
                         ▼
[4. Définition de l'objectif prioritaire (ex: Signature de l'offre V2)]
                         │
                         ▼
[5. Clic sur "Générer le briefing stratégique IA"]
                         │
                         ▼
[6. Inférence IA en ~1,5 seconde via Groq / Qwen 3.8]
                         │
                         ▼
[7. Découverte du briefing complet en 9 blocs tactiques]
    - One-Liner Summary (mémorisation rapide)
    - Risques & Opportunités
    - Objections probables & Arguments
    - Questions d'écoute active
    - Objectif idéal vs Objectif plancher
                         │
                         ▼
[8. Répétition mentale en 2 minutes avant le début de l'entretien]
                         │
                         ▼
[9. Entrée en réunion avec maîtrise totale du sujet]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle :** `qwen/qwen3.8-27b`
- **Moteur d'inférence :** Groq Cloud API LPU
- **Structure :** Sortie sous format JSON structuré strict.

### Prompt Système du Coach Avant-Vente
```text
Tu es un coach en négociation stratégique et directeur d'avant-vente pour MDIV Business.
Rédige un briefing d'avant-RDV complet et immédiatement exploitable par le commercial ou dirigeant.
Tu dois répondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  "oneLinerSummary": "Synthèse en une phrase de l'enjeu capital de ce rendez-vous.",
  "clientSummary": "Résumé concis de la situation du client et de ses attentes prioritaires.",
  "opportunities": ["Opportunité 1", "Opportunité 2"],
  "risks": ["Risque 1 à anticiper", "Risque 2"],
  "probableObjections": ["Objection prévisible (ex: coût, délais, sécurité) et comment y répondre."],
  "recommendedQuestions": ["Question ouverte percutante 1", "Question 2"],
  "discoveryStrategy": "Conseil tactique d'écoute active et de posture commerciale...",
  "meetingObjectives": ["Objectif minimum : ...", "Objectif idéal : ..."],
  "recommendedActions": ["Action immédiate à engager à la fin du RDV"]
}
```

---

## 6. Architecture technique

### Frontend
- **Page :** `src/pages/ServicesIAMeetingPrep.tsx`
- **Service API :** `src/lib/meetingPrepService.ts`
- **Composants d'interface :** `EnterpriseAuthBar`, `sonner` (toasts), cartes tactiques `lucide-react`
- **Gestion d'état :** React Hooks (`useState`, `useEffect`)

### Backend
- **Endpoint génération briefing :** `public/api/meeting_prep_generate.php` (et son émulation dans `vite-dev-api.ts`)
- **Endpoint réunions à venir :** `public/api/upcoming_meetings.php`
- **Endpoint historique client :** `public/api/meeting_history.php`
- **Client IA :** `public/api/groq_client.php`

### Base de données
- Requêtes sur les tables `clients`, `quotes` et `invoices` pour agréger l'historique financier et relationnel avant l'appel IA.

---

## 7. Architecture fonctionnelle

```
Préparation de Réunions IA
│
├── Détection & Contexte
│   ├── Connecteur calendrier Outlook/Teams
│   ├── Saisie manuelle de notes d'avant-vente
│   └── Requête d'historique CRM (devis & créances)
│
├── Moteur de Raisonnement Avant-Vente
│   ├── Cadrage des enjeux psychologiques
│   ├── Anticipation des objections
│   └── Formulation de questions de découverte
│
└── Console de Briefing Tactique
    ├── Synthèse Flash "1 Minute"
    ├── Matrice Risques / Opportunités
    ├── Questions recommandées
    ├── Stratégie de posture d'écoute
    └── Cadre d'arbitrage : Objectif Idéal vs Minimum
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- `clientName` : Raison sociale ou nom du prospect.
- `meetingDate` : Date de la séance.
- `meetingContext` : Notes préparatoires ou informations glanées en amont.
- `meetingObjective` : But recherché (premier contact, closing, renégociation).
- Données SQL : montant total facturé, devis en cours, solde impayé.

### Traitements
- Concaténation de l'historique et des consignes.
- Inférence LLM Qwen 3.8 en mode JSON.
- Contrôle de cohérence des 9 clés du briefing.

### Données sortantes
- Objet complet `MeetingBriefing` :
  - `oneLinerSummary` : La phrase clé résumant l'enjeu du rendez-vous.
  - `clientSummary` : Le profil du client.
  - `opportunities` et `risks` : Les facteurs d'influence.
  - `probableObjections` : Les points de friction anticipés.
  - `recommendedQuestions` : Les leviers d'exploration.
  - `discoveryStrategy` : La posture conseillée.
  - `meetingObjectives` : Les buts chiffrés ou qualifiés.
  - `recommendedActions` : Le livrable de sortie d'entretien.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Rendez-vous de closing avec un client exigeant
- **Utilisateur :** Sébastien, directeur commercial d'une société de services IT.
- **Client :** "Groupe Logistique Alpha" (devis de 18 500 € en attente depuis 3 semaines).
- **Briefing généré par l'IA :**
  - *One-Liner :* "Le client veut moderniser sa flotte mais hésite sur la complexité de prise en main pour ses chauffeurs."
  - *Objection anticipée :* "Vos concurrents proposent une interface plus simple." -> *Réponse IA :* "Mettre en avant nos 3 sessions de formation sur site incluses et notre support hotline 6j/7."
  - *Question percutante :* "Combien d'heures par semaine vos dispatcheurs perdent-ils aujourd'hui à saisir les plannings à la main ?"
  - *Objectif minimum :* Obtenir la date exacte de réunion de leur comité d'engagement budgétaire.

### Exemple 2 : Premier rendez-vous de découverte prospect
- **Utilisateur :** Marine, consultante en transition écologique.
- **Briefing généré :** L'IA conseille une posture 100% consultative avec 4 questions ouvertes centrées sur les obligations réglementaires du secteur agroalimentaire, et prévient du risque de paraître donneur de leçons.

---

## 10. Valeur ajoutée

- **Confiance et posture de force :** Le commercial arrive serein, sans risque de trou de mémoire ou d'hésitation.
- **Hausse mesurable du taux de closing :** Des questions chirurgicales qui touchent directement les besoins profonds du client.
- **Zéro impair relationnel :** Le commercial sait immédiatement si le client a un litige en cours avec la comptabilité avant de lui sourire.
- *Gain quantifié :* Économie de 20 à 30 minutes de préparation manuelle par rendez-vous.

---

## 11. Limites actuelles

- **Scraping automatique du profil LinkedIn du prospect :** Fonctionnalité prévue / non implémentée (l'utilisateur fournit le contexte ou sélectionne le client existant).
- **Enregistrement audio en direct pendant le RDV :** Le module de préparation s'arrête avant le RDV (le relais est pris après la séance par le Générateur de Comptes-Rendus IA).
- **Synchronisation automatique avec Google Calendar :** Actuellement axé sur les calendriers Microsoft 365 / Outlook ou la saisie manuelle.

---

## 12. Évolutions possibles

### Déjà implémenté
- Synchronisation des RDV calendrier.
- Réconciliation avec les factures et devis de la base de données.
- Génération complète du briefing en 9 rubriques par Groq Qwen 3.8.
- Fiche de synthèse "1 minute" imprimable.

### Prévu mais non implémenté
- Fiche mémo envoyée par notification Push ou SMS 15 minutes avant le début du rendez-vous sur le smartphone du commercial.
- Intégration de l'enrichissement automatique des profils LinkedIn des participants.

### Proposition d'évolution
- Mode "Jeu de rôle IA" permettant au commercial de simuler le rendez-vous vocalement avec l'IA qui joue le rôle du prospect difficile avant le vrai rendez-vous.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Arrivez à chaque rendez-vous commercial en position de force grâce à un briefing IA complet généré en 30 secondes.

### Pitch en 30 secondes
Vous avez un rendez-vous client dans 10 minutes et vous n'avez pas eu le temps de réviser votre dossier ? Avec le module Préparation de Réunions IA de MDIV Business, obtenez instantanément un briefing d'avant-vente stratégique : historique du client, objections probables, questions clés à poser et stratégie d'écoute. Transformez chaque rendez-vous en contrat signé.

### Présentation en 1 minute
Dans la vente B2B, l'improvisation ne pardonne pas. Face à des acheteurs avertis, le moindre signe d'hésitation ou une objection mal anticipée peut vous faire perdre des mois d'efforts commerciaux.
Le module Préparation de Réunions IA agit comme un coach d'avant-vente personnel dans votre poche. Connecté à votre calendrier et à vos données commerciales, il analyse votre interlocuteur et vous dresse un briefing chirurgical en 30 secondes. Vous découvrez la synthèse de l'enjeu en une phrase, les pièges à éviter, les questions ouvertes percutantes qui font mouche et les répliques parfaites à toutes les objections. Vous n'entrez plus jamais en réunion pour subir : vous menez l'échange et vous maximisez vos chances de closing.

### Problème
Le manque de temps empêche les commerciaux de bien préparer leurs réunions, ce qui engendre des maladresses et fait chuter les taux de conversion.

### Solution
Un coach IA d'avant-vente qui génère en quelques secondes un briefing stratégique avec anticipation des objections et questions clés.

### Fonctionnement
Sélectionnez le rendez-vous à votre agenda -> L'IA analyse l'historique et génère le briefing -> Mémorisez les points clés en 2 minutes.

### Public cible
Commerciaux, directeurs d'agence, consultants, dirigeants d'entreprise et négociateurs.

### Cas d'utilisation
Closing commercial, renégociation de contrats, premier entretien de cadrage, comités de direction.

### Proposition de valeur
Arrivez parfaitement armé, éliminez le stress de l'improvisation et signez plus de contrats.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Commercial dans un taxi ou marchant dans un couloir, regardant sa montre avec angoisse, les mains moites.
- **Texte à l'écran :** "RDV client dans 5 minutes... et rien de préparé ?"
- **Voix off :** "Votre rendez-vous client commence dans 5 minutes et vous n'avez pas eu le temps d'ouvrir le dossier ?"
- **Animation CapCut :** Zoom caméra vif + son de tic-tac d'horloge accéléré.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Le client pose une question piège sur les prix en fronçant les sourcils, le commercial bafouille.
- **Texte :** "Le piège de l'improvisation..."
- **Voix off :** "Improviser face à un client exigeant, c'est le meilleur moyen de perdre le contrat."

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Smartphone affichant le briefing MDIV Business "Préparation de Réunions IA" avec son design clair et structuré.
- **Texte :** "Préparation de Réunions IA"
- **Voix off :** "Voici Préparation de Réunions IA de MDIV Business : votre coach d'avant-vente de poche."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Clic sur la réunion "Groupe Alpha" -> Clic sur Générer -> Apparition instantanée du briefing en 9 rubriques avec les cartes d'objections et les questions percutantes.
- **Action utilisateur :** Sélection de la réunion, clic de génération, lecture de la synthèse en 1 minute.
- **Texte :** "Synthèse en 1 minute • Objections anticipées • Questions clés"
- **Voix off :** "En 20 secondes, l'IA résume les enjeux capitaux, anticipe les objections du prospect et vous souffle les questions parfaites à poser."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Synthèse flash mémorisable en 1 minute.
- **Fonctionnalité 2 :** Analyse croisée des devis et factures impayées.
- **Fonctionnalité 3 :** Cadrage Objectif Idéal vs Objectif Minimum.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Poignée de main chaleureuse entre le commercial confiant et le client souriant qui signe le contrat.
- **Texte :** "Maîtrise totale. Contrat signé."
- **Voix off :** "Vous entrez en réunion serein, vous menez l'échange d'une main de maître et vous concluez vos ventes."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Testez la préparation IA sur mdiv-business.fr"
- **Voix off :** "Révolutionnez votre approche commerciale dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton clignotant "Essai sans engagement".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Navigation vers `/services-ia/prepa-reunion`, présentation de l'interface (3 sec).
- **Capture 2 :** Clic sur une réunion synchronisée dans la liste des rendez-vous à venir (2 sec).
- **Capture 3 :** Zoom sur les données historiques du client (devis en cours et chiffre d'affaires) (3 sec).
- **Capture 4 :** Clic sur "Générer le briefing stratégique IA" avec loader rapide (2 sec).
- **Capture 5 :** Zoom sur le bandeau doré "Synthèse en 1 minute" (4 sec).
- **Capture 6 :** Défilement de la liste des objections probables et des questions d'exploration conseillées (4 sec).
- **Capture 7 :** Plan sur les deux blocs "Objectif idéal" et "Objectif minimum" (3 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Reels / TikTok / Shorts) et 16:9 (LinkedIn).
- **Résolution :** 1080x1920 / 4K.
- **Durée totale :** 56 secondes.
- **Rythme :** Très rythmé au hook, clair et précis durant la présentation des cartes de briefing.
- **Sous-titres :** Sous-titres bicolores dynamiques synchronisés au bas de l'écran avec mise en valeur des textes en jaune et blanc.
- **Effets :** Effet "Light Flash" lors de l'apparition du briefing d'avant-vente.
- **Musique :** Piste corporate dynamique et stimulante.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Vous avez un rendez-vous client dans 10 minutes ? Obtenez votre briefing stratégique en 30 secondes : enjeux clés, objections anticipées et questions percutantes sur MDIV Business.

### Publicité LinkedIn
Pourquoi les meilleurs commerciaux gagnent-ils plus de contrats ?
Parce qu'ils ne laissent rien au hasard.
Grâce au module **Préparation de Réunions IA** de MDIV Business :
1. Sélectionnez votre rendez-vous client à votre agenda.
2. L'IA croise vos données financières et analyse la situation de l'interlocuteur.
3. Vous obtenez un briefing en 9 points :
- La synthèse en 1 minute
- Les objections prévisibles et vos contre-arguments
- Les 3 questions puissantes pour débloquer la vente
- Votre objectif minimum garanti
N'entrez plus jamais en réunion pour subir. Menez la danse.
Testez l'application gratuitement : [Lien MDIV Business]

### Publicité Instagram
Fini le stress de ne pas savoir quoi dire en rendez-vous commercial ! Votre coach IA vous briefe en 30 secondes chrono. Lien en bio !

### Publicité Facebook
Transformez vos rendez-vous commerciaux en succès ! Notre IA analyse votre prospect et prépare vos arguments clés avant chaque réunion. Essai gratuit sur MDIV Business.

### Description vidéo
Démonstration de notre outil de Préparation de Réunions IA : comment obtenir un briefing d'avant-vente complet en 30 secondes pour maximiser son closing. #Vente #Négociation #Sales #B2B #IA

### CTA
"Préparez vos réunions stratégiques sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle produit un dossier de briefing complet avant un rendez-vous commercial ou stratégique pour aider le négociateur à cadrer ses objectifs et anticiper les objections.
- **D'où viennent les informations du client ?**
  Elles sont issues de votre base de données commerciale (devis, factures impayées, CA) et complétées par vos notes préparatoires.
- **Combien de temps faut-il pour lire le briefing ?**
  Le briefing est conçu pour être assimilé en 2 à 3 minutes grâce à un résumé en 1 phrase et des rubriques à puces claires.
- **Puis-je l'utiliser pour des réunions internes ?**
  Oui, l'outil s'adapte aussi bien à une négociation client qu'à un point de cadrage avec un partenaire ou une réunion de direction interne.
- **Mes données d'avant-vente sont-elles confidentielles ?**
  Absolument, toutes les informations restent confinées dans votre espace entreprise privé.

---

# 19. FICHE COMMERCIALE

- **Nom :** Préparation de Réunions IA
- **Catégorie :** Vente B2B, Négociation Stratégique & Coaching Commercial
- **Public cible :** Commerciaux, Dirigeants d'entreprise, Négociateurs B2B, Consultants
- **Problème :** Manque de préparation avant les rendez-vous clients menant à des échecs de négociation
- **Solution :** Coach IA d'avant-vente générant un briefing tactique complet en 30 secondes
- **Fonctionnalités clés :** Synchronisation calendrier, réconciliation SQL devis/factures, synthèse flash 1 minute, simulateur d'objections
- **Technologies IA :** Groq Cloud API, LLM Qwen 3.8 27B, parsing JSON structuré
- **Type d'IA :** Traitement automatique du langage naturel (NLP), stratégie commerciale
- **Cas d'utilisation :** Négociation contractuelle, closing, rendez-vous de découverte, revues de comptes clés
- **Valeur ajoutée :** Hausse du taux de conversion, élimination du stress d'improvisation, 25 min gagnées par RDV
- **Statut :** Opérationnel en production (route `/services-ia/prepa-reunion`)
- **CTA :** "Préparez vos prochains RDV avec l'IA sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Réunion test configurée dans le planning avec notes préparatoires
- [ ] Captures d'écran du briefing et des fiches d'objections prêtes
- [ ] Script vidéo validé pour l'enregistrement
- [ ] Voix off enregistrée ou générée
- [ ] Montage CapCut effectué avec animations des cartes d'objectifs
- [ ] Effets sonores et sous-titres bicolores synchronisés
- [ ] Appel à l'action visuel inséré en fin de vidéo
- [ ] Formats 9:16 et 16:9 exportés
- [ ] Publication LinkedIn prête pour la diffusion
- [ ] Campagne Meta paramétrée
