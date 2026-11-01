// src/pages/ServicesIAAppointments.tsx
// Expérience de prise de rendez-vous ultra simple, mobile-first et planning professionnel MDIV Business

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Phone, Mail, User, CheckCircle2, 
  AlertCircle, Plus, Copy, Check, ExternalLink, Sparkles, Filter, Search,
  ChevronLeft, ChevronRight, Video, ShieldCheck, Smartphone, Send,
  Trash2, RefreshCw, Eye, ArrowRight, Settings2, Sliders, BellRing,
  Building, CheckCircle, CalendarCheck, FileText, Share2, MessageCircle,
  CalendarDays, X, UserPlus, Zap, AlertTriangle, CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Appointment, 
  AppointmentSettings, 
  DEFAULT_APPOINTMENT_SETTINGS,
  BlockedSlot,
  BookingLink,
  AppointmentNotification,
  fetchAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  fetchAppointmentSettings,
  saveAppointmentSettings,
  createBookingLink,
  fetchAppointmentNotifications,
  markAppointmentNotificationsRead,
  generateGoogleCalendarUrl,
  downloadICSFile
} from '@/lib/appointmentService';
import { fetchClients } from '@/lib/quoteService';
import { fetchMailboxes, sendEmailViaIntegration, UniversalMailbox } from '@/lib/integrationService';

