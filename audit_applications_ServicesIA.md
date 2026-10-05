# 🔍 Audit Complet — Applications ServicesIA MDIV Business

> Analyse de 12 applications IA intégrées à la plateforme. Pour chaque app : fonctionnalités existantes, comment les utiliser, usage de l'IA, et propositions d'enrichissement.

---

## 1. 📧 Assistant Email IA (`/services-ia/emails-ia`)

**Objectif :** Rédiger, corriger et optimiser des emails professionnels grâce à l'IA, puis les envoyer via Gmail ou Microsoft 365.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Éditeur de brouillon** | Zone de texte libre pour taper son email. | L'utilisateur clique dans la zone et tape librement son brouillon, même imparfait ou en abréviations. L'IA prend le relais ensuite. | Partiel |
| **Sélection Objectif** | Choisir le but de l'email (Nouvel email, Réponse, Relance…). | Cliquer sur le menu déroulant "Objectif de l'email" et sélectionner le type parmi la liste. | ✅ Oui |
| **Sélection Ton** | Choisir le registre souhaité (Professionnel, Amical, Formel, Direct…). | Cliquer sur le menu "Ton souhaité" et sélectionner le registre. L'IA tient compte de ce choix lors des reformulations. | ✅ Oui |
| **Correction orthographique IA** | L'IA corrige toutes les fautes sans modifier le fond du message. | Après avoir tapé son brouillon, cliquer sur le bouton "Corriger". L'IA analyse et remplace le texte corrigé dans l'éditeur en quelques secondes. | ✅ Oui |
| **Reformulation IA** | L'IA réécrit l'email de façon plus claire et fluide. | Cliquer sur "Reformuler". L'IA réécrit intégralement le texte avec un meilleur enchaînement d'idées tout en préservant l'intention d'origine. | ✅ Oui |
| **Amélioration du ton IA** | L'IA adapte le registre du texte selon le ton choisi. | Sélectionner d'abord le ton voulu dans le menu, puis cliquer "Améliorer le ton". L'IA ajuste tout le vocabulaire et la structure en conséquence. | ✅ Oui |
| **Version plus vendeur** | L'IA reformule l'email avec des arguments commerciaux percutants. | Cliquer "Plus vendeur". L'IA ajoute des formules d'accroche, met en avant les bénéfices et insère un appel à l'action fort. | ✅ Oui |
| **Version plus courte** | L'IA condense le texte pour ne garder que l'essentiel. | Cliquer "Plus court". L'IA supprime les répétitions et formules inutiles, conserve uniquement le message clé. | ✅ Oui |
| **Analyse en temps réel (KPIs)** | Pendant la rédaction, l'IA analyse le texte et affiche des indicateurs (lisibilité, persuasion, longueur…). | Automatique : dès que l'utilisateur tape plus de 10 caractères, l'analyse se lance après 1 seconde de pause. Les scores s'affichent dans le panneau latéral droit. | ✅ Oui |
| **Copier l'email** | Copier le texte en 1 clic dans le presse-papier. | Cliquer sur le bouton "Copier l'email" en bas de l'éditeur. Une notification confirme la copie. | ❌ Non |
| **Effacer le texte** | Réinitialiser complètement l'éditeur. | Cliquer sur l'icône Corbeille. Une fenêtre de confirmation apparaît avant la suppression définitive. | ❌ Non |
| **Envoi Gmail / Outlook** | Créer un brouillon ou envoyer directement via le compte email connecté. | Cliquer "Envoyer / Brouillon". Un modal s'ouvre pour choisir le destinataire et le compte expéditeur (Gmail ou M365 préalablement connecté). | ❌ Non |
| **Historique des emails** | Onglet listant les emails générés précédemment. | Cliquer sur l'onglet "Historique". La liste des emails apparaît avec date, objectif et aperçu. Cliquer "Réutiliser" pour charger un ancien email dans l'éditeur. | ❌ Non |
| **Intégrations (M365, Google)** | Onglet pour connecter / déconnecter Gmail et Microsoft 365. | Cliquer sur l'onglet "Intégrations". Cliquer "Connecter" à côté de Gmail ou M365. Une redirection OAuth ouvre la page de connexion du fournisseur. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Templates d'emails** | Bibliothèque de modèles pré-remplis (prospection, relance devis, confirmation RDV…). | Un bouton "Templates" ouvre un panneau latéral avec les modèles. L'utilisateur clique sur un template, il se charge dans l'éditeur et peut être personnalisé. | ✅ Oui |
| **Détection de langue automatique** | Détecter la langue du brouillon et proposer une traduction. | L'IA détecte automatiquement la langue tapée et affiche un bouton "Traduire en [langue]" pour basculer en 1 clic. | ✅ Oui |
| **Score Anti-Spam** | Alerter si des mots risquent de déclencher les filtres spam. | Un indicateur "Anti-spam" s'affiche dans les KPIs avec un score et la liste des mots problématiques surlignés dans l'éditeur. | ✅ Oui |
| **Suivi d'ouverture** | Savoir si l'email a été ouvert par le destinataire. | Cocher "Activer le suivi" avant l'envoi. L'app insère un pixel invisible. L'utilisateur reçoit une notification quand l'email est lu. | ❌ Non |
| **Planification d'envoi** | Programmer l'envoi à une date et heure précises. | Dans le modal d'envoi, choisir "Planifier" au lieu d'"Envoyer maintenant" puis sélectionner date et heure dans un sélecteur de date. | ❌ Non |
| **Suggestions d'objet IA** | Générer 3-5 propositions d'objet optimisées pour le taux d'ouverture. | Un bouton "Générer l'objet" apparaît au-dessus de l'éditeur. L'IA propose 3 options, l'utilisateur clique sur celle qu'il préfère. | ✅ Oui |
| **Mode dictée vocale** | Dicter son email à la voix, l'IA transcrit et reformule. | Cliquer sur le micro. L'utilisateur parle, l'IA transcrit et reformule automatiquement en texte propre dans l'éditeur. | ✅ Oui |

---

## 2. 🎯 Générateur de Leads B2B IA (`/services-ia/generateur-leads-b2b`)

