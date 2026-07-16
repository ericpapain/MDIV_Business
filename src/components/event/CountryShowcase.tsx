import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface Member {
  name: string;
  role: string;
  icon: string;
}

interface Country {
  name: string;
  flag: string;
  code: string;
  members: Member[];
  colors: string[]; // flag stripe colors for the corner accent
}

export function CountryShowcase() {
  const { t } = useLanguage();

  const countries: Country[] = [
    { 
      name: t("country_showcase.countries.France"), flag: "🇫🇷", code: "FR", 
      members: [
        { name: "Micke", role: t("country_showcase.roles.micke"), icon: "👨🏿‍💼" },
        { name: "Eric", role: t("country_showcase.roles.eric"), icon: "👨🏿‍💼" },
        { name: "Pierre", role: t("country_showcase.roles.pierre"), icon: "👨‍💼" },
        { name: "Sibley", role: t("country_showcase.roles.sibley"), icon: "👨‍💼" },
      ],
      colors: ["#002395", "#FFFFFF", "#ED2939"] 
    },
    { 
      name: t("country_showcase.countries.Belgique"), flag: "🇧🇪", code: "BE", 
      members: [
        { name: "Cerise", role: t("country_showcase.roles.cerise"), icon: "👩‍💼" },
        { name: "Rémy", role: t("country_showcase.roles.remy"), icon: "👨‍💼" },
        { name: "Hakan", role: t("country_showcase.roles.hakan"), icon: "👨‍💼" },
      ],
      colors: ["#2D2926", "#FDDA24", "#C8102E"] 
    },
    { 
      name: t("country_showcase.countries.Luxembourg"), flag: "🇱🇺", code: "LU", 
      members: [
        { name: "Kassa", role: t("country_showcase.roles.kassa"), icon: "👨‍💼" },
      ],
      colors: ["#EF3340", "#FFFFFF", "#00A3E0"] 
    },
    { 
      name: t("country_showcase.countries.Suisse"), flag: "🇨🇭", code: "CH", 
      members: [
        { name: "Mathilda Guyot", role: t("country_showcase.roles.mathilda"), icon: "👩‍💼" },
      ],
      colors: ["#DA291C", "#FFFFFF", "#DA291C"] 
    },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold">
          {t("country_showcase.eyebrow")}
        </span>
        <h3 className="font-display text-lg text-white mt-1">
          {t("country_showcase.title")}
        </h3>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-1 px-2">
        {countries.map((country, idx) => (
          <motion.div
            key={country.code}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="w-full bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-gold/40 p-5 rounded-sm flex flex-col gap-3 transition-colors duration-300 relative group overflow-hidden"
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
                  {t("country_showcase.delegation")} {country.code}
                </span>
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-white/10 pt-3 relative z-10">
              {country.members.map((member, mIdx) => (
                <div key={mIdx} className="flex items-start gap-3">
                  <div className="text-xl mt-0.5">{member.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-display font-semibold text-white tracking-wide">{member.name}</span>
                    <span className="text-[9px] text-white/60 leading-snug mt-0.5 font-medium">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}
