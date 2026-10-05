// src/lib/benchmarkConfig.ts

export type PillarId = 'strategy' | 'process' | 'data' | 'infra' | 'ai' | 'culture';

export interface BenchmarkQuestion {
  id: string;
  text: string;
  pillarId: PillarId;
}

export interface BenchmarkPillar {
  id: PillarId;
  name: string;
  description: string;
  questions: BenchmarkQuestion[];
}

// Notation : 1 = Non existant, 2 = Faible, 3 = Moyen, 4 = Bon niveau, 5 = Excellent niveau

export const BENCHMARK_PILLARS: BenchmarkPillar[] = [
  {
    id: 'strategy',
    name: 'Stratégie Digitale',
    description: 'Évaluation de la vision, du budget et de la gouvernance.',
    questions: [
      { id: 'strat_1', text: 'Possédez-vous une feuille de route (roadmap) digitale formellement documentée et communiquée ?', pillarId: 'strategy' },
      { id: 'strat_2', text: 'La Direction Générale sponsorise-t-elle activement les initiatives de transformation digitale ?', pillarId: 'strategy' },
      { id: 'strat_3', text: 'Disposez-vous d\'un budget spécifique et sanctuarisé pour l\'innovation technologique ?', pillarId: 'strategy' },
      { id: 'strat_4', text: 'Avez-vous défini des KPI mesurables pour évaluer le succès de votre transformation digitale ?', pillarId: 'strategy' },
      { id: 'strat_5', text: 'Existe-t-il une gouvernance dédiée (Comité Digital, CDO) pour piloter le numérique ?', pillarId: 'strategy' },
      { id: 'strat_6', text: 'Votre stratégie digitale est-elle alignée avec vos objectifs commerciaux globaux ?', pillarId: 'strategy' },
      { id: 'strat_7', text: 'Le modèle économique de l\'entreprise intègre-t-il de nouveaux revenus issus du numérique ?', pillarId: 'strategy' },
      { id: 'strat_8', text: 'Effectuez-vous une veille technologique et concurrentielle régulière (Benchmark digital) ?', pillarId: 'strategy' },
    ]
  },
  {
    id: 'process',
    name: 'Processus Métiers',
    description: 'Niveau de digitalisation et d\'automatisation des opérations quotidiennes.',
    questions: [
      { id: 'proc_1', text: 'Dans quelle mesure vos opérations quotidiennes sont-elles digitalisées (zéro papier) ?', pillarId: 'process' },
      { id: 'proc_2', text: 'Vos flux de validation internes (workflows) sont-ils automatisés ?', pillarId: 'process' },
      { id: 'proc_3', text: 'Utilisez-vous la signature électronique pour vos contrats et documents légaux ?', pillarId: 'process' },
      { id: 'proc_4', text: 'Disposez-vous d\'une Gestion Électronique des Documents (GED) centralisée ?', pillarId: 'process' },
      { id: 'proc_5', text: 'Vos processus de collaboration à distance sont-ils standardisés et fluides ?', pillarId: 'process' },
      { id: 'proc_6', text: 'L\'expérience client (parcours d\'achat, SAV) est-elle entièrement digitalisée ?', pillarId: 'process' },
      { id: 'proc_7', text: 'Les processus transverses entre départements sont-ils unifiés dans un outil (ERP/CRM) ?', pillarId: 'process' },
      { id: 'proc_8', text: 'Vos processus sont-ils audités et optimisés régulièrement (Lean IT, BPM) ?', pillarId: 'process' },
      { id: 'proc_9', text: 'Vos fournisseurs et partenaires sont-ils intégrés numériquement à votre chaîne de valeur (EDI, Portails) ?', pillarId: 'process' },
    ]
  },
  {
    id: 'data',
    name: 'Data & Gouvernance',
    description: 'Qualité, exploitation et sécurisation des données de l\'entreprise.',
    questions: [
      { id: 'data_1', text: 'Quelle est la qualité globale de vos bases de données (doublons, erreurs, fraîcheur) ?', pillarId: 'data' },
      { id: 'data_2', text: 'Disposez-vous d\'un référentiel de données unique (Master Data Management) pour l\'entreprise ?', pillarId: 'data' },
      { id: 'data_3', text: 'Avez-vous défini une politique de gouvernance des données (propriété, accès, cycle de vie) ?', pillarId: 'data' },
      { id: 'data_4', text: 'Pilotez-vous l\'entreprise via des tableaux de bord (BI) consolidés et en temps réel ?', pillarId: 'data' },
      { id: 'data_5', text: 'Exploitez-vous l\'analyse de données (Analytique avancée) pour prédire des comportements (ventes, risques) ?', pillarId: 'data' },
      { id: 'data_6', text: 'Êtes-vous en parfaite conformité avec les réglementations sur les données (RGPD) ?', pillarId: 'data' },
      { id: 'data_7', text: 'Les collaborateurs ont-ils un accès facile et sécurisé aux données nécessaires à leur métier ?', pillarId: 'data' },
      { id: 'data_8', text: 'Collectez-vous des données depuis de multiples sources (Web, IoT, CRM, Réseaux) de façon centralisée ?', pillarId: 'data' },
      { id: 'data_9', text: 'Monétisez-vous directement ou indirectement vos données ?', pillarId: 'data' },
    ]
  },
  {
    id: 'infra',
    name: 'Infrastructure & Technologies',
    description: 'Modernité du SI, cloud, sécurité et interopérabilité.',
    questions: [
      { id: 'infra_1', text: 'Quelle est la part de votre infrastructure hébergée dans le Cloud (SaaS, IaaS, PaaS) ?', pillarId: 'infra' },
      { id: 'infra_2', text: 'Vos systèmes historiques (Legacy) ont-ils été modernisés récemment ?', pillarId: 'infra' },
      { id: 'infra_3', text: 'Quel est votre niveau de maturité en Cybersécurité (audit, protection, sensibilisation) ?', pillarId: 'infra' },
      { id: 'infra_4', text: 'Avez-vous un Plan de Reprise/Continuité d\'Activité (PRA/PCA) avec sauvegardes externalisées testées ?', pillarId: 'infra' },
      { id: 'infra_5', text: 'Vos différents systèmes (ERP, CRM, RH, etc.) sont-ils connectés et interopérables (API) ?', pillarId: 'infra' },
      { id: 'infra_6', text: 'Votre suite d\'outils collaboratifs (ex: Microsoft 365, Google Workspace) est-elle pleinement exploitée ?', pillarId: 'infra' },
      { id: 'infra_7', text: 'L\'infrastructure réseau (Fibre, VPN, Wifi) garantit-elle des performances sans coupure ?', pillarId: 'infra' },
      { id: 'infra_8', text: 'Votre infrastructure est-elle scalable pour absorber des pics d\'activité soudains ?', pillarId: 'infra' },
      { id: 'infra_9', text: 'Supervisez-vous en temps réel la santé et les performances de vos systèmes informatiques ?', pillarId: 'infra' },
    ]
  },
  {
    id: 'ai',
    name: 'Intelligence Artificielle',
    description: 'Déploiement et usage des technologies d\'IA.',
    questions: [
      { id: 'ai_1', text: 'Vos collaborateurs utilisent-ils régulièrement l\'IA Générative (ChatGPT, Claude, etc.) dans leurs tâches ?', pillarId: 'ai' },
      { id: 'ai_2', text: 'Avez-vous déjà déployé des cas d\'usage d\'IA intégrés à vos processus (au-delà de l\'usage individuel) ?', pillarId: 'ai' },
      { id: 'ai_3', text: 'Avez-vous déployé des outils de productivité IA comme Microsoft Copilot pour vos équipes ?', pillarId: 'ai' },
      { id: 'ai_4', text: 'Utilisez-vous des Agents IA ou des Chatbots pour interagir avec vos clients ou collaborateurs ?', pillarId: 'ai' },
      { id: 'ai_5', text: 'Disposez-vous d\'une politique de sécurité ou d\'une charte éthique encadrant l\'usage de l\'IA ?', pillarId: 'ai' },
      { id: 'ai_6', text: 'Avez-vous alloué un budget spécifique pour expérimenter ou développer des projets IA ?', pillarId: 'ai' },
      { id: 'ai_7', text: 'Vos équipes informatiques/Data maîtrisent-elles les concepts et l\'intégration de l\'IA ?', pillarId: 'ai' },
      { id: 'ai_8', text: 'Avez-vous identifié précisément les processus métiers qui bénéficieraient le plus de l\'IA (ROI) ?', pillarId: 'ai' },
      { id: 'ai_9', text: 'La Direction Générale considère-t-elle l\'IA comme un levier stratégique indispensable ?', pillarId: 'ai' },
      { id: 'ai_10', text: 'Utilisez-vous l\'IA pour analyser vos données d\'entreprise (Machine Learning, analyses prédictives) ?', pillarId: 'ai' },
    ]
  },
  {
    id: 'culture',
    name: 'Talents & Culture Digitale',
    description: 'Adoption, gestion du changement et montée en compétences.',
    questions: [
      { id: 'cult_1', text: 'Proposez-vous régulièrement des formations au numérique à vos collaborateurs ?', pillarId: 'culture' },
      { id: 'cult_2', text: 'Une sensibilisation spécifique et des formations aux outils IA ont-elles été réalisées ?', pillarId: 'culture' },
      { id: 'cult_3', text: 'Avez-vous des processus en place pour accompagner le changement lors du déploiement de nouveaux outils ?', pillarId: 'culture' },
      { id: 'cult_4', text: 'Votre culture d\'entreprise encourage-t-elle l\'innovation, le "Test & Learn" et le droit à l\'erreur ?', pillarId: 'culture' },
      { id: 'cult_5', text: 'Le taux d\'adoption des nouveaux outils digitaux par les équipes est-il élevé et rapide ?', pillarId: 'culture' },
      { id: 'cult_6', text: 'Existe-t-il un programme d\'amélioration continue pour moderniser les méthodes de travail ?', pillarId: 'culture' },
      { id: 'cult_7', text: 'Attirez-vous facilement de nouveaux talents numériques (attractivité marque employeur) ?', pillarId: 'culture' },
      { id: 'cult_8', text: 'Des "champions digitaux" ou "ambassadeurs IA" ont-ils été identifiés au sein des services métiers ?', pillarId: 'culture' },
      { id: 'cult_9', text: 'Le télétravail et les modes de travail hybrides sont-ils techniquement et culturellement fluides ?', pillarId: 'culture' },
    ]
  }
];

