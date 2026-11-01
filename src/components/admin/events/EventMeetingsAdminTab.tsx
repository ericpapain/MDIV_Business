// src/components/admin/events/EventMeetingsAdminTab.tsx
// Onglet d'administration pour configurer les créneaux B2B, générer les QR codes partenaires et suivre les réservations CRM

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { EventMeetingSlot, EventMeetingBooking } from '@/types/eventEngine';

interface EventMeetingsAdminTabProps {
  eventId: number;
}

export function EventMeetingsAdminTab({ eventId }: EventMeetingsAdminTabProps) {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'slots' | 'bookings'>('slots');
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [qrPartnerModal, setQrPartnerModal] = useState<EventMeetingSlot | null>(null);

  // New slot form state
  const [newSlot, setNewSlot] = useState({
    partner_name: '',
    partner_role: 'Expert & Partenaire',
    partner_company: '',
    partner_avatar: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '14:30',
    duration_minutes: 30,
    location_mode: 'Espace Networking VIP - Table 1',
    capacity: 1,
  });

  // Query slots
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery<EventMeetingSlot[]>({
    queryKey: ['admin-event-meeting-slots', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_meeting_slots&event_id=${eventId}`);
      const data = await res.json();
      return data.success ? data.slots : [];
    },
  });

  // Query bookings
  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<EventMeetingBooking[]>({
    queryKey: ['admin-event-meeting-bookings', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_meeting_bookings&event_id=${eventId}`);
      const data = await res.json();
      return data.success ? data.bookings : [];
    },
  });

  // Create slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/event_engine.php?action=create_meeting_slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur lors de la création du créneau');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-meeting-slots', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-meeting-slots', eventId] });
      setShowCreateSlotModal(false);
      toast.success('Créneau B2B configuré avec succès !');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors de la création');
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const res = await fetch('/api/event_engine.php?action=delete_meeting_slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slotId, event_id: eventId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur de suppression');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-meeting-slots', eventId] });
      toast.success('Créneau supprimé');
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await fetch('/api/event_engine.php?action=cancel_meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, event_id: eventId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur d'annulation");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-meeting-bookings', eventId] });
      queryClient.invalidateQueries({ queryKey: ['admin-event-meeting-slots', eventId] });
      toast.success('Réservation annulée et agenda CRM actualisé');
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Gestion des Rendez-vous B2B & Partenaires</h3>
            <p className="text-xs text-slate-400">
              Configurez les créneaux, attribuez les partenaires et générez les QR codes personnalisés.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowCreateSlotModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouveau Créneau
          </Button>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveSubTab('slots')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeSubTab === 'slots'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Créneaux & QR Partenaires ({slots.length})
        </button>
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeSubTab === 'bookings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Réservations CRM ({bookings.length})
        </button>
      </div>

      {/* View 1: Slots Management */}
      {activeSubTab === 'slots' && (
        <div className="space-y-4">
          {isLoadingSlots ? (
            <div className="text-center py-10 text-slate-400">Chargement des créneaux...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-8">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun créneau configuré.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateSlotModal(true)}
                className="mt-3 text-xs border-slate-700 text-slate-300"
              >
                Créer le premier créneau
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => {
                const partnerQrUrl = `${window.location.origin}/evenements/${eventId}/reserver?slot_id=${slot.id}&partner_id=${slot.partner_id || ''}`;
                return (
                  <div
                    key={slot.id}
                    className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{slot.partner_name}</h4>
                          <p className="text-xs text-slate-400">{slot.partner_role}</p>
                          {slot.partner_company && (
                            <p className="text-xs text-emerald-400 font-medium mt-0.5">{slot.partner_company}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {slot.booked_count} / {slot.capacity} réservé(s)
                        </span>
                      </div>

                      <div className="mt-3 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1.5 text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            {slot.date}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium text-white">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 pt-1 border-t border-slate-800/60 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{slot.location_mode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQrPartnerModal(slot)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 px-2 gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Afficher QR Code
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSlotMutation.mutate(slot.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Bookings Table (CRM) */}
      {activeSubTab === 'bookings' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          {isLoadingBookings ? (
            <div className="text-center py-10 text-slate-400">Chargement des réservations...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 p-8">
              <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun rendez-vous réservé pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Partenaire assigné</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Synchro CRM</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{b.attendee_name}</div>
                        {b.attendee_company && <div className="text-slate-400 text-[11px]">{b.attendee_company}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div>{b.attendee_email}</div>
                        {b.attendee_phone && <div className="text-slate-500 text-[11px]">{b.attendee_phone}</div>}
                      </td>
                      <td className="py-3 px-4 font-medium text-emerald-400">
                        {b.partner_name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {b.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>RDV #{b.appointment_id || b.id} (Client #{b.client_id || 'N/A'})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {b.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelBookingMutation.mutate(b.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                          >
                            Annuler
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Slot Modal */}
      {showCreateSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h3 className="font-bold text-white text-base">Ajouter un Créneau de Rendez-vous B2B</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Nom du Partenaire / Expert *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Alexandre Dumas (Directeur Investissements)"
                  value={newSlot.partner_name}
                  onChange={(e) => setNewSlot({ ...newSlot, partner_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rôle / Fonction</label>
                <input
                  type="text"
                  value={newSlot.partner_role}
                  onChange={(e) => setNewSlot({ ...newSlot, partner_role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Entreprise / Fonds</label>
                <input
                  type="text"
                  placeholder="ex: Bpifrance / MDIV Capital"
                  value={newSlot.partner_company}
                  onChange={(e) => setNewSlot({ ...newSlot, partner_company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Capacité (personnes)</label>
                <input
                  type="number"
                  min="1"
                  value={newSlot.capacity}
                  onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Heure de début</label>
                <input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Heure de fin</label>
                <input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Lieu ou Mode de Rendez-vous</label>
                <input
                  type="text"
                  value={newSlot.location_mode}
                  onChange={(e) => setNewSlot({ ...newSlot, location_mode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateSlotModal(false)}
                className="text-slate-400"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                onClick={() => {
                  if (!newSlot.partner_name) {
                    toast.error('Le nom du partenaire est obligatoire');
                    return;
                  }
                  createSlotMutation.mutate(newSlot);
                }}
              >
                Créer le créneau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Partner QR Code Modal */}
      {qrPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
            <h3 className="font-bold text-white text-base">QR Code de Réservation Partenaire</h3>
            <p className="text-xs text-slate-400">
              Imprimez ou affichez ce QR code sur le stand de <strong>{qrPartnerModal.partner_name}</strong>.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-lg inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/evenements/${eventId}/reserver?slot_id=${qrPartnerModal.id}&partner_id=${qrPartnerModal.partner_id || ''}`
                )}`}
                alt="QR Code Partenaire"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-mono break-all">
              {`${window.location.origin}/evenements/${eventId}/reserver?slot_id=${qrPartnerModal.id}`}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrPartnerModal(null)}
              className="w-full border-slate-700 text-slate-300"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

