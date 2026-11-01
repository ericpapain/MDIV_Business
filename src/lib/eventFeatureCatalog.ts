// src/lib/eventFeatureCatalog.ts
// Catalogue officiel des fonctionnalités MDIV EVENT ENGINE

import { EventFeatureDefinition, FeatureCategory } from '@/types/eventEngine';

export const FEATURE_CATEGORIES: { id: FeatureCategory; label: string; description: string }[] = [
  {
    id: 'registration',
    label: '1. Inscription & Billetterie',
    description: 'Gestion des entrées, formulaire sur-mesure et jauges de participants.',
  },
  {
    id: 'networking',
    label: '2. Networking & Mise en relation',
    description: 'Annuaire participants, profil enrichi, pitch entreprise et rendez-vous 1-to-1.',
  },
  {
    id: 'presentation',
    label: '3. Présentation & Contenus',
    description: 'Programme dynamique, conférenciers et valorisation des partenaires.',
  },
  {
    id: 'interaction',
    label: '4. Interactivité & Animation',
    description: 'Sondages en direct, quiz compétitifs et tirage au sort tombola.',
  },
  {
    id: 'operations',
    label: '5. Régie & Opérations du Jour J',
    description: 'Badges avec QR Code, émargement à l’entrée et projection sur écran géant.',
  },
  {
    id: 'crm',
    label: '6. Synchronisation CRM & Suivi',
    description: 'Rapprochement des fiches contacts, historisation et pipeline commercial.',
  },
];

export const EVENT_FEATURE_CATALOG: EventFeatureDefinition[] = [
  // --- Catégorie 1 : Inscription ---
  {
    id: 'online_registration',
    name: 'Inscription en ligne native',
    description: 'Permet aux participants de s’inscrire directement sur le site MDIV sans passer par un lien de billetterie externe.',
    category: 'registration',
    iconName: 'Ticket',
    status: 'available',
    version: '1.0.0',
    dependencies: [],
    defaultSettings: {
      max_attendees: 100,
      auto_confirm: true,
      require_approval: false,
      send_email_confirmation: true,
      collect_phone: true,
      collect_company: true,
      collect_job_title: true,
    },
  },
  {
    id: 'custom_fields',
    name: 'Constructeur de questions sur-mesure',
    description: 'Ajoutez des questions personnalisées (choix multiples, menus, fichiers, dates) sans écrire de code.',
    category: 'registration',
    iconName: 'ListPlus',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      allow_conditional_logic: true,
    },
  },

  // --- Catégorie 2 : Networking ---
  {
    id: 'networking_wall',
    name: 'Networking Wall & Annuaire',
    description: 'Espace participants pour découvrir qui participe, rechercher par compétences et nouer des contacts.',
    category: 'networking',
    iconName: 'Users',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      allow_opt_out: true,
      show_company: true,
      show_linkedin: true,
      moderation_required: false,
    },
  },
  {
    id: 'pitch_directory',
    name: 'Pitch Entreprise participant',
    description: 'Chaque participant peut rédiger un pitch de 300 caractères présentant son activité et ses besoins.',
    category: 'networking',
    iconName: 'Megaphone',
    status: 'available',
    version: '1.0.0',
    dependencies: ['networking_wall'],
    defaultSettings: {
      max_characters: 300,
      allow_attachment: false,
    },
  },
  {
    id: 'b2b_meetings',
    name: 'Réservation de Rendez-vous 1-to-1',
    description: 'Planification de créneaux de discussion de 15 à 30 minutes entre participants pendant l’événement.',
    category: 'networking',
    iconName: 'CalendarClock',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      meeting_duration_minutes: 20,
      buffer_minutes: 10,
    },
  },

  // --- Catégorie 3 : Présentation ---
  {
    id: 'dynamic_program',
    name: 'Programme dynamique interactif',
    description: 'Déroulé des journées et créneaux horaires avec fiches conférenciers et ateliers thématiques.',
    category: 'presentation',
    iconName: 'CalendarDays',
    status: 'available',
    version: '1.0.0',
    dependencies: [],
    defaultSettings: {
      show_speaker_bios: true,
      allow_slot_bookmarking: false,
    },
  },
  {
    id: 'partners_showcase',
    name: 'Partenaires & Sponsors officiels',
    description: 'Mise en avant des logos, bannières et fiches descriptives des partenaires de l’événement.',
    category: 'presentation',
    iconName: 'Handshake',
    status: 'available',
    version: '1.0.0',
    dependencies: [],
    defaultSettings: {
      tiers: ['Platine', 'Or', 'Argent'],
      show_clickable_links: true,
    },
  },

  // --- Catégorie 4 : Interactivité ---
  {
    id: 'event_tombola',
    name: 'Tombola officielle & Tirage au sort sécurisé',
    description: 'Tirage au sort côté serveur auditable avec exclusion des gagnants précédents, gestion des lots et animation dynamique de révélation.',
    category: 'interaction',
    iconName: 'Sparkles',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      eligibility: 'checked_in_only',
      require_terms_consent: true,
      exclude_previous_winners: true,
    },
  },
  {
    id: 'gamification',
    name: 'Interactivité LIVE (Quiz & Sondages)',
    description: 'Animation en direct de la salle : sondages interactifs et quiz avec score en direct.',
    category: 'interaction',
    iconName: 'Trophy',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      quiz_enabled: true,
      show_leaderboard: true,
    },
  },
  {
    id: 'pro_diagnostic',
    name: 'Diagnostic Pro / Audit IA',
    description: 'Propose un diagnostic d’évaluation professionnel de maturité aux participants lors de leur inscription.',
    category: 'interaction',
    iconName: 'Sparkles',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      diagnostic_type: 'maturite_ia',
      attach_to_crm: true,
    },
  },

  // --- Catégorie 5 : Opérations ---
  {
    id: 'digital_badge',
    name: 'Badge numérique & QR Code d’émargement',
    description: 'Génère un badge nominatif avec QR Code cryptographique unique pour scanner et pointer les entrées.',
    category: 'operations',
    iconName: 'QrCode',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      qr_code_size: 200,
      show_company_logo: true,
      allow_pdf_download: true,
      badge_format: 'A6_standard',
    },
  },
  {
    id: 'live_screen',
    name: 'Écran Événementiel & Régie LIVE (1920x1080)',
    description: 'Affichage scène haute définition et pupitre de contrôle de régie : Welcome, Membres, Partenaires, Conférenciers, Pitchs, Networking, Tombola, QR et bandeaux d\'alerte.',
    category: 'operations',
    iconName: 'MonitorPlay',
    status: 'available',
    version: '1.0.0',
    dependencies: [],
    defaultSettings: {
      theme: 'luxury_dark',
      auto_advance_seconds: 20,
    },
  },

  // --- Catégorie 6 : CRM ---
  {
    id: 'crm_auto_sync',
    name: 'Synchronisation CRM temps réel',
    description: 'Rapproche automatiquement chaque inscrit du fichier client MDIV sans doublon et alimente le pipeline commercial.',
    category: 'crm',
    iconName: 'UserCheck',
    status: 'available',
    version: '1.0.0',
    dependencies: ['online_registration'],
    defaultSettings: {
      match_by_email: true,
      create_if_absent: true,
      default_status: 'prospect',
      record_interaction: true,
    },
  },
];

