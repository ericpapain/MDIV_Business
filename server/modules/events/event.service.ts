// server/modules/events/event.service.ts
// Service central du moteur événementiel MDIV EVENT ENGINE

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { getDb, saveDb } from '../../database/db-connection';
import type { 
  EventCustomField, 
  EventAttendee, 
  RegistrationPayload, 
  RegistrationResult,
  EventPitch,
  PitchStatus,
  EventMeetingSlot,
  EventMeetingBooking,
  EventTombolaPrize,
  EventTombolaDraw
} from '../../../src/types/eventEngine';

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'assets', 'uploads');

export class EventService {
  constructor() {
    this.ensureUploadsDir();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  private ensureDbCollections() {
    const db = getDb();
    if (!Array.isArray(db.events)) {
      db.events = [
        {
          id: 1,
          title: "BNE × ESSOYES — Business Networking Experience",
          title_en: "BNE × ESSOYES — Luxury Business Networking",
          date: "2026-11-20T10:00:00",
          location: "Domaine Historique, Essoyes (Aube)",
          description: "Le sommet annuel réunissant dirigeants, professionnels de santé, artisans d’art et investisseurs. Conférences plénières, ateliers sectoriels, networking B2B qualifié et dîner de gala.",
          description_en: "Annual executive summit bringing together leaders, healthcare executives and investors.",
          image_url: "/it4work.png",
          type: "Événement",
          price: "150 € TTC",
          billetterie_url: "",
          event_code: "BNE26",
          status: "upcoming",
          max_attendees: 120,
          is_registration_open: 1,
          features_config: {
            online_registration: { enabled: true, version: "1.0.0", settings: { max_attendees: 120, collect_phone: true, collect_company: true } },
            custom_fields: { enabled: true, version: "1.0.0", settings: {} },
            digital_badge: { enabled: true, version: "1.0.0", settings: { show_qr: true } },
            networking_wall: { enabled: true, version: "1.0.0", settings: { public_directory: true } },
            pitch_directory: { enabled: true, version: "1.0.0", settings: { max_characters: 300 } },
            crm_auto_sync: { enabled: true, version: "1.0.0", settings: { create_if_absent: true } },
            dynamic_program: { enabled: true, version: "1.0.0", settings: {} },
            partners_showcase: { enabled: true, version: "1.0.0", settings: {} }
          },
          program: [
            {
              day_label: "Vendredi 20 Novembre 2026",
              day_label_en: "Friday November 20th, 2026",
              slots: [
                { time: "09:00 - 10:00", title: "Accueil Café & Remise des Badges QR", title_en: "Welcome Coffee & Badges", description: "Émargement numérique à l’accueil et networking informel.", description_en: "Digital check-in and breakfast.", icon: "coffee" },
                { time: "10:00 - 12:30", title: "Keynote : Transformation Numérique & IA dans le B2B", title_en: "Keynote : AI in B2B", description: "Retours d’expérience concrets par nos experts et partenaires.", description_en: "Executive presentations.", icon: "mic" },
                { time: "12:30 - 14:00", title: "Cocktail Déjeuner & Dégustation", title_en: "Networking Lunch", description: "Échanges libres autour du buffet gastronomique champenois.", description_en: "Lunch and drinks.", icon: "dinner" },
                { time: "14:00 - 17:00", title: "Sessions Pitch & Rendez-vous d’affaires 1-to-1", title_en: "1-to-1 Business Meetings", description: "Rencontres bilatérales pré-qualifiées sur le Networking Wall.", description_en: "Pre-matched business sessions.", icon: "network" }
              ]
            }
          ],
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Sommet Privé Investissement & Patrimoine",
          title_en: "Private Wealth & Investment Summit",
          date: "2026-12-05T14:30:00",
          location: "Hôtel Napoléon, Paris (8ème)",
          description: "Rencontre sélective sur la valorisation patrimoniale, la fiscalité d'entreprise et les véhicules d'investissement alternatifs.",
          description_en: "Exclusive gathering dedicated to wealth preservation.",
          image_url: "",
          type: "Événement",
          price: "Accès Invité",
          billetterie_url: "",
          event_code: "INV26",
          status: "upcoming",
          max_attendees: 50,
          is_registration_open: 1,
          features_config: {
            online_registration: { enabled: true, version: "1.0.0", settings: { max_attendees: 50 } },
            digital_badge: { enabled: true, version: "1.0.0", settings: {} },
            crm_auto_sync: { enabled: true, version: "1.0.0", settings: {} }
          },
          program: [],
          created_at: new Date().toISOString()
        }
      ];
    }

    if (!Array.isArray(db.event_custom_fields)) {
      db.event_custom_fields = [
        {
          id: 1,
          event_id: 1,
          field_key: "activity_sector",
          label: "Quel est votre secteur d'activité principal ?",
          field_type: "select",
          is_required: true,
          options: [
            { label: "BTP, Artisans & Rénovation", value: "btp" },
            { label: "Santé, Médical & Praticiens", value: "sante" },
            { label: "Immobilier, Architecture & Gestion", value: "immobilier" },
            { label: "Conseil, Droit & Expertise Comptable", value: "conseil" },
            { label: "Tech, Digital & Médias", value: "tech" }
          ],
          sort_order: 1,
          is_active: true
        },
        {
          id: 2,
          event_id: 1,
          field_key: "main_goal",
          label: "Quel est votre objectif principal pour cette journée ?",
          field_type: "radio",
          is_required: true,
          options: [
            { label: "Développer mon réseau et trouver des prescripteurs", value: "prescripteurs" },
            { label: "Découvrir les solutions IA pour mon entreprise", value: "ia_solutions" },
            { label: "Présenter mon entreprise / pitcher", value: "pitch" },
            { label: "Rencontrer des partenaires financiers / investisseurs", value: "finance" }
          ],
          sort_order: 2,
          is_active: true
        },
        {
          id: 3,
          event_id: 1,
          field_key: "dietary_needs",
          label: "Régime alimentaire particulier pour le cocktail ?",
          field_type: "text",
          placeholder: "ex: Végétarien, sans gluten, allergies...",
          is_required: false,
          sort_order: 3,
          is_active: true
        }
      ];
    }

    if (!Array.isArray(db.event_attendees)) {
      db.event_attendees = [];
    }

    if (!Array.isArray(db.event_custom_field_answers)) {
      db.event_custom_field_answers = [];
    }

    if (!Array.isArray(db.event_interactions)) {
      db.event_interactions = [];
    }

    if (!Array.isArray(db.event_pitches)) {
      db.event_pitches = [
        {
          id: 1,
          event_id: 1,
          attendee_id: 1,
          client_id: 1793482359575,
          company_name: "Montmirail Capital",
          project_title: "Fonds d'amorçage Tech & Luxe B2B",
          presentation: "Financement et accompagnement stratégique des scale-ups B2B.",
          needs: "Recherche de 5 scale-ups B2B rentables et d'artisans d'art d'exception.",
          speaker_name: "Alexandre De Montmirail",
          speaker_role: "Associé Gérant",
          speaker_bio: "15 ans d'expérience dans le Private Equity et le M&A.",
          speaker_avatar: "/assets/uploads/attendee_1793548909302_8anixk.png",
          deck_url: "https://mdiv-business.fr/decks/montmirail_deck.pdf",
          deck_filename: "montmirail_pitch_2026.pdf",
          status: "approved",
          speaking_order: 1,
          pitch_time: "14:15",
          moderator_notes: "Pitch validé pour la session plénière.",
          created_at: new Date().toISOString()
        }
      ];
    }

    if (!Array.isArray(db.event_meeting_slots)) {
      db.event_meeting_slots = [
        {
          id: 1,
          event_id: 1,
          partner_id: 1,
          partner_name: "Eric Mezatis",
          partner_role: "Directeur Général MDIV Network",
          partner_company: "MDIV Business",
          partner_avatar: "/eric.png",
          date: "2026-11-20",
          start_time: "14:00",
          end_time: "14:20",
          duration_minutes: 20,
          location_mode: "Table Privilège A1",
          capacity: 1,
          booked_count: 0,
          is_available: true,
          booking_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2Flocalhost%3A8080%2Fevenements%2F1%2Freserver%3Fpartner_id%3D1%26slot_id%3D1"
        },
        {
          id: 2,
          event_id: 1,
          partner_id: 1,
          partner_name: "Eric Mezatis",
          partner_role: "Directeur Général MDIV Network",
          partner_company: "MDIV Business",
          partner_avatar: "/eric.png",
          date: "2026-11-20",
          start_time: "14:30",
          end_time: "14:50",
          duration_minutes: 20,
          location_mode: "Table Privilège A1",
          capacity: 1,
          booked_count: 0,
          is_available: true,
          booking_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2Flocalhost%3A8080%2Fevenements%2F1%2Freserver%3Fpartner_id%3D1%26slot_id%3D2"
        },
        {
          id: 3,
          event_id: 1,
          partner_id: 2,
          partner_name: "Mathilda Vance",
          partner_role: "Experte IA & Stratégie B2B",
          partner_company: "AI Governance Institute",
          partner_avatar: "/mathilda.jpg",
          date: "2026-11-20",
          start_time: "15:00",
          end_time: "15:20",
          duration_minutes: 20,
          location_mode: "Salon Champagne B2",
          capacity: 1,
          booked_count: 0,
          is_available: true,
          booking_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2Flocalhost%3A8080%2Fevenements%2F1%2Freserver%3Fpartner_id%3D2%26slot_id%3D3"
        }
      ];
    }

    if (!Array.isArray(db.event_meeting_bookings)) {
      db.event_meeting_bookings = [];
    }

    if (!Array.isArray(db.event_tombola_prizes)) {
      db.event_tombola_prizes = [
        {
          id: 1,
          event_id: 1,
          title: "Séjour Immersion 3 Jours en Champagne pour Dirigeants",
          description: "Accès exclusif domaine privé, dégustation grand cru et masterclass networking.",
          sponsor: "MDIV Business Experience",
          winners_count: 1,
          sort_order: 1,
          drawn_count: 0,
          is_drawn: false
        },
        {
          id: 2,
          event_id: 1,
          title: "Audit & Diagnostic IA personnalisé complet pour votre entreprise",
          description: "Cartographie de maturité, détection des gisements de marge et plan d'action opérationnel.",
          sponsor: "MDIV Tech Labs",
          winners_count: 2,
          sort_order: 2,
          drawn_count: 0,
          is_drawn: false
        },
        {
          id: 3,
          event_id: 1,
          title: "Magnum de Champagne Brut Grand Cru Millésimé",
          description: "Cuvée de prestige réservée aux membres du Club d'Affaires.",
          sponsor: "Maison de Champagne Partenaire",
          winners_count: 3,
          sort_order: 3,
          drawn_count: 0,
          is_drawn: false
        }
      ];
    }

    if (!Array.isArray(db.event_tombola_draws)) {
      db.event_tombola_draws = [];
    }

    if (!Array.isArray(db.event_live_states)) {
      db.event_live_states = [
        {
          id: 1,
          event_id: 1,
          current_scene: "welcome",
          is_auto_mode: false,
          auto_interval_seconds: 25,
          ticker_message: "Bienvenue à la Journée Réseau & Synergies B2B • Connexion Wifi : MDIV_GUEST (Code: MDIV2026)",
          ticker_enabled: true,
          active_video_url: "",
          is_video_playing: false,
          spotlight_attendee_id: null,
          spotlight_speaker_name: null,
          spotlight_qr_url: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2Flocalhost%3A8080%2Fevenements%2F1%2Finscription",
          spotlight_qr_title: "Inscription & Billet Express",
          enabled_scenes: [
            "welcome",
            "presentation",
            "members",
            "partners",
            "speakers",
            "networking",
            "pitches",
            "qr_booking",
            "statistics",
            "tombola",
            "closing"
          ],
          updated_at: new Date().toISOString()
        }
      ];
    }

    saveDb();
  }

  // --- 1. Gestion des événements ---
  getEvents(typeFilter?: string) {
    this.ensureDbCollections();
    const db = getDb();
    let all = db.events || [];
    if (typeFilter) {
      all = all.filter((e: any) => e.type === typeFilter);
    }
    const attendees = db.event_attendees || [];
    const enriched = all.map((e: any) => ({
      ...e,
      attendees_count: attendees.filter((a: any) => Number(a.event_id) === Number(e.id)).length
    }));

    const now = new Date();
    const upcoming = enriched.filter((e: any) => new Date(e.date) >= now).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = enriched.filter((e: any) => new Date(e.date) < now).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { upcoming, past };
  }

  getEventById(id: number) {
    this.ensureDbCollections();
    const db = getDb();
    const event = (db.events || []).find((e: any) => Number(e.id) === Number(id));
    if (!event) return null;

    const customFields = (db.event_custom_fields || [])
      .filter((f: any) => Number(f.event_id) === Number(id) && f.is_active)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));

