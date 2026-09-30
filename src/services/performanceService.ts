import { 
  Relation, 
  Project, 
  KPI, 
  Campaign, 
  Activity, 
  SixMonthReview, 
  PerformanceStatsSummary 
} from "@/types/performance";

/**
 * Calcul sécurisé de l'écart entre cible et réalisé
 */
export function calculateVariance(target: number, actual: number): {
  absolute: number;
  percent: number | null;
  percentFormatted: string;
  trend: "positive" | "negative" | "neutral";
} {
  const absolute = actual - target;
  if (!target || target === 0) {
    return {
      absolute,
      percent: null,
      percentFormatted: "N/A",
      trend: absolute > 0 ? "positive" : absolute < 0 ? "negative" : "neutral",
    };
  }
  const pct = Math.round((absolute / target) * 100 * 10) / 10;
  return {
    absolute,
    percent: pct,
    percentFormatted: `${pct > 0 ? "+" : ""}${pct}%`,
    trend: pct > 0 ? "positive" : pct < 0 ? "negative" : "neutral",
  };
}

/**
 * Calcul sécurisé du taux de conversion
 */
export function calculateRate(numerator: number, denominator: number): number | null {
  if (!denominator || denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100 * 10) / 10;
}

/**
 * Calcul du score transparent de l'ambassadeur basé sur les pondérations configurables
 */
