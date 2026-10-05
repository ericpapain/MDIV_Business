# DOSSIER D'ARCHITECTURE CIBLE & SPÉCIFICATIONS TECHNIQUES ENTERPRISE
## Transformation Haute Performance de la Plateforme MDIV Business
**Version** : 2.0 Enterprise  
**Statut** : Document Maître de Référence  
**Moteur de Raisonnement Cible** : OpenAI GPT-4o (Strict Structured Outputs) + Panel Multi-Agents Délibératif

---

## 1. VISION STRATÉGIQUE & PRINCIPE DIRECTEUR

L'application MDIV Business évolue d'un catalogue d'outils vers une **infrastructure d'intelligence d'entreprise autonome, contextualisée et apprenante**.

> **Principe Cardinal** : La qualité, la profondeur analytique, la justesse sectorielle et la rigueur professionnelle priment absolument sur la simple vitesse d'exécution. Chaque document ou réponse générée doit atteindre le niveau d'excellence d'un cabinet de conseil ou d'un directeur associé senior.

---

## 2. SCHÉMA GLOBAL DE L'ARCHITECTURE CIBLE (ASCII ART)

```
+----------------------------------------------------------------------------------------------------+
|                                      INTERFACE UTILISATEUR ENRICHIE                                |
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   | Saisie / Upload Document / Dictée Vocale / Enregistrement Audio Multi-Locuteurs            |   |
|   +--------------------------------------------------------------------------------------------+   |
|                                                  |                                                 |
|                                                  v                                                 |
|   +--------------------------------------------------------------------------------------------+   |
|   | 1. MODULE DE GARDE-FOU & CLASSIFICATION D'INTENTION (Confiance Probabiliste)               |   |
|   |    Exemple : Contenu = Facture (94%) vs Module Actuel = Compte-Rendu (2%)                  |   |
|   |    --> Avertissement immédiat & Modal de Réorientation Intelligente                        |   |
|   +--------------------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
                                                   |
                         (Document validé pour le module adéquat)
                                                   v
+----------------------------------------------------------------------------------------------------+
|                       COUCHE D'ANONYMISATION & SÉCURITÉ PII (Microsoft Presidio)                   |
|   Caviardage local des données sensibles : IBAN, N° Sécu, Identités confidentielles, Santé        |
+----------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    ORCHESTRATEUR DE CONTEXTE RAG                                   |
|                                                                                                    |
|   +--------------------------------------------------------------------------------------------+   |
|   | Isolation Hermétique par Entreprise (tenant_id = company_id)                               |   |
|   | 1. Recherche Vectorielle Hybride : Embeddings text-embedding-3-large + Full-Text SQL       |   |
|   | 2. Re-Ranking Sémantique (Cohere Rerank / BGE) : Sélection des 3 à 5 extraits décisifs     |   |
|   | 3. Injection Few-Shot Dynamique : Historique des corrections humaines validées              |   |
|   | 4. Détection du Persona Expert Automatique (BTP, Santé, Notariat, Hôtellerie, SaaS...)     |   |
|   +--------------------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+====================================================================================================+
|             NOYAU DE DÉLIBÉRATION CONVERSATIONNELLE MULTI-AGENTS (SECTION PAR SECTION)             |
|                                                                                                    |
|   Pour chaque étape ou section d'analyse, un collège d'agents IA débat avant validation :          |
|                                                                                                    |
|         +-----------------------+              +-----------------------+                           |
|         |   AGENT 1 : ANALYSTE  |              |  AGENT 2 : CHALLENGER |                           |
|         |   Extraction des faits| <----------> |  Détection des failles|                           |
|         |   & données brutes    |              |  risques & omissions  |                           |
|         +-----------------------+              +-----------------------+                           |
|                     |                                      |                                       |
|                     +------------------+-------------------+                                       |
|                                        |                                                           |
|                                        v                                                           |
|                         +-----------------------------+                                            |
|                         |  AGENT 3 : EXPERT SECTORIEL |                                            |
|                         |  Validation déontologique,  |                                            |
|                         |  normes métiers & jargon    |                                            |
|                         +-----------------------------+                                            |
|                                        |                                                           |
|                                        v                                                           |
|                         +-----------------------------+                                            |
|                         |  AGENT 4 : ARBITRE / CRITIC |                                            |
|                         |  Synthèse du consensus      |                                            |
|                         |  & contrôle qualité final   |                                            |
|                         +-----------------------------+                                            |
+====================================================================================================+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                       RÉSULTAT EXÉCUTIF LIVRABLE                                   |
|                                                                                                    |
|   1. Réinjection sécurisée des données PII d'origine sur l'affichage final                        |
|   2. Rendu en temps réel avec vision du débat d'experts (transparence décisionnelle)               |
|   3. Export multi-formats certifiés : PDF Haute Définition, Word (.docx), Excel avec formules     |
|   4. Indexation automatique de la réponse validée dans la base vectorielle pour apprentissage      |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. LE SYSTÈME DE DÉLIBÉRATION CONVERSATIONNELLE MULTI-AGENTS

Chaque tâche complexe (ex: compte-rendu de réunion, audit contractuel, diagnostic stratégique, synthèse de document de 50 pages) est segmentée en **unités d'analyse logiques (sections)**.

Au lieu de soumettre un prompt unique, **un panel d'agents spécialisés converse en boucle fermée** :

```
                  BOUCLE DE DÉLIBÉRATION MULTI-AGENTS PAR SECTION
                  
   [Section Documentaire / Données]
                 │
                 ▼
   ┌───────────────────────────┐
   │ Agent 1 : Extracteur      │ ➔ "Voici les 4 décisions et 2 montants identifiés."
   └─────────────┬─────────────┘
                 │
                 ▼
   ┌───────────────────────────┐
   │ Agent 2 : Auditeur/Risques│ ➔ "Attention, la clause 3.2 est contradictoire avec
   └─────────────┬─────────────┘    le délai de livraison annoncé à la section 1."
                 │
                 ▼
   ┌───────────────────────────┐
   │ Agent 3 : Spécialiste NAF │ ➔ "D'un point de vue réglementaire BTP/Norme NF, 
   └─────────────┬─────────────┘    ce type de pénalité de retard doit être précisé."
                 │
                 ▼
   ┌───────────────────────────┐
   │ Agent 4 : Arbitre Exécutif│ ➔ "Consensus validé : reformuler avec mention expresse
   └─────────────┬─────────────┘    de l'avenant contractuel sous forme de tableau."
                 │
                 ▼
     [Section Finale Consolidée]
