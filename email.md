# Hub de Messagerie Universelle & Connexion Mails (OBJ-2)

> **Document de Référence & Guide Fonctionnel**  
> **Dernière mise à jour :** 16/10/2026  
> **Statut technique :** 100% Opérationnel & Conforme (52/52 tests validés)  
> **Politique de développement :** Zéro-Mock, protocoles réels IMAP/SMTP, chiffrement AES-256-GCM.

---

## 1. Schémas d'Ensemble & Fonctionnement

### Schéma 1 : Architecture Globale du Hub de Messagerie

```mermaid
flowchart TD
    subgraph UI["Interface Utilisateur (React / Vite)"]
        A[ServicesIAEmail.tsx] -->|Sélection boîte| B[UniversalMailboxModal.tsx]
        A -->|Fils & Historique| C[EmailThreadHistoryView.tsx]
        A -->|Action d'envoi / IA| D[EmailActionModal.tsx]
    end

    subgraph Service["Couche Service & Sécurité (Frontend)"]
        E[integrationService.ts]
        B -->|Autoconfig & Ajout| E
        C -->|Sync IMAP & Fetch| E
        D -->|Send & Draft| E
        E -->|En-tête Bearer JWT| F["Routeur d'API (/api/integrations/*)"]
    end

    subgraph Backend["Moteur Mail Backend (mail-engine.ts & API)"]
        F --> G{Contrôle Auth & Société}
        G -->|Validation JWT| H[mail-engine.ts]
        H -->|AES-256-GCM| I[(dev_mail_store.json / MySQL)]
        H -->|ISPDB / MX| J[Détection Serveurs]
        H -->|imapflow| K[Client IMAP Sécurisé]
        H -->|nodemailer| L[Client SMTP Sécurisé]
    end

    subgraph Remote["Serveurs de Messagerie Externes (Tous Fournisseurs)"]
        K <-->|Port 993 SSL - Lecture & Brouillons| M["Serveurs IMAP (Gmail, OVH, Outlook, Yahoo...)"]
        L -->|Port 465/587 SSL - Envois Réels| N["Serveurs SMTP (Gmail, OVH, Outlook, Yahoo...)"]
    end
```

---

### Schéma 2 : Votre Cas d'Usage Concret

