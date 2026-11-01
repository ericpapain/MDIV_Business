// src/components/events/EventPitchesSection.tsx
// Section publique des pitchs d'entreprises validés et bouton de candidature

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Clock, Building2, User, ExternalLink, Sparkles, Plus, CheckCircle2 } from 'lucide-react';
import { EventPitch } from '@/types/eventEngine';
import { Button } from '@/components/ui/button';
import { EventPitchModal } from './EventPitchModal';

interface EventPitchesSectionProps {
  eventId: number;
  allowCandidate?: boolean;
}

export function EventPitchesSection({ eventId, allowCandidate = true }: EventPitchesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: pitches = [], isLoading } = useQuery<EventPitch[]>({
    queryKey: ['event-pitches', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_pitches&event_id=${eventId}&status=approved`);
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!eventId,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10.5px] font-semibold mb-1.5">
            <Megaphone size={12} /> Tremplin Innovation & Pitch
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Sessions Pitchs d'Entreprises
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Découvrez les projets novateurs et les opportunités de partenariat présentés en direct par les dirigeants.
          </p>
        </div>

        {allowCandidate && (
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow px-4 py-2 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} /> Candidater pour pitcher
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          Chargement des sessions de pitch...
        </div>
      ) : pitches.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl p-6 bg-muted/10">
          <Megaphone className="mx-auto text-muted-foreground mb-2" size={32} />
          <h4 className="text-sm font-semibold text-foreground">Les candidatures sont ouvertes !</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            Aucun pitch n'a encore été programmé. Vous êtes dirigeant ou porteur de projet ? Candidatez dès maintenant pour obtenir une tribune de 3 minutes devant notre réseau d'investisseurs et décideurs.
          </p>
          {allowCandidate && (
            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="text-xs rounded-xl border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
            >
              Déposer ma candidature de pitch
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pitches.map((p, idx) => (
            <div
              key={p.id}
              className="luxe-card p-5 rounded-2xl border border-border/60 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                      #{p.speaking_order || idx + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {p.company_name}
                    </span>
                  </div>

                  {p.pitch_time && (
                    <span className="px-2 py-0.5 rounded bg-muted/60 text-[10.5px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock size={11} className="text-amber-400" /> {p.pitch_time}
                    </span>
                  )}
                </div>

                <h4 className="font-serif text-base font-bold text-foreground mb-2">
                  {p.project_title}
                </h4>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {p.presentation}
                </p>

                {p.needs && (
                  <div className="p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-[11px] text-amber-200/90 leading-snug">
                    <strong className="text-amber-300">Recherche :</strong> {p.needs}
                  </div>
                )}
              </div>

              {/* Intervenant & liens */}
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted border border-amber-500/20 overflow-hidden flex items-center justify-center shrink-0">
                    {p.speaker_avatar ? (
                      <img src={p.speaker_avatar} alt={p.speaker_name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{p.speaker_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{p.speaker_role || "Pitcher"}</div>
                  </div>
                </div>

                {p.deck_url && (
                  <a
                    href={p.deck_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Pitch Deck</span> <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <EventPitchModal
          eventId={eventId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

