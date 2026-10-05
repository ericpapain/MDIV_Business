# Calculateur de ROI IA (Simulateur Financier d'Automatisation)

## 1. Résumé de l'application

- **Nom :** Calculateur de ROI IA (Simulateur Financier & d'Impact Opérationnel)
- **Objectif :** Estimer avec précision les gains financiers, les heures économisées et le délai de retour sur investissement (*payback period*) de l'intégration de l'intelligence artificielle sur un processus métier.
- **Problème résolu :** La difficulté pour un dirigeant ou DAF d'objectiver la rentabilité d'un investissement en intelligence artificielle, l'hésitation face aux coûts des licences, et le manque de métriques tangibles avant de lancer un projet de transformation.
- **Utilisateurs concernés :** Directeurs Généraux, Directeurs Administratifs et Financiers (DAF), Directeurs de la Transformation Digitale, consultants et auditeurs.
- **Cas d'utilisation :** Justifier le budget d'un projet d'automatisation de la facturation auprès du comité de direction, comparer le coût d'une licence IA au temps passé par une équipe de 3 personnes sur des tâches répétitives, mesurer la rentabilité d'un chatbot de support client.
- **Valeur ajoutée :** Modélisation financière transparente à 12 mois, calcul mathématique rigoureux des Équivalents Temps Plein (ETP) libérés, recommandations technologiques adaptées au processus audité.
- **Type d'application :** Simulateur d'aide à la décision financière et outil d'acquisition commercial B2B (*lead magnet*) interactif.
- **Niveau d'automatisation :** Calcul instantané 100% automatisé à partir des hypothèses opérationnelles saisies par l'utilisateur.
- **Rôle de l'IA :** Modélisation algorithmique financière déterministe combinée à un système expert de préconisations technologiques selon la fonction métier ciblée.

> **Description commerciale (2-3 phrases) :**
> Combien l'intelligence artificielle peut-elle réellement rapporter à votre entreprise ? Grâce au Simulateur de ROI IA de MDIV Business, calculez en 3 minutes vos économies financières annuelles, vos heures de travail récupérées et votre délai d'amortissement exact. Prenez vos décisions d'investissement sur des chiffres concrets, pas sur des promesses.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
L'intelligence artificielle suscite beaucoup d'enthousiasme, mais les décideurs restent méfiants : "Est-ce un effet de mode ou un vrai levier de rentabilité ? Combien cela va-t-il me coûter et surtout, quand aurai-je rentabilisé mon investissement ?" Sans chiffres précis adaptés à sa réalité d'entreprise, un dirigeant préfère souvent ne rien faire.

### Quel problème elle résout
1. **L'opacité financière :** Manque d'indicateurs clairs liant taux horaire interne, volume d'heures gaspillées et coût des licences IA.
2. **Le blocage budgétaire :** Difficulté pour les responsables de projets à convaincre leur direction financière sans dossier de rentabilité étayé.
3. **Le flou des solutions à déployer :** Incapacité à identifier les cas d'usage prioritaires par département (Support client, Finance, Marketing, Opérations).

### Dans quel contexte elle est utilisée
- En phase de cadrage d'un projet d'automatisation ou de transformation digitale.
- Lors de la préparation des arbitrages budgétaires annuels.
- En rendez-vous commercial par un consultant pour prouver la rentabilité de sa proposition.

### Quels utilisateurs peuvent l'utiliser
- Dirigeants de TPE/PME et ETI.
- Directeurs Financiers et contrôleurs de gestion.
- Cabinets de conseil accompagnant la digitalisation de leurs clients.

### Quelles tâches elle permet de réaliser
- Renseigner la fiche d'identité de l'entreprise (Secteur, Effectif, Pays).
- Sélectionner le processus métier à auditer (Support client, Finance/Facturation, Marketing, Opérations/RH).
- Ajuster les leviers opérationnels : nombre de collaborateurs concernés, heures hebdomadaires dédiées, coût horaire moyen chargé, pourcentage estimé d'automatisation et budget mensuel envisagé pour les outils IA.
- Générer instantanément le rapport financier complet avec calcul du ROI (%), des économies mensuelles et annuelles, du coût total cumulé et de la période d'amortissement en mois.
- Visualiser la courbe de rentabilité cumulée sur 12 mois (Économies vs Coûts vs Bénéfice net).
- Consulter les 5 actions technologiques concrètes recommandées pour le processus audité.

---

## 3. Fonctionnalités complètes

### 1. Wizard Multi-Étapes Ergonomique
- **Objectif :** Guider l'utilisateur sans le noyer sous des formulaires financiers complexes.
- **Ce que fait l'utilisateur :** Progresse à travers 4 étapes claires grâce à un stepper visuel animé :
  - **Étape 1 : Entreprise :** Nom, secteur d'activité, taille de la structure, pays.
  - **Étape 2 : Processus :** Sélection du domaine fonctionnel clé (Support client, Finance, Marketing, Opérations).
  - **Étape 3 : Métriques Opérationnelles :** Paramétrage précis des curseurs.
  - **Étape 4 : Coordonnées & Rapport Exécutif :** Restitution complète des indicateurs.
- **Ce que fait l'application :** Stocke l'état dans l'objet partagé `ROIFormData` et anime les transitions via Framer Motion.
- **Technologies utilisées :** React, Framer Motion, TailwindCSS, TypeScript.

### 2. Moteur Mathématique de Modélisation Financière
- **Objectif :** Fournir des calculs rigoureux, incontestables et conformes aux méthodes d'audit de gestion.
- **Ce que fait l'utilisateur :** Modifie dynamiquement les curseurs (ex: taux horaire à 35 €/h, automatisation à 60%).
- **Ce que fait l'application :** Exécute la fonction pure `computeROIMetrics(data)` :
  - **Temps économisé mensuel :** `Collaborateurs × Heures/Semaine × 4,33 × (Taux d'automatisation / 100)`
  - **Temps économisé annuel :** `Temps mensuel × 12`
  - **Économie financière mensuelle :** `Temps mensuel économisé × Taux horaire moyen`
  - **Économie financière annuelle :** `Économie mensuelle × 12`
  - **Coût annuel de l'IA :** `Budget mensuel IA × 12`
  - **Retour sur investissement (ROI %) :** `((Économies annuelles - Coût IA annuel) / Coût IA annuel) × 100`
  - **Délai d'amortissement (*Payback*) :** `(Coût annuel IA / Économies annuelles) × 12` (en mois)
- **Résultat obtenu :** Des résultats chiffrés actualisés en temps réel à chaque déplacement de curseur.
- **Technologies utilisées :** Algorithmes mathématiques TypeScript, `Intl.NumberFormat` pour le formatage monétaire officiel en euros.

### 3. Graphique Prévisionnel de Rentabilité à 12 Mois
- **Objectif :** Démontrer visuellement le point de bascule vers le bénéfice net.
- **Ce que fait l'utilisateur :** Analyse le graphique de projection.
- **Ce que fait l'application :** Génère un jeu de données 12 mois via `buildChartData` confrontant :
  - Les économies de productivité cumulées.
  - Les dépenses cumulées en licences et services.
  - La courbe de profit net généré mois après mois.
- **Technologies utilisées :** Composants de visualisation de données SVG / CSS et modélisation séquentielle.

### 4. Diagnostic Stratégique et Recommandations Métier
- **Objectif :** Traduire les chiffres bruts en plan d'action opérationnel concret.
- **Ce que fait l'utilisateur :** Consulte le badge d'interprétation et la liste des outils conseillés.
- **Ce que fait l'application :** Évalue le ROI obtenu :
  - `ROI > 300%` : "Excellent potentiel de rentabilité" (vert émeraude).
  - `100% <= ROI <= 300%` : "Projet très rentable" (bleu saphir).
  - `ROI < 100%` : "Analyse complémentaire recommandée" (ambre d'alerte).
  Incorpore dynamiquement les 5 projets prioritaires selon le métier sélectionné (ex: pour la Finance : extraction OCR de factures, rapprochement bancaire, prédiction des retards).
- **Technologies utilisées :** Fonctions décisionnelles `getRoiInterpretation` et `getRecommendations`.

### 5. Impression et Restitution Exécutive
- **Objectif :** Permettre l'archivage ou la présentation du rapport en réunion de direction.
- **Ce que fait l'utilisateur :** Consulte le récapitulatif détaillé sous format de rapport de direction.
- **Ce que fait l'application :** Prépare la vue imprimable et intègre les informations de contact pour accompagnement personnalisé.
- **Technologies utilisées :** HTML Print CSS, responsive layouts.

---

## 4. Parcours utilisateur complet

```
[1. Arrivée sur /services-ia/calc-roi]
                   │
                   ▼
[2. Étape 1 : Renseignement de l'entreprise (Nom, Secteur, Effectif, Pays)]
                   │
                   ▼
[3. Étape 2 : Choix du processus clé (ex: Finance & Facturation)]
                   │
                   ▼
[4. Étape 3 : Réglage des leviers (2 personnes, 8h/semaine, 30 €/h, 50% d'automatisation, 150 €/mois IA)]
                   │
                   ▼
[5. Étape 4 : Qualification (Nom, Email, Téléphone)]
                   │
                   ▼
[6. Calcul instantané et génération du Rapport de Rentabilité]
                   │
                   ▼
[7. Découverte des résultats clés : 415h économisées/an, 12 480 € d'économies, ROI de +593%, amorti en 1,7 mois]
                   │
                   ▼
[8. Consultation de la trajectoire financière à 12 mois]
                   │
                   ▼
[9. Découverte des 5 cas d'usage IA recommandés pour la Finance]
```

---

## 5. Comment fonctionne l'IA ?

### Type de Moteur
- Contrairement aux modules génératifs de texte, le Calculateur de ROI repose sur une **IA algorithmique financière et décisionnelle déterministe** :
  1. Modèle actuariel d'évaluation de la productivité humaine convertie en valeur monétaire.
  2. Système expert à base de règles pour l'interprétation du niveau de rentabilité et la recommandation des cas d'usage par domaine métier.
- Ce choix garantit une **rigueur mathématique absolue à 100%**, indispensable pour convaincre des directeurs administratifs et financiers (DAF) qui rejetteraient les approximations probabilistes d'un LLM non cadré.

---

## 6. Architecture technique

### Frontend
- **Page racine :** `src/pages/ServicesIACalcROI.tsx`
- **Composants du wizard :** `src/components/calc-roi/ROIWizardSteps.tsx` (`StepCompany`, `StepProcess`, `StepMetrics`, `StepLead`)
- **Composant de restitution :** `src/components/calc-roi/ROIReport.tsx`
- **Moteur utilitaire :** `src/components/calc-roi/roiUtils.ts`
- **Animations :** `framer-motion`
- **Icônes :** `lucide-react` (`Calculator`, `TrendingUp`, `Clock`, `Euro`, `ShieldCheck`)

### Backend & Données
- Application front-end autonome ultra-réactive ne nécessitant aucune latence réseau pour la boucle de calcul.
- Sauvegarde optionnelle des prospects générés (*leads*) vers la base de données centrale via l'API pour relance commerciale par les équipes MDIV Business.

---

## 7. Architecture fonctionnelle

```
Calculateur de ROI IA
│
├── Entonnoir de Qualification
│   ├── Identité de l'entreprise & Secteur
│   └── Sélection du processus d'automatisation
│
├── Paramétrage des Métriques
│   ├── Volume d'heures humaines affectées
│   ├── Coût horaire chargé du personnel
│   ├── Hypothèse d'automatisation (curseur 10% - 90%)
│   └── Coût estimé des licences et services IA
│
├── Moteur Algorithmique Financier
│   ├── Calcul des heures et ETP économisés
│   ├── Calcul des économies brutes et nettes
│   ├── Taux de ROI et Payback en mois
│   └── Modélisation de la trajectoire à 12 mois
│
└── Restitution Décisionnelle
    ├── Cartes de synthèse financière
    ├── Graphique des gains nets cumulés
    ├── Interprétation stratégique
    └── Pack de recommandations technologiques
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- `companyName`, `sector`, `employees`, `country`.
- `process` : Domaine opérationnel étudié.
- `employeesTask` : Nombre d'employés assignés à la tâche répétitive.
- `hoursPerWeek` : Heures hebdomadaires consacrées par collaborateur.
- `avgHourlyRate` : Taux horaire brut chargé moyen (en €).
- `automationPercent` : Pourcentage des tâches automatisables par l'IA.
- `aiMonthlyCost` : Budget mensuel prévisionnel pour les outils IA.

### Traitements
- Calcul des volumes horaires mensuels et annuels.
- Évaluation du cash-flow net dégagé.
- Modélisation du seuil de rentabilité (*break-even point*).

### Données sortantes
- `annualSavedTime` : Volume total d'heures libérées par an.
- `annualSavings` : Économie financière annuelle brute générée.
- `roi` : Taux de retour sur investissement net en pourcentage.
- `paybackPeriodMonths` : Durée exacte d'amortissement de l'investissement.
- Matrice des 5 technologies conseillées.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : PME de distribution - Automatisation de la saisie comptable
- **Hypothèses :** 2 comptables passant chacun 12h/semaine à saisir des factures fournisseurs. Taux horaire moyen : 28 €/h. Automatisation estimée : 60%. Coût des outils IA : 200 €/mois.
- **Résultats calculés :**
  - Temps économisé : **623 heures/an** (équivalent à près de 4 mois de travail à plein temps).
  - Économie brute : **17 458 €/an**.
  - Dépense IA : 2 400 €/an.
  - **Gain net annuel : 15 058 €**.
  - **ROI : +627%**, amorti en **1,6 mois**.
- **Impact :** La direction valide immédiatement le déploiement du module Vérificateur de Factures IA.

### Exemple 2 : Agence de conseil - Automatisation des comptes-rendus de réunion
- **Hypothèses :** 5 consultants passant 4h/semaine à rédiger des synthèses. Taux horaire : 45 €/h. Automatisation : 50%. Coût IA : 150 €/mois.
- **Résultats calculés :**
  - Temps économisé : **519 heures/an**.
  - Économie financière : **23 382 €/an**.
  - **ROI : +1 199%**, amorti en moins de **1 mois**.

---

## 10. Valeur ajoutée

- **Décision fondée sur des faits :** Élimine le flou et les spéculations autour de l'intelligence artificielle.
- **Accélération des signatures :** Permet aux décideurs de présenter un dossier étayé à leur banquier ou conseil d'administration.
- **Pédagogie financière :** Rend évident que le coût de l'inaction (payer des collaborateurs à faire de la saisie manuelle) est 5 à 10 fois supérieur au coût des outils IA.
- *Gain quantifié :* Permet de calculer à l'euro près le gain potentiel avant d'engager la moindre dépense.

---

## 11. Limites actuelles

- **Prise en compte des coûts de formation initiale :** Le modèle prend en compte les coûts de licences mensuels, mais n'intègre pas les frais éventuels de formation d'équipe initiale.
- **Modélisation multi-devises (USD, GBP) :** L'interface affiche actuellement les résultats monétaires normalisés en Euros (€).
- **Export direct sous format PowerPoint / Slides :** Fonctionnalité prévue / non implémentée (l'export se fait actuellement via l'affichage et impression du rapport web).

---

## 12. Évolutions possibles

### Déjà implémenté
- Wizard interactif en 4 étapes avec Framer Motion.
- Calculs financiers dynamiques (ETP, heures, économies, ROI, payback).
- Graphique de projection de rentabilité sur 12 mois.
- Interprétation stratégique et 5 recommandations métiers personnalisées.

### Prévu mais non implémenté
- Exportation automatique du dossier de rentabilité sous forme de présentation PDF de 5 diapositives prêtes pour le COMEX.
- Comparateur multi-processus simultanés pour chiffrer la rentabilité de la digitalisation globale de l'entreprise.

### Proposition d'évolution
- Intégration d'un module de simulation des aides de l'État et subventions régionales à la transformation numérique (ex: Bpifrance).

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Calculez en 3 minutes le retour sur investissement exact, les heures libérées et les économies d'échelle de l'IA pour votre entreprise.

### Pitch en 30 secondes
Vous envisagez d'intégrer l'intelligence artificielle dans vos processus, mais vous voulez des preuves avant d'investir ? Le Calculateur de ROI IA de MDIV Business chiffre précisément votre rentabilité : temps de travail économisé, bénéfice net à 12 mois et délai d'amortissement exact. Plus de doutes, prenez vos décisions stratégiques avec des indicateurs financiers irréfutables.

### Présentation en 1 minute
Dans le climat économique actuel, chaque euro investi doit produire des résultats mesurables. Mais comment évaluer la rentabilité d'un projet d'intelligence artificielle quand on est submergé par des discours techniques incompréhensibles ?
Le Calculateur de ROI IA de MDIV Business a été créé pour les dirigeants et directeurs financiers pragmatiques. En indiquant simplement votre secteur, le temps passé par vos équipes sur des tâches chronophages et leur coût horaire, notre simulateur établit une modélisation financière rigoureuse. Vous découvrez immédiatement le nombre d'heures récupérées chaque année, vos économies nettes et le mois exact où votre investissement devient 100% rentable. C'est l'outil indispensable pour piloter votre transition numérique avec lucidité et sérénité.

### Problème
L'incertitude quant à la rentabilité réelle de l'IA empêche les dirigeants de sauter le pas et les maintient dans des processus manuels coûteux.

### Solution
Un simulateur financier interactif qui calcule les gains en euros, le temps économisé et le retour sur investissement à 12 mois.

### Fonctionnement
Renseignez votre équipe et vos processus -> Ajustez les curseurs d'heures et de coûts -> Obtenez instantanément votre rapport d'amortissement.

### Public cible
Dirigeants de PME, directeurs financiers (DAF), directeurs généraux, consultants en organisation.

### Cas d'utilisation
Validation budgétaire, justification d'achat logiciel, diagnostic d'efficience opérationnelle.

### Proposition de valeur
Transformez vos intuitions en certitudes financières chiffrées et débloquez vos projets de modernisation.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan sur un dirigeant perplexe avec une calculatrice en main regardant des devis de logiciels, écran avec les mots "L'IA est-elle rentable ?".
- **Texte à l'écran :** "L'IA : Effet de mode ou vrai gain d'argent ?"
- **Voix off :** "Vous voulez intégrer l'intelligence artificielle, mais vous avez peur que ça ne vous rapporte rien ?"
- **Animation CapCut :** Zoom caméra vif + son "Ding" d'attention.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Plan accéléré de collaborateurs qui saisissent manuellement des factures ou répondent aux mêmes emails toute la journée.
- **Texte :** "Le gouffre des heures perdues..."
- **Voix off :** "Payer des collaborateurs qualifiés pour faire de la saisie manuelle coûte des dizaines de milliers d'euros chaque année."

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Interface design du Calculateur ROI de MDIV Business avec ses curseurs bleus et dorés.
- **Texte :** "Simulateur Financier ROI IA"
- **Voix off :** "Voici le Calculateur de ROI IA de MDIV Business : le simulateur qui chiffre vos gains réels en 3 minutes."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Sélection du processus "Finance" -> Déplacement des curseurs (2 personnes, 25 €/h, 50% d'automatisation) -> Clic -> Explosion des indicateurs verts : "+593% de ROI", "15 000 € économisés", "Amorti en 2 mois".
- **Action utilisateur :** Ajustement des curseurs en direct, défilement du rapport avec graphique de rentabilité.
- **Texte :** "Chiffres réels • Amortissement calculé • Recommandations"
- **Voix off :** "Indiquez vos heures et vos coûts : l'algorithme calcule instantanément vos économies annuelles et votre délai d'amortissement exact."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Calcul précis du temps et des ETP libérés.
- **Fonctionnalité 2 :** Courbe de rentabilité financière sur 12 mois.
- **Fonctionnalité 3 :** Top 5 des solutions concrètes pour votre métier.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Rapport exécutif prêt avec le badge émeraude "Projet très rentable", dirigeant souriant validant le budget sur sa tablette.
- **Texte :** "Décidez sur des preuves, pas sur des doutes."
- **Voix off :** "Vous obtenez un dossier de rentabilité incontestable pour convaincre votre banquier ou votre conseil d'administration."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Calculez votre ROI dès maintenant sur mdiv-business.fr"
- **Voix off :** "Estimez vos gains dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton clignotant "Simuler mon ROI gratuitement".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Vue d'ensemble de `/services-ia/calc-roi` avec l'en-tête et le stepper (3 sec).
- **Capture 2 :** Étape 1 : Remplissage rapide du nom d'entreprise et secteur (3 sec).
- **Capture 3 :** Étape 2 : Clic sur la carte "Finance & Facturation" (2 sec).
- **Capture 4 :** Étape 3 : Animation des sliders : heures par semaine et taux horaire (4 sec).
- **Capture 5 :** Étape 4 : Clic sur "Afficher mon rapport de rentabilité" (2 sec).
- **Capture 6 :** Zoom sur les 3 cartes clés : Heures économisées, Économies annuelles (€) et ROI (%) (4 sec).
- **Capture 7 :** Défilement de la courbe de projection à 12 mois et des 5 outils conseillés (3 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Reels / TikTok) et 16:9 (LinkedIn / YouTube).
- **Résolution :** 1080x1920 / 4K.
- **Durée totale :** 56 secondes.
- **Rythme :** Dynamique au début, fluide et posé durant l'explication des chiffres clés.
- **Sous-titres :** Sous-titres dynamiques synchronisés au bas de l'écran avec mise en valeur des chiffres en jaune d'or et vert néon.
- **Effets audio :** Bruitage de caisse enregistreuse "Ka-ching" sur l'apparition du ROI, bips discrets sur le déplacement des sliders.
- **Musique :** Piste électro-ambient moderne inspirante.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Combien l'IA peut-elle réellement faire économiser à votre entreprise ? Calculez vos gains financiers et votre délai d'amortissement en 3 minutes sur MDIV Business.

### Publicité LinkedIn
"L'IA est-elle vraiment rentable pour une PME ?"
C'est la question que se posent tous les directeurs généraux et DAF.
Plutôt que d'écouter des promesses abstraites, utilisez le **Calculateur de ROI IA** de MDIV Business :
1. Renseignez votre secteur et le temps passé par vos équipes sur des tâches répétitives.
2. Indiquez votre coût horaire moyen.
3. Obtenez instantanément :
- Le nombre d'heures libérées par an
- Le montant net économisé en euros
- Votre ROI précis et votre délai d'amortissement en mois
- Les 5 outils recommandés pour votre cas d'usage
Prenez vos décisions d'investissement sur des chiffres solides.
Accédez au simulateur gratuit : [Lien MDIV Business]

### Publicité Instagram
L'intelligence artificielle coûte-t-elle plus cher qu'elle ne rapporte ? Calculez vos gains à l'euro près avec notre simulateur gratuit. Lien en bio !

### Publicité Facebook
Ne dépensez pas un euro dans l'IA sans avoir testé notre Calculateur de ROI. Estimez vos heures gagnées et vos économies annuelles en 3 minutes chrono. Essai gratuit sans engagement !

### Description vidéo
Démonstration de notre simulateur de rentabilité IA : comment calculer le retour sur investissement d'un projet d'automatisation en 3 minutes. #Finance #Gestion #IA #Productivité #PME

### CTA
"Simulez la rentabilité de votre entreprise sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle permet de modéliser mathématiquement les gains de temps, les économies financières et le retour sur investissement de l'adoption de l'IA sur un processus d'entreprise.
- **Comment les calculs sont-ils effectués ?**
  Ils s'appuient sur une méthode d'audit de gestion rigoureuse croisant les heures travaillées, le coût horaire chargé et le taux d'automatisation estimé.
- **L'application prend-elle en compte le coût des logiciels IA ?**
  Oui, vous pouvez ajuster le budget mensuel prévisionnel des licences pour obtenir un calcul de bénéfice net déduit des frais technologiques.
- **Quels départements peut-on simuler ?**
  Tous les départements clés : Support client, Finance & Facturation, Marketing, Opérations et Ressources Humaines.
- **Les résultats sont-ils sauvegardés ?**
  Vous pouvez imprimer ou capturer le rapport complet pour vos dossiers de décision internes.

---

# 19. FICHE COMMERCIALE

- **Nom :** Calculateur de ROI IA
- **Catégorie :** Décisionnel Financier & Pilotage Stratégique
- **Public cible :** Dirigeants de PME, DAF, Directeurs de la Transformation Digitale, Consultants
- **Problème :** Incertitude sur la rentabilité financière de l'IA et absence de métriques objectives
- **Solution :** Simulateur actuariel chiffrant les gains annuels, le délai d'amortissement et le ROI
- **Fonctionnalités clés :** Stepper animé en 4 étapes, sliders interactifs, projection à 12 mois, recommandations métiers
- **Technologies IA :** Modélisation mathématique déterministe, système expert de préconisations
- **Type d'IA :** Intelligence algorithmique financière et analytique
- **Cas d'utilisation :** Présentation au comité de direction, arbitrage budgétaire, validation de projet
- **Valeur ajoutée :** Crédibilisation des dossiers d'investissement, visibilité à 12 mois, zéro risque de calcul
- **Statut :** Opérationnel en production (route `/services-ia/calc-roi`)
- **CTA :** "Calculez le ROI de vos projets sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Scénario de calcul prêt pour la démonstration (cas comptabilité ou support client)
- [ ] Captures d'écran des sliders et des résultats à fort ROI préparées
- [ ] Script vidéo validé pour l'enregistrement
- [ ] Voix off enregistrée ou générée
- [ ] Montage CapCut effectué avec animations des graphiques de rentabilité
- [ ] Effets sonores et sous-titres bicolores synchronisés
- [ ] Call to action clair inséré à la fin
- [ ] Formats 9:16 et 16:9 exportés
- [ ] Publication LinkedIn prête pour la diffusion
- [ ] Campagne Meta paramétrée
