import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight, Check, BarChart3, Brain, Loader2, Upload, FileText, Download, Square, CheckSquare, Wrench, Lightbulb, PlayCircle, Sparkles, Globe } from "lucide-react";
import { fetchNextDiagnosticStep, startAgentsDiscussion, uploadDiagnosticDocument, DiagnosticMessage, AgentMessage, DiagnosticFinalReport } from "@/lib/diagnosticService";

export default function ServicesIADiagnostic() {
  const { language } = useLanguage();
  const { company } = useAuth();
  const isEn = language === "en";

  // Form states
  const [history, setHistory] = useState<DiagnosticMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{question: string, options: string[], total_questions?: number} | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [stepCount, setStepCount] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5); // Dynamique, mis à jour par l'IA

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

  const handleNextStep = () => {
    if (!currentQuestion || !canProceed) return;

    const answerText = getFormattedAnswerText();

    const newHistory: DiagnosticMessage[] = [
      ...history,
      { role: 'assistant', content: JSON.stringify(currentQuestion) },
      { role: 'user', content: answerText }
    ];

    setHistory(newHistory);

    if (stepCount >= totalSteps) {
      setPhase('agents');
      startAgentPhase(newHistory);
    } else {
      setStepCount(prev => prev + 1);
      loadNextQuestion(newHistory);
    }
  };

  const startAgentPhase = (finalHistory: DiagnosticMessage[]) => {
    const contextStr = finalHistory
      .filter(h => h.role === 'user')
      .map((h, i) => `Étape ${i+1}: ${h.content}`)
      .join(" | ");

    startAgentsDiscussion(
      { history: contextStr, website_url: websiteUrl, company_name: company?.name },
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
    form.action = import.meta.env.PROD ? '/api/diagnostic_pdf.php' : 'http://localhost/mdiv_business/api/diagnostic_pdf.php';
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
      <div className="ia-page min-h-screen pt-32 pb-20">
        <div className="container max-w-4xl mx-auto">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm mb-8 hover:gap-3 transition-all font-semibold" style={{ color: "hsl(221 83% 53%)" }}>
            <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
          </Link>

          <div className="ia-card relative overflow-hidden p-8 md:p-12 text-center ia-animate-in">
            <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: '0s' }}>
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

              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
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
              <p className="text-sm leading-relaxed text-slate-600 font-medium">
                {finalReport.synthesis}
              </p>
            </div>

            {finalReport.deduced_insights && finalReport.deduced_insights.length > 0 && (
              <div className="ia-card p-6 text-left mb-8 bg-blue-50/50 border-blue-100 relative z-10">
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
              </div>
            )}

            {/* Recommandations Pédagogiques et Métier */}
            <div className="text-left mb-8 relative z-10">
              <h3 className="font-bold text-xl mb-4 text-slate-900 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <Wrench size={20} className="text-blue-600" /> {isEn ? "Recommended Solutions & Action Plan" : "Recommandations d'Outils & Plan d'Action"}
              </h3>
              <div className="space-y-4">
                {finalReport.recommendations.map((r, i) => (
                  <div key={i} className="ia-card p-6 border-l-4 border-l-blue-600 bg-white shadow-sm hover:shadow-md transition-shadow">
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
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4 border-t border-slate-100">
              <button onClick={downloadPDF} className="ia-btn-primary flex justify-center items-center gap-2 text-sm py-3 px-6">
                <Download size={18} /> {isEn ? "Download Complete PDF" : "Télécharger mon rapport PDF"}
              </button>
              <button className="ia-btn-secondary text-sm py-3 px-6" onClick={resetDiagnostic}>
                {isEn ? "Retake diagnostic" : "Refaire le diagnostic"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'interrupt' && interruptData) {
    return (
      <div className="ia-page min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto">
          <div className="ia-card p-8 md:p-12 ia-animate-in border-[hsl(221,83%,53%)] shadow-[0_0_40px_rgba(37,99,235,0.1)]">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-[hsl(221,83%,53%)] flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">
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
                <label className="block text-sm font-semibold mb-2">Votre réponse (optionnel si document) :</label>
                <textarea 
                  value={interruptText}
                  onChange={(e) => setInterruptText(e.target.value)}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:border-[hsl(221,83%,53%)] focus:ring-1 focus:ring-[hsl(221,83%,53%)] outline-none min-h-[100px]"
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
                <label className="block text-sm font-semibold mb-2">Importer un document (PDF uniquement) :</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                   {uploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                         <Loader2 className="animate-spin" size={24} />
                         <span>Analyse du document...</span>
                      </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Upload size={32} className="text-slate-300" />
                        <p className="text-sm font-medium">Cliquez pour importer (Max 3 pages)</p>
                        <p className="text-xs text-slate-400">PDF de moins de 2MB</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button onClick={handleInterruptSubmit} disabled={!interruptText.trim() && !uploading} className="ia-btn-primary py-2.5 px-6 disabled:opacity-50">
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
      <div className="ia-page min-h-screen pt-32 pb-20">
        <div className="container max-w-3xl mx-auto">
          <div className="ia-card p-8 md:p-12 ia-animate-in">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full ia-gradient-hero flex items-center justify-center text-foreground mx-auto mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isEn ? "AI Experts are analyzing your profile..." : "Nos experts IA analysent votre profil..."}
              </h2>
              <p className="text-slate-500">
                {isEn ? "Listen to their real-time discussion" : "Écoutez leur discussion en temps réel"}
              </p>
            </div>
            
            <div className="space-y-6 min-h-[300px]">
              {agentMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.agent.includes('Strat') ? 'items-start' : (msg.agent.includes('Synthèse') ? 'items-center' : 'items-end')} ia-animate-in`} style={{ animationDelay: '0.1s' }}>
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

  return (
    <div className="ia-page min-h-screen pt-32 pb-20">
      <div className="container max-w-3xl mx-auto">
        <Link to="/services-ia" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground/80 backdrop-blur-md text-[hsl(221,83%,53%)] font-semibold rounded-full shadow-sm hover:shadow-md border border-slate-200 hover:bg-white hover:-translate-x-1 transition-all mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full ia-badge-freemium mb-4 text-sm font-medium">
            <Brain size={14} /> {isEn ? "Dynamic AI Diagnostic" : "Diagnostic IA Dynamique"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Assess your AI maturity" : "Évaluez votre maturité IA"}
          </h1>
          <p className="text-base" style={{ color: "hsl(215 16% 47%)" }}>
            {isEn ? "Our AI adapts questions in real-time based on your answers." : "Notre IA adapte ses questions en temps réel selon vos réponses."}
          </p>
        </div>

        {/* Champ Optionnel de Site Web d'entreprise */}
        {stepCount === 1 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50/40 rounded-2xl border border-blue-100 shadow-sm ia-animate-in">
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
              <Globe size={15} className="text-blue-600" />
              {isEn ? "Company Website URL (Optional)" : "Site web de votre entreprise (Optionnel)"}
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://votre-entreprise.fr"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
            <p className="text-xs text-blue-700/80 mt-2 flex items-center gap-1 font-medium">
              <Sparkles size={13} className="text-blue-600 shrink-0" />
              <span>{isEn ? "Our AI will analyze your site to tailor the diagnostic directly to your services!" : "Nos modèles IA exploreront directement votre site pour personnaliser l'audit à vos activités réelles !"}</span>
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: "hsl(215 16% 47%)" }}>
            <span>{isEn ? "Question" : "Question"} {stepCount}/{totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(214 32% 91%)" }}>
            <div className="h-full rounded-full ia-gradient-hero transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="ia-card relative overflow-hidden p-8 md:p-10 ia-animate-in">
          <div className="ia-watermark-anim absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] pointer-events-none flex items-center justify-center text-slate-800" style={{ animationDelay: '0.2s' }}>
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
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm">{isEn ? "AI is generating the next question..." : "L'IA génère la prochaine question..."}</p>
              </div>
            ) : currentQuestion ? (
              <>
                <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {currentQuestion.question}
                </h2>
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
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3 text-sm font-medium ${
                            isSelected
                              ? "border-[hsl(221,83%,53%)] bg-[hsl(221,83%,53%,0.05)] text-[hsl(221,83%,53%)] shadow-sm"
                              : "border-[hsl(214,32%,91%)] hover:border-[hsl(221,83%,53%,0.3)] hover:bg-[hsl(221,83%,53%,0.02)] text-slate-700"
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
                              className="w-full px-4 py-3 border-2 border-[hsl(221,83%,53%,0.4)] rounded-xl text-sm focus:border-[hsl(221,83%,53%)] focus:ring-1 focus:ring-[hsl(221,83%,53%)] outline-none transition-all shadow-sm"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleNextStep}
                    disabled={!canProceed}
                    className="ia-btn-primary text-sm py-2.5 px-6 disabled:opacity-30 disabled:cursor-not-allowed group"
                  >
                    {isEn ? (stepCount === totalSteps ? "Analyze Profile" : "Next") : (stepCount === totalSteps ? "Analyser mon profil" : "Suivant")} 
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
}
