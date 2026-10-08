import { useState, useEffect } from "react";
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { EnterpriseAuthBar } from "@/components/site/EnterpriseAuthBar";
import { ArrowLeft, ArrowRight, Brain, Loader2, CheckCircle2, ChevronRight, BarChart3, Lock, ShieldAlert, Sparkles, Zap, Map, FileText, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  BENCHMARK_PILLARS,
  PillarId,
  calculatePillarScore,
  calculateGlobalScore,
  calculateAIReadiness,
  generateSWOTFromScores,
  generateRoadmapFromScores
} from "@/lib/benchmarkConfig";
import { fetchSectorBenchmark, submitBenchmarkResults, SectorBenchmarkData, LeadGenData } from "@/lib/benchmarkService";
import { useGuestQuota } from "@/hooks/useGuestQuota";
import { AuthRequiredModal } from "@/components/auth/AuthRequiredModal";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { hasFeatureAccess } from '@/lib/planLimitsService';

export default function ServicesIABenchmark() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const { allowed: canUseBenchmarkRoi } = hasFeatureAccess('benchmark_roi');

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('benchmark');

  // Phases: 'welcome' | 'profile' | 'questionnaire' | 'leadgen' | 'results'
  const [phase, setPhase] = useState<'welcome' | 'profile' | 'questionnaire' | 'leadgen' | 'results'>('welcome');
  
  // Profile / Lead Gen state
  const [leadData, setLeadData] = useState<LeadGenData>({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    sector: 'Technologie / IT', country: 'France', employees: '1-10', revenue: 'Non communiqué', sitesCount: '1'
  });

  // Questionnaire state
  const [currentPillarIndex, setCurrentPillarIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Loading & Results state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<PillarId, number>>({
    strategy: 0, process: 0, data: 0, infra: 0, ai: 0, culture: 0
  });
  const [globalScore, setGlobalScore] = useState(0);
  const [aiReadiness, setAiReadiness] = useState(0);
  const [benchmarkData, setBenchmarkData] = useState<SectorBenchmarkData | null>(null);

  // Derivations
  const currentPillar = BENCHMARK_PILLARS[currentPillarIndex];
  
  // Handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('questionnaire');
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextPillar = () => {
    // Vérifier que toutes les questions du pilier actuel ont été répondues
    const allAnswered = currentPillar.questions.every(q => answers[q.id] !== undefined);
    if (!allAnswered) {
      toast.error(isEn ? "Please answer all questions before proceeding." : "Veuillez répondre à toutes les questions.");
      return;
    }

    if (currentPillarIndex < BENCHMARK_PILLARS.length - 1) {
      setCurrentPillarIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPhase('leadgen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLeadGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkCanExecute()) return;

    setIsSubmitting(true);

    try {
      // 1. Calcul des scores locaux (ZÉRO MOCK)
      const calculatedScores: Record<PillarId, number> = {
        strategy: calculatePillarScore('strategy', answers),
        process: calculatePillarScore('process', answers),
        data: calculatePillarScore('data', answers),
        infra: calculatePillarScore('infra', answers),
        ai: calculatePillarScore('ai', answers),
        culture: calculatePillarScore('culture', answers),
      };
      
      const gScore = calculateGlobalScore(calculatedScores);
      const aiScore = calculateAIReadiness(calculatedScores);
      
      setScores(calculatedScores);
      setGlobalScore(gScore);
      setAiReadiness(aiScore);

      // 2. Fetch du vrai benchmark sectoriel (ZÉRO MOCK)
      const bData = await fetchSectorBenchmark(leadData.sector, leadData.country);
      setBenchmarkData(bData);

      // 3. Soumission API pour sauvegarde du lead et des résultats
      await submitBenchmarkResults(leadData, calculatedScores, gScore, aiScore).catch(err => {
         console.warn("Could not save to backend, but continuing to display results:", err);
      });

      recordExecution();
      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderers
  const renderWelcome = () => (
    <div className="ia-animate-in">
      {/* Header avec Vidéo et Étapes */}
      <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
        <div className="pt-2 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 font-semibold transition-colors">
              <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
            </Link>
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
              <RefreshCcw size={16} /> {isEn ? "Refresh & Restart" : "Actualiser et recommencer"}
            </button>
          </div>
          <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            <BarChart3 size={16} /> Édition Premium - {new Date().getFullYear()}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            {isEn ? "Digital & AI Maturity Benchmark" : "Benchmark de Maturité Digitale & IA"}
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
            {isEn 
              ? "Evaluate your organization across 6 strategic pillars. Compare your performance against real market data and get a customized transformation roadmap." 
              : "Évaluez votre organisation sur 6 piliers stratégiques. Comparez-vous aux données réelles de votre secteur et obtenez une feuille de route sur-mesure."}
          </p>

          {/* Séparateur créatif */}
          <div className="flex items-center gap-4 mb-8 max-w-lg">
            <div className="h-px bg-gradient-to-r from-emerald-300 via-teal-300 to-transparent flex-1"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
            <div className="w-1 h-1 rounded-full bg-emerald-400 opacity-50"></div>
          </div>

          {/* Comment ça marche : Visuel à étapes détaillées */}
          <div className="max-w-2xl">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8">
              
              {/* Étape 1 */}
              <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">1. Diagnostic</span>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-11">Questionnaire à 360°.</p>
              </div>

              {/* Flèche de liaison */}
              <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-emerald-500 bg-emerald-50/80 h-8 w-8 rounded-full border border-emerald-100/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-emerald-200 to-teal-200 ml-8 sm:hidden"></div>

              {/* Étape 2 */}
              <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all group relative flex-1">
                <div className="absolute -top-1.5 -right-1.5">
                  <span className="flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 shadow-sm"></span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                    <BarChart3 size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">2. Analyse IA</span>
                </div>
                <p className="text-xs text-slate-500 font-medium pl-11">Comparatif secteur.</p>
              </div>

              {/* Flèche de liaison */}
              <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-teal-500 bg-teal-50/80 h-8 w-8 rounded-full border border-teal-100/50 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-teal-200 to-slate-800 ml-8 sm:hidden"></div>

              {/* Étape 3 */}
              <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Map size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">3. Roadmap</span>
                </div>
                <p className="text-xs text-white font-medium pl-11">Plan d'action complet.</p>
              </div>

            </div>

            <button onClick={() => setPhase('profile')} className="ia-btn-primary px-8 py-3 text-base font-bold shadow-lg shadow-emerald-500/30">
              {isEn ? "Start the Assessment" : "Démarrer l'Évaluation"} <ArrowRight className="ml-2 inline" size={18} />
            </button>
          </div>
        </div>

        {/* Bloc Vidéo */}
        <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
          <ServiceHeroImage />
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="ia-card p-8 md:p-12 max-w-2xl mx-auto ia-animate-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil de l'entreprise</h2>
        <p className="text-slate-500">Ces informations nous permettent d'affiner le benchmark sectoriel.</p>
      </div>
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Secteur d'activité</label>
            <select 
              value={leadData.sector} 
              onChange={e => setLeadData({...leadData, sector: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-slate-900"
              required
            >
              <option value="Technologie / IT">Technologie / IT</option>
              <option value="Finance & Assurance">Finance & Assurance</option>
              <option value="Santé">Santé</option>
              <option value="Industrie & Production">Industrie & Production</option>
              <option value="Commerce & Retail">Commerce & Retail</option>
              <option value="Services Publics">Services Publics</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Pays principal</label>
            <select 
              value={leadData.country} 
              onChange={e => setLeadData({...leadData, country: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-slate-900"
              required
            >
              <option value="France">France</option>
              <option value="Suisse">Suisse</option>
              <option value="Belgique">Belgique</option>
              <option value="Canada">Canada</option>
              <option value="Maroc">Maroc</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Taille de l'entreprise</label>
            <select 
              value={leadData.employees} 
              onChange={e => setLeadData({...leadData, employees: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-slate-900"
              required
            >
              <option value="1-10">1 à 10 collaborateurs</option>
              <option value="11-50">11 à 50 collaborateurs</option>
              <option value="51-250">51 à 250 collaborateurs</option>
              <option value="251-1000">251 à 1000 collaborateurs</option>
              <option value="1000+">+1000 collaborateurs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Chiffre d'affaires</label>
            <select 
              value={leadData.revenue} 
              onChange={e => setLeadData({...leadData, revenue: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-bold text-slate-900"
              required
            >
              <option value="Non communiqué">Non communiqué</option>
              <option value="< 1M€">&lt; 1 Million €</option>
              <option value="1M€ - 10M€">1M€ - 10M€</option>
              <option value="10M€ - 50M€">10M€ - 50M€</option>
              <option value="> 50M€">&gt; 50M€</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button type="submit" className="ia-btn-primary px-8 py-3">
            Continuer <ArrowRight className="ml-2 inline" size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderQuestionnaire = () => {
    const progress = ((currentPillarIndex) / BENCHMARK_PILLARS.length) * 100;

    return (
      <div className="max-w-4xl mx-auto ia-animate-in">
        {/* Header de Progression */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Pilier {currentPillarIndex + 1} / {BENCHMARK_PILLARS.length}</div>
              <h2 className="text-2xl font-bold text-slate-900">{currentPillar.name}</h2>
            </div>
            <div className="text-sm font-semibold text-slate-400">{Math.round(progress)}% complété</div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full ia-gradient-hero transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium">{currentPillar.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentPillar.questions.map((q, idx) => (
            <div key={q.id} className="ia-card p-6 bg-white border border-slate-200 hover:border-blue-200 transition-colors">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">{idx + 1}</span>
                <span className="mt-0.5">{q.text}</span>
              </h3>
              
              <div className="grid grid-cols-5 gap-2 px-9">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(q.id, val)}
                    className={`py-3 text-sm font-bold rounded-xl transition-all border-2 ${
                      answers[q.id] === val 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between px-9 mt-2 text-xs font-medium text-slate-400">
                <span>Non existant</span>
                <span>Excellent niveau</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-10">
          <button 
            onClick={() => setCurrentPillarIndex(prev => Math.max(0, prev - 1))}
            disabled={currentPillarIndex === 0}
            className="ia-btn-secondary px-6 py-3 disabled:opacity-0 transition-opacity"
          >
            <ArrowLeft className="mr-2 inline" size={18} /> Précédent
          </button>
          
          <button 
            onClick={handleNextPillar}
            className="ia-btn-primary px-8 py-3 group"
          >
            {currentPillarIndex === BENCHMARK_PILLARS.length - 1 ? 'Voir mes résultats' : 'Pilier suivant'} 
            <ArrowRight className="ml-2 inline group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderLeadGen = () => (
    <div className="max-w-md mx-auto mt-10">
      <div className="ia-card p-10 ia-animate-in relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-2 ia-gradient-hero"></div>
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Générer le rapport complet</h2>
          <p className="text-slate-500 text-sm">
            Vos résultats ont été calculés. Saisissez vos coordonnées pour débloquer immédiatement votre score de maturité, votre benchmark sectoriel et votre SWOT.
          </p>
        </div>

        <form onSubmit={handleLeadGenSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Prénom</label>
              <input required type="text" value={leadData.firstName} onChange={e=>setLeadData({...leadData, firstName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Nom</label>
              <input required type="text" value={leadData.lastName} onChange={e=>setLeadData({...leadData, lastName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Entreprise</label>
            <input required type="text" value={leadData.companyName} onChange={e=>setLeadData({...leadData, companyName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email professionnel</label>
            <input required type="email" value={leadData.email} onChange={e=>setLeadData({...leadData, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Téléphone</label>
            <input required type="tel" value={leadData.phone} onChange={e=>setLeadData({...leadData, phone: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-colors" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full ia-btn-primary py-4 font-bold shadow-lg flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={18} /> Déverrouiller mes résultats</>}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium">Vos données sont sécurisées et strictement confidentielles.</p>
        </form>
      </div>
    </div>
  );

  const renderResults = () => {
    // Calcul SWOT & Roadmap
    const swot = generateSWOTFromScores(scores);
    const roadmap = generateRoadmapFromScores(scores);

    // Data for Radar
    const radarData = [
      { subject: 'Stratégie', score: scores.strategy, fullMark: 100 },
      { subject: 'Processus', score: scores.process, fullMark: 100 },
      { subject: 'Data', score: scores.data, fullMark: 100 },
      { subject: 'Infra', score: scores.infra, fullMark: 100 },
      { subject: 'IA', score: scores.ai, fullMark: 100 },
      { subject: 'Culture', score: scores.culture, fullMark: 100 },
    ];

    const getLevelText = (score: number) => {
      if (score < 21) return "Débutant";
      if (score < 41) return "En progression";
      if (score < 61) return "Intermédiaire";
      if (score < 81) return "Avancé";
      return "Leader Digital";
    };

    const getLevelColor = (score: number) => {
      if (score < 41) return "text-amber-600 bg-amber-50 border-amber-200";
      if (score < 81) return "text-blue-600 bg-blue-50 border-blue-200";
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    };

    return (
      <div className="max-w-7xl mx-auto ia-animate-in space-y-8">
        
        {/* HEADER EXECUTIVE */}
        <div className="ia-card p-8 md:p-10 bg-white text-slate-900 border border-slate-200 relative overflow-hidden rounded-3xl shadow-sm">
           <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(37,99,235,0.08) 0%, transparent 60%)' }}></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                 <div className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Executive Summary
                 </div>
                 <h1 className="text-3xl md:text-4xl font-black text-slate-950 mb-4">{leadData.companyName}</h1>
                 <div className="flex flex-wrap gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-sm border border-slate-200">Secteur: {leadData.sector}</span>
                    <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-sm border border-slate-200">{leadData.employees} collab.</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 text-center w-full sm:w-auto">
                 <div className="bg-[#F8F7F4] p-4 sm:p-6 rounded-2xl border border-slate-200 min-w-0 sm:min-w-[160px] shadow-sm flex-1">
                    <div className="text-slate-950 text-xs font-black uppercase tracking-wider mb-2">Score Digital</div>
                    <div className="text-4xl sm:text-5xl font-black text-slate-950">{globalScore}</div>
                    <div className="text-xs sm:text-sm mt-2 font-bold text-emerald-700">{getLevelText(globalScore)}</div>
                 </div>
                 <div className="bg-blue-50/70 p-4 sm:p-6 rounded-2xl border border-blue-200 min-w-0 sm:min-w-[160px] shadow-sm flex-1">
                    <div className="text-slate-950 text-xs font-black uppercase tracking-wider mb-2">AI Readiness</div>
                    <div className="text-4xl sm:text-5xl font-black text-blue-700">{aiReadiness}</div>
                    <div className="text-xs sm:text-sm mt-2 font-black text-slate-950">Prêt pour l'IA</div>
                 </div>
              </div>
           </div>
        </div>

        {/* GRAPHIQUES */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="ia-card p-8 bg-white border border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" /> Profil de Maturité (6 Piliers)
             </h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                   <PolarGrid stroke="#e2e8f0" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar name="Votre entreprise" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="#3b82f6" fillOpacity={0.2} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="ia-card p-8 bg-white border border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Map size={20} className="text-amber-600" /> Benchmark Sectoriel
             </h3>
             
             {benchmarkData ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Moyenne Marché', score: benchmarkData.global_avg },
                      { name: 'Votre Score', score: globalScore },
                      { name: 'Top 10%', score: benchmarkData.global_top10 },
                    ]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {
                          [benchmarkData.global_avg, globalScore, benchmarkData.global_top10].map((entry, index) => (
                            <cell key={`cell-${index}`} fill={index === 1 ? '#2563eb' : (index === 2 ? '#10b981' : '#cbd5e1')} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center p-8">
                   <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-4"><ShieldAlert size={24}/></div>
                   <p className="text-slate-500 font-medium">Les données benchmark pour ce secteur ne sont pas encore disponibles.</p>
                   <p className="text-xs text-slate-400 mt-2">Nous affinons nos modèles pour le secteur <strong>{leadData.sector}</strong>.</p>
                </div>
             )}
          </div>
        </div>

        {/* SWOT AUTOMATIQUE (DETERMINISTE, ZERO MOCK) */}
        <div className="ia-card p-8 bg-white border border-slate-200">
           <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Zap size={22} className="text-emerald-600" /> Analyse SWOT & Opportunités IA
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                 <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><CheckCircle2 size={16}/> Forces détectées</h4>
                 <ul className="space-y-3">
                    {swot.forces.length > 0 ? swot.forces.map((f, i) => <li key={i} className="text-sm font-medium text-emerald-900 flex gap-2"><span className="text-emerald-500">•</span> {f}</li>) : <li className="text-sm text-slate-500 italic">Aucune force majeure identifiée.</li>}
                 </ul>
              </div>
              <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100">
                 <h4 className="font-bold text-red-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><ShieldAlert size={16}/> Faiblesses & Risques</h4>
                 <ul className="space-y-3">
                    {[...swot.faiblesses, ...swot.risques].length > 0 ? [...swot.faiblesses, ...swot.risques].map((f, i) => <li key={i} className="text-sm font-medium text-red-900 flex gap-2"><span className="text-red-500">•</span> {f}</li>) : <li className="text-sm text-slate-500 italic">Aucune faiblesse majeure identifiée.</li>}
                 </ul>
              </div>
           </div>
           
           <div className="mt-6 p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
               <h4 className="font-bold text-blue-900 mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><Sparkles size={16}/> Opportunités & Priorités IA</h4>
               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                    <strong className="block text-xs text-blue-700 mb-2 uppercase">Opportunités</strong>
                    <ul className="space-y-2">
                      {swot.opportunites.length > 0 ? swot.opportunites.map((o, i) => <li key={i} className="text-sm font-medium text-blue-900 flex gap-2"><span className="text-blue-500">•</span> {o}</li>) : <li className="text-sm text-slate-500">Explorer les cas d'usage IA standards.</li>}
                    </ul>
                 </div>
                 <div>
                    <strong className="block text-xs text-blue-700 mb-2 uppercase">Actions Prioritaires</strong>
                    <ul className="space-y-2">
                      {swot.priorites.map((p, i) => <li key={i} className="text-sm font-bold text-blue-900 flex gap-2"><ArrowRight size={14} className="mt-0.5 text-blue-600 shrink-0"/> {p}</li>)}
                    </ul>
                 </div>
               </div>
           </div>
        </div>

        {/* ROADMAP AUTOMATIQUE */}
        <div className="ia-card p-8 bg-slate-50 border border-slate-200">
           <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Map size={22} className="text-indigo-600" /> Feuille de Route de Transformation
           </h3>
           <div className="space-y-4">
              {[
                { phase: 'Phase 1 (0-3 mois)', items: roadmap.phase1 },
                { phase: 'Phase 2 (3-6 mois)', items: roadmap.phase2 },
                { phase: 'Phase 3 (6-12 mois)', items: roadmap.phase3 },
              ].map((group, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                   <div className="font-black text-[#543b0c] text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[#926014]"></span>
                     {group.phase}
                   </div>
                   <div className="space-y-4">
                     {group.items.map((item, i) => (
                       <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-50/50 border border-slate-100">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="flex gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase">Impact {item.impact}</span>
                            <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase">ROI: {item.roi}</span>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center pt-8 border-t border-slate-200 pb-10">
           <button className="ia-btn-primary px-8 py-4 font-bold text-base shadow-xl shadow-blue-500/20">
             Réserver un Audit IA Gratuit
           </button>
           <button 
             onClick={() => {
               if (!canUseBenchmarkRoi) {
                 toast.error("Le Plan TPE est requis pour télécharger le rapport détaillé.");
                 return;
               }
               toast.success("Téléchargement du PDF en cours...");
             }}
             className={`px-8 py-4 font-bold text-base rounded-xl transition-all flex items-center justify-center ${
               canUseBenchmarkRoi ? "ia-btn-secondary bg-white" : "bg-slate-300 text-slate-500 cursor-not-allowed border-none"
             }`}
             title={!canUseBenchmarkRoi ? "Plan TPE requis" : ""}
           >
             {canUseBenchmarkRoi ? <Download size={18} className="mr-2 inline" /> : <Lock size={18} className="mr-2 inline" />} 
             Télécharger mon PDF
           </button>
           <button onClick={() => window.location.reload()} className="px-8 py-4 font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-xl transition-colors flex items-center">
             <RefreshCcw size={18} className="mr-2 inline" /> Refaire une analyse
           </button>
        </div>

      </div>
    );
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {phase === 'welcome' && renderWelcome()}
        {phase === 'profile' && renderProfile()}
        {phase === 'questionnaire' && renderQuestionnaire()}
        {phase === 'leadgen' && renderLeadGen()}
        {phase === 'results' && renderResults()}
      </div>

      {/* Modale d'authentification requise au 4ème essai */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer des audits sectoriels illimités, exporter vos rapports et sauvegarder vos scores."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}
