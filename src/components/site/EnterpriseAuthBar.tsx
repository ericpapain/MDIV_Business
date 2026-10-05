import React from 'react';

interface EnterpriseAuthBarProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * EnterpriseAuthBar - Déprécié et supprimé de toutes les pages à la demande de l'utilisateur.
 * L'authentification et les accès aux pôles sont désormais entièrement gérés dans le SiteHeader principal.
 */
export const EnterpriseAuthBar: React.FC<EnterpriseAuthBarProps> = () => {
  return null;
};