/**
 * Calcul le score (0 à 100) pour un pilier spécifique en fonction des réponses (1 à 5).
 */
export function calculatePillarScore(pillarId: PillarId, answers: Record<string, number>): number {
  const pillar = BENCHMARK_PILLARS.find(p => p.id === pillarId);
  if (!pillar) return 0;
  
  const questionIds = pillar.questions.map(q => q.id);
  let totalScore = 0;
  let answeredCount = 0;
  
  for (const qId of questionIds) {
    if (answers[qId] !== undefined) {
      // Convertir 1-5 en 0-100 (1=0, 2=25, 3=50, 4=75, 5=100)
      const score = (answers[qId] - 1) * 25;
      totalScore += score;
      answeredCount++;
    }
  }
  
  if (answeredCount === 0) return 0;
  return Math.round(totalScore / answeredCount);
}

/**
 * Calcul le AI Readiness Score basé sur les sous-piliers clés.
 */
export function calculateAIReadiness(scores: Record<PillarId, number>): number {
  // AI readiness est pondéré : IA (40%), Data (30%), Process (10%), Infra (10%), Culture (10%)
  const readiness = 
    (scores.ai * 0.40) + 
    (scores.data * 0.30) + 
    (scores.process * 0.10) + 
    (scores.infra * 0.10) + 
    (scores.culture * 0.10);
    
  return Math.round(readiness);
}

