// src/components/events/EventMeetingBookingModal.tsx
// Modal de réservation d'un rendez-vous B2B 1-to-1 avec un partenaire / expert

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  X,
  Loader2,
  QrCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventMeetingSlot } from '@/types/eventEngine';

interface EventMeetingBookingModalProps {
  eventId: number;
  slot: EventMeetingSlot | null;
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    attendee_id?: number;
  };
}

export function EventMeetingBookingModal({
  eventId,
  slot,
  isOpen,
  onClose,
  defaultAttendee
}: EventMeetingBookingModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    attendee_name: defaultAttendee ? `${defaultAttendee.first_name || ''} ${defaultAttendee.last_name || ''}`.trim() : '',
    attendee_email: defaultAttendee?.email || '',
    attendee_phone: defaultAttendee?.phone || '',
    attendee_company: defaultAttendee?.company || '',
    notes: '',
  });

  const [bookingResult, setBookingResult] = useState<any>(null);
  const [showQr, setShowQr] = useState(false);

  const bookMeetingMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/event_engine.php?action=book_meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          slot_id: slot?.id,
          attendee_id: defaultAttendee?.attendee_id,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Impossible de réserver ce créneau");
      return data;
    },
    onSuccess: (data) => {
      setBookingResult(data.booking);
      queryClient.invalidateQueries({ queryKey: ['event-meeting-slots', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-meeting-bookings', eventId] });
      toast.success("Rendez-vous confirmé et synchronisé avec le CRM !");
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la réservation");
    },
  });

  if (!isOpen || !slot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.attendee_name || !formData.attendee_email) {
      toast.error("Veuillez renseigner votre nom et votre email");
      return;
    }
    bookMeetingMutation.mutate(formData);
  };

  const bookingUrl = `${window.location.origin}/evenements/${eventId}/reserver?slot_id=${slot.id}&partner_id=${slot.partner_id || ''}`;
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(bookingUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Réserver un Rendez-vous B2B</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Session privée 1-to-1 avec un partenaire ou expert
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {bookingResult ? (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Rendez-vous Confirmé !</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Votre échange avec <span className="font-semibold text-emerald-400">{slot.partner_name}</span> est validé.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Date : <strong className="text-white">{slot.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Horaire : <strong className="text-white">{slot.start_time} - {slot.end_time}</strong> ({slot.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Lieu : <strong className="text-white">{slot.location_mode}</strong></span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Synchronisé au CRM MDIV & email de confirmation transmis.</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-2.5 rounded-xl"
                >
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Slot Details Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {slot.partner_avatar ? (
                      <img
                        src={slot.partner_avatar}
                        alt={slot.partner_name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                        {slot.partner_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-white">{slot.partner_name}</h4>
                      <p className="text-xs text-slate-400">{slot.partner_role || 'Expert / Partenaire'} • {slot.partner_company || 'MDIV Network'}</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQr(!showQr)}
                    className="border-slate-700 text-slate-300 hover:text-white text-xs gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {showQr ? 'Masquer QR' : 'Partager QR'}
                  </Button>
                </div>

                {showQr && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center space-y-2">
                    <img src={qrDataUrl} alt="QR Réservation" className="w-32 h-32 mx-auto bg-white p-2 rounded-lg" />
                    <p className="text-xs text-slate-400">Scannez ce QR code avec un smartphone pour ouvrir directement cette réservation.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{slot.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{slot.start_time} - {slot.end_time} ({slot.duration_minutes}m)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{slot.location_mode}</span>
                  </div>
                </div>
              </div>

              {/* Attendee Form */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nom & Prénom *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      value={formData.attendee_name}
                      onChange={(e) => setFormData({ ...formData, attendee_name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email professionnel *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="jean@entreprise.com"
                        value={formData.attendee_email}
                        onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={formData.attendee_phone}
                        onChange={(e) => setFormData({ ...formData, attendee_phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Entreprise / Organisation
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Nom de votre société"
                      value={formData.attendee_company}
                      onChange={(e) => setFormData({ ...formData, attendee_company: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Objet de l'échange ou questions clés (optionnel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Quels sont les points que vous aimeriez aborder ?"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* CRM notice */}
              <div className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Votre rendez-vous sera synchronisé dans l'agenda du partenaire et dans le CRM MDIV.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={bookMeetingMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 gap-2"
                >
                  {bookMeetingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Réservation...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Confirmer le Rendez-vous
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

