import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export function SimpleCountdown({ targetDateStr }: { targetDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useLanguage();

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
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.days")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.hours}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.hours")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.minutes}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.minutes")}</span>
      </div>
      <div className="flex flex-col items-center justify-center bg-black/40 border border-gold/20 rounded-sm w-12 h-12 backdrop-blur-sm">
        <span className="font-display text-lg gold-text leading-none">{timeLeft.seconds}</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{t("common.seconds")}</span>
      </div>
    </div>
  );
}
