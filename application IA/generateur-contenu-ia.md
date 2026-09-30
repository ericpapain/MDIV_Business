# Générateur de Contenu Multi-Canal IA

## 1. Résumé de l'application

- **Nom :** Générateur de Contenu Multi-Canal IA (Studio Éditorial B2B)
- **Objectif :** Décliner une idée brute, un article de blog, une URL ou un document en une série de contenus marketing percutants adaptés aux codes de chaque canal (LinkedIn, Twitter/X, Newsletter, Article SEO).
- **Problème résolu :** Le syndrome de la page blanche en marketing B2B, le temps excessif nécessaire pour réécrire et adapter un même message sur différents réseaux sociaux, et le manque de régularité éditoriale des entreprises.
- **Utilisateurs concernés :** Responsables marketing, fondateurs de startups, consultants indépendants, directeurs de la communication, créateurs de contenu B2B.
- **Cas d'utilisation :** Transformer un livre blanc en 5 posts LinkedIn et un thread Twitter/X, convertir une annonce produit en newsletter engageante, recycler un article de presse en contenu de marque régulier.
- **Valeur ajoutée :** Multiplication par 5 de la production de contenu sans perte de qualité, respect strict de la voix de marque (*tone of voice*), économie de plusieurs heures de copywriting chaque semaine.
- **Type d'application :** Studio de génération éditoriale SaaS alimenté par LLM avec gestion des paramètres de marque et export bureautique.
- **Niveau d'automatisation :** Semi-automatisé : l'utilisateur injecte l'idée ou le document source, l'IA génère les variations canal par canal, l'utilisateur affine et publie.
- **Rôle de l'IA :** Directrice éditoriale et copywriter B2B d'élite modélisant les codes algorithmiques et stylistiques de chaque plateforme (accroches virales LinkedIn, concision de Twitter/X, structure de newsletter conversationnelle).

> **Description commerciale (2-3 phrases) :**
> Décuplez votre visibilité B2B sans passer vos journées à rédiger. Donnez une simple idée, une URL ou un document au Studio Éditorial IA de MDIV Business : il génère en un instant vos posts LinkedIn, vos threads Twitter et vos newsletters parfaitement formatés selon l'ADN de votre entreprise. 1 source = 5 contenus percutants prêts à publier.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Pour se développer, toute entreprise moderne doit maintenir une présence continue sur les réseaux professionnels et auprès de ses abonnés par email. Pourtant, rédiger un bon post LinkedIn prend 30 minutes, un thread Twitter 20 minutes, et une newsletter plus d'une heure. Faute de temps, les entreprises abandonnent leur communication après quelques semaines.

### Quel problème elle résout
1. **L'inadéquation des formats :** Copier-coller le même texte d'un réseau à l'autre ne fonctionne pas ; chaque plateforme a ses propres codes (retours à la ligne et accroches sur LinkedIn, concision extrême sur X, storytelling par email).
2. **La perte de la ligne éditoriale :** Quand plusieurs personnes rédigent ou que l'on manque d'inspiration, le ton de l'entreprise devient incohérent.
3. **Le manque de rentabilité du recyclage :** Passer des semaines à rédiger un rapport pour ne le partager qu'une seule fois est un gâchis de ressources.

### Dans quel contexte elle est utilisée
- Lors de la préparation du planning de publication hebdomadaire ou mensuel.
- Après le lancement d'un nouveau produit ou d'une nouvelle offre.
- Après un événement ou un webinaire pour en tirer des enseignements actionnables pour sa communauté.

### Quels utilisateurs peuvent l'utiliser
- Dirigeants de PME et solopreneurs gérant eux-mêmes leur communication.
- Community managers et responsables communication B2B.
- Équipes commerciales déployant une stratégie de *Social Selling*.

### Quelles tâches elle permet de réaliser
- Saisir une thématique, copier-coller un texte source ou renseigner une URL de référence.
- Définir l'audience cible et sauvegarder son guide éditorial (ton, mots-clés obligatoires).
- Cocher les canaux souhaités (LinkedIn, Twitter/X, Newsletter, Article Blog).
- Générer instantanément le pack complet de contenus avec titres, textes formatés et hashtags.
- Copier les textes individuellement ou exporter l'intégralité du pack au format Word (.docx).

---

## 3. Fonctionnalités complètes

