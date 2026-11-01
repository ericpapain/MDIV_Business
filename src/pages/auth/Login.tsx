import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/components/theme-provider';
import { getApiUrl } from '@/lib/apiConfig';
import { cleanSiren } from '@/lib/companySearchService';
import { Label } from '@/components/ui/label';
import { 
  Mail, Lock, AlertCircle, LogIn, CheckCircle2, 
  Building2, ArrowRight, Eye, EyeOff, ChevronLeft, ChevronRight,
  ShieldCheck, Users, Calendar, Receipt, BarChart3, FolderArchive,
  Sun, Moon, Briefcase, Palette, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthRightColumn } from './AuthRightColumn';
import { authenticateWithGoogle } from '@/lib/googleAuthService';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isEn = language === 'en';
  
  const fromPath = location.state?.from?.pathname || (typeof location.state?.from === 'string' ? location.state.from : '/services-ia/dashboard');
  const fromSearch = location.state?.from?.search || '';
  const from = `${fromPath}${fromSearch}`;

  const successMessage = location.state?.message;

  const [identifier, setIdentifier] = useState(location.state?.email || location.state?.siren || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // Détection automatique Email vs SIREN
  const cleanedDigits = cleanSiren(identifier);
  const isSirenMode = cleanedDigits.length === 9 && !identifier.includes('@');

  // ── Slides de présentation de l'écosystème IT4WORK ─────────────────────────
  // Strictement sans termes AI / Intelligence artificielle / Machine Learning / Algorithme
  const slides: CarouselSlide[] = [
    {
      id: 'crm',
      badge: 'Relation Client & Ventes',
      title: 'CRM IT4WORK',
      description: 'Centralisez vos clients, devis et échanges dans un seul espace pour gagner du temps au quotidien.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Répertoire Clients & Chantiers</span>
                <span className="text-[11px] text-slate-500 font-medium">128 contacts synchronisés</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              En direct
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  LE
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Laurent Électricité</div>
                  <div className="text-[11px] text-slate-500">Chantier Paris 11e · Devis D-042</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                Devis signé (4 200 €)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                  ST
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">SCI Les Terrasses</div>
                  <div className="text-[11px] text-slate-500">Rénovation globale · Relance effectuée</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                En attente (1 850 €)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  CD
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Cabinet Médical Durand</div>
                  <div className="text-[11px] text-slate-500">Maintenance annuelle contrat pro</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                Contrat actif
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>💡 Relance client programmée pour demain</span>
            <span className="text-blue-700 font-bold">128 contacts actifs →</span>
          </div>
        </div>
      )
    },
    {
      id: 'interventions',
      badge: 'Planning & Équipes',
      title: 'Gestion des interventions',
      description: 'Planifiez vos rendez-vous, affectez vos équipes et suivez l\'avancement de chaque chantier.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Planning d'Aujourd'hui</span>
                <span className="text-[11px] text-slate-500 font-medium">3 équipes sur le terrain</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
              100% à l'heure
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-emerald-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">08:30 - 11:30</span>
                  <span className="text-[11px] font-bold text-slate-500">Terminé</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Remplacement ballon d'eau · M. Petit</div>
                <div className="text-[11px] text-slate-500">Troyes centre · 2 techniciens</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                Validé client
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-blue-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">13:30 - 16:00</span>
                  <span className="text-[11px] font-bold text-blue-600">En cours</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Pose pompe à chaleur · Mme Girard</div>
                <div className="text-[11px] text-slate-500">Sainte-Savine · Matériel livré</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                Sur place
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-amber-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">16:30 - 18:00</span>
                  <span className="text-[11px] font-bold text-slate-500">Prévu</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Visite technique & métré · Résidence Parc</div>
                <div className="text-[11px] text-slate-500">Rendez-vous confirmé par SMS</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[11px]">
                Marc D.
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>📍 Trajets optimisés pour limiter le carburant</span>
            <span className="text-blue-700 font-bold">Ouvrir la carte →</span>
          </div>
        </div>
      )
    },
    {
      id: 'facturation',
      badge: 'Factur-X & PPF 2026',
      title: 'Facturation',
      description: 'Créez vos devis et factures rapidement tout en gardant une vision claire de votre activité.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Receipt size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Facture F-2026-0042</span>
                <span className="text-[11px] text-slate-500 font-medium">Norme Factur-X EN 16931</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              Conforme PPF 2026
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 mb-3 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>Rénovation sanitaire complète</span>
              <span className="font-extrabold text-slate-900">1 950,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>Fournitures certifiées NF & robinetterie</span>
              <span className="font-extrabold text-slate-900">635,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>TVA réduite (10.0%)</span>
              <span className="font-extrabold text-slate-900">258,50 €</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline font-black">
              <span className="text-slate-900 text-sm">Total TTC</span>
              <span className="text-emerald-700 text-lg font-black">2 843,50 €</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
            <span>Destinataire : SCI Saint-Martin</span>
            <span className="text-emerald-700 font-extrabold">Envoi en 1 clic prêt</span>
          </div>
        </div>
      )
    },
    {
      id: 'suivi',
      badge: 'Pilotage Financier',
      title: 'Suivi d\'activité',
      description: 'Visualisez les indicateurs essentiels de votre entreprise depuis un tableau de bord unique.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <BarChart3 size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Tableau de bord de gestion</span>
                <span className="text-[11px] text-slate-500 font-medium">Suivi de trésorerie en temps réel</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              +18.5% ce mois
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-800 block">Chiffre d'affaires</span>
              <span className="text-xl font-black text-slate-900 block mt-0.5">14 850 €</span>
              <span className="text-[10px] text-emerald-700 font-extrabold mt-1 block">8 devis encaissés</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[11px] font-bold text-emerald-800 block">Déjà encaissé</span>
              <span className="text-xl font-black text-emerald-700 block mt-0.5">11 200 €</span>
              <span className="text-[10px] text-slate-600 font-medium mt-1 block">Zéro impayé en litige</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">Taux de paiement à l'échéance</span>
            <span className="font-extrabold text-emerald-700 text-sm">94.2%</span>
          </div>
        </div>
      )
    },
    {
      id: 'documents',
      badge: 'Espace Centralisé',
      title: 'Documents',
      description: 'Retrouvez facilement vos contrats, rapports et documents importants dans un espace centralisé.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <FolderArchive size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Espace Documentaire</span>
                <span className="text-[11px] text-slate-500 font-medium">Contrats, assurances & rapports</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
              Conforme RGPD
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Attestation Décennale 2026.pdf</div>
                  <div className="text-[11px] text-slate-500">Assurance BTP · Valide jusqu'en 2027</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                À jour
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Contrat Cadre Sous-traitance.pdf</div>
                  <div className="text-[11px] text-slate-500">Signé électroniquement avec horodatage</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500">148 Ko</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Rapport Fin de Chantier #104.pdf</div>
                  <div className="text-[11px] text-slate-500">Avec photos avant / après validées</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500">1.2 Mo</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>🔒 Coffre-fort numérique certifié & crypté</span>
            <span className="text-blue-700 font-bold">Télécharger tout →</span>
          </div>
        </div>
      )
    }
  ];


  // Soumission du formulaire de connexion
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
        throw new Error(data.error || (isEn ? 'Invalid credentials' : 'Email/SIREN ou mot de passe incorrect.'));
      }

      login(data.token, data.company);
      toast.success(isEn ? `Welcome back, ${data.company.name}!` : `Bienvenue, ${data.company.name} !`);
      navigate(from, { replace: true });
      
    } catch (err: any) {
      setError(err.message || (isEn ? "Connection error." : "Erreur lors de la connexion."));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Authentification OAuth 2.0 Google ────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authenticateWithGoogle();
      if (!res.success) {
        if (res.error === 'MISSING_CLIENT_ID') {
          toast.warning(
            isEn 
              ? "Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file." 
              : "Configuration requise : ajoutez votre identifiant client Google (VITE_GOOGLE_CLIENT_ID) dans le fichier .env.",
            {
              duration: 8000,
              description: isEn 
                ? "See google_oauth_setup.md at the project root for 2-minute step-by-step setup." 
                : "Consultez le guide google_oauth_setup.md à la racine du projet pour le configurer en 2 minutes."
            }
          );
        } else {
          toast.error(res.error || (isEn ? "Google login failed." : "Échec de l'authentification Google."));
        }
        return;
      }

      if (res.token && res.company) {
        login(res.token, res.company);
        const userName = res.user?.first_name || res.company.name;
        toast.success(
          isEn 
            ? `Successfully signed in with Google! Welcome, ${userName}.` 
            : `Connexion Google réussie ! Bienvenue, ${userName}.`
        );
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || (isEn ? "Google authentication error." : "Erreur lors de la connexion Google."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    toast.info(
      isEn 
        ? `Connecting via ${provider}. Please enter your business credentials or SIREN below for enterprise workspace authentication.`
        : `Authentification ${provider} : connectez-vous avec vos identifiants ou numéro SIREN d'entreprise pour un accès sécurisé.`
    );
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-white dark:bg-slate-950 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. COLONNE GAUCHE (FORMULAIRE & ACCÈS)                                     */}
      {/* ========================================================================= */}
      <section 
        aria-label="Formulaire de connexion"
        className="w-full lg:w-[48%] xl:w-[45%] 2xl:w-[42%] h-full flex flex-col justify-between px-6 sm:px-10 lg:px-12 xl:px-16 py-6 sm:py-8 overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shrink-0"
      >
        
        {/* En-tête : Logo officiel IT4WORK & Contrôles rapides */}
        <header className="flex items-center justify-between gap-4 w-full">
          <Link 
            to="/services-ia" 
            className="flex items-center gap-3 text-[#14213D] dark:text-white text-decoration-none group" 
            title="IT4WORK Innovation"
          >
            <img 
              src="/IT4ALL.jpeg" 
              alt="IT4WORK" 
              className="h-10 sm:h-12 w-auto rounded-lg object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#14213D] dark:text-white leading-tight">
                IT4WORK
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Entreprise
              </span>
            </div>
          </Link>

          {/* Langue & Thème discrets */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? "Mode clair" : "Mode sombre"}
              aria-label="Basculer le thème"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage(isEn ? 'fr' : 'en')}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isEn ? "Passer en Français" : "Switch to English"}
            >
              {isEn ? 'EN' : 'FR'}
            </button>
          </div>
        </header>

        {/* Corps central : Formulaire & Connexion */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-6 sm:py-8">
          
          {/* Titre et Sous-titre */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white mb-2">
              {isEn ? "Welcome to IT4WORK" : "Bienvenue sur IT4WORK"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isEn 
                ? "Sign in or create your account in seconds to access all platform services." 
                : "Connectez-vous ou créez votre compte en quelques secondes pour accéder à l'ensemble des services de la plateforme."}
            </p>
          </div>

          {/* Boutons Sociaux (Google, Microsoft, Apple) */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-semibold text-xs text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer group"
              title="Connexion Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleSocialClick("Microsoft 365")}
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-semibold text-xs text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer group"
              title="Connexion Microsoft"
            >
              <svg width="18" height="18" viewBox="0 0 21 21" className="shrink-0">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="1" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="1" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span className="hidden sm:inline">Microsoft</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialClick("Apple")}
              className="flex items-center justify-center gap-2 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all font-semibold text-xs text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer group"
              title="Connexion Apple"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-slate-900 dark:text-white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.65-2.74 1.4-.56.64-1.05 1.7-1.01 2.76 1.07.08 2.13-.54 2.74-1.29"/>
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isEn ? "or with email or SIREN" : "ou avec votre email ou SIREN"}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Messages d'alerte */}
          {successMessage && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-medium animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 font-medium animate-in fade-in">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire réel conservant scrupuleusement la logique métier */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Champ Identifiant (Email ou SIREN) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="identifier" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isEn ? "Work Email or SIREN number" : "Email professionnel ou numéro SIREN"}
                </Label>
                {isSirenMode ? (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Building2 size={11} /> {isEn ? "SIREN detected" : "SIREN détecté"}
                  </span>
                ) : identifier.includes('@') ? (
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <Mail size={11} /> {isEn ? "Business Email" : "Email pro"}
                  </span>
                ) : null}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {isSirenMode ? <Building2 size={17} className="text-amber-600 dark:text-amber-400" /> : <Mail size={17} />}
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#1C3A6B] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 outline-none transition-all font-medium"
                  placeholder={isEn ? "contact@company.com or 981 123 456" : "contact@entreprise.fr ou 981 123 456"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isEn ? "Password" : "Mot de passe"}
                </Label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-[#1C3A6B] dark:text-blue-400 hover:underline font-semibold transition-colors"
                >
                  {isEn ? "Forgot password?" : "Mot de passe oublié ?"}
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-[#1C3A6B] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 outline-none transition-all font-medium"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Bouton de Connexion principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-[#1C3A6B] hover:bg-[#142B52] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            </button>
          </form>

          {/* Création de compte (Sous le formulaire) */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isEn ? "Don't have an enterprise account yet?" : "Pas encore de compte ?"}{' '}
              <Link 
                to="/register" 
                state={{ from: location.state?.from }}
                className="font-bold text-[#1C3A6B] dark:text-amber-400 hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>{isEn ? "Create an account" : "Créer un compte"}</span>
                <ArrowRight size={13} />
              </Link>
            </p>
          </div>

        </div>

        {/* Pied de colonne gauche */}
        <footer className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div>© 2026 IT4WORK · Espace Sécurisé</div>
          <div className="flex items-center gap-4">
            <Link to="/services-ia" className="hover:underline">
              {isEn ? "All Services" : "Tous les services"}
            </Link>
            <Link to="/charte" className="hover:underline">
              {isEn ? "Security & Charter" : "Charte & Confidentialité"}
            </Link>
          </div>
        </footer>

      </section>

      {/* ========================================================================= */}
      {/* 2. COLONNE DROITE : ÉCOSYSTÈME IT4WORK (PARTAGÉ AVEC /REGISTER)           */}
      {/* ========================================================================= */}
      <AuthRightColumn />

    </div>
  );
};

export default Login;
