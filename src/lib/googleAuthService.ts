/**
 * ==============================================================================
 * MDIV Business - Service d'Authentification OAuth 2.0 Google
 * ==============================================================================
 *
 * Fonctionnalités :
 * - Chargement dynamique et sécurisé du SDK officiel Google Identity Services.
 * - Initialisation du Token Client OAuth 2.0 avec 'prompt: select_account'
 *   pour afficher le sélecteur natif de comptes Google.
 * - Transmission sécurisée du jeton d'accès au backend pour vérification d'identité.
 * - Gestion complète des erreurs (annulation, refus, jeton expiré, réseau).
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            prompt?: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

export interface GoogleAuthResult {
  success: boolean;
  token?: string;
  company?: {
    id: number;
    name: string;
    email: string;
    siren?: string | null;
    siret?: string | null;
    city?: string | null;
    plan_tier: string;
    role: string;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    job_title: string;
    avatar_url?: string;
  };
  error?: string;
}

/**
 * Charge dynamiquement le script Google Identity Services si absent
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      return resolve();
    }

    const existingScript = document.getElementById('google-jssdk');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts++ > 40) {
          clearInterval(interval);
          reject(new Error("Le SDK Google Identity Services n'a pas pu s'initialiser."));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-jssdk';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (attempts++ > 30) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    };
    script.onerror = () => reject(new Error("Impossible de charger le script Google Identity Services."));
    document.head.appendChild(script);
  });
}

/**
 * Lance l'authentification native Google OAuth 2.0
 */
export async function authenticateWithGoogle(): Promise<GoogleAuthResult> {
  // 1. Récupération du Client ID Google configuré dans .env
  const clientId = (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    import.meta.env.GOOGLE_CLIENT_ID ||
    ''
  ).trim();

  // Si aucun Client ID n'est configuré
  if (!clientId || clientId === 'VOTRE_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    return {
      success: false,
      error: "MISSING_CLIENT_ID"
    };
  }

  // 2. Charger le SDK Google si nécessaire
  try {
    await loadGoogleScript();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Erreur de chargement du module Google."
    };
  }

  if (!window.google?.accounts?.oauth2) {
    return {
      success: false,
      error: "Le service d'authentification Google n'est pas disponible pour le moment."
    };
  }

  // 3. Déclenchement de la fenêtre native de sélection de compte
  return new Promise((resolve) => {
    let isHandled = false;

    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account', // Ouvre le sélecteur natif avec la liste des comptes
        callback: async (response: GoogleTokenResponse) => {
          if (isHandled) return;
          isHandled = true;

          if (response.error) {
            if (response.error === 'access_denied') {
              return resolve({ success: false, error: "Autorisation refusée par l'utilisateur." });
            }
            if (response.error === 'popup_closed_by_user') {
              return resolve({ success: false, error: "Connexion Google annulée (fenêtre fermée)." });
            }
            return resolve({ success: false, error: `Erreur Google OAuth : ${response.error}` });
          }

          if (!response.access_token) {
            return resolve({ success: false, error: "Jeton d'accès Google introuvable." });
          }

          // 4. Transmission sécurisée au backend pour vérification
          try {
            const apiRes = await fetch('/api/auth/google_auth.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                access_token: response.access_token
              })
            });

            const data = await apiRes.json();

            if (!apiRes.ok || !data.success) {
              return resolve({
                success: false,
                error: data.error || "Impossible de valider votre compte auprès du serveur."
              });
            }

            return resolve({
              success: true,
              token: data.token,
              company: data.company,
              user: data.user
            });

          } catch (netErr: any) {
            return resolve({
              success: false,
              error: "Erreur de connexion au serveur lors de la validation Google."
            });
          }
        },
        error_callback: (err: any) => {
          if (isHandled) return;
          isHandled = true;
          const msg = err?.message || err?.error || "Erreur lors de l'ouverture de la connexion Google.";
          resolve({ success: false, error: msg });
        }
      });

      // Ouvre le popup Google avec sélection de compte forcée
      tokenClient.requestAccessToken({ prompt: 'select_account' });

    } catch (e: any) {
      if (!isHandled) {
        isHandled = true;
        resolve({
          success: false,
          error: e.message || "Erreur d'initialisation du client Google OAuth."
        });
      }
    }
  });
}