**Objectif :** Identifier, qualifier et enrichir des prospects B2B via une recherche IA multicritères.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Formulaire de recherche multicritères** | Définir les critères : secteur, pays, région, taille d'entreprise, fonction cible, mots-clés. | L'utilisateur remplit les champs du formulaire à gauche : secteur (ex: Technologie), pays, région, taille (ex: 51-250 employés), fonction cible (ex: CEO/DSI), mots-clés. | ❌ Non |
| **Recherche IA de leads** | L'IA identifie les entreprises correspondant aux critères avec enrichissement automatique. | Après avoir rempli le formulaire, cliquer "Lancer la recherche IA". L'IA analyse et retourne une liste de leads qualifiés en 10-20 secondes. | ✅ Oui |
| **Scoring des leads** | Chaque lead reçoit un score de potentiel (Très élevé / Élevé / Moyen). | Automatique : visible directement sur chaque carte lead. Un badge coloré indique le niveau (vert = Très élevé, bleu = Élevé, orange = Moyen). | ✅ Oui |
| **Fiche détaillée par lead** | Vue complète : nom, description, maturité digitale, décideurs, site web. | Cliquer sur un lead dans la liste de gauche. La fiche détaillée s'affiche à droite avec toutes les informations enrichies par l'IA. | ✅ Oui |
| **Sélection multiple de leads** | Sélectionner plusieurs leads pour les exporter en lot. | Cocher la case à gauche de chaque lead souhaité dans la liste. Un compteur affiche le nombre sélectionné. | ❌ Non |
| **Export Excel** | Exporter les leads sélectionnés en fichier Excel. | Après sélection, cliquer "Exporter → Excel". Le fichier .xlsx se télécharge automatiquement avec toutes les informations des leads. | ❌ Non |
| **Export CRM** | Exporter les leads directement vers un CRM connecté. | Cliquer "Exporter → CRM". Les leads sélectionnés sont poussés dans le CRM configuré dans les paramètres de l'entreprise. | ❌ Non |
| **Dashboard KPIs** | Indicateurs clés : leads générés, taux de qualification, taux de conversion. | Cliquer sur l'onglet "Dashboard". Les KPIs s'affichent sous forme de cartes et graphiques mis à jour automatiquement. | ✅ Oui |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Génération d'email de prospection automatique** | Pour chaque lead, générer un email de premier contact personnalisé. | Depuis la fiche d'un lead, cliquer "Générer un email". L'app bascule vers l'application Email Prospection avec le lead pré-rempli. | ✅ Oui |
| **Analyse du site web du prospect** | L'IA explore le site web du lead pour extraire des informations. | Automatique lors de la recherche, ou bouton "Analyser le site" depuis la fiche lead pour déclencher une analyse approfondie. | ✅ Oui |
| **Veille concurrentielle** | Identifier les concurrents actifs sur les mêmes segments. | Un onglet "Veille" affiche les concurrents détectés et leurs activités récentes, avec alertes email optionnelles. | ✅ Oui |
| **Intégration CRM native** | Connecteur direct vers HubSpot, Salesforce, Pipedrive. | Dans les paramètres, configurer la clé API du CRM. Ensuite, un bouton "Envoyer vers CRM" apparaît sur chaque lead. | ❌ Non |
| **Pipeline de suivi leads** | Vue Kanban pour suivre l'évolution de chaque lead. | Un onglet "Pipeline" affiche les leads dans des colonnes (À contacter / Contacté / En discussion / Converti). Glisser-déposer pour changer de statut. | ❌ Non |
| **Alertes nouvelles opportunités** | Notification quand un prospect correspondant aux critères sauvegardés apparaît. | Cliquer "Sauvegarder cette recherche". L'app enverra un email ou une notification push quand de nouveaux leads matchent. | ✅ Oui |
| **Enrichissement LinkedIn** | Récupérer le profil LinkedIn des décideurs identifiés. | Automatique si le compte LinkedIn Sales Navigator est connecté. Un bouton "Voir sur LinkedIn" apparaît sur chaque lead. | ✅ Oui |

---

## 3. 📩 Emails de Prospection IA (`/services-ia/emails-prospection-ia`)

**Objectif :** Générer des séquences d'emails de prospection B2B hyperpersonnalisées.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Formulaire de ciblage** | Renseigner : entreprise cible, secteur, rôle du contact, offre à promouvoir, objectif. | Remplir les champs : Entreprise cible (ex: "Renault"), Secteur (ex: "Automobile"), Rôle du contact (ex: "DSI"), Offre (ex: "Microsoft Copilot"), puis choisir l'objectif. | ❌ Non |
| **Sélection du ton** | 6 tons : Professionnel, Commercial, Premium, Consultatif, Direct, Corporate. | Cliquer sur un des 6 boutons de ton dans le formulaire. Le bouton sélectionné se surligne. | ❌ Non |
| **Sélection de la langue** | Génération en Français, Anglais, Espagnol, Allemand ou Italien. | Choisir la langue dans le menu déroulant. L'email sera entièrement rédigé dans la langue choisie. | ❌ Non |
| **Sélection de l'objectif** | 6 objectifs : Premier contact, Relance, Séquence, RDV, Présentation d'offre, Réactivation. | Cliquer sur l'objectif dans la liste déroulante. L'IA adapte toute la structure de l'email selon l'objectif. | ❌ Non |
| **Génération IA de la campagne** | L'IA génère un email complet personnalisé selon tous les paramètres. | Cliquer "Générer la campagne". L'IA rédige l'email en 5-15 secondes. Le résultat s'affiche sous le formulaire. | ✅ Oui |
| **Affichage structuré du résultat** | Présentation séparée : objet, corps, points de personnalisation, call-to-action. | Le résultat apparaît avec des sections distinctes : "Objet suggéré", "Corps de l'email", "Arguments clés utilisés", "CTA recommandé". | ✅ Oui |
| **Copier l'email** | Copier en 1 clic le résultat. | Cliquer "Copier" sous l'email généré. Une notification confirme la copie dans le presse-papier. | ❌ Non |
| **Envoi direct via Gmail / M365** | Envoyer ou créer un brouillon depuis la plateforme. | Cliquer "Envoyer" sous le résultat. Un modal s'ouvre pour saisir le destinataire et choisir le compte expéditeur connecté. | ❌ Non |
| **Historique des campagnes** | Liste de tous les emails générés avec filtres. | Cliquer sur l'onglet "Historique". Les campagnes s'affichent avec date, entreprise cible et aperçu. Filtrer par date ou cible dans la barre de recherche. | ❌ Non |
| **Onglet Intégrations** | Gestion des connexions Gmail / Microsoft 365. | Cliquer sur "Intégrations". Cliquer "Connecter" et s'authentifier via le compte Gmail ou M365. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Séquence multi-emails automatisée** | Générer une séquence complète de 3 à 5 emails espacés dans le temps. | Cocher "Créer une séquence" avant de générer. L'IA crée les emails J0, J+3, J+7 avec escalade progressive. Chaque email est visualisable dans un onglet dédié. | ✅ Oui |
| **Personnalisation dynamique** | Insérer automatiquement des données du lead dans l'email (prénom, actualité…). | L'IA détecte les champs dynamiques et les insère avec des balises {prénom}, {secteur}. L'utilisateur prévisualise le rendu final avant envoi. | ✅ Oui |
| **A/B Test IA** | Générer 2 versions différentes du même email. | Un bouton "Générer variante A/B" crée 2 versions avec des accroches différentes. L'utilisateur choisit ou teste les deux en envoi alterné. | ✅ Oui |
| **Score de conversion prédit** | L'IA estime la probabilité de réponse. | Un badge "Score de réponse estimé : 72%" s'affiche sous l'email généré, avec les facteurs qui font monter ou baisser ce score. | ✅ Oui |
| **Intégration automatique avec Leads B2B** | Depuis la liste de leads, envoyer directement un email personnalisé. | Sur la fiche lead, un bouton "Prospecter" lance la génération avec les informations du lead pré-remplies dans le formulaire. | ✅ Oui |
| **Blacklist / exclusions** | Gérer une liste d'entreprises ou contacts à ne pas contacter. | Un onglet "Blacklist" permet d'ajouter des domaines ou noms. L'IA avertit automatiquement si une cible est dans la liste. | ❌ Non |