### 1. Ingestion de Sources Flexibles (Texte, URL, Document)
- **Objectif :** Permettre de démarrer la création à partir de n'importe quel matériau existant.
- **Ce que fait l'utilisateur :** Choisit son type de source (Texte libre, URL de page web, Fichier) et saisit ou téléverse son contenu dans la zone dédiée.
- **Ce que fait l'application :** Nettoie le contenu et le prépare pour la transmission au service `content_generate.php`.
- **Ce que fait l'IA :** N/A au moment de l'ingestion.
- **Résultat obtenu :** La matière première est prête pour le découpage multi-canal.
- **Technologies utilisées :** Composants React, TailwindCSS, TypeScript.

### 2. Guide Éditorial et Personnalisation de Marque (*Brand Settings*)
- **Objectif :** Garantir que le contenu produit respecte scrupuleusement l'identité de l'entreprise.
- **Ce que fait l'utilisateur :** Renseigne le ton souhaité (ex: "Professionnel et inspirant", "Direct et technique", "Pédagogique"), la description de l'audience cible ("Dirigeants de PME et ETI") et les mots-clés stratégiques à incorporer.
- **Ce que fait l'application :** Interroge et persiste ces préférences via `content_brand_settings.php`.
- **Ce que fait l'IA :** Injecte ces contraintes de style comme consignes absolues dans le prompt système du modèle.
- **Résultat obtenu :** Des contenus sur-mesure qui ne ressemblent pas à des textes génériques d'IA.
- **Technologies utilisées :** REST API, SQL, React State.

### 3. Matrice de Génération Multi-Canal Simultanée
- **Objectif :** Décliner le contenu en une seule opération pour toutes les plateformes sélectionnées.
- **Ce que fait l'utilisateur :** Coche les canaux voulus (LinkedIn, Twitter/X, Newsletter) et clique sur "Générer le contenu multi-canal".
- **Ce que fait l'application :** Émet une requête POST vers `content_generate.php`.
- **Ce que fait l'IA :** Le modèle Groq Qwen 3.8 génère un tableau JSON contenant une fiche par canal :
  - **LinkedIn :** Phrase d'accroche ("hook") coupée avant le bouton "...voir plus", paragraphes aérés, listes à puces visuelles, question engageante en conclusion, sélection de 3 à 5 hashtags professionnels.
  - **Twitter/X :** Formule choc en moins de 280 caractères, punchline immédiate, hashtags courts.
  - **Newsletter :** Objet d'email attractif, ton complice et direct, valeur éducative immédiate, lien vers l'action.
- **Résultat obtenu :** Un carrousel de cartes visuelles interactives présentant chaque déclinaison prête à l'emploi.
- **Technologies utilisées :** Groq API (`qwen/qwen3.8-27b`), JSON formatting.

### 4. Boîte à Outils d'Édition et Copie 1-Clic
- **Objectif :** Faciliter la publication sans quitter son écran.
- **Ce que fait l'utilisateur :** Relit la carte du canal choisi, clique sur "Copier" pour l'envoyer directement sur son application mobile ou son outil de programmation (Buffer, Hootsuite).
- **Ce que fait l'application :** Copie le texte intégral avec mise en forme des sauts de ligne et hashtags dans le presse-papier, affiche un toast de confirmation.
- **Technologies utilisées :** Navigator Clipboard API, Sonner Toasts.

### 5. Exportation Professionnelle Word (.docx) & Tableau de Bord KPIs
- **Objectif :** Partager les contenus générés avec ses collègues ou son agence pour validation collective.
- **Ce que fait l'utilisateur :** Clique sur "Exporter en Word" ou consulte ses statistiques de production (mots générés, temps économisé).
- **Ce que fait l'application :** Génère un fichier .docx structuré via `content_export.php` et agrège les métriques via `content_kpis.php`.
- **Technologies utilisées :** PHPWord, REST API.

---

## 4. Parcours utilisateur complet

