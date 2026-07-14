import { motion } from 'framer-motion';
import { Database, Network, Cpu, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

export function Step3Analysis({ onNext, demoType }: Props) {
  const [progress, setProgress] = useState(0);

  const stepsNetwork = [
    { label: "Analyse sémantique des objectifs", icon: Database },
    { label: "Requête sur le graphe de connaissances", icon: Network },
    { label: "Scoring des profils (Membres & Web)", icon: Cpu },
  ];

  const stepsAudit = [
    { label: "Analyse sémantique des processus métiers", icon: Database },
    { label: "Identification des goulots d'étranglement", icon: Network },
    { label: "Calcul du ROI et sélection d'outils IA", icon: Cpu },
  ];

  const steps = demoType === 'network' ? stepsNetwork : stepsAudit;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onNext, 1000);
          return 100;
        }
        return p + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-48 h-48 mb-12 flex items-center justify-center"
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="88" className="stroke-neutral-800" strokeWidth="4" fill="none" />
          <motion.circle
            cx="96"
            cy="96"
            r="88"
            className="stroke-indigo-500"
            strokeWidth="4"
            fill="none"
            strokeDasharray="553"
            strokeDashoffset={553 - (553 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-4xl font-bold text-white">{Math.round(progress)}%</div>
      </motion.div>

      <div className="w-full space-y-6">
        {steps.map((step, index) => {
          const stepProgress = Math.max(0, Math.min(100, (progress - index * 33) * 3));
          const isComplete = stepProgress === 100;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > index * 20 ? 1 : 0.3, x: 0 }}
              className="flex items-center gap-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-green-500/20 text-green-500' : 'bg-neutral-800 text-neutral-400'}`}>
                {isComplete ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-200">{step.label}</span>
                  <span className="text-sm text-neutral-500">{Math.round(stepProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