---

## 4. 🎙️ Compte-rendu de Réunion IA (`/services-ia/compte-rendu-reunion-ia`)

**Objectif :** Transformer un fichier audio, vidéo ou une transcription texte de réunion en compte-rendu structuré.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Import de fichier audio/vidéo** | Uploader un enregistrement de réunion (MP3, MP4, WAV…). | Cliquer "Importer un fichier" ou glisser-déposer le fichier dans la zone prévue. Le fichier s'uploade vers le serveur pour traitement. | ❌ Non |
| **Capture photo de document (OCR)** | Photographier des notes manuscrites ou un tableau blanc. | Cliquer "Prendre une photo". La caméra de l'appareil s'active. Après la photo, l'IA extrait le texte via OCR et l'affiche pour validation. | ✅ Oui |
| **Saisie de transcription texte** | Coller directement la transcription dans une zone texte. | Cliquer sur l'onglet "Texte", puis coller ou taper la transcription de la réunion dans la zone. | ❌ Non |
| **Analyse par agents IA** | 2-3 agents IA "débattent" pour analyser le contenu en temps réel. | Automatique après soumission : une animation montre les agents en discussion, leurs messages s'affichent en streaming. L'utilisateur voit l'analyse se construire en direct. | ✅ Oui |
| **Rapport structuré** | Rapport complet : résumé exécutif, décisions, tâches assignées, points de vigilance. | Automatique : après l'analyse des agents, le rapport apparaît structuré en sections colorées. Chaque tâche liste le responsable et le délai. | ✅ Oui |
| **Export du rapport** | Télécharger le rapport en PDF ou Word. | Cliquer "Télécharger PDF" ou "Télécharger Word" dans le rapport. Le fichier se génère et se télécharge automatiquement. | ❌ Non |
| **Historique des réunions** | Liste de tous les comptes-rendus générés avec recherche. | Cliquer sur l'onglet "Historique". Saisir un mot-clé dans la barre de recherche pour retrouver une réunion. Cliquer sur une entrée pour la rouvrir. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Transcription audio temps réel** | Enregistrer une réunion en direct et transcrire en live. | Cliquer "Enregistrer une réunion". Le navigateur accède au micro. La transcription s'affiche mot à mot en direct et se sauvegarde automatiquement. | ✅ Oui |
| **Attribution automatique des tâches** | Détecter les noms cités dans la réunion et attribuer les tâches. | L'IA identifie "Pierre va s'occuper de…" et crée automatiquement une tâche assignée à Pierre avec la description et la deadline mentionnée. | ✅ Oui |
| **Envoi du compte-rendu par email** | Envoyer le CR automatiquement à tous les participants. | Après génération, un bouton "Envoyer le CR" liste les participants détectés. L'utilisateur valide et l'email part avec le rapport en pièce jointe. | ✅ Oui |
| **Intégration calendrier** | Créer les tâches de suivi dans Google Calendar ou Outlook. | Un bouton "Créer les tâches dans l'agenda" apparaît sur le rapport. Cliquer ouvre une fenêtre de confirmation et ajoute les tâches dans le calendrier connecté. | ❌ Non |
| **Détection des engagements** | L'IA identifie les promesses faites durant la réunion. | Une section dédiée "Engagements pris" liste toutes les formules d'engagement ("on va faire ça", "je reviens vers vous") avec leur contexte. | ✅ Oui |
| **Suivi des tâches** | Tableau de bord pour cocher les tâches issues des réunions. | Un onglet "Mes tâches" liste toutes les actions issues des CR. L'utilisateur coche "Terminé" pour chaque tâche accomplie. | ❌ Non |

---

## 5. 📄 Résumé de Documents IA (`/services-ia/analyseur-documents-ia`)

**Objectif :** Résumer automatiquement n'importe quel document en différents formats adaptés au contexte.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Import de document** | Uploader un PDF, Word ou fichier texte. | Cliquer "Importer un document" ou glisser-déposer dans la zone. Les formats acceptés sont PDF, DOCX, DOC, TXT. | ❌ Non |
| **Capture photo OCR** | Photographier un document physique : l'IA extrait le texte. | Cliquer "Prendre une photo". La caméra s'active. Après la photo, le texte est extrait et affiché pour confirmation avant l'analyse. | ✅ Oui |
| **Sélection du mode de résumé** | 5 modes : Express, Standard, Détaillé, Direction, Comex. | Avant de lancer l'analyse, cliquer sur un des 5 boutons de mode pour choisir le niveau de détail souhaité. | ❌ Non |
| **Analyse par agents IA** | Plusieurs agents IA analysent le document en "discussion" visible. | Automatique après envoi du document : les agents s'affichent avec leur nom et leurs messages apparaissent en streaming via SSE (Server-Sent Events). | ✅ Oui |
| **Rapport de résumé structuré** | Résumé formaté selon le mode : points clés, idées principales, recommandations, risques. | Apparaît automatiquement après l'analyse. Format adapté au mode choisi (ex: Comex = 5 bullets ultra-courts, Détaillé = sections complètes). | ✅ Oui |
| **Réinitialisation** | Recommencer avec un nouveau document. | Cliquer "Nouveau document" ou "Recommencer". Tout est remis à zéro et l'interface revient à l'état initial d'upload. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Résumé multi-documents** | Comparer et synthétiser plusieurs documents ensemble. | Sélectionner plusieurs fichiers dans la zone d'upload (ou les déposer simultanément). L'IA synthétise tous les documents en un seul rapport comparatif. | ✅ Oui |
| **Export du résumé en PDF/Word** | Télécharger le résumé dans un format mis en page. | Cliquer "Télécharger" sous le rapport. Choisir entre PDF (mise en page professionnelle) et Word (éditable). | ❌ Non |
| **Historique des documents analysés** | Retrouver facilement les résumés précédents. | Un onglet "Historique" liste les documents analysés avec date, nom du fichier, mode utilisé. Cliquer pour rouvrir le résumé. | ❌ Non |
| **Questions/Réponses sur le document** | Poser des questions spécifiques après le résumé. | Une zone de chat apparaît sous le résumé. Taper une question (ex: "Quelle est la clause de résiliation ?"). L'IA répond en citant le passage du document. | ✅ Oui |
| **Traduction du résumé** | Traduire automatiquement le résumé dans la langue souhaitée. | Un menu "Traduire en [langue]" apparaît sous le résumé. Sélectionner la langue cible. L'IA traduit le résumé en conservant la structure. | ✅ Oui |
| **Annotation et surlignage** | Afficher le document côte à côte avec le résumé et mettre en évidence les passages clés. | Un mode "Lecture côte à côte" affiche le PDF à gauche et le résumé à droite. Les passages clés sont surlignés dans le PDF et cliquables pour voir l'explication. | ✅ Oui |

