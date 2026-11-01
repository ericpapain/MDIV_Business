# PROTÉGÉ : ARCHITECTURE & SPÉCIFICATIONS TECHNIQUES DE PRODUCTION
# MISSION INTERDICTION DE CODE SANS VALIDATION - CONFORMITÉ FACTURATION ÉLECTRONIQUE (PPF)
# CIBLE : STACK REACT.JS / NODE.JS / MYSQL (PHPMYADMIN) - 10 000 UTILISATEURS EN PRODUCTION

## 🚨 RÈGLE D'OR ABSOLUE (ZÉRO ÉCHEC TOLÉRÉ)
Tu agis en tant qu'Architecte Logiciel Senior et Expert en Conformité Fiscale Française. L'application est hautement critique (10 000 utilisateurs actifs). **TU NE DOIS MODIFIER AUCUN FICHIER, AJOUTER AUCUNE LIGNE DE CODE ET SUPPRIMER AUCUN ÉLÉMENT DANS CETTE PHASE D'AUDIT.** Tu dois analyser, cartographier et planifier. Le non-respect de cette règle entraînera une rupture de la production.

---

## 📖 LEXIQUE ET LIENS OFFICIELS DE RÉFÉRENCE
Pour parfaire tes connaissances et garantir la conformité stricte de tes futures propositions, appuie-toi exclusivement sur les définitions et documentations officielles suivantes :
1. **PPF (Portail Public de Facturation) :** La plateforme étatique gratuite qui centralise l'annuaire des entreprises et collecte les factures/données de e-reporting pour l'administration fiscale. 
   -> Site officiel et documentation : [https://economie.gouv.fr](https://economie.gouv.fr)
2. **Factur-X :** Norme franco-allemande de facture électronique mixte. Il s'agit d'un fichier PDF/A-3 lisible par l'humain contenant un fichier XML structuré selon le standard UN/CEFACT CII (Cross Industry Invoice) pour être lu automatiquement par les machines.
3. **e-Invoicing :** Obligation de transmission électronique des factures pour les transactions B2B (Business to Business) domestiques en France entre assujettis à la TVA.
4. **e-Reporting :** Obligation de transmission à l'administration des données de transactions non couvertes par le e-invoicing (ventes aux particuliers B2C, ventes internationales/exportations) et des données de paiement des prestations de services.
5. **mTLS (Mutual TLS) :** Protocole de sécurité réseau exigeant une authentification bidirectionnelle. Le serveur (PPF) et le client (notre serveur Node.js) doivent chacun présenter un certificat X.509 conforme au Référentiel Général de Sécurité (RGS** / eIDAS) délivré par une Autorité de Certification (AC) qualifiée.

---

## ÉTAPE 1 : AUDIT DE SÉCURITÉ ET CHASSE AUX MOCKS (DEPUIS LA RACINE `/`)
Parcours récursivement l'ensemble de l'arborescence du projet et documente de manière exhaustive :

1. **Éradication des données simulées (Mocks) :**
   - Repère tous les fichiers contenant des données statiques de test, faux clients, fausses factures, objets `stub`, variables `const mockUser = ...` ou fonctions simulant des réponses de base de données. 
   - Note leurs emplacements précis (chemins des fichiers et numéros de lignes) afin de planifier leur suppression définitive et leur remplacement par de vrais flux de production MySQL.

2. **Audit Schema MySQL (Analyse via structure existante) :**
   - Examine les modèles de données ou les fichiers de configuration de tables. Repère où sont stockés les clients/tiers et les factures.
   - Identifie précisément l'absence des 24 mentions obligatoires de la réforme, notamment : le SIRET (14 caractères, contrôle de la clé de Luhn obligatoire), le numéro de TVA intracommunautaire, le code pays ISO 3166-1 alpha-2, la nature de l'opération (Livraison de biens / Prestation de services / Mixte), l'option pour les débits, et le code d'exonération de TVA par ligne.

3. **Audit Backend Node.js :**
   - Analyse le moteur de génération de documents. Si le code génère des PDF simples (via Puppeteer, PDFKit, etc.), documente l'obsolescence technique par rapport à l'obligation du format mixte PDF/A-3 intégrant le XML Factur-X.
   - Analyse la gestion des encaissements : vérifie s'il existe un système immuable pour tracer la date, le montant exact lettré et le mode de règlement, indispensables pour le e-reporting de paiement.

4. **Audit Frontend React.js :**
   - Inspecte les formulaires de saisie client et de facturation. Documente l'absence de validations strictes (regex) au moment de la saisie utilisateur.

---

## ÉTAPE 2 : CONCEPTION DE LA CONNEXION DIRECTE PPF (SANS INTERMÉDIAIRE)
Planifie l'architecture d'intégration directe avec le PPF dans Node.js :
- Protocole de connexion : Configuration du module `https` natif de Node.js ou d'un client HTTP (Axios) pour injecter les certificats matériels ou logiciels RGS** requis pour le protocole **mTLS**.
- Architecture des endpoints pour consommer :
  1. L'API d'interrogation de l'Annuaire Central du PPF.
  2. L'API de dépôt sécurisé des factures.
  3. L'API de récupération/mise à jour du cycle de vie des statuts réglementaires (*Déposée*, *Rejetée*, *Refusée*, *Prise en charge*).

---

## ÉTAPE 3 : ARCHITECTURE DU PROTOCLE DE TRIPLE CONTRÔLE (RÉASSURANCE PRODUCTION)
Détaille la procédure de validation finale obligatoire. Lorsque le code sera modifié (après validation), tu devras exécuter **3 fois consécutives** les tests suivants avec des jeux de données réels et dynamiques différents pour garantir une tolérance aux pannes de 100% :

- [ ] **Contrôle 1 : Injection & Parsing Factur-X (x3)** -> Générer 3 factures distinctes. Extraire le XML embarqué du PDF/A-3 et valider par schéma XSD que les structures `CII` ou `UBL` sont mathématiquement parfaites.
- [ ] **Contrôle 2 : Résilience mTLS & Webhooks PPF (x3)** -> Simuler 3 scénarios de rupture réseau et de reconnexion automatique lors d'un appel API PPF. Simuler 3 envois de webhooks descendants (statut Refusée avec motif commercial) et vérifier la non-saturation de la boucle d'événements Node.js.
- [ ] **Contrôle 3 : Intégrité Transactionnelle MySQL (x3)** -> Simuler des écritures massives et simultanées en base de données sur 3 topologies différentes pour s'assurer qu'aucun interblocage (Deadlock), doublon de facture ou rupture de contrainte d'unicité ne se produise sur les 10 000 comptes utilisateurs.

---

## ÉTAPE 4 : LIVRABLE ATTENDU IMMÉDIATEMENT
Ne génère aucun code de remplacement pour le moment. Réponds uniquement par ce rapport textuel ultra-détaillé :

1. **📋 RAPPORT D'AUDIT RACINE (`/`) :** Fichiers impactés, liste exacte des mocks trouvés avec chemins complets, failles de données MySQL identifiées.
2. **🏗️ SCHÉMA DE LA FUTURE ARCHITECTURE :** Plan précis des modifications de la base de données, des nouveaux modules Node.js à créer et des composants React à mettre à niveau.
3. **🛑 DEMANDE DE DÉVERROUILLAGE :** Termine obligatoirement par cette phrase exacte : *"J'ai identifié l'ensemble des composants et risques pour vos 10 000 utilisateurs. J'attends votre GO officiel pour débuter la phase de refonte sans impact sur la production."*

# MISSION : AUDIT COMPLET & CAHIER DE REFONTE - FACTURATION ÉLECTRONIQUE (PPF / STACK: REACT-NODE-MYSQL)

## 🚨 CONTEXTE ET RÈGLES CRITIQUES
- L'application est en production avec **10 000 utilisateurs actifs**. 
- Stack technique : Frontend **React**, Backend **Node.js**, Base de données **MySQL** (gérée via PHPMyAdmin).
- Cible de connexion : Intégration **directe via les API du Portail Public de Facturation (PPF)**.
- **INTERDICTION ABSOLUE DE MODIFIER LE CODE SOURCE DANS UN PREMIER TEMPS.** Tu dois agir en tant qu'auditeur senior. Tu proposes ton plan, et j'attends ton rapport pour te donner le "GO" officiel avant toute modification.

---

## ÉTAPE 1 : AUDIT SYSTÉMIQUE DEPUIS LA RACINE (`/`)
Analyse l'intégralité du projet depuis la racine pour identifier "toutes les billes" et failles par rapport aux normes 2026/2027. Inspecte et liste précisément :

1. **Chasse aux Données Mockées :**
   - Repère et liste **toutes** les données de test, fixtures, variables en dur (hardcoded) ou faux clients/factures simulés dans le code. Elles devront toutes être définitivement supprimées lors de la refonte.

2. **Architecture de la Base de Données (MySQL) :**
   - Repère les tables des clients/tiers. Manque-t-il les champs `siret` (14 caractères, Luhn), `tva_intracommunautaire`, `code_pays_iso`, et `plateforme_routage` ?
   - Repère la table des factures. Comment est gérée la chronologie ? Existe-t-il les champs `nature_operation` (Biens/Services/Mixte) et `option_tva_debits` ?
   - Vérifie la gestion des statuts actuels (ex: payé, envoyé) pour voir s'ils sont compatibles avec la State Machine PPF.

3. **Backend (Node.js) :**
   - Analyse les contrôleurs ou services de facturation. Comment sont générés les documents ? (S'il y a des librairies de génération de PDF simples type `pdfkit`, `puppeteer` ou `html-pdf`, marque-les comme obsolètes).
   - Cherche les endpoints d'encaissement. Y a-t-il un tracking précis de la date et du mode de paiement pour le e-reporting des prestations de services ?

4. **Frontend (React) :**
   - Inspecte les formulaires de création de comptes clients/fournisseurs. Valident-ils le SIRET et le format de TVA de manière stricte ?
   - Analyse l'interface de facturation : permet-elle de spécifier la nature de l'opération et la TVA par ligne ?

---

## ÉTAPE 2 : EXIGENCES POUR LA CONNEXION DIRECTE PPF
Pour la future refonte, garde en tête que nous allons nous connecter **directement au PPF**. Tu devras prévoir l'intégration de :
- L'authentification mutuelle **mTLS** (Certificats logiciels qualifiés RGS** / eIDAS requis par l'État).
- Les appels aux API du PPF pour :
  1. L'interrogation de l'Annuaire Central (vérification du SIRET client avant envoi).
  2. Le dépôt des factures au format **Factur-X** (Profil BASIC minimum).
  3. La remontée des statuts obligatoires (*Déposée*, *Rejetée*, *Refusée*, *Prise en charge*).
  4. La transmission des données de paiement (*e-reporting*).

---

## ÉTAPE 3 : PROTOCOLE DE TRIPLE CONTRÔLE DE FIN DE MISSION
Lorsque le "GO" sera donné et que le code sera modifié, tu devras obligatoirement exécuter une **procédure de triple vérification (3 itérations de contrôles indépendants)** sur les modules suivants avant de déclarer la mission terminée :
- [ ] **Contrôle 1 : Génération & Validité Factur-X** (Vérifier 3 fois de suite avec des payloads différents que le XML est parfaitement intégré au PDF/A-3).
- [ ] **Contrôle 2 : Pipeline de communication PPF** (Simuler 3 fois le cycle complet d'envoi et de réception des statuts mTLS sans aucune fuite de mémoire ou blocage).
- [ ] **Contrôle 3 : Intégrité MySQL** (Vérifier 3 fois qu'aucune ligne orpheline, aucun doublon de facture ou crash de contrainte d'unicité ne se produit en base de données).

---

## ÉTAPE 4 : TON LIVRABLE IMMÉDIAT (CE QUE TU DOIS ME RÉPONDRE MAINTENANT)
Ne commence à coder aucun fichier. Présente-moi un rapport structuré comme suit :

1. **📢 Rapport d'Audit :** La liste exacte de ce que tu as trouvé dans mon code actuel (incluant les données mockées à supprimer, fichiers impactés, tables MySQL manquantes, fonctions à réécrire).
2. **🛠️ Plan d'action détaillé de la Refonte :** Ce que tu vas modifier, étape par étape, dans React, Node.js et MySQL dès que j'aurai donné mon accord.
3. **⚠️ Demande de validation :** Termine par une phrase claire demandant le "GO" pour lancer les modifications.
# CAHIER DES CHARGES : REFONTE POUR CONFORMITÉ FACTURATION ÉLECTRONIQUE (RÉFORME FRANCE 2026/2027)

## 📌 CONTEXTE & OBJECTIF
L'application actuelle gère la facturation de 10 000 utilisateurs actifs. Elle doit migrer d'un modèle "PDF classique par email" vers l'architecture officielle en "Y" imposée par la Direction Générale des Finances Publiques (DGFiP). 

L'objectif est d'automatiser à 100% le e-invoicing (B2B France), le e-reporting (B2C & International) et la transmission des statuts du cycle de vie des factures, sans interruption de service.

---

## 1. ARCHITECTURE DES DONNÉES & BASE DE DONNÉES (SCHEMA DB)
Modifier le schéma actuel pour intégrer les contraintes de la réforme.

### A. Données Tiers (Clients & Fournisseurs)
- [ ] **SIRET/SIREN :** Rendre le champ obligatoire pour tout client B2B en France. Validation stricte regex (9 chiffres pour SIREN, 14 pour SIRET + clé de l'algorithme de Luhn).
- [ ] **Numéro de TVA Intracommunautaire :** Validation regex selon le pays (ex: FR + 2 chiffres + SIREN).
- [ ] **Code Pays ISO 3166-1 alpha-2 :** Obligatoire pour la gestion du e-reporting international (ex: "FR", "DE", "US").
- [ ] **Routage Plateforme :** Ajouter un champ `plateforme_destinataire_id` (identifiant de la PDP du client ou PPF).

### B. Données Factures (Invoice Schema)
- [ ] **Numérotation unique et chronologique rupture interdite :** Bloquer toute modification après émission.
- [ ] **Nature de l'opération :** Ajouter une énumération obligatoire : `Livraison de biens`, `Prestation de services`, ou `Mixte`. *Crucial pour l'exigibilité de la TVA.*
- [ ] **Option pour les débits :** Un booléen indiquant si le fournisseur acquitte la TVA sur les débits.
- [ ] **Devise :** Code ISO 4217 (ex: "EUR").

### C. Lignes de Facture (Invoice Items)
Chaque ligne doit explicitement comporter :
- [ ] **Taux de TVA appliqué** (ex: 20.00, 5.5, 0.0).
- [ ] **Code d'exonération de TVA :** Si TVA à 0%, associer obligatoirement le motif légal (ex: Article 283 du CGI).

---

## 2. MODULE DE GÉNÉRATION DES FORMATS SOCLES (MOTEUR DE FACTURATION)
Interdire la génération de PDF "simples". Implémenter le format **Factur-X** (Profil *BASIC* au minimum, *EXTENDED* ou *EN 16931* recommandé pour la gestion financière).

- [ ] **Génération du XML :** Générer le fichier XML conforme au standard UN/CEFACT CII (Cross Industry Invoice) ou UBL 2.1.
- [ ] **Embedding PDF/A-3 :** Utiliser une librairie (ex: PDF-BOX, PyPDF, NodeJS pdf-lib) pour injecter ce fichier XML de manière invisible à l'intérieur du fichier PDF, conforme à la norme ISO 14289 (PDF/A-3).
- [ ] **Données obligatoires obligatoires dans le XML :**
  - SIREN de l'émetteur et du récepteur.
  - Date d'émission, date d'échéance.
  - Total HT, Montant TVA par taux, Total TTC.

---

## 3. PIPELINE D'INTÉGRATION ET ROUTAGE (E-INVOICING & E-REPORTING)
L'application doit s'interfacer avec l'API publique du Portail Public de Facturation (PPF) et/ou d'une Plateforme de Dématérialisation Partenaire (PDP).

### A. Flux E-Invoicing (B2B France)
- [ ] **Vérification de l'annuaire public :** Avant soumission, interroger l'API du PPF (Annuaire Central) pour vérifier la plateforme active du client à partir de son SIRET.
- [ ] **Envoi de la facture :** Pousser le fichier Factur-X via protocole sécurisé (API REST JSON/HTTPS ou AS4) vers la plateforme cible (PPF/PDP).

### B. Flux E-Reporting (B2C & International)
Créer un worker/cron mensuel ou hebdomadaire qui agrège et transmet :
- [ ] **Transactions B2C :** Zéro SIRET client. Transmission du CA global quotidien ou par transaction, ventilé par taux de TVA.
- [ ] **Transactions Internationales (B2B hors France) :** Transmission des données de facturation sans l'obligation du format Factur-X complet, mais avec les données financières obligatoires.

---

## 4. GESTION DU CYCLE DE VIE DES FACTURES (STATE MACHINE)
La réforme impose un suivi en temps réel de la facture. Implémenter la State Machine suivante dans la table `invoice_statuses` :


- [ ] **Webhooks / API Endpoints :** Créer des endpoints sécurisés capables de recevoir les changements de statut envoyés par la PDP/PPF (ex: si le client clique sur "Refuser" sur sa plateforme, votre DB doit passer la facture en `Refusée`).
- [ ] **Données de paiement :** Pour les prestations de services, logger précisément la date de règlement, le mode de paiement et le montant lettré pour alimenter le e-reporting de paiement.

---

## 5. RECONNAISSANCE ET ENTRÉE (FACTURES FOURNISSEURS)
Vos 10 000 utilisateurs vont recevoir des factures électroniques.
- [ ] **Parseur Factur-X :** Développer un script d'extraction automatique. Dès qu'un utilisateur importe un PDF/A-3, l'application doit extraire le XML embarqué, lire les balises et pré-remplir instantanément la comptabilité (Montants, TVA, Fournisseur via SIRET) sans aucune saisie manuelle.
- [ ] **Fallback OCR :** Si le format est un vieux PDF non conforme d'une micro-entreprise (tolérance transitoire), basculer sur un moteur OCR avec alerte "Format non structuré".

---

## 6. SÉCURITÉ, AUDIT TRAIL & LOGGING
- [ ] **Piste d'Audit Fiable (PAF) :** Conserver un log immuable et horodaté de toutes les actions sur une facture (Date de création, date d'envoi, identifiant de transaction de la plateforme d'État).
- [ ] **Archivage légal :** Stockage sécurisé des factures électroniques originales (XML/Factur-X) pendant une durée légale de 10 ans (Coffre-fort numérique ou stockage immuable type AWS S3 Object Lock).