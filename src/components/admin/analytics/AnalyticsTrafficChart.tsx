// src/components/admin/analytics/AnalyticsTrafficChart.tsx
import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, Users, Activity, Eye, Check } from "lucide-react";
import type { TimelinePoint } from "./types";

interface Props {
  data: TimelinePoint[];
  period: string;
  onPeriodChange: (p: string) => void;
  isLoading?: boolean;
}

const PERIODS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "yesterday", label: "Hier" },
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "90d", label: "90 jours" },
  { id: "12m", label: "12 mois" },
];

export function AnalyticsTrafficChart({ data, period, onPeriodChange, isLoading }: Props) {
  const [showVisitors, setShowVisitors] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
  const [showPageviews, setShowPageviews] = useState(true);

  // Calcul des totaux pour le résumé
  const totalVisitors = data.reduce((acc, d) => acc + (d.visitors || 0), 0);
  const totalSessions = data.reduce((acc, d) => acc + (d.sessions || 0), 0);
  const totalPageviews = data.reduce((acc, d) => acc + (d.pageviews || 0), 0);

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header avec Titre et Filtres de Périodes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <TrendingUp size={14} />
            <span>Évolution du Trafic</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Fréquentation & Dynamique d'Audience
          </h2>
        </div>

        {/* Sélecteur de périodes */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
          {PERIODS.map((p) => {
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPeriodChange(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles pour activer/désactiver les courbes */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {/* Toggle Visiteurs uniques */}
          <button
            onClick={() => setShowVisitors(!showVisitors)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showVisitors
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                : "bg-white/5 border-white/10 text-slate-500 line-through opacity-60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <Users size={13} />
            <span>Visiteurs uniques</span>
            <span className="font-mono text-[10px] ml-1 px-1.5 py-0.2 rounded bg-black/30">
              {totalVisitors.toLocaleString("fr-FR")}
            </span>
          </button>

          {/* Toggle Sessions */}
          <button
            onClick={() => setShowSessions(!showSessions)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showSessions
                ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                : "bg-white/5 border-white/10 text-slate-500 line-through opacity-60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <Activity size={13} />
            <span>Sessions</span>
            <span className="font-mono text-[10px] ml-1 px-1.5 py-0.2 rounded bg-black/30">
              {totalSessions.toLocaleString("fr-FR")}
            </span>
          </button>

          {/* Toggle Pages vues */}
          <button
            onClick={() => setShowPageviews(!showPageviews)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showPageviews
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.15)]"
                : "bg-white/5 border-white/10 text-slate-500 line-through opacity-60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <Eye size={13} />
            <span>Pages vues</span>
            <span className="font-mono text-[10px] ml-1 px-1.5 py-0.2 rounded bg-black/30">
              {totalPageviews.toLocaleString("fr-FR")}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Ratio: <span className="text-[#D4AF37]">{(totalPageviews / (totalSessions || 1)).toFixed(2)}</span> pages/session
        </div>
      </div>

      {/* Graphique interactif Recharts */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientPageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#ffffff15" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-[#071526]/95 border border-[#D4AF37]/40 p-3 shadow-xl backdrop-blur-md">
                      <div className="text-xs font-semibold text-white mb-2 pb-1.5 border-b border-white/10 flex items-center justify-between">
                        <span>Période : {label}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                              {entry.name} :
                            </span>
                            <span className="font-mono font-semibold text-white">
                              {entry.value.toLocaleString("fr-FR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {showPageviews && (
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Pages vues"
                stroke="#818cf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientPageviews)"
              />
            )}

            {showSessions && (
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#D4AF37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradientSessions)"
              />
            )}

            {showVisitors && (
              <Area
                type="monotone"
                dataKey="visitors"
                name="Visiteurs uniques"
                stroke="#22d3ee"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#gradientVisitors)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
