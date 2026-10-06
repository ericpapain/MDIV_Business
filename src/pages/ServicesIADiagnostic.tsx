import { useState, useEffect, useRef } from "react";
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { EnterpriseAuthBar } from "@/components/site/EnterpriseAuthBar";
import { ArrowLeft, ArrowRight, Check, BarChart3, Brain, Loader2, Upload, FileText, Download, Square, CheckSquare, Wrench, Lightbulb, PlayCircle, Sparkles, Globe, Camera, RefreshCcw, BookmarkPlus, History } from "lucide-react";
import { toast } from "sonner";
import { fetchNextDiagnosticStep, startAgentsDiscussion, uploadDiagnosticDocument, DiagnosticMessage, AgentMessage, DiagnosticFinalReport } from "@/lib/diagnosticService";
import { getApiUrl } from "@/lib/apiConfig";
import { DocumentUploadCapture } from "@/components/ui/DocumentUploadCapture";
import { useGuestQuota } from "@/hooks/useGuestQuota";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import { SaveWorkModal } from "@/components/saved-work/SaveWorkModal";
import { SavedWorkDrawer } from "@/components/saved-work/SavedWorkDrawer";
import { SectionDeepDive } from "@/components/common/SectionDeepDive";

export default function ServicesIADiagnostic() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('diagnostic');

  // Form states
  const [history, setHistory] = useState<DiagnosticMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question: string;
    options: string[];
    total_questions?: number;
    expert_domain?: string;
    expert_insight?: string;
  } | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [stepCount, setStepCount] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5); // Dynamique, mis à jour par l'IA

  // Save / Work History states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedWorkId, setSavedWorkId] = useState<number | undefined>(undefined);

  // Phase management
  const [phase, setPhase] = useState<'form' | 'agents' | 'interrupt' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Agent discussion states
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [finalReport, setFinalReport] = useState<DiagnosticFinalReport | null>(null);
  const [interruptData, setInterruptData] = useState<{agent: string, question: string} | null>(null);
  const [interruptText, setInterruptText] = useState("");
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  useEffect(() => {
    loadNextQuestion([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextQuestion = async (currentHistory: DiagnosticMessage[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNextDiagnosticStep(currentHistory, websiteUrl);
      setCurrentQuestion(response);
      setSelectedOptions([]);
      setOtherText("");
      if (response.total_questions && response.total_questions > 0) {
        setTotalSteps(response.total_questions);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion à l'IA.");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (opt: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(opt)) {
        if (isOtherOption(opt)) {
          setOtherText("");
        }
        return prev.filter(o => o !== opt);
      } else {
        return [...prev, opt];
      }
    });
  };

  const isOtherOption = (opt: string) => {
    const lower = opt.toLowerCase().trim();
    return lower === "autre" || lower === "other" || lower.startsWith("autre") || lower.startsWith("other");
  };

  const hasOtherSelected = selectedOptions.some(isOtherOption);

  const getFormattedAnswerText = () => {
    const answers = selectedOptions.map(opt => {
      if (isOtherOption(opt) && otherText.trim()) {
        return `Autre : ${otherText.trim()}`;
      }
      return opt;
    });

    if (answers.length > 1) {
      return `Choix multiples sélectionnés (${answers.length}) : [${answers.join(" + ")}]`;
    }
    return answers.join(", ");
  };

  const canProceed = selectedOptions.length > 0 && (!hasOtherSelected || otherText.trim().length > 0);

  const buildUpdatedHistory = (): DiagnosticMessage[] => {
    if (!currentQuestion) return history;
    const answerText = getFormattedAnswerText();
    return [
      ...history,
      { role: 'assistant', content: JSON.stringify(currentQuestion) },
      { role: 'user', content: answerText }
    ];
  };

  const handleNextQuestion = () => {
    if (!currentQuestion || !canProceed) return;
    const newHistory = buildUpdatedHistory();
    setHistory(newHistory);
    setStepCount(prev => prev + 1);
    loadNextQuestion(newHistory);
  };

  const handleProceedToAudit = () => {
    if (!currentQuestion) return;
    if (!checkCanExecute()) return;
    
    let finalHistory = history;
    if (selectedOptions.length > 0 && (!hasOtherSelected || otherText.trim().length > 0)) {
      finalHistory = buildUpdatedHistory();
      setHistory(finalHistory);
    }
    
    recordExecution();
    setPhase('agents');
    startAgentPhase(finalHistory);
  };

  const startAgentPhase = (finalHistory: DiagnosticMessage[]) => {
    const contextStr = finalHistory
      .filter(h => h.role === 'user')
      .map((h, i) => `Étape ${i+1}: ${h.content}`)
      .join(" | ");

    startAgentsDiscussion(
      { history: contextStr, website_url: websiteUrl, company_name: customCompanyName || company?.name },
      company?.id,
      (msg) => {
        setAgentMessages(prev => [...prev, msg]);
      },
      (report) => {
        setFinalReport(report);
        setPhase('result');
      },
      (data) => {
        setInterruptData(data);
        setPhase('interrupt');
      },
      (err) => {
        setError(err.message);
      }
    );
  };

  const resetDiagnostic = () => {
    setHistory([]);
    setStepCount(1);
    setTotalSteps(5);
    setWebsiteUrl("");
    setCustomCompanyName("");
    setPhase('form');
    setAgentMessages([]);
    setFinalReport(null);
    setInterruptData(null);
    setSelectedOptions([]);
    setOtherText("");
    loadNextQuestion([]);
  };

  const handleInterruptSubmit = () => {
    if (!interruptText.trim()) return;
    const newHistory = [
      ...history,
      { role: 'assistant', content: interruptData?.question || "" },
      { role: 'user', content: interruptText }
    ] as DiagnosticMessage[];
    
    setHistory(newHistory);
    setInterruptText("");
    setPhase('agents');
    startAgentPhase(newHistory);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const res = await uploadDiagnosticDocument(file);
      if (res.status === 'premium_required') {
         setError(res.message);
      } else {
         const newHistory = [
          ...history,
          { role: 'assistant', content: interruptData?.question || "" },
          { role: 'user', content: "J'ai importé un document contenant ces informations : " + res.extracted_text }
        ] as DiagnosticMessage[];
        
        setHistory(newHistory);
        setPhase('agents');
        startAgentPhase(newHistory);
      }
    } catch(err: any) {
       setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadPDF = () => {
    if (!finalReport) return;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = getApiUrl('diagnostic_pdf.php');
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'report';
    input.value = JSON.stringify(finalReport);
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const getLevel = (score: number) => {
    if (score < 35) return { label: isEn ? "Beginner / Immediate Potential" : "Débutant (Potentiel élevé)", color: "hsl(25 95% 53%)" };
    if (score < 65) return { label: isEn ? "Intermediate / Good Foundation" : "Intermédiaire (Bonnes bases)", color: "hsl(221 83% 53%)" };
    return { label: isEn ? "Advanced / Optimization Stage" : "Avancé (Optimisation & ROI)", color: "hsl(160 84% 39%)" };
  };

  if (phase === 'result' && finalReport) {
    const level = getLevel(finalReport.score);
    return (
      <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm hover:gap-3 transition-all font-semibold" style={{ color: "hsl(221 83% 53%)" }}>
                <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
              </Link>
              <button onClick={resetDiagnostic} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                <RefreshCcw size={16} /> {isEn ? "Restart" : "Recommencer à zéro"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSavedDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <History size={15} className="text-blue-600" />
                Historique
              </button>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <BookmarkPlus size={15} />
                Sauvegarder l'audit
              </button>
            </div>
          </div>

          <div className="ia-card relative overflow-hidden p-8 md:p-12 text-center ia-animate-in bg-white border border-slate-200/80 shadow-xl rounded-3xl">
            <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: "0s" }}>
              <BarChart3 size={192} />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-4 shadow-lg">
                <BarChart3 size={32} />
              </div>

              {company?.name && (
                <div className="text-xs uppercase tracking-widest font-semibold text-blue-600 mb-1">
                  Entreprise : {company.name}
                </div>
              )}

              {websiteUrl && (
                <div className="text-xs text-slate-500 mb-3 flex items-center justify-center gap-1 font-medium">
                  <Globe size={13} className="text-blue-600" /> Site exploré : <span className="underline">{websiteUrl}</span>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                {isEn ? "Your AI Diagnostic Report" : "Rapport de Diagnostic IA"}
              </h1>

              <div className="my-6">
                <div className="text-6xl md:text-7xl font-bold ia-gradient-text mb-2">{finalReport.score} <span className="text-2xl text-slate-400 font-normal">/100</span></div>
                <div className="text-base font-semibold px-4 py-1.5 rounded-full inline-block" style={{ color: level.color, backgroundColor: `${level.color}15` }}>{level.label}</div>
              </div>

              <div className="max-w-md mx-auto mb-8">
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(214 32% 91%)" }}>
                  <div className="h-full rounded-full ia-gradient-hero transition-all duration-1000" style={{ width: `${finalReport.score}%` }} />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-left mb-8 relative z-10">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" /> {isEn ? "Synthesis" : "Synthèse de l'évaluation"}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 font-medium">
                {finalReport.synthesis}
              </p>
              
              {/* Approfondissement de la synthèse */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <SectionDeepDive
                  sectionTitle="Synthèse du Diagnostic IA"
                  sectionContent={finalReport.synthesis}
                  suggestedQuestions={[
                    "Quelles sont les 3 priorités absolues pour notre entreprise ?",
                    "Quel budget estimatif prévoir pour démarrer ces chantiers ?",
                    "Quels sont les gains de productivité attendus à 6 mois ?"
                  ]}
                />
              </div>
            </div>

            {finalReport.deduced_insights && finalReport.deduced_insights.length > 0 && (
              <div className="ia-card p-6 text-left mb-8 bg-blue-50/50 border border-blue-100 relative z-10 rounded-2xl">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800">
                  <Brain size={18} /> {isEn ? "Key Insights" : "Constats & Opportunités Clés"}
                </h3>
                <ul className="space-y-2">
                  {finalReport.deduced_insights.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-blue-900 font-medium">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                {/* Approfondissement des opportunités */}
                <div className="mt-4 pt-3 border-t border-blue-200">
                  <SectionDeepDive
                    sectionTitle="Constats & Opportunités Clés"
                    sectionContent={finalReport.deduced_insights.join("\n")}
                    suggestedQuestions={[
                      "Comment surmonter le premier frein technique identifié ?",
                      "Comment impliquer l'équipe sans résistance au changement ?",
                      "Quelle métrique suivre pour valider ce constat ?"
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Recommandations Pédagogiques et Métier */}
            <div className="text-left mb-8 relative z-10">
              <h3 className="font-bold text-xl mb-4 text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Wrench size={20} className="text-blue-600" /> {isEn ? "Recommended Solutions & Action Plan" : "Recommandations d'Outils & Plan d'Action"}
              </h3>
              <div className="space-y-4">
                {finalReport.recommendations.map((r, i) => (
                  <div key={i} className="ia-card p-6 border-l-4 border-l-blue-600 bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                        <Check size={18} className="shrink-0 text-emerald-600" />
                        <span>{r.tool_name}</span>
                      </div>
                      {r.category && (
                        <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          {r.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Raison / Pourquoi cet outil */}
                    <div className="mb-3 text-sm text-slate-600 leading-relaxed pl-6">
                      <strong className="text-slate-800 block mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Lightbulb size={14} className="text-amber-500" /> Pourquoi cet outil ?
                      </strong>
                      <p>{r.reason}</p>
                    </div>

                    {/* Comment démarrer simplement */}
                    {r.how_to_start && (
                      <div className="pl-6 pt-2 border-t border-slate-100">
                        <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-200/60 leading-relaxed flex items-start gap-2">
                          <PlayCircle size={15} className="text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-blue-900">Comment démarrer simplement : </span>
                            {r.how_to_start}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approfondissement direct sur l'outil */}
                    <div className="pl-6 pt-3 mt-3 border-t border-slate-100">
                      <SectionDeepDive
                        sectionTitle={`Outil Recommandé : ${r.tool_name}`}
                        sectionContent={`Outil: ${r.tool_name}\nCatégorie: ${r.category}\nRaison: ${r.reason}\nDéploiement: ${r.how_to_start}`}
                        suggestedQuestions={[
                          `Combien coûte l'implémentation de ${r.tool_name} ?`,
                          `Quelles sont les alternatives open-source ou françaises ?`,
                          `Donne-moi un tutoriel pas à pas pour configurer ${r.tool_name}.`
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4 border-t border-slate-100">
              <button onClick={downloadPDF} className="ia-btn-primary flex justify-center items-center gap-2 text-sm py-3 px-6 cursor-pointer">
                <Download size={18} /> {isEn ? "Download Complete PDF" : "Télécharger mon rapport PDF"}
              </button>
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="px-6 py-3 rounded-xl border border-blue-600 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookmarkPlus size={18} /> Sauvegarder dans l'historique
              </button>
              <button className="ia-btn-secondary text-sm py-3 px-6 cursor-pointer" onClick={resetDiagnostic}>
                {isEn ? "Retake diagnostic" : "Refaire le diagnostic"}
              </button>
            </div>
          </div>
        </div>

        {/* Modale Sauvegarder */}
        <SaveWorkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          toolType="diagnostic"
          contentPayload={{
            finalReport,
            websiteUrl,
            customCompanyName,
            stepCount,
            totalSteps
          }}
          defaultTitle={`Diagnostic IA - ${customCompanyName || company?.name || 'Entreprise'} (${finalReport.score}/100)`}
          defaultTags={['diagnostic', 'maturité IA', `${finalReport.score}/100`]}
          onSaved={(id) => {
            setSavedWorkId(id);
            toast.success("Diagnostic sauvegardé dans l'historique client/projet avec succès.");
          }}
        />

        {/* Tiroir Historique */}
        <SavedWorkDrawer
          isOpen={isSavedDrawerOpen}
          onClose={() => setIsSavedDrawerOpen(false)}
          filterTool="diagnostic"
          onLoadItem={(item) => {
            if (item.content_payload?.finalReport) {
              setFinalReport(item.content_payload.finalReport);
              setPhase('result');
              setSavedWorkId(item.id);
              toast.success(`Diagnostic "${item.title}" chargé.`);
            }
          }}
        />
      </div>
    );
  }

  if (phase === 'interrupt' && interruptData) {
    return (
      <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="ia-card p-8 md:p-12 ia-animate-in border-[hsl(221,83%,53%)] shadow-[0_0_40px_rgba(37,99,235,0.1)] bg-white rounded-3xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-[hsl(221,83%,53%)] flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                {interruptData.agent} a besoin d'une précision
              </h2>
              <p className="text-lg text-slate-700 bg-slate-50 p-4 rounded-xl mt-4 font-medium italic">
                "{interruptData.question}"
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Votre réponse (optionnel si document) :</label>
                <textarea 
                  value={interruptText}
                  onChange={(e) => setInterruptText(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:border-[hsl(221,83%,53%)] focus:ring-1 focus:ring-[hsl(221,83%,53%)] outline-none min-h-[100px] bg-slate-50/60 text-slate-900"
                  placeholder="Tapez votre réponse ici..."
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-slate-400 uppercase font-semibold">OU</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Importer ou photographier un document (PDF ou Photo OCR) :</label>
                <DocumentUploadCapture 
                  label="Importer un justificatif ou prendre une photo (PDF, Word DOCX, Photo)"
                  acceptedFormats=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.txt"
                  onDocumentProcessed={({ text: extractedDocText, file: uploadedDocFile }) => {
                    const docInfo = extractedDocText 
                      ? "Document transmis (Contenu analysé) : " + extractedDocText 
                      : `Fichier ${uploadedDocFile.name} importé pour précision.`;
                    setInterruptText(prev => (prev ? prev + "\n\n" : "") + docInfo);
                  }}
                />
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleInterruptSubmit} disabled={!interruptText.trim() && !uploading} className="ia-btn-primary py-2.5 px-6 disabled:opacity-50 cursor-pointer">
                  Envoyer et continuer <ArrowRight size={16} className="ml-2 inline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'agents') {
    return (
      <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="ia-card p-8 md:p-12 ia-animate-in bg-white border border-slate-200/80 shadow-xl rounded-3xl">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">
                {isEn ? "AI Experts are analyzing your profile..." : "Nos experts IA analysent votre profil..."}
              </h2>
              <p className="text-slate-500">
                {isEn ? "Listen to their real-time discussion" : "Écoutez leur discussion en temps réel"}
              </p>
            </div>
            
            <div className="space-y-6 min-h-[300px]">
              {agentMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.agent.includes('Strat') ? 'items-start' : (msg.agent.includes('Synthèse') ? 'items-center' : 'items-end')} ia-animate-in`} style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 px-2">{msg.agent}</span>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    msg.agent.includes('Strat') ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 
                    (msg.agent.includes('Synthèse') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-full text-center' : 
                    'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm')
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              
              {!finalReport && !error && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Phase: form
  const progress = (stepCount / totalSteps) * 100;
  const precisionScore = Math.min(98, Math.round(20 + Math.min(stepCount, 10) * 7.8));

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
              <Brain size={16} /> Audit & Stratégie
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              {isEn ? "Dynamic AI Diagnostic" : "Diagnostic IA Dynamique"}
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              {isEn 
                ? "Evaluate your AI maturity. Our AI adapts its questions in real-time based on your answers." 
                : "Évaluez votre maturité IA. Notre intelligence artificielle adapte ses questions en temps réel selon vos réponses."}
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
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Audit</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Questions dynamiques.</p>
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
                      <Brain size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Analyse IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Débat d'experts IA.</p>
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
                      <BarChart3 size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Bilan</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Rapport et priorités.</p>
                </div>

              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <ServiceHeroImage />
          </div>
        </div>

      </div>
      
      <div className="container max-w-3xl mx-auto px-4">

        {/* Champs Optionnels d'entreprise */}
        {stepCount === 1 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50/40 rounded-2xl border border-blue-100 shadow-sm ia-animate-in flex flex-col gap-4">
            
            {!company && (
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Lightbulb size={15} className="text-blue-600" />
                  {isEn ? "Company Name (Optional)" : "Nom de votre entreprise (Optionnel)"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    placeholder={isEn ? "e.g., Tech Solutions Inc." : "ex: Mon Entreprise SAS"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Globe size={15} className="text-blue-600" />
                {isEn ? "Company Website URL (Optional)" : "Site web de votre entreprise (Optionnel)"}
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://votre-entreprise.fr"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                />
              </div>
              <p className="text-xs text-blue-900 mt-2 flex items-center gap-1 font-bold">
                <Sparkles size={13} className="text-blue-600 shrink-0" />
                <span>{isEn ? "Our AI will analyze your site to tailor the diagnostic directly to your services!" : "Nos modèles IA exploreront directement votre site pour personnaliser l'audit à vos services !"}</span>
              </p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center text-xs mb-2 font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Brain size={15} className="text-blue-600" />
              {isEn ? `Expert Evaluation • Question ${stepCount}` : `Audit Expert Dédié • Question ${stepCount}`}
            </span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70 shadow-xs">
              {isEn ? `Diagnostic Precision: ${precisionScore}%` : `Indice de précision de l'audit : ${precisionScore}%`}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200/70">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 transition-all duration-500 shadow-sm" style={{ width: `${precisionScore}%` }} />
          </div>
        </div>

        <div className="ia-card relative overflow-hidden p-8 md:p-10 ia-animate-in bg-white border border-slate-200/80 shadow-xl rounded-3xl">
          <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: "0s" }}>
            <Brain size={192} />
          </div>

          <div className="relative z-10 min-h-[250px] flex flex-col">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
                <button onClick={() => loadNextQuestion(history)} className="ml-2 underline font-semibold">Réessayer</button>
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 py-8">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium">{isEn ? "AI Expert is analyzing and preparing the next deep-dive question..." : "L'expert IA analyse votre situation et formule la question suivante..."}</p>
              </div>
            ) : currentQuestion ? (
              <>
                {currentQuestion.expert_domain && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-3 shadow-xs self-start">
                    <Sparkles size={13} className="text-blue-600 shrink-0" />
                    <span>{currentQuestion.expert_domain}</span>
                  </div>
                )}

                <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {currentQuestion.question}
                </h2>

                {currentQuestion.expert_insight && (
                  <div className="mb-4 p-3.5 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-xl text-xs font-medium text-slate-700 leading-relaxed shadow-xs">
                    <span className="font-bold text-blue-900 block mb-0.5 flex items-center gap-1">
                      <Lightbulb size={13} className="text-blue-600" /> {isEn ? "Expert Domain Insight :" : "Perspective de l'expert :"}
                    </span>
                    {currentQuestion.expert_insight}
                  </div>
                )}

                <p className="text-xs text-blue-600 font-semibold mb-6 flex items-center gap-1.5">
                  <CheckSquare size={14} />
                  {isEn ? "You can select multiple options below" : "Plusieurs réponses possibles — cochez tout ce qui s'applique"}
                </p>

                <div className="space-y-3 flex-1">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = selectedOptions.includes(opt);
                    const isOther = isOtherOption(opt);
                    return (
                      <div key={i}>
                        <button
                          onClick={() => toggleOption(opt)}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3 text-sm font-medium cursor-pointer ${
                            isSelected
                              ? "border-[hsl(221,83%,53%)] bg-[hsl(221,83%,53%,0.05)] text-[hsl(221,83%,53%)] shadow-sm"
                              : "border-[hsl(214,32%,91%)] hover:border-[hsl(221,83%,53%,0.3)] hover:bg-[hsl(221,83%,53%,0.02)] text-slate-700 bg-white"
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare size={20} className="shrink-0" style={{ color: "hsl(221 83% 53%)" }} />
                          ) : (
                            <Square size={20} className="shrink-0 text-slate-300" />
                          )}
                          <span className="flex-1">{opt}</span>
                        </button>
                        
                        {/* Champ de saisie pour "Autre" */}
                        {isOther && isSelected && (
                          <div className="mt-2 ml-9 mr-1 ia-animate-in">
                            <input
                              type="text"
                              value={otherText}
                              onChange={(e) => setOtherText(e.target.value)}
                              placeholder={isEn ? "Please specify your details here..." : "Veuillez préciser votre situation ou besoin ici..."}
                              className="w-full px-4 py-3 border-2 border-[hsl(221,83%,53%,0.4)] rounded-xl text-sm focus:border-[hsl(221,83%,53%)] focus:ring-1 focus:ring-[hsl(221,83%,53%)] outline-none transition-all bg-white text-slate-900"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100">
                  {stepCount >= 3 ? (
                    <button
                      onClick={handleProceedToAudit}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <BarChart3 size={16} className="text-blue-600" />
                      {isEn ? "⚡ Generate Audit Report Now" : "⚡ Clôturer et générer mon audit"}
                    </button>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      {isEn ? "Answer at least 3 questions to unlock instant audit report" : "💡 Répondez à au moins 3 questions pour débloquer le bilan"}
                    </div>
                  )}

                  <button
                    onClick={handleNextQuestion}
                    disabled={!canProceed}
                    className="w-full sm:w-auto ia-btn-primary text-sm py-2.5 px-6 disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center cursor-pointer"
                  >
                    <span>{isEn ? "Continue Expert Questions" : "Approfondir avec l'expert"}</span>
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Modale d'authentification requise */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer des diagnostics IA illimités et sauvegarder vos rapports d'audit."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}
