// src/components/admin/analytics/AnalyticsRealtimeWidget.tsx
import { useState, useEffect } from "react";
import { Radio, Eye, MapPin, Clock, RefreshCw, Zap } from "lucide-react";
import type { RealtimeFeedItem } from "./types";

interface Props {
  activeCount: number;
  activePages: Array<{ page_path: string; page_title: string; count: number }>;
  recentFeed: RealtimeFeedItem[];
  onRefreshManual: () => void;
  secondsRemaining: number;
}

export function AnalyticsRealtimeWidget({
  activeCount,
  activePages,
  recentFeed,
  onRefreshManual,
  secondsRemaining,
}: Props) {
  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header avec indicateur live pulsing et compte à rebours de rafraîchissement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Radio size={14} className="animate-pulse" />
              <span>Surveillance en Direct (Live Pulse)</span>
            </div>
            <h2 className="text-xl font-display font-semibold text-white">
              Activité Temps Réel des Visiteurs
            </h2>
          </div>
        </div>

        {/* Compte à rebours 15s & Bouton Rafraîchir */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span>MAJ auto dans</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              {secondsRemaining}s
            </span>
          </div>

          <button
            onClick={onRefreshManual}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Rafraîchir maintenant"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* GROS COMPTEUR DE VISITEURS CONNECTÉS (3 Colonnes) */}
        <div className="lg:col-span-3 rounded-xl bg-black/40 border border-emerald-500/30 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
            <Radio size={24} className="animate-pulse" />
          </div>

          <div className="text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight font-mono mb-1">
            {activeCount}
          </div>

          <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-2">
            Visiteurs en ligne
          </div>

          <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
            Activité détectée au cours des 5 dernières minutes sur le réseau.
          </p>
        </div>

        {/* PAGES ACTUELLEMENT CONSULTÉES (4 Colonnes) */}
        <div className="lg:col-span-4 rounded-xl bg-black/40 border border-white/10 p-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Eye size={13} />
              <span>Pages Ouvertes Actuellement</span>
            </div>
            <span className="text-[10px] text-slate-500">Lecteurs</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {activePages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Aucune page active en ce moment
              </div>
            ) : (
              activePages.map((page, idx) => (
                <div
                  key={page.page_path + idx}
                  className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-[180px] sm:max-w-[220px]">
                    <div className="text-white font-medium truncate">
                      {page.page_title || page.page_path}
                    </div>
                    <div className="font-mono text-cyan-400/80 text-[11px] truncate">
                      {page.page_path}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-semibold">
                    <span>{page.count}</span>
                    <span className="text-[10px]">vis.</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DERNIÈRES INTERACTIONS EN DIRECT / FEED (5 Colonnes) */}
        <div className="lg:col-span-5 rounded-xl bg-black/40 border border-white/10 p-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#D4AF37]">
              <Zap size={13} />
              <span>Flux d'Activité Récente</span>
            </div>
            <span className="text-[10px] text-slate-500">Derniers signaux</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {recentFeed.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                En attente de nouvelles requêtes...
              </div>
            ) : (
              recentFeed.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <span className="text-xs">{item.country === "France" ? "🇫🇷" : "🌍"}</span>
                    <div className="truncate">
                      <div className="text-white font-medium truncate">
                        {item.page_path}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.city}, {item.country} ({item.browser})
                      </div>
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap font-mono text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">
                      Il y a {item.seconds_ago}s
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