/**
 * Calcul le score Digital Global.
 */
export function calculateGlobalScore(scores: Record<PillarId, number>): number {
  let sum = 0;
  let count = 0;
  for (const val of Object.values(scores)) {
    sum += val;
    count++;
  }
  return count > 0 ? Math.round(sum / count) : 0;
}

/**
 * Génère le SWOT automatiquement basé sur les scores réels des piliers.
 * Zéro donnée mockée.
 */
export function generateSWOTFromScores(scores: Record<PillarId, number>) {
  const forces: string[] = [];
  const faiblesses: string[] = [];
  const opportunites: string[] = [];
  const risques: string[] = [];
  const priorites: string[] = [];

  // Analyse Stratégie
  if (scores.strategy >= 70) forces.push("Vision stratégique claire et gouvernance établie");
  else if (scores.strategy < 40) faiblesses.push("Manque de vision et de budget sanctuarisé pour l'innovation");
  
  // Analyse Data
  if (scores.data >= 70) forces.push("Données fiables, centralisées et bien gouvernées");
  else if (scores.data < 40) faiblesses.push("Qualité et accessibilité des données insuffisantes");
  else opportunites.push("Mettre en place un référentiel unique (MDM) pour fiabiliser la donnée");

  // Analyse Infra
  if (scores.infra >= 70) forces.push("Infrastructure Cloud moderne et hautement sécurisée");
  else if (scores.infra < 40) risques.push("Dette technique et vulnérabilités de cybersécurité potentielles");

  // Analyse IA
  if (scores.ai >= 70) forces.push("Forte maturité IA, cas d'usage déployés en production");
  else if (scores.ai < 40) {
    faiblesses.push("Sous-utilisation des leviers de l'Intelligence Artificielle");
    opportunites.push("Déploiement de Microsoft Copilot pour augmenter la productivité");
  }

  // Analyse Processus
  if (scores.process >= 70) forces.push("Opérations automatisées et hautement digitalisées");
  else if (scores.process < 40) {
    faiblesses.push("Processus manuels chronophages");
    opportunites.push("Automatisation des flux via Power Automate (RPA)");
  }

  // Analyse Culture
  if (scores.culture >= 70) forces.push("Forte culture digitale et équipes formées");
  else if (scores.culture < 40) risques.push("Résistance au changement et déficit de compétences technologiques");
  
  // Priorités
  if (scores.data < 50) priorites.push("Assainir et structurer les données avant tout projet IA ambitieux");
  if (scores.infra < 50) priorites.push("Moderniser l'infrastructure et auditer la sécurité");
  if (scores.culture < 50) priorites.push("Lancer un plan de conduite du changement et de formation");
  if (scores.strategy < 50) priorites.push("Définir une feuille de route digitale au niveau Comex");
  if (priorites.length === 0) priorites.push("Passer à l'échelle sur vos cas d'usage IA avancés");

  return { forces, faiblesses, opportunites, risques, priorites };
}

