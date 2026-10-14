import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Newspaper,
  Calendar,
  ExternalLink
} from "lucide-react";

interface HeroNewsItem {
  id: number;
  title: string;
  comment: string;
  image_url: string;
  link_url?: string;
  tag?: string;
  order_num?: number;
  is_active?: number | boolean;
}

const DEFAULT_NEWS: HeroNewsItem[] = [
  {
    id: 1,
    title: "Sommet BNE Casablanca 2026 : 450 Dirigeants Réunis",
    comment: "La plus grande rencontre d'affaires inter-entreprises du continent africain avec signature de partenariats stratégiques majeurs.",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    link_url: "/evenements",
    tag: "Événement Majeur",
  },
  {
    id: 2,
    title: "Mission Économique & Immersion BNE à Abidjan",
    comment: "Accélération des opportunités d'investissement, rencontres B2B qualifiées par IA et visites de sites industriels phares.",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    link_url: "/sejours-bne",
    tag: "Séjour Immersif",
  },
  {
    id: 3,
    title: "Intelligence Artificielle & Alliances Transfrontalières",
    comment: "Déploiement de notre infrastructure d'intelligence décisionnelle pour connecter les décideurs d'Europe et d'Afrique.",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    link_url: "/services-ia",
    tag: "Stratégie & IA",
  }
];

