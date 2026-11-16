// src/components/events/EventTombolaAnimation.tsx
// Animation publique du tirage au sort Tombola
// Règle fondamentale : L'animation révèle STRICTEMENT le résultat calculé côté serveur (CSPRNG + SHA256 audit hash).
// AUCUN tirage n'est généré côté client.

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Gift,
  Trophy,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  QrCode,
  PartyPopper,
  Flame,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventTombolaDraw, EventTombolaPrize } from '@/types/eventEngine';

interface EventTombolaAnimationProps {
  eventId: number;
}

export function EventTombolaAnimation({ eventId }: EventTombolaAnimationProps) {
  const [selectedDraw, setSelectedDraw] = useState<EventTombolaDraw | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [scrambleName, setScrambleName] = useState('...');

  // Fetch prizes & auditable draws
  const { data, isLoading, refetch } = useQuery<{
    success: boolean;
    prizes: EventTombolaPrize[];
    draws: EventTombolaDraw[];
  }>({
    queryKey: ['event-tombola-public', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_tombola_history&event_id=${eventId}`);
      return res.json();
    },
    refetchInterval: 10000, // Auto-check for newly executed server draws
  });

  const prizes = data?.prizes || [];
  const draws = data?.draws || [];

  // Trigger suspense animation for a server-executed draw
  const triggerRevealAnimation = (draw: EventTombolaDraw) => {
    setSelectedDraw(draw);
    setIsAnimating(true);
    setAnimationStep('spinning');

    const fakeNames = [
      'Génération du hash...',
      'Contrôle CSPRNG...',
      'Vérification éligibilité...',
      'Dépouillement des tickets...',
      'Sélection certifiée...',
    ];

    let counter = 0;
    const interval = setInterval(() => {
      setScrambleName(fakeNames[counter % fakeNames.length]);
      counter++;
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      setAnimationStep('revealed');
      setIsAnimating(false);
    }, 3200);
  };

  return (
    <section className="py-14 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-900 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Gift className="w-3.5 h-3.5" />
            Tombola & Tirage au Sort Officiel
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            Grand Tirage au Sort de l'Événement
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Tirage cryptographiquement certifié par le serveur MDIV Event Engine. 
            Sélection aléatoire garantie sans biais (CSPRNG) avec empreinte SHA-256 infalsifiable.
          </p>
        </div>

        {/* Live Reveal Screen (if active) */}
        {selectedDraw && (
          <div className="mb-12 max-w-2xl mx-auto bg-slate-950/90 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/10 relative overflow-hidden">
            {animationStep === 'spinning' ? (
              <div className="py-10 space-y-6 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center animate-spin">
                  <RefreshCw className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
                    Dévoilement du Tirage Serveur...
                  </h3>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
                    {scrambleName}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Lot : <strong className="text-amber-300">{selectedDraw.prize_title}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <PartyPopper className="w-4 h-4 text-amber-400" />
                  Gagnant Officiel Validé !
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Félicitations à</p>
                  <h3 className="text-3xl sm:text-4xl font-black text-white">
                    {selectedDraw.winner_name}
                  </h3>
                  {selectedDraw.winner_company && (
                    <p className="text-base text-amber-400 font-semibold">
                      {selectedDraw.winner_company}
                    </p>
                  )}
                </div>

                {/* Prize Won Banner */}
                {(() => {
                  const wonPrize = prizes.find(p => p.id === selectedDraw.prize_id);
                  const prizeImg = wonPrize?.image_url || (Array.isArray(wonPrize?.images) && wonPrize.images.length > 0 ? wonPrize.images[0] : null);
                  return (
                    <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-4 text-left">
                      {prizeImg && (
                        <img
                          src={prizeImg}
                          alt={selectedDraw.prize_title}
                          className="w-20 h-20 rounded-xl object-cover border border-amber-500/40 shrink-0 shadow-md"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                            {wonPrize?.draw_rank || 'Lot Remporté'}
                          </span>
                          {wonPrize?.value && (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              {wonPrize.value}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                          {selectedDraw.prize_title}
                        </h4>
                        {wonPrize?.sponsor && (
                          <p className="text-xs text-amber-200/80 mt-1">
                            Offert par {wonPrize.sponsor}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Ticket code & Cryptographic Audit Proof */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Numéro de Ticket Gagnant :</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      {selectedDraw.winner_ticket_code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Horodatage officiel :</span>
                    <span className="font-mono text-slate-300">{new Date(selectedDraw.drawn_at).toLocaleString('fr-FR')}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Empreinte d'Audit Cryptographique (SHA-256) :
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                      {selectedDraw.draw_hash}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedDraw(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:text-white text-xs"
                >
                  Fermer la vue de révélation
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Prizes Catalogue */}
        <div className="mb-14">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Lots & Récompenses mis en jeu
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : prizes.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun lot configuré pour cet événement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizes.map((prize) => {
                const prizeDraws = draws.filter((d) => d.prize_id === prize.id);
                const isFullyDrawn = prizeDraws.length >= prize.winners_count;
                const photo = prize.image_url || (Array.isArray(prize.images) && prize.images.length > 0 ? prize.images[0] : null);

                return (
                  <div
                    key={prize.id}
                    className={`bg-slate-900/80 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                      isFullyDrawn
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Photo du lot si présente */}
                    {photo && (
                      <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                        <img
                          src={photo}
                          alt={prize.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30 pointer-events-none" />
                        {prize.draw_rank && (
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[11px] font-bold">
                            {prize.draw_rank}
                          </div>
                        )}
                        {prize.value && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                            {prize.value}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {!photo && (
                            <div className="flex items-center gap-2">
                              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Gift className="w-5 h-5" />
                              </div>
                              {prize.draw_rank && (
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                  {prize.draw_rank}
                                </span>
                              )}
                            </div>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-auto ${
                              isFullyDrawn
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isFullyDrawn ? 'Tirage Effectué' : `${prize.winners_count} Gagnant(s)`}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-base font-bold text-white">{prize.title}</h4>
                          {!photo && prize.value && (
                            <span className="text-xs font-semibold text-emerald-400 shrink-0">
                              {prize.value}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prize.description}</p>

                        {prize.sponsor && (
                          <p className="text-xs text-amber-300 font-medium mt-2">
                            Offert par : {prize.sponsor}
                          </p>
                        )}
                      </div>

                    {/* Winners of this prize */}
                    {prizeDraws.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Gagnant(s) certifié(s) :
                        </p>
                        {prizeDraws.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800"
                            >
                            <span className="font-semibold text-white">{d.winner_name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => triggerRevealAnimation(d)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 h-6 px-2"
                            >
                              Voir l'animation
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit Log / Palmarès Table */}
        {draws.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Registre Officiel d'Audit des Tirages
              </h3>
              <span className="text-xs text-slate-400">Total : {draws.length} tirage(s) validé(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Lot</th>
                    <th className="pb-3 px-4">Gagnant</th>
                    <th className="pb-3 px-4">Ticket</th>
                    <th className="pb-3 px-4">Date & Heure</th>
                    <th className="pb-3 pl-4">Empreinte SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {draws.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">{d.prize_title}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-emerald-400">{d.winner_name}</span>
                        {d.winner_company && <span className="text-slate-500"> ({d.winner_company})</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">{d.winner_ticket_code}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(d.drawn_at).toLocaleString('fr-FR')}</td>
                      <td className="py-3 pl-4 font-mono text-[10px] text-slate-400 truncate max-w-[200px]" title={d.draw_hash}>
                        {d.draw_hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

