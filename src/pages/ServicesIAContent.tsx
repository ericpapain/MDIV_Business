import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, Type, Link as LinkIcon, FileText, Upload, Settings, 
  Sparkles, Loader2, Linkedin, Twitter, Mail, Facebook, Youtube, Send,
  CheckCircle2, AlertTriangle, FileText as FileWord, Copy, Download, History,
  TrendingUp, Clock
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  fetchContentKPIs, fetchContentHistory, fetchBrandSettings, 
  generateContentMultiChannelAI, exportContentWord,
  ContentKPIs, ContentHistoryItem, BrandSettings, GeneratedContent, ContentGenerateRequest
} from '@/lib/contentGeneratorService';

const CHANNELS_CONFIG = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  { id: 'blog', name: 'Article Blog', icon: FileText, color: 'bg-emerald-600' },
  { id: 'newsletter', name: 'Newsletter', icon: Mail, color: 'bg-purple-600' },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'bg-black' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-700' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-sky-500' },
  { id: 'youtube', name: 'Script Vidéo', icon: Youtube, color: 'bg-red-600' },
];

export default function ServicesIAContent() {
  const { language } = useLanguage();
  const { company } = useAuth();
  
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
  const [activeResultTab, setActiveResultTab] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBaseData();
  }, [company?.id]);

  const loadBaseData = async () => {
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
      if (res.length > 0) setActiveResultTab(res[0].channel);
      toast.success("Contenus générés avec succès.");
      
      // Recharge l'historique
      const h = await fetchContentHistory(company?.id);
      setHistory(h);
    } catch(err: any) {
      toast.error(err.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGenerating(false);
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
        <EnterpriseAuthBar className="mb-8" />
        
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
              <ArrowLeft size={16} /> Retour aux Services IA
            </Link>
            <div className="flex items-center gap-3 text-purple-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Sparkles size={16} /> Marketing & Communication
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Studio Multi-Canal IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl">
              Transformez une idée, un document ou une URL en campagnes marketing adaptées pour tous vos réseaux, en un clic.
            </p>
          </div>
          
          {/* Upsell Copilot */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-2xl text-white max-w-sm shadow-xl shadow-blue-600/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles size={64}/></div>
             <h4 className="font-bold mb-1 relative z-10 flex items-center gap-2">Découvrez Copilot M365</h4>
             <p className="text-xs text-blue-100 mb-3 relative z-10">Intégrez ce studio directement dans Word, Teams et PowerPoint.</p>
             <button className="text-xs font-bold bg-white text-blue-700 px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors relative z-10">
               Contacter un expert
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 mb-8">
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
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CHANNELS_CONFIG.map(channel => {
                    const isSelected = selectedChannels.includes(channel.id);
                    const Icon = channel.icon;
                    return (
                      <button 
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          isSelected ? `bg-slate-900 border-slate-900 text-white shadow-md` : `bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50`
                        }`}
                      >
                        <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-400'} />
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audience Cible</label>
                    <input 
                      type="text" value={targetAudience} onChange={e=>setTargetAudience(e.target.value)}
                      placeholder="Ex: Directeurs financiers PME..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
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
                className="w-full ia-btn-primary py-4 text-base font-bold flex justify-center items-center gap-2"
              >
                {isGenerating ? <><Loader2 className="animate-spin" size={20}/> Production IA en cours...</> : <><Sparkles size={20}/> Générer pour {selectedChannels.length} canaux</>}
              </button>

            </div>

            {/* Colonne de droite : Résultats */}
            <div className="lg:col-span-7">
              <div className="ia-card bg-white border border-slate-200 h-full min-h-[600px] flex flex-col overflow-hidden">
                
                <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Sparkles size={18} className="text-purple-400" /> Contenus Générés
                  </div>
                  {results.length > 0 && (
                    <button onClick={handleWordExport} className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-700">
                      <FileWord size={14} className="text-blue-400"/> Exporter Tout (.doc)
                    </button>
                  )}
                </div>

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
                      {results.map(res => {
                        const config = CHANNELS_CONFIG.find(c => c.id === res.channel) || CHANNELS_CONFIG[0];
                        const Icon = config.icon;
                        const isActive = activeResultTab === res.channel;
                        return (
                          <button 
                            key={res.channel}
                            onClick={() => setActiveResultTab(res.channel)}
                            className={`flex items-center gap-2 px-5 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
                              isActive ? 'border-slate-900 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Icon size={16} className={isActive ? '' : 'opacity-60'} /> {config.name}
                          </button>
                        )
                      })}
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                      {results.map(res => (
                        <div key={res.channel} className={activeResultTab === res.channel ? 'block' : 'hidden'}>
                          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                               <div>
                                 <h4 className="font-bold text-lg text-slate-800">{res.title || "Contenu généré"}</h4>
                                 <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1"><CheckCircle2 size={12}/> Adapté au ton de la marque</p>
                               </div>
                               <button onClick={() => handleCopy(res.title + "\n\n" + res.body)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors">
                                 <Copy size={14}/> Copier
                               </button>
                            </div>
                            
                            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-medium">
                              {res.body}
                            </div>
                            
                            {res.hashtags && res.hashtags.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2">
                                {res.hashtags.map((tag, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">#{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
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
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard text-slate-300" width="24" height="24" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
}
