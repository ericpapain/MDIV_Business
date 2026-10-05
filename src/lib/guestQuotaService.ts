// src/lib/guestQuotaService.ts

export const GUEST_USAGE_LIMIT = 40;

export interface GuestUsageState {
  appId: string;
  used: number;
  remaining: number;
  limit: number;
  canExecute: boolean;
  isLimitReached: boolean;
}

/**
 * Récupère l'état d'utilisation pour une application IA donnée (visiteur non connecté).
 */
export function getGuestUsage(appId: string, limit = GUEST_USAGE_LIMIT): GuestUsageState {
  if (typeof window === 'undefined') {
    return { appId, used: 0, remaining: limit, limit, canExecute: true, isLimitReached: false };
  }

  try {
    const key = `mdiv_guest_quota_${appId}`;
    const raw = localStorage.getItem(key);
    let count = 0;
    if (raw) {
      const parsed = JSON.parse(raw);
      count = typeof parsed === 'number' ? parsed : (parsed.count || 0);
    }
    const remaining = Math.max(0, limit - count);
    const isLimitReached = count >= limit;
    return {
      appId,
      used: count,
      remaining,
      limit,
      canExecute: !isLimitReached,
      isLimitReached
    };
  } catch {
    return { appId, used: 0, remaining: limit, limit, canExecute: true, isLimitReached: false };
  }
}

/**
 * Incrémente le compteur d'utilisation invité après une génération réussie.
 */
export function incrementGuestUsage(appId: string, limit = GUEST_USAGE_LIMIT): GuestUsageState {
  if (typeof window === 'undefined') {
    return { appId, used: 1, remaining: limit - 1, limit, canExecute: true, isLimitReached: false };
  }

  try {
    const key = `mdiv_guest_quota_${appId}`;
    const current = getGuestUsage(appId, limit);
    const newCount = current.used + 1;
    localStorage.setItem(key, JSON.stringify({ count: newCount, updatedAt: new Date().toISOString() }));
    return getGuestUsage(appId, limit);
  } catch {
    return { appId, used: 1, remaining: limit - 1, limit, canExecute: true, isLimitReached: false };
  }
}

/**
 * Réinitialise le compteur invité (par exemple lors d'une connexion réussie).
 */
export function resetGuestUsage(appId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`mdiv_guest_quota_${appId}`);
  } catch { }
}