export function calculateAmbassadorScore(
  metrics: {
    leads: number;
    conversions: number;
    engagementRate: number;
    activityScore: number;
    revenue: number;
  },
  weights = {
    leads: 25,
    conversions: 25,
    engagement: 20,
    activity: 15,
    revenue: 15,
  }
): { score: number; breakdown: Record<string, number> } {
  const normLeads = Math.min(metrics.leads * 10, 100);
  const normConv = Math.min(metrics.conversions * 20, 100);
  const normEng = Math.min(metrics.engagementRate * 10, 100);
  const normAct = Math.min(metrics.activityScore, 100);
  const normRev = Math.min((metrics.revenue / 5000) * 100, 100);

  const totalWeights = (weights.leads + weights.conversions + weights.engagement + weights.activity + weights.revenue) || 100;

  const score = Math.round(
    (normLeads * weights.leads +
      normConv * weights.conversions +
      normEng * weights.engagement +
      normAct * weights.activity +
      normRev * weights.revenue) / totalWeights
  );

  return {
    score,
    breakdown: {
      leadsContribution: Math.round((normLeads * weights.leads) / totalWeights),
      conversionsContribution: Math.round((normConv * weights.conversions) / totalWeights),
      engagementContribution: Math.round((normEng * weights.engagement) / totalWeights),
      activityContribution: Math.round((normAct * weights.activity) / totalWeights),
      revenueContribution: Math.round((normRev * weights.revenue) / totalWeights),
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount || 0);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat("fr-FR").format(val || 0);
}

// ─── INITIAL MOCK DATA (CAS RÉEL ITID & BALISAGE DÉMO) ───────────────────────

const INITIAL_DATA = {
  relations: [
    {
      id: 1,
      name: "Institut ITID",
      company: "ITID",
      role: "Client Contractuel",
      type: "client" as const,
      status: "active" as const,
      email: "contact@itid.fr",
      phone: "01 00 00 00 00",
      website: "https://itid.fr",
      linkedin: "https://linkedin.com/company/itid",
      instagram: "https://instagram.com/itid",
      start_date: "2026-05-01",
      source: "Signature convention MDIV Business",
      manager: "Éric MEZATIO",
      relation_level: "Stratégique",
      last_contact_date: "2026-09-18",
      next_contact_date: "2026-10-10",
      next_action: "Validation des contenus vidéo et logistique captation 24 oct Essoyes",
      contract_details: {
        monthly_fee: 700,
        duration: "Indéterminée (avec bilan d'étape à 6 mois)",
        services: [
          "Animation des réseaux sociaux (Instagram, Facebook, LinkedIn)",
          "Création et publication de contenus réguliers, reels et shorts",
          "Valorisation de l'expertise médicale (respect strict déontologie & RGPD)",
          "Refonte et suivi éditorial du site internet",
          "Accompagnement lors d'événements professionnels & captation vidéo",
          "Conseil & pilotage stratégique Google Ads (campagnes financées par ITID)"
        ],
        contract_date: "2026-05-01",
        review_6m_date: "2026-11-01",
        specific_notes: "Convention de partenariat et prestations de marketing digital. Forfait mensuel 700 € TTC."
      },
      leads_generated: 68,
      qualified_contacts: 37,
      projects_count: 3,
      conversions_count: 24,
      revenue_generated: 3500,
      potential_revenue: 8400,
      actions_count: 18,
      events_count: 3,
      recommendations_count: 0,
      conversion_rate: 35.3,
      is_demo: false,
      created_at: "2026-05-01",
      updated_at: "2026-09-20"
    },
    {
      id: 2,
      name: "Dr. Alexandre Dupont",
      company: "Cabinet Médical Avenir",
      role: "Médecin Référent & Ambassadeur",
      type: "ambassador" as const,
      status: "active" as const,
      email: "alexandre.dupont@demo.fr",
      phone: "06 12 34 56 78",
      website: "https://demo-ambassadeur.fr",
      linkedin: "https://linkedin.com/in/demo",
      start_date: "2026-06-01",
      source: "Événement BNE",
      manager: "Éric MEZATIO",
      relation_level: "Partenaire Privilégié",
      last_contact_date: "2026-09-10",
      next_contact_date: "2026-10-15",
      next_action: "Relance invitation événement Essoyes",
      ambassador_metrics: {
        posts_count: 12,
        shares_count: 34,
        mentions_count: 19,
        engagement_rate: 5.2,
        activity_score: 85,
        weights: { leads: 25, conversions: 25, engagement: 20, activity: 15, revenue: 15 }
      },
      leads_generated: 14,
      qualified_contacts: 9,
      projects_count: 1,
      conversions_count: 4,
      revenue_generated: 2800,
      potential_revenue: 5000,
      actions_count: 6,
      events_count: 2,
      recommendations_count: 4,
      conversion_rate: 28.6,
      is_demo: true,
      created_at: "2026-06-01",
      updated_at: "2026-09-20"
    },
    {
      id: 3,
      name: "Synergie Consultants",
      company: "Synergie Conseil SARL",
      role: "Directeur Associé",
      type: "business_referrer" as const,
      status: "active" as const,
      email: "contact@synergie-demo.fr",
      phone: "01 45 67 89 00",
      website: "https://synergie-demo.fr",
      linkedin: "https://linkedin.com/company/synergie-demo",
      start_date: "2026-07-01",
      source: "Réseau BNE",
      manager: "Éric MEZATIO",
      relation_level: "Actif",
      last_contact_date: "2026-09-02",
      next_contact_date: "2026-10-05",
      next_action: "Point mensuel sur les opportunités qualifiées",
      referrer_metrics: {
        commission_rate: 10,
        last_recommendation_date: "2026-09-02",
        contracts_signed: 2
      },
      leads_generated: 8,
      qualified_contacts: 5,
      projects_count: 2,
      conversions_count: 2,
      revenue_generated: 4500,
      potential_revenue: 12000,
      actions_count: 5,
      events_count: 1,
      recommendations_count: 3,
      conversion_rate: 25.0,
      is_demo: true,
      created_at: "2026-07-01",
      updated_at: "2026-09-20"
    }
  ],
  projects: [
    {
      id: 1,
      name: "Refonte & Optimisation Éditoriale Site ITID",
      description: "Modernisation ergonomique du site web, optimisation mobile et SEO médical.",
      relation_id: 1,
      client_name: "Institut ITID",
      manager: "Éric MEZATIO",
      type: "Site Web & SEO",
      start_date: "2026-05-15",
      target_end_date: "2026-10-30",
      budget: 1400,
      expected_revenue: 1400,
      actual_revenue: 1400,
      status: "in_progress" as const,
      priority: "high" as const,
      progress_percent: 70,
      objectives: "Augmenter le taux de conversion visiteur en prise de contact qualifiée.",
      risks: "Validation des maquettes et conformité réglementaire de communication de santé.",
      next_actions: "Mise en ligne de la nouvelle section expertise & formulaires simplifiés.",
      is_demo: false,
      created_at: "2026-05-15",
      updated_at: "2026-09-20"
    },
    {
      id: 2,
      name: "Production Contenus Courts (Reels & Shorts) & Réseaux ITID",
      description: "Scénarisation, montage et diffusion multicanale (Instagram, FB, LinkedIn).",
      relation_id: 1,
      client_name: "Institut ITID",
      manager: "Éric MEZATIO",
      type: "Contenu & Réseaux",
      start_date: "2026-06-01",
      target_end_date: "2026-11-30",
      budget: 2100,
      expected_revenue: 2100,
      actual_revenue: 2100,
      status: "in_progress" as const,
      priority: "high" as const,
      progress_percent: 60,
      objectives: "Atteindre +500 abonnés engagés et renforcer l'autorité médicale.",
      risks: "Disponibilité des praticiens pour la captation.",
      next_actions: "Tournage du prochain lot de 6 vidéos format court.",
      is_demo: false,
      created_at: "2026-06-01",
      updated_at: "2026-09-20"
    },
    {
      id: 3,
      name: "Captation Événementielle & Valorisation BNE (Essoyes & Paris)",
      description: "Captation vidéo sur site lors du BNE Essoyes (24 oct) et de Paris (nov 2026).",
      relation_id: 1,
      client_name: "Institut ITID",
      manager: "Éric MEZATIO",
      type: "Événementiel & Vidéo",
      start_date: "2026-10-24",
      target_end_date: "2026-11-30",
      budget: 700,
      expected_revenue: 700,
      actual_revenue: 700,
      status: "planned" as const,
      priority: "urgent" as const,
      progress_percent: 25,
      objectives: "Couvrir l'événement, réaliser des interviews professionnelles et générer du lead qualifié.",
      risks: "Conditions techniques de prise de vue sur le salon.",
      next_actions: "Validation du matériel caméra et calage du planning des intervenants.",
      is_demo: false,
      created_at: "2026-09-01",
      updated_at: "2026-09-20"
    }
  ],
  kpis: [
    {
      id: 1,
      name: "Évolution des abonnés sur les réseaux sociaux",
      description: "Progression cumulée de la communauté ITID sur Instagram, Facebook et LinkedIn (Indicateur Contractuel Majeur).",
      category: "reseaux_sociaux" as const,
      unit: "followers" as const,
      source: "Comptes officiels ITID",
      frequency: "mensuel",
      current_value: 850,
      target_value: 1200,
      period: "Semestre 1",
      manager: "Éric MEZATIO",
      status: "on_track" as const,
      calc_method: "Somme des abonnés vérifiés Instagram + LinkedIn + Facebook",
      last_updated: "2026-09-20",
      is_contractual: true,
      relation_id: 1,
      is_demo: false
    },
    {
      id: 2,
      name: "Nombre de contacts qualifiés générés",
      description: "Demandes entrantes ciblées et qualifiées transmises à l'institut (Indicateur Contractuel Majeur).",
      category: "commercial" as const,
      unit: "qualified_contacts" as const,
      source: "Formulaires site web & messages directs",
      frequency: "mensuel",
      current_value: 37,
      target_value: 50,
      period: "Semestre 1",
      manager: "Éric MEZATIO",
      status: "on_track" as const,
      calc_method: "Contacts ayant complété le formulaire ou formulé un besoin vérifié",
      last_updated: "2026-09-20",
      is_contractual: true,
      relation_id: 1,
      is_demo: false
    },
    {
      id: 3,
      name: "Adéquation des contenus produits aux objectifs",
      description: "Indice de satisfaction et conformité de la ligne éditoriale validée par le client (Indicateur Contractuel Majeur).",
      category: "contenu" as const,
      unit: "score" as const,
      source: "Revue éditoriale conjointe ITID / MDIV",
      frequency: "mensuel",
      current_value: 92,
      target_value: 95,
      period: "Semestre 1",
      manager: "Éric MEZATIO",
      status: "on_track" as const,
      calc_method: "Taux de validation sans retouche majeure sur 100 points",
      last_updated: "2026-09-20",
      is_contractual: true,
      relation_id: 1,
      is_demo: false
    }
  ],
  campaigns: [
    {
      id: 1,
      name: "Campagne Google Ads Search — Expertise & Soins ITID",
      relation_id: 1,
      client_name: "Institut ITID",
      channel: "google_ads" as const,
      objective: "Génération de contacts qualifiés locaux",
      budget: 600,
      client_funded: true,
      start_date: "2026-06-15",
      end_date: "2026-09-30",
      content_details: "Mots-clés ciblés sur les pôles d'excellence. Budget financé directement par ITID selon convention.",
      impressions: 18500,
      views: 0,
      clicks: 940,
      leads: 52,
      qualified_contacts: 31,
      conversions: 14,
      revenue_generated: 4200,
      is_demo: false,
      created_at: "2026-06-15"
    }
  ],
  activities: [
    {
      id: 1,
      type: "meeting" as const,
      relation_id: 1,
      relation_name: "Institut ITID",
      project_id: 1,
      project_name: "Refonte & Optimisation Éditoriale Site ITID",
      date: "2026-09-15",
      manager: "Éric MEZATIO",
      status: "completed" as const,
      title: "Comité de pilotage mensuel ITID & revue des statistiques d'audience",
      comments: "Validation des maquettes responsive du site internet et analyse des retours Google Ads.",
      next_action_title: "Finaliser l'intégration des 3 nouveaux formulaires qualifiés",
      next_action_date: "2026-09-28",
      is_demo: false,
      created_at: "2026-09-15"
    },
    {
      id: 2,
      type: "event" as const,
      relation_id: 1,
      relation_name: "Institut ITID",
      date: "2026-10-24",
      manager: "Éric MEZATIO",
      status: "planned" as const,
      title: "Captation vidéo & Networking — BNE Essoyes 2026",
      comments: "Présence sur place avec équipe MDIV pour captation des interventions et interviews professionnelles.",
      next_action_title: "Calage logistique et matériel avec Micke et équipe technique",
      next_action_date: "2026-10-15",
      is_demo: false,
      created_at: "2026-09-18"
    }
  ],
  sixMonthReviews: [
    {
      id: 1,
      relation_id: 1,
      client_name: "Institut ITID",
      contract_date: "2026-05-01",
      review_date: "2026-11-01",
      period_label: "Bilan Intermédiaire 6 Mois",
      followers_start: 320,
      followers_current: 850,
      qualified_contacts_target: 50,
      qualified_contacts_real: 37,
      content_adequacy_score: 92,
      contents_produced_summary: "24 publications feed, 16 formats courts reels/shorts, 8 articles de fond orientés expertise médicale.",
      social_media_summary: "Progression de +165% de la communauté cumulée. Taux d'engagement moyen de 4.8% sur Instagram.",
      website_seo_summary: "Refonte UI livrée à 70%, temps de chargement réduit de 40%, hausse du référencement local.",
      events_summary: "Préparation active du BNE Essoyes (24 oct 2026) et de l'événement Paris (nov 2026).",
      google_ads_summary: "Campagne Search optimisée avec un coût par contact qualifié de 19,35 € financé par le client.",
      positive_points: [
        "Forte adhésion de l'audience aux vidéos courtes explicatives",
        "Excellente synergie et réactivité dans la validation des contenus",
        "Montée en puissance constante du nombre de contacts qualifiés"
      ],
      challenges_faced: [
        "Délai de disponibilité des praticiens pour les tournages en présentiel",
        "Nécessité de relancer rapidement les prospects sous 24h ouvrées"
      ],
      client_feedback: "Très grande satisfaction de l'institut quant au professionnalisme et à la clarté des livrables.",
      internal_recommendations: [
        "Accélérer sur le format vidéo court après la captation d'Essoyes",
        "Mettre en place un outil de prise de rendez-vous automatique synchronisé",
        "Augmenter le budget Google Ads sur les créneaux à fort taux de conversion"
      ],
      next_actions_plan: [
        "Déploiement complet de la nouvelle version du site au 30 octobre",
        "Couverture vidéo exhaustive à Essoyes le 24 octobre",
        "Tenue de la session d'évaluation formelle du semestre au 15 novembre 2026"
      ],
      status: "draft" as const,
      is_demo: false,
      created_at: "2026-09-01",
      updated_at: "2026-09-20"
    }
  ]
};

function getLocalStore() {
  const stored = localStorage.getItem("mdiv_performance_local_data");
  if (!stored) {
    localStorage.setItem("mdiv_performance_local_data", JSON.stringify(INITIAL_DATA));
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
  try {
    return JSON.parse(stored);
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveLocalStore(data: any) {
  localStorage.setItem("mdiv_performance_local_data", JSON.stringify(data));
}

function computeSummary(relations: Relation[], projects: Project[], activities: Activity[]): PerformanceStatsSummary {
  const active_relations = relations.filter(r => r.status === 'active').length;
  const total_leads = relations.reduce((acc, r) => acc + (r.leads_generated || 0), 0);
  const total_qualified = relations.reduce((acc, r) => acc + (r.qualified_contacts || 0), 0);
  const total_conversions = relations.reduce((acc, r) => acc + (r.conversions_count || 0), 0);
  const total_revenue = relations.reduce((acc, r) => acc + (r.revenue_generated || 0), 0);
  const total_potential = relations.reduce((acc, r) => acc + (r.potential_revenue || 0), 0);
  const active_projects = projects.filter(p => ['in_progress', 'planned', 'qualifying'].includes(p.status)).length;
  const completed_projects = projects.filter(p => p.status === 'completed').length;
  const active_partners = relations.filter(r => r.type === 'partner' && r.status === 'active').length;
  const active_ambassadors = relations.filter(r => r.type === 'ambassador' && r.status === 'active').length;
  const active_referrers = relations.filter(r => r.type === 'business_referrer' && r.status === 'active').length;
  const actions_completed = activities.filter(a => a.status === 'completed').length;
  const today = new Date().toISOString().slice(0, 10);
  const actions_delayed = activities.filter(a => a.status === 'planned' && a.date < today).length;
  const conversion_rate = total_leads > 0 ? Math.round((total_conversions / total_leads) * 100 * 10) / 10 : 0;

  return {
    active_relations,
    new_contacts: relations.length,
    qualified_contacts: total_qualified,
    leads_generated: total_leads,
    active_projects,
    completed_projects,
    conversion_rate,
    revenue_generated: total_revenue,
    potential_revenue: total_potential,
    active_partners,
    active_ambassadors,
    active_referrers,
    actions_completed,
    actions_delayed,
  };
}

// ─── API CLIENT AVEC FALLBACK LOCAL TRANSPARENT ─────────────────────────────

const API_URL = "/api-performance.php";

export const performanceApi = {
  async getAll(): Promise<{
    relations: Relation[];
    projects: Project[];
    kpis: KPI[];
    campaigns: Campaign[];
    activities: Activity[];
    sixMonthReviews: SixMonthReview[];
    summary: PerformanceStatsSummary;
  }> {
    try {
      const res = await fetch(`${API_URL}?action=get_all`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      // En local sans serveur PHP, bascule transparente sur le store local
    }

    const store = getLocalStore();
    return {
      relations: store.relations,
      projects: store.projects,
      kpis: store.kpis,
      campaigns: store.campaigns,
      activities: store.activities,
      sixMonthReviews: store.sixMonthReviews,
      summary: computeSummary(store.relations, store.projects, store.activities),
    };
  },

  async saveRelation(relation: Partial<Relation>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_relation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(relation),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    if (relation.id) {
      store.relations = store.relations.map((r: Relation) =>
        r.id === relation.id ? { ...r, ...relation, updated_at: new Date().toISOString() } : r
      );
    } else {
      const newRel = {
        ...relation,
        id: Date.now(),
        leads_generated: 0,
        qualified_contacts: 0,
        projects_count: 0,
        conversions_count: 0,
        revenue_generated: 0,
        potential_revenue: 0,
        actions_count: 0,
        events_count: 0,
        recommendations_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.relations.unshift(newRel);
    }
    saveLocalStore(store);
    return { success: true };
  },

  async deleteRelation(id: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=delete_relation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.relations = store.relations.filter((r: Relation) => r.id !== id);
    saveLocalStore(store);
    return true;
  },

  async saveProject(project: Partial<Project>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    if (project.id) {
      store.projects = store.projects.map((p: Project) =>
        p.id === project.id ? { ...p, ...project } : p
      );
    } else {
      store.projects.unshift({ ...project, id: Date.now() });
    }
    saveLocalStore(store);
    return { success: true };
  },

  async deleteProject(id: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=delete_project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.projects = store.projects.filter((p: Project) => p.id !== id);
    saveLocalStore(store);
    return true;
  },

  async saveKPI(kpi: Partial<KPI>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_kpi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kpi),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    if (kpi.id) {
      store.kpis = store.kpis.map((k: KPI) => (k.id === kpi.id ? { ...k, ...kpi } : k));
    } else {
      store.kpis.push({ ...kpi, id: Date.now() });
    }
    saveLocalStore(store);
    return { success: true };
  },

  async updateKPIValue(id: number, current_value: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=update_kpi_value`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, current_value }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.kpis = store.kpis.map((k: KPI) =>
      k.id === id ? { ...k, current_value, last_updated: new Date().toISOString().slice(0, 10) } : k
    );
    saveLocalStore(store);
    return true;
  },

  async deleteKPI(id: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=delete_kpi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.kpis = store.kpis.filter((k: KPI) => k.id !== id);
    saveLocalStore(store);
    return true;
  },

  async saveActivity(activity: Partial<Activity>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    if (activity.id) {
      store.activities = store.activities.map((a: Activity) =>
        a.id === activity.id ? { ...a, ...activity } : a
      );
    } else {
      store.activities.unshift({ ...activity, id: Date.now() });
    }
    saveLocalStore(store);
    return { success: true };
  },

  async deleteActivity(id: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=delete_activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.activities = store.activities.filter((a: Activity) => a.id !== id);
    saveLocalStore(store);
    return true;
  },

  async saveCampaign(campaign: Partial<Campaign>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    if (campaign.id) {
      store.campaigns = store.campaigns.map((c: Campaign) =>
        c.id === campaign.id ? { ...c, ...campaign } : c
      );
    } else {
      store.campaigns.unshift({ ...campaign, id: Date.now() });
    }
    saveLocalStore(store);
    return { success: true };
  },

  async deleteCampaign(id: number): Promise<boolean> {
    try {
      await fetch(`${API_URL}?action=delete_campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {}

    const store = getLocalStore();
    store.campaigns = store.campaigns.filter((c: Campaign) => c.id !== id);
    saveLocalStore(store);
    return true;
  },

  async saveSixMonthReview(review: Partial<SixMonthReview>): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?action=save_six_month_review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const store = getLocalStore();
    store.sixMonthReviews = [review as SixMonthReview];
    saveLocalStore(store);
    return { success: true };
  },

  exportRelationsCSV(relations: Relation[]): void {
    const headers = ["Nom", "Entreprise", "Type", "Statut", "Email", "Téléphone", "Leads", "Contacts Qualifiés", "CA Généré", "CA Potentiel"];
    const rows = relations.map(r => [
      `"${r.name || ''}"`,
      `"${r.company || ''}"`,
      `"${r.type || ''}"`,
      `"${r.status || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      r.leads_generated || 0,
      r.qualified_contacts || 0,
      r.revenue_generated || 0,
      r.potential_revenue || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_relations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
