import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { toast } from 'sonner';
import {
  ArrowLeft, Send, Sparkles, Loader2, Copy, History,
  Building, UserSquare, Target, Zap, ChevronDown, CheckCircle2,
  TrendingUp, BarChart3, Clock, AlertTriangle, Link as LinkIcon
} from 'lucide-react';

import {
  generateProspectingCampaign,
  fetchProspectingHistory,
  ProspectingRequest,
  GeneratedProspectingCampaign,
  ProspectingTone,
  ProspectingObjective,
  ProspectingLanguage
} from '@/lib/prospectingEmailService';
import { 
  fetchCompanyIntegrations, 
  connectProvider, 
  disconnectProvider, 
  CompanyIntegrationsState 
} from '@/lib/integrationService';
import { EmailActionModal } from '@/components/integrations/EmailActionModal';


const OBJECTIVES: ProspectingObjective[] = [
  'Premier contact', 'Email de relance', 'Séquence commerciale',
  'Demande de rendez-vous', "Présentation d'offre", 'Réactivation de prospect'
];
const TONES: ProspectingTone[] = [
  'Professionnel', 'Commercial', 'Premium', 'Consultatif', 'Direct', 'Corporate'
];
const LANGUAGES: ProspectingLanguage[] = [
  'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien'
];