/**
 * Valide si les dépendances de chaque fonctionnalité activée sont satisfaites.
 */
export function validateFeatureDependencies(activeFeatureIds: string[]): {
  valid: boolean;
  errors: Record<string, string[]>; // featureId -> liste des dépendances manquantes
} {
  const activeSet = new Set(activeFeatureIds);
  const errors: Record<string, string[]> = {};
  let valid = true;

  for (const featureId of activeFeatureIds) {
    const def = EVENT_FEATURE_CATALOG.find(f => f.id === featureId);
    if (!def) continue;

    const missing = def.dependencies.filter(depId => !activeSet.has(depId));
    if (missing.length > 0) {
      valid = false;
      errors[featureId] = missing;
    }
  }

  return { valid, errors };
}

/**
 * Renvoie les fonctionnalités par catégorie.
 */
export function getFeaturesByCategory(category: FeatureCategory): EventFeatureDefinition[] {
  return EVENT_FEATURE_CATALOG.filter(f => f.category === category);
}

/**
 * Configuration par défaut des fonctionnalités pour un nouvel événement
 */
export const defaultEventFeatures: Record<string, { enabled: boolean; version: string; settings: Record<string, any> }> = {
  online_registration: { enabled: true, version: '1.0.0', settings: { max_attendees: 100, collect_phone: true, collect_company: true } },
  custom_fields: { enabled: true, version: '1.0.0', settings: {} },
  digital_badge: { enabled: true, version: '1.0.0', settings: { show_qr: true } },
  networking_wall: { enabled: true, version: '1.0.0', settings: { public_directory: true } },
  pitch_directory: { enabled: true, version: '1.0.0', settings: { max_characters: 300 } },
  b2b_meetings: { enabled: true, version: '1.0.0', settings: { meeting_duration_minutes: 20 } },
  event_tombola: { enabled: true, version: '1.0.0', settings: { eligibility: 'checked_in_only', exclude_previous_winners: true, require_terms_consent: true } },
  qr_checkin: { enabled: true, version: '1.0.0', settings: {} },
  crm_auto_sync: { enabled: true, version: '1.0.0', settings: { create_if_absent: true } },
  dynamic_program: { enabled: true, version: '1.0.0', settings: {} },
  speakers_directory: { enabled: false, version: '1.0.0', settings: {} },
  partners_showcase: { enabled: true, version: '1.0.0', settings: {} },
  live_screen: { enabled: false, version: '0.9.0', settings: {} },
};
