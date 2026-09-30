import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/apiConfig';
import { ShieldCheck, Lock, Mail, Building2, X, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Connectez-vous pour sauvegarder vos données",
  description = "Vos données seront enregistrées de manière sécurisée dans votre espace entreprise et pourront être retrouvées ultérieurement."
}) => {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Bloquer le défilement arrière-plan et écouter la touche Échap
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('auth/login.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Identifiants incorrects.");
      }

      login(data.token, data.company);
      toast.success(`Bienvenue, ${data.company.name} !`);
      onClose();
      onSuccess();
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

    try {
      const response = await fetch(getApiUrl('auth/register.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du compte.");
      }

      login(data.token, data.company);
      toast.success("Compte entreprise créé avec succès ! Vos données sont en cours d'enregistrement.");
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="relative w-full max-w-md bg-[#121624] border border-gold/40 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white my-auto max-h-[92vh] overflow-y-auto transform-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Fermer la boîte de dialogue"
        >
          <X size={20} />
        </button>

        {/* Badge & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold shadow-lg shadow-gold/10">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2 leading-snug">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Tabs: Connexion / Inscription */}
        <div className="flex bg-[#0b0d14] p-1 rounded-xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' 
                ? 'bg-gold text-[#0b0d14] shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register' 
                ? 'bg-gold text-[#0b0d14] shadow-sm' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Créer un Compte
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire Connexion */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email Professionnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="direction@entreprise.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-gold via-gold-light to-gold text-[#0b0d14] py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoading ? "Connexion en cours..." : "Se connecter et enregistrer"}
            </button>
          </form>
        ) : (
          /* Formulaire Création de Compte */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Nom de votre Entreprise
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Groupe Martin & Co"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email Professionnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nom@entreprise.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Mot de Passe (8 caractères min.)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder:text-gray-500 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-gold via-gold-light to-gold text-[#0b0d14] py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isLoading ? "Création du compte..." : "Créer le compte et sauvegarder"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Poursuivre en mode démonstration sans sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
export default AuthRequiredModal;
