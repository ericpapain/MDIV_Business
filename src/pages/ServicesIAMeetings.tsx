import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, FileAudio, FileText, Upload, Plus, History, 
  Loader2, Mic, PlayCircle, Search, Calendar, FileDown, 
  AlertCircle, Camera, CheckCircle2, Lock as LockIcon
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

export default function ServicesIAMeetings() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  // Create State
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<MeetingReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agents Phase
  const [phase, setPhase] = useState<'upload' | 'agents' | 'result'>('upload');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentError, setAgentError] = useState<string | null>(null);

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
      setText(''); // On vide le texte si on sélectionne un fichier
    }
  };

  const clearUpload = () => {
    setFile(null);
    setText('');
    setCurrentReport(null);
    setPhase('upload');
    setAgentMessages([]);
    setAgentError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file && !text.trim()) {
      toast.error("Veuillez importer un fichier ou coller une transcription.");
      return;
    }

    setIsAnalyzing(true);
    setAgentError(null);
    try {
      // 1. On upload d'abord le fichier ou le texte (qui retourne un ID ou un mock pour initier le flux)
      const uploadRes = await analyzeMeetingMedia(file, text, company?.id);
      
      // 2. On passe en mode agents visuel
      setPhase('agents');
      setAgentMessages([]);
      
      // 3. On lance la discussion
      startMeetingAgentsAnalysis(
        uploadRes.id || "meeting_temp_id", // ou le texte si on voulait tout faire en GET
        company?.id,
        (msg) => {
          setAgentMessages(prev => [...prev, msg]);
        },
        (report) => {
          setCurrentReport(report);
          setPhase('result');
          toast.success("Compte-rendu généré avec succès !");
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
      <div className="container mx-auto px-4 max-w-6xl">
        <EnterpriseAuthBar className="mb-8" />
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
              <ArrowLeft size={16} /> Retour aux Services IA
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Générateur de Comptes-Rendus IA
            </h1>
            <p className="text-slate-600 mt-2 font-medium">
              Transformez vos réunions (Teams, Zoom, Meet) ou transcriptions en rapports exécutifs structurés.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button 
            onClick={() => { setActiveTab('create'); if(currentReport) clearUpload(); }}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Plus size={18} /> Nouveau Compte-Rendu
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={18} /> Historique & Tableau de Bord
          </button>
        </div>

        {/* TAB: CREATE */}
        {activeTab === 'create' && (
          <div className="ia-animate-in">
            {phase === 'upload' && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* File Upload Zone */}
                <div className="ia-card p-8 bg-white border border-slate-200 flex flex-col">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <FileAudio size={20} className="text-blue-600" /> Importer un enregistrement
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">Formats supportés : MP3, WAV, MP4, PDF, DOCX</p>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors ${
                      file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    {file ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{file.name}</h3>
                        <p className="text-sm text-emerald-600 font-medium mt-1">Fichier prêt pour l'analyse</p>
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 underline">Retirer le fichier</button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                          <Upload size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">Cliquez ou glissez un fichier</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-[200px]">Pour extraire automatiquement les actions et décisions.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Text / Photo Notes Paste Zone */}
                <div className="ia-card p-6 bg-white border border-slate-200 flex flex-col relative">
                  {file && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl"><LockIcon className="text-slate-400 mb-2" size={32} /><span className="font-bold text-slate-500 text-sm">Fichier audio/vidéo déjà sélectionné</span></div>}
                  
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                      <FileText size={20} className="text-amber-500" /> Notes ou Photo de réunion
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Collez vos notes, ou photographiez le tableau blanc / notes manuscrites via OCR.</p>
                  
                  <div className="mb-3">
                    <DocumentUploadCapture 
                      label="Photographier tableau blanc ou notes papier (OCR)"
                      acceptedFormats=".pdf,.jpg,.jpeg,.png,.webp,.txt"
                      onDocumentProcessed={({ text: ocrResult }) => {
                        if (ocrResult) {
                          setText(prev => (prev ? prev + "\n\n" : "") + ocrResult);
                          toast.success("Notes extraites par OCR et ajoutées à la transcription !");
                        }
                      }}
                    />
                  </div>

                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Collez ici les notes de votre réunion ou vérifiez le texte extrait par photo OCR..."
                    className="flex-1 min-h-[160px] w-full p-4 border border-[#D9D9D9] dark:border-slate-700 bg-white dark:bg-slate-900 rounded-[12px] resize-y outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all text-sm font-normal text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Action Bar */}
                <div className="md:col-span-2 flex items-center justify-center pt-4">
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || (!file && !text.trim())}
                    className="ia-btn-primary px-12 py-5 text-lg font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center gap-3"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="animate-spin" size={24} /> Connexion aux experts IA...</>
                    ) : (
                      <><Mic size={24} /> Générer le Compte-Rendu</>
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
                    <CheckCircle2 className="text-emerald-500" size={20} /> Rapport généré et sauvegardé dans l'historique
                  </span>
                  <button onClick={clearUpload} className="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 bg-blue-50 rounded-lg">Analyser un autre fichier</button>
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
                  <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
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
    </div>
  );
}

// Helper icon
function LockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
  );
}