---

## 6. ✍️ Générateur de Contenu Multi-Canal (`/services-ia/generateur-contenu`)

**Objectif :** Transformer un sujet, une URL ou un document en contenu adapté simultanément à plusieurs canaux (LinkedIn, Blog, Newsletter, X, Facebook, YouTube Script…).

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Source par texte** | Saisir directement un sujet ou un brief. | Sélectionner l'onglet "Texte" dans la source, puis taper le sujet ou le brief dans la zone de texte. | ❌ Non |
| **Source par URL** | Coller une URL : l'IA génère du contenu depuis le contenu de la page. | Sélectionner l'onglet "URL", coller le lien. L'IA scrape la page et extrait son contenu pour l'utiliser comme base. | ✅ Oui |
| **Source par fichier** | Importer un document comme base de contenu. | Sélectionner l'onglet "Fichier", cliquer "Importer" ou glisser-déposer le document (PDF, Word). | ❌ Non |
| **Sélection d'audience cible** | Préciser l'audience visée. | Remplir le champ "Audience cible" (ex: "DSI de PME industrielles"). L'IA adapte le vocabulaire et les arguments en conséquence. | ❌ Non |
| **Sélection multi-canal** | Choisir un ou plusieurs canaux simultanément. | Cliquer sur les icônes des canaux dans la liste (LinkedIn, Blog, Newsletter, X, Facebook, Telegram, YouTube). Les canaux sélectionnés se colorent. | ❌ Non |
| **Génération IA simultanée** | L'IA génère en une fois les versions adaptées pour chaque canal. | Cliquer "Générer le contenu". L'IA produit simultanément le contenu adapté à chaque canal sélectionné (ton, longueur, format différents). | ✅ Oui |
| **Affichage par onglet canal** | Navigation entre les contenus générés par onglet. | Les onglets apparaissent sous le formulaire, un par canal. Cliquer sur chaque onglet pour lire le contenu correspondant. | ❌ Non |
| **Copier le contenu** | Copier le texte d'un canal en 1 clic. | Sur l'onglet du canal souhaité, cliquer l'icône "Copier". Une notification confirme la copie. | ❌ Non |
| **Export Word** | Télécharger tous les contenus dans un document Word. | Cliquer "Télécharger Word". Le document contiendra une section par canal, prêt à être retravaillé. | ❌ Non |
| **Paramètres de marque** | Configuration du ton éditorial et des mots-clés de la marque. | Cliquer sur l'engrenage "Paramètres". Renseigner le ton éditorial de la marque (ex: "Expert, bienveillant") et les mots-clés à intégrer systématiquement. | ✅ Oui |
| **KPIs de production** | Dashboard : contenus générés, canaux les plus utilisés, historique. | Charger automatiquement au lancement. Les chiffres clés s'affichent en haut de la page. | ✅ Oui |
| **Historique** | Liste de tous les contenus générés, réutilisables. | Cliquer sur l'onglet "Historique". Chaque entrée liste la date, le sujet et les canaux utilisés. Cliquer "Réutiliser" pour recharger le brief. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Publication directe sur les réseaux** | Publier directement depuis l'app sur LinkedIn, X, etc. | Après génération, un bouton "Publier maintenant" apparaît sur chaque canal. Un clic publie via l'API connectée (OAuth). | ❌ Non |
| **Calendrier éditorial** | Planifier les publications sur un calendrier visuel. | Un onglet "Calendrier" affiche une vue mensuelle. Glisser-déposer un contenu généré sur une date pour le planifier. | ❌ Non |
| **Génération d'image IA** | Générer un visuel pour accompagner chaque post. | Sous chaque contenu de canal, un bouton "Générer une image" produit un visuel pertinent via un modèle de génération d'image. | ✅ Oui |
| **Hashtags suggérés** | L'IA recommande les hashtags les plus performants par canal. | Automatique : sous chaque post généré, une liste de hashtags recommandés s'affiche. L'utilisateur coche ceux à ajouter. | ✅ Oui |
| **Analyse de performance** | Analyser les performances des publications passées. | Un onglet "Performance" (si les réseaux sont connectés) affiche les taux d'engagement par canal, les meilleurs horaires, les formats gagnants. | ✅ Oui |
| **Recyclage de contenu** | Transformer un article de blog en posts pour tous les canaux. | Coller l'URL d'un article existant dans "Source URL", sélectionner tous les canaux. L'IA adapte le contenu existant sans repartir de zéro. | ✅ Oui |

---

## 7. 🔔 Relances Intelligentes (`/services-ia/relances-intelligentes`)

