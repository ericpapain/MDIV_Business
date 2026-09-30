# Pôle 1 : Devis, Facturation, Trésorerie & Facturation Électronique 2026
## Benchmark Concurrentiel (Top 10 + Étude Approfondie Kolecto), Gap Analysis & Plan d'Implémentation

Ce document rassemble l'analyse comparative détaillée, l'extraction fonctionnelle de référence de **Kolecto** (Fintech Crédit Agricole & LCL, PDP agréée n° 0039), la stratégie de différenciation (« Outperform »), le plan d'action technique et le prompt maître d'implémentation pour les applications financières et opérationnelles de MDIV Business :
* **Application 4 :** Assistant Devis Universel B2B, Ventes & Facturation Clients IA
* **Application 5 :** Vérificateur Factures, Notes de Frais, Achats, Anti-Fraude & OCR Vision IA
* **Application 8 :** Assistant Relances Multi-Niveaux, Trésorerie & DSO IA
* **Hub Transversal :** Facturation Électronique 2026 (Factur-X / PDP), Open Banking & Pré-Comptabilité FEC

---

## 1. FOCUS RÉFÉRENCE NATIONALE : KOLECTO (FINTECH CRÉDIT AGRICOLE & LCL - PDP 0039)

> **Document de référence exhaustif :** Voir [`KOLECTO_EXTRACTION_FONCTIONNALITES_DETAILLEES.md`](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/KOLECTO_EXTRACTION_FONCTIONNALITES_DETAILLEES.md) à la racine du projet.

