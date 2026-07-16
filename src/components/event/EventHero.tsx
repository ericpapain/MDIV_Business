import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GoldParticles } from "./GoldParticles";
import { LuxuryCountdown } from "./LuxuryCountdown";
import { TimelineSection } from "./TimelineSection";
import eventNetworking from "@/assets/original/tallk.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

export function EventHero() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative w-full overflow-hidden bg-[#05071F]">
      <div className="container mx-auto px-0 sm:px-4 py-8 md:py-16">
        {/* Main Event Wrapper Card */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className={`relative w-full rounded-sm overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 ${
            isOpen ? "min-h-[120vh] h-auto" : "h-auto lg:h-[60vh] min-h-[520px] lg:min-h-[400px]"
          }`}
        >
          {/* Ken Burns zooming background image + Overlay */}
          <div className="absolute inset-0 z-0">
            <motion.img
              src={eventNetworking}
              alt="Networking Immobilier"
              animate={{
                scale: [1, 1.05],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="w-full h-full object-cover object-center opacity-70"
            />
            {/* Premium night blue overlay & gradient */}
            <div className="absolute inset-0 bg-[#05071f]/85 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05071F] via-[#05071F]/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05071F]/90 via-[#05071F]/40 to-transparent" />
          </div>

          {/* Floating light sweep animation container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.08) 50%, transparent)",
              }}
              className="absolute inset-y-0 w-1/2 -skew-x-12"
            />
          </div>

          {/* Gold Particles Canvas Overlay */}
          <GoldParticles />

          {/* Front Content container */}
          <div className="relative z-20 h-full flex flex-col justify-between p-4 sm:p-6 md:p-14 overflow-y-auto scrollbar-none">
            {/* Top Row: Event Badges */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse-soft" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
                  {t("event_networking.title1")} {t("event_networking.title2")}
                </span>
              </div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 backdrop-blur-sm">
                {t("event_networking.badge")}
              </div>
            </div>

            {/* Middle Row: Content & Countdown */}
            <div className="my-auto py-8 max-w-3xl flex flex-col gap-6 md:gap-8">
              {/* Event Titles */}
              <div className="space-y-1 md:space-y-2">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold font-bold">
                  {t("event_networking.eyebrow")}
                </span>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight text-white">
                  {t("event_networking.title1")} <br className="hidden md:inline" />
                  {t("event_networking.title2")}
                </h1>
                <h2 className="font-serif italic text-xl md:text-2xl text-gold-light">
                  {t("event_networking.subtitle")}
                </h2>
              </div>

              {/* Event Meta: Date, Location & Countdown */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 mt-4 border-t border-white/5 pt-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold mb-2">
                    {t("event_networking.meta_label")}
                  </div>
                  <div className="font-display text-lg md:text-xl text-white font-bold tracking-wide">
                    {t("event_networking.date")}
                  </div>
                  <div className="text-[10px] text-goldLight/80 font-mono mt-0.5">
                    {t("event_networking.location")}
                  </div>
                </div>
                <div className="h-10 w-px bg-white/10 hidden sm:block" />
                <LuxuryCountdown targetDateStr="2026-06-20T20:00:00" />
              </div>
            </div>

            {/* Bottom Row: CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-gold group px-8 py-4 text-xs uppercase tracking-[0.22em] rounded-sm font-semibold flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all duration-300 z-30"
                style={{
                  boxShadow: "0 10px 30px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {isOpen ? (
                  <>
                    {t("event_networking.hide_program")} <ChevronUp size={14} className="animate-bounce" />
                  </>
                ) : (
                  <>
                    {t("event_networking.show_program")} <ChevronDown size={14} className="animate-bounce" />
                  </>
                )}
              </button>

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">
                {t("event_networking.footer_note")}
              </p>
            </div>

            {/* Expanded Content Area (Revealed on click) */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mt-12 overflow-hidden border-t border-white/10 pt-10"
                >
                  <TimelineSection />

                  {/* Collapse Button at the Bottom of expanded section */}
                  <div className="flex justify-center mt-12 pb-6">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        window.scrollTo({
                          top: cardRef => cardRef ? 0 : 0, // Fallback
                          behavior: "smooth"
                        });
                      }}
                      className="btn-ghost-gold px-8 py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2"
                    >
                      {t("event_networking.close_program")} <ChevronUp size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
