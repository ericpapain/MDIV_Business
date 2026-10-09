import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Structure des données de l'entreprise connectée
export interface CompanyData {
  id: number;
  name: string;
  email: string;
  plan_tier?: string;
}

// Structure du contexte
interface AuthContextType {
  company: CompanyData | null;
  token: string | null;
  login: (token: string, company: CompanyData) => void;
  logout: () => void;
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
        setCompany(JSON.parse(storedCompany));
      } catch (error) {
        console.error("Erreur lors de la lecture des données d'authentification", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newCompany: CompanyData) => {
    setToken(newToken);
    setCompany(newCompany);
    localStorage.setItem('mdiv_token', newToken);
    localStorage.setItem('mdiv_company', JSON.stringify(newCompany));
    
    // Mapping DB enum -> Frontend PlanTier
    if (newCompany.plan_tier) {
      const planMapping: Record<string, string> = {
        'free': 'creator',
        'starter': 'independent',
        'pro': 'tpe',
        'enterprise': 'pme'
      };
      const frontendPlan = planMapping[newCompany.plan_tier] || 'creator';
      localStorage.setItem('mdiv_user_plan', frontendPlan);
      window.dispatchEvent(new Event('user_plan_changed'));
    }
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
