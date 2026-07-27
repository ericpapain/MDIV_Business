import { motion } from "framer-motion";
import { TimelineCard } from "./TimelineCard";
import { AnimatedGraph } from "./AnimatedGraph";
import { ChampagneBubbles } from "./ChampagneBubbles";
import { AudioWave } from "./AudioWave";
import { Utensils, TrendingUp, GlassWater, Mic, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function TimelineSection() {
  const { t } = useLanguage();

  const steps = [
    {
      time: t("event_networking.steps.0.time"),
      badge: t("event_networking.steps.0.badge"),
      title: t("event_networking.steps.0.title"),
      icon: Utensils,
      details: t("event_networking.steps.0.details")
    },
    {
      time: t("event_networking.steps.1.time"),
      badge: t("event_networking.steps.1.badge"),
      title: t("event_networking.steps.1.title"),
      specialAnimation: <AnimatedGraph />,
      icon: TrendingUp,
    },
    {
      time: t("event_networking.steps.2.time"),
      badge: t("event_networking.steps.2.badge"),
      title: t("event_networking.steps.2.title"),
      specialAnimation: <ChampagneBubbles />,
      icon: GlassWater,
    },
    {
      time: t("event_networking.steps.3.time"),
      badge: t("event_networking.steps.3.badge"),
      title: t("event_networking.steps.3.title"),
      specialAnimation: <AudioWave />,
      icon: Mic,
    },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto px-0 sm:px-4 py-8 md:py-16 text-foreground">
      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl mb-4 gold-text">
          {t("event_networking.timeline_title")}
        </h2>
        <p className="text-sm text-foreground/60 max-w-lg mx-auto">
          {t("event_networking.timeline_desc")}
        </p>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative">
        {/* Central Vertical Line (Golden line drawing top-to-bottom) */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-foreground/10 pointer-events-none" />
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ originY: 0 }}
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-gold via-gold-light to-primary-foreground pointer-events-none shadow-[0_0_10px_rgba(212,175,55,0.4)]"
        />

        {/* Timeline steps */}
        <div className="space-y-16">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isLeft = idx % 2 === 0;

            return (
              <div
                key={idx}
                className={`relative flex flex-col md:flex-row items-stretch w-full ${
                  isLeft ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline node icon */}
                <div className="absolute left-4 md:left-1/2 top-10 w-9 h-9 rounded-full bg-[#05071F] border border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] -translate-x-1/2 flex items-center justify-center z-30 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent size={14} className="text-gold" />
                </div>

                {/* Left/Right content wrappers */}
                <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-8">
                  <TimelineCard
                    time={step.time}
                    badge={step.badge}
                    title={step.title}
                    description={step.description}
                    icon={step.icon}
                    specialAnimation={step.specialAnimation}
                    delay={idx * 0.15}
                  />
                  {step.details && (
                    <div className="mt-3 pl-1 md:pl-8 text-xs text-gold/80 font-mono font-medium">
                      {step.details}
                    </div>
                  )}
                </div>

                {/* Empty spacer for opposite column in Desktop layout */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>


      </div>
    </div>
  );
}
