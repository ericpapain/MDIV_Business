import { events } from "@/data/mockData";
import { Calendar, MapPin, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function FlagCSS({ type }: { type: string }) {
  const base = "shrink-0 w-8 h-8 rounded-full overflow-hidden shadow-lg border border-white/10";
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
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Jours</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.hours}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">H</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.minutes}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Min</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.seconds}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Sec</span>
      </div>
    </div>
  );
}

export default function Events() {
  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">Calendrier privé</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">Les rendez-vous <em className="italic gold-text">qui comptent.</em></h1>
      </div>

      <div className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">À venir</h2>
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary">{events.upcoming.length} événement{events.upcoming.length > 1 ? 's' : ''} ouvert{events.upcoming.length > 1 ? 's' : ''}</div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {events.upcoming.map((e: any) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group flex flex-col">
              <div className="aspect-[4/3] overflow-hidden relative shrink-0">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                {e.country && (
                  <div className="absolute top-4 left-4 z-10">
                    <FlagCSS type={e.country} />
                  </div>
                )}
                <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-[0.2em] text-gold-light flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" /> Ouvert
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3"><Calendar size={12} /> {e.date} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.city}</div>
                <div className="font-display text-2xl mb-2">{e.title}</div>
                <div className="text-sm text-muted-foreground mb-4 leading-relaxed">{e.desc}</div>
                
                <Countdown targetDateStr={e.targetDate} />

                <div className="mt-auto pt-5">
                  <Link to="/contact" className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] rounded-sm flex items-center gap-2 w-fit">Demander une invitation <ArrowRight size={12} /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">Éditions passées</h2>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Archives confidentielles</div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {events.past.map((e: any) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group opacity-90 hover:opacity-100 flex flex-col relative">
              <div className="aspect-[4/3] overflow-hidden relative shrink-0">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                {e.country && (
                  <div className="absolute top-4 left-4 z-10">
                    <FlagCSS type={e.country} />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="font-mono text-xs text-muted-foreground mb-2 flex items-center justify-between">
                  <span>{e.date} · {e.city}</span>
                </div>
                <div className="font-display text-xl mb-2">{e.title}</div>
                <div className="text-sm text-muted-foreground mb-6">{e.desc}</div>
                
                <div className="mt-auto pt-4 border-t border-gold/10">
                  <Link to={`/revivre/${e.id}`} className="text-xs uppercase tracking-[0.2em] text-primary hover:text-gold-light flex items-center gap-2 transition-colors w-fit">
                    <Play size={14} /> Revivre l'événement
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}