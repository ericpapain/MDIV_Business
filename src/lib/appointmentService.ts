// src/lib/appointmentService.ts
// Service complet de prise de rendez-vous en ligne 24h/24 et planning professionnel MDIV Business

import { getApiUrl, createApiUrl } from './apiConfig';

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
export type AppointmentSource = 'online_booking' | 'manual' | 'phone' | 'website' | 'link_invitation';

export interface Appointment {
  id: number | string;
  company_id?: number;
  client_id?: number | string;
  booking_link_token?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  appointment_type: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration_minutes: number;
  location: string;
  notes?: string;
  cancellation_reason?: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  meeting_url?: string;
  created_at?: string;
  updated_at?: string;
  reminders_sent?: {
    email_confirmation?: boolean;
    sms_reminder?: boolean;
  };
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  reason?: string;
}

export interface DaySchedule {
  day: number; // 1 = Lundi, 7 = Dimanche
  enabled: boolean;
  start: string;
  end: string;
}

export interface AppointmentTypeConfig {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
  badge?: string;
  color: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'slate';
  is_active?: boolean;
}

export interface AppointmentSettings {
  booking_enabled: boolean;
  public_slug: string;
  title: string;
  description: string;
  working_days: number[]; // 1 = Lundi, 5 = Vendredi
  working_hours: {
    start: string; // "08:30"
    end: string;   // "18:30"
  };
  day_schedules?: Record<number, { enabled: boolean; start: string; end: string }>;
  slot_duration: number; // default duration in mins (15, 30, 45, 60 or custom)
  buffer_between_slots: number; // in mins
  notice_hours_min: number; // minimum notice in hours
  max_days_ahead: number;
  holidays: string[]; // ['YYYY-MM-DD'] for leaves/absences
  blocked_slots: BlockedSlot[]; // ponctuels
  appointment_types: AppointmentTypeConfig[];
  auto_reminders: {
    email_confirmation: boolean;
    email_24h_before: boolean;
    sms_2h_before: boolean;
  };
  calendar_sync: {
    google_connected: boolean;
    outlook_connected: boolean;
  };
}

export interface BookingLink {
  id: string;
  token: string;
  company_id: number;
  client_id?: number | string | null;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  duration_minutes: number;
  appointment_type: string;
  title: string;
  notes?: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  created_at: string;
  expires_at?: string;
}

export interface AppointmentNotification {
  id: string;
  company_id: number;
  appointment_id?: number | string;
  type: 'new_booking' | 'rescheduled' | 'cancelled';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const DEFAULT_APPOINTMENT_SETTINGS: AppointmentSettings = {
  booking_enabled: true,
  public_slug: 'mon-entreprise',
  title: 'Prise de rendez-vous en ligne 24h/24',
  description: 'Vos clients bloquent un rendez-vous ou demandent un devis sans vous déranger sur le chantier.',
  working_days: [1, 2, 3, 4, 5],
  working_hours: {
    start: '08:30',
    end: '18:30'
  },
  day_schedules: {
    1: { enabled: true, start: '08:30', end: '18:30' },
    2: { enabled: true, start: '08:30', end: '18:30' },
    3: { enabled: true, start: '08:30', end: '18:30' },
    4: { enabled: true, start: '08:30', end: '18:30' },
    5: { enabled: true, start: '08:30', end: '18:30' },
    6: { enabled: false, start: '09:00', end: '13:00' },
    7: { enabled: false, start: '09:00', end: '12:00' },
  },
  slot_duration: 45,
  buffer_between_slots: 15,
  notice_hours_min: 2,
  max_days_ahead: 30,
  holidays: [],
  blocked_slots: [],
  appointment_types: [
    {
      id: 'visite_chantier',
      name: 'Visite technique & Devis sur place',
      duration: 60,
      description: 'Déplacement sur votre chantier pour prise de cotes et étude de faisabilité gratuite.',
      badge: 'Recommandé gros travaux',
      color: 'amber',
      is_active: true
    },
    {
      id: 'visio_diagnostic',
      name: 'Échange préliminaire en visio / téléphone',
      duration: 30,
      description: 'Premier point de cadrage rapide pour vérifier la faisabilité et le calendrier.',
      badge: 'Rapide (30 min)',
      color: 'blue',
      is_active: true
    },
    {
      id: 'urgence_depannage',
      name: 'Diagnostic urgent & Dépannage',
      duration: 45,
      description: 'Intervention d\'évaluation sous 24h à 48h.',
      badge: 'Prioritaire',
      color: 'emerald',
      is_active: true
    }
  ],
  auto_reminders: {
    email_confirmation: true,
    email_24h_before: true,
    sms_2h_before: true
  },
  calendar_sync: {
    google_connected: true,
    outlook_connected: false
  }
};

/**
 * Récupère tous les rendez-vous enregistrés dans la BD
 */
export async function fetchAppointments(companyId?: number): Promise<Appointment[]> {
  try {
    const url = createApiUrl('appointments.php');
    if (companyId) url.searchParams.append('company_id', companyId.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.appointments || []);
  } catch (err) {
    console.warn('[appointmentService] Fetch failed, returning empty list:', err);
    return [];
  }
}

/**
 * Crée un nouveau rendez-vous (en ligne ou manuel) et persiste en BD
 */
export async function createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
  const url = createApiUrl('appointments.php');
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la réservation du rendez-vous');
  }

  const result = await res.json();
  return result.appointment || result;
}

