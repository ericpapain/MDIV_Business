import { motion } from 'framer-motion';
import { ArrowRight, Building2, Search } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onStart: (type: DemoType) => void;
}

export function Step1Hero({ onStart }: Props) {
  return (
    <div className="max-w-4xl text-center flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6 inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-sm font-medium text-neutral-300"
      >
        <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
        Démonstration Interactive
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-tight"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          L'Intelligence Artificielle
        </span>
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          au service de vos opérations.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-xl text-neutral-400 mb-12 max-w-2xl"
      >
        Sélectionnez le scénario de démonstration souhaité pour voir comment ARIA modélise les enjeux métiers.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart('network')}
          className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-sm font-semibold text-black transition-all hover:bg-neutral-200 text-left"
        >
          <div className="bg-black/10 p-2 rounded-full">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="block font-bold text-base mb-0.5">Scénario 1 : Séjour Réseau</div>
            <div className="block font-normal text-xs opacity-70">Investissement & Restauration</div>
          </div>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-2" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onStart('audit')}
          className="group relative inline-flex items-center justify-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900/50 px-8 py-5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 text-left"
        >
          <div className="bg-white/10 p-2 rounded-full">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="block font-bold text-base mb-0.5">Scénario 2 : Audit IA PME</div>
            <div className="block font-normal text-xs text-neutral-400">Diagnostic & Roadmap Digitale</div>
          </div>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 ml-2" />
        </motion.button>
      </motion.div>
    </div>
  );
}
