import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { iaCategories } from "@/data/servicesIAData";
import { ArrowLeft, ArrowRight, Check, Sparkles, Lock, Calendar, Users, Clock, ChevronRight } from "lucide-react";
import Countdown from "@/components/ui/Countdown";

export default function ServicesIACategory() {
  const { category } = useParams<{ category: string }>();
  const { language } = useLanguage();
  const isEn = language === "en";

  const cat = iaCategories.find(c => c.slug === category);

  if (!cat) {
    return (
      <div className="ia-page min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{isEn ? "Category not found" : "Catégorie introuvable"}</h1>
          <Link to="/services-ia" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[hsl(221,83%,53%)] font-semibold rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:-translate-x-1 transition-all text-sm group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
          </Link>
        </div>
      </div>
    );
  }

  const Icon = cat.icon;
  const freeApps = cat.apps.filter(a => a.tier === "free");
  const premiumApps = cat.apps.filter(a => a.tier === "premium");
  const isMarketplace = cat.id === "marketplace";
  const isAcademie = cat.id === "academie";

  return (
    <div className="ia-page min-h-screen">
      {/* HERO */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 ia-gradient-hero-subtle" />
        <div className="container relative z-10 max-w-5xl mx-auto">
          <Link to="/services-ia" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground/80 backdrop-blur-md text-[hsl(221,83%,53%)] font-semibold rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:bg-white hover:-translate-x-1 transition-all mb-8 text-sm group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isEn ? "All AI Solutions" : "Toutes les Solutions IA"}
          </Link>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl ia-gradient-hero flex items-center justify-center text-foreground shrink-0 ia-float">
              <Icon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {isEn ? cat.nameEn : cat.name}
                </h1>
                {cat.badge && <span className="ia-badge ia-badge-new">{isEn ? cat.badgeEn : cat.badge}</span>}
              </div>
              <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "hsl(215 16% 47%)" }}>
                {isEn ? cat.descEn : cat.desc}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <span className="ia-badge ia-badge-free text-xs">{freeApps.length} {isEn ? "Free" : "Gratuit"}</span>
            <span className="ia-badge ia-badge-premium text-xs">{premiumApps.length} Premium</span>
            <span className="ia-badge ia-badge-freemium text-xs">{cat.apps.length} {isEn ? "Total apps" : "Applications au total"}</span>
          </div>
        </div>
      </section>

      {/* FREE APPS */}
      <section className="container max-w-5xl mx-auto py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(160 84% 39%)" }} />
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Free Applications" : "Applications Gratuites"}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {freeApps.map((app, i) => (
            <div key={app.id} className="ia-card relative overflow-hidden p-6 flex flex-col ia-animate-in opacity-75 grayscale cursor-not-allowed hover:grayscale-0 hover:opacity-100 transition-all duration-300" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Decorative background icon */}
              <div className="ia-watermark-anim absolute -bottom-6 -right-6 w-32 h-32 opacity-0 group-hover:opacity-[0.08] transition-all pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: `${i * 0.2}s` }}>
                <Icon size={128} />
              </div>
              
              <div className="flex items-start justify-between mb-3 relative z-10">
                <h3 className="font-semibold text-base text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>{isEn ? app.nameEn : app.name}</h3>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="ia-badge ia-badge-free text-[10px]">{isEn ? "Free" : "Gratuit"}</span>
                </div>
              </div>
              <p className="text-sm mb-4 leading-relaxed flex-1 text-muted-foreground relative z-10">
                {isEn ? app.descEn : app.desc}
              </p>
              {app.features && (
                <ul className="space-y-1.5 mb-4 opacity-70 relative z-10">
                  {(isEn ? app.featuresEn : app.features)?.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check size={12} style={{ color: "hsl(160 84% 39%)" }} /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-3 mt-auto relative z-10 w-full">
                {app.releaseDate ? (
                  <>
                    <div className="flex justify-center w-full bg-slate-50/50 rounded-lg py-2 border border-slate-100">
                      <Countdown targetDate={app.releaseDate} />
                    </div>
                    <div className="ia-btn-secondary text-[11px] font-bold tracking-wide py-2.5 px-2 justify-center w-full opacity-70 pointer-events-none">
                      {isEn ? "IN DEVELOPMENT" : "EN DÉVELOPPEMENT"}
                    </div>
                  </>
                ) : (
                  <div className="ia-btn-secondary text-[11px] font-bold tracking-wide py-2.5 px-2 justify-center w-full opacity-70 pointer-events-none">
                    {isEn ? "COMING SOON" : "ARRIVE BIENTÔT"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="ia-section-divider max-w-5xl mx-auto" />

      {/* PREMIUM APPS */}
      <section className="container max-w-5xl mx-auto py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 rounded-full" style={{ background: "hsl(263 70% 50%)" }} />
          <h2 className="text-2xl font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Premium Applications" : "Applications Premium"}
          </h2>
        </div>

        <div className={`grid gap-5 ${isMarketplace ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
          {premiumApps.map((app, i) => (
            <div key={app.id} className={`ia-card relative overflow-hidden p-6 flex flex-col ia-animate-in opacity-95 transition-all duration-300 hover:shadow-lg hover:border-gold/30 ${isMarketplace ? "text-center" : ""}`} style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Decorative background icon */}
              <div className="ia-watermark-anim absolute -bottom-6 -right-6 w-32 h-32 opacity-0 group-hover:opacity-[0.08] transition-all pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: `${(i + freeApps.length) * 0.2}s` }}>
                <Icon size={128} />
              </div>
              
              {isMarketplace && (
                <div className="w-14 h-14 rounded-2xl ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-4 ia-float relative z-10" style={{ animationDelay: `${i * 0.3}s` }}>
                  <Icon size={24} />
                </div>
              )}
              <div className={`flex items-start justify-between mb-3 relative z-10 ${isMarketplace ? "flex-col items-center gap-2" : ""}`}>
                <h3 className="font-semibold text-base text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>{isEn ? app.nameEn : app.name}</h3>
                <div className={`flex flex-col gap-1 shrink-0 ${isMarketplace ? "items-center" : "items-end"}`}>
                  <span className="ia-badge ia-badge-premium text-[10px]">Premium</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{isEn ? "On demand" : "À la demande"}</span>
                </div>
              </div>
              <p className="text-sm mb-4 leading-relaxed flex-1 text-muted-foreground relative z-10">
                {isEn ? app.descEn : app.desc}
              </p>
              {app.features && (
                <ul className="space-y-1.5 mb-4 opacity-70 relative z-10">
                  {(isEn ? app.featuresEn : app.features)?.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-xs text-muted-foreground ${isMarketplace ? "justify-center" : ""}`}>
                      <Check size={12} style={{ color: "hsl(263 70% 50%)" }} /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link 
                to={`/contact?subject=${encodeURIComponent(isEn ? `Premium App Request: ${app.nameEn}` : `Demande d'application Premium : ${app.name}`)}&msg=${encodeURIComponent(isEn ? `Hello,\n\nI am interested in the premium application "${app.nameEn}". Could you please provide me with more information about its deployment on demand?\n\nThank you.` : `Bonjour,\n\nJe suis intéressé par l'application premium "${app.name}". Pouvez-vous me donner plus d'informations sur son déploiement à la demande ?\n\nMerci.`)}`}
                className="ia-btn-primary text-xs py-2.5 px-4 justify-center mt-auto relative z-10 hover:scale-[1.02] transition-transform"
              >
                {isEn ? "On demand" : "À la demande"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ACADEMIE EXTRAS */}
      {isAcademie && (
        <>
          <div className="ia-section-divider max-w-5xl mx-auto" />
          <section className="container max-w-5xl mx-auto py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Upcoming Events" : "Prochains Événements"}
              </h2>
              <p className="text-sm" style={{ color: "hsl(215 16% 47%)" }}>
                {isEn ? "Join our monthly masterclasses and workshops." : "Rejoignez nos masterclass et ateliers mensuels."}
              </p>
            </div>
            <div className="ia-card p-12 md:p-16 text-center opacity-60">
              <Calendar size={32} className="mx-auto mb-4" style={{ color: "hsl(221 83% 53%)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "hsl(215 16% 40%)" }}>
                {isEn ? "Events coming soon" : "Événements à venir"}
              </h3>
              <p className="text-sm italic" style={{ color: "hsl(215 16% 55%)" }}>
                {isEn ? "Coming soon" : "Arrive bientôt"}
              </p>
            </div>
          </section>
        </>
      )}

      {/* FACTURATION EXTRAS */}
      {cat.id === "facturation" && (
        <>
          <div className="ia-section-divider max-w-5xl mx-auto" />
          <section className="container max-w-5xl mx-auto py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Advanced Features" : "Fonctionnalités Avancées"}
              </h2>
            </div>
            <div className="ia-card p-12 md:p-16 text-center opacity-60">
              <Check size={32} className="mx-auto mb-4" style={{ color: "hsl(160 84% 39%)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "hsl(215 16% 40%)" }}>
                {isEn ? "Features coming soon" : "Fonctionnalités à venir"}
              </h3>
              <p className="text-sm italic" style={{ color: "hsl(215 16% 55%)" }}>
                {isEn ? "Coming soon" : "Arrive bientôt"}
              </p>
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-4xl mx-auto">
          <div className="ia-gradient-hero rounded-2xl p-10 md:p-14 text-center text-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Ready to get started?" : "Prêt à vous lancer ?"}
              </h2>
              <p className="opacity-90 mb-6 max-w-md mx-auto">
                {isEn
                  ? "Start with a free diagnostic or contact us for a personalized demo."
                  : "Commencez par un diagnostic gratuit ou contactez-nous pour une démo personnalisée."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/services-ia/diagnostic" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[hsl(221,83%,53%)] font-bold rounded-xl hover:bg-foreground/90 transition-all text-sm">
                  {isEn ? "Free diagnostic" : "Diagnostic gratuit"} <Sparkles size={14} />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3.5 bg-foreground/15 text-foreground font-semibold rounded-xl border border-border/30 hover:bg-foreground/25 transition-all text-sm">
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
