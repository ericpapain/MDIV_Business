// src/components/admin/analytics/AnalyticsUserJourney.tsx
import { useState } from "react";
import { Route, Clock, ArrowRight, CheckCircle2, User, Sparkles, Filter, ChevronRight, Zap } from "lucide-react";
import type { UserJourney } from "./types";

interface Props {
  journeys: UserJourney[];
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "< 10s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

export function AnalyticsUserJourney({ journeys }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    journeys[0]?.session_id || ""
  );

  const selectedJourney = journeys.find((j) => j.session_id === selectedSessionId) || journeys[0];

  // Calcul des statistiques de l'entonnoir global (Funnel)
  const totalSessions = journeys.length || 1;
  const reachedServices = journeys.filter((j) =>
    j.steps.some((s) => s.page_path.includes("/sejour") || s.page_path.includes("/offres") || s.page_path.includes("/partenaires"))
  ).length;
  const reachedConversionPage = journeys.filter((j) =>
    j.steps.some(
      (s) =>
        s.page_path.includes("/evenements") ||
        s.page_path.includes("/contact") ||
        s.page_path.includes("/charte") ||
        s.page_path.includes("/devis")
    )
  ).length;
  const convertedSessions = journeys.filter((j) => j.conversion).length;

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <Route size={14} />
            <span>Parcours Utilisateur & Entonnoir de Conversion</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Navigation Séquentielle & Détection des Abandons
          </h2>
        </div>

        {/* Badge récapitulatif */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs">
          <span className="text-slate-400">Taux de conversion global :</span>
          <span className="font-mono font-semibold text-[#D4AF37]">
            {((convertedSessions / totalSessions) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ENTONNOIR DE CONVERSION GLOBAL (FUNNEL) */}
      <div className="mb-8 p-4 rounded-xl bg-black/30 border border-white/5">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Entonnoir Global des Sessions (Conversion Flow)</span>
          <span className="text-[10px] text-slate-500">Étape par étape</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Étape 1 */}
          <div className="relative p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <div className="text-[10px] font-mono text-slate-400 mb-1">01. Entrée du site</div>
            <div className="font-semibold text-white text-sm mb-1">Visite & Accueil</div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-mono font-bold text-white">{totalSessions} sess.</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">100%</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full w-full" />
            </div>
          </div>

          {/* Étape 2 */}
          <div className="relative p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <div className="text-[10px] font-mono text-slate-400 mb-1">02. Découverte Offres</div>
            <div className="font-semibold text-white text-sm mb-1">Séjours & Réseau BNE</div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-mono font-bold text-white">{reachedServices} sess.</span>
              <span className="text-xs font-mono text-[#22d3ee] font-semibold">
                {Math.round((reachedServices / totalSessions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#22d3ee] h-full"
                style={{ width: `${Math.round((reachedServices / totalSessions) * 100)}%` }}
              />
            </div>
          </div>

          {/* Étape 3 */}
          <div className="relative p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <div className="text-[10px] font-mono text-slate-400 mb-1">03. Intérêt Qualifié</div>
            <div className="font-semibold text-white text-sm mb-1">Événements & Contact</div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-mono font-bold text-white">{reachedConversionPage} sess.</span>
              <span className="text-xs font-mono text-[#D4AF37] font-semibold">
                {Math.round((reachedConversionPage / totalSessions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-full"
                style={{ width: `${Math.round((reachedConversionPage / totalSessions) * 100)}%` }}
              />
            </div>
          </div>

          {/* Étape 4 */}
          <div className="relative p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20">
            <div className="text-[10px] font-mono text-emerald-400 mb-1">04. Conversion Réussie</div>
            <div className="font-semibold text-white text-sm mb-1">Action Finalisée ✨</div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-mono font-bold text-emerald-400">{convertedSessions} sess.</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {Math.round((convertedSessions / totalSessions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${Math.round((convertedSessions / totalSessions) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE SESSION ET TIMELINE DÉTAILLÉE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Liste des parcours visiteurs (5 Colonnes) */}
        <div className="lg:col-span-5 rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
            <span>Sessions Récemment Observées</span>
            <span className="text-[10px] text-slate-500">Choisir pour explorer</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {journeys.map((j) => {
              const isSelected = j.session_id === selectedJourney?.session_id;
              const startTime = new Date(j.session_start).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={j.session_id}
                  onClick={() => setSelectedSessionId(j.session_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#071526] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-300">
                        <User size={12} />
                      </div>
                      <span className="font-semibold text-white text-xs">
                        Visiteur {j.visitor_id.replace("vis_", "#")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{startTime}</span>
                      {j.conversion && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Conversion" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="truncate max-w-[180px]">
                      {j.city}, {j.country}
                    </div>
                    <div className="font-mono flex items-center gap-2">
                      <span className="text-[#22d3ee]">{j.steps_count} étapes</span>
                      <span>·</span>
                      <span>{formatDuration(j.total_duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Détail du parcours étape par étape (7 Colonnes) */}
        <div className="lg:col-span-7 rounded-xl bg-black/40 border border-white/10 p-5">
          {selectedJourney ? (
            <div>
              {/* Header de la session */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-white/10">
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Parcours Visiteur {selectedJourney.visitor_id.replace("vis_", "#")}</span>
                    {selectedJourney.conversion && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {selectedJourney.conversion}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    Session : {selectedJourney.session_id} · {selectedJourney.city}, {selectedJourney.country}
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-slate-400">
                  <div>Durée totale : <span className="text-white font-semibold">{formatDuration(selectedJourney.total_duration)}</span></div>
                  <div>Étapes parcourues : <span className="text-[#D4AF37] font-semibold">{selectedJourney.steps.length}</span></div>
                </div>
              </div>

              {/* Timeline verticale moderne */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:via-[#22d3ee] before:to-emerald-400">
                {selectedJourney.steps.map((step, index) => {
                  const stepTime = new Date(step.created_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isLast = index === selectedJourney.steps.length - 1;

                  return (
                    <div key={step.page_path + index} className="relative group">
                      {/* Point lumineux sur la timeline */}
                      <div
                        className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#071526] transition-transform group-hover:scale-125 ${
                          step.conversion_event
                            ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                            : index === 0
                            ? "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]"
                            : "bg-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                        }`}
                      />

                      <div className="p-3 rounded-lg bg-[#071526] border border-white/5 hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-slate-400 text-[11px]">{stepTime}</span>
                          <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock size={11} className="text-slate-500" />
                            {formatDuration(step.duration_seconds)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-medium text-white text-xs group-hover:text-[#D4AF37] transition-colors">
                              {step.page_title || step.page_path}
                            </div>
                            <div className="text-[11px] font-mono text-cyan-400/80">
                              {step.page_path}
                            </div>
                          </div>

                          {step.conversion_event ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                              🎯 {step.conversion_event}
                            </span>
                          ) : isLast ? (
                            <span className="text-[10px] text-slate-500 italic whitespace-nowrap">
                              Page de sortie
                            </span>
                          ) : (
                            <ArrowRight size={13} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Sélectionnez une session pour visualiser le cheminement
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