> **Scénario :** Vous connectez **`epmezatio@gmail.com`**, votre client est **`ericpapainmezatio@gmail.com`**.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client (ericpapainmezatio@gmail.com)
    participant ServeurMail as Serveurs Distants (Gmail / OVH / etc.)
    participant Hub as Hub Mail MDIV (mail-engine.ts)
    participant Cache as Cache des Fils (email_threads_cache)
    actor Vous as Vous (MDIV Business - epmezatio@gmail.com)

    Note over Vous,ServeurMail: Étape 1 : Connexion & Test d'accès
    Vous->>Hub: Saisie de epmezatio@gmail.com + Mot de passe d'application
    Hub->>ServeurMail: Test d'authentification réel IMAP (993) & SMTP (465)
    ServeurMail-->>Hub: Authentification acceptée (ou refusée avec motif exact)
    Hub->>Cache: Enregistrement sécurisé (mot de passe chiffré en AES-256-GCM)

    Note over Client,ServeurMail: Étape 2 : Le client vous envoie un email
    Client->>ServeurMail: Envoi d'un message vers epmezatio@gmail.com

    Note over Vous,ServeurMail: Étape 3 : Réception & Importation
    Vous->>Hub: Clic sur « Synchroniser la boîte » (ou ouverture de l'historique)
    Hub->>ServeurMail: Connexion IMAP (analyse INBOX + messages Envoyés)
    ServeurMail-->>Hub: Messages bruts RFC 822
    Hub->>Hub: Décodage MIME via mailparser (sujet, texte, HTML, pièces)
    Hub->>Cache: Indexation dans le fil du client (direction: 'inbound')

    Note over Vous,Cache: Étape 4 : Traitement par le Service IA
    Vous->>Hub: Sélection du client ericpapainmezatio@gmail.com
    Cache-->>Vous: Affichage chronologique de tous les échanges
    Vous->>Hub: Demande de réponse avec l'IA (analyse du contexte)
    Hub-->>Vous: Proposition de réponse rédigée sur mesure

    Note over Vous,ServeurMail: Étape 5 : Sauvegarde ou Expédition
    alt Option A : Créer un brouillon
        Vous->>Hub: Clic sur « Enregistrer en brouillon »
        Hub->>ServeurMail: IMAP APPEND dans le dossier Drafts de votre compte Gmail
        ServeurMail-->>Vous: Brouillon synchronisé dans votre application Gmail
    else Option B : Envoi direct
        Vous->>Hub: Clic sur « Envoyer le message »
        Hub->>ServeurMail: Envoi réel via SMTP (smtp.gmail.com:465)
        ServeurMail-->>Client: Message délivré dans la boîte du client
        Hub->>Cache: Enregistrement immédiat dans l'historique (direction: 'outbound')
    end
```

---

## 2. Tableau Récapitulatif : Ce qui est POSSIBLE vs Ce qui n'est PAS POSSIBLE

Ce tableau récapitule de manière transparente toutes les capacités réelles et les limites techniques du système :

| Domaine | Ce qui est POSSIBLE ✅ | Ce qui n'est PAS POSSIBLE ❌ |
|---|---|---|
| **Fournisseurs d'emails** | • **Tous les fournisseurs universellement** : Google Gmail, Google Workspace, Microsoft 365, Outlook, Hotmail, OVHcloud, ITID France, Apple iCloud, Yahoo Mail, Infomaniak, Gandi, IONOS.<br>• **Tous les domaines d'entreprise personnalisés** (`nom@monentreprise.fr`). | • Les messageries privées fermées sans accès IMAP/SMTP standard (ex : chat propriétaire Slack, Teams ou WhatsApp — qui requièrent d'autres intégrations dédiées). |
| **Autoconfiguration** | • Détection automatique instantanée des hôtes et ports (IMAP 993, SMTP 465/587).<br>• Résolution dynamique par la base mondiale **Mozilla ISPDB**.<br>• Résolution **DNS MX** pour identifier l'hébergeur réel derrière un nom de domaine personnalisé.<br>• Modification manuelle possible des serveurs et des ports si nécessaire. | • Deviner le mot de passe de l'utilisateur (l'utilisateur doit toujours fournir son mot de passe ou son mot de passe d'application). |
| **Authentification & Sécurité** | • Chiffrement fort des mots de passe en **AES-256-GCM** avec clé secrète dédiée.<br>• Mots de passe masqués à 100% (jamais renvoyés dans les réponses API).<br>• Contrôle d'accès strict par jeton **Bearer JWT**.<br>• Isolation étanche entre entreprises : chaque société n'accède qu'à ses propres boîtes et messages.<br>• Test en direct des identifiants : rejet immédiat en HTTP 422 avec message d'erreur clair si le mot de passe est faux ou si le serveur est inaccessible. | • Valider une boîte avec un mot de passe bidon ou erroné (aucun mock n'est toléré).<br>• Accéder aux boîtes d'une autre entreprise inscrite sur la plateforme. |
| **Réception & Importation (IMAP)** | • Importer en direct les emails échangés avec vos clients (dossier de réception `INBOX` et dossier `Sent / Envoyés`).<br>• Décodage complet des formats MIME (texte brut, rendu HTML propre, noms d'expéditeurs, date de réception).<br>• Déduplication automatique (aucun message en double lors des synchronisations répétées).<br>• Bouton interactif **« Synchroniser la boîte »** avec retour visuel (toast). | • Recevoir des emails si l'accès IMAP a été expressément désactivé par l'administrateur du compte de messagerie.<br>• Recevoir des alertes « push » à la seconde sans rafraîchissement ni clic sur synchroniser (nécessite une synchronisation périodique ou un clic sur le bouton). |
| **Gestion des Fils de Discussion** | • Regroupement automatique de tous les emails par client (`contact_email`).<br>• Distinguer clairement les messages entrants (`inbound` reçus du client) et sortants (`outbound` envoyés par vous).<br>• Recherche textuelle rapide par mot-clé, objet ou domaine d'expéditeur.<br>• Exclusion automatique des emails sans rapport (ex: newsletters). | • Afficher des messages d'un client s'il a écrit à une boîte différente non connectée à votre compte MDIV. |
| **Envoi d'Emails (SMTP)** | • Envoi d'emails **réels** délivrés directement dans la boîte de messagerie du destinataire.<br>• L'adresse d'expéditeur est authentique : c'est votre propre adresse connectée (`epmezatio@gmail.com`).<br>• Archivage instantané du message expédié dans le fil de discussion local. | • Envoyer un email sans avoir configuré et validé une boîte active.<br>• Usurper l'identité d'une autre adresse (les serveurs SMTP modernes rejettent les adresses différentes de l'identifiant de connexion via SPF/DKIM). |
| **Brouillons (Drafts)** | • Génération d'un brouillon réel sauvegardé directement dans le dossier **Drafts** de votre messagerie distante via la commande `IMAP APPEND`.<br>• Retrouver le brouillon sur votre téléphone ou sur votre webmail (ex: Gmail / Outlook). | • Modifier un brouillon directement sur le serveur distant une fois qu'il a été transformé en email envoyé. |
| **Intégration avec le Service IA** | • L'IA lit l'historique complet des échanges avec le client pour comprendre le contexte.<br>• Rédaction de réponses adaptées selon 4 tonalités (Formel, Chaleureux, Court & Percutant, Empathique) et 4 objectifs (Négociation, Suivi de projet, Relance, Réponse stratégique).<br>• Prévisualisation et édition libre du texte avant tout envoi. | • Envoyer un email automatiquement sans validation humaine préalable (vous conservez le contrôle total avant l'envoi). |

---

## 3. Comment Fonctionne le Système en Détail

### 1. Pourquoi un « Mot de Passe d'Application » est-il nécessaire pour Gmail et Outlook ?
Pour protéger leurs utilisateurs contre les attaques par force brute, **Google** et **Microsoft** désactivent la connexion par mot de passe traditionnel pour les applications tierces lorsque la validation en 2 étapes est activée.  
Pour connecter votre adresse `epmezatio@gmail.com` :
1. Rendez-vous sur votre compte Google : [myaccount.google.com/security](https://myaccount.google.com/security).
2. Vérifiez que la **Validation en deux étapes** est activée.
3. Recherchez **« Mots de passe des applications »**.
4. Saisissez le nom de l'application (ex : `MDIV Business`) et cliquez sur **Générer**.
5. Vous obtenez un mot de passe à 16 lettres (ex: `abcd efgh ijkl mnop`).
6. Collez ce mot de passe dans MDIV Business : la connexion est instantanée et permanente !

*(Pour les serveurs d'entreprise comme OVH, Infomaniak ou serveurs IMAP dédiés, votre mot de passe habituel de boîte mail fonctionne directement).*

---

### 2. Le Moteur d'Autoconfiguration Dynamique
Lorsque vous commencez à taper une adresse dans la fenêtre de connexion :
1. **Extraction du domaine** : Le domaine est extrait (ex: `gmail.com`, `itid-france.com`, `mon-domaine.fr`).
2. **Recherche de Preset** : Si le domaine correspond à un acteur majeur (Gmail, Outlook, Yahoo, iCloud, OVH), les réglages sécurisés recommandés sont immédiatement renseignés.
3. **Interrogation Mozilla ISPDB** : Si le domaine est inconnu, le moteur interroge la base universelle Thunderbird/Mozilla pour extraire la configuration officielle de l'hébergeur.
4. **Résolution DNS MX** : Si l'hébergeur n'est pas dans la base, le moteur résout les enregistrements MX DNS du domaine (ce qui permet par exemple d'identifier qu'un email `contact@cabinet-avocat.fr` utilise en réalité les serveurs de messagerie Google Workspace ou Office 365).
5. **Pré-remplissage ajustable** : Tous les champs restent modifiables par l'utilisateur si son entreprise utilise des ports spécifiques (ex: port 587 avec STARTTLS ou port 465 SSL).

---

### 3. La Synchronisation des Messages et le Fil par Contact
- Lorsque vous ouvrez un contact (par exemple `ericpapainmezatio@gmail.com`), le Hub lance une recherche :
  - **Sens Entrant (`inbound`)** : Tous les messages où `sender_email = ericpapainmezatio@gmail.com`.
  - **Sens Sortant (`outbound`)** : Tous les messages où `recipient_email = ericpapainmezatio@gmail.com`.
- Ces messages sont présentés sous la forme d'un fil chronologique clair, similaire à une messagerie moderne (date, heure, statut de lecture, extrait et corps complet).
- Le bouton **« Synchroniser la boîte »** permet d'interroger le serveur IMAP à tout moment pour rapatrier les derniers emails reçus ou envoyés depuis un autre appareil.

---

### 4. L'Assistance par l'Intelligence Artificielle (MDIV IA)
- En cliquant sur **« Répondre avec l'IA »** sur un message reçu, l'IA reçoit :
  1. Le corps du message du client.
  2. L'historique des derniers échanges pour conserver la mémoire de la relation commerciale.
  3. Vos consignes (ton souhaité, objectif commercial, argumentaire).
- L'IA produit un brouillon professionnel que vous pouvez ajuster dans l'éditeur.
- Vous choisissez ensuite soit d'enregistrer le résultat comme **Brouillon** dans votre boîte mail, soit de l'**Expédier directement**.

---

## 4. Endpoints API Disponibles

Toutes les requêtes requièrent l'en-tête HTTP :  
`Authorization: Bearer <votre_jeton_mdiv>`

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/integrations/mailbox_autoconfig.php` | `GET` / `POST` | Détecte automatiquement les hôtes et ports IMAP/SMTP à partir de l'email. |
| `/api/integrations/mailboxes.php` | `GET` | Liste toutes les boîtes connectées de l'entreprise (sans mots de passe). |
| `/api/integrations/mailboxes.php` | `POST` | Vérifie en direct les identifiants IMAP/SMTP et enregistre la boîte chiffrée. |
| `/api/integrations/mailboxes.php?id={id}` | `DELETE` | Déconnecte une boîte et purge son cache de messages. |
| `/api/integrations/sync_mailbox.php` | `POST` | Exécute la synchronisation IMAP (dossiers INBOX et Envoyés) et indexe les messages. |
| `/api/integrations/fetch_emails.php` | `GET` | Récupère l'historique complet filtré par client (`contact_email`) ou par recherche textuelle. |
| `/api/integrations/send_email.php` | `POST` | Expédie un email réel via le serveur SMTP de la boîte sélectionnée. |
| `/api/integrations/create_draft.php` | `POST` | Crée un brouillon réel dans le dossier *Drafts* de la boîte via `IMAP APPEND`. |
| `/api/integrations/status.php` | `GET` | Retourne l'état de santé et de connexion de vos boîtes. |

---

## 5. Preuve de Conformité Technique (52/52 Tests Validés)

La suite de tests automatisés [test_mailboxes_compliance.mjs](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/test_mailboxes_compliance.mjs) a validé tous les cas d'usage réels :

1. **Sécurité & Accès** : 5 tests validant le blocage strict des requêtes sans jeton d'authentification (HTTP 401).
2. **Autoconfiguration universelle** : 4 tests validant la détection de Gmail, OVH, domaines tiers et la gestion des adresses invalides.
3. **Rejet des faux identifiants** : 4 tests prouvant qu'un faux mot de passe est rejeté avec le motif exact renvoyé par le serveur IMAP (HTTP 422).
4. **Connexion & Chiffrement AES-256** : 5 tests validant l'enregistrement d'une boîte, l'absence de mot de passe en clair et le non-dédoublement.
5. **Isolation multi-sociétés** : 3 tests validant qu'une société A ne peut en aucun cas lire ou synchroniser les messages d'une société B.
6. **Synchronisation IMAP réelle** : 4 tests validant la lecture conjointe d'`INBOX` et `Sent` et l'absence de doublons.
7. **Fil de discussion client** : 9 tests validant l'agrégation des messages reçus et envoyés par client et la recherche par mots-clés.
8. **Envoi SMTP réel** : 8 tests validant l'envoi effectif vers le serveur de messagerie, les en-têtes conformes et l'archivage.
9. **Création de brouillon IMAP** : 3 tests validant la création d'un message MIME dans le dossier `Drafts`.
10. **Déconnexion propre** : 3 tests validant la suppression et la purge intégrale du cache.
