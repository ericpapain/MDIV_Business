import { useState, useEffect } from 'react';
import ServiceHeroImage from '@/components/ia/ServiceHeroImage';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, Search, Building2, MapPin, Briefcase, Zap, 
  Target, BarChart2, Star, Download, Sparkles, Loader2,
  TrendingUp, Globe, Filter, ExternalLink, Activity, AlertTriangle, CheckCircle2, RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  fetchLeadsKPIs, searchLeadsAI, exportLeads,
  LeadsKPIs, LeadEnrichment, LeadsSearchRequest
} from '@/lib/leadsGeneratorService';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { hasFeatureAccess } from '@/lib/planLimitsService';

function getSafeWebsiteUrl(companyName: string, website?: string, location?: string): string {
  if (website && website.startsWith('http') && !website.includes('example.com') && !website.includes('fictive') && !website.includes('placeholder')) {
    return website;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(companyName + ' ' + (location || ''))}`;
}

function getLinkedInSearchUrl(companyName: string): string {
  return `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`;
}

export default function ServicesIALeads() {
  const { language } = useLanguage();
  const { company, isAuthenticated } = useAuth();
  
  // Quota Freemium 3 essais invité
  const { 
    remainingTrials, 
    isLimitReached: isQuotaLimitReached, 
    isAuthModalOpen: isQuotaModalOpen, 
    setIsAuthModalOpen: setIsQuotaModalOpen, 
    checkCanExecute, 
    recordExecution 
  } = useGuestQuota('leads');

  const [activeTab, setActiveTab] = useState<'search' | 'dashboard'>('search');

  // KPI
  const [kpis, setKpis] = useState<LeadsKPIs | null>(null);
  
  // Search Form
  const [searchParams, setSearchParams] = useState<LeadsSearchRequest>({
    sector: 'Technologie & Conseil',
    country: 'France',
    region: 'Île-de-France',
    companySize: '51-250',
    targetFunction: 'CEO / DSI',
    keywords: 'transformation digitale, automatisation, IA'
  });

  // Results
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [leads, setLeads] = useState<LeadEnrichment[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeLead, setActiveLead] = useState<LeadEnrichment | null>(null);

  useEffect(() => {
    loadKPIs();
  }, [company?.id]);

  const loadKPIs = async () => {
    try {
      const k = await fetchLeadsKPIs(company?.id);
      setKpis(k);
    } catch(e) {}
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.sector && !searchParams.keywords) {
      toast.error("Veuillez saisir au moins un secteur ou un mot-clé.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsSearching(true);
    setHasSearched(true);
    setLeads([]);
    setActiveLead(null);
    setSelectedLeads([]);
    
    try {
      const results = await searchLeadsAI(searchParams, company?.id);
      setLeads(results);
      if (results.length > 0) setActiveLead(results[0]);
      recordExecution();
      toast.success(`${results.length} leads qualifiés trouvés par l'IA.`);
    } catch(err: any) {
      toast.error(err.message || "Erreur lors du ciblage IA.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleLeadSelection = (url: string) => {
    if (selectedLeads.includes(url)) {
      setSelectedLeads(selectedLeads.filter(id => id !== url));
    } else {
      setSelectedLeads([...selectedLeads, url]);
    }
  };

  const handleExport = (format: 'excel' | 'crm') => {
    if (format === 'excel' && !hasFeatureAccess('leads_export_excel').allowed) {
      toast.error("L'export Excel nécessite le forfait Indépendant ou supérieur.");
      return;
    }
    if (selectedLeads.length === 0) {
      toast.error("Veuillez sélectionner au moins un lead à exporter.");
      return;
    }
    const leadsToExport = leads.filter(l => selectedLeads.includes(l.website));
    exportLeads(leadsToExport, format, company?.id);
    toast.success(`Export ${format.toUpperCase()} initialisé avec succès.`);
  };

  const getScoreBadge = (score: string) => {
    switch(score) {
      case 'Très élevé': 
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Élevé': 
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Moyen': 
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: 
        return 'bg-white/10 text-gray-300 border-white/20';
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
                <ArrowLeft size={16} /> "Retour aux Services IA"
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors" title="Actualiser et relancer l'IA">
                <RefreshCcw size={16} /> "Actualiser et recommencer"
              </button>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Target size={16} /> Prospection & Vente B2B
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Générateur de Leads IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Qualifiez intelligemment vos prospects B2B en temps réel. L'IA modélise les entreprises cibles, leur maturité digitale et leurs décideurs stratégiques.
            </p>
            
            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-amber-300 via-yellow-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-amber-400 opacity-50"></div>
            </div>

            {/* Comment ça marche : Visuel à étapes détaillées */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                
                {/* Étape 1 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Search size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Recherche</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Définissez vos critères B2B.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-amber-500 bg-amber-50/80 h-8 w-8 rounded-full border border-amber-100/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-amber-200 to-yellow-200 ml-8 sm:hidden"></div>

                {/* Étape 2 */}
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-yellow-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="absolute -top-1.5 -right-1.5">
                    <span className="flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500 shadow-sm"></span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. Analyse IA</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Scoring du potentiel client.</p>
                </div>

                {/* Flèche de liaison */}
                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-yellow-500 bg-yellow-50/80 h-8 w-8 rounded-full border border-yellow-100/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-yellow-200 to-slate-800 ml-8 sm:hidden"></div>

                {/* Étape 3 */}
                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Target size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Qualification</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Fiches prospects prêtes.</p>
                </div>

              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <ServiceHeroImage />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap gap-2 sm:gap-4 border-b border-slate-200 mb-8 pb-1">
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'search' 
                ? 'border-gold text-gold font-bold' 
                : 'border-transparent text-slate-800 hover:text-[#020617]'
            }`}
          >
            <Search size={18} /> Moteur de Recherche IA
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'dashboard' 
                ? 'border-gold text-gold font-bold' 
                : 'border-transparent text-slate-800 hover:text-[#020617]'
            }`}
          >
            <BarChart2 size={18} /> Tableau de Bord & Statistiques
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="grid xl:grid-cols-12 gap-6">
            {/* Colonne 1 : Filtres (3/12) */}
            <div className="xl:col-span-4 lg:col-span-5">
              <form onSubmit={handleSearch} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl xl:sticky xl:top-28">
                <div className="flex items-center gap-2 font-bold text-[#020617] text-base mb-6 border-b border-slate-200 pb-4">
                  <Filter size={18} className="text-gold"/> Critères de Qualification IA
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Secteur d'activité *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Industrie, Luxe, Finance..." 
                      value={searchParams.sector} 
                      onChange={e=>setSearchParams({...searchParams, sector: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] placeholder:text-slate-800 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Pays</label>
                      <input 
                        type="text" 
                        value={searchParams.country} 
                        onChange={e=>setSearchParams({...searchParams, country: e.target.value})} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] placeholder:text-slate-800 outline-none focus:border-gold transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Région</label>
                      <input 
                        type="text" 
                        value={searchParams.region || ''} 
                        placeholder="Ex: Île-de-France"
                        onChange={e=>setSearchParams({...searchParams, region: e.target.value})} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] placeholder:text-slate-800 outline-none focus:border-gold transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Taille de l'entreprise</label>
                    <select 
                      value={searchParams.companySize} 
                      onChange={e=>setSearchParams({...searchParams, companySize: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] outline-none focus:border-gold transition-all"
                    >
                      <option value="">Toutes tailles</option>
                      <option value="1-10">TPE (1 à 10 salariés)</option>
                      <option value="11-50">Petite PME (11 à 50 salariés)</option>
                      <option value="51-250">PME en croissance (51 à 250)</option>
                      <option value="250+">ETI / Grand Compte (250+ salariés)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Fonction Cible (Décideur)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: CEO, DG, DSI, DRH..." 
                      value={searchParams.targetFunction} 
                      onChange={e=>setSearchParams({...searchParams, targetFunction: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] placeholder:text-slate-800 outline-none focus:border-gold transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5" style={{ color: 'black' }}>Mots-clés & Technologies</label>
                    <input 
                      type="text" 
                      placeholder="Ex: ERP, Cloud, CRM, IA..." 
                      value={searchParams.keywords} 
                      onChange={e=>setSearchParams({...searchParams, keywords: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#020617] placeholder:text-slate-800 outline-none focus:border-gold transition-all" 
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSearching}
                  className="w-full mt-6 bg-gradient-to-r from-gold via-gold-light to-gold text-[#0b0d14] py-3.5 px-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                  {isSearching ? "Génération en cours..." : "Lancer le Ciblage IA"}
                  {!isAuthenticated && (
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-black/20 text-slate-900 font-semibold">
                      {remainingTrials > 0 ? `⚡ ${remainingTrials}/3 essai${remainingTrials > 1 ? 's' : ''}` : '⚡ 0/3 (Verrouillé)'}
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Colonne 2 : Pipeline Résultats (4/12) */}
            <div className="xl:col-span-4 lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl h-full min-h-[350px] lg:min-h-[600px] flex flex-col shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-[#020617] text-base flex items-center gap-2">
                     <Target size={16} className="text-gold"/> Prospects Identifiés
                   </h3>
                   {leads.length > 0 && (
                     <div className="text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
                       {leads.length} qualifiés
                     </div>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!hasSearched ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-800 text-center px-6 py-20">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-4">
                        <Target size={28} className="text-gold" />
                      </div>
                      <h4 className="font-bold text-lg text-[#020617] mb-2 font-serif">Prêt à Prospecter</h4>
                      <p className="text-sm max-w-xs text-slate-800 leading-relaxed">
                        Configurez vos filtres à gauche et cliquez sur « Lancer le ciblage IA » pour identifier et enrichir vos futurs clients.
                      </p>
                    </div>
                  ) : isSearching ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-24">
                      <Loader2 size={44} className="animate-spin text-gold mb-4" />
                      <h4 className="font-bold text-lg text-[#020617] mb-1">Inférence IA en cours...</h4>
                      <p className="text-sm text-slate-800 max-w-xs">
                        Analyse du secteur, modélisation des entreprises et calcul du score de conversion.
                      </p>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                        <AlertTriangle size={24} className="text-amber-400" />
                      </div>
                      <h4 className="font-bold text-lg text-[#020617] mb-2">Aucun Lead Trouvé</h4>
                      <p className="text-sm text-slate-800 max-w-xs">
                        Élargissez vos filtres ou modifiez le secteur d'activité recherché.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gold/10 border border-gold/30 text-gold text-xs p-3 rounded-xl flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="shrink-0 text-gold" />
                        <span>Sélectionnez les fiches pour les exporter ou cliquez pour voir l'audit complet.</span>
                      </div>
                      {leads.map(lead => (
                        <div 
                          key={lead.website}
                          onClick={() => setActiveLead(lead)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                            activeLead?.website === lead.website 
                              ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10' 
                              : 'bg-slate-50 border-slate-200 hover:border-gold/40'
                          }`}
                        >
                          <div className="pt-1">
                            <input 
                              type="checkbox" 
                              checked={selectedLeads.includes(lead.website)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleLeadSelection(lead.website);
                              }}
                              className="w-4 h-4 rounded border-white/30 text-gold focus:ring-gold accent-gold cursor-pointer"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1.5">
                              <h4 className="font-bold text-[#020617] text-base">{lead.companyName}</h4>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadge(lead.aiPotentialScore)}`}>
                                Potentiel : {lead.aiPotentialScore}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-800 font-medium mb-2.5">
                              <span className="flex items-center gap-1"><Building2 size={12} className="text-gold"/> {lead.sector}</span>
                              <span className="flex items-center gap-1"><MapPin size={12}/> {lead.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
                                {lead.size}
                              </span>
                              {lead.decisionMakerFunction && (
                                <span className="text-xs text-gold flex items-center gap-1 font-semibold">
                                  <Briefcase size={12}/> {lead.decisionMakerFunction}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 3 : Panneau d'Enrichissement Détaillé (4/12) */}
            <div className="xl:col-span-4 lg:col-span-12">
              {activeLead ? (
                <div className="bg-white border border-gold/30 rounded-2xl overflow-hidden xl:sticky xl:top-28 shadow-2xl">
                  {/* Header profil */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 border-b border-slate-200 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                         <Activity size={16} /> Profil Enrichi IA
                       </div>
                       <div className="flex items-center gap-2">
                         <a 
                           href={getSafeWebsiteUrl(activeLead.companyName, activeLead.website, activeLead.location)} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-slate-800 hover:text-gold transition-colors flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs"
                           title="Consulter le site officiel ou la fiche Google vérifiée"
                         >
                           Site web <ExternalLink size={12}/>
                         </a>
                         <a 
                           href={getLinkedInSearchUrl(activeLead.companyName)} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#0A66C2]/5 border border-[#0A66C2]/30 shadow-xs"
                           title="Recherche LinkedIn Entreprise"
                         >
                           LinkedIn <ExternalLink size={12}/>
                         </a>
                       </div>
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-[#020617] mb-1.5">
                      {activeLead.companyName}
                    </h3>
                    <div className="text-slate-800 text-sm flex items-center gap-2">
                      <Building2 size={14} className="text-gold"/> {activeLead.size} • {activeLead.location}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* SCORING IA */}
                    <div>
                      <h4 className="text-sm font-bold text-[#020617] mb-3">Scoring Prédictif</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                          <div className="text-xs text-slate-800 mb-1">Maturité Digitale</div>
                          <div className="text-sm font-bold text-[#020617]">
                            {activeLead.digitalMaturityScore}
                          </div>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
                          <div className="text-xs text-slate-800 mb-1">Probabilité de Conversion</div>
                          <div className="text-sm font-bold text-gold">
                            {activeLead.purchaseProbability}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DÉCIDEUR STRATÉGIQUE */}
                    <div>
                      <h4 className="text-sm font-bold text-[#020617] mb-3">Décideur Identifié</h4>
                      <div className="p-4 bg-white border border-gold/20 rounded-xl flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold text-base">
                          {activeLead.decisionMakerName ? activeLead.decisionMakerName.charAt(0) : 'D'}
                        </div>
                        <div>
                          <div className="font-bold text-[#020617] text-base">
                            {activeLead.decisionMakerName || "Décideur Exécutif"}
                          </div>
                          <div className="text-xs text-gold font-medium">
                            {activeLead.decisionMakerFunction || "Direction Générale"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TECHNOLOGIES */}
                    {activeLead.technologiesUsed && activeLead.technologiesUsed.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-[#020617] mb-3">Stack Technologique Détectée</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeLead.technologiesUsed.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACTIONS D'EXPORT */}
                    <div className="border-t border-slate-200 pt-5">
                      <div className="text-xs text-slate-800 mb-3 text-center">
                        {selectedLeads.length} prospect{selectedLeads.length > 1 ? 's' : ''} sélectionné{selectedLeads.length > 1 ? 's' : ''}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleExport('excel')}
                          disabled={selectedLeads.length === 0}
                          className="py-2.5 bg-slate-50 hover:bg-blue-100 text-[#020617] font-bold rounded-xl text-xs border border-slate-200 transition-all flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Download size={14} /> Export Excel
                        </button>
                        <button 
                          onClick={() => handleExport('crm')}
                          disabled={selectedLeads.length === 0}
                          className="py-2.5 bg-gold hover:brightness-110 text-[#0b0d14] font-bold rounded-xl text-xs transition-all flex justify-center items-center gap-2 shadow-md shadow-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Zap size={14} /> Envoyer au CRM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-800 p-8 text-center bg-white">
                  <Globe size={44} className="text-gold/60 mb-3" />
                  <h4 className="font-bold text-lg text-[#020617] mb-1.5 font-serif">Fiche Prospect Détaillée</h4>
                  <p className="text-xs max-w-[240px] text-slate-800 leading-relaxed">
                    Cliquez sur un prospect dans la liste pour révéler son analyse complète, sa stack et ses contacts clés.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xl">
                <div className="text-sm font-bold text-[#020617] mb-2">Total Leads Générés</div>
                <div className="text-3xl font-serif font-bold text-[#020617]">{kpis?.totalGenerated || 48}</div>
              </div>
              <div className="bg-white p-6 border border-gold/30 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">Hautement Qualifiés</div>
                <div className="text-3xl font-serif font-bold text-gold">{kpis?.highlyQualified || 32}</div>
              </div>
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xl">
                <div className="text-sm font-bold text-[#020617] mb-2">Segments Actifs</div>
                <div className="text-3xl font-serif font-bold text-[#020617]">{kpis?.activeSegments || 6}</div>
              </div>
              <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xl">
                <div className="text-sm font-bold text-[#020617] mb-2">Exports CRM Réalisés</div>
                <div className="text-3xl font-serif font-bold text-[#020617]">{kpis?.totalExports || 14}</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 p-10 rounded-2xl text-center shadow-xl">
               <TrendingUp size={44} className="mx-auto text-gold mb-3" />
               <h3 className="font-serif font-bold text-2xl text-[#020617] mb-2">Performances de Conversion Commerciale</h3>
               <p className="text-slate-800 max-w-md mx-auto text-sm leading-relaxed">
                 Le suivi des rendez-vous et des signatures de contrats générés via vos leads qualifiés s'actualise en temps réel à chaque export.
               </p>
            </div>
          </div>
        )}

      </div>

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          if (searchParams.sector || searchParams.keywords) {
            handleSearch({ preventDefault: () => {} } as any);
          }
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour continuer à extraire des leads qualifiés en illimité."
      />
    </div>
  );
}
