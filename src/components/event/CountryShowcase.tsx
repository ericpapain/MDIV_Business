import { motion } from "framer-motion";

interface Country {
  name: string;
  flag: string;
  code: string;
  desc: string;
  colors: string[]; // flag stripe colors for the corner accent
}

export function CountryShowcase() {
  const countries: Country[] = [
    { name: "France", flag: "🇫🇷", code: "FR", desc: "Family offices, entrepreneurs technologiques et investisseurs immobiliers.", colors: ["#002395", "#FFFFFF", "#ED2939"] },
    { name: "Belgique", flag: "🇧🇪", code: "BE", desc: "Dirigeants de holdings privées et promoteurs immobiliers transfrontaliers.", colors: ["#2D2926", "#FDDA24", "#C8102E"] },
    { name: "Luxembourg", flag: "🇱🇺", code: "LU", desc: "Gestionnaires de fonds, investisseurs en private equity et conseils.", colors: ["#EF3340", "#FFFFFF", "#00A3E0"] },
    { name: "Suisse", flag: "🇨🇭", code: "CH", desc: "Family offices de Genève et Zurich, gestionnaires de fortune indépendants.", colors: ["#DA291C", "#FFFFFF", "#DA291C"] },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
          Réseau d'Affaires Connecté
        </span>
        <h3 className="font-display text-lg text-white mt-1">
          Délégations Internationales Présentes
        </h3>
      </div>

      {/* Horizontal Layout for Desktop / horizontal slider on Mobile */}
      <div className="flex w-full gap-4 overflow-x-auto pb-4 pt-1 px-2 scrollbar-none snap-x snap-mandatory lg:overflow-x-visible lg:pb-0 lg:flex-row lg:justify-center">
        {countries.map((country, idx) => (
          <motion.div
            key={country.code}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex-shrink-0 w-64 snap-center bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-gold/40 p-5 rounded-sm flex flex-col gap-3 transition-colors duration-300 relative group overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Flag color accent — top-right corner */}
            <div className="absolute top-0 right-0 flex h-1.5 w-16 rounded-bl-sm overflow-hidden pointer-events-none">
              {country.colors.map((color, ci) => (
                <div key={ci} className="flex-1 h-full" style={{ backgroundColor: color }} />
              ))}
            </div>

            {/* Glow gold survol */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/0 group-hover:to-gold/[0.06] transition-all duration-300 pointer-events-none" />
            <div className="absolute -inset-px rounded-sm border border-gold/0 group-hover:border-gold/30 transition-all duration-300 pointer-events-none" />

            <div className="flex items-center gap-3">
              {/* Flag Emoji with animation */}
              <motion.span
                animate={{
                  y: [0, -2, 0],
                }}
                transition={{
                  duration: 2.5 + (idx % 2),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-3xl select-none"
              >
                {country.flag}
              </motion.span>
              <div>
                <h4 className="font-display text-base text-white tracking-wide font-medium">
                  {country.name}
                </h4>
                <span className="text-[9px] font-mono tracking-widest text-gold/80 font-bold uppercase">
                  Délégation {country.code}
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light mt-1">
              {country.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mobile Indicator */}
      <div className="flex justify-center gap-1 mt-1 lg:hidden">
        {countries.map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
        ))}
      </div>
    </div>
  );
}
