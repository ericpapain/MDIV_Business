// src/components/events/EventPartnersMeetingsSection.tsx
// Section publique des rendez-vous B2B 1-to-1 avec les partenaires et experts de l'événement

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  CalendarCheck,
  QrCode,
  Building2,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventMeetingSlot } from '@/types/eventEngine';
import { EventMeetingBookingModal } from './EventMeetingBookingModal';

interface EventPartnersMeetingsSectionProps {
  eventId: number;
  defaultAttendee?: any;
}

export function EventPartnersMeetingsSection({ eventId, defaultAttendee }: EventPartnersMeetingsSectionProps) {
  const [selectedSlot, setSelectedSlot] = useState<EventMeetingSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: slots = [], isLoading } = useQuery<EventMeetingSlot[]>({
    queryKey: ['event-meeting-slots', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_meeting_slots&event_id=${eventId}`);
      const data = await res.json();
      return data.success ? data.slots : [];
    },
  });

  // Extract unique partner names
  const partners = Array.from(new Set(slots.map((s) => s.partner_name))).filter(Boolean);

  const filteredSlots = slots.filter((slot) => {
    if (selectedPartner !== 'all' && slot.partner_name !== selectedPartner) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = slot.partner_name.toLowerCase().includes(query);
      const matchCompany = (slot.partner_company || '').toLowerCase().includes(query);
      const matchRole = (slot.partner_role || '').toLowerCase().includes(query);
      if (!matchName && !matchCompany && !matchRole) return false;
    }
    return true;
  });

  const handleOpenBooking = (slot: EventMeetingSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  return (
    <section className="py-12 bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <CalendarCheck className="w-3.5 h-3.5" />
              Rendez-vous B2B & Networking 1-to-1
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Échangez en direct avec nos experts et partenaires
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mt-2">
              Réservez un créneau individuel de 20 à 30 minutes avec nos partenaires institutionnels, investisseurs et mentors qualifiés.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un partenaire, entreprise, expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedPartner('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPartner === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Tous les partenaires
            </button>
            {partners.map((partner) => (
              <button
                key={partner}
                onClick={() => setSelectedPartner(partner)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPartner === partner
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {partner}
              </button>
            ))}
          </div>
        </div>

        {/* Slots Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-300">Aucun créneau disponible actuellement</h4>
            <p className="text-xs text-slate-500 mt-1">
              Les créneaux de rendez-vous seront ouverts très prochainement par nos partenaires.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map((slot) => {
              const remainingSpots = Math.max(0, slot.capacity - (slot.booked_count || 0));
              const isFull = remainingSpots <= 0;

              return (
                <div
                  key={slot.id}
                  className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 ${
                    isFull
                      ? 'border-slate-800/60 opacity-60'
                      : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/20'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Partner Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {slot.partner_avatar ? (
                          <img
                            src={slot.partner_avatar}
                            alt={slot.partner_name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                            {slot.partner_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-base leading-snug">{slot.partner_name}</h4>
                          <p className="text-xs text-slate-400">{slot.partner_role || 'Expert'}</p>
                          {slot.partner_company && (
                            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3" />
                              {slot.partner_company}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isFull
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isFull ? 'Complet' : `${remainingSpots} place${remainingSpots > 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {/* Schedule Details */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          {slot.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-white">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          {slot.start_time} - {slot.end_time} ({slot.duration_minutes}m)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-800/60">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{slot.location_mode || 'Espace Networking VIP'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <Button
                      onClick={() => handleOpenBooking(slot)}
                      disabled={isFull}
                      className={`w-full text-xs font-semibold py-2 rounded-xl transition-all ${
                        isFull
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/30'
                      }`}
                    >
                      {isFull ? 'Créneau complet' : 'Réserver ce créneau'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <EventMeetingBookingModal
        eventId={eventId}
        slot={selectedSlot}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        defaultAttendee={defaultAttendee}
      />
    </section>
  );
}

