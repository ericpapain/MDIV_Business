import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/apiConfig';
import { 
  searchCompanyBySiren, cleanSiren, formatSiren, isValidSiren, 
  OfficialCompanyData, CompanySearchResult 
} from '@/lib/companySearchService';
import { 
  Building2, Lock, Mail, X, Loader2, Sparkles, ArrowRight, 
  Search, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  quotaLimitReached?: boolean;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Accès Espace Entreprise",
  subtitle,
  description = "Créez votre compte en quelques secondes ou connectez-vous.",
  quotaLimitReached = false
}) => {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [regMode, setRegMode] = useState<'siren' | 'manual'>('siren');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [sirenInput, setSirenInput] = useState('');
  const [isSearchingSiren, setIsSearchingSiren] = useState(false);
  const [foundCompany, setFoundCompany] = useState<OfficialCompanyData | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Bloquer le scroll d'arrière-plan et écouter la touche Échap
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Détection SIREN en mode connexion
  const cleanedLoginDigits = cleanSiren(loginIdentifier);
  const isLoginSiren = cleanedLoginDigits.length === 9 && !loginIdentifier.includes('@');

  // Recherche SIREN automatique ou manuelle
  const handleSearchSiren = async (overrideSiren?: string) => {
    const raw = overrideSiren || sirenInput;
    const cleaned = cleanSiren(raw);
    setError(null);

    if (!isValidSiren(cleaned)) {
      setError("Le SIREN doit comporter 9 chiffres (ex: 981 123 456).");
      return;
    }

    setIsSearchingSiren(true);
    try {
      const result: CompanySearchResult = await searchCompanyBySiren(cleaned);
      setFoundCompany(result.company);
      setCompanyName(result.company.company_name);
      toast.success("Entreprise identifiée avec succès !");
    } catch (err: any) {
      setError(err.message || "Entreprise introuvable pour ce SIREN.");
      setFoundCompany(null);
    } finally {
      setIsSearchingSiren(false);
    }
  };

  const handleSirenInputChange = (val: string) => {
    setSirenInput(val);
    const cleaned = cleanSiren(val);
    if (cleaned.length === 9 && !foundCompany) {
      handleSearchSiren(val);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/login.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          email: loginIdentifier.trim(),
          siren: isLoginSiren ? cleanedLoginDigits : undefined,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Identifiants incorrects.");
      }

      login(data.token, data.company);
      toast.success(`Bienvenue, ${data.company.name} !`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const targetCompanyName = foundCompany?.company_name || companyName.trim();
    if (!targetCompanyName) {
      setError("Veuillez renseigner ou rechercher le nom de votre entreprise.");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        company_name: targetCompanyName,
        email: regEmail.trim(),
        password: regPassword,
      };

      if (foundCompany) {
        payload.siren = foundCompany.siren;
        payload.siret = foundCompany.siret;
        payload.legal_form = foundCompany.legal_form;
        payload.naf_code = foundCompany.naf_code;
        payload.activity = foundCompany.activity;
        payload.address = foundCompany.address;
        payload.postal_code = foundCompany.postal_code;
        payload.city = foundCompany.city;
        payload.creation_date = foundCompany.creation_date;
        payload.company_status = 'ACTIVE';
      }

      const response = await fetch(getApiUrl('auth/register.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du compte.");
      }

      login(data.token, data.company);
      toast.success("Compte entreprise créé avec succès !");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(15,23,42,0.2)] text-slate-800 my-auto max-h-[94vh] overflow-y-auto transform-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-xl hover:bg-slate-100"
          aria-label="Fermer la boîte de dialogue"
        >
          <X size={20} />
        </button>

        {/* En-tête épuré */}
        <div className="text-center mb-6">
          {quotaLimitReached ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3 shadow-xs">
              <Sparkles size={14} className="text-amber-600" />
              <span>3 / 3 essais gratuits utilisés</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-3 shadow-xs">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Espace Entreprise Sécurisé</span>
            </div>
          )}
          
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1.5">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {subtitle || description}
          </p>
        </div>

        {/* Onglets : Connexion / Inscription */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-5 border border-slate-200/70">
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Créer un Compte
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Se Connecter
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire Connexion */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email professionnel ou SIREN
                </label>
                {isLoginSiren && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    SIREN détecté
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="contact@entreprise.fr ou 981 123 456"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:opacity-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        ) : (
          /* Formulaire Création de Compte avec SIREN */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Choix mode SIREN ou Manuel */}
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-semibold text-slate-700">Renseignement entreprise</span>
              <button
                type="button"
                onClick={() => {
                  setRegMode(regMode === 'siren' ? 'manual' : 'siren');
                  setError(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-[11px]"
              >
                {regMode === 'siren' ? "Saisie sans SIREN ?" : "Rechercher par SIREN"}
              </button>
            </div>

            {regMode === 'siren' ? (
              <div>
                {!foundCompany ? (
                  <div>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="Entrez votre SIREN (9 chiffres)"
                        value={sirenInput}
                        onChange={(e) => handleSirenInputChange(e.target.value)}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all font-mono"
                      />
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => handleSearchSiren()}
                        disabled={isSearchingSiren || cleanSiren(sirenInput).length < 9}
                        className="absolute right-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                      >
                        {isSearchingSiren ? <Loader2 size={13} className="animate-spin" /> : "Vérifier"}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Données officielles INSEE & RNE préremplies instantanément.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-blue-50/50 border border-amber-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{foundCompany.company_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        SIREN {formatSiren(foundCompany.siren)} • {foundCompany.city || 'France'}
                      </p>
                      {foundCompany.activity && (
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">
                          {foundCompany.activity}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFoundCompany(null);
                        setSirenInput('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors shrink-0"
                      title="Changer d'entreprise"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'Entreprise
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Groupe Martin & Co"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Professionnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nom@entreprise.fr"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de Passe (8 caractères min.)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (regMode === 'siren' && !foundCompany && cleanSiren(sirenInput).length < 9)}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoading ? "Création en cours..." : "Créer le compte et débloquer l'accès"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Continuer en démonstration
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AuthRequiredModal;
