// src/services/analyticsTracker.ts - Client-side tracker for MDIV Analytics

const SESSION_KEY = "mdiv_analytics_session_id";
const VISITOR_KEY = "mdiv_analytics_visitor_id";
const LAST_VISIT_ID_KEY = "mdiv_analytics_last_visit_id";

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(4)}`;
}

export function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = generateId("vis");
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return generateId("vis");
  }
}

export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateId("sess");
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return generateId("sess");
  }
}

let currentVisitId: number | null = null;
let currentPath: string = "";
let pageStartTime: number = Date.now();
let heartbeatInterval: any = null;

// Enregistrer une nouvelle page vue
export async function trackPageView(pagePath: string, pageTitle?: string): Promise<number | null> {
  // Ne pas polluer les analytics avec les pages d'administration
  if (pagePath.startsWith("/admin")) {
    return null;
  }

  // Si on quitte une page précédente, envoyer le ping final de durée
  if (currentVisitId && currentPath && currentPath !== pagePath) {
    const elapsedSec = Math.max(1, Math.round((Date.now() - pageStartTime) / 1000));
    sendPingBeacon(currentVisitId, elapsedSec, false);
  }

  currentPath = pagePath;
  pageStartTime = Date.now();

  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const title = pageTitle || document.title || pagePath;
  const referrer = document.referrer || "";

  try {
    const res = await fetch("/api-analytics.php?action=track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        visitorId,
        pagePath,
        pageTitle: title,
        referrer,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.visitId) {
        currentVisitId = data.visitId;
        try {
          sessionStorage.setItem(LAST_VISIT_ID_KEY, String(data.visitId));
        } catch {}
      }
    }
  } catch (err) {
    // Échec silencieux pour ne jamais perturber la navigation de l'utilisateur
  }

  restartHeartbeat();
  return currentVisitId;
}

// Envoyer un heartbeat pour mettre à jour la durée et maintenir le statut "Temps réel"
function restartHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = setInterval(() => {
    if (!currentVisitId) return;
    const elapsedSec = 15;
    sendPing(currentVisitId, elapsedSec, false);
  }, 15000);
}

// Fonction de ping fetch
export async function sendPing(visitId: number, durationSeconds: number, isExit = false, conversionEvent?: string) {
  try {
    await fetch("/api-analytics.php?action=ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitId,
        durationSeconds,
        isExit,
        conversionEvent,
      }),
    });
  } catch {}
}

// Beacon fiable lors de la fermeture de fenêtre ou changement d'onglet
export function sendPingBeacon(visitId: number, durationSeconds: number, isExit = true, conversionEvent?: string) {
  try {
    const payload = JSON.stringify({
      visitId,
      durationSeconds,
      isExit,
      conversionEvent,
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api-analytics.php?action=ping", blob);
    } else {
      fetch("/api-analytics.php?action=ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {}
}

// Enregistrer un événement de conversion (clic devis, envoi formulaire, diagnostic)
export function trackConversion(eventName: string, details?: Record<string, any>) {
  if (!currentVisitId) return;
  sendPing(currentVisitId, 0, false, eventName);
}

// Écouteur global de déchargement de page
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (currentVisitId) {
      const elapsedSec = Math.max(1, Math.round((Date.now() - pageStartTime) / 1000));
      sendPingBeacon(currentVisitId, elapsedSec, true);
    }
  });
}
