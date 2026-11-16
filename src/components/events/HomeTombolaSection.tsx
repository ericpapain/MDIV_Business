import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Gift, Trophy, Sparkles, ArrowRight, ShieldCheck, Tag, Calendar, Eye, X } from 'lucide-react';
import { EventTombolaPrize } from '@/types/eventEngine';
import { Button } from '@/components/ui/button';

export function HomeTombolaSection() {
  const [activeModalPrize, setActiveModalPrize] = useState<EventTombolaPrize | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data, isLoading } = useQuery<{ success: boolean; data: EventTombolaPrize[] }>({
    queryKey: ['public-tombola-prizes'],
    queryFn: async () => {
      const res = await fetch('/api-public.php?action=tombola_prizes');
      if (!res.ok) return { success: false, data: [] };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const prizes = data?.data || [];

  // Ne rien afficher si aucun lot n'est configuré ou actif
  if (isLoading || prizes.length === 0) {
    return null;
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-950 via-[#0a0d0f] to-slate-950 border-y border-gold/20 overflow-hidden">
      {/* Halo lumineux de fond */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            <Trophy className="w-3.5 h-3.5 text-gold animate-pulse" />
            Tirages au Sort & Récompenses BNE
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight">
            Grand Tirage au Sort & Tombola
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-4 leading-relaxed">
            Chaque billet d'événement inclut automatiquement votre participation au tirage certifié. Découvrez les lots d'exception mis en jeu par nos partenaires et le réseau BNE.
          </p>
        </div>

        {/* Grille des Lots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prizes.map((prize) => {
            const gallery = Array.isArray(prize.images) && prize.images.length > 0 
              ? prize.images 
              : (prize.image_url ? [prize.image_url] : []);
            const mainImg = prize.image_url || (gallery.length > 0 ? gallery[0] : null);

            return (
              <div
                key={prize.id}
                className="group relative rounded-2xl bg-[#0d1115]/90 border border-gold/20 hover:border-gold/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-gold/10 hover:-translate-y-1"
              >
                {/* Image du lot */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  {mainImg ? (
                    <img
                      src={mainImg}
                      alt={prize.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#12171c] text-slate-600">
                      <Gift className="w-12 h-12 text-gold/40 mb-2" />
                      <span className="text-xs text-muted-foreground">Lot BNE Officiel</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1115] via-transparent to-black/30 pointer-events-none" />

                  {/* Badge de Rang */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-gold/40 text-gold text-xs font-bold shadow-md">
                    <Trophy className="w-3 h-3 text-gold" />
                    {prize.draw_rank || 'Grand Prix'}
                  </div>

                  {/* Valeur estimée */}
                  {prize.value && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-extrabold shadow-md">
                      {prize.value}
                    </div>
                  )}

                  {/* Bouton pour agrandir / voir galerie */}
                  {gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalPrize(prize);
                        setSelectedImageIndex(0);
                      }}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-gold hover:text-black text-white border border-white/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Voir les photos du lot"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Contenu du lot */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Événement rattaché */}
                    {prize.event_title && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gold/80 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="truncate">{prize.event_title}</span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors duration-200">
                      {prize.title}
                    </h3>

                    {prize.description && (
                      <p className="text-xs sm:text-sm text-slate-300/80 mt-2.5 line-clamp-3 leading-relaxed">
                        {prize.description}
                      </p>
                    )}

                    {prize.sponsor && (
                      <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="w-3.5 h-3.5 text-gold" />
                        <span>Offert par : <strong className="text-white">{prize.sponsor}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Action / Lien vers l'événement */}
                  <div className="mt-6 pt-4 border-t border-gold/15 flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground">
                      <span className="text-emerald-400 font-bold">{prize.winners_count || prize.quantity || 1}</span> gagnant(s)
                    </div>

                    <Link
                      to={prize.event_id ? `/evenements/${prize.event_id}` : '/evenements'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-amber-300 transition-colors uppercase tracking-wider group/link"
                    >
                      Participer <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Garanties et réassurance cryptographique */}
        <div className="mt-14 max-w-2xl mx-auto rounded-xl bg-black/40 border border-gold/20 p-4 text-center flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
          <span>
            Tirages 100% impartiaux certifiés par CSPRNG cryptographique & horodatage SHA-256 inaltérable.
          </span>
          <Link to="/evenements" className="text-gold font-bold hover:underline shrink-0">
            Voir tous les événements
          </Link>
        </div>
      </div>

      {/* Modale d'aperçu de la galerie photo */}
      {activeModalPrize && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-[#0d1115] border border-gold/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header modale */}
            <div className="p-4 border-b border-gold/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  {activeModalPrize.draw_rank || 'Lot Tombola'}
                </span>
                <h3 className="text-lg font-bold text-white">{activeModalPrize.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPrize(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vue photo courante */}
            <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              {(() => {
                const photos = Array.isArray(activeModalPrize.images) && activeModalPrize.images.length > 0
                  ? activeModalPrize.images
                  : (activeModalPrize.image_url ? [activeModalPrize.image_url] : []);
                const current = photos[selectedImageIndex] || photos[0];
                return current ? (
                  <img src={current} alt={activeModalPrize.title} className="w-full h-full object-contain" />
                ) : (
                  <Gift className="w-16 h-16 text-slate-700" />
                );
              })()}
            </div>

            {/* Miniatures si multiples photos */}
            {(() => {
              const photos = Array.isArray(activeModalPrize.images) && activeModalPrize.images.length > 0
                ? activeModalPrize.images
                : (activeModalPrize.image_url ? [activeModalPrize.image_url] : []);
              if (photos.length <= 1) return null;
              return (
                <div className="p-3 bg-black/50 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        idx === selectedImageIndex ? 'border-gold scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Footer informations */}
            <div className="p-4 bg-[#0a0d0f] border-t border-gold/20 flex items-center justify-between">
              {activeModalPrize.value ? (
                <span className="text-sm font-bold text-emerald-400">
                  Valeur estimée : {activeModalPrize.value}
                </span>
              ) : <span />}

              <Link
                to={activeModalPrize.event_id ? `/evenements/${activeModalPrize.event_id}` : '/evenements'}
                onClick={() => setActiveModalPrize(null)}
              >
                <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs">
                  Participer à l'événement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

