import { useState, useEffect } from "react";
import { getMembers } from "@/data/mockData";
import { useLanguage } from "@/i18n/LanguageContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function MembersCarousel() {
  const { t } = useLanguage();
  const localizedMembers = getMembers(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMember, setSelectedMember] = useState<typeof localizedMembers[0] | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % localizedMembers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [localizedMembers.length]);

  return (
    <section className="container py-20 relative">
      <div className="text-center mb-12">
        <div className="eyebrow mb-4">{t("home.testimonials.eyebrow")}</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">
          {t("home.testimonials.title_start")} <em className="italic gold-text">{t("home.testimonials.title_end")}</em>
        </h2>
      </div>

      <div className="relative max-w-4xl mx-auto flex items-center justify-center">
        <button 
          onClick={() => setActiveIndex(prev => prev === 0 ? localizedMembers.length - 1 : prev - 1)}
          className="absolute left-0 z-10 w-12 h-12 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors hidden md:flex"
        >
          <ChevronLeft size={24} className="text-gold" />
        </button>

        <div className="w-full overflow-hidden relative" style={{ height: "700px" }}>
          {localizedMembers.map((member, idx) => {
            let offset = idx - activeIndex;
            if (offset < -localizedMembers.length / 2) offset += localizedMembers.length;
            if (offset > localizedMembers.length / 2) offset -= localizedMembers.length;
            
            let translateX = offset * 105;
            let scale = 1 - Math.abs(offset) * 0.15;
            let opacity = 1 - Math.abs(offset) * 0.5;
            let zIndex = 10 - Math.abs(offset);

            return (
              <div
                key={member.id}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] md:w-[500px] transition-all duration-500 ease-out flex flex-col items-center cursor-pointer"
                style={{
                  transform: `translateX(calc(-50% + ${translateX}%)) scale(${scale})`,
                  opacity: opacity > 0 ? opacity : 0,
                  zIndex,
                  pointerEvents: opacity > 0 ? "auto" : "none"
                }}
                onClick={() => {
                  if (offset !== 0) {
                    setActiveIndex(idx);
                  } else {
                    setSelectedMember(member);
                  }
                }}
              >
                <div className="w-full aspect-[3/4] rounded-sm border-2 border-gold shadow-2xl relative hover:border-gold-light transition-colors duration-300 bg-black/40 backdrop-blur-md p-[6px]">
                  <div className="relative w-full h-full rounded-sm overflow-hidden flex items-center justify-center">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-gold/30">
                      <img src={`https://flagcdn.com/w40/${member.countryCode.toLowerCase()}.png`} alt={member.countryCode} className="w-6 h-auto rounded-[2px]" />
                      <span className="text-sm font-bold text-foreground tracking-wider">{member.countryCode}</span>
                    </div>
                    <img src={member.image} alt={member.name} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-center">
                      <h3 className="font-display text-2xl text-foreground mb-1">{member.name}</h3>
                      <p className="text-xs uppercase tracking-[0.1em] text-gold-light">{member.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setActiveIndex(prev => (prev + 1) % localizedMembers.length)}
          className="absolute right-0 z-10 w-12 h-12 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors hidden md:flex"
        >
          <ChevronRight size={24} className="text-gold" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {localizedMembers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? "bg-gold w-6" : "bg-foreground/20 hover:bg-foreground/40"}`}
          />
        ))}
      </div>

      {selectedMember && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedMember(null)}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          
          <div 
            className="relative z-10 h-[85vh] md:h-[95vh] max-w-[95vw] aspect-[3/4] rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.4)] border-2 border-gold animate-in zoom-in-95 duration-300 bg-black/60 backdrop-blur-xl p-[6px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-foreground hover:bg-black/80 hover:text-gold transition-colors backdrop-blur-sm border border-gold/30"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
              <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-gold/30">
                <img src={`https://flagcdn.com/w80/${selectedMember.countryCode.toLowerCase()}.png`} alt={selectedMember.countryCode} className="w-8 h-auto rounded-sm" />
                <span className="text-lg font-bold text-foreground tracking-wider">{selectedMember.countryCode}</span>
              </div>
              <img 
                src={selectedMember.image} 
                alt={selectedMember.name} 
                className="w-full h-full object-contain" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
              <div className="absolute bottom-10 left-8 right-8 text-center">
                <h3 className="font-display text-4xl md:text-5xl text-foreground mb-3">{selectedMember.name}</h3>
                <p className="text-sm uppercase tracking-[0.2em] text-gold-light">{selectedMember.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