```
[1. Accès au Studio Éditorial /services-ia/generateur-contenu]
                          │
                          ▼
[2. Sélection de la source : Thème rédigé, URL ou fichier]
                          │
                          ▼
[3. Définition de l'audience et réglages de marque (Ton & Mots-clés)]
                          │
                          ▼
[4. Sélection des canaux cibles : LinkedIn, Twitter/X, Newsletter]
                          │
                          ▼
[5. Clic sur "Générer le contenu multi-canal"]
                          │
                          ▼
[6. Inférence IA en ~1,5 seconde via Groq / Qwen 3.8]
                          │
                          ▼
[7. Affichage des cartes de chaque réseau social]
                          │
                          ▼
[8. Relecture, ajustement et copie dans le presse-papier]
                          │
                          ▼
[9. Export éventuel du planning complet au format Word]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Moteur
- **Modèle :** `qwen/qwen3.8-27b`
- **Fournisseur :** Groq Cloud API
- **Structure :** Sortie sous forme de tableau JSON strict.

### Prompt Système du Studio Éditorial
```text
Tu es un directeur éditorial et expert copywriter B2B d'élite pour MDIV Business.
À partir du sujet ou contenu source fourni, génère une déclinaison de contenu adaptée spécifiquement aux canaux demandés : {channelList}.
Audience cible : {targetAudience}
Ton de marque : {tone}
Mots-clés stratégiques : {keywords}

Pour chaque canal sélectionné ({channelList}) :
- Adapte les codes natifs du réseau (LinkedIn : accroche puissante + aération + appel aux commentaires ; Twitter/X : concis, percutant ; Newsletter : chaleureux, instructif ; Blog : structuré avec sous-titres ; etc.).
- Ajoute des hashtags pertinents si applicable.

Tu dois répondre UNIQUEMENT par un tableau JSON valide de ce format :
[
  {
    "channel": "NomDuCanal",
    "title": "Titre accrocheur éventuel",
    "body": "Texte complet et formaté du post / article / email",
    "hashtags": ["#Hashtag1", "#Hashtag2"]
  }
]
```

---

## 6. Architecture technique

### Frontend
- **Page :** `src/pages/ServicesIAContent.tsx`
- **Service :** `src/lib/contentGeneratorService.ts`
- **Icônes & UI :** `lucide-react`, `sonner`
- **Stockage de session :** React `useState`, persistance backend des paramètres de marque

### Backend
- **Endpoint génération :** `public/api/content_generate.php` (et son mock proxy dans `vite-dev-api.ts`)
- **Endpoint réglages marque :** `public/api/content_brand_settings.php`
- **Endpoint indicateurs KPIs :** `public/api/content_kpis.php`
- **Endpoint historique :** `public/api/content_history.php`
- **Endpoint export :** `public/api/content_export.php`
- **Client Groq :** `public/api/groq_client.php`

### Base de données
- Stockage des préférences éditoriales et historique des générations rattachés au compte entreprise.

---

## 7. Architecture fonctionnelle

```
Studio Éditorial IA
│
├── Panneau d'Ingestion
│   ├── Texte brut / Idée
│   ├── Lien Web / URL
│   └── Import de fichier
│
├── Configuration de Marque
│   ├── Sélecteur de ton (Inspirant, Expert, Direct...)
│   ├── Mots-clés obligatoires
│   └── Définition de l'audience cible
│
├── Matrice de Déclinaison
│   ├── Module LinkedIn (Accroche virale, aération, hashtags)
│   ├── Module Twitter/X (Punchline < 280 car.)
│   ├── Module Newsletter (Objet, corps conversationnel, CTA)
│   └── Module Blog / SEO (Structure H2/H3)
│
└── Centre de Distribution
    ├── Copie presse-papier 1-clic
    ├── Exporteur de pack Word (.docx)
    └── Tableau de bord de suivi (mots générés, temps gagné)
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- `sourceContent` : Idée, résumé ou article de départ.
- `channels` : Liste des réseaux choisis (ex: `['LinkedIn', 'Twitter/X', 'Newsletter']`).
- `brandSettings` : Objet contenant `tone`, `editorialGuide` et `keywords`.
- `targetAudience` : Cible d'acheteurs ou de partenaires.

### Traitements
- Injection des contraintes dans le prompt de copywriting.
- Génération en inférence ultra-rapide Groq LPU.
- Validation de la structure JSON et parsing des blocs de texte.

### Données sortantes
- Tableau d'objets `GeneratedContent` :
  - `channel` : Nom du réseau.
  - `title` : Titre accrocheur.
  - `body` : Contenu complet formaté.
  - `hashtags` : Liste de hashtags ciblés.
