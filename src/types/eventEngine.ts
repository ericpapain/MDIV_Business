// src/types/eventEngine.ts
// Types stricts pour MDIV EVENT ENGINE - Architecture modulaire

export type FeatureCategory = 
  | 'registration' 
  | 'networking' 
  | 'interaction' 
  | 'presentation' 
  | 'operations' 
  | 'crm';

export type FeatureAvailability = 'available' | 'in_preparation' | 'unavailable';

export interface EventFeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  iconName: string; // Lucide icon identifier
  status: FeatureAvailability;
  version: string;
  dependencies: string[]; // IDs des fonctionnalités requises
  defaultSettings: Record<string, any>;
}

export interface EventFeatureConfig {
  enabled: boolean;
  version: string;
  settings: Record<string, any>;
  updated_at: string;
}

export type EventFeaturesMap = Record<string, EventFeatureConfig>;

// ============================================================================
// CONSTRUCTEUR DE CHAMPS PERSONNALISÉS (13 TYPES REQUIS)
// ============================================================================

export type CustomFieldType =
  | 'text'           // Texte court
  | 'textarea'       // Texte long
  | 'email'          // E-mail avec validation
  | 'phone'          // Téléphone
  | 'number'         // Nombre
  | 'date'           // Date
  | 'select'         // Liste déroulante
  | 'checkbox_group' // Choix multiple
  | 'radio'          // Choix unique
  | 'checkbox'       // Case à cocher unique
  | 'url'            // URL
  | 'file'           // Fichier joint
  | 'photo';         // Photo (avec prévisualisation)

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  allowed_extensions?: string[];
  max_file_size_mb?: number;
}

export interface ConditionalLogic {
  depend_on_field_key: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_checked';
  value: any;
}

export interface EventCustomField {
  id?: number;
  event_id: number;
  field_key: string;
  label: string;
  description?: string;
  field_type: CustomFieldType;
  is_required: boolean;
  default_value?: string;
  placeholder?: string;
  options?: FieldOption[];
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

// ============================================================================
// PARTICIPANTS & INSCRIPTION (EVENT ATTENDEES)
// ============================================================================

export type AttendeeStatus = 'registered' | 'confirmed' | 'attended' | 'cancelled';

export interface EventAttendee {
  id: number;
  event_id: number;
  client_id?: number | null; // Référence CRM existant
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  sector?: string;
  pitch_text?: string;
  expertises?: string[];
  linkedin_url?: string;
  photo_url?: string;
  photo_status?: 'pending' | 'approved' | 'rejected';
  ticket_code: string;
  status: AttendeeStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  badge_url?: string;
  networking_opt_in: boolean;
  photo_consent: boolean;
  gdpr_consent: boolean;
  acquisition_source?: string;
  selected_activities?: string[];
  custom_answers?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface RegistrationPayload {
  event_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  sector?: string;
  pitch_text?: string;
  expertises?: string[];
  linkedin_url?: string;
  photo_base64?: string;
  photo_filename?: string;
  networking_opt_in?: boolean;
  photo_consent?: boolean;
  gdpr_consent: boolean;
  selected_activities?: string[];
  custom_answers?: Record<string, any>;
  acquisition_source?: string;
}

export interface RegistrationResult {
  success: boolean;
  attendee?: EventAttendee;
  ticket_code: string;
  qr_code_data_url: string;
  client_id?: number | null;
  crm_synced: boolean;
  badge_url?: string;
  message?: string;
  error?: string;
}

// ============================================================================
// 1. PITCH ENTREPRISE (CANDIDATURE, MODÉRATION, ORDRE DE PASSAGE)
// ============================================================================
export type PitchStatus = 'pending' | 'approved' | 'rejected';

export interface EventPitch {
  id: number;
  event_id: number;
  attendee_id?: number | null;
  client_id?: number | null;
  company_name: string;
  project_title: string;
  presentation: string;
  needs: string;
  speaker_name: string;
  speaker_role?: string;
  speaker_bio?: string;
  speaker_avatar?: string;
  deck_url?: string;
  deck_filename?: string;
  status: PitchStatus;
  speaking_order?: number;
  pitch_time?: string;
  moderator_notes?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// 2. RÉSERVATION & RENDEZ-VOUS 1-TO-1 (B2B MEETINGS)
// ============================================================================
export type MeetingBookingStatus = 'confirmed' | 'cancelled';

export interface EventMeetingSlot {
  id: number;
  event_id: number;
  partner_id?: number | null;
  partner_name: string;
  partner_role?: string;
  partner_company?: string;
  partner_avatar?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location_mode: string;
  capacity: number;
  booked_count: number;
  is_available: boolean;
  booking_qr_url?: string;
}

export interface EventMeetingBooking {
  id: number;
  event_id: number;
  slot_id: number;
  partner_id?: number | null;
  partner_name: string;
  attendee_id?: number | null;
  client_id?: number | null;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  attendee_company?: string;
  status: MeetingBookingStatus;
  notes?: string;
  appointment_id?: number | null;
  created_at: string;
  cancelled_at?: string | null;
}

// ============================================================================
// 3. TOMBOLA & TIRAGE AU SORT AUDITABLE
// ============================================================================
export interface EventTombolaPrize {
  id: number;
  event_id: number;
  title: string;
  description: string;
  sponsor?: string;
  image_url?: string;
  winners_count: number;
  sort_order: number;
  drawn_count: number;
  is_drawn: boolean;
}

export interface EventTombolaDraw {
  id: number;
  event_id: number;
  prize_id: number;
  prize_title: string;
  winner_attendee_id: number;
  winner_name: string;
  winner_company?: string;
  winner_email: string;
  winner_ticket_code: string;
  draw_hash: string;
  drawn_at: string;
}

export interface TombolaRulesConfig {
  eligibility: 'all' | 'checked_in_only' | 'opt_in_only';
  require_terms_consent: boolean;
  exclude_previous_winners: boolean;
  closing_date?: string;
}

// ============================================================================
// 4. RÉGIE LIVE & ÉCRAN DE DIFFUSION (EVENT LIVE DISPLAY & CONTROL)
// ============================================================================
export type LiveSceneType =
  | 'welcome'
  | 'presentation'
  | 'members'
  | 'partners'
  | 'speakers'
  | 'networking'
  | 'pitches'
  | 'qr_booking'
  | 'statistics'
  | 'tombola'
  | 'closing';

export interface EventLiveState {
  id?: number;
  event_id: number;
  current_scene: LiveSceneType;
  is_auto_mode: boolean;
  auto_interval_seconds: number;
  ticker_message?: string;
  ticker_enabled: boolean;
  active_video_url?: string;
  is_video_playing: boolean;
  spotlight_attendee_id?: number | null;
  spotlight_speaker_name?: string | null;
  spotlight_qr_url?: string | null;
  spotlight_qr_title?: string | null;
  enabled_scenes: LiveSceneType[];
  updated_at: string;
}

export interface LiveStatsData {
  registered_count: number;
  checked_in_count: number;
  diagnostics_count: number;
  attendance_rate: number;
  next_speaker?: {
    name: string;
    role?: string;
    topic?: string;
    time?: string;
    avatar?: string;
  } | null;
  next_activity?: {
    title: string;
    time?: string;
    location?: string;
  } | null;
}



