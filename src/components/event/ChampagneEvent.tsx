import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Lock, Send, Sparkles } from "lucide-react";
import { GoldParticles } from "./GoldParticles";
import { LuxuryCountdown } from "./LuxuryCountdown";
import { CountryShowcase } from "./CountryShowcase";
import { ProgramTimeline } from "./ProgramTimeline";
import destChampagne from "@/assets/original/dest-champagne.png";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export function ChampagneEvent() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();


  return (
    <div className="relative w-full overflow-hidden bg-[#03081D] py-10 md:py-16">
      <div className="container mx-auto px-0 sm:px-4">
        {/* Main Champagne Event Wrapper Card */}
        <motion.div
          layout
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className={`relative w-full rounded-sm overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 ${
            isOpen ? "min-h-[140vh] h-auto" : "h-auto lg:h-[55vh] min-h-[650px] lg:min-h-[400px]"
          }`}
        >
          {/* Backdrop Ken Burns zooming image */}
          <div className="absolute inset-0 z-0">
            <motion.img
              src={destChampagne}
              alt="Séjour Fondateur Champagne"
              animate={{
                scale: [1.02, 1.07],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              className="w-full h-full object-cover object-center opacity-40"
            />
            {/* Dark deep midnight blue & gold gradient overlay */}
            <div className="absolute inset-0 bg-[#03081D]/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03081D] via-[#03081D]/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#03081D]/90 via-[#03081D]/40 to-transparent" />
          </div>

          {/* Golden sweep light animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(231, 196, 106, 0.06) 50%, transparent)",
              }}
              className="absolute inset-y-0 w-1/2 -skew-x-12"
            />
          </div>

          {/* Floating Gold Dust Particles */}
          <GoldParticles />

          {/* Content container */}
          <div className="relative z-20 h-full flex flex-col justify-between p-4 sm:p-6 md:p-14 overflow-y-auto scrollbar-none">
            {/* Top Row: Event Badges */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-goldLight animate-pulse-soft" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-goldLight font-bold">
                  {t("event_champagne.eyebrow")}
                </span>
              </div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[9px] uppercase tracking-[0.2em] font-semibold text-white/80 backdrop-blur-sm">
                {t("event_champagne.badge")}
              </div>
            </div>

            {/* Middle Row: Content Text & Countdown */}
            <div className="my-auto py-8 w-full flex flex-col gap-8">
              {/* Title & Subtitle (constrained to max-w-4xl) */}
              <div className="max-w-4xl flex flex-col gap-3">
                {/* Progressive Title Fade-in */}
                <div className="space-y-1 md:space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-goldLight font-bold"
                  >
                    {t("event_champagne.title_small")}
                  </motion.div>
                  
                  <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-none text-white tracking-tight">
                    <motion.span
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.5 }}
                      className="block"
                    >
                      {t("event_champagne.title1")}
                    </motion.span>
                    
                    <motion.span
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.8 }}
                      className="block font-serif italic text-gold-light mt-0.5 md:mt-1"
                    >
                      {t("event_champagne.title2")}
                    </motion.span>
                  </h2>
                </div>

                {/* Subtitle with fade-up */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 1.1 }}
                  className="text-xs md:text-sm text-white/70 max-w-2xl leading-relaxed font-light"
                >
                  {t("event_champagne.desc")}
                </motion.p>
              </div>

              {/* Interactive Countries Display */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="w-full mt-2"
              >
                <CountryShowcase />
              </motion.div>

              {/* Countdown Flip Clock & Date (constrained to max-w-4xl) */}
              <div className="max-w-4xl w-full">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-6 mt-4 border-t border-white/5 pt-6"
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold mb-2">
                      {t("event_champagne.meta_label")}
                    </div>
                    <div className="font-display text-lg md:text-xl text-white font-bold tracking-wide">
                      {t("event_champagne.date")}
                    </div>
                    <div className="text-[10px] text-goldLight/80 font-mono mt-0.5">
                      {t("event_champagne.location")}
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden sm:block" />
                  <LuxuryCountdown />
                </motion.div>
              </div>
            </div>

            {/* Bottom Row: CTA Button */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-gold group px-8 py-4 text-xs uppercase tracking-[0.22em] rounded-sm font-semibold flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all duration-300 z-30"
                style={{
                  boxShadow: "0 10px 30px rgba(231, 196, 106, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {isOpen ? (
                  <>
                    {t("event_champagne.hide_program")} <ChevronUp size={14} className="animate-bounce" />
                  </>
                ) : (
                  <>
                    {t("event_champagne.show_program")} <ChevronDown size={14} className="animate-bounce" />
                  </>
                )}
              </button>

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">
                {t("event_champagne.footer_note")}
              </p>
            </div>

            {/* Expanded Content Area: Timeline & Booking Card */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mt-16 overflow-hidden border-t border-white/10 pt-12"
                >
                  {/* Timeline */}
                  <ProgramTimeline />

                  {/* Booking Invitation Section */}
                  <div className="mt-20 max-w-xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="bg-[#0b153b]/40 backdrop-blur-md rounded-sm border border-gold/30 p-8 text-center relative overflow-hidden shadow-[0_15px_40px_rgba(212,175,55,0.05)] group"
                    >
                      {/* Animated gold border shine */}
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                      
                      {/* Subtle circular glow halo */}
                      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

                      <Lock className="mx-auto text-goldLight mb-4 animate-pulse-soft" size={24} />
                      <h3 className="font-display text-xl md:text-2xl text-white mb-2 font-medium">
                        {t("event_champagne.booking.title")}
                      </h3>
                      <p className="text-xs text-white/60 mb-6 max-w-sm mx-auto leading-relaxed">
                        {t("event_champagne.booking.desc")}
                      </p>

                      <span
                        className="w-full py-3.5 text-[10px] uppercase tracking-[0.2em] rounded-sm font-semibold flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 text-white/30 cursor-not-allowed select-none"
                      >
                        {t("event_champagne.booking.btn")} <Send size={11} className="opacity-30" />
                      </span>
                    </motion.div>
                  </div>

                  {/* Collapse Button */}
                  <div className="flex justify-center mt-12 pb-6">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="btn-ghost-gold px-8 py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2"
                    >
                      {t("event_champagne.hide_program")} <ChevronUp size={12} />
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
