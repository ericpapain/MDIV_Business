import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Crown, Users, Target, Diamond, Play, Star, Check } from "lucide-react";
import { images, offers, testimonials, events, computeFinalPrice } from "@/data/mockData";
import { SectionHeading } from "@/components/site/SectionHeading";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { EventHero } from "@/components/event/EventHero";
import { ChampagneEvent } from "@/components/event/ChampagneEvent";
import tableEssoyesVideo from "@/assets/videos/table_essoyes.mp4";

// Vidéo de paysage cinématographique hébergée sur Google Cloud Storage (sans restriction CORS ni hotlinking)
const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

function TestimonialFlag({ type }: { type: string }) {
  const base = "shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-lg border border-white/10 flex";

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

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16">
        <div className="absolute inset-0">
          <img src={images.hero} alt="Cercle privé d'affaires" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
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
              <Link to="/contact" className="btn-gold px-8 py-4 text-xs uppercase tracking-[0.24em] rounded-sm flex items-center gap-3 justify-center group">
                {t("home.hero.btn1")} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/evenements" className="btn-ghost-gold px-8 py-4 text-xs uppercase tracking-[0.24em] rounded-sm flex items-center gap-3 justify-center">
                {t("home.hero.btn2")}
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
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
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="glass-strong p-6 rounded-sm relative corner-deco">
              <div>
                <div className="eyebrow mb-3">{t("home.hero_live.eyebrow")}</div>
                <div className="font-display text-2xl mb-2">{t("home.hero_live.title")}</div>
                <div className="text-sm text-muted-foreground mb-4">{t("home.hero_live.desc")}</div>
                <div className="flex items-center gap-2 text-xs text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" /> {t("home.hero_live.status")}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent my-5" />

              <div>
                <div className="eyebrow mb-3 flex items-center gap-2 text-primary">
                  <Sparkles size={12} className="text-primary animate-pulse-soft" /> {t("home.hero_live.upcoming")}
                </div>
                <div className="font-display text-xl mb-1">{events.upcoming[0].title}</div>
                <div className="text-xs text-muted-foreground mb-4">
                  {events.upcoming[0].city} · {events.upcoming[0].date}
                </div>
                <Link
                  to="/contact"
                  className="w-full py-2.5 text-[10px] uppercase tracking-[0.2em] rounded-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 btn-gold hover:opacity-90"
                >
                  {t("home.hero_live.reserve_btn")}
                </Link>
              </div>
            </div>

            {/*<div className="glass p-6 rounded-sm">
              <div className="eyebrow mb-3">{t("home.hero_live.ai_reco_title")}</div>
              <p className="text-sm text-foreground/80 mb-4 font-serif italic leading-relaxed">
                {t("home.hero_live.ai_reco_desc")}
              </p>
              <Link to="/experience" className="text-xs uppercase tracking-[0.2em] text-primary hover:text-gold-light flex items-center gap-2">
                {t("home.hero_live.ai_reco_btn")} <Sparkles size={12} />
              </Link>
            </div>*/}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <div className="text-[10px] uppercase tracking-[0.3em]">{t("home.scroll")}</div>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ÉVÉNEMENT IMMOBILIER IMMERSIF */}
      <EventHero />

      {/* SÉJOUR FONDATEUR CHAMPAGNE IMMERSIF */}
      <ChampagneEvent />

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
        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((o, idx) => (
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

      {/* VIDEO BANNER */}
      <section className="relative py-32 my-16 overflow-hidden min-h-[450px] flex items-center justify-center">
        {playHomeVideo ? (
          <div className="container relative z-10 w-full max-w-4xl aspect-video rounded-sm overflow-hidden gold-border shadow-2xl animate-fade-in bg-background">
            <video
              className="w-full h-full object-cover"
              src={tableEssoyesVideo}
              autoPlay
              controls
              loop
              playsInline
            />
            <button
              onClick={() => setPlayHomeVideo(false)}
              className="absolute top-4 right-4 bg-background/80 text-foreground hover:text-primary px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] rounded-sm font-semibold glass gold-border transition-colors z-20"
            >
              {t("home.video.close")}
            </button>
          </div>
        ) : (
          <>
            <video
              src={tableEssoyesVideo}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
            <div className="container relative text-center">
              <div className="eyebrow mb-4">{t("home.video.eyebrow")}</div>
              <h2 className="font-display text-5xl md:text-7xl mb-6">{t("home.video.title1")} <em className="italic gold-text">{t("home.video.title2")}</em></h2>
              <p className="max-w-xl mx-auto text-muted-foreground mb-10 font-serif italic">
                {t("home.video.desc")}
              </p>
              <button
                onClick={() => setPlayHomeVideo(true)}
                className="mx-auto w-20 h-20 rounded-full btn-gold flex items-center justify-center group"
              >
                <Play size={24} className="ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </>
        )}
      </section>

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
      <section className="container py-28">
        <SectionHeading eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} center />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((tItem) => (
            <div key={tItem.name} className="luxe-card p-8 rounded-sm">
              <div className="flex gap-1 mb-5 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
              <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">« {tItem.quote} »</p>
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <TestimonialFlag type={tItem.flagType} />
                <div>
                  <div className="font-display text-base">{tItem.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{tItem.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container py-28">
        <div className="relative overflow-hidden rounded-sm glass-strong p-12 md:p-20 text-center corner-deco">
          <Diamond className="mx-auto mb-6 text-primary" size={32} />
          <h2 className="font-display text-4xl md:text-6xl mb-6 max-w-3xl mx-auto leading-[1.05]">
            {t("home.cta.title1")} <em className="italic gold-text">{t("home.cta.title2")}</em>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">{t("home.cta.desc")}</p>
          <Link to="/contact" className="btn-gold inline-flex px-10 py-4 text-xs uppercase tracking-[0.24em] rounded-sm items-center gap-3">
            {t("home.cta.btn")} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}