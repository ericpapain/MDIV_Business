// src/lib/planLimitsService.ts

export type PlanTier = 'creator' | 'independent' | 'tpe' | 'pme';

/**
 * Simule la récupération du plan actuel de l'utilisateur.
 * À relier plus tard avec le contexte d'authentification et le profil de l'entreprise.
 */
export function getCurrentUserPlan(): PlanTier {
  if (typeof window === 'undefined') return 'creator';
  return (localStorage.getItem('mdiv_user_plan') as PlanTier) || 'creator';
}

/**
 * Change le plan actuel (utile pour la démo / tests)
 */
export function setCurrentUserPlan(plan: PlanTier) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mdiv_user_plan', plan);
    window.dispatchEvent(new Event('user_plan_changed'));
  }
}

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité spécifique
 */
export function hasFeatureAccess(feature: string): { allowed: boolean; requiredPlan: PlanTier } {
  const currentPlan = getCurrentUserPlan();
  
  // Hiérarchie des plans : pme > tpe > independent > creator
  const planLevels = {
    'creator': 1,
    'independent': 2,
    'tpe': 3,
    'pme': 4
  };

  const userLevel = planLevels[currentPlan] || 1;

  // Définition des niveaux requis par fonctionnalité selon forfait.md
  const featureRequirements: Record<string, PlanTier> = {
    // Essentiel
    'export_pdf_audit': 'independent',
    'voice_assistant_meeting': 'independent',
    'mode_challenge_ia': 'tpe',
    'mode_fusion_ia': 'pme',
    'benchmark_roi': 'tpe',
    'admin_ai_governance': 'pme',
    
    // Ventes
    'multi_channel_all_networks': 'independent',
    'leads_export_excel': 'independent',
    'tenders_ai_decrypt': 'independent',
    'facturx_export': 'independent',
    'sales_payment_links': 'tpe',
    'sales_auto_reminders': 'tpe',
    'sales_e_signature': 'pme',
    
    // Achats
    'email_outlook_sync': 'independent',
    'bank_sepa_1click': 'tpe',
    'bank_auto_reconciliation': 'tpe',
    'bank_fraud_shield': 'pme'
  };

  const requiredPlan = featureRequirements[feature];
  
  if (!requiredPlan) {
    // Si la feature n'est pas restreinte, tout le monde y a accès
    return { allowed: true, requiredPlan: 'creator' };
  }

  const requiredLevel = planLevels[requiredPlan];

  return {
    allowed: userLevel >= requiredLevel,
    requiredPlan
  };
}