- Fichier Word exportable.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Annonce du gain d'une certification ISO
- **Utilisateur :** David, dirigeant d'une entreprise industrielle.
- **Action :** Saisit : "Nous venons d'obtenir la certification ISO 9001 après 12 mois d'efforts de toute l'équipe. Objectif : rassurer nos clients sur notre rigueur qualité." Sélectionne : LinkedIn et Newsletter.
- **Traitement :** L'IA applique un ton professionnel et valorisant.
- **Résultat :**
  - *LinkedIn :* Un post débutant par une accroche percutante sur l'excellence opérationnelle, remerciant chaleureusement les équipes et invitant les partenaires à témoigner.
  - *Newsletter :* Un email chaleureux adressé aux clients expliquant ce que cette certification change concrètement pour eux en termes de délais et de traçabilité.

### Exemple 2 : Recyclage d'une étude sectorielle
- **Utilisateur :** Camille, directrice marketing en cabinet comptable.
- **Action :** Colle les 3 chiffres clés d'une étude sur les charges sociales des TPE. Sélectionne Twitter/X et LinkedIn.
- **Traitement :** L'IA condense les chiffres en 2 tweets percutants et un post LinkedIn pédagogique.
- **Résultat :** Prêt à poster en 15 secondes, zéro temps passé à reformuler.

---

## 10. Valeur ajoutée

- **Régularité éditoriale assurée :** Permet de publier 3 fois plus souvent sans y consacrer ses journées.
- **Respect des algorithmes sociaux :** Les formats générés sont spécifiquement pensés pour maximiser l'engagement (accroches au-dessus de la ligne de flottaison, aération, questions finales).
- **Cohérence de marque :** L'IA intègre les mots-clés et le ton spécifique à l'entreprise sur tous les supports.
- *Gain quantifié :* Économie estimée de 2 à 4 heures par semaine pour une stratégie de contenu active.

---

## 11. Limites actuelles

