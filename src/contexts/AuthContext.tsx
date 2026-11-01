import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Structure des données complètes de l'entreprise connectée (miroir de la table companies)
export interface CompanyData {
  id: number;
  name: string;
  email: string;
  plan_tier?: string;
  company_name?: string;
  siren?: string | null;
  siret?: string | null;
  trade_name?: string | null;
  legal_form?: string | null;
  naf_code?: string | null;
  activity?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  creation_date?: string | null;
  employee_range?: string | null;
  capital?: string | null;
  phone?: string | null;
  website?: string | null;
  iban?: string | null;
  bic?: string | null;
  vat_number?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

// Structure du contexte
interface AuthContextType {
  company: CompanyData | null;
  token: string | null;
  login: (token: string, company: CompanyData) => void;
  logout: () => void;
  updateCompany: (updatedData: Partial<CompanyData>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au chargement de l'app, on vérifie si un token existe dans le localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('mdiv_token');
    const storedCompany = localStorage.getItem('mdiv_company');

    if (storedToken && storedCompany) {
      try {
        setToken(storedToken);
        const parsed = JSON.parse(storedCompany);
        // Normalisation logo & nom
        if (parsed.company_name && !parsed.name) parsed.name = parsed.company_name;
        if (parsed.logo_url && !parsed.logo) parsed.logo = parsed.logo_url;
        setCompany(parsed);
      } catch (error) {
        console.error("Erreur lors de la lecture des données d'authentification", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  // Écouter les mises à jour globales de l'entreprise
  useEffect(() => {
    const handleCompanyUpdated = (e: any) => {
      if (e.detail) {
        setCompany(e.detail);
      }
    };
    window.addEventListener('company_updated', handleCompanyUpdated);
    return () => window.removeEventListener('company_updated', handleCompanyUpdated);
  }, []);

  // Écouter les invalidations de session ou 401 côté API pour déconnexion automatique
  useEffect(() => {
    const handleUnauthorized = (e: any) => {
      const isLoginPage = window.location.pathname.includes('/login');
      logout();
      if (!isLoginPage) {
        toast.error(e.detail || "Session expirée ou non autorisée. Veuillez vous connecter.");
      }
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, newCompany: CompanyData) => {
    const normalized: CompanyData = {
      ...newCompany,
      name: newCompany.name || newCompany.company_name || 'Mon Entreprise',
      company_name: newCompany.company_name || newCompany.name || 'Mon Entreprise',
      logo: newCompany.logo || newCompany.logo_url || newCompany.avatar_url || null,
      logo_url: newCompany.logo_url || newCompany.logo || newCompany.avatar_url || null,
    };

    setToken(newToken);
    setCompany(normalized);
    localStorage.setItem('mdiv_token', newToken);
    localStorage.setItem('mdiv_company', JSON.stringify(normalized));
    
    // Mapping DB enum -> Frontend PlanTier
    if (normalized.plan_tier) {
      const planMapping: Record<string, string> = {
        'free': 'creator',
        'starter': 'independent',
        'pro': 'tpe',
        'enterprise': 'pme'
      };
      const frontendPlan = planMapping[normalized.plan_tier] || 'creator';
      localStorage.setItem('mdiv_user_plan', frontendPlan);
      window.dispatchEvent(new Event('user_plan_changed'));
    }
  };

  const updateCompany = (updatedData: Partial<CompanyData>) => {
    setCompany(prev => {
      const merged: CompanyData = {
        ...(prev || { id: 1, name: 'Mon Entreprise', email: '' }),
        ...updatedData
      };
      if (merged.company_name && !merged.name) merged.name = merged.company_name;
      if (merged.name && !merged.company_name) merged.company_name = merged.name;
      if (merged.logo_url && !merged.logo) merged.logo = merged.logo_url;
      if (merged.logo && !merged.logo_url) merged.logo_url = merged.logo;

      localStorage.setItem('mdiv_company', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('company_updated', { detail: merged }));
      return merged;
    });
  };

  const logout = () => {
    setToken(null);
    setCompany(null);
    localStorage.removeItem('mdiv_token');
    localStorage.removeItem('mdiv_company');
    localStorage.removeItem('mdiv_user_plan');
  };

  return (
    <AuthContext.Provider value={{
      company,
      token,
      login,
      logout,
      updateCompany,
      isAuthenticated: !!token,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser l'authentification facilement partout dans l'app
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

