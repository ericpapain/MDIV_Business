// src/components/admin/events/EventPitchesAdminTab.tsx
// Onglet d'administration pour modérer les pitchs, gérer l'ordre de passage et les horaires

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  FileText,
  ExternalLink,
  User,
  Building2,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventPitch, PitchStatus } from '@/types/eventEngine';

interface EventPitchesAdminTabProps {
  eventId: number;
}

export function EventPitchesAdminTab({ eventId }: EventPitchesAdminTabProps) {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingPitch, setEditingPitch] = useState<EventPitch | null>(null);

  const { data: pitches = [], isLoading } = useQuery<EventPitch[]>({
    queryKey: ['admin-event-pitches', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_pitches&event_id=${eventId}`);
      const data = await res.json();
      return data.success ? data.pitches : [];
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({
      pitchId,
      status,
      speaking_order,
      pitch_time,
      moderator_notes,
    }: {
      pitchId: number;
      status: PitchStatus;
      speaking_order?: number;
      pitch_time?: string;
      moderator_notes?: string;
    }) => {
      const res = await fetch('/api/event_engine.php?action=moderate_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch_id: pitchId,
          status,
          speaking_order,
          pitch_time,
          moderator_notes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur lors de la modération');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-pitches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-pitches', eventId] });
      setEditingPitch(null);
      toast.success('Statut du pitch mis à jour !');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors de la modération');
    },
  });

  const filteredPitches = pitches.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const pendingCount = pitches.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Modération des Pitchs Entreprises</h3>
            <p className="text-xs text-slate-400">
              Validez les candidatures, attribuez l'ordre de passage et programmez les horaires.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all'
                ? `Tous (${pitches.length})`
                : st === 'pending'
                ? `En attente (${pendingCount})`
                : st === 'approved'
                ? 'Validés'
                : 'Refusés'}
            </button>
          ))}
        </div>
      </div>

      {/* Pitches List */}
      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Chargement des candidatures...</div>
      ) : filteredPitches.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-8">
          <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Aucune candidature de pitch dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPitches.map((pitch) => (
            <div
              key={pitch.id}
              className={`p-5 rounded-xl border transition-all ${
                pitch.status === 'approved'
                  ? 'bg-emerald-950/10 border-emerald-500/30'
                  : pitch.status === 'rejected'
                  ? 'bg-rose-950/10 border-rose-500/20 opacity-70'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        pitch.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : pitch.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {pitch.status === 'approved'
                        ? 'Validé'
                        : pitch.status === 'rejected'
                        ? 'Refusé'
                        : 'En attente'}
                    </span>

                    {pitch.speaking_order && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Passage #{pitch.speaking_order}
                      </span>
                    )}

                    {pitch.pitch_time && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {pitch.pitch_time}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{pitch.project_title}</h4>
                    <p className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {pitch.company_name} — {pitch.speaker_name} ({pitch.speaker_role || 'Pitcher'})
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    {pitch.presentation}
                  </p>

                  {pitch.needs && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Besoins recherchés :</strong> {pitch.needs}
                    </p>
                  )}

                  {pitch.deck_url && (
                    <div className="pt-1">
                      <a
                        href={pitch.deck_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Consulter la présentation / Pitch Deck
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Moderation Controls */}
                <div className="flex md:flex-col items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() =>
                      moderateMutation.mutate({
                        pitchId: pitch.id,
                        status: 'approved',
                        speaking_order: pitch.speaking_order || 1,
                        pitch_time: pitch.pitch_time || '14:30',
                      })
                    }
                    disabled={moderateMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 gap-1.5 w-full justify-center"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Valider
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      moderateMutation.mutate({
                        pitchId: pitch.id,
                        status: 'rejected',
                      })
                    }
                    disabled={moderateMutation.isPending}
                    className="border-rose-900/60 text-rose-400 hover:bg-rose-950/40 text-xs h-8 px-3 gap-1.5 w-full justify-center"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Refuser
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingPitch(pitch)}
                    className="text-slate-400 hover:text-white text-xs h-8 px-2 w-full justify-center"
                  >
                    Ordre & Horaire
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Order Modal */}
      {editingPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-white text-base">
              Programmer le pitch : {editingPitch.company_name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Ordre de passage</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={editingPitch.speaking_order || 1}
                  id="speaking_order_input"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Horaire prévu</label>
                <input
                  type="text"
                  placeholder="ex: 14h30 - 14h45"
                  defaultValue={editingPitch.pitch_time || ''}
                  id="pitch_time_input"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes du modérateur</label>
                <textarea
                  defaultValue={editingPitch.moderator_notes || ''}
                  id="moderator_notes_input"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPitch(null)}
                className="text-slate-400"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={() => {
                  const order = parseInt((document.getElementById('speaking_order_input') as HTMLInputElement).value, 10);
                  const time = (document.getElementById('pitch_time_input') as HTMLInputElement).value;
                  const notes = (document.getElementById('moderator_notes_input') as HTMLTextAreaElement).value;
                  moderateMutation.mutate({
                    pitchId: editingPitch.id,
                    status: 'approved',
                    speaking_order: order,
                    pitch_time: time,
                    moderator_notes: notes,
                  });
                }}
              >
                Enregistrer la programmation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

