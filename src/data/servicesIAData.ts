import {
  Search, Zap, FileText, Megaphone, TrendingUp, Bot, GraduationCap, Store,
  ClipboardCheck, Calculator, BarChart3, Shield, FileCheck, Mail, Workflow,
  Monitor, PenTool, Receipt, CreditCard, Bell, Briefcase, Globe, Cpu,
  MessageSquare, BookOpen, Users, Rocket, Target, Sparkles, Brain,
  Lightbulb, Award, Calendar, Database, Settings, HeadphonesIcon, Crown
} from "lucide-react";

export interface IAApp {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  tier: "free" | "freemium" | "premium";
  badge?: string;
  badgeEn?: string;
  features?: string[];
  featuresEn?: string[];
  releaseDate?: string;
  href?: string;
}

export interface IACategory {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  icon: any;
  badge?: string;
  badgeEn?: string;
  highlight?: boolean;
  apps: IAApp[];
}

export interface IAPlan {
  id: string;
  name: string;
  nameEn: string;
  price: string;
  priceEn: string;
  period?: string;
  periodEn?: string;
  features: string[];
  featuresEn: string[];
  featured?: boolean;
  cta: string;
  ctaEn: string;
}

export interface IAAgent {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  tier: "free" | "premium";
  icon: any;
}