/**
 * Modifie le statut ou les informations d'un rendez-vous
 */
export async function updateAppointment(id: number | string, data: Partial<Appointment>): Promise<Appointment> {
  const url = createApiUrl('appointments.php');
  url.searchParams.append('id', String(id));

  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la mise à jour du rendez-vous');
  }

  const result = await res.json();
  return result.appointment || result;
}

/**
 * Supprime un rendez-vous
 */
export async function deleteAppointment(id: number | string): Promise<boolean> {
  const url = createApiUrl('appointments.php');
  url.searchParams.append('id', String(id));

  const res = await fetch(url.toString(), {
    method: 'DELETE'
  });

  return res.ok;
}

/**
 * Récupère les paramètres de prise de rendez-vous et disponibilités
 */
export async function fetchAppointmentSettings(companyId?: number): Promise<AppointmentSettings> {
  try {
    const url = createApiUrl('appointment_settings.php');
    if (companyId) url.searchParams.append('company_id', companyId.toString());

    const res = await fetch(url.toString());
    if (!res.ok) return DEFAULT_APPOINTMENT_SETTINGS;
    const data = await res.json();
    return { ...DEFAULT_APPOINTMENT_SETTINGS, ...(data.settings || data) };
  } catch {
    return DEFAULT_APPOINTMENT_SETTINGS;
  }
}

/**
 * Sauvegarde les paramètres de disponibilité et réservation
 */
export async function saveAppointmentSettings(settings: Partial<AppointmentSettings>, companyId?: number): Promise<AppointmentSettings> {
  const url = createApiUrl('appointment_settings.php');
  if (companyId) url.searchParams.append('company_id', companyId.toString());

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });

  if (!res.ok) {
    throw new Error('Erreur lors de la sauvegarde des paramètres de RDV');
  }

  const result = await res.json();
  return { ...DEFAULT_APPOINTMENT_SETTINGS, ...(result.settings || result) };
}

/**
 * Crée un lien d'invitation personnalisé unique
 */
export async function createBookingLink(data: {
  company_id: number;
  client_id?: number | string | null;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  duration_minutes?: number;
  appointment_type?: string;
  title?: string;
  notes?: string;
}): Promise<BookingLink> {
  const url = createApiUrl('booking_links.php');
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erreur lors de la création du lien de réservation');
  }

  const result = await res.json();
  return result.link;
}

/**
 * Récupère les détails d'un lien de réservation par son token
 */
export async function fetchBookingLink(token: string): Promise<{
  link: BookingLink;
  company: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    logo_url?: string;
  };
  settings: AppointmentSettings;
}> {
  const url = createApiUrl('booking_links.php');
  url.searchParams.append('token', token);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lien de réservation introuvable');
  }

  return await res.json();
}

/**
 * Récupère les notifications en temps réel
 */
