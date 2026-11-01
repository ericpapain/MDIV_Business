import { getDb, saveDb } from '../../database/db-connection';
import { generateToken } from '../../shared/utils/crypto.utils';
import { ApiError } from '../../shared/errors/api-error';

export class AppointmentService {
  getAppointments(companyId: number) {
    const db = getDb();
    let list = [...(db.appointments || [])];
    if (companyId) {
      list = list.filter((a: any) => !a.company_id || a.company_id === companyId);
    }
    list.sort((a: any, b: any) => {
      const dtA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dtB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return dtA - dtB;
    });
    return list;
  }

  createAppointment(companyId: number, fields: any) {
    if (!fields.client_name) {
      throw ApiError.badRequest("Le nom du client est obligatoire pour bloquer le créneau.");
    }

    const db = getDb();
    const aptCompanyId = fields.company_id ? parseInt(fields.company_id, 10) : companyId;

    // Auto-lier ou créer client dans le CRM si nécessaire
    if (db.clients) {
      const clientExists = db.clients.some((c: any) =>
        c.name.toLowerCase() === fields.client_name.toLowerCase() ||
        (fields.client_email && c.email && c.email.toLowerCase() === fields.client_email.toLowerCase())
      );
      if (!clientExists) {
        db.clients.unshift({
          id: Date.now(),
          company_id: aptCompanyId,
          name: fields.client_name,
          company: fields.client_company || fields.client_name,
          email: fields.client_email || '',
          phone: fields.client_phone || '',
          address: fields.location || '',
          notes: `Créé automatiquement suite à une prise de RDV en ligne (${fields.appointment_type || 'RDV'})`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const newAppointment = {
      id: fields.id || Date.now(),
      company_id: aptCompanyId,
      client_name: fields.client_name,
      client_email: fields.client_email || '',
      client_phone: fields.client_phone || '',
      appointment_type: fields.appointment_type || 'visite_chantier',
      title: fields.title || (fields.appointment_type === 'visio_diagnostic' ? 'Échange préliminaire en visio' : 'Visite technique sur chantier'),
      date: fields.date || new Date().toISOString().split('T')[0],
      time: fields.time || '14:00',
      duration_minutes: Number(fields.duration_minutes) || 45,
      location: fields.location || 'Sur place / Chantier',
      notes: fields.notes || '',
      status: fields.status || 'confirmed',
      source: fields.source || 'online_booking',
      meeting_url: fields.meeting_url || (fields.appointment_type === 'visio_diagnostic'
        ? ('https://meet.google.com/mdiv-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6))
        : ''),
      created_at: new Date().toISOString(),
      reminders_sent: {
        email_confirmation: true,
        sms_reminder: Boolean(fields.client_phone),
      },
    };

    if (!db.appointments) db.appointments = [];
    db.appointments.unshift(newAppointment);

    // Notification propriétaire
    if (!db.appointment_notifications) db.appointment_notifications = [];
    db.appointment_notifications.unshift({
      id: 'notif-' + Date.now(),
      company_id: aptCompanyId,
      appointment_id: newAppointment.id,
      type: 'new_booking',
      title: 'Nouvelle réservation reçue !',
      message: `${newAppointment.client_name} a réservé pour le ${newAppointment.date} à ${newAppointment.time} (${newAppointment.duration_minutes} min).`,
      read: false,
      created_at: new Date().toISOString(),
    });

    saveDb(db);
    return newAppointment;
  }

  updateAppointment(id: string | number, fields: any) {
    const db = getDb();
    if (!db.appointments) db.appointments = [];
    const index = db.appointments.findIndex((a: any) => String(a.id) === String(id));
    if (index === -1) {
      throw ApiError.notFound("Rendez-vous introuvable.");
    }

    const prevApt = db.appointments[index];
    db.appointments[index] = {
      ...prevApt,
      ...fields,
      id: prevApt.id,
      updated_at: new Date().toISOString(),
    };

    if (!db.appointment_notifications) db.appointment_notifications = [];
    if (fields.status === 'cancelled') {
      db.appointment_notifications.unshift({
        id: 'notif-' + Date.now(),
        company_id: prevApt.company_id,
        appointment_id: prevApt.id,
        type: 'cancelled',
        title: 'Rendez-vous annulé',
        message: `${prevApt.client_name} a annulé son rendez-vous du ${prevApt.date} à ${prevApt.time}.`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    saveDb(db);
    return db.appointments[index];
  }

  deleteAppointment(id: string | number) {
    const db = getDb();
    if (!db.appointments) db.appointments = [];
    db.appointments = db.appointments.filter((a: any) => String(a.id) !== String(id));
    saveDb(db);
    return true;
  }

  getSettings() {
    const db = getDb();
    return db.appointment_settings || {};
  }

  saveSettings(fields: any) {
    const db = getDb();
    db.appointment_settings = {
      ...(db.appointment_settings || {}),
      ...fields,
      updated_at: new Date().toISOString(),
    };
    saveDb(db);
    return db.appointment_settings;
  }

  createBookingLink(companyId: number, fields: any) {
    const token = 'rdv-' + Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
    const newLink = {
      id: 'link-' + Date.now(),
      token,
      company_id: companyId,
      client_id: fields.client_id || null,
      client_name: fields.client_name || '',
      client_phone: fields.client_phone || '',
      client_email: fields.client_email || '',
      duration_minutes: Number(fields.duration_minutes) || 30,
      appointment_type: fields.appointment_type || 'standard',
      title: fields.title || 'Rendez-vous',
      notes: fields.notes || '',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const db = getDb();
    if (!db.booking_links) db.booking_links = [];
    db.booking_links.unshift(newLink);
    saveDb(db);
    return newLink;
  }

  getBookingLinkByToken(token: string) {
    const db = getDb();
    const link = (db.booking_links || []).find((l: any) => l.token === token);
    if (!link) {
      throw ApiError.notFound("Lien de réservation introuvable ou expiré.");
    }

    const company = (db.companies || []).find((c: any) => c.id === link.company_id) || {
      id: link.company_id || 4,
      name: "MDIV Entreprise",
      email: "direction@mdiv-business.fr",
      phone: "01 80 90 20 26",
      city: "Paris",
    };

    return {
      link,
      company: {
        id: company.id,
        name: company.name || company.company_name || "MDIV Business",
        email: company.email || "direction@mdiv-business.fr",
        phone: company.phone || "01 80 90 20 26",
        city: company.city || "Paris",
        logo_url: company.logo_url || company.logo || "",
      },
      settings: db.appointment_settings || {},
    };
  }

  getNotifications(companyId: number) {
    const db = getDb();
    let list = db.appointment_notifications || [];
    if (companyId) {
      list = list.filter((n: any) => !n.company_id || n.company_id === companyId);
    }
    return list;
  }

  markNotificationsRead() {
    const db = getDb();
    if (db.appointment_notifications) {
      db.appointment_notifications.forEach((n: any) => { n.read = true; });
      saveDb(db);
    }
    return true;
  }

  clearNotifications() {
    const db = getDb();
    db.appointment_notifications = [];
    saveDb(db);
    return true;
  }
}

export const appointmentService = new AppointmentService();
