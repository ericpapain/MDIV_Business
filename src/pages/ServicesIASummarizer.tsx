import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, FileText, Upload, Brain, Loader2, PlayCircle, Settings2, FileArchive, CheckCircle2, Sparkles, RefreshCcw, Save, History
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
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar, VersionItem } from '@/components/common/VersionSelectorBar';
import { SavedWorkItem } from '@/lib/savedWorkService';

export default function ServicesIASummarizer() {
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
  } = useGuestQuota('summarizer');

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

  // Versions State
  const [versions, setVersions] = useState<VersionItem<DocumentSummaryReport>[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);

  // Universal Save & History Drawer State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  const resetUpload = () => {
    setFile(null);
    setExtractedText('');
    setPhase('upload');
    setAgentMessages([]);
    setCurrentReport(null);
    setError(null);
  };

  const handleStartAnalysis = async (isNewVersion = false) => {
    if (!file && !extractedText) {
      toast.error("Veuillez importer un document ou prendre une photo.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploadFile = file || new File([extractedText], "photo_document.txt", { type: "text/plain" });
      const textToUse = isNewVersion ? `${extractedText}\n\n[CONSIGNE VARIATION] : Reformule les points de synthèse sous un angle alternatif.` : extractedText;
      const uploadRes = await uploadDocumentForSummary(uploadFile, mode, textToUse);
      
      setPhase('agents');
      setAgentMessages([]);
      setIsUploading(false);
      
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

          const newVerNum = versions.length + 1;
          const newVer: VersionItem<DocumentSummaryReport> = {
            id: 'ver_' + Date.now(),
            versionNumber: newVerNum,
            label: `Synthèse V${newVerNum}`,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            data: report,
          };
          const updated = [...versions, newVer];
          setVersions(updated);
          setActiveVersionIndex(updated.length - 1);

          recordExecution();
          toast.success(isNewVersion ? `Nouvelle variante V${newVerNum} générée !` : "Résumé généré avec succès !");
        },
        (err) => {
          setError(err.message);
        }
      );

    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi du document.");
      setIsUploading(false);
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
      if (p.documentName && p.executiveSummary) {
        setCurrentReport(p);
        setPhase('result');
        toast.success(`Synthèse « ${item.title} » restaurée !`);
      }
    } catch {
      toast.error("Format de travail invalide.");
    }
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Barre d'Authentification / Entreprise */}
        <EnterpriseAuthBar 
          appName="Synthèse & Analyse Documentaire IA"
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
            <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
              <FileText size={16} /> Gestion Documentaire & Connaissances
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Synthèse de Documents IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Résumez et analysez instantanément vos contrats, rapports, PDF volumineux ou scans en fiches exécutives prêtes à l'emploi.
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
                      <Upload size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Document</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">PDF, Word, Scan ou Photo.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Brain size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Mode & IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Express, Standard, Comex...</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-indigo-500 bg-indigo-50/80 h-8 w-8 rounded-full border border-indigo-100/50 shadow-[0_0_10px_rgba(99,102,241,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Synthèse</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Fiche exécutive & export.</p>
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

        {/* Versions Bar if available */}
        {versions.length > 0 && phase === 'result' && (
          <div className="mb-6">
            <VersionSelectorBar
              versions={versions}
              activeVersionIndex={activeVersionIndex}
              onSelectVersion={handleSwitchVersion}
              onGenerateNewVersion={() => handleStartAnalysis(true)}
              isGeneratingNewVersion={isUploading}
            />
          </div>
        )}

        {/* Phase 1: Upload & Configuration */}
        {phase === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-8 ia-animate-in">
            {/* Boîte d'import multi-sources */}
            <div className="ia-card p-6 md:p-8 bg-white border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileArchive className="text-blue-600" size={20} />
                1. Importez votre document (PDF, Word, Scan, Image)
              </h3>
              <p className="text-xs font-semibold text-slate-700 mb-6">
                Glissez votre fichier ou utilisez la caméra de votre smartphone / webcam pour capturer des pages physiques.
              </p>

              <DocumentUploadCapture 
                label="Importer ou photographier le document"
                acceptedFormats=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                onDocumentProcessed={({ file: processedFile, text: ocrText, filename }) => {
                  if (processedFile) setFile(processedFile);
                  if (ocrText) setExtractedText(ocrText);
                  toast.success(`Document « ${filename || 'Document'} » chargé avec succès !`);
                }}
              />
            </div>

            {/* Sélecteur de format de résumé */}
            <div className="ia-card p-6 md:p-8 bg-white border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Settings2 className="text-blue-600" size={20} />
                2. Choisissez le Format du Résumé
              </h3>
              <p className="text-xs font-semibold text-slate-700 mb-6">
                L'IA adaptera sa profondeur d'analyse, sa concision et ses indicateurs en fonction de votre objectif.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'express',
                    title: '⚡ Express',
                    subtitle: '≤ 10 lignes',
                    desc: 'Idéal pour une lecture en 30s. Supprime tout détail secondaire et conserve uniquement les 2-3 urgences vitales.'
                  },
                  {
                    id: 'standard',
                    title: '📄 Standard',
                    subtitle: '~ 1 page',
                    desc: "Équilibre parfait entre clarté, points clés, risques et plan d'action opérationnel."
                  },
                  {
                    id: 'detailed',
                    title: '📑 Détaillé',
                    subtitle: 'Dossier exhaustif',
                    desc: 'Extraction intégrale de toutes les clauses, données chiffrées, pourcentages, dates et responsabilités.'
                  },
                  {
                    id: 'direction',
                    title: '🎯 Direction',
                    subtitle: 'Arbitrage & ROI',
                    desc: 'Orienté prise de décision managériale, leviers de rentabilité, opportunités business et priorités.'
                  },
                  {
                    id: 'comex',
                    title: '🏛️ Comex',
                    subtitle: '< 2 minutes',
                    desc: 'Briefing exécutif de haute gouvernance pour Comité de Direction et Conseil d\'Administration.'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id as SummaryMode)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      mode === item.id 
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => handleStartAnalysis(false)}
                disabled={isUploading || (!file && !extractedText)}
                className="ia-btn-primary px-8 py-4 text-base font-bold shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Préparation du document...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Lancer la Synthèse IA Multi-Agents
                    {!isAuthenticated && (
                      <span className="ml-1 text-xs px-2.5 py-1 rounded-full bg-white/20 font-normal">
                        {remainingTrials > 0 ? `⚡ ${remainingTrials}/3 essai${remainingTrials > 1 ? 's' : ''}` : '⚡ 0/3'}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Live Multi-Agent Processing */}
        {phase === 'agents' && (
          <div className="ia-card p-8 md:p-12 ia-animate-in max-w-3xl mx-auto bg-white border border-slate-200">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                Nos experts IA analysent votre document...
              </h2>
              <p className="text-slate-500 text-sm">
                Mode sélectionné : <strong className="text-blue-600 uppercase">{mode}</strong>
              </p>
            </div>
            
            <div className="space-y-6 min-h-[250px]">
              {agentMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'} ia-animate-in`} style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">{msg.agent}</span>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    i % 2 === 0 ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              
              {!currentReport && !error && (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-blue-600" size={28} />
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm flex flex-col items-center gap-3">
                  <span>{error}</span>
                  <button onClick={resetUpload} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-colors">Retour</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Result View */}
        {phase === 'result' && currentReport && (
          <div className="space-y-6 ia-animate-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={20} /> Synthèse générée avec succès
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartAnalysis(true)}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
                  Proposer une autre version
                </button>
                <button 
                  onClick={resetUpload} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3.5 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  Analyser un autre document
                </button>
              </div>
            </div>

            <DocumentSummaryView report={currentReport} />
          </div>
        )}

      </div>

      {/* Universal Save Modal */}
      {currentReport && (
        <SaveWorkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          toolType="summarizer"
          defaultTitle={`Synthèse : ${currentReport.documentName}`}
          contentPayload={currentReport}
          summary={`Synthèse en mode ${currentReport.mode.toUpperCase()} du document ${currentReport.documentName}. Score lisibilité : ${currentReport.kpis?.readabilityScore || 90}/100.`}
          currentVersion={activeVersionIndex + 1}
        />
      )}

      {/* Universal Saved Work Drawer */}
      <SavedWorkDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        toolType="summarizer"
        onSelectWork={handleLoadSavedWork}
      />

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          handleStartAnalysis();
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour résumer tous vos documents et contrats en illimité."
      />
    </div>
  );
}
