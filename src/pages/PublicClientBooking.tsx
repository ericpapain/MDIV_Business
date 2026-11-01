// src/pages/PublicClientBooking.tsx
// Expérience de réservation client ultra simple, mobile first, maximum 2 clics pour réserver

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, 
  MapPin, Phone, Mail, Video, ShieldCheck, ArrowRight, RefreshCw, X, 
  ExternalLink, Download, Sparkles, Building2, UserCheck, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  fetchBookingLink, 
  fetchAppointments, 
  fetchAppointmentSettings, 
  createAppointment, 
  updateAppointment,
  computeAvailableSlots, 
  generateGoogleCalendarUrl, 
  downloadICSFile,
  Appointment, 
  AppointmentSettings, 
  DEFAULT_APPOINTMENT_SETTINGS,
  BookingLink
} from '@/lib/appointmentService';

export default function PublicClientBooking() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Données du lien et de l'entreprise
  const [bookingLink, setBookingLink] = useState<BookingLink | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{
    id: number;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    logo_url?: string;
  }>({
    id: 4,
    name: 'MDIV Business',
    email: 'direction@mdiv-business.fr',
    phone: '01 80 90 20 26',
    city: 'Paris'
  });
  const [settings, setSettings] = useState<AppointmentSettings>(DEFAULT_APPOINTMENT_SETTINGS);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  // Mois affiché pour le calendrier
  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Sélection utilisateur
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Coordonnées client
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');

  // États du flux
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Fuseau horaire de l'utilisateur
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';
    } catch {
      return 'Europe/Paris';
    }
  }, []);

  // Chargement des données au démarrage
  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (token) {
        const linkData = await fetchBookingLink(token);
        if (linkData && linkData.link) {
          setBookingLink(linkData.link);
          if (linkData.company) setCompanyInfo(linkData.company);
          if (linkData.settings) setSettings(linkData.settings);

          // Pré-remplir les données client issues de l'invitation
          if (linkData.link.client_name) setClientName(linkData.link.client_name);
          if (linkData.link.client_phone) setClientPhone(linkData.link.client_phone);
          if (linkData.link.client_email) setClientEmail(linkData.link.client_email);
          if (linkData.link.notes) setClientNotes(linkData.link.notes);
        }
      } else {
        // Lien générique direct
        const [loadedSettings, apts] = await Promise.all([
          fetchAppointmentSettings(companyInfo.id),
          fetchAppointments(companyInfo.id)
        ]);
        setSettings(loadedSettings);
        setExistingAppointments(apts);
      }

      // Charger les RDV pour exclure les créneaux déjà pris
      const allApts = await fetchAppointments(companyInfo.id);
      setExistingAppointments(allApts);

      // Sélectionner automatiquement le premier jour ouvrable disponible
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      setSelectedDateStr(todayStr);

    } catch (err: any) {
      console.warn("Erreur chargement lien de réservation:", err);
      // Mode tolérant avec réglages par défaut
      const [loadedSettings, apts] = await Promise.all([
        fetchAppointmentSettings(companyInfo.id),
        fetchAppointments(companyInfo.id)
      ]);
      setSettings(loadedSettings);
      setExistingAppointments(apts);
      setSelectedDateStr(new Date().toISOString().split('T')[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // Durée du rendez-vous
  const effectiveDuration = bookingLink?.duration_minutes || settings.slot_duration || 30;

  // Calcul dynamique des créneaux pour la date sélectionnée
  const availableSlotsForSelectedDate = useMemo(() => {
    if (!selectedDateStr) return [];
    return computeAvailableSlots(selectedDateStr, settings, existingAppointments, effectiveDuration);
  }, [selectedDateStr, settings, existingAppointments, effectiveDuration]);

  // Construction de la grille du mois
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysCount = lastDayOfMonth.getDate();
    // 0 = Dimanche, 1 = Lundi ... en France 0 = Lundi dans notre index
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isAvailable: boolean;
      isSelected: boolean;
    }> = [];

    const nowStr = new Date().toISOString().split('T')[0];

    // Jours du mois précédent pour combler la première semaine
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dNum);
      const dStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr: dStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isPast: true,
        isAvailable: false,
        isSelected: false
      });
    }

    // Jours du mois courant
    for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const isPast = dStr < nowStr;

      // Calcul de disponibilité
      const daySlots = computeAvailableSlots(dStr, settings, existingAppointments, effectiveDuration);
      const isAvailable = !isPast && daySlots.length > 0;

      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isPast,
        isAvailable,
        isSelected: selectedDateStr === dStr
      });
    }

    return days;
  }, [viewDate, selectedDateStr, settings, existingAppointments, effectiveDuration]);

  // Navigation du mois
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }, [viewDate]);

  // Validation finale du rendez-vous
  const handleConfirmBooking = async () => {
    if (!selectedDateStr || !selectedTime) {
      toast.error("Veuillez choisir une date et une heure disponible.");
      return;
    }
    const finalName = clientName.trim() || 'Client MDIV';
    if (!finalName) {
      toast.error("Veuillez renseigner votre nom pour finaliser.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newApt = await createAppointment({
        company_id: companyInfo.id,
        booking_link_token: token || undefined,
        client_name: finalName,
        client_phone: clientPhone.trim() || undefined,
        client_email: clientEmail.trim() || undefined,
        appointment_type: bookingLink?.appointment_type || 'online_booking',
        title: bookingLink?.title || `Rendez-vous avec ${companyInfo.name}`,
        date: selectedDateStr,
        time: selectedTime,
        duration_minutes: effectiveDuration,
        location: companyInfo.city ? `Chez ${companyInfo.name} ou sur place (${companyInfo.city})` : 'Sur place / En ligne',
        notes: clientNotes.trim() || undefined,
        status: 'confirmed',
        source: token ? 'link_invitation' : 'online_booking'
      });

      setConfirmedAppointment(newApt);
      setIsRescheduling(false);
      toast.success("Votre rendez-vous a été confirmé avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la réservation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annulation du rendez-vous
  const handleCancelAppointment = async () => {
    if (!confirmedAppointment) return;
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;

    try {
      await updateAppointment(confirmedAppointment.id, {
        status: 'cancelled',
        cancellation_reason: 'Annulé par le client depuis le lien'
      });
      setIsCancelled(true);
      toast.info("Le rendez-vous a bien été annulé.");
    } catch {
      toast.error("Impossible d'annuler le rendez-vous pour le moment.");
    }
  };

  // Reprogrammation
  const handleStartReschedule = () => {
    setIsRescheduling(true);
    setConfirmedAppointment(null);
    setSelectedTime('');
  };

  // Formatage convivial de la date sélectionnée
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDateStr) return '';
    try {
      const parts = selectedDateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1C3A6B] text-white flex items-center justify-center animate-pulse mb-4">
          <CalendarIcon size={24} />
        </div>
        <div className="text-sm font-bold text-slate-700">Chargement des disponibilités...</div>
      </div>
    );
  }

  // =========================================================================
  // ÉCRAN 3 : CONFIRMATION FINALE (OU ANNULATION)
  // =========================================================================
  if (confirmedAppointment && !isRescheduling) {
    const googleCalUrl = generateGoogleCalendarUrl(confirmedAppointment, companyInfo.name);

    return (
      <div className="min-h-screen bg-[#F6F8FC] py-8 sm:py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col gap-6 ia-animate-in">
          
          {/* Coche verte & En-tête */}
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
              <CheckCircle2 size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rendez-vous Confirmé !
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Votre créneau a bien été réservé. Une confirmation automatique a été envoyée.
            </p>
          </div>

          {/* Récapitulatif clair & épuré */}
          <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E4ECF8] text-[#1C3A6B] flex items-center justify-center shrink-0">
                <CalendarIcon size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Heure</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 capitalize">
                  {formattedSelectedDate}
                </div>
                <div className="text-sm font-black text-[#1C3A6B]">
                  à {confirmedAppointment.time} ({confirmedAppointment.duration_minutes} min)
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professionnel</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {companyInfo.name}
                </div>
                {companyInfo.phone && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} className="text-slate-400" />
                    <span>{companyInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pour</div>
                <div className="text-sm font-bold text-slate-900">{confirmedAppointment.client_name}</div>
                {confirmedAppointment.client_phone && (
                  <div className="text-xs text-slate-500">{confirmedAppointment.client_phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'export de calendrier (Google Calendar / Apple & Outlook) */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
              Ajouter à mon agenda en 1 clic
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1C3A6B] text-white font-extrabold text-xs sm:text-sm hover:bg-[#142B52] transition-colors shadow-xs"
              >
                <CalendarIcon size={15} />
                <span>Google Calendar</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => downloadICSFile(confirmedAppointment, companyInfo.name)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
              >
                <Download size={15} />
                <span>Apple / Outlook (.ics)</span>
              </button>
            </div>
          </div>

          {/* Actions : Reprogrammer ou Annuler */}
          <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleStartReschedule}
              className="text-[#1C3A6B] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Changer la date ou l'heure</span>
            </button>

            <button
              type="button"
              onClick={handleCancelAppointment}
              className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X size={14} />
              <span>Annuler ce rendez-vous</span>
            </button>
          </div>

        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Système de réservation sécurisé propulsé par <strong>MDIV Business</strong>
        </div>
      </div>
    );
  }

  // Écran d'annulation confirmée
  if (isCancelled) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <X size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Rendez-vous annulé</h1>
          <p className="text-sm text-slate-500">
            Votre créneau a bien été libéré pour d'autres clients.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsCancelled(false);
              setConfirmedAppointment(null);
            }}
            className="mt-2 px-6 py-3 rounded-xl bg-[#1C3A6B] text-white font-bold text-sm hover:bg-[#142B52] transition-colors"
          >
            Choisir un autre créneau
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉCRAN 1 & 2 : CALENDRIER SIMPLIFIÉ (MAXIMUM 2 CLICS)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F6F8FC] py-6 sm:py-10 px-3 sm:px-6 flex flex-col items-center">
      
      {/* Conteneur principal mobile-first ultra épuré */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        
        {/* Bandeau d'en-tête Pro */}
        <header className="p-5 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-[#1C3A6B] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-black text-xl shrink-0">
              {companyInfo.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  {companyInfo.name}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Disponibilités 24h/24
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {bookingLink?.title || settings.title || "Réservation rapide en ligne"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-200">
            <Clock size={14} className="text-amber-400" />
            <span className="font-bold">{effectiveDuration} min</span>
            <span className="text-white/40">•</span>
            <span className="text-[11px] text-slate-300">{userTimezone.split('/')[1] || 'Paris'}</span>
          </div>
        </header>

        {/* Message d'accueil personnalisé conforme à la consigne */}
        <div className="bg-[#EBF2FC] border-b border-blue-100 px-5 sm:px-7 py-3.5 flex items-center gap-3 text-xs sm:text-sm text-[#142B52]">
          <Sparkles size={18} className="text-[#1C3A6B] shrink-0" />
          <p className="font-semibold leading-relaxed">
            {clientName ? `Bonjour ${clientName}, ` : 'Bonjour, '} 
            choisissez simplement le créneau qui vous convient à partir du calendrier ci-dessous.
          </p>
        </div>

        {/* Corps : Colonne Calendrier (Gauche) + Colonne Heures & Validation (Droite) */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* 1. Calendrier des dates disponibles (7 cols) */}
          <div className="p-5 sm:p-7 md:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#1C3A6B]" />
                <span>1. Choisissez une date</span>
              </h2>

              {/* Navigation Mois */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="Mois précédent"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-800 capitalize min-w-[110px] text-center">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="Mois suivant"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* En-tête des jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-400 uppercase pt-2">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mer</div>
              <div>Jeu</div>
              <div>Ven</div>
              <div className="text-slate-300">Sam</div>
              <div className="text-slate-300">Dim</div>
            </div>

            {/* Grille des jours du mois */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (!day.isCurrentMonth) {
                  return (
                    <div 
                      key={idx} 
                      className="h-10 sm:h-12 flex items-center justify-center text-xs text-slate-300 opacity-40 select-none"
                    >
                      {day.dayNumber}
                    </div>
                  );
                }

                if (!day.isAvailable) {
                  return (
                    <div
                      key={idx}
                      className="h-10 sm:h-12 rounded-xl flex items-center justify-center text-xs text-slate-300 bg-slate-50/50 select-none cursor-not-allowed line-through decoration-slate-300/60"
                      title="Indisponible"
                    >
                      {day.dayNumber}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDateStr(day.dateStr);
                      setSelectedTime(''); // Réinitialiser l'heure choisie au changement de date
                    }}
                    className={`h-10 sm:h-12 rounded-xl font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                      day.isSelected
                        ? 'bg-[#1C3A6B] text-white shadow-md scale-105'
                        : 'bg-white hover:bg-[#E4ECF8] text-slate-900 border border-slate-200/90 hover:border-[#1C3A6B]'
                    }`}
                  >
                    <span>{day.dayNumber}</span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${day.isSelected ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  </button>
                );
              })}
            </div>

            {/* Légende rapide */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Créneaux libres</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Indisponible / Fermé</span>
              </div>
            </div>
          </div>

          {/* 2. Heures disponibles & Confirmation (5 cols) */}
          <div className="p-5 sm:p-7 md:col-span-5 flex flex-col justify-between gap-5 bg-slate-50/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-[#1C3A6B]" />
                  <span>2. Heure disponible</span>
                </h3>
              </div>

              {selectedDateStr && (
                <div className="text-xs font-bold text-[#1C3A6B] capitalize pt-3 pb-2">
                  {formattedSelectedDate}
                </div>
              )}

              {/* Liste des créneaux horaires disponibles */}
              {availableSlotsForSelectedDate.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 pt-1">
                  {availableSlotsForSelectedDate.map((timeStr) => {
                    const isSelected = selectedTime === timeStr;
                    return (
                      <button
                        key={timeStr}
                        type="button"
                        onClick={() => setSelectedTime(timeStr)}
                        className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1C3A6B] text-white border-[#1C3A6B] shadow-sm'
                            : 'bg-white hover:bg-blue-50/80 text-slate-800 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {timeStr}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center my-3">
                  Aucun créneau disponible pour cette date. Veuillez choisir un autre jour.
                </div>
              )}
            </div>

            {/* Validation en 1 Clic (si heure sélectionnée) */}
            {selectedTime && (
              <div className="p-4 rounded-2xl bg-white border border-[#1C3A6B]/20 shadow-md flex flex-col gap-3 ia-animate-in">
                
                {/* Si contact non renseigné, petits champs légers */}
                {(!bookingLink?.client_name || !clientName) && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Votre Nom & Prénom *"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-950 font-medium focus:outline-none focus:ring-1 focus:ring-[#1C3A6B]"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone mobile (pour SMS de rappel)"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-950 font-medium focus:outline-none focus:ring-1 focus:ring-[#1C3A6B]"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1C3A6B] hover:bg-[#142B52] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Confirmer pour {selectedTime}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="text-[10px] text-center text-slate-400">
                  Confirmation immédiate sans échange inutile
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Pied de page informatif */}
        <footer className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Créneau verrouillé et garanti en direct</span>
          </div>
          <div>
            Une question ? Appelez le <strong>{companyInfo.phone || '01 80 90 20 26'}</strong>
          </div>
        </footer>

      </div>

    </div>
  );
}
