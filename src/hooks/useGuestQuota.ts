// src/hooks/useGuestQuota.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getGuestUsage, 
  incrementGuestUsage, 
  GUEST_USAGE_LIMIT, 
  GuestUsageState 
} from '@/lib/guestQuotaService';

export function useGuestQuota(appId: string) {
  const { isAuthenticated } = useAuth();
  const [quotaState, setQuotaState] = useState<GuestUsageState>(() => getGuestUsage(appId));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Mettre à jour l'état au montage ou quand appId / auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setQuotaState(getGuestUsage(appId));
    }
  }, [appId, isAuthenticated]);

  /**
   * Vérifie si l'action IA peut être exécutée.
   * Si l'utilisateur est connecté -> Toujours autorisé (true).
   * Si l'utilisateur est invité et a dépassé 3 essais -> Bloque et ouvre la modale (false).
   */
  const checkCanExecute = useCallback((): boolean => {
    if (isAuthenticated) {
      return true;
    }

    const current = getGuestUsage(appId);
    setQuotaState(current);

    if (!current.canExecute) {
      setIsAuthModalOpen(true);
      return false;
    }

    return true;
  }, [appId, isAuthenticated]);

  /**
   * Enregistre une exécution IA réussie pour un invité.
   */
  const recordExecution = useCallback(() => {
    if (!isAuthenticated) {
      const updated = incrementGuestUsage(appId);
      setQuotaState(updated);
    }
  }, [appId, isAuthenticated]);

  return {
    quotaState,
    remainingTrials: isAuthenticated ? Infinity : quotaState.remaining,
    usedTrials: isAuthenticated ? 0 : quotaState.used,
    limitTrials: GUEST_USAGE_LIMIT,
    isLimitReached: !isAuthenticated && quotaState.isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  };
}
