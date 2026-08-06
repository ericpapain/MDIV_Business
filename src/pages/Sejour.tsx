import { getEvents } from "@/data/mockData";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

function FlagCSS({ type }: { type: string }) {
  const base = "shrink-0 w-8 h-8 rounded-full overflow-hidden shadow-lg border border-border/10";
  if (!type) return null;
  
  if (type === "France") {
    return (
      <div className={base} style={{ display: "flex" }}>
        <div style={{ flex: 1, background: "#002395" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#ED2939" }} />
      </div>
    );
  }
  if (type === "Suisse") {
    return (
      <div className={base} style={{ background: "#DA291C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="relative w-[40%] h-[40%]">
          <div className="absolute top-1/2 left-0 right-0 h-[25%] bg-white -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 bg-white -translate-x-1/2" style={{ width: "25%" }} />
        </div>
      </div>
    );
  }
  if (type === "UAE") {
    return (
      <div className={base} style={{ display: "flex" }}>
        <div style={{ width: "25%", background: "#FF0000" }} />
        <div style={{ width: "75%", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, background: "#00732F" }} />
          <div style={{ flex: 1, background: "#FFFFFF" }} />
          <div style={{ flex: 1, background: "#000000" }} />
        </div>
      </div>
    );
  }
  return null;
}

function Countdown({ targetDateStr }: { targetDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { t } = useLanguage();

  useEffect(() => {
    if (!targetDateStr) return;
    
    const target = new Date(targetDateStr).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (!targetDateStr) return null;

  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.days}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.days")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.hours}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.hours")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.minutes}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.minutes")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.seconds}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.seconds")}</span>
      </div>
    </div>
  );
}

export default function Sejour() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { data: dbEvents, isLoading } = useQuery({
    queryKey: ["public-events", "Séjour"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events&type=Séjour");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    }
  });

  const localizedEvents = dbEvents || { upcoming: [], past: [] };

  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("sejour.hero.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("sejour.hero.title1")} <em className="italic gold-text">{t("sejour.hero.title2")}</em></h1>
      </div>

      <div className="mb-20">
        <div className="flex items-end justify-between mb-8" id="a-venir">
          <h2 className="font-display text-3xl">{t("sejour.upcoming.title")}</h2>
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
            {localizedEvents.upcoming.length} {localizedEvents.upcoming.length > 1 ? t("sejour.upcoming.subtitle_events") : t("sejour.upcoming.subtitle_event")}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedEvents.upcoming.map((e: any) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group flex flex-col h-full min-h-[560px]">
              {e.image_url && (
                <div className="aspect-[4/3] overflow-hidden relative shrink-0 cursor-zoom-in" onClick={() => setSelectedImage(e.image_url)}>
                  <img src={e.image_url} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-[0.2em] text-gold-light flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" /> {t("sejour.upcoming.open")}
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3"><Calendar size={12} /> {new Date(e.date).toLocaleDateString()} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.location}</div>
                <div className="font-display text-2xl mb-2">{e.title}</div>
                <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">{e.description}</div>
                
                <Countdown targetDateStr={e.date} />

                <div className="mt-auto pt-5">
                  <Link to="/contact" className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] rounded-sm flex items-center gap-2 w-fit">{t("common.request_invite")} <ArrowRight size={12} /></Link>
                </div>
              </div>
            </div>
          ))}
          {localizedEvents.upcoming.length === 0 && <p className="text-muted-foreground col-span-full">Aucun séjour à venir pour le moment.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">{t("sejour.past.title")}</h2>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("sejour.past.subtitle")}</div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedEvents.past.map((e: any) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group opacity-90 hover:opacity-100 flex flex-col relative h-full min-h-[560px]">
                {e.image_url && (
                  <div className="aspect-[4/3] overflow-hidden relative shrink-0 cursor-zoom-in" onClick={() => setSelectedImage(e.image_url)}>
                    <img src={e.image_url} alt={e.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3">
                    <Calendar size={12} /> {new Date(e.date).toLocaleDateString()} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.location}
                  </div>
                  <div className="font-display text-2xl mb-2">{e.title}</div>
                  <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">{e.description}</div>
                </div>
              </div>
            ))}
            {localizedEvents.past.length === 0 && <p className="text-muted-foreground col-span-full">Aucun séjour passé pour le moment.</p>}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Agrandissement" 
              className="max-w-full max-h-full object-contain rounded-sm border border-gold/30 shadow-2xl"
            />
            <button 
              className="absolute top-4 right-4 text-foreground/70 hover:text-foreground bg-foreground/10 hover:bg-foreground/20 px-3 py-1.5 rounded-full transition-colors font-display text-lg"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}