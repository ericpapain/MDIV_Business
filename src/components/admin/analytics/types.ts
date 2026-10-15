// src/components/admin/analytics/types.ts

export interface KpiItem {
  value: number;
  trend: number;
  label: string;
  compare: string;
}

export interface AnalyticsKpis {
  visitors_today: KpiItem;
  unique_visitors: KpiItem;
  total_sessions: KpiItem;
  pageviews: KpiItem;
  avg_duration: KpiItem;
  pages_per_session: KpiItem;
  bounce_rate: KpiItem;
  realtime_active: KpiItem;
}

export interface TimelinePoint {
  date: string;
  visitors: number;
  sessions: number;
  pageviews: number;
}

export interface TopPageItem {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
  exit_rate: number;
}

export interface GeoItem {
  country?: string;
  city?: string;
  country_code: string;
  visitors: number;
  pageviews: number;
  percentage: number;
}

export interface VisitorHistoryRow {
  id: number;
  session_id: string;
  visitor_id: string;
  ip_address: string;
  country: string;
  country_code: string;
  city: string;
  page_path: string;
  page_title: string;
  referrer: string;
  referrer_source: string;
  browser: string;
  os: string;
  device_type: string;
  duration_seconds: number;
  conversion_event?: string | null;
  created_at: string;
}

export interface UserJourneyStep {
  page_path: string;
  page_title: string;
  created_at: string;
  duration_seconds: number;
  conversion_event?: string | null;
}

export interface UserJourney {
  session_id: string;
  visitor_id: string;
  ip_address: string;
  country: string;
  country_code?: string;
  city: string;
  session_start: string;
  steps_count: number;
  total_duration: number;
  conversion?: string | null;
  steps: UserJourneyStep[];
}

export interface TrafficSourceItem {
  source: string;
  visitors: number;
  sessions: number;
  pageviews?: number;
  conversions: number;
  percentage: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface RealtimeFeedItem {
  id: number;
  session_id: string;
  visitor_id: string;
  ip_address: string;
  country: string;
  country_code?: string;
  city: string;
  page_path: string;
  page_title: string;
  browser: string;
  os: string;
  device_type: string;
  seconds_ago: number;
  conversion_event?: string | null;
}

export interface AnalyticsData {
  period: string;
  kpis: AnalyticsKpis;
  timeline: TimelinePoint[];
  topPages: TopPageItem[];
  countries: GeoItem[];
  cities: GeoItem[];
  history: {
    total: number;
    limit: number;
    offset: number;
    rows: VisitorHistoryRow[];
  };
  journeys: UserJourney[];
  sources: TrafficSourceItem[];
  devices: DistributionItem[];
  browsers: DistributionItem[];
  os: DistributionItem[];
}
