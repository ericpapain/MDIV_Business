// src/pages/admin/cafe-rencontre/AdminCafeRencontreCampaigns.tsx
// Rubrique CMS : Café Rencontre → Mes Campagnes

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Plus,
  QrCode,
  Users,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sparkles,
  MapPin,
  Loader2,
  Check,
  X,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CafeRencontreCampaign, CampaignValidityType } from '@/types/cafeRencontre';
import { CampaignQrCodeCard } from '@/components/admin/cafe-rencontre/CampaignQrCodeCard';

export default function AdminCafeRencontreCampaigns() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'disabled'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CafeRencontreCampaign | null>(null);
  const [activeQrModalCampaign, setActiveQrModalCampaign] = useState<CafeRencontreCampaign | null>(null);

  // Form State pour la création/modification de campagne
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formValidityType, setFormValidityType] = useState<CampaignValidityType>('12h');
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formContactUrl, setFormContactUrl] = useState('/contact');
  const [formIsActive, setFormIsActive] = useState(true);

  // Requête des campagnes
  const { data, isLoading } = useQuery<{ success: boolean; campaigns: CafeRencontreCampaign[] }>({
    queryKey: ['admin-cafe-rencontre-campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/cafe_rencontre.php?action=list_campaigns');
      const json = await res.json();
      return json;
    }
  });

  const campaigns: CafeRencontreCampaign[] = data?.campaigns || [];

  // Statistiques synthétiques
  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter(c => c.status_computed === 'active').length;
    const expired = campaigns.filter(c => c.status_computed === 'expired').length;
    const totalRequests = campaigns.reduce((acc, c) => acc + (c.requests_count || 0), 0);
    const totalViews = campaigns.reduce((acc, c) => acc + (c.views_count || 0), 0);
    return { total, active, expired, totalRequests, totalViews };
  }, [campaigns]);

  // Filtrage
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (statusFilter !== 'all' && c.status_computed !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.location || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [campaigns, statusFilter, search]);

  // Mutations
  const saveCampaignMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cafe_rencontre.php?action=save_campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCampaign?.id || 0,
          title: formTitle,
          slug: formSlug,
          description: formDesc,
          event_date: formDate || null,
          location: formLocation,
          image_url: formImage,
          validity_type: formValidityType,
          starts_at: formStartsAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          expires_at: formValidityType === 'custom' ? formExpiresAt : null,
          contact_redirect_url: formContactUrl,
          is_active: formIsActive ? 1 : 0
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur d'enregistrement");
      return json;
    },
    onSuccess: (resData) => {
      toast.success(editingCampaign ? "Campagne modifiée avec succès" : "Campagne créée avec succès !");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaigns'] });
      setIsCreateModalOpen(false);
      setEditingCampaign(null);
      // Rediriger vers la configuration des intervenants si nouvelle création
      if (!editingCampaign && resData.campaign_id) {
        navigate(`/admin/cafe-rencontre/campagnes/${resData.campaign_id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'enregistrement de la campagne");
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/cafe_rencontre.php?action=delete_campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur de suppression");
      return json;
    },
    onSuccess: () => {
      toast.success("Campagne supprimée");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaigns'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch('/api/cafe_rencontre.php?action=toggle_campaign_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      return json;
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaigns'] });
    }
  });

  const extendValidityMutation = useMutation({
    mutationFn: async ({ id, hours }: { id: number; hours: number }) => {
      const res = await fetch('/api/cafe_rencontre.php?action=extend_campaign_validity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, hours })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Campagne prolongée avec succès !");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaigns'] });
    }
  });

  const handleOpenCreateModal = (camp?: CafeRencontreCampaign) => {
    if (camp) {
      setEditingCampaign(camp);
      setFormTitle(camp.title);
      setFormSlug(camp.slug);
      setFormDesc(camp.description || '');
      setFormDate(camp.event_date || '');
      setFormLocation(camp.location || '');
      setFormImage(camp.image_url || '');
      setFormValidityType(camp.validity_type || '12h');
      setFormStartsAt(camp.starts_at ? camp.starts_at.replace(' ', 'T').substring(0, 16) : '');
      setFormExpiresAt(camp.expires_at ? camp.expires_at.replace(' ', 'T').substring(0, 16) : '');
      setFormContactUrl(camp.contact_redirect_url || '/contact');
      setFormIsActive(Boolean(camp.is_active));
    } else {
      setEditingCampaign(null);
      setFormTitle('');
      setFormSlug('');
      setFormDesc('');
      setFormDate(new Date().toISOString().substring(0, 10));
      setFormLocation('');
      setFormImage('');
      setFormValidityType('12h');
      const nowParis = new Date().toISOString().substring(0, 16);
      setFormStartsAt(nowParis);
      setFormExpiresAt('');
      setFormContactUrl('/contact');
      setFormIsActive(true);
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. En-tête et Titre du Module ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-white text-xl tracking-wide">
                  Café Rencontre — Mes Campagnes
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  QR Code 30 Minutes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Créez une campagne par conférence ou événement, sélectionnez manuellement les intervenants à afficher et diffusez votre QR code sur grand écran.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/admin/cafe-rencontre/demandes">
              <Button
                variant="outline"
                className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-10 gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Voir les Demandes ({stats.totalRequests})</span>
              </Button>
            </Link>

            <Button
              onClick={() => handleOpenCreateModal()}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nouvelle Campagne
            </Button>
          </div>
        </div>

        {/* ── 4 Compteurs KPI ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Campagnes</div>
            <div className="text-xl font-display font-extrabold text-white mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">En Cours (Actives)</div>
            <div className="text-xl font-display font-extrabold text-emerald-400 mt-0.5">{stats.active}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Expirées / Fermées</div>
            <div className="text-xl font-display font-extrabold text-rose-400 mt-0.5">{stats.expired}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Demandes de RDV</div>
            <div className="text-xl font-display font-extrabold text-amber-300 mt-0.5">{stats.totalRequests}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Scans & Visites</div>
            <div className="text-xl font-display font-extrabold text-cyan-400 mt-0.5">{stats.totalViews}</div>
          </div>
        </div>
      </div>

      {/* ── 2. Filtres & Recherche ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Rechercher par titre de campagne, lieu, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl h-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'active', 'expired', 'disabled'] as const).map((st) => {
            const labels = {
              all: 'Toutes les campagnes',
              active: 'Actives',
              expired: 'Expirées',
              disabled: 'Désactivées'
            };
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Grille des Campagnes ── */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs">Chargement de vos campagnes Café Rencontre...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="py-20 text-center text-slate-500 space-y-3 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
          <Coffee className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">Aucune campagne Café Rencontre trouvée</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Créez votre première opération pour afficher un QR code sur votre écran de conférence et permettre aux visiteurs de choisir un intervenant pour un café de 30 minutes.
          </p>
          <Button
            onClick={() => handleOpenCreateModal()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl mt-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Créer ma première campagne
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCampaigns.map((camp) => {
            const isAct = camp.status_computed === 'active';
            const isExp = camp.status_computed === 'expired';
            const isDis = camp.status_computed === 'disabled';

            return (
              <div
                key={camp.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Badge statut et QR button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {isAct && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          QR Code Ouvert
                        </span>
                      )}
                      {isExp && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
                          <Clock className="w-3 h-3" /> Expiré (Fermé)
                        </span>
                      )}
                      {isDis && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold">
                          Désactivé
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-500">
                        {camp.validity_type === 'unlimited' ? 'Sans expiration' : `Validité : ${camp.validity_type}`}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveQrModalCampaign(camp)}
                      className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs rounded-xl h-8 gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>Voir QR Code</span>
                    </Button>
                  </div>

                  {/* Titre & Description */}
                  <Link
                    to={`/admin/cafe-rencontre/campagnes/${camp.id}`}
                    className="font-display font-bold text-white text-lg hover:text-amber-400 transition-colors block"
                  >
                    {camp.title}
                  </Link>
                  {camp.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  )}

                  {/* Métadonnées : Date, Lieu, Expiration */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                    {camp.event_date && (
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(camp.event_date).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {camp.location && (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {camp.location}
                      </span>
                    )}
                    {camp.expires_at && (
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${isExp ? 'text-rose-400' : 'text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Expire le {new Date(camp.expires_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Métriques : Intervenants, Demandes, Scans */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950/60 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Intervenants</span>
                      <span className="text-sm font-bold text-white mt-0.5 block">{camp.speakers_count || 0}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Demandes RDV</span>
                      <span className="text-sm font-bold text-amber-300 mt-0.5 block">{camp.requests_count || 0}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Scans QR</span>
                      <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{camp.views_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Actions au pied de la carte */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Prolonger la validité si expirée ou proche */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => extendValidityMutation.mutate({ id: camp.id, hours: 12 })}
                      title="Prolonger de 12 heures supplémentaires"
                      className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-8 px-2.5 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 mr-1 text-emerald-400" /> +12h
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCreateModal(camp)}
                      className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-8 px-2.5 cursor-pointer"
                      title="Modifier les informations de la campagne"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment supprimer la campagne "${camp.title}" ?`)) {
                          deleteCampaignMutation.mutate(camp.id);
                        }
                      }}
                      className="border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs rounded-xl h-8 px-2.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <Link to={`/admin/cafe-rencontre/campagnes/${camp.id}`}>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl h-8 gap-1.5 cursor-pointer"
                    >
                      <span>Gérer les Intervenants</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Modale de Création / Modification de Campagne ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg">
                    {editingCampaign ? "Modifier la Campagne" : "Créer une Nouvelle Campagne Café Rencontre"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Définissez les paramètres de l'événement et la période de validité du QR code.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCampaignMutation.mutate();
              }}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
            >
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Nom de la Campagne / Conférence *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="ex: Réseau en Action – Novembre 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Date de l'événement
                  </label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Lieu ou Ville
                  </label>
                  <Input
                    type="text"
                    placeholder="ex: Troyes, Reims, Paris..."
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description de l'opération (facultative)
                </label>
                <textarea
                  rows={2}
                  placeholder="Donnez du contexte à vos visiteurs qui scannent le QR code..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* ── Durée de Validité du QR Code ── */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Durée de Validité du QR Code (Fuseau Europe/Paris)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Après cette période, le QR code affichera automatiquement la page de fermeture avec le bouton vers la page Contact.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                  {(['1h', '3h', '6h', '12h', '24h', '48h', '7d', 'unlimited', 'custom'] as const).map((vt) => {
                    const vtLabels: Record<string, string> = {
                      '1h': '1 Heure',
                      '3h': '3 Heures',
                      '6h': '6 Heures',
                      '12h': '12 Heures',
                      '24h': '24 Heures',
                      '48h': '48 Heures',
                      '7d': '7 Jours',
                      'unlimited': 'Sans fin',
                      'custom': 'Personnalisée'
                    };
                    return (
                      <button
                        type="button"
                        key={vt}
                        onClick={() => setFormValidityType(vt)}
                        className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                          formValidityType === vt
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {vtLabels[vt]}
                      </button>
                    );
                  })}
                </div>

                {formValidityType === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Date & Heure d'Ouverture
                      </label>
                      <Input
                        type="datetime-local"
                        value={formStartsAt}
                        onChange={(e) => setFormStartsAt(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl h-9"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                        Date & Heure de Fermeture (Expiration)
                      </label>
                      <Input
                        type="datetime-local"
                        value={formExpiresAt}
                        onChange={(e) => setFormExpiresAt(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl h-9"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Lien de redirection après fermeture
                  </label>
                  <Input
                    type="text"
                    value={formContactUrl}
                    onChange={(e) => setFormContactUrl(e.target.value)}
                    placeholder="/contact"
                    className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-xs">
                      {formIsActive ? 'Campagne Activée' : 'Campagne Désactivée'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs rounded-xl h-10 px-4"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={saveCampaignMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl h-10 px-5 gap-2 cursor-pointer shadow-md"
                >
                  {saveCampaignMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingCampaign ? "Mettre à jour" : "Créer et Choisir les Intervenants"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Modale d'Affichage & Export Rapide du QR Code ── */}
      {activeQrModalCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setActiveQrModalCampaign(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <CampaignQrCodeCard
              slug={activeQrModalCampaign.slug}
              campaignTitle={activeQrModalCampaign.title}
              isExpired={activeQrModalCampaign.status_computed === 'expired'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

