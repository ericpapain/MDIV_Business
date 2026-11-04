import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ─── Sécurisation des déploiements : rechargement automatique si un chunk est obsolète ───
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Détection d\'un chunk JS obsolète suite à une mise à jour, rechargement...', event);
  window.location.reload();
});

window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Loading chunk')
  ) {
    const lastReload = sessionStorage.getItem('last_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('last_chunk_reload', now.toString());
      window.location.reload();
    }
  }
});

const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let urlStr = '';
  if (typeof input === 'string') {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && typeof (input as Request).url === 'string') {
    urlStr = (input as Request).url;
  }

  // Injecter automatiquement le token d'authentification pour toute requête vers nos API internes
  if (urlStr.includes('/api/') || urlStr.includes('/api-') || urlStr.startsWith('api/')) {
    try {
      const token = localStorage.getItem('mdiv_token');
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init.headers = headers;
      }
    } catch {}
  }

  const response = await originalFetch(input, init);

  // Gestion centralisée des refus 401 Unauthorized
  if (response.status === 401 && (urlStr.includes('/api/') || urlStr.includes('/api-'))) {
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      if (data.error === "UNAUTHORIZED_EXPLORER") {
        window.dispatchEvent(new CustomEvent('auth-explorer-blocked', { detail: data.message }));
      } else {
        window.dispatchEvent(new CustomEvent('auth-unauthorized', {
          detail: data.error || "Votre session a expiré ou requiert une authentification."
        }));
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent('auth-unauthorized', {
        detail: "Connexion requise pour accéder à cette fonctionnalité."
      }));
    }
  }

  return response;
};

createRoot(document.getElementById("root")!).render(<App />);
