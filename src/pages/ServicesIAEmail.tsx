import { useState, useEffect } from 'react';
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, Mail, Edit3, History, Link as LinkIcon, 
  Sparkles, Loader2, CheckCircle2, Copy, Trash2, 
  RefreshCcw, AlertTriangle, MessageSquare, Send, Save, Lock,
  Plus, Server, Globe, ShieldCheck, Inbox
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
  CompanyIntegrationsState,
  fetchMailboxes,
  deleteMailbox,
  UniversalMailbox
} from '@/lib/integrationService';
import { UniversalMailboxModal } from '@/components/email/UniversalMailboxModal';
import { EmailThreadHistoryView } from '@/components/email/EmailThreadHistoryView';
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
import { hasFeatureAccess } from '@/lib/planLimitsService';

export default function ServicesIAEmail() {
  const { language } = useLanguage();
  const { company, token, isAuthenticated } = useAuth();
  const isEn = language === "en";

  const { allowed: canUseOutlookSync } = hasFeatureAccess('email_outlook_sync');

  const toneOptions: EmailTone[] = ['Professionnel', 'Commercial', 'Court & Percutant', 'Empathique', 'Formel', 'Chaleureux'];
  const objectiveOptions: EmailObjective[] = ['Nouvel email', 'Réponse stratégique', 'Négociation', 'Prise de contact', 'Suivi de projet'];

  // Quota Freemium 3 essais invité
  const { 
    remainingTrials, 
    isLimitReached: isQuotaLimitReached, 
    isAuthModalOpen: isQuotaModalOpen, 
    setIsAuthModalOpen: setIsQuotaModalOpen, 
    checkCanExecute, 
    recordExecution 
  } = useGuestQuota('email');

  const [activeTab, setActiveTab] = useState<'editor' | 'threads' | 'history' | 'integrations'>('editor');

  // Boîtes de messagerie universelles (ZÉRO MOCK : uniquement les boîtes réelles configurées)
  const [mailboxes, setMailboxes] = useState<UniversalMailbox[]>([]);
  const [selectedMailboxId, setSelectedMailboxId] = useState<number | string | null>(null);
  const [isLoadingMailboxes, setIsLoadingMailboxes] = useState(false);
  const [isUniversalMailboxModalOpen, setIsUniversalMailboxModalOpen] = useState(false);

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
  
  // Integrations & Mailboxes State
  const [integrations, setIntegrations] = useState<CompanyIntegrationsState | null>(null);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Charger les boîtes de messagerie universelles au montage
  useEffect(() => {
    loadMailboxes();
  }, [company?.id]);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
    if (activeTab === 'integrations') {
      loadIntegrations();
      loadMailboxes();
    }
    if (activeTab === 'threads') {
      loadMailboxes();
    }
  }, [activeTab, company?.id]);

  const loadMailboxes = async () => {
    setIsLoadingMailboxes(true);
    try {
      const list = await fetchMailboxes(company?.id);
      setMailboxes(list);
      if (list.length > 0 && !selectedMailboxId) {
        const active = list.find((m) => m.is_active) || list[0];
        setSelectedMailboxId(active.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMailboxes(false);
    }
  };

  const handleDeleteMailbox = async (id: number | string, email: string) => {
    if (!window.confirm(`Confirmez-vous la déconnexion de la boîte ${email} ?`)) return;
    try {
      await deleteMailbox(id, company?.id);
      toast.success(`La boîte ${email} a été déconnectée avec succès.`);
      await loadMailboxes();
      if (String(selectedMailboxId) === String(id)) {
        setSelectedMailboxId(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la déconnexion.");
    }
  };

  const handleSelectEmailFromThread = (msg: any) => {
    const contactInfo = msg.sender_name || msg.sender_email;
    setText(`Bonjour ${msg.sender_name || ''},\n\nMerci pour votre retour concernant « ${msg.subject || 'notre échange'} ».\n\n\nBien cordialement,\n`);
    setEmailWorkMode('reply_inbound');
    setObjective('Réponse stratégique');
    setActiveTab('editor');
    toast.info(`Message de ${contactInfo} sélectionné. Prêt pour la réponse IA !`);
  };

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
    <div className="ia-page min-h-screen pt-20 pb-20 bg-slate-50/50">
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

        {/* Universal Mailbox Status Bar */}
        {mailboxes.length > 0 ? (
          <div className="mb-8 p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-lg border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-2">
                  <span>Expéditeur actif (IMAP / SMTP)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <span>
                    {mailboxes.find((m) => String(m.id) === String(selectedMailboxId))?.email || mailboxes[0]?.email}
                  </span>
                  <span className="text-xs font-normal text-slate-300">
                    ({mailboxes.find((m) => String(m.id) === String(selectedMailboxId))?.display_name || 'Connecté'})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {mailboxes.length > 1 && (
                <select
                  value={selectedMailboxId || ''}
                  onChange={(e) => setSelectedMailboxId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none"
                >
                  {mailboxes.map((m) => (
                    <option key={m.id} value={m.id}>{m.email} ({m.display_name})</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('threads')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 text-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MessageSquare size={14} /> Voir tous les échanges
              </button>
              <button
                type="button"
                onClick={() => setIsUniversalMailboxModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus size={14} /> Connecter une autre boîte
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Aucune boîte mail professionnelle connectée
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  Connectez votre adresse email (ITID France <code className="font-mono bg-amber-100 px-1 rounded">contact@itid-france.com</code>, Gmail, Outlook ou domaine personnalisé) pour envoyer avec votre propre adresse et charger l'historique complet des échanges.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUniversalMailboxModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} /> Connecter une boîte email
            </button>
          </div>
        )}

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
            onClick={() => setActiveTab('threads')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'threads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={18} /> 📥 Historique & Fils de discussion
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <History size={18} /> Brouillons Sauvegardés
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Server size={18} /> Hub Messagerie & Comptes ({mailboxes.length})
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
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative group transition-all">
              <div className="w-full md:w-96">
                <ClientSelectWithCreate
                  selectedClientId={selectedClient?.id}
                  onSelectClient={(c) => setSelectedClient(c)}
                  label="Client destinataire / interlocuteur lié"
                  placeholder="Rechercher ou lier un client pour contexte 360°..."
                />
              </div>

              {/* Sélecteur de mode de travail Email */}
              <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl w-full md:w-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setEmailWorkMode('write')}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    emailWorkMode === 'write'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />
                  Rédiger un email
                </button>
                <button
                  type="button"
                  onClick={() => setEmailWorkMode('reply_inbound')}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    emailWorkMode === 'reply_inbound'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
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

        {/* TAB: THREADS & UNIVERSAL EMAIL HISTORY */}
        {activeTab === 'threads' && (
          <div className="ia-animate-in">
            <EmailThreadHistoryView
              mailboxes={mailboxes}
              selectedMailboxId={selectedMailboxId || undefined}
              onSelectMailbox={(id) => setSelectedMailboxId(id)}
              onOpenAddMailbox={() => setIsUniversalMailboxModalOpen(true)}
              companyId={company?.id}
              onSelectEmailToReply={handleSelectEmailFromThread}
            />
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

        {/* TAB: INTEGRATIONS & UNIVERSAL MAILBOX HUB */}
        {activeTab === 'integrations' && (
          <div className="ia-animate-in max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                <Server size={14} /> Hub de Messagerie Universelle & Multi-Fournisseurs
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                Connectez n'importe quelle adresse email
              </h2>
              <p className="text-slate-600 text-base">
                Associez vos adresses professionnelles (ITID France <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">contact@itid-france.com</code>, Gmail, Outlook, OVH ou n'importe quel domaine d'entreprise) pour envoyer directement avec votre propre expéditeur et retrouver l'intégralité de vos fils de discussion.
              </p>
            </div>

            {/* Boîtes Emails IMAP/SMTP Connectées */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <Mail className="text-blue-600" size={22} />
                    <span>Boîtes Emails Connectées ({mailboxes.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Comptes IMAP / SMTP enregistrés pour l'envoi direct et la synchronisation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsUniversalMailboxModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span>Connecter une nouvelle adresse</span>
                </button>
              </div>

              {isLoadingMailboxes ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
              ) : mailboxes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-700 mb-1">Aucune boîte de messagerie connectée</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                    Zéro fausse donnée : connectez votre véritable adresse pour commencer à expédier et synchroniser vos échanges clients.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUniversalMailboxModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
                  >
                    <Plus size={14} /> Connecter mon adresse email maintenant
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {mailboxes.map((mb) => {
                    const isSelected = String(selectedMailboxId) === String(mb.id);
                    return (
                      <div
                        key={mb.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                mb.provider === 'itid_ovh' || mb.provider === 'ovh'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : mb.provider === 'gmail'
                                  ? 'bg-red-100 text-red-800'
                                  : mb.provider === 'outlook'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {mb.provider === 'itid_ovh' || mb.provider === 'ovh' ? 'OVH' : mb.provider === 'gmail' ? 'GMAIL' : mb.provider === 'outlook' ? 'M365' : 'IMAP'}
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                                  <span>{mb.email}</span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">Actif</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 font-medium truncate">
                                  {mb.display_name}
                                </div>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              <CheckCircle2 size={12} /> Connecté
                            </span>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-600 space-y-1 mb-4 border border-slate-100">
                            <div className="flex justify-between">
                              <span className="text-slate-400">IMAP :</span>
                              <span className="font-semibold text-slate-700">{mb.imap_host}:{mb.imap_port} (SSL)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">SMTP :</span>
                              <span className="font-semibold text-slate-700">{mb.smtp_host}:{mb.smtp_port} (SSL)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMailboxId(mb.id);
                              setActiveTab('threads');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                          >
                            <MessageSquare size={13} /> Voir les messages
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedMailboxId(mb.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? 'Sélectionné' : 'Définir actif'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMailbox(mb.id, mb.email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Déconnecter cette boîte"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Presets 1-Clic & Compatibilité Totale */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                <span>Compatibilité & Configuration Rapide en 1 Clic</span>
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Preset ITID France */}
                <button
                  type="button"
                  onClick={() => setIsUniversalMailboxModalOpen(true)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                      🇫🇷
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">ITID France & OVH</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Préconfiguré pour <strong className="text-slate-700">contact@itid-france.com</strong> et serveurs OVH SSL.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                    Configurer en 1 clic →
                  </span>
                </button>

                {/* Preset Gmail */}
                <button
                  type="button"
                  onClick={() => setIsUniversalMailboxModalOpen(true)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                      G
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Google / Gmail</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Connexion sécurisée via Mot de passe d'application Google (guide pas-à-pas inclus).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-600 inline-flex items-center gap-1">
                    Configurer Gmail →
                  </span>
                </button>

                {/* Preset Outlook */}
                <button
                  type="button"
                  onClick={() => setIsUniversalMailboxModalOpen(true)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                      O
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Microsoft Outlook / 365</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Serveurs Office 365 et Outlook.com auto-détectés avec chiffrement TLS/SSL.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">
                    Configurer Outlook →
                  </span>
                </button>

                {/* Preset Custom Domain */}
                <button
                  type="button"
                  onClick={() => setIsUniversalMailboxModalOpen(true)}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-105 transition-transform">
                      <Globe size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Domaine Personnalisé</h4>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      N'importe quel serveur IMAP/SMTP dédié (<code className="text-slate-600">@votredomaine.com</code>, Infomaniak, Ionos, etc.).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">
                    Ajouter mon domaine →
                  </span>
                </button>
              </div>
            </div>

            {/* Connecteurs Cloud (Google OAuth / Microsoft OAuth) */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <LinkIcon size={18} className="text-slate-600" />
                <span>Connecteurs Cloud OAuth Alternatifs</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Outlook / M365 */}
                <div className="ia-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 text-blue-600 border border-blue-100">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M22 6.5A1.5 1.5 0 0 0 20.5 5h-17A1.5 1.5 0 0 0 2 6.5v11A1.5 1.5 0 0 0 3.5 19h17a1.5 1.5 0 0 0 1.5-1.5v-11zm-1.8.5-7.7 5.7a1 1 0 0 1-1 0L3.8 7h16.4zm1.8 11a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V8.1l7.8 5.8a2 2 0 0 0 2.4 0l7.8-5.8v9.9z"/>
                    </svg>
                  </div>
                  <h4 className="text-base font-bold mb-1">Microsoft 365 Cloud OAuth</h4>
                  <p className="text-xs text-slate-500 mb-4 font-medium">Brouillons synchronisés et carnet de contacts Cloud.</p>
                  
                  {integrations?.microsoft.connected ? (
                    <div className="w-full space-y-2">
                      <div className="py-2 px-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Relié : {integrations.microsoft.email || 'Compte Entreprise'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleToggleConnect('microsoft')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Déconnecter
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        if (!canUseOutlookSync) {
                          toast.error("Le Plan Indépendant est requis pour la synchronisation Outlook.");
                          return;
                        }
                        handleToggleConnect('microsoft');
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition-colors ${
                        canUseOutlookSync ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {canUseOutlookSync ? <LinkIcon size={16} /> : <Lock size={16} />} Relier via OAuth Microsoft
                    </button>
                  )}
                </div>

                {/* Google Workspace / Gmail */}
                <div className="ia-card p-6 bg-white border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3 text-red-500 border border-red-100">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                  </div>
                  <h4 className="text-base font-bold mb-1">Google Workspace Cloud OAuth</h4>
                  <p className="text-xs text-slate-500 mb-4 font-medium">Envois automatiques Gmail et Google Contacts Cloud.</p>
                  
                  {integrations?.google.connected ? (
                    <div className="w-full space-y-2">
                      <div className="py-2 px-3 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Relié : {integrations.google.email || 'Compte Google'}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleToggleConnect('google')}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Déconnecter
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleToggleConnect('google')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition-colors"
                    >
                      <LinkIcon size={16} /> Relier via OAuth Google
                    </button>
                  )}
                </div>
              </div>
            </div>
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

      {/* Modal Universel de Connexion de Boîte Email (IMAP / SMTP / Gmail / ITID / Outlook) */}
      <UniversalMailboxModal
        isOpen={isUniversalMailboxModalOpen}
        onClose={() => setIsUniversalMailboxModalOpen(false)}
        onMailboxSaved={loadMailboxes}
        companyId={company?.id}
      />

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
