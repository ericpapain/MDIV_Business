// src/components/admin/events/EventTombolaAdminTab.tsx
// Refonte complète du module d'administration de la Tombola :
// - Gestion intégrale des lots (Ajout, Modification, Suppression, Statut actif/inactif, Ordre)
// - Gestion avancée des photos : Upload par Drag & Drop, Galerie multi-photos, Photo principale
// - Recherche, Filtres, Compteurs statistiques en temps réel
// - Tirage CSPRNG cryptographiquement certifié SHA-256 avec registre d'audit

import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Gift,
  Trophy,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Lock,
  Calendar,
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  X,
  Star,
  Check,
  Loader2,
  BadgePercent,
  Coins,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { EventTombolaPrize, EventTombolaDraw, TombolaRulesConfig } from '@/types/eventEngine';

interface EventTombolaAdminTabProps {
  eventId: number;
}

interface PrizeFormState {
  id?: number;
  title: string;
  description: string;
  sponsor: string;
  value: string;
  draw_rank: string;
  winners_count: number;
  sort_order: number;
  is_active: boolean;
  image_url: string;
  images: string[];
}

const DEFAULT_PRIZE_FORM: PrizeFormState = {
  title: '',
  description: '',
  sponsor: '',
  value: '',
  draw_rank: '1er Prix',
  winners_count: 1,
  sort_order: 1,
  is_active: true,
  image_url: '',
  images: []
};

const RANK_SUGGESTIONS = [
  '1er Prix (Grand Gagnant)',
  '2e Prix',
  '3e Prix',
  'Prix d\'Excellence',
  'Prix Spécial Partenaire',
  'Coup de Cœur BNE',
  'Lot Immersion'
];

