import { useState, useEffect } from 'react';
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, Mail, Edit3, History, Link as LinkIcon, 
  Sparkles, Loader2, CheckCircle2, Copy, Trash2, 
  RefreshCcw, AlertTriangle, MessageSquare, Send, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  analyzeEmailText, 
  generateEmailContent, 
  fetchEmailHistory, 
  EmailTone,
  EmailObjective,
  AITask,
  EmailAnalysisKPIs,
  EmailHistoryItem
} from '@/lib/emailAssistantService';
import { 
  fetchCompanyIntegrations, 
  connectProvider, 
  disconnectProvider, 
  CompanyIntegrationsState 
} from '@/lib/integrationService';
import { EmailActionModal } from '@/components/integrations/EmailActionModal';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar, VersionItem } from '@/components/common/VersionSelectorBar';
import { SectionDeepDive } from '@/components/common/SectionDeepDive';
import { SavedWorkItem } from '@/lib/savedWorkService';
import { ClientSelectWithCreate } from '@/components/clients/ClientSelectWithCreate';
import { ClientContextPanel } from '@/components/clients/ClientContextPanel';
import { IncomingEmailHandler } from '@/components/email/IncomingEmailHandler';
import { generateContextualEmailReply, saveClientInteraction } from '@/lib/clientContextHubService';
import { Client } from '@/lib/quoteService';

const toneOptions: EmailTone[] = ['Professionnel', 'Commercial', 'Court & Percutant', 'Empathique', 'Formel', 'Chaleureux'];
const objectiveOptions: EmailObjective[] = ['Nouvel email', 'Réponse stratégique', 'Négociation', 'Prise de contact', 'Suivi de projet'];