**Objectif :** Automatiser les relances de factures impayées, devis en attente et propositions sans réponse, via des emails IA personnalisés.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Liste de cibles à relancer** | Affiche les clients ayant des factures en retard ou des devis sans réponse. | Automatique au chargement : l'app charge la liste depuis la base de données et l'affiche triée par urgence (le plus de retard en premier). | ❌ Non |
| **Sélection de la cible** | Cliquer sur un contact pour initier une relance. L'urgence et le ton s'ajustent automatiquement. | Cliquer sur un nom dans la liste. Le formulaire de droite se pré-remplit avec les données du contact et le niveau d'urgence auto-calculé. | ✅ Oui |
| **Ajustement auto du ton et urgence** | >30j → Ferme/haute ; 15-30j → Diplomatique/medium ; <15j → Courtois/basse. | Automatique lors de la sélection du contact. L'utilisateur peut néanmoins ajuster manuellement le ton et l'urgence dans les menus déroulants. | ✅ Oui |
| **Génération IA de l'email de relance** | L'IA génère l'objet ET le corps selon le type, montant, contexte et urgence. | Après sélection du contact, cliquer "Générer l'email de relance". L'IA produit un email personnalisé en quelques secondes. | ✅ Oui |
| **Prévisualisation de l'email** | L'email généré s'affiche complet avant envoi. | Le résultat apparaît dans un cadre préformaté avec l'objet et le corps. L'utilisateur peut éditer manuellement si besoin. | ❌ Non |
| **Copier l'email** | Copier en 1 clic l'email généré. | Cliquer "Copier" sous l'email. Il est prêt à être collé dans n'importe quel client email. | ❌ Non |
| **Envoi via M365** | Envoyer l'email directement si Microsoft 365 est connecté. | Cliquer "Envoyer via M365". L'email part depuis le compte Microsoft 365 configuré dans les intégrations. | ❌ Non |
| **Dashboard KPIs** | Statistiques : taux de relances envoyées, taux de réponse, montants recouvrés. | Cliquer sur l'onglet "Tableau de bord". Les métriques s'affichent en temps réel avec graphiques et totaux. | ✅ Oui |
| **Vérification intégration M365** | Vérifie si M365 est connecté et affiche un avertissement sinon. | Automatique au chargement : si non connecté, une bannière orange s'affiche en haut avec un lien vers les intégrations. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Séquence de relances automatisée** | Programmer J+3, J+7, J+15 si pas de réponse. | Cocher "Activer la séquence automatique" avant l'envoi. L'app envoie automatiquement les relances suivantes si aucune réponse n'est détectée. | ✅ Oui |
| **Appel téléphonique IA (script)** | Générer un script d'appel pour compléter la relance email. | Un bouton "Générer le script d'appel" produit un script d'appel adapté au contexte, avec les arguments clés et les réponses aux objections probables. | ✅ Oui |
| **Suivi d'ouverture des emails** | Savoir si la relance a été ouverte par le client. | Automatique si le suivi est activé. Un indicateur "Lu le [date]" apparaît à côté de chaque relance envoyée dans la liste. | ❌ Non |
| **Intégration comptable** | Se connecter à Sage, QuickBooks pour récupérer automatiquement les factures impayées. | Dans les paramètres, configurer la connexion au logiciel comptable. La liste de cibles est alors alimentée automatiquement sans saisie manuelle. | ❌ Non |
| **Archivage des relances** | Historique complet de toutes les relances par client. | Un onglet "Historique" liste toutes les relances envoyées par client, date et résultat (payé, en cours, sans réponse). | ❌ Non |
| **Alertes automatiques** | Notification quand un paiement est détecté ou qu'un délai critique est atteint. | L'utilisateur configure des seuils d'alerte (ex: "M'alerter si facture > 60 jours impayée"). L'app envoie une notification email ou push. | ✅ Oui |

---

## 8. 📋 Devis & Factures IA (`/services-ia/devis-factures-ia`)

**Objectif :** Créer, personnaliser et exporter des devis professionnels avec assistance IA.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Sélection / Création de client** | Sélectionner un client existant ou en créer un nouveau. | Cliquer sur le sélecteur "Client". Taper le nom pour filtrer la liste. Si le client n'existe pas, cliquer "Créer" pour ajouter ses coordonnées directement. | ❌ Non |
| **Numérotation automatique** | Génération d'un numéro de devis unique (ex: DEV-2025-4123). | Automatique à l'ouverture de l'app. Le numéro est unique et incrémental. L'utilisateur peut le modifier manuellement si besoin. | ❌ Non |
| **Lignes de devis dynamiques** | Ajouter/supprimer des lignes avec calcul automatique des totaux. | Cliquer "Ajouter une ligne" pour ajouter une prestation. Remplir description, quantité, prix unitaire HT, TVA, remise. Les totaux HT/TTC se calculent en temps réel. | ❌ Non |
| **Assistant IA de génération de devis** | Décrire le besoin en langage naturel, l'IA génère les lignes. | Saisir une description du projet dans la zone "Décrire le besoin" (ex: "Audit et déploiement de Microsoft Copilot pour 50 utilisateurs"). Cliquer "Générer avec l'IA". | ✅ Oui |
| **Import de document (OCR)** | Photographier un cahier des charges, l'IA pré-remplit le devis. | Cliquer "Importer un document" ou "Prendre une photo". L'IA extrait les besoins du document et génère automatiquement les lignes correspondantes. | ✅ Oui |
| **Résumé exécutif** | Zone de texte pour une introduction commerciale du devis. | Cliquer dans la zone "Résumé exécutif" et rédiger ou laisser l'IA le rédiger depuis le contexte du devis. | ❌ Non |
| **Conditions de paiement** | Champ pour les modalités de paiement. | Modifier le champ pré-rempli "Conditions de paiement" selon les conditions négociées avec le client. | ❌ Non |
| **Prévisualisation PDF** | Aperçu du devis mis en page avant export. | Cliquer "Prévisualiser". Un modal s'ouvre avec le rendu PDF exact du devis. | ❌ Non |
| **Export PDF** | Télécharger le devis en fichier PDF professionnel. | Cliquer "Télécharger PDF". Le fichier se génère et se télécharge automatiquement avec le logo et la mise en page de l'entreprise. | ❌ Non |
| **Sauvegarde du devis** | Enregistrer le devis dans la base de données. | Cliquer "Sauvegarder". Si non connecté, un modal d'authentification s'ouvre. Une fois connecté, le devis est sauvegardé et accessible depuis l'historique. | ❌ Non |
| **Conversion en projet** | Transformer un devis accepté en projet suivi. | Cliquer "Convertir en projet". Le devis est archivé et un projet est créé avec les mêmes informations pour le suivi de réalisation. | ❌ Non |
| **Catalogue produits** | Sélectionner des produits/services depuis un catalogue. | Dans une ligne, cliquer le sélecteur de produit. La liste des produits configurés s'affiche. Sélectionner pour pré-remplir description et prix. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Génération de facture depuis le devis** | Transformer un devis signé en facture numérotée. | Sur un devis sauvegardé, cliquer "Créer la facture". La facture est générée avec le numéro FA-XXXX, la date et les mêmes lignes que le devis. | ❌ Non |
| **Signature électronique** | Le client signe le devis en ligne. | L'utilisateur clique "Envoyer pour signature". Le client reçoit un email avec un lien. Il ouvre le devis, signe digitalement et valide. | ❌ Non |
| **Envoi du devis par email** | Envoyer le PDF directement depuis la plateforme avec un lien de validation. | Cliquer "Envoyer au client". Saisir l'email du client. Le PDF est joint et un lien d'acceptation en ligne est inclus dans le message. | ❌ Non |
| **Analyse concurrentielle de prix IA** | L'IA compare les tarifs avec le marché et suggère un positionnement. | Un bouton "Vérifier mes prix" analyse les lignes du devis et affiche un rapport comparatif avec les fourchettes du marché pour chaque prestation. | ✅ Oui |
| **Modèles de devis** | Bibliothèque de templates par secteur. | Cliquer "Utiliser un modèle" à l'ouverture d'un nouveau devis. Choisir dans la bibliothèque (ex: "Prestation IT", "Conseil stratégique"). Les lignes se pré-remplissent. | ❌ Non |
| **Gestion des avenants** | Créer et gérer des avenants à un devis existant. | Sur un devis sauvegardé, cliquer "Ajouter un avenant". Un formulaire permet d'ajouter ou modifier des lignes. L'avenant est numéroté AVN-XXXX et lié au devis d'origine. | ❌ Non |
| **Suivi du taux de conversion** | Dashboard affichant le taux devis/commande. | Un onglet "Performances" affiche : nombre de devis envoyés, signés, perdus, montant total converti, délai moyen de signature. | ✅ Oui |

