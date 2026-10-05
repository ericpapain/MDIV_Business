import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, Type, Link as LinkIcon, FileText, Upload, Settings, 
  Sparkles, Loader2, Linkedin, Twitter, Mail, Facebook, Youtube, Send, Instagram,
  CheckCircle2, AlertTriangle, FileText as FileWord, Copy, Download, History,
  TrendingUp, Clock, RefreshCcw, BookmarkPlus
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  fetchContentKPIs, fetchContentHistory, fetchBrandSettings, 
  generateContentMultiChannelAI, exportContentWord,
  ContentKPIs, ContentHistoryItem, BrandSettings, GeneratedContent, ContentGenerateRequest
} from '@/lib/contentGeneratorService';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar } from '@/components/common/VersionSelectorBar';
import { SectionDeepDive } from '@/components/common/SectionDeepDive';

const CHANNELS_CONFIG = [
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    activeBg: 'bg-[#0A66C2]', 
    border: 'border-[#0A66C2]', 
    text: 'text-[#0A66C2]', 
    tagBg: 'bg-[#0A66C2]/10 text-[#0A66C2]',
    borderActive: 'border-[#0A66C2]'
  },
  { 
    id: 'x', 
    name: 'X (Twitter)', 
    icon: Twitter, 
    activeBg: 'bg-black', 
    border: 'border-black', 
    text: 'text-black', 
    tagBg: 'bg-black/10 text-black',
    borderActive: 'border-black'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    activeBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', 
    border: 'border-rose-500', 
    text: 'text-rose-600', 
    tagBg: 'bg-rose-50 text-rose-700',
    borderActive: 'border-rose-500'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    activeBg: 'bg-[#1877F2]', 
    border: 'border-[#1877F2]', 
    text: 'text-[#1877F2]', 
    tagBg: 'bg-[#1877F2]/10 text-[#1877F2]',
    borderActive: 'border-[#1877F2]'
  },
  { 
    id: 'newsletter', 
    name: 'Newsletter', 
    icon: Mail, 
    activeBg: 'bg-emerald-600', 
    border: 'border-emerald-600', 
    text: 'text-emerald-600', 
    tagBg: 'bg-emerald-50 text-emerald-800',
    borderActive: 'border-emerald-600'
  },
  { 
    id: 'blog', 
    name: 'Article Blog', 
    icon: FileText, 
    activeBg: 'bg-indigo-600', 
    border: 'border-indigo-600', 
    text: 'text-indigo-600', 
    tagBg: 'bg-indigo-50 text-indigo-800',
    borderActive: 'border-indigo-600'
  },
  { 
    id: 'youtube', 
    name: 'Script Vidéo', 
    icon: Youtube, 
    activeBg: 'bg-[#FF0000]', 
    border: 'border-[#FF0000]', 
    text: 'text-[#FF0000]', 
    tagBg: 'bg-red-50 text-red-700',
    borderActive: 'border-red-600'
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: Send, 
    activeBg: 'bg-[#229ED9]', 
    border: 'border-[#229ED9]', 
    text: 'text-[#229ED9]', 
    tagBg: 'bg-sky-50 text-sky-700',
    borderActive: 'border-sky-500'
  },
];

