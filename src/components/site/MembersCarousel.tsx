import { useState, useEffect } from "react";
import { members } from "@/data/mockData";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MembersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % members.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % members.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);

  return (
    <section className="container py-20 relative">
      <div className="text-center mb-12">
        <div className="eyebrow mb-4">Le Cercle</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05]">Découvrez <em className="italic gold-text">nos membres</em></h2>
      </div>

      <div className="relative max-w-4xl mx-auto flex items-center justify-center">
        <button onClick={prev} className="absolute left-0 z-10 w-12 h-12 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors hidden md:flex">
          <ChevronLeft size={24} className="text-gold" />
        </button>

        <div className="w-full overflow-hidden relative" style={{ height: "400px" }}>
          {members.map((member, i) => {
            const offset = i - currentIndex;
            const normalizedOffset = offset < -members.length / 2 ? offset + members.length : offset > members.length / 2 ? offset - members.length : offset;
            
            let translateX = normalizedOffset * 100; // base translation
            let scale = 1 - Math.abs(normalizedOffset) * 0.15;
            let opacity = 1 - Math.abs(normalizedOffset) * 0.5;
            let zIndex = 10 - Math.abs(normalizedOffset);

            return (
              <div
                key={member.id}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] md:w-[320px] transition-all duration-500 ease-out flex flex-col items-center"
                style={{
                  transform: `translateX(calc(-50% + ${translateX}%)) scale(${scale})`,
                  opacity: opacity > 0 ? opacity : 0,
                  zIndex,
                  pointerEvents: normalizedOffset === 0 ? "auto" : "none"
                }}
              >
                <div className="w-full aspect-[3/4] rounded-sm overflow-hidden border border-gold/20 shadow-2xl relative">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-center">
                    <h3 className="font-display text-2xl text-white mb-1">{member.name}</h3>
                    <p className="text-xs uppercase tracking-[0.1em] text-gold-light">{member.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={next} className="absolute right-0 z-10 w-12 h-12 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors hidden md:flex">
          <ChevronRight size={24} className="text-gold" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {members.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? "bg-gold w-6" : "bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
