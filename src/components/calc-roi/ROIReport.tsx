import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock, DollarSign, CheckCircle2, Zap, MailCheck, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  ROIFormData, computeROIMetrics, buildChartData,
  getRoiInterpretation, getRecommendations, formatCurrency,
} from "./roiUtils";

interface ROIReportProps {
  data: ROIFormData;
  onReset: () => void;
}

export function ROIReport({ data, onReset }: ROIReportProps) {
  const metrics = computeROIMetrics(data);
  const { monthlySavedTime, annualSavedTime, monthlySavings, annualSavings, roi, paybackPeriodMonths } = metrics;
  const chartData = buildChartData(monthlySavings, data.aiMonthlyCost);
  const interpretation = getRoiInterpretation(roi);
  const recommendations = getRecommendations(data.process);

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[600px]"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            Rapport Confidentiel
          </div>
          <h2 className="text-3xl font-display font-bold text-white">Rapport d'Impact IA</h2>
          <p className="text-slate-400 mt-1">
            Analyse pour : <span className="text-white font-semibold">{data.companyName}</span>{" "}
            ({data.process})
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="font-display text-2xl tracking-wider text-white">
            M<span className="text-gold">.</span>DIV
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-gold text-xl">Business</span>
          </span>
          <span className="text-[9px] tracking-[0.32em] uppercase text-slate-500 mt-1">
            Business · Travel · Capital
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Clock, color: "emerald", label: "Temps / MOIS", value: `+${Math.round(monthlySavedTime)}h` },
          { icon: Clock, color: "emerald", label: "Temps / AN",   value: `+${Math.round(annualSavedTime)}h` },
          { icon: DollarSign, color: "blue", label: "ÉCONOMIE / MOIS", value: formatCurrency(monthlySavings) },
          { icon: DollarSign, color: "blue", label: "ÉCONOMIE / AN",  value: formatCurrency(annualSavings) },
        ].map(({ icon: Icon, color, label, value }) => (
          <div
            key={label}
            className={`bg-slate-900/60 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-${color}-500/30 transition-colors`}
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Icon size={80} />
            </div>
            <div className={`text-slate-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5`}>
              <Icon size={14} className={`text-${color}-500`} /> {label}
            </div>
            <div className={`text-3xl font-bold text-${color}-400`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ROI Highlight */}
      <div className={`p-8 rounded-2xl border mb-10 flex flex-col md:flex-row items-center justify-between gap-8 ${interpretation.bg} ${interpretation.border}`}>
        <div className="flex-1">
          <h3 className={`text-2xl font-bold mb-2 ${interpretation.color}`}>{interpretation.title}</h3>
          <p className="text-slate-300 text-base max-w-lg leading-relaxed">{interpretation.desc}</p>
          <div className="mt-5 flex gap-4 text-sm font-semibold">
            <div className="bg-black/20 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
              <span className="text-slate-400 uppercase text-xs tracking-wider">Payback Period :</span>
              <span className="text-white text-base">
                {paybackPeriodMonths < 1 ? "< 1 mois" : `${Math.round(paybackPeriodMonths)} mois`}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-center bg-black/20 p-6 rounded-2xl border border-white/5 min-w-[200px]">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">ROI ESTIMÉ</div>
          <div className={`text-6xl font-display font-bold ${interpretation.color}`}>
            {roi > 1000 ? ">1000" : Math.round(roi)}
            <span className="text-3xl">%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-[350px] flex flex-col">
          <h4 className="text-base font-bold text-white mb-6">Évolution Financière (12 mois)</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k€`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}
                  itemStyle={{ fontSize: "13px", fontWeight: "bold" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="Économies cumulées" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGains)" />
                <Area type="monotone" dataKey="Coût cumulé" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-[350px] flex flex-col">
          <h4 className="text-base font-bold text-white mb-6">Comparatif Mensuel : Avant vs Après IA</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Coût actuel (Sans IA)", Coût: monthlySavings, fill: "#64748b" },
                  { name: "Investissement IA",     Coût: data.aiMonthlyCost, fill: "#3b82f6" },
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k€`} />
                <RechartsTooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="Coût" radius={[6, 6, 0, 0]} maxBarSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/20 p-8 rounded-3xl border border-blue-500/30 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
            <Zap className="text-blue-400" size={28} /> Plan d'Action Recommandé
          </h3>
          <p className="text-slate-300 text-base mb-8">
            Voici les 5 tâches prioritaires à automatiser pour le processus{" "}
            <strong>{data.process}</strong> dans le secteur <strong>{data.sector}</strong> :
          </p>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors"
                >
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200 leading-relaxed font-medium">{rec}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-white/10 flex flex-col justify-center items-center text-center backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/30">
                <MailCheck size={28} />
              </div>
              <h4 className="font-bold text-xl mb-3 text-white">Passez à l'action</h4>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-sm">
                Un audit personnalisé gratuit vous permettra de valider techniquement ces hypothèses et
                de choisir les bons outils (ChatGPT, Copilot, Make, N8N...).
              </p>
              <Link
                to="/services-ia/diagnostic"
                className="ia-btn-primary w-full py-4 text-base font-bold shadow-xl shadow-blue-500/20 rounded-xl"
              >
                Réserver un audit IA gratuit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row justify-center gap-5">
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-lg text-sm group"
        >
          <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
          Recevoir mon rapport détaillé
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center px-8 py-4 border-2 border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-all text-sm"
        >
          Refaire une simulation
        </button>
      </div>
    </motion.div>
  );
}