export const iaCategories: IACategory[] = [
  {
    id: "diagnostic",
    slug: "diagnostic-conseil",
    name: "Diagnostic & Conseil IA",
    nameEn: "AI Diagnostic & Consulting",
    desc: "Évaluez votre maturité numérique et construisez votre feuille de route IA.",
    descEn: "Assess your digital maturity and build your AI roadmap.",
    icon: Search,
    apps: [
      { id: "diag-express", name: "Diagnostic IA Express", nameEn: "Express AI Diagnostic", desc: "Questionnaire intelligent, score IA, rapport PDF", descEn: "Smart questionnaire, AI score, PDF report", tier: "free", features: ["Questionnaire intelligent", "Score IA", "Rapport PDF"], featuresEn: ["Smart questionnaire", "AI score", "PDF report"], href: "/services-ia/diagnostic" },
      { id: "calc-roi", name: "Calculateur ROI IA", nameEn: "AI ROI Calculator", desc: "Estimation des gains et calcul du temps économisé", descEn: "Gain estimation and time savings calculation", tier: "free", features: ["Estimation des gains", "Calcul du temps économisé"], featuresEn: ["Gain estimation", "Time savings calculation"], releaseDate: "2026-09-03T08:00:00" },
      { id: "maturite", name: "Maturité Digitale", nameEn: "Digital Maturity", desc: "Benchmark de votre entreprise", descEn: "Benchmark your company", tier: "free", features: ["Benchmark entreprise"], featuresEn: ["Company benchmark"], releaseDate: "2026-09-05T08:00:00" },
      { id: "audit-360", name: "Audit IA 360°", nameEn: "360° AI Audit", desc: "Analyse complète de vos processus et recommandations IA", descEn: "Complete process analysis and AI recommendations", tier: "premium" },
      { id: "roadmap", name: "Roadmap IA Entreprise", nameEn: "Enterprise AI Roadmap", desc: "Plan stratégique de déploiement IA personnalisé", descEn: "Customized AI deployment strategic plan", tier: "premium" },
      { id: "atelier-dir", name: "Atelier Direction IA", nameEn: "AI Leadership Workshop", desc: "Session de travail avec votre comité de direction", descEn: "Working session with your management team", tier: "premium" },
      { id: "coaching", name: "Coaching Transformation IA", nameEn: "AI Transformation Coaching", desc: "Accompagnement personnalisé dans la transformation IA", descEn: "Personalized AI transformation support", tier: "premium" },
    ],
  },
  {
    id: "automatisation",
    slug: "automatisation-productivite",
    name: "Automatisation & Productivité",
    nameEn: "Automation & Productivity",
    desc: "Automatisez vos tâches répétitives et boostez votre productivité.",
    descEn: "Automate repetitive tasks and boost your productivity.",
    icon: Zap,
    apps: [
      { id: "cr-ia", name: "Générateur de Comptes-Rendus IA", nameEn: "AI Meeting Notes Generator", desc: "Transformez vos réunions en comptes-rendus structurés", descEn: "Transform your meetings into structured notes", tier: "free", releaseDate: "2026-09-07T08:00:00" },
      { id: "resumeur", name: "Résumeur de Documents IA", nameEn: "AI Document Summarizer", desc: "Résumez n'importe quel document en quelques secondes", descEn: "Summarize any document in seconds", tier: "free", releaseDate: "2026-09-09T08:00:00" },
      { id: "email-ia", name: "Assistant Email IA", nameEn: "AI Email Assistant", desc: "Rédigez des emails professionnels en un clic", descEn: "Write professional emails in one click", tier: "free", releaseDate: "2026-09-11T08:00:00" },
      { id: "workflow", name: "Workflow Builder IA", nameEn: "AI Workflow Builder", desc: "Créez des automatisations métier visuellement", descEn: "Create business automations visually", tier: "premium" },
      { id: "office-ia", name: "Assistant Office IA", nameEn: "AI Office Assistant", desc: "Votre assistant intelligent pour Word, Excel, PowerPoint", descEn: "Your intelligent assistant for Word, Excel, PowerPoint", tier: "premium" },
      { id: "doc-gen", name: "Générateur de Documents Pro", nameEn: "Pro Document Generator", desc: "Créez des documents professionnels automatiquement", descEn: "Create professional documents automatically", tier: "premium" },
      { id: "auto-metier", name: "Automatisation Métier Sur Mesure", nameEn: "Custom Business Automation", desc: "Solutions d'automatisation adaptées à votre secteur", descEn: "Automation solutions tailored to your industry", tier: "premium" },
    ],
  },
  {
    id: "facturation",
    slug: "gestion-facturation",
    name: "Gestion & Facturation IA",
    nameEn: "AI Billing & Management",
    desc: "Facturez, gérez et suivez vos finances avec l'intelligence artificielle.",
    descEn: "Invoice, manage and track your finances with artificial intelligence.",
    icon: Receipt,
    badge: "Nouveau",
    badgeEn: "New",
    highlight: true,
    apps: [
      { id: "devis-ia", name: "Devis IA", nameEn: "AI Quotes", desc: "Génération automatique de devis professionnels en PDF", descEn: "Automatic generation of professional quotes in PDF", tier: "free", features: ["Génération automatique", "Export PDF"], featuresEn: ["Automatic generation", "PDF export"], releaseDate: "2026-09-13T08:00:00" },
      { id: "facture-ia", name: "Facture IA", nameEn: "AI Invoicing", desc: "Facturation avec calcul TVA et export PDF", descEn: "Invoicing with VAT calculation and PDF export", tier: "free", features: ["Calcul TVA", "Export PDF"], featuresEn: ["VAT calculation", "PDF export"], releaseDate: "2026-09-15T08:00:00" },
      { id: "relance-ia", name: "Relance IA", nameEn: "AI Payment Reminders", desc: "Génération d'emails de relance automatiques", descEn: "Automatic payment reminder email generation", tier: "free", features: ["Génération d'emails de relance"], featuresEn: ["Reminder email generation"], releaseDate: "2026-09-17T08:00:00" },
      { id: "suite-fact", name: "Suite Facturation Intelligente", nameEn: "Smart Billing Suite", desc: "Devis, factures, acomptes et avoirs — tout en un", descEn: "Quotes, invoices, deposits and credits — all in one", tier: "premium", features: ["Devis", "Factures", "Acomptes", "Avoirs"], featuresEn: ["Quotes", "Invoices", "Deposits", "Credits"] },
      { id: "fact-elec", name: "Facturation Électronique 2026", nameEn: "2026 E-Invoicing", desc: "Conformité totale avec la réforme 2026", descEn: "Full compliance with the 2026 reform", tier: "premium" },
      { id: "tresorerie", name: "Trésorerie IA", nameEn: "AI Treasury", desc: "Suivi et prévisions de trésorerie intelligents", descEn: "Intelligent cash flow tracking and forecasting", tier: "premium" },
      { id: "admin-ia", name: "Assistant Administratif IA", nameEn: "AI Administrative Assistant", desc: "Paiement en ligne, signature électronique, relances, export comptable", descEn: "Online payment, e-signature, reminders, accounting export", tier: "premium", features: ["Paiement en ligne", "Signature électronique", "Relance email & SMS", "Export comptable"], featuresEn: ["Online payment", "E-signature", "Email & SMS reminders", "Accounting export"] },
    ],
  },
  {
    id: "marketing",
    slug: "marketing-communication",
    name: "Marketing & Communication",
    nameEn: "Marketing & Communication",
    desc: "Créez du contenu percutant et gérez votre présence en ligne.",
    descEn: "Create impactful content and manage your online presence.",
    icon: Megaphone,
    apps: [
      { id: "post-gen", name: "Générateur de Contenu Multi-Canal", nameEn: "Multi-Channel Content Generator", desc: "Créez posts et visuels (LinkedIn, Web, Telegram) basés sur l'actualité", descEn: "Create posts and visuals (LinkedIn, Web, Telegram) based on news", tier: "free", releaseDate: "2026-09-19T08:00:00" },
      { id: "slogan-gen", name: "Générateur de Slogans", nameEn: "Slogan Generator", desc: "Trouvez le slogan parfait pour votre marque", descEn: "Find the perfect slogan for your brand", tier: "free", releaseDate: "2026-09-21T08:00:00" },
      { id: "pres-ia", name: "Créateur de Présentations IA", nameEn: "AI Presentation Creator", desc: "Créez des présentations professionnelles en minutes", descEn: "Create professional presentations in minutes", tier: "free", releaseDate: "2026-09-23T08:00:00" },
      { id: "social-mgr", name: "Social Media Manager & Engagement", nameEn: "Social Media Manager & Engagement", desc: "Planifiez, automatisez les commentaires et vos réponses sous contrôle", descEn: "Plan, automate smart comments and your replies securely", tier: "premium" },
      { id: "seo-ia", name: "SEO Assistant IA", nameEn: "AI SEO Assistant", desc: "Optimisez votre référencement naturel", descEn: "Optimize your organic search ranking", tier: "premium" },
      { id: "content-factory", name: "Content Factory IA", nameEn: "AI Content Factory", desc: "Production de contenu à grande échelle", descEn: "Content production at scale", tier: "premium" },
      { id: "veille", name: "Veille Concurrentielle IA", nameEn: "AI Competitive Intelligence", desc: "Surveillez vos concurrents automatiquement", descEn: "Monitor your competitors automatically", tier: "premium" },
    ],
  },
  {
    id: "commercial",
    slug: "developpement-commercial",
    name: "Développement Commercial",
    nameEn: "Business Development",
    desc: "Prospectez plus efficacement et concluez plus de ventes.",
    descEn: "Prospect more effectively and close more deals.",
    icon: TrendingUp,
    apps: [
      { id: "lead-gen-free", name: "Générateur de Leads Qualifiés", nameEn: "Qualified Lead Generator", desc: "Trouvez des prospects qualifiés pour votre activité", descEn: "Find qualified prospects for your business", tier: "free", badge: "Nouveau", badgeEn: "New", releaseDate: "2026-09-25T08:00:00" },
      { id: "lead-gen-pro", name: "Générateur de Leads (Premium)", nameEn: "Lead Generator (Premium)", desc: "Recherche avancée multi-canaux et enrichissement des données B2B", descEn: "Advanced multi-channel search and B2B data enrichment", tier: "premium", badge: "Nouveau", badgeEn: "New" },
      { id: "rdv-ia", name: "Préparation de RDV IA", nameEn: "AI Meeting Preparation", desc: "Préparez vos rendez-vous commerciaux en 2 minutes", descEn: "Prepare your sales meetings in 2 minutes", tier: "free", releaseDate: "2026-09-27T08:00:00" },
      { id: "email-prosp", name: "Générateur d'Emails de Prospection", nameEn: "Prospecting Email Generator", desc: "Des emails de prospection qui convertissent", descEn: "Prospecting emails that convert", tier: "free", releaseDate: "2026-09-29T08:00:00" },
      { id: "linkedin-auto", name: "Prospection Sociale VIP", nameEn: "VIP Social Prospecting", desc: "Invitations ciblées, relances et agent IA de messagerie (Type Connectly)", descEn: "Targeted invites, follow-ups and AI messaging agent", tier: "premium", badge: "Nouveau", badgeEn: "New" },
      { id: "network-graph", name: "Graphe de Relations & Intros", nameEn: "Relationship Graph & Intros", desc: "Générez des recommandations qualifiées via votre réseau (Warm Intros)", descEn: "Generate qualified referrals through your network (Warm Intros)", tier: "premium", badge: "Nouveau", badgeEn: "New" },
      { id: "crm-ia", name: "CRM Intelligent", nameEn: "Smart CRM", desc: "CRM augmenté par l'intelligence artificielle", descEn: "CRM enhanced by artificial intelligence", tier: "premium" },
      { id: "assist-comm", name: "Assistant Commercial IA", nameEn: "AI Sales Assistant", desc: "Votre copilot commercial au quotidien", descEn: "Your daily sales copilot", tier: "premium" },
      { id: "appel-offres", name: "Assistant Appels d'Offres IA", nameEn: "AI Tender Assistant", desc: "Répondez aux appels d'offres plus rapidement", descEn: "Respond to tenders faster", tier: "premium" },
    ],
  },
  {
    id: "assistants",
    slug: "assistants-copilot",
    name: "Assistants IA & Copilot",
    nameEn: "AI Assistants & Copilot",
    desc: "Des assistants intelligents intégrés à vos outils du quotidien.",
    descEn: "Intelligent assistants integrated into your daily tools.",
    icon: Bot,
    apps: [
      { id: "chat-entreprise", name: "Chat Entreprise IA", nameEn: "AI Enterprise Chat", desc: "Chatbot interne pour votre entreprise", descEn: "Internal chatbot for your company", tier: "free" },
      { id: "rech-doc", name: "Recherche Documentaire IA", nameEn: "AI Document Search", desc: "Trouvez instantanément dans vos documents", descEn: "Instantly search through your documents", tier: "free" },
      { id: "assist-reunion", name: "Assistant Réunion IA", nameEn: "AI Meeting Assistant", desc: "Prises de notes et actions automatiques", descEn: "Automatic note-taking and action items", tier: "free" },
      { id: "copilot-ms", name: "Microsoft Copilot", nameEn: "Microsoft Copilot", desc: "L'IA de Microsoft intégrée à Office 365", descEn: "Microsoft AI integrated into Office 365", tier: "premium" },
      { id: "rh-ia", name: "Assistant RH IA", nameEn: "AI HR Assistant", desc: "Gestion RH intelligente et automatisée", descEn: "Smart and automated HR management", tier: "premium" },
      { id: "qualite-ia", name: "Assistant Qualité IA", nameEn: "AI Quality Assistant", desc: "Contrôle qualité et conformité automatisés", descEn: "Automated quality control and compliance", tier: "premium" },
      { id: "agent-perso", name: "Agent IA Personnalisé", nameEn: "Custom AI Agent", desc: "Un agent IA conçu spécifiquement pour vous", descEn: "An AI agent designed specifically for you", tier: "premium" },
    ],
  },
  {
    id: "academie",
    slug: "academie-ia",
    name: "Académie IA",
    nameEn: "AI Academy",
    desc: "Formez-vous et montez en compétences sur l'IA appliquée au business.",
    descEn: "Train and build AI skills applied to business.",
    icon: GraduationCap,
    apps: [
      { id: "decouverte", name: "Découverte de l'IA", nameEn: "AI Discovery", desc: "Introduction gratuite à l'IA pour les pros", descEn: "Free AI introduction for professionals", tier: "free" },
      { id: "masterclass", name: "Masterclass Mensuelle", nameEn: "Monthly Masterclass", desc: "Un événement live chaque mois", descEn: "A live event every month", tier: "free" },
      { id: "prompts", name: "Bibliothèque de Prompts IA", nameEn: "AI Prompt Library", desc: "+500 prompts métiers prêts à l'emploi", descEn: "500+ ready-to-use business prompts", tier: "free" },
      { id: "form-chatgpt", name: "Formation ChatGPT", nameEn: "ChatGPT Training", desc: "Maîtrisez ChatGPT pour votre métier", descEn: "Master ChatGPT for your profession", tier: "premium" },
      { id: "form-copilot", name: "Formation Microsoft Copilot", nameEn: "Microsoft Copilot Training", desc: "Déployez Copilot dans votre organisation", descEn: "Deploy Copilot in your organization", tier: "premium" },
      { id: "certif", name: "Certification IA PME", nameEn: "SMB AI Certification", desc: "Obtenez la certification IA de votre entreprise", descEn: "Get your company's AI certification", tier: "premium" },
      { id: "parcours", name: "Parcours Métiers IA", nameEn: "AI Career Paths", desc: "Formations personnalisées par secteur", descEn: "Customized training by industry", tier: "premium" },
    ],
  },
  {
    id: "marketplace",
    slug: "marketplace-agents",
    name: "Marketplace d'Agents IA",
    nameEn: "AI Agent Marketplace",
    desc: "Déployez des agents IA autonomes pour vos processus métier.",
    descEn: "Deploy autonomous AI agents for your business processes.",
    icon: Store,
    apps: [
      { id: "agent-email", name: "Agent Email", nameEn: "Email Agent", desc: "Gère votre boîte email automatiquement", descEn: "Manages your email inbox automatically", tier: "free" },
      { id: "agent-reunion", name: "Agent Réunion", nameEn: "Meeting Agent", desc: "Organise et résume vos réunions", descEn: "Organizes and summarizes your meetings", tier: "free" },
      { id: "agent-recherche", name: "Agent Recherche", nameEn: "Research Agent", desc: "Effectue des recherches approfondies pour vous", descEn: "Conducts in-depth research for you", tier: "free" },
      { id: "agent-comm", name: "Agent Commercial", nameEn: "Sales Agent", desc: "Prospecte et qualifie vos leads", descEn: "Prospects and qualifies your leads", tier: "premium" },
      { id: "agent-fact", name: "Agent Facturation", nameEn: "Billing Agent", desc: "Gère vos devis et factures end-to-end", descEn: "Manages your quotes and invoices end-to-end", tier: "premium" },
      { id: "agent-rh", name: "Agent RH", nameEn: "HR Agent", desc: "Automatise vos processus RH", descEn: "Automates your HR processes", tier: "premium" },
      { id: "agent-ao", name: "Agent Appels d'Offres", nameEn: "Tender Agent", desc: "Rédige vos réponses aux appels d'offres", descEn: "Writes your tender responses", tier: "premium" },
    ],
  },
];

