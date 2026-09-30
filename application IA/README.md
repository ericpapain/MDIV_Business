# Écosystème des Applications IA — MDIV Business

Bienvenue dans le centre de documentation officiel de l'écosystème d'applications d'Intelligence Artificielle de **MDIV Business**.

Cette documentation présente de manière exhaustive, transparente et sans compromis l'ensemble des 13 applications et modules d'IA réellement développés, testés et déployés dans la plateforme.

---

## Index des Applications IA

| N° | Application | Description | Fonction principale | Technologie IA | Statut | Documentation |
|:---:|:---|:---|:---|:---|:---:|:---:|
| 1 | **Diagnostic IA Express** | Audit stratégique complet à 360° en 7 étapes | Évaluation de maturité, détection de risques et recommandations ROI | Groq Cloud (`qwen/qwen3.8-27b`) + Streaming SSE | Opérationnel | [Consulter](diagnostic-ia-express.md) |
| 2 | **Assistant Email IA** | Assistant de messagerie professionnelle avec OCR et M365 | Tri, priorisation, analyse de sentiment et rédaction de réponses | Groq Cloud (`qwen/qwen3.8-27b`) + OCR Tesseract.js | Opérationnel | [Consulter](assistant-email-ia.md) |
| 3 | **Assistant Devis IA** | Chiffrage commercial intelligent avec calculs automatiques | Décomposition des lignes de prestations, marges et export PDF | Groq Cloud (`qwen/qwen3.8-27b`) + Modélisation devis | Opérationnel | [Consulter](assistant-devis-ia.md) |
| 4 | **Vérificateur de Factures IA** | Audit de conformité fiscale et détection de fraudes | Contrôle des mentions obligatoires, calculs TVA et détection d'anomalies | Groq Cloud (`qwen/qwen3.8-27b`) + OCR mobile | Opérationnel | [Consulter](verificateur-factures-ia.md) |
| 5 | **Relances Intelligentes IA** | Recouvrement amiable et suivi des devis en souffrance | Détection des impayés, auto-calibrage de l'urgence et rédaction d'emails | Groq Cloud (`qwen/qwen3.8-27b`) + KPI CRM | Opérationnel | [Consulter](assistant-relances-ia.md) |
| 6 | **Résumeur de Documents IA** | Consortium multi-agents de synthèse décisionnelle | Extraction des risques, décisions et plans d'action sur documents denses | Multi-Agents Groq Qwen 3.8 + Streaming SSE + OCR | Opérationnel | [Consulter](resumeur-documents-ia.md) |
| 7 | **Générateur Comptes-Rendus IA** | Secrétariat de séance exécutif multi-agents | Transformation de notes brutes en procès-verbaux structurés avec plan RACI | Multi-Agents Groq Qwen 3.8 + Streaming SSE | Opérationnel | [Consulter](generateur-comptes-rendus-ia.md) |
| 8 | **Générateur de Contenu Multi-Canal** | Studio de copywriting B2B pour réseaux sociaux | Déclinaison simultanée sur LinkedIn, Twitter/X et Newsletter selon le ton de marque | Groq Cloud (`qwen/qwen3.8-27b`) + Multi-canal JSON | Opérationnel | [Consulter](generateur-contenu-ia.md) |
| 9 | **Prospection Email B2B IA** | Moteur d'outreach commercial haute précision | Rédaction de cold emails avec scoring d'impact et support multilingue (5 langues) | Groq Cloud (`qwen/qwen3.8-27b`) + Scoring prédictif | Opérationnel | [Consulter](prospection-email-b2b.md) |
| 10 | **Générateur de Leads B2B IA** | Sourcing d'entreprises cibles et qualification prédictive | Détection de prospects qualifiés, identification stack tech et probabilité d'achat | Groq Cloud (`qwen/qwen3.8-27b`) + Modélisation B2B | Opérationnel | [Consulter](generateur-leads-b2b.md) |
| 11 | **Calculateur de ROI IA** | Simulateur financier d'impact opérationnel | Modélisation des économies, ETP libérés et rentabilité à 12 mois | Moteur mathématique déterministe + Système expert | Opérationnel | [Consulter](calculateur-roi-ia.md) |
| 12 | **Benchmark Digital & IA** | Audit de maturité et positionnement sectoriel | Évaluation sur 6 piliers, Radar interactif, SWOT et feuille de route 6 mois | Moteur de pondération factorielle + Recharts | Opérationnel | [Consulter](benchmark-digital-ia.md) |
| 13 | **Préparation de Réunions IA** | Coach tactique et briefing avant-vente | Synthèse flash 1 min, anticipation des objections et questions percutantes | Groq Cloud (`qwen/qwen3.8-27b`) + Réconciliation SQL | Opérationnel | [Consulter](preparation-rdv-ia.md) |

