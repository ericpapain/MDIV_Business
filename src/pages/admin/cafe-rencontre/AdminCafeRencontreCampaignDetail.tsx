// src/pages/admin/cafe-rencontre/AdminCafeRencontreCampaignDetail.tsx
// Configuration d'une campagne Café Rencontre, sélection des intervenants et gestion du QR Code

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coffee,
  Users,
  QrCode,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Clock,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Briefcase,
  MapPin,
  Tag,
  Loader2,
  Save,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CafeRencontreCampaign, CafeRencontreSpeaker } from '@/types/cafeRencontre';
import { SpeakerSelectionModal } from '@/components/admin/cafe-rencontre/SpeakerSelectionModal';
import { SpeakerEditModal } from '@/components/admin/cafe-rencontre/SpeakerEditModal';
import { CampaignQrCodeCard } from '@/components/admin/cafe-rencontre/CampaignQrCodeCard';

export default function AdminCafeRencontreCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = Number(id);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'speakers' | 'qrcode' | 'settings'>('speakers');
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<CafeRencontreSpeaker | null>(null);

  // Requête de détail de la campagne
  const { data, isLoading, refetch } = useQuery<{
    success: boolean;
    campaign: CafeRencontreCampaign;
    speakers: CafeRencontreSpeaker[];
  }>({
    queryKey: ['admin-cafe-rencontre-campaign', campaignId],
    queryFn: async () => {
      const res = await fetch(`/api/cafe_rencontre.php?action=get_campaign&id=${campaignId}`);
      const json = await res.json();
      return json;
    },
    enabled: campaignId > 0
  });

  const campaign = data?.campaign;
  const speakers: CafeRencontreSpeaker[] = data?.speakers || [];

  // Mutations pour les intervenants
  const removeSpeakerMutation = useMutation({
    mutationFn: async (speakerId: number) => {
      const res = await fetch('/api/cafe_rencontre.php?action=remove_speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: speakerId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur lors du retrait de l'intervenant");
      return json;
    },
    onSuccess: () => {
      toast.success("Intervenant retiré de cette campagne");
      refetch();
    }
  });

  const toggleSpeakerStatusMutation = useMutation({
    mutationFn: async (speaker: CafeRencontreSpeaker) => {
      const res = await fetch('/api/cafe_rencontre.php?action=update_speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: speaker.id,
          display_name: speaker.display_name,
          is_active: speaker.is_active ? 0 : 1
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      return json;
    },
    onSuccess: () => {
      toast.success("Statut de l'intervenant modifié");
      refetch();
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs">Chargement de la campagne...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center text-slate-500 space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h4 className="text-lg font-bold text-white">Campagne introuvable</h4>
        <Link to="/admin/cafe-rencontre">
          <Button variant="outline" className="mt-2 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour aux campagnes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Fil d'Ariane & Titre ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/cafe-rencontre"
              className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
              title="Retour aux campagnes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-white text-xl tracking-wide">
                  {campaign.title}
                </h2>
                {campaign.status_computed === 'active' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    En ligne
                  </span>
                )}
                {campaign.status_computed === 'expired' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
                    Expirée
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Slug public : <span className="font-mono text-amber-400">/cafe-rencontre/{campaign.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/cafe-rencontre/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Voir la page publique</span>
            </a>
          </div>
        </div>

        {/* ── 2. Navigation par Onglets ── */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'speakers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Intervenants Sélectionnés ({speakers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code & Projection</span>
          </button>
        </div>
      </div>

      {/* ── 3. CONTENU : ONGLET 1 - INTERVENANTS SÉLECTIONNÉS ── */}
      {activeTab === 'speakers' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">
                Sélection manuelle des intervenants à proposer au public
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Seules les personnes ci-dessous apparaîtront lorsque le visiteur scannera le QR code de cette conférence.
              </p>
            </div>

            <Button
              onClick={() => setIsSelectModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl h-10 gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Choisir parmi les inscrits du CMS
            </Button>
          </div>

          {speakers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Aucun intervenant sélectionné pour cette campagne</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Cliquez sur le bouton ci-dessus pour piocher dans la liste des 70 participants déjà inscrits dans votre CMS.
              </p>
              <Button
                onClick={() => setIsSelectModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Sélectionner les premiers intervenants
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {speakers.map((spk) => {
                const expertises = Array.isArray(spk.expertises) ? spk.expertises : [];

                return (
                  <div
                    key={spk.id}
                    className={`bg-slate-900/90 border rounded-2xl p-4 shadow-md flex flex-col justify-between transition-all ${
                      spk.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-50 bg-slate-950/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {spk.photo_url ? (
                            <img src={spk.photo_url} alt={spk.display_name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-slate-500" />
                          )}
                        </div>

                        {/* Profil */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-white text-base truncate">
                              {spk.display_name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md shrink-0">
                              Rang #{spk.sort_order}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-0.5">
                            {spk.company && (
                              <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                                <Building className="w-3 h-3 text-amber-400" />
                                {spk.company}
                              </span>
                            )}
                            {spk.job_title && (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                • {spk.job_title}
                              </span>
                            )}
                          </div>

                          {spk.location_zone && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {spk.location_zone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio et Sujets */}
                      {spk.bio && (
                        <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                          {spk.bio}
                        </p>
                      )}

                      {/* Tags Expertises */}
                      {expertises.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {expertises.map((exp, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions de l'intervenant */}
                    <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-medium text-slate-400">
                        {spk.requests_count || 0} demande(s) reçue(s)
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSpeakerStatusMutation.mutate(spk)}
                          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-8 px-2.5 cursor-pointer"
                          title={spk.is_active ? "Désactiver temporairement" : "Activer"}
                        >
                          {spk.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSpeaker(spk)}
                          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-8 gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Modifier</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Retirer ${spk.display_name} de cette campagne ? (Son compte et ses demandes passées restent intacts)`)) {
                              removeSpeakerMutation.mutate(spk.id);
                            }
                          }}
                          className="border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs rounded-xl h-8 px-2 cursor-pointer"
                          title="Retirer de la campagne"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. CONTENU : ONGLET 2 - QR CODE & PROJECTION ── */}
      {activeTab === 'qrcode' && (
        <CampaignQrCodeCard
          slug={campaign.slug}
          campaignTitle={campaign.title}
          isExpired={campaign.status_computed === 'expired'}
        />
      )}

      {/* Modale de Sélection des Inscrits */}
      <SpeakerSelectionModal
        campaignId={campaign.id}
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Modale d'Édition du Profil Public */}
      <SpeakerEditModal
        campaignId={campaign.id}
        speaker={editingSpeaker}
        isOpen={Boolean(editingSpeaker)}
        onClose={() => setEditingSpeaker(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

