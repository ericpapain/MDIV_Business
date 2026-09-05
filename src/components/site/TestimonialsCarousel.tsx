import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { SectionHeading } from "@/components/site/SectionHeading";
import { TestimonialFlag } from "@/components/site/TestimonialFlag";

interface TestimonialsCarouselProps {
  reviews: any[];
}

export function TestimonialsCarousel({ reviews }: TestimonialsCarouselProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const perPage = 3;

  const { data: dbEvents } = useQuery({
    queryKey: ["carousel-events"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events");
      const json = await res.json();
      if (json.data && !Array.isArray(json.data)) {
        return [...(json.data.upcoming || []), ...(json.data.past || [])];
      }
      return json.data || [];
    },
  });
  const totalPages = Math.ceil(reviews.length / perPage);

  const nextPage = useCallback(() => {
    setPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(nextPage, 5000);
    return () => clearInterval(interval);
  }, [totalPages, nextPage]);

  if (reviews.length === 0) return null;

  const currentReviews = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="container py-16">
      <SectionHeading eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} center />

      <div className="relative">
        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors border border-border"
            >
              <ChevronLeft size={20} className="text-gold" />
            </button>
            <button
              onClick={nextPage}
              className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-gold/10 transition-colors border border-border"
            >
              <ChevronRight size={20} className="text-gold" />
            </button>
          </>
        )}

        {/* Reviews Grid with fade transition */}
        <div className="grid md:grid-cols-3 gap-6 transition-opacity duration-500">
          {currentReviews.map((tItem: any, idx: number) => {
            const c = (tItem.country || tItem.flagType)?.toLowerCase() || "";

            return (
              <div key={tItem.id || `${page}-${idx}`} className="luxe-card p-8 rounded-sm animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex gap-1 mb-5 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < (tItem.rating || 5) ? "currentColor" : "none"} className={i >= (tItem.rating || 5) ? "text-muted" : ""} />
                  ))}
                </div>
                {tItem.event && (() => {
                  const matchingEvent = (dbEvents || []).find((ev: any) => ev.title === tItem.event);
                  if (matchingEvent) {
                    return (
                      <Link to={`/revivre/${matchingEvent.id}`} className="text-xs text-gold-light mb-4 uppercase tracking-[0.1em] hover:text-gold transition-colors underline underline-offset-2 decoration-gold/30 hover:decoration-gold block">
                        {tItem.event} →
                      </Link>
                    );
                  }
                  return <div className="text-xs text-gold-light mb-4 uppercase tracking-[0.1em]">{tItem.event}</div>;
                })()}
                <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-6">
                  « {tItem.quote || tItem.comment} »
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <TestimonialFlag type={c} />
                  <div>
                    <div className="font-display text-base">{tItem.name}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{tItem.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === page ? "bg-gold w-6" : "bg-foreground/20 w-2 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-12">
        <Link to="/avis" className="btn-gold-pulse">
          {t("home.testimonials.btn")} <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
