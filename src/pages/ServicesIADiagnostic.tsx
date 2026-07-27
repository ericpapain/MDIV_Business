import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowLeft, ArrowRight, Check, Sparkles, Download, BarChart3, Zap, Target, Brain, ChevronRight } from "lucide-react";

const questionsData = [
  {
    q: "Quel est votre secteur d'activité ?",
    qEn: "What is your industry?",
    options: ["Commerce / Retail", "Services / Conseil", "Artisanat / BTP", "Industrie / Production", "Tech / Digital", "Santé / Bien-être", "Autre"],
    optionsEn: ["Retail / Commerce", "Services / Consulting", "Crafts / Construction", "Industry / Manufacturing", "Tech / Digital", "Health / Wellness", "Other"],
  },
  {
    q: "Combien de collaborateurs dans votre entreprise ?",
    qEn: "How many employees in your company?",
    options: ["1 (Solo)", "2–5", "6–20", "21–50", "50+"],
    optionsEn: ["1 (Solo)", "2–5", "6–20", "21–50", "50+"],
  },
  {
    q: "Quels sont vos principaux défis aujourd'hui ?",
    qEn: "What are your main challenges today?",
    options: ["Trop de tâches administratives", "Difficulté à trouver des clients", "Facturation et devis chronophages", "Communication et marketing", "Gestion des emails", "Formation des équipes"],
    optionsEn: ["Too many administrative tasks", "Difficulty finding clients", "Time-consuming billing and quotes", "Communication and marketing", "Email management", "Team training"],
    multi: true,
  },
  {
    q: "Utilisez-vous déjà des outils IA ?",
    qEn: "Do you already use AI tools?",
    options: ["Non, pas du tout", "Un peu (ChatGPT, etc.)", "Oui, régulièrement", "Oui, c'est intégré à nos process"],
    optionsEn: ["No, not at all", "A little (ChatGPT, etc.)", "Yes, regularly", "Yes, it's integrated into our processes"],
  },
  {
    q: "Quel est votre budget mensuel pour des outils digitaux ?",
    qEn: "What is your monthly budget for digital tools?",
    options: ["0€ — Gratuit uniquement", "Moins de 30€/mois", "30€ à 100€/mois", "Plus de 100€/mois"],
    optionsEn: ["€0 — Free only", "Under €30/month", "€30 to €100/month", "Over €100/month"],
  },
];

function computeScore(answers: (string | string[])[]) {
  let score = 0;
  // Sector
  if (answers[0]) score += 10;
  // Company size -> more = higher maturity potential
  const sizeIdx = ["1 (Solo)", "2–5", "6–20", "21–50", "50+"].indexOf(answers[1] as string);
  score += Math.min(sizeIdx * 5, 20);
  // Challenges -> more challenges = more opportunity
  if (Array.isArray(answers[2])) score += Math.min(answers[2].length * 8, 40);
  // Current AI usage
  const usageIdx = questionsData[3].options.indexOf(answers[3] as string);
  score += usageIdx * 8;
  // Budget
  const budgetIdx = questionsData[4].options.indexOf(answers[4] as string);
  score += budgetIdx * 5;

  return Math.min(Math.max(score, 15), 95);
}

