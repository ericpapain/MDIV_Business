import { motion } from "framer-motion";
import { TimelineCard } from "./TimelineCard";
import { InvestmentGraph } from "./InvestmentGraph";
import { AudioWave } from "./AudioWave";
import { AnimatedNetwork } from "./AnimatedNetwork";
import { ChampagneBubbles } from "./ChampagneBubbles";
import { GoldParticles } from "./GoldParticles";
import { Handshake, Crown, Utensils, TrendingUp, Mic, Globe, GlassWater } from "lucide-react";

// Image Imports removed

export function ProgramTimeline() {
  const jour1Steps = [
    {
      time: "15:00 - Accueil",
      badge: "Entrée",
      title: "🤝 Accueil Privé",
      // description: "Accueil personnalisé des participants à l'hôtel, remise des accès du cercle, cocktail de bienvenue et premier networking informel dans le salon de la Table d'Essoyes.",
      icon: Handshake,
    },
    {
      time: "17:30",
      badge: "Cercle",
      title: "👑 Cercle Fondateur",
      // description: "Présentation des membres, table ronde d'investisseurs, exposé de la vision stratégique du club d'affaires et définition des synergies communes.",
      icon: Crown,
    },
    {
      time: "20:00",
      badge: "Gastronomie",
      title: "🍽️ Dîner Prestige",
      // description: "Repas gastronomique d'exception avec accord mets et champagnes. Échanges intimistes entre leaders et discussions libres autour de projets de prestige.",
      icon: Utensils,
    },
  ];

  const jour2Steps = [
    {
      time: "09:30 - Matinée",
      badge: "Private Equity",
      title: "📈 Opportunités d'Investissement",
      // description: "Présentation des dossiers d'investissement présélectionnés, levées de fonds stratégiques et opportunités de co-investissement immobilier.",
      specialAnimation: <InvestmentGraph />,
      icon: TrendingUp,
    },
    {
      time: "11:30",
      badge: "Pitches",
      title: "🎤 Pitch Entrepreneurs",
      // description: "Sessions de pitchs des fondateurs de projets d'excellence à fort rendement. Évaluation en direct et sessions de questions-réponses.",
      specialAnimation: <AudioWave />,
      icon: Mic,
    },
    {
      time: "14:30 - Après-midi",
      badge: "Réseau Global",
      title: "🌍 Networking International",
      // description: "Sessions de connexions et de mise en relation ciblées entre les délégations de France, Belgique, Luxembourg et Suisse.",
      specialAnimation: <AnimatedNetwork />,
      icon: Globe,
    },
    {
      time: "17:00 - Clôture",
      badge: "Célébration",
      title: "🥂 Clôture Prestige",
      // description: "Dégustation finale, cocktail de clôture et mise en relation directe des parties intéressées pour matérialiser les collaborations initiées.",
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
          Le Programme du Séjour
        </h2>
        <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
          Deux jours exclusifs conçus pour marier prestige champenois, connexions stratégiques et opportunités financières.
        </p>
      </div>

      {/* --- JOUR 1 --- */}
      <div className="mb-20">
        <div className="flex justify-center mb-10">
          <div className="px-5 py-2 bg-gradient-to-r from-gold/25 via-gold/10 to-gold/25 border border-gold/40 rounded-sm text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Jour 1</span>
            <h3 className="font-display text-base text-white mt-0.5">27 Juin 2026 • Accueil & Prestige</h3>
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
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Jour 2</span>
            <h3 className="font-display text-base text-white mt-0.5">28 Juin 2026 • Finance & Réseau</h3>
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
    </div>
  );
}
