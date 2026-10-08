# Ingénierie des Prompts et Architecture Multi-LLM (MDIV Business)

Ce document répertorie l'ensemble des modules d'Intelligence Artificielle intégrés dans l'application SaaS MDIV Business. Il détaille l'objectif de chaque application, la mécanique de construction du prompt et l'approche technique utilisée, avec un focus sur la **nouvelle architecture Multi-Modèles**.

### Tableau de Déploiement des Applications IA

| Nom de l'App IA | Explication (Utilité Globale) | Comment ça a été construit (Mécanique du Prompt & Guardrails) | Mode & Niveau d'Intelligence (Multi-LLM) | Modèles Sollicités (Orchestration) |
| :--- | :--- | :--- | :--- | :--- |
| **Générateur de Leads IA** | Recherche et qualifie des prospects B2B selon des critères précis (secteur, région). | **JSON Structuré + Guardrails.** *System Prompt* strict ("B2B prospecting engine") exigeant un format JSON défini. Post-traitement PHP obligeant l'IA à utiliser une requête de recherche Google sécurisée en cas de lien inventé, garantissant le "zéro erreur 404". | **Research (Fusion)** <br/>*Exécution de 3 modèles + Fusion de leurs réponses* | GPT-6 Astra, Mistral Large, Mixtral 8x7B |
| **Extracteur OCR (Achats)** | Lit les photos de tickets/factures pour en extraire montants et fournisseurs. | **Vision Multimodale + Redressement Math.** L'image Base64 est envoyée au modèle Vision. Le prompt impose le rôle d'expert-comptable. Le backend PHP prend le relai pour forcer mathématiquement `TTC = HT + TVA` afin de contrer toute hallucination de calcul. | **Expert (Challenge)** <br/>*Exécution de 3 modèles + Scoring (Meilleur retenu)* | GPT-6 Astra, GPT-4o-mini, Mistral Large |
| **Diagnostic Express** | Audit interactif produisant un rapport de stratégie avec un score sur 100. | **Architecture Multi-Agents.** Rôle dynamique selon la thématique (Analyste Financier, Stratège). Le prompt injecte tout l'historique pour le contexte. Une requête finale de synthèse produit le plan d'action JSON. | **Research (Fusion)** <br/>*Génération d'insights croisés* | GPT-6.1 Sol, Llama 3 70B, Mistral Large |
| **Générateur de Devis** | Rédige un "Executive Summary" argumentatif à intégrer en haut du devis. | **Enrichissement de Contexte.** Le prompt reçoit le brouillon du devis (articles, prix) et rédige un texte convaincant, avec interdiction d'inventer de nouveaux produits non listés. | **Advanced (Single/Challenge)** <br/>*Exécution de 2 modèles* | GPT-6.1 Sol, Mistral Large |
| **Relances (Impayés)** | Rédige des emails de relance sur-mesure pour les factures échues. | **Prompt Contextuel & Tonalité.** Le prompt reçoit les métadonnées (client, retard, montant) et le paramètre "Tone" (cordial, strict, mise en demeure), forçant l'IA à adapter son vocabulaire. | **Standard (Single)** <br/>*Exécution rapide à haut volume* | GPT-6 Luna ou Mixtral 8x7B |
| **Préparation de Réunion** | Génère un "Briefing" avant un RDV pour récapituler l'historique client. | **Agrégation (Data-to-Text).** Le backend fouille la base de données (devis, CA facturé) du client, l'injecte dans le prompt et demande une synthèse avec recommandations d'upsell. | **Research (Fusion)** <br/>*Vues croisées pour éviter les oublis* | GPT-6 Astra, Mistral Large, Llama 3 |
| **Analyseur d'Emails** | Trie et classe automatiquement les emails entrants (Urgence, Intention). | **Classification NLP & Extraction.** Le prompt force l'IA à jouer le rôle d'un "Triage Bot" et à retourner un JSON avec la catégorie, un résumé court, et le niveau d'urgence perçu. | **Expert (Challenge)** <br/>*Score sur la précision* | GPT-6.1 Sol, Mixtral 8x7B, Mistral Large |
| **Chatbot RAG** | Chat avec les documents (PDF, Word) propriétaires de l'entreprise. | **RAG (Retrieval-Augmented Generation).** Découpage et vectorisation des documents. Recherche de similarité (vecteurs) puis injection des textes trouvés dans le prompt : *"Basé UNIQUEMENT sur ce contexte, réponds..."* | **Research (Fusion)** <br/>*Compilation d'information maximale* | GPT-6 Astra, Llama 3, Mistral Large |

---

### Principes Architecturaux des Prompts MDIV Business
1. **Contrainte JSON absolue** : 95% des prompts de l'application utilisent le "JSON Mode". L'IA n'a pas le droit de discuter en texte libre, elle agit comme un pont de données (API).
2. **French Only** : Chaque prompt inclut une directive critique en majuscules : `CRITICAL REQUIREMENT: YOU MUST GENERATE ALL TEXT STRICTLY IN FRENCH`, car les modèles anglais ont tendance à dériver linguistiquement.
3. **Garde-Fous Backend (Zéro Hallucination)** : L'IA propose, le code PHP dispose. Que ce soit pour les mathématiques financières (TTC) ou les URLs de sites web, les scripts PHP vérifient et corrigent de force les données après la génération IA.

### La Mécanique Multi-Modèles ("Challenge & Fusion")
Dans cette nouvelle architecture, les applications critiques n'appellent plus un seul fournisseur. 
* L'orchestrateur lance une requête parallèle vers OpenAI (GPT-6 Astra), Mistral (Large) et Groq.
* **En mode Challenge** : Les réponses sont évaluées via un score de confiance pondéré (`confidence`, `reasoning`, `completeness`, `source_quality`). Le modèle ayant le meilleur score l'emporte.
* **En mode Fusion** : Les meilleures parties de chaque réponse sont conservées et fusionnées par un Master Model pour produire un résultat final parfait, exempt de doublons.
