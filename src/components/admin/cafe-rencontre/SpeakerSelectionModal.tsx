// src/components/admin/cafe-rencontre/SpeakerSelectionModal.tsx
// Modale de sélection manuelle des intervenants parmi les inscrits du CMS

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Filter,
  Check,
  CheckSquare,
  Square,
  Plus,
  X,
  Building,
  Briefcase,
  Mail,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SpeakerSelectionModalProps {
  campaignId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SpeakerSelectionModal({ campaignId, isOpen, onClose, onSuccess }: SpeakerSelectionModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<number[]>([]);

  // Requête pour récupérer tous les inscrits du CMS
  const { data, isLoading } = useQuery<{ success: boolean; attendees: any[] }>({
    queryKey: ['eligible-attendees-for-campaign', campaignId, search],
    queryFn: async () => {
      const res = await fetch(`/api/cafe_rencontre.php?action=list_eligible_attendees&campaign_id=${campaignId}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      return json;
    },
    enabled: isOpen
  });

  const attendees: any[] = data?.attendees || [];

  // Entreprises uniques pour le filtre
  const companies = useMemo(() => {
    const list = attendees
      .map(a => (a.company || '').trim())
      .filter(Boolean);
    return ['all', ...Array.from(new Set(list))];
  }, [attendees]);

  // Filtrage local
  const filteredAttendees = useMemo(() => {
    return attendees.filter(a => {
      if (selectedCompany !== 'all' && (a.company || '').trim() !== selectedCompany) {
        return false;
      }
      return true;
    });
  }, [attendees, selectedCompany]);

  // Mutation d'ajout des intervenants à la campagne
  const addSpeakersMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch('/api/cafe_rencontre.php?action=add_speakers_to_campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          attendee_ids: ids
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur lors de l'ajout des intervenants");
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Intervenants ajoutés avec succès !");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['eligible-attendees-for-campaign', campaignId] });
      setSelectedAttendeeIds([]);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    }
  });

  const toggleSelectAttendee = (id: number) => {
    setSelectedAttendeeIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const available = filteredAttendees.filter(a => !a.is_already_selected).map(a => a.id);
    const allSelected = available.every(id => selectedAttendeeIds.includes(id));
    if (allSelected) {
      setSelectedAttendeeIds(prev => prev.filter(id => !available.includes(id)));
    } else {
      setSelectedAttendeeIds(prev => Array.from(new Set([...prev, ...available])));
    }
  };

  const handleSubmit = () => {
    if (selectedAttendeeIds.length === 0) {
      toast.warning("Veuillez sélectionner au moins une personne.");
      return;
    }
    addSpeakersMutation.mutate(selectedAttendeeIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête de la modale */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Sélectionner les Intervenants parmi les Inscrits
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choisissez les personnes qui seront proposées au public derrière le QR code de cette campagne.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre de Recherche et Filtres */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Rechercher par nom, entreprise, fonction ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-xs text-white placeholder:text-slate-500 rounded-xl h-10"
              />
            </div>

            {companies.length > 2 && (
              <div className="sm:w-64">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none h-10"
                >
                  <option value="all">Toutes les entreprises ({companies.length - 1})</option>
                  {companies.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div>
              <span>{filteredAttendees.length} participant(s) trouvé(s)</span>
              {selectedAttendeeIds.length > 0 && (
                <span className="ml-2 font-bold text-amber-400">
                  • {selectedAttendeeIds.length} sélectionné(s)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline underline-offset-2"
            >
              Tout cocher / décocher
            </button>
          </div>
        </div>

        {/* Liste des Inscrits */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs">Chargement des participants inscrits...</span>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Aucun participant ne correspond à votre recherche</p>
              <p className="text-xs text-slate-600">Essayez de modifier votre mot-clé ou le filtre entreprise.</p>
            </div>
          ) : (
            filteredAttendees.map((att) => {
              const isSelected = selectedAttendeeIds.includes(att.id);
              const isAlreadyAdded = Boolean(att.is_already_selected);

              return (
                <div
                  key={att.id}
                  onClick={() => {
                    if (!isAlreadyAdded) toggleSelectAttendee(att.id);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isAlreadyAdded
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md cursor-pointer'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Checkbox */}
                    <div className="shrink-0 text-slate-400">
                      {isAlreadyAdded ? (
                        <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {att.photo_url ? (
                        <img
                          src={att.photo_url}
                          alt={att.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    {/* Informations */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">
                          {att.full_name || 'Participant'}
                        </span>
                        {isAlreadyAdded && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                            Déjà dans la campagne
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                        {att.company && (
                          <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                            <Building className="w-3 h-3 text-amber-400/80" />
                            {att.company}
                          </span>
                        )}
                        {att.job_title && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Briefcase className="w-3 h-3 text-slate-500" />
                            {att.job_title}
                          </span>
                        )}
                        {att.email && (
                          <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-600" />
                            {att.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right pl-3">
                    {att.created_at && (
                      <span className="text-[10px] text-slate-600 font-mono block">
                        Inscrit le {new Date(att.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pied de page et Bouton de validation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            {selectedAttendeeIds.length === 0
              ? "Cochez une ou plusieurs personnes pour les ajouter."
              : `${selectedAttendeeIds.length} intervenant(s) prêt(s) à être ajouté(s).`}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial border-slate-800 text-slate-300 hover:bg-slate-800 text-xs rounded-xl h-10"
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={selectedAttendeeIds.length === 0 || addSpeakersMutation.isPending}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl h-10 gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {addSpeakersMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Ajouter les personnes sélectionnées à cette campagne</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

