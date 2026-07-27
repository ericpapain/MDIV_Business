import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Step1Hero } from './steps/Step1Hero';
import { Step2Chat } from './steps/Step2Chat';
import { Step3Analysis } from './steps/Step3Analysis';
import { Step4Result } from './steps/Step4Result';
import { Step5Matching } from './steps/Step5Matching';
import { Step6Planning } from './steps/Step6Planning';
import { Step7Dashboard } from './steps/Step7Dashboard';
import { Step8End } from './steps/Step8End';

export type DemoType = 'network' | 'audit';

export default function DemoFlow() {
  const [step, setStep] = useState(1);
  const [demoType, setDemoType] = useState<DemoType>('network');

  const nextStep = () => setStep((s) => Math.min(s + 1, 8));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (s: number) => setStep(s);

  const startDemo = (type: DemoType) => {
    setDemoType(type);
    nextStep();
  };

  // Helper for transitions
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Hero onStart={startDemo} key="step1" />;
      case 2:
        return <Step2Chat onNext={nextStep} demoType={demoType} key={`step2-${demoType}`} />;
      case 3:
        return <Step3Analysis onNext={nextStep} demoType={demoType} key="step3" />;
      case 4:
        return <Step4Result onNext={nextStep} demoType={demoType} key={`step4-${demoType}`} />;
      case 5:
        return <Step5Matching onNext={nextStep} demoType={demoType} key={`step5-${demoType}`} />;
      case 6:
        return <Step6Planning onNext={nextStep} demoType={demoType} key={`step6-${demoType}`} />;
      case 7:
        return <Step7Dashboard onNext={nextStep} demoType={demoType} key={`step7-${demoType}`} />;
      case 8:
        return <Step8End onReset={() => goToStep(1)} demoType={demoType} key={`step8-${demoType}`} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center z-50 absolute top-0 w-full">
        <div className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
          M.DIV
        </div>
        <div className="flex gap-2">
          <div className="opacity-10 hover:opacity-100 transition-opacity flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => goToStep(s)}
                className={`w-2 h-2 rounded-full ${step === s ? 'bg-white' : 'bg-neutral-600'}`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative w-full h-full pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex flex-col items-center justify-center p-6"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
