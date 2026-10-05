# Relances Intelligentes IA

## 1. Résumé de l'application

- **Nom :** Relances Intelligentes IA (Module Suivi & Recouvrement Commercial)
- **Objectif :** Détecter automatiquement les factures impayées, devis non signés et clients inactifs pour générer et expédier des emails de relance ultra-personnalisés selon le degré d'urgence et le profil client.
- **Problème résolu :** Les retards de paiement et les devis laissés sans suite plombent la trésorerie des TPE/PME par manque de temps, oubli de relance ou hésitation sur le ton diplomatique à adopter.
- **Utilisateurs concernés :** Dirigeants de TPE/PME, directeurs administratifs et financiers (DAF), chargés de recouvrement, commerciaux B2B.
- **Cas d'utilisation :** Relance douce de devis envoyé il y a 7 jours, relance diplomatique pour facture en retard de 15 jours, mise en demeure courtoise mais ferme pour facture à +30 jours, reprise de contact avec un client inactif depuis 6 mois.
- **Valeur ajoutée :** Accélération des encaissements sans dégrader la relation commerciale, réduction du délai moyen de paiement (DSO), préservation de la diplomatie relationnelle.
- **Type d'application :** Application web SaaS de gestion de la relation client, automatisation financière et génération textuelle guidée par l'IA.
- **Niveau d'automatisation :** Semi-automatisé avec contrôle humain ("Human-in-the-loop"). L'IA précalibre le niveau d'urgence, pré-remplit les variables, génère l'objet et le corps du message, et l'utilisateur valide ou édite avant l'envoi.
- **Rôle de l'IA :** Analyse contextuelle du dossier (nature du retard, montant, ancienneté), calibrage du ton (Courtois, Diplomatique, Ferme, Très ferme) et génération d'un email de relance persuasif et irréprochable sur le plan juridique et relationnel.

> **Description commerciale (2-3 phrases) :**
> Transformez vos factures impayées et devis dormants en trésorerie disponible sans y passer vos journées. Le module Relances Intelligentes IA cible vos dossiers en attente et génère en un clic l'email de relance parfaitement dosé entre fermeté et courtoisie. Récupérez vos fonds plus vite tout en valorisant la relation avec vos partenaires d'affaires.

---

## 2. À quoi sert l'application ?

### Pourquoi elle existe
Dans une entreprise, relancer un client qui n'a pas payé sa facture ou qui ne répond plus à une proposition tarifaire est une corvée chronophage et psychologiquement délicate. Une relance trop agressive peut briser un partenariat d'affaires prometteur, tandis qu'une relance trop timide conduit à des retards de paiement critiques pouvant mettre en péril la trésorerie de l'entreprise.

### Quel problème elle résout
1. **L'oubli des échéances :** Les factures impayées restent souvent non réclamées pendant des semaines par manque d'un système de surveillance centralisé.
2. **Le syndrome de la page blanche :** Difficulté à rédiger un email de recouvrement qui exige un équilibre subtil entre fermeté légale et diplomatie commerciale.
3. **La dispersion des outils :** Le commercial doit naviguer entre sa boîte mail Outlook/Gmail, son tableur Excel et ses factures PDF pour retrouver les montants et les références.

### Dans quel contexte elle est utilisée
- En fin de mois ou de semaine lors du point de trésorerie et de révision des créances clients.
- Dans le cadre de la gestion proactive du pipeline commercial pour transformer les devis en attente en contrats signés.
- Lors de campagnes de réactivation de comptes clients inactifs.

### Quels utilisateurs peuvent l'utiliser
- Dirigeants de TPE/PME sans service comptable dédié.
- Responsables de facturation et comptables auxiliaires clients.
- Équipes commerciales et chargées de clientèle.

