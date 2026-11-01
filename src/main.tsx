import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
