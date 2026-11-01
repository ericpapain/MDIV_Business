// src/components/events/EventPitchModal.tsx
// Modal de candidature au Pitch Entreprise pour les participants

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, X, Sparkles, Building2, User, FileText, Upload, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EventPitchModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    company?: string;
    job_title?: string;
    attendee_id?: number;
  };
}

export function EventPitchModal({ eventId, isOpen, onClose, defaultAttendee }: EventPitchModalProps) {
  const [formData, setFormData] = useState({
    company_name: defaultAttendee?.company || '',
    project_title: '',
    presentation: '',
    needs: '',
    speaker_name: defaultAttendee ? `${defaultAttendee.first_name || ''} ${defaultAttendee.last_name || ''}`.trim() : '',
    speaker_role: defaultAttendee?.job_title || '',
    speaker_bio: '',
    deck_url: '',
    deck_filename: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitPitchMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/event_engine.php?action=submit_pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          event_id: eventId,
          attendee_id: defaultAttendee?.attendee_id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur lors de l'envoi de la candidature");
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['event-pitches', eventId] });
      toast.success("Candidature transmise à l'organisateur !");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur réseau.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim() || !formData.project_title.trim() || !formData.presentation.trim()) {
      toast.error("Veuillez renseigner le nom de l'entreprise, le titre du projet et sa présentation.");
      return;
    }
    submitPitchMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">Candidature enregistrée !</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Votre demande de pitch pour l'entreprise <strong className="text-amber-400">{formData.company_name}</strong> a bien été reçue par le comité d'organisation. Vous recevrez une notification par e-mail dès validation de votre créneau de passage.
            </p>
            <div className="pt-4">
              <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs px-6 rounded-xl">
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10.5px] font-semibold mb-2">
                <Sparkles size={12} /> Session Pitch Entreprise
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                Candidater pour pitcher devant l'assemblée
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Présentez votre entreprise, vos atouts et vos besoins stratégiques (financement, partenaires, clients) en 3 minutes lors de l'événement.
              </p>
            </div>

            {/* Informations Entreprise & Projet */}
            <div className="space-y-3.5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Ex: Luxury Tech Labs"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">Titre du pitch / projet *</label>
                  <input
                    type="text"
                    required
                    value={formData.project_title}
                    onChange={e => setFormData({ ...formData, project_title: e.target.value })}
                    placeholder="Ex: Révolutionner la traçabilité des vins rares"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">Présentation de l'activité & de l'innovation *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.presentation}
                  onChange={e => setFormData({ ...formData, presentation: e.target.value })}
                  placeholder="Décrivez ce que fait votre entreprise, votre modèle et votre proposition de valeur unique..."
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">Vos besoins / ce que vous recherchez lors de l'événement *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.needs}
                  onChange={e => setFormData({ ...formData, needs: e.target.value })}
                  placeholder="Ex: Levée de fonds de 500k€, partenaires distributeurs en Suisse et Belgique, experts en IA..."
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Intervenant */}
            <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <User size={14} className="text-amber-400" /> Profil du Pitcher / Intervenant
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] text-slate-700 dark:text-slate-200 font-medium mb-1">Nom de l'intervenant *</label>
                  <input
                    type="text"
                    required
                    value={formData.speaker_name}
                    onChange={e => setFormData({ ...formData, speaker_name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-slate-700 dark:text-slate-200 font-medium mb-1">Fonction dans l'entreprise</label>
                  <input
                    type="text"
                    value={formData.speaker_role}
                    onChange={e => setFormData({ ...formData, speaker_role: e.target.value })}
                    placeholder="Fondateur & CEO"
                    className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] text-slate-700 dark:text-slate-200 font-medium mb-1">Lien de la présentation / Deck PDF (facultatif)</label>
                <input
                  type="url"
                  value={formData.deck_url}
                  onChange={e => setFormData({ ...formData, deck_url: e.target.value })}
                  placeholder="https://mon-entreprise.com/pitch_deck.pdf ou Google Drive"
                  className="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs rounded-xl">
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitPitchMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow px-5 flex items-center gap-2 cursor-pointer"
              >
                {submitPitchMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
                Soumettre ma candidature
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