export function EventTombolaAdminTab({ eventId }: EventTombolaAdminTabProps) {
  const queryClient = useQueryClient();

  // Modale & formulaire de lot
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<PrizeFormState>(DEFAULT_PRIZE_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recherche & Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'drawn' | 'pending'>('all');

  // Règles de tirage
  const [rules, setRules] = useState<TombolaRulesConfig>({
    eligibility: 'checked_in_only',
    require_terms_consent: true,
    exclude_previous_winners: true,
  });

  // Query des lots et des tirages
  const { data, isLoading, refetch } = useQuery<{
    success: boolean;
    prizes: EventTombolaPrize[];
    draws: EventTombolaDraw[];
  }>({
    queryKey: ['admin-event-tombola', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_tombola_prizes&event_id=${eventId}`);
      const json = await res.json();
      return {
        success: json.success,
        prizes: json.prizes || json.data?.prizes || [],
        draws: json.draws || json.data?.draws || []
      };
    },
  });

  const prizes: EventTombolaPrize[] = data?.prizes || [];
  const draws: EventTombolaDraw[] = data?.draws || [];

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = prizes.length;
    const active = prizes.filter(p => p.is_active !== 0 && p.is_active !== false).length;
    const finished = prizes.filter(p => p.is_drawn || p.drawn_count >= p.winners_count).length;
    const pending = total - finished;
    const totalWinnersCapacity = prizes.reduce((acc, p) => acc + (p.winners_count || 1), 0);
    const totalDrawsMade = draws.length;

    return { total, active, finished, pending, totalWinnersCapacity, totalDrawsMade };
  }, [prizes, draws]);

  // Filtrage des lots
  const filteredPrizes = useMemo(() => {
    return prizes.filter(prize => {
      // Filtre textuel
      const matchesSearch = 
        prize.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prize.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prize.sponsor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prize.draw_rank || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const isActive = prize.is_active !== 0 && prize.is_active !== false;
      const isFinished = prize.is_drawn || prize.drawn_count >= prize.winners_count;

      if (statusFilter === 'active') return isActive;
      if (statusFilter === 'inactive') return !isActive;
      if (statusFilter === 'drawn') return isFinished;
      if (statusFilter === 'pending') return !isFinished;

      return true;
    });
  }, [prizes, searchQuery, statusFilter]);

  // ─── Mutations API ──────────────────────────────────────────────────────────

  // Enregistrement (Création / Modification)
  const savePrizeMutation = useMutation({
    mutationFn: async (payload: PrizeFormState) => {
      const res = await fetch('/api/event_engine.php?action=save_tombola_prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          id: payload.id,
          title: payload.title,
          description: payload.description,
          sponsor: payload.sponsor,
          value: payload.value,
          draw_rank: payload.draw_rank,
          winners_count: Number(payload.winners_count || 1),
          sort_order: Number(payload.sort_order || 1),
          is_active: payload.is_active ? 1 : 0,
          image_url: payload.image_url,
          images: payload.images
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur lors de la sauvegarde du lot');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      queryClient.invalidateQueries({ queryKey: ['home-tombola-prizes'] });
      setIsModalOpen(false);
      setEditingPrize(DEFAULT_PRIZE_FORM);
      toast.success(variables.id ? 'Lot modifié avec succès !' : 'Nouveau lot ajouté avec succès !');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Impossible de sauvegarder le lot');
    },
  });

  // Suppression
  const deletePrizeMutation = useMutation({
    mutationFn: async (prizeId: number) => {
      const res = await fetch('/api/event_engine.php?action=delete_tombola_prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prize_id: prizeId, event_id: eventId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur de suppression');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      queryClient.invalidateQueries({ queryKey: ['home-tombola-prizes'] });
      toast.success('Lot supprimé de la tombola');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Impossible de supprimer ce lot');
    }
  });

  // Toggle Actif / Inactif
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ prizeId, isActive }: { prizeId: number; isActive: boolean }) => {
      const res = await fetch('/api/event_engine.php?action=toggle_tombola_prize_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prize_id: prizeId, is_active: isActive ? 1 : 0 }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur statut');
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      queryClient.invalidateQueries({ queryKey: ['home-tombola-prizes'] });
      toast.success(variables.isActive ? 'Lot activé (visible sur le site public)' : 'Lot désactivé (masqué du site public)');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur de mise à jour du statut');
    }
  });

  // Réordonnancement (Monter / Descendre)
  const reorderMutation = useMutation({
    mutationFn: async (updatedPrizes: { id: number; sort_order: number }[]) => {
      const res = await fetch('/api/event_engine.php?action=reorder_tombola_prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, prizes: updatedPrizes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur réordonnancement');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      queryClient.invalidateQueries({ queryKey: ['home-tombola-prizes'] });
      toast.success('Ordre des lots mis à jour');
    }
  });

  // Exécution du tirage au sort CSPRNG
  const executeDrawMutation = useMutation({
    mutationFn: async (prizeId: number) => {
      const res = await fetch('/api/event_engine.php?action=execute_tombola_draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          prize_id: prizeId,
          rules,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Impossible de réaliser le tirage');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      queryClient.invalidateQueries({ queryKey: ['home-tombola-prizes'] });
      toast.success(`🎉 Gagnant tiré au sort : ${data.draw?.winner_name} (Ticket ${data.draw?.winner_ticket_code})`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors du tirage au sort');
    },
  });

  // Réinitialisation des tirages
  const resetDrawsMutation = useMutation({
    mutationFn: async (prizeId?: number) => {
      const res = await fetch('/api/event_engine.php?action=reset_tombola_draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, prize_id: prizeId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      toast.success('Historique des tirages réinitialisé');
    },
  });

  // ─── Handlers Photos & Upload ──────────────────────────────────────────────

  const handleOpenAddModal = () => {
    setEditingPrize({
      ...DEFAULT_PRIZE_FORM,
      sort_order: prizes.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prize: EventTombolaPrize) => {
    const rawImages = Array.isArray(prize.images) 
      ? prize.images 
      : (prize.image_url ? [prize.image_url] : []);

    setEditingPrize({
      id: prize.id,
      title: prize.title || '',
      description: prize.description || '',
      sponsor: prize.sponsor || '',
      value: prize.value || '',
      draw_rank: prize.draw_rank || '1er Prix',
      winners_count: prize.winners_count || 1,
      sort_order: prize.sort_order || 1,
      is_active: prize.is_active !== 0 && prize.is_active !== false,
      image_url: prize.image_url || rawImages[0] || '',
      images: rawImages
    });
    setIsModalOpen(true);
  };

  // Compression automatique côté client et upload image
  const uploadImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Optimisation de l'image (max 1600px width/height via HTML5 Canvas)
      const optimizedBlob = await new Promise<Blob>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 1600;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.88);
            } else {
              resolve(file);
            }
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append('file', optimizedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));

      const res = await fetch('/api-admin.php?action=upload_image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        const newUrl = data.url;
        setEditingPrize(prev => {
          const updatedImages = [...prev.images, newUrl];
          return {
            ...prev,
            images: updatedImages,
            // Si aucune image principale n'est définie, la nouvelle le devient
            image_url: prev.image_url || newUrl
          };
        });
        toast.success('Photo importée et optimisée avec succès !');
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur réseau lors de l\'envoi de la photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        uploadImageFile(file);
      } else {
        toast.error('Veuillez déposer un fichier image (JPG, PNG, WEBP)');
      }
    }
  };

  const handleSetPrimaryImage = (url: string) => {
    setEditingPrize(prev => ({ ...prev, image_url: url }));
    toast.success('Photo principale mise à jour');
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setEditingPrize(prev => {
      const newImages = prev.images.filter(u => u !== urlToRemove);
      let newPrimary = prev.image_url;
      if (newPrimary === urlToRemove) {
        newPrimary = newImages[0] || '';
      }
      return {
        ...prev,
        images: newImages,
        image_url: newPrimary
      };
    });
  };

  // Monter / Descendre l'ordre
  const handleMoveOrder = (prizeId: number, direction: 'up' | 'down') => {
    const sorted = [...prizes].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const currentIndex = sorted.findIndex(p => p.id === prizeId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    // Échanger les sort_order
    const currentPrize = sorted[currentIndex];
    const targetPrize = sorted[targetIndex];

    const currentOrder = currentPrize.sort_order || currentIndex + 1;
    const targetOrder = targetPrize.sort_order || targetIndex + 1;

    const payload = [
      { id: currentPrize.id, sort_order: targetOrder },
      { id: targetPrize.id, sort_order: currentOrder }
    ];

    reorderMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1. Header & Statistiques Synthétiques ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-white text-lg tracking-wide">
                  Configuration & Tirage de la Tombola
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  CMS Actif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Créez les lots, insérez vos photos et déclenchez les tirages certifiés SHA-256 visibles en direct sur le site public.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Ajouter un Nouveau Lot
            </Button>

            {draws.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Voulez-vous vraiment réinitialiser l\'ensemble des tirages effectués pour cet événement ?')) {
                    resetDrawsMutation.mutate();
                  }
                }}
                disabled={resetDrawsMutation.isPending}
                className="border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs rounded-xl gap-1.5 h-10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser les Tirages
              </Button>
            )}
          </div>
        </div>

        {/* 4 Compteurs Clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total des Lots</div>
              <div className="text-xl font-display font-extrabold text-white mt-0.5">{stats.total}</div>
            </div>
            <Trophy className="w-5 h-5 text-amber-400/60" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Lots Actifs en Ligne</div>
              <div className="text-xl font-display font-extrabold text-emerald-400 mt-0.5">{stats.active}</div>
            </div>
            <Eye className="w-5 h-5 text-emerald-400/60" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Lots Déjà Tirés</div>
              <div className="text-xl font-display font-extrabold text-amber-300 mt-0.5">{stats.finished}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-amber-400/60" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gagnants Certifiés</div>
              <div className="text-xl font-display font-extrabold text-white mt-0.5">{stats.totalDrawsMade} / {stats.totalWinnersCapacity}</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-blue-400/60" />
          </div>
        </div>
      </div>

      {/* ── 2. Paramètres de Sécurité & Éligibilité ── */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Règles d'Éligibilité & Sécurité du Tirage (CSPRNG SHA-256)
          </h4>
          <span className="text-[10.5px] text-slate-400 font-mono">Algorithme garanti sans biais</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/70 text-slate-300 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={rules.eligibility === 'checked_in_only'}
              onChange={(e) =>
                setRules({ ...rules, eligibility: e.target.checked ? 'checked_in_only' : 'all' })
              }
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="leading-tight">Présents uniquement (émargement scanné ou validé)</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/70 text-slate-300 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={rules.exclude_previous_winners}
              onChange={(e) => setRules({ ...rules, exclude_previous_winners: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="leading-tight">Exclure les gagnants des tirages précédents</span>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/70 text-slate-300 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={rules.require_terms_consent}
              onChange={(e) => setRules({ ...rules, require_terms_consent: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="leading-tight">Consentement au règlement obligatoire</span>
          </label>
        </div>
      </div>

      {/* ── 3. Barre de Recherche & Filtres Rapides ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un lot par titre, sponsor, rang ou description..."
            className="pl-9 bg-slate-900 border-slate-800 rounded-xl text-xs text-white h-10 placeholder:text-slate-500 focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tous les Lots', count: stats.total },
            { id: 'active', label: 'Actifs (En Ligne)', count: stats.active },
            { id: 'inactive', label: 'Inactifs', count: stats.total - stats.active },
            { id: 'pending', label: 'À Tirer', count: stats.pending },
            { id: 'drawn', label: 'Tirés', count: stats.finished },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Grille des Lots (Cartes Modernes avec Photos) ── */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-xs text-slate-400">Chargement des lots de tombola...</p>
        </div>
      ) : filteredPrizes.length === 0 ? (
        <div className="py-14 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
          <Gift className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">Aucun lot ne correspond aux critères</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? "Modifiez votre recherche ou réinitialisez les filtres." : "Commencez par ajouter votre premier lot de tombola avec ses photos."}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleOpenAddModal}
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" /> Créer un premier lot
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrizes.map((prize, index) => {
            const prizeDraws = draws.filter((d) => d.prize_id === prize.id);
            const remaining = Math.max(0, prize.winners_count - prizeDraws.length);
            const isFinished = remaining === 0;
            const isActive = prize.is_active !== 0 && prize.is_active !== false;
            const imagesList = Array.isArray(prize.images) 
              ? prize.images 
              : (prize.image_url ? [prize.image_url] : []);
            const mainImage = prize.image_url || imagesList[0] || null;

            return (
              <div
                key={prize.id}
                className={`group bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-md relative overflow-hidden ${
                  !isActive 
                    ? 'border-slate-800/60 opacity-60 bg-slate-950/40' 
                    : isFinished 
                    ? 'border-emerald-500/30 bg-emerald-950/10' 
                    : 'border-slate-800 hover:border-amber-500/40 hover:shadow-amber-500/5'
                }`}
              >
                {/* Image miniature avec badges */}
                <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={prize.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950/90 gap-1.5">
                      <Gift className="w-8 h-8 text-slate-700" />
                      <span className="text-[10px] text-slate-500 font-mono">Aucune photo</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40 pointer-events-none" />

                  {/* Badges haut gauche */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-md">
                      {prize.draw_rank || `${index + 1}e Prix`}
                    </span>
                    {prize.value && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-white/10 backdrop-blur-xs">
                        {prize.value}
                      </span>
                    )}
                  </div>

                  {/* Badges haut droite : Statut actif & Ordre */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleStatusMutation.mutate({ prizeId: prize.id, isActive: !isActive })}
                      title={isActive ? "Lot actif (cliquer pour désactiver)" : "Lot inactif (cliquer pour activer)"}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-500/90 text-slate-950 hover:bg-emerald-400' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>

                    <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(prize.id, 'up')}
                        title="Monter"
                        className="p-1 hover:text-amber-400 text-slate-400 cursor-pointer"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(prize.id, 'down')}
                        title="Descendre"
                        className="p-1 hover:text-amber-400 text-slate-400 cursor-pointer"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Badge bas gauche : Nombre de photos si galerie */}
                  {imagesList.length > 1 && (
                    <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-slate-300 backdrop-blur-xs border border-white/10">
                      <ImageIcon size={10} />
                      <span>{imagesList.length} photos</span>
                    </div>
                  )}

                  {/* Badge bas droite : Disponibilité */}
                  <div className="absolute bottom-2 right-2.5">
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                      isFinished 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                    }`}>
                      {remaining} / {prize.winners_count} restant{remaining > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {prize.title}
                    </h5>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {prize.description || "Aucune description détaillée."}
                  </p>

                  {prize.sponsor && (
                    <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1 pt-0.5 truncate">
                      <span className="text-slate-500">Offert par :</span>
                      <span className="font-semibold">{prize.sponsor}</span>
                    </div>
                  )}
                </div>

                {/* Gagnants déjà tirés pour ce lot */}
                {prizeDraws.length > 0 && (
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl text-xs space-y-1">
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Gagnant{prizeDraws.length > 1 ? 's' : ''} certifié{prizeDraws.length > 1 ? 's' : ''} :</span>
                      <button
                        onClick={() => {
                          if (confirm(`Réinitialiser les tirages pour le lot "${prize.title}" ?`)) {
                            resetDrawsMutation.mutate(prize.id);
                          }
                        }}
                        className="text-[9px] text-slate-500 hover:text-rose-400 underline cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                    {prizeDraws.map((d) => (
                      <div key={d.id} className="text-emerald-400 font-medium flex items-center justify-between gap-2 truncate">
                        <span className="truncate">• {d.winner_name}</span>
                        <span className="text-[10px] font-mono text-amber-300 shrink-0">{d.winner_ticket_code}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions au bas de la carte */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(prize)}
                    className="flex-1 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs rounded-xl h-9 gap-1.5"
                  >
                    <Edit3 size={13} />
                    <span>Modifier</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Voulez-vous vraiment supprimer le lot "${prize.title}" ?`)) {
                        deletePrizeMutation.mutate(prize.id);
                      }
                    }}
                    className="border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs rounded-xl h-9 px-2.5"
                  >
                    <Trash2 size={13} />
                  </Button>

                  <Button
                    type="button"
                    onClick={() => executeDrawMutation.mutate(prize.id)}
                    disabled={isFinished || !isActive || executeDrawMutation.isPending}
                    className={`flex-1 text-xs font-bold rounded-xl h-9 gap-1.5 shadow-sm transition-all cursor-pointer ${
                      isFinished
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : !isActive
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                    }`}
                  >
                    <Play size={12} className="fill-current" />
                    <span>{isFinished ? 'Tiré' : 'Tirer au sort'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Registre Cryptographique des Tirages (Audit SHA-256) ── */}
      {draws.length > 0 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden mt-8 shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Registre d'Audit Cryptographique des Tirages (SHA-256)
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {draws.length} tirage{draws.length > 1 ? 's' : ''} certifié{draws.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                  <th className="py-3 px-4">Lot Remporté</th>
                  <th className="py-3 px-4">Gagnant Certifié</th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Empreinte SHA-256 (Inviolable)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {draws.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{d.prize_title}</td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold">{d.winner_name}</span>
                      {d.winner_company && <span className="text-slate-400 ml-1.5 text-[11px]">({d.winner_company})</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">{d.winner_ticket_code}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(d.drawn_at).toLocaleString('fr-FR')}</td>
                    <td className="py-3 px-4 font-mono text-[10.5px] text-slate-500 truncate max-w-[240px]" title={d.draw_hash}>
                      {d.draw_hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Modale Complète d'Ajout / Modification de Lot (Photos & Galerie) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
            
            {/* Header Modale */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">
                    {editingPrize.id ? "Modifier le Lot de Tombola" : "Ajouter un Lot de Tombola"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Renseignez les détails, photos et rang pour l'affichage en vitrine et le tirage.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulaire */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                savePrizeMutation.mutate(editingPrize);
              }}
              className="space-y-4"
            >
              {/* Ligne 1 : Titre & Rang */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Nom du Lot <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    required
                    value={editingPrize.title}
                    onChange={(e) => setEditingPrize({ ...editingPrize, title: e.target.value })}
                    placeholder="ex: 1 An d'Incubation & Mentorat MDIV"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Rang de Tirage
                  </label>
                  <Input
                    value={editingPrize.draw_rank}
                    onChange={(e) => setEditingPrize({ ...editingPrize, draw_rank: e.target.value })}
                    placeholder="ex: 1er Prix"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Suggestions rapides de rangs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500">Suggestions :</span>
                {RANK_SUGGESTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditingPrize({ ...editingPrize, draw_rank: r })}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      editingPrize.draw_rank === r 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' 
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Ligne 2 : Valeur estimée, Quantité & Sponsor */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Valeur Estimée <span className="text-slate-500 font-normal">(optionnel)</span>
                  </label>
                  <Input
                    value={editingPrize.value}
                    onChange={(e) => setEditingPrize({ ...editingPrize, value: e.target.value })}
                    placeholder="ex: 1 500 € ou Offert"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Nombre de Gagnants / Quantité <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editingPrize.winners_count}
                    onChange={(e) => setEditingPrize({ ...editingPrize, winners_count: parseInt(e.target.value, 10) || 1 })}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Sponsor / Donateur
                  </label>
                  <Input
                    value={editingPrize.sponsor}
                    onChange={(e) => setEditingPrize({ ...editingPrize, sponsor: e.target.value })}
                    placeholder="ex: BNE Club Privé"
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Ligne 3 : Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Description Complète du Lot
                </label>
                <textarea
                  rows={2}
                  value={editingPrize.description}
                  onChange={(e) => setEditingPrize({ ...editingPrize, description: e.target.value })}
                  placeholder="Détaillez les prestations, conditions et dotations incluses dans ce lot..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              {/* ── SECTION PHOTOS DU LOT & GALERIE ── */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-amber-400" />
                    Photos du Lot (Galerie & Photo Principale)
                  </label>
                  <span className="text-[10.5px] text-slate-400">
                    Optimisation automatique avant enregistrement
                  </span>
                </div>

                {/* Zone de Drag and Drop */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    dragOver 
                      ? 'border-amber-400 bg-amber-500/10' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={(e) => {
                      if (e.target.files?.[0]) uploadImageFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 border border-slate-800">
                      {isUploading ? <Loader2 size={18} className="animate-spin text-amber-400" /> : <Upload size={18} />}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-300 font-medium">
                        {isUploading ? "Compression & Envoi en cours..." : "Glissez-déposez une image ici ou"}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer disabled:opacity-50"
                      >
                        parcourir vos fichiers
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      Formats supportés : JPG, PNG, WEBP — Dimension auto-redimensionnée
                    </span>
                  </div>
                </div>

                {/* Saisie URL Manuelle (Fallback) */}
                <div className="flex items-center gap-2">
                  <Input
                    type="url"
                    placeholder="Ou collez l'URL directe d'une photo (https://...)"
                    value={editingPrize.image_url}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingPrize(prev => ({
                        ...prev,
                        image_url: val,
                        images: val && !prev.images.includes(val) ? [val, ...prev.images] : prev.images
                      }));
                    }}
                    className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs h-9"
                  />
                  {editingPrize.image_url && !editingPrize.images.includes(editingPrize.image_url) && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setEditingPrize(prev => ({
                          ...prev,
                          images: [...prev.images, prev.image_url]
                        }));
                        toast.success('Ajoutée à la galerie');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-9 rounded-xl"
                    >
                      Ajouter
                    </Button>
                  )}
                </div>

                {/* Prévisualisation de la Galerie */}
                {editingPrize.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">
                      Photos enregistrées ({editingPrize.images.length}) :
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {editingPrize.images.map((imgUrl, i) => {
                        const isPrimary = editingPrize.image_url === imgUrl;
                        return (
                          <div
                            key={i}
                            className={`relative aspect-[4/3] rounded-xl overflow-hidden border group bg-slate-950 ${
                              isPrimary ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800'
                            }`}
                          >
                            <img src={imgUrl} alt={`Lot ${i+1}`} className="w-full h-full object-cover" />

                            {/* Badge principale */}
                            {isPrimary && (
                              <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow-md flex items-center gap-0.5">
                                <Star size={9} className="fill-current" /> Principale
                              </div>
                            )}

                            {/* Actions survol */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(imgUrl)}
                                  title="Définir comme photo principale"
                                  className="p-1 rounded-md bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer"
                                >
                                  <Star size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(imgUrl)}
                                title="Supprimer cette photo"
                                className="p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Statut Actif & Ordre d'affichage */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrize.is_active}
                    onChange={(e) => setEditingPrize({ ...editingPrize, is_active: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span className="font-medium">Lot actif (visible immédiatement sur le site public)</span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Position :</span>
                  <input
                    type="number"
                    min={1}
                    value={editingPrize.sort_order}
                    onChange={(e) => setEditingPrize({ ...editingPrize, sort_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-center text-xs"
                  />
                </div>
              </div>

              {/* Boutons Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs h-10 px-4"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={savePrizeMutation.isPending || isUploading}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs h-10 px-6 cursor-pointer shadow-md"
                >
                  {savePrizeMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check size={14} className="mr-1.5" />
                      {editingPrize.id ? "Mettre à jour le Lot" : "Créer le Lot"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