```

### Rôles du Collège d'Agents Délibératif :
1. **L'Agent Extracteur (Fact Hunter)** : Analyse le verbatim ou le texte source, extrait les faits sans interprétation subjective (chiffres, noms, dates, engagements).
2. **L'Agent Challenger (Devil's Advocate)** : Cherche activement les incohérences, les non-dits, les risques juridiques ou opérationnels et les biais.
3. **L'Agent Métier (Domain Specialist)** : Adapte la délibération aux réalités concrètes de l'industrie détectée (règles comptables, déontologie médicale, DTU du BTP, droit du travail).
4. **L'Agent Arbitre (Executive Summarizer & Quality Critic)** : Tranche les désaccords entre agents, applique le contrôle qualité linguistique et formate le livrable final.

---

## 4. DÉTECTION DES ERREURS UTILISATEURS & CLASSIFICATION DOCUMENTAIRE

### Matrice de Classification Préalable (Confiance Probabiliste) :
Avant tout envoi au moteur principal, le document passe dans un classifieur ultrarapide :

```
Saisie Utilisateur ➔ Classifieur IA ➔ Vecteur de probabilités :
- Facture : 94%
- Compte-rendu : 2%
- Email : 3%
- Autre : 1%
```

### Mécanisme de Reroutage Interactif (UI Guardrail) :
Si le score de la catégorie dominante ne correspond pas au module en cours :
1. L'action est **interrompue immédiatement** (évite la consommation inutile de tokens et les réponses absurdes).
2. Une boîte de dialogue modale s'ouvre pour l'utilisateur avec proposition d'aiguillage automatique en un clic :
   - *Bouton 1* : « Basculer vers le Vérificateur de Facture & Norme Factur-X »
   - *Bouton 2* : « Extraire les montants et créer une relance client »
   - *Bouton 3* : « Forcer le traitement en compte-rendu malgré tout »

---

## 5. MÉMOIRE LONG TERME HERMÉTIQUE & RAG VECTORIEL HYBRIDE

### Spécifications du Stockage Vectoriel :
- **Moteur** : PostgreSQL avec extension `pgvector`.
- **Modèle d'Embeddings** : OpenAI `text-embedding-3-large` (dimension vectorielle : 3072).
- **Indexation** : Index HNSW (`hierarchical navigable small world`) pour une recherche cosinus sub-milliseconde.
- **Herméticité Multi-Tenant** : `WHERE company_id = :tenant_id` appliqué au niveau des politiques de sécurité de lignes (Row Level Security - RLS). Aucune entreprise ne peut interroger la mémoire d'une autre.

```sql
CREATE TABLE company_knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id INT NOT NULL,
    document_id VARCHAR(100),
    document_type VARCHAR(50), -- 'invoice', 'meeting', 'contract', 'email'
    chunk_content TEXT NOT NULL,
    metadata JSONB NOT NULL,    -- {'author': 'Eric', 'client': 'Acme', 'date': '2026-10'}
    embedding vector(3072),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_embedding USING hnsw (embedding vector_cosine_ops)
);
```

### Pipeline de Récupération RAG en 3 Niveaux :
1. **Recherche Hybride** : Recherche sémantique vectorielle combinée à la recherche lexicale plein texte (BM25).
2. **Re-Ranking Sémantique (Cohere Rerank / BGE-Reranker-Large)** : Réduction des 25 fragments candidats aux 4 passages cruciaux (élimination du bruit documentaire).
3. **Contextual Compression** : Les fragments sont enrichis avec leur contexte d'origine pour éviter les contresens.

---

## 6. TRANSCRIPTION AUDIO DIARISÉE & EXTRACTION DOCUMENTAIRE

### Architecture Audio Multi-Locuteurs :
1. **Ingestion** : Fichiers MP3, WAV, M4A, enregistrements de visio (Teams, Zoom, Google Meet) ou dictée micro en direct.
2. **Moteur** : WhisperX / Faster-Whisper Large-v3 couplé à **Pyannote.audio** pour la diarisation.
3. **Restitution Horodatée** :
   ```
   [00:00:12] Eric (Directeur) : Bonjour à tous, validons l'ordre du jour du projet CRM.
   [00:00:25] Marie (Cheffe de projet) : Nous avons finalisé l'étape 1, reste le choix du prestataire.
   [00:01:05] Georges (Trésorier) : Le budget maximum alloué pour cette phase est de 25 000 € HT.
   ```
4. **Post-Traitement par le Collège d'Agents** :
   - Tableau de bord exécutif synthétique.
   - Plan d'action matriciel RACI (Qui, Quoi, Quand, Dépendance).
   - Registre exhaustif des objections levées et des décisions actées.

---

## 7. HUMAN-IN-THE-LOOP & APPRENTISSAGE CONTINU

Chaque interaction utilisateur sert à affiner le système :
1. **Détection de Modification Humaine** : Lorsqu'un collaborateur modifie le texte proposé par l'IA dans l'éditeur, un diff syntaxique est calculé.
2. **Extraction de Règle Métier** : L'IA isole la préférence rédactionnelle (ex: « Ce dirigeant préfère "Honoraires" à "Prix", et exige toujours un tableau récapitulatif des échéances »).
3. **Few-Shot Dynamique** : Cette règle validée devient un exemple de référence injecté dans les prompts futurs de cette entreprise.

---

## 8. SÉCURITÉ, CONFORMITÉ RGPD & ANONYMISATION PII

- **Détection Automatique (Microsoft Presidio)** : Avant transmission aux modèles de langage, détection automatique des :
  - Numéros de sécurité sociale / NIR
  - Coordonnées bancaires (IBAN, BIC, numéros de cartes)
  - Données médicales ou sensibles
  - Noms de personnes physiques protégées
- **Chiffrement au Repos et en Transit** : TLS 1.3 obligatoire, chiffrement AES-256 des données stockées.
- **Journal d'Audit Immuable** : Traçabilité complète de chaque inférence (collaborateur, horodatage, coût token, version du prompt).

---

## 9. PLAN DE DÉPLOIEMENT OPÉRATIONNEL (PHASAGE)

| Phase | Intitulé | Livrables & Modules Déployés |
| :--- | :--- | :--- |
| **Phase 1** | **Cœur GPT-4o & Détection d'Erreurs** | - Activation de **GPT-4o** en moteur principal universel.<br>- Détecteur d'intention et classifieur documentaire avant envoi.<br>- Modal de réorientation interactive dans l'interface React.<br>- Détection automatique de la posture d'expert selon le SIREN et le NAF. |
| **Phase 2** | **Collège d'Agents Délibératif** | - Implémentation du système de débat multi-agents en arrière-plan.<br>- Boucle d'affinage section par section pour les résumés et diagnostics.<br>- Affichage de la délibération et des arguments dans l'interface (mode transparent). |
| **Phase 3** | **Mémoire Long Terme & RAG Vectoriel** | - Mise en place de PostgreSQL + `pgvector`.<br>- Pipeline d'embeddings `text-embedding-3-large`.<br>- Algorithme de Re-Ranking sémantique.<br>- Apprentissage actif Human-in-the-loop (diffs et préférences). |
| **Phase 4** | **Transcription Diarisée & OCR Avancé** | - Intégration diarisation multi-locuteurs horodatée.<br>- Pipeline OCR multi-moteurs pour scans dégradés.<br>- Export natif de documents prêts à signer (.docx, .xlsx avec formules, PDF certifiés). |
