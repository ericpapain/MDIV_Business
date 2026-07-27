import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { iaCategories, iaJourney } from "@/data/servicesIAData";
import { ArrowRight, Sparkles, Zap, ChevronRight, Star, LayoutGrid, CreditCard, Route, ArrowDown } from "lucide-react";

export default function ServicesIA() {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState('solutions');
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = (tab?: string) => {
    if (tab) setActiveTab(tab);
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
      label: isEn ? "Journey & Reviews" : "Parcours & Avis",
      icon: Route,
      desc: isEn ? "Steps & testimonials" : "Étapes & témoignages",
    },
  ];

  return (
    <div className="ia-page min-h-screen">
      {/* HERO — asymmetric layout */}
      <section className="relative pt-24 pb-14 overflow-hidden">
        <div className="absolute inset-0 ia-gradient-hero-subtle" />
        {/* Decorative shapes — unique to M.DIV */}
        <div className="absolute top-12 right-[10%] w-72 h-72 rounded-full opacity-[0.07] blur-[80px]" style={{ background: "radial-gradient(circle, hsl(42 55% 56%), transparent 70%)" }} />
        <div className="absolute -bottom-20 left-[5%] w-96 h-96 rounded-full opacity-[0.05] blur-[100px]" style={{ background: "radial-gradient(circle, hsl(221 83% 53%), transparent 70%)" }} />
        {/* Subtle gold line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 10%, hsl(42 55% 56% / 0.4) 50%, transparent 90%)" }} />

        <div className="container relative z-10 max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
            {/* Left: Text */}
            <div>
              <div className="hidden items-center gap-2 px-4 py-2 rounded-lg mb-5 text-xs font-semibold uppercase tracking-wider" style={{ background: "hsl(42 55% 56% / 0.1)", color: "hsl(42 55% 56%)", border: "1px solid hsl(42 55% 56% / 0.25)" }}>
                <Sparkles size={13} /> M.DIV · AI Platform
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? (
                  <>Intelligent tools,<br /><span className="ia-gradient-text">tailored</span> to your business</>
                ) : (
                  <>Des outils intelligents,<br /><span className="ia-gradient-text">taillés</span> pour votre activité</>
                )}
              </h1>

              <p className="text-base md:text-lg max-w-lg mb-7 leading-relaxed" style={{ color: "hsl(215 16% 47%)" }}>
                {isEn
                  ? "Save time, automate your tasks and grow your business with AI solutions accessible to SMBs and freelancers."
                  : "Gagnez du temps, automatisez vos tâches et développez votre activité grâce à des solutions IA accessibles aux PME, TPE et artisans."}
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

            {/* Right: Coming soon KPI placeholder */}
            <div className="hidden lg:flex items-center justify-center max-w-xs">
              <div className="ia-card p-8 text-center opacity-60">
                <div className="text-lg font-bold mb-2" style={{ color: "hsl(215 16% 47%)" }}>{isEn ? "Key metrics" : "Chiffres clés"}</div>
                <div className="text-sm italic" style={{ color: "hsl(215 16% 60%)" }}>{isEn ? "Coming soon" : "Arrive bientôt"}</div>
              </div>
            </div>
          </div>

          {/* Mobile Coming soon KPI */}
          <div className="flex lg:hidden justify-center mt-10">
            <div className="ia-card p-6 text-center opacity-60">
              <div className="text-base font-bold mb-1" style={{ color: "hsl(215 16% 47%)" }}>{isEn ? "Key metrics" : "Chiffres clés"}</div>
              <div className="text-sm italic" style={{ color: "hsl(215 16% 60%)" }}>{isEn ? "Coming soon" : "Arrive bientôt"}</div>
            </div>
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
            return (
              <Link
                key={cat.id}
                to={`/services-ia/${cat.slug}`}
                className="ia-card relative overflow-hidden p-7 flex flex-col group opacity-75 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100"
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
                  <div className="flex gap-1.5">
                    <span className="ia-badge bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold">
                      {isEn ? "Coming soon" : "Arrive bientôt"}
                    </span>
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

      {/* ── TARIFICATION ── */}
      {activeTab === 'tarification' && (
      <section className="container max-w-4xl mx-auto py-10 ia-animate-in">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-10 rounded-full ia-gradient-hero" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? "Simple, transparent pricing" : "Tarification simple et transparente"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "hsl(215 16% 47%)" }}>
              {isEn
                ? "Start for free, upgrade when you need to."
                : "Commencez gratuitement, évoluez selon vos besoins."}
            </p>
          </div>
        </div>

        <div className="ia-card p-12 md:p-16 text-center opacity-75">
          <div className="w-16 h-16 rounded-2xl ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-6 opacity-60">
            <CreditCard size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "'Inter', sans-serif", color: "hsl(215 16% 35%)" }}>
            {isEn ? "Pricing coming soon" : "Tarification à venir"}
          </h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "hsl(215 16% 55%)" }}>
            {isEn
              ? "We are finalizing our pricing plans. Contact us for early access and special launch rates."
              : "Nous finalisons nos offres tarifaires. Contactez-nous pour un accès anticipé et des tarifs de lancement."}
          </p>
          <Link to="/contact" className="ia-btn-primary text-sm px-8 py-3 mx-auto">
            {isEn ? "Contact us" : "Nous contacter"}
            <ArrowRight size={14} />
          </Link>
        </div>
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
          {iaJourney.map((j, i) => (
            <div key={i} className="ia-journey-step ia-animate-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="ia-journey-dot" />
              <div className="ia-card p-5 flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-foreground ia-gradient-hero">{i + 1}</div>
                  <span className="font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>{isEn ? j.stepEn : j.step}</span>
                </div>
                <ChevronRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "hsl(221 83% 53%)" }} />
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