/**
 * Génère la Roadmap automatiquement
 */
export function generateRoadmapFromScores(scores: Record<PillarId, number>) {
  // Logique purement algorithmique basée sur les scores réels pour générer des phases de 0 à 24 mois.
  const phase1 = [];
  const phase2 = [];
  const phase3 = [];
  const phase4 = [];

  // Si l'infra est faible, il faut agir vite
  if (scores.infra < 60) {
    phase1.push({ title: "Audit et sécurisation de l'infrastructure", impact: "Élevé", effort: "Moyen", roi: "Sécurité" });
    phase2.push({ title: "Migration Cloud (Lift & Shift)", impact: "Élevé", effort: "Élevé", roi: "Optimisation des coûts" });
  }

  // Stratégie
  if (scores.strategy < 60) {
    phase1.push({ title: "Définition de la vision et de la gouvernance digitale", impact: "Très Élevé", effort: "Faible", roi: "Alignement stratégique" });
  }

  // Data (Dépend de la stratégie)
  if (scores.data < 60) {
    phase2.push({ title: "Mise en place d'un Master Data Management (MDM)", impact: "Élevé", effort: "Élevé", roi: "Fiabilité" });
    phase3.push({ title: "Déploiement d'une solution de Business Intelligence centralisée", impact: "Très Élevé", effort: "Moyen", roi: "Pilotage précis" });
  }

  // Process & IA
  if (scores.process < 60) {
    phase1.push({ title: "Identification des processus métiers automatisables", impact: "Moyen", effort: "Faible", roi: "Gain de temps" });
    phase2.push({ title: "Mise en œuvre d'automatisations simples (RPA)", impact: "Élevé", effort: "Moyen", roi: "Productivité immédiate" });
  }

  if (scores.ai < 50) {
    phase1.push({ title: "Formation et sensibilisation des équipes à l'IA Générative", impact: "Très Élevé", effort: "Moyen", roi: "Acculturation" });
    phase3.push({ title: "Déploiement à l'échelle de Microsoft 365 Copilot", impact: "Très Élevé", effort: "Élevé", roi: "Augmentation individuelle" });
    phase4.push({ title: "Développement d'Agents IA métiers sur-mesure", impact: "Maximum", effort: "Élevé", roi: "Avantage concurrentiel" });
  } else if (scores.ai >= 50) {
    phase1.push({ title: "Audit des cas d'usage IA existants et rationalisation", impact: "Moyen", effort: "Faible", roi: "Optimisation" });
    phase2.push({ title: "Déploiement d'Agents IA sur les processus critiques", impact: "Très Élevé", effort: "Élevé", roi: "Avantage concurrentiel" });
  }
  
  if (scores.culture < 60) {
    phase1.push({ title: "Lancement du programme 'Ambassadeurs Digitaux'", impact: "Élevé", effort: "Moyen", roi: "Adoption" });
  }

  // Sécurités
  if (phase1.length === 0) phase1.push({ title: "Revue stratégique de l'innovation", impact: "Moyen", effort: "Faible", roi: "Veille" });
  if (phase2.length === 0) phase2.push({ title: "Exploration de nouveaux business models digitaux", impact: "Élevé", effort: "Élevé", roi: "Nouveaux revenus" });
  if (phase3.length === 0) phase3.push({ title: "Intégration poussée de l'IA dans les produits clients", impact: "Élevé", effort: "Élevé", roi: "Avantage concurrentiel" });
  if (phase4.length === 0) phase4.push({ title: "Pérennisation du programme d'amélioration continue", impact: "Moyen", effort: "Faible", roi: "Résilience" });

  return { 
    phase1: phase1.slice(0, 3), 
    phase2: phase2.slice(0, 3), 
    phase3: phase3.slice(0, 3), 
    phase4: phase4.slice(0, 3) 
  };
}
