# Prospection Email B2B IA

## 1. Résumé de l'application

- **Nom :** Prospection Email B2B IA (Moteur d'Outreach Commercial Haute Précision)
- **Objectif :** Rédiger des emails de prospection à froid (*cold emailing*) ultra-personnalisés, percutants et axés sur la valeur client pour décrocher des rendez-vous qualifiés auprès de décideurs.
- **Problème résolu :** Le faible taux de réponse des campagnes de prospection génériques, la perception de spam par les prospects, et le temps excessif passé par les commerciaux à personnaliser manuellement chaque message.
- **Utilisateurs concernés :** Business developers (BDR/SDR), directeurs commerciaux, fondateurs d'entreprises, consultants, agences de services.
- **Cas d'utilisation :** Premier contact auprès d'un Directeur Général, demande d'entretien informel de 10 minutes avec un DSI, réactivation d'un prospect dormant, séquence commerciale multilingue pour conquérir un marché européen.
- **Valeur ajoutée :** Décrochage de rendez-vous qualifiés, multiplication par 3 du taux d'ouverture et de réponse, adaptation sectorielle pointue et multilingue native.
- **Type d'application :** Application web SaaS de génération d'outreach commercial avec scoring prédictif d'impact et analyse de persuasion.
- **Niveau d'automatisation :** Semi-automatisé avec contrôle humain : l'utilisateur qualifie la cible (entreprise, secteur, rôle, offre) et l'IA génère le message clé en main accompagné de conseils tactiques.
- **Rôle de l'IA :** Copywriter B2B expert en prospection grand compte analysant les leviers psychologiques et sectoriels pour formuler des accroches sans friction.

> **Description commerciale (2-3 phrases) :**
> Arrêtez d'envoyer des emails de prospection qui finissent à la corbeille. L'application Prospection Email B2B IA génère pour vous des messages d'outreach sur-mesure qui captent l'attention des dirigeants dès la première ligne. Obtenez plus de rendez-vous qualifiés grâce à un copywriting affûté, multilingue et fondé sur le retour sur investissement.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Les décideurs B2B reçoivent des dizaines d'emails de démarchage chaque jour. 95% d'entre eux utilisent des modèles vus et revus, parlent uniquement de leur produit sans s'intéresser aux enjeux du client et utilisent des objets trompeurs. Résultat : moins de 1% de taux de réponse et une dégradation de l'image de marque.

### Quel problème elle résout
1. **L'échec du cold outreach standard :** Les e-mails génériques sont immédiatement identifiés comme des spams.
2. **Le coût horaire de la prospection :** Rédiger un email personnalisé de qualité prend 15 à 20 minutes par cible.
3. **La barrière de la langue :** Prospecter à l'international (Allemagne, Italie, Espagne, pays anglophones) nécessite une maîtrise irréprochable des formules de politesse commerciales locales.

### Dans quel contexte elle est utilisée
- Lors des campagnes d'acquisition de nouveaux clients B2B.
- Avant une prise de contact sur LinkedIn ou par email nominatif.
- Pour relancer une opportunité commerciale refroidie depuis plusieurs mois.

### Quels utilisateurs peuvent l'utiliser
- Commerciaux B2B et chargés de développement.
- Consultants indépendants cherchant de nouvelles missions.
- Dirigeants de TPE/PME développant leur portefeuille client.

### Quelles tâches elle permet de réaliser
- Configurer les paramètres cibles : Entreprise visée, Secteur d'activité, Poste du contact (ex: DG, DAF, DRH).
- Sélectionner l'objectif de la campagne (Premier contact, RDV de 10 min, Réactivation...).
- Choisir la tonalité (Professionnel, Commercial, Premium, Consultatif, Direct, Corporate) et la langue (Français, Anglais, Espagnol, Allemand, Italien).
- Générer un email percutant avec objet accrocheur et corps optimisé.
- Évaluer la qualité du message grâce à un scoring IA complet (Impact, Clarté, Personnalisation, Engagement, Temps de lecture).
- Bénéficier de recommandations stratégiques d'envoi et de relance.

---

## 3. Fonctionnalités complètes

### 1. Formulaire de Qualification Stratégique de la Cible
- **Objectif :** Guider le modèle d'IA avec des données d'entrée précises et actionnables.
- **Ce que fait l'utilisateur :** Renseigne les champs structurés :
  - Nom de l'entreprise cible (ex: "Acme Logistics")
  - Secteur d'activité (ex: "Supply chain & transport frigorifique")
  - Poste du destinataire (ex: "Directeur des Opérations")
  - Offre / Proposition de valeur (ex: "Solution d'optimisation d'itinéraires par IA réduisant la consommation de carburant de 12%")
- **Ce que fait l'application :** Valide les données et structure l'objet de requête TypeScript `ProspectingRequest`.
- **Technologies utilisées :** React forms, TypeScript interfaces, TailwindCSS.

### 2. Sélecteur Multilingue et Tonalités Spécialisées
- **Objectif :** Permettre une prospection transfrontalière fluide avec le ton adapté à la culture du pays.
- **Ce que fait l'utilisateur :** Choisit la langue parmi Français, Anglais, Espagnol, Allemand, Italien, et le ton éditorial (ex: "Consultatif" pour une approche par le conseil, ou "Direct" pour une offre opérationnelle).
- **Ce que fait l'application :** Transmet ces directives au script `prospecting_generate.php`.
- **Technologies utilisées :** React state, HTML select components.

### 3. Moteur IA de Génération d'Email d'Outreach
- **Objectif :** Produire un message percutant, respectueux des règles d'or du cold emailing moderne.
- **Ce que fait l'utilisateur :** Clique sur "Générer la campagne de prospection".
- **Ce que fait l'application :** Envoie la requête POST au modèle Groq Qwen 3.8.
- **Ce que fait l'IA :** Construit un objet d'email court et mystérieux (évitant les mots-clés spam comme "Offre exclusive" ou "Promotion"), rédige une phrase d'accroche contextualisée au secteur du prospect, énonce un bénéfice chiffré clair et termine par un call-to-action à faible engagement (ex: "Seriez-vous ouvert à un rapide échange de 10 minutes ce jeudi ?").
- **Résultat obtenu :** Le message complet s'affiche instantanément avec son objet et son contenu.
- **Technologies utilisées :** Groq Cloud API, LLM Qwen 3.8, JSON schema validation.

### 4. Panneau d'Analyse d'Impact & Scoring Prédictif
- **Objectif :** Donner au commercial un retour objectif sur l'efficacité probable de son email avant envoi.
- **Ce que fait l'utilisateur :** Découvre les indicateurs sous le message généré :
  - **Score d'impact :** Note sur 100 estimant la force de conviction.
  - **Score de clarté :** Évaluation de la simplicité et de la lisibilité du texte.
  - **Score de personnalisation :** Mesure de l'ancrage dans la réalité de l'entreprise cible.
  - **Score d'engagement :** Probabilité de susciter une réponse ou un clic.
  - **Temps de lecture estimé :** Temps en secondes (généralement 30 à 45 secondes pour maximiser le taux de lecture sur smartphone).
  - **Niveau de persuasion :** Mention qualitative ("Élevé", "Moyen").
  - **Suggestions tactiques :** Conseils d'optimisation (ex: "Relancer à J+4 si absence de réponse", "Partager une étude de cas client").
- **Technologies utilisées :** React KPIs cards, Lucide Icons.

### 5. Copie Instantanée et Historique des Campagnes
- **Objectif :** Accélérer le passage à l'action et conserver la mémoire des messages générés.
- **Ce que fait l'utilisateur :** Clique sur "Copier le message" ou navigue dans l'historique des générations.
- **Ce que fait l'application :** Alimente le presse-papier et interroge `prospecting_history.php`.
- **Technologies utilisées :** Clipboard API, REST endpoints.

---

## 4. Parcours utilisateur complet

```
[1. Accès au module /services-ia/prospection-email]
                         │
                         ▼
[2. Saisie des informations du prospect (Entreprise, Secteur, Poste)]
                         │
                         ▼
[3. Définition de l'offre et choix de l'objectif (ex: Demande de RDV)]
                         │
                         ▼
[4. Sélection de la tonalité (ex: Consultatif) et de la langue (ex: Français)]
                         │
                         ▼
[5. Clic sur "Générer la campagne de prospection"]
                         │
                         ▼
[6. Inférence IA Groq / Qwen 3.8 en ~1,5 seconde]
                         │
                         ▼
[7. Restitution visuelle : Objet + Corps + Cartes de scoring IA]
                         │
                         ▼
[8. Lecture des suggestions tactiques de relance]
                         │
                         ▼
[9. Copie en 1 clic et expédition dans Outlook, Gmail ou Lemlist]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle :** `qwen/qwen3.8-27b`
- **Moteur d'inférence :** Groq Cloud API
- **Format :** JSON strict structuré.

### Règles d'or injectées dans le Prompt
1. Objet court, intrigant et sans artifices publicitaires.
2. Accroche centrée sur les problématiques réelles du secteur du destinataire.
3. Proposition de valeur concrète sans être agressif (focus gains de productivité et ROI).
4. Call-to-action fluide demandant un accord de principe plutôt qu'un engagement lourd.

---

## 6. Architecture technique

### Frontend
- **Page racine :** `src/pages/ServicesIAProspecting.tsx`
- **Service API :** `src/lib/prospectingEmailService.ts`
- **Composants :** Formulaires dynamiques, jauges de KPIs, notifications toasts Sonner.

### Backend
- **Endpoint génération :** `public/api/prospecting_generate.php` (et son émulation dans `vite-dev-api.ts`)
- **Endpoint historique :** `public/api/prospecting_history.php`
- **Client Groq :** `public/api/groq_client.php`

### Base de données
- Sauvegarde des campagnes générées associées à l'identifiant entreprise (`company_id`).

---

## 7. Architecture fonctionnelle

```
Prospection Email B2B IA
│
├── Cadrage de la Cible
│   ├── Fiche entreprise & secteur
│   ├── Poste du décideur
│   └── Offre de valeur
│
├── Paramétrage Éditorial
│   ├── Matrice d'objectifs (Premier contact, relance, RDV...)
│   ├── Tonalité commerciale (Consultatif, Direct, Premium...)
│   └── Moteur multilingue (FR, EN, ES, DE, IT)
│
├── Moteur de Rédaction IA
│   ├── Génération de l'objet
│   ├── Rédaction du corps d'email
│   └── Formulation du Call To Action (CTA)
│
└── Audit & Scoring Qualité
    ├── Indices d'impact, clarté et personnalisation
    ├── Estimation du temps de lecture
    └── Recommandations tactiques de suivi
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- Entreprise cible (`targetCompany`).
- Secteur d'activité (`sector`).
- Rôle du contact (`contactRole`).
- Objectif (`objective`).
- Offre à mettre en avant (`offer`).
- Tonalité (`tone`) et langue (`language`).

### Traitements
- Formulation du prompt contextuel sectoriel.
- Analyse par le LLM Qwen 3.8 avec scoring probabiliste.
- Parsing et normalisation JSON.

### Données sortantes
- `subject` : Objet d'email optimisé.
- `content` : Corps du message complet.
- `kpis` : Scores chiffrés (impact, clarté, personnalisation, engagement, temps de lecture) et suggestions d'amélioration.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Prise de contact avec un Directeur Financier (Secteur BTP)
- **Utilisateur :** Maxime, commercial dans une société de logiciels de facturation.
- **Paramètres :** Entreprise : "Bâtiment Pro", Secteur : "BTP & Construction", Contact : "Directeur Administratif et Financier", Offre : "Automatisation des relances clients et réduction des délais de paiement de 15 jours", Tonalité : "Consultatif".
- **Résultat IA :**
  - *Objet :* `Délais de règlement dans le BTP / Bâtiment Pro`
  - *Corps :* Mentionne les spécificités des acomptes et situations de travaux dans le bâtiment, présente le gain moyen constaté chez des confrères du secteur, et propose un échange de 10 minutes pour comparer leurs méthodes actuelles.
  - *Score d'impact :* 94/100, Temps de lecture : 38 secondes.

### Exemple 2 : Prospection en Allemagne d'un responsable logistique
- **Utilisateur :** Antoine, directeur du développement international.
- **Paramètres :** Entreprise : "Bavaria Spedition", Secteur : "Logistique européenne", Contact : "Head of Logistics", Langue : "Allemand", Tonalité : "Corporate".
- **Résultat IA :** Un email rédigé en allemand professionnel irréprochable avec les salutations formelles d'usage (*Sehr geehrter Herr...*), un exposé précis des gains d'efficacité et un appel à l'action adapté aux pratiques d'affaires germaniques.

---

## 10. Valeur ajoutée

- **Hausse du taux de transformation :** Des messages contextualisés qui obtiennent jusqu'à 3 fois plus de réponses positives.
- **Gain de temps massif :** 1 minute pour concevoir un email haute performance contre 20 minutes à la main.
- **Ouverture internationale immédiate :** Prospection dans 5 langues européennes sans faire appel à un traducteur externe.
- *Gain quantifié :* Taux de lecture optimal garanti grâce au contrôle strict du temps de lecture inférieur à 45 secondes.

---

## 11. Limites actuelles

- **Envoi de masse automatisé (Cold email blast) :** Fonctionnalité prévue / non implémentée (l'application génère des emails unitaires ou modèles de séquences, sans serveur SMTP de mass-mailing intégré).
- **Enrichissement de données (Dropcontact / Hunter.io) :** Fonctionnalité prévue / non implémentée (l'utilisateur renseigne manuellement le nom et le secteur de l'entreprise).
- **A/B Testing automatique :** Non disponible dans l'interface actuelle.

---

## 12. Évolutions possibles

### Déjà implémenté
- Qualification ciblée (secteur, entreprise, poste).
- 6 tonalités commerciales et 5 langues européennes.
- Génération d'objet et corps d'email par Groq Qwen 3.8.
- Scoring d'impact et suggestions tactiques.
- Copie instantanée dans le presse-papier.

### Prévu mais non implémenté
- Génération automatique d'une séquence complète de 3 à 4 relances échelonnées (J+3, J+7, J+14).
- Intégration directe avec les outils de sales automation (Lemlist, Waalaxy, HubSpot).
- Détection automatique des adresses email professionnelles via connecteurs externes.

### Proposition d'évolution
- Analyse sémantique des réponses des prospects pour suggérer automatiquement la contre-argumentation idéale.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Générez des emails de prospection B2B ultra-personnalisés qui transforment des prospects froids en rendez-vous d'affaires qualifiés.

### Pitch en 30 secondes
Vos commerciaux passent des heures à envoyer des emails de prospection qui restent sans réponse ? Avec Prospection Email B2B IA de MDIV Business, vous générez en quelques secondes des messages percutants, adaptés au secteur et au poste de votre cible. Dotée d'un score d'impact prédictif et capable d'écrire en 5 langues, notre IA vous aide à remplir votre carnet de rendez-vous sans effort.

### Présentation en 1 minute
Dans la vente B2B, l'époque des copier-coller de masse est révolue. Pour capter l'attention d'un dirigeant ou d'un directeur des achats, il faut lui parler de ses défis quotidiens dès les premières secondes.
Prospection Email B2B IA a été conçue pour donner à vos commerciaux la force de frappe d'un copywriter d'élite. En renseignant le profil de votre prospect et votre offre, notre intelligence artificielle rédige un message d'approche irrésistible : un objet intrigant qui donne envie d'ouvrir, une accroche sectorielle qui prouve votre légitimité, et un appel à l'action naturel sans agressivité. Grâce au panneau de scoring intégré, vous vérifiez immédiatement l'impact de votre message avant de l'envoyer. Remplissez votre pipeline commercial plus vite que jamais.

### Problème
Les emails de prospection génériques ne sont pas lus, finissent dans les spams et font perdre un temps précieux aux équipes commerciales.

### Solution
Une IA qui génère des emails de prospection hautement personnalisés avec un score d'impact en temps réel et un support multilingue.

### Fonctionnement
Renseignez votre cible -> Choisissez l'angle et la langue -> L'IA génère le message et analyse sa persuasion -> Envoyez et décrochez le RDV.

### Public cible
Commerciaux B2B, BDR, SDR, fondateurs de startups, agences et consultants.

### Cas d'utilisation
Cold emailing, prospection grands comptes, démarchage international, relance de prospects inactifs.

### Proposition de valeur
Multipliez par 3 vos retours de prospection et économisez 15 minutes par email rédigé.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan sur une boîte de réception avec 100 emails marqués comme "Non lus" ou déplacés directement vers la corbeille.
- **Texte à l'écran :** "0 réponse à vos emails de prospection ?"
- **Voix off :** "Vous envoyez des dizaines d'emails de prospection chaque semaine... pour zéro réponse ?"
- **Animation CapCut :** Zoom brusque + bruitage de notification d'erreur.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:11 (6 sec)
- **Visuel :** Texte d'email impersonnel : "Bonjour, je me permets de vous contacter pour vous présenter notre société...", le prospect clique sur "Supprimer".
- **Texte :** "Le piège des modèles copier-coller."
- **Voix off :** "Les modèles génériques finissent direct à la poubelle. Les décideurs veulent qu'on leur parle de LEURS problèmes !"

## Scène 3 — La solution
- **Durée :** 00:11 – 00:18 (7 sec)
- **Visuel :** Écran du module MDIV Business "Prospection Email B2B" avec ses formulaires élégants et ses jauges d'impact colorées.
- **Texte :** "Prospection Email B2B IA"
- **Voix off :** "Voici Prospection Email B2B IA de MDIV Business : le générateur qui transforme votre approche commerciale."

## Scène 4 — Démonstration
- **Durée :** 00:18 – 00:34 (16 sec)
- **Visuel à enregistrer dans l'application :** Saisie rapide de la cible (Entreprise X, Secteur Logistique, DAF) -> Choix du ton "Consultatif" -> Clic sur Générer -> Apparition instantanée du texte et des scores d'impact verts à 92%.
- **Action utilisateur :** Remplissage des 4 champs, clic sur le bouton, survol des scores de persuasion.
- **Texte :** "Personnalisation chirurgicale + Scoring prédictif"
- **Voix off :** "En 3 clics, l'IA rédige un email ultra-ciblé, évalue son impact et vous garantit un temps de lecture idéal de moins de 40 secondes."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:34 – 00:43 (9 sec)
- **Fonctionnalité 1 :** Rédigé en 5 langues européennes natives.
- **Fonctionnalité 2 :** 6 tonalités commerciales au choix.
- **Fonctionnalité 3 :** Suggestions tactiques de relance incluses.

## Scène 6 — Résultat
- **Durée :** 00:43 – 00:51 (8 sec)
- **Visuel :** Réponse enthousiaste d'un prospect qui s'affiche à l'écran : "Bonjour, votre message tombe à pic, échangeons jeudi à 10h !"
- **Texte :** "Plus de RDV. Moins d'effort."
- **Voix off :** "Résultat : votre boîte mail se remplit de rendez-vous qualifiés et vos commerciaux gagnent des heures chaque jour."

## Scène 7 — Call To Action
- **Durée :** 00:51 – 01:00 (9 sec)
- **Texte :** "Testez la prospection IA sur mdiv-business.fr"
- **Voix off :** "Boostez votre pipeline commercial dès aujourd'hui. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton cliquable "Essai gratuit".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Arrivée sur `/services-ia/prospection-email`, vue d'ensemble du formulaire (3 sec).
- **Capture 2 :** Remplissage des champs : "Entreprise cible" et "Secteur d'activité" (3 sec).
- **Capture 3 :** Sélection du ton "Consultatif" et de la langue "Français" (2 sec).
- **Capture 4 :** Clic sur "Générer la campagne de prospection" avec loader rapide (2 sec).
- **Capture 5 :** Zoom sur l'objet percutant et les 3 premiers paragraphes du message (4 sec).
- **Capture 6 :** Plan serré sur les scores d'impact : Impact 92%, Clarté 94%, Temps de lecture 35s (4 sec).
- **Capture 7 :** Clic sur le bouton "Copier le message" avec notification de succès (2 sec).

---

# 16. MONTAGE CAPCUT

- **Format :** 9:16 vertical (Shorts / Reels) et 16:9 (LinkedIn).
- **Résolution :** 1080x1920 / 4K 60fps.
- **Durée :** 56 secondes.
- **Rythme :** Rythmé et énergique, zoom caméra sur les chiffres clés et scores verts.
- **Sous-titres :** Sous-titres dynamiques synchronisés au format "Pop-up" bicolore blanc et vert néon.
- **Musique :** Style trap corporate léger ou future beats dynamique.

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte
Marre d'envoyer des emails de prospection dans le vide ? Notre IA génère des messages ultra-ciblés avec score d'impact pour décrocher des RDV qualifiés. Testez sur MDIV Business.

### Publicité LinkedIn
95% des emails de prospection B2B échouent pour une seule raison : ils parlent du vendeur, pas de l'acheteur.
Grâce à **Prospection Email B2B IA** sur MDIV Business :
- Ciblez le secteur exact et le poste de votre prospect
- Choisissez votre ton (Consultatif, Direct, Premium)
- Obtenez un email chirurgical avec un score d'impact certifié et un temps de lecture inférieur à 40 secondes.
Arrêtez de prospecter dans le vide, commencez à signer des rendez-vous.
Lien vers la plateforme en premier commentaire !

### Publicité Instagram
L'époque des copier-coller de masse est morte. Découvrez comment l'IA rédige des emails de prospection que les dirigeants lisent et auxquels ils répondent. Lien en bio.

### Publicité Facebook
Envie de remplir votre agenda commercial ? Découvrez notre générateur IA d'emails de prospection B2B. Des messages percutants, multilingues et calibrés pour maximiser votre taux de réponse. Essayez gratuitement !

### Description vidéo
Démonstration de notre outil de prospection commerciale par IA : comment rédiger un email d'outreach percutant avec score d'impact en 30 secondes. #Prospection #B2B #Sales #IA #Business

### CTA
"Remplissez votre carnet de rendez-vous sur MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle permet de concevoir des emails de prospection commerciale B2B sur-mesure pour engager des décideurs et planifier des rendez-vous.
- **Pourquoi l'application donne-t-elle des scores d'impact ?**
  Pour vous garantir que le message respecte les meilleures pratiques de délivrabilité, de clarté, de personnalisation et de concision avant votre envoi.
- **Peut-on prospecter à l'international ?**
  Oui, l'outil prend en charge 5 langues : Français, Anglais, Espagnol, Allemand et Italien avec respect des codes d'affaires locaux.
- **L'application se connecte-t-elle à ma messagerie ?**
  Vous pouvez copier le message en 1 clic pour l'envoyer depuis votre boîte mail habituelle (Outlook, Gmail) ou l'importer dans votre logiciel de prospection.
- **Mes données de prospection sont-elles partagées ?**
  Non, les données saisies restent strictement confidentielles et ne sont jamais divulguées à des tiers.

---

# 19. FICHE COMMERCIALE

- **Nom :** Prospection Email B2B IA
- **Catégorie :** Prospection Commerciale & Sales Automation
- **Public cible :** Commerciaux B2B, BDR, SDR, Directeurs Commerciaux, Indépendants
- **Problème :** Emails génériques ignorés, faible taux de réponse et chronophagie de la rédaction
- **Solution :** Moteur IA d'outreach personnalisé avec scoring prédictif et support multilingue
- **Fonctionnalités clés :** Ciblage sectoriel, 6 tonalités, 5 langues, indicateurs d'impact et clarté, copie 1-clic
- **Technologies IA :** Groq Cloud API, LLM Qwen 3.8 27B, sortie JSON structurée
- **Type d'IA :** Traitement automatique du langage naturel (NLP), persuasion commerciale
- **Cas d'utilisation :** Cold outreach, relance de comptes dormants, prospection export
- **Valeur ajoutée :** Multiplication par 3 des taux de réponse, gain de 15 minutes par email, professionnalisation de l'approche commerciale
- **Statut :** Opérationnel en production (route `/services-ia/prospection-email`)
- **CTA :** "Générez vos emails de prospection sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Exemple d'entreprise et d'offre prêt pour la démo
- [ ] Captures d'écran de l'interface et des jauges de score prêtes
- [ ] Script vidéo validé pour l'enregistrement
- [ ] Voix off enregistrée ou synthétisée
- [ ] Montage CapCut finalisé avec animations de texte percutantes
- [ ] Sous-titres bicolores et effets sonores calés
- [ ] Appel à l'action clair et visuel à la fin
- [ ] Versions formats 9:16 et 16:9 générées
- [ ] Publication LinkedIn prête pour la diffusion
- [ ] Campagne publicitaire configurée
