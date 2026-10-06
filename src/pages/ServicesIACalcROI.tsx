import { useState, useEffect } from "react";
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { EnterpriseAuthBar } from "@/components/site/EnterpriseAuthBar";
import { ArrowLeft, ArrowRight, Calculator, Sparkles, BarChart3, Play, RefreshCcw } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { DEFAULT_ROI_DATA, ROIFormData } from "@/components/calc-roi/roiUtils";
import { StepCompany, StepProcess, StepMetrics, StepLead } from "@/components/calc-roi/ROIWizardSteps";
import { ROIReport } from "@/components/calc-roi/ROIReport";
import { useGuestQuota } from "@/hooks/useGuestQuota";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";

const STEP_LABELS = ["Entreprise", "Processus", "Métriques", "Rapport"];

export default function ServicesIACalcROI() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('roi');

  const [step, setStep] = useState(1);
  const [data, setData] = useState<ROIFormData>(DEFAULT_ROI_DATA);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const updateData = (field: keyof ROIFormData, value: string | number) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const next = () => {
    if (step === 4) {
      if (!checkCanExecute()) return;
      recordExecution();
    }
    setStep((s) => Math.min(s + 1, 5));
  };
  const back = (to: number) => setStep(to);
  const reset = () => { setStep(1); setData(DEFAULT_ROI_DATA); };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header avec Vidéo et Étapes */}
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
          <div className="pt-2 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
                <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
                <RefreshCcw size={16} /> {isEn ? "Refresh & Restart" : "Actualiser et recommencer"}
              </button>
            </div>
            <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Calculator size={16} /> Simulateur B2B
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Calculateur de <span className="text-blue-600">ROI IA</span>
            </h1>
            <p className="text-slate-800 font-medium text-lg max-w-2xl mb-8">
              Estimez instantanément les gains financiers, le temps économisé et le retour sur investissement de l'intelligence artificielle pour votre entreprise.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-blue-300 via-indigo-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-blue-400 opacity-50"></div>
            </div>

            {/* Comment ça marche : Visuel à étapes détaillées */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                
                {/* Étape 1 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Calculator size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">1. Saisie</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-11">Entrez vos données de base.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-blue-200 to-indigo-200 ml-8 sm:hidden"></div>

                {/* Étape 2 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">2. Analyse</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-11">Projection des gains IA.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-indigo-500 bg-indigo-50/80 h-8 w-8 rounded-full border border-indigo-100/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.5s]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-indigo-200 to-violet-200 ml-8 sm:hidden"></div>

                {/* Étape 3 */}
                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <BarChart3 size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Rapport</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Bilan ROI détaillé.</p>
                </div>
                
              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <ServiceHeroImage />
          </div>
        </div>

        {/* Stepper */}
        {step < 5 && (
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-2 relative">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center relative z-10 w-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 ${
                      step === s
                        ? "border-[hsl(221,83%,53%)] bg-[hsl(221,83%,53%)] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        : step > s
                        ? "border-[hsl(221,83%,53%)] bg-[hsl(221,83%,53%)] text-white"
                        : "border-slate-700 bg-background text-slate-500"
                    }`}
                  >
                    {step > s ? "✓" : s}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider mt-2 absolute top-full w-24 text-center -ml-7 ${
                      step >= s ? "text-blue-500" : "text-slate-500"
                    }`}
                  >
                    {STEP_LABELS[s - 1]}
                  </span>
                </div>
              ))}
              <div className="absolute left-[5%] right-[5%] top-4 h-0.5 bg-slate-800 -z-10" />
              <div
                className="absolute left-[5%] top-4 h-0.5 bg-blue-600 -z-10 transition-all duration-700 ease-out"
                style={{ width: `${(step - 1) * 30}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-16 bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && <StepCompany data={data} onUpdate={updateData} onNext={next} />}
            {step === 2 && <StepProcess data={data} onUpdate={updateData} onNext={next} onBack={() => back(1)} />}
            {step === 3 && <StepMetrics data={data} onUpdate={updateData} onNext={next} onBack={() => back(2)} />}
            {step === 4 && <StepLead data={data} onUpdate={updateData} onNext={next} onBack={() => back(3)} />}
            {step === 5 && <ROIReport data={data} onReset={reset} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Modale d'authentification requise au 4ème essai */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer des simulations ROI illimitées et exporter vos rapports PDF."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}