export default function ServicesIAProspecting() {
  const { company } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'integrations'>('generator');

  // Form state
  const [req, setReq] = useState<ProspectingRequest>({
    targetCompany: '',
    sector: '',
    contactRole: '',
    objective: 'Premier contact',
    offer: 'Copilot Microsoft 365', // Default value suggested by prompt
    tone: 'Professionnel',
    language: 'Français'
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedProspectingCampaign | null>(null);
  const [copied, setCopied] = useState(false);

  // History state
  const [history, setHistory] = useState<GeneratedProspectingCampaign[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState<CompanyIntegrationsState | null>(null);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
    if (activeTab === 'integrations') loadIntegrations();
  }, [activeTab, company?.id]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchProspectingHistory(company?.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadIntegrations = async () => {
    setIsLoadingIntegrations(true);
    try {
      const data = await fetchCompanyIntegrations(company?.id);
      setIntegrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingIntegrations(false);
    }
  };

  const handleToggleConnect = async (provider: 'google' | 'microsoft') => {
    if (!integrations) return;
    const isConnected = integrations[provider].connected;
    try {
      if (isConnected) {
        await disconnectProvider(provider, company?.id);
        toast.success(`Déconnexion de ${provider === 'google' ? 'Google' : 'Microsoft'} réussie.`);
      } else {
        const res = await connectProvider(provider, undefined, company?.id);
        toast.success(res.message);
      }
      loadIntegrations();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification');
    }
  };


  const updateReq = (field: keyof ProspectingRequest, val: string) => {
    setReq(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerate = async () => {
    if (!req.targetCompany || !req.contactRole || !req.offer || !req.sector) {
      toast.error('Veuillez remplir tous les champs obligatoires (Entreprise, Secteur, Fonction, Offre).');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      const data = await generateProspectingCampaign(req, company?.id);
      setResult(data);
      toast.success('Campagne générée avec succès.');
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Objet: ${result.subject}\n\n${result.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Contenu copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2500);
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 65) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const progressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <EnterpriseAuthBar className="mb-8" />
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
            <ArrowLeft size={16} /> Retour aux Services IA
          </Link>
          <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            <Send size={16} /> Ventes & Acquisition
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Générateur d'Emails de Prospection IA
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl">
            Créez des séquences d'approche (Outreach) hyper-personnalisées. L'IA rédige et évalue la force de persuasion de vos emails pour maximiser le taux de réponse.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'generator' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={18} /> Créer une campagne
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={18} /> Historique & Modèles
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'integrations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={18} /> Intégrations (Outlook, M365)
          </button>
        </div>

        {/* TAB: GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
            {/* Left Column: Form */}
            <div className="lg:col-span-4 space-y-5">
              <div className="ia-card bg-white p-6 border border-slate-200 rounded-2xl space-y-5">
                <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-3">Ciblage & Contexte</h3>

                {/* Target Company & Sector */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entreprise Cible *</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" value={req.targetCompany} onChange={e => updateReq('targetCompany', e.target.value)}
                        placeholder="Ex: L'Oréal, startup tech..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secteur *</label>
                    <div className="relative">
                      <Target size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" value={req.sector} onChange={e => updateReq('sector', e.target.value)}
                        placeholder="Ex: Cosmétique, SaaS B2B..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fonction du Contact *</label>
                    <div className="relative">
                      <UserSquare size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" value={req.contactRole} onChange={e => updateReq('contactRole', e.target.value)}
                        placeholder="Ex: DRH, Directeur Marketing..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full my-2"></div>

                {/* Offer & Objective */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Offre Proposée *</label>
                    <div className="relative">
                      <Zap size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" value={req.offer} onChange={e => updateReq('offer', e.target.value)}
                        placeholder="Ex: Copilot M365, Audit IA..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objectif de l'email *</label>
                    <div className="relative">
                      <select 
                        value={req.objective} onChange={e => updateReq('objective', e.target.value)}
                        className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 appearance-none"
                      >
                        {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full my-2"></div>

                {/* Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ton *</label>
                    <select 
                      value={req.tone} onChange={e => updateReq('tone', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                    >
                      {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Langue *</label>
                    <select 
                      value={req.language} onChange={e => updateReq('language', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !req.targetCompany || !req.sector || !req.contactRole || !req.offer}
                  className="w-full py-3.5 mt-4 rounded-xl font-bold flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Génération en cours...</> : <><Sparkles size={18} /> Générer la campagne</>}
                </button>
              </div>
            </div>

            {/* Right Column: Output & KPIs */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {!result && !isGenerating ? (
                <div className="flex-1 min-h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-white/50">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                    <Send size={32} className="text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-xl text-slate-600 mb-2">Aucune campagne générée</h4>
                  <p className="text-sm max-w-md">
                    Renseignez les critères de ciblage à gauche (Entreprise, Fonction, Offre), puis cliquez sur Générer pour obtenir une séquence d'approche performante et son analyse IA.
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="flex-1 min-h-[500px] bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                  </div>
                  <h4 className="font-bold text-xl text-slate-700 mb-2">Création de la séquence...</h4>
                  <p className="text-sm text-slate-500 max-w-sm">
                    L'IA analyse le contexte pour le secteur {req.sector} et rédige un message ultra-ciblé pour le {req.contactRole} de {req.targetCompany}.
                  </p>
                </div>
              ) : result && (
                <>
                  {/* Top KPIs Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ia-animate-in">
                    <div className={`p-4 border rounded-2xl ${scoreColor(result.kpis.impactScore)}`}>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1"><Zap size={14} /> Impact Global</div>
                      <div className="text-3xl font-black">{result.kpis.impactScore}/100</div>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={14} /> Personnalisation</div>
                      <div className="text-2xl font-bold text-slate-800">{result.kpis.personalizationScore}/100</div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden"><div className={`h-full ${progressColor(result.kpis.personalizationScore)}`} style={{ width: `${result.kpis.personalizationScore}%` }}></div></div>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={14} /> Engagement</div>
                      <div className="text-2xl font-bold text-slate-800">{result.kpis.engagementScore}/100</div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden"><div className={`h-full ${progressColor(result.kpis.engagementScore)}`} style={{ width: `${result.kpis.engagementScore}%` }}></div></div>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={14} /> Temps de lecture</div>
                      <div className="text-2xl font-bold text-slate-800">{result.kpis.estimatedReadTimeSeconds} sec</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">Score clarté: {result.kpis.clarityScore}/100</div>
                    </div>
                  </div>

                  {/* Email Content Box */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col ia-animate-in flex-1">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Objet :</span>
                      <div className="font-bold text-slate-800 flex-1 truncate">{result.subject}</div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsEmailModalOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
                        >
                          <Send size={15} />
                          Envoyer / Brouillon (Gmail & Outlook)
                        </button>
                        <button 
                          onClick={handleCopy}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                        >
                          {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                          {copied ? 'Copié !' : 'Copier'}
                        </button>
                      </div>
                    </div>
                    <div className="p-6 text-slate-700 whitespace-pre-wrap font-medium leading-relaxed overflow-y-auto max-h-[500px]">
                      {result.content}
                    </div>
                  </div>

                  {/* Suggestions Section */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden ia-animate-in">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <BarChart3 size={24} className="text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 flex items-center gap-2">Analyse Persuasion <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/20 text-white">{result.kpis.persuasionLevel}</span></h4>
                        <p className="text-sm text-slate-300 mb-3">Voici les recommandations de l'IA pour améliorer encore le taux de retour de cet email :</p>
                        <ul className="space-y-2">
                          {result.kpis.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-200 font-medium">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="ia-animate-in">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={32} />
                <span className="font-bold">Chargement de l'historique...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-3xl max-w-3xl mx-auto">
                <History size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun historique disponible</h3>
                <p className="text-slate-500 font-medium">Vous n'avez pas encore généré de campagne de prospection, ou le service d'historique n'est pas configuré.</p>
                <button onClick={() => setActiveTab('generator')} className="mt-6 ia-btn-primary px-6 py-2 !bg-emerald-600 hover:!bg-emerald-700">Créer une campagne</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md uppercase border border-emerald-100">
                        Score: {item.kpis.impactScore}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{item.date || 'Récemment'}</span>
                    </div>
                    <div className="font-bold text-slate-800 mb-2 truncate" title={item.subject}>{item.subject}</div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-4 flex-1">
                      {item.content}
                    </p>
                    <button className="w-full mt-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100">
                      Réutiliser
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="ia-animate-in max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Connectez vos services de messagerie</h2>
              <p className="text-slate-600">Permettez à l'IA d'envoyer vos campagnes générées directement depuis votre boîte d'envoi ou de créer des brouillons.</p>
            </div>

            {isLoadingIntegrations ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Outlook / M365 */}
                <div className="ia-card p-8 bg-white border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-sm border border-blue-100">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                      <path d="M22 6.5A1.5 1.5 0 0 0 20.5 5h-17A1.5 1.5 0 0 0 2 6.5v11A1.5 1.5 0 0 0 3.5 19h17a1.5 1.5 0 0 0 1.5-1.5v-11zm-1.8.5-7.7 5.7a1 1 0 0 1-1 0L3.8 7h16.4zm1.8 11a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V8.1l7.8 5.8a2 2 0 0 0 2.4 0l7.8-5.8v9.9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Microsoft 365 / Outlook</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Brouillons synchronisés, envois directs et carnet de contacts.</p>
                  
                  {integrations?.microsoft.connected ? (
                    <div className="w-full space-y-3">
                      <div className="py-2.5 px-4 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> Connecté : {integrations.microsoft.email || 'Compte Entreprise'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleToggleConnect('microsoft')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Déconnecter ce compte
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleToggleConnect('microsoft')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-md shadow-blue-500/20"
                    >
                      <LinkIcon size={18} /> Connecter Microsoft 365
                    </button>
                  )}
                </div>

                {/* Google Workspace / Gmail */}
                <div className="ia-card p-8 bg-white border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500 shadow-sm border border-red-100">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Google Workspace / Gmail</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Envois automatiques Gmail, brouillons synchronisés et Google Contacts.</p>
                  
                  {integrations?.google.connected ? (
                    <div className="w-full space-y-3">
                      <div className="py-2.5 px-4 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} /> Connecté : {integrations.google.email || 'Compte Google'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleToggleConnect('google')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Déconnecter ce compte
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleToggleConnect('google')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors shadow-md shadow-red-500/20"
                    >
                      <LinkIcon size={18} /> Connecter Google Workspace
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'envoi et synchronisation Gmail / Outlook */}
      {result && (
        <EmailActionModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          emailData={{
            to: '',
            subject: result.subject,
            body: result.content,
            leadCompany: req.targetCompany
          }}
          companyId={company?.id}
        />
      )}
    </div>
  );
}
