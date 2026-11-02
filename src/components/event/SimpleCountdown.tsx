import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Users } from "lucide-react";

export function SimpleCountdown({ 
  targetDateStr,
  attendeesCount
}: { 
  targetDateStr: string;
  attendeesCount?: number;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t, language } = useLanguage();
  const isEn = language === "en";

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
          minutes: Math.floor((difference % (1000 * 60)) / (1000 * 60)),
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
    <div className="flex items-center justify-between gap-2 mt-4 mb-2 w-full">
      {/* 4 blocs compte à rebours */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-sm">
          <span className="font-display text-base sm:text-lg gold-text leading-none">{timeLeft.days}</span>
          <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground mt-0.5">{t("common.days")}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-sm">
          <span className="font-display text-base sm:text-lg gold-text leading-none">{timeLeft.hours}</span>
          <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground mt-0.5">{t("common.hours")}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-sm">
          <span className="font-display text-base sm:text-lg gold-text leading-none">{timeLeft.minutes}</span>
          <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground mt-0.5">{t("common.minutes")}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-sm">
          <span className="font-display text-base sm:text-lg gold-text leading-none">{timeLeft.seconds}</span>
          <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground mt-0.5">{t("common.seconds")}</span>
        </div>
      </div>

      {/* Nombre d'inscrits en direct décalé à droite avec couleur distinctive émeraude VIP */}
      {attendeesCount !== undefined && (
        <div 
          className="flex flex-col items-center justify-center bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 rounded-sm min-w-16 px-3 h-11 sm:h-12 backdrop-blur-sm shadow-sm transition-all ml-auto shrink-0"
          title={isEn ? `${attendeesCount} attendee(s) registered` : `${attendeesCount} participant(s) déjà inscrit(s)`}
        >
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-emerald-400" />
            <span className="font-display text-base sm:text-lg text-emerald-300 leading-none font-bold">
              {attendeesCount}
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-[0.2em] text-emerald-400/90 mt-0.5 font-semibold">
            {attendeesCount > 1 ? (isEn ? "Inscrits" : "Inscrits") : (isEn ? "Inscrit" : "Inscrit")}
          </span>
        </div>
      )}
    </div>
  );
}