export default function ServicesIADiagnostic() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>(Array(questionsData.length).fill(""));
  const [done, setDone] = useState(false);

  const current = questionsData[step];
  const progress = ((step + 1) / questionsData.length) * 100;

  const handleSelect = (opt: string) => {
    const newAnswers = [...answers];
    if (current.multi) {
      const arr = (Array.isArray(newAnswers[step]) ? newAnswers[step] : []) as string[];
      if (arr.includes(opt)) {
        newAnswers[step] = arr.filter(a => a !== opt);
      } else {
        newAnswers[step] = [...arr, opt];
      }
    } else {
      newAnswers[step] = opt;
    }
    setAnswers(newAnswers);
  };

  const isSelected = (opt: string) => {
    if (current.multi) {
      return Array.isArray(answers[step]) && (answers[step] as string[]).includes(opt);
    }
    return answers[step] === opt;
  };

  const canNext = current.multi
    ? Array.isArray(answers[step]) && (answers[step] as string[]).length > 0
    : !!answers[step];

  const next = () => {
    if (step < questionsData.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const score = computeScore(answers);

  const getLevel = () => {
    if (score < 30) return { label: isEn ? "Beginner" : "Débutant", color: "hsl(25 95% 53%)", desc: isEn ? "You have significant room for growth. Our free tools are perfect to get started." : "Vous avez un potentiel de croissance important. Nos outils gratuits sont parfaits pour démarrer." };
    if (score < 60) return { label: isEn ? "Intermediate" : "Intermédiaire", color: "hsl(221 83% 53%)", desc: isEn ? "You're on the right track. Our Pro plan would accelerate your transformation." : "Vous êtes sur la bonne voie. Notre plan Pro accélérerait votre transformation." };
    return { label: isEn ? "Advanced" : "Avancé", color: "hsl(160 84% 39%)", desc: isEn ? "Impressive maturity! Our Business or Enterprise plans will maximize your ROI." : "Maturité impressionnante ! Nos plans Business ou Entreprise maximiseront votre ROI." };
  };

  const level = getLevel();

  if (done) {
    return (
      <div className="ia-page min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm mb-8 hover:gap-3 transition-all" style={{ color: "hsl(221 83% 53%)" }}>
            <ArrowLeft size={14} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
          </Link>

          <div className="ia-card relative overflow-hidden p-8 md:p-12 text-center ia-animate-in">
            {/* Decorative background icon */}
            <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: '0s' }}>
              <BarChart3 size={192} />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-6">
                <BarChart3 size={32} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Your AI Score" : "Votre Score IA"}
              </h1>

              <div className="my-8">
                <div className="text-7xl font-bold ia-gradient-text mb-2">{score}</div>
                <div className="text-lg font-semibold" style={{ color: level.color }}>{level.label}</div>
              </div>

            {/* Progress bar */}
            <div className="max-w-sm mx-auto mb-8">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(214 32% 91%)" }}>
                <div className="h-full rounded-full ia-gradient-hero transition-all duration-1000" style={{ width: `${score}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-2" style={{ color: "hsl(215 16% 47%)" }}>
                <span>0</span><span>50</span><span>100</span>
              </div>
            </div>

            </div>

            <p className="text-base leading-relaxed mb-8 max-w-md mx-auto relative z-10" style={{ color: "hsl(215 16% 47%)" }}>
              {level.desc}
            </p>

            {/* Recommendations */}
            <div className="ia-card p-6 text-left mb-8 ia-gradient-hero-subtle relative z-10">
              <h3 className="font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Our recommendations" : "Nos recommandations"}
              </h3>
              <ul className="space-y-3">
                {[
                  isEn ? "Start with free AI tools to automate admin tasks" : "Commencez par les outils IA gratuits pour automatiser l'administratif",
                  isEn ? "Try AI Billing to save 80% on invoicing time" : "Essayez la Facturation IA pour économiser 80% du temps de facturation",
                  isEn ? "Join a free masterclass to train your team" : "Rejoignez une masterclass gratuite pour former votre équipe",
                ].map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: "hsl(160 84% 39%)" }} /> {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/services-ia" className="ia-btn-primary">
                {isEn ? "Discover AI solutions" : "Découvrir les solutions IA"} <ArrowRight size={16} />
              </Link>
              <button className="ia-btn-secondary" onClick={() => { setStep(0); setAnswers(Array(questionsData.length).fill("")); setDone(false); }}>
                {isEn ? "Retake diagnostic" : "Refaire le diagnostic"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ia-page min-h-screen pt-32 pb-20">
      <div className="container max-w-3xl mx-auto">
        <Link to="/services-ia" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground/80 backdrop-blur-md text-[hsl(221,83%,53%)] font-semibold rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:bg-white hover:-translate-x-1 transition-all mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
        </Link>

        <div className="text-center mb-10">
          <div className="hidden items-center gap-2 px-4 py-2 rounded-full ia-badge-freemium mb-4 text-sm">
            <Brain size={14} /> {isEn ? "Free AI Diagnostic" : "Diagnostic IA Gratuit"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Assess your AI maturity" : "Évaluez votre maturité IA"}
          </h1>
          <p className="text-base" style={{ color: "hsl(215 16% 47%)" }}>
            {isEn ? "5 quick questions to get your personalized AI score." : "5 questions rapides pour obtenir votre score IA personnalisé."}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: "hsl(215 16% 47%)" }}>
            <span>{isEn ? "Question" : "Question"} {step + 1}/{questionsData.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(214 32% 91%)" }}>
            <div className="h-full rounded-full ia-gradient-hero transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="ia-card relative overflow-hidden p-8 md:p-10 ia-animate-in" key={step}>
          <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: '0.2s' }}>
            <Brain size={192} />
          </div>

          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? current.qEn : current.q}
            </h2>
            {current.multi && (
              <p className="text-sm mb-6" style={{ color: "hsl(215 16% 47%)" }}>
                {isEn ? "Select all that apply" : "Sélectionnez toutes les réponses applicables"}
              </p>
            )}

          <div className="space-y-3 mt-6">
            {(isEn ? current.optionsEn : current.options).map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(isEn ? current.optionsEn[i] : current.options[i])}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between text-sm font-medium ${
                  isSelected(isEn ? current.optionsEn[i] : current.options[i])
                    ? "border-[hsl(221,83%,53%)] bg-[hsl(221,83%,53%,0.05)]"
                    : "border-[hsl(214,32%,91%)] hover:border-[hsl(221,83%,53%,0.3)] hover:bg-[hsl(221,83%,53%,0.02)]"
                }`}
              >
                <span>{opt}</span>
                {isSelected(isEn ? current.optionsEn[i] : current.options[i]) && (
                  <Check size={18} style={{ color: "hsl(221 83% 53%)" }} />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="ia-btn-secondary text-sm py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} /> {isEn ? "Previous" : "Précédent"}
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="ia-btn-primary text-sm py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isEn ? (step === questionsData.length - 1 ? "Finish" : "Next") : (step === questionsData.length - 1 ? "Terminer" : "Suivant")} <ArrowRight size={14} />
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
