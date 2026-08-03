import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Target, Activity, Search, MessageSquare, Zap, Check, Users, Hexagon, Circle, Rocket, Star, Compass, BarChart3, Presentation, Layers } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function AccompagnementBNE() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const rotateShape = useTransform(scrollYProgress, [0, 1], [0, 180]);

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
    <div className="min-h-screen pt-20 pb-10 bg-background text-foreground relative overflow-hidden selection:bg-blue-500/30">
      
      {/* ── PARALLAX BACKGROUND & GLOWING ORBS ── */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-900/10 via-blue-900/5 to-transparent" />
        <div className="absolute top-20 right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[120px] bg-blue-500" />
        <div className="absolute top-[40%] left-[0%] w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px] bg-indigo-500" />
        <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[150px] bg-purple-500" />
      </motion.div>

      {/* ── FLOATING ABSTRACT SHAPES ── */}
      <motion.div 
        animate={{ rotate: -360 }} 
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute top-32 right-10 text-blue-500/5 pointer-events-none"
      >
        <Hexagon size={200} strokeWidth={0.2} />
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-60 left-10 text-blue-500/5 pointer-events-none"
      >
        <Circle size={250} strokeWidth={0.2} strokeDasharray="10 10" />
      </motion.div>

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Navigation / Back */}
        <div className="mb-10">
          <Link to="/offres" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            <span className="relative overflow-hidden">
              <span className="block group-hover:-translate-y-full transition-transform duration-300">Retour aux offres</span>
              <span className="block absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-blue-400">Retour aux offres</span>
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
            style={{ background: "hsl(221 83% 53% / 0.1)", color: "hsl(221 83% 53%)", border: "1px solid hsl(221 83% 53% / 0.25)" }}
          >
            <div className="absolute inset-0 bg-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Target size={16} className="group-hover:rotate-90 transition-transform duration-500 relative z-10" /> 
            <span className="relative z-10">Accompagnement Stratégique</span>
          </motion.div>
          
          <h1 className="font-display text-[44px] md:text-[56px] lg:text-[68px] mb-4 leading-[1.1]">
            Transformez votre expertise en <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-blue-400 italic pr-4">opportunités.</span>
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute bottom-2 left-0 h-3 bg-blue-500/20 -z-0 -rotate-2" 
              />
            </span>
          </h1>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-px h-16 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto mt-12" 
          />
        </motion.div>

        {/* ── CONTENT BODY ── */}
        <div className="space-y-8">
          
          <motion.div 
            variants={containerVars} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="prose prose-invert prose-lg max-w-none prose-p:text-foreground/70 prose-p:leading-relaxed"
          >
            <motion.div variants={itemVars} className="text-center max-w-3xl mx-auto space-y-4 text-lg font-light mb-10">
              <p>
                Chaque entreprise possède une expertise, une histoire et un potentiel de développement.
                Pourtant, beaucoup de dirigeants rencontrent les mêmes défis : gagner en visibilité, mieux valoriser leur savoir-faire, accéder aux bonnes relations ou ouvrir de nouveaux marchés.
              </p>
              <p>
                Chez BNE, nous sommes convaincus qu’un développement durable ne repose pas uniquement sur la communication ou la prospection.
                Il repose sur trois éléments essentiels : <strong className="text-blue-300 font-semibold">une vision claire, une stratégie adaptée et un écosystème de confiance.</strong>
              </p>
              <p>
                Notre rôle est d’accompagner les entreprises dans cette transformation en associant stratégie, visibilité, intelligence artificielle et connexions qualifiées.
              </p>
            </motion.div>

            {/* BLOCK 1: PREMIÈRE ÉTAPE */}
            <motion.div 
              variants={itemVars}
              whileHover={{ scale: 1.01 }}
              className="my-10 p-6 md:p-8 rounded-3xl glass-strong border border-blue-500/20 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-noise opacity-[0.03]" />
              <div className="absolute -right-20 -bottom-20 text-blue-500/5 group-hover:text-blue-500/10 transition-colors duration-700 pointer-events-none -rotate-12 group-hover:-rotate-45">
                <MessageSquare size={300} strokeWidth={0.2} />
              </div>
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-blue-500/50 to-transparent" />
              
              <div className="relative z-10">
                <div className="text-xs uppercase tracking-[0.2em] text-blue-400 font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" /> Première étape
                </div>
                <h2 className="text-3xl mt-0 mb-6 font-display text-white">
                  Un échange stratégique de 30 minutes offert
                </h2>
                <p className="mb-8 text-foreground/80">
                  Avant toute collaboration, BNE propose un échange individuel de 30 minutes, uniquement sur rendez-vous. Cet entretien permet de comprendre :
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    "Votre entreprise", 
                    "Votre positionnement actuel", 
                    "Vos objectifs de développement", 
                    "Vos enjeux commerciaux", 
                    "Vos opportunités de croissance"
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl transition-transform"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-blue-400" />
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="mb-0 text-sm italic text-blue-200/70 border-l-2 border-blue-500/30 pl-4 py-1">
                  L’objectif n’est pas de proposer une solution standardisée, mais d’identifier les leviers qui peuvent réellement accélérer votre développement.
                </p>
              </div>
            </motion.div>

            {/* HEADER POUR LES 3 MOIS */}
            <motion.div variants={itemVars} className="text-center mb-10 mt-12 relative">
              <motion.div style={{ rotate: rotateShape }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500/5 pointer-events-none">
                <Rocket size={180} strokeWidth={0.2} />
              </motion.div>
              <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">
                La méthode BNE Accélération
              </div>
              <h2 className="text-4xl md:text-5xl font-display mb-4 text-white relative z-10">Un plan stratégique sur 3 mois</h2>
              <p className="text-blue-200/80 max-w-2xl mx-auto">Nous travaillons avec vous autour de trois axes complémentaires, conçus pour s'alimenter mutuellement.</p>
            </motion.div>

            {/* BLOCK 2: GRILLE DES 3 MOIS */}
            <div className="grid md:grid-cols-3 gap-6 my-8 relative z-10">
              
              {/* CARTE 1 */}
              <motion.div 
                variants={itemVars}
                className="bg-background/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-display text-white mb-3 mt-0 relative z-10">1. Analyse & Construction</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10 flex-1">
                  Clarifier votre positionnement avant de développer votre visibilité.
                </p>
                <ul className="space-y-3 mb-6 text-sm text-foreground/80 relative z-10 border-t border-white/5 pt-6">
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" /> Marché et ambitions</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" /> Différenciation</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" /> Message entrepreneurial</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" /> Stratégie & contenus</li>
                </ul>
                <div className="text-xs italic text-blue-300/70 relative z-10 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                  Transformer l'expertise en un discours clair et attractif.
                </div>
              </motion.div>

              {/* CARTE 2 */}
              <motion.div 
                variants={itemVars}
                className="bg-background/40 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 relative z-10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Activity size={24} />
                </div>
                <h3 className="text-xl font-display text-white mb-3 mt-0 relative z-10">2. Amplification & Rayonnement</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10 flex-1">
                  Une expertise qui n’est pas visible reste difficilement accessible.
                </p>
                <ul className="space-y-3 mb-6 text-sm text-foreground/80 relative z-10 border-t border-white/5 pt-6">
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" /> Stratégie de contenu</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" /> Communication digitale</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" /> Storytelling ciblé</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 shrink-0" /> Outils d'Intelligence Artificielle</li>
                </ul>
                <div className="text-xs italic text-indigo-300/70 relative z-10 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
                  L’objectif est d’être reconnu pour votre valeur.
                </div>
              </motion.div>

              {/* CARTE 3 */}
              <motion.div 
                variants={itemVars}
                className="bg-background/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 p-6 rounded-3xl relative overflow-hidden group transition-all duration-500 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 relative z-10 border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-display text-white mb-3 mt-0 relative z-10">3. Connexion & Développement</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10 flex-1">
                  Créer des connexions pertinentes, sans multiplier les contacts inutiles.
                </p>
                <ul className="space-y-3 mb-6 text-sm text-foreground/80 relative z-10 border-t border-white/5 pt-6">
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" /> Rencontres ciblées</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" /> Échanges dirigeants/partenaires</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" /> Événements dédiés BNE</li>
                  <li className="flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-purple-400 mt-2 shrink-0" /> Opportunités internationales</li>
                </ul>
                <div className="text-xs italic text-purple-300/70 relative z-10 bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
                  Création de valeur durable par la confiance.
                </div>
              </motion.div>

            </div>

            {/* BLOCK 3: APPROCHE & DURÉE */}
            <div className="grid md:grid-cols-2 gap-10 my-12">
              <motion.div variants={itemVars} className="group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Compass size={24} />
                </div>
                <h2 className="text-2xl mt-0 mb-4 text-white font-display">Une approche différente du développement</h2>
                <p className="text-sm">
                  Le monde entrepreneurial évolue. Aujourd’hui, la différence ne se fait plus uniquement par la taille d’une entreprise ou son budget de communication.
                  Elle se fait par sa capacité à créer des relations solides, à être recommandée et à évoluer dans un environnement qui favorise les opportunités.
                </p>
                <p className="text-sm">
                  Chez BNE, nous ne cherchons pas à créer du volume. Nous construisons des relations qualifiées basées sur la confiance, la complémentarité et l’intelligence collective.
                </p>
              </motion.div>

              <motion.div variants={itemVars} className="group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                  <Star size={24} />
                </div>
                <h2 className="text-2xl mt-0 mb-4 text-white font-display">Après 3 mois : construire dans la durée</h2>
                <p className="text-sm">
                  L’accompagnement BNE Accélération constitue une première étape.
                  Pour les entreprises qui souhaitent poursuivre leur développement, nous pouvons construire un accompagnement annuel personnalisé.
                </p>
                <div className="bg-background/40 border border-white/5 p-5 rounded-2xl mt-6">
                  <ul className="space-y-3 mb-0">
                    <li className="flex items-center gap-3 text-sm font-medium"><Check size={14} className="text-indigo-400 shrink-0" /> Dynamique de visibilité continue</li>
                    <li className="flex items-center gap-3 text-sm font-medium"><Check size={14} className="text-indigo-400 shrink-0" /> Activation du réseau</li>
                    <li className="flex items-center gap-3 text-sm font-medium"><Check size={14} className="text-indigo-400 shrink-0" /> Nouvelles opportunités</li>
                    <li className="flex items-center gap-3 text-sm font-medium"><Check size={14} className="text-indigo-400 shrink-0" /> Ouvertures internationales</li>
                  </ul>
                </div>
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
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent blur-xl pointer-events-none group-hover:via-blue-500/10 transition-colors duration-1000" />
            
            {/* Creative Objects: Strategic Neural/Network Graph */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity duration-1000">
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="text-blue-500/20 w-40 h-40 group-hover:scale-110 group-hover:text-blue-400/30 transition-all duration-700 ease-out" strokeWidth={0.5} />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
              />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.6, 0.2] }} 
                transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[30%] right-[15%] w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }} 
                transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] right-[25%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.8)]"
              />
              {/* Connecting abstract lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ stroke: "rgba(96, 165, 250, 0.2)", strokeWidth: 1 }}>
                <line x1="20%" y1="20%" x2="50%" y2="50%" />
                <line x1="85%" y1="70%" x2="50%" y2="50%" />
                <line x1="75%" y1="40%" x2="50%" y2="50%" />
              </svg>
            </div>

            <h2 className="font-display text-2xl mb-8 relative z-10 text-white">Notre <span className="text-blue-400">conviction</span></h2>
            
            <div className="text-lg md:text-2xl font-serif italic text-muted-foreground max-w-3xl mx-auto leading-relaxed relative z-10 p-8 rounded-3xl bg-background/40 backdrop-blur-md border border-white/5 group-hover:border-blue-500/20 transition-colors duration-700">
              <span className="text-blue-400/20 group-hover:text-blue-400/50 text-6xl absolute -top-4 -left-4 font-display transition-colors duration-700">"</span>
              Être visible est utile.<br />
              <span className="text-white group-hover:text-blue-400 transition-colors duration-700">Être reconnu est précieux.</span><br />
              Être recommandé change tout.
              <span className="text-blue-400/20 group-hover:text-blue-400/50 text-6xl absolute -bottom-8 -right-4 font-display rotate-180 transition-colors duration-700">"</span>
            </div>
            
            <p className="mt-10 text-blue-400/80 tracking-[0.2em] uppercase text-xs font-bold relative z-10 max-w-xl mx-auto leading-relaxed group-hover:tracking-[0.3em] transition-all duration-700">
              BNE accompagne les entreprises qui souhaitent franchir un cap grâce à une méthode fondée sur la stratégie, la confiance et la puissance des écosystèmes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-10 pb-10 flex justify-center"
          >
            <Link to="/contact" className="w-full max-w-md text-center px-10 py-5 text-sm uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all font-bold relative overflow-hidden">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10">Démarrer un échange</span> 
              <Zap size={16} className="relative z-10 fill-white/20 group-hover:scale-110 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
