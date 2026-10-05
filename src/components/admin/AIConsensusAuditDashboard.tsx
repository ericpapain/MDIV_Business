// src/components/admin/AIConsensusAuditDashboard.tsx
import React, { useState, useEffect } from "react";
import { 
  Activity, Coins, Clock, Brain, ShieldAlert, CheckCircle2, 
  ChevronRight, RefreshCw, Filter, Layers, MessageSquare, 
  AlertTriangle, Sparkles, Terminal
} from "lucide-react";
import { TelemetryService, TelemetryResponse, AuditLogItem } from "@/lib/telemetryService";

interface AIConsensusAuditDashboardProps {
  companyId?: number;
}

export const AIConsensusAuditDashboard: React.FC<AIConsensusAuditDashboardProps> = ({ companyId }) => {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);

  const loadTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await TelemetryService.getTelemetry(companyId, selectedTool || undefined, 30);
      setData(res);
      if (res.recent_logs && res.recent_logs.length > 0 && !activeLog) {
        setActiveLog(res.recent_logs[0]);
      }
    } catch (e) {
      console.error("Erreur de chargement de la télémétrie:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, [companyId, selectedTool]);

  const kpis = data?.kpis || {
    total_runs: 0,
    total_tokens: 0,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_cost_eur: 0,
    avg_latency_ms: 0,
    arbitrated_rate: 0,
    unanimous_rate: 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête avec Filtre et Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              Observabilité Multi-Agents & Token Economics
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Temps Réel
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Traçabilité complète des consensus d'agents, coûts réels d'inférence et respect des SLAs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="text-xs font-semibold bg-secondary border border-border rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="">Tous les modules IA</option>
            <option value="meeting">Réunions & Comités</option>
            <option value="invoice">Audit Factures</option>
            <option value="quote">Chiffrage Devis</option>
            <option value="summarizer">Synthèse Documentaire</option>
          </select>

          <button
            onClick={loadTelemetry}
            disabled={isLoading}
            className="p-2 bg-secondary hover:bg-muted rounded-xl border border-border text-foreground transition-colors cursor-pointer"
            title="Rafraîchir les métriques"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Cartes KPI Token Economics & Latence */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Délibérations Totales */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Délibérations</span>
            <Layers size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {kpis.total_runs.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Taux d'arbitrage : <strong className="text-blue-400">{kpis.arbitrated_rate}%</strong>
          </div>
        </div>

        {/* KPI 2 : Coût Inférence Cumulé */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Coût Inférence</span>
            <Coins size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {kpis.total_cost_eur.toFixed(4)} €
          </div>
          <div className="text-[11px] text-muted-foreground">
            Coût moyen : <strong>{kpis.total_runs > 0 ? (kpis.total_cost_eur / kpis.total_runs).toFixed(5) : 0} € / run</strong>
          </div>
        </div>

        {/* KPI 3 : Tokens Consommés */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Tokens Consommés</span>
            <Brain size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {kpis.total_tokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>In: {kpis.total_prompt_tokens.toLocaleString()}</span>
            <span>Out: {kpis.total_completion_tokens.toLocaleString()}</span>
          </div>
        </div>

        {/* KPI 4 : Latence Moyenne */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Latence Pipeline</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {(kpis.avg_latency_ms / 1000).toFixed(2)}s
          </div>
          <div className="text-[11px] text-muted-foreground">
            SLA cible 4 agents : <strong className="text-emerald-400">&lt; 8s</strong>
          </div>
        </div>
      </div>

      {/* Grille : Liste des Sessions d'Audit & Inspecteur de Délibération */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Gauche : Liste des Délibérations Récentes */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2">
            Historique des Délibérations ({data?.recent_logs?.length || 0})
          </h4>

          {data?.recent_logs && data.recent_logs.length > 0 ? (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {data.recent_logs.map((log) => {
                const isSelected = activeLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setActiveLog(log)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                        : "bg-secondary/40 border-border hover:border-primary/40 hover:bg-secondary/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-primary">
                        {log.tool_type.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.consensus_status === 'UNANIMOUS'
                          ? "bg-emerald-500/10 text-emerald-400"
                          : log.consensus_status === 'FLAGGED_RISK'
                          ? "bg-red-500/10 text-red-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {log.consensus_status}
                      </span>
                    </div>

                    <h5 className="font-bold text-foreground text-xs truncate mb-1">
                      {log.document_name}
                    </h5>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{log.model}</span>
                      <span>{(log.total_latency_ms / 1000).toFixed(1)}s • {log.cost_estimate_eur.toFixed(4)}€</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-xs">
              Aucune délibération enregistrée pour le moment.
            </div>
          )}
        </div>

        {/* Colonne Droite : Inspecteur de Consensus Trail (Qui a dit quoi) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Terminal size={16} className="text-primary" />
                Traçabilité du Consensus (Consensus Trail)
              </h4>
              <p className="text-xs text-muted-foreground">
                Détail séquentiel des échanges entre les 4 agents IA pour ce livrable.
              </p>
            </div>

            {activeLog && (
              <span className="text-xs font-mono text-muted-foreground">
                Session : {activeLog.session_id.substring(0, 16)}...
              </span>
            )}
          </div>

          {activeLog ? (
            <div className="space-y-4">
              {/* Agent 1 : Factuel */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Agent 1 : Analyste Factuel & Extraction
                  </span>
                  <span className="text-[10px] text-blue-300/70 uppercase">Extraction Brute</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeLog.agents_trail?.agent1_factuel || activeLog.agents_trail?.agent1_fiscal || "Extraction des faits réalisée avec succès."}
                </p>
              </div>

              {/* Agent 2 : Critique & Risques */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Agent 2 : Auditeur Critique & Risques
                  </span>
                  <span className="text-[10px] text-amber-300/70 uppercase">Challenge & Alertes</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeLog.agents_trail?.agent2_critique || activeLog.agents_trail?.agent2_recouvrement || "Analyse critique des risques opérationnels finalisée."}
                </p>
              </div>

              {/* Agent 3 : Stratège & Arbitre */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Agent 3 : Stratège Exécutif & Arbitrage RACI
                  </span>
                  <span className="text-[10px] text-purple-300/70 uppercase">Arbitrage Opérationnel</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeLog.agents_trail?.agent3_arbitre || activeLog.agents_trail?.agent3_dg || "Synthèse d'arbitrage validée."}
                </p>
              </div>

              {/* Agent 4 : Directeur Général */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Agent 4 : Directeur Général (Décision Finale)
                  </span>
                  <span className="text-[10px] text-emerald-300/70 uppercase">Livrable Certifié</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeLog.agents_trail?.agent4_dg || "Synthèse exécutive certifiée pour diffusion."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-xs">
              Sélectionnez une délibération à gauche pour afficher son Consensus Trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