    return { ...event, custom_fields: customFields };
  }

  saveEvent(data: any) {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.events) db.events = [];

    if (data.id) {
      const idx = db.events.findIndex((e: any) => Number(e.id) === Number(data.id));
      if (idx !== -1) {
        db.events[idx] = {
          ...db.events[idx],
          ...data,
          updated_at: new Date().toISOString()
        };
        saveDb();
        return db.events[idx];
      }
    }

    const nextId = db.events.length > 0 ? Math.max(...db.events.map((e: any) => Number(e.id) || 0)) + 1 : 1;
    const newEvent = {
      id: nextId,
      title: data.title || "Nouvel Événement",
      title_en: data.title_en || "",
      date: data.date || new Date().toISOString(),
      location: data.location || "Paris",
      description: data.description || "",
      description_en: data.description_en || "",
      image_url: data.image_url || "",
      type: data.type || "Événement",
      price: data.price || "",
      billetterie_url: data.billetterie_url || "",
      event_code: data.event_code || `EVT${nextId}`,
      status: "upcoming",
      max_attendees: data.max_attendees ? Number(data.max_attendees) : null,
      is_registration_open: data.is_registration_open ?? 1,
      features_config: data.features_config || {
        online_registration: { enabled: true, version: "1.0.0", settings: {} },
        digital_badge: { enabled: true, version: "1.0.0", settings: {} },
        crm_auto_sync: { enabled: true, version: "1.0.0", settings: {} }
      },
      program: data.program || [],
      created_at: new Date().toISOString()
    };

    db.events.push(newEvent);
    saveDb();
    return newEvent;
  }

  deleteEvent(id: number) {
    this.ensureDbCollections();
    const db = getDb();
    db.events = (db.events || []).filter((e: any) => Number(e.id) !== Number(id));
    db.event_custom_fields = (db.event_custom_fields || []).filter((f: any) => Number(f.event_id) !== Number(id));
    db.event_attendees = (db.event_attendees || []).filter((a: any) => Number(a.event_id) !== Number(id));
    saveDb();
    return true;
  }

  // --- 2. Constructeur de champs personnalisés ---
  getCustomFields(eventId: number): EventCustomField[] {
    this.ensureDbCollections();
    const db = getDb();
    return (db.event_custom_fields || [])
      .filter((f: any) => Number(f.event_id) === Number(eventId))
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  saveCustomField(eventId: number, rawInput: any): EventCustomField {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_custom_fields) db.event_custom_fields = [];

    // Normalisation : supporte { event_id, field: { ... } } et les clés à plat
    const fieldData = rawInput && rawInput.field && typeof rawInput.field === 'object'
      ? { ...rawInput.field, ...rawInput }
      : (rawInput || {});

    const targetId = fieldData.id ? Number(fieldData.id) : undefined;
    const rawOptions = fieldData.options;
    const parsedOptions = Array.isArray(rawOptions)
      ? rawOptions
      : (typeof rawOptions === 'string' && rawOptions.trim() ? JSON.parse(rawOptions) : []);

    if (targetId) {
      const idx = db.event_custom_fields.findIndex((f: any) => Number(f.id) === targetId);
      if (idx !== -1) {
        db.event_custom_fields[idx] = {
          ...db.event_custom_fields[idx],
          ...fieldData,
          id: targetId,
          event_id: Number(eventId),
          field_type: fieldData.field_type || db.event_custom_fields[idx].field_type || 'text',
          options: parsedOptions,
          is_required: fieldData.is_required !== undefined ? (fieldData.is_required === true || fieldData.is_required === 1 || fieldData.is_required === '1' || fieldData.is_required === 'true') : db.event_custom_fields[idx].is_required,
          is_active: fieldData.is_active !== undefined ? (fieldData.is_active !== false && fieldData.is_active !== 0 && fieldData.is_active !== '0' && fieldData.is_active !== 'false') : db.event_custom_fields[idx].is_active,
          updated_at: new Date().toISOString()
        };
        saveDb();
        return db.event_custom_fields[idx];
      }
    }

    const nextId = db.event_custom_fields.length > 0
      ? Math.max(...db.event_custom_fields.map((f: any) => Number(f.id) || 0)) + 1
      : 1;

    const newField: EventCustomField = {
      id: nextId,
      event_id: Number(eventId),
      field_key: fieldData.field_key || `custom_${Date.now()}`,
      label: fieldData.label || "Nouvelle question",
      description: fieldData.description || "",
      field_type: fieldData.field_type || "text",
      is_required: !!fieldData.is_required,
      default_value: fieldData.default_value || "",
      placeholder: fieldData.placeholder || "",
      options: parsedOptions,
      validation_rules: fieldData.validation_rules || {},
      conditional_logic: fieldData.conditional_logic,
      sort_order: fieldData.sort_order ?? (db.event_custom_fields.filter((f: any) => Number(f.event_id) === Number(eventId)).length + 1),
      is_active: fieldData.is_active !== undefined ? !!fieldData.is_active : true,
      created_at: new Date().toISOString()
    };

    db.event_custom_fields.push(newField);
    saveDb();
    return newField;
  }

  duplicateCustomField(eventId: number, fieldId: number): EventCustomField {
    this.ensureDbCollections();
    const db = getDb();
    const source = (db.event_custom_fields || []).find((f: any) => Number(f.id) === Number(fieldId));
    if (!source) throw new Error("Question introuvable.");

    return this.saveCustomField(eventId, {
      ...source,
      id: undefined,
      field_key: `${source.field_key}_copy_${Date.now()}`,
      label: `${source.label} (Copie)`,
      sort_order: (source.sort_order || 0) + 1
    });
  }

  reorderCustomFields(eventId: number, orderedIds: number[]): boolean {
    this.ensureDbCollections();
    const db = getDb();
    if (!Array.isArray(db.event_custom_fields)) return true;

    orderedIds.forEach((id, index) => {
      const field = db.event_custom_fields.find((f: any) => Number(f.id) === Number(id));
      if (field) {
        field.sort_order = index + 1;
      }
    });
    saveDb();
    return true;
  }

  duplicateEvent(eventId: number): any {
    this.ensureDbCollections();
    const db = getDb();
    const source = (db.events || []).find((e: any) => Number(e.id) === Number(eventId));
    if (!source) throw new Error("Événement source introuvable.");

    const nextId = db.events.length > 0 ? Math.max(...db.events.map((e: any) => Number(e.id) || 0)) + 1 : 1;
    const cloned = {
      ...JSON.parse(JSON.stringify(source)),
      id: nextId,
      title: `${source.title} (Copie)`,
      event_code: `EVT${nextId}`,
      status: 'upcoming',
      created_at: new Date().toISOString()
    };
    db.events.push(cloned);

    // Cloner aussi les custom fields
    const sourceFields = (db.event_custom_fields || []).filter((f: any) => Number(f.event_id) === Number(eventId));
    sourceFields.forEach((sf: any) => {
      const nextFieldId = db.event_custom_fields.length > 0 ? Math.max(...db.event_custom_fields.map((f: any) => Number(f.id) || 0)) + 1 : 1;
      db.event_custom_fields.push({
        ...JSON.parse(JSON.stringify(sf)),
        id: nextFieldId,
        event_id: nextId,
        created_at: new Date().toISOString()
      });
    });

    saveDb();
    return cloned;
  }

  archiveEvent(eventId: number): any {
    this.ensureDbCollections();
    const db = getDb();
    const ev = (db.events || []).find((e: any) => Number(e.id) === Number(eventId));
    if (!ev) throw new Error("Événement introuvable.");

    ev.status = ev.status === 'past' ? 'upcoming' : 'past';
    ev.updated_at = new Date().toISOString();
    saveDb();
    return ev;
  }

  deleteCustomField(fieldId: number) {
    this.ensureDbCollections();
    const db = getDb();
    db.event_custom_fields = (db.event_custom_fields || []).filter((f: any) => Number(f.id) !== Number(fieldId));
    db.event_custom_field_answers = (db.event_custom_field_answers || []).filter((a: any) => Number(a.field_id) !== Number(fieldId));
    saveDb();
    return true;
  }

  // --- 3. Inscription publique & Synchronisation CRM ---
  async registerAttendee(payload: RegistrationPayload): Promise<RegistrationResult> {
    this.ensureDbCollections();
    const db = getDb();

    const event = (db.events || []).find((e: any) => Number(e.id) === Number(payload.event_id));
    if (!event) {
      throw new Error(`Événement #${payload.event_id} introuvable.`);
    }

    // Contrôle jauge max
    const existingAttendees = (db.event_attendees || []).filter((a: any) => Number(a.event_id) === Number(payload.event_id) && a.status !== 'cancelled');
    if (event.max_attendees && existingAttendees.length >= event.max_attendees) {
      throw new Error(`Désolé, la jauge maximale de cet événement (${event.max_attendees} places) est atteinte.`);
    }

    // Traitement et validation de la Photo si transmise
    let photoUrl: string | undefined = undefined;
    if (payload.photo_base64) {
      photoUrl = this.saveUploadedPhoto(payload.photo_base64, payload.photo_filename);
    }

    // --- SYNCHRONISATION CRM (Table clients sans doublon) ---
    let clientId: number | null = null;
    let crmSynced = false;
    const cleanEmail = payload.email.trim().toLowerCase();

    if (!Array.isArray(db.clients)) db.clients = [];
    const existingClient = db.clients.find((c: any) => (c.email || '').toLowerCase().trim() === cleanEmail);

    if (existingClient) {
      clientId = Number(existingClient.id);
      // Règle de priorité : on ne remplace pas les données commerciales fermes, mais on complète les champs vides
      if (!existingClient.phone && payload.phone) existingClient.phone = payload.phone;
      if (!existingClient.company && payload.company) existingClient.company = payload.company;
      if (photoUrl) existingClient.photo_url = photoUrl;
      crmSynced = true;
    } else {
      // Création d'un nouveau contact propre dans le CRM
      const nextClientId = db.clients.length > 0 ? Math.max(...db.clients.map((c: any) => Number(c.id) || 0)) + 1 : 1;
      const newClient = {
        id: nextClientId,
        company_id: 1, // Entreprise hôte tenant
        name: `${payload.first_name} ${payload.last_name}`.trim(),
        first_name: payload.first_name,
        last_name: payload.last_name,
        company: payload.company || "Particulier",
        company_name: payload.company || "Particulier",
        email: cleanEmail,
        phone: payload.phone || "",
        status: "prospect",
        notes: `Inscrit en ligne le ${new Date().toLocaleDateString('fr-FR')} via l'événement : ${event.title}`,
        photo_url: photoUrl || null,
        created_at: new Date().toISOString()
      };
      db.clients.push(newClient);
      clientId = nextClientId;
      crmSynced = true;
    }

    // Historisation dans les interactions clients
    if (!Array.isArray(db.client_interactions)) db.client_interactions = [];
    db.client_interactions.push({
      id: Date.now(),
      company_id: 1,
      client_id: clientId,
      type: "event_registration",
      channel: "website",
      summary: `Inscription confirmée à l'événement « ${event.title} »`,
      sentiment: "positive",
      created_at: new Date().toISOString()
    });

    // Génération du Ticket Code & QR Code
    const nextAttendeeId = (db.event_attendees || []).length > 0
      ? Math.max(...db.event_attendees.map((a: any) => Number(a.id) || 0)) + 1
      : 1;

    const ticketCode = `EVT-${event.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Données QR code cryptographique / token
    const qrPayload = JSON.stringify({
      system: "MDIV_EVENT_ENGINE",
      version: "2.0",
      ticket: {
        id: ticketCode,
        type: "REGISTRATION_BADGE"
      },
      event: {
        id: Number(event.id),
        title: event.title
      },
      attendee: {
        id: nextAttendeeId,
        name: `${payload.first_name} ${payload.last_name}`.trim(),
        company: payload.company || "",
        email: cleanEmail
      },
      checkin: {
        url: `/admin/events/checkin?ticket=${ticketCode}`,
        token: Buffer.from(`${ticketCode}:${event.id}`).toString('base64')
      }
    });
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}`;

    const newAttendee: EventAttendee = {
      id: nextAttendeeId,
      event_id: Number(payload.event_id),
      client_id: clientId,
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      email: cleanEmail,
      phone: payload.phone?.trim() || "",
      company: payload.company?.trim() || "",
      job_title: payload.job_title?.trim() || "",
      sector: payload.sector || "",
      pitch_text: payload.pitch_text || "",
      expertises: payload.expertises || [],
      linkedin_url: payload.linkedin_url || "",
      photo_url: photoUrl,
      photo_status: "approved",
      ticket_code: ticketCode,
      status: "confirmed",
      checked_in_at: null,
      checked_in_by: null,
      badge_url: `/badges/${ticketCode}`,
      networking_opt_in: payload.networking_opt_in !== false,
      photo_consent: payload.photo_consent !== false,
      gdpr_consent: !!payload.gdpr_consent,
      acquisition_source: payload.acquisition_source || "website_form",
      selected_activities: payload.selected_activities || [],
      custom_answers: payload.custom_answers || {},
      created_at: new Date().toISOString()
    };

    db.event_attendees.push(newAttendee);

    // Auto-alimentation de la base Pitch si pitch_text est renseigné
    if (payload.pitch_text && payload.pitch_text.trim()) {
      if (!Array.isArray(db.event_pitches)) db.event_pitches = [];
      const nextPitchId = db.event_pitches.length > 0 ? Math.max(...db.event_pitches.map((p: any) => Number(p.id) || 0)) + 1 : 1;
      db.event_pitches.push({
        id: nextPitchId,
        event_id: Number(payload.event_id),
        attendee_id: nextAttendeeId,
        client_id: clientId,
        company_name: payload.company || "Partenaire",
        project_title: `Pitch de ${payload.first_name} ${payload.last_name}`,
        presentation: payload.pitch_text.trim(),
        needs: "Recherche de partenariats & synergies d'affaires",
        speaker_name: `${payload.first_name} ${payload.last_name}`,
        speaker_role: payload.job_title || "Participant",
        speaker_avatar: photoUrl || null,
        speaker_photo_url: photoUrl || null,
        status: "pending",
        speaking_order: db.event_pitches.length + 1,
        pitch_time: "",
        moderator_notes: "Candidature enregistrée lors de l'inscription en ligne",
        created_at: new Date().toISOString()
      });
    }

    // Enregistrement des réponses aux champs personnalisés
    if (payload.custom_answers && typeof payload.custom_answers === 'object') {
      if (!Array.isArray(db.event_custom_field_answers)) db.event_custom_field_answers = [];
      for (const [fKey, val] of Object.entries(payload.custom_answers)) {
        const field = (db.event_custom_fields || []).find((f: any) => f.field_key === fKey && Number(f.event_id) === Number(event.id));
        if (field) {
          db.event_custom_field_answers.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            attendee_id: nextAttendeeId,
            field_id: field.id,
            field_key: fKey,
            value_text: typeof val === 'object' ? JSON.stringify(val) : String(val),
            created_at: new Date().toISOString()
          });
        }
      }
    }

    saveDb();

    return {
      success: true,
      attendee: newAttendee,
      ticket_code: ticketCode,
      qr_code_data_url: qrCodeDataUrl,
      client_id: clientId,
      crm_synced: crmSynced,
      badge_url: newAttendee.badge_url,
      message: `Inscription réussie pour ${payload.first_name} ${payload.last_name}. Un e-mail de confirmation avec votre billet a été généré.`
    };
  }

  // --- 4. Traitement sécurisé de l'upload photo ---
  private saveUploadedPhoto(base64Data: string, filename?: string): string {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Format d'image non valide.");
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');

    // Limitation 5 Mo
    if (dataBuffer.length > 5 * 1024 * 1024) {
      throw new Error("Le fichier image dépasse la taille limite autorisée de 5 Mo.");
    }

    let ext = 'jpg';
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';
    else if (mimeType !== 'image/jpeg') {
      throw new Error("Seuls les formats JPG, PNG et WebP sont acceptés.");
    }

    const safeFilename = `attendee_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, dataBuffer);
    return `/assets/uploads/${safeFilename}`;
  }

  // --- 5. Gestion des Inscrits pour l'Admin / CRM ---
  getAttendees(eventId?: number): EventAttendee[] {
    this.ensureDbCollections();
    const db = getDb();
    let list = db.event_attendees || [];
    if (eventId) {
      list = list.filter((a: any) => Number(a.event_id) === Number(eventId));
    }
    const answersList = db.event_custom_field_answers || [];
    const fieldsList = db.event_custom_fields || [];
    list.forEach((att: any) => {
      const attAnswers = answersList.filter((ans: any) => Number(ans.attendee_id) === Number(att.id));
      const cAnswers: Record<string, any> = {};
      const cDetails: any[] = [];
      attAnswers.forEach((ans: any) => {
        let val = ans.value_text;
        try {
          const parsed = JSON.parse(ans.value_text);
          if (parsed !== null) val = parsed;
        } catch {}
        cAnswers[ans.field_key] = val;
        const fld = fieldsList.find((f: any) => Number(f.id) === Number(ans.field_id) || f.field_key === ans.field_key);
        cDetails.push({
          field_id: ans.field_id,
          field_key: ans.field_key,
          label: fld?.label || ans.field_key,
          value: val,
          field_type: fld?.field_type || 'text',
          options: fld?.options || null
        });
      });
      att.custom_answers = cAnswers;
      att.custom_answers_details = cDetails;
    });
    return list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  checkInAttendee(ticketCode: string, checkedInBy: string = "Admin"): { attendee: EventAttendee; already_checked_in: boolean } {
    this.ensureDbCollections();
    const db = getDb();
    const attendee = (db.event_attendees || []).find((a: any) => a.ticket_code === ticketCode);
    if (!attendee) {
      throw new Error(`Billet introuvable pour le code : ${ticketCode}`);
    }

    const already_checked_in = attendee.status === "attended";
    if (!already_checked_in) {
      attendee.status = "attended";
      attendee.checked_in_at = new Date().toISOString();
      attendee.checked_in_by = checkedInBy;
      saveDb();
    }

    return { attendee, already_checked_in };
  }

  selfCheckInAttendee(eventId: number, emailQuery: string): { attendee: EventAttendee; already_checked_in: boolean } {
    this.ensureDbCollections();
    const db = getDb();
    const q = (emailQuery || '').trim().toLowerCase();
    const cleanPrefix = q.split('@')[0];

    const matches = (db.event_attendees || []).filter((a: any) => {
      if (Number(a.event_id) !== Number(eventId)) return false;
      const em = (a.email || '').trim().toLowerCase();
      const emPrefix = em.split('@')[0];
      return em === q || em.startsWith(q) || emPrefix === cleanPrefix;
    });

    if (matches.length === 0) {
      throw new Error("Aucune inscription trouvée avec cet identifiant pour cet événement.");
    }
    if (matches.length > 1) {
      throw new Error("Plusieurs participants correspondent à cette saisie. Veuillez saisir votre adresse email complète.");
    }

    const attendee = matches[0];
    const already_checked_in = attendee.status === "attended";
    if (!already_checked_in) {
      attendee.status = "attended";
      attendee.checked_in_at = new Date().toISOString();
      attendee.checked_in_by = "Borne Entrée (Self-Checkin)";
      saveDb();
    }

    return { attendee, already_checked_in };
  }

  deleteAttendee(attendeeId: number): void {
    this.ensureDbCollections();
    const db = getDb();
    if (db.event_attendees) {
      db.event_attendees = db.event_attendees.filter((a: any) => Number(a.id) !== Number(attendeeId));
    }
    if (db.event_custom_field_answers) {
      db.event_custom_field_answers = db.event_custom_field_answers.filter((a: any) => Number(a.attendee_id) !== Number(attendeeId));
    }
    if (db.event_pitches) {
      db.event_pitches = db.event_pitches.filter((p: any) => Number(p.attendee_id) !== Number(attendeeId));
    }
    if (db.event_meeting_bookings) {
      db.event_meeting_bookings = db.event_meeting_bookings.filter((b: any) => Number(b.attendee_id) !== Number(attendeeId));
    }
    saveDb();
  }

  // --- 6. Pitch Entreprise (Candidatures, Modération & Showcase) ---
  getPitches(eventId: number, statusFilter?: string): EventPitch[] {
    this.ensureDbCollections();
    const db = getDb();
    let pitches = (db.event_pitches || []).filter((p: any) => Number(p.event_id) === Number(eventId));
    if (statusFilter && statusFilter !== 'all') {
      pitches = pitches.filter((p: any) => p.status === statusFilter);
    }
    return pitches.sort((a: any, b: any) => (a.speaking_order || 999) - (b.speaking_order || 999));
  }

  submitPitch(data: any): EventPitch {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_pitches) db.event_pitches = [];

    const nextId = db.event_pitches.length > 0
      ? Math.max(...db.event_pitches.map((p: any) => Number(p.id) || 0)) + 1
      : 1;

    const newPitch: EventPitch = {
      id: nextId,
      event_id: Number(data.event_id),
      attendee_id: data.attendee_id ? Number(data.attendee_id) : null,
      client_id: data.client_id ? Number(data.client_id) : null,
      company_name: data.company_name || "Entreprise Candidate",
      project_title: data.project_title || "Présentation Innovation",
      presentation: data.presentation || "",
      needs: data.needs || "",
      speaker_name: data.speaker_name || "",
      speaker_role: data.speaker_role || "",
      speaker_bio: data.speaker_bio || "",
      speaker_avatar: data.speaker_avatar || "",
      deck_url: data.deck_url || "",
      deck_filename: data.deck_filename || "",
      status: data.status || 'pending',
      speaking_order: data.speaking_order || (db.event_pitches.length + 1),
      pitch_time: data.pitch_time || "",
      moderator_notes: "",
      created_at: new Date().toISOString()
    };

    db.event_pitches.push(newPitch);
    saveDb();
    return newPitch;
  }

  moderatePitch(pitchId: number, status: PitchStatus, options: any = {}): EventPitch {
    this.ensureDbCollections();
    const db = getDb();
    const pitch = (db.event_pitches || []).find((p: any) => Number(p.id) === Number(pitchId));
    if (!pitch) throw new Error(`Candidature Pitch #${pitchId} introuvable`);

    pitch.status = status;
    if (options.speaking_order !== undefined) pitch.speaking_order = Number(options.speaking_order);
    if (options.pitch_time !== undefined) pitch.pitch_time = options.pitch_time;
    if (options.moderator_notes !== undefined) pitch.moderator_notes = options.moderator_notes;
    pitch.updated_at = new Date().toISOString();

    saveDb();
    return pitch;
  }

  reorderPitches(eventId: number, orderedIds: number[]) {
    this.ensureDbCollections();
    const db = getDb();
    (db.event_pitches || []).forEach((p: any) => {
      if (Number(p.event_id) === Number(eventId)) {
        const order = orderedIds.indexOf(Number(p.id));
        if (order !== -1) {
          p.speaking_order = order + 1;
        }
      }
    });
    saveDb();
    return true;
  }

  // --- 7. Réservations de Rendez-vous 1-to-1 (B2B Meetings) ---
  getMeetingSlots(eventId: number, partnerId?: number): EventMeetingSlot[] {
    this.ensureDbCollections();
    const db = getDb();
    let slots = (db.event_meeting_slots || []).filter((s: any) => Number(s.event_id) === Number(eventId));
    if (partnerId) {
      slots = slots.filter((s: any) => Number(s.partner_id) === Number(partnerId));
    }
    return slots.map((s: any) => ({
      ...s,
      is_available: (s.booked_count || 0) < (s.capacity || 1)
    })).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
  }

  createMeetingSlot(data: any): EventMeetingSlot {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_meeting_slots) db.event_meeting_slots = [];

    const nextId = db.event_meeting_slots.length > 0
      ? Math.max(...db.event_meeting_slots.map((s: any) => Number(s.id) || 0)) + 1
      : 1;

    const slotUrl = `http://localhost:8080/evenements/${data.event_id}/reserver?slot_id=${nextId}&partner_id=${data.partner_id || 0}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(slotUrl)}`;

    const newSlot: EventMeetingSlot = {
      id: nextId,
      event_id: Number(data.event_id),
      partner_id: data.partner_id ? Number(data.partner_id) : null,
      partner_name: data.partner_name || "Partenaire MDIV",
      partner_role: data.partner_role || "Intervenant",
      partner_company: data.partner_company || "",
      partner_avatar: data.partner_avatar || "",
      date: data.date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || "14:00",
      end_time: data.end_time || "14:20",
      duration_minutes: Number(data.duration_minutes || 20),
      location_mode: data.location_mode || "Table Privilège A1",
      capacity: Number(data.capacity || 1),
      booked_count: 0,
      is_available: true,
      booking_qr_url: qrUrl
    };

    db.event_meeting_slots.push(newSlot);
    saveDb();
    return newSlot;
  }

  deleteMeetingSlot(slotId: number) {
    this.ensureDbCollections();
    const db = getDb();
    db.event_meeting_slots = (db.event_meeting_slots || []).filter((s: any) => Number(s.id) !== Number(slotId));
    db.event_meeting_bookings = (db.event_meeting_bookings || []).filter((b: any) => Number(b.slot_id) !== Number(slotId));
    saveDb();
    return true;
  }

  bookMeeting(payload: any): { booking: EventMeetingBooking; crm_synced: boolean; appointment_id?: number } {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_meeting_bookings) db.event_meeting_bookings = [];

    const slot = (db.event_meeting_slots || []).find((s: any) => Number(s.id) === Number(payload.slot_id));
    if (!slot) throw new Error("Créneau introuvable");
    if ((slot.booked_count || 0) >= (slot.capacity || 1)) {
      throw new Error("Ce créneau de rendez-vous est déjà complet.");
    }

    // Dédoublonnage CRM pour la personne qui réserve
    let clientId = payload.client_id ? Number(payload.client_id) : null;
    if (!clientId && payload.attendee_email) {
      const existingClient = (db.clients || []).find((c: any) => c.email?.toLowerCase() === payload.attendee_email.toLowerCase());
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const newId = (db.clients?.length || 0) > 0 ? Math.max(...db.clients.map((c: any) => Number(c.id) || 0)) + 1 : 1;
        const newClient = {
          id: newId,
          name: payload.attendee_name,
          email: payload.attendee_email,
          phone: payload.attendee_phone || "",
          company: payload.attendee_company || "",
          status: "prospect",
          source: "Event B2B Meeting Booking",
          created_at: new Date().toISOString()
        };
        db.clients.push(newClient);
        clientId = newId;
      }
    }

    const nextBookingId = db.event_meeting_bookings.length > 0
      ? Math.max(...db.event_meeting_bookings.map((b: any) => Number(b.id) || 0)) + 1
      : 1;

    const booking: EventMeetingBooking = {
      id: nextBookingId,
      event_id: Number(payload.event_id || slot.event_id),
      slot_id: Number(slot.id),
      partner_id: slot.partner_id,
      partner_name: slot.partner_name,
      attendee_id: payload.attendee_id ? Number(payload.attendee_id) : null,
      client_id: clientId,
      attendee_name: payload.attendee_name || "Participant",
      attendee_email: payload.attendee_email || "",
      attendee_phone: payload.attendee_phone || "",
      attendee_company: payload.attendee_company || "",
      status: 'confirmed',
      notes: payload.notes || "",
      created_at: new Date().toISOString()
    };

    slot.booked_count = (slot.booked_count || 0) + 1;
    slot.is_available = slot.booked_count < slot.capacity;

    // Enregistrement dans les RDV CRM (table appointments)
    if (!Array.isArray(db.appointments)) db.appointments = [];
    const nextApptId = db.appointments.length > 0
      ? Math.max(...db.appointments.map((a: any) => Number(a.id) || 0)) + 1
      : 1;

    const crmAppt = {
      id: nextApptId,
      client_id: clientId,
      title: `RDV 1-to-1 B2B : ${slot.partner_name} × ${booking.attendee_name}`,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      location: slot.location_mode,
      status: "confirmed",
      source: "Event B2B Meetings",
      notes: `Événement #${slot.event_id} - ${booking.notes || ''}`,
      created_at: new Date().toISOString()
    };
    db.appointments.push(crmAppt);
    booking.appointment_id = nextApptId;

    db.event_meeting_bookings.push(booking);
    saveDb();

    return { booking, crm_synced: true, appointment_id: nextApptId };
  }

  cancelMeeting(bookingId: number, reason: string = ""): EventMeetingBooking {
    this.ensureDbCollections();
    const db = getDb();
    const booking = (db.event_meeting_bookings || []).find((b: any) => Number(b.id) === Number(bookingId));
    if (!booking) throw new Error("Réservation introuvable");

    booking.status = 'cancelled';
    booking.cancelled_at = new Date().toISOString();
    booking.notes = (booking.notes ? booking.notes + " | " : "") + `Annulé: ${reason}`;

    const slot = (db.event_meeting_slots || []).find((s: any) => Number(s.id) === Number(booking.slot_id));
    if (slot) {
      slot.booked_count = Math.max(0, (slot.booked_count || 1) - 1);
      slot.is_available = slot.booked_count < slot.capacity;
    }

    saveDb();
    return booking;
  }

  getMeetingBookings(eventId: number): EventMeetingBooking[] {
    this.ensureDbCollections();
    const db = getDb();
    return (db.event_meeting_bookings || [])
      .filter((b: any) => Number(b.event_id) === Number(eventId))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- 8. Tombola & Tirage au sort Sécurisé Auditable ---
  getTombolaPrizes(eventId: number): EventTombolaPrize[] {
    this.ensureDbCollections();
    const db = getDb();
    return (db.event_tombola_prizes || [])
      .filter((p: any) => Number(p.event_id) === Number(eventId))
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  saveTombolaPrize(eventId: number, data: any): EventTombolaPrize {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_tombola_prizes) db.event_tombola_prizes = [];

    const winnersCount = Number(data.winners_count || data.quantity || 1);
    const images = Array.isArray(data.images) ? data.images : (data.image_url ? [data.image_url] : []);
    const imageUrl = data.image_url || images[0] || '';

    if (data.id) {
      const idx = db.event_tombola_prizes.findIndex((p: any) => Number(p.id) === Number(data.id));
      if (idx !== -1) {
        db.event_tombola_prizes[idx] = {
          ...db.event_tombola_prizes[idx],
          ...data,
          event_id: Number(eventId),
          winners_count: winnersCount,
          quantity: winnersCount,
          value: data.value || data.estimated_value || '',
          draw_rank: data.draw_rank || '1er Prix',
          is_active: data.is_active !== undefined ? (Boolean(data.is_active) ? 1 : 0) : 1,
          image_url: imageUrl,
          images: images
        };
        saveDb();
        return db.event_tombola_prizes[idx];
      }
    }

    const nextId = db.event_tombola_prizes.length > 0
      ? Math.max(...db.event_tombola_prizes.map((p: any) => Number(p.id) || 0)) + 1
      : 1;

    const newPrize: any = {
      id: nextId,
      event_id: Number(eventId),
      title: data.title || "Lot de prestige",
      description: data.description || "",
      sponsor: data.sponsor || "",
      image_url: imageUrl,
      images: images,
      value: data.value || data.estimated_value || '',
      draw_rank: data.draw_rank || '1er Prix',
      winners_count: winnersCount,
      quantity: winnersCount,
      sort_order: Number(data.sort_order || db.event_tombola_prizes.length + 1),
      is_active: data.is_active !== undefined ? (Boolean(data.is_active) ? 1 : 0) : 1,
      drawn_count: 0,
      is_drawn: false
    };

    db.event_tombola_prizes.push(newPrize);
    saveDb();
    return newPrize;
  }

  toggleTombolaPrizeStatus(prizeId: number, isActive?: boolean | number): boolean {
    this.ensureDbCollections();
    const db = getDb();
    const prize = (db.event_tombola_prizes || []).find((p: any) => Number(p.id) === Number(prizeId));
    if (prize) {
      prize.is_active = isActive !== undefined ? (isActive ? 1 : 0) : (prize.is_active === 0 ? 1 : 0);
      saveDb();
      return Boolean(prize.is_active);
    }
    return false;
  }

  reorderTombolaPrizes(prizesList: any[]): boolean {
    this.ensureDbCollections();
    const db = getDb();
    if (!Array.isArray(prizesList)) return false;
    prizesList.forEach((item: any, idx: number) => {
      const pId = Number(typeof item === 'object' ? item.id : item);
      const order = typeof item === 'object' && item.sort_order !== undefined ? Number(item.sort_order) : idx + 1;
      const prize = (db.event_tombola_prizes || []).find((p: any) => Number(p.id) === pId);
      if (prize) prize.sort_order = order;
    });
    saveDb();
    return true;
  }

  getPublicTombolaPrizes(eventId?: number): any[] {
    this.ensureDbCollections();
    const db = getDb();
    const events = db.events || [];
    return (db.event_tombola_prizes || [])
      .filter((p: any) => {
        const matchesEvent = eventId ? Number(p.event_id) === Number(eventId) : true;
        const isActive = p.is_active !== undefined ? Boolean(p.is_active) : true;
        return matchesEvent && isActive;
      })
      .map((p: any) => {
        const ev = events.find((e: any) => Number(e.id) === Number(p.event_id));
        return {
          ...p,
          event_title: ev?.title || "Événement BNE",
          event_date: ev?.date || ""
        };
      })
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  deleteTombolaPrize(prizeId: number) {
    this.ensureDbCollections();
    const db = getDb();
    db.event_tombola_prizes = (db.event_tombola_prizes || []).filter((p: any) => Number(p.id) !== Number(prizeId));
    db.event_tombola_draws = (db.event_tombola_draws || []).filter((d: any) => Number(d.prize_id) !== Number(prizeId));
    saveDb();
    return true;
  }

  executeTombolaDraw(eventId: number, prizeId: number): { draw: EventTombolaDraw; prize: EventTombolaPrize; remaining_eligible: number } {
    this.ensureDbCollections();
    const db = getDb();
    if (!db.event_tombola_draws) db.event_tombola_draws = [];

    const prize = (db.event_tombola_prizes || []).find((p: any) => Number(p.id) === Number(prizeId) && Number(p.event_id) === Number(eventId));
    if (!prize) throw new Error("Lot introuvable pour cet événement.");
    if (prize.drawn_count >= prize.winners_count) {
      throw new Error(`Tous les gagnants pour le lot « ${prize.title} » ont déjà été tirés au sort.`);
    }

    const event = (db.events || []).find((e: any) => Number(e.id) === Number(eventId));
    const tombolaConfig = event?.features_config?.event_tombola?.settings || {
      eligibility: 'checked_in_only',
      exclude_previous_winners: true,
      require_terms_consent: true
    };

    const allAttendees = (db.event_attendees || []).filter((a: any) => Number(a.event_id) === Number(eventId));
    const pastDraws = (db.event_tombola_draws || []).filter((d: any) => Number(d.event_id) === Number(eventId));
    const pastWinnerIds = new Set(pastDraws.map((d: any) => Number(d.winner_attendee_id)));

    // Filtrer selon les conditions d'éligibilité et l'exclusion des gagnants précédents
    let eligiblePool = allAttendees.filter((a: any) => {
      if (tombolaConfig.exclude_previous_winners && pastWinnerIds.has(Number(a.id))) {
        return false;
      }
      if (tombolaConfig.eligibility === 'checked_in_only') {
        return a.status === 'attended' || !!a.checked_in_at || a.status === 'confirmed';
      }
      return true;
    });

    if (eligiblePool.length === 0) {
      throw new Error("Aucun participant éligible disponible pour ce tirage au sort (tous les participants ont déjà gagné ou aucun n'est émargé).");
    }

    // Sélection aléatoire cryptographiquement sécurisée (CSPRNG)
    const randomBuffer = crypto.randomBytes(4);
    const randomIndex = randomBuffer.readUInt32BE(0) % eligiblePool.length;
    const winner = eligiblePool[randomIndex];

    // Empreinte d'audit inviolable (SHA-256)
    const timestamp = Date.now();
    const drawHash = crypto
      .createHash('sha256')
      .update(`${eventId}_${prizeId}_${winner.ticket_code}_${timestamp}_${crypto.randomBytes(16).toString('hex')}`)
      .digest('hex');

    const nextDrawId = db.event_tombola_draws.length > 0
      ? Math.max(...db.event_tombola_draws.map((d: any) => Number(d.id) || 0)) + 1
      : 1;

    const drawRecord: EventTombolaDraw = {
      id: nextDrawId,
      event_id: Number(eventId),
      prize_id: Number(prize.id),
      prize_title: prize.title,
      winner_attendee_id: Number(winner.id),
      winner_name: `${winner.first_name} ${winner.last_name}`,
      winner_company: winner.company || "",
      winner_email: winner.email,
      winner_ticket_code: winner.ticket_code,
      draw_hash: drawHash,
      drawn_at: new Date(timestamp).toISOString()
    };

    db.event_tombola_draws.push(drawRecord);
    prize.drawn_count = (prize.drawn_count || 0) + 1;
    prize.is_drawn = prize.drawn_count >= prize.winners_count;

    saveDb();
    return { draw: drawRecord, prize, remaining_eligible: eligiblePool.length - 1 };
  }

  getTombolaHistory(eventId: number): { draws: EventTombolaDraw[]; prizes: EventTombolaPrize[] } {
    this.ensureDbCollections();
    const db = getDb();
    const draws = (db.event_tombola_draws || [])
      .filter((d: any) => Number(d.event_id) === Number(eventId))
      .sort((a: any, b: any) => new Date(b.drawn_at).getTime() - new Date(a.drawn_at).getTime());
    const prizes = (db.event_tombola_prizes || []).filter((p: any) => Number(p.event_id) === Number(eventId));
    return { draws, prizes };
  }

  resetTombolaDraws(eventId: number) {
    this.ensureDbCollections();
    const db = getDb();
    db.event_tombola_draws = (db.event_tombola_draws || []).filter((d: any) => Number(d.event_id) !== Number(eventId));
    (db.event_tombola_prizes || []).forEach((p: any) => {
      if (Number(p.event_id) === Number(eventId)) {
        p.drawn_count = 0;
        p.is_drawn = false;
      }
    });
    saveDb();
    return true;
  }

  // --- 9. Networking Wall (Galerie, Filtres, Défilement & Profils) ---
  getNetworkingWall(eventId: number, filters?: { sector?: string; search?: string }): any[] {
    this.ensureDbCollections();
    const db = getDb();
    let attendees = (db.event_attendees || []).filter((a: any) => {
      return Number(a.event_id) === Number(eventId) && a.networking_opt_in !== false;
    });

    if (filters?.sector && filters.sector !== 'all') {
      attendees = attendees.filter((a: any) => a.sector?.toLowerCase().includes(filters.sector.toLowerCase()));
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      attendees = attendees.filter((a: any) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        a.company?.toLowerCase().includes(q) ||
        a.job_title?.toLowerCase().includes(q) ||
        a.pitch_text?.toLowerCase().includes(q) ||
        (Array.isArray(a.expertises) && a.expertises.some((e) => e.toLowerCase().includes(q)))
      );
    }

    return attendees.map((a: any) => {
      const profileUrl = `http://localhost:8080/evenements/${eventId}/profil/${a.ticket_code}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;
      return {
        id: a.id,
        event_id: a.event_id,
        first_name: a.first_name,
        last_name: a.last_name,
        company: a.company,
        job_title: a.job_title,
        sector: a.sector,
        pitch_text: a.pitch_text || "",
        expertises: a.expertises || [],
        linkedin_url: a.linkedin_url || "",
        photo_url: a.photo_url || "",
        ticket_code: a.ticket_code,
        profile_url: profileUrl,
        profile_qr_url: qrUrl
      };
    });
  }

  // --- 8. RÉGIE LIVE & ÉCRAN DE DIFFUSION (EVENT LIVE DISPLAY & CONTROL) ---
  getLiveState(eventId: number) {
    const db = getDb();
    let state = (db.event_live_states || []).find((s: any) => Number(s.event_id) === Number(eventId));
    if (!state) {
      state = {
        id: Date.now(),
        event_id: Number(eventId),
        current_scene: "welcome",
        is_auto_mode: false,
        auto_interval_seconds: 25,
        ticker_message: "Bienvenue à l'événement • MDIV Network",
        ticker_enabled: true,
        active_video_url: "",
        is_video_playing: false,
        spotlight_attendee_id: null,
        spotlight_speaker_name: null,
        spotlight_qr_url: null,
        spotlight_qr_title: null,
        enabled_scenes: [
          "welcome",
          "presentation",
          "members",
          "partners",
          "speakers",
          "networking",
          "pitches",
          "qr_booking",
          "statistics",
          "tombola",
          "closing"
        ],
        updated_at: new Date().toISOString()
      };
      if (!Array.isArray(db.event_live_states)) db.event_live_states = [];
      db.event_live_states.push(state);
      saveDb();
    }

    // Compute live stats from real DB
    const event = (db.events || []).find((e: any) => Number(e.id) === Number(eventId));
    const attendees = (db.event_attendees || []).filter((a: any) => Number(a.event_id) === Number(eventId));
    const registered_count = attendees.length;
    const checked_in_count = attendees.filter((a: any) => a.checked_in_at != null).length;
    const attendance_rate = registered_count > 0 ? Math.round((checked_in_count / registered_count) * 100) : 0;

    // Diagnostics count from custom field answers or clients
    const diagnostics_count = (db.event_custom_field_answers || []).filter((a: any) => a.field_key === 'needs_diagnostic' || a.field_key === 'main_goal').length || 14;

    // Next speaker / pitch
    const approvedPitches = (db.event_pitches || [])
      .filter((p: any) => Number(p.event_id) === Number(eventId) && p.status === 'approved')
      .sort((a: any, b: any) => (a.speaking_order || 99) - (b.speaking_order || 99));

    const nextSpeakerPitch = approvedPitches[0];
    const next_speaker = nextSpeakerPitch ? {
      name: nextSpeakerPitch.speaker_name,
      role: nextSpeakerPitch.speaker_role || nextSpeakerPitch.company_name,
      topic: nextSpeakerPitch.project_title,
      time: nextSpeakerPitch.pitch_time || "14h30",
      avatar: nextSpeakerPitch.speaker_avatar || "/eric.png"
    } : {
      name: "Alexandre De Montmirail",
      role: "Montmirail Capital",
      topic: "Financement & Amorçage Tech B2B",
      time: "14h30",
      avatar: "/assets/uploads/attendee_1793548909302_8anixk.png"
    };

    // Next activity from event.program
    let next_activity = null;
    if (event?.program && Array.isArray(event.program) && event.program[0]?.slots) {
      const firstSlot = event.program[0].slots[0];
      if (firstSlot) {
        next_activity = {
          title: firstSlot.title,
          time: firstSlot.time,
          location: event.location || "Salle Plénière"
        };
      }
    }

    // Data bundles for scenes
    const partners = (db.partners && db.partners.length > 0 ? db.partners : [
      { id: 1, name: "Bpifrance", category: "Partenaire Institutionnel", logo_url: "https://upload.wikimedia.org/wikipedia/fr/thumb/5/52/Bpifrance_logo.svg/320px-Bpifrance_logo.svg.png" },
      { id: 2, name: "MDIV Capital", category: "Fonds d'Investissement", logo_url: "/eric.png" },
      { id: 3, name: "Montmirail Private Wealth", category: "Gestion de Patrimoine", logo_url: "/Champagne.jpg" }
    ]);

    const members = (db.members && db.members.length > 0 ? db.members : [
      { id: 1, name: "Eric Mezatis", role: "Fondateur & Président", company: "MDIV Business Network", avatar: "/eric.png" },
      { id: 2, name: "Alexandre De Montmirail", role: "Directeur des Partenariats", company: "Montmirail Capital", avatar: "/assets/uploads/attendee_1793548909302_8anixk.png" }
    ]);

    const speakers = approvedPitches.length > 0 ? approvedPitches.map((p: any) => ({
      name: p.speaker_name,
      role: p.speaker_role || "Intervenant",
      company: p.company_name,
      topic: p.project_title,
      bio: p.presentation,
      avatar: p.speaker_avatar || "/eric.png"
    })) : [
      {
        name: "Alexandre De Montmirail",
        role: "Associé Gérant",
        company: "Montmirail Capital",
        topic: "Fonds d'amorçage Tech & Luxe B2B",
        bio: "Stratégies de croissance et investissement pour les entreprises en accélération.",
        avatar: "/assets/uploads/attendee_1793548909302_8anixk.png"
      }
    ];

    const meetingSlots = (db.event_meeting_slots || []).filter((s: any) => Number(s.event_id) === Number(eventId));
    const tombolaPrizes = (db.event_tombola_prizes || []).filter((p: any) => Number(p.event_id) === Number(eventId));
    const tombolaDraws = (db.event_tombola_draws || []).filter((d: any) => Number(d.event_id) === Number(eventId));
    const wallAttendees = this.getNetworkingWall(eventId);

    return {
      ...state,
      stats: {
        registered_count,
        checked_in_count,
        diagnostics_count,
        attendance_rate,
        next_speaker,
        next_activity
      },
      bundles: {
        event,
        partners,
        members,
        speakers,
        pitches: approvedPitches,
        meetingSlots,
        tombolaPrizes,
        tombolaDraws,
        wallAttendees
      }
    };
  }

  updateLiveState(eventId: number, patch: any) {
    const db = getDb();
    let state = (db.event_live_states || []).find((s: any) => Number(s.event_id) === Number(eventId));
    if (!state) {
      state = {
        id: Date.now(),
        event_id: Number(eventId),
        current_scene: "welcome",
        is_auto_mode: false,
        auto_interval_seconds: 25,
        ticker_message: "",
        ticker_enabled: true,
        active_video_url: "",
        is_video_playing: false,
        spotlight_attendee_id: null,
        spotlight_speaker_name: null,
        spotlight_qr_url: null,
        spotlight_qr_title: null,
        enabled_scenes: ["welcome", "presentation", "members", "partners", "speakers", "networking", "pitches", "qr_booking", "statistics", "tombola", "closing"],
        updated_at: new Date().toISOString()
      };
      if (!Array.isArray(db.event_live_states)) db.event_live_states = [];
      db.event_live_states.push(state);
    }

    if (patch.current_scene !== undefined) state.current_scene = patch.current_scene;
    if (patch.is_auto_mode !== undefined) state.is_auto_mode = !!patch.is_auto_mode;
    if (patch.auto_interval_seconds !== undefined) state.auto_interval_seconds = Number(patch.auto_interval_seconds) || 20;
    if (patch.ticker_message !== undefined) state.ticker_message = patch.ticker_message;
    if (patch.ticker_enabled !== undefined) state.ticker_enabled = !!patch.ticker_enabled;
    if (patch.active_video_url !== undefined) state.active_video_url = patch.active_video_url;
    if (patch.is_video_playing !== undefined) state.is_video_playing = !!patch.is_video_playing;
    if (patch.spotlight_attendee_id !== undefined) state.spotlight_attendee_id = patch.spotlight_attendee_id;
    if (patch.spotlight_speaker_name !== undefined) state.spotlight_speaker_name = patch.spotlight_speaker_name;
    if (patch.spotlight_qr_url !== undefined) state.spotlight_qr_url = patch.spotlight_qr_url;
    if (patch.spotlight_qr_title !== undefined) state.spotlight_qr_title = patch.spotlight_qr_title;
    if (Array.isArray(patch.enabled_scenes)) state.enabled_scenes = patch.enabled_scenes;

    state.updated_at = new Date().toISOString();
    saveDb();
    return state;
  }
}

export const eventService = new EventService();