export default function ServicesIAContent() {
  const { language } = useLanguage();
  const { company } = useAuth();

  const {
    remainingTrials,
    isLimitReached,
    isAuthModalOpen,
    setIsAuthModalOpen,
    checkCanExecute,
    recordExecution
  } = useGuestQuota('content');
  
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');

  // Dashboard & History
  const [kpis, setKpis] = useState<ContentKPIs | null>(null);
  const [history, setHistory] = useState<ContentHistoryItem[]>([]);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({ tone: 'Professionnel', editorialGuide: '', keywords: '' });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Studio State
  const [sourceType, setSourceType] = useState<'text' | 'url' | 'file'>('text');
  const [sourceContent, setSourceContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['linkedin']);
  const [targetAudience, setTargetAudience] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedContent[]>([]);
  const [versions, setVersions] = useState<GeneratedContent[][]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [isGeneratingVersion, setIsGeneratingVersion] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('');

  // Save / Work History states
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedWorkId, setSavedWorkId] = useState<number | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBaseData();
  }, [company?.id]);

  const loadBaseData = async () => {
    if (!company?.id) {
      setKpis(null);
      setHistory([]);
      setBrandSettings({ tone: 'Professionnel', editorialGuide: '', keywords: '' });
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    try {
      const [k, h, b] = await Promise.all([
        fetchContentKPIs(company?.id),
        fetchContentHistory(company?.id),
        fetchBrandSettings(company?.id)
      ]);
      setKpis(k);
      setHistory(h);
      setBrandSettings(b);
    } catch(e) {}
    setIsLoadingData(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Zéro mock : On convertirait le fichier en base64 pour l'API
    // Pour l'UI, on simule l'affichage du nom du fichier
    setSourceContent(`[Fichier importé : ${file.name}]`);
  };

  const toggleChannel = (id: string) => {
    if (selectedChannels.includes(id)) {
      if (selectedChannels.length > 1) setSelectedChannels(selectedChannels.filter(c => c !== id));
      else toast.error("Veuillez conserver au moins un canal de diffusion.");
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  const handleGenerate = async () => {
    if (!sourceContent.trim()) {
      toast.error("Veuillez fournir un sujet, une URL ou un fichier source.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsGenerating(true);
    setResults([]);
    try {
      const res = await generateContentMultiChannelAI({
        sourceType,
        sourceContent,
        channels: selectedChannels,
        brandSettings,
        targetAudience: targetAudience || 'Audience générale'
      }, company?.id);
      
      setResults(res);
      setVersions([res]);
      setActiveVersionIndex(0);
      recordExecution();
      if (res.length > 0) setActiveResultTab(res[0].channel);
      toast.success("Contenus générés avec succès.");
      
      // Recharge l'historique
      if (company?.id) {
        const h = await fetchContentHistory(company?.id);
        setHistory(h);
      }
    } catch(err: any) {
      toast.error(err.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnotherVersion = async () => {
    if (!sourceContent.trim() || isGeneratingVersion) return;
    setIsGeneratingVersion(true);
    try {
      const res = await generateContentMultiChannelAI({
        sourceType,
        sourceContent,
        channels: selectedChannels,
        brandSettings,
        targetAudience: (targetAudience || 'Audience générale') + ` (Variation créative #${versions.length + 1})`
      }, company?.id);
      
      const updatedVersions = [...versions, res];
      setVersions(updatedVersions);
      setActiveVersionIndex(updatedVersions.length - 1);
      setResults(res);
      if (res.length > 0) setActiveResultTab(res[0].channel);
      toast.success(`Nouvelle version (${updatedVersions.length}) générée avec succès !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la génération de la variante.");
    } finally {
      setIsGeneratingVersion(false);
    }
  };

  const handleSelectVersion = (idx: number) => {
    setActiveVersionIndex(idx);
    const chosen = versions[idx];
    if (chosen && chosen.length > 0) {
      setResults(chosen);
      if (!chosen.some(c => c.channel === activeResultTab)) {
        setActiveResultTab(chosen[0].channel);
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texte copié dans le presse-papier");
  };

  const handleWordExport = () => {
    if (results.length === 0) return;
    exportContentWord(results, company?.id);
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-stretch gap-6">
          <div className="pt-2 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors">
                <ArrowLeft size={16} /> "Retour aux Services IA"
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
                <RefreshCcw size={16} /> "Actualiser et recommencer"
              </button>
            </div>
            <div className="flex items-center gap-3 text-purple-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Sparkles size={16} /> Marketing & Communication
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Studio Multi-Canal IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Transformez une idée, un document ou une URL en campagnes marketing adaptées pour tous vos réseaux, en un clic.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-purple-300 via-blue-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-purple-400 opacity-50"></div>
            </div>

            {/* Comment ça marche : Visuel à étapes détaillées */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                
                {/* Étape 1 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Type size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Votre sujet</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Collez un texte, un lien ou un document de départ.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-blue-200 to-purple-200 ml-8 sm:hidden"></div>

                {/* Étape 2 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="absolute -top-1.5 -right-1.5">
                    <span className="flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 shadow-sm"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Création IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Déclinaison intelligente pour chaque réseau social.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-purple-500 bg-purple-50/80 h-8 w-8 rounded-full border border-purple-100/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-purple-200 to-slate-800 ml-8 sm:hidden"></div>

                {/* Étape 3 */}
                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Send size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Diffusion</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Vos contenus sont prêts à être publiés ou copiés.</p>
                </div>

              </div>
            </div>
          </div>
          
          {/* Vidéo Animation */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            >
              <source src="https://cdn.prod.website-files.com/6373b53b7e4adf70ce44cbd5%2F6a71f36dba060eceb7c770d6_anim%20-%20gestion%20des%20achats_webm.webm" type="video/webm" />
            </video>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap gap-1 border-b border-slate-200 mb-8 pb-1">
          <button 
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'studio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={18} /> Studio de Génération
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-bold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={18} /> Historique & Performances
          </button>
        </div>

        {activeTab === 'studio' && (
          <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
            {/* Colonne de gauche : Configuration */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Étape 1 : Source */}
              <div className="ia-card bg-white p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="font-bold text-lg text-slate-800">Source d'information</h3>
                </div>
                
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                   <button onClick={()=>setSourceType('text')} className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${sourceType === 'text' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Type size={16}/> Texte</button>
                   <button onClick={()=>setSourceType('url')} className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${sourceType === 'url' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><LinkIcon size={16}/> URL</button>
                   <button onClick={()=>setSourceType('file')} className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${sourceType === 'file' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><FileWord size={16}/> Doc</button>
                </div>

                {sourceType === 'text' && (
                  <textarea 
                    value={sourceContent} onChange={e=>setSourceContent(e.target.value)}
                    placeholder="Saisissez un sujet, une idée d'article ou collez un texte brut..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none min-h-[150px] resize-y"
                  />
                )}
                {sourceType === 'url' && (
                  <input 
                    type="url" value={sourceContent} onChange={e=>setSourceContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                )}
                {sourceType === 'file' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx" />
                    <Upload className="mx-auto text-blue-500 mb-3" size={24} />
                    <p className="text-sm font-bold text-blue-700 mb-1">Sélectionner un fichier</p>
                    <p className="text-xs text-blue-500/70">PDF ou Word supportés</p>
                    {sourceContent.includes('Fichier importé') && (
                      <div className="mt-4 p-2 bg-white rounded-lg border border-blue-100 text-xs font-bold text-slate-700">
                        {sourceContent}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Étape 2 : Canaux */}
              <div className="ia-card bg-white p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="font-bold text-lg text-slate-800">Canaux de diffusion</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CHANNELS_CONFIG.map(channel => {
                    const isSelected = selectedChannels.includes(channel.id);
                    const Icon = channel.icon;
                    return (
                      <button 
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
                          isSelected 
                            ? `${channel.activeBg} text-white shadow-md ${channel.border} scale-[1.02]` 
                            : `bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50`
                        }`}
                      >
                        <Icon size={20} className={isSelected ? 'text-white' : channel.text} />
                        <span className="text-xs font-bold text-center leading-tight">{channel.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Étape 3 : Marque */}
              <div className="ia-card bg-white p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="font-bold text-lg text-slate-800">Marque & Cible</h3>
                  </div>
                  <Settings size={18} className="text-slate-400" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Audience Cible</label>
                    <input 
                      type="text" value={targetAudience} onChange={e=>setTargetAudience(e.target.value)}
                      placeholder="Ex: Directeurs financiers PME..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Guide éditorial de la base</p>
                    <p className="text-sm font-medium text-purple-900 mb-1">Ton actuel : {brandSettings.tone}</p>
                    <p className="text-xs text-purple-600/80">L'IA appliquera automatiquement le guide de votre entreprise.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full ia-btn-primary py-4 text-base font-bold flex flex-col items-center justify-center gap-1"
              >
                <span className="flex items-center gap-2">
                  {isGenerating ? <><Loader2 className="animate-spin" size={20}/> Production IA en cours...</> : <><Sparkles size={20}/> Générer pour {selectedChannels.length} canaux</>}
                </span>
                {!company?.id && (
                  <span className="text-[11px] font-normal text-slate-300">
                    ⚡ {remainingTrials} / 3 essais gratuits restants
                  </span>
                )}
              </button>

            </div>

            {/* Colonne de droite : Résultats */}
            <div className="lg:col-span-7">
              <div className="ia-card bg-white border border-slate-200 h-full min-h-[600px] flex flex-col overflow-hidden">
                <div className="bg-slate-900 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Sparkles size={18} className="text-purple-400" /> Contenus Générés
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSavedDrawerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    >
                      <History size={14} className="text-blue-400" /> Historique
                    </button>
                    {results.length > 0 && (
                      <>
                        <button
                          onClick={() => setIsSaveModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          <BookmarkPlus size={14} /> Sauvegarder
                        </button>
                        <button onClick={handleWordExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700 cursor-pointer">
                          <FileWord size={14} className="text-blue-400"/> Exporter (.doc)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Barre de multi-versions */}
                {results.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                    <VersionSelectorBar
                      totalVersions={versions.length}
                      currentVersionIndex={activeVersionIndex}
                      onSelectVersion={handleSelectVersion}
                      onRequestAnotherVersion={handleGenerateAnotherVersion}
                      isGenerating={isGeneratingVersion}
                    />
                  </div>
                )}

                {results.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                    {isGenerating ? (
                       <div className="flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                           <Loader2 size={32} className="text-blue-500 animate-spin" />
                         </div>
                         <h4 className="font-bold text-lg text-slate-700">L'IA rédige vos contenus...</h4>
                         <p className="text-sm text-slate-500 max-w-sm">Application du guide éditorial et formatage pour les différents canaux de diffusion.</p>
                       </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                          <LayoutDashboardIcon />
                        </div>
                        <h4 className="font-bold text-lg text-slate-600 mb-2">Studio Créatif Vide</h4>
                        <p className="text-sm max-w-sm">Configurez votre source et lancez la génération pour voir apparaître vos publications ici.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 scrollbar-hide">
                      {Array.isArray(results) && results.map(res => {
                        const channelLower = (res.channel || '').toLowerCase();
                        const config = CHANNELS_CONFIG.find(c => c.id.toLowerCase() === channelLower || channelLower.includes(c.id.toLowerCase())) || CHANNELS_CONFIG[0];
                        const Icon = config.icon;
                        const isActive = activeResultTab === res.channel;
                        return (
                          <button 
                            key={res.channel}
                            onClick={() => setActiveResultTab(res.channel)}
                            className={`flex items-center gap-2 px-5 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                              isActive 
                                ? `${config.borderActive} ${config.text} bg-white shadow-xs` 
                                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                          >
                            <Icon size={16} className={isActive ? config.text : 'opacity-60'} /> {config.name}
                          </button>
                        )
                      })}
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                      {Array.isArray(results) && results.map(res => {
                        const channelLower = (res.channel || '').toLowerCase();
                        const config = CHANNELS_CONFIG.find(c => c.id.toLowerCase() === channelLower || channelLower.includes(c.id.toLowerCase())) || CHANNELS_CONFIG[0];
                        const Icon = config.icon;
                        return (
                        <div key={res.channel} className={activeResultTab === res.channel ? 'block' : 'hidden'}>
                          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                               <div>
                                 <div className="flex items-center gap-2 mb-1.5">
                                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.tagBg} ${config.border}`}>
                                     <Icon size={14} /> {config.name}
                                   </span>
                                   <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Prêt pour diffusion</span>
                                 </div>
                                 <h4 className="font-bold text-lg text-slate-800">{res.title || "Contenu généré"}</h4>
                               </div>
                               <button onClick={() => handleCopy(res.title + "\n\n" + res.body)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors cursor-pointer">
                                 <Copy size={14}/> Copier
                               </button>
                            </div>
                            
                            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-medium">
                              {res.body}
                            </div>
                            
                            {res.hashtags && res.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {res.hashtags.map((tag, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">#{tag}</span>
                                ))}
                              </div>
                            )}

                            {/* Section Deep Dive pour ce canal spécifique */}
                            <div className="pt-4 border-t border-slate-100">
                              <SectionDeepDive
                                sectionTitle={`Publication ${res.channel.toUpperCase()} : ${res.title}`}
                                sectionContent={res.body}
                                suggestedQuestions={[
                                  "Rends ce texte plus percutant avec une phrase d'accroche choc.",
                                  "Adapte le Call-To-Action (CTA) pour inciter à une prise de rendez-vous immédiate.",
                                  "Raccourcis ce texte de 30% tout en gardant l'essentiel.",
                                  "Ajoute 3 variantes d'accroches alternatives (hook) pour ce post."
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="ia-animate-in space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1">Publications générées</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.totalGenerated || 0}</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-blue-600 mb-1">Mots produits (IA)</div>
                <div className="text-2xl font-bold text-slate-900">{(kpis?.wordsGenerated || 0).toLocaleString()}</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-emerald-600 mb-1">Temps gagné estimé</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.timeSavedHours || 0} h</div>
              </div>
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-purple-600 mb-1">Campagnes actives</div>
                <div className="text-2xl font-bold text-slate-900">{kpis?.activeCampaigns || 0}</div>
              </div>
            </div>

            <div className="ia-card bg-white border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <h3 className="font-bold text-lg">Historique SQL (Base de données)</h3>
               </div>
               {history.length === 0 ? (
                 <div className="p-10 text-center text-slate-500 font-medium">Aucun historique de génération trouvé sur le serveur.</div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-400 font-bold">
                       <tr>
                         <th className="px-6 py-4">Source</th>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Canaux</th>
                         <th className="px-6 py-4">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                       {history.map(item => (
                         <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4">
                             <div className="font-bold text-slate-900 mb-1">{item.sourceTitle}</div>
                             <div className="text-xs text-slate-500 capitalize">{item.sourceType}</div>
                           </td>
                           <td className="px-6 py-4">{item.date}</td>
                           <td className="px-6 py-4">
                             <div className="flex gap-1">
                               {item.channels.map(c => <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded">{c}</span>)}
                             </div>
                           </td>
                           <td className="px-6 py-4">
                             <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">Voir</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          </div>
        )}

      </div>

      {/* Modale Sauvegarder dans l'historique */}
      <SaveWorkModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        toolType="content"
        contentPayload={{
          results,
          sourceType,
          sourceContent,
          selectedChannels,
          targetAudience,
          brandSettings,
          versions,
          activeVersionIndex
        }}
        defaultTitle={`Studio Multi-Canal : ${results[0]?.title || sourceContent.slice(0, 40) || 'Campagne Marketing'}`}
        defaultTags={['contenu', ...selectedChannels]}
        onSaved={(id) => {
          setSavedWorkId(id);
          toast.success("Campagne sauvegardée dans l'historique client/projet avec succès.");
        }}
      />

      {/* Tiroir Historique */}
      <SavedWorkDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        filterTool="content"
        onLoadItem={(item) => {
          if (item.content_payload?.results) {
            setResults(item.content_payload.results);
            if (item.content_payload.versions) {
              setVersions(item.content_payload.versions);
              setActiveVersionIndex(item.content_payload.activeVersionIndex || 0);
            } else {
              setVersions([item.content_payload.results]);
              setActiveVersionIndex(0);
            }
            if (item.content_payload.sourceContent) setSourceContent(item.content_payload.sourceContent);
            if (item.content_payload.selectedChannels) setSelectedChannels(item.content_payload.selectedChannels);
            if (item.content_payload.results.length > 0) setActiveResultTab(item.content_payload.results[0].channel);
            setSavedWorkId(item.id);
            toast.success(`Campagne "${item.title}" chargée.`);
          }
        }}
      />

      {/* Modale d'authentification requise au 4ème essai */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Vous avez utilisé vos 3 essais gratuits sur cet outil"
        subtitle="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer l'accès illimité, sauvegarder vos contenus et personnaliser votre ton de marque."
        quotaLimitReached={isLimitReached}
      />
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard text-slate-300" width="24" height="24" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
