import React, { useState, useEffect } from 'react';
import { 
  History, X, Search, Trash2, ArrowUpRight, FolderKanban, 
  User, Calendar, FileText, CheckCircle2, Loader2, Sparkles, Filter
} from 'lucide-react';
import { fetchSavedWorks, deleteSavedWork, SavedWorkItem } from '@/lib/savedWorkService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SavedWorkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toolType?: string; // If provided, filters by this tool type by default
  onSelectWork?: (item: SavedWorkItem) => void;
}

export const SavedWorkDrawer: React.FC<SavedWorkDrawerProps> = ({
  isOpen,
  onClose,
  toolType,
  onSelectWork,
}) => {
  const { company, token } = useAuth();
  const [items, setItems] = useState<SavedWorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>(toolType || 'all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedWorks();
    }
  }, [isOpen, selectedToolFilter]);

  const loadSavedWorks = async () => {
    setIsLoading(true);
    try {
      const filters = selectedToolFilter !== 'all' ? { toolType: selectedToolFilter } : undefined;
      const list = await fetchSavedWorks(filters, company?.id, token);
      setItems(list);
    } catch {
      toast.error("Impossible de charger l'historique.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément de votre historique ?")) return;

    setDeletingId(id);
    try {
      await deleteSavedWork(id, company?.id, token);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Élément supprimé de l'historique.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.client_name && item.client_name.toLowerCase().includes(q)) ||
      (item.project_name && item.project_name.toLowerCase().includes(q)) ||
      (item.summary && item.summary.toLowerCase().includes(q))
    );
  });

  const getToolBadgeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'summarizer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'diagnostic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'prospecting': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'content': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getToolLabel = (type: string) => {
    switch (type) {
      case 'quote': return 'Devis IA';
      case 'meeting': return 'Compte-rendu';
      case 'email': return 'Email IA';
      case 'summarizer': return 'Synthèse Doc';
      case 'diagnostic': return 'Diagnostic';
      case 'prospecting': return 'Prospection';
      case 'content': return 'Contenu';
      case 'invoice': return 'Facture';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <History className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Historique des travaux sauvegardés</h3>
              <p className="text-xs text-slate-300">Retrouvez et chargez vos travaux rattachés aux clients</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, client, projet..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Filtre:</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'meeting', label: 'Réunions' },
              { id: 'quote', label: 'Devis' },
              { id: 'summarizer', label: 'Résumés' },
              { id: 'email', label: 'Emails' },
              { id: 'prospecting', label: 'Prospection' },
              { id: 'diagnostic', label: 'Diagnostic' },
              { id: 'content', label: 'Contenus' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedToolFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-colors border ${
                  selectedToolFilter === f.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-600">Chargement de votre historique...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Aucun travail sauvegardé trouvé</p>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Utilisez le bouton "Sauvegarder dans l'historique" dans vos applications IA pour archiver vos travaux avec un client.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getToolBadgeColor(item.tool_type)}`}>
                        {getToolLabel(item.tool_type)}
                      </span>
                      {item.version && item.version > 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          v{item.version}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-600 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Récent'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deletingId === item.id}
                    title="Supprimer de l'historique"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Metadata & tags */}
                <div className="flex items-center gap-3 text-xs text-slate-700 font-bold flex-wrap">
                  {item.client_name && (
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <User className="w-3 h-3 text-blue-600" />
                      {item.client_name}
                    </span>
                  )}
                  {item.project_name && (
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <FolderKanban className="w-3 h-3 text-amber-600" />
                      {item.project_name}
                    </span>
                  )}
                </div>

                {item.summary && (
                  <p className="text-xs text-slate-700 line-clamp-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    {item.summary}
                  </p>
                )}

                {/* Action Load Button */}
                {onSelectWork && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWork(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all border border-blue-200 hover:border-blue-600"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Restaurer / Charger ce travail
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
