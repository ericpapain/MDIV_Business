import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string;
}

/**
 * Composant de sécurité Frontend :
 * Si l'utilisateur / entreprise n'est pas connecté(e), il/elle est bloqué(e) et redirigé(e) vers la page de login.
 * On mémorise l'URL demandée pour l'y renvoyer immédiatement après connexion réussie.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, company } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Connexion requise pour accéder à cette fonctionnalité.");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-bold text-slate-300 animate-pulse">Vérification de la session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/services-ia/diagnostic/login" state={{ from: location }} replace />;
  }

  if (requiredRole && company?.role !== requiredRole && company?.role !== 'ADMIN') {
    toast.error("Accès restreint. Privilèges administrateur requis.");
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
