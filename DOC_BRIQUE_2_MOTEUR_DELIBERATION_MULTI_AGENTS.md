# 📘 ARCHITECTURE TECHNIQUE & GUIDE DE RÉFÉRENCE
# BRIQUE 2 : Moteur de Délibération Multi-Agents & Consensus Exécutif

---

## 1. Vue d'Ensemble & Rupture Conceptuelle

Traditionnellement, les applications d'IA générative reposent sur une architecture à **Agent Unique ("Single Shot Prompting")**. Cette approche présente des limites structurelles rédhibitoires pour les dirigeants d'entreprise :
- **Biais d'acquiescement** : L'IA valide aveuglément les données d'entrée sans les questionner.
- **Absence de contradiction** : Les risques juridiques, de dépassement de budget ou les délais intenables ne sont pas challengés.
- **Résultat superficiel** : La synthèse reste générique et manque d'arbitrage tranché.

La **Brique 2** introduit un **Comité Exécutif Virtuel Séquentiel** composé de **4 Agents Spécialisés** qui débattent en temps réel avant d'émettre le livrable final certifié.

---

## 2. Rôles et Spécialisation des 4 Agents

```
   ┌────────────────────────────────────────────────────────────────┐
   │                        DOCUMENT SOURCE                         │
   │           Notes brutes, audio transcrit ou document            │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ 🤖 AGENT 1 : ANALYSTE FACTUEL & EXTRACTION VERBATIM            │
   │ Rôle : Neutralité absolue. Extrait les chiffres, dates, faits, │
   │ engagements et déclarations sans aucune interprétation.        │
   └───────────────────────────────┬────────────────────────────────┘
                                   │ Verbatim & faits bruts
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ 🚨 AGENT 2 : AUDITEUR CRITIQUE & DÉTECTEUR DE RISQUES          │
   │ Rôle : Avocat du diable. Traque les zones de flou, les délais  │
   │ intenables, les dépassements budgétaires et risques légaux.    │
   └───────────────────────────────┬────────────────────────────────┘
                                   │ Objections & points d'arbitrage
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ ⚖️ AGENT 3 : DIRECTEUR DES OPÉRATIONS (COO) & ARBITRE RACI     │
   │ Rôle : Arbitrage opérationnel. Réfute les objections futiles,  │
   │ assigne les responsabilités (qui fait quoi) et sécurise le ROI.│
   └───────────────────────────────┬────────────────────────────────┘
                                   │ Décisions & matrice de responsabilités
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ 👑 AGENT 4 : DIRECTEUR GÉNÉRAL (DG) & CERTIFICATEUR DU LIVRABLE│
   │ Rôle : Juge suprême. Consolide le consensus des 3 agents       │
   │ précédents et fige le livrable final en JSON certifié.         │
   └───────────────────────────────┬────────────────────────────────┘
                                   │
                                   ▼
   ┌────────────────────────────────────────────────────────────────┐
   │                      LIVRABLE FINAL CERTIFIÉ                   │
   │        JSON structuré avec Consensus Trail complet             │
   └────────────────────────────────────────────────────────────────┘
```

---

## 3. Protocole de Communication Temps Réel (Server-Sent Events - SSE)

Pour offrir une expérience utilisateur haut de gamme sans temps d'attente opaque, le backend communique avec le frontend via le protocole **Server-Sent Events (SSE)** (`text/event-stream`).

### Événements Émis :
1. `event: progress` : Taux d'avancement global (0 à 100%).
2. `event: agent_message` : Transmission en streaming des échanges de chaque agent (affichés dans une console visuelle interactive).
3. `event: complete` : Payload JSON final contenant le livrable et la trace d'arbitrage (`consensus_trail`).
4. `event: error` : Diagnostic immédiat en cas d'incident.

### Implémentation Backend ([summarizer_agents.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV Business/Mdiv Business/Site web/MDIV_Business/public/api/summarizer_agents.php) & [meeting_agents.php](file:///c:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/public/api/meeting_agents.php)) :
```php
function sendSSE($event, $data) {
    echo "event: $event\n";
    echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
    if (ob_get_level() > 0) ob_flush();
    flush();
}
```

---

## 4. Structure du Livrable & Consensus Trail

Chaque document généré par le comité multi-agents contient obligatoirement l'objet `consensus_deliberation` ou `consensus_trail` garantissant la traçabilité de l'audit :

```json
{
  "documentName": "Revue_Budget_Q4.docx",
  "mode": "direction",
  "executiveSummary": "Arbitrage final actant le recrutement de deux prestataires externes pour sécuriser la mise en production du projet au 15 novembre.",
  "keyPoints": [
    "Consommation budgétaire à 68% (306 000 € / 450 000 €)",
    "Pénalités contractuelles de 5 000 € / semaine en cas de retard au 1er décembre"
  ],
  "decisions": [
    "Validation d'une enveloppe de 18 000 € pour renfort externe immédiat",
    "Maintien de la date de livraison ferme au 15 novembre 2026"
  ],
  "actions": [
    {
      "task": "Contractualiser 2 consultants Devops",
      "assignee": "Thomas (Lead Tech)",
      "deadline": "12/10/2026",
      "status": "pending"
    }
  ],
  "risks": [
    {
      "risk": "Surcharge de l'équipe interne à 120% nécessitant un suivi RH hebdomadaire",
      "impact": "High"
    }
  ],
  "consensus_trail": {
    "agent1_factuel": "Le budget Titan est de 450k€, 306k€ dépensés. Risque de report au 30 novembre.",
    "agent2_critique": "Alerte majeure : Un report au 30 novembre expose l'entreprise à 5 000€/semaine de pénalités dès le 1er décembre !",
    "agent3_arbitre": "Arbitrage COO : L'option 18 000€ de prestataires est plus rentable que les pénalités et préserve notre crédibilité.",
    "agent4_dg": "Adoption formelle de la recommandation COO et figeage du plan d'action."
  }
}
```

---

## 5. Résilience & Tolérance aux Pannes

Le moteur dispose d'un mécanisme de **Failover transparent** :
- **Fournisseur Primaire** : Groq Cloud LPU (`qwen/qwen3.8-27b`) pour des délibérations en moins de 4 secondes.
- **Failover Secondaire** : Bascule automatique sur OpenAI (`gpt-4o-mini`) ou Mistral (`mistral-small-latest`) en cas de timeout réseau ou d'indisponibilité API.
- **Idempotence** : Si la délibération échoue au tour 3, les états des tours 1 et 2 sont conservés en mémoire de session.
