import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { EnterpriseAuthBar } from "@/components/site/EnterpriseAuthBar";
import { ArrowLeft, Calculator } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { DEFAULT_ROI_DATA, ROIFormData } from "@/components/calc-roi/roiUtils";
import { StepCompany, StepProcess, StepMetrics, StepLead } from "@/components/calc-roi/ROIWizardSteps";
import { ROIReport } from "@/components/calc-roi/ROIReport";

const STEP_LABELS = ["Entreprise", "Processus", "Métriques", "Rapport"];

export default function ServicesIACalcROI() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [step, setStep] = useState(1);
  const [data, setData] = useState<ROIFormData>(DEFAULT_ROI_DATA);

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  const updateData = (field: keyof ROIFormData, value: string | number) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = (to: number) => setStep(to);
  const reset = () => { setStep(1); setData(DEFAULT_ROI_DATA); };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-background text-foreground relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px] bg-gold" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[100px] bg-blue-600" />
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        <EnterpriseAuthBar className="mb-8" />

        <Link
          to="/services-ia"
          className="inline-flex items-center gap-2 text-sm text-[hsl(221,83%,53%)] font-semibold hover:gap-3 transition-all mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {isEn ? "Back to AI Services" : "Retour aux Services IA"}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator size={14} /> {isEn ? "B2B SaaS • Simulator" : "SaaS B2B • Simulateur"}
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Calculateur <span className="text-[hsl(221,83%,53%)]">ROI IA</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isEn
              ? "Instantly estimate the financial gains, saved time, and return on investment of artificial intelligence for your business."
              : "Estimez instantanément les gains financiers, le temps économisé et le retour sur investissement de l'intelligence artificielle pour votre entreprise."}
          </p>
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
        <div className="mt-16 bg-background/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && <StepCompany data={data} onUpdate={updateData} onNext={next} />}
            {step === 2 && <StepProcess data={data} onUpdate={updateData} onNext={next} onBack={() => back(1)} />}
            {step === 3 && <StepMetrics data={data} onUpdate={updateData} onNext={next} onBack={() => back(2)} />}
            {step === 4 && <StepLead data={data} onUpdate={updateData} onNext={next} onBack={() => back(3)} />}
            {step === 5 && <ROIReport data={data} onReset={reset} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