---

## 9. 📅 Préparation de Réunion IA (`/services-ia/preparation-reunions-ia`)

**Objectif :** Préparer chaque réunion client grâce à un briefing IA complet.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Sélection du client** | Choisir ou créer un client depuis la liste. | Cliquer sur le sélecteur "Client". Taper le nom pour filtrer. Si le client n'existe pas, cliquer "Créer nouveau client" pour l'ajouter. | ❌ Non |
| **Historique automatique du client** | Affiche l'historique de la relation : devis, montants, dernière interaction. | Automatique : dès qu'un client est sélectionné, son historique se charge et s'affiche dans un encadré résumé (dernier contact, devis en cours, CA…). | ❌ Non |
| **Date et contexte de réunion** | Renseigner la date et un contexte libre. | Sélectionner la date via un sélecteur de date. Taper le contexte dans le champ libre (ex: "Renégociation du contrat annuel suite à audit"). | ❌ Non |
| **Objectif de la réunion** | Définir l'objectif précis. | Renseigner l'objectif dans le champ dédié (ex: "Présenter la nouvelle offre IA et obtenir un bon de commande"). | ❌ Non |
| **Génération du briefing IA** | L'IA génère un document de préparation complet. | Après avoir rempli les champs, cliquer "Générer mon briefing". L'IA analyse l'historique du client et le contexte pour produire un briefing personnalisé en 10-20 secondes. | ✅ Oui |
| **Briefing structuré par sections** | Résultat en blocs : Contexte, Stratégie, Questions préparées, Risques. | Le résultat s'affiche automatiquement en sections colorées et distinctes. Chaque section est rétractable pour faciliter la lecture sur mobile. | ✅ Oui |
| **Copier le briefing** | Copier le briefing en 1 clic. | Cliquer "Copier le briefing" en haut du résultat. Le texte complet est dans le presse-papier pour être collé dans un email ou un document. | ❌ Non |
| **Planification dans le calendrier** | Ajouter la réunion dans Google Calendar ou Outlook. | Cliquer "Planifier la réunion". Un modal s'ouvre avec les infos pré-remplies (client, date, heure). Cliquer "Confirmer" pour l'ajouter au calendrier connecté. | ❌ Non |
| **Réunions à venir** | Widget des prochaines réunions planifiées avec le client. | Automatique à droite du formulaire : liste les réunions planifiées avec ce client, extraites du calendrier connecté. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Génération du compte-rendu post-réunion** | Après la réunion, saisir des notes et l'IA génère le CR. | Un bouton "Rédiger le CR" apparaît après une réunion passée. L'utilisateur colle ses notes rapides, l'IA génère le CR structuré. | ✅ Oui |
| **Détection du sentiment client** | L'IA évalue la "chaleur" de la relation avant la réunion. | Une jauge "Température client : Chaud / Tiède / Froid" s'affiche dans le briefing, calculée depuis les échanges email et l'historique commercial. | ✅ Oui |
| **Fiche de concurrence** | L'IA génère un comparatif entre votre offre et la concurrence. | Dans le briefing, une section "Positionnement concurrentiel" liste les concurrents probables et les arguments différenciants à mettre en avant. | ✅ Oui |
| **Simulation d'objections** | L'IA simule les objections probables et propose des réponses. | Une section "Objections prévisibles" liste 3 à 5 objections que le client pourrait soulever, avec une réponse suggérée pour chacune. | ✅ Oui |
| **Alertes pré-réunion** | Notification push 1h avant la réunion avec le briefing résumé. | Paramétrable dans les réglages. L'utilisateur reçoit une notification sur son téléphone avec un lien vers le briefing et l'adresse de la réunion. | ❌ Non |
| **Résumé de la réunion précédente** | Afficher automatiquement le CR de la dernière réunion avec ce client. | Dans le briefing, une section "Dernière réunion" affiche les décisions prises et les tâches engagées lors du dernier RDV, pour ne rien oublier. | ❌ Non |

---

## 10. 📊 Calculateur ROI IA (`/services-ia/calculateur-roi-ia`)

**Objectif :** Simuler et quantifier le retour sur investissement de l'IA pour une entreprise via un wizard en 4 étapes.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Wizard 4 étapes** | Navigation guidée : Entreprise → Processus → Métriques → Rapport. | L'utilisateur avance étape par étape en cliquant "Suivant". Chaque étape se verrouille jusqu'à ce que les champs obligatoires soient remplis. | ❌ Non |
| **Étape Entreprise** | Renseigner secteur, taille, CA annuel, budget IT. | Remplir les champs : secteur d'activité (liste déroulante), nombre d'employés, chiffre d'affaires annuel, budget IT actuel. Cliquer "Suivant". | ❌ Non |
| **Étape Processus** | Sélectionner les processus métier ciblés par l'IA. | Cocher les processus concernés parmi la liste (ex: Comptabilité, Commercial, RH, Service client, Production). Plusieurs choix possibles. Cliquer "Suivant". | ❌ Non |
| **Étape Métriques** | Saisir les métriques actuelles : temps par tâche, coût horaire, taux d'erreur. | Pour chaque processus coché à l'étape 2, remplir : temps moyen par tâche (en heures), coût horaire du collaborateur, taux d'erreur actuel (en %). | ❌ Non |
| **Calcul du ROI** | Moteur de calcul qui projette les gains sur 1/2/3 ans. | Automatique à l'étape 4 : le moteur applique les coefficients de gain de l'IA par processus et calcule les économies projetées. | ✅ Oui |
| **Rapport ROI complet** | Rapport avec gains par processus, ROI global, temps de retour sur investissement. | S'affiche automatiquement à l'étape 4 avec des cartes de résultats, des graphiques et un tableau comparatif Avant/Après. | ✅ Oui |
| **Stepper visuel** | Indicateur de progression avec les 4 étapes numérotées. | S'affiche en haut de l'écran. Les étapes complétées s'affichent en bleu avec une coche, l'étape en cours est en surbrillance. | ❌ Non |
| **Réinitialisation** | Recommencer le calcul avec de nouvelles données. | Cliquer "Recommencer" ou "Actualiser". Toutes les données saisies sont effacées et le wizard revient à l'étape 1. | ❌ Non |
| **Barre Enterprise Auth** | Connexion entreprise pour personnaliser le rapport au nom de la société. | En haut de page, si l'entreprise est connectée, son nom et son logo apparaissent dans le rapport ROI. Sinon, une invitation à se connecter s'affiche. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Export du rapport en PDF** | Télécharger le rapport ROI avec logo de l'entreprise. | Cliquer "Télécharger mon rapport PDF". Un PDF est généré avec mise en page professionnelle, graphiques et logo de l'entreprise connectée. | ❌ Non |
| **Comparaison de scénarios** | Créer et comparer plusieurs scénarios d'investissement côte à côte. | Un bouton "Ajouter un scénario" permet de dupliquer et modifier les paramètres. Les scénarios s'affichent en colonnes comparatives. | ✅ Oui |
| **Envoi du rapport par email** | Partager le rapport ROI par email. | Cliquer "Partager". Saisir l'adresse email du destinataire (dirigeant ou client). Le rapport PDF est envoyé avec un message personnalisable. | ❌ Non |
| **Benchmark sectoriel** | Comparer le ROI estimé avec la moyenne du secteur. | Une section "Comparaison sectorielle" affiche le ROI estimé face à la moyenne du secteur. Données alimentées par l'application Benchmark. | ✅ Oui |
| **Plan d'implémentation IA suggéré** | L'IA propose un plan d'action concret pour déployer les solutions. | Automatique à la fin du rapport : une section "Par où commencer ?" liste les 3 actions prioritaires avec estimation de délai et coût de mise en œuvre. | ✅ Oui |
| **Suivi dans le temps** | Re-saisir les métriques 6 mois après pour mesurer les gains réels. | Un bouton "Créer un rapport de suivi" permet de re-saisir les métriques actuelles pour comparer avec les projections initiales. Un graphique d'écart s'affiche. | ❌ Non |

