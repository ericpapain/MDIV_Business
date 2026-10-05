// src/components/integrations/CalendarScheduleModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, Clock, Video, X, Check, Loader2, 
  ExternalLink, Sparkles, Building2, User 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  scheduleCalendarMeeting, 
  fetchCompanyIntegrations, 
  IntegrationProvider, 
  CompanyIntegrationsState 
} from '@/lib/integrationService';

interface CalendarScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    clientName?: string;
  };
  companyId?: number;
}

export const CalendarScheduleModal: React.FC<CalendarScheduleModalProps> = ({
  isOpen,
  onClose,
  initialData,
  companyId
}) => {
  const [integrations, setIntegrations] = useState<CompanyIntegrationsState | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider>('google');

  const [title, setTitle] = useState(initialData?.title || 'Rendez-vous Client');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialData?.startTime || '14:30');
  const [duration, setDuration] = useState<number>(45);
  const [description, setDescription] = useState(initialData?.description || '');

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledResult, setScheduledResult] = useState<{ meetingUrl?: string; eventId?: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTitle(initialData?.title || 'Rendez-vous Client');
    setDate(initialData?.date || new Date().toISOString().split('T')[0]);
    setStartTime(initialData?.startTime || '14:30');
    setDescription(initialData?.description || '');
    setScheduledResult(null);

    fetchCompanyIntegrations(companyId).then(setIntegrations).catch(() => {});

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, initialData, companyId]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    try {
      const res = await scheduleCalendarMeeting({
        provider: selectedProvider,
        title,
        description,
        date,
        startTime,
        durationMinutes: duration,
        companyId
      });
      toast.success(res.info);
      setScheduledResult({
        meetingUrl: res.meetingUrl,
        eventId: res.eventId
      });
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la planification');
    } finally {
      setIsScheduling(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-[#121624] border border-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl text-white my-8 z-10">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10 shrink-0">
            <CalendarIcon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                Planifier le Rendez-vous
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold/20 text-gold border border-gold/30">
                Google Meet & Teams
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              Ajout automatique à votre calendrier professionnel avec génération du lien visio.
            </p>
          </div>
        </div>

        {scheduledResult ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>
            <h4 className="text-lg font-bold text-white">Rendez-vous planifié avec succès !</h4>
            <p className="text-sm text-gray-300">
              L'événement est synchronisé dans votre {selectedProvider === 'google' ? 'Google Agenda' : 'Outlook Calendar'}.
            </p>

            {scheduledResult.meetingUrl && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Video size={14} className="text-gold" />
                  Lien de la visioconférence généré
                </div>
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    readOnly
                    value={scheduledResult.meetingUrl}
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gold"
                  />
                  <a
                    href={scheduledResult.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-gold/20 hover:bg-gold/30 text-gold text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    Ouvrir <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d14] font-bold text-sm"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="space-y-4">
            {/* Choix Provider */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSelectedProvider('google')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedProvider === 'google'
                    ? 'bg-red-500/10 border-red-500/40 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <Video size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">Google Agenda</div>
                  <div className="text-[10px] text-gray-400">+ Lien Google Meet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('microsoft')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedProvider === 'microsoft'
                    ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Video size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold">Outlook Calendar</div>
                  <div className="text-[10px] text-gray-400">+ Lien MS Teams</div>
                </div>
              </button>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Titre du Rendez-vous *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
              />
            </div>

            {/* Date, Heure, Durée */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Heure début
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Durée
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-gold"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 heure</option>
                  <option value={90}>1h30</option>
                </select>
              </div>
            </div>

            {/* Description / Contexte */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Ordre du jour / Notes préparatoires
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objectifs de la réunion, points clés à aborder..."
                className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isScheduling}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d14] text-sm font-bold shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isScheduling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <CalendarIcon size={16} />
                    Planifier dans {selectedProvider === 'google' ? 'Google Agenda' : 'Outlook'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