export default function ServicesIAAppointments({ onNavigateView }: { onNavigateView?: (view: string) => void }) {
  const { company } = useAuth();
  const companyId = company?.id ? Number(company.id) : 4;
  const companyName = company?.name || "MDIV Business";

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  // Onglets : 'dashboard' (Tableau de bord) | 'availabilities' (Mes disponibilités) | 'simulator' (Aperçu client)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'availabilities' | 'simulator'>(() => {
    if (urlTab === 'availabilities' || urlTab === 'settings') return 'availabilities';
    if (urlTab === 'simulator') return 'simulator';
    return 'dashboard';
  });

  const handleTabSwitch = (tab: 'dashboard' | 'availabilities' | 'simulator') => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      if (!next.get('view')) next.set('view', 'rdv_online');
      return next;
    });
  };

  // États principaux
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<AppointmentSettings>(DEFAULT_APPOINTMENT_SETTINGS);
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [connectedMailboxes, setConnectedMailboxes] = useState<UniversalMailbox[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Notifications drawer / popup
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Modale "Planifier un rendez-vous (envoi rapide en < 1 min)"
  const [isQuickInviteOpen, setIsQuickInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState<'form' | 'share'>('form');
  const [selectedExistingClient, setSelectedExistingClient] = useState<string>('');
  const [isSendingDirectEmail, setIsSendingDirectEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    phone: '',
    email: '',
    duration: 30,
    title: 'Visite technique & Échange de chantier',
    notes: ''
  });
  const [generatedLink, setGeneratedLink] = useState<BookingLink | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);

  // Filtres du tableau de bord
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Gestion des disponibilités (Écran "Mes disponibilités")
  const [editingSettings, setEditingSettings] = useState<AppointmentSettings>(DEFAULT_APPOINTMENT_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newBlockedSlot, setNewBlockedSlot] = useState({
    date: new Date().toISOString().split('T')[0],
    start: '14:00',
    end: '17:00',
    reason: ''
  });

  // Copie rapide du lien permanent
  const [copiedPermanentLink, setCopiedPermanentLink] = useState(false);

  // URL de réservation permanente
  const permanentBookingUrl = `${window.location.origin}/rdv`;

  // Chargement des données
  useEffect(() => {
    loadAllData();
  }, [companyId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [apts, sets, notifs, clients, mbs] = await Promise.all([
        fetchAppointments(companyId),
        fetchAppointmentSettings(companyId),
        fetchAppointmentNotifications(companyId),
        fetchClients(companyId).catch(() => []),
        fetchMailboxes(companyId).catch(() => [])
      ]);
      setAppointments(apts);
      setSettings(sets);
      setEditingSettings(sets);
      setNotifications(notifs);
      setClientsList(clients);
      setConnectedMailboxes(mbs);
    } catch (err) {
      console.warn("Erreur chargement données RDV:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Nombre de notifications non lues
  const unreadNotifsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Marquer toutes les notifications comme lues
  const handleMarkNotifsRead = async () => {
    await markAppointmentNotificationsRead(companyId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // KPIs du Tableau de bord
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const kpis = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(a => a.date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed').length;
    const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed' || (a.date < todayStr && a.status !== 'cancelled')).length;

    return { total, upcoming, todayCount, pending, completed };
  }, [appointments, todayStr]);

  // Filtrage et recherche de la liste
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Filtre statut
      if (filterStatus !== 'all') {
        if (filterStatus === 'upcoming') {
          if (apt.date < todayStr || apt.status === 'cancelled' || apt.status === 'completed') return false;
        } else if (filterStatus === 'today') {
          if (apt.date !== todayStr) return false;
        } else if (filterStatus === 'completed') {
          if (apt.status !== 'completed' && !(apt.date < todayStr && apt.status !== 'cancelled')) return false;
        } else if (apt.status !== filterStatus) {
          return false;
        }
      }

      // Filtre recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = apt.client_name?.toLowerCase().includes(q);
        const matchPhone = apt.client_phone?.toLowerCase().includes(q);
        const matchEmail = apt.client_email?.toLowerCase().includes(q);
        const matchTitle = apt.title?.toLowerCase().includes(q);
        const matchLoc = apt.location?.toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail || matchTitle || matchLoc;
      }

      return true;
    });
  }, [appointments, filterStatus, searchQuery, todayStr]);

  // Détection automatique des conflits de rendez-vous
  const conflictingIds = useMemo(() => {
    const ids = new Set<string | number>();
    const active = appointments.filter(a => a.status !== 'cancelled');
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (active[i].date === active[j].date && active[i].time === active[j].time) {
          ids.add(active[i].id);
          ids.add(active[j].id);
        }
      }
    }
    return ids;
  }, [appointments]);

  // ---------------------------------------------------------------------------
  // GESTION RAPIDE DE L'INVITATION (MOINS DE 1 MINUTE CHRONO)
  // ---------------------------------------------------------------------------
  const handleSelectClient = (clientIdOrName: string) => {
    setSelectedExistingClient(clientIdOrName);
    const found = clientsList.find(c => String(c.id) === clientIdOrName || c.name === clientIdOrName);
    if (found) {
      setInviteForm(prev => ({
        ...prev,
        name: found.name || '',
        phone: found.phone || '',
        email: found.email || ''
      }));
    }
  };

  const handleGenerateInvite = async () => {
    if (!inviteForm.name.trim()) {
      toast.error("Veuillez renseigner le nom du contact.");
      return;
    }

    try {
      const link = await createBookingLink({
        company_id: companyId,
        client_name: inviteForm.name.trim(),
        client_phone: inviteForm.phone.trim() || undefined,
        client_email: inviteForm.email.trim() || undefined,
        duration_minutes: inviteForm.duration,
        title: inviteForm.title.trim() || 'Rendez-vous',
        notes: inviteForm.notes.trim() || undefined
      });

      setGeneratedLink(link);
      setInviteStep('share');
      toast.success("Lien de réservation généré avec succès en quelques secondes !");
    } catch {
      toast.error("Impossible de générer le lien de réservation.");
    }
  };

  // URL du lien généré
  const fullInviteUrl = generatedLink 
    ? `${window.location.origin}/rdv/${generatedLink.token}`
    : '';

  // Message standardisé conforme à la consigne utilisateur
  const shareMessage = useMemo(() => {
    const clientGreeting = inviteForm.name ? `Bonjour ${inviteForm.name}, ` : 'Bonjour, ';
    return `${clientGreeting}choisissez simplement le créneau qui vous convient à partir du calendrier ci-dessous :\n${fullInviteUrl}`;
  }, [inviteForm.name, fullInviteUrl]);

  // Actions de partage
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(fullInviteUrl);
    setCopiedInviteUrl(true);
    toast.success("Lien copié dans le presse-papier !");
    setTimeout(() => setCopiedInviteUrl(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = inviteForm.phone.replace(/[\s\.\-\(\)]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenSMS = () => {
    const cleanPhone = inviteForm.phone.replace(/[\s\.\-\(\)]/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(shareMessage)}`;
    window.location.href = smsUrl;
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`Invitation : planifiez notre rendez-vous avec ${companyName}`);
    const body = encodeURIComponent(shareMessage);
    window.location.href = `mailto:${inviteForm.email}?subject=${subject}&body=${body}`;
  };

  const handleSendViaGmail = async () => {
    if (!inviteForm.email.trim()) {
      toast.error("Veuillez renseigner l'adresse e-mail du client pour envoyer l'invitation.");
      return;
    }

    const activeMailbox = connectedMailboxes.find(m => m.is_active) || connectedMailboxes[0];
    if (!activeMailbox) {
      toast.info("Aucune boîte Gmail connectée directement dans l'application. Ouverture de votre logiciel de messagerie.");
      handleOpenEmail();
      return;
    }

    setIsSendingDirectEmail(true);
    try {
      await sendEmailViaIntegration({
        to: inviteForm.email.trim(),
        subject: `Invitation : planifiez notre rendez-vous avec ${companyName}`,
        body: shareMessage,
        leadName: inviteForm.name,
        mailboxId: activeMailbox.id,
        companyId
      });
      setEmailSentSuccess(true);
      toast.success(`E-mail d'invitation envoyé avec succès à ${inviteForm.email} depuis votre compte ${activeMailbox.email} !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi de l'e-mail via le serveur.");
      handleOpenEmail();
    } finally {
      setIsSendingDirectEmail(false);
    }
  };

  // ---------------------------------------------------------------------------
  // GESTION DU STATUT DES RENDEZ-VOUS
  // ---------------------------------------------------------------------------
  const handleUpdateStatus = async (id: number | string, newStatus: Appointment['status']) => {
    try {
      const updated = await updateAppointment(id, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      toast.success(`Statut mis à jour : ${newStatus}`);
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const handleDeleteApt = async (id: number | string) => {
    if (!window.confirm("Voulez-vous supprimer ce rendez-vous du planning ?")) return;
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.success("Rendez-vous supprimé.");
    } catch {
      toast.error("Impossible de supprimer le rendez-vous.");
    }
  };

  // ---------------------------------------------------------------------------
  // SAUVEGARDE DES DISPONIBILITÉS (ÉCRAN "MES DISPONIBILITÉS")
  // ---------------------------------------------------------------------------
  const handleToggleDay = (dayIndex: number) => {
    setEditingSettings(prev => {
      const currentDays = prev.working_days || [1, 2, 3, 4, 5];
      const isEnabled = currentDays.includes(dayIndex);
      const nextDays = isEnabled ? currentDays.filter(d => d !== dayIndex) : [...currentDays, dayIndex];

      const currentSchedules = prev.day_schedules || {};
      const nextSchedules = {
        ...currentSchedules,
        [dayIndex]: {
          ...(currentSchedules[dayIndex] || { start: '08:30', end: '18:30' }),
          enabled: !isEnabled
        }
      };

      return {
        ...prev,
        working_days: nextDays,
        day_schedules: nextSchedules
      };
    });
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate) return;
    if (editingSettings.holidays?.includes(newHolidayDate)) {
      toast.info("Cette date est déjà enregistrée dans vos congés.");
      return;
    }
    setEditingSettings(prev => ({
      ...prev,
      holidays: [...(prev.holidays || []), newHolidayDate]
    }));
    setNewHolidayDate('');
    toast.success("Jour d'absence ajouté.");
  };

  const handleRemoveHoliday = (dateStr: string) => {
    setEditingSettings(prev => ({
      ...prev,
      holidays: (prev.holidays || []).filter(h => h !== dateStr)
    }));
  };

  const handleAddBlockedSlot = () => {
    if (!newBlockedSlot.date || !newBlockedSlot.start || !newBlockedSlot.end) {
      toast.error("Veuillez renseigner la date et les heures du créneau.");
      return;
    }
    const slot: BlockedSlot = {
      id: 'block-' + Date.now(),
      date: newBlockedSlot.date,
      start: newBlockedSlot.start,
      end: newBlockedSlot.end,
      reason: newBlockedSlot.reason || 'Indisponibilité ponctuelle'
    };

    setEditingSettings(prev => ({
      ...prev,
      blocked_slots: [...(prev.blocked_slots || []), slot]
    }));
    setNewBlockedSlot({
      date: new Date().toISOString().split('T')[0],
      start: '14:00',
      end: '17:00',
      reason: ''
    });
    toast.success("Créneau bloqué avec succès.");
  };

  const handleRemoveBlockedSlot = (id: string) => {
    setEditingSettings(prev => ({
      ...prev,
      blocked_slots: (prev.blocked_slots || []).filter(b => b.id !== id)
    }));
  };

  const handleSaveAvailabilities = async () => {
    setIsSavingSettings(true);
    try {
      const saved = await saveAppointmentSettings(editingSettings, companyId);
      setSettings(saved);
      toast.success("Vos disponibilités ont été enregistrées avec succès !");
    } catch {
      toast.error("Erreur lors de la sauvegarde de vos disponibilités.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#F6F8FC] min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ========================================================================= */}
      {/* 1. EN-TÊTE PRINCIPAL & BOUTON D'ACTION ULTRARAPIDE                        */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E4ECF8] text-[#1C3A6B]">
              Trouver des clients • Planning 24h/24
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>✓ Activé</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Prise de rendez-vous en ligne</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Vos clients bloquent un rendez-vous ou demandent un devis sans vous déranger sur le chantier. 
            Envoyez un lien personnalisé en <strong>moins de 60 secondes</strong>.
          </p>
        </div>

        {/* Boutons d'action droite */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Bouton cloche Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen && unreadNotifsCount > 0) handleMarkNotifsRead();
              }}
              className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors relative cursor-pointer"
              title="Notifications en temps réel"
            >
              <BellRing size={20} />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Menu déroulant des notifications */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 ia-animate-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BellRing size={14} className="text-[#1C3A6B]" />
                    <span>Notifications ({notifications.length})</span>
                  </span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkNotifsRead}
                      className="text-[11px] font-bold text-[#1C3A6B] hover:underline cursor-pointer"
                    >
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`py-3 px-1 text-xs flex items-start gap-2.5 ${!n.read ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div>{n.title}</div>
                          <div className="text-[11px] font-normal text-slate-500 mt-0.5">{n.message}</div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      Aucune nouvelle notification pour le moment.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton copier lien permanent */}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(permanentBookingUrl);
              setCopiedPermanentLink(true);
              toast.success("Lien permanent copié !");
              setTimeout(() => setCopiedPermanentLink(false), 2000);
            }}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="Copier le lien public permanent"
          >
            {copiedPermanentLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copiedPermanentLink ? 'Lien copié !' : 'Mon lien permanent'}</span>
          </button>

          {/* GRAND BOUTON PRINCIPAL : PLANIFIER UN RENDEZ-VOUS */}
          <button
            type="button"
            onClick={() => {
              setInviteStep('form');
              setGeneratedLink(null);
              setIsQuickInviteOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-[#1C3A6B] hover:bg-[#142B52] text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-[#1C3A6B]/20 transition-all cursor-pointer group"
          >
            <Zap size={18} className="text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Planifier un rendez-vous</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BARRE D'ONGLETS : DASHBOARD | MES DISPONIBILITÉS | APERÇU CLIENT       */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabSwitch('dashboard')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#1C3A6B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <CalendarIcon size={16} />
          <span>Tableau de bord</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] bg-white/20 font-black">
            {kpis.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('availabilities')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'availabilities'
              ? 'bg-[#1C3A6B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Sliders size={16} />
          <span>Mes disponibilités</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('simulator')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-[#1C3A6B] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Smartphone size={16} />
          <span>Aperçu Expérience Client</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTENU : ONGLET 1 - TABLEAU DE BORD                                   */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 ia-animate-in">
          
          {/* 5 KPIs Modernes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">À venir</div>
              <div className="text-2xl font-black text-[#1C3A6B] mt-1">{kpis.upcoming}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Rendez-vous programmés</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Aujourd'hui</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">{kpis.todayCount}</div>
              <div className="text-[11px] text-emerald-800/60 mt-0.5">Sur votre planning</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">En attente</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{kpis.pending}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">À confirmer</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passés / Terminés</div>
              <div className="text-2xl font-black text-slate-700 mt-1">{kpis.completed}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Historique archivé</div>
            </div>

            <div className="bg-[#1C3A6B] text-white rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Total Réservations</div>
              <div className="text-2xl font-black text-white mt-1">{kpis.total}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">100% sans coup de fil</div>
            </div>
          </div>

          {/* Barre de filtres et recherche */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filtres par statut */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'upcoming', label: 'À venir' },
                { id: 'today', label: "Aujourd'hui" },
                { id: 'confirmed', label: 'Confirmés' },
                { id: 'pending', label: 'En attente' },
                { id: 'completed', label: 'Terminés' },
                { id: 'cancelled', label: 'Annulés' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === f.id
                      ? 'bg-[#1C3A6B] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Recherche textuelle */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher client, téléphone, lieu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1C3A6B]/20 focus:border-[#1C3A6B]"
              />
            </div>
          </div>

          {/* Liste des Rendez-vous */}
          <div className="space-y-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => {
                const isConflict = conflictingIds.has(apt.id);
                const isToday = apt.date === todayStr;

                return (
                  <div 
                    key={apt.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:border-[#1C3A6B]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      isConflict ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Colonne Date & Heure */}
                    <div className="flex items-center gap-3.5 min-w-[200px]">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                        isToday 
                          ? 'bg-emerald-600 text-white shadow-md' 
                          : 'bg-[#E4ECF8] text-[#1C3A6B]'
                      }`}>
                        <span className="text-[10px] uppercase font-bold tracking-tight">
                          {new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-xl leading-none">
                          {new Date(apt.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            {apt.time || '10:00'}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({apt.duration_minutes} min)
                          </span>
                          {isToday && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.2 rounded-full">
                              Aujourd'hui
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 capitalize mt-0.5">
                          {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                      </div>
                    </div>

                    {/* Colonne Client & Objet */}
                    <div className="flex-1 min-w-[220px] space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900">{apt.client_name}</span>
                        {/* Statut Badge */}
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                          apt.status === 'rescheduled' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {apt.status === 'confirmed' ? 'Confirmé' :
                           apt.status === 'pending' ? 'En attente' :
                           apt.status === 'completed' ? 'Terminé' :
                           apt.status === 'rescheduled' ? 'Reprogrammé' : 'Annulé'}
                        </span>

                        {isConflict && (
                          <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={10} />
                            <span>Conflit détecté</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        {apt.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        {apt.client_phone && (
                          <a href={`tel:${apt.client_phone}`} className="hover:text-[#1C3A6B] flex items-center gap-1">
                            <Phone size={12} />
                            <span>{apt.client_phone}</span>
                          </a>
                        )}
                        {apt.client_email && (
                          <a href={`mailto:${apt.client_email}`} className="hover:text-[#1C3A6B] flex items-center gap-1">
                            <Mail size={12} />
                            <span>{apt.client_email}</span>
                          </a>
                        )}
                        {apt.location && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin size={12} />
                            <span>{apt.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto pt-2 lg:pt-0">
                      
                      {/* WhatsApp direct si téléphone présent */}
                      {apt.client_phone && (
                        <a
                          href={`https://wa.me/${apt.client_phone.replace(/[\s\.\-\(\)]/g, '')}?text=${encodeURIComponent(`Bonjour ${apt.client_name}, je vous contacte au sujet de notre rendez-vous du ${apt.date} à ${apt.time}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Contacter sur WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                      )}

                      {/* Changer de statut */}
                      {apt.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle size={14} className="text-emerald-600" />
                          <span>Terminer</span>
                        </button>
                      )}

                      {apt.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          Confirmer
                        </button>
                      )}

                      {apt.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                          className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                        >
                          Annuler
                        </button>
                      )}

                      {/* Supprimer */}
                      <button
                        type="button"
                        onClick={() => handleDeleteApt(apt.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer définitivement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E4ECF8] text-[#1C3A6B] flex items-center justify-center">
                  <CalendarDays size={24} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Aucun rendez-vous trouvé</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Partagez votre lien de réservation pour permettre à vos clients de choisir un créneau sans vous déranger.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInviteStep('form');
                    setGeneratedLink(null);
                    setIsQuickInviteOpen(true);
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52] transition-colors cursor-pointer"
                >
                  Envoyer une invitation maintenant
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTENU : ONGLET 2 - MES DISPONIBILITÉS                                */}
      {/* ========================================================================= */}
      {activeTab === 'availabilities' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-8 ia-animate-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sliders size={20} className="text-[#1C3A6B]" />
                <span>Gestion de mes disponibilités</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Définissez vos jours de travail, horaires, congés et temps de battement.
              </p>
            </div>

            <button
              type="button"
              disabled={isSavingSettings}
              onClick={handleSaveAvailabilities}
              className="px-6 py-3 rounded-xl bg-[#1C3A6B] text-white font-black text-xs hover:bg-[#142B52] transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              {isSavingSettings ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>Enregistrer mes disponibilités</span>
            </button>
          </div>

          {/* 1. Jours disponibles & Heures de début et fin */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C3A6B] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Jours ouvrables & Heures de rendez-vous</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { day: 1, label: 'Lundi' },
                { day: 2, label: 'Mardi' },
                { day: 3, label: 'Mercredi' },
                { day: 4, label: 'Jeudi' },
                { day: 5, label: 'Vendredi' },
                { day: 6, label: 'Samedi' },
                { day: 7, label: 'Dimanche' },
              ].map(({ day, label }) => {
                const isEnabled = (editingSettings.working_days || [1, 2, 3, 4, 5]).includes(day);
                const schedule = editingSettings.day_schedules?.[day] || {
                  start: editingSettings.working_hours?.start || '08:30',
                  end: editingSettings.working_hours?.end || '18:30'
                };

                return (
                  <div 
                    key={day} 
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isEnabled ? 'border-slate-300 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleDay(day)}
                        className="w-4 h-4 rounded text-[#1C3A6B] focus:ring-[#1C3A6B]"
                      />
                      <span className="text-sm font-black text-slate-900">{label}</span>
                    </label>

                    {isEnabled ? (
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingSettings(prev => ({
                              ...prev,
                              day_schedules: {
                                ...(prev.day_schedules || {}),
                                [day]: { ...(prev.day_schedules?.[day] || { end: '18:30', enabled: true }), start: val, enabled: true }
                              }
                            }));
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B] focus:ring-1 focus:ring-[#1C3A6B]"
                        />
                        <span className="text-slate-400">à</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={e => {
                            const val = e.target.value;
                            setEditingSettings(prev => ({
                              ...prev,
                              day_schedules: {
                                ...(prev.day_schedules || {}),
                                [day]: { ...(prev.day_schedules?.[day] || { start: '08:30', enabled: true }), end: val, enabled: true }
                              }
                            }));
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B] focus:ring-1 focus:ring-[#1C3A6B]"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Non disponible</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Durée des rendez-vous & Règles de confort */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C3A6B] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Durée par défaut & Délais de prévenance</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Durée par défaut */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Durée des rendez-vous</label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setEditingSettings(prev => ({ ...prev, slot_duration: dur }))}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        editingSettings.slot_duration === dur
                          ? 'bg-[#1C3A6B] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dur} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Temps de battement entre 2 rendez-vous */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Temps de battement (trajet / pause)</label>
                <select
                  value={editingSettings.buffer_between_slots}
                  onChange={e => setEditingSettings(prev => ({ ...prev, buffer_between_slots: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value={0}>Aucun battement (0 min)</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes (Recommandé)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                </select>
              </div>

              {/* Prévenance minimum */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Délai minimum de prévenance</label>
                <select
                  value={editingSettings.notice_hours_min}
                  onChange={e => setEditingSettings(prev => ({ ...prev, notice_hours_min: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value={1}>1 heure avant</option>
                  <option value={2}>2 heures avant</option>
                  <option value={12}>12 heures avant (Veille au soir)</option>
                  <option value={24}>24 heures avant</option>
                </select>
              </div>

            </div>
          </div>

          {/* 3. Jours d'absence ou congés */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C3A6B] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Jours d'absence ou congés (Automatiquement indisponibles)</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={newHolidayDate}
                onChange={e => setNewHolidayDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B]"
              />
              <button
                type="button"
                onClick={handleAddHoliday}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                + Bloquer ce jour
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(editingSettings.holidays || []).map(dateStr => (
                <div key={dateStr} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <span>{new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <button type="button" onClick={() => handleRemoveHoliday(dateStr)} className="text-rose-500 hover:text-rose-800">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(!editingSettings.holidays || editingSettings.holidays.length === 0) && (
                <div className="text-xs text-slate-400 italic">Aucun jour de congé ou d'absence bloqué.</div>
              )}
            </div>
          </div>

          {/* 4. Créneaux bloqués ponctuels */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C3A6B] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Créneaux bloqués ponctuels (ex: chantier privé, réunion, formation)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="date"
                value={newBlockedSlot.date}
                onChange={e => setNewBlockedSlot(prev => ({ ...prev, date: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newBlockedSlot.start}
                  onChange={e => setNewBlockedSlot(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B]"
                />
                <span className="text-xs text-slate-400">à</span>
                <input
                  type="time"
                  value={newBlockedSlot.end}
                  onChange={e => setNewBlockedSlot(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-black text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B]"
                />
              </div>
              <input
                type="text"
                placeholder="Motif (ex: Chantier Bloqué)"
                value={newBlockedSlot.reason}
                onChange={e => setNewBlockedSlot(prev => ({ ...prev, reason: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-950 font-medium text-xs shadow-xs focus:outline-none focus:border-[#1C3A6B]"
              />
              <button
                type="button"
                onClick={handleAddBlockedSlot}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                + Bloquer ce créneau
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {(editingSettings.blocked_slots || []).map(b => (
                <div key={b.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock size={14} className="text-amber-700" />
                    <span>{b.date} de {b.start} à {b.end}</span>
                    <span className="text-slate-500 font-normal">({b.reason})</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveBlockedSlot(b.id)} className="text-rose-600 hover:text-rose-800">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(!editingSettings.blocked_slots || editingSettings.blocked_slots.length === 0) && (
                <div className="text-xs text-slate-400 italic">Aucun créneau bloqué ponctuel.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENU : ONGLET 3 - APERÇU EXPÉRIENCE CLIENT                           */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col items-center gap-6 ia-animate-in">
          <div className="text-center max-w-xl">
            <h2 className="text-lg font-black text-slate-900">
              Aperçu en direct : ce que voit votre client
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Testez l'expérience exacte reçue par le client sur son smartphone ou ordinateur. Maximum 2 clics pour réserver !
            </p>
          </div>

          <div className="w-full max-w-2xl border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-600 truncate">
              {permanentBookingUrl}
            </div>
            <a
              href={permanentBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-[#142B52]"
            >
              <span>Ouvrir en plein écran</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Iframe ou aperçu intégré */}
          <div className="w-full max-w-2xl border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl h-[560px]">
            <iframe
              src={permanentBookingUrl}
              title="Aperçu Client"
              className="w-full h-full bg-white"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALE "PLANIFIER UN RENDEZ-VOUS" (ENVOI RAPIDE EN MOINS DE 60s)        */}
      {/* ========================================================================= */}
      {isQuickInviteOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 ia-animate-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header de la modale */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1C3A6B] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-black text-base">Planifier un rendez-vous</h3>
                  <p className="text-[11px] text-slate-300">Envoi d'un lien personnalisé en moins de 60 secondes</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickInviteOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* ÉTAPE 1 : Formulaire de contact */}
            {inviteStep === 'form' && (
              <div className="p-6 space-y-4">
                
                {/* Sélecteur contact existant */}
                {clientsList.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Sélectionner un contact existant (Facultatif)
                    </label>
                    <select
                      value={selectedExistingClient}
                      onChange={e => handleSelectClient(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    >
                      <option value="">-- Choisir un client dans le carnet --</option>
                      {clientsList.map(c => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Saisie directe nom */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Laurent Mercier"
                    value={inviteForm.name}
                    onChange={e => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#1C3A6B]"
                  />
                </div>

                {/* Téléphone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Téléphone mobile (SMS / WhatsApp)
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={inviteForm.phone}
                      onChange={e => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1C3A6B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Adresse e-mail
                    </label>
                    <input
                      type="email"
                      placeholder="client@gmail.com"
                      value={inviteForm.email}
                      onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1C3A6B]"
                    />
                  </div>
                </div>

                {/* Durée du rendez-vous */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Durée du rendez-vous
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setInviteForm(prev => ({ ...prev, duration: d }))}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          inviteForm.duration === d
                            ? 'bg-[#1C3A6B] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titre / Objet */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Motif du rendez-vous
                  </label>
                  <input
                    type="text"
                    value={inviteForm.title}
                    onChange={e => setInviteForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1C3A6B]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateInvite}
                  className="w-full py-3.5 rounded-xl bg-[#1C3A6B] text-white font-black text-xs sm:text-sm hover:bg-[#142B52] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Générer & Envoyer le lien</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : Écran de partage multicanal en 1 clic */}
            {inviteStep === 'share' && (
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-black text-emerald-900">Lien unique créé avec succès !</div>
                    <div className="text-[11px] text-emerald-800/80 mt-0.5">
                      Prêt à être envoyé à <strong>{inviteForm.name}</strong> ({inviteForm.duration} min).
                    </div>
                  </div>
                </div>

                {/* Aperçu du message */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aperçu du message envoyé :</div>
                  <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {shareMessage}
                  </p>
                </div>

                {/* 4 Boutons de partage direct + Envoi direct par Gmail */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Envoyer en 1 clic :
                    </div>
                    {connectedMailboxes.length > 0 && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        Boîte connectée : {connectedMailboxes[0].email}
                      </span>
                    )}
                  </div>

                  {/* Bouton d'envoi direct par Gmail si email client renseigné */}
                  {inviteForm.email && connectedMailboxes.length > 0 && (
                    <button
                      type="button"
                      disabled={isSendingDirectEmail || emailSentSuccess}
                      onClick={handleSendViaGmail}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-60"
                    >
                      {isSendingDirectEmail ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : emailSentSuccess ? (
                        <Check size={16} className="text-emerald-300" />
                      ) : (
                        <Send size={15} />
                      )}
                      <span>
                        {emailSentSuccess 
                          ? `✓ E-mail envoyé avec succès à ${inviteForm.email}` 
                          : `Envoyer directement par Gmail à ${inviteForm.email}`}
                      </span>
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp</span>
                    </button>

                    {/* SMS */}
                    <button
                      type="button"
                      onClick={handleOpenSMS}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Smartphone size={16} />
                      <span>SMS Mobile</span>
                    </button>

                    {/* Email */}
                    <button
                      type="button"
                      onClick={handleOpenEmail}
                      className="py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Mail size={16} />
                      <span>Ouvrir l'e-mail</span>
                    </button>

                    {/* Copier le lien */}
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      {copiedInviteUrl ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      <span>{copiedInviteUrl ? 'Lien copié !' : 'Copier le lien'}</span>
                    </button>
                  </div>
                </div>

                {/* Lien tester comme client */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={fullInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1C3A6B] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Tester le lien comme le client</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsQuickInviteOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
