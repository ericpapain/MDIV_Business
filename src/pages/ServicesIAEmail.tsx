import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, Mail, Edit3, History, Link as LinkIcon, 
  Sparkles, Loader2, CheckCircle2, Copy, Trash2, 
  RefreshCcw, AlertTriangle, MessageSquare, Send
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


export default function ServicesIAEmail() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'integrations'>('editor');

  // Editor State
  const [text, setText] = useState('');
  const [tone, setTone] = useState<EmailTone>('Professionnel');
  const [objective, setObjective] = useState<EmailObjective>('Nouvel email');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kpis, setKpis] = useState<EmailAnalysisKPIs | null>(null);

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
    } catch (err) {
      // Fail silently for analysis to not disrupt typing
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAITask = async (task: AITask) => {
    if (!text.trim()) {
      toast.error("Veuillez d'abord rédiger un brouillon d'email.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateEmailContent(text, task, tone, objective, company?.id);
      setText(generated);
      toast.success(`${task} terminée avec succès.`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Texte copié dans le presse-papier');
  };

  const clearText = () => {
    if(window.confirm("Êtes-vous sûr de vouloir effacer le texte ?")) {
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
      toast.error(err.message || 'Erreur de connexion');
    }
  };


  // Options arrays
  const toneOptions: EmailTone[] = ['Professionnel', 'Commercial', 'Institutionnel', 'Technique', 'Amical', 'Directif', 'Diplomatique'];
  const objectiveOptions: EmailObjective[] = ['Nouvel email', 'Réponse à email', 'Relance client', 'Réclamation', 'Proposition commerciale', 'Compte-rendu', 'Invitation réunion', 'Email RH', 'Email recrutement'];

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <EnterpriseAuthBar className="mb-8" />
        
        <div className="mb-8">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
            <ArrowLeft size={16} /> Retour aux Services IA
          </Link>
          <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
            <Mail size={16} /> Productivité
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Assistant Email IA
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl">
            Rédigez, corrigez et optimisez vos communications professionnelles instantanément. Connectez votre messagerie pour une productivité maximale.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'editor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 size={18} /> Rédaction & Analyse
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={18} /> Historique & Modèles
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon size={18} /> Intégrations (Outlook, M365)
          </button>
        </div>

        {/* TAB: EDITOR */}
        {activeTab === 'editor' && (
          <div className="grid lg:grid-cols-3 gap-8 ia-animate-in">
            {/* Colonne Principale: Éditeur */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Objectif de l'email</label>
                  <select 
                    value={objective} 
                    onChange={(e) => setObjective(e.target.value as EmailObjective)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 shadow-sm"
                  >
                    {objectiveOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ton souhaité</label>
                  <select 
                    value={tone} 
                    onChange={(e) => setTone(e.target.value as EmailTone)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 shadow-sm"
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

                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
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
                      <Send size={16} /> Envoyer / Brouillon (Gmail & Outlook)
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors text-sm font-bold shadow-sm">
                      <Copy size={16} /> Copier l'email
                    </button>
                  </div>
                </div>
              </div>
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
                <button className="w-full py-2.5 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors">
                  Voir nos offres Copilot
                </button>
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
                <p className="text-slate-500 font-medium">Vous n'avez pas encore généré d'email, ou le service d'historique n'est pas configuré sur le serveur.</p>
                <button onClick={() => setActiveTab('editor')} className="mt-6 ia-btn-primary px-6 py-2">Retourner à la rédaction</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(item => (
                  <div key={item.id} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm flex flex-col h-48">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase">{item.objective}</span>
                      <span className="text-xs font-bold text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-3 mt-2 flex-1 italic">
                      "{item.contentSnippet}"
                    </p>
                    <button className="w-full mt-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
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
              <p className="text-slate-600">Permettez à l'IA d'analyser vos brouillons directement depuis votre boîte de réception.</p>
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
                  <p className="text-sm text-slate-500 mb-6 font-medium">Brouillons synchronisés, envois directs et analyse de ton intégrée.</p>
                  
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
                  <p className="text-sm text-slate-500 mb-6 font-medium">Brouillons synchronisés dans Gmail, envois directs et contacts Google.</p>
                  
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

      {/* Modal d'envoi & création brouillon Gmail / Outlook */}
      <EmailActionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        emailData={{
          to: '',
          subject: 'Message MDIV Business',
          body: text
        }}
        companyId={company?.id}
      />
    </div>
  );
}