export default function HeroTypingSlider() {
  // Mode: 'typing' (mode saisie) ou 'slider' (cartes d'actualités)
  const [mode, setMode] = useState<"typing" | "slider">("typing");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Text parts for typing effect
  const line1Full = "Le voyage";
  const line2Full = "comme capital.";
  const line3aFull = "La rencontre, ";
  const line3bFull = "comme stratégie.";
  
  const totalChars = line1Full.length + line2Full.length + line3aFull.length + line3bFull.length;

  const [charCount, setCharCount] = useState(0);
  const [isTypingFinished, setIsTypingFinished] = useState(false);
  const autoSlideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch actualités depuis l'API
  const { data: newsItems = DEFAULT_NEWS } = useQuery<HeroNewsItem[]>({
    queryKey: ["hero-news"],
    queryFn: async () => {
      try {
        const res = await fetch("/api-public.php?action=hero_news");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          return json.data;
        }
      } catch (err) {
        console.warn("Utilisation des actualités de secours pour le hero", err);
      }
      return DEFAULT_NEWS;
    },
    staleTime: 1000 * 60 * 5,
  });

  const activeNews = newsItems.filter(item => item.is_active !== 0 && item.is_active !== false);
  const slides = activeNews.length > 0 ? activeNews : DEFAULT_NEWS;

  // Effet de saisie au clavier (Typewriter)
  useEffect(() => {
    if (mode !== "typing") return;

    if (charCount < totalChars) {
      // Vitesse de saisie réaliste (30ms à 65ms par caractère)
      const speed = Math.random() * 35 + 30;
      const timer = setTimeout(() => {
        setCharCount(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Saisie terminée
      setIsTypingFinished(true);

      // Pause de lecture après la fin de la saisie (environ 3.2 secondes), puis passage au slider
      const slideTransitionTimer = setTimeout(() => {
        setMode("slider");
      }, 3200);

      return () => clearTimeout(slideTransitionTimer);
    }
  }, [charCount, mode, totalChars]);

  // Découpage dynamique des textes en fonction de charCount
  const l1Len = line1Full.length;
  const l2Len = line2Full.length;
  const l3aLen = line3aFull.length;
  const l3bLen = line3bFull.length;

  const line1Current = line1Full.slice(0, Math.min(charCount, l1Len));
  const line2Current = charCount > l1Len 
    ? line2Full.slice(0, Math.min(charCount - l1Len, l2Len)) 
    : "";
  const line3aCurrent = charCount > l1Len + l2Len 
    ? line3aFull.slice(0, Math.min(charCount - l1Len - l2Len, l3aLen)) 
    : "";
  const line3bCurrent = charCount > l1Len + l2Len + l3aLen 
    ? line3bFull.slice(0, Math.min(charCount - l1Len - l2Len - l3aLen, l3bLen)) 
    : "";

  // Déterminer sur quelle ligne se trouve le curseur clignotant
  const cursorOnLine = 
    charCount <= l1Len ? 1 :
    charCount <= l1Len + l2Len ? 2 : 3;

  // Rotation automatique du carrousel d'actualités (slide carte par carte)
  useEffect(() => {
    if (mode !== "slider" || isPaused || slides.length === 0) return;

    autoSlideTimeoutRef.current = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev + 1 >= slides.length) {
          // Toutes les images sont passées ! Revenir au texte du début
          handleReturnToText();
          return 0;
        }
        return prev + 1;
      });
    }, 5500);

    return () => {
      if (autoSlideTimeoutRef.current) clearInterval(autoSlideTimeoutRef.current);
    };
  }, [mode, isPaused, slides.length]);

  const handleReturnToText = () => {
    setCharCount(0);
    setIsTypingFinished(false);
    setCurrentSlide(0);
    setMode("typing");
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide === 0) {
      handleReturnToText();
    } else {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide + 1 >= slides.length) {
      handleReturnToText();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleReplayIntro = () => {
    handleReturnToText();
  };

  const currentNews = slides[currentSlide] || slides[0];

  return (
    <div className="relative w-full max-w-2xl min-h-[460px] md:min-h-[540px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 1 : MODE SAISIE ("Taping Code / Mode Saisi")
        ══════════════════════════════════════════════════════════════════════ */}
        {mode === "typing" && (
          <motion.div
            key="hero-typing-view"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="flex flex-col justify-center"
          >
            {/* Titre principal animé caractère par caractère */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.95] tracking-tight mb-8">
              <span>{line1Current}</span>
              {cursorOnLine === 1 && (
                <span className="inline-block w-2 md:w-3 h-8 md:h-14 bg-gold animate-pulse ml-1 align-baseline shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              )}
              <br />
              
              <em className="font-serif italic text-gold-light">
                {line2Current}
              </em>
              {cursorOnLine === 2 && (
                <span className="inline-block w-2 md:w-3 h-8 md:h-14 bg-gold animate-pulse ml-1 align-baseline shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              )}
              <br />

              <span>{line3aCurrent}</span>
              <span className="gold-text">{line3bCurrent}</span>
              {cursorOnLine === 3 && (
                <span className="inline-block w-2 md:w-3 h-8 md:h-14 bg-gold animate-pulse ml-1 align-baseline shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
              )}
            </h1>

            {/* Paragraphe descriptif regroupé dans le même div */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: isTypingFinished ? 1 : 0.4, 
                y: isTypingFinished ? 0 : 5 
              }}
              transition={{ duration: 0.6 }}
              className="text-lg text-foreground/80 max-w-xl mb-10 leading-relaxed"
            >
              Chaque rencontre est identifiée, sélectionnée et qualifiée grâce à la combinaison de notre intelligence artificielle et de notre expertise humaine.
            </motion.p>

            {/* Indicateur discret de passage automatique au slider */}
            {isTypingFinished && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-xs text-gold/80 mb-6"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                  <span className="uppercase tracking-widest text-[10px] font-semibold">
                    Transition vers les actualités principales...
                  </span>
                </div>
                <button
                  onClick={() => setMode("slider")}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-gold underline underline-offset-4 ml-auto"
                >
                  Passer au slider &rarr;
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ÉTAPE 2 : SLIDER CARTE PAR CARTE ("Actualité Principale")
        ══════════════════════════════════════════════════════════════════════ */}
        {mode === "slider" && (
          <motion.div
            key="hero-slider-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full flex flex-col justify-center mb-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Barre d'en-tête du slider avec badge et retour au texte */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-semibold tracking-wider uppercase">
                <Sparkles size={12} className="animate-pulse" />
                <span>{currentNews.tag || "Actualité Principale"}</span>
                <span className="text-gold/40 mx-1">&middot;</span>
                <span className="text-[10px] text-foreground/70 font-mono">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              <button
                onClick={handleReplayIntro}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-gold transition-colors group px-2.5 py-1 rounded-sm border border-border/60 hover:border-gold/40 bg-black/30"
                title="Relancer la saisie du titre"
              >
                <RotateCcw size={11} className="group-hover:-rotate-90 transition-transform duration-300" />
                <span>Revoir le titre</span>
              </button>
            </div>

            {/* Carte de l'actualité principale avec son image et son commentaire */}
            <div className="relative rounded-sm overflow-hidden border border-gold/30 bg-[#0a0d0f] shadow-2xl shadow-black/80 group">
              {/* Conteneur Image avec transition animée */}
              <div className="relative h-80 sm:h-[400px] md:h-[460px] lg:h-[480px] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`img-${currentNews.id}-${currentSlide}`}
                    src={currentNews.image_url}
                    alt={currentNews.title}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                </AnimatePresence>

                {/* Dégradés légers et cinématiques : image bien visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                {/* Flèches de navigation sur la carte */}
                {slides.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                    <button
                      onClick={handlePrev}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 hover:bg-gold hover:text-black text-white border border-white/20 hover:border-gold transition-all duration-300 flex items-center justify-center backdrop-blur-sm -translate-x-1 group-hover:translate-x-0 opacity-70 group-hover:opacity-100"
                      aria-label="Actualité précédente"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/50 hover:bg-gold hover:text-black text-white border border-white/20 hover:border-gold transition-all duration-300 flex items-center justify-center backdrop-blur-sm translate-x-1 group-hover:translate-x-0 opacity-70 group-hover:opacity-100"
                      aria-label="Actualité suivante"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Contenu textuel superposé : transparent, max 3 lignes au total, bouton court à droite */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${currentNews.id}-${currentSlide}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="p-3 sm:p-3.5 rounded-sm bg-black/35 backdrop-blur-sm border border-white/10 shadow-lg flex items-end justify-between gap-3"
                    >
                      {/* Bloc texte (Titre 1 ligne + Commentaire max 2 lignes = 3 lignes max) */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-display text-base sm:text-lg md:text-xl text-white font-bold tracking-tight truncate drop-shadow-md">
                          {currentNews.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed line-clamp-2 drop-shadow">
                          {currentNews.comment}
                        </p>
                      </div>

                      {/* Bouton plus court positionné à l'angle droit */}
                      {currentNews.link_url && (
                        <div className="shrink-0 mb-0.5">
                          {currentNews.link_url.startsWith("http") ? (
                            <a
                              href={currentNews.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-sm bg-gold/90 hover:bg-gold text-black text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md group/btn"
                            >
                              <span>Découvrir</span>
                              <ExternalLink size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </a>
                          ) : (
                            <Link
                              to={currentNews.link_url}
                              className="px-3 py-1.5 rounded-sm bg-gold/90 hover:bg-gold text-black text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md group/btn"
                            >
                              <span>Découvrir</span>
                              <ArrowRight size={11} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Barre de pagination et points indicateurs en bas */}
              <div className="px-5 py-3 bg-black/70 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReturnToText}
                    className="px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground hover:text-gold border border-border/60 hover:border-gold/40 transition-colors flex items-center gap-1"
                    title="Revenir au texte d'accueil"
                  >
                    <RotateCcw size={10} /> Texte
                  </button>

                  <span className="text-white/20">|</span>

                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide 
                          ? "w-8 bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                          : "w-2.5 bg-white/20 hover:bg-white/50"
                      }`}
                      aria-label={`Aller au slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  {isPaused ? "En pause" : (
                    currentSlide + 1 === slides.length
                      ? "Retour au texte au prochain slide"
                      : "Défilement auto"
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
