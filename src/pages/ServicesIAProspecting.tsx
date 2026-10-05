import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Send, Sparkles, Loader2, Copy, History,
  Building, UserSquare, Target, Zap, ChevronDown, CheckCircle2,
  TrendingUp, BarChart3, Clock, AlertTriangle, Link as LinkIcon, RefreshCcw,
  Globe, Save, FolderKanban
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
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar, VersionItem } from '@/components/common/VersionSelectorBar';
import { SectionDeepDive } from '@/components/common/SectionDeepDive';
import { TendersFinderSection } from '@/components/tenders/TendersFinderSection';
import { SavedWorkItem } from '@/lib/savedWorkService';

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
  const { company, token } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('prospecting');

  const [activeTab, setActiveTab] = useState<'generator' | 'tenders' | 'history' | 'integrations'>('generator');

  // Form state
  const [req, setReq] = useState<ProspectingRequest>({
    targetCompany: '',
    sector: '',
    contactRole: '',
    objective: 'Premier contact',
    offer: 'Accompagnement & Services IA',
    tone: 'Professionnel',
    language: 'Français'
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedProspectingCampaign | null>(null);
  const [copied, setCopied] = useState(false);

  // Versions state
  const [versions, setVersions] = useState<VersionItem<GeneratedProspectingCampaign>[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);

  // Universal Save & History Drawers
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

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
    if (!company?.id) {
      setHistory([]);
      return;
    }
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
    if (!company?.id) {
      setIntegrations(null);
      return;
    }
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

  const handleGenerate = async (isNewVersion = false) => {
    if (!req.targetCompany || !req.contactRole || !req.offer || !req.sector) {
      toast.error('Veuillez remplir tous les champs obligatoires (Entreprise, Secteur, Fonction, Offre).');
      return;
    }

    const isGibberish = 
      req.targetCompany.trim().length < 3 ||
      /^(.)\1{3,}/i.test(req.targetCompany.trim()) ||
      req.offer.trim().length < 6 ||
      /^(.)\1{4,}/i.test(req.offer.trim()) ||
      (/^[b-df-hj-np-tv-z0-9\s.,;:!?'-]{10,}$/i.test(req.offer.trim()) && !/[aeiouy]/i.test(req.offer.trim()));

    if (isGibberish) {
      toast.error("Votre saisie semble incomplète ou incompréhensible. Pour générer un email de prospection percutant, veuillez indiquer une entreprise cible réelle ou réaliste et une offre de service intelligible.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsGenerating(true);
    try {
      const data = await generateProspectingCampaign({
        ...req,
        offer: isNewVersion 
          ? `${req.offer} [Variante alternative : modifier l'angle d'accroche et les arguments d'impact]` 
          : req.offer
      }, company?.id);

      setResult(data);

      const newVersionNum = versions.length + 1;
      const newVer: VersionItem<GeneratedProspectingCampaign> = {
        id: 'ver_' + Date.now(),
        versionNumber: newVersionNum,
        label: `Campagne V${newVersionNum}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        data,
      };

      const updated = [...versions, newVer];
      setVersions(updated);
      setActiveVersionIndex(updated.length - 1);

      recordExecution();
      toast.success(isNewVersion ? `Nouvelle variante V${newVersionNum} générée !` : 'Campagne générée avec succès.');
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwitchVersion = (index: number) => {
    if (versions[index]) {
      setActiveVersionIndex(index);
      setResult(versions[index].data);
      toast.info(`Affichage de la ${versions[index].label || `Version ${index + 1}`}`);
    }
  };

  const handleLoadSavedWork = (item: SavedWorkItem) => {
    try {
      const p = item.content_payload;
      if (p.subject && p.content) {
        setResult(p);
      }
      if (p.req) {
        setReq(p.req);
      }
      setActiveTab('generator');
      toast.success(`Travail « ${item.title} » restauré !`);
    } catch {
      toast.error("Format de travail invalide.");
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
        
        {/* Barre d'Authentification / Entreprise */}
        <EnterpriseAuthBar 
          appName="Prospection B2B & Appels d'Offres IA"
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Top Header & Actions Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-bold transition-colors">
              <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
            </Link>
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 font-bold transition-colors" title="Actualiser et relancer l'IA">
              <RefreshCcw size={16} /> {isEn ? "Refresh & Restart" : "Actualiser"}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-colors"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>Historique Sauvegardes</span>
            </button>

            {result && (
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder dans l'historique</span>
              </button>
            )}
          </div>
        </div>

        {/* Header avec Vidéo et Étapes */}
        <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
          <div className="pt-2 flex flex-col justify-between">
            <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Send size={16} /> Ventes, Acquisition & Marchés
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Prospection & Appels d'Offres IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Créez des séquences d'approche personnalisées et détectez les marchés publics & privés en direct avec accès direct aux plateformes officielles.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-emerald-300 via-teal-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-emerald-400 opacity-50"></div>
            </div>

            {/* Comment ça marche */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Target size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Ciblage & Veille</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Définissez l'entreprise ou cherchez un appel d'offres.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-emerald-500 bg-emerald-50/80 h-8 w-8 rounded-full border border-emerald-100/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Création & Liens</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Rédaction persuasive et liens directs officiels.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-teal-500 bg-teal-50/80 h-8 w-8 rounded-full border border-teal-100/50 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Send size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Diffusion & Candidature</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Envoi direct ou réponse aux consultations.</p>
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

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'generator' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles size={18} /> Créer une campagne
          </button>
          <button 
            onClick={() => setActiveTab('tenders')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'tenders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Globe size={18} className="text-blue-600" /> Recherche d'Appels d'Offres
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Direct Links</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <History size={18} /> Historique & Modèles
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'integrations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <LinkIcon size={18} /> Intégrations (Outlook, M365, Gmail)
          </button>
        </div>

        {/* TAB: TENDERS SEARCH */}
        {activeTab === 'tenders' && (
          <div className="ia-animate-in">
            <TendersFinderSection defaultQuery={req.sector || 'BTP & Services'} />
          </div>
        )}

        {/* TAB: GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Version Selector Bar */}
            {versions.length > 0 && (
              <VersionSelectorBar
                versions={versions}
                activeVersionIndex={activeVersionIndex}
                onSelectVersion={handleSwitchVersion}
                onGenerateNewVersion={() => handleGenerate(true)}
                isGeneratingNewVersion={isGenerating}
              />
            )}

            <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
              {/* Left Column: Form */}
              <div className="lg:col-span-4 space-y-5">
                <div className="ia-card bg-white p-6 border border-slate-200 rounded-2xl space-y-5">
                  <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-3">Ciblage & Contexte</h3>

                  {/* Target Company & Sector */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Entreprise Cible *</label>
                      <div className="relative">
                        <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        <input 
                          type="text" value={req.targetCompany} onChange={e => updateReq('targetCompany', e.target.value)}
                          placeholder="Ex: L'Oréal, PME BTP, Clinique..." 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Secteur *</label>
                      <div className="relative">
                        <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        <input 
                          type="text" value={req.sector} onChange={e => updateReq('sector', e.target.value)}
                          placeholder="Ex: BTP, Industrie, Santé, SaaS B2B..." 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Fonction du Contact *</label>
                      <div className="relative">
                        <UserSquare size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        <input 
                          type="text" value={req.contactRole} onChange={e => updateReq('contactRole', e.target.value)}
                          placeholder="Ex: DG, Dirigeant, DSI, DRH..." 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full my-2"></div>

                  {/* Offer & Objective */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Offre Proposée *</label>
                      <div className="relative">
                        <Zap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                        <input 
                          type="text" value={req.offer} onChange={e => updateReq('offer', e.target.value)}
                          placeholder="Ex: Optimisation des flux, Audit IA, Devis sur mesure..." 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Objectif de l'email *</label>
                      <div className="relative">
                        <select 
                          value={req.objective} onChange={e => updateReq('objective', e.target.value)}
                          className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 appearance-none"
                        >
                          {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-3 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full my-2"></div>

                  {/* Style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Ton *</label>
                      <select 
                        value={req.tone} onChange={e => updateReq('tone', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                      >
                        {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Langue *</label>
                      <select 
                        value={req.language} onChange={e => updateReq('language', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                      >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating || !req.targetCompany || !req.sector || !req.contactRole || !req.offer}
                    className="w-full py-3.5 mt-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Génération en cours...</> : <><Sparkles size={18} /> Générer la campagne</>}
                    </span>
                    {!company?.id && (
                      <span className="text-[11px] font-normal text-emerald-100">
                        ⚡ {remainingTrials} / 3 essais gratuits restants
                      </span>
                    )}
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
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col ia-animate-in">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Objet :</span>
                        <div className="font-bold text-slate-800 flex-1 min-w-[200px] truncate">{result.subject}</div>
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
                      <div className="p-6 text-slate-700 whitespace-pre-wrap font-medium leading-relaxed overflow-y-auto max-h-[450px]">
                        {result.content}
                      </div>

                      {/* Section Deep Dive sur le Corps du Message */}
                      <div className="p-4 bg-slate-50/70 border-t border-slate-200">
                        <SectionDeepDive
                          sectionTitle="Corps du Message d'Approche"
                          sectionContent={result.content}
                          toolType="Cold Emailing & Outreach B2B"
                          placeholder="Poser une question pour affiner le message (ex: raccourcir pour les mobiles, ajouter une preuve sociale...)"
                          suggestedQuestions={[
                            'Raccourcir l’email pour une lecture optimale sur mobile',
                            'Ajouter une proposition de valeur chiffrée avec retour sur investissement',
                            'Formuler un appel à l’action (CTA) sans engagement'
                          ]}
                        />
                      </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden ia-animate-in space-y-4">
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                          <BarChart3 size={24} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1 flex items-center gap-2">Analyse Persuasion <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/20 text-white">{result.kpis.persuasionLevel}</span></h4>
                          <p className="text-sm text-slate-300 mb-3">Recommandations de l'IA pour maximiser le taux de réponse :</p>
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

                      {/* Section Deep Dive sur les Recommandations */}
                      <div className="relative z-10 pt-2 border-t border-white/10">
                        <SectionDeepDive
                          sectionTitle="Stratégie de Relance & Recommandations"
                          sectionContent={result.kpis.suggestions}
                          toolType="Stratégie Commerciale B2B"
                          placeholder="Approfondir les relances (ex: rédiger le message de relance à J+4...)"
                          suggestedQuestions={[
                            'Rédiger la séquence complète de relance à J+3 et J+7',
                            'Préparer les objections probables de ce décideur'
                          ]}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
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
                    <button 
                      onClick={() => {
                        setResult(item);
                        setActiveTab('generator');
                      }}
                      className="w-full mt-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
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

      {/* Universal Save Modal */}
      {result && (
        <SaveWorkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          toolType="prospecting"
          defaultTitle={`Campagne Prospection : ${req.targetCompany} (${req.contactRole})`}
          contentPayload={{
            ...result,
            req
          }}
          summary={`Email de prospection ciblant ${req.targetCompany} (${req.contactRole}) sur l'offre ${req.offer}. Score impact : ${result.kpis.impactScore}/100.`}
          currentVersion={activeVersionIndex + 1}
        />
      )}

      {/* Universal Saved Work Drawer */}
      <SavedWorkDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        toolType="prospecting"
        onSelectWork={handleLoadSavedWork}
      />

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

      {/* Modale d'authentification requise au 4ème essai */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer l'accès illimité, sauvegarder vos séquences et synchroniser vos emails."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}