### Piliers Techniques & Fonctionnels Extraits de Kolecto
1. **Gestion des Ventes & Facturation Clients :**
   * Création et personnalisation de devis, factures d'acompte (%), factures de situation / avancement (chantiers et projets au forfait), avoirs et factures d'abonnement récurrent.
   * Suivi en temps réel du cycle de vie documentaire (*Brouillon $\rightarrow$ Émise $\rightarrow$ Ouverte $\rightarrow$ Réglée $\rightarrow$ Litige*).
   * Liens de paiement intégrés sur la facture (Carte bancaire & virement instantané Open Banking).
   * Relances automatiques multi-niveaux programmables (J-3 préventif, J+7 amiable, J+15 ferme, J+30 mise en demeure avec pénalités de retard et 40 € d'indemnité forfaitaire de recouvrement).
2. **Gestion des Achats & Capture Multicanale :**
   * Boîte de dépôt email dédiée unique par entreprise (`achats-entreprise@...`).
   * Téléversement par glisser-déposer (Drag & drop) et scanner mobile intelligent (redressement et optimisation de contraste).
   * Connecteurs automatiques de portails marchands (EDF, Engie, Orange, Amazon, TotalEnergies, Uber, etc.).
   * Extraction OCR sans modèle fixe : fournisseur, SIREN/SIRET, numéro de facture, dates d'émission et d'échéance, ventilation multi-TVA et IBAN.
   * Détection anti-doublon en temps réel (même tiers, numéro ou montant).
   * Circuit d'approbation interne et double validation selon des seuils financiers.
3. **Réforme Fiscale 2026 & Conformité PDP :**
   * Immatriculation officielle DGFIP n° 0039 en tant que Plateforme de Dématérialisation Partenaire.
   * Formats mixtes et structurés : Factur-X (PDF/A-3 + XML), UBL 2.1, CII.
   * Routage automatique via l'annuaire central DGFIP vers le Portail Public de Facturation (PPF) et les PDP clientes.
   * Traitement des 4 statuts légaux obligatoires (*Déposée, Rejetée, Refusée, Encaissée*) et statuts métiers complémentaires.
   * Télédéclaration automatisée du **e-Reporting** (ventes B2C, transactions internationales hors UE et encaissements de TVA).
4. **Paiement Fournisseur en 3 Clics & Gestion Bancaire (Open Banking / DSP2) :**
   * Agrégation multi-comptes de plus de 300 banques françaises et européennes.
   * **Initiation de virement SEPA en 3 clics** sans jamais ressaisir de RIB sur le portail bancaire et sans quitter la plateforme.
   * Paiements groupés (Batch SEPA) et planification des virements à la date d'échéance pour optimiser la trésorerie.
   * Rapprochement bancaire automatique à 95 % par corrélation multicritère (montant au centime, tiers, libellé, date).
5. **Bouclier Anti-Fraude & Sécurité Interne :**
   * **Détection de la fraude au faux RIB :** Contrôle croisé de l'IBAN figurant sur la facture face à l'historique légitime et aux listes de comptes suspects.
   * Alerte rouge immédiate en cas de changement inattendu de coordonnées bancaires chez un fournisseur habituel.
   * Piste d'Audit Fiable (PAF) avec horodatage certifié et archivage probant légal 10 ans.
6. **Pré-Comptabilité & Export FEC :**
   * Auto-affectation dans le Plan Comptable Général (comptes 60/61/62, 70, 401, 411, 44566, 44571).
   * Tableau de bord dynamique de TVA (collectée vs déductible, solde net à payer).
   * Génération conforme du **FEC officiel** (Fichier des Écritures Comptables).
   * Exports natifs compatibles avec Cegid, Sage, Pennylane, ACD, Agiris, Ibiza et MyUnisoft avec pièces justificatives renommées.

---

## 2. APPLICATION 4 : ASSISTANT DEVIS UNIVERSEL B2B, VENTES & FACTURATION CLIENTS IA
*(Prestations de Services, Conseil & TJM, Vente de Marchandises, BTP & Artisans, Abonnements & Maintenance)*

### A. Les 10 Meilleurs Acteurs Mondiaux & Français du Marché

| # | Solution | Lien Officiel | Métiers & Fonctionnalités Clés du Marché |
|---|:---|:---|:---|
| **1** | **Kolecto** | [kolecto.fr](https://www.kolecto.fr) | **TPE / PME tous secteurs (PDP 0039).** Facturation complète, factures d'acompte (%), situation de travaux, abonnements récurrents, paiement en ligne intégré et conformité Factur-X 2026. |
| **2** | **PandaDoc** | [pandadoc.com](https://www.pandadoc.com) | **Tous secteurs.** Leader mondial des devis et propositions interactives. Tableaux de prix configurables, options cochables par le client, signature certifiée eIDAS et paiement d'acompte en ligne. |
| **3** | **Sellsy** | [sellsy.com](https://www.sellsy.com) | **PME / TPE tous métiers.** Leader français de la gestion commerciale. Catalogues d'articles et services, gestion des TJM, forfaits récurrents, marges commerciales et transformation de devis en facture en 1 clic. |
| **4** | **Axonaut** | [axonaut.com](https://axonaut.com) | **Indépendants, Artisans & PME.** Logiciel français tout-en-un le plus utilisé : devis personnalisés, envoi par email avec tracking d'ouverture, signature électronique et rapprochement bancaire. |
| **5** | **Pennylane Devis** | [pennylane.com](https://www.pennylane.com) | **Entreprises & Dirigeants français.** Module devis connecté au compte pro : suivi de la rentabilité client, acomptes automatisés et transition fluide devis ➔ facture ➔ comptabilité. |
| **6** | **Qwilr** | [qwilr.com](https://qwilr.com) | **Agences, Conseil & Tech.** Remplacement des PDF par des pages web de devis interactives haut de gamme, sélection d'options dynamiques par l'acheteur et intégration CRM. |
| **7** | **Proposify** | [proposify.com](https://www.proposify.com) | **Sociétés de services & Grands Comptes.** Gestion de propositions commerciales complexes avec contrôle des remises par les managers et analytics de lecture page par page. |
| **8** | **HubSpot CPQ / Quotes** | [hubspot.fr/products/sales](https://www.hubspot.fr/products/sales) | **B2B & Vente complexe.** Devis personnalisés générés depuis les opportunités CRM avec devises multiples, remises automatiques et lien de paiement Stripe immédiat. |
| **9** | **Bonsai (HelloBonsai)** | [hellobonsai.com](https://www.hellobonsai.com) | **Consultants, Agences & Freelances.** Référence internationale des devis de prestations intellectuelles (TJM, forfaits avec jalons de livraison, contrats de prestation intégrés et acomptes). |
| **10** | **Obat / Batichiffrage** | [obat.fr](https://www.obat.fr) | **BTP & Artisans du bâtiment.** Bibliothèque d'ouvrages BTP, calcul des déboursés secs, factures de situation et attestation de TVA rénovation à 10%. |

### B. Ce que le marché a et que notre application n'a pas encore (Gap Analysis)
1. **La déclinaison complète du cycle commercial :** Devis ➔ Facture d'acompte (30%/40%) ➔ Factures de situation / avancement ➔ Facture de solde ➔ Avoirs / Notes de crédit.
2. **La gestion native des factures récurrentes :** Émission automatique selon une fréquence hebdomadaire, mensuelle ou annuelle.
3. **Le sélecteur de typologie d'activité (Multi-Métiers universel) :**
   * *Prestation de Services & Conseil :* Facturation en TJM (jours), taux horaire, forfaits ou régie.
   * *Vente de Marchandises & Négoce :* Références produits, remises quantitatives, frais de port et conditions de livraison.
   * *BTP & Rénovation :* Lots, matériaux, main-d'œuvre et TVA réduite.
   * *Maintenance & Abonnements :* Récurrence mensuelle/annuelle et engagement.
4. **La gestion de toutes les mentions fiscales légales françaises :**
   * Régime standard TVA 20%.
   * Régimes réduits 10% / 5.5% (Travaux & Restauration).
   * Mention obligatoire micro-entreprises : *"TVA non applicable, art. 293 B du CGI"*.
   * Mention autoliquidation sous-traitance BTP : *"Autoliquidation de la TVA, art. 283-2 nonies du CGI"*.
   * Prestations B2B intracommunautaires : *"Exonération de TVA, art. 259-1 du CGI"*.
5. **Le devis web interactif pour le client final :** Permettre au client de cocher/décocher des prestations optionnelles directement en ligne avec signature tactile certifiée.
6. **Lien de paiement en ligne sur le devis/facture :** Encaissement immédiat par CB ou virement Open Banking.

### C. Comment SURPASSER le marché (Killer Features universelles MDIV)
1. **Le "Chiffreur Universel IA Textuel ou Vocal" :** Quel que soit le métier, l'utilisateur tape ou dicte son besoin :
   * *Exemple Conseil :* "Accompagnement stratégie IA pour 12 jours à 950€/jour avec atelier de cadrage inclus."
   * *Exemple Vente :* "10 postes de travail HP avec écrans 27 pouces et installation sur site, remise 5% si paiement comptant."
   * *Exemple Artisan :* "Pose de 30m² de carrelage avec dépose et plinthes."
   * ➔ L'IA structure automatiquement les colonnes, les unités adéquates et calcule les totaux en 3 secondes.
2. **Double Agent IA : Estimateur + Contrôleur de Rentabilité :**
   * *Agent 1 (Chiffreur Métier)* : Rédige des désignations commerciales élégantes et valorisantes.
   * *Agent 2 (Contrôleur Financier)* : Évalue le ratio TJM / marge nette et alerte si le prix proposé est sous-évalué par rapport aux standards du marché.
3. **Moteur Factur-X & 2026 Ready :** Génération native en un clic du PDF/A-3 intégrant le flux XML normalisé Factur-X pour être 100% prêt pour la réforme fiscale.

---

## 3. APPLICATION 5 : VÉRIFICATEUR FACTURES, NOTES DE FRAIS, ACHATS & OCR VISION
*(Inspiré de Kolecto, Dext, Pennylane & Spendesk)*

### A. Les 10 Meilleurs Acteurs Mondiaux & Français du Marché

| # | Solution | Lien Officiel | Fonctionnalités Clés du Marché |
|---|:---|:---|:---|
| **1** | **Kolecto** | [kolecto.fr](https://www.kolecto.fr) | **France (PDP 0039).** Collecte multicanale (boîte mail dédiée, scan mobile, connecteurs marchands EDF/Orange/Amazon), OCR intelligent, détection fraude faux RIB, paiement virement en 3 clics et rapprochement bancaire. |
| **2** | **Pennylane** | [pennylane.com](https://www.pennylane.com) | Licorne française. Rapprochement bancaire temps réel, reconnaissance OCR des factures, pré-comptabilisation automatique dans le plan comptable général, gestion des paiements fournisseurs. |
| **3** | **Dext (ancien Receipt Bank)** | [dext.com](https://dext.com/fr) | Leader mondial de la saisie comptable. Extraction OCR à 99% de précision sur tickets, reçus et factures d'achat, détection des doublons, synchronisation avec tous les logiciels comptables. |
| **4** | **Spendesk** | [spendesk.com](https://www.spendesk.com/fr) | Gestion des dépenses d'entreprise. Cartes bancaires physiques/virtuelles avec plafonds, scan mobile de reçu avec association instantanée à la transaction bancaire. |
| **5** | **Tiime** | [tiime.fr](https://www.tiime.fr) | Solution préférée des experts-comptables français. Récupération automatique des factures sur les espaces clients (EDF, Total, Orange, Amazon), détection TVA déductible vs non-déductible. |
| **6** | **Pleo** | [pleo.io](https://www.pleo.io/fr) | Gestion des frais professionnels avec IA prédictive des catégories comptables, détection des anomalies de TVA et politique de remboursement kilométrique/barème fiscal. |
| **7** | **Klippa (DocHorizon)** | [klippa.com](https://www.klippa.com/fr) | Moteur d'OCR propriétaire basé sur l'IA pour documents financiers : masquage RGPD automatique des données sensibles, vérification de validité de TVA intra-communautaire (VIES). |
| **8** | **Rossum.ai** | [rossum.ai](https://rossum.ai) | Plateforme IA de traitement documentaire transactional. Apprentissage continu sans template fixe, validation des bons de commande vs factures (3-way matching). |
| **9** | **Expensify** | [expensify.com](https://use.expensify.com) | Leader mondial des notes de frais. Fonction "SmartScan", conversion automatique des devises pour les voyages internationaux, validation hiérarchique des managers. |
| **10** | **DocuWare** | [docuware.com](https://start.docuware.com/fr) | Gestion électronique de documents (GED) et workflows de validation comptable avec indexation automatique par IA et archivage à valeur probante (norme NF Z42-013). |

### B. Ce que le marché a et que notre application n'a pas encore (Gap Analysis)
1. **La boîte email de collecte d'achats dédiée :** Adresse personnalisée (`achats-monentreprise@...`) permettant aux fournisseurs d'envoyer directement leurs factures.
2. **Le bouclier anti-fraude au faux RIB (modèle Kolecto) :** Détection automatique des changements d'IBAN par rapport à l'historique fournisseur avec alerte immédiate.
3. **La détection des doublons comptables :** Vérification immédiate du triplet (Fournisseur, Numéro de facture, Montant TTC).
4. **Le circuit d'approbation des dépenses :** Validation hiérarchique avec seuils budgétaires avant mise en paiement.
5. **Le paiement fournisseur direct par virement SEPA en 3 clics (Open Banking) :** Émission du virement sans ressaisie manuelle sur le site de la banque.
6. **La pré-comptabilisation PCG & export FEC :** Affectation automatique des comptes 60/61/62 et export Fichier des Écritures Comptables.

### C. Comment SURPASSER le marché (Killer Features uniques pour MDIV)
1. **L'Agent « Bouclier Fiscal & Contrôle Faux RIB IA » :**
   * *Anti-Fraude IBAN :* Analyse les coordonnées bancaires, détecte les anomalies géographiques ou les modifications de RIB suspectes.
   * *Conformité URSSAF :* Vérifie les justificatifs (convives sur notes de restaurant, déductibilité carburant selon motorisation).
2. **Détection de Falsification Graphique par Vision IA :** Analyse des artefacts d'édition numérique ou de pixels retouchés sur les factures PDF ou reçus douteux.
3. **Paiement Fournisseur Intégré & Rapprochement Automatique :** Pré-remplissage de l'ordre de virement SEPA avec réconciliation automatique sur le relevé bancaire à réception du débit.

---

## 4. APPLICATION 8 : ASSISTANT RELANCES MULTI-NIVEAUX IA & TRÉSORERIE
*(Inspiré d'Upflow, Kolecto, Clearnox & Chaser)*

### A. Les 10 Meilleurs Acteurs Mondiaux & Français du Marché

| # | Solution | Lien Officiel | Fonctionnalités Clés du Marché |
|---|:---|:---|:---|
| **1** | **Upflow** | [upflow.io](https://upflow.io) | La référence des SaaS B2B. Workflows de relance multi-scénarios (selon le montant et le risque client), portail de paiement client dédié, réduction de 50% du DSO (délai moyen de paiement). |
| **2** | **Kolecto** | [kolecto.fr](https://www.kolecto.fr) | **France (Crédit Agricole / LCL).** Relances automatiques personnalisables, bouton de paiement en ligne intégré, rapprochement bancaire direct lors de l'encaissement et suivi des statuts en temps réel. |
| **3** | **Clearnox** | [clearnox.com](https://www.clearnox.com) | Leader français chez les PME/ETI. Suivi visuel des encours clients, balance âgée dynamique, segmentation des payeurs (Bons, Moyens, Mauvais payeurs). |
| **4** | **Chaser** | [chaserhq.com](https://www.chaserhq.com) | Optimisation IA du meilleur moment d'envoi (jour et heure) par client, relance multi-canale (Email + SMS personnalisés + Courrier postal automatisé). |
| **5** | **Kolleno** | [kolleno.com](https://www.kolleno.com) | Plateforme "Order-to-Cash" avec agent IA qui analyse les réponses des clients aux relances (ex: "Je paierai le 15") pour reprogrammer automatiquement la relance suivante. |
| **6** | **LeanPay** | [leanpay.fr](https://www.leanpay.fr) | Solution française pour PME. Relance collaborative (impliquant les commerciaux dans le recouvrement), bouton de paiement instantané par virement open-banking. |
| **7** | **Gaviti** | [gaviti.com](https://gaviti.com) | Automatisation complète des comptes clients avec calcul des scores de crédit client et alertes précoces sur les dégradations de paiement. |
| **8** | **Dunforce** | [dunforce.com](https://www.dunforce.com) | "Agent IA de recouvrement" qui adapte le ton émotionnel du message en fonction du passif du client pour préserver la relation commerciale. |
| **9** | **YayPay (Quadient)** | [yaypay.com](https://www.yaypay.com) | Analyse prédictive du comportement de paiement grâce au machine learning (prévision de trésorerie à 30/60/90 jours). |
| **10** | **Altares / Dun & Bradstreet** | [altares.com](https://www.altares.com/fr) | Intégration directe du score financier et de défaillance des entreprises débitrices pour adapter la relance avant même l'échéance. |

### B. Ce que le marché a et que notre application n'a pas encore (Gap Analysis)
1. **Balance Âgée et calcul du DSO (Days Sales Outstanding) :** Suivi visuel des tranches de retard (0-30j, 31-60j, 61-90j, +90j).
2. **Paiement intégré dans l'email de relance :** Bouton permettant un règlement direct par CB / Virement Open Banking (Pay by Bank).
3. **Tracking d'ouverture et de lecture :** Horodatage de consultation des relances.
4. **Relance multicanale (SMS + Courrier recommandé électronique LRE) :** Preuve juridique d'envoi.
5. **Gestionnaire de contestations / litiges :** Mise en pause temporaire de la relance en cas de désaccord commercial justifié.

### C. Comment SURPASSER le marché (Killer Features uniques pour MDIV)
1. **L'Agent Négociateur d'Échéancier IA :** Proposition immédiate d'un protocole d'accord transactionnel échelonné (ex: 3 fois sans frais) directement dans la relance.
2. **Indicateur de Risque d'Impayé Définitif :** Score d'alerte prédictif sur la dégradation de solvabilité.
3. **Génération automatique de la Requête en Injonction de Payer (Cerfa 12947\*01) :** Dossier de saisine du greffe du tribunal prêt en 1 clic au palier 4 (avec calcul automatique des pénalités de retard légales et de l'indemnité forfaitaire de 40 €).

---

## 5. MASTER PROMPT D'INTÉGRATION DU PÔLE 1 (AVEC LE MODÈLE KOLECTO)

```markdown
Tu es un Architecte Logiciel Principal et Lead Développeur Full-Stack spécialisé en applications SaaS FinTech, Facturation B2B universelle, Plateformes de Dématérialisation Partenaires (PDP / Factur-X) et IA multimodale.

Tu interviens sur notre application MDIV Business (React/TypeScript, Tailwind CSS prestige sombre & or #121624/#d4af37, backend Node/PHP, MySQL multi-tenant).
IMPORTANT : NE CASSE RIEN DE L'EXISTANT, conserve rigoureusement le design system actuel et l'isolation multi-tenant par company_id.

OBJECTIF : Intégrer les fonctionnalités supérieures de Kolecto (PDP 0039, Factur-X, anti-fraude IBAN, paiements SEPA 3 clics, pré-comptabilité FEC) et des meilleurs leaders mondiaux sur nos 3 applications du PÔLE FINANCIER (Devis & Ventes, Achats & Factures OCR, Relances & Trésorerie).

=============================================================================================
1. APPLICATION 4 : ASSISTANT DEVIS & VENTES UNIVERSEL TOUTES ENTREPRISES (ServicesIAQuote.tsx)
=============================================================================================
L'application doit servir à N'IMPORTE QUELLE entreprise (Services/Conseil, Vente/Commerce, BTP, Abonnements) et intégrer le modèle de facturation Kolecto :
1. Sélecteur de Typologie d'Activité (Multi-Métiers) :
   - Ajouter des boutons radio / onglets en haut de formulaire :
     * "Prestations de Services & Conseil" (Unités par défaut : TJM / Jours, Heures, Forfait).
     * "Vente de Marchandises & Matériel" (Unités : Quantité, Références, Frais de port, Remise volume).
     * "BTP, Artisans & Travaux" (Unités : m², ml, forfaits, main-d'œuvre, matériaux).
     * "Abonnements & Maintenance" (Unités : Mensualités récurrentes, durée d'engagement).
2. Cycle de Vente Complet (Devis ➔ Acomptes ➔ Situations ➔ Facture de solde ➔ Avoirs) :
   - Possibilité de générer en 1 clic une "Facture d'acompte" (ex: 30% ou 40% du devis validé).
   - Support des factures de situation / avancement avec pourcentage par lot.
   - Mention d'abonnement / récurrence automatique.
3. Adaptateur Automatique des Régimes Fiscaux & TVA :
   - Selon l'entreprise et la sélection :
     * Régime Standard 20%.
     * Régimes Rénovation 10% et 5.5% (avec attestation simplifiée Cerfa).
     * Micro-entreprise / Auto-entrepreneur : case à cocher "Franchise en base de TVA" appliquant automatiquement la mention "TVA non applicable, art. 293 B du CGI".
     * Sous-traitance BTP : mention "Autoliquidation de la TVA, art. 283-2 nonies du CGI".
     * Client B2B Européen : mention "Exonération de TVA, art. 259-1 du CGI".
4. Calculateur de Rentabilité & Marge Universel :
   - En Prestation/Conseil : affiche le Taux Journalier Moyen (TJM net) et le coût de revient estimé.
   - En Vente : affiche la marge commerciale brute (€ et %).
   - En Travaux/Artisanat : affiche le déboursé sec (fournitures + main-d'œuvre) et la marge nette.
   - Alerte de l'Agent Contrôleur Financier si la rentabilité prévisionnelle est anormalement basse.
5. Devis Interactif Web Client & Paiement Intégré :
   - Bouton "Aperçu Devis Interactif" permettant au client de sélectionner des options facultatives recalculant le total TTC en temps réel avec zone de signature tactile (Canvas) certifiée.
   - Bouton de paiement en ligne (acompte par CB ou virement Open Banking).
6. Export Hybride Factur-X (Réforme 2026) :
   - Bouton d'export générant les métadonnées normalisées Factur-X prêtes pour le raccordement PDP / PPF.

=============================================================================================
2. APPLICATION 5 : FACTURES, NOTES DE FRAIS, ACHATS & OCR (ServicesIAInvoice.tsx)
=============================================================================================
Intégrer les mécanismes de sécurité et de gestion des achats de Kolecto :
1. Moteur Anti-Fraude au Faux RIB & Détection Doublons :
   - Lors du scan ou de l'import d'une facture fournisseur :
     * Extraire l'IBAN et le comparer aux coordonnées bancaires déjà enregistrées pour ce fournisseur.
     * Si l'IBAN est nouveau ou modifié : afficher un badge rouge d'alerte critique « ATTENTION : Changement de RIB détecté - Risque d'usurpation / faux RIB ».
     * Comparer le triplet (Marchand, Date, Montant TTC) pour bloquer les doublons de facturation.
2. Agent "Bouclier Fiscal & Risques URSSAF" :
   - Analyser automatiquement les justificatifs :
     * Reçu de restaurant : champ obligatoire "Nom des convives / Invités d'affaires" pour conformité URSSAF.
     * Carburant : détection du type de carburant et calcul automatique de la TVA récupérable (ex: 80% gazole vs 0-80% essence).
3. Ventilation Multi-TVA & Catégorisation PCG :
   - Décomposition automatique en plusieurs lignes de TVA (ex: matériel à 20% et main-d'œuvre à 10%).
   - Pré-affectation automatique du compte de charge (PCG 60/61/62).
4. Workflow de Paiement Fournisseur en 3 Clics (Simulateur Open Banking) :
   - Bouton d'action « Régler cette facture par virement SEPA » pré-remplissant l'ordre de virement avec l'IBAN certifié et la référence de facture.
5. Export Écritures Comptables & FEC :
   - Bouton d'export FEC conforme à l'article L. 47 A I du LPF et compatible Cegid/Sage/Pennylane.

=============================================================================================
3. APPLICATION 8 : ASSISTANT RELANCES IMPAYÉS & TRÉSORERIE (ServicesIAFollowup.tsx)
=============================================================================================
Intégrer les fonctionnalités supérieures de gestion du DSO et encaissements Kolecto / Upflow :
1. Dashboard Balance Âgée & DSO :
   - En haut de page, intégrer un mini-dashboard des créances :
     * Total impayé échus (€).
     * DSO estimé (Délai moyen de paiement en jours).
     * Répartition graphique par tranches : [0-30j], [31-60j], [61-90j], [+90j].
2. Négociateur d'Échéancier IA :
   - Bouton "Proposer un Échéancier" permettant de générer automatiquement un protocole de paiement échelonné (ex: 3 fois sans frais) inséré directement dans le texte du mail de relance.
3. Bouton "Payer en 1 clic" :
   - Dans le template d'email généré, intégrer un composant visuel de paiement cliquable « Régler ma facture en ligne (CB / Virement sécurisé) ».
4. Génération de Requête en Injonction de Payer :
   - Au niveau 4 (Mise en demeure), ajouter un bouton "Générer dossier d'Injonction de Payer (Cerfa)" qui pré-remplit les éléments probants (montant principal, intérêts légaux calculés, indemnité forfaitaire légale de 40 €).

Conserve une compilation 100% propre (npm run build avec 0 erreur).
```
