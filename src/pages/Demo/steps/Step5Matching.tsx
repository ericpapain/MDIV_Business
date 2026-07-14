import { motion } from 'framer-motion';
import { DEMO_PROFILES, AUDIT_SOLUTIONS } from '../../../data/mockDemoData';
import { Building2, Percent, ArrowRight, ShieldCheck, Globe, Cpu, Server } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

export function Step5Matching({ onNext, demoType }: Props) {
  const isNetwork = demoType === 'network';
  const profiles = isNetwork ? DEMO_PROFILES : AUDIT_SOLUTIONS;
  
  const internalProfiles = profiles.filter(p => !p.isExternal);
  const externalProfiles = profiles.filter(p => p.isExternal);

  const renderCard = (item: any, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group bg-neutral-900/30 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-600 transition-colors relative flex flex-col"
    >
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-neutral-700 rounded-full px-3 py-1 flex items-center gap-1 z-10">
        <span className="text-green-400 font-bold text-sm">{item.matchPercentage}</span>
        <Percent size={12} className="text-green-400" />
      </div>

      <div className="h-28 bg-gradient-to-b from-neutral-800 to-neutral-900/30 relative">
        <div className="absolute -bottom-8 left-6">
          <img 
            src={item.avatar} 
            alt={item.name} 
            className="w-16 h-16 rounded-full border-4 border-black object-cover bg-neutral-800"
          />
        </div>
      </div>

      <div className="p-6 pt-10 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        <p className="text-neutral-400 text-sm mb-4">{item.role}</p>

        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300 bg-neutral-800/50 rounded-lg p-2 mb-4 w-max max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {isNetwork ? (
            <Building2 size={14} className={item.isExternal ? "text-amber-400 shrink-0" : "text-indigo-400 shrink-0"} />
          ) : (
            <Server size={14} className={item.isExternal ? "text-pink-400 shrink-0" : "text-emerald-400 shrink-0"} />
          )}
          <span className="truncate">{item.company}</span>
        </div>

        <div className="space-y-1 mt-auto">
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
            {isNetwork ? "Justification IA" : "Impact Métier"}
          </p>
          <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3">
            {item.reason}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-6xl h-full flex flex-col pt-12 pb-24 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">
          {isNetwork ? "Recommandations de Rencontres" : "Recommandations Technologiques"}
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          {isNetwork 
            ? "L'IA a qualifié les profils les plus pertinents pour votre développement immobilier et vos restaurants. Nous combinons notre réseau fermé avec une analyse intelligente du web professionnel."
            : "L'IA a identifié les briques technologiques adaptées à vos failles de productivité. Des solutions simples à intégrer, sans modifier votre ERP existant."}
        </p>
      </motion.div>

      {internalProfiles.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            {isNetwork ? <ShieldCheck className="text-indigo-500 w-6 h-6" /> : <Cpu className="text-emerald-500 w-6 h-6" />}
            <h3 className="text-2xl font-semibold">
              {isNetwork ? "Membres du Réseau M.DIV" : "Solutions Internes (Workflow M.DIV)"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internalProfiles.map((profile, index) => renderCard(profile, index))}
          </div>
        </div>
      )}

      {externalProfiles.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6 mt-8">
            {isNetwork ? <Globe className="text-amber-500 w-6 h-6" /> : <Globe className="text-pink-500 w-6 h-6" />}
            <h3 className="text-2xl font-semibold">
              {isNetwork ? "Matchs Réseau Externe (Web)" : "Briques Technologiques Tierces"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalProfiles.map((profile, index) => renderCard(profile, index + internalProfiles.length))}
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={onNext}
          className="group flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
        >
          {isNetwork ? 'Voir le planning' : 'Voir la roadmap'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
