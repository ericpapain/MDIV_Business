// src/components/admin/cafe-rencontre/SpeakerEditModal.tsx
// Modale de personnalisation des informations publiques d'un intervenant Café Rencontre

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Edit3,
  X,
  User,
  Briefcase,
  Building,
  Image as ImageIcon,
  MapPin,
  Tag,
  MessageSquare,
  FileText,
  Save,
  Loader2,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CafeRencontreSpeaker } from '@/types/cafeRencontre';

interface SpeakerEditModalProps {
  campaignId: number;
  speaker: CafeRencontreSpeaker | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SpeakerEditModal({ campaignId, speaker, isOpen, onClose, onSuccess }: SpeakerEditModalProps) {
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [expertisesStr, setExpertisesStr] = useState('');
  const [topics, setTopics] = useState('');
  const [locationZone, setLocationZone] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (speaker) {
      setDisplayName(speaker.display_name || '');
      setJobTitle(speaker.job_title || '');
      setCompany(speaker.company || '');
      setPhotoUrl(speaker.photo_url || '');
      setBio(speaker.bio || '');
      const expList = Array.isArray(speaker.expertises)
        ? speaker.expertises.join(', ')
        : (speaker.expertises || '');
      setExpertisesStr(expList);
      setTopics(speaker.topics || '');
      setLocationZone(speaker.location_zone || '');
      setSortOrder(speaker.sort_order || 1);
      setIsActive(Boolean(speaker.is_active));
    }
  }, [speaker]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!speaker) return;
      const expertises = expertisesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/cafe_rencontre.php?action=update_speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: speaker.id,
          display_name: displayName,
          job_title: jobTitle,
          company,
          photo_url: photoUrl,
          bio,
          expertises,
          topics,
          location_zone: locationZone,
          sort_order: sortOrder,
          is_active: isActive ? 1 : 0
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur de mise à jour");
      return json;
    },
    onSuccess: () => {
      toast.success("Profil public de l'intervenant mis à jour !");
      queryClient.invalidateQueries({ queryKey: ['admin-cafe-rencontre-campaign', campaignId] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Impossible d'enregistrer les modifications");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.warning("Le nom de l'intervenant est obligatoire");
      return;
    }
    updateMutation.mutate();
  };

  if (!isOpen || !speaker) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Personnaliser le Profil Public
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ces informations apparaîtront sur la page publique. Le compte original reste intact.
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Aperçu Avatar et Nom */}
          <div className="flex items-center gap-4 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
              {photoUrl ? (
                <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-slate-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                URL de la Photo
              </label>
              <Input
                type="text"
                placeholder="https://... ou /assets/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Nom & Prénom affichés *
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Fonction / Titre
              </label>
              <Input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="ex: Co-fondateur & CTO"
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Entreprise ou Organisation
              </label>
              <Input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ex: MDIV Business"
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Zone géographique / Ville d'intervention
              </label>
              <Input
                type="text"
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                placeholder="ex: Paris, Troyes, Suisse..."
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Domaines d'expertise (séparés par des virgules)
            </label>
            <Input
              type="text"
              value={expertisesStr}
              onChange={(e) => setExpertisesStr(e.target.value)}
              placeholder="ex: Intelligence Artificielle, Stratégie Commerciale, Financement"
              className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Courte biographie ou présentation
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez brièvement l'intervenant pour donner envie aux participants de le rencontrer..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Sujets sur lesquels la personne peut échanger
            </label>
            <textarea
              rows={2}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="ex: Analyse de vos besoins, audit express, retour d'expérience sur vos outils..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Ordre d'affichage
              </label>
              <Input
                type="number"
                min={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl h-9 w-28"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-xs">
                  {isActive ? 'Intervenant Actif (Visible)' : 'Intervenant Désactivé'}
                </span>
              </label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs rounded-xl h-10 px-4"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl h-10 px-5 gap-2 cursor-pointer shadow-md"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Enregistrer les modifications</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