---

## 11. 📈 Benchmark de Maturité Digitale & IA (`/services-ia/benchmark-digital-ia`)

**Objectif :** Évaluer l'organisation sur 6 piliers stratégiques et produire un rapport de benchmark sectoriel avec roadmap.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Questionnaire à 6 piliers** | 60 questions réparties sur 6 piliers : Stratégie, Processus, Data, Infrastructure, IA, Culture. | L'utilisateur avance pilier par pilier. Pour chaque question, il choisit une réponse sur une échelle ou parmi des options. | ❌ Non |
| **Navigation pilier par pilier** | Compléter un pilier à la fois avec stepper visuel. | Un stepper en haut indique la progression (Pilier 1/6, 2/6…). Cliquer "Suivant" après avoir répondu à toutes les questions du pilier en cours. | ❌ Non |
| **Profilage entreprise** | Collecte : nom, secteur, employés, CA, pays, nombre de sites. | Un formulaire de profil est présenté avant le questionnaire. L'utilisateur remplit les informations de son organisation. | ❌ Non |
| **Calcul des scores par pilier** | Score automatique de 0 à 100 par pilier selon les réponses. | Automatique : chaque réponse a un poids. Le score est calculé à la volée et affiché à la fin de chaque pilier. | ✅ Oui |
| **Score global de maturité** | Score global agrégé avec niveau (Débutant / Intermédiaire / Avancé). | Calculé automatiquement après le questionnaire complet. Affiché en grand sur la page de résultats avec une jauge visuelle. | ✅ Oui |
| **Score IA Readiness** | Score spécifique mesurant la préparation à adopter l'IA. | Calculé spécifiquement depuis les réponses des piliers IA et Infrastructure. Affiché séparément du score global. | ✅ Oui |
| **Radar Chart** | Graphique radar visualisant les 6 dimensions vs secteur. | Affiché automatiquement dans les résultats. La courbe de l'entreprise (bleue) est comparée à la moyenne sectorielle (grise). | ✅ Oui |
| **Benchmark sectoriel** | Comparaison des scores avec les moyennes du secteur. | L'API retourne les moyennes sectorielles selon le profil renseigné. Les écarts s'affichent en rouge (en dessous) ou vert (au dessus) de la moyenne. | ✅ Oui |
| **Analyse SWOT générée** | L'IA génère une analyse SWOT complète depuis les réponses. | Automatique dans les résultats : 4 quadrants (Forces, Faiblesses, Opportunités, Menaces) avec des phrases générées selon les scores de chaque pilier. | ✅ Oui |
| **Roadmap de transformation** | Plan d'action en 3 phases avec impact et ROI estimé. | Automatique : affiché sous le SWOT. Chaque action listée indique son impact (Élevé/Moyen/Faible), son niveau d'effort et son ROI estimé. | ✅ Oui |
| **Formulaire lead generation** | Collecte : prénom, nom, email, téléphone avant les résultats. | Avant d'afficher les résultats, l'utilisateur remplit ce formulaire. C'est une étape obligatoire pour débloquer le rapport complet. | ❌ Non |
| **Export PDF du rapport** | Télécharger le rapport complet. | Cliquer "Télécharger mon PDF" dans la page de résultats. Le rapport complet (scores, SWOT, roadmap) est téléchargé au format PDF. | ❌ Non |
| **Bouton "Refaire une analyse"** | Recommencer le benchmark depuis zéro. | Cliquer "Refaire une analyse" dans les résultats ou en haut de page. Toutes les réponses et le profil sont effacés, le questionnaire redémarre. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Comparaison multi-entreprises** | Permettre à un cabinet conseil de comparer plusieurs clients. | Un mode "Multi-entreprises" permet d'importer les résultats de plusieurs benchmarks et d'afficher un tableau comparatif côte à côte. | ✅ Oui |
| **Mode collaboratif** | Inviter plusieurs membres (DG, DSI, DRH) à répondre et agréger les résultats. | Un bouton "Inviter des collaborateurs" génère un lien de participation unique. Chacun répond indépendamment. Les scores sont agrégés avec pondération par rôle. | ❌ Non |
| **Rapport de suivi à 6 mois** | Re-passer le benchmark 6 mois plus tard et voir la progression. | Un bouton "Créer un benchmark de suivi" lance un nouveau benchmark lié au précédent. Les résultats s'affichent en superposition avec un graphique d'évolution. | ✅ Oui |
| **Recommandations de solutions MDIV** | Après le benchmark, l'IA recommande les services MDIV adaptés aux lacunes. | Automatique dans les résultats : une section "Solutions recommandées" liste les services MDIV adaptés aux piliers les plus faibles, avec un lien direct vers chaque app. | ✅ Oui |
| **Intégration CRM** | Pousser les leads collectés dans le CRM de l'équipe commerciale MDIV. | Automatique si le CRM est configuré dans les paramètres admin. Chaque lead capturé via le formulaire est automatiquement créé dans le CRM avec les scores du benchmark. | ❌ Non |
| **White-label** | Les partenaires distribuent le benchmark sous leur propre marque. | Configuration dans l'espace admin partenaire : logo, couleurs, URL personnalisée. Les clients du partenaire accèdent au benchmark brandé partenaire. | ❌ Non |