- **Publication automatique via API (Auto-post) :** Fonctionnalité prévue / non implémentée (la publication nécessite la copie du texte par l'utilisateur ou le passage par un programmateur externe).
- **Génération d'images d'illustration associées :** Fonctionnalité prévue / non implémentée dans cette version (le générateur est concentré sur le copywriting textuel).
- **Extraction automatique du contenu d'une URL :** Requiert un serveur de scraping en production ; en environnement de test, le texte doit être collé directement si l'URL bloque les requêtes automatisées.

---

## 12. Évolutions possibles

### Déjà implémenté
- Ingestion texte et documents.
- Configuration persistante du guide éditorial de marque.
- Déclinaison simultanée LinkedIn, Twitter/X, Newsletter.
- Copie presse-papier instantanée.
- Export du pack éditorial en Word (.docx).

### Prévu mais non implémenté
- Connecteurs directs API LinkedIn et Twitter pour publier en un clic depuis l'application.
- Calendrier éditorial visuel (vue Kanban ou calendrier mensuel).
- Intégration d'un générateur d'images d'accroche par IA (Flux / Stable Diffusion).

### Proposition d'évolution
- Analyse automatique des métriques d'engagement des posts précédents pour ajuster le style d'écriture de l'IA au fil du temps.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Transformez n'importe quelle idée ou actualité d'entreprise en une campagne de contenu complète pour LinkedIn, Twitter et votre Newsletter en 30 secondes.

### Pitch en 30 secondes
Vous savez que votre entreprise doit être active sur les réseaux sociaux, mais vous n'avez pas le temps d'écrire chaque jour ? Le Générateur de Contenu Multi-Canal IA de MDIV Business résout ce problème. Donnez-lui une simple idée ou un document : il rédige automatiquement vos posts LinkedIn captivants, vos tweets percutants et vos newsletters, en respectant parfaitement la voix de votre marque. Décuplez votre visibilité sans y passer vos soirées.

### Présentation en 1 minute
Dans le commerce moderne, si vous êtes invisible, vous n'existez pas. Mais entre la gestion des clients, les devis et les opérations, qui a le temps de passer deux heures chaque matin à imaginer des posts pour LinkedIn et Twitter ?
Le Studio Éditorial IA de MDIV Business devient votre plume attitrée. Il connaît votre entreprise, votre ton et votre cible. Il vous suffit de lui soumettre une idée, un retour client ou une annonce d'actualité pour qu'il génère instantanément des contenus calibrés pour chaque réseau social. Fini le syndrome de la page blanche, fini les copier-coller sans âme : vous communiquez avec l'impact d'une grande agence, en 3 clics.

### Problème
Les entreprises manquent de temps pour alimenter régulièrement leurs réseaux sociaux et recyclent mal leurs contenus existants.

### Solution
Une IA experte en copywriting B2B qui décline instantanément toute idée en formats optimisés pour chaque plateforme.

### Fonctionnement
Entrez votre idée -> Choisissez vos canaux et votre ton -> L'IA génère les textes -> Copiez et publiez.

### Public cible
Dirigeants de PME, créateurs d'entreprise, directeurs marketing, indépendants et commerciaux.

### Cas d'utilisation
Publications régulières LinkedIn, campagnes de newsletters, animation de comptes Twitter/X, Social Selling.

### Proposition de valeur
Multipliez votre présence en ligne par 5, gagnez 3 heures par semaine et renforcez votre image d'expert.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan sur un profil LinkedIn vide avec 0 publication depuis 3 mois, créateur de contenu la tête dans les mains devant un curseur clignotant.
- **Texte à l'écran :** "La panne d'inspiration sur LinkedIn ?"
- **Voix off :** "Vous savez que vous devez publier sur LinkedIn... mais vous n'avez aucune idée de quoi écrire aujourd'hui ?"
- **Animation CapCut :** Flash blanc + zoom d'accélération.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Horloge qui tourne vite, le créateur tape 2 mots, efface tout, soupire.
- **Texte :** "45 minutes perdues pour 1 seul post..."
- **Voix off :** "Rédiger un bon post prend 45 minutes. Et recommencer pour Twitter et sa newsletter ? Impossible !"

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Interface du Générateur de Contenu MDIV Business avec les onglets LinkedIn, X et Newsletter colorés.
- **Texte :** "Studio Éditorial IA Multi-Canal"
- **Voix off :** "Découvrez le Studio Éditorial IA de MDIV Business : votre copywriter d'élite disponible 24/7."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Saisie d'une phrase simple : "Comment optimiser sa gestion de trésorerie en PME" -> Coche des canaux -> Clic sur Générer -> Les 3 blocs de textes parfaitement formatés s'affichent instantanément.
- **Action utilisateur :** Saisie, clic sur le bouton d'action, défilement des posts générés.
- **Texte :** "1 Idée = 3 Contenus prêts à publier"
- **Voix off :** "Une simple phrase se transforme instantanément en un post LinkedIn viral avec hashtags, un thread percutant et une newsletter engageante."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Respect rigoureux de votre ton de marque.
- **Fonctionnalité 2 :** Codes algorithmiques optimisés pour chaque réseau.
- **Fonctionnalité 3 :** Export direct en Word (.docx) ou copie en 1 clic.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Notifications de likes et commentaires qui affluent sur un écran de smartphone, créateur souriant qui ferme son ordinateur portable.
- **Texte :** "Votre visibilité B2B multipliée par 5."
- **Voix off :** "Vous gagnez en visibilité et attirez de nouveaux clients, en y consacrant seulement 5 minutes par jour."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Créez vos contenus dès aujourd'hui sur mdiv-business.fr"
- **Voix off :** "Développez votre marque dès maintenant. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton clignotant "Essai sans engagement".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Navigation vers `/services-ia/generateur-contenu`, affichage de l'en-tête (3 sec).
- **Capture 2 :** Saisie dans la boîte de texte d'un sujet métier percutant (3 sec).
- **Capture 3 :** Réglage du ton sur "Inspirant & Expert" et sélection de l'audience "Dirigeants" (3 sec).
- **Capture 4 :** Coche des cases LinkedIn, Twitter/X et Newsletter (2 sec).
- **Capture 5 :** Clic sur "Générer le contenu multi-canal" avec animation de chargement (2 sec).
- **Capture 6 :** Apparition des résultats : focus sur le post LinkedIn avec son accroche soignée (4 sec).
- **Capture 7 :** Clic sur le bouton "Copier" avec notification toast verte (2 sec).
- **Capture 8 :** Clic sur "Exporter Word" pour montrer le document généré (3 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Reels / TikTok / Shorts).
- **Résolution :** 1080x1920 (HD) ou 4K.
- **Durée :** 57 secondes.
- **Rythme :** Très rythmé, transitions rapides avec effets "Camera Zoom" sur chaque apparition de carte.
- **Sous-titres :** Sous-titres dynamiques synchronisés au mot près (effet texte surligné en vert ou jaune).
- **Musique :** Piste hip-hop instrumental moderne ou Lo-Fi énergique.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Vous manquez de temps pour poster sur LinkedIn ? Une simple idée = vos posts LinkedIn, vos tweets et votre newsletter générés en 30 secondes. Testez le Studio IA sur MDIV Business.

### Publicité LinkedIn
Publier régulièrement sur LinkedIn est le levier B2B le plus rentable du moment. Mais qui a le temps d'écrire tous les jours ?
Le **Studio Éditorial IA** de MDIV Business révolutionne votre création de contenu :
1. Renseignez votre sujet ou copiez un extrait de rapport.
2. Choisissez votre ton de marque.
3. Obtenez immédiatement votre post LinkedIn structuré (accroche virale, aération, hashtags), votre tweet percutant et votre newsletter.
Multipliez votre audience par 5 sans y passer vos journées.
Testez la démo gratuite dès aujourd'hui : [Lien MDIV Business]

### Publicité Instagram
Comment les créateurs B2B publient-ils autant sans s'épuiser ? Ils utilisent l'IA pour décliner chaque idée en 5 formats différents en 1 clic. Lien en bio !

### Publicité Facebook
Ne laissez plus votre entreprise être invisible en ligne. Notre générateur IA transforme vos idées en publications captivantes pour LinkedIn et vos emails d'information. Essayez-le dès aujourd'hui.

### Description vidéo
Démonstration de notre générateur de contenu B2B : comment créer des posts LinkedIn, des tweets et une newsletter à partir d'une seule idée en 30 secondes. #MarketingB2B #Copywriting #IA #LinkedIn

### CTA
"Booster votre communication B2B dès maintenant sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle permet de créer en quelques secondes des séries de contenus éditoriaux adaptés aux spécificités de LinkedIn, Twitter/X, newsletters et blogs à partir d'une simple idée ou document.
- **L'IA respecte-t-elle le ton de mon entreprise ?**
  Oui, vous pouvez configurer vos préférences de marque (ton formel, inspirant, technique, etc.) et vos mots-clés stratégiques pour un rendu 100% fidèle à votre image.
- **Les textes générés sont-ils prêts à publier ?**
  Oui, les textes intègrent directement les retours à la ligne, les puces d'énumération, les questions d'engagement et les hashtags adaptés à chaque réseau social.
- **Puis-je exporter mes contenus en fichier bureautique ?**
  Oui, un bouton vous permet d'exporter l'ensemble des déclinaisons sous forme de document Word (.docx) structuré.
- **Combien de canaux puis-je générer simultanément ?**
  Vous pouvez cocher autant de canaux que vous le souhaitez parmi les plateformes disponibles.

---

# 19. FICHE COMMERCIALE

- **Nom :** Générateur de Contenu Multi-Canal IA
- **Catégorie :** Marketing Digital, Copywriting & Visibilité B2B
- **Public cible :** Dirigeants de PME, Responsables Marketing, Solopreneurs, Commerciaux
- **Problème :** Manque de temps pour rédiger, irrégularité des publications et panne d'inspiration
- **Solution :** Studio IA déclinant instantanément toute idée en formats natifs pour LinkedIn, Twitter/X et Newsletter
- **Fonctionnalités clés :** Prise en compte du guide éditorial de marque, accroches virales, génération multi-plateformes, copie 1-clic, export Word
- **Technologies IA :** Groq Cloud API, LLM Qwen 3.8 27B, parsing JSON multi-canal
- **Type d'IA :** Traitement automatique du langage naturel (NLP), rédaction créative et persuasion commerciale
- **Cas d'utilisation :** Social selling, campagnes de visibilité, recyclage de rapports d'activité, newsletters clients
- **Valeur ajoutée :** Multiplication par 5 du volume de publication, gain de 3h par semaine, renforcement de la notoriété
- **Statut :** Opérationnel en production (route `/services-ia/generateur-contenu`)
- **CTA :** "Générez vos contenus professionnels sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Sujet d'accroche prêt pour la démo en direct
- [ ] Paramètres de marque configurés avec des mots-clés valorisants
- [ ] Captures d'écran des 3 cartes (LinkedIn, X, Newsletter) préparées
- [ ] Script vidéo et voix off prêts
- [ ] Montage CapCut exporté aux formats 9:16 et 16:9
- [ ] Sous-titres dynamiques et effets sonores calés
- [ ] Call to action clair inséré à la fin
- [ ] Post LinkedIn de lancement rédigé
- [ ] Campagne publicitaire configurée sur les réseaux