export const iaPlans: IAPlan[] = [
  {
    id: "gratuit",
    name: "Gratuit",
    nameEn: "Free",
    price: "0€",
    priceEn: "€0",
    features: [
      "Diagnostic IA Express",
      "2 masterclass par mois",
      "3 applications gratuites",
      "Bibliothèque de prompts",
    ],
    featuresEn: [
      "Express AI Diagnostic",
      "2 masterclasses per month",
      "3 free applications",
      "Prompt library",
    ],
    cta: "Commencer gratuitement",
    ctaEn: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    nameEn: "Pro",
    price: "29€",
    priceEn: "€29",
    period: "/mois",
    periodEn: "/month",
    features: [
      "Applications IA avancées",
      "Facturation IA",
      "Automatisations",
      "Support standard",
    ],
    featuresEn: [
      "Advanced AI applications",
      "AI Billing",
      "Automations",
      "Standard support",
    ],
    cta: "Démarrer l'essai Pro",
    ctaEn: "Start Pro trial",
  },
  {
    id: "business",
    name: "Business",
    nameEn: "Business",
    price: "99€",
    priceEn: "€99",
    period: "/mois",
    periodEn: "/month",
    featured: true,
    features: [
      "Tous les outils",
      "Agents IA illimités",
      "Formation incluse",
      "Reporting avancé",
    ],
    featuresEn: [
      "All tools included",
      "Unlimited AI agents",
      "Training included",
      "Advanced reporting",
    ],
    cta: "Démarrer Business",
    ctaEn: "Start Business",
  },
  {
    id: "entreprise",
    name: "Entreprise",
    nameEn: "Enterprise",
    price: "Sur devis",
    priceEn: "Custom",
    features: [
      "Agents IA sur mesure",
      "Microsoft Copilot",
      "Accompagnement dédié",
      "Intégration SI",
    ],
    featuresEn: [
      "Custom AI agents",
      "Microsoft Copilot",
      "Dedicated support",
      "IT integration",
    ],
    cta: "Contactez-nous",
    ctaEn: "Contact us",
  },
];

