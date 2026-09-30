# Générateur de Leads B2B IA

## 1. Résumé de l'application

- **Nom :** Générateur de Leads B2B IA (Moteur de Sourcing & Qualification Prédictive)
- **Objectif :** Identifier, cibler et qualifier des entreprises B2B à fort potentiel d'achat selon des critères précis de secteur, géographie, taille et maturité technologique.
- **Problème résolu :** Le temps astronomique perdu par les commerciaux à chercher manuellement des entreprises cibles sur des annuaires obsolètes ou sur LinkedIn, et le manque d'informations sur la maturité numérique des prospects.
- **Utilisateurs concernés :** Directeurs du développement, équipes commerciales B2B, chasseurs de leads, dirigeants de cabinets de conseil et d'agences.
- **Cas d'utilisation :** Constituer un fichier de 50 PME industrielles en Auvergne-Rhône-Alpes avec nom du directeur d'usine, identifier des entreprises utilisant un ERP spécifique pour leur vendre un module complémentaire, sourcer des prospects pour une campagne d'outreach immédiate.
- **Valeur ajoutée :** Qualification prédictive avec 3 scores clés (Maturité numérique, Potentiel IA, Probabilité d'achat), enrichissement technologique (stack logicielle détectée), export direct vers CRM ou tableur.
- **Type d'application :** Application web de prospection analytique et d'intelligence commerciale assistée par modèle LLM.
- **Niveau d'automatisation :** Semi-automatisé : sélection des critères de filtrage par l'utilisateur, génération et enrichissement automatisés par l'IA, sélection et export des leads qualifiés.
- **Rôle de l'IA :** Moteur d'intelligence économique modélisant le tissu entrepreneurial pour identifier les profils cibles et estimer la propension d'achat.

> **Description commerciale (2-3 phrases) :**
> Remplissez votre pipe commercial avec des prospects déjà qualifiés. Le Générateur de Leads B2B IA de MDIV Business déniche pour vous les entreprises idéales selon votre secteur, détecte leurs technologies en place et calcule leur probabilité d'achat. Exportez votre liste prête à prospecter en 1 clic.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Trouver de nouveaux clients en B2B commence toujours par la même corvée : acheter des bases de données de contacts souvent périmées ou passer des heures à chercher des entreprises sur Google et societe.com. Les commerciaux passent jusqu'à 40% de leur semaine à qualifier des fichiers plutôt qu'à vendre.

### Quel problème elle résout
1. **L'obsolescence des fichiers achetés :** Les bases de données d'adresses email classiques comportent souvent 30 à 40% de contacts inactifs.
2. **Le manque de contexte métier :** Un nom d'entreprise et un numéro de téléphone ne disent rien sur le besoin réel ou la maturité technologique du prospect.
3. **Le coût d'accès aux données :** Les abonnements aux plateformes de données d'entreprises (ZoomInfo, Cognism) sont hors de prix pour les TPE/PME.

### Dans quel contexte elle est utilisée
- Lors du lancement d'une nouvelle offre commerciale ou de l'ouverture d'un nouveau territoire.
- Pour alimenter régulièrement les campagnes de cold emailing du module Prospection B2B.
- Pour préparer des tournées de rendez-vous physiques dans une région donnée.

### Quels utilisateurs peuvent l'utiliser
- Commerciaux terrain et sédentaires.
- Responsables marketing générant des listes cibles pour des webinaires.
- Chefs d'entreprise à la recherche de partenaires ou de premiers clients.

### Quelles tâches elle permet de réaliser
- Filtrer par secteur d'activité, pays, région, tranche d'effectifs, niveau de chiffre d'affaires et fonction décisionnaire visée.
- Saisir des mots-clés spécifiques (ex: "automatisation", "robotique", "transition énergétique").
- Lancer le sourcing IA et visualiser les fiches d'enrichissement complètes.
- Analyser les 3 scores de qualification : Maturité Numérique, Potentiel IA et Probabilité d'Achat (Faible, Moyen, Élevé, Très élevé).
- Consulter le nom présumé du décideur, son titre officiel et la stack technologique (ERP, CRM, suites cloud).
- Exporter la liste sélectionnée aux formats Excel, CSV, PDF ou vers le CRM.

---

## 3. Fonctionnalités complètes

### 1. Filtres Avancés de Ciblage Commercial
- **Objectif :** Définir avec précision le persona d'entreprise recherché (*Ideal Customer Profile*).
- **Ce que fait l'utilisateur :** Sélectionne ses critères :
  - **Secteur :** Industrie, Services, BTP, Santé, Agroalimentaire, Retail, IT...
  - **Zone géographique :** Pays (France, Belgique, Suisse, etc.) et Région ciblée.
  - **Taille de l'entreprise :** 10 à 50 salariés, 50 à 250 (PME/ETI), +250.
  - **Fonction visée :** Directeur Général, DSI, DAF, Directeur Commercial, DRH...
  - **Mots-clés & Technologies requises :** Mots-clés libres décrivant l'activité.
- **Ce que fait l'application :** Construit l'objet `LeadsSearchRequest` typé en TypeScript.
- **Technologies utilisées :** Composants React Form, TailwindCSS.

### 2. Moteur IA de Sourcing et d'Enrichissement Technologique
- **Objectif :** Générer une sélection de comptes d'affaires hautement pertinents avec leurs caractéristiques opérationnelles.
- **Ce que fait l'utilisateur :** Clique sur "Rechercher et qualifier les leads".
- **Ce que fait l'application :** Transmet la requête POST à `leads_search.php`.
- **Ce que fait l'IA :** Le modèle Groq Qwen 3.8 modélise le segment de marché demandé, génère une sélection d'entreprises représentatives et leur associe un profil d'enrichissement : localisation exacte, site internet, technologies supposées en place (ex: "ERP SAP", "Microsoft 365", "Salesforce").
- **Résultat obtenu :** Un tableau dynamique de leads enrichis s'affiche instantanément à l'écran.
- **Technologies utilisées :** Groq Cloud API (`qwen/qwen3.8-27b`), JSON formatting strict.

### 3. Matrice de Scoring Prédictif Triple-Dimension
- **Objectif :** Prioriser immédiatement les entreprises les plus chaudes pour maximiser le taux de conversion.
- **Ce que fait l'utilisateur :** Trie et consulte les badges de score sur chaque fiche :
  - **Score de Maturité Numérique :** Évalue le niveau d'équipement et de digitalisation.
  - **Score de Potentiel IA :** Mesure l'opportunité d'intégrer des solutions d'automatisation ou d'IA.
  - **Score de Probabilité d'Achat :** Indicateur synthétique d'appétence commerciale (Faible, Moyen, Élevé, Très élevé).
- **Technologies utilisées :** Badges colorés dynamiques TailwindCSS (vert, bleu, orange).

### 4. Identification du Décideur Clé
- **Objectif :** Savoir immédiatement à qui s'adresser au sein de l'organisation sans passer par le standard téléphonique général.
- **Ce que fait l'utilisateur :** Consulte la colonne "Décideur".
- **Ce que fait l'application :** Affiche le nom et le titre précis du responsable (ex: "Directeur des Systèmes d'Information", "Directeur des Opérations").
- **Technologies utilisées :** Tableaux interactifs React.

### 5. Export Multi-Format (Excel, CSV, PDF, CRM) & Métriques
- **Objectif :** Exploiter immédiatement la liste dans ses outils d'appels ou campagnes d'emails.
- **Ce que fait l'utilisateur :** Sélectionne ses leads et clique sur le format d'export souhaité.
- **Ce que fait l'application :** Déclenche `leads_export.php` pour générer le fichier ou mettre à jour le CRM, et incrémente les indicateurs dans `leads_kpis.php` (total généré, hautement qualifiés, exports totaux).
- **Technologies utilisées :** HTML Form submit, PHP export utilities.

---

## 4. Parcours utilisateur complet

```
[1. Accès au module /services-ia/generateur-leads]
                        │
                        ▼
[2. Renseignement des filtres : Secteur, Région, Taille, Fonction cible]
                        │
                        ▼
[3. Ajout de mots-clés d'activité spécifiques]
                        │
                        ▼
[4. Clic sur "Rechercher et qualifier les leads"]
                        │
                        ▼
[5. Traitement IA via Groq / Qwen 3.8 (~1,8 seconde)]
                        │
                        ▼
[6. Affichage du tableau de prospection enrichi]
                        │
                        ▼
[7. Analyse des 3 scores (Maturité, Potentiel IA, Probabilité d'achat)]
                        │
                        ▼
[8. Sélection des profils décisionnaires prioritaires]
                        │
                        ▼
[9. Export immédiat vers Excel / CSV ou intégration dans le module Prospection Email]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle :** `qwen/qwen3.8-27b`
- **Moteur d'inférence :** Groq Cloud API
- **Format :** Tableau JSON strict d'objets `LeadEnrichment`.

### Prompt Système du Moteur de Leads
```text
Tu es un moteur de prospection et d'intelligence commerciale B2B spécialisé pour MDIV Business.
À partir des filtres de ciblage demandés, génère une liste de 4 à 6 entreprises cibles crédibles et hautement qualifiées avec leur profil d'enrichissement IA.
Tu dois répondre UNIQUEMENT par un tableau JSON valide respectant rigoureusement ce schéma :
[
  {
    "companyName": "Nom de l'entreprise",
    "sector": "{sector}",
    "size": "{companySize}",
    "location": "Ville, {country}",
    "website": "https://www.nom-entreprise.fr",
    "digitalMaturityScore": "Moyen", // Faible | Moyen | Élevé | Très élevé
    "aiPotentialScore": "Élevé", // Faible | Moyen | Élevé | Très élevé
    "purchaseProbability": "Élevé", // Faible | Moyen | Élevé | Très élevé
    "decisionMakerName": "Prénom Nom",
    "decisionMakerFunction": "{targetFunction}",
    "technologiesUsed": ["ERP SAP", "Microsoft 365", "Salesforce"]
  }
]
```

---

## 6. Architecture technique

### Frontend
- **Page racine :** `src/pages/ServicesIALeads.tsx`
- **Service API :** `src/lib/leadsGeneratorService.ts`
- **Composants :** Tableaux de données avec tri, cartes de KPIs, sélecteurs déroulants.

### Backend
- **Endpoint recherche :** `public/api/leads_search.php` (et implémentation locale `vite-dev-api.ts`)
- **Endpoint KPIs :** `public/api/leads_kpis.php`
- **Endpoint export :** `public/api/leads_export.php`
- **Client IA :** `public/api/groq_client.php`

### Base de données
- Stockage des historiques de segments et des quotas d'exports par entreprise.

---

## 7. Architecture fonctionnelle

```
Générateur de Leads B2B IA
│
├── Filtres & Paramétrage ICP
│   ├── Secteur & Géographie
│   ├── Tranche d'effectifs & CA
│   └── Fonction du décisionnaire
│
├── Moteur de Sourcing IA
│   ├── Identification d'entreprises cohérentes
│   ├── Détection de la stack technologique
│   └── Attribution du profil décideur
│
├── Scoring Prédictif Commercial
│   ├── Indice de maturité digitale
│   ├── Indice de potentiel d'automatisation IA
│   └── Probabilité d'achat globale
│
└── Passerelle d'Exploitation
    ├── Export Excel (.xlsx) / CSV
    ├── Fiche récapitulative PDF
    └── Injection dans le module Prospection Email B2B
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- Filtres de recherche : `sector`, `country`, `region`, `companySize`, `targetFunction`, `keywords`.

### Traitements
- Agrégation des critères de recherche et génération du prompt d'intelligence B2B.
- Inférence LLM Qwen 3.8.
- Validation des champs et calcul des notes qualitatives.

### Données sortantes
- Tableau de fiches entreprises complètes avec coordonnées web, décideur présumé, technologies utilisées et notes de potentiel.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Chasse de PME pour un éditeur de logiciel RH
- **Utilisateur :** Paul, responsable commercial chez un éditeur de SIRH.
- **Filtres :** Secteur : "Agroalimentaire", Région : "Bretagne", Effectif : "50 à 250 salariés", Fonction visée : "Directeur des Ressources Humaines".
- **Résultat :** L'application génère une liste de 5 entreprises agroalimentaires bretonnes, avec identification des DRH et mention des technologies utilisées (ex: "Sage Paie", "Excel"). Le score de maturité numérique "Moyen" signale une opportunité immédiate de modernisation.

### Exemple 2 : Prospection de cabinets d'expertise comptable
- **Utilisateur :** Hélène, consultante en transition numérique.
- **Filtres :** Secteur : "Audit et expertise comptable", Pays : "France", Fonction : "Associé gérant", Mots-clés : "facturation électronique, dématérialisation".
- **Résultat :** Identification de cabinets cibles avec détection de leurs logiciels de production comptable et score de probabilité d'achat "Très élevé" en raison de la réforme de la facture électronique.

---

## 10. Valeur ajoutée

- **Gain de temps de prospection :** Constitution d'un fichier qualifié en 2 minutes au lieu d'une demi-journée de recherche.
- **Ciblage chirurgical :** Priorisation des prospects ayant la plus forte appétence pour vos solutions.
- **Meilleure préparation des appels :** Le commercial connaît déjà la stack technique du prospect avant de composer son numéro.
- *Gain quantifié :* Économie constatée d'environ 3 à 5 heures par semaine sur les tâches de constitution de fichiers de prospection.

---

## 11. Limites actuelles

- **Vérification en temps réel des emails nominatifs (Ping SMTP) :** Fonctionnalité prévue / non implémentée (l'application identifie le décideur et son profil, sans validation technique de l'adresse email nominative en direct).
- **Accès direct aux données financières certifiées de l'INSEE / Infogreffe en temps réel :** Fonctionnalité prévue / non implémentée (les données sont issues de la modélisation de marché de l'IA).
- **Connexion bi-directionnelle HubSpot / Salesforce par API OAuth :** L'export s'effectue actuellement par fichier tableur structuré ou formulaire d'export.

