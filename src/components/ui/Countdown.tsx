import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isPast: false
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <span className="text-xs font-bold text-green-500 uppercase tracking-wider">
        {isEn ? "Available" : "Disponible"}
      </span>
    );
  }

  return (
    <div className="flex items-center justify-around w-full mt-1 p-2 rounded-lg shadow-sm border" style={{ backgroundColor: 'hsl(221 83% 40%)', borderColor: 'hsl(42 55% 56% / 0.5)', zIndex: 50, position: 'relative' }}>
      <div className="flex flex-col items-center flex-1">
        <div className="rounded-md text-base font-bold w-9 h-9 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'hsl(221 83% 30%)', color: 'hsl(42 55% 56%)' }}>
          {timeLeft.days.toString().padStart(2, "0")}
        </div>
        <span className="text-[9px] font-bold uppercase mt-1" style={{ color: 'hsl(42 55% 56% / 0.8)' }}>{isEn ? "days" : "jours"}</span>
      </div>
      <span className="text-base font-bold -mt-3" style={{ color: 'hsl(42 55% 56% / 0.5)' }}>:</span>
      <div className="flex flex-col items-center flex-1">
        <div className="rounded-md text-base font-bold w-9 h-9 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'hsl(221 83% 30%)', color: 'hsl(42 55% 56%)' }}>
          {timeLeft.hours.toString().padStart(2, "0")}
        </div>
        <span className="text-[9px] font-bold uppercase mt-1" style={{ color: 'hsl(42 55% 56% / 0.8)' }}>{isEn ? "hrs" : "hrs"}</span>
      </div>
      <span className="text-base font-bold -mt-3" style={{ color: 'hsl(42 55% 56% / 0.5)' }}>:</span>
      <div className="flex flex-col items-center flex-1">
        <div className="rounded-md text-base font-bold w-9 h-9 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'hsl(221 83% 30%)', color: 'hsl(42 55% 56%)' }}>
          {timeLeft.minutes.toString().padStart(2, "0")}
        </div>
        <span className="text-[9px] font-bold uppercase mt-1" style={{ color: 'hsl(42 55% 56% / 0.8)' }}>{isEn ? "min" : "min"}</span>
      </div>
      <span className="text-base font-bold -mt-3" style={{ color: 'hsl(42 55% 56% / 0.5)' }}>:</span>
      <div className="flex flex-col items-center flex-1">
        <div className="rounded-md text-base font-bold w-9 h-9 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'hsl(42 55% 56%)', color: '#fff' }}>
          {timeLeft.seconds.toString().padStart(2, "0")}
        </div>
        <span className="text-[9px] font-bold uppercase mt-1" style={{ color: 'hsl(42 55% 56%)' }}>{isEn ? "sec" : "sec"}</span>
      </div>
    </div>
  );
}
