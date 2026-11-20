// src/types/cafeRencontre.ts
// Définitions TypeScript complètes pour le module Café Rencontre

export type CampaignValidityType =
  | 'unlimited'
  | '1h'
  | '3h'
  | '6h'
  | '12h'
  | '24h'
  | '48h'
  | '7d'
  | 'custom';

export type RequestStatus =
  | 'new'
  | 'to_contact'
  | 'contact_established'
  | 'to_schedule'
  | 'confirmed'
  | 'completed'
  | 'closed'
  | 'cancelled';

export type MeetingFormat = 'client_premises' | 'cafe_public' | 'both';

export type AvailabilityType = 'morning' | 'afternoon' | 'flexible';

export interface CafeRencontreCampaign {
  id: number;
  slug: string;
  title: string;
  description?: string;
  event_date?: string;
  location?: string;
  image_url?: string;
  is_active: boolean | number;
  validity_type: CampaignValidityType;
  starts_at: string;
  expires_at?: string | null;
  contact_redirect_url?: string;
  views_count?: number;
  speakers_count?: number;
  requests_count?: number;
  is_expired?: boolean;
  status_computed?: 'active' | 'expired' | 'upcoming' | 'disabled';
  created_at: string;
  updated_at?: string;
}

export interface CafeRencontreSpeaker {
  id: number;
  campaign_id: number;
  attendee_id?: number | null;
  display_name: string;
  job_title?: string;
  company?: string;
  photo_url?: string;
  bio?: string;
  expertises?: string[] | string;
  topics?: string;
  location_zone?: string;
  sort_order: number;
  is_active: boolean | number;
  requests_count?: number;
  created_at: string;
}

export interface CafeRencontreRequest {
  id: number;
  campaign_id: number;
  speaker_id: number;
  campaign_title?: string;
  campaign_slug?: string;
  speaker_name?: string;
  speaker_company?: string;
  requester_name: string;
  company_name: string;
  job_title?: string;
  email: string;
  phone?: string;
  website?: string;
  sector?: string;
  main_topic: string;
  secondary_topics?: string[] | string;
  need_description?: string;
  meeting_format: MeetingFormat;
  city: string;
  postal_code?: string;
  availability?: AvailabilityType;
  preferred_date?: string;
  additional_comment?: string;
  consent_accepted: boolean | number;
  consent_at?: string;
  status: RequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PublicCampaignResponse {
  success: boolean;
  status: 'active' | 'expired' | 'upcoming' | 'disabled';
  campaign?: {
    id: number;
    slug: string;
    title: string;
    description?: string;
    event_date?: string;
    location?: string;
    image_url?: string;
    starts_at: string;
    expires_at?: string | null;
    contact_redirect_url: string;
  };
  speakers?: CafeRencontreSpeaker[];
  message?: string;
  contact_url?: string;
}

