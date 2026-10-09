import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { getApiUrl } from '@/lib/apiConfig';
import { cleanSiren } from '@/lib/companySearchService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, Lock, AlertCircle, LogIn, Sparkles, CheckCircle2, 
  Building2, ArrowRight, Eye, EyeOff
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';
  
  const successMessage = location.state?.message;
  const from = location.state?.from?.pathname || '/dashboard';

  const [identifier, setIdentifier] = useState(location.state?.email || location.state?.siren || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Détection automatique Email vs SIREN
  const cleanedDigits = cleanSiren(identifier);
  const isSirenMode = cleanedDigits.length === 9 && !identifier.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError(isEn ? "Please enter your business email or SIREN number." : "Veuillez saisir votre email professionnel ou numéro SIREN.");
      return;
    }

    if (!password) {
      setError(isEn ? "Please enter your password." : "Veuillez saisir votre mot de passe.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/login.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: trimmedIdentifier,
          email: trimmedIdentifier,
          siren: isSirenMode ? cleanedDigits : undefined,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isEn ? 'Login failed' : 'Identifiants incorrects.'));
      }

      login(data.token, data.company);
      navigate(from, { replace: true });
      
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-900 flex flex-col justify-center relative overflow-hidden">
      {/* Halos décoratifs discrets */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
          <Sparkles size={14} className="text-amber-500" />
          <span>{isEn ? "Enterprise Portal" : "Espace Entreprise"}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-semibold">MDIV Business</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {isEn ? "Enterprise Login" : "Connexion Entreprise"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {isEn 
            ? "Sign in with your email or SIREN number" 
            : "Connectez-vous avec votre email professionnel ou numéro SIREN"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
          
          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-800 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-red-700 font-medium">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="identifier" className="text-xs font-bold text-slate-700">
                  {isEn ? "Work Email or SIREN" : "Email professionnel ou SIREN"}
                </Label>
                {isSirenMode ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Building2 size={11} /> SIREN détecté
                  </span>
                ) : identifier.includes('@') ? (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <Mail size={11} /> Email pro
                  </span>
                ) : null}
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {isSirenMode ? <Building2 size={16} className="text-amber-500" /> : <Mail size={16} />}
                </div>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  className="pl-10 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder={isEn ? "contact@company.com or 981 123 456" : "contact@entreprise.fr ou 981 123 456"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  {isEn ? "Password" : "Mot de passe"}
                </Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  {isEn ? "Forgot password?" : "Mot de passe oublié ?"}
                </Link>
              </div>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEn ? "Connecting..." : "Connexion en cours..."}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? "Sign in to Workspace" : "Se connecter"}</span>
                  <LogIn size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Lien vers Inscription */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isEn ? "Don't have an enterprise account yet?" : "Pas encore de compte entreprise ?"}{' '}
              <Link 
                to="/register" 
                state={{ from: location.state?.from }}
                className="font-bold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1 ml-1"
              >
                <span>{isEn ? "Create account" : "Créer un compte"}</span>
                <ArrowRight size={13} />
              </Link>
            </p>
          </div>
        </div>

        {/* Retour vers les services */}
        <div className="mt-6 text-center">
          <Link 
            to="/services-ia" 
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <span>← {isEn ? "Back to AI Applications" : "Retour aux Applications IA"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
