import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, FileText, Upload, Brain, Loader2, PlayCircle, Settings2, FileArchive, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  uploadDocumentForSummary, 
  startSummarizerAgentsAnalysis, 
  SummaryMode,
  SummarizerAgentMessage,
  DocumentSummaryReport
} from '@/lib/summarizerService';
import { DocumentUploadCapture } from '@/components/ui/DocumentUploadCapture';
import { DocumentSummaryView } from '@/components/summarizer/DocumentSummaryView';

export default function ServicesIASummarizer() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  // State
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [mode, setMode] = useState<SummaryMode>('standard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phases: upload -> agents -> result
  const [phase, setPhase] = useState<'upload' | 'agents' | 'result'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [agentMessages, setAgentMessages] = useState<SummarizerAgentMessage[]>([]);
  const [currentReport, setCurrentReport] = useState<DocumentSummaryReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetUpload = () => {
    setFile(null);
    setExtractedText('');
    setPhase('upload');
    setAgentMessages([]);
    setCurrentReport(null);
    setError(null);
  };

  const handleStartAnalysis = async () => {
    if (!file && !extractedText) {
      toast.error("Veuillez importer un document ou prendre une photo.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      // 1. Upload initial au backend avec texte OCR si disponible
      const uploadFile = file || new File([extractedText], "photo_document.txt", { type: "text/plain" });
      const uploadRes = await uploadDocumentForSummary(uploadFile, mode, extractedText);
      
      // 2. Bascule sur l'UI Agents
      setPhase('agents');
      setAgentMessages([]);
      setIsUploading(false);
      
      // 3. Lancement du flux SSE (Server-Sent Events)
      startSummarizerAgentsAnalysis(
        uploadRes.id,
        mode,
        company?.id,
        (msg) => {
          setAgentMessages(prev => [...prev, msg]);
        },
        (report) => {
          setCurrentReport(report);
          setPhase('result');
          toast.success("Résumé généré avec succès !");
        },
        (err) => {
          setError(err.message);
        }
      );

    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du document.");
      setIsUploading(false);
    }
  };

  const modes: { id: SummaryMode, label: string, desc: string }[] = [
    { id: 'express', label: "Express", desc: "10 lignes max pour cerner l'essentiel." },
    { id: 'standard', label: "Standard", desc: "Résumé équilibré d'une page." },
    { id: 'detailed', label: "Détaillé", desc: "Extraction complète des informations." },
    { id: 'direction', label: "Direction", desc: "Orienté décisions et plan d'action." },
    { id: 'comex', label: "Comex", desc: "Synthèse stratégique ultra-condensée." },
  ];

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <EnterpriseAuthBar className="mb-8" />
        
        <div className="mb-10">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
            <ArrowLeft size={16} /> Retour aux Services IA
          </Link>
          <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
            <FileArchive size={16} /> Automatisation Documentaire
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Résumeur de Documents IA
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl">
            Analysez instantanément vos contrats, audits et cahiers des charges. 
            Nos agents IA extraient les risques, objectifs et synthétisent l'essentiel selon le niveau de lecture désiré.
          </p>
        </div>

        {/* Phase 1 : Upload */}
        {phase === 'upload' && (
          <div className="grid md:grid-cols-5 gap-8 ia-animate-in">
            {/* Zone de Drop et Capture Photo OCR (3 colonnes) */}
            <div className="md:col-span-3 ia-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-900">
                  <FileText size={20} className="text-amber-500" /> Importer ou Photographier le document
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  PDF, DOCX, TXT ou photo instantanée via votre smartphone/webcam avec extraction OCR temps réel.
                </p>
              </div>

              <DocumentUploadCapture 
                label="Déposez votre document, contrat ou rapport ici"
                acceptedFormats=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png,.webp"
                onDocumentProcessed={({ file: processedFile, text }) => {
                  setFile(processedFile);
                  setExtractedText(text);
                  toast.success(`Fichier ${processedFile.name} prêt pour l'analyse.`);
                }}
              />
            </div>

            {/* Sidebar Configuration (2 colonnes) */}
            <div className="md:col-span-2 space-y-6">
              <div className="ia-card p-6 bg-white border border-slate-200">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings2 size={18} className="text-slate-700" /> Format du résumé
                </h2>
                <div className="space-y-3">
                  {modes.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        mode === m.id 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${mode === m.id ? 'text-blue-900' : 'text-slate-800'}`}>{m.label}</span>
                        {mode === m.id && <CheckCircle2 size={16} className="text-blue-500" />}
                      </div>
                      <p className={`text-xs ${mode === m.id ? 'text-blue-700/80' : 'text-slate-500'}`}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleStartAnalysis} 
                disabled={!file || isUploading}
                className="w-full ia-btn-primary py-5 text-lg font-bold shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3 transition-transform active:scale-95"
              >
                {isUploading ? (
                  <><Loader2 className="animate-spin" size={24} /> Préparation du fichier...</>
                ) : (
                  <><PlayCircle size={24} /> Lancer la synthèse IA</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Phase 2 : Agents IA en temps réel */}
        {phase === 'agents' && (
          <div className="ia-card p-8 md:p-12 ia-animate-in max-w-4xl mx-auto shadow-xl">
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-6 animate-pulse shadow-lg">
                <Brain size={36} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                {isEn ? "AI Experts are reading your document..." : "Nos agents IA étudient votre document..."}
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                Extraction des connaissances et préparation du format de synthèse...
              </p>
            </div>
            
            <div className="space-y-6 min-h-[400px] bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              {agentMessages.map((msg, i) => {
                // Détermination basique du rôle pour l'alignement visuel
                const isAnalyste = msg.agent.toLowerCase().includes('analyste');
                const isSynthese = msg.agent.toLowerCase().includes('synthèse');
                
                return (
                  <div key={i} className={`flex flex-col ${isSynthese ? 'items-center' : (isAnalyste ? 'items-start' : 'items-end')} ia-animate-in`} style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">{msg.agent}</span>
                    <div className={`p-5 rounded-2xl max-w-[85%] text-sm md:text-base leading-relaxed shadow-sm font-medium ${
                      isSynthese ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-full text-center' : 
                      (isAnalyste ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200' : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm')
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              
              {!currentReport && !error && (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-300" size={32} />
                </div>
              )}
              
              {error && (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-center flex flex-col items-center gap-4 border border-red-100">
                  <span className="font-bold text-lg">{error}</span>
                  <button onClick={resetUpload} className="px-6 py-3 bg-white hover:bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold transition-colors shadow-sm">
                    Annuler l'analyse
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 : Résultat */}
        {phase === 'result' && currentReport && (
          <div className="space-y-6 ia-animate-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={24} /> Synthèse document générée
              </span>
              <button onClick={resetUpload} className="text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors">
                Analyser un autre fichier
              </button>
            </div>
            
            <DocumentSummaryView report={currentReport} />
          </div>
        )}

      </div>
    </div>
  );
}
