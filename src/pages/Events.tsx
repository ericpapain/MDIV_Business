import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, ArrowRight, Play, Loader2, ListChecks, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { ProgramPanel } from "@/components/site/ProgramPanel";
import { SimpleCountdown } from "@/components/event/SimpleCountdown";

export default function Events() {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [programEvent, setProgramEvent] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["public-events", "Événement"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events&type=Événement");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    }
  });

  const getProgram = (e: any) => {
    if (!e.program) return null;
    return typeof e.program === 'string' ? JSON.parse(e.program) : e.program;
  };

  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("sejour.hero.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("sejour.hero.title1")} <em className="italic gold-text">{t("sejour.hero.title2")}</em></h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold w-10 h-10" /></div>
      ) : (
        <>
          <div className="mb-20">
            <div className="flex items-end justify-between mb-8" id="a-venir">
              <h2 className="font-display text-3xl">{t("sejour.upcoming.title")}</h2>
              <div className="text-[11px] uppercase tracking-[0.22em] text-primary">
                {data?.upcoming.length || 0} {data?.upcoming.length > 1 ? t("sejour.upcoming.subtitle_events") : t("sejour.upcoming.subtitle_event")}
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.upcoming.map((e: any) => {
                const prog = getProgram(e);
                const hasProgram = prog && prog.length > 0;
                return (
                  <div key={e.id} className="luxe-card rounded-sm overflow-hidden group flex flex-col h-full min-h-[400px]">
                    {e.image_url && (
                      <div className="aspect-[4/3] overflow-hidden relative shrink-0 cursor-zoom-in" onClick={() => setSelectedImage(e.image_url)}>
                        <img src={e.image_url} alt={isEn && e.title_en ? e.title_en : e.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                        {/* Badge prix */}
                        {e.price && (
                          <div className="absolute top-4 left-4 bg-gold/90 text-background px-3 py-1.5 rounded-sm text-sm font-bold shadow-lg">
                            {e.price}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3"><Calendar size={12} /> {new Date(e.date).toLocaleDateString()} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.location}</div>
                      <div className="font-display text-2xl mb-2">{isEn && e.title_en ? e.title_en : e.title}</div>
                      <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">{isEn && e.description_en ? e.description_en : e.description}</div>
                      
                      {/* Prix si pas d'image */}
                      {e.price && !e.image_url && (
                        <div className="mb-4">
                          <span className="inline-block bg-gold/10 border border-gold/20 text-gold px-3 py-1 rounded-sm text-sm font-semibold">{e.price}</span>
                        </div>
                      )}

                      <SimpleCountdown targetDateStr={e.date} />

                      <div className="mt-auto pt-5 flex flex-col gap-3">
                        {/* Bouton Réserver */}
                        {e.billetterie_url ? (
                          <a href={e.billetterie_url} target="_blank" rel="noopener noreferrer" className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] rounded-sm flex items-center gap-2 w-fit">
                            <Ticket size={12} /> {isEn ? "Book a seat" : "Réserver une place"} <ArrowRight size={12} />
                          </a>
                        ) : (
                          <Link to="/contact" className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] rounded-sm flex items-center gap-2 w-fit">
                            <Ticket size={12} /> {isEn ? "Book a seat" : "Réserver une place"} <ArrowRight size={12} />
                          </Link>
                        )}

                        {/* Bouton Programme */}
                        {hasProgram ? (
                          <button onClick={() => setProgramEvent(e)} className="text-xs uppercase tracking-[0.2em] text-primary hover:text-gold-light flex items-center gap-2 transition-colors w-fit font-medium">
                            <ListChecks size={14} /> {isEn ? "View program" : "Voir le programme"}
                          </button>
                        ) : (
                          <span className="text-xs uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2 select-none cursor-not-allowed w-fit">
                            <ListChecks size={14} className="opacity-30" /> {isEn ? "Program coming soon" : "Programme à venir"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {data?.upcoming.length === 0 && <p className="text-muted-foreground col-span-full">{isEn ? "No upcoming events." : "Aucun événement à venir pour le moment."}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-3xl">{t("sejour.past.title")}</h2>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t("sejour.past.subtitle")}</div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.past.map((e: any) => (
                <div key={e.id} className="luxe-card rounded-sm overflow-hidden group opacity-90 hover:opacity-100 flex flex-col relative h-full min-h-[400px]">
                  {e.image_url && (
                    <div className="aspect-[4/3] overflow-hidden relative shrink-0 cursor-zoom-in" onClick={() => setSelectedImage(e.image_url)}>
                      <img src={e.image_url} alt={isEn && e.title_en ? e.title_en : e.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="font-mono text-xs text-gold-light flex items-center gap-2 mb-3">
                      <Calendar size={12} /> {new Date(e.date).toLocaleDateString()} <span className="text-muted-foreground">·</span> <MapPin size={12} /> {e.location}
                    </div>
                    <div className="font-display text-2xl mb-2">{isEn && e.title_en ? e.title_en : e.title}</div>
                    <div className="text-sm text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">{isEn && e.description_en ? e.description_en : e.description}</div>
                  
                    <div className="mt-auto pt-5 border-t border-gold/10">
                      <Link to={`/revivre/${e.id}`} className="text-xs uppercase tracking-[0.2em] text-primary hover:text-gold-light flex items-center gap-2 transition-colors w-fit">
                        <Play size={14} /> {t("common.replay")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {data?.past.length === 0 && <p className="text-muted-foreground col-span-full">{isEn ? "No past events." : "Aucun événement passé pour le moment."}</p>}
            </div>
          </div>
        </>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img src={selectedImage} alt="Agrandissement" className="max-w-full max-h-full object-contain rounded-sm border border-gold/30 shadow-2xl" />
          </div>
        </div>
      )}

      {/* Programme Panel */}
      {programEvent && (
        <ProgramPanel
          isOpen={true}
          onClose={() => setProgramEvent(null)}
          eventTitle={programEvent.title}
          eventTitleEn={programEvent.title_en}
          program={typeof programEvent.program === 'string' ? JSON.parse(programEvent.program) : programEvent.program}
        />
      )}
    </div>
  );
}