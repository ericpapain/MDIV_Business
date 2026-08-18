import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Composant de sécurité Frontend :
 * Si l'entreprise n'est pas connectée, elle est bloquée et redirigée vers la page de login.
 * On mémorise la page qu'elle essayait d'atteindre pour l'y renvoyer après le login.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg text-gray-500 animate-pulse">Chargement sécurisé...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection vers /login tout en sauvegardant l'URL demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si on est connecté, on affiche le composant enfant (ex: le Diagnostic IA)
  return <>{children}</>;
};
