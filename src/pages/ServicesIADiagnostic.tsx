import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { 
  ArrowLeft, ArrowRight, Check, Sparkles, Clock, ShieldCheck, 
  Zap, LogIn, LogOut, Sun, Moon, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { AuthRightColumn } from "./auth/AuthRightColumn";
import { 
  DIAGNOSTIC_NEEDS,
  DiagnosticNeedId,
  resolveServicesFromNeeds,
  resolveActivatedToolIds,
  resolveChecklist,
  resolveAutomations,
  resolveAdvice,
  calculateHoursSaved,
  saveUserServicesConfig,
  loadUserServicesConfig,
  UserServicesConfig
} from "@/lib/servicesIAMapping";
import { savePersonaToDatabase, loadPersonaFromDatabase } from "@/lib/personaEngine";

interface OptionItem {
  id: string;
  title: string;
  desc: string;
}

const PROFILES: OptionItem[] = [
  { id: 'creation', title: 'Je me lance', desc: 'Mon entreprise a moins d’un an' },
  { id: 'seul', title: 'Je travaille seul', desc: 'Artisan, auto-entrepreneur, indépendant' },
  { id: 'petite', title: 'On est entre 2 et 9', desc: 'Une petite équipe' },
  { id: 'grande', title: 'On est 10 ou plus', desc: 'Une entreprise avec plusieurs équipes' }
];

const METIERS: OptionItem[] = [
  { id: 'bat', title: 'Bâtiment & travaux', desc: 'Plombiers, électriciens, maçons, peintres…' },
  { id: 'bouche', title: 'Métiers de bouche', desc: 'Boulangers, bouchers, traiteurs…' },
  { id: 'beaute', title: 'Beauté & bien-être', desc: 'Coiffeurs, esthéticiennes…' },
  { id: 'auto', title: 'Auto & réparation', desc: 'Garagistes, carrossiers, dépanneurs…' },
  { id: 'commerce', title: 'Commerce', desc: 'Boutiques, fleuristes, cavistes…' },
  { id: 'services', title: 'Services & conseil', desc: 'Services à domicile, conseil, créateurs…' },
  { id: 'autre', title: 'Autre métier', desc: 'On en discutera ensemble' }
];

const LEVELS: OptionItem[] = [
  { id: 'min', title: 'Je fais le minimum', desc: 'On vous guide pas à pas, avec des explications simples' },
  { id: 'debrouille', title: 'Je me débrouille', desc: 'Des explications quand vous en avez besoin' },
  { id: 'aise', title: 'Je suis à l’aise', desc: 'On va droit au but' }
];

export default function ServicesIADiagnostic() {
  const { company, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Étape courante : 1 à 4 = questions du questionnaire, 5 = Bilan réel de l'entreprise connectée
  const [step, setStep] = useState<number>(1);

  // Faire défiler vers le haut de la colonne gauche lors du changement d'étape
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Réponses du questionnaire (source unique de vérité sans mock)
  const [profile, setProfile] = useState<string | null>('seul');
  const [metier, setMetier] = useState<string | null>('bat');
  const [customMetier, setCustomMetier] = useState<string>('');
  const [needs, setNeeds] = useState<DiagnosticNeedId[]>(() => {
    try {
      const saved = loadUserServicesConfig();
      if (saved && Array.isArray(saved.needs) && saved.needs.length > 0) {
        return saved.needs as DiagnosticNeedId[];
      }
      const raw = localStorage.getItem('mdiv_activated_tools');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(id => ['devis', 'relance', 'clients', 'visible', 'mails', 'efacture'].includes(id)) as DiagnosticNeedId[];
        }
      }
    } catch {}
    return ['devis'];
  });
  const [level, setLevel] = useState<string | null>('debrouille');

  // Libellé dynamique du métier
  const getMetierLabel = () => {
    if (metier === 'autre') {
      return customMetier.trim() || 'votre métier';
    }
    const found = METIERS.find(m => m.id === metier);
    return found ? found.title : 'votre secteur';
  };

  const handleCustomMetierSubmit = () => {
    if (!customMetier.trim()) {
      toast.error("Veuillez préciser votre métier pour continuer.");
      return;
    }
    setStep(3);
  };

  // Restauration automatique du contexte après authentification réelle
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasBilanParam = params.get('bilan') === 'true';
    const hasPendingDiagnostic = localStorage.getItem('mdiv_diagnostic_pending') === 'true';

    // Si non connecté et tentative d'accès direct au bilan final (?bilan=true), rediriger vers la connexion
    if (!isAuthenticated && hasBilanParam) {
      navigate('/services-ia/diagnostic/login', {
        replace: true,
        state: {
          from: { pathname: '/services-ia/diagnostic', search: '?bilan=true' },
          message: "Connectez-vous ou créez votre compte pour accéder à votre bilan personnalisé."
        }
      });
      return;
    }

    if (isAuthenticated) {
      // Si l'utilisateur est déjà connecté et ne consulte pas explicitement un récap post-inscription (?bilan=true),
      // on le redirige immédiatement vers le véritable Diagnostic IA Approfondi dans son tableau de bord
      if (!hasBilanParam && !hasPendingDiagnostic) {
        navigate('/services-ia/dashboard?view=diagnostic_express', { replace: true });
        return;
      }

      const savedConfig = loadUserServicesConfig(company?.id);
      if (savedConfig) {
        if (savedConfig.needs && Array.isArray(savedConfig.needs) && savedConfig.needs.length > 0) {
          setNeeds(savedConfig.needs as DiagnosticNeedId[]);
        }
        if (savedConfig.profile) setProfile(savedConfig.profile);
        if (savedConfig.metier) setMetier(savedConfig.metier);
        if (savedConfig.customMetier) setCustomMetier(savedConfig.customMetier);
        if (savedConfig.level) setLevel(savedConfig.level);
      }

      if (hasBilanParam || hasPendingDiagnostic) {
        localStorage.removeItem('mdiv_diagnostic_pending');
        if (savedConfig) {
          saveUserServicesConfig({
            ...savedConfig,
            companyName: company?.name,
            email: company?.email,
          }, company?.id);
        }
        setStep(5);
        toast.success(`Bienvenue ${company?.name || ''} ! Votre bilan personnalisé est prêt.`);
      }
    }
  }, [isAuthenticated, company, location.search]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' && canProceed() && step < 4) {
        setStep(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && step > 1 && step <= 4) {
        setStep(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, profile, metier, customMetier, needs, level]);

  const toggleNeed = (id: DiagnosticNeedId) => {
    setNeeds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canProceed = () => {
    if (step === 1) return !!profile;
    if (step === 2) {
      if (metier === 'autre') return customMetier.trim().length > 0;
      return !!metier;
    }
    if (step === 3) return needs.length > 0;
    if (step === 4) return !!level;
    return true;
  };

  const handleNext = () => {
    if (step === 2 && metier === 'autre' && !customMetier.trim()) {
      toast.error("Veuillez préciser votre métier pour continuer.");
      return;
    }
    if (step === 4) {
      handleFinishQuestionnaire();
      return;
    }
    if (canProceed()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (step === 4) {
      handleFinishQuestionnaire();
      return;
    }
    setStep(prev => prev + 1);
  };

  // Finalisation du questionnaire : 
  // Si non connecté : redirection directe vers l'interface de connexion existante /services-ia/diagnostic/login
  // Si connecté : affichage du véritable bilan
  const handleFinishQuestionnaire = () => {
    const currentNeeds = needs.length > 0 ? needs : (['devis'] as DiagnosticNeedId[]);
    const metierLabel = getMetierLabel();

    const config: UserServicesConfig = {
      needs: currentNeeds,
      activatedTools: resolveActivatedToolIds(currentNeeds),
      hoursSaved: calculateHoursSaved(currentNeeds),
      profile,
      metier,
      customMetier: metier === 'autre' ? customMetier.trim() : undefined,
      metierLabel,
      level,
      companyName: company?.name || undefined,
      email: company?.email || undefined,
    };

    // Sauvegarde immédiate 100% en Base de Données
    savePersonaToDatabase(config, company?.id);
    localStorage.setItem('mdiv_diagnostic_pending', 'true');

    // Redirection stricte sans aucun faux écran ni mock
    if (!isAuthenticated) {
      navigate('/services-ia/diagnostic/login', {
        state: {
          from: { pathname: '/services-ia/diagnostic', search: '?bilan=true' },
          message: "Connectez-vous ou créez votre compte pour accéder à votre bilan personnalisé."
        }
      });
      return;
    }

    // Utilisateur déjà authentifié : affichage direct de son véritable bilan
    setStep(5);
    toast.success("Bilan personnalisé généré pour votre entreprise !");
  };

  // Données dynamiques calculées d'après les réponses réelles du questionnaire
  const activeServices = resolveServicesFromNeeds(needs);
  const activeAutomations = resolveAutomations(needs);
  const activeChecklist = resolveChecklist(needs, getMetierLabel());
  const activeAdvice = resolveAdvice(needs, getMetierLabel());
  const hoursSaved = calculateHoursSaved(needs);

  // Pourcentage de la barre de progression
  const progressPercent = step >= 5 ? 100 : Math.round(((step - 1) / 4) * 100) + 12;

  // Style commun effet globe lumineux / sphère énergétique au survol
  const cardGlowClass = `
    relative group transition-all duration-300 ease-out transform-gpu cursor-pointer
    hover:scale-[1.02] hover:-translate-y-0.5
    hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.30),0_0_22px_rgba(34,197,94,0.20)]
    hover:border-emerald-500 dark:hover:border-emerald-400
    before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-emerald-400/10 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none overflow-hidden
  `;

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. COLONNE GAUCHE : QUESTIONS DU DIAGNOSTIC RECENTRÉES (DÉFILABLE)        */}
      {/* ========================================================================= */}
      <section 
        className="w-full lg:w-[48%] xl:w-[45%] h-full flex flex-col z-10 bg-white dark:bg-slate-900 shadow-xl lg:shadow-none overflow-hidden"
      >
        
        {/* En-tête de la colonne gauche FIGÉ (reste toujours visible au défilement) */}
        <div className="w-full shrink-0 px-4 sm:px-6 xl:px-8 pt-4 sm:pt-6 xl:pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
          <div className="flex items-center justify-between gap-3 mb-3">
            
            {/* Logo IT4WORK Agrandissement significatif */}
            <Link 
              to="/services-ia" 
              className="flex items-center gap-3 sm:gap-4 text-decoration-none group py-0.5" 
              title="Retour à l'accueil IT4WORK"
            >
              <img 
                src="/IT4ALL.jpeg" 
                alt="IT4WORK Innovation" 
                className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto rounded-xl object-contain shadow-sm border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 transition-transform" 
              />
              <div className="leading-tight">
                <span className="font-black text-xl sm:text-2xl text-[#14213D] dark:text-white tracking-tight block">
                  IT4WORK
                </span>
                <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-widest text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  Diagnostic Entreprise
                </span>
              </div>
            </Link>

            {/* Actions rapides (Thème & Connexion / Quitter) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? "Mode clair" : "Mode sombre"}
                aria-label="Changer de thème"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      toast.success("Vous avez été déconnecté avec succès.");
                    }}
                    className="group flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 dark:hover:border-rose-800 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer truncate max-w-[130px]"
                    title="Cliquez pour vous déconnecter"
                  >
                    <span className="truncate">{company?.name || 'Connecté'}</span>
                    <LogOut size={12} className="opacity-60 group-hover:opacity-100 shrink-0 text-emerald-600 group-hover:text-rose-600 transition-opacity" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/services-ia/diagnostic/login"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 flex items-center gap-1.5 transition-colors"
                >
                  <LogIn size={13} />
                  <span>Connexion</span>
                </Link>
              )}

              <Link 
                to="/services-ia" 
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1"
              >
                Quitter
              </Link>
            </div>
          </div>

          {/* Stepper / Progression */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>
                {step <= 4 ? `Question ${step} sur 4` : 'Bilan personnalisé & Plan d\'action'}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                {step <= 4 ? `${progressPercent}%` : 'Terminé 100%'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Corps défilable de la colonne gauche */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 xl:px-8 py-4 sm:py-6 flex flex-col justify-between custom-scrollbar"
        >
          {/* Corps central du diagnostic recentré avec équilibre visuel optimal */}
          <div className="flex-1 flex flex-col justify-center py-2 sm:py-4 w-full max-w-xl mx-auto">
          
          {/* ── QUESTION 1 ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200">
              <span className="inline-block text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                Étape 1 · Votre entreprise
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-white leading-tight mb-2">
                Comment travaillez-vous ?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                On adapte les outils et les recommandations à la taille de votre structure.
              </p>

              <div role="radiogroup" className="flex flex-col gap-3">
                {PROFILES.map((p) => {
                  const isSelected = profile === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setProfile(p.id)}
                      className={`flex items-center gap-3.5 w-full text-left min-h-[64px] p-3.5 sm:p-4 rounded-2xl border-2 ${cardGlowClass} ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-900/10"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isSelected 
                          ? "border-emerald-600 dark:border-emerald-400 bg-white dark:bg-slate-900 border-[6px]" 
                          : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800"
                      }`} />
                      <div className="flex flex-col relative z-10">
                        <span className="font-bold text-sm sm:text-base text-[#14213D] dark:text-white">
                          {p.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                          {p.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Question 1 */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline text-xs font-semibold cursor-pointer py-2 px-1"
                >
                  Passer cette question
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="min-h-[46px] px-6 sm:px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white transition-all cursor-pointer shadow-md shadow-emerald-900/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Continuer</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── QUESTION 2 ── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <span className="inline-block text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                Étape 2 · Votre métier
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-white leading-tight mb-2">
                Quel est votre métier ?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                Vos devis types, modèles de factures et conseils seront directement adaptés à votre secteur.
              </p>

              <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {METIERS.map((m) => {
                  const isSelected = metier === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setMetier(m.id)}
                      className={`flex items-center gap-3 w-full text-left p-3.5 rounded-2xl border-2 ${cardGlowClass} ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-900/10"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isSelected 
                          ? "border-emerald-600 dark:border-emerald-400 bg-white dark:bg-slate-900 border-[5px]" 
                          : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800"
                      }`} />
                      <div className="flex flex-col relative z-10">
                        <span className="font-bold text-xs sm:text-sm text-[#14213D] dark:text-white">
                          {m.id === 'autre' && customMetier.trim() ? `Autre : ${customMetier.trim()}` : m.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug">
                          {m.id === 'autre' && customMetier.trim() ? "Métier personnalisé défini" : m.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {/* Champ de saisie dynamique pour 'Autre métier' */}
                {metier === 'autre' && (
                  <div className="sm:col-span-2 mt-2 p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl shadow-sm animate-in fade-in duration-200">
                    <label htmlFor="custom-metier-input" className="block text-xs font-bold text-[#14213D] dark:text-white mb-1.5">
                      Précisez votre activité ou profession :
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="custom-metier-input"
                        type="text"
                        autoFocus
                        value={customMetier}
                        onChange={(e) => setCustomMetier(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomMetierSubmit();
                          }
                        }}
                        placeholder="ex : Photographe, Coach sportif, Consultant, Architecte..."
                        className="flex-1 h-11 px-3.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-sm text-[#14213D] dark:text-white outline-none font-semibold focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900"
                      />
                      <button
                        type="button"
                        onClick={handleCustomMetierSubmit}
                        disabled={!customMetier.trim()}
                        className="h-11 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <span>Valider</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Question 2 */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer py-2 px-1"
                >
                  ← Retour
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline text-xs font-semibold cursor-pointer py-2 px-1"
                  >
                    Passer
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="min-h-[46px] px-6 sm:px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white transition-all cursor-pointer shadow-md shadow-emerald-900/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Continuer</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 3 : BESOINS MÉTIER ── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-200">
              <span className="inline-block text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                Étape 3 · Vos priorités ({getMetierLabel()})
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-white leading-tight mb-2">
                Qu’est-ce qui vous prend le plus de temps ?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                Cochez tout ce qui s'applique à votre activité. Ces choix activeront vos modules sur mesure.
              </p>

              <div role="group" className="flex flex-col gap-2.5">
                {DIAGNOSTIC_NEEDS.map((n) => {
                  const isSelected = needs.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => toggleNeed(n.id)}
                      className={`flex items-center gap-3.5 w-full text-left p-3.5 rounded-2xl border-2 ${cardGlowClass} ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-900/10"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all ${
                        isSelected 
                          ? "border-emerald-600 dark:border-emerald-400 bg-emerald-600 dark:bg-emerald-500 text-white" 
                          : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800"
                      }`}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col relative z-10">
                        <span className="font-bold text-sm sm:text-base text-[#14213D] dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {n.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Question 3 */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer py-2 px-1"
                >
                  ← Retour
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline text-xs font-semibold cursor-pointer py-2 px-1"
                  >
                    Passer
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="min-h-[46px] px-6 sm:px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white transition-all cursor-pointer shadow-md shadow-emerald-900/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Continuer ({needs.length})</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTION 4 : NIVEAU INFORMATIQUE ── */}
          {step === 4 && (
            <div className="animate-in fade-in duration-200">
              <span className="inline-block text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                Étape 4 · Dernière question
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] dark:text-white leading-tight mb-2">
                Et l’informatique dans votre quotidien ?
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
                Pas d'évaluation : nous adaptons l'ergonomie et le niveau d'assistance pas-à-pas à vos habitudes.
              </p>

              <div role="radiogroup" className="flex flex-col gap-3">
                {LEVELS.map((lvl) => {
                  const isSelected = level === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLevel(lvl.id)}
                      className={`flex items-center gap-3.5 w-full text-left min-h-[64px] p-3.5 sm:p-4 rounded-2xl border-2 ${cardGlowClass} ${
                        isSelected
                          ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-900/10"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        isSelected 
                          ? "border-emerald-600 dark:border-emerald-400 bg-white dark:bg-slate-900 border-[6px]" 
                          : "border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800"
                      }`} />
                      <div className="flex flex-col relative z-10">
                        <span className="font-bold text-sm sm:text-base text-[#14213D] dark:text-white">
                          {lvl.title}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                          {lvl.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Question 4 -> Bouton Voir mon bilan en VERT IT4WORK */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer py-2 px-1"
                >
                  ← Retour
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline text-xs font-semibold cursor-pointer py-2 px-1"
                  >
                    Passer
                  </button>
                  
                  {/* BOUTON VOIR MON BILAN : STRICTEMENT VERT IT4WORK AVEC EFFET PREMIUM */}
                  <button
                    type="button"
                    onClick={handleFinishQuestionnaire}
                    disabled={!canProceed()}
                    className="min-h-[50px] px-8 sm:px-10 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-emerald-600 via-green-600 to-green-700 hover:from-emerald-700 hover:via-green-700 hover:to-green-800 text-white transition-all duration-300 cursor-pointer shadow-lg shadow-green-900/25 hover:shadow-green-900/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
                  >
                    <Sparkles size={18} className="text-emerald-200" />
                    <span>Voir mon bilan</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 5 : BILAN RÉEL DE L'ENTREPRISE AUTHENTIFIÉE (SANS AUCUN MOCK) ── */}
          {step === 5 && isAuthenticated && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Bannière de l'entreprise connectée */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                    <Check size={13} strokeWidth={3} />
                    Bilan Certifié Entreprise
                  </span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Compte : {company?.name}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
                  Configuration active pour {getMetierLabel()}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Tous vos modules et automatisations ont été activés sur votre espace de travail.
                </p>
              </div>

              {/* 3 Métriques réelles calculées */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight mb-1">
                    Temps Gagné
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
                    ~{hoursSaved}h
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    / semaine
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-1">
                    Outils Prêts
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
                    {activeServices.length}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    configurés
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center">
                  <div className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-tight mb-1">
                    Automatisations
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
                    {activeAutomations.length}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    actives
                  </div>
                </div>
              </div>

              {/* Bouton d'accès direct au véritable tableau de bord */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg mb-0.5">
                    Accédez à votre espace entreprise
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Vos factures Factur-X, devis et automatisations sont prêts à l'emploi.
                  </p>
                </div>
                <Link
                  to="/services-ia/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-emerald-800 font-black text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Mon tableau de bord</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Liste des modules configurés */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#14213D] dark:text-white">
                    Modules configurés pour votre activité
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {activeServices.length} actifs
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeServices.map((service) => (
                    <div 
                      key={service.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-extrabold text-[#14213D] dark:text-white">
                            {service.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {service.desc}
                        </p>
                      </div>

                      <Link
                        to={service.link}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0 flex items-center gap-1 transition-colors"
                      >
                        <span>Ouvrir</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatisations réelles */}
              {activeAutomations.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Zap size={15} />
                    <span>Automatisations synchronisées</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeAutomations.map((auto, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{auto.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton retour / modification */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  ← Ajuster mes priorités
                </button>
                <Link
                  to="/services-ia"
                  className="text-slate-500 dark:text-slate-400 hover:underline"
                >
                  Tous les services
                </Link>
              </div>

            </div>
          )}

        </div>

          {/* Pied de colonne gauche */}
          <footer className="w-full pt-4 mt-8 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <div>© 2026 IT4WORK · Espace Sécurisé</div>
            <div className="flex items-center gap-4">
              <Link to="/services-ia" className="hover:underline">
                Tous les services
              </Link>
              <Link to="/charte" className="hover:underline">
                Charte & Confidentialité
              </Link>
            </div>
          </footer>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. COLONNE DROITE : VITRINE INTERACTIVE IT4WORK (SLIDER & PALETTES)       */}
      {/* ========================================================================= */}
      <AuthRightColumn />

    </div>
  );
}
