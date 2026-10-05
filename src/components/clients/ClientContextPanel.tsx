// src/components/clients/ClientContextPanel.tsx

import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, Clock, FileText, AlertTriangle, 
  CheckCircle, ArrowDownLeft, ArrowUpRight, MessageSquare, 
  Sparkles, RefreshCw, ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  fetchClient360, 
  Client360Response, 
  ClientInteraction 
} from '@/lib/clientContextHubService';

interface ClientContextPanelProps {
  clientId?: number | string | null;
  companyId?: number;
  onSelectMessageToReply?: (messageText: string, subject: string) => void;
  className?: string;
}

export const ClientContextPanel: React.FC<ClientContextPanelProps> = ({
  clientId,
  companyId,
  onSelectMessageToReply,
  className = ""
}) => {
  const [data, setData] = useState<Client360Response | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'quotes' | 'invoices'>('timeline');

  useEffect(() => {
    if (clientId && Number(clientId) > 0) {
      loadContext(Number(clientId));
    } else {
      setData(null);
    }
  }, [clientId, companyId]);

  const loadContext = async (cid: number) => {
    setIsLoading(true);
    try {
      const res = await fetchClient360(cid, companyId);
      setData(res);
    } catch (err) {
      console.error("Erreur chargement contexte 360 client:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientId || Number(clientId) <= 0) {
    return null;
  }

  return (
    <div className={`bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md transition-all ${className}`}>
      {/* Header Accordion */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-slate-800/80 bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white text-sm">
                {data?.client?.company || data?.client?.name || "Dossier Client 360°"}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Écosystème unifié
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {data?.client?.email} {data?.client?.phone ? `• ${data?.client?.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Executive Summary Bar */}
          {data?.executive_context && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">Profil IA & Directives : </span>
                {data.executive_context}
              </div>
            </div>
          )}

          {/* KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block">Devis en cours</span>
              <span className="text-base font-bold text-white">
                {data?.financial_summary?.pending_quotes_count || 0}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              (data?.financial_summary?.overdue_invoices_count || 0) > 0 
                ? 'bg-rose-950/30 border-rose-500/40' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <span className="text-[11px] text-slate-400 block">Factures en retard</span>
              <span className={`text-base font-bold ${
                (data?.financial_summary?.overdue_invoices_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {data?.financial_summary?.overdue_invoices_count || 0}
                {(data?.financial_summary?.total_overdue_amount || 0) > 0 && (
                  <span className="text-xs font-normal ml-1">
                    ({data?.financial_summary?.total_overdue_amount.toFixed(0)} €)
                  </span>
                )}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 block">Historique consolidé</span>
              <span className="text-base font-bold text-indigo-400">
                {(data?.interactions?.length || 0)} échange(s)
              </span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-800 gap-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'timeline' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Échanges & Messages ({data?.interactions?.length || 0})
              {activeTab === 'timeline' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'quotes' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Devis ({data?.quotes?.length || 0})
              {activeTab === 'quotes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'invoices' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Factures ({data?.invoices?.length || 0})
              {activeTab === 'invoices' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-64 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {activeTab === 'timeline' && (
              <>
                {(!data?.interactions || data.interactions.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    Aucun échange consigné pour ce client. Les prochains messages seront automatiquement archivés ici.
                  </p>
                ) : (
                  data.interactions.map((interaction: ClientInteraction) => (
                    <div 
                      key={interaction.id}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          {interaction.direction === 'inbound' ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Reçu
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Envoyé
                            </span>
                          )}
                          <span>•</span>
                          <span className="text-white font-medium truncate max-w-[200px]">
                            {interaction.subject}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(interaction.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className="text-slate-400 line-clamp-2 leading-relaxed">
                        {interaction.summary || interaction.body_text}
                      </p>

                      {interaction.direction === 'inbound' && onSelectMessageToReply && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onSelectMessageToReply(interaction.body_text, interaction.subject)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 font-medium transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            Répondre à ce mail
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'quotes' && (
              <>
                {(!data?.quotes || data.quotes.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">Aucun devis émis.</p>
                ) : (
                  data.quotes.map(q => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{q.quote_number}</span>
                        <span className="text-[11px] text-slate-400">{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-200 block">{Number(q.total_ttc).toLocaleString('fr-FR')} € TTC</span>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'invoices' && (
              <>
                {(!data?.invoices || data.invoices.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">Aucune facture enregistrée.</p>
                ) : (
                  data.invoices.map(inv => (
                    <div key={inv.id} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{inv.invoice_number}</span>
                        <span className="text-[11px] text-slate-400">Échéance : {inv.due_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-200 block">{Number(inv.amount_ttc).toLocaleString('fr-FR')} € TTC</span>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