---

## 12. 🤖 Diagnostic IA Dynamique (`/services-ia/diagnostic-ia`)

**Objectif :** Évaluer la maturité IA via un questionnaire adaptatif analysé par des agents IA en temps réel.

### Fonctionnalités existantes

| Fonctionnalité | Description | Comment ça marche | IA ? |
|---|---|---|:---:|
| **Questionnaire adaptatif** | L'IA génère chaque question suivante selon les réponses précédentes. | Automatique : après chaque réponse, l'IA appelle l'API pour générer la question suivante la plus pertinente. Pas de questions pré-écrites fixes. | ✅ Oui |
| **Saisie du nom d'entreprise** | Champ optionnel pour les non-connectés pour personnaliser le rapport. | À la première question, un champ "Nom de votre entreprise" apparaît. Le renseigner permet à l'IA d'adapter le diagnostic et le rapport. | ❌ Non |
| **Analyse du site web** | L'IA explore le site web pour enrichir et personnaliser le diagnostic. | Remplir le champ "Site web de votre entreprise". L'IA crawle la page pour comprendre l'activité avant de poser les questions. | ✅ Oui |
| **Import de document** | Importer un fichier pour donner du contexte supplémentaire à l'IA. | Cliquer "Importer un justificatif ou prendre une photo". L'IA analyse le document (bilan, organigramme, cahier des charges) pour personnaliser le diagnostic. | ✅ Oui |
| **Barre de progression dynamique** | La barre se met à jour selon le nombre de questions estimé par l'IA. | La barre s'affiche en haut du questionnaire. Le total de questions change dynamiquement selon les réponses (l'IA peut allonger ou raccourcir le diagnostic). | ✅ Oui |
| **Options à choix multiple** | Sélectionner une ou plusieurs réponses à chaque question. | Cliquer sur une ou plusieurs options proposées. Les options sélectionnées se surlignent. Cliquer "Valider et continuer" pour passer à la suivante. | ❌ Non |
| **Champ "Autre"** | Saisir une réponse libre si aucune option ne convient. | Cliquer "Autre" parmi les options. Un champ texte apparaît pour saisir une réponse personnalisée qui sera envoyée à l'IA. | ❌ Non |
| **Phase agents IA** | 3 agents (Stratégie, Tech, Synthèse) débattent en temps réel via streaming. | Automatique après le questionnaire : 3 avatars d'agents apparaissent. Leurs messages s'affichent en temps réel via SSE. L'utilisateur lit leur analyse se construire. | ✅ Oui |
| **Interruption par question de précision** | Les agents peuvent poser une question de clarification à l'utilisateur. | Si un agent a besoin d'une précision, un formulaire de réponse s'intercale dans l'analyse. L'utilisateur répond et les agents reprennent leur analyse enrichie. | ✅ Oui |
| **Rapport final de maturité IA** | Score (0-100), niveau, constats clés, recommandations d'outils. | S'affiche automatiquement après l'analyse. Le score est affiché en grand avec une jauge. Les recommandations listent les outils avec leur justification et comment démarrer. | ✅ Oui |
| **Export PDF du rapport** | Télécharger le rapport en PDF. | Cliquer "Télécharger mon rapport PDF" dans la page de résultats. Le PDF est généré avec tous les éléments du rapport. | ❌ Non |
| **Bouton "Recommencer à zéro"** | Relancer le diagnostic depuis le début. | Cliquer "Recommencer à zéro" dans la page de résultats ou en haut du questionnaire. Tout est effacé, le premier appel IA est relancé. | ❌ Non |

### 🚀 Fonctionnalités à ajouter

| Fonctionnalité | Description | Comment ça marcherait | IA ? |
|---|---|---|:---:|
| **Comparaison sectorielle** | Comparer le score obtenu avec la moyenne des entreprises du même secteur. | Une section "Votre position dans le secteur" affiche le score de l'utilisateur positionné sur une courbe de distribution des entreprises similaires. | ✅ Oui |
| **Rapport envoyé par email** | Envoyer automatiquement le rapport à l'adresse saisie. | À la fin du diagnostic, un champ "Recevoir le rapport par email" apparaît. L'utilisateur saisit son email et le PDF lui est envoyé automatiquement. | ❌ Non |
| **Mode expert (questions approfondies)** | Option pour un diagnostic approfondi avec plus de questions techniques. | Un bouton "Mode Expert" en haut du questionnaire active une variante qui génère 2 à 3 fois plus de questions avec un niveau de profondeur technique accru. | ✅ Oui |
| **Historique des diagnostics** | Retrouver les diagnostics précédents et comparer l'évolution. | Un onglet "Mes diagnostics" liste les diagnostics passés avec date et score. Cliquer sur un pour le revoir et le comparer au dernier. | ❌ Non |
| **Intégration avec le Benchmark** | Lier les résultats du Diagnostic avec le Benchmark pour une vision 360°. | Un bouton "Approfondir avec le Benchmark" dans les résultats lance directement le Benchmark Digital pré-rempli avec les informations du diagnostic. | ✅ Oui |
| **Prise de rendez-vous intégrée** | Proposer de réserver un appel avec un expert MDIV à la fin du diagnostic. | Dans la page de résultats, un bloc "Discuter de vos résultats avec un expert" affiche un calendrier de disponibilités (Calendly). L'utilisateur réserve en 2 clics. | ❌ Non |

---

## 📊 Synthèse Globale

| Application | Fonctionnalités existantes | Fonct. avec IA | Fonctionnalités à ajouter |
|---|:---:|:---:|:---:|
| Assistant Email IA | 14 | 8 | 7 |
| Générateur de Leads B2B | 8 | 5 | 7 |
| Emails de Prospection IA | 10 | 4 | 6 |
| Compte-rendu de Réunion IA | 7 | 5 | 6 |
| Résumé de Documents IA | 6 | 4 | 6 |
| Générateur de Contenu Multi-Canal | 12 | 5 | 6 |
| Relances Intelligentes | 9 | 5 | 6 |
| Devis & Factures IA | 12 | 3 | 7 |
| Préparation de Réunion IA | 9 | 3 | 6 |
| Calculateur ROI IA | 9 | 3 | 6 |
| Benchmark de Maturité Digitale | 13 | 8 | 6 |
| Diagnostic IA Dynamique | 12 | 9 | 6 |
| **TOTAL** | **131** | **62** | **75** |

> 📌 **47% des fonctionnalités existantes utilisent l'IA.** 75 nouvelles fonctionnalités identifiées pour enrichir la plateforme.