export async function fetchAppointmentNotifications(companyId?: number): Promise<AppointmentNotification[]> {
  try {
    const url = createApiUrl('appointment_notifications.php');
    if (companyId) url.searchParams.append('company_id', companyId.toString());

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Marque les notifications comme lues
 */
export async function markAppointmentNotificationsRead(companyId?: number): Promise<boolean> {
  try {
    const url = createApiUrl('appointment_notifications.php');
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', company_id: companyId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Calcule avec précision tous les créneaux disponibles pour une date donnée
 * en excluant les jours fermés, congés, créneaux bloqués et RDV déjà pris.
 */
export function computeAvailableSlots(
  dateStr: string, // YYYY-MM-DD
  settings: AppointmentSettings,
  existingAppointments: Appointment[],
  customDuration?: number
): string[] {
  if (!dateStr) return [];

  const targetDate = new Date(dateStr + 'T00:00:00');
  if (isNaN(targetDate.getTime())) return [];

  // 1. Vérification du jour de la semaine (1 = Lundi ... 7 = Dimanche)
  const jsDay = targetDate.getDay(); // 0 = Dimanche, 1 = Lundi
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  const daySchedule = settings.day_schedules?.[dayOfWeek];
  const isDayEnabled = daySchedule ? daySchedule.enabled : (settings.working_days || [1, 2, 3, 4, 5]).includes(dayOfWeek);

  if (!isDayEnabled) return [];

  // 2. Vérification des congés / jours d'absence
  if (settings.holidays && settings.holidays.includes(dateStr)) {
    return [];
  }

  // 3. Plages horaires du jour
  const startTimeStr = daySchedule?.start || settings.working_hours?.start || '08:30';
  const endTimeStr = daySchedule?.end || settings.working_hours?.end || '18:30';

  const [startH, startM] = startTimeStr.split(':').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);

  const startMinutes = (startH || 8) * 60 + (startM || 30);
  const endMinutes = (endH || 18) * 60 + (endM || 30);

  const duration = customDuration || settings.slot_duration || 45;
  const buffer = settings.buffer_between_slots ?? 15;
  const step = duration + buffer;

  // Créneaux bloqués ponctuels pour cette date
  const blockedForDate = (settings.blocked_slots || []).filter(b => b.date === dateStr);

  // RDV existants pour cette date qui ne sont pas annulés
  const bookedForDate = existingAppointments.filter(
    a => a.date === dateStr && a.status !== 'cancelled'
  );

  const slots: string[] = [];
  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  for (let m = startMinutes; m + duration <= endMinutes; m += step) {
    const slotH = Math.floor(m / 60);
    const slotM = m % 60;
    const timeStr = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;
    const slotEndMinutes = m + duration;

    // Si aujourd'hui, vérifier délai de prévenance (notice)
    if (isToday) {
      const minNoticeMinutes = (settings.notice_hours_min || 1) * 60;
      if (m <= currentTotalMinutes + minNoticeMinutes) {
        continue;
      }
    }

    // Vérifier collision avec créneau bloqué
    const isBlocked = blockedForDate.some(b => {
      const [bStartH, bStartM] = b.start.split(':').map(Number);
      const [bEndH, bEndM] = b.end.split(':').map(Number);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;
      return (m < bEndMin && slotEndMinutes > bStartMin);
    });

    if (isBlocked) continue;

    // Vérifier collision avec RDV déjà pris
    const isBooked = bookedForDate.some(a => {
      if (!a.time) return false;
      const [aStartH, aStartM] = a.time.split(':').map(Number);
      const aStartMin = aStartH * 60 + aStartM;
      const aEndMin = aStartMin + (a.duration_minutes || duration);
      return (m < aEndMin && slotEndMinutes > aStartMin);
    });

    if (isBooked) continue;

    slots.push(timeStr);
  }

  return slots;
}

/**
 * Génère une URL pour ajouter le rendez-vous à Google Calendar
 */
export function generateGoogleCalendarUrl(appointment: Partial<Appointment>, companyName?: string): string {
  if (!appointment.date || !appointment.time) return '';

  const cleanDate = appointment.date.replace(/-/g, '');
  const [h, m] = appointment.time.split(':');
  const startDt = `${cleanDate}T${h}${m}00`;

  const durationMin = appointment.duration_minutes || 45;
  const startMinutes = Number(h) * 60 + Number(m) + durationMin;
  const endH = String(Math.floor(startMinutes / 60)).padStart(2, '0');
  const endM = String(startMinutes % 60).padStart(2, '0');
  const endDt = `${cleanDate}T${endH}${endM}00`;

  const title = encodeURIComponent(appointment.title || `Rendez-vous avec ${companyName || 'MDIV Business'}`);
  const details = encodeURIComponent(
    `Rendez-vous professionnel\nClient : ${appointment.client_name || ''}\nTéléphone : ${appointment.client_phone || ''}\n${appointment.notes ? 'Notes : ' + appointment.notes + '\n' : ''}${appointment.meeting_url ? 'Visio : ' + appointment.meeting_url : ''}`
  );
  const location = encodeURIComponent(appointment.location || 'Sur place / En ligne');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDt}/${endDt}&details=${details}&location=${location}`;
}

/**
 * Génère le contenu d'un fichier .ics (Apple Calendar / Outlook)
 */
export function generateICSContent(appointment: Partial<Appointment>, companyName?: string): string {
  if (!appointment.date || !appointment.time) return '';

  const cleanDate = appointment.date.replace(/-/g, '');
  const [h, m] = appointment.time.split(':');
  const startDt = `${cleanDate}T${h}${m}00`;

  const durationMin = appointment.duration_minutes || 45;
  const startMinutes = Number(h) * 60 + Number(m) + durationMin;
  const endH = String(Math.floor(startMinutes / 60)).padStart(2, '0');
  const endM = String(startMinutes % 60).padStart(2, '0');
  const endDt = `${cleanDate}T${endH}${endM}00`;

  const title = appointment.title || `Rendez-vous avec ${companyName || 'MDIV Business'}`;
  const description = `Rendez-vous avec ${companyName || 'MDIV Business'}. Client : ${appointment.client_name || ''}. ${appointment.meeting_url || ''}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MDIV Business//Prise de RDV 24h/24//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:mdiv-apt-${appointment.id || Date.now()}@mdiv-business.fr`,
    `DTSTAMP:${cleanDate}T000000Z`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${appointment.location || 'En ligne / Sur place'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Déclenche le téléchargement du fichier .ics dans le navigateur
 */
export function downloadICSFile(appointment: Partial<Appointment>, companyName?: string) {
  const content = generateICSContent(appointment, companyName);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `rendez-vous-${appointment.date || 'mdiv'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
