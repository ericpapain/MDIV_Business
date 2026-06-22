import { useState } from "react";
import { experiences } from "@/data/mockData";
import { MapPin } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const cats = ["Tout", "Hôtels", "Gastronomie", "Expériences", "Business"];

export default function Experiences() {
  const [cat, setCat] = useState("Tout");
  const items = cat === "Tout" ? experiences : experiences.filter((e) => e.category === cat);
  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-12 animate-fade-up">
        <div className="eyebrow mb-4">Le catalogue</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">Curation <em className="italic gold-text">méticuleuse.</em></h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">Adresses vérifiées, partenaires de longue date, accès privés.</p>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-12">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-5 py-2 text-[11px] uppercase tracking-[0.22em] rounded-sm border transition-all ${cat === c ? "border-gold bg-gold/10 text-gold-light" : "border-border hover:border-gold/40 text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((e) => (
          <div key={e.id} className="luxe-card rounded-sm overflow-hidden group">
            <div className="aspect-[4/5] relative overflow-hidden">
              <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-[0.2em] glass-strong rounded-sm">{e.category}</div>
              <div className="absolute bottom-0 inset-x-0 p-6">
                <div className="font-display text-xl mb-2">{e.title}</div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {e.location}</div>
                  <div className="gold-text font-display text-lg">{e.price.toLocaleString("fr-FR")} €</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}