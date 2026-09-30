// src/lib/apiConfig.ts

/**
 * Retourne l'URL relative ou absolue de l'API.
 * En dev comme en prod, l'API est servie sous le préfixe /api
 */
export const getApiUrl = (endpoint: string): string => {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${base}/${cleanEndpoint}`;
};

/**
 * Crée un objet URL absolu valide (évite les erreurs new URL('/api/...') en relatif)
 */
export const createApiUrl = (endpoint: string): URL => {
  const path = getApiUrl(endpoint);
  return new URL(path, window.location.origin);
};