### Quelles tâches elle permet de réaliser
- Visualiser les indicateurs clés de relance (taux de réponse, devis transformés, factures recouvrées).
- Consulter la file d'attente des dossiers nécessitant une intervention (factures en souffrance, devis sans réponse, réunions sans suite).
- Calibrer automatiquement la posture de relance (ton et degré d'urgence) en fonction du nombre de jours de retard.
- Générer un email sur-mesure (objet + contenu) via le modèle LLM Qwen 3.8.
- Envoyer directement la relance au client ou copier le texte pour l'expédier depuis son logiciel de messagerie favori.

---

## 3. Fonctionnalités complètes

### 1. Tableau de bord des indicateurs de relance (KPIs)
- **Objectif :** Offrir une vision synthétique de l'efficacité du recouvrement et de la conversion des devis.
- **Ce que fait l'utilisateur :** Clique sur l'onglet "Tableau de Bord".
- **Ce que fait l'application :** Appelle l'endpoint `followup_kpis.php` et calcule dynamiquement le nombre de relances envoyées, le taux de réponse moyen (en %), le montant/volume des devis gagnés et le total des factures encaissées grâce aux relances.
- **Ce que fait l'IA :** N/A (calculs statistiques et agrégation de base de données).
- **Résultat obtenu :** 4 cartes métriques claires permettant de mesurer le retour sur investissement du processus de suivi.
- **Technologies utilisées :** React, Lucide Icons, API REST PHP (`followup_kpis.php`).

### 2. File d'attente intelligente des cibles de relance (Centre d'Action)
- **Objectif :** Répertorier automatiquement les dossiers prioritaires qui nécessitent un suivi immédiat.
- **Ce que fait l'utilisateur :** Consulte la liste dans l'onglet "Centre d'Action", filtre par type et sélectionne un dossier (ex: Facture FAC-2024-001, en retard de 34 jours).
- **Ce que fait l'application :** Interroge `followup_targets.php` filtré par l'identifiant entreprise (`company_id`). L'application classe les dossiers par criticité et applique un badge visuel distinctif : Facture impayée (bouclier rouge), Devis non signé (document bleu), Rendez-vous manqué (horloge orange), Client inactif (cloche grise).
- **Ce que fait l'IA :** Le système applique un auto-calibrage de l'urgence : si `daysPending > 30`, l'urgence passe automatiquement à "high" et le ton à "Ferme" ; entre 15 et 30 jours, urgence "medium" et ton "Diplomatique" ; moins de 15 jours, urgence "low" et ton "Courtois".
- **Résultat obtenu :** Sélection instantanée d'un dossier avec pré-remplissage des paramètres de communication optimaux.
- **Technologies utilisées :** TypeScript, React State, Logique conditionnelle d'auto-ajustement.

### 3. Moteur IA de génération de message de relance
- **Objectif :** Rédiger un email personnalisé, poli, argumenté et assorti d'un appel à l'action incitatif.
- **Ce que fait l'utilisateur :** Ajuste si souhaité le ton ('Professionnel', 'Commercial', 'Courtois', 'Diplomatique', 'Ferme', 'Très ferme') et le niveau d'urgence ('low', 'medium', 'high'), puis clique sur "Générer la relance avec l'IA".
- **Ce que fait l'application :** Envoie la requête POST à `followup_generate.php` contenant le client, la référence du dossier, le type et les directives stylistiques.
- **Ce que fait l'IA :** Le modèle LLM (Groq `qwen/qwen3.8-27b`) analyse la typologie du dossier et les contraintes de ton. Il produit un objet d'email percutant et un corps de texte adapté, exempt de fautes, équilibrant respect du client et fermeté des délais de règlement.
- **Résultat obtenu :** L'email s'affiche dans l'interface, décomposé en champ "Objet" et zone "Corps du message", directement modifiables.
- **Technologies utilisées :** Groq Cloud API, LLM Qwen, JSON schema parsing, React State.

### 4. Expédition directe et copie presse-papier
- **Objectif :** Envoyer le message sans rupture de flux ou l'exporter dans son client de messagerie usuel.
- **Ce que fait l'utilisateur :** Clique sur "Envoyer la relance" ou sur le bouton "Copier dans le presse-papier".
- **Ce que fait l'application :** 
  - En mode envoi direct : transmet la charge à `followup_send.php` pour acheminement via le service SMTP ou intégration Microsoft 365, met à jour le statut du dossier et retire la cible de la liste d'attente.
  - En mode copie : copie le sujet et le corps formaté dans le presse-papier du système avec notification Toast.
- **Ce que fait l'IA :** N/A.
- **Résultat obtenu :** Relance effectuée en moins de 10 secondes et historique mis à jour.
- **Technologies utilisées :** Clipboard API, Sonner Toast, fetch API (`followup_send.php`).

### 5. Vérification du statut de synchronisation Microsoft 365
- **Objectif :** Informer l'utilisateur si son compte Outlook/M365 est appairé pour l'expédition directe depuis son adresse professionnelle.
- **Ce que fait l'utilisateur :** Consulte le bandeau de statut.
- **Ce que fait l'application :** Appelle `fetchIntegrationsStatus(companyId)` pour détecter la liaison active avec l'écosystème bureautique.
- **Ce que fait l'IA :** N/A.
- **Résultat obtenu :** Indicateur de connectivité affiché en temps réel.
- **Technologies utilisées :** `emailAssistantService.ts`, REST API.

---

## 4. Parcours utilisateur complet

```
[1. Connexion & Accès]
         │
         ▼
[2. Sélection de l'onglet Centre d'Action]
         │
         ▼
[3. Clic sur un dossier en souffrance (ex: Facture FAC-2024-001, retard 22 jours)]
         │
         ▼
[4. Auto-configuration par l'application : Urgence "Moyenne", Ton "Diplomatique"]
         │
         ▼
[5. Ajustement manuel optionnel du ton ou des critères]
         │
         ▼
[6. Clic sur "Générer la relance avec l'IA"]
         │
         ▼
[7. Génération en temps réel par Groq / Qwen (~1,2 seconde)]
         │
         ▼
[8. Relecture et retouche éventuelle de l'objet et du corps]
         │
         ▼
[9. Choix : "Copier le texte" OU "Envoyer directement"]
         │
         ▼
[10. Clôture de l'action : Le dossier est retiré des cibles, les KPIs s'incrémentent]
```

---

## 5. Comment fonctionne l'IA ?

### Modèle & Fournisseur
- **Modèle :** `qwen/qwen3.8-27b`
- **Fournisseur Cloud :** Groq Cloud API (moteur d'inférence LPU ultra-rapide)
- **Format de sortie :** JSON strict (`response_format: { type: "json_object" }`)

### Prompt Système réel
```text
Tu es un spécialiste de la relation client et du recouvrement bienveillant pour MDIV Business.
Rédige un message de relance ultra efficace et adapté :
- Type de dossier : {type} (facture impayée, devis en attente, client inactif, suite de réunion)
- Client : {clientName}
- Référence : {reference}
- Ton : {tone}
- Niveau d'urgence : {urgencyLevel}

Tu dois répondre UNIQUEMENT par un objet JSON valide avec ce format :
{
  "subject": "Objet clair et percutant de la relance",
  "body": "Corps complet de l'email de relance, poli, argumenté, avec appel à l'action précis."
}
```

### Pipeline de traitement
```
UTILISATEUR (Sélection dossier + Réglage Ton/Urgence)
        ↓
INTERFACE REACT (ServicesIAFollowup.tsx)
        ↓
API BACKEND (public/api/followup_generate.php ou vite-dev-api.ts)
        ↓
INFÉRENCE GROQ (LLM qwen/qwen3.8-27b en mode JSON strict)
        ↓
VALIDATION & PARSING (Contrôle présence subject + body)
        ↓
AFFICHAGE ÉDITABLE DANS LE FORMULAIRE
        ↓
EXPÉDITION OU COPIE PRESSE-PAPIER
```

---

## 6. Architecture technique

### Frontend
- **Page racine :** `src/pages/ServicesIAFollowup.tsx`
- **Service API :** `src/lib/followupService.ts`
- **Composants d'interface :** `EnterpriseAuthBar`, `sonner` (toasts), `lucide-react` (icônes)
- **Gestion d'état :** React Hooks (`useState`, `useEffect`)

### Backend
- **Endpoint génération :** `public/api/followup_generate.php` (et son miroir local dans `vite-dev-api.ts`)
- **Endpoint cibles :** `public/api/followup_targets.php`
- **Endpoint KPIs :** `public/api/followup_kpis.php`
- **Endpoint envoi :** `public/api/followup_send.php`
- **Client IA :** `public/api/groq_client.php`

### Base de données
- **Tables cibles :** `invoices` (factures avec dates d'échéance et soldes), `quotes` (devis avec statut 'draft' ou 'sent'), `clients` (coordonnées et historique).
- **Table d'historique :** `followups` (traçabilité des messages expédiés et dates de relance).

### Authentification & Multi-tenant
- Récupération du contexte entreprise via `useAuth()` (`company?.id`) garantissant l'étanchéité des créances entre entreprises clientes.

---

## 7. Architecture fonctionnelle

```
Module Relances Intelligentes IA
│
├── Dashboard Analytique
│   ├── Total relances expédiées
│   ├── Taux de conversion / réponse
│   ├── Devis remportés
│   └── Montant des factures recouvrées
│
├── Centre d'Action Opérationnel
│   ├── Détection cibles (factures, devis, clients inactifs)
│   ├── Scoring de criticité (calcul du retard en jours)
│   └── Auto-calibrage de la tonalité
│
├── Studio de Rédaction IA
│   ├── Sélection manuelle des tons (Courtois, Diplomatique, Ferme, Très ferme)
│   ├── Générateur d'objet percutant
│   ├── Générateur de corps d'email structuré
│   └── Zone d'édition libre
│
└── Passerelle d'Expédition
    ├── Connecteur SMTP / Microsoft 365
    └── Exportateur rapide presse-papier
```

---

## 8. Données entrantes et sortantes

### Données entrantes
- Données du dossier : identifiant, type (`invoice`, `quote`, `meeting`, `inactive_client`), référence (ex: `FAC-2024-089`), nom du client ou de l'entreprise.
- Métadonnées temporelles : `daysPending` (nombre de jours écoulés depuis l'échéance ou l'émission).
- Directives de style : `tone` ('Professionnel' | 'Commercial' | 'Courtois' | 'Diplomatique' | 'Ferme' | 'Très ferme') et `urgencyLevel` ('low' | 'medium' | 'high').

### Traitements
- Calcul automatique de la recommandation ton/urgence.
- Construction du prompt système et utilisateur.
- Appel HTTP sécurisé vers l'API Groq.
- Décodage JSON et vérification de conformité.

### Données sortantes
- `subject` : Objet de l'email optimisé pour un taux d'ouverture maximal.
- `body` : Texte intégral comprenant salutations, rappel de la créance ou de la proposition, justification factuelle, appel à l'action daté et formule de politesse.
- Notification de succès et mise à jour de la liste de travail.

---

## 9. Exemples concrets d'utilisation

### Exemple 1 : Relance douce d'un devis resté sans réponse
- **Utilisateur :** Thomas, responsable commercial d'un cabinet de conseil.
- **Action :** Sélectionne le devis "DEV-2024-042" (en attente depuis 10 jours) pour le client "Atelier Bois & Design".
- **Traitement :** L'application pré-sélectionne le ton "Courtois" et l'urgence "Faible".
- **IA :** Le modèle rédige :
  - *Objet :* `Suite à notre échange : votre projet d'agencement (Réf. DEV-2024-042)`
  - *Corps :* Rappelle l'échange initial avec enthousiasme, demande si le client a pu prendre connaissance de la proposition, propose un court échange téléphonique de 10 minutes pour répondre à ses questions techniques et joint les coordonnées directes.
- **Résultat :** Thomas clique sur "Copier" et l'expédie via sa boîte mail en 20 secondes.

### Exemple 2 : Recouvrement ferme d'une facture à +35 jours d'impayé
- **Utilisateur :** Claire, directrice générale d'une agence de communication.
- **Action :** Clique sur la facture "FAC-2024-019" (Montant : 4 200 €, retard : 38 jours) pour le client "Société Alpha".
- **Traitement :** L'application bascule automatiquement en urgence "Élevée" et ton "Ferme".
- **IA :** Le modèle génère un rappel précis mentionnant la date d'échéance dépassée, le montant dû, les références bancaires pour virement sous 48 heures, tout en conservant une politesse formelle qui évite l'escalade contentieuse prématurée.
- **Résultat :** Envoi direct via le bouton de l'application, retrait de la facture de la liste des dossiers urgents.

---

## 10. Valeur ajoutée

- **Gain de temps :** Remplacement de 15 à 20 minutes de rédaction hésitante par un processus de 30 secondes.
- **Accélération des encaissements :** Réduction mesurée du temps de latence des créances grâce à des rappels systématiques et réguliers.
- **Préservation de la relation client :** Dosage millimétré du ton évitant les maladresses ou l'agressivité verbale.
- **Zéro impayé oublié :** Centralisation automatique de tous les retards sur un même écran d'action.
- *Gain quantifié :* Gain financier direct non quantifié dans la version actuelle, dépend du volume de créances de l'entreprise utilisatrice.

---

## 11. Limites actuelles

- **Envoi automatisé en arrière-plan sans validation :** Fonctionnalité prévue / non implémentée (l'action requiert aujourd'hui un clic humain pour chaque relance).
- **Synchronisation bancaire en temps réel :** Fonctionnalité prévue / non implémentée (l'état "payé" doit être mis à jour dans la base du logiciel ou via le module de facturation).
- **Relance multi-canaux (SMS / WhatsApp) :** Fonctionnalité prévue / non implémentée (seul l'email est pris en charge actuellement).

---

## 12. Évolutions possibles

### Déjà implémenté
- Détection des dossiers en attente (factures, devis, réunions).
- Auto-ajustement dynamique de l'urgence et du ton selon l'ancienneté.
- Générateur IA Qwen 3.8 avec sortie JSON structurée.
- Éditeur de texte intégré avant envoi.
- Copie presse-papier en un clic et tableau de bord des indicateurs.

### Prévu mais non implémenté
- Scénarios de relances cadencées automatiques (ex: J+3, J+10, J+25 sans intervention humaine).
- Génération automatique de l'annexe PDF récapitulative de compte joint à l'email.
- Webhooks de notification Slack/Teams dès qu'une facture dépasse 30 jours de retard.

### Proposition d'évolution
- Analyse prédictive du comportement de paiement client (scoring du risque client).
- Proposition d'un lien de paiement en ligne direct (Stripe / virement instantané SEPA) intégré dans l'email généré.

---

# 13. PRÉSENTATION MARKETING DE L'APPLICATION

### Pitch en 1 phrase
Relances Intelligentes IA transforme vos factures impayées et devis dormants en liquidités immédiates grâce à des messages sur-mesure au dosage relationnel parfait.

### Pitch en 30 secondes
Combien de milliers d'euros dorment actuellement sur votre compte client par simple manque de relance ? Avec Relances Intelligentes IA de MDIV Business, vous ne laissez plus un seul euro s'échapper. L'application identifie vos dossiers en retard, calibre le bon niveau d'urgence et génère en 1 clic un email de relance percutant, poli et ultra-efficace. Vous vous faites payer plus vite, sans jamais froisser vos clients.

### Présentation en 1 minute
Le nerf de la guerre d'une TPE ou PME, c'est sa trésorerie. Pourtant, entre les réunions, les chantiers et les urgences quotidiennes, relancer les factures en retard et les devis en suspens passe toujours au second plan. Pourquoi ? Parce que personne n'aime réclamer de l'argent et trouver les mots justes.
Relances Intelligentes IA résout ce défi. Connectée à vos dossiers, l'application repère immédiatement les échéances dépassées. Elle ajuste le ton : courtois pour un premier rappel, ferme pour un retard critique. En un instant, l'intelligence artificielle rédige un email professionnel prêt à partir ou à copier dans votre messagerie. Résultat : vous accélérez vos rentrées d'argent, vous gagnez un temps précieux et vous maintenez une relation commerciale irréprochable.

### Problème
Les impayés et devis oubliés fragilisent la trésorerie des dirigeants, qui hésitent souvent à relancer par peur de paraître agressifs ou par manque de temps.

### Solution
Un centre d'action intelligent qui classe les dossiers critiques et rédige instantanément la relance idéale adaptée au jour près.

### Fonctionnement
Sélectionnez le dossier en retard -> L'IA dose l'urgence et génère l'email -> Vous relisez, validez et envoyez.

### Public cible
Dirigeants de PME, artisans, indépendants, DAF et responsables commerciaux.

### Cas d'utilisation
Recouvrement de créances échues, relance de propositions tarifaires, recontact de clients inactifs.

### Proposition de valeur
Récupérez vos fonds sans effort, zéro impayé laissé pour compte, préservez l'estime de vos clients.

---

# 14. SCRIPT POUR VIDÉO CAPCUT

## Scène 1 — Hook
- **Durée :** 00:00 – 00:05 (5 sec)
- **Visuel :** Plan serré sur une pile de factures ou un écran d'ordinateur montrant des montants en rouge, dirigeant soucieux.
- **Texte à l'écran :** "Des milliers d'euros d'impayés qui dorment ?"
- **Voix off :** "Vous en avez assez de courir après vos factures impayées et de passer pour le méchant ?"
- **Animation CapCut :** Zoom in rapide + son "Whoosh" percutant.

## Scène 2 — Le problème
- **Durée :** 00:05 – 00:12 (7 sec)
- **Visuel :** Écran de rédaction d'email vide avec le curseur qui clignote. Le dirigeant hésite, efface son texte.
- **Texte :** "Le dilemme : être payé sans froisser son client..."
- **Voix off :** "Rédiger un email de relance prend du temps... Trop agressif, vous perdez le client. Trop gentil, vous n'êtes jamais payé."

## Scène 3 — La solution
- **Durée :** 00:12 – 00:20 (8 sec)
- **Visuel :** Transition dynamique vers l'écran MDIV Business "Relances Intelligentes" avec les badges de couleurs.
- **Texte :** "Relances Intelligentes IA : La solution"
- **Voix off :** "Découvrez Relances Intelligentes IA par MDIV Business. Le système qui automatise vos suivis avec le dosage parfait."

## Scène 4 — Démonstration
- **Durée :** 00:20 – 00:35 (15 sec)
- **Visuel à enregistrer dans l'application :** Clic sur une facture en retard de 28 jours -> la jauge passe automatiquement en "Ferme" -> Clic sur "Générer la relance avec l'IA" -> le texte complet s'écrit sous les yeux de l'utilisateur.
- **Action utilisateur :** Clic sur la cible, sélection du ton, génération IA instantanée.
- **Texte :** "1 Clic = L'email parfait généré par l'IA"
- **Voix off :** "L'application détecte le retard, adapte le ton au contexte et rédige un email sur-mesure, respectueux et percutant."

## Scène 5 — Fonctionnalités principales
- **Durée :** 00:35 – 00:45 (10 sec)
- **Fonctionnalité 1 :** Détection automatique des devis et factures en souffrance.
- **Fonctionnalité 2 :** 6 tonalités au choix : du courtois au très ferme.
- **Fonctionnalité 3 :** Envoi direct ou copie instantanée dans Outlook / Gmail.

## Scène 6 — Résultat
- **Durée :** 00:45 – 00:52 (7 sec)
- **Visuel :** Affichage du tableau de bord avec les KPIs qui passent au vert (taux de réponse, factures payées).
- **Texte :** "Trésorerie encaissée. Zéro friction."
- **Voix off :** "Résultat : vous encaissez vos créances 2 fois plus vite, tout en préservant d'excellentes relations d'affaires."

## Scène 7 — Call To Action
- **Durée :** 00:52 – 01:00 (8 sec)
- **Texte :** "Testez Relances Intelligentes dès aujourd'hui sur MDIV Business"
- **Voix off :** "Reprenez le contrôle de votre trésorerie dès maintenant. Rendez-vous sur MDIV Business !"
- **CTA :** Bouton clignotant "Essai gratuit sur mdiv-business.fr".

---

# 15. PLAN DE CAPTURE D'ÉCRAN POUR LA VIDÉO

- **Capture 1 :** Menu des Services IA -> Clic sur la tuile "Relances Intelligentes" (3 sec, zoom avant, transition Cut).
- **Capture 2 :** Onglet "Centre d'Action" avec la liste des dossiers triés par criticité (4 sec, focus sur les badges de jours de retard).
- **Capture 3 :** Clic sur une facture en retard de 30 jours (3 sec, zoom sur le panneau de droite qui s'ouvre).
- **Capture 4 :** Changement du sélecteur de ton vers "Diplomatique" ou "Ferme" (3 sec, plan serré).
- **Capture 5 :** Clic sur le bouton bleu "Générer la relance avec l'IA" avec spinner de chargement court (3 sec).
- **Capture 6 :** Apparition du texte généré (Objet et corps) avec mise en valeur de la signature (4 sec).
- **Capture 7 :** Clic sur "Copier dans le presse-papier" avec toast vert de validation (3 sec).
- **Capture 8 :** Onglet "Tableau de Bord" avec les 4 cartes de KPIs chiffrés (4 sec, zoom arrière).

---

# 16. MONTAGE CAPCUT

- **Format recommandé :** 9:16 (vertical Reels/TikTok/Shorts) ou 16:9 (horizontal pour webinaire/LinkedIn).
- **Résolution :** 1080x1920 (ou 4K 60fps si export écran haute définition).
- **Durée :** 55 secondes.
- **Rythme :** Dynamique, cuts synchronisés sur les battements de la musique.
- **Transitions :** Transitions de type "Glissement moderne" ou "Zoom d'impact" entre la scène problème et la scène solution.
- **Sous-titres :** Sous-titres dynamiques bicolores jaune/blanc au centre bas de l'écran avec police percutante (Montserrat Bold ou The Bold Font).
- **Musique :** Piste corporate moderne rythmée (Lofi tech ou Future Bass énergique sans être agressive).
- **Voix off :** Voix assurée, dynamique et chaleureuse (voix IA CapCut "Adam" ou voix off studio).
- **Timeline indicative :**
  - `00:00 – 00:05` : Hook problème impayés
  - `00:05 – 00:12` : Écran blanc / dilemme relationnel
  - `00:12 – 00:20` : Présentation du module MDIV
  - `00:20 – 00:35` : Capture d'écran démo en action
  - `00:35 – 00:45` : Pop-ups 3 fonctionnalités clés
  - `00:45 – 00:52` : Dashboard et KPIs en hausse
  - `00:52 – 01:00` : Outro & Call to action

---

# 17. TEXTE POUR PUBLICITÉ

### Publicité courte (X / Twitter / Meta Ads court)
Vos factures impayées vous empêchent de dormir ? Laissez l'IA rédiger la relance parfaite au bon degré d'urgence. Récupérez vos fonds sans briser la relation client. Essayez Relances Intelligentes sur MDIV Business.

### Publicité LinkedIn
Relancer un client en retard de paiement est l'exercice le plus délicat pour un dirigeant : comment être ferme sans passer pour un procédurier ?
C'est précisément la mission du nouveau module **Relances Intelligentes IA** développé dans l'écosystème MDIV Business.
Il analyse vos créances et vos propositions en attente, calibre la tonalité idéale (courtoise, diplomatique ou ferme) et rédige un message percutant en quelques secondes.
Protégez votre trésorerie tout en valorisant vos partenariats.
Découvrez la démo : [Lien vers MDIV Business]

### Publicité Instagram
Marre de réclamer votre argent ? L'IA de MDIV Business prend le relais. Elle rédige vos emails de relance au millimètre près pour vous faire payer 2x plus vite sans aucun malaise. Lien en bio !

### Publicité Facebook
70% des retards de paiement sont dus à un simple oubli... ou à une absence de relance structurée. Ne laissez plus vos devis et factures s'enliser ! Découvrez comment notre IA génère en 1 clic vos emails de suivi commercial et de recouvrement bienveillant.

### Description vidéo (YouTube Shorts / TikTok)
Comment relancer une facture impayée sans perdre son client ? Démonstration concrète de l'application Relances Intelligentes IA de MDIV Business. #IA #Entrepreneuriat #Gestion #Productivité

### CTA
"Optimisez votre trésorerie dès aujourd'hui avec MDIV Business."

---

# 18. FAQ

- **À quoi sert cette application ?**
  Elle permet de suivre les factures impayées, les devis non signés et les relances de réunions, en générant des emails de suivi sur-mesure grâce à l'IA.
- **À qui s'adresse-t-elle ?**
  Aux dirigeants d'entreprise, comptables, DAF, commerciaux et indépendants qui souhaitent accélérer leurs encaissements sans y consacrer des heures.
- **Comment fonctionne l'IA ?**
  Elle analyse les métadonnées du dossier (jours de retard, nom, type) et utilise le modèle de langage Qwen 3.8 pour générer un objet accrocheur et un texte respectant rigoureusement le ton demandé.
- **L'application envoie-t-elle des emails à mon insu ?**
  Non. L'utilisateur a toujours la main pour relire, modifier ou annuler l'envoi. Aucun email n'est expédié sans validation explicite.
- **Puis-je utiliser mon propre logiciel de messagerie ?**
  Oui, un bouton "Copier dans le presse-papier" permet de coller le message généré dans Outlook, Gmail, Apple Mail ou tout autre outil en une seconde.
- **Quelles données sont envoyées à l'IA ?**
  Uniquement le type de dossier, le nom de l'interlocuteur, la référence et le ton souhaité. Aucun mot de passe ni coordonnée bancaire secrète n'est transmis au modèle de langage.

---

# 19. FICHE COMMERCIALE

- **Nom :** Relances Intelligentes IA
- **Catégorie :** Gestion Financière & Relation Client B2B
- **Public cible :** PME, TPE, Indépendants, Dirigeants, DAF
- **Problème :** Retards d'encaissement, devis sans suite et complexité relationnelle du recouvrement
- **Solution :** Moteur IA de détection et de génération d'emails de relance calibrés selon l'urgence
- **Fonctionnalités clés :** File d'attente des créances, auto-calibrage du ton, génération Qwen 3.8, tableau de bord KPIs, copie 1-clic
- **Technologies IA :** Groq Cloud API, LLM Qwen 3.8 27B, parsing JSON strict
- **Type d'IA :** Traitement du langage naturel (NLP), génération de texte contextualisée
- **Cas d'utilisation :** Recouvrement amiable, suivi de devis, reprise de contact commercial
- **Valeur ajoutée :** Trésorerie débloquée plus rapidement, gain de temps hebdomadaire, sérénité relationnelle
- **Statut :** Opérationnel en production (route `/services-ia/relances`)
- **CTA :** "Activez vos relances intelligentes sur MDIV Business"

---

# 20. CHECKLIST DE PRÉSENTATION

- [ ] Démo de l'application préparée sur des factures tests
- [ ] Captures d'écran préparées selon le plan de capture
- [ ] Script vidéo préparé pour l'enregistrement voix off
- [ ] Voix off enregistrée ou générée
- [ ] Vidéo CapCut montée avec sous-titres dynamiques
- [ ] Sous-titres et animations de texte ajoutés
- [ ] CTA ajouté à la fin de la vidéo
- [ ] Version courte 30s créée pour TikTok/Reels
- [ ] Version longue 60s créée pour LinkedIn/YouTube
- [ ] Publication LinkedIn rédigée et programmée
- [ ] Publication Instagram / Reels exportée
- [ ] Publication Facebook programmée
