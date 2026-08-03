import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, ArrowRight, Plane, MapPin, Search, Users, Compass, Sparkles, Hexagon, Circle, Sunrise, Coffee, Camera } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function SejoursBNE() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const rotateCompass = useTransform(scrollYProgress, [0, 1], [0, 360]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 bg-background text-foreground relative overflow-hidden selection:bg-gold/30">
      
      {/* ── PARALLAX BACKGROUND & GLOWING ORBS ── */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-gold/5 via-gold/2 to-transparent" />
        <div className="absolute top-20 right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px] bg-gold" />
        <div className="absolute top-[40%] left-[0%] w-[400px] h-[400px] rounded-full opacity-[0.02] blur-[100px] bg-primary" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.02] blur-[150px] bg-emerald-500" />
      </motion.div>

      {/* ── FLOATING ABSTRACT SHAPES ── */}
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-32 left-10 text-gold/5 pointer-events-none"
      >
        <Hexagon size={180} strokeWidth={0.2} />
      </motion.div>
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 right-10 text-gold/10 pointer-events-none"
      >
        <Circle size={220} strokeWidth={0.2} strokeDasharray="4 4" />
      </motion.div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Navigation / Back */}
        <div className="mb-10">
          <Link to="/offres" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            <span className="relative overflow-hidden">
              <span className="block group-hover:-translate-y-full transition-transform duration-300">Retour aux offres</span>
              <span className="block absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-gold">Retour aux offres</span>
            </span>
          </Link>
        </div>

        {/* ── HERO SECTION ── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 relative"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.2em] relative overflow-hidden group cursor-default" 
            style={{ background: "hsl(42 60% 54% / 0.1)", color: "hsl(42 60% 54%)", border: "1px solid hsl(42 60% 54% / 0.25)" }}
          >
            <div className="absolute inset-0 bg-gold/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plane size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 relative z-10" /> 
            <span className="relative z-10">{isEn ? "BNE Immersive Retreats" : "Séjours immersifs BNE"}</span>
          </motion.div>
          
          <h1 className="font-display text-[44px] md:text-[56px] lg:text-[68px] mb-4 leading-[1.1]">
            {isEn ? "Business travel, " : "Le voyage d'affaires, "} <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 gold-text italic pr-4">
                {isEn ? "reinvented." : "réinventé."}
              </span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute bottom-2 left-0 h-3 bg-gold/20 -z-0 -rotate-2" 
              />
            </span>
          </h1>
          <p className="text-lg md:text-xl font-serif italic text-muted-foreground/80 max-w-2xl mx-auto">
            {isEn ? "Travel differently. Develop sustainably." : "Voyager autrement. Développer durablement."}
          </p>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-gold/50 to-transparent mx-auto mt-12" 
          />
        </motion.div>

        {/* ── CONTENT BODY ── */}
        <div className="space-y-8">
          
          <motion.div 
            variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="prose prose-invert prose-lg max-w-none prose-p:text-foreground/70 prose-p:leading-relaxed"
          >
            <motion.p variants={itemVars} className="text-center max-w-3xl mx-auto text-xl font-light mb-4">
              {isEn ? (
                <>
                  For a long time, business trips have consisted of chaining meetings, trade shows, and business cards.<br />
                  At BNE, we chose another approach.
                </>
              ) : (
                <>
                  Pendant longtemps, les voyages d'affaires ont consisté à enchaîner les rendez-vous, les salons professionnels et les cartes de visite.<br />
                  Chez BNE, nous avons choisi une autre approche.
                </>
              )}
            </motion.p>
            <motion.p variants={itemVars} className="text-center max-w-3xl mx-auto text-xl font-light mb-10">
              {isEn 
                ? "We believe that the best opportunities arise when leaders take the time to understand a territory, its key players, its economic culture, and the human relationships that compose it."
                : "Nous pensons que les meilleures opportunités naissent lorsque les dirigeants prennent le temps de comprendre un territoire, ses acteurs, sa culture économique et les relations humaines qui le composent."}
            </motion.p>

            {/* BLOCK 1: DECOUVERTE */}
            <motion.div 
              variants={itemVars}
              whileHover={{ scale: 1.01 }}
              className="my-10 p-6 md:p-8 rounded-3xl glass-strong border border-gold/20 shadow-[0_20px_60px_-15px_rgba(197,160,89,0.15)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-noise opacity-[0.03]" />
              <div className="absolute -right-20 -bottom-20 text-gold/5 group-hover:text-gold/10 transition-colors duration-700 pointer-events-none -rotate-12">
                <Globe size={300} strokeWidth={0.2} />
              </div>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-20 h-20 shrink-0 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30 group-hover:bg-gold/20 transition-colors duration-500">
                  <MapPin className="text-gold w-10 h-10 group-hover:animate-bounce-subtle" />
                </div>
                <div>
                  <h2 className="text-3xl mt-0 mb-4 font-display text-white">
                    Découvrir un territoire avant d'y développer son activité
                  </h2>
                  <p className="mb-0 text-foreground/80">
                    Chaque territoire possède sa propre culture entrepreneuriale.
                    Développer son entreprise en Suisse, en Belgique, au Luxembourg ou demain en Afrique ne consiste pas simplement à trouver des clients.
                    Il faut comprendre les habitudes économiques, les réseaux locaux, les institutions, les codes relationnels et les personnes qui font réellement vivre l'écosystème.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* BLOCK 2 & 3: GRILLES ASYMETRIQUES */}
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 my-10">
              
              {/* RENCONTRES */}
              <motion.div 
                variants={itemVars}
                className="bg-background/40 backdrop-blur-md border border-white/5 hover:border-gold/30 p-6 rounded-3xl relative overflow-hidden group transition-all duration-500"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <Users className="text-gold w-10 h-10 mb-6 relative z-10" />
                <h3 className="text-2xl font-display text-white mb-4 mt-0 relative z-10">{isEn ? "Strategic Encounters" : "Rencontres stratégiques"}</h3>
                <p className="text-foreground/80 mb-0 relative z-10 text-sm">
                  {isEn 
                    ? "No 'speed dating' style networking. We organize qualified meetings with local economic and institutional players."
                    : "Pas de networking chronométré. Nous organisons des rencontres qualifiées avec des acteurs économiques et institutionnels locaux."}
                </p>
              </motion.div>

              {/* EXPERIENCE */}
              <motion.div 
                variants={itemVars}
                className="bg-background/40 backdrop-blur-md border border-white/5 hover:border-gold/30 p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 flex flex-col justify-center"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                  <Sunrise size={200} />
                </div>
                
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" /> {isEn ? "The philosophy" : "La philosophie"}
                  </div>
                  <h2 className="text-3xl mt-0 mb-6 font-display text-white">
                    {isEn ? "Immersion before transaction" : "L'immersion avant la transaction"}
                  </h2>
                  <p className="text-foreground/80 mb-0 leading-relaxed text-sm">
                    {isEn 
                      ? "In a hyper-connected world, true value is found in physical encounters and the discovery of local ecosystems. BNE Immersive Retreats are designed for leaders who want to broaden their horizons, understand new markets, and create strong connections before even talking about business."
                      : "Dans un monde hyper-connecté, la vraie valeur se trouve dans la rencontre physique et la découverte d'écosystèmes locaux. Les séjours immersifs BNE sont conçus pour les dirigeants qui souhaitent élargir leur horizon, comprendre de nouveaux marchés et créer du lien fort avant même de parler affaires."}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* BLOCK 4: CE QUE LE PARTICIPANT CHERCHE */}
            <motion.div variants={itemVars} className="my-10 relative">
              <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent to-gold/30" />
              <h2 className="text-3xl text-center font-display mb-8 text-white">
                {isEn ? "What every participant is looking for" : "Ce que chaque participant vient chercher"}
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Sparkles, text: isEn ? "Inspiring environments" : "Des cadres inspirants" },
                  { icon: Sunrise, text: isEn ? "Authentic moments" : "Des moments d'authenticité" },
                  { icon: Hexagon, text: isEn ? "A new vision of business" : "Une nouvelle vision du business" },
                  { icon: Circle, text: isEn ? "Lasting relationships" : "Des relations durables" },
                  { icon: Coffee, text: isEn ? "Informal exchanges" : "Des échanges informels" },
                  { icon: Camera, text: isEn ? "Unique memories" : "Des souvenirs uniques" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5, borderColor: "rgba(197,160,89,0.5)" }}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-gold/[0.05] transition-all duration-300 flex items-start gap-4 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-gold/20 transition-all">
                      <span className="text-gold font-bold text-xs">{i+1}</span>
                    </div>
                    <span className="text-sm font-medium leading-tight pt-1">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* BLOCK 5 & 6: OPPORTUNITES ET VISIBILITE */}
            <div className="grid md:grid-cols-2 gap-6 my-10">
              <motion.div 
                variants={itemVars}
                className="group p-6 rounded-3xl relative overflow-hidden border border-transparent hover:border-gold/20 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search className="text-gold w-8 h-8 mb-6" />
                <h3 className="text-xl font-display text-white mb-4 mt-0">{isEn ? "Creation of Opportunities" : "Création d'opportunités"}</h3>
                <p className="text-sm mb-0">
                  {isEn 
                    ? "Trust acts as a catalyst. BNE retreats are designed so that the right people meet in an environment conducive to business development."
                    : "La confiance agit comme un accélérateur. Les séjours BNE sont pensés pour que les bonnes personnes se croisent dans un cadre propice au développement."}
                </p>
              </motion.div>
              
              <motion.div 
                variants={itemVars}
                className="group p-6 rounded-3xl relative overflow-hidden border border-transparent hover:border-gold/20 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Globe className="text-gold w-8 h-8 mb-6" />
                <h3 className="text-xl font-display text-white mb-4 mt-0">{isEn ? "Radiant Visibility" : "Visibilité rayonnante"}</h3>
                <p className="text-sm mb-0">
                  {isEn 
                    ? "Through the content produced and the network's communications, leaders gain visibility. The retreat becomes a lever for attractiveness and economic development."
                    : "Grâce aux contenus produits et aux communications du réseau, les dirigeants gagnent en visibilité. Le séjour devient un levier d'attractivité et de développement économique."}
                </p>
              </motion.div>
            </div>

          </motion.div>
          
          {/* ── CONCLUSION BLOCK ── */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-10 text-center relative py-12 group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent blur-xl pointer-events-none group-hover:via-gold/10 transition-colors duration-1000" />
            
            {/* Creative Objects: Interactive Orbital System */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full pointer-events-none opacity-20 group-hover:opacity-70 transition-opacity duration-1000">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-[280px] h-[280px] rounded-full border border-gold/30 border-dashed" />
                <MapPin className="absolute top-8 text-gold drop-shadow-[0_0_15px_rgba(205,167,81,1)]" size={32} />
              </motion.div>
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center scale-75"
              >
                <div className="w-[340px] h-[340px] rounded-full border border-gold/10" />
                <Plane className="absolute bottom-4 text-gold/60" size={28} />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="text-gold/20 w-40 h-40 group-hover:scale-125 group-hover:text-gold/30 transition-all duration-700 ease-out" strokeWidth={0.5} />
              </div>
            </div>

            <h2 className="font-display text-2xl mb-8 relative z-10">
              {isEn ? "Our " : "Notre "}
              <span className="gold-text">{isEn ? "conviction" : "conviction"}</span>
            </h2>
            
            <div className="text-lg md:text-2xl font-serif italic text-muted-foreground max-w-3xl mx-auto leading-relaxed relative z-10 p-8 rounded-3xl bg-background/40 backdrop-blur-md border border-white/5 group-hover:border-gold/30 group-hover:shadow-[0_0_40px_rgba(205,167,81,0.15)] transition-all duration-700">
              <span className="text-gold/20 group-hover:text-gold/50 text-6xl absolute -top-4 -left-4 font-display transition-colors duration-700">"</span>
              {isEn ? (
                <>
                  A network allows you to meet.<br />
                  <span className="text-white group-hover:text-gold transition-colors duration-700">An immersion allows you to understand.</span><br />
                  Trust then allows you to build.
                </>
              ) : (
                <>
                  Un réseau permet de rencontrer.<br />
                  <span className="text-white group-hover:text-gold transition-colors duration-700">Une immersion permet de comprendre.</span><br />
                  La confiance permet ensuite de construire.
                </>
              )}
              <span className="text-gold/20 group-hover:text-gold/50 text-6xl absolute -bottom-8 -right-4 font-display rotate-180 transition-colors duration-700">"</span>
            </div>
            
            <p className="mt-10 text-gold/80 tracking-[0.3em] uppercase text-xs font-bold relative z-10 group-hover:tracking-[0.45em] transition-all duration-700">
              {isEn ? "The Business Network Experience retreats philosophy" : "La philosophie des séjours Business Network Experience"}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-10 pb-10 flex justify-center"
          >
            <Link to="/sejour#a-venir" className="btn-gold px-10 py-5 text-sm uppercase tracking-[0.2em] rounded-full flex items-center gap-3 group shadow-[0_0_30px_rgba(197,160,89,0.3)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)] transition-all overflow-hidden relative">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10">{isEn ? "Register for a retreat" : "S'inscrire à un séjour"}</span> 
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