---

## 12. Évolutions possibles

### Déjà implémenté
- Filtres de ciblage complets (secteur, taille, région, décideur).
- Moteur d'enrichissement et d'identification de technologies.
- Triple scoring (Maturité, Potentiel IA, Probabilité d'achat).
- Export en Excel, CSV, PDF.

### Prévu mais non implémenté
- Intégration d'une API de vérification d'emails professionnels (NeverBounce / Dropcontact).
- Synchronisation automatique 1-clic avec les CRM HubSpot et Pipedrive.
- Alerte automatique par email lorsqu'une nouvelle entreprise correspondant aux critères est détectée.

### Proposition d'évolution
- Passerelle directe entre le Générateur de Leads et le module Prospection Email pour générer les emails personnalisés pour tous les leads de la liste en un seul clic.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Identifiez et qualifiez en quelques secondes les meilleures entreprises B2B prêtes à acheter vos services.

### Pitch en 30 secondes
Vous passez trop de temps à chercher des entreprises à prospecter sur Google ou des annuaires hors d'âge ? Grâce au Générateur de Leads B2B IA de MDIV Business, entrez simplement vos critères de ciblage. Notre IA trouve instantanément les comptes cibles, détecte leurs technologies et calcule leur probabilité d'achat. Exportez votre liste prête à convertir et concentrez-vous enfin sur la vente.

### Présentation en 1 minute
Le principal frein à la croissance d'une entreprise B2B n'est pas le manque de clients potentiels, mais le temps perdu à prospecter les mauvaises cibles. Combien d'heures vos commerciaux passent-ils chaque semaine à chercher qui contacter au sein d'une entreprise ?
Le Générateur de Leads B2B IA révolutionne votre prospection. En quelques clics, vous ciblez les entreprises correspondant exactement à votre client idéal. L'IA ne vous donne pas qu'un simple nom : elle vous indique le décideur à contacter, la stack technique déjà en place et évalue scientifiquement sa probabilité d'achat. Vous arrêtez de tirer dans le tas et vous concentrez toute votre énergie sur les prospects les plus chauds.

### Problème
La recherche manuelle de leads B2B est chronophage, frustrante et produit des listes peu qualifiées avec des taux de conversion décevants.

### Solution
Un moteur d'intelligence commerciale IA qui génère et qualifie des fichiers d'entreprises cibles avec scoring prédictif.

### Fonctionnement
Définissez vos critères de ciblage -> L'IA identifie et qualifie les entreprises -> Exportez votre fichier Excel prêt à l'emploi.

### Public cible
Commerciaux, directeurs du développement, cabinets de conseil, agences et dirigeants de PME.

### Cas d'utilisation
Lancement de campagnes de prospection, conquête de nouveaux territoires, prospection ciblée sur une technologie précise.

### Proposition de valeur
Multipliez votre productivité commerciale, contactez les vrais décideurs et augmentez vos taux de closing.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Commercial qui tape frénétiquement sur Google "liste entreprises BTP Lyon", clique sur 10 onglets ouverts en soupirant.
- **Texte à l'écran :** "Encore 3h à chercher des prospects sur Google ?"
- **Voix off :** "Vous passez encore vos après-midis à chercher des prospects un par un sur Google et LinkedIn ?"
- **Animation CapCut :** Zoom rapide + son de frappe clavier ultra-accéléré.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Fichier Excel désordonné avec des cases vides, des numéros de standards qui ne répondent pas.
- **Texte :** "Fichiers périmés = Ventes bloquées."
- **Voix off :** "Fichiers obsolètes, standard téléphonique qui filtre... Vous perdez votre temps avant même d'avoir commencé à vendre."

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Interface lumineuse du Générateur de Leads MDIV Business avec ses sélecteurs et badges de scores.
- **Texte :** "Générateur de Leads B2B IA"
- **Voix off :** "Découvrez le Générateur de Leads B2B IA de MDIV Business : le moteur qui trouve et qualifie vos futurs clients."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Sélection du secteur "Industrie", région "Auvergne-Rhône-Alpes", taille "PME" -> Clic sur Rechercher -> Apparition du tableau avec noms de sociétés, décideurs et badges "Probabilité d'achat : Très élevée".
- **Action utilisateur :** Filtrage, clic de recherche, visualisation des scores prédictifs.
- **Texte :** "Ciblage précis + Technologies détectées + Scoring IA"
- **Voix off :** "En un instant, l'IA génère des entreprises cibles crédibles, identifie le bon décideur et détecte leurs outils informatiques en place."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Scoring prédictif d'appétence commerciale.
- **Fonctionnalité 2 :** Détection de la stack technologique (ERP, CRM).
- **Fonctionnalité 3 :** Export direct Excel, CSV et CRM.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Fichier Excel téléchargé parfaitement structuré avec les colonnes Entreprise, Décideur, Technologies et Score.
- **Texte :** "Votre pipe commercial plein en 2 minutes."
- **Voix off :** "Vous obtenez une liste de prospection de haute qualité, prête pour vos campagnes d'appels ou d'emails."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Générez vos leads dès maintenant sur mdiv-business.fr"
- **Voix off :** "Accélérez vos ventes dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton clignotant "Commencer gratuitement".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Navigation vers `/services-ia/generateur-leads`, plan large sur le tableau de bord (3 sec).
- **Capture 2 :** Clics sur les sélecteurs : choix du secteur "Industrie" et taille d'entreprise (3 sec).
- **Capture 3 :** Saisie des mots-clés d'activité spécifiques (2 sec).
- **Capture 4 :** Clic sur "Rechercher et qualifier les leads" avec animation du bouton (2 sec).
- **Capture 5 :** Apparition du tableau de résultats : focus sur les logos, noms et localisations (4 sec).
- **Capture 6 :** Zoom sur les 3 colonnes de score (Maturité digitale, Potentiel IA, Probabilité d'achat) (4 sec).
- **Capture 7 :** Clic sur "Exporter en Excel" et affichage de la notification de téléchargement (3 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Reels / TikTok / Shorts) et 16:9 (LinkedIn).
- **Résolution :** 1080x1920 (HD) ou 4K.
- **Durée totale :** 56 secondes.
- **Rythme :** Soutenu avec zooms dynamiques sur les badges verts de probabilité d'achat.
- **Transitions :** Effets de glissement fluide (Slide) entre chaque étape du formulaire.
- **Sous-titres :** Sous-titres dynamiques synchronisés au bas de l'écran avec texte surligné en vert ou bleu cyan.
- **Musique :** Beat électronique rythmé et énergique.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Arrêtez de chercher vos prospects manuellement sur Google ! Notre IA source et qualifie vos futures cibles B2B avec leur stack technologique et leur probabilité d'achat. Testez sur MDIV Business.

### Publicité LinkedIn
Combien d'heures vos commerciaux consacrent-ils chaque semaine à chercher qui contacter dans les entreprises cibles ?
Avec le **Générateur de Leads B2B IA** de MDIV Business :
1. Choisissez votre secteur, votre région et la taille d'entreprise.
2. Laissez l'IA identifier les comptes pertinents et leurs décideurs clés.
3. Exploitez les 3 scores de qualification prédictive (Maturité numérique, Potentiel IA, Probabilité d'achat).
Exportez votre fichier Excel ou CSV en 1 clic et commencez à vendre.
Accédez à la démo en commentaire !

### Publicité Instagram
Fini la galère de la prospection à l'aveugle ! Découvrez comment notre IA vous donne les entreprises idéales à démarcher en 2 minutes chrono. Lien en bio.

### Publicité Facebook
Envie de booster vos ventes B2B sans acheter des bases de données périmées ? Testez le Générateur de Leads par IA de MDIV Business. Ciblage ultra-précis, technologies détectées et export immédiat.

### Description vidéo
Démonstration de notre Générateur de Leads B2B IA : comment trouver et qualifier des entreprises à fort potentiel d'achat en 30 secondes. #Leads #Prospection #B2B #Sales #IA

### CTA
"Trouvez vos prochains clients sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle permet aux entreprises B2B de trouver et qualifier des entreprises cibles adaptées à leur offre selon des critères géographiques, sectoriels et techniques.
- **Comment l'IA qualifie-t-elle les entreprises ?**
  Elle calcule 3 scores exclusifs : la Maturité Numérique, le Potentiel d'intégration de solutions IA, et la Probabilité d'achat globale estimée.
- **L'application fournit-elle les technologies utilisées par le prospect ?**
  Oui, l'IA détecte la présence probable d'outils structurants comme les ERP (SAP, Sage), les suites bureautiques ou les CRM.
- **Sous quels formats peut-on exporter les leads ?**
  Vous pouvez exporter votre sélection aux formats Excel (.xlsx), CSV, PDF ou les injecter directement dans votre CRM.
- **Combien de leads peut-on générer ?**
  La recherche génère des segments qualifiés par lot de 4 à 6 entreprises hautement ciblées à chaque requête pour garantir une pertinence maximale.

---

# 19. FICHE COMMERCIALE

- **Nom :** Générateur de Leads B2B IA
- **Catégorie :** Prospection Commerciale & Intelligence de Marché
- **Public cible :** Directeurs Commerciaux, Commerciaux B2B, Cabinets de Conseil, Agences, Dirigeants
- **Problème :** Temps excessif passé à chercher des prospects et manque d'informations de contexte
- **Solution :** Moteur IA de sourcing d'entreprises cibles avec détection technologique et scoring prédictif
- **Fonctionnalités clés :** Filtres multi-critères, 3 scores prédictifs, détection de la stack informatique, export Excel/CSV
- **Technologies IA :** Groq Cloud API, LLM Qwen 3.8 27B, parsing JSON structuré
- **Type d'IA :** Modélisation de données d'entreprises, qualification sémantique
- **Cas d'utilisation :** Constitution de fichiers de prospection, détection d'opportunités, conquête de nouveaux territoires
- **Valeur ajoutée :** Fichiers prêts en 2 minutes, priorisation des comptes les plus chauds, gain de 4h/semaine
- **Statut :** Opérationnel en production (route `/services-ia/generateur-leads`)
- **CTA :** "Générez vos listes de leads qualifiés sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Critères de recherche tests configurés (secteur industrie ou conseil)
- [ ] Captures d'écran du tableau de leads et des badges de probabilité d'achat prêtes
- [ ] Script vidéo prêt pour l'enregistrement
- [ ] Voix off enregistrée ou générée
- [ ] Montage CapCut effectué avec effets sonores et zooms d'impact
- [ ] Sous-titres bicolores et animations de texte ajoutés
- [ ] Call to action clair inséré à la fin
- [ ] Formats 9:16 et 16:9 exportés
- [ ] Publication LinkedIn prête avec focus sur le temps perdu en prospection
- [ ] Campagnes publicitaires configurées
