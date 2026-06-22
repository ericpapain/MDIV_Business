import { motion } from "framer-motion";
import { TimelineCard } from "./TimelineCard";
import { AnimatedGraph } from "./AnimatedGraph";
import { ChampagneBubbles } from "./ChampagneBubbles";
import { AudioWave } from "./AudioWave";
import { Utensils, TrendingUp, GlassWater, Mic, Sparkles } from "lucide-react";

import expDining from "@/assets/original/diner.jpg";
import eventSummit from "@/assets/original/Pitch.jpg";
import destChampagne from "@/assets/original/dest-champagne.png";
import eventNetworking from "@/assets/original/tallk.jpg";

export function TimelineSection() {
  const steps = [
    {
      time: "20:00 - Début",
      badge: "Gastronomie",
      title: "🍽️ Menu Invest",
      description: "Entrée + Plat + Dessert + Vin + Coupe. Une expérience gastronomique d'exception conçue pour favoriser les premiers échanges informels dans un cadre d'exception.",
      image: expDining,
      icon: Utensils,
      details: "Tarif exclusif : 35€"
    },
    {
      time: "21:45",
      badge: "Stratégie",
      title: "📈 Levée de Fonds",
      description: "Présentation stratégique FRUL'IMMO et pitch exclusif sur les opportunités d'investissement et levées de fonds immobilières à fort rendement.",
      image: eventSummit,
      specialAnimation: <AnimatedGraph />,
      icon: TrendingUp,
    },
    {
      time: "22:30",
      badge: "Dégustation",
      title: "🍾 Champagne Sylvain Dautel",
      description: "Dégustation privée et présentation de la nouvelle cuvée Sylvain Dautel. Échangez vos impressions dans une ambiance raffinée et pétillante.",
      image: destChampagne,
      specialAnimation: <ChampagneBubbles />,
      icon: GlassWater,
    },
    {
      time: "23:15",
      badge: "Pitchs",
      title: "🎤 Pitch Entreprises",
      description: "Présentations éclair des entreprises et projets clés de l'écosystème participants à la soirée. Identifiez vos synergies instantanément.",
      image: eventNetworking,
      specialAnimation: <AudioWave />,
      icon: Mic,
    },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-16 text-white">
      {/* Title */}
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl mb-4 gold-text">
          Le Déroulement du Sommet
        </h2>
        <p className="text-sm text-white/60 max-w-lg mx-auto">
          Une soirée orchestrée à la minute pour optimiser vos connexions et maximiser vos opportunités.
        </p>
      </div>

      {/* Vertical Timeline container */}
      <div className="relative">
        {/* Central Vertical Line (Golden line drawing top-to-bottom) */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/10 pointer-events-none" />
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
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                  <TimelineCard
                    time={step.time}
                    badge={step.badge}
                    title={step.title}
                    description={step.description}
                    image={step.image}
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

        {/* Final Celebration Card (Session Networking) */}
        <div className="relative mt-20 flex flex-col items-center">
          {/* Final Pulse Node */}
          <div className="absolute left-4 md:left-1/2 top-0 w-10 h-10 rounded-full bg-gold/20 border-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.6)] -translate-x-1/2 flex items-center justify-center z-30">
            <Sparkles size={16} className="text-gold animate-spin" style={{ animationDuration: "8s" }} />
          </div>

          <div className="w-full max-w-xl pl-12 md:pl-0 pt-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full bg-gradient-to-br from-[#1B2DBF]/20 via-[#05071F]/40 to-[#293FFF]/10 backdrop-blur-lg rounded-sm border border-gold/30 p-8 text-center relative overflow-hidden group shadow-[0_10px_40px_rgba(27,45,191,0.2)]"
            >
              {/* Shimmer background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <h3 className="font-display text-2xl md:text-3xl text-gold mb-3">
                🤝 Session Networking & Clôture
              </h3>
              <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed mb-6 font-light">
                Rencontres qualifiées, mises en relation par IA avec investisseurs, partenaires et entrepreneurs leaders de l'immobilier.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">Investisseurs</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">Partenaires</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">Propriétaires</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
