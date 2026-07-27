import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Crown, Users, Target, Diamond, Play, Star, Check, MapPin, ChevronDown } from "lucide-react";
import { images, getOffers, testimonials, getEvents, computeFinalPrice } from "@/data/mockData";
import { SectionHeading } from "@/components/site/SectionHeading";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { EventHero } from "@/components/event/EventHero";
import { ChampagneEvent } from "@/components/event/ChampagneEvent";
import { MembersCarousel } from "@/components/site/MembersCarousel";
import { AboutBNE } from "@/components/site/AboutBNE";

// Vidéo de paysage cinématographique hébergée sur Google Cloud Storage (sans restriction CORS ni hotlinking)
const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

function TestimonialFlag({ type }: { type: string }) {
  const base = "shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-lg border border-border flex";

  if (type === "france") {
    return (
      <div className={base}>
        <div className="flex-1 h-full" style={{ background: "#002395" }} />
        <div className="flex-1 h-full" style={{ background: "#FFFFFF" }} />
        <div className="flex-1 h-full" style={{ background: "#ED2939" }} />
      </div>
    );
  }
  if (type === "suisse") {
    return (
      <div className={base} style={{ background: "#DA291C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="relative w-[40%] h-[40%]">
          <div className="absolute top-1/2 left-0 right-0 h-[25%] bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 bg-white -translate-x-1/2" style={{ width: "25%" }} />
        </div>
      </div>
    );
  }
  if (type === "belgique") {
    return (
      <div className={base}>
        <div className="flex-1 h-full" style={{ background: "#000000" }} />
        <div className="flex-1 h-full" style={{ background: "#FAE042" }} />
        <div className="flex-1 h-full" style={{ background: "#EF3340" }} />
      </div>
    );
  }
  return null;
}

export default function Home() {
  const { t } = useLanguage();
  const [playHomeVideo, setPlayHomeVideo] = useState(false);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [visitCount, setVisitCount] = useState(234);
  const localizedOffers = getOffers(t);

  useEffect(() => {
    fetchReviews();
    incrementVisitCount();
  }, []);

  const incrementVisitCount = async () => {
    if (!supabase) return;
    try {
      // Increment the counter
      const { error: upsertError } = await supabase.rpc('increment_visit_count');
      if (upsertError) {
        // If RPC doesn't exist, try direct read
        const { data } = await supabase
          .from('site_stats')
          .select('visit_count')
          .eq('id', 1)
          .single();
        if (data) setVisitCount(data.visit_count);
        return;
      }
      // Read the updated count
      const { data } = await supabase
        .from('site_stats')
        .select('visit_count')
        .eq('id', 1)
        .single();
      if (data) setVisitCount(data.visit_count);
    } catch (error) {
      console.error('Error with visit counter:', error);
    }
  };

  const fetchReviews = async () => {
    if (!supabase) {
      setDbReviews(testimonials);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      if (data && data.length > 0) {
        setDbReviews(data);
      } else {
        setDbReviews(testimonials); // fallback
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setDbReviews(testimonials); // fallback
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* HEROs */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-16">
        <div className="absolute inset-0">
          <img src={images.hero} alt="Cercle privé d'affaires" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 bg-gradient-to-r w-3/4 from-background via-background/50 to-transparent" />
        </div>

        <div className="container relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <div className="eyebrow mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-gold/60" /> {t("home.hero.eyebrow")}
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight mb-8">
              {t("home.hero.title1")}<br />
              <em className="font-serif italic text-gold-light">{t("home.hero.title2")}</em><br />
              {t("home.hero.title3")} <span className="gold-text">{t("home.hero.title4")}</span>
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl mb-10 leading-relaxed">
              {t("home.hero.desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/experience" className="btn-gold px-8 py-4 text-xs uppercase tracking-[0.24em] rounded-sm flex items-center gap-3 justify-center group">
                {t("home.hero.btn1")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/evenements" className="btn-ghost-gold px-8 py-4 text-xs uppercase tracking-[0.24em] rounded-sm flex items-center gap-3 justify-center">
                {t("home.hero.btn2")}
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-xl">
              {[
                { v: t("home.hero.stat1_val"), l: t("home.hero.stat1_label") },
                { v: t("home.hero.stat2_val"), l: t("home.hero.stat2_label") },
                { v: t("home.hero.stat3_val"), l: t("home.hero.stat3_label") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl gold-text">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
              <div>
                <div className="font-display text-3xl gold-text">{visitCount.toLocaleString('fr-FR')}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{t("home.hero.visits")}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 mt-8 lg:mt-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="glass-strong p-6 rounded-sm relative corner-deco flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="eyebrow flex items-center gap-2 text-primary text-[14px]">
                  <Sparkles size={12} className="animate-pulse-soft" /> {t("home.agenda.eyebrow")}
                </div>
                <div className="text-[18px] uppercase tracking-[0.2em] text-gold/60 border border-gold/20 px-2 py-0.5 rounded-sm">
                  {t("home.agenda.limited")}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {getEvents(t).upcoming.slice(0, 2).map((event: any, idx) => {
                  const day = event.day || event.date.split(" ")[0];
                  const month = event.month || event.date.split(" ").slice(-2)[0].substring(0, 4).toUpperCase();
                  return (
                    <div key={event.id} className="group relative">
                      {idx !== 0 && <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent my-4" />}
                      <div className="flex gap-4 items-start">
                        {/* Bloc Date */}
                        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-sm bg-gold/5 border border-gold/10 group-hover:bg-gold/15 group-hover:border-gold/30 transition-colors duration-500">
                          <span className="text-xl font-display text-gold-light leading-none font-bold">{day}</span>
                          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1 font-semibold">{month}</span>
                        </div>
 
                        {/* Contenu */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          {event.type && (
                            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-light/70 mb-0.5">
                              {event.type}
                            </div>
                          )}
                          <h4 className="font-display text-lg md:text-xl mb-1 truncate text-foreground group-hover:text-gold-light transition-colors duration-300">{event.title}</h4>
                          <div className="text-xs text-muted-foreground mb-3 flex items-start gap-1.5 leading-relaxed">
                            <MapPin size={12} className="text-gold/60 shrink-0 mt-0.5" /> 
                            <span>{event.city}</span>
                          </div>
                          <Link
                            to="/contact"
                            className="text-xs uppercase tracking-[0.2em] text-primary hover:text-gold-light flex items-center gap-1.5 transition-colors w-fit font-medium"
                          >
                            {t("home.agenda.reserve")} <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-60">
          <div className="text-[10px] uppercase tracking-[0.3em]">{t("home.scroll")}</div>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* QUI SOMMES NOUS */}
      <AboutBNE />

      {/* ÉVÉNEMENTS DANS UN MENU DÉROULANT */}
      <section className="container py-10">
        <details className="group bg-white/[0.02] border border-border rounded-md shadow-2xl overflow-hidden backdrop-blur-sm open:bg-white/[0.04] transition-colors duration-500">
          <summary className="flex items-center justify-between cursor-pointer list-none p-6 md:p-8 hover:bg-white/[0.02] transition-colors outline-none">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                <Sparkles className="text-gold w-5 h-5 animate-pulse-soft" />
              </div>
              <h2 className="font-display text-xl md:text-3xl gold-text uppercase tracking-wide">
                {t("home.events_accordion.title")}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center border border-border group-open:rotate-180 transition-transform duration-500">
              <ChevronDown className="text-foreground w-5 h-5" />
            </div>
          </summary>
          <div className="flex flex-col gap-10 p-2 sm:p-4 md:p-6 lg:p-10 border-t border-border animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
            <EventHero />
            <ChampagneEvent />
          </div>
        </details>
      </section>

      {/* PROMESSES */}
      {/* 
      <section className="container py-28">
        <SectionHeading eyebrow={t("home.promises.eyebrow")} title={t("home.promises.title")} sub={t("home.promises.sub")} center />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {[
            { i: Crown, t: t("home.promises.p1_title"), d: t("home.promises.p1_desc") },
            { i: Sparkles, t: t("home.promises.p2_title"), d: t("home.promises.p2_desc") },
            { i: Users, t: t("home.promises.p3_title"), d: t("home.promises.p3_desc") },
            { i: Target, t: t("home.promises.p4_title"), d: t("home.promises.p4_desc") },
          ].map(({ i: Icon, t: title, d }) => (
            <div key={title} className="luxe-card p-7 rounded-sm">
              <div className="w-12 h-12 rounded-sm bg-emerald-deep/50 gold-border flex items-center justify-center mb-5">
                <Icon size={18} className="text-primary" />
              </div>
              <div className="font-display text-xl mb-2">{t}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* OFFRES FEATURED */}
      {/* 
      <section className="container py-28">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <SectionHeading eyebrow={t("home.offers.eyebrow")} title={t("home.offers.title")} />
          <Link to="/offres" className="text-xs uppercase tracking-[0.22em] text-primary hover:text-gold-light flex items-center gap-2 pb-1">
            {t("home.offers.all")} <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {localizedOffers.map((o, idx) => (
            <Link key={o.id} to="/offres" className={`luxe-card rounded-sm overflow-hidden group ${idx === 1 ? "lg:-translate-y-4" : ""}`}>
              <div className="aspect-[4/5] relative overflow-hidden">
                <img src={o.image} alt={o.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                {o.badge && <div className="absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-[0.22em] gold-border bg-emerald-deep/80 text-gold-light rounded-sm">{o.badge}</div>}
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <div className="eyebrow mb-2">{o.tagline.split(" ").slice(0, 4).join(" ")}</div>
                  <div className="font-display text-3xl mb-3">{o.name}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t("home.offers.from")}</div>
                      <div className="font-display text-2xl gold-text">{computeFinalPrice(o).toLocaleString("fr-FR")} {t("home.offers.price_unit")}</div>
                    </div>
                    <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      */}

      {/* MEMBERS CAROUSEL */}
      <MembersCarousel />

      {/* PROCHAIN ÉVÉNEMENT */}
      {/*  <section className="container py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden corner-deco">
          <img src={events.upcoming[0].image} alt={events.upcoming[0].title} loading="lazy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
        <div>
          <div className="eyebrow mb-4">{t("home.event.eyebrow")}</div>
          <div className="font-mono text-sm text-gold-light mb-3">{events.upcoming[0].date} · {events.upcoming[0].city}</div>
          <h2 className="font-display text-5xl mb-6 leading-[1.05]">{events.upcoming[0].title}</h2>
          <p className="text-foreground/80 mb-8 leading-relaxed">{events.upcoming[0].desc}</p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[{ v: t("home.event.stat1_val"), l: t("home.event.stat1_label") }, { v: t("home.event.stat2_val"), l: t("home.event.stat2_label") }, { v: t("home.event.stat3_val"), l: t("home.event.stat3_label") }].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl gold-text">{s.v}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <Link to="/evenements" className="btn-gold inline-flex px-7 py-3.5 text-xs uppercase tracking-[0.22em] rounded-sm items-center gap-3">
            {t("home.event.btn")} <ArrowRight size={14} />
          </Link>
        </div>
      </section> */}

      {/* TESTIMONIALS */}
      <section className="container py-16">
        <SectionHeading eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} center />
        <div className="grid md:grid-cols-3 gap-6">
          {(dbReviews.length > 0 ? dbReviews : testimonials).slice(0,3).map((tItem: any, idx) => (
            <div key={tItem.id || idx} className="luxe-card p-8 rounded-sm">
              <div className="flex gap-1 mb-5 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < (tItem.rating || 5) ? "currentColor" : "none"} className={i >= (tItem.rating || 5) ? "text-muted" : ""} />)}
              </div>
              <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">« {tItem.quote || tItem.comment} »</p>
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {tItem.flagType ? <TestimonialFlag type={tItem.flagType} /> : (
                  <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-lg border border-border flex">
                    <div className="flex-1 h-full" style={{ background: "rgb(0, 0, 0)" }} />
                    <div className="flex-1 h-full" style={{ background: "rgb(250, 224, 66)" }} />
                    <div className="flex-1 h-full" style={{ background: "rgb(239, 51, 64)" }} />
                  </div>
                )}
                <div>
                  <div className="font-display text-base">{tItem.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{tItem.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <Link to="/avis" className="btn-ghost-gold inline-flex px-8 py-3.5 text-[10px] uppercase tracking-[0.24em] rounded-sm items-center gap-3">
            {t("home.testimonials.btn")} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}