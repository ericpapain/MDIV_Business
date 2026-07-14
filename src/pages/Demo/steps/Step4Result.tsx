import { motion } from 'framer-motion';
import { Target, Zap, ShieldCheck, ArrowRight, Brain } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

export function Step4Result({ onNext, demoType }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full max-w-5xl h-full flex flex-col justify-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="md:col-span-3 mb-8">
          <h2 className="text-3xl font-bold mb-2">Résultat de l'analyse</h2>
          {demoType === 'network' ? (
            <p className="text-neutral-400 text-lg">
              Votre profil a été qualifié : <span className="text-white font-semibold">Investisseur Immobilier & Restaurateur</span>
            </p>
          ) : (
            <p className="text-neutral-400 text-lg">
              Audit flash généré pour : <span className="text-white font-semibold">PME Distribution B2B (45 collab.)</span>
            </p>
          )}
        </motion.div>

        {/* Card 1 */}
        <motion.div variants={itemVariants} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <Target className="text-blue-500 w-6 h-6" />
            </div>
            {demoType === 'network' ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Besoins Identifiés</h3>
                <ul className="space-y-2 text-neutral-400 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Achat de locaux commerciaux</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Optimisation comptable & fiscale</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Aménagement de restaurants</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">Failles Processus</h3>
                <ul className="space-y-2 text-neutral-400 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Saisie manuelle (Factures / Commandes)</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Support client non qualifié (Niveau 1)</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Silos d'information liés à Excel</li>
                </ul>
              </>
            )}
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={itemVariants} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
              <Zap className="text-amber-500 w-6 h-6" />
            </div>
            {demoType === 'network' ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Sourcing IA</h3>
                <div className="text-4xl font-bold text-white mb-2">6 profils</div>
                <p className="text-neutral-400 text-sm">3 du réseau M.DIV interne exclusif et 3 extraits du web.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">Potentiel IA</h3>
                <div className="text-4xl font-bold text-white mb-2">3 solutions</div>
                <p className="text-neutral-400 text-sm">Technologies prêtes à l'emploi (no-code / LLMs).</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={itemVariants} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            {demoType === 'network' ? <ShieldCheck size={100} /> : <Brain size={100} />}
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
              {demoType === 'network' ? <ShieldCheck className="text-indigo-500 w-6 h-6" /> : <Brain className="text-indigo-500 w-6 h-6" />}
            </div>
            {demoType === 'network' ? (
              <>
                <h3 className="text-xl font-semibold mb-2">Score Réseau</h3>
                <div className="text-4xl font-bold text-white mb-2">89%</div>
                <p className="text-neutral-400 text-sm">Compatibilité moyenne avec les profils sélectionnés (Internes & Externes).</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">ROI Projeté</h3>
                <div className="text-4xl font-bold text-green-400 mb-2">+50 k€</div>
                <p className="text-neutral-400 text-sm">Économies annuelles sur pénalités et ETP réalloués.</p>
              </>
            )}
          </div>
        </motion.div>

        {/* Pricing/Timeline Card */}
        <motion.div variants={itemVariants} className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group md:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              {demoType === 'network' ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">Tarification Calculée</h3>
                  <p className="text-neutral-400 text-sm max-w-xl">
                    Basé sur vos choix : 2 jours, 1 personne, séjour de travail intensif. 
                    Optimisé par notre algorithme pour respecter votre budget de 2 500€.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">Mission d'Audit</h3>
                  <p className="text-neutral-400 text-sm max-w-xl">
                    Déploiement d'une mission d'une semaine sur site. Analyse de l'existant, interviews et livraison d'une feuille de route actionnable.
                  </p>
                </>
              )}
            </div>
            <div className="text-right mt-4 md:mt-0">
              {demoType === 'network' ? (
                <>
                  <div className="text-4xl font-bold text-white">2 350 €</div>
                  <p className="text-indigo-400 text-sm font-semibold">Dans votre budget (-6%)</p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-white">1 Semaine</div>
                  <p className="text-indigo-400 text-sm font-semibold">Diagnostic Flash</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex justify-center"
      >
        <button
          onClick={onNext}
          className="group flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
        >
          {demoType === 'network' ? 'Voir les profils recommandés' : 'Voir les solutions IA'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
