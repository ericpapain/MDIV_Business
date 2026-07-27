import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DEMO_DASHBOARD_STATS, AUDIT_DASHBOARD_STATS } from '../../../data/mockDemoData';
import { ArrowRight, Users, Zap, Target, TrendingUp, Clock } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

const mockChartDataNetwork = [
  { name: 'Jour 1', interactions: 4, value: 2400 },
  { name: 'Jour 2', interactions: 10, value: 1398 },
  { name: 'Jour 3', interactions: 12, value: 9800 },
];

const mockChartDataAudit = [
  { name: 'Mois 1', interactions: 20, value: 5000 },
  { name: 'Mois 2', interactions: 60, value: 15000 },
  { name: 'Mois 3', interactions: 100, value: 45000 },
];

export function Step7Dashboard({ onNext, demoType }: Props) {
  const isNetwork = demoType === 'network';
  const stats = isNetwork ? DEMO_DASHBOARD_STATS : AUDIT_DASHBOARD_STATS;
  const chartData = isNetwork ? mockChartDataNetwork : mockChartDataAudit;

  const statCards = isNetwork ? [
    { label: 'Compatibilité Moyenne', value: `${stats.compatibility}%`, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Rencontres Qualifiées', value: `+${stats.qualifiedMeetings}`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Potentiel Business', value: stats.businessPotential, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Satisfaction Prédite', value: `${stats.satisfaction}%`, icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
  ] : [
    { label: 'Maturité IA Estimée', value: `${stats.compatibility}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Heures sauvées / an', value: `${stats.qualifiedMeetings}h`, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Économies Projetées', value: stats.businessPotential, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Réduction des Erreurs', value: `${stats.satisfaction}%`, icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="w-full max-w-6xl h-full flex flex-col pt-12 pb-24 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 flex justify-between items-end"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">Tableau de bord IA</h2>
          <p className="text-neutral-400">
            {isNetwork ? 'Indicateurs de performance prédictifs pour votre séjour.' : 'Indicateurs de ROI projetés suite à l\'intégration IA.'}
          </p>
        </div>
        <div className="text-sm bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full text-neutral-400">
          Temps de génération : <span className="text-foreground font-mono">{stats.generationTime}s</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-sm font-medium text-neutral-400">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 mb-8"
      >
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-medium text-neutral-400 mb-6">
            {isNetwork ? 'Évolution des opportunités (Prédictif)' : 'Gains de Productivité (Cumulatifs)'}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-medium text-neutral-400 mb-6">
            {isNetwork ? 'Intensité du Networking' : 'Automatisation des Processus (%)'}
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="interactions" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#171717', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="flex justify-center mt-auto"
      >
        <button
          onClick={onNext}
          className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-neutral-200"
        >
          Finaliser
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
