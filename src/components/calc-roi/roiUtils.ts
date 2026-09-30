// Types partagés par le wizard ROI
export interface ROIFormData {
  // Step 1: Company
  companyName: string;
  sector: string;
  employees: string;
  country: string;
  // Step 2: Process
  process: string;
  // Step 3: Metrics
  employeesTask: number;
  hoursPerWeek: number;
  avgHourlyRate: number;
  automationPercent: number;
  aiMonthlyCost: number;
  // Step 4: Lead
  leadName: string;
  leadEmail: string;
  leadPhone: string;
}

export const DEFAULT_ROI_DATA: ROIFormData = {
  companyName: "",
  sector: "",
  employees: "",
  country: "",
  process: "",
  employeesTask: 1,
  hoursPerWeek: 10,
  avgHourlyRate: 25,
  automationPercent: 50,
  aiMonthlyCost: 100,
  leadName: "",
  leadEmail: "",
  leadPhone: "",
};

// ─── Pure calculation functions ───────────────────────────────────────────────

export function computeROIMetrics(data: ROIFormData) {
  const monthlySavedTime =
    data.employeesTask *
    data.hoursPerWeek *
    4.33 *
    (data.automationPercent / 100);
  const annualSavedTime = monthlySavedTime * 12;
  const monthlySavings = monthlySavedTime * data.avgHourlyRate;
  const annualSavings = monthlySavings * 12;
  const annualAiCost = data.aiMonthlyCost * 12;
  const roi =
    annualAiCost > 0
      ? ((annualSavings - annualAiCost) / annualAiCost) * 100
      : annualSavings > 0
      ? 9999
      : 0;
  const paybackPeriodMonths =
    annualSavings > 0 ? (annualAiCost / annualSavings) * 12 : 999;

  return {
    monthlySavedTime,
    annualSavedTime,
    monthlySavings,
    annualSavings,
    annualAiCost,
    roi,
    paybackPeriodMonths,
  };
}

export function buildChartData(monthlySavings: number, aiMonthlyCost: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `M ${i + 1}`,
    "Économies cumulées": Math.round(monthlySavings * (i + 1)),
    "Coût cumulé": Math.round(aiMonthlyCost * (i + 1)),
    "Bénéfice net": Math.round((monthlySavings - aiMonthlyCost) * (i + 1)),
  }));
}

export function getRoiInterpretation(roi: number) {
  if (roi > 300) {
    return {
      title: "Excellent potentiel de rentabilité",
      desc: "L'investissement IA peut générer un impact majeur sur votre productivité et votre rentabilité globale.",
      color: "text-emerald-400",
      bg: "bg-emerald-950/30",
      border: "border-emerald-500/20",
    };
  } else if (roi >= 100) {
    return {
      title: "Projet très rentable",
      desc: "L'automatisation offre un retour sur investissement solide et justifie pleinement le déploiement.",
      color: "text-blue-400",
      bg: "bg-blue-900/30",
      border: "border-blue-500/20",
    };
  } else {
    return {
      title: "Analyse complémentaire recommandée",
      desc: "Les gains directs couvrent difficilement les coûts. Identifions des opportunités d'automatisation supplémentaires ou des outils moins coûteux.",
      color: "text-amber-400",
      bg: "bg-amber-900/30",
      border: "border-amber-500/20",
    };
  }
}

export function getRecommendations(process: string): string[] {
  if (process === "Support client") {
    return [
      "Chatbots de première ligne (Intercom/Zendesk AI)",
      "Analyse du sentiment client en temps réel",
      "Génération de brouillons de réponse",
      "Catégorisation automatique des tickets",
      "Base de connaissances auto-mise à jour",
    ];
  } else if (process === "Finance") {
    return [
      "Rapprochement bancaire automatisé",
      "Extraction de données des factures (OCR + IA)",
      "Prédiction des retards de paiement",
      "Génération de rapports financiers dynamiques",
      "Détection d'anomalies et fraudes",
    ];
  } else if (process === "Marketing") {
    return [
      "Génération de contenu SEO (ChatGPT/Claude)",
      "Personnalisation dynamique des campagnes email",
      "Analyse sémantique des retours clients",
      "Génération d'images (Midjourney)",
      "Scoring prédictif des leads",
    ];
  }
  return [
    "Automatisation de la saisie de données et de la facturation",
    "Génération automatique de rapports hebdomadaires",
    "Tri et priorisation intelligente des emails",
    "Assistant IA pour le support niveau 1",
    "Analyse prédictive des tendances",
  ];
}

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(val);
