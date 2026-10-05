import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Calendar, User, Sparkles, Loader2, ChevronDown,
  Target, AlertTriangle, HelpCircle, TrendingUp, Zap, Clock,
  Copy, Check, FileText, Building2, History, Shield, Brain, CheckCircle2, RefreshCcw
} from 'lucide-react';

import {
  fetchUpcomingMeetings, fetchClientHistory, generateMeetingBriefing,
  UpcomingMeeting, ClientHistory, MeetingBriefing, MeetingPrepRequest
} from '@/lib/meetingPrepService';
import { fetchClients, Client } from '@/lib/quoteService'; // réutilisation service existant
import { ClientSelectWithCreate } from '@/components/clients/ClientSelectWithCreate';
import { CalendarScheduleModal } from '@/components/integrations/CalendarScheduleModal';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';


// ─── Sub-components ───────────────────────────────────────────────────────────

function BriefingSection({
  icon, title, color, items, prose
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  items?: string[];
  prose?: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="flex items-center gap-2 font-bold text-sm mb-3">
        {icon} {title}
      </div>
      {prose && <p className="text-sm leading-relaxed font-medium text-slate-700">{prose}</p>}
      {items && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-60" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesIAMeetingPrep() {
  const { company } = useAuth();
  const { language } = useLanguage();

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('meeting-prep');

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingContext, setMeetingContext] = useState('');
  const [meetingObjective, setMeetingObjective] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<MeetingBriefing | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [company?.id]);

  useEffect(() => {
    if (selectedClientId && typeof selectedClientId === 'number') {
      loadClientHistory(selectedClientId);
    } else {
      setClientHistory(null);
    }
  }, [selectedClientId]);

  const loadInitialData = async () => {
    if (!company?.id) {
      setClients([]);
      setUpcomingMeetings([]);
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const [c, m] = await Promise.all([
        fetchClients(company?.id),         // réutilise le service existant Devis/Factures
        fetchUpcomingMeetings(company?.id)
      ]);
      setClients(c);
      setUpcomingMeetings(m);
    } catch (_) { /* handled by empty states */ }
    setIsLoadingData(false);
  };

  const loadClientHistory = async (clientId: number) => {
    if (!company?.id) {
      setClientHistory(null);
      return;
    }
    try {
      const h = await fetchClientHistory(clientId, company?.id);
      setClientHistory(h);
    } catch (_) {
      setClientHistory(null);
    }
  };

  const prefillFromMeeting = (meeting: UpcomingMeeting) => {
    if (meeting.clientId) setSelectedClientId(meeting.clientId);
    setMeetingDate(meeting.dateTime.slice(0, 16)); // datetime-local format
    setMeetingContext(`RDV : ${meeting.title}${meeting.location ? ` — ${meeting.location}` : ''}`);
    toast.success(`RDV "${meeting.title}" importé depuis votre calendrier.`);
  };

  const handleGenerate = async () => {
    if (!selectedClientId) {
      toast.error('Veuillez sélectionner un client ou prospect.');
      return;
    }
    if (!meetingDate) {
      toast.error('Veuillez indiquer la date du rendez-vous.');
      return;
    }

    if (!checkCanExecute()) return;

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const req: MeetingPrepRequest = {
      clientId: selectedClientId as number,
      clientName: selectedClient?.name,
      meetingDate,
      meetingContext,
      meetingObjective,
    };

    setIsGenerating(true);
    setBriefing(null);
    try {
      const result = await generateMeetingBriefing(req, company?.id);
      setBriefing(result);
      recordExecution();
      toast.success('Briefing généré avec succès.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyAll = () => {
    if (!briefing) return;
    const text = [
      `=== BRIEFING RDV ===`,
      `\n📝 Synthèse 1 minute\n${briefing.oneLinerSummary}`,
      `\n👤 Résumé client\n${briefing.clientSummary}`,
      `\n🎯 Objectifs de la réunion\n${briefing.meetingObjectives.join('\n')}`,
      `\n💡 Opportunités\n${briefing.opportunities.join('\n')}`,
      `\n⚠️ Objections probables\n${briefing.probableObjections.join('\n')}`,
      `\n❓ Questions recommandées\n${briefing.recommendedQuestions.join('\n')}`,
      `\n🔍 Stratégie de découverte\n${briefing.discoveryStrategy}`,
      `\n✅ Actions recommandées\n${briefing.recommendedActions.join('\n')}`,
    ].join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Briefing copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header avec Vidéo et Étapes */}
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
          <div className="pt-2 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
                <ArrowLeft size={16} /> "Retour aux Services IA"
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
                <RefreshCcw size={16} /> "Actualiser et recommencer"
              </button>
            </div>
            <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Calendar size={16} /> Assistant Commercial
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Préparation de RDV IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              L'IA analyse l'historique réel du client et génère un briefing complet :
              synthèse, objections probables, questions recommandées et stratégie de découverte.
            </p>

            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-indigo-300 via-blue-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-indigo-400 opacity-50"></div>
            </div>

            {/* Comment ça marche : Visuel à étapes détaillées */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                
                {/* Étape 1 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Paramètres</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Sélectionnez le client & date.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-indigo-500 bg-indigo-50/80 h-8 w-8 rounded-full border border-indigo-100/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-indigo-200 to-blue-200 ml-8 sm:hidden"></div>

                {/* Étape 2 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="absolute -top-1.5 -right-1.5">
                    <span className="flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 shadow-sm"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Brain size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Analyse IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">L'IA étudie l'historique CRM.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-blue-200 to-slate-800 ml-8 sm:hidden"></div>

                {/* Étape 3 */}
                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Briefing</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Obtenez la synthèse finale.</p>
                </div>

              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://cdn.prod.website-files.com/6373b53b7e4adf70ce44cbd5%2F6a71f36dba060eceb7c770d6_anim%20-%20gestion%20des%20achats_webm.webm" type="video/webm" />
            </video>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* ── LEFT COLUMN : Configuration ──────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* RDV à venir depuis le calendrier */}
            {upcomingMeetings.length > 0 && (
              <div className="ia-card bg-white p-5 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                  <Calendar size={16} className="text-indigo-500" />
                  RDV à venir (Calendrier connecté)
                </div>
                <div className="space-y-2">
                  {upcomingMeetings.map(m => (
                    <button
                      key={m.id}
                      onClick={() => prefillFromMeeting(m)}
                      className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors"
                    >
                      <div className="font-bold text-sm text-slate-800 truncate">{m.title}</div>
                      <div className="text-xs text-indigo-600 font-medium mt-0.5">
                        {new Date(m.dateTime).toLocaleDateString('fr-FR', {
                          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Formulaire */}
            <div className="ia-card bg-white p-6 border border-slate-200 rounded-2xl space-y-5 relative z-30 overflow-visible">
              <h3 className="font-bold text-lg text-slate-800">Configuration du briefing</h3>

              {/* Client selector avec création intégrée */}
              <div>
                <ClientSelectWithCreate
                  selectedClientId={selectedClientId}
                  onSelectClient={(c) => setSelectedClientId(c ? Number(c.id) : '')}
                  label="Client / Prospect"
                  required
                  placeholder="Sélectionner ou ajouter un client..."
                />
              </div>

              {/* Client history preview */}
              {clientHistory && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <History size={13} className="text-indigo-500" /> Historique SQL chargé
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Devis ouverts</span>
                    <span className="font-bold">{clientHistory.openQuotes}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Factures impayées</span>
                    <span className={`font-bold ${clientHistory.unpaidInvoices > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {clientHistory.unpaidInvoices}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CA total</span>
                    <span className="font-bold">{clientHistory.totalRevenue.toLocaleString('fr-FR')} €</span>
                  </div>
                  {clientHistory.lastContact && (
                    <div className="flex justify-between text-slate-600">
                      <span>Dernier contact</span>
                      <span className="font-bold">{clientHistory.lastContact}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Date du RDV */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Date & Heure du RDV *
                </label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={e => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Objectif */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Objectif principal du RDV
                </label>
                <input
                  type="text"
                  value={meetingObjective}
                  onChange={e => setMeetingObjective(e.target.value)}
                  placeholder="Ex: Présenter notre offre Copilot M365…"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Notes contextuelles */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Contexte / Notes manuelles
                </label>
                <textarea
                  value={meetingContext}
                  onChange={e => setMeetingContext(e.target.value)}
                  placeholder="Informations supplémentaires connues sur ce RDV…"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[90px] resize-y transition-all"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedClientId || !meetingDate}
                className="w-full ia-btn-primary py-3.5 font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isGenerating
                    ? <><Loader2 size={18} className="animate-spin" /> Analyse IA en cours…</>
                    : <><Sparkles size={18} /> Générer le Briefing</>
                  }
                </span>
                {!company?.id && (
                  <span className="text-[11px] font-normal text-indigo-200">
                    ⚡ {remainingTrials} / 3 essais gratuits restants
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN : Briefing Output ───────────────────────────── */}
          <div className="lg:col-span-8">
            {!briefing && !isGenerating ? (
              <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-white/50">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
                  <Sparkles size={32} className="text-indigo-400" />
                </div>
                <h4 className="font-bold text-xl text-slate-600 mb-2">Briefing IA vide</h4>
                <p className="text-sm max-w-sm">
                  Sélectionnez un client depuis votre base de données, renseignez la date du RDV,
                  puis cliquez sur "Générer le Briefing". L'IA analysera l'historique réel et produira
                  une fiche complète de préparation.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="h-full min-h-[500px] bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
                  <Loader2 size={32} className="text-indigo-500 animate-spin" />
                </div>
                <h4 className="font-bold text-xl text-slate-700 mb-2">Analyse en cours…</h4>
                <p className="text-sm text-slate-500 max-w-sm">
                  L'IA consulte l'historique SQL de <strong>{selectedClient?.name}</strong>,
                  identifie les opportunités et génère votre fiche de préparation.
                </p>
              </div>
            ) : briefing && (
              <div className="space-y-4 ia-animate-in">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Building2 size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{selectedClient?.name}</div>
                      <div className="text-xs text-slate-500">
                        {meetingDate ? new Date(meetingDate).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        }) : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
                    >
                      <Calendar size={14} />
                      Planifier (Google Agenda & Outlook)
                    </button>
                    <button
                      onClick={copyAll}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? 'Copié !' : 'Tout copier'}
                    </button>
                  </div>
                </div>

                {/* ── SYNTHÈSE 1 MINUTE ── */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-2xl text-white relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
                  <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2 relative z-10">
                    <Clock size={14} /> Synthèse 1 Minute
                  </div>
                  <p className="text-lg font-semibold leading-relaxed relative z-10">
                    {briefing.oneLinerSummary}
                  </p>
                </div>

                {/* Grid 2 colonnes pour les sections */}
                <div className="grid md:grid-cols-2 gap-4">
                  <BriefingSection
                    icon={<User size={16} className="text-slate-600" />}
                    title="Résumé Client"
                    color="bg-white border-slate-200"
                    prose={briefing.clientSummary}
                  />
                  <BriefingSection
                    icon={<Target size={16} className="text-blue-600" />}
                    title="Objectifs de la Réunion"
                    color="bg-blue-50 border-blue-100"
                    items={briefing.meetingObjectives}
                  />
                  <BriefingSection
                    icon={<TrendingUp size={16} className="text-emerald-600" />}
                    title="Opportunités Identifiées"
                    color="bg-emerald-50 border-emerald-100"
                    items={briefing.opportunities}
                  />
                  <BriefingSection
                    icon={<AlertTriangle size={16} className="text-amber-600" />}
                    title="Objections Probables"
                    color="bg-amber-50 border-amber-100"
                    items={briefing.probableObjections}
                  />
                  <BriefingSection
                    icon={<Shield size={16} className="text-red-600" />}
                    title="Risques Potentiels"
                    color="bg-red-50 border-red-100"
                    items={briefing.risks}
                  />
                  <BriefingSection
                    icon={<HelpCircle size={16} className="text-purple-600" />}
                    title="Questions Recommandées"
                    color="bg-purple-50 border-purple-100"
                    items={briefing.recommendedQuestions}
                  />
                </div>

                {/* Stratégie de découverte (pleine largeur) */}
                <BriefingSection
                  icon={<FileText size={16} className="text-indigo-600" />}
                  title="Stratégie de Découverte"
                  color="bg-indigo-50 border-indigo-100"
                  prose={briefing.discoveryStrategy}
                />

                {/* Actions recommandées */}
                <BriefingSection
                  icon={<Zap size={16} className="text-slate-700" />}
                  title="Actions Recommandées (Post-RDV)"
                  color="bg-slate-900 border-slate-700 text-white [&_span]:bg-white [&_p]:text-slate-200 [&_li]:text-slate-200"
                  items={briefing.recommendedActions}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <CalendarScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialData={{
          title: `RDV - ${selectedClient?.name || 'Client'}`,
          description: briefing?.oneLinerSummary || meetingObjective || meetingContext,
          date: meetingDate ? meetingDate.split('T')[0] : '',
          startTime: meetingDate && meetingDate.includes('T') ? meetingDate.split('T')[1].slice(0, 5) : '14:30',
          clientName: selectedClient?.name
        }}
        companyId={company?.id}
      />

      {/* Modale d'authentification requise au 4ème essai */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer l'accès illimité, synchroniser votre calendrier et sauvegarder vos briefings."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}

