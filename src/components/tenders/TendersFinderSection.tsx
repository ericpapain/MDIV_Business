import React, { useState } from 'react';
import { 
  Search, ExternalLink, RefreshCw, Globe, Calendar, 
  MapPin, Building2, Tag, Loader2, Sparkles, CheckCircle2, DollarSign
} from 'lucide-react';
import { searchTenders, TenderItem } from '@/lib/tenderService';
import { toast } from 'sonner';

interface TendersFinderSectionProps {
  defaultQuery?: string;
  defaultLocation?: string;
  className?: string;
}

export const TendersFinderSection: React.FC<TendersFinderSectionProps> = ({
  defaultQuery = 'BTP rénovation',
  defaultLocation = '',
  className = '',
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const [count, setCount] = useState<number>(5);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent, isRefresh: boolean = false) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast.error("Veuillez saisir un secteur ou mot-clé d'appel d'offres.");
      return;
    }

    setIsLoading(true);
    const newOffset = isRefresh ? offset + count : 0;
    try {
      const res = await searchTenders(query.trim(), count, newOffset, location.trim());
      setTenders(res.tenders || []);
      setOffset(newOffset);
      setHasSearched(true);
      if (res.tenders?.length > 0) {
        toast.success(`${res.tenders.length} appels d'offres trouvés avec succès !`);
      } else {
        toast.info("Aucun appel d'offres trouvé pour ces critères.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de recherche des appels d'offres.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'BOAMP':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TED Europa':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Marchés-Publics.info':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Francemarches':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className={`p-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Veille & Recherche d'Appels d'Offres
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Direct Links Live
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-700">
              Recherchez les marchés publics et privés en direct et accédez directement aux plateformes officielles (BOAMP, TED, Marchés Publics)
            </p>
          </div>
        </div>

        {hasSearched && tenders.length > 0 && (
          <button
            type="button"
            onClick={() => handleSearch(undefined, true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            Proposer d'autres appels d'offres
          </button>
        )}
      </div>

      {/* Search Input & Controls Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Secteur d'activité */}
        <div className="md:col-span-5 relative">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Secteur d'activité / Mots-clés
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Plomberie sanitaire, Énergies renouvelables, Conseil..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Localisation : Ville / Région / Pays (Choix ou saisie libre) */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Ville / Région / Pays</span>
            <span className="text-[10px] font-normal text-slate-500 lowercase">(choix ou saisie libre)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            <input
              type="text"
              list="tenders-geo-options"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Lyon, Paris, Île-de-France, PACA, France..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-xs"
            />
            <datalist id="tenders-geo-options">
              <option value="France entière" />
              <option value="Paris, Île-de-France" />
              <option value="Lyon, Auvergne-Rhône-Alpes" />
              <option value="Marseille, Provence-Alpes-Côte d'Azur" />
              <option value="Nice, Provence-Alpes-Côte d'Azur" />
              <option value="Bordeaux, Nouvelle-Aquitaine" />
              <option value="Toulouse, Occitanie" />
              <option value="Montpellier, Occitanie" />
              <option value="Nantes, Pays de la Loire" />
              <option value="Lille, Hauts-de-France" />
              <option value="Strasbourg, Grand Est" />
              <option value="Rennes, Bretagne" />
              <option value="Rouen, Normandie" />
              <option value="Dijon, Bourgogne-Franche-Comté" />
              <option value="Orléans, Centre-Val de Loire" />
              <option value="Belgique" />
              <option value="Suisse" />
              <option value="Luxembourg" />
              <option value="Europe / International" />
            </datalist>
          </div>
        </div>

        {/* Nombre d'offres */}
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Offres
          </label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-2 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>

        {/* Bouton de lancement */}
        <div className="md:col-span-2 flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Lancer la veille</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Sectors & Locations */}
      <div className="space-y-2 pt-1">
        {/* Quick Sectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0 mr-1">Secteurs :</span>
          {[
            'Plomberie & Chauffage',
            'Rénovation Bâtiment',
            'Électricité & Énergies',
            'Développement Web & IA',
            'Nettoyage & Propreté',
            'Sécurité & Gardiennage',
            'Formation professionnelle',
            'Transport & Logistique'
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 font-medium whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick Geographic Areas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider shrink-0 mr-1">Zones :</span>
          {[
            { label: 'Toutes zones', val: '' },
            { label: 'Paris / IDF', val: 'Paris, Île-de-France' },
            { label: 'Lyon / AURA', val: 'Lyon, Auvergne-Rhône-Alpes' },
            { label: 'Marseille / PACA', val: "Marseille, Provence-Alpes-Côte d'Azur" },
            { label: 'Bordeaux / N-Aquitaine', val: 'Bordeaux, Nouvelle-Aquitaine' },
            { label: 'Toulouse / Occitanie', val: 'Toulouse, Occitanie' },
            { label: 'Nantes / Loire', val: 'Nantes, Pays de la Loire' },
            { label: 'Lille / Nord', val: 'Lille, Hauts-de-France' },
            { label: 'Belgique', val: 'Belgique' },
            { label: 'Suisse', val: 'Suisse' },
          ].map((zone) => (
            <button
              key={zone.label}
              type="button"
              onClick={() => setLocation(zone.val)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                location === zone.val
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <MapPin className="w-3 h-3 text-red-500" />
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold text-slate-800">
              Interrogation des sources officielles et agrégation des liens directs...
            </p>
          </div>
        ) : tenders.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {tenders.map((tender, index) => (
              <div
                key={tender.id || index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all gap-4"
              >
                {/* Information block (Strictly no long verbose description) */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPlatformBadge(tender.platform)}`}>
                      {tender.platform}
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" />
                      {tender.location || 'France'}
                    </span>
                    {tender.deadline && (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        Limite : {tender.deadline}
                      </span>
                    )}
                    {tender.estimatedBudget && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        {tender.estimatedBudget}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {tender.title}
                  </h3>

                  {tender.buyer && (
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Acheteur : <span className="text-slate-900">{tender.buyer}</span>
                    </p>
                  )}
                </div>

                {/* Direct Link Action Button */}
                <div className="shrink-0 flex items-center">
                  <a
                    href={tender.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Consulter l'appel d'offre</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-sm font-bold text-slate-800">Aucun appel d'offres trouvé.</p>
            <p className="text-xs text-slate-600 mt-1">Essayez d'élargir vos termes de recherche.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