---

# Vue d'ensemble des applications IA

L'écosystème IA de MDIV Business n'est pas une simple collection d'outils isolés : il forme une **chaîne de valeur commerciale et administrative continue** conçue pour accompagner une entreprise à chaque étape de son cycle d'affaires, de la prospection initiale à l'encaissement final.

```
                    ┌──────────────────────────────────────────────┐
                    │      STRATÉGIE & DÉCISION INITIALE           │
                    │  • Benchmark Digital & IA                    │
                    │  • Diagnostic IA Express                     │
                    │  • Calculateur de ROI IA                     │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      GÉNÉRATION DE DEMANDE & VISIBILITÉ      │
                    │  • Studio Contenu Multi-Canal (LinkedIn/News)│
                    │  • Générateur de Leads B2B                   │
                    │  • Prospection Email B2B (Cold Outreach)     │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      AVANT-VENTE & CONVERSION DU LEAD        │
                    │  • Préparation de Réunions IA (Briefing RDV) │
                    │  • Assistant Devis IA (Chiffrage rapide)     │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      EXÉCUTION & PILOTAGE DES AFFAIRES       │
                    │  • Assistant Email IA (Tri & Réponses M365)  │
                    │  • Résumeur de Documents IA (Contrats/Audits)│
                    │  • Comptes-Rendus de Réunion IA (Plan RACI)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │      FINANCE & SÉCURISATION DU CASH          │
                    │  • Vérificateur de Factures IA (Conformité)  │
                    │  • Relances Intelligentes IA (Recouvrement)  │
                    └──────────────────────────────────────────────┘
```

---

## Comment les applications communiquent et se complètent

### 1. Du Sourcing de Prospects au Premier Contact
Le **Générateur de Leads B2B IA** filtre et qualifie les entreprises cibles (taille, technologies utilisées, probabilité d'achat). Les cibles retenues sont directement injectées dans l'application **Prospection Email B2B IA**, qui rédige des messages d'approche personnalisés et adaptés au secteur d'activité, prêts à être expédiés.

### 2. Du Rendez-vous Commercial au Chiffrage du Projet
Avant d'entrer en rendez-vous, le commercial consulte la **Préparation de Réunions IA** pour mémoriser en 1 minute les objections probables et poser les bonnes questions de découverte. Une fois le besoin exprimé par le client, l'**Assistant Devis IA** convertit la demande informelle en une proposition tarifaire détaillée avec calculs automatiques des marges et génération de devis PDF officiel.

### 3. De la Négociation Contractuelle au Compte-Rendu de Réunion
Lors de la négociation d'un appel d'offres ou d'un contrat complexe, le **Résumeur de Documents IA** analyse les 50 pages du document pour isoler les clauses à risque. À la fin de la séance de travail, les notes prises sont transmises au **Générateur de Comptes-Rendus IA**, qui formalise le procès-verbal avec désignation des responsables et des dates limites pour chaque tâche.

### 4. De la Facturation à l'Encaissement Sécurisé
Une fois la prestation livrée, le **Vérificateur de Factures IA** contrôle la conformité des factures émises ou reçues (mentions légales, calculs de TVA, conformité anti-fraude). Si une facture dépasse sa date d'échéance, elle apparaît automatiquement dans le centre d'action des **Relances Intelligentes IA**, qui calibre le ton d'urgence adéquat et rédige l'email de recouvrement diplomatique permettant de débloquer le paiement sans dégrader la relation client.

---

## Socle Technologique Commun

Toutes les applications de l'écosystème partagent un socle d'infrastructure commun assurant rapidité, sécurité et étanchéité des données :

- **Moteur d'inférence LLM haute vitesse :** Groq Cloud API exploitant le modèle `qwen/qwen3.8-27b` sur processeurs LPU, garantissant des temps de réponse moyens compris entre 1,2 et 1,8 seconde.
- **Vision par ordinateur et OCR client :** Intégration de la bibliothèque Tesseract.js directement dans le navigateur pour l'extraction de texte à partir de documents physiques et de la caméra des smartphones, sans transit serveur inutile.
- **Streaming interactif Server-Sent Events (SSE) :** Restitution en direct des raisonnements multi-agents dans les modules décisionnels (Diagnostic, Résumeur, Comptes-Rendus).
- **Isolation Multi-Tenant :** Chaque requête API intègre le contexte entreprise (`company_id`), interdisant tout accès croisé aux devis, factures ou historiques entre différentes organisations clientes.
- **Exportations Bureautiques Standardisées :** Formats universels PDF haute résolution et documents Microsoft Word (.docx) prêts pour la diffusion managériale.
