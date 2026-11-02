// src/components/events/EventNetworkingWall.tsx
// Mur de networking public de l'événement (Networking Wall)
// Affiche les participants ayant consenti (networking_opt_in).
// Galerie, mode défilement live régie, filtres par secteur & expertises, et QR codes de profil.

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Filter,
  Play,
  Pause,
  QrCode,
  Linkedin,
  Building2,
  Briefcase,
  Sparkles,
  ExternalLink,
  X,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventAttendee } from '@/types/eventEngine';

interface EventNetworkingWallProps {
  eventId: number;
}

export function EventNetworkingWall({ eventId }: EventNetworkingWallProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: attendees = [], isLoading } = useQuery<EventAttendee[]>({
    queryKey: ['event-networking-wall', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_networking_wall&event_id=${eventId}`);
      const data = await res.json();
      return data.success ? data.attendees : [];
    },
  });

  // Extract unique sectors
  const sectors = Array.from(new Set(attendees.map((a) => a.sector))).filter(Boolean) as string[];

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    if (selectedSector !== 'all' && a.sector !== selectedSector) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${a.first_name} ${a.last_name}`.toLowerCase().includes(q);
      const matchCompany = (a.company || '').toLowerCase().includes(q);
      const matchJob = (a.job_title || '').toLowerCase().includes(q);
      const matchPitch = (a.pitch_text || '').toLowerCase().includes(q);
      const matchExp = a.expertises?.some((exp) => exp.toLowerCase().includes(q));
      if (!matchName && !matchCompany && !matchJob && !matchPitch && !matchExp) return false;
    }
    return true;
  });

  // Auto-scroll effect for big screens / projection wall
  useEffect(() => {
    if (!isAutoScroll || !scrollContainerRef.current) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ top: 180, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoScroll]);

  return (
    <section className="py-12 bg-slate-950 border-t border-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" />
              Networking Wall & Participants
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Les Acteurs et Décideurs Présents
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Connectez-vous avant, pendant et après l'événement avec les entrepreneurs, dirigeants et investisseurs participants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={`border-slate-800 text-xs gap-2 ${
                isAutoScroll ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-slate-300'
              }`}
            >
              {isAutoScroll ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Défilement Régie Actif
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Mode Écran / Live Wall
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search & Sector Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, entreprise, compétence, secteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedSector('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSector === 'all'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Tous les secteurs ({attendees.length})
            </button>
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSector === sec
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          ref={scrollContainerRef}
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 ${
            isAutoScroll ? 'max-h-[700px] overflow-y-auto pr-2 scroll-smooth' : ''
          }`}
        >
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))
          ) : filteredAttendees.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 p-8">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">Aucun participant ne correspond à ce filtre</h4>
              <p className="text-xs text-slate-500 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
            </div>
          ) : (
            filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                onClick={() => setSelectedAttendee(attendee)}
                className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/20"
              >
                <div>
                  {/* Portrait & QR Trigger */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {attendee.photo_url ? (
                      <img
                        src={attendee.photo_url}
                        alt={`${attendee.first_name} ${attendee.last_name}`}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md group-hover:border-blue-500/50 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                        {attendee.first_name?.charAt(0)}{attendee.last_name?.charAt(0)}
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Name & Job */}
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                    {attendee.first_name} {attendee.last_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{attendee.job_title || 'Participant'}</p>

                  {attendee.company && (
                    <p className="text-xs font-semibold text-blue-400 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3 shrink-0" />
                      {attendee.company}
                    </p>
                  )}

                  {/* Pitch snippet */}
                  {attendee.pitch_text && (
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                      "{attendee.pitch_text}"
                    </p>
                  )}
                </div>

                {/* Expertises tags */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {attendee.expertises && attendee.expertises.length > 0 ? (
                      attendee.expertises.slice(0, 3).map((exp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium"
                        >
                          {exp}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500">Expertise non renseignée</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Individual Profile with QR Code */}
        {selectedAttendee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
              <button
                onClick={() => setSelectedAttendee(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {selectedAttendee.photo_url ? (
                  <img
                    src={selectedAttendee.photo_url}
                    alt={selectedAttendee.first_name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/40 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-xl">
                    {selectedAttendee.first_name?.charAt(0)}{selectedAttendee.last_name?.charAt(0)}
                  </div>
                )}

                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-black text-white">
                    {selectedAttendee.first_name} {selectedAttendee.last_name}
                  </h3>
                  <p className="text-sm text-slate-300 mt-0.5">{selectedAttendee.job_title || 'Professionnel'}</p>
                  {selectedAttendee.company && (
                    <p className="text-sm font-semibold text-blue-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                      <Building2 className="w-4 h-4" />
                      {selectedAttendee.company}
                    </p>
                  )}
                  {selectedAttendee.sector && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {selectedAttendee.sector}
                    </span>
                  )}
                </div>
              </div>

              {/* Pitch */}
              {selectedAttendee.pitch_text && (
                <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-300">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Présentation / Pitch</p>
                  <p className="italic break-words [overflow-wrap:anywhere] [word-break:break-word]">"{selectedAttendee.pitch_text}"</p>
                </div>
              )}

              {/* Expertises */}
              {selectedAttendee.expertises && selectedAttendee.expertises.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Domaines d'expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAttendee.expertises.map((exp, i) => (
                      <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile QR Code */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    Fiche Contact & Profil
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Scannez ce QR code pour enregistrer la fiche de {selectedAttendee.first_name} sur votre mobile.
                  </p>
                  {selectedAttendee.linkedin_url && (
                    <a
                      href={selectedAttendee.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      Voir le profil LinkedIn
                    </a>
                  )}
                </div>

                <div className="bg-white p-2 rounded-xl shadow shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      selectedAttendee.linkedin_url || `${window.location.origin}/evenements/${eventId}?contact=${selectedAttendee.id}`
                    )}`}
                    alt="QR Contact"
                    className="w-20 h-20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

