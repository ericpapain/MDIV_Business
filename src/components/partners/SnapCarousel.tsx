import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Carousel avec auto-scroll, boutons prev/next au survol */
export function SnapCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!ref.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      const cardWidth = 280;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        ref.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        ref.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const next = () => ref.current?.scrollBy({ left: 280, behavior: "smooth" });
  const prev = () => ref.current?.scrollBy({ left: -280, behavior: "smooth" });

  return (
    <div className="relative group">
      <button
        onClick={prev}
        className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
      >
        <ChevronLeft size={18} />
      </button>
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {children}
      </div>
      <button
        onClick={next}
        className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
