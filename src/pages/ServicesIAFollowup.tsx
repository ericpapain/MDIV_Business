import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, Search, Send, BarChart2, Bell, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, Sparkles, Loader2, Mail, Copy, Check, FileText, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  fetchFollowupKPIs, 
  fetchFollowupTargets, 
  generateFollowupEmailAI, 
  sendFollowupEmail,
  FollowupKPIs,
  FollowupTarget,
  FollowupGenerateRequest
} from '@/lib/followupService';
import { fetchIntegrationsStatus } from '@/lib/emailAssistantService';

export default function ServicesIAFollowup() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<'dashboard' | 'action'>('action');

  // Données
  const [kpis, setKpis] = useState<FollowupKPIs | null>(null);
  const [targets, setTargets] = useState<FollowupTarget[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Intégration
  const [m365Connected, setM365Connected] = useState(false);

  // État de l'action en cours
  const [selectedTarget, setSelectedTarget] = useState<FollowupTarget | null>(null);
  const [tone, setTone] = useState<FollowupGenerateRequest['tone']>('Courtois');
  const [urgency, setUrgency] = useState<FollowupGenerateRequest['urgencyLevel']>('medium');
  
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    checkIntegrations();
  }, [company?.id]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [k, t] = await Promise.all([
        fetchFollowupKPIs(company?.id),
        fetchFollowupTargets(company?.id)
      ]);
      setKpis(k);
      setTargets(t);
    } catch(e) {}
    setIsLoadingData(false);
  };

  const checkIntegrations = async () => {
    try {
      const integrations = await fetchIntegrationsStatus(company?.id);
      setM365Connected(integrations.microsoft365);
    } catch(e) {}
  };

  const handleSelectTarget = (target: FollowupTarget) => {
    setSelectedTarget(target);
    setGeneratedSubject('');
    setGeneratedBody('');
    
    // Auto-ajustement de l'urgence selon les jours de retard
    if (target.daysPending > 30) {
      setUrgency('high');
      setTone('Ferme');
    } else if (target.daysPending > 15) {
      setUrgency('medium');
      setTone('Diplomatique');
    } else {
      setUrgency('low');
      setTone('Courtois');
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedTarget) return;
    
    setIsGenerating(true);
    try {
      const res = await generateFollowupEmailAI({
        targetId: selectedTarget.id,
        type: selectedTarget.type,
        clientName: selectedTarget.clientName,
        reference: selectedTarget.reference,
        tone,
        urgencyLevel: urgency
      }, company?.id);
      
      setGeneratedSubject(res.subject);
      setGeneratedBody(res.body);
      toast.success("Brouillon généré par l'IA.");
    } catch(err: any) {
      toast.error(err.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedTarget || !generatedSubject || !generatedBody) return;
    
    setIsSending(true);
    try {
      await sendFollowupEmail(selectedTarget.id, generatedSubject, generatedBody, undefined, company?.id);
      toast.success("Relance envoyée avec succès.");
      setTargets(targets.filter(t => t.id !== selectedTarget.id));
      setSelectedTarget(null);
    } catch(err: any) {
      toast.error(err.message || "Erreur d'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${generatedSubject}\n\n${generatedBody}`);
    setCopied(true);
    toast.success("Texte copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  const getTargetIcon = (type: string) => {
    switch(type) {
      case 'invoice': return <ShieldAlert size={16} className="text-red-500" />;
      case 'quote': return <FileText size={16} className="text-blue-500" />;
      case 'meeting': return <Clock size={16} className="text-amber-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  const getTargetLabel = (type: string) => {
    switch(type) {
      case 'invoice': return "Facture impayée";
      case 'quote': return "Devis non signé";
      case 'meeting': return "Rendez-vous manqué";
      case 'inactive_client': return "Client inactif";
      default: return "Dossier";
    }
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header avec Vidéo et Étapes */}
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
          <div className="pt-2 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
                <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
                <RefreshCcw size={16} /> {isEn ? "Refresh & Restart" : "Actualiser et recommencer"}
              </button>
            </div>
            <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Send size={16} /> Suite Commerciale
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Relances Intelligentes
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              L'IA identifie les relances à effectuer (factures, devis) et rédige l'email parfait avec le ton adéquat.
            </p>

            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-blue-300 via-cyan-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-blue-400 opacity-50"></div>
            </div>

            {/* Comment ça marche : Visuel à étapes détaillées */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                
                {/* Étape 1 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Search size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Détection</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Détecte les impayés/devis.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-blue-200 to-cyan-200 ml-8 sm:hidden"></div>

                {/* Étape 2 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="absolute -top-1.5 -right-1.5">
                    <span className="flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 shadow-sm"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Création IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Rédige la relance parfaite.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-cyan-500 bg-cyan-50/80 h-8 w-8 rounded-full border border-cyan-100/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-cyan-200 to-slate-800 ml-8 sm:hidden"></div>

                {/* Étape 3 */}
                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Send size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Envoi direct</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Envoyez en un clic.</p>
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
            onClick={() => setActiveTab('action')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'action' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell size={18} /> Centre d'Action
            {targets.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{targets.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 size={18} /> Tableau de Bord
          </button>
        </div>

        {/* TAB 1: CENTRE D'ACTION */}
        {activeTab === 'action' && (
          <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
            {/* Colonne de gauche : Liste des dossiers en souffrance */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                Dossiers nécessitant une action
              </h3>
              
              {isLoadingData ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
              ) : targets.length === 0 ? (
                <div className="ia-card bg-white p-10 text-center border border-slate-200 text-slate-500 font-medium">
                  Aucune relance en attente détectée dans la base de données.
                </div>
              ) : (
                <div className="space-y-3">
                  {targets.map(target => (
                    <button 
                      key={target.id}
                      onClick={() => handleSelectTarget(target)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedTarget?.id === target.id 
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500 shadow-md' 
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getTargetIcon(target.type)}
                          <span className="font-bold text-sm text-slate-700">{getTargetLabel(target.type)}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          target.daysPending > 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {target.daysPending} jours
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 mb-1">{target.clientName}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Réf: {target.reference}</span>
                        {target.amount && <span className="font-bold text-slate-700">{target.amount.toLocaleString()} €</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colonne de droite : Assistant IA */}
            <div className="lg:col-span-7">
              {selectedTarget ? (
                <div className="ia-card bg-white border border-slate-200 overflow-hidden sticky top-24 shadow-xl shadow-blue-900/5">
                  <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/30 blur-2xl rounded-full"></div>
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-2 relative z-10">
                      <Sparkles size={20} /> IA Génératrice de Relance
                    </div>
                    <h3 className="font-bold text-xl relative z-10">
                      Relance pour {selectedTarget.clientName}
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ton du message</label>
                        <select 
                          value={tone} 
                          onChange={(e: any) => setTone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                        >
                          <option value="Courtois">Courtois (Doux)</option>
                          <option value="Commercial">Commercial (Vente)</option>
                          <option value="Professionnel">Professionnel (Neutre)</option>
                          <option value="Diplomatique">Diplomatique (Intermédiaire)</option>
                          <option value="Ferme">Ferme (Strict)</option>
                          <option value="Très ferme">Très ferme (Mise en demeure)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Niveau d'urgence</label>
                        <select 
                          value={urgency} 
                          onChange={(e: any) => setUrgency(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                        >
                          <option value="low">Basse (1ère relance)</option>
                          <option value="medium">Moyenne (2ème relance)</option>
                          <option value="high">Haute (Dernier avis)</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="w-full ia-btn-primary py-3 mb-6 text-sm font-bold flex justify-center items-center gap-2"
                    >
                      {isGenerating ? <><Loader2 className="animate-spin" size={16}/> Rédaction en cours...</> : <><Sparkles size={16}/> Générer le brouillon</>}
                    </button>

                    {generatedBody && (
                      <div className="space-y-4 ia-animate-in">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Objet</label>
                          <input type="text" value={generatedSubject} onChange={e => setGeneratedSubject(e.target.value)} className="w-full h-12 min-h-[48px] bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Corps de l'email</label>
                          <textarea 
                            value={generatedBody} 
                            onChange={e => setGeneratedBody(e.target.value)}
                            className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-normal text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[250px] resize-y transition-all leading-relaxed" 
                          />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                          <button 
                            onClick={copyToClipboard}
                            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors flex justify-center items-center gap-2"
                          >
                            {copied ? <Check size={16} className="text-emerald-600"/> : <Copy size={16} />} 
                            {copied ? 'Copié' : 'Copier'}
                          </button>
                          <button 
                            onClick={handleSend}
                            disabled={isSending || !m365Connected}
                            className={`flex-1 py-3 font-bold rounded-xl text-sm flex justify-center items-center gap-2 transition-all ${
                              m365Connected 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            title={!m365Connected ? "Veuillez connecter votre compte Microsoft 365 (Onglet Assistant Email)" : ""}
                          >
                            {isSending ? <Loader2 className="animate-spin" size={16}/> : <Mail size={16} />}
                            {m365Connected ? 'Envoyer direct' : 'M365 non connecté'}
                          </button>
                        </div>
                        {!m365Connected && (
                          <p className="text-xs text-amber-600 text-center font-medium">
                            <AlertTriangle size={12} className="inline mr-1"/>
                            L'envoi automatique est désactivé. Connectez Outlook dans le module Assistant Email.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-blue-400" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-600 mb-2">Sélectionnez un dossier</h4>
                  <p className="text-sm">Cliquez sur une alerte à gauche pour que l'IA rédige la relance correspondante.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="ia-animate-in space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1">Relances envoyées</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.totalSent || 0}</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-blue-600 mb-1">Taux de réponse</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.responseRatePercent || 0}%</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-emerald-600 mb-1">Factures régularisées</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.invoicesPaid || 0}</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-purple-600 mb-1">Devis gagnés (relance)</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.quotesWon || 0}</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
