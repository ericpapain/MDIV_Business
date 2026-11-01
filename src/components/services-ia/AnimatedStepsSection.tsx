import React, { useState, useEffect, useRef } from "react";
import { Check, Sparkles, FileText, ArrowRight } from "lucide-react";

interface StepItem {
  step: number;
  title: string;
  description: string;
  badge: string;
  durationEstimate: string;
}

const STEPS: StepItem[] = [
  {
    step: 1,
    title: "Répondez à 4 questions",
    description: "Votre métier, votre façon de travailler, ce qui vous prend du temps. C'est tout. Environ 3 minutes.",
    badge: "Étape 1 · Diagnostic",
    durationEstimate: "3 min chrono",
  },
  {
    step: 2,
    title: "Recevez votre bilan",
    description: "On vous montre où vous perdez du temps et ce qu'on peut faire pour vous. Il est rangé dans votre espace personnel.",
    badge: "Étape 2 · Bilan personnalisé",
    durationEstimate: "Immédiat",
  },
  {
    step: 3,
    title: "Utilisez ce qui vous sert",
    description: "Votre espace affiche seulement les outils utiles pour vous. Rien de plus, rien de compliqué.",
    badge: "Étape 3 · Espace sur-mesure",
    durationEstimate: "Prêt à l'emploi",
  },
];

export function AnimatedStepsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [typedTitles, setTypedTitles] = useState<string[]>(["", "", ""]);
  const [isPaused, setIsPaused] = useState(false);

  // 1. Observer pour déclencher l'animation uniquement lorsque la section est visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Machine à états de frappe automatique et de mise en évidence séquentielle
  useEffect(() => {
    if (!isInView || isPaused) return;

    const targetTitle = STEPS[activeStep].title;
    const currentTyped = typedTitles[activeStep];

    // Phase A : Le titre du bloc actif est en cours de frappe caractère par caractère
    if (currentTyped.length < targetTitle.length) {
      const typeTimer = setTimeout(() => {
        setTypedTitles((prev) => {
          const next = [...prev];
          next[activeStep] = targetTitle.slice(0, currentTyped.length + 1);
          return next;
        });
      }, 45); // Vitesse de frappe naturelle (45ms par caractère)

      return () => clearTimeout(typeTimer);
    }

    // Phase B : Le titre est entièrement écrit, on maintient la mise en évidence du bloc
    // puis on bascule automatiquement vers le bloc suivant
    const transitionTimer = setTimeout(() => {
      if (activeStep < STEPS.length - 1) {
        // Passage au bloc suivant
        setActiveStep((prev) => prev + 1);
      } else {
        // Les 3 blocs sont complétés, on maintient la vue d'ensemble puis on boucle
        const loopTimer = setTimeout(() => {
          setTypedTitles(["", "", ""]);
          setActiveStep(0);
        }, 3200);

        return () => clearTimeout(loopTimer);
      }
    }, 1600); // 1.6 seconde de contemplation avant de passer au bloc suivant

    return () => clearTimeout(transitionTimer);
  }, [isInView, isPaused, activeStep, typedTitles]);

  // Interaction utilisateur : clic direct sur une carte pour l'activer
  const handleSelectStep = (index: number) => {
    setActiveStep(index);
    setTypedTitles((prev) => {
      const next = [...prev];
      // Pour les cartes précédentes, s'assurer que leur titre est complété
      for (let i = 0; i < index; i++) {
        next[i] = STEPS[i].title;
      }
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {STEPS.map((step, idx) => {
        const isActive = activeStep === idx;
        const isCompleted = typedTitles[idx].length === step.title.length;
        const isPast = activeStep > idx || isCompleted;

        return (
          <div
            key={step.step}
            onClick={() => handleSelectStep(idx)}
            className={`
              relative rounded-2xl p-6 sm:p-7 flex flex-col items-start cursor-pointer transition-all duration-500 ease-out select-none
              ${
                isActive
                  ? "bg-white border-2 border-[#1C3A6B] shadow-xl shadow-[#1C3A6B]/15 -translate-y-2 ring-4 ring-[#1C3A6B]/15 z-10"
                  : isPast
                  ? "bg-white border border-[#1C3A6B]/30 shadow-sm opacity-95 hover:border-[#1C3A6B]/60 hover:-translate-y-0.5"
                  : "bg-white/90 border border-[#E3DED4] shadow-xs opacity-75 hover:opacity-100 hover:border-slate-300"
              }
            `}
          >
            {/* Indicateur de badge d'état en haut à droite */}
            <div className="w-full flex items-center justify-between mb-5">
              <div
                className={`
                  w-12 h-12 rounded-full font-extrabold text-xl flex items-center justify-center transition-all duration-500
                  ${
                    isActive
                      ? "bg-[#1C3A6B] text-white ring-4 ring-[#1C3A6B]/25 scale-110 shadow-md"
                      : isPast
                      ? "bg-[#1C3A6B] text-white"
                      : "bg-[#1C3A6B]/80 text-white"
                  }
                `}
              >
                {isPast && !isActive ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  step.step
                )}
              </div>

              {/* Tag animé */}
              <span
                className={`
                  text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 flex items-center gap-1.5
                  ${
                    isActive
                      ? "bg-[#1C3A6B] text-white shadow-xs animate-pulse"
                      : isPast
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }
                `}
              >
                {isActive ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    <span>En cours</span>
                  </>
                ) : isPast ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{step.durationEstimate}</span>
                  </>
                ) : (
                  step.durationEstimate
                )}
              </span>
            </div>

            {/* Titre avec effet machine à écrire */}
            <h3 className="font-extrabold text-xl text-[#14213D] mb-2 min-h-[3.25rem] flex items-center flex-wrap leading-tight">
              <span>{typedTitles[idx]}</span>
              {/* Curseur clignotant pendant la saisie active */}
              {isActive && !isCompleted && (
                <span className="inline-block w-0.5 h-5 bg-[#1C3A6B] ml-1 animate-pulse align-middle" />
              )}
              {/* Placeholder transparent pour stabiliser la hauteur si pas encore écrit */}
              {typedTitles[idx].length === 0 && !isActive && (
                <span className="opacity-40 text-slate-400 font-medium">
                  {step.title}
                </span>
              )}
            </h3>

            {/* Description détaillée */}
            <p className="text-sm text-[#3A4152] leading-relaxed mt-1">
              {step.description}
            </p>

            {/* Barre de progression subtile au bas de la carte active */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1C3A6B]/10 rounded-b-2xl overflow-hidden">
                <div
                  className="h-full bg-[#1C3A6B] transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width: `${Math.round((typedTitles[idx].length / step.title.length) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
