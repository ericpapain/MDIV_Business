// src/pages/admin/cafe-rencontre/AdminCafeRencontreRequests.tsx
// Tableau de bord administrateur des demandes de rendez-vous Café Rencontre

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coffee,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  X,
  MessageSquare,
  Globe,
  Tag,
  Check,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CafeRencontreRequest, RequestStatus } from '@/types/cafeRencontre';

export default function AdminCafeRencontreRequests() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeRequestModal, setActiveRequestModal] = useState<CafeRencontreRequest | null>(null);

  // Notes internes et statut en cours d'édition dans la modale
  const [modalStatus, setModalStatus] = useState<RequestStatus>('new');
  const [modalAdminNotes, setModalAdminNotes] = useState('');

  // Requête des demandes
  const { data, isLoading } = useQuery<{
    success: boolean;
    requests: CafeRencontreRequest[];
    stats: Record<string, number>;
  }>({
    queryKey: ['admin-cafe-rencontre-requests', selectedCampaignId, selectedStatus, search, selectedCity],
    queryFn: async () => {
      let url = `/api/cafe_rencontre.php?action=list_requests`;
      if (selectedCampaignId !== 'all') url += `&campaign_id=${selectedCampaignId}`;
      if (selectedStatus !== 'all') url += `&status=${selectedStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;

      const res = await fetch(url);
      const json = await res.json();
      return json;
    }
  });

  // Requête des campagnes pour le filtre
  const { data: campaignsData } = useQuery<{ success: boolean; campaigns: any[] }>({
    queryKey: ['admin-cafe-rencontre-campaigns-list-simple'],
    queryFn: async () => {
      const res = await fetch('/api/cafe_rencontre.php?action=list_campaigns');
      return res.json();
    }
  });

  const requests: CafeRencontreRequest[] = data?.requests || [];
  const stats = data?.stats || {
    total: 0, new: 0, to_contact: 0, contact_established: 0,
    to_schedule: 0, confirmed: 0, completed: 0, closed: 0
  };
  const campaigns = campaignsData?.campaigns || [];

  // Mutation mise à jour du statut et des notes internes
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!activeRequestModal) return;
      const res = await fetch('/api/cafe_rencontre.php?action=update_request_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeRequestModal.id,
          status: modalStatus,
          admin_notes: modalAdminNotes
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur de mise à jour");
      return json;
    },
    onSuccess: () => {
      toast.success("Demande mise à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-requests'] });
      setActiveRequestModal(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Impossible de mettre à jour");
    }
  });

  const handleOpenDetailModal = (req: CafeRencontreRequest) => {
    setActiveRequestModal(req);
    setModalStatus(req.status || 'new');
    setModalAdminNotes(req.admin_notes || '');
  };

  // Export CSV sécurisé UTF-8 BOM
  const handleExportCsv = () => {
    let url = `/api/cafe_rencontre.php?action=export_requests_csv`;
    if (selectedCampaignId !== 'all') url += `&campaign_id=${selectedCampaignId}`;
    if (selectedStatus !== 'all') url += `&status=${selectedStatus}`;
    url += `&include_notes=1`;
    window.open(url, '_blank');
    toast.success("Téléchargement du fichier CSV lancé !");
  };

  const statusLabels: Record<RequestStatus, { label: string; color: string }> = {
    new: { label: 'Nouvelle demande', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    to_contact: { label: 'À contacter', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    contact_established: { label: 'Contact établi', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    to_schedule: { label: 'À planifier', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    confirmed: { label: 'RDV Confirmé', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    completed: { label: 'RDV Réalisé', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
    closed: { label: 'Demande Clôturée', color: 'bg-slate-800 text-slate-400 border-slate-700' },
    cancelled: { label: 'Annulée', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' }
  };

  const formatLabels: Record<string, string> = {
    client_premises: 'Dans les locaux du client',
    cafe_public: 'Dans un café convivial',
    both: 'Les deux me conviennent'
  };

  return (
    <div className="space-y-6">
      {/* ── 1. En-tête & Export ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-white text-xl tracking-wide">
                  Café Rencontre — Demandes de Rendez-vous
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  {stats.total || 0} demande(s)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Suivez les demandes des visiteurs ayant scanné vos QR codes, gérez vos prises de contact et exportez vos données.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs rounded-xl h-10 gap-2 cursor-pointer font-bold shadow-sm"
              title="Exporter les demandes filtrées au format CSV Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exporter en CSV (Excel)</span>
            </Button>
          </div>
        </div>

        {/* ── Indicateurs Clés ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
            <span className="text-lg font-bold text-white block mt-0.5">{stats.total || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Nouvelles</span>
            <span className="text-lg font-bold text-amber-400 block mt-0.5">{stats.new || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">À contacter</span>
            <span className="text-lg font-bold text-blue-400 block mt-0.5">{stats.to_contact || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">Contact établi</span>
            <span className="text-lg font-bold text-indigo-400 block mt-0.5">{stats.contact_established || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">À planifier</span>
            <span className="text-lg font-bold text-purple-400 block mt-0.5">{stats.to_schedule || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Confirmés</span>
            <span className="text-lg font-bold text-emerald-400 block mt-0.5">{stats.confirmed || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-teal-400 block">Réalisés</span>
            <span className="text-lg font-bold text-teal-400 block mt-0.5">{stats.completed || 0}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Clôturées</span>
            <span className="text-lg font-bold text-slate-400 block mt-0.5">{stats.closed || 0}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Filtres & Recherche ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Rechercher par nom, entreprise, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl h-10"
          />
        </div>

        <div>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none h-10"
          >
            <option value="all">Toutes les campagnes ({campaigns.length})</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none h-10"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Input
            type="text"
            placeholder="Filtrer par ville..."
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl h-10"
          />
        </div>
      </div>

      {/* ── 3. Tableau des Demandes ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs">Chargement des demandes de rendez-vous...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <Coffee className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">Aucune demande enregistrée</p>
            <p className="text-xs text-slate-400">
              Les demandes soumises par vos visiteurs après scan apparaîtront automatiquement ici en temps réel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Demandeur</th>
                  <th className="py-3 px-4">Entreprise</th>
                  <th className="py-3 px-4">Intervenant Souhaité</th>
                  <th className="py-3 px-4">Campagne</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Sujet Principal</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {requests.map((req) => {
                  const st = statusLabels[req.status] || { label: req.status, color: 'bg-slate-800 text-slate-300 border-slate-700' };

                  return (
                    <tr
                      key={req.id}
                      onClick={() => handleOpenDetailModal(req)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {req.requester_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {req.company_name}
                      </td>
                      <td className="py-3.5 px-4 text-amber-300 font-semibold whitespace-nowrap">
                        {req.speaker_name || 'Intervenant BNE'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap max-w-[180px] truncate">
                        {req.campaign_title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {req.city}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[200px] truncate">
                        {req.main_topic}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-amber-400 font-semibold group-hover:underline text-[11px]">
                          Consulter →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. Modale de Fiche Détaillée & Gestion du Statut ── */}
      {activeRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg">
                    Demande de Café Rencontre #{activeRequestModal.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Reçue le {new Date(activeRequestModal.created_at).toLocaleString('fr-FR')} • Campagne : {activeRequestModal.campaign_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRequestModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Encadré Intervenant & Demandeur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                    Intervenant Sollicité
                  </span>
                  <div className="text-sm font-bold text-white">{activeRequestModal.speaker_name}</div>
                  <div className="text-xs text-slate-400">{activeRequestModal.speaker_company}</div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Demandeur
                  </span>
                  <div className="text-sm font-bold text-white">{activeRequestModal.requester_name}</div>
                  <div className="text-xs text-slate-300">{activeRequestModal.company_name} {activeRequestModal.job_title ? `(${activeRequestModal.job_title})` : ''}</div>
                  <div className="flex flex-col gap-1 pt-1 text-slate-400 text-[11px]">
                    <a href={`mailto:${activeRequestModal.email}`} className="inline-flex items-center gap-1.5 text-amber-400 hover:underline">
                      <Mail className="w-3 h-3" /> {activeRequestModal.email}
                    </a>
                    {activeRequestModal.phone && (
                      <a href={`tel:${activeRequestModal.phone}`} className="inline-flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3 h-3 text-slate-500" /> {activeRequestModal.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Sujet & Format */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Sujet Principal</span>
                    <span className="font-bold text-amber-300 text-xs block mt-0.5">{activeRequestModal.main_topic}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Format Souhaité</span>
                    <span className="font-semibold text-slate-200 text-xs block mt-0.5">
                      {formatLabels[activeRequestModal.meeting_format] || activeRequestModal.meeting_format}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Ville & Code Postal</span>
                    <span className="text-slate-200 block">{activeRequestModal.city} {activeRequestModal.postal_code ? `(${activeRequestModal.postal_code})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Disponibilité</span>
                    <span className="text-slate-200 block capitalize">{activeRequestModal.availability || 'Flexible'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Créneau Souhaité</span>
                    <span className="text-slate-200 block">{activeRequestModal.preferred_date || 'À définir'}</span>
                  </div>
                </div>

                {activeRequestModal.need_description && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Description du besoin par le demandeur
                    </span>
                    <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                      {activeRequestModal.need_description}
                    </p>
                  </div>
                )}

                {activeRequestModal.additional_comment && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Commentaire complémentaire</span>
                    <p className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-400">
                      {activeRequestModal.additional_comment}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Gestion Administrative du Statut & Notes Internes ── */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Suivi Opérationnel & Notes Confidentielles
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Modifier le Statut de la Demande
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as RequestStatus)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold h-10"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Notes Internes (Strictement confidentielles, invisibles au public)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Éric a contacté le dirigeant par téléphone le 22/11. RDV fixé le 26/11 à 14h dans leurs locaux..."
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions modale */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveRequestModal(null)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs rounded-xl h-10 px-4"
              >
                Fermer
              </Button>

              <Button
                type="button"
                onClick={() => updateStatusMutation.mutate()}
                disabled={updateStatusMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl h-10 px-5 gap-2 cursor-pointer shadow-md"
              >
                {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Enregistrer le suivi</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

