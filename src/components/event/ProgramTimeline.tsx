import { motion } from "framer-motion";
import { TimelineCard } from "./TimelineCard";
import { InvestmentGraph } from "./InvestmentGraph";
import { AudioWave } from "./AudioWave";
import { AnimatedNetwork } from "./AnimatedNetwork";
import { ChampagneBubbles } from "./ChampagneBubbles";
import { GoldParticles } from "./GoldParticles";
import { Handshake, Crown, Utensils, TrendingUp, Mic, Globe, GlassWater } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// Image Imports removed

export function ProgramTimeline() {
  const { t } = useLanguage();
  const jour1Steps = [
    {
      time: t("event_champagne.timeline.j1_0.time"),
      badge: t("event_champagne.timeline.j1_0.badge"),
      title: t("event_champagne.timeline.j1_0.title"),
      description: t("event_champagne.timeline.j1_0.description"),
      icon: Handshake,
    },
    {
      time: t("event_champagne.timeline.j1_1.time"),
      badge: t("event_champagne.timeline.j1_1.badge"),
      title: t("event_champagne.timeline.j1_1.title"),
      description: t("event_champagne.timeline.j1_1.description"),
      icon: Utensils,
    },
    {
      time: t("event_champagne.timeline.j1_2.time"),
      badge: t("event_champagne.timeline.j1_2.badge"),
      title: t("event_champagne.timeline.j1_2.title"),
      description: t("event_champagne.timeline.j1_2.description"),
      icon: Crown,
    },
    {
      time: t("event_champagne.timeline.j1_3.time"),
      badge: t("event_champagne.timeline.j1_3.badge"),
      title: t("event_champagne.timeline.j1_3.title"),
      description: t("event_champagne.timeline.j1_3.description"),
      icon: Globe,
    },
  ];

  const jour2Steps = [
    {
      time: t("event_champagne.timeline.j2_0.time"),
      badge: t("event_champagne.timeline.j2_0.badge"),
      title: t("event_champagne.timeline.j2_0.title"),
      description: t("event_champagne.timeline.j2_0.description"),
      specialAnimation: <ChampagneBubbles />,
      icon: GlassWater,
    },
  ];

  const TimelineWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="relative">
        {/* Draw vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/10 pointer-events-none" />
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{ originY: 0 }}
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold via-goldLight to-[#0B153B] pointer-events-none shadow-[0_0_8px_rgba(231,196,106,0.3)]"
        />
        {children}
      </div>
    );
  };

  return (
    <div className="w-full text-white">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="font-display text-2xl md:text-4xl mb-3 gold-text">
          {t("event_champagne.timeline.title")}
        </h2>
        <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
          {t("event_champagne.timeline.desc")}
        </p>
      </div>

      {/* --- JOUR 1 --- */}
      <div className="mb-20">
        <div className="flex justify-center mb-10">
          <div className="px-5 py-2 bg-gradient-to-r from-gold/25 via-gold/10 to-gold/25 border border-gold/40 rounded-sm text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t("event_champagne.timeline.day1")}</span>
            <h3 className="font-display text-base text-white mt-0.5">{t("event_champagne.timeline.day1_date")}</h3>
          </div>
        </div>

        <TimelineWrapper>
          <div className="space-y-12">
            {jour1Steps.map((step, idx) => {
              const IconComp = step.icon;
              const isLeft = idx % 2 === 0;

              return (
                <div key={idx} className={`relative flex flex-col md:flex-row items-stretch w-full ${isLeft ? "md:flex-row-reverse" : ""}`}>
                  <div className="absolute left-4 md:left-1/2 top-10 w-8 h-8 rounded-full bg-[#03081D] border border-gold shadow-[0_0_10px_rgba(212,175,55,0.15)] -translate-x-1/2 flex items-center justify-center z-30">
                    <IconComp size={13} className="text-gold" />
                  </div>
                  <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-8">
                    <TimelineCard
                      time={step.time}
                      badge={step.badge}
                      title={step.title}
                      description={step.description}
                      icon={step.icon}
                      delay={idx * 0.12}
                    />
                  </div>
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </TimelineWrapper>
      </div>

      {/* --- JOUR 2 --- */}
      <div>
        <div className="flex justify-center mb-10">
          <div className="px-5 py-2 bg-gradient-to-r from-gold/25 via-gold/10 to-gold/25 border border-gold/40 rounded-sm text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t("event_champagne.timeline.day2")}</span>
            <h3 className="font-display text-base text-white mt-0.5">{t("event_champagne.timeline.day2_date")}</h3>
          </div>
        </div>

        <TimelineWrapper>
          <div className="space-y-12">
            {jour2Steps.map((step, idx) => {
              const IconComp = step.icon;
              const isLeft = idx % 2 === 0;

              return (
                <div key={idx} className={`relative flex flex-col md:flex-row items-stretch w-full ${isLeft ? "md:flex-row-reverse" : ""}`}>
                  <div className="absolute left-4 md:left-1/2 top-10 w-8 h-8 rounded-full bg-[#03081D] border border-gold shadow-[0_0_10px_rgba(212,175,55,0.15)] -translate-x-1/2 flex items-center justify-center z-30">
                    <IconComp size={13} className="text-gold" />
                  </div>
                  <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-8">
                    <TimelineCard
                      time={step.time}
                      badge={step.badge}
                      title={step.title}
                      description={step.description}
                      icon={step.icon}
                      specialAnimation={step.specialAnimation}
                      delay={idx * 0.12}
                    />
                  </div>
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </TimelineWrapper>
      </div>

      {/* --- OBJECTIF ET COORDINATION --- */}
      <div className="mt-20 max-w-3xl mx-auto space-y-8">
        <div className="p-8 md:p-10 bg-white/[0.02] border border-gold/20 rounded-sm backdrop-blur-md">
          <h3 className="font-display text-xl md:text-2xl gold-text mb-4 text-center">Objectif du Séjour</h3>
          <p className="text-sm md:text-base text-white/80 leading-relaxed text-center font-light">
            Créer des connexions durables entre entrepreneurs, investisseurs et décideurs afin de favoriser l’émergence de collaborations, d’opportunités d’affaires et de projets à dimension internationale.
          </p>
        </div>

        <div className="p-8 md:p-10 bg-white/[0.02] border border-gold/20 rounded-sm backdrop-blur-md text-center">
          <h3 className="font-display text-xl md:text-2xl gold-text mb-4">Coordination du Séjour</h3>
          <p className="text-base text-white font-medium mb-3">Micke Dimvula</p>
          <div className="flex flex-col gap-2 items-center justify-center text-sm text-white/70">
            <a href="tel:+33666078870" className="flex items-center gap-2 hover:text-gold transition-colors">
              <span>📞</span> 06 66 07 88 70
            </a>
            <a href="mailto:m.divcsltg@gmail.com" className="flex items-center gap-2 hover:text-gold transition-colors">
              <span>✉️</span> m.divcsltg@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