export default function ServicesIAEmail() {
  const { language } = useLanguage();
  const { company, token, isAuthenticated } = useAuth();
  const isEn = language === "en";

  // Quota Freemium 3 essais invité
  const { 
    remainingTrials, 
    isLimitReached: isQuotaLimitReached, 
    isAuthModalOpen: isQuotaModalOpen, 
    setIsAuthModalOpen: setIsQuotaModalOpen, 
    checkCanExecute, 
    recordExecution 
  } = useGuestQuota('email');

  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'integrations'>('editor');

  // Editor State
  const [text, setText] = useState('');
  const [tone, setTone] = useState<EmailTone>('Professionnel');
  const [objective, setObjective] = useState<EmailObjective>('Nouvel email');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kpis, setKpis] = useState<EmailAnalysisKPIs | null>(null);

  // Client & Cross-module Hub State
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [emailWorkMode, setEmailWorkMode] = useState<'write' | 'reply_inbound'>('write');
  const [isGeneratingContextualReply, setIsGeneratingContextualReply] = useState(false);

  // Versions State
  const [versions, setVersions] = useState<VersionItem<string>[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);

  // Universal Save & History Drawer State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const [searchParams] = useSearchParams();

  // Auto-chargement d'un brouillon transverse ou d'un client_id via l'URL
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem('prefill_email_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.body) {
          setText(parsed.body);
          toast.success("Contenu importé depuis le module d'origine !");
        }
        sessionStorage.removeItem('prefill_email_draft');
      }
    } catch {}

    const clientIdParam = searchParams.get('client_id');
    if (clientIdParam) {
      setSelectedClient({
        id: Number(clientIdParam),
        name: `Client #${clientIdParam}`,
        email: '',
        created_at: new Date().toISOString()
      });
    }
  }, [searchParams]);

  // Debounce analysis
  useEffect(() => {
    const handler = setTimeout(() => {
      if (text.trim().length > 10) {
        runAnalysis(text);
      } else {
        setKpis(null);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [text]);

  const runAnalysis = async (currentText: string) => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeEmailText(currentText, company?.id);
      setKpis(data);
    } catch {
      // Fail silently
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAITask = async (task: AITask) => {
    if (!text.trim()) {
      toast.error("Veuillez d'abord rédiger un brouillon d'email.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsGenerating(true);
    try {
      const generated = await generateEmailContent(text, task, tone, objective, company?.id);
      setText(generated);

      const newVerNum = versions.length + 1;
      const newVer: VersionItem<string> = {
        id: 'ver_' + Date.now(),
        versionNumber: newVerNum,
        label: `Version V${newVerNum} (${task})`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        data: generated,
      };

      const updated = [...versions, newVer];
      setVersions(updated);
      setActiveVersionIndex(updated.length - 1);

      recordExecution();
      toast.success(`${task} terminée avec succès.`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectMessageToReply = async (messageText: string, subject: string) => {
    setEmailWorkMode('reply_inbound');
    setObjective('Réponse stratégique');
    toast.info(`Message sélectionné : « ${subject} ». Préparation de la réponse...`);
    await handleGenerateContextualReply(messageText, `Répondre précisément au sujet : ${subject}`);
  };

  const handleGenerateContextualReply = async (incomingText: string, customInstructions?: string) => {
    if (!checkCanExecute()) return;
    setIsGeneratingContextualReply(true);
    try {
      const res = await generateContextualEmailReply({
        client_id: selectedClient?.id ? Number(selectedClient.id) : 0,
        company_id: company?.id,
        incoming_email_text: incomingText,
        tone: tone,
        objective: objective,
        custom_instructions: customInstructions
      });

      if (res.success && res.reply_text) {
        setText(res.reply_text);
        setEmailWorkMode('write');

        const newVerNum = versions.length + 1;
        const newVer: VersionItem<string> = {
          id: 'ver_' + Date.now(),
          versionNumber: newVerNum,
          label: `V${newVerNum} (Réponse Contextuelle IA)`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          data: res.reply_text,
        };

        const updated = [...versions, newVer];
        setVersions(updated);
        setActiveVersionIndex(updated.length - 1);

        recordExecution();
        toast.success("Réponse IA contextualisée générée et chargée dans l'éditeur !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération de la réponse contextualisée.");
    } finally {
      setIsGeneratingContextualReply(false);
    }
  };

  const handleSwitchVersion = (index: number) => {
    if (versions[index]) {
      setActiveVersionIndex(index);
      setText(versions[index].data);
      toast.info(`Affichage de la ${versions[index].label || `Version ${index + 1}`}`);
    }
  };

  const handleLoadSavedWork = (item: SavedWorkItem) => {
    try {
      const p = item.content_payload;
      if (typeof p === 'string') {
        setText(p);
      } else if (p.text) {
        setText(p.text);
      } else if (p.content) {
        setText(p.content);
      }
      setActiveTab('editor');
      toast.success(`Email « ${item.title} » restauré !`);
    } catch {
      toast.error("Format de travail invalide.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Texte copié dans le presse-papier');
  };

  const clearText = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer le texte ?")) {
      setText('');
      setKpis(null);
    }
  };

  // History State
  const [history, setHistory] = useState<EmailHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Integrations State
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
      const data = await fetchEmailHistory(company?.id);
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

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Barre d'Authentification / Entreprise */}
        <EnterpriseAuthBar 
          appName="Assistant Emails & Réponses Stratégiques IA"
          onOpenAuthModal={() => setIsQuotaModalOpen(true)}
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

            {text.trim() && (
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
            <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Mail size={16} /> Communication & Réponses Stratégiques
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Assistant Emails IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Rédigez, reformulez et sublimez vos correspondances stratégiques. L'IA adapte le ton, corrige et maximise l'impact de vos messages.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-blue-300 via-indigo-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-blue-400 opacity-50"></div>
            </div>

            {/* Comment ça marche */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Edit3 size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Brouillon</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Tapez vos idées clés.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. IA Rédaction</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Ton & style optimisés.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-indigo-500 bg-indigo-50/80 h-8 w-8 rounded-full border border-indigo-100/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Send size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Envoi direct</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Google ou Microsoft.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <ServiceHeroImage />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'editor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Edit3 size={18} /> Rédaction & Analyse
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <History size={18} /> Historique & Modèles
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <LinkIcon size={18} /> Intégrations (Outlook, M365, Gmail)
          </button>
        </div>

        {/* TAB: EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Version Selector Bar */}
            {versions.length > 0 && (
              <VersionSelectorBar
                versions={versions}
                activeVersionIndex={activeVersionIndex}
                onSelectVersion={handleSwitchVersion}
                onGenerateNewVersion={() => handleAITask('Réécriture professionnelle')}
                isGeneratingNewVersion={isGenerating}
              />
            )}

            {/* Barre de Contexte Client Omnicanal */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-96">
                <ClientSelectWithCreate
                  selectedClientId={selectedClient?.id}
                  onSelectClient={(c) => setSelectedClient(c)}
                  label="Client destinataire / interlocuteur lié"
                  placeholder="Rechercher ou lier un client pour contexte 360°..."
                />
              </div>

              {/* Sélecteur de mode de travail Email */}
              <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setEmailWorkMode('write')}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    emailWorkMode === 'write'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />
                  Rédiger un email
                </button>
                <button
                  type="button"
                  onClick={() => setEmailWorkMode('reply_inbound')}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    emailWorkMode === 'reply_inbound'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                  Traiter un mail reçu (Réponse IA)
                </button>
              </div>
            </div>

            {/* Dossier 360 Client (si sélectionné) */}
            {selectedClient && (
              <ClientContextPanel
                clientId={selectedClient.id}
                companyId={company?.id}
                onSelectMessageToReply={handleSelectMessageToReply}
              />
            )}

            {/* Mode Traitement d'un email reçu */}
            {emailWorkMode === 'reply_inbound' && (
              <IncomingEmailHandler
                onGenerateReply={handleGenerateContextualReply}
                isGenerating={isGeneratingContextualReply}
                selectedClientName={selectedClient?.company || selectedClient?.name}
              />
            )}

            <div className="grid lg:grid-cols-3 gap-8 ia-animate-in">
              {/* Colonne Principale: Éditeur */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Objectif de l'email</label>
                    <select 
                      value={objective} 
                      onChange={(e) => setObjective(e.target.value as EmailObjective)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    >
                      {objectiveOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Ton souhaité</label>
                    <select 
                      value={tone} 
                      onChange={(e) => setTone(e.target.value as EmailTone)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    >
                      {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="ia-card bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px] relative">
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                      <span className="font-bold text-lg text-slate-800">L'IA rédige votre email...</span>
                    </div>
                  )}
                  
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2">
                    <button onClick={() => handleAITask('Correction orthographique')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                      <CheckCircle2 size={16} className="text-emerald-500" /> Corriger
                    </button>
                    <button onClick={() => handleAITask('Réécriture professionnelle')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                      <RefreshCcw size={16} className="text-blue-500" /> Reformuler
                    </button>
                    <button onClick={() => handleAITask('Amélioration du ton')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                      <Sparkles size={16} className="text-indigo-500" /> Améliorer le ton
                    </button>
                    <button onClick={() => handleAITask('Version plus commerciale')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                      Plus vendeur
                    </button>
                    <button onClick={() => handleAITask('Version plus courte')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                      Plus court
                    </button>
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Commencez à taper votre brouillon ici (même avec des fautes ou des abréviations), l'IA s'occupera du reste..."
                    className="flex-1 w-full min-h-[220px] p-6 resize-y outline-none text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-base"
                  />

                  {/* Section Deep Dive sur le Corps du Mail */}
                  {text.trim() && (
                    <div className="p-4 bg-slate-50/80 border-t border-slate-200">
                      <SectionDeepDive
                        sectionTitle="Corps du Message Email"
                        sectionContent={text}
                        toolType="Correspondance Commerciale & Direction"
                        placeholder="Poser une question sur cet email (ex: ajouter une relance délicate, clarifier l'objet...)"
                        suggestedQuestions={[
                          'Rendre la formule d’appel plus percutante',
                          'Ajouter une clause de confidentialité standard',
                          'Proposer 3 créneaux de rendez-vous de manière élégante'
                        ]}
                      />
                    </div>
                  )}

                  <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center flex-wrap gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      {text.length} caractères | {text.split(/\s+/).filter(w=>w.length>0).length} mots
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={clearText} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors text-sm font-bold">
                        <Trash2 size={16} /> Effacer
                      </button>
                      <button
                        type="button"
                        disabled={!text.trim()}
                        onClick={() => setIsEmailModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                      >
                        <Send size={16} /> Envoyer / Brouillon
                      </button>
                      <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors text-sm font-bold shadow-sm">
                        <Copy size={16} /> Copier l'email
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barre d'Actions Cross-Modules MDIV Business */}
                {selectedClient && text.trim() && (
                  <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>
                        Écosystème unifié : actions transversales pour{' '}
                        <strong className="text-white">{selectedClient.company || selectedClient.name}</strong> :
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/services-ia/devis?client_id=${selectedClient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-medium transition-colors"
                      >
                        📄 Créer un devis lié
                      </Link>
                      <Link
                        to={`/services-ia/relances?client_id=${selectedClient.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
                      >
                        ⏱️ Programmer une relance
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne Secondaire: Analyse & KPIs */}
              <div className="space-y-6">
                <div className="ia-card bg-white p-6 border border-slate-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><MessageSquare size={20} className="text-indigo-600" /> Analyse du message</span>
                    {isAnalyzing && <Loader2 size={16} className="text-slate-400 animate-spin" />}
                  </h3>
                  
                  {!kpis ? (
                    <div className="py-8 text-center text-slate-400">
                      <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Commencez à rédiger pour voir l'analyse IA de votre email en temps réel.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-slate-600">Qualité Globale</span>
                          <span className={kpis.qualityScore > 80 ? 'text-emerald-600' : 'text-amber-600'}>{kpis.qualityScore}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${kpis.qualityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${kpis.qualityScore}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-slate-600">Clarté du message</span>
                          <span className="text-blue-600">{kpis.clarityScore}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${kpis.clarityScore}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm font-bold mb-1">
                          <span className="text-slate-600">Professionnalisme</span>
                          <span className="text-indigo-600">{kpis.professionalismScore}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${kpis.professionalismScore}%` }} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Mots estimés</div>
                          <div className="text-xl font-bold text-slate-800">{kpis.estimatedLengthWords}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Temps de lecture</div>
                          <div className="text-xl font-bold text-slate-800">{kpis.readTimeSeconds}s</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Encart Copilot */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/30 blur-2xl rounded-full"></div>
                  <Sparkles className="text-blue-400 mb-3" size={28} />
                  <h3 className="font-bold text-xl mb-2">Automatisez via Copilot</h3>
                  <p className="text-indigo-100/80 text-sm mb-4 leading-relaxed font-medium">
                    Intégrez ces capacités de reformulation et de réponse IA directement dans votre boîte mail grâce à <strong>Microsoft 365 Copilot</strong>.
                  </p>
                  <button className="w-full py-3 bg-white text-indigo-950 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors shadow-lg shadow-black/20">
                    Découvrir l'Intégration
                  </button>
                </div>
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
                <p className="text-slate-500 font-medium">Vos emails rédigés apparaîtront ici automatiquement.</p>
                <button onClick={() => setActiveTab('editor')} className="mt-6 ia-btn-primary px-6 py-2">Rédiger un email</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md uppercase">
                        {item.task || 'Rédaction'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{item.createdAt?.slice(0, 10) || 'Récemment'}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-5 flex-1 mb-4">
                      {item.generatedText}
                    </p>
                    <button 
                      onClick={() => {
                        setText(item.generatedText);
                        setActiveTab('editor');
                      }}
                      className="w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      Charger dans l'éditeur
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
              <p className="text-slate-600">Permettez à l'IA d'envoyer vos emails rédigés directement depuis votre boîte d'envoi ou de créer des brouillons.</p>
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
      {text.trim() && (
        <SaveWorkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          toolType="email"
          defaultTitle={`Email : ${text.split('\n')[0]?.slice(0, 45) || 'Correspondance IA'}`}
          contentPayload={{
            text,
            tone,
            objective,
            kpis
          }}
          summary={`Email rédigé (${text.split(/\s+/).length} mots) sur un ton ${tone}. Score qualité : ${kpis?.qualityScore || 80}/100.`}
          currentVersion={activeVersionIndex + 1}
        />
      )}

      {/* Universal Saved Work Drawer */}
      <SavedWorkDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        toolType="email"
        onSelectWork={handleLoadSavedWork}
      />

      {/* Modal d'envoi et synchronisation Gmail / Outlook */}
      {text && (
        <EmailActionModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          emailData={{
            to: '',
            subject: text.split('\n')[0]?.replace(/^Objet\s*:\s*/i, '') || 'Message important',
            body: text,
            leadCompany: 'Correspondant'
          }}
          companyId={company?.id}
        />
      )}

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          handleAITask('Réécriture professionnelle');
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer l'accès illimité et synchroniser vos emails avec Gmail et Outlook."
      />
    </div>
  );
}
