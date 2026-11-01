import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

const DEV_DB_PATH = path.resolve(process.cwd(), 'dev_db.json');

function loadDevDb(): any {
  try {
    if (fs.existsSync(DEV_DB_PATH)) {
      return JSON.parse(fs.readFileSync(DEV_DB_PATH, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveDevDb(data: any) {
  try {
    fs.writeFileSync(DEV_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

async function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const DEFAULT_ROLES = [
  { id: 'role_admin', company_id: 0, name: 'Administrateur', description: 'Accès total à tous les services', permissions: ['all'] },
  { id: 'role_rh', company_id: 0, name: 'Ressources Humaines', description: 'Factures et notes de frais', permissions: ['invoices', 'expenses'] },
  { id: 'role_sav', company_id: 0, name: 'Support & SAV', description: 'Messagerie et calendrier', permissions: ['emails', 'calendar'] },
  { id: 'role_com', company_id: 0, name: 'Commercial', description: 'Devis, clients et prospection', permissions: ['quotes', 'clients', 'leads', 'calendar'] }
];

export async function handleDevTeamRequest(
  req: IncomingMessage,
  res: ServerResponse,
  urlObj: URL,
  pathname: string
): Promise<boolean> {
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. /api/team.php
  if (pathname === '/api/team.php') {
    const companyId = parseInt(urlObj.searchParams.get('company_id') || '1', 10);
    const db = loadDevDb();
    if (!Array.isArray(db.team_members)) db.team_members = [];

    if (method === 'GET') {
      const members = db.team_members.filter((m: any) => parseInt(m.company_id || '1', 10) === companyId);
      sendJson(res, 200, { success: true, company_id: companyId, members });
      return true;
    }

    if (method === 'POST') {
      const data = await parseRequestBody(req);
      const targetCompanyId = parseInt(data.company_id || companyId, 10);
      const firstName = String(data.first_name || data.firstName || 'Collaborateur').trim();
      const lastName = String(data.last_name || data.lastName || '').trim();
      const email = String(data.email || '').trim();
      const role = String(data.role || 'USER').trim();
      const jobTitle = String(data.job_title || data.jobTitle || 'Collaborateur').trim();
      const permissions = Array.isArray(data.permissions) ? data.permissions : ['invoices', 'quotes'];

      if (!email || !email.includes('@')) {
        sendJson(res, 422, { error: 'Adresse email valide requise' });
        return true;
      }

      const id = data.id || `user_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;
      const member = {
        id,
        company_id: targetCompanyId,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        job_title: jobTitle,
        permissions,
        status: 'active',
        created_at: new Date().toISOString()
      };

      let existing = false;
      for (let idx = 0; idx < db.team_members.length; idx++) {
        if (db.team_members[idx].id === id || db.team_members[idx].email === email) {
          db.team_members[idx] = { ...db.team_members[idx], ...member };
          existing = true;
          break;
        }
      }
      if (!existing) db.team_members.push(member);
      saveDevDb(db);

      sendJson(res, 200, { success: true, member });
      return true;
    }

    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id') || '';
      if (id) {
        db.team_members = db.team_members.filter((m: any) => String(m.id) !== String(id));
        saveDevDb(db);
      }
      sendJson(res, 200, { success: true, message: 'Membre supprimé' });
      return true;
    }

    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return true;
  }

  // 2. /api/roles.php
  if (pathname === '/api/roles.php') {
    const companyId = parseInt(urlObj.searchParams.get('company_id') || '1', 10);
    const db = loadDevDb();
    if (!Array.isArray(db.company_roles) || db.company_roles.length === 0) {
      db.company_roles = DEFAULT_ROLES.map(r => ({ ...r, company_id: companyId }));
      saveDevDb(db);
    }

    if (method === 'GET') {
      const roles = db.company_roles.filter(
        (r: any) => parseInt(r.company_id || '0', 10) === companyId || parseInt(r.company_id || '0', 10) === 0
      );
      sendJson(res, 200, { success: true, roles });
      return true;
    }

    if (method === 'POST') {
      const data = await parseRequestBody(req);
      const id = data.id || `role_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;
      const role = {
        id,
        company_id: parseInt(data.company_id || companyId, 10),
        name: String(data.name || 'Nouveau Rôle').trim(),
        description: String(data.description || '').trim(),
        permissions: Array.isArray(data.permissions) ? data.permissions : ['invoices', 'quotes'],
        created_at: new Date().toISOString()
      };

      let existing = false;
      for (let idx = 0; idx < db.company_roles.length; idx++) {
        if (db.company_roles[idx].id === id) {
          db.company_roles[idx] = { ...db.company_roles[idx], ...role };
          existing = true;
          break;
        }
      }
      if (!existing) db.company_roles.push(role);
      saveDevDb(db);

      sendJson(res, 200, { success: true, role });
      return true;
    }

    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id') || '';
      if (id) {
        db.company_roles = db.company_roles.filter((r: any) => String(r.id) !== String(id));
        saveDevDb(db);
      }
      sendJson(res, 200, { success: true, message: 'Rôle supprimé' });
      return true;
    }

    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return true;
  }

  // 3. /api/calendar.php
  if (pathname === '/api/calendar.php') {
    const companyId = parseInt(urlObj.searchParams.get('company_id') || '1', 10);
    const db = loadDevDb();
    if (!Array.isArray(db.calendar_events)) db.calendar_events = [];

    if (method === 'GET') {
      const events = db.calendar_events.filter((e: any) => parseInt(e.company_id || '1', 10) === companyId);
      sendJson(res, 200, { success: true, events });
      return true;
    }

    if (method === 'POST') {
      const data = await parseRequestBody(req);
      const targetCompanyId = parseInt(data.company_id || companyId, 10);
      const id = data.id || `event_${Date.now()}_${Math.floor(Math.random() * 900 + 100)}`;

      const event = {
        id,
        company_id: targetCompanyId,
        user_id: data.user_id || 'admin',
        client_id: data.client_id || null,
        client_name: data.client_name || '',
        project_id: data.project_id || null,
        project_title: data.project_title || '',
        title: data.title || 'Rappel',
        description: data.description || '',
        event_type: data.event_type || 'reminder',
        event_date: data.event_date || new Date().toISOString().split('T')[0],
        start_time: data.start_time || '09:00',
        end_time: data.end_time || '10:00',
        reminder_time: data.reminder_time || '08:00',
        send_sms: !!data.send_sms,
        send_email: data.send_email !== false,
        ai_draft_message: data.ai_draft_message || '',
        status: data.status || 'scheduled',
        created_at: new Date().toISOString()
      };

      let existing = false;
      for (let idx = 0; idx < db.calendar_events.length; idx++) {
        if (db.calendar_events[idx].id === id) {
          db.calendar_events[idx] = { ...db.calendar_events[idx], ...event };
          existing = true;
          break;
        }
      }
      if (!existing) db.calendar_events.push(event);
      saveDevDb(db);

      sendJson(res, 200, { success: true, event });
      return true;
    }

    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id') || '';
      if (id) {
        db.calendar_events = db.calendar_events.filter((e: any) => String(e.id) !== String(id));
        saveDevDb(db);
      }
      sendJson(res, 200, { success: true, message: 'Événement supprimé' });
      return true;
    }

    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return true;
  }

  // 4. /api/company_settings.php
  if (pathname === '/api/company_settings.php') {
    const companyId = parseInt(urlObj.searchParams.get('company_id') || '1', 10);
    const db = loadDevDb();
    if (!Array.isArray(db.company_settings)) db.company_settings = [];

    let setting = db.company_settings.find((s: any) => parseInt(s.company_id || '0', 10) === companyId);
    if (!setting) {
      setting = {
        company_id: companyId,
        logo_url: '',
        company_signature: "Bien cordialement,\nL'équipe MDIV Business",
        personal_signature: '',
        active_modules: ['invoices', 'quotes', 'clients', 'projects'],
        reminder_preferences: {
          morning_hour: '08:00',
          evening_hour: '18:00',
          notify_email: true,
          notify_sms: false
        }
      };
      db.company_settings.push(setting);
      saveDevDb(db);
    }

    if (method === 'GET') {
      sendJson(res, 200, { success: true, settings: setting });
      return true;
    }

    if (method === 'POST') {
      const data = await parseRequestBody(req);
      if (data.logo_url !== undefined) setting.logo_url = data.logo_url;
      if (data.company_signature !== undefined) setting.company_signature = data.company_signature;
      if (data.personal_signature !== undefined) setting.personal_signature = data.personal_signature;
      if (Array.isArray(data.active_modules)) setting.active_modules = data.active_modules;
      if (data.reminder_preferences && typeof data.reminder_preferences === 'object') {
        setting.reminder_preferences = { ...setting.reminder_preferences, ...data.reminder_preferences };
      }
      saveDevDb(db);

      sendJson(res, 200, { success: true, settings: setting });
      return true;
    }

    sendJson(res, 405, { error: 'Méthode non autorisée' });
    return true;
  }

  // 5. /api/team_activity.php
  if (pathname === '/api/team_activity.php') {
    const companyId = parseInt(urlObj.searchParams.get('company_id') || '1', 10);
    const db = loadDevDb();

    const invoices = (Array.isArray(db.invoices) ? db.invoices : [])
      .filter((i: any) => parseInt(i.company_id || '1', 10) === companyId);
    const quotes = (Array.isArray(db.quotes) ? db.quotes : [])
      .filter((q: any) => parseInt(q.company_id || '1', 10) === companyId);
    const followups = (Array.isArray(db.followups) ? db.followups : [])
      .filter((f: any) => parseInt(f.company_id || '1', 10) === companyId);
    const calendarEvents = (Array.isArray(db.calendar_events) ? db.calendar_events : [])
      .filter((e: any) => parseInt(e.company_id || '1', 10) === companyId);

    const activities: any[] = [];
    for (const inv of invoices.slice(0, 5)) {
      activities.push({
        type: 'invoice',
        title: 'Facture ' + (inv.invoice_number || inv.invoiceNumber || 'F-2026'),
        client: inv.clientName || 'Client',
        amount: inv.amount_ttc || inv.amountTTC || 0,
        status: inv.status || 'pending',
        date: inv.date || new Date().toISOString().split('T')[0]
      });
    }
    for (const q of quotes.slice(0, 5)) {
      activities.push({
        type: 'quote',
        title: 'Devis ' + (q.quote_number || q.quoteNumber || 'D-2026'),
        client: q.clientName || 'Client',
        amount: q.total_ttc || q.totalTTC || 0,
        status: q.status || 'draft',
        date: q.date || new Date().toISOString().split('T')[0]
      });
    }

    sendJson(res, 200, {
      success: true,
      company_id: companyId,
      summary: {
        pendingInvoicesCount: invoices.filter((i: any) => ['pending', 'overdue'].includes(i.status || '')).length,
        pendingQuotesCount: quotes.filter((q: any) => ['draft', 'sent'].includes(q.status || '')).length,
        followupsCount: followups.filter((f: any) => (f.status || '') === 'pending').length,
        upcomingEventsCount: calendarEvents.filter((e: any) => (e.status || '') === 'scheduled').length
      },
      latestActivities: activities
    });
    return true;
  }

  return false;
}
