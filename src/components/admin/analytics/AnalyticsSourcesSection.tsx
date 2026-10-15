// src/components/admin/analytics/AnalyticsSourcesSection.tsx
import { Share2, Compass, Search, ExternalLink, ArrowUpRight } from "lucide-react";
import type { TrafficSourceItem } from "./types";

interface Props {
  sources: TrafficSourceItem[];
}

export function AnalyticsSourcesSection({ sources }: Props) {
  const maxVisitors = Math.max(...sources.map((s) => s.visitors), 1);

  const getSourceIcon = (src: string) => {
    const s = src.toLowerCase();
    if (s.includes("google") || s.includes("bing")) return <Search size={14} className="text-cyan-400" />;
    if (s.includes("linkedin") || s.includes("facebook") || s.includes("instagram") || s.includes("twitter"))
      return <Share2 size={14} className="text-[#D4AF37]" />;
    return <Compass size={14} className="text-slate-400" />;
  };

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <Share2 size={14} />
            <span>Canaux d'Acquisition & Provenance</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Sources de Trafic & Taux de Conversion
          </h2>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {sources.length} canaux identifiés
        </div>
      </div>

      {/* Grille des Sources avec barres relatives et métriques */}
      <div className="space-y-3">
        {sources.map((source) => {
          const ratio = Math.min(100, Math.round((source.visitors / maxVisitors) * 100));
          const conversionRate =
            source.visitors > 0
              ? ((source.conversions / source.visitors) * 100).toFixed(1)
              : "0.0";

          return (
            <div
              key={source.source}
              className="group p-3.5 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {getSourceIcon(source.source)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs group-hover:text-[#D4AF37] transition-colors">
                      {source.source}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Canal vérifié
                    </div>
                  </div>
                </div>

                {/* Métriques */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Visiteurs</span>
                    <span className="font-semibold text-white">{source.visitors.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Sessions</span>
                    <span className="text-slate-300">{source.sessions.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Conversions</span>
                    <span className="text-emerald-400 font-semibold">{source.conversions} ({conversionRate}%)</span>
                  </div>
                  <div className="text-right w-12">
                    <span className="text-slate-400 text-[10px] block">Part</span>
                    <span className="text-[#D4AF37] font-semibold">{source.percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Jauge visuelle */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-[#D4AF37] to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
