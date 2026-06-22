import { useState, useEffect } from "react";

interface LuxuryCountdownProps {
  targetDateStr?: string;
}

export function LuxuryCountdown({ targetDateStr = "2026-06-27T20:00:00" }: LuxuryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  const formatDigits = (val: number) => {
    return String(val).padStart(2, "0");
  };

  const DigitBox = ({ value, label }: { value: string; label: string }) => {
    return (
      <div className="flex flex-col items-center gap-1.5 md:gap-2">
        <div className="flex gap-0.5 md:gap-1">
          {/* Left Digit card */}
          <div className="bg-[#0b153b]/90 border border-gold/30 text-white font-mono text-2xl md:text-4xl font-bold flex items-center justify-center rounded-sm w-9 h-12 md:w-14 md:h-18 relative shadow-lg overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#03081D]/80 z-10" />
            <span className="text-goldLight">{value[0]}</span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.02] pointer-events-none" />
          </div>
          {/* Right Digit card */}
          <div className="bg-[#0b153b]/90 border border-gold/30 text-white font-mono text-2xl md:text-4xl font-bold flex items-center justify-center rounded-sm w-9 h-12 md:w-14 md:h-18 relative shadow-lg overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#03081D]/80 z-10" />
            <span className="text-goldLight">{value[1]}</span>
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.02] pointer-events-none" />
          </div>
        </div>
        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold mt-1">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 md:gap-4 select-none">
      <DigitBox value={formatDigits(timeLeft.days)} label="Jours" />
      <div className="text-gold/60 text-lg md:text-2xl font-mono -mt-6 animate-pulse-soft">:</div>
      <DigitBox value={formatDigits(timeLeft.hours)} label="Heures" />
      <div className="text-gold/60 text-lg md:text-2xl font-mono -mt-6 animate-pulse-soft">:</div>
      <DigitBox value={formatDigits(timeLeft.minutes)} label="Minutes" />
      <div className="text-gold/60 text-lg md:text-2xl font-mono -mt-6 animate-pulse-soft">:</div>
      <DigitBox value={formatDigits(timeLeft.seconds)} label="Sec" />
    </div>
  );
}
