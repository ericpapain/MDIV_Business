import { partners, images } from "@/data/mockData";
import { Crown, Wine, Briefcase, MapPin } from "lucide-react";

export default function Partners() {
  const groups = ["Hôtellerie", "Gastronomie", "Investissement"];
  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">L'écosystème</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">Nos <em className="italic gold-text">complices</em>.</h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">Maisons d'exception qui partagent notre exigence du détail.</p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden border-y border-border py-8 mb-20">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="font-display text-2xl text-foreground/40 hover:text-gold transition-colors uppercase tracking-[0.15em]">{p.name}</span>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g} className="mb-16">
          <h2 className="font-display text-3xl mb-8 flex items-center gap-4">
            <span className="w-10 h-px bg-gold/60" /> {g}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.filter((p) => p.category === g).map((p) => {
              const initials = p.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              // Icon & cover selection
              let coverImage = images.expHotel;
              let CategoryIcon = Crown;
              if (p.category === "Gastronomie") {
                coverImage = images.expDining;
                CategoryIcon = Wine;
              } else if (p.category === "Investissement") {
                coverImage = images.eventNetworking;
                CategoryIcon = Briefcase;
              }

              return (
                <div key={p.name} className="luxe-card overflow-hidden rounded-sm group cursor-pointer flex flex-col h-full transition-all duration-500 hover:shadow-[0_8px_30px_rgba(197,160,89,0.08)] hover:-translate-y-1">
                  {/* Photo area */}
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-border/40 bg-muted/20">
                    <img 
                      src={coverImage} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-70 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    
                    {/* Premium glass logo overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm glass gold-border flex items-center justify-center font-display text-xs tracking-wider text-primary font-bold shadow-lg">
                        {initials}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.25em] bg-emerald-deep/80 px-2 py-0.5 rounded-sm border border-gold/20 text-gold-light flex items-center gap-1.5 font-medium shadow-md">
                        <CategoryIcon size={10} className="text-primary" />
                        {p.category}
                      </div>
                    </div>
                  </div>

                  {/* Text area */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-display text-xl mb-1 group-hover:text-gold-light transition-colors duration-300">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5 mt-1.5">
                        <MapPin size={10} className="text-primary/70" />
                        {p.country}
                      </div>
                    </div>
                    <div className="hairline mt-6" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}