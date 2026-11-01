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

interface AnalyticsVisit {
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
  user_agent: string;
  browser: string;
  os: string;
  device_type: string;
  duration_seconds: number;
  is_exit: number;
  is_bounce: number;
  conversion_event?: string | null;
  created_at: string;
  last_activity_at: string;
}

const SAMPLE_LOCATIONS = [
  { country: 'France', code: 'FR', city: 'Paris' },
  { country: 'France', code: 'FR', city: 'Lyon' },
  { country: 'France', code: 'FR', city: 'Troyes' },
  { country: 'France', code: 'FR', city: 'Marseille' },
  { country: 'France', code: 'FR', city: 'Lille' },
  { country: 'France', code: 'FR', city: 'Bordeaux' },
  { country: 'Maroc', code: 'MA', city: 'Casablanca' },
  { country: 'Maroc', code: 'MA', city: 'Rabat' },
  { country: 'Maroc', code: 'MA', city: 'Tanger' },
  { country: 'Côte d\'Ivoire', code: 'CI', city: 'Abidjan' },
  { country: 'Belgique', code: 'BE', city: 'Bruxelles' },
  { country: 'Suisse', code: 'CH', city: 'Genève' },
  { country: 'Sénégal', code: 'SN', city: 'Dakar' },
  { country: 'Canada', code: 'CA', city: 'Montréal' },
  { country: 'Émirats Arabes Unis', code: 'AE', city: 'Dubaï' },
];

const SAMPLE_PAGES = [
  { path: '/', title: 'Accueil - MDIV Business' },
  { path: '/services-ia', title: 'Services IA & Solutions IT4ALL' },
  { path: '/services-ia/diagnostic', title: 'Diagnostic de Maturité IA' },
  { path: '/services-ia/calc-roi', title: 'Calculateur de Rentabilité IA' },
  { path: '/services-ia/devis', title: 'Générateur de Devis Intelligent' },
  { path: '/services-ia/factures', title: 'Vérificateur & Facturation IA' },
  { path: '/services-ia/assistant-email', title: 'Assistant Rédaction Email B2B' },
  { path: '/services-ia/generateur-leads', title: 'Générateur de Leads B2B IA' },
  { path: '/services-ia/comptes-rendus', title: 'Comptes-Rendus & Synthèses IA' },
  { path: '/services-ia/tarifs', title: 'Grille Tarifaire & Plans IA' },
  { path: '/contact', title: 'Contact & Prise de Rendez-vous' },
  { path: '/offres', title: 'Offres d\'Immersion & Clubs BNE' },
  { path: '/evenements', title: 'Sommets & Rencontres Officielles BNE' },
  { path: '/blog', title: 'Blog & Décryptages Économiques' },
  { path: '/blog/1', title: 'Article : Automobile au Maroc (+400M$)' },
  { path: '/blog/2', title: 'Article : Cybersécurité des Entreprises en Afrique' },
  { path: '/sejours-bne', title: 'Séjours d\'Affaires BNE Casablanca/Abidjan' },
];

const SAMPLE_SOURCES = [
  'Accès direct', 'Google', 'LinkedIn', 'Google', 'Accès direct', 'LinkedIn', 'Bing', 'Facebook', 'Instagram', 'Twitter / X', 'Référents externes'
];

const SAMPLE_BROWSERS = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const SAMPLE_OS = ['Windows 11/10', 'macOS', 'iOS', 'Android', 'Linux'];
const SAMPLE_DEVICES = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Tablette'];

function seedDevAnalytics(db: any): AnalyticsVisit[] {
  if (db.analytics_visits && Array.isArray(db.analytics_visits) && db.analytics_visits.length >= 50) {
    return db.analytics_visits;
  }

  const visits: AnalyticsVisit[] = [];
  const now = Date.now();
  let idCounter = 1000;

  // Créer des parcours cohérents par session (environ 60 sessions, 180 pages vues réparties sur 30 jours)
  for (let s = 0; s < 65; s++) {
    const loc = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
    const source = SAMPLE_SOURCES[Math.floor(Math.random() * SAMPLE_SOURCES.length)];
    const browser = SAMPLE_BROWSERS[Math.floor(Math.random() * SAMPLE_BROWSERS.length)];
    const os = SAMPLE_OS[Math.floor(Math.random() * SAMPLE_OS.length)];
    const dev = os === 'iOS' || os === 'Android' ? 'Mobile' : (Math.random() > 0.85 ? 'Tablette' : 'Desktop');
    const sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;
    const visitorId = `vis_${Math.floor(100 + Math.random() * 300)}`;
    const ip = `82.${Math.floor(120 + Math.random() * 100)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(2 + Math.random() * 250)}`;

    // Distribution temporelle: 30% aujourd'hui et hier, 40% sur les 7 derniers jours, 30% sur 30 jours
    let daysAgo = 0;
    const r = Math.random();
    if (r < 0.25) {
      daysAgo = 0; // Aujourd'hui
    } else if (r < 0.45) {
      daysAgo = 1; // Hier
    } else if (r < 0.75) {
      daysAgo = Math.floor(2 + Math.random() * 6); // 2 à 7 jours
    } else {
      daysAgo = Math.floor(8 + Math.random() * 22); // 8 à 30 jours
    }

    const sessionStartTime = now - (daysAgo * 86400 * 1000) - Math.floor(Math.random() * 70000 * 1000);

    // Nombre d'étapes dans la session (1 à 5 pages)
    const stepCount = Math.random() > 0.3 ? (Math.random() > 0.5 ? 3 : 2) : (Math.random() > 0.5 ? 4 : 1);
    let cumulativeOffset = 0;

    // Définir un parcours logique
    const journeyPages: typeof SAMPLE_PAGES = [];
    journeyPages.push(SAMPLE_PAGES[0]); // Accueil d'abord
    if (stepCount >= 2) journeyPages.push(SAMPLE_PAGES[1]); // Services IA
    if (stepCount >= 3) {
      const toolPage = SAMPLE_PAGES[Math.floor(2 + Math.random() * 8)];
      journeyPages.push(toolPage);
    }
    if (stepCount >= 4) {
      journeyPages.push(SAMPLE_PAGES[10]); // Contact ou tarifs
    }

    for (let step = 0; step < stepCount; step++) {
      const stepPage = journeyPages[step] || SAMPLE_PAGES[Math.floor(Math.random() * SAMPLE_PAGES.length)];
      const stepTime = sessionStartTime + cumulativeOffset;
      const stepDuration = Math.floor(25 + Math.random() * 220);
      cumulativeOffset += stepDuration * 1000;

      const isExit = step === stepCount - 1 ? 1 : 0;
      const isBounce = stepCount === 1 && stepDuration < 30 ? 1 : 0;

      let conversionEvent: string | null = null;
      if (step === stepCount - 1 && Math.random() > 0.65) {
        const convs = ['Demande de devis', 'Formulaire contact', 'Diagnostic IA complété', 'Téléchargement Guide'];
        conversionEvent = convs[Math.floor(Math.random() * convs.length)];
      }

      visits.push({
        id: ++idCounter,
        session_id: sessionId,
        visitor_id: visitorId,
        ip_address: ip,
        country: loc.country,
        country_code: loc.code,
        city: loc.city,
        page_path: stepPage.path,
        page_title: stepPage.title,
        referrer: source === 'Accès direct' ? '' : `https://${source.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        referrer_source: source,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        browser,
        os,
        device_type: dev,
        duration_seconds: stepDuration,
        is_exit: isExit,
        is_bounce: isBounce,
        conversion_event: conversionEvent,
        created_at: new Date(stepTime).toISOString(),
        last_activity_at: new Date(stepTime + stepDuration * 1000).toISOString()
      });
    }
  }

  // Trier par date décroissante
  visits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  db.analytics_visits = visits;
  saveDevDb(db);
  return visits;
}

export async function handleDevAnalyticsRequest(req: IncomingMessage, res: ServerResponse, urlObj: URL) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const action = urlObj.searchParams.get('action');
  const db = loadDevDb();
  const visits = seedDevAnalytics(db);

async function readAnalyticsJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

  // 1. ACTION : TRACK
  if (action === 'track' && req.method === 'POST') {
    const body = await readAnalyticsJson(req);

    const sessionId = body.sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`;
    const visitorId = body.visitorId || `vis_${Math.floor(100 + Math.random() * 500)}`;
    const pagePath = body.pagePath || '/';
    const pageTitle = body.pageTitle || '';
    const referrer = body.referrer || '';
    const conversionEvent = body.conversionEvent || null;

    // Détecter la source
    let source = 'Accès direct';
    if (referrer.includes('google')) source = 'Google';
    else if (referrer.includes('linkedin')) source = 'LinkedIn';
    else if (referrer.includes('bing')) source = 'Bing';
    else if (referrer.includes('facebook')) source = 'Facebook';
    else if (referrer.includes('instagram')) source = 'Instagram';
    else if (referrer) source = 'Référents externes';

    const userAgent = req.headers['user-agent'] || '';
    let browser = 'Chrome';
    if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';

    let os = 'Windows 11/10';
    if (userAgent.includes('Macintosh')) os = 'macOS';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';

    let dev = 'Desktop';
    if (/Mobile|Android|iPhone/i.test(userAgent)) dev = 'Mobile';
    else if (/Tablet|iPad/i.test(userAgent)) dev = 'Tablette';

    const newVisit: AnalyticsVisit = {
      id: Date.now(),
      session_id: sessionId,
      visitor_id: visitorId,
      ip_address: '82.124.64.' + Math.floor(10 + Math.random() * 200),
      country: 'France',
      country_code: 'FR',
      city: 'Paris',
      page_path: pagePath,
      page_title: pageTitle,
      referrer,
      referrer_source: source,
      user_agent: userAgent,
      browser,
      os,
      device_type: dev,
      duration_seconds: 5,
      is_exit: 0,
      is_bounce: 0,
      conversion_event: conversionEvent,
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    };

    visits.unshift(newVisit);
    db.analytics_visits = visits.slice(0, 500); // Garder 500 max
    saveDevDb(db);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      visitId: newVisit.id,
      sessionId,
      visitorId
    }));
    return true;
  }

  // 2. ACTION : PING
  if (action === 'ping' && req.method === 'POST') {
    const body = await readAnalyticsJson(req);
    const visitId = body.visitId;
    const dur = parseInt(body.durationSeconds) || 15;
    const isExit = body.isExit ? 1 : 0;
    const conv = body.conversionEvent || null;

    const target = visits.find(v => v.id == visitId);
    if (target) {
      target.duration_seconds += dur;
      target.is_exit = isExit;
      if (conv) target.conversion_event = conv;
      target.last_activity_at = new Date().toISOString();
      saveDevDb(db);
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true }));
    return true;
  }

  // 3. ACTION : REALTIME
  if (action === 'realtime') {
    const nowMs = Date.now();
    const fiveMinAgoMs = nowMs - (5 * 60 * 1000);

    const activeVisits = visits.filter(v => new Date(v.last_activity_at).getTime() >= fiveMinAgoMs);
    const activeSessions = new Set(activeVisits.map(v => v.session_id));
    const activeCount = Math.max(activeSessions.size, 2); // Toujours au moins 2-3 connectés en démo

    const pageCounts: Record<string, { page_path: string; page_title: string; count: number }> = {};
    for (const v of visits.slice(0, 15)) {
      if (!pageCounts[v.page_path]) {
        pageCounts[v.page_path] = { page_path: v.page_path, page_title: v.page_title, count: 0 };
      }
      pageCounts[v.page_path].count++;
    }

    const activePages = Object.values(pageCounts).sort((a, b) => b.count - a.count).slice(0, 6);

    const recentFeed = visits.slice(0, 10).map(v => {
      const elapsedSec = Math.max(Math.floor((nowMs - new Date(v.last_activity_at).getTime()) / 1000), 4);
      return {
        ...v,
        seconds_ago: elapsedSec
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      activeCount,
      activePages,
      recentFeed
    }));
    return true;
  }

  // 4. ACTION : DASHBOARD
  if (action === 'dashboard') {
    const period = urlObj.searchParams.get('period') || '30d';
    const nowMs = Date.now();
    let filterStartMs = nowMs - (30 * 86400 * 1000);
    let prevStartMs = nowMs - (60 * 86400 * 1000);
    let prevEndMs = filterStartMs;
    let interval: 'hour' | 'day' | 'month' = 'day';

    if (period === 'today') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      filterStartMs = d.getTime();
      prevStartMs = filterStartMs - 86400 * 1000;
      prevEndMs = filterStartMs;
      interval = 'hour';
    } else if (period === 'yesterday') {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      filterStartMs = d.getTime() - 86400 * 1000;
      const filterEndMs = d.getTime();
      prevStartMs = filterStartMs - 86400 * 1000;
      prevEndMs = filterStartMs;
      interval = 'hour';
    } else if (period === '7d') {
      filterStartMs = nowMs - (7 * 86400 * 1000);
      prevStartMs = nowMs - (14 * 86400 * 1000);
      prevEndMs = filterStartMs;
      interval = 'day';
    } else if (period === '90d') {
      filterStartMs = nowMs - (90 * 86400 * 1000);
      prevStartMs = nowMs - (180 * 86400 * 1000);
      prevEndMs = filterStartMs;
      interval = 'day';
    } else if (period === '12m') {
      filterStartMs = nowMs - (365 * 86400 * 1000);
      prevStartMs = nowMs - (730 * 86400 * 1000);
      prevEndMs = filterStartMs;
      interval = 'month';
    }

    const currentVisits = visits.filter(v => new Date(v.created_at).getTime() >= filterStartMs);
    const prevVisits = visits.filter(v => {
      const t = new Date(v.created_at).getTime();
      return t >= prevStartMs && t < prevEndMs;
    });

    // KPI Metrics calculation
    const currentUniqueVisitors = new Set(currentVisits.map(v => v.visitor_id)).size;
    const prevUniqueVisitors = new Set(prevVisits.map(v => v.visitor_id)).size || 1;

    const currentSessions = new Set(currentVisits.map(v => v.session_id)).size;
    const prevSessions = new Set(prevVisits.map(v => v.session_id)).size || 1;

    const currentPageviews = currentVisits.length;
    const prevPageviews = prevVisits.length || 1;

    const currentDurSum = currentVisits.reduce((acc, v) => acc + (v.duration_seconds || 0), 0);
    const currentAvgDuration = currentVisits.length ? Math.round(currentDurSum / currentVisits.length) : 0;
    const prevDurSum = prevVisits.reduce((acc, v) => acc + (v.duration_seconds || 0), 0);
    const prevAvgDuration = prevVisits.length ? Math.round(prevDurSum / prevVisits.length) : 1;

    const currentPagesPerSession = currentSessions > 0 ? +(currentPageviews / currentSessions).toFixed(2) : 0;
    const prevPagesPerSession = prevSessions > 0 ? +(prevPageviews / prevSessions).toFixed(2) : 1;

    const currentBounces = currentVisits.filter(v => v.is_bounce === 1 || v.duration_seconds < 20).length;
    const currentBounceRate = currentSessions > 0 ? +((currentBounces / currentSessions) * 100).toFixed(1) : 0;
    const prevBounces = prevVisits.filter(v => v.is_bounce === 1 || v.duration_seconds < 20).length;
    const prevBounceRate = prevSessions > 0 ? +((prevBounces / prevSessions) * 100).toFixed(1) : 1;

    // Visitors today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVisits = visits.filter(v => new Date(v.created_at).getTime() >= startOfToday.getTime());
    const visitorsToday = new Set(todayVisits.map(v => v.visitor_id)).size;

    const calcTrend = (cur: number, pre: number) => {
      if (!pre) return cur > 0 ? 100 : 0;
      return +(((cur - pre) / pre) * 100).toFixed(1);
    };

    const kpis = {
      visitors_today: {
        value: visitorsToday || 14,
        trend: 16.4,
        label: "Visiteurs aujourd'hui",
        compare: "vs hier même heure"
      },
      unique_visitors: {
        value: currentUniqueVisitors || 86,
        trend: calcTrend(currentUniqueVisitors, prevUniqueVisitors),
        label: "Visiteurs uniques",
        compare: "vs période précédente"
      },
      total_sessions: {
        value: currentSessions || 112,
        trend: calcTrend(currentSessions, prevSessions),
        label: "Sessions totales",
        compare: "vs période précédente"
      },
      pageviews: {
        value: currentPageviews || 248,
        trend: calcTrend(currentPageviews, prevPageviews),
        label: "Pages vues",
        compare: "vs période précédente"
      },
      avg_duration: {
        value: currentAvgDuration || 145, // en secondes
        trend: calcTrend(currentAvgDuration, prevAvgDuration),
        label: "Temps moyen par visite",
        compare: "vs période précédente"
      },
      pages_per_session: {
        value: currentPagesPerSession || 2.4,
        trend: calcTrend(currentPagesPerSession, prevPagesPerSession),
        label: "Pages par session",
        compare: "vs période précédente"
      },
      bounce_rate: {
        value: currentBounceRate || 28.5,
        trend: -3.2,
        label: "Taux de rebond",
        compare: "vs période précédente"
      },
      realtime_active: {
        value: 3,
        trend: 0,
        label: "Visiteurs actifs en direct",
        compare: "Temps réel (5 min)"
      }
    };

    // Timeline series
    const timelineMap: Record<string, { date: string; visitors: Set<string>; sessions: Set<string>; pageviews: number }> = {};

    if (interval === 'hour') {
      for (let h = 0; h < 24; h++) {
        const key = `${String(h).padStart(2, '0')}:00`;
        timelineMap[key] = { date: key, visitors: new Set(), sessions: new Set(), pageviews: 0 };
      }
      for (const v of currentVisits) {
        const d = new Date(v.created_at);
        const key = `${String(d.getHours()).padStart(2, '0')}:00`;
        if (timelineMap[key]) {
          timelineMap[key].visitors.add(v.visitor_id);
          timelineMap[key].sessions.add(v.session_id);
          timelineMap[key].pageviews++;
        }
      }
    } else {
      // Days
      const numDays = period === '7d' ? 7 : (period === '90d' ? 14 : 30);
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(nowMs - (i * (period === '90d' ? 6 : 1) * 86400 * 1000));
        const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        timelineMap[key] = { date: key, visitors: new Set(), sessions: new Set(), pageviews: 0 };
      }
      for (const v of currentVisits) {
        const d = new Date(v.created_at);
        const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (timelineMap[key]) {
          timelineMap[key].visitors.add(v.visitor_id);
          timelineMap[key].sessions.add(v.session_id);
          timelineMap[key].pageviews++;
        }
      }
    }

    const timeline = Object.values(timelineMap).map(item => ({
      date: item.date,
      visitors: item.visitors.size,
      sessions: item.sessions.size,
      pageviews: item.pageviews
    }));

    // Top Pages
    const pageMap: Record<string, { page_path: string; page_title: string; views: number; unique_visitors: Set<string>; durationSum: number; exitCount: number }> = {};
    for (const v of currentVisits) {
      if (!pageMap[v.page_path]) {
        pageMap[v.page_path] = {
          page_path: v.page_path,
          page_title: v.page_title || v.page_path,
          views: 0,
          unique_visitors: new Set(),
          durationSum: 0,
          exitCount: 0
        };
      }
      pageMap[v.page_path].views++;
      pageMap[v.page_path].unique_visitors.add(v.visitor_id);
      pageMap[v.page_path].durationSum += v.duration_seconds || 0;
      if (v.is_exit) pageMap[v.page_path].exitCount++;
    }

    const topPages = Object.values(pageMap).map(p => ({
      page_path: p.page_path,
      page_title: p.page_title,
      views: p.views,
      unique_visitors: p.unique_visitors.size,
      avg_duration: p.views > 0 ? Math.round(p.durationSum / p.views) : 0,
      exit_rate: p.views > 0 ? +((p.exitCount / p.views) * 100).toFixed(1) : 0
    })).sort((a, b) => b.views - a.views);

    // Geolocation Countries & Cities
    const countryMap: Record<string, { country: string; country_code: string; visitors: Set<string>; pageviews: number }> = {};
    const cityMap: Record<string, { city: string; country: string; country_code: string; visitors: Set<string>; pageviews: number }> = {};

    for (const v of currentVisits) {
      // Country
      if (!countryMap[v.country]) {
        countryMap[v.country] = { country: v.country, country_code: v.country_code || 'FR', visitors: new Set(), pageviews: 0 };
      }
      countryMap[v.country].visitors.add(v.visitor_id);
      countryMap[v.country].pageviews++;

      // City
      const cityKey = `${v.city}-${v.country}`;
      if (!cityMap[cityKey]) {
        cityMap[cityKey] = { city: v.city, country: v.country, country_code: v.country_code || 'FR', visitors: new Set(), pageviews: 0 };
      }
      cityMap[cityKey].visitors.add(v.visitor_id);
      cityMap[cityKey].pageviews++;
    }

    const totalCountryVisits = currentVisits.length || 1;
    const countries = Object.values(countryMap).map(c => ({
      country: c.country,
      country_code: c.country_code,
      visitors: c.visitors.size,
      pageviews: c.pageviews,
      percentage: +((c.pageviews / totalCountryVisits) * 100).toFixed(1)
    })).sort((a, b) => b.visitors - a.visitors);

    const cities = Object.values(cityMap).map(c => ({
      city: c.city,
      country: c.country,
      country_code: c.country_code,
      visitors: c.visitors.size,
      pageviews: c.pageviews,
      percentage: +((c.pageviews / totalCountryVisits) * 100).toFixed(1)
    })).sort((a, b) => b.visitors - a.visitors);

    // Sources
    const sourceMap: Record<string, { source: string; visitors: Set<string>; sessions: Set<string>; pageviews: number; conversions: number }> = {};
    for (const v of currentVisits) {
      const src = v.referrer_source || 'Accès direct';
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, visitors: new Set(), sessions: new Set(), pageviews: 0, conversions: 0 };
      }
      sourceMap[src].visitors.add(v.visitor_id);
      sourceMap[src].sessions.add(v.session_id);
      sourceMap[src].pageviews++;
      if (v.conversion_event) sourceMap[src].conversions++;
    }

    const sources = Object.values(sourceMap).map(s => ({
      source: s.source,
      visitors: s.visitors.size,
      sessions: s.sessions.size,
      pageviews: s.pageviews,
      conversions: s.conversions,
      percentage: +((s.visitors.size / (currentUniqueVisitors || 1)) * 100).toFixed(1)
    })).sort((a, b) => b.visitors - a.visitors);

    // Devices, Browsers, OS breakdown
    const devMap: Record<string, number> = {};
    const brwMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};

    for (const v of currentVisits) {
      devMap[v.device_type] = (devMap[v.device_type] || 0) + 1;
      brwMap[v.browser] = (brwMap[v.browser] || 0) + 1;
      osMap[v.os] = (osMap[v.os] || 0) + 1;
    }

    const devices = Object.entries(devMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const browsers = Object.entries(brwMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const os = Object.entries(osMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Journeys (User Flow by Session)
    const sessionMap: Record<string, AnalyticsVisit[]> = {};
    for (const v of currentVisits) {
      if (!sessionMap[v.session_id]) sessionMap[v.session_id] = [];
      sessionMap[v.session_id].push(v);
    }

    const journeys = Object.entries(sessionMap).slice(0, 15).map(([sid, steps]) => {
      // Trier chrono
      steps.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const first = steps[0];
      const conv = steps.find(s => s.conversion_event)?.conversion_event || null;
      const totalDur = steps.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

      return {
        session_id: sid,
        visitor_id: first.visitor_id,
        ip_address: first.ip_address,
        country: first.country,
        country_code: first.country_code,
        city: first.city,
        session_start: first.created_at,
        steps_count: steps.length,
        total_duration: totalDur,
        conversion: conv,
        steps: steps.map(s => ({
          page_path: s.page_path,
          page_title: s.page_title,
          created_at: s.created_at,
          duration_seconds: s.duration_seconds,
          conversion_event: s.conversion_event
        }))
      };
    });

    // History Table filtered & paginated
    const search = (urlObj.searchParams.get('search') || '').toLowerCase();
    const countryFilter = urlObj.searchParams.get('country') || '';
    const pageFilter = urlObj.searchParams.get('page') || '';
    const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(urlObj.searchParams.get('offset') || '0');

    let filteredHistory = currentVisits;
    if (search) {
      filteredHistory = filteredHistory.filter(v =>
        v.ip_address.toLowerCase().includes(search) ||
        v.city.toLowerCase().includes(search) ||
        v.country.toLowerCase().includes(search) ||
        v.page_path.toLowerCase().includes(search) ||
        v.page_title.toLowerCase().includes(search)
      );
    }
    if (countryFilter) {
      filteredHistory = filteredHistory.filter(v => v.country === countryFilter);
    }
    if (pageFilter) {
      filteredHistory = filteredHistory.filter(v => v.page_path === pageFilter);
    }

    const historyTotal = filteredHistory.length;
    const historyRows = filteredHistory.slice(offset, offset + limit);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      period,
      kpis,
      timeline,
      topPages,
      countries,
      cities,
      history: {
        total: historyTotal,
        limit,
        offset,
        rows: historyRows
      },
      journeys,
      sources,
      devices,
      browsers,
      os
    }));
    return true;
  }

  // 5. ACTION : EXPORT CSV
  if (action === 'export_csv') {
    const period = urlObj.searchParams.get('period') || '30d';
    const lines = [
      '\uFEFF"Date et heure";"Adresse IP";"Pays";"Ville";"Page visitée";"Titre de page";"Navigateur";"Système";"Appareil";"Durée (sec)";"Source";"Conversion"'
    ];

    for (const v of visits.slice(0, 500)) {
      const row = [
        `"${v.created_at.replace('T', ' ').substring(0, 19)}"`,
        `"${v.ip_address}"`,
        `"${v.country}"`,
        `"${v.city}"`,
        `"${v.page_path}"`,
        `"${(v.page_title || '').replace(/"/g, '""')}"`,
        `"${v.browser}"`,
        `"${v.os}"`,
        `"${v.device_type}"`,
        `"${v.duration_seconds || 0}"`,
        `"${v.referrer_source || 'Direct'}"`,
        `"${v.conversion_event || ''}"`
      ];
      lines.push(row.join(';'));
    }

    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="mdiv_analytics_${period}_${Date.now()}.csv"`);
    res.end(lines.join('\r\n'));
    return true;
  }

  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: 'Action inconnue' }));
  return true;
}
