export type RelationType = 
  | 'client' 
  | 'ambassador' 
  | 'business_referrer' 
  | 'partner' 
  | 'prospect' 
  | 'prescriber' 
  | 'other';

export type RelationStatus = 
  | 'prospect' 
  | 'contacted' 
  | 'discussion' 
  | 'active' 
  | 'inactive' 
  | 'completed';

export type ProjectStatus = 
  | 'idea' 
  | 'prospect' 
  | 'qualifying' 
  | 'planned' 
  | 'in_progress' 
  | 'waiting' 
  | 'blocked' 
  | 'completed' 
  | 'cancelled';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type KPICategory = 
  | 'acquisition' 
  | 'reseaux_sociaux' 
  | 'marketing' 
  | 'commercial' 
  | 'partenariat' 
  | 'ambassadeurs' 
  | 'projets' 
  | 'finance' 
  | 'evenementiel' 
  | 'contenu' 
  | 'site_web' 
  | 'autre';

export type KPIUnit = 
  | 'number' 
  | 'eur' 
  | 'percent' 
  | 'duration' 
  | 'score' 
  | 'views' 
  | 'followers' 
  | 'leads' 
  | 'qualified_contacts' 
  | 'conversions';

export type CampaignChannel = 
  | 'google_ads' 
  | 'instagram' 
  | 'facebook' 
  | 'linkedin' 
  | 'email' 
  | 'event' 
  | 'content' 
  | 'other';

export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'publication' 
  | 'content_creation' 
  | 'event' 
  | 'followup' 
  | 'proposal' 
  | 'appointment' 
  | 'campaign' 
  | 'other';

export type ActivityStatus = 'planned' | 'completed' | 'cancelled';

export type PeriodFilter = 
  | 'today' 
  | 'week' 
  | 'month' 
  | 'quarter' 
  | 'year' 
  | 'custom' 
  | 'all';

export interface Relation {
  id: number;
  name: string;
  first_name?: string;
  company?: string;
  role?: string;
  type: RelationType;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  address?: string;
  notes?: string;
  
  // Suivi Relation
  start_date?: string;
  status: RelationStatus;
  source?: string;
  manager?: string;
  relation_level?: string;
  last_contact_date?: string;
  next_contact_date?: string;
  next_action?: string;
  comments?: string;
  
  // Données de contrat / client si applicable
  contract_details?: {
    monthly_fee?: number; // ex: 700€ pour ITID
    duration?: string;
    services?: string[];
    contract_date?: string;
    review_6m_date?: string;
    specific_notes?: string;
  };

  // Performance agrégée
  leads_generated: number;
  qualified_contacts: number;
  projects_count: number;
  conversions_count: number;
  revenue_generated: number;
  potential_revenue: number;
  actions_count: number;
  events_count: number;
  recommendations_count: number;
  conversion_rate?: number; // %

  // Données spécifiques Ambassadeurs
  ambassador_metrics?: {
    posts_count: number;
    shares_count: number;
    mentions_count: number;
    engagement_rate: number;
    activity_score: number;
    weights?: {
      leads: number;
      conversions: number;
      engagement: number;
      activity: number;
      revenue: number;
    };
  };

  // Données spécifiques Apporteurs d'affaires
  referrer_metrics?: {
    commission_rate?: number;
    last_recommendation_date?: string;
    contracts_signed: number;
  };

  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  relation_id: number;
  client_name?: string;
  manager?: string;
  type?: string;
  start_date?: string;
  target_end_date?: string;
  actual_end_date?: string;
  budget: number;
  expected_revenue: number;
  actual_revenue: number;
  status: ProjectStatus;
  priority: PriorityLevel;
  progress_percent: number;
  objectives?: string;
  risks?: string;
  blockers?: string;
  next_actions?: string;
  notes?: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  id: number;
  name: string;
  description?: string;
  category: KPICategory;
  unit: KPIUnit;
  source?: string;
  frequency?: string;
  current_value: number;
  target_value: number;
  period?: string;
  manager?: string;
  status: 'on_track' | 'warning' | 'critical' | 'completed';
  calc_method?: string;
  last_updated?: string;
  is_contractual?: boolean;
  relation_id?: number;
  project_id?: number;
  is_demo: boolean;
}

export interface KPIObjective {
  id: number;
  kpi_id: number;
  kpi_name?: string;
  kpi_unit?: KPIUnit;
  relation_id?: number;
  project_id?: number;
  target_value: number;
  actual_value: number;
  period_start?: string;
  period_end?: string;
  status: 'in_progress' | 'achieved' | 'missed';
  notes?: string;
  is_demo: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  relation_id: number;
  client_name?: string;
  channel: CampaignChannel;
  objective?: string;
  budget: number;
  client_funded: boolean; // ex: true pour Google Ads ITID
  start_date?: string;
  end_date?: string;
  content_details?: string;
  impressions: number;
  views: number;
  clicks: number;
  leads: number;
  qualified_contacts: number;
  conversions: number;
  revenue_generated: number;
  is_demo: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  type: ActivityType;
  relation_id?: number;
  relation_name?: string;
  project_id?: number;
  project_name?: string;
  date: string;
  manager: string;
  status: ActivityStatus;
  title: string;
  comments?: string;
  next_action_title?: string;
  next_action_date?: string;
  is_demo: boolean;
  created_at: string;
}

export interface SixMonthReview {
  id: number;
  relation_id: number;
  client_name: string;
  contract_date: string;
  review_date: string;
  period_label: string;
  
  // Indicateurs contractuels
  followers_start: number;
  followers_current: number;
  qualified_contacts_target: number;
  qualified_contacts_real: number;
  content_adequacy_score: number; // sur 100
  
  // Détails opérationnels
  contents_produced_summary: string;
  social_media_summary: string;
  website_seo_summary: string;
  events_summary: string;
  google_ads_summary: string;
  
  // Analyse
  positive_points: string[];
  challenges_faced: string[];
  client_feedback?: string;
  internal_recommendations: string[];
  next_actions_plan: string[];
  
  status: 'draft' | 'validated' | 'shared';
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerformanceStatsSummary {
  active_relations: number;
  new_contacts: number;
  qualified_contacts: number;
  leads_generated: number;
  active_projects: number;
  completed_projects: number;
  conversion_rate: number;
  revenue_generated: number;
  potential_revenue: number;
  active_partners: number;
  active_ambassadors: number;
  active_referrers: number;
  actions_completed: number;
  actions_delayed: number;
}
