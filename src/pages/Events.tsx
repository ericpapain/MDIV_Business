import { events } from "@/data/mockData";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

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
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary">3 événements ouverts</div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {events.upcoming.map((e) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-[0.2em] text-gold-light flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" /> Ouvert
                </div>
              </div>
              <div className="p-6">
                <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3"><Calendar size={12} /> {e.date} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.city}</div>
                <div className="font-display text-2xl mb-2">{e.title}</div>
                <div className="text-sm text-muted-foreground mb-5 leading-relaxed">{e.desc}</div>
                <button className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] rounded-sm flex items-center gap-2">Demander une invitation <ArrowRight size={12} /></button>
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
        <div className="grid md:grid-cols-3 gap-6">
          {events.past.map((e) => (
            <div key={e.id} className="luxe-card rounded-sm overflow-hidden group opacity-90 hover:opacity-100">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="p-6">
                <div className="font-mono text-xs text-muted-foreground mb-2">{e.date} · {e.city}</div>
                <div className="font-display text-xl mb-2">{e.title}</div>
                <div className="text-sm text-muted-foreground">{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}