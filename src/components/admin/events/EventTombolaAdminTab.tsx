// src/components/admin/events/EventTombolaAdminTab.tsx
// Onglet d'administration de la Tombola : gestion des lots, configuration des règles, déclenchement du tirage CSPRNG serveur et registre d'audit

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Gift,
  Trophy,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Lock,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventTombolaPrize, EventTombolaDraw, TombolaRulesConfig } from '@/types/eventEngine';

interface EventTombolaAdminTabProps {
  eventId: number;
}

export function EventTombolaAdminTab({ eventId }: EventTombolaAdminTabProps) {
  const queryClient = useQueryClient();
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [selectedPrizeForDraw, setSelectedPrizeForDraw] = useState<number | null>(null);

  // New prize form state
  const [newPrize, setNewPrize] = useState({
    title: '',
    description: '',
    sponsor: '',
    winners_count: 1,
    sort_order: 1,
  });

  // Tombola rules config state
  const [rules, setRules] = useState<TombolaRulesConfig>({
    eligibility: 'checked_in_only',
    require_terms_consent: true,
    exclude_previous_winners: true,
  });

  // Query prizes & history
  const { data, isLoading } = useQuery<{
    success: boolean;
    prizes: EventTombolaPrize[];
    draws: EventTombolaDraw[];
  }>({
    queryKey: ['admin-event-tombola', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_tombola_history&event_id=${eventId}`);
      return res.json();
    },
  });

  const prizes = data?.prizes || [];
  const draws = data?.draws || [];

  // Create prize mutation
  const savePrizeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/event_engine.php?action=save_tombola_prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur lors de la sauvegarde du lot');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      setShowPrizeModal(false);
      setNewPrize({ title: '', description: '', sponsor: '', winners_count: 1, sort_order: prizes.length + 1 });
      toast.success('Lot ajouté avec succès !');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur');
    },
  });

  // Delete prize mutation
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
      toast.success('Lot supprimé');
    },
  });

  // Execute server CSPRNG draw mutation
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
      setSelectedPrizeForDraw(null);
      toast.success(`Gagnant tiré au sort : ${data.draw?.winner_name} (Ticket ${data.draw?.winner_ticket_code})`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur de tirage');
    },
  });

  // Reset draws mutation
  const resetDrawsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/event_engine.php?action=reset_tombola_draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tombola', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-tombola-public', eventId] });
      toast.success('Historique des tirages réinitialisé');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Configuration & Tirage de la Tombola</h3>
            <p className="text-xs text-slate-400">
              Gérez les lots, appliquez les règles d'exclusion et lancez le tirage CSPRNG certifié.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowPrizeModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs gap-1.5 font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Lot
          </Button>

          {draws.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm('Voulez-vous vraiment réinitialiser tous les tirages effectués ?')) {
                  resetDrawsMutation.mutate();
                }
              }}
              className="border-slate-800 text-slate-400 hover:text-rose-400 text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Rules Configuration Bar */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Règles d'Éligibilité & Sécurité du Tirage
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.eligibility === 'checked_in_only'}
              onChange={(e) =>
                setRules({ ...rules, eligibility: e.target.checked ? 'checked_in_only' : 'all' })
              }
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500"
            />
            <span>Présents uniquement (émargement validé)</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.exclude_previous_winners}
              onChange={(e) => setRules({ ...rules, exclude_previous_winners: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500"
            />
            <span>Exclure les gagnants des lots précédents</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={rules.require_terms_consent}
              onChange={(e) => setRules({ ...rules, require_terms_consent: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500"
            />
            <span>Consentement au règlement requis</span>
          </label>
        </div>
      </div>

      {/* Prizes Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Lots en jeu ({prizes.length})
        </h4>

        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Chargement des lots...</div>
        ) : prizes.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-8">
            <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Aucun lot configuré pour la tombola.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.map((prize) => {
              const prizeDraws = draws.filter((d) => d.prize_id === prize.id);
              const remaining = Math.max(0, prize.winners_count - prizeDraws.length);
              const isFinished = remaining === 0;

              return (
                <div
                  key={prize.id}
                  className={`p-4 bg-slate-900/80 border rounded-xl flex flex-col justify-between space-y-4 ${
                    isFinished ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {prize.winners_count} Gagnant(s)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePrizeMutation.mutate(prize.id)}
                        className="text-slate-500 hover:text-rose-400 h-6 px-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <h5 className="font-bold text-white text-sm">{prize.title}</h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prize.description}</p>
                    {prize.sponsor && (
                      <p className="text-xs text-amber-400 font-medium mt-1">Sponsor : {prize.sponsor}</p>
                    )}
                  </div>

                  {/* Winners of this prize if any */}
                  {prizeDraws.length > 0 && (
                    <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Gagnant(s) tiré(s) :
                      </p>
                      {prizeDraws.map((d) => (
                        <div key={d.id} className="text-emerald-400 font-medium">
                          • {d.winner_name} ({d.winner_ticket_code})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Draw button */}
                  <Button
                    onClick={() => executeDrawMutation.mutate(prize.id)}
                    disabled={isFinished || executeDrawMutation.isPending}
                    className={`w-full text-xs font-semibold py-2 rounded-lg gap-2 ${
                      isFinished
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isFinished ? 'Tirage Terminé' : `Lancer le Tirage (${remaining} restant)`}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      {draws.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden mt-6">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Registre d'Audit Cryptographique des Tirages (SHA-256)
            </h4>
            <span className="text-xs text-slate-400">{draws.length} tirages certifiés</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                  <th className="py-2.5 px-4">Lot</th>
                  <th className="py-2.5 px-4">Gagnant certifié</th>
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Horodatage</th>
                  <th className="py-2.5 px-4">Hash d'Audit (CSPRNG SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {draws.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-semibold text-white">{d.prize_title}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-medium">
                      {d.winner_name} {d.winner_company && <span className="text-slate-400">({d.winner_company})</span>}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-amber-300">{d.winner_ticket_code}</td>
                    <td className="py-2.5 px-4 text-slate-400">{new Date(d.drawn_at).toLocaleString('fr-FR')}</td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[220px]" title={d.draw_hash}>
                      {d.draw_hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Prize Modal */}
      {showPrizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-white text-base">Ajouter un Lot de Tombola</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titre du lot *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: 1 An d'Incubation & Coaching MDIV"
                  value={newPrize.title}
                  onChange={(e) => setNewPrize({ ...newPrize, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Détails du lot..."
                  value={newPrize.description}
                  onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sponsor / Donateur</label>
                <input
                  type="text"
                  placeholder="ex: Bpifrance / MDIV Business"
                  value={newPrize.sponsor}
                  onChange={(e) => setNewPrize({ ...newPrize, sponsor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre de gagnants</label>
                <input
                  type="number"
                  min="1"
                  value={newPrize.winners_count}
                  onChange={(e) => setNewPrize({ ...newPrize, winners_count: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrizeModal(false)}
                className="text-slate-400"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium"
                onClick={() => {
                  if (!newPrize.title) {
                    toast.error('Le titre du lot est obligatoire');
                    return;
                  }
                  savePrizeMutation.mutate(newPrize);
                }}
              >
                Enregistrer le Lot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

