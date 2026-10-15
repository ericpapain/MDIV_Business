import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { 
  Menu, X, ChevronDown, Receipt, Zap, TrendingUp, Megaphone, 
  Search, Sparkles, ShieldCheck, ArrowRight, FileText, 
  Settings, LogOut, LogIn, Building2, Tag, Tag as TagIcon
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

// Navigation classique (Site principal / Accueil)
const mainNavKeys = [
  { to: "/", key: "nav.home" },
  { to: "/sejour", key: "nav.sejour" },
  { to: "/offres", key: "nav.offers" },
  { to: "/evenements", key: "nav.events" },
  { to: "/partenaires", key: "nav.partners", labelFr: "Partenaires & Ambassadeurs", labelEn: "Partners & Ambassadors" },
  { to: "/contact", key: "nav.contact" },
  { to: "/blog", key: "Blog" },
  { to: "/charte", key: "La Charte" },
];

// Routes associées à chaque Pôle IA pour l'état actif persistant
const POLE_ROUTES: Record<string, string[]> = {
  finance: [
    '/services-ia/factures',
    '/services-ia/verificateur-factures',
    '/services-ia/devis',
    '/services-ia/devis-automatique',
    '/services-ia/relances',
    '/services-ia/tarifs',
    '/tarifs'
  ],
  productivite: [
    '/services-ia/resume-documents',
    '/services-ia/comptes-rendus',
    '/services-ia/assistant-email'
  ],
  ventes: [
    '/services-ia/generateur-leads',
    '/services-ia/prepa-reunion',
    '/services-ia/prospection-email'
  ],
  marketing: [
    '/services-ia/generateur-contenu',
    '/services-ia/marketing-communication'
  ],
  'audit-roi': [
    '/services-ia/diagnostic',
    '/diagnostic-ia',
    '/services-ia/calc-roi',
    '/services-ia/benchmark'
  ]
};

export function SiteHeader() {
  const { t, language, toggleLanguage } = useLanguage();
  const { company, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const location = useLocation();
  // Section Services IA fermée / En maintenance : maintien de la navigation MDIV Business
  const isIAPage = false;
  const isEn = language === 'en';

  const navRef = useRef<HTMLDivElement>(null);

  // Détection du Pôle Actif
  const isPoleActive = (poleKey: string) => {
    const routes = POLE_ROUTES[poleKey] || [];
    return routes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));
  };

  // Détection de l'Application Active
  const isAppActive = (targetTo: string) => {
    const [targetPath, targetQuery] = targetTo.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (targetQuery && targetQuery.includes('tab=expenses')) {
      return (currentPath === '/services-ia/factures' || currentPath === '/services-ia/verificateur-factures') &&
             currentSearch.includes('tab=expenses');
    }

    if (targetPath === '/services-ia/factures') {
      return (currentPath === '/services-ia/factures' || currentPath === '/services-ia/verificateur-factures') &&
             !currentSearch.includes('tab=expenses');
    }

    if (targetPath === '/services-ia/devis') {
      return currentPath === '/services-ia/devis' || currentPath === '/services-ia/devis-automatique';
    }

    if (targetPath === '/services-ia/diagnostic') {
      return currentPath === '/services-ia/diagnostic' || currentPath === '/diagnostic-ia';
    }

    if (targetPath === '/services-ia/tarifs') {
      return currentPath === '/services-ia/tarifs' || currentPath === '/tarifs';
    }

    return currentPath === targetPath;
  };

  // Classes de styles pour le bouton de Pôle (onglet)
  const getPoleButtonClass = (poleKey: string) => {
    const isActive = isPoleActive(poleKey);
    const isOpen = activeDropdown === poleKey;

    if (isOpen) {
      return 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50';
    }
    if (isActive) {
      // Onglet reste coloré en bleu clair
      return 'bg-sky-100 text-sky-950 border border-sky-300 font-extrabold shadow-sm ring-2 ring-sky-300/80';
    }
    return 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-950 border border-transparent';
  };

  const getChevronClass = (poleKey: string) => {
    const isActive = isPoleActive(poleKey);
    const isOpen = activeDropdown === poleKey;

    if (isOpen) {
      return 'rotate-180 text-white';
    }
    if (isActive) {
      return 'text-sky-800 font-bold';
    }
    return 'text-slate-500';
  };

  // Helper de rendu d'un item applicatif dans le méga-menu
  const renderDropdownItem = (
    to: string,
    icon: React.ReactNode,
    title: string,
    desc: string,
    badge?: React.ReactNode,
    highlightBadge?: string
  ) => {
    const active = isAppActive(to);
    return (
      <Link 
        to={to} 
        onClick={() => setActiveDropdown(null)} 
        className={`p-3 rounded-xl transition-all flex items-start gap-3 group/item border ${
          active 
            ? 'bg-sky-100/90 text-sky-950 border-sky-300 shadow-sm ring-2 ring-sky-300/60' 
            : 'hover:bg-slate-50 border-transparent hover:border-slate-100 text-slate-700'
        }`}
      >
        <div className={`p-2.5 rounded-xl border transition-all shrink-0 ${
          active 
            ? 'bg-sky-200 text-sky-900 border-sky-300 shadow-xs' 
            : 'bg-sky-50 text-sky-600 border-sky-100 group-hover/item:bg-sky-100 group-hover/item:scale-105'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs sm:text-sm font-bold flex items-center justify-between gap-2 ${
            active ? 'text-sky-950 font-extrabold' : 'text-slate-900 group-hover/item:text-blue-600 transition-colors'
          }`}>
            <span className="flex items-center gap-2 truncate">
              {title}
              {badge}
            </span>
            {active && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-200 text-sky-950 border border-sky-300 font-black shrink-0 shadow-xs">
                Actif
              </span>
            )}
            {!active && highlightBadge && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold shrink-0">
                {highlightBadge}
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 leading-snug ${active ? 'text-sky-900/90 font-medium' : 'text-slate-600'}`}>
            {desc}
          </p>
        </div>
      </Link>
    );
  };

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f(); 
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  // Fermer les dropdowns au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const headerBgClass = isIAPage 
    ? (scrolled 
        ? "bg-slate-50/95 dark:bg-slate-50/95 backdrop-blur-xl border-b border-slate-200 text-slate-900 py-2.5 shadow-md shadow-slate-200/60" 
        : "bg-slate-50/90 dark:bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 text-slate-900 py-3 shadow-sm shadow-slate-200/40")
    : (scrolled ? "glass-strong py-3" : "bg-transparent py-5");

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${headerBgClass}`} ref={navRef}>
      <div className="w-full flex items-center justify-between gap-2 xl:gap-4 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* LOGOS GAUCHE : MDIV BUSINESS (Retour accueil) + IT4ALL (Page IA)          */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 xl:-ml-4">
          {/* Logo MDIV Business - Plus discret sur les pages IA, clic renvoie vers l'accueil principal */}
          <Link to="/" className="flex items-center gap-2 group" title="Retour à l'accueil principal M.DIV Business">
            <div className={`${isIAPage ? "w-6 h-6 sm:w-7 sm:h-7" : "w-8.5 h-8.5"} rounded-sm flex items-center justify-center gold-border bg-emerald-deep/40 relative overflow-hidden group-hover:scale-105 transition-transform`}>
              <span className={`font-display ${isIAPage ? "text-xs" : "text-sm"} gold-text font-bold tracking-tight`}>MD</span>
            </div>
            <div className="leading-none">
              <div className={`font-display ${isIAPage ? "text-xs sm:text-sm font-bold text-slate-800" : "text-base sm:text-lg"} tracking-wider`}>
                M<span className="gold-text">.</span>DIV<span className={`${isIAPage ? "text-slate-400" : "text-foreground/40"} mx-0.5 sm:mx-1`}>·</span><span className={`gold-text ${isIAPage ? "text-[11px] sm:text-xs" : "text-sm sm:text-base"}`}>Business</span>
              </div>
              {!isIAPage && (
                <div className="text-[8.5px] sm:text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  Business · Travel · Capital
                </div>
              )}
            </div>
          </Link>

          {/* Logo Partenaire IT4ALL (Fortement agrandi & mis en avant sur les pages IA) */}
          {isIAPage && (
            <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-300">
              <Link 
                to="/services-ia" 
                className="group flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-xl bg-transparent border border-transparent hover:scale-105 transition-all text-center" 
                title="Partenaire Innovation Technologique IT4ALL"
              >
                <img 
                  src="/IT4ALL.jpeg" 
                  alt="IT4ALL Innovation" 
                  className="h-8 sm:h-12 md:h-14 w-auto rounded-md object-contain mix-blend-multiply" 
                  onError={(e)=>{ (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="hidden xs:flex text-[6.5px] sm:text-[7.5px] md:text-[8.5px] font-extrabold tracking-wide uppercase items-center justify-center gap-1 sm:gap-1.5 mt-0.5 px-1 leading-tight flex-wrap xl:whitespace-nowrap select-none">
                  <span className="text-[#0a2540] font-black">AI</span>
                  <span className="text-[#00b4d8] font-black text-[7.5px] sm:text-[9px] leading-none">•</span>
                  <span className="text-[#0a2540] font-black">DATA</span>
                  <span className="text-[#00b4d8] font-black text-[7.5px] sm:text-[9px] leading-none">•</span>
                  <span className="text-[#0a2540] font-black">OPTIMIZATION</span>
                  <span className="text-[#00b4d8] font-black text-[7.5px] sm:text-[9px] leading-none">•</span>
                  <span className="text-[#0a2540] font-black">DIGITAL SOLUTIONS</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION CENTRALE :                                                     */}
        {/* 1) SI PAGE IA : REGROUPEMENT DES APPLICATIONS IA (Mega-Menus Épurés)       */}
        {/* 2) SI AUTRE PAGE : MENUS CLASSIQUES (Accueil, Séjours, Offres, etc.)       */}
        {/* ========================================================================= */}
        {isIAPage ? (
          /* Mega-Navbar Pôles IA - Déroulement strictement au clic, titres reformulés, grande police */
          <nav className="hidden 2xl:flex items-center gap-1 2xl:gap-2">
            
            {/* Pôle 1 : Finance */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'finance' ? null : 'finance')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${getPoleButtonClass('finance')}`}
              >
                <span>Finance</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${getChevronClass('finance')}`} />
              </button>

              {activeDropdown === 'finance' && (
                <div className="absolute left-0 mt-2 w-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-950/20 p-3.5 grid grid-cols-1 gap-1.5 ia-animate-in z-50">
                  {renderDropdownItem(
                    '/services-ia/factures',
                    <Receipt size={18} />,
                    'Facture IA & Factur-X 2026',
                    'Conformité DGFIP, calcul TVA, export vectoriel A4 et cycle de vie.',
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">PDP 0039</span>
                  )}
                  {renderDropdownItem(
                    '/services-ia/devis',
                    <Sparkles size={18} />,
                    'Devis IA Instantané',
                    'Chiffrage intelligent, marges automatiques et signature client.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/relances',
                    <Zap size={18} />,
                    'Relances Factures & Impayés',
                    'Scénarios amiables et fermes automatisés pour accélérer le cash.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/factures?tab=expenses',
                    <ShieldCheck size={18} />,
                    'Achats, Dépenses & OCR',
                    'Scan des justificatifs, rapprochement bancaire et pré-comptabilité FEC.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/tarifs',
                    <TagIcon size={18} />,
                    'Tarifs & Modules (IT4ALL)',
                    'Grille des forfaits (Créateur, TPE, PME) et packs additionnels e-invoicing.',
                    undefined,
                    '2026'
                  )}
                </div>
              )}
            </div>

            {/* Pôle 2 : Productivité */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'productivite' ? null : 'productivite')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${getPoleButtonClass('productivite')}`}
              >
                <span>Productivité</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${getChevronClass('productivite')}`} />
              </button>

              {activeDropdown === 'productivite' && (
                <div className="absolute left-0 mt-2 w-[440px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-950/20 p-3.5 grid grid-cols-1 gap-1.5 ia-animate-in z-50">
                  {renderDropdownItem(
                    '/services-ia/resume-documents',
                    <FileText size={18} />,
                    'Résumeur de Documents IA',
                    'Synthèse exécutive instantanée de PDF et DOCX Word volumineux.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/comptes-rendus',
                    <Zap size={18} />,
                    'Comptes-Rendus de Réunions IA',
                    "Enregistrements audio/texte transformés en plan d'action décisionnel."
                  )}
                  {renderDropdownItem(
                    '/services-ia/assistant-email',
                    <Sparkles size={18} />,
                    'Assistant Email IA',
                    'Rédigez et traitez vos correspondances professionnelles en 1 clic.'
                  )}
                </div>
              )}
            </div>

            {/* Pôle 3 : Ventes */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'ventes' ? null : 'ventes')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${getPoleButtonClass('ventes')}`}
              >
                <span>Ventes</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${getChevronClass('ventes')}`} />
              </button>

              {activeDropdown === 'ventes' && (
                <div className="absolute left-0 mt-2 w-[440px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-950/20 p-3.5 grid grid-cols-1 gap-1.5 ia-animate-in z-50">
                  {renderDropdownItem(
                    '/services-ia/generateur-leads',
                    <TrendingUp size={18} />,
                    'Générateur de Leads B2B',
                    'Extraction et qualification de contacts dirigeants dans votre secteur.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/prepa-reunion',
                    <FileText size={18} />,
                    'Préparation de Rendez-vous IA',
                    'Brief commercial et argumentaire de négociation en 2 minutes.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/prospection-email',
                    <Zap size={18} />,
                    'Emails de Prospection IA',
                    "Messages d'approche personnalisés à fort taux de réponse."
                  )}
                </div>
              )}
            </div>

            {/* Pôle 4 : Marketing */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'marketing' ? null : 'marketing')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${getPoleButtonClass('marketing')}`}
              >
                <span>Marketing</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${getChevronClass('marketing')}`} />
              </button>

              {activeDropdown === 'marketing' && (
                <div className="absolute left-0 mt-2 w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-950/20 p-3.5 grid grid-cols-1 gap-1.5 ia-animate-in z-50">
                  {renderDropdownItem(
                    '/services-ia/generateur-contenu',
                    <Megaphone size={18} />,
                    'Générateur de Contenu Multi-Canal',
                    'Articles, posts LinkedIn et visuels adaptés à vos actualités.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/marketing-communication',
                    <Sparkles size={18} />,
                    'Slogans, Présentations & Pitchs',
                    "Supports d'impact et argumentaires de marque clés en main."
                  )}
                </div>
              )}
            </div>

            {/* Pôle 5 : Audit & ROI */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'audit-roi' ? null : 'audit-roi')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${getPoleButtonClass('audit-roi')}`}
              >
                <span>Audit & ROI</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${getChevronClass('audit-roi')}`} />
              </button>

              {activeDropdown === 'audit-roi' && (
                <div className="absolute left-0 mt-2 w-[440px] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-950/20 p-3.5 grid grid-cols-1 gap-1.5 ia-animate-in z-50">
                  {renderDropdownItem(
                    '/services-ia/diagnostic',
                    <Search size={18} />,
                    'Diagnostic IA Express',
                    'Évaluation de votre maturité IA et feuille de route opérationnelle.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/calc-roi',
                    <TrendingUp size={18} />,
                    'Calculateur de ROI IA',
                    'Estimez les heures et les euros économisés par votre entreprise.'
                  )}
                  {renderDropdownItem(
                    '/services-ia/benchmark',
                    <ShieldCheck size={18} />,
                    'Benchmark Digital',
                    'Comparez vos performances avec celles des leaders de votre secteur.'
                  )}
                </div>
              )}
            </div>

            {/* Onglet Direct Tarifs */}
            <Link 
              to="/services-ia/tarifs" 
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all duration-200 cursor-pointer ${
                location.pathname === '/services-ia/tarifs' || location.pathname === '/tarifs'
                  ? 'bg-sky-100 text-sky-950 border border-sky-300 ring-2 ring-sky-300/80 shadow-sm font-extrabold' 
                  : 'text-blue-700 hover:bg-blue-100/90 hover:text-blue-950 bg-blue-50/80 border border-blue-200/70 shadow-sm'
              }`}
            >
              <Tag size={15} className={location.pathname === '/services-ia/tarifs' || location.pathname === '/tarifs' ? 'text-sky-800' : 'text-blue-600'} />
              <span>Tarifs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                location.pathname === '/services-ia/tarifs' || location.pathname === '/tarifs' ? 'bg-sky-200 text-sky-950 border border-sky-300' : 'bg-amber-400 text-slate-950'
              }`}>
                2026
              </span>
            </Link>

            {/* Vue d'ensemble portail */}
            <Link 
              to="/services-ia" 
              className={`px-3 py-2 rounded-xl text-sm 2xl:text-[15px] font-bold transition-all ${
                location.pathname === '/services-ia'
                  ? 'bg-sky-100 text-sky-950 border border-sky-300 font-extrabold shadow-sm ring-2 ring-sky-300/80'
                  : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
              }`}
            >
              Tous les Pôles
            </Link>
          </nav>
        ) : (
          /* Navigation Standard pour les pages du site principal MDIV */
          <nav className="hidden xl:flex items-center gap-6">
            {mainNavKeys.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                className={({ isActive }) => {
                  const activeColor = "text-primary font-semibold";
                  const inactiveColor = "text-foreground/70 hover:text-primary";
                  return `text-[12px] uppercase tracking-[0.2em] transition-colors relative py-2 ${isActive ? activeColor : inactiveColor}`;
                }}
              >
                {n.key.startsWith("nav.") ? (n.labelFr ? (language === 'en' ? n.labelEn : n.labelFr) : t(n.key)) : n.key}
              </NavLink>
            ))}
          </nav>
        )}

        {/* ========================================================================= */}
        {/* ACTIONS DROITE : LANGUE + THEME + ACCÈS ENTREPRISE / CONNEXION           */}
        {/* Toujours verrouillé à droite (shrink-0) pour rester visible au zoom fort  */}
        {/* ========================================================================= */}
        <div className={`hidden ${isIAPage ? "2xl:flex" : "xl:flex"} items-center gap-2 xl:gap-2.5 shrink-0 z-20`}>
          
          {/* Theme Toggle (Mode sombre / clair) */}
          <ThemeToggle />

          {/* Sélecteur de Langue (FR / EN) */}
          <button 
            onClick={toggleLanguage} 
            className={`flex items-center text-[10px] uppercase tracking-[0.2em] font-semibold border rounded-lg overflow-hidden shrink-0 ${
              isIAPage ? "border-slate-200 bg-white text-slate-800 shadow-sm" : "border-gold/30"
            }`}
          >
            <span className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${
              language === 'fr' 
                ? 'bg-blue-600 text-white font-bold' 
                : (isIAPage ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-gold/10 text-foreground/70')
            }`}>
              <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-3.5 h-[10px] object-cover rounded-[2px]" /> FR
            </span>
            <span className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${
              language === 'en' 
                ? 'bg-blue-600 text-white font-bold' 
                : (isIAPage ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-gold/10 text-foreground/70')
            }`}>
              <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-3.5 h-[10px] object-cover rounded-[2px]" /> EN
            </span>
          </button>

          {/* Actions Entreprise (spécifique pages IA ou accès rapide) */}
          {isIAPage && (
            isAuthenticated ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">
                    {company?.name ? company.name.substring(0, 2).toUpperCase() : 'MD'}
                  </div>
                  <span className="max-w-[110px] truncate">{company?.name || 'Mon Entreprise'}</span>
                  <ChevronDown size={14} className={userDropdownOpen ? 'rotate-180' : ''} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 ia-animate-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold truncate text-slate-900">{company?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{company?.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} className="px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                      <Building2 size={14} className="text-blue-600" /> Tableau de bord
                    </Link>
                    <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 flex items-center gap-2">
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 transition-colors shrink-0 shadow-sm"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:shadow-lg hover:shadow-amber-500/25 transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  Essayer
                </Link>
              </div>
            )
          )}
        </div>

        {/* Bouton Menu Mobile (Adapté pour basculer dès que le zoom réduit la largeur sous xl) */}
        <button 
          onClick={() => setOpen(!open)} 
          className={`${isIAPage ? "2xl:hidden" : "xl:hidden"} p-2 rounded-xl shrink-0 ${isIAPage ? "text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm" : "text-foreground hover:bg-foreground/10"}`}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MENU MOBILE / ZOOM ÉTENDU DÉROULANT                                       */}
      {/* ========================================================================= */}
      {open && (
        <div className={`${isIAPage ? "2xl:hidden" : "xl:hidden"} animate-fade-up max-h-[85vh] overflow-y-auto ${
          isIAPage ? "bg-slate-50/98 border-t border-slate-200 text-slate-800 backdrop-blur-2xl shadow-2xl" : "glass-strong border-t border-gold/10"
        }`}>
          <div className="container py-5 px-4 flex flex-col gap-4">
            
            {/* Contrôles haut du menu mobile */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Préférences</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ThemeToggle />
                <button onClick={toggleLanguage} className="flex items-center text-xs uppercase tracking-[0.2em] font-semibold border rounded-lg overflow-hidden border-slate-200 bg-white shadow-sm">
                  <span className={`px-2.5 py-1 ${language === 'fr' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}>FR</span>
                  <span className={`px-2.5 py-1 ${language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}>EN</span>
                </button>
              </div>
            </div>

            {/* Actions Rapides Authentification (Toujours accessibles au zoom mobile/tiroir) */}
            {isIAPage && !isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-3 rounded-xl text-center text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 shadow-sm"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="py-2.5 px-3 rounded-xl text-center text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                >
                  Essayer
                </Link>
              </div>
            )}

            {isIAPage ? (
              /* Liens applications IA pour Mobile & Zoom */
              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Sparkles size={13} /> Pôles d'Applications IA
                </div>

                <div className="space-y-2 text-sm">
                  {/* Pôle Finance Mobile */}
                  <div className={`p-3.5 bg-white rounded-2xl border shadow-sm space-y-2 transition-all ${
                    isPoleActive('finance') ? 'border-sky-300 ring-2 ring-sky-200/80 bg-sky-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-500 text-xs uppercase block tracking-wider">Finance</span>
                      {isPoleActive('finance') && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-900 rounded-full font-bold border border-sky-300">
                          Pôle Actif
                        </span>
                      )}
                    </div>
                    <Link to="/services-ia/factures" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/factures') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Factures & Factur-X 2026 (PDP 0039)</span>
                      {isAppActive('/services-ia/factures') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/devis" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/devis') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Devis IA & Chiffrage Instantané</span>
                      {isAppActive('/services-ia/devis') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/relances" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/relances') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Relances Clients & Impayés IA</span>
                      {isAppActive('/services-ia/relances') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/factures?tab=expenses" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/factures?tab=expenses') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Achats, Dépenses & OCR</span>
                      {isAppActive('/services-ia/factures?tab=expenses') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/tarifs" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl transition-all ${isAppActive('/services-ia/tarifs') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-blue-600 hover:text-blue-700 font-bold'}`}>
                      <span>Tarifs & Modules (IT4ALL 2026)</span>
                      {isAppActive('/services-ia/tarifs') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                  </div>

                  {/* Pôle Productivité Mobile */}
                  <div className={`p-3.5 bg-white rounded-2xl border shadow-sm space-y-2 transition-all ${
                    isPoleActive('productivite') ? 'border-sky-300 ring-2 ring-sky-200/80 bg-sky-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 text-xs uppercase block tracking-wider">Productivité</span>
                      {isPoleActive('productivite') && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-900 rounded-full font-bold border border-sky-300">
                          Pôle Actif
                        </span>
                      )}
                    </div>
                    <Link to="/services-ia/resume-documents" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/resume-documents') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Résumeur de Documents IA (PDF/DOCX)</span>
                      {isAppActive('/services-ia/resume-documents') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/comptes-rendus" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/comptes-rendus') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Comptes-Rendus de Réunions IA</span>
                      {isAppActive('/services-ia/comptes-rendus') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/assistant-email" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/assistant-email') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Assistant Email IA</span>
                      {isAppActive('/services-ia/assistant-email') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                  </div>

                  {/* Pôle Ventes Mobile */}
                  <div className={`p-3.5 bg-white rounded-2xl border shadow-sm space-y-2 transition-all ${
                    isPoleActive('ventes') ? 'border-sky-300 ring-2 ring-sky-200/80 bg-sky-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 text-xs uppercase block tracking-wider">Ventes</span>
                      {isPoleActive('ventes') && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-900 rounded-full font-bold border border-sky-300">
                          Pôle Actif
                        </span>
                      )}
                    </div>
                    <Link to="/services-ia/generateur-leads" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/generateur-leads') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Générateur de Leads B2B</span>
                      {isAppActive('/services-ia/generateur-leads') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/prepa-reunion" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/prepa-reunion') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Préparation de Rendez-vous IA</span>
                      {isAppActive('/services-ia/prepa-reunion') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/prospection-email" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/prospection-email') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Emails de Prospection IA</span>
                      {isAppActive('/services-ia/prospection-email') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                  </div>

                  {/* Pôle Marketing Mobile */}
                  <div className={`p-3.5 bg-white rounded-2xl border shadow-sm space-y-2 transition-all ${
                    isPoleActive('marketing') ? 'border-sky-300 ring-2 ring-sky-200/80 bg-sky-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-600 text-xs uppercase block tracking-wider">Marketing</span>
                      {isPoleActive('marketing') && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-900 rounded-full font-bold border border-sky-300">
                          Pôle Actif
                        </span>
                      )}
                    </div>
                    <Link to="/services-ia/generateur-contenu" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/generateur-contenu') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Générateur de Contenu Multi-Canal</span>
                      {isAppActive('/services-ia/generateur-contenu') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/marketing-communication" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/marketing-communication') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Slogans & Pitchs Commerciaux</span>
                      {isAppActive('/services-ia/marketing-communication') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                  </div>

                  {/* Pôle Audit & ROI Mobile */}
                  <div className={`p-3.5 bg-white rounded-2xl border shadow-sm space-y-2 transition-all ${
                    isPoleActive('audit-roi') ? 'border-sky-300 ring-2 ring-sky-200/80 bg-sky-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-violet-600 text-xs uppercase block tracking-wider">Audit & ROI</span>
                      {isPoleActive('audit-roi') && (
                        <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-900 rounded-full font-bold border border-sky-300">
                          Pôle Actif
                        </span>
                      )}
                    </div>
                    <Link to="/services-ia/diagnostic" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/diagnostic') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Diagnostic IA Express</span>
                      {isAppActive('/services-ia/diagnostic') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/calc-roi" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/calc-roi') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Calculateur de ROI IA</span>
                      {isAppActive('/services-ia/calc-roi') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                    <Link to="/services-ia/benchmark" onClick={() => setOpen(false)} className={`block py-1.5 px-2.5 rounded-xl font-medium transition-all ${isAppActive('/services-ia/benchmark') ? 'bg-sky-100 text-sky-950 font-extrabold border border-sky-300 flex items-center justify-between' : 'text-slate-700 hover:text-blue-600'}`}>
                      <span>Benchmark Sectoriel</span>
                      {isAppActive('/services-ia/benchmark') && <span className="text-[9px] px-1.5 py-0.2 bg-sky-200 text-sky-900 rounded font-black">Actif</span>}
                    </Link>
                  </div>
                </div>

                {/* Bouton retour Accueil Principal */}
                <Link 
                  to="/" 
                  onClick={() => setOpen(false)}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-center font-bold text-xs text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
                >
                  <ArrowRight size={14} className="rotate-180" /> Retour au site principal M.DIV
                </Link>
              </div>
            ) : (
              /* Liens du site principal classique */
              <div className="space-y-1">
                {mainNavKeys.map((n) => (
                  <NavLink 
                    key={n.to} 
                    to={n.to} 
                    end={n.to === "/"} 
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => {
                      const activeColor = "text-primary font-bold";
                      const inactiveColor = "text-foreground/80 hover:text-primary";
                      return `block text-sm uppercase tracking-[0.2em] py-2.5 border-b border-foreground/5 ${isActive ? activeColor : inactiveColor}`;
                    }}
                  >
                    {n.key.startsWith("nav.") ? (n.labelFr ? (language === 'en' ? n.labelEn : n.labelFr) : t(n.key)) : n.key}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
