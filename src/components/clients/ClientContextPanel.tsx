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
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all ${className}`}>
      {/* Header Accordion */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">
                {data?.client?.company || data?.client?.name || "Dossier Client 360°"}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded uppercase font-extrabold bg-indigo-100 text-indigo-700">
                Écosystème unifié
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {data?.client?.email} {data?.client?.phone ? `• ${data?.client?.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />}
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
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs text-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-amber-900">Profil IA & Directives : </span>
                {data.executive_context}
              </div>
            </div>
          )}

          {/* KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Devis en cours</span>
              <span className="text-base font-bold text-slate-900">
                {data?.financial_summary?.pending_quotes_count || 0}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${
              (data?.financial_summary?.overdue_invoices_count || 0) > 0 
                ? 'bg-rose-50 border-rose-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Factures en retard</span>
              <span className={`text-base font-bold ${
                (data?.financial_summary?.overdue_invoices_count || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {data?.financial_summary?.overdue_invoices_count || 0}
                {(data?.financial_summary?.total_overdue_amount || 0) > 0 && (
                  <span className="text-xs font-semibold ml-1">
                    ({data?.financial_summary?.total_overdue_amount.toFixed(0)} €)
                  </span>
                )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Historique consolidé</span>
              <span className="text-base font-bold text-indigo-600">
                {(data?.interactions?.length || 0)} échange(s)
              </span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-slate-100 gap-4 text-[11px] font-bold uppercase text-slate-500">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'timeline' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Échanges & Messages ({data?.interactions?.length || 0})
              {activeTab === 'timeline' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'quotes' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Devis ({data?.quotes?.length || 0})
              {activeTab === 'quotes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'invoices' ? 'text-indigo-600' : 'hover:text-slate-900'
              }`}
            >
              Factures ({data?.invoices?.length || 0})
              {activeTab === 'invoices' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
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
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {interaction.direction === 'inbound' ? (
                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] uppercase">
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Reçu
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px] uppercase">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Envoyé
                            </span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="truncate max-w-[200px]">
                            {interaction.subject}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {new Date(interaction.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className="text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {interaction.summary || interaction.body_text}
                      </p>

                      {interaction.direction === 'inbound' && onSelectMessageToReply && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onSelectMessageToReply(interaction.body_text, interaction.subject)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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
                    <div key={q.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{q.quote_number}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{new Date(q.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block mb-1">{Number(q.total_ttc).toLocaleString('fr-FR')} € TTC</span>
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                          q.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
                    <div key={inv.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{inv.invoice_number}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">Échéance : {inv.due_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block mb-1">{Number(inv.amount_ttc).toLocaleString('fr-FR')} € TTC</span>
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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
