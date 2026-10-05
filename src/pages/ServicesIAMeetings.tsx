import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, FileAudio, FileText, Upload, Plus, History, 
  Loader2, Mic, PlayCircle, Search, Calendar, FileDown, 
  AlertCircle, Camera, CheckCircle2, Sparkles, RefreshCcw,
  Pause, Play, Square, Trash2, Radio, Volume2, Save, FolderKanban
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  analyzeMeetingMedia, 
  fetchMeetingHistory, 
  exportMeetingReport, 
  startMeetingAgentsAnalysis,
  AgentMessage,
  MeetingReport 
} from '@/lib/meetingReportService';
import { MeetingReportView } from '@/components/meetings/MeetingReportView';
import { DocumentUploadCapture } from '@/components/ui/DocumentUploadCapture';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar, VersionItem } from '@/components/common/VersionSelectorBar';
import { SavedWorkItem } from '@/lib/savedWorkService';

export default function ServicesIAMeetings() {
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
  } = useGuestQuota('meetings');

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // Create State
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'upload' | 'agents' | 'result'>('upload');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<MeetingReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Versions State
  const [versions, setVersions] = useState<VersionItem<MeetingReport>[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);

  // Universal Save & History Drawer State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Live Dictation State
  const [dictationStatus, setDictationStatus] = useState<'ready' | 'listening' | 'transcribing' | 'paused' | 'completed'>('ready');
  const [dictationTime, setDictationTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const dictationTimerRef = useRef<any>(null);

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('mdiv_meeting_notes_draft');
      if (savedNotes && !text) {
        setText(savedNotes);
        setDictationStatus('completed');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    try {
      if (text) {
        localStorage.setItem('mdiv_meeting_notes_draft', text);
      }
    } catch (e) {
      console.error(e);
    }
  }, [text]);

  // Dictation timer effect
  useEffect(() => {
    if (dictationStatus === 'listening' || dictationStatus === 'transcribing') {
      dictationTimerRef.current = setInterval(() => {
        setDictationTime(t => t + 1);
      }, 1000);
    } else {
      if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    }
    return () => {
      if (dictationTimerRef.current) clearInterval(dictationTimerRef.current);
    };
  }, [dictationStatus]);

  // History State
  const [history, setHistory] = useState<MeetingReport[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyError, setHistoryError] = useState(false);

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(false);
    try {
      const data = await fetchMeetingHistory(company?.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
      setHistoryError(true);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setText('');
    }
  };

  const clearUpload = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setDictationStatus('ready');
    setFile(null);
    setText('');
    try { localStorage.removeItem('mdiv_meeting_notes_draft'); } catch (e) {}
    setCurrentReport(null);
    setPhase('upload');
    setAgentMessages([]);
  };

  // Live Dictation Controls
  const startLiveDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("La dictée vocale n'est pas supportée par votre navigateur. Utilisez Google Chrome ou Microsoft Edge.");
      return;
    }

    try {
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR';

        recognition.onstart = () => {
          setDictationStatus('listening');
          toast.success("Dictée vocale activée. Parlez naturellement...");
        };

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentSessionText += event.results[i][0].transcript + ' ';
          }
          if (currentSessionText.trim()) {
            setText(currentSessionText.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Dictation error:", event.error);
          if (event.error !== 'no-speech') {
            toast.error(`Erreur micro : ${event.error}`);
            setDictationStatus('ready');
          }
        };

        recognition.onend = () => {
          setDictationStatus(prev => (prev === 'listening' || prev === 'transcribing') ? 'paused' : prev);
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.start();
      setDictationStatus('listening');
    } catch (e: any) {
      toast.error("Impossible de démarrer le microphone.");
    }
  };

  const pauseLiveDictation = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setDictationStatus('paused');
    toast.info("Dictée mise en pause.");
  };

  const resumeLiveDictation = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
    setDictationStatus('listening');
  };

  const stopLiveDictation = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setDictationStatus('completed');
    toast.success("Transcription terminée et enregistrée.");
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleAnalyze = async (isNewVersion = false) => {
    if (!file && !text.trim()) {
      toast.error("Veuillez importer un fichier ou coller une transcription.");
      return;
    }

    if (!file) {
      const clean = text.trim();
      const isGibberish = 
        clean.length < 10 ||
        /^(.)\1{4,}/i.test(clean) ||
        (/^[b-df-hj-np-tv-z0-9\s.,;:!?'-]{12,}$/i.test(clean) && !/[aeiouy]/i.test(clean));

      if (isGibberish) {
        toast.error("Votre saisie semble incomplète ou incompréhensible. Pour synthétiser une réunion, veuillez fournir des notes contenant au minimum les sujets abordés, les participants ou les décisions clés prises.");
        return;
      }
    }

    if (!checkCanExecute()) return;

    setIsAnalyzing(true);
    setAgentError(null);
    try {
      const contentToAnalyze = isNewVersion ? `${text}\n\n[CONSIGNE VARIATION] : Reformule et synthétise sous un angle d'arbitrage exécutif alternatif.` : text;
      const uploadRes = await analyzeMeetingMedia(file, contentToAnalyze, company?.id);
      
      setPhase('agents');
      setAgentMessages([]);
      
      startMeetingAgentsAnalysis(
        uploadRes.id || "meeting_temp_id",
        company?.id,
        (msg) => {
          setAgentMessages(prev => [...prev, msg]);
        },
        (report) => {
          setCurrentReport(report);
          setPhase('result');
          
          const newVerNum = versions.length + 1;
          const newVer: VersionItem<MeetingReport> = {
            id: 'ver_' + Date.now(),
            versionNumber: newVerNum,
            label: `Compte-rendu V${newVerNum}`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            data: report,
          };
          const updatedVers = [...versions, newVer];
          setVersions(updatedVers);
          setActiveVersionIndex(updatedVers.length - 1);

          recordExecution();
          toast.success(isNewVersion ? `Nouvelle variante V${newVerNum} générée !` : "Compte-rendu généré avec succès !");
          setIsAnalyzing(false);
        },
        (err) => {
          setAgentError(err.message);
          setIsAnalyzing(false);
        }
      );

    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'analyse.");
      setIsAnalyzing(false);
      setPhase('upload');
    }
  };

  const handleSwitchVersion = (index: number) => {
    if (versions[index]) {
      setActiveVersionIndex(index);
      setCurrentReport(versions[index].data);
      toast.info(`Affichage de la ${versions[index].label || `Version ${index + 1}`}`);
    }
  };

  const handleLoadSavedWork = (item: SavedWorkItem) => {
    try {
      const p = item.content_payload;
      if (p.subject && p.executiveSummary) {
        setCurrentReport(p);
        setPhase('result');
        setActiveTab('create');
        toast.success(`Compte-rendu « ${item.title} » restauré avec succès !`);
      }
    } catch {
      toast.error("Format de travail invalide.");
    }
  };

  const viewHistoricReport = (report: MeetingReport) => {
    setCurrentReport(report);
    setActiveTab('create');
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredHistory = history.filter(r => 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.date.includes(searchQuery)
  );

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Barre d'Authentification / Entreprise */}
        <EnterpriseAuthBar 
          appName="Comptes-Rendus de Réunions IA"
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

            {currentReport && (
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
            <div className="flex items-center gap-3 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Mic size={16} /> Réunions, Dictées & Synthèses
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Générateur de Comptes-Rendus IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Transformez vos réunions (Teams, Zoom, Meet, Audio) ou dictées vocales en direct en rapports exécutifs structurés avec décisions et plans d'actions.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-indigo-300 via-blue-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-indigo-400 opacity-50"></div>
            </div>

            {/* Comment ça marche */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Mic size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Audio ou Dictée</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Importez l'audio ou parlez au micro.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-indigo-500 bg-indigo-50/80 h-8 w-8 rounded-full border border-indigo-100/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Analyse Multi-Agents</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Extraction décisions & actions.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Rapport & Export</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Export PDF, Word ou sauvegarde.</p>
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
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <Plus size={18} /> Nouveau Compte-Rendu
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            <History size={18} /> Historique & Archives
          </button>
        </div>

        {/* TAB: CREATE */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Version Selector Bar */}
            {versions.length > 0 && phase === 'result' && (
              <VersionSelectorBar
                versions={versions}
                activeVersionIndex={activeVersionIndex}
                onSelectVersion={handleSwitchVersion}
                onGenerateNewVersion={() => handleAnalyze(true)}
                isGeneratingNewVersion={isAnalyzing}
              />
            )}

            {phase === 'upload' && (
              <div className="space-y-8 ia-animate-in">
                
                {/* 1. Studio Dictée Vocale en Direct */}
                <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden border border-blue-500/30">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                        <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        Micro & Dictée Vocale IA Directe
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        Dictez vos réunions ou vos débriefings en direct
                      </h3>
                      <p className="text-sm text-white max-w-xl">
                        Activez le micro, parlez librement et laissez notre IA retranscrire fidèlement vos échanges sans coupure.
                      </p>
                    </div>

                    {/* Microphone Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                      {dictationStatus === 'ready' && (
                        <button
                          type="button"
                          onClick={startLiveDictation}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                          <Mic className="w-5 h-5 animate-pulse" />
                          Démarrer la Dictée Vocale
                        </button>
                      )}

                      {dictationStatus === 'listening' && (
                        <div className="flex items-center gap-2">
                          <div className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                            Enregistrement : {formatTimer(dictationTime)}
                          </div>
                          <button
                            type="button"
                            onClick={pauseLiveDictation}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                            title="Mettre en pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={stopLiveDictation}
                            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                            title="Terminer et valider"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Valider
                          </button>
                        </div>
                      )}

                      {dictationStatus === 'paused' && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold">
                            En pause ({formatTimer(dictationTime)})
                          </span>
                          <button
                            type="button"
                            onClick={resumeLiveDictation}
                            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                            title="Reprendre"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={stopLiveDictation}
                            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Terminer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {dictationStatus === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> {wordCount} mots retranscrits
                          </span>
                          <button
                            type="button"
                            onClick={startLiveDictation}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                          >
                            Reprendre la dictée
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Upload Audio / Transcription existante */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* File Upload Box */}
                  <div className="ia-card p-6 md:p-8 bg-white border border-slate-200 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <FileAudio className="text-blue-600" size={20} />
                        Importer un Fichier Audio / Vidéo
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mb-6">
                        Formats supportés : MP3, WAV, M4A, MP4, WebM (Jusqu'à 100 Mo).
                      </p>

                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                          file ? 'border-blue-500 bg-blue-50/30' : 'border-slate-300 hover:border-blue-400 bg-slate-50'
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="audio/*,video/*" 
                          className="hidden" 
                        />
                        
                        {file ? (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                              <FileAudio size={24} />
                            </div>
                            <span className="font-bold text-slate-800 text-sm mb-1">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} Mo</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setFile(null); }}
                              className="mt-3 text-xs text-red-600 font-bold hover:underline"
                            >
                              Supprimer le fichier
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                              <Upload size={24} />
                            </div>
                            <span className="font-bold text-slate-700 text-sm mb-1">Cliquez ou glissez un enregistrement</span>
                            <span className="text-xs text-slate-400">MP3, WAV, M4A, Teams, Zoom, Meet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Text Notes Box */}
                  <div className="ia-card p-6 md:p-8 bg-white border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="text-blue-600" size={20} />
                          Notes, Transcription ou Verbatim
                        </h3>
                        {wordCount > 0 && (
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                            {wordCount} mots
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mb-3">
                        Collez vos notes brutes ou le texte dicté en direct :
                      </p>

                      <div className="mb-3">
                        <DocumentUploadCapture 
                          label="Importer un document de réunion (PDF, Word, Scan)"
                          acceptedFormats=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                          onDocumentProcessed={({ text: extractedText }) => {
                            if (extractedText) {
                              setText(prev => (prev ? prev + "\n\n" : "") + extractedText);
                              toast.success("Notes de réunion extraites du document avec succès !");
                            }
                          }}
                        />
                      </div>

                      <textarea 
                        value={text} 
                        onChange={(e) => { setText(e.target.value); setFile(null); }}
                        placeholder="Ex : Réunion de cadrage du 04/10. Présents : Alice, Thomas. Ordre du jour : validation du budget Q4. Décision : validation du budget à 45k€..."
                        className="w-full bg-slate-50 border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] p-4 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[140px] resize-y transition-all"
                      />
                    </div>

                    {text && (
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-medium">
                        <span>Brouillon synchronisé localement</span>
                        <button 
                          type="button" 
                          onClick={() => { setText(''); localStorage.removeItem('mdiv_meeting_notes_draft'); }} 
                          className="text-red-600 hover:underline font-bold"
                        >
                          Effacer le texte
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Launch Button */}
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => handleAnalyze(false)}
                    disabled={isAnalyzing || (!file && !text.trim())}
                    className="ia-btn-primary px-8 py-4 text-base font-bold shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Générer le Compte-Rendu Exécutif
                        {!isAuthenticated && (
                          <span className="ml-1 text-xs px-2.5 py-1 rounded-full bg-white/20 font-normal">
                            {remainingTrials > 0 ? `⚡ ${remainingTrials}/3 essai${remainingTrials > 1 ? 's' : ''}` : '⚡ 0/3 (Verrouillé)'}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {phase === 'agents' && (
              <div className="ia-card p-8 md:p-12 ia-animate-in max-w-3xl mx-auto">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-4 animate-pulse">
                    <Mic size={28} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {isEn ? "AI Experts are structuring your meeting..." : "Nos experts IA structurent votre compte-rendu..."}
                  </h2>
                  <p className="text-slate-500">
                    {isEn ? "Listen to their real-time analysis" : "Extraction des décisions et actions en temps réel"}
                  </p>
                </div>
                
                <div className="space-y-6 min-h-[300px]">
                  {agentMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.agent.includes('Synthèse') ? 'items-center' : (i % 2 === 0 ? 'items-start' : 'items-end')} ia-animate-in`} style={{ animationDelay: `${i * 100}ms` }}>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 px-2">{msg.agent}</span>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                        msg.agent.includes('Synthèse') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-full text-center' : 
                        (i % 2 === 0 ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm')
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  
                  {!currentReport && !agentError && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-slate-300" size={24} />
                    </div>
                  )}
                  
                  {agentError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm flex flex-col items-center gap-3">
                      <span>{agentError}</span>
                      <button onClick={clearUpload} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-colors">Retour</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 'result' && currentReport && (
              <div className="space-y-6 ia-animate-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="font-semibold text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={20} /> Rapport généré avec succès
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAnalyze(true)}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
                      Proposer une autre version
                    </button>
                    <button 
                      onClick={clearUpload} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3.5 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      Analyser un autre fichier
                    </button>
                  </div>
                </div>
                
                <MeetingReportView report={currentReport} />
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="ia-animate-in">
            <div className="ia-card p-8 bg-white border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <h2 className="text-xl font-bold mb-1">Vos Comptes-Rendus</h2>
                  <p className="text-sm text-slate-500 font-medium">Retrouvez et exportez tous vos historiques de réunions.</p>
               </div>
               <div className="relative w-full md:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une réunion..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-colors"
                  />
               </div>
            </div>

            {isLoadingHistory ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-medium text-sm">Chargement de l'historique...</p>
              </div>
            ) : historyError ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-amber-500 bg-amber-50 rounded-3xl border border-amber-100">
                <AlertCircle size={40} />
                <p className="font-bold">Le service d'historique est indisponible.</p>
                <p className="text-sm font-medium opacity-80 text-center max-w-md">L'API backend n'est pas encore configurée pour récupérer l'historique réel.</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <FileAudio size={40} className="opacity-50" />
                <p className="font-bold text-slate-500">Aucun compte-rendu trouvé.</p>
                <button onClick={() => setActiveTab('create')} className="mt-2 text-sm font-bold text-blue-600 hover:underline">Créer mon premier rapport</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistory.map((report) => (
                  <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={18} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Calendar size={12} /> {report.date}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">{report.subject}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 flex-1">{report.executiveSummary}</p>
                    
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => viewHistoricReport(report)}
                        className="flex-1 py-2.5 text-sm font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-center"
                      >
                        Ouvrir
                      </button>
                      <button 
                        onClick={() => exportMeetingReport(report.id, 'pdf')}
                        className="w-12 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                        title="Télécharger PDF"
                      >
                        <FileDown size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Universal Save Modal */}
      {currentReport && (
        <SaveWorkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          toolType="meeting"
          defaultTitle={`Compte-rendu : ${currentReport.subject}`}
          contentPayload={currentReport}
          summary={`Compte-rendu avec ${currentReport.actions?.length || 0} actions assignées et ${currentReport.decisions?.length || 0} décisions actées.`}
          currentVersion={activeVersionIndex + 1}
        />
      )}

      {/* Universal Saved Work Drawer */}
      <SavedWorkDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        toolType="meeting"
        onSelectWork={handleLoadSavedWork}
      />

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          handleAnalyze();
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour générer des comptes-rendus de réunions illimités et sauvegarder vos actions."
      />
    </div>
  );
}
