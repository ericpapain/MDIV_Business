import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { EnterpriseAuthBar } from "@/components/site/EnterpriseAuthBar";
import { iaCategories, iaJourney } from "@/data/servicesIAData";
import { ArrowRight, Sparkles, Zap, ChevronRight, Star, LayoutGrid, CreditCard, Route, ArrowDown, Search, Target, Users, Rocket, Quote, Cpu, ChevronDown, Settings, FileText, Building2, LogOut, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import Countdown from "@/components/ui/Countdown";
import { FintechPricingTab } from "@/components/fintech/FintechPricingTab";

const AnimatedJourneyWidget = () => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % iaJourney.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const iconMap: Record<string, any> = { Search, Target, Zap, Users, Rocket };
  const stepColors = [
    "hsl(42, 65%, 45%)", // Or foncé
    "hsl(42, 65%, 45%)",
    "hsl(42, 65%, 45%)",
    "hsl(42, 65%, 45%)",
    "hsl(42, 65%, 45%)"
  ];
  const interiorColors = [
    "hsl(42, 55%, 56%)",   // Gold
    "hsl(221, 83%, 53%)",  // Blue
    "hsl(280, 70%, 60%)",  // Purple
    "hsl(150, 60%, 45%)",  // Green
    "hsl(350, 70%, 60%)"   // Rose
  ];
  const currentColor = stepColors[currentStepIndex];

  return (
    <div className="w-full">
      {/* Mobile Journey View: Fluid vertical step cards */}
      <div className="lg:hidden w-full space-y-3 py-2">
        <h3 className="text-xl font-bold text-center mb-4 gold-text" style={{ fontFamily: "'Inter', sans-serif" }}>
          {isEn ? "Your Modular Journey" : "Votre Parcours Modulaire"}
        </h3>
        <div className="space-y-2">
          {iaJourney.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors bg-slate-900 ${
                  isCurrent ? 'border-gold/70' : 'border-slate-800'
                }`}
              >
                <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${
                  isCurrent ? 'border-gold text-gold' : 'border-slate-600 text-slate-400'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 break-words">
                  <div className="font-semibold text-sm text-white leading-snug">
                    {isEn ? step.stepEn : step.step}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {isEn ? step.descEn : step.desc}
                  </div>
                  {isCurrent && (
                    <div className="mt-2 text-xs text-gold leading-snug">
                      {isEn ? step.roiEn : step.roi}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop S-Curve Snake Journey */}
      <div className="hidden lg:block relative w-full h-[450px] lg:h-[500px] group bg-transparent">
        <div className="relative z-10 p-2 md:p-4 flex flex-col h-full w-full">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6" style={{ color: "hsl(42 55% 56%)", fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Your Modular Journey" : "Votre Parcours Modulaire"}
          </h3>
          
          <div className="absolute inset-0 top-16 pointer-events-none">
            {/* SVG S-Curve (Snaking 3 times) */}
            <svg className="w-full h-full text-slate-500/30" viewBox="0 0 500 500" preserveAspectRatio="none">
               {/* Base path */}
               <path d="M 125 75 L 375 75 A 50 50 0 0 1 375 175 L 125 175 A 50 50 0 0 0 125 275 L 375 275 A 50 50 0 0 1 375 375 L 125 375" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="8,8" />
               {/* Animated active path */}
               <path 
                 d="M 125 75 L 375 75 A 50 50 0 0 1 375 175 L 125 175 A 50 50 0 0 0 125 275 L 375 275 A 50 50 0 0 1 375 375 L 125 375" 
                 fill="none" 
                 stroke={currentColor}
                 strokeWidth="4"
                 strokeLinecap="round"
                 className="transition-all duration-1000 ease-out"
                 strokeDasharray="1471"
                 strokeDashoffset={1471 - [0, 250, 657, 1064, 1471][currentStepIndex]}
               />
            </svg>

            {/* Nodes placed over the path */}
            {iaJourney.map((step, idx) => {
              const Icon = iconMap[step.icon];
              const nodesPos = [
                { left: "25%", top: "15%", align: "left" },
                { left: "75%", top: "15%", align: "right" },
                { left: "25%", top: "35%", align: "left" },
                { left: "75%", top: "55%", align: "right" },
                { left: "25%", top: "75%", align: "left" },
              ];
              const pos = nodesPos[idx];
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const nodeColor = isActive ? stepColors[idx] : "transparent";
              const interiorColor = isActive ? interiorColors[idx] : "transparent";
              
              return (
                <div 
                  key={step.id} 
                  className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ left: pos.left, top: pos.top }}
                >
                  {/* Node Icon - Creative dark/glow design */}
                  <div 
                    className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 ${
                      isActive ? 'text-white scale-110' : 'bg-slate-900/80 border-white/10 text-white/30 scale-100 backdrop-blur-md'
                    }`}
                    style={{
                      backgroundColor: isActive ? interiorColor : undefined,
                      borderColor: isActive ? nodeColor : undefined,
                      boxShadow: isActive ? `0 0 25px ${interiorColor}80, inset 0 0 10px ${interiorColor}40` : 'none'
                    }}
                  >
                    {Icon && <Icon size={24} className={isCurrent ? "animate-pulse" : ""} style={{ color: isActive ? "white" : undefined }} />}
                    {isCurrent && (
                      <div 
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ backgroundColor: interiorColor }}
                      />
                    )}
                  </div>
                  
                  {/* Tooltip / Text for the step - Placed strictly OUTSIDE the snake loops to never overlap */}
                  <div className={`absolute w-36 md:w-48 transition-all duration-500 ${pos.align === 'left' ? 'right-full mr-4 md:mr-6 text-right' : 'left-full ml-4 md:ml-6 text-left'} ${isActive ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                    <div className="font-bold text-sm md:text-base leading-tight ia-gradient-text drop-shadow-sm">
                      {isEn ? step.stepEn : step.step}
                    </div>
                    {isCurrent && (
                      <div className={`mt-2 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-md border animate-fade-up shadow-xl inline-block text-white ${pos.align === 'left' ? 'ml-auto' : 'mr-auto'}`} style={{ backgroundColor: interiorColor, borderColor: nodeColor, boxShadow: `0 0 15px ${interiorColor}60` }}>
                        ROI: {isEn ? step.roiEn : step.roi}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ServicesIA() {
  const { t, language } = useLanguage();
  const { company, isAuthenticated, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isEn = language === "en";

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab') || searchParams.get('section');
    if (tabParam === 'tarification' || tabParam === 'tarifs' || tabParam === 'pricing' || location.hash === '#tarification' || location.hash === '#tarifs') return 'tarification';
    if (tabParam === 'parcours' || location.hash === '#parcours') return 'parcours';
    return 'solutions';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; tab: 'profile' | 'reports' }>({
    isOpen: false,
    tab: 'profile'
  });

  const tabsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || searchParams.get('section');
    if (tabParam === 'tarification' || tabParam === 'tarifs' || tabParam === 'pricing' || location.hash === '#tarification' || location.hash === '#tarifs') {
      setActiveTab('tarification');
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (tabParam === 'parcours' || location.hash === '#parcours') {
      setActiveTab('parcours');
    }
  }, [searchParams, location.hash]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToTabs = (tab?: string) => {
    if (tab) {
      setActiveTab(tab);
      if (tab === 'tarification') {
        setSearchParams({ tab: 'tarification' });
      } else {
        setSearchParams({});
      }
    }
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const tabs = [
    {
      id: 'solutions',
      label: isEn ? "AI Solutions" : "Solutions IA",
      icon: LayoutGrid,
      desc: isEn ? "8 categories of tools" : "8 catégories d'outils",
    },
    {
      id: 'tarification',
      label: isEn ? "Pricing" : "Tarification",
      icon: CreditCard,
      desc: isEn ? "Simple & transparent" : "Simple & transparente",
    },
    {
      id: 'parcours',
      label: isEn ? "Journey & Story" : "Parcours & Approche",
      icon: Route,
      desc: isEn ? "Our vision on AI" : "Notre vision de l'IA",
    },
  ];

  return (
    <div className="ia-page min-h-screen">
      {/* HERO — asymmetric layout */}
      <section className="relative pt-12 pb-8 lg:pt-16 lg:pb-10 overflow-hidden">
        <div className="absolute inset-0 ia-gradient-hero-subtle" />
        {/* Decorative shapes — unique to M.DIV */}
        <div className="absolute top-12 right-[10%] w-72 h-72 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "radial-gradient(circle, hsl(42 55% 56%), transparent 70%)" }} />
        <div className="absolute -bottom-20 left-[5%] w-96 h-96 rounded-full opacity-[0.05] blur-[100px]" style={{ background: "radial-gradient(circle, hsl(221 83% 53%), transparent 70%)" }} />
        {/* Subtle gold line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 10%, hsl(42 55% 56% / 0.4) 50%, transparent 90%)" }} />

        <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[40%_60%] gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="relative z-20">
              <div className="hidden items-center gap-2 px-4 py-2 rounded-lg mb-5 text-xs font-semibold uppercase tracking-wider" style={{ background: "hsl(42 55% 56% / 0.1)", color: "hsl(42 55% 56%)", border: "1px solid hsl(42 55% 56% / 0.25)", display: "inline-flex" }}>
                <Sparkles size={13} /> M.DIV · AI Platform
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? (
                  <>Intelligent tools,<br /><span className="ia-gradient-text">tailored</span> to your business</>
                ) : (
                  <>Des outils intelligents,<br /><span className="ia-gradient-text">taillés</span> pour votre activité</>
                )}
              </h1>

              <p className="text-base md:text-lg max-w-lg mb-7 leading-relaxed" style={{ color: "#334155" }}>
                {isEn
                  ? "Save time, automate your tasks and grow your business with AI solutions accessible to SMBs, startups and entrepreneurs."
                  : "Gagnez du temps, automatisez vos tâches et développez votre activité grâce à des solutions IA accessibles aux PME, TPE, startups et entreprises."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => scrollToTabs('solutions')} className="ia-btn-primary text-sm px-6 py-3 group">
                  {isEn ? "Discover the apps" : "Découvrir les applications"}
                  <ArrowDown size={14} className="group-hover:translate-y-1 transition-transform" />
                </button>
                <Link to="/services-ia/diagnostic" className="ia-btn-secondary text-sm px-6 py-3">
                  {isEn ? "Free AI diagnostic" : "Diagnostic gratuit"}
                  <Zap size={14} />
                </Link>
              </div>
            </div>

            {/* Right: Interactive Journey Animation */}
            <div className="hidden lg:flex items-center justify-center w-full min-w-[350px] relative z-20">
              <AnimatedJourneyWidget />
            </div>
          </div>

          {/* Mobile Interactive Journey Animation */}
          <div className="flex lg:hidden justify-center mt-10">
            <AnimatedJourneyWidget />
          </div>
        </div>
      </section>

      {/* ── TAB NAVIGATION — big & prominent ── */}
      <div ref={tabsRef} className="scroll-mt-24">
        <section className="container max-w-5xl mx-auto pt-6 pb-4">
          {/* Decorative gold hairline */}
          <div className="h-px mb-8" style={{ background: "linear-gradient(90deg, transparent, hsl(42 55% 56% / 0.35), transparent)" }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 group cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-br from-[hsl(221,83%,53%)] to-[hsl(263,70%,50%)] text-foreground shadow-xl shadow-blue-500/20 scale-[1.02]"
                      : "bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-foreground/20"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                  }`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base mb-0.5 ${isActive ? "text-foreground" : "text-slate-800"}`}>
                      {tab.label}
                    </div>
                    <div className={`text-xs ${isActive ? "text-foreground/70" : "text-muted-foreground"}`}>
                      {tab.desc}
                    </div>
                  </div>
                  <ChevronRight size={18} className={`shrink-0 transition-transform ${
                    isActive ? "text-foreground/60 translate-x-0" : "text-muted-foreground -translate-x-1 group-hover:translate-x-0 group-hover:text-blue-400"
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Small hint below tabs */}
          <p className="text-center text-xs mt-4" style={{ color: "hsl(215 16% 60%)" }}>
            {isEn ? "↑ Click a tab to explore each section" : "↑ Cliquez sur un onglet pour explorer chaque section"}
          </p>
        </section>
      </div>

      {/* ── SOLUTIONS IA ── */}
      {activeTab === 'solutions' && (
      <section id="solutions" className="container max-w-6xl mx-auto py-10 ia-animate-in">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-10 rounded-full ia-gradient-hero" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? "Our AI Solutions" : "Nos Solutions IA"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "hsl(215 16% 47%)" }}>
              {isEn
                ? "8 categories of tools and services to accelerate your digital transformation."
                : "8 catégories d'outils et services pour accélérer votre transformation digitale."}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {iaCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const freeCount = cat.apps.filter(a => a.tier === "free").length;
            const premiumCount = cat.apps.filter(a => a.tier === "premium").length;
            
            const earliestDateStr = cat.apps.reduce((earliest, app) => {
              if (app.href || !app.releaseDate) return earliest;
              if (!earliest) return app.releaseDate;
              return new Date(app.releaseDate) < new Date(earliest) ? app.releaseDate : earliest;
            }, undefined as string | undefined);

            const hasActiveApps = cat.apps.some(a => !!a.href);

            return (
              <Link
                key={cat.id}
                to={`/services-ia/${cat.slug}`}
                className={`ia-card relative overflow-hidden p-7 flex flex-col group transition-all duration-300 ${hasActiveApps ? 'hover:shadow-lg hover:border-[hsl(221,83%,53%)]/30' : 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100'}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Decorative background icon in bottom right */}
                <div className="ia-watermark-anim absolute -bottom-6 -right-6 w-32 h-32 group-hover:opacity-[0.08] transition-all pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: `${idx * 0.2}s` }}>
                  <Icon size={128} />
                </div>
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl ia-gradient-hero flex items-center justify-center text-foreground ia-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                    <Icon size={22} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {earliestDateStr ? (
                      <div className="bg-white/80 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-border shadow-sm">
                        <Countdown targetDate={earliestDateStr} />
                      </div>
                    ) : hasActiveApps ? (
                      <span className="ia-badge bg-[hsl(221,83%,53%)]/10 text-[hsl(221,83%,53%)] border-[hsl(221,83%,53%)]/20 text-[10px] font-bold">
                        {isEn ? "Available" : "Disponible"}
                      </span>
                    ) : (
                      <span className="ia-badge bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold">
                        {isEn ? "Coming soon" : "Arrive bientôt"}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-2 group-hover:text-[hsl(221,83%,53%)] transition-colors relative z-10" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isEn ? cat.nameEn : cat.name}
                </h3>
                <p className="text-sm mb-4 leading-relaxed flex-1 relative z-10" style={{ color: "hsl(215 16% 47%)" }}>
                  {isEn ? cat.descEn : cat.desc}
                </p>

                <div className="flex items-center gap-3 text-xs mb-4 relative z-10">
                  <span className="ia-badge ia-badge-free">{freeCount} {isEn ? "Free" : "Gratuit"}</span>
                  <span className="ia-badge ia-badge-premium">{premiumCount} Premium</span>
                </div>

                <div className="flex items-center gap-1 text-sm font-semibold text-[hsl(221,83%,53%)] group-hover:gap-2 transition-all mt-auto relative z-10">
                  {isEn ? "Discover" : "Découvrir"} <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Decorative separator */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(221 83% 53% / 0.15), transparent)" }} />
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: "hsl(221 83% 53% / 0.3)" }} />
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "hsl(215 16% 65%)" }}>{isEn ? "More categories" : "Plus de catégories"}</span>
            <Sparkles size={14} style={{ color: "hsl(221 83% 53% / 0.3)" }} />
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(221 83% 53% / 0.15), transparent)" }} />
        </div>
      </section>
      )}

      {/* ── TARIFICATION (IT4ALL 2026) ── */}
      {activeTab === 'tarification' && (
      <section className="container max-w-7xl mx-auto py-6 ia-animate-in">
        <FintechPricingTab />
      </section>
      )}

      {/* ── PARCOURS CLIENT & TEMOIGNAGES ── */}
      {activeTab === 'parcours' && (
      <div className="ia-animate-in">
        <section className="container max-w-3xl mx-auto py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-10 rounded-full ia-gradient-hero" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? "Your journey to AI" : "Votre parcours vers l'IA"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "hsl(215 16% 47%)" }}>
              {isEn
                ? "A progressive path from first diagnostic to full digital transformation."
                : "Un chemin progressif, du premier diagnostic à la transformation digitale complète."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {iaJourney.map((step, i) => {
            const iconMap: Record<string, any> = { Search, Target, Zap, Users, Rocket };
            const Icon = iconMap[step.icon];
            
            return (
              <div key={step.id} className="ia-journey-step ia-animate-in relative" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="absolute left-[27px] top-10 bottom-[-24px] w-0.5 bg-gradient-to-b from-border to-transparent" />
                <div className="ia-card p-6 flex flex-col md:flex-row gap-6 relative z-10 hover:border-gold/30 transition-colors">
                  <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-foreground ia-gradient-hero shadow-lg border border-white/10">
                    {Icon ? <Icon size={24} /> : <div className="font-bold text-xl">{i + 1}</div>}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {i + 1}. {isEn ? step.stepEn : step.step}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "hsl(215 16% 65%)" }}>
                      {isEn ? step.descEn : step.desc}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-semibold" style={{ background: "hsl(221 83% 53% / 0.1)", borderColor: "hsl(221 83% 53% / 0.2)", color: "hsl(221 83% 65%)" }}>
                      <Zap size={14} style={{ color: "hsl(42 55% 56%)" }} />
                      <span>{isEn ? "KPI / ROI Validation" : "Validation KPI / ROI"} : {isEn ? step.roiEn : step.roi}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Storytelling Block / Conviction */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center relative py-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(221,83%,53%)]/5 to-transparent blur-xl pointer-events-none group-hover:via-[hsl(221,83%,53%)]/10 transition-colors duration-1000" />
          
          {/* Creative Objects: Interactive Neural Core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full pointer-events-none opacity-20 group-hover:opacity-70 transition-opacity duration-1000">
            <motion.div 
              animate={{ rotate: 180 }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[280px] h-[280px] rounded-full border border-[hsl(42,55%,56%)]/30 border-dashed" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Cpu className="text-[hsl(221,83%,53%)] w-32 h-32 group-hover:scale-125 group-hover:text-[hsl(42,55%,56%)] transition-all duration-700 ease-out" strokeWidth={0.5} />
            </motion.div>
            <motion.div 
              animate={{ y: [20, -20, 20], opacity: [0.2, 0.8, 0.2] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[25%] text-[hsl(42,55%,56%)] font-mono text-xs font-bold"
            >
              10110
            </motion.div>
            <motion.div 
              animate={{ y: [-20, 20, -20], opacity: [0.1, 0.6, 0.1] }} 
              transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[30%] right-[20%] text-[hsl(221,83%,53%)] font-mono text-xs font-bold"
            >
              01001
            </motion.div>
          </div>

          <h2 className="text-2xl mb-8 relative z-10 text-foreground font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Our " : "Notre "}
            <span style={{ color: "hsl(42 55% 56%)" }}>{isEn ? "Vision" : "conviction"}</span>
          </h2>
          
          <div className="text-base md:text-lg italic text-muted-foreground leading-relaxed relative z-10 p-8 rounded-3xl bg-background/40 backdrop-blur-md border border-white/5 group-hover:border-[hsl(42,55%,56%)]/30 group-hover:shadow-[0_0_40px_rgba(205,167,81,0.1)] transition-all duration-700 max-w-4xl mx-auto">
            <span className="text-[hsl(221,83%,53%)]/20 group-hover:text-[hsl(221,83%,53%)]/50 text-6xl absolute -top-4 -left-4 font-bold transition-colors duration-700">"</span>
            {isEn 
              ? "Artificial Intelligence should not be an intimidating 'black box' nor an overpriced turnkey factory. At BNE, we know that innovation only makes sense if it serves humans and profitability. That's why we refuse imposed off-the-shelf solutions. Our philosophy? Custom AI, introduced module by module. We move at your pace: we identify, deploy, validate the Return on Investment (ROI), and train your teams. No leap of faith, just a smooth and measured transition towards the company of tomorrow."
              : "L'Intelligence Artificielle ne doit pas être une \"boîte noire\" intimidante ni une usine à gaz hors de prix. Chez BNE, nous savons que l'innovation n'a de sens que si elle sert l'humain et la rentabilité. C'est pourquoi nous refusons les solutions clés en main imposées. Notre philosophie ? L'IA sur-mesure, introduite module par module. Nous avançons à votre rythme : on identifie, on déploie, on valide le retour sur investissement (ROI), et on forme vos équipes. Pas de saut dans le vide, juste une transition fluide et mesurée vers l'entreprise de demain."}
            <span className="text-[hsl(221,83%,53%)]/20 group-hover:text-[hsl(221,83%,53%)]/50 text-6xl absolute -bottom-8 -right-4 rotate-180 font-bold transition-colors duration-700">"</span>
          </div>
          
          <p className="mt-10 tracking-[0.2em] uppercase text-xs font-bold relative z-10 group-hover:tracking-[0.3em] transition-all duration-700" style={{ color: "hsl(221 83% 53% / 0.8)" }}>
            {isEn ? "The customized AI philosophy by BNE" : "La philosophie IA sur-mesure par BNE"}
          </p>
        </motion.div>
      </section>

      <div className="ia-section-divider max-w-5xl mx-auto" />

      {/* TEMOIGNAGES — Coming soon */}
      <section className="container max-w-5xl mx-auto py-16">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-10 rounded-full ia-gradient-hero" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? "They trust us" : "Ils nous font confiance"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "hsl(215 16% 47%)" }}>
              {isEn ? "Testimonials and partner logos coming soon." : "Témoignages et logos partenaires à venir."}
            </p>
          </div>
        </div>

        <div className="ia-card p-12 md:p-16 text-center opacity-60">
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, j) => (
              <Star key={j} size={18} fill="hsl(215 16% 80%)" color="hsl(215 16% 80%)" />
            ))}
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "hsl(215 16% 40%)" }}>
            {isEn ? "Reviews & Partners" : "Avis & Partenaires"}
          </h3>
          <p className="text-sm italic" style={{ color: "hsl(215 16% 55%)" }}>
            {isEn ? "Coming soon" : "Arrive bientôt"}
          </p>
        </div>
      </section>
      </div>
      )}

      {/* CTA FINAL */}
      <section className="py-8">
        <div className="container max-w-4xl mx-auto">
          <div className="relative rounded-2xl p-6 md:p-10 text-center text-foreground overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(221 83% 48%) 0%, hsl(263 60% 42%) 50%, hsl(42 45% 40%) 100%)" }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            {/* Gold accent corner */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-20 blur-[60px]" style={{ background: "hsl(42 55% 56%)" }} />
            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Ready to transform your business?" : "Prêt à transformer votre entreprise ?"}
              </h2>
              <p className="text-sm opacity-90 mb-5 max-w-lg mx-auto">
                {isEn
                  ? "Start your free AI diagnostic and discover your company's potential."
                  : "Commencez votre diagnostic IA gratuit et découvrez le potentiel de votre entreprise."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/services-ia/diagnostic" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[hsl(221,83%,53%)] font-bold rounded-xl hover:bg-foreground/90 transition-all shadow-lg text-sm">
                  {isEn ? "Start free diagnostic" : "Démarrer le diagnostic gratuit"}
                  <ArrowRight size={14} />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground/15 backdrop-blur-sm text-foreground font-semibold rounded-xl border border-border/30 hover:bg-foreground/25 transition-all text-sm">
                  {isEn ? "Contact us" : "Nous contacter"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserProfileModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        defaultTab={modalState.tab}
      />
    </div>
  );
}
