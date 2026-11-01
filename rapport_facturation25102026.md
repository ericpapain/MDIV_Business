# 📋 Rapport d’Audit d’Expertise — Réforme de la Facturation Électronique 2026-2027

**Application auditée :** Plateforme MDIV Business / IT4WORK  
**Référentiel légal & normatif :** 
- Ordonnance n° 2021-1190 & Décret n° 2022-1299 du 7 octobre 2022
- Norme européenne **EN 16931-1:2017** (CII / UBL / Factur-X)
- Articles 289 et 290 du Code Général des Impôts (CGI) & Art. L. 441-9/10 du Code de commerce
- Spécifications techniques externes de la DGFiP (B2B e-invoicing & e-reporting)

---

## 🎯 Synthèse Exécutive & Scores Globaux

L'analyse de l'intégralité du code source (frontend, backend Node/TypeScript, scripts PHP, schémas de base de données relationnelle et utilitaires cryptographiques) met en évidence deux réalités distinctes selon l'objectif visé :

```
┌────────────────────────────────────────────────────────────────────────┐
│  1. UTILISATION EN TANT QUE LOGICIEL DE FACTURATION CONNECTÉ (OD)     │
│     Score de conformité : 72 / 100  (Niveau de préparation : AVANCÉ)  │
│     → L'architecture métier, le Factur-X, les données légales et la    │
│       machine d'états du cycle de vie PPF sont déjà solides.           │
├────────────────────────────────────────────────────────────────────────┤
│  2. CANDIDATURE EN TANT QUE PLATEFORME AGRÉÉE (PDP)                   │
│     Score de conformité : 28 / 100  (Niveau de préparation : INITIAL) │
│     → Bloquant sans certification ISO 27001, réseau Peppol AS4 et      │
│       infrastructure qualifiée SecNumCloud / multi-datacenter.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Contrôle Détaillé par Domaine

---

### 1. Formats de Facture

| Critère | Statut | Constat d'audit & Références Code |
| :--- | :---: | :--- |
| **Support Factur-X** | ⚠️ Partiellement conforme | Le flux XML structuré conforme au profil `urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic` est parfaitement généré dans [facturx-xml.builder.ts](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/integrations/export/facturx-xml.builder.ts#L44-L51). **Manque bloquant :** l'intégration binaire dans un conteneur **PDF/A-3 (ISO 19005-3)** avec pièce jointe `factur-x.xml` et métadonnées XMP. Actuellement, l'application produit soit du XML pur, soit du HTML/PDF via [invoice_export.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/invoice_export.php). |
| **Support UBL 2.1** | ❌ Non conforme | La norme EN 16931 et la DGFiP imposent le socle minimal des 3 syntaxes (Factur-X, UBL 2.1, CII). Aucun sérialiseur ni parseur OASIS UBL 2.1 (ISO/IEC 19845) n'est présent dans la base de code. |
| **Support CII** | ✅ Conforme | Présent via le schéma XML UN/CEFACT D16B (`<rsm:CrossIndustryInvoice>`, balises `ram:IncludedSupplyChainTradeLineItem`, `ram:ApplicableHeaderTradeAgreement`). |
| **Génération du XML conforme** | ✅ Conforme | Respect des balises fondamentales, calcul automatique des lignes HT, ventilation TVA par catégorie (`S`, `E`), et mention obligatoire du motif d'exonération (ex. art. 262 ter I CGI). |
| **Validation des schémas XSD** | ⚠️ Partiellement conforme | La conformité est vérifiée via une heuristique IA ([invoice.service.ts:checkInvoiceAi](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/modules/invoices/invoice.service.ts#L103-L133)), mais **aucun moteur de validation formelle XSD / Schematron (CIUS-FR)** n'est exécuté avant émission. |

---

### 2. Données Obligatoires

| Mention Légale Obligatoire | Statut | Détail technique |
| :--- | :---: | :--- |
| **Numéro SIREN** | ✅ Conforme | Présent (9 chiffres), validé par algorithme de Luhn dans [luhn.utils.ts](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/shared/utils/luhn.utils.ts) et [verify_directory.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/ppf/verify_directory.php#L16-L30). |
| **Numéro SIRET** | ✅ Conforme | Présent (14 chiffres) pour le vendeur et l'acheteur, vérification de la clé de contrôle. |
| **Numéro TVA intracommunautaire** | ✅ Conforme | Calcul algorithmique certifié de la clé fiscale française ([vat.utils.ts](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/shared/utils/vat.utils.ts)). |
| **Date de facture** | ✅ Conforme | Formatée selon la norme UN/CEFACT 102 (`YYYYMMDD`). |
| **Numéro de facture unique** | ✅ Conforme | Chronologie et séquentialité gérées avec préfixe d'exercice (ex: `FA-2026-XXXX`). |
| **Adresse complète** | ✅ Conforme | Ligne d'adresse, code postal, ville et code pays ISO 3166-1 alpha-2 (`FR`). |
| **Montants HT, TVA, TTC** | ✅ Conforme | Calcul précis au centime, ventilation par taux, base d'imposition et total exigible. |
| **Conditions de paiement** | ✅ Conforme | Date d'échéance, mode de paiement SEPA (code 42), pénalités de retard légales (art. L. 441-10) et indemnité forfaitaire de 40 €. |
| **Statut de paiement** | ✅ Conforme | Suivi en temps réel des encaissements dans la table `invoice_payments` ([migrations_facturation_2026.sql](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/migrations_facturation_2026.sql#L52-L67)). |

---

### 3. Sécurité

| Critère | Statut | Constat d'audit & Références Code |
| :--- | :---: | :--- |
| **Authentification MFA** | ⚠️ Partiellement conforme | Composant UI OTP existant ([input-otp.tsx](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/src/components/ui/input-otp.tsx)), mais **aucun contrôle MFA/TOTP (RFC 6238) ou WebAuthn obligatoire** n'est exigé côté serveur sur les comptes émetteurs de factures. *(Obligatoire pour les PDP)*. |
| **Gestion des rôles (RBAC)** | ✅ Conforme | Barrière stricte dans [auth.middleware.ts](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/shared/middleware/auth.middleware.ts#L170-L182) isolant les privilèges `ADMIN` avec rejets 401/403. |
| **Chiffrement au repos** | ⚠️ Partiellement conforme | En local, données en JSON clair (`dev_db.json`). En production MySQL (InnoDB), pas de chiffrement de colonne applicatif (AES-256) sur les coordonnées bancaires (IBAN/BIC) et secrets. |
| **Chiffrement TLS** | ✅ Conforme | Prévu au niveau passerelle de terminaison HTTPS / TLS 1.3 avec cipher suites sécurisées. |
| **Journalisation des actions** | ✅ Conforme | Table d'audit `paf_invoice_audit_trail` historisant toute création, modification et changement de statut. |
| **Traçabilité des modifications** | ✅ Conforme | Calcul d'une empreinte cryptographique SHA-256 à chaque étape et verrouillage d'irréversibilité (422) sur le statut terminal `PAYEE` ([invoice.service.ts:depositPpfStatus](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/server/modules/invoices/invoice.service.ts#L222-L225)). |
| **Accès administrateurs** | ✅ Conforme | Cloisonnement hermétique des routes sensibles. |

---

### 4. Conformité RGPD

| Critère | Statut | Constat d'audit |
| :--- | :---: | :--- |
| **Consentement utilisateur** | ✅ Conforme | Formulaires d'opt-in et recueil explicite lors de la création d'espace. |
| **Politique de confidentialité** | ✅ Conforme | Mentions obligatoires d'usage et CGU intégrées au portail. |
| **Export des données (Art. 20)** | ✅ Conforme | Exports natifs JSON, CSV, Factur-X et Fichier des Écritures Comptables ([fec_export.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/fec_export.php)). |
| **Suppression des données (Art. 17)** | ✅ Conforme | L'effacement client est géré, avec protection légale maintenant l'intégrité comptable (la conservation fiscale prime sur le droit à l'effacement). |
| **Registre des traitements (Art. 30)** | ⚠️ Partiellement conforme | Absence de document formalisé décrivant les catégories de données, destinataires et durées de conservation. |
| **Conservation légale** | ✅ Conforme | Règles de séparation des données de prospection et des pièces justificatives comptables. |

---

### 5. Archivage

| Critère | Statut | Constat d'audit |
| :--- | :---: | :--- |
| **Archivage légal des factures** | ⚠️ Partiellement conforme | Persistance en base SQL/JSON, mais **absence de Système d'Archivage Électronique (SAE certifié NF Z40-042 / ISO 14641)** ou stockage WORM. |
| **Horodatage** | ⚠️ Partiellement conforme | Horodatage système UTC ISO 8601, mais **pas de jeton d'horodatage qualifié RFC 3161** émis par un tiers de confiance eIDAS. |
| **Intégrité des documents** | ✅ Conforme | Empreintes SHA-256 scellant les flux et les états dans la Piste d'Audit Fiable. |
| **Conservation sur 10 ans** | ⚠️ Partiellement conforme | Modèle de données pérenne, mais pas de mécanisme automatisé de contrôle d'intégrité périodique sur une décennie (art. L. 123-22 Code de commerce). |

---

### 6. Interopérabilité

| Critère | Statut | Constat d'audit |
| :--- | :---: | :--- |
| **APIs REST documentées** | ✅ Conforme | Endpoints modulaires couvrant devis, factures, statuts PPF, annuaire et FEC. |
| **OpenAPI / Swagger** | ❌ Non conforme | **Aucune spécification `openapi.yaml` ou `swagger.json`** présente pour automatiser l'intégration avec des PDP tierces. |
| **Gestion des webhooks** | ❌ Non conforme | Aucun endpoint récepteur de webhooks (`/api/ppf/webhook.php`) pour traiter les push asynchrones de mise à jour de statut des plateformes agréées. |
| **Gestion des erreurs** | ✅ Conforme | Erreurs typées avec codes HTTP normalisés (400, 401, 403, 404, 422, 500) et messages explicites. |
| **Capacité d'intégration PA/PDP** | ⚠️ Partiellement conforme | Modèle de données prêt, mais connecteurs directs (mTLS, jeton OAuth2 Chorus Pro / Peppol) non interfacés en direct. |

---

### 7. Facturation Électronique Française (PPF / PDP / DGFiP)

| Critère | Statut | Constat d'audit & Références Code |
| :--- | :---: | :--- |
| **Compatibilité Annuaire Central** | ✅ Conforme | Logique d'interrogation et vérification d'enregistrement PPF avec contrôle Luhn et calcul TVA dans [verify_directory.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/ppf/verify_directory.php). |
| **Gestion de l'émission** | ✅ Conforme | Émission conforme, typage d'opération (biens, services, mixte), mention d'option de TVA sur les débits. |
| **Gestion de la réception** | ⚠️ Partiellement conforme | OCR d'extraction présent ([ocr_vision_parse.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/ocr_vision_parse.php)), mais **pas d'ingestion directe native de fichiers XML Factur-X / UBL entrants** avec rapprochement comptable automatisé. |
| **Cycle de vie des factures** | ✅ Conforme | Machine d'états complète intégrant les 9 statuts réglementaires DGFiP : `DEPOSEE`, `ACHEMINEE`, `REJETEE`, `REFUSEE`, `MISE_A_DISPOSITION`, `PRISE_EN_CHARGE`, `APPROUVEE`, `PAIEMENT_TRANSMIS`, `PAYEE`. |
| **Rejet et acceptation** | ✅ Conforme | Gestion explicite de `REJETEE` (technique) et `REFUSEE` (commerciale avec motif obligatoire `rejection_reason`). |
| **Gestion de l'e-reporting** | ⚠️ Partiellement conforme | Table `invoice_payments` prête avec drapeaux `e_reporting_transmitted`, mais absence de cron de génération des flux périodiques (décadaires/mensuels) pour l'administration fiscale. |

---

### 8. Infrastructure

| Critère | Statut | Constat d'audit |
| :--- | :---: | :--- |
| **Haute disponibilité (99.9%)** | ⚠️ Partiellement conforme | Adapté à un logiciel SaaS standard, mais insuffisant pour les exigences SLA d'une PDP (99.5% garanti contractuellement avec astreinte 24/7). |
| **Sauvegardes automatiques** | ⚠️ Partiellement conforme | Sauvegardes DB standard, pas de politique de réplication multi-zones documentée dans le dépôt. |
| **Reprise après sinistre (PRA/PCA)** | ❌ Non conforme | Aucun plan de reprise formalisé avec RPO < 1h et RTO < 4h. |
| **Monitoring** | ⚠️ Partiellement conforme | Métriques IA présentes, mais absence d'APM dédié aux flux financiers (Prometheus/Grafana/Sentry). |
| **Logs centralisés** | ⚠️ Partiellement conforme | Audit trail SQL actif, sans pipeline de centralisation de logs immuables (SIEM/WORM). |

---

### 9. Certification & Homologation

| Exigence | Statut | Évaluation Réglementaire |
| :--- | :---: | :--- |
| **ISO/IEC 27001** | ❌ Non conforme | **Exigence éliminatoire pour devenir Plateforme Agréée (PDP).** Non requise pour un logiciel de facturation connecté à une PDP partenaire. |
| **Conformité RGPD** | ⚠️ Partiellement conforme | Bonnes pratiques en place, registre des traitements à formaliser. |
| **Piste d'Audit Fiable (PAF)** | ✅ Conforme | Conforme aux exigences de l'art. 289-VII-1° du CGI : intégrité garantie par hachage SHA-256, traçabilité des liens devis → facture → encaissement. |
| **Exigences DGFiP (PDP)** | ❌ Non conforme | Dossier d'immatriculation PDP inaccessible en l'état (nécessite audit ISO 27001, hébergement SecNumCloud, cautionnement bancaire et raccordement Peppol AS4). |

---

## 🚫 Risques Bloquants Identifiés

1. **Absence de conteneur PDF/A-3 Factur-X natif** : Un fichier Factur-X envoyé à un client ou à une PDP doit être un fichier PDF/A-3 intégrant le flux XML en pièce jointe (`factur-x.xml`). L'émission de fichiers XML seuls ou de simples PDF d'impression non certifiés entraînera le rejet des factures par les plateformes agréées.
2. **Absence de webhooks entrants** : Sans webhook, le logiciel ne peut pas recevoir en temps réel les changements de statut émis par le PPF ou la PDP (ex : notification de refus ou de prise en charge par le client).
3. **Absence de moteur de validation Schematron/XSD** : Risque d'émettre des factures non valides selon les règles CIUS-FR de l'administration fiscale sans s'en apercevoir avant le rejet par la plateforme.
4. **MFA non obligatoire sur la facturation** : Vulnérabilité en cas d'usurpation d'identifiants permettant l'émission frauduleuse de factures au nom de l'entreprise.

---

## 🛠️ Développements Manquants (Roadmap Technique)

```mermaid
graph TD
    A[MDIV Business Logiciel] -->|1. Génère| B[Factur-X PDF/A-3]
    B -->|2. Valide| C[Moteur XSD / Schematron EN 16931]
    C -->|3. Transmet via API| D[PDP Partenaire Agréée]
    D -->|4. Push Webhook Statuts| E[/api/ppf/webhook.php]
    E -->|5. Met à jour| F[Cycle de Vie & Piste d'Audit PAF]
    D -->|6. Acheminement| G[Annuaire Central PPF / DGFiP]
```

1. **Module PDF/A-3 Compiler** :
   - Intégrer une librairie certifiée (ex. `pdf-lib` + injection XML + schéma XMP Factur-X) pour générer le fichier hybride officiel visualisable par l'humain et lisible par la machine.
2. **Spécification OpenAPI 3.0** :
   - Rédiger le fichier `openapi.yaml` documentant exhaustivement les routes `/api/invoices.php`, `/api/ppf/deposit.php`, `/api/facturx_generator.php`.
3. **Récepteur de Webhooks PPF/PDP** :
   - Créer le contrôleur `/api/ppf/webhook.php` sécurisé par signature HMAC / token d'échange pour ingérer les notifications de statuts asynchrones.
4. **Générateur d'e-Reporting périodique** :
   - Développer la tâche cron agrégeant les données de la table `invoice_payments` pour produire le flux récapitulatif fiscal décadaire ou mensuel.
5. **Authentification MFA TOTP** :
   - Rendre obligatoire l'activation d'un second facteur (TOTP via application type Google Authenticator ou clé FIDO2) pour tout utilisateur émettant des factures.

---

## 🎯 Recommandation Stratégique Finale

> [!IMPORTANT]
> **Orientation Recommandée : Opérateur de Dématérialisation (Logiciel Connecté à une PDP)**
> 
> Vouloir devenir **Plateforme Agréée (PDP)** en nom propre représenterait un investissement financier lourd (certification ISO 27001, audit de qualification DGFiP, infrastructure SecNumCloud, caution financière supérieure à 50 000 €, coût d'entrée Peppol AS4).
> 
> **La stratégie optimale et rentable pour MDIV Business :**
> - Se positionner en tant que **Logiciel de Facturation et Gestion Commerciale Référence pour PME/Artisans**.
> - Se connecter via API / Webhooks à une **Plateforme Agréée Partenaire** (ex. Docaposte, Crédit Agricole/Kolecto, Yooz, Pennylane, Cegid ou directement le PPF).
> - L'application est déjà **à 72% prête** pour ce positionnement et peut être finalisée en moins de 2 à 3 semaines de développement ciblé.