export const iaKpis = [
  { value: "70%", label: "de temps gagné sur l'administratif", labelEn: "time saved on admin tasks" },
  { value: "80%", label: "de réduction du temps documents", labelEn: "reduction in document time" },
  { value: "+30%", label: "de productivité commerciale", labelEn: "increase in sales productivity" },
  { value: "+25%", label: "d'amélioration de la rentabilité", labelEn: "improvement in profitability" },
];

export const iaJourney = [
  { 
    id: "diagnostic",
    step: "Écoute & Diagnostic", 
    stepEn: "Listening & Diagnostic",
    desc: "Audit sur-mesure de vos processus métiers pour évaluer votre maturité numérique sans engagement.",
    descEn: "Custom audit of your business processes to evaluate your digital maturity without commitment.",
    roi: "Rapport détaillé & estimation des gains potentiels",
    roiEn: "Detailed report & estimation of potential gains",
    icon: "Search"
  },
  { 
    id: "opportunites",
    step: "Identification & Opportunités", 
    stepEn: "Opportunity Identification",
    desc: "Sélection chirurgicale des cas d'usage IA les plus pertinents (ex: automatisation des devis, relation client).",
    descEn: "Surgical selection of the most relevant AI use cases (e.g., quote automation, customer relations).",
    roi: "Feuille de route chiffrée avec budget et ROI projeté",
    roiEn: "Costed roadmap with budget and projected ROI",
    icon: "Target"
  },
  { 
    id: "poc",
    step: "Implémentation Modulaire", 
    stepEn: "Modular Implementation",
    desc: "Pas d'usine à gaz. Nous déployons un premier module pilote pour prouver la valeur en conditions réelles.",
    descEn: "No turnkey blackbox. We deploy a first pilot module to prove value in real conditions.",
    roi: "Mesure concrète du temps gagné sur le pilote (ex: -30% administratif)",
    roiEn: "Concrete measurement of time saved on the pilot (e.g., -30% admin time)",
    icon: "Zap"
  },
  { 
    id: "formation",
    step: "Acculturation & Formation", 
    stepEn: "Training & Adoption",
    desc: "Formation de vos équipes via notre Académie IA pour garantir une adoption rapide et pérenne.",
    descEn: "Training of your teams via our AI Academy to ensure fast and lasting adoption.",
    roi: "Taux d'utilisation quotidien et satisfaction des équipes",
    roiEn: "Daily usage rate and team satisfaction",
    icon: "Users"
  },
  { 
    id: "scale",
    step: "Passage à l'Échelle", 
    stepEn: "Scaling Up",
    desc: "Déploiement étendu et intégration d'agents IA autonomes une fois la rentabilité validée.",
    descEn: "Extended deployment and integration of autonomous AI agents once profitability is validated.",
    roi: "+25% d'amélioration globale de la rentabilité",
    roiEn: "+25% overall profitability improvement",
    icon: "Rocket"
  }
];
