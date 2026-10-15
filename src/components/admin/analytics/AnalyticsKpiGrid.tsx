// src/components/admin/analytics/AnalyticsKpiGrid.tsx
import { Users, UserCheck, Activity, Eye, Clock, Layers, TrendingDown, Radio, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { AnalyticsKpis } from "./types";

interface Props {
  kpis: AnalyticsKpis;
  isLoading?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

export function AnalyticsKpiGrid({ kpis, isLoading }: Props) {
  if (!kpis) return null;

  const cards = [
    {
      id: "visitors_today",
      icon: Users,
      title: kpis.visitors_today.label || "Visiteurs aujourd'hui",
      value: kpis.visitors_today.value.toLocaleString("fr-FR"),
      trend: kpis.visitors_today.trend,
      compare: kpis.visitors_today.compare,
      accentColor: "border-[#D4AF37]/30 text-[#D4AF37]",
      glowColor: "group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
      isLive: false,
    },
    {
      id: "unique_visitors",
      icon: UserCheck,
      title: kpis.unique_visitors.label || "Visiteurs uniques",
      value: kpis.unique_visitors.value.toLocaleString("fr-FR"),
      trend: kpis.unique_visitors.trend,
      compare: kpis.unique_visitors.compare,
      accentColor: "border-cyan-500/30 text-cyan-400",
      glowColor: "group-hover:border-cyan-500/60 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
      isLive: false,
    },
    {
      id: "total_sessions",
      icon: Activity,
      title: kpis.total_sessions.label || "Sessions totales",
      value: kpis.total_sessions.value.toLocaleString("fr-FR"),
      trend: kpis.total_sessions.trend,
      compare: kpis.total_sessions.compare,
      accentColor: "border-[#D4AF37]/30 text-[#D4AF37]",
      glowColor: "group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
      isLive: false,
    },
    {
      id: "pageviews",
      icon: Eye,
      title: kpis.pageviews.label || "Pages vues",
      value: kpis.pageviews.value.toLocaleString("fr-FR"),
      trend: kpis.pageviews.trend,
      compare: kpis.pageviews.compare,
      accentColor: "border-cyan-500/30 text-cyan-400",
      glowColor: "group-hover:border-cyan-500/60 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
      isLive: false,
    },
    {
      id: "avg_duration",
      icon: Clock,
      title: kpis.avg_duration.label || "Temps moyen par visite",
      value: formatDuration(kpis.avg_duration.value),
      trend: kpis.avg_duration.trend,
      compare: kpis.avg_duration.compare,
      accentColor: "border-[#D4AF37]/30 text-[#D4AF37]",
      glowColor: "group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
      isLive: false,
    },
    {
      id: "pages_per_session",
      icon: Layers,
      title: kpis.pages_per_session.label || "Pages par session",
      value: `${kpis.pages_per_session.value}`,
      trend: kpis.pages_per_session.trend,
      compare: kpis.pages_per_session.compare,
      accentColor: "border-cyan-500/30 text-cyan-400",
      glowColor: "group-hover:border-cyan-500/60 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]",
      isLive: false,
    },
    {
      id: "bounce_rate",
      icon: TrendingDown,
      title: kpis.bounce_rate.label || "Taux de rebond",
      value: `${kpis.bounce_rate.value}%`,
      trend: kpis.bounce_rate.trend,
      compare: kpis.bounce_rate.compare,
      invertTrend: true, // Pour le rebond, une baisse est positive
      accentColor: "border-[#D4AF37]/30 text-[#D4AF37]",
      glowColor: "group-hover:border-[#D4AF37]/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
      isLive: false,
    },
    {
      id: "realtime_active",
      icon: Radio,
      title: kpis.realtime_active.label || "Visiteurs actifs en direct",
      value: `${kpis.realtime_active.value}`,
      trend: 0,
      compare: kpis.realtime_active.compare,
      accentColor: "border-emerald-500/40 text-emerald-400",
      glowColor: "group-hover:border-emerald-500/70 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      isLive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const isPositive = card.invertTrend ? card.trend < 0 : card.trend >= 0;
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            className={`group relative overflow-hidden rounded-xl bg-[#071526]/90 border border-white/10 p-5 backdrop-blur-md transition-all duration-300 ${card.glowColor}`}
          >
            {/* Gradient d'arrière plan discret */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-black/40 border ${card.accentColor} flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}>
                <IconComponent size={18} />
              </div>

              {card.isLive ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">En direct</span>
                </div>
              ) : (
                <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{card.trend > 0 ? `+${card.trend}%` : `${card.trend}%`}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                {card.title}
              </div>
              <div className="text-2xl lg:text-3xl font-display font-semibold text-white tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                <span>{card.compare}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
