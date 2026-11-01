import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  FileText, Receipt, Users, Megaphone, Calendar, Plus, Check, Clock, 
  ArrowRight, PhoneCall, Mail, MessageSquare, AlertCircle, ChevronDown, 
  ChevronRight, ChevronLeft, Search, Mic, MicOff, Bell, LogOut, HelpCircle, User, 
  Camera, Zap, ShieldCheck, CheckSquare, Square, RefreshCw, X, GripVertical,
  ShoppingBag, Building2, LayoutDashboard, Settings, Sparkles, TrendingUp, BarChart3,
  PanelLeftClose, PanelLeftOpen, PlayCircle, Palette
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { fetchInvoiceKPIs, fetchInvoicesList, Invoice } from "@/lib/invoiceService";
import { fetchAppointments, Appointment } from "@/lib/appointmentService";
import { 
  PLATFORM_SERVICES,
  PlatformServiceItem,
  resolveServicesFromNeeds,
  resolveActivatedToolIds,
  loadUserServicesConfig,
  saveUserServicesConfig,
  calculateHoursSaved,
  UserServicesConfig
} from "@/lib/servicesIAMapping";
import { loadPersonaFromDatabase, savePersonaToDatabase } from "@/lib/personaEngine";

// Composants d'outils chargés à la demande pour l'affichage direct dans l'App Shell (sans rechargement de page)
const ServicesIAQuote = lazy(() => import("@/pages/ServicesIAQuote"));
const ServicesIAInvoice = lazy(() => import("@/pages/ServicesIAInvoice"));
const ServicesIAFollowup = lazy(() => import("@/pages/ServicesIAFollowup"));
const ServicesIALeads = lazy(() => import("@/pages/ServicesIALeads"));
const ServicesIAAppointments = lazy(() => import("@/pages/ServicesIAAppointments"));
const ServicesIAProspecting = lazy(() => import("@/pages/ServicesIAProspecting"));
const ServicesIAMeetingPrep = lazy(() => import("@/pages/ServicesIAMeetingPrep"));
const ServicesIAContent = lazy(() => import("@/pages/ServicesIAContent"));
const ServicesIAEmail = lazy(() => import("@/pages/ServicesIAEmail"));
const ServicesIASummarizer = lazy(() => import("@/pages/ServicesIASummarizer"));
const ServicesIAMeetings = lazy(() => import("@/pages/ServicesIAMeetings"));
const ServicesIADiagnostic = lazy(() => import("@/pages/ServicesIADiagnostic"));
const ServicesIADeepDiagnostic = lazy(() => import("@/pages/ServicesIADeepDiagnostic"));
const ServicesIACalcROI = lazy(() => import("@/pages/ServicesIACalcROI"));
const ServicesIABenchmark = lazy(() => import("@/pages/ServicesIABenchmark"));
const CompanyDashboard = lazy(() => import("@/pages/auth/Dashboard").then(m => ({ default: m.Dashboard })));

export interface ServiceFamilyDefinition {
  id: string;
  category: 'Factures & paiements' | 'Trouver des clients' | 'Me faire connaître' | 'Mon quotidien' | 'Gains de temps & Économies';
  name: string;
  shortDesc: string;
  icon: any;
  sidebar: {
    badgeBg: string;
    border: string;
    accentText: string;
    dotBg: string;
    headerBg: string;
    itemHover: string;
  };
  modal: {
    accentText: string;
    badgeBg: string;
    border: string;
    bgSubtle: string;
    btnActivate: string;
    activeCardBorder: string;
    activeCardBg: string;
  };
}

export const SERVICE_FAMILIES: ServiceFamilyDefinition[] = [
  {
    id: 'factures',
    category: 'Factures & paiements',
    name: 'Factures & paiements',
    shortDesc: 'Devis, facturation Factur-X, trésorerie, relances & scan de reçus',
    icon: Receipt,
    sidebar: {
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
      border: 'border-emerald-500/20',
      accentText: 'text-emerald-400/90',
      dotBg: 'bg-emerald-400',
      headerBg: 'hover:bg-white/[0.05]',
      itemHover: 'hover:bg-white/[0.06]',
    },
    modal: {
      accentText: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      border: 'border-emerald-200',
      bgSubtle: 'bg-emerald-50/25',
      btnActivate: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      activeCardBorder: 'border-emerald-600',
      activeCardBg: 'bg-emerald-50/40',
    }
  },
  {
    id: 'clients',
    category: 'Trouver des clients',
    name: 'Trouver des clients',
    shortDesc: 'Détection d’opportunités locales, prospection et planning de RDV',
    icon: Users,
    sidebar: {
      badgeBg: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
      border: 'border-amber-500/20',
      accentText: 'text-amber-400/90',
      dotBg: 'bg-amber-400',
      headerBg: 'hover:bg-white/[0.05]',
      itemHover: 'hover:bg-white/[0.06]',
    },
    modal: {
      accentText: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      border: 'border-amber-200',
      bgSubtle: 'bg-amber-50/25',
      btnActivate: 'bg-amber-600 hover:bg-amber-700 text-white',
      activeCardBorder: 'border-amber-600',
      activeCardBg: 'bg-amber-50/40',
    }
  },
  {
    id: 'visibilite',
    category: 'Me faire connaître',
    name: 'Me faire connaître',
    shortDesc: 'Publications chantiers, vitrine web et avis clients',
    icon: Megaphone,
    sidebar: {
      badgeBg: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20',
      border: 'border-indigo-500/20',
      accentText: 'text-indigo-400/90',
      dotBg: 'bg-indigo-400',
      headerBg: 'hover:bg-white/[0.05]',
      itemHover: 'hover:bg-white/[0.06]',
    },
    modal: {
      accentText: 'text-indigo-800',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      border: 'border-indigo-200',
      bgSubtle: 'bg-indigo-50/25',
      btnActivate: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      activeCardBorder: 'border-indigo-600',
      activeCardBg: 'bg-indigo-50/40',
    }
  },
  {
    id: 'quotidien',
    category: 'Mon quotidien',
    name: 'Mon quotidien',
    shortDesc: 'Assistant e-mails pros, résumés de contrats et dictée de mémos',
    icon: Calendar,
    sidebar: {
      badgeBg: 'bg-sky-500/15 text-sky-300 border border-sky-500/20',
      border: 'border-sky-500/20',
      accentText: 'text-sky-400/90',
      dotBg: 'bg-sky-400',
      headerBg: 'hover:bg-white/[0.05]',
      itemHover: 'hover:bg-white/[0.06]',
    },
    modal: {
      accentText: 'text-sky-900',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
      border: 'border-sky-200',
      bgSubtle: 'bg-sky-50/25',
      btnActivate: 'bg-sky-700 hover:bg-sky-800 text-white',
      activeCardBorder: 'border-sky-600',
      activeCardBg: 'bg-sky-50/40',
    }
  },
  {
    id: 'audit_roi',
    category: 'Gains de temps & Économies',
    name: 'Gains de temps & Économies',
    shortDesc: 'Bilan en 2 min, calcul de vos heures économisées et comparatif métier',
    icon: Sparkles,
    sidebar: {
      badgeBg: 'bg-purple-500/15 text-purple-300 border border-purple-500/20',
      border: 'border-purple-500/20',
      accentText: 'text-purple-400/90',
      dotBg: 'bg-purple-400',
      headerBg: 'hover:bg-white/[0.05]',
      itemHover: 'hover:bg-white/[0.06]',
    },
    modal: {
      accentText: 'text-purple-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      border: 'border-purple-200',
      bgSubtle: 'bg-purple-50/25',
      btnActivate: 'bg-purple-700 hover:bg-purple-800 text-white',
      activeCardBorder: 'border-purple-600',
      activeCardBg: 'bg-purple-50/40',
    }
  }
];

export type SidebarThemeKey = 'navy' | 'blue' | 'emerald' | 'orange' | 'amber' | 'coral' | 'purple' | 'slate';

export const SIDEBAR_THEMES: Record<SidebarThemeKey, { id: SidebarThemeKey; label: string; dotHex: string; gradient: string }> = {
  navy: {
    id: 'navy',
    label: 'Bleu Nuit Classique',
    dotHex: '#142B52',
    gradient: 'linear-gradient(180deg, #142B52 0%, #0F2140 100%)',
  },
  blue: {
    id: 'blue',
    label: 'Bleu Royal & Cobalt',
    dotHex: '#2563EB',
    gradient: 'linear-gradient(155deg, #1E3A8A 0%, #1D4ED8 55%, #1E40AF 100%)',
  },
  emerald: {
    id: 'emerald',
    label: 'Vert Émeraude Vif',
    dotHex: '#10B981',
    gradient: 'linear-gradient(155deg, #064E3B 0%, #065F46 55%, #047857 100%)',
  },
  orange: {
    id: 'orange',
    label: 'Orange Vif & Mandarine',
    dotHex: '#F97316',
    gradient: 'linear-gradient(155deg, #7C2D12 0%, #9A3412 55%, #C2410C 100%)',
  },
  amber: {
    id: 'amber',
    label: 'Safran & Ocre Solaire',
    dotHex: '#F59E0B',
    gradient: 'linear-gradient(155deg, #78350F 0%, #92400E 55%, #B45309 100%)',
  },
  coral: {
    id: 'coral',
    label: 'Corail & Rubis',
    dotHex: '#F43F5E',
    gradient: 'linear-gradient(155deg, #881337 0%, #9F1239 55%, #BE123C 100%)',
  },
  purple: {
    id: 'purple',
    label: 'Violet Impérial & Améthyste',
    dotHex: '#9333EA',
    gradient: 'linear-gradient(155deg, #4C1D95 0%, #581C87 55%, #6B21A8 100%)',
  },
  slate: {
    id: 'slate',
    label: 'Gris Titane & Ardoise',
    dotHex: '#64748B',
    gradient: 'linear-gradient(155deg, #0F172A 0%, #1E293B 55%, #334155 100%)',
  },
};

const EmbeddedLoader = () => (
  <div className="w-full min-h-[380px] flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
    <div className="w-9 h-9 border-3 border-[#1C3A6B] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs sm:text-sm font-semibold text-slate-600">Chargement de votre outil...</span>
  </div>
);

export default function ServicesIADashboard() {
  const { company, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Vue active de l'App Shell (Master-Detail SPA)
  // 'overview' = tableau de bord principal ; sinon = identifiant de l'outil embarqué
  const rawView = searchParams.get('view') || searchParams.get('tool');
  const activeView = rawView || 'overview';

  const handleSelectView = (viewId: string, extraParams?: Record<string, string>) => {
    if (viewId === 'overview') {
      setSearchParams({});
    } else {
      const defaultParams: Record<string, Record<string, string>> = {
        paiements: { tab: 'banking' },
        expenses: { tab: 'expenses' },
        achats: { tab: 'expenses' },
        facturation: { tab: 'editor' },
        efacture: { tab: 'pricing' },
        factures: { tab: 'dashboard' },
        impayes: { filter: 'litiges' },
      };
      setSearchParams({
        view: viewId,
        ...(defaultParams[viewId] || {}),
        ...(extraParams || {})
      });
    }
  };

  // Profil métier & configuration utilisateur (chargé depuis la source de vérité)
  const [profile, setProfile] = useState<UserServicesConfig | null>(() => {
    return loadUserServicesConfig(company?.id);
  });

  // Outils activés (strictement basés sur les réponses réelles du questionnaire ou les choix manuels)
  const [activatedTools, setActivatedTools] = useState<string[]>(() => {
    const config = loadUserServicesConfig(company?.id);
    if (config?.activatedTools && Array.isArray(config.activatedTools)) {
      return config.activatedTools;
    }
    if (config?.needs && Array.isArray(config.needs)) {
      return resolveActivatedToolIds(config.needs);
    }
    try {
      const raw = localStorage.getItem('mdiv_activated_tools');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Synchronisation dynamique lors des mises à jour globales
  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      const updated = e.detail || loadUserServicesConfig(company?.id);
      if (updated) {
        setProfile(updated);
        setActivatedTools(updated.activatedTools || resolveActivatedToolIds(updated.needs || []));
      }
    };
    window.addEventListener('mdiv-tools-updated', handleConfigUpdate);
    return () => window.removeEventListener('mdiv-tools-updated', handleConfigUpdate);
  }, [company]);

  // Synchronisation lors de la connexion de l'entreprise (Directement depuis la Base de Données)
  useEffect(() => {
    if (company?.id) {
      loadPersonaFromDatabase(company.id).then(userConf => {
        if (userConf) {
          setProfile(userConf);
          setActivatedTools(userConf.activatedTools || resolveActivatedToolIds(userConf.needs || []));
        }
      });
    }
  }, [company]);

  // Barre "Que voulez-vous faire ?"
  const [askQuery, setAskQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  // Modale d'ajout d'outils
  const [isAddToolsOpen, setIsAddToolsOpen] = useState(false);

  // Modale de demande de rappel conseiller
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackTime, setCallbackTime] = useState("Dès que possible");

  // Menu déroulant profil entreprise & notifications
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Données réelles de facturation et de rendez-vous
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboardAppointments, setDashboardAppointments] = useState<Appointment[]>([]);
  const [kpis, setKpis] = useState<{ totalIssued: number; totalPaid: number; totalPending: number; totalOverdue: number }>({
    totalIssued: 6900,
    totalPaid: 6900,
    totalPending: 4280,
    totalOverdue: 1150
  });

  // Checklist dynamique selon les outils activés par l'utilisateur
  const checklist = [
    { id: 'space', label: 'Créer mon espace', done: true, viewId: 'overview' },
    { id: 'bilan', label: `Faire mon bilan (${profile?.metierLabel || 'personnalisé'})`, done: true, viewId: 'diagnostic_express' },
    ...(activatedTools.includes('devis') ? [{ id: 'devis', label: 'Faire mon premier devis', done: false, action: 'Faire', viewId: 'devis' }] : []),
    ...(activatedTools.includes('rdv_online') ? [{ id: 'rdv_online', label: 'Configurer ma prise de RDV 24h/24', done: dashboardAppointments.length > 0, action: 'Régler', viewId: 'rdv_online' }] : []),
    ...(activatedTools.includes('efacture') ? [{ id: 'efacture', label: 'Activer la facture électronique PPF', done: false, action: 'Activer', viewId: 'efacture' }] : []),
    ...(activatedTools.includes('relance') ? [{ id: 'relance', label: 'Programmer les relances automatiques', done: false, action: 'Configurer', viewId: 'relance' }] : []),
    ...(activatedTools.includes('clients') ? [{ id: 'clients', label: 'Lancer ma première recherche de clients', done: false, action: 'Lancer', viewId: 'clients' }] : []),
    ...(activatedTools.includes('visible') ? [{ id: 'visible', label: 'Publier mon premier chantier photo', done: false, action: 'Créer', viewId: 'visible' }] : []),
    ...(activatedTools.includes('mails') ? [{ id: 'mails', label: 'Connecter ma boîte e-mail professionnelle', done: false, action: 'Connecter', viewId: 'mails' }] : []),
    ...(activatedTools.includes('expenses') ? [{ id: 'expenses', label: 'Scanner un premier ticket de caisse', done: false, action: 'Scanner', viewId: 'expenses' }] : []),
    ...(activatedTools.includes('diagnostic_express') ? [{ id: 'diagnostic_express', label: 'Faire le bilan express de mon entreprise', done: false, action: 'Faire', viewId: 'diagnostic_express' }] : []),
    ...(activatedTools.includes('calc_roi') ? [{ id: 'calc_roi', label: 'Calculer mon temps gagné et mes économies', done: false, action: 'Calculer', viewId: 'calc_roi' }] : []),
    ...(activatedTools.includes('benchmark') ? [{ id: 'benchmark', label: 'Voir comment s’organisent les pros de mon métier', done: false, action: 'Comparer', viewId: 'benchmark' }] : []),
    { id: 'logo', label: 'Ajouter mon logo et mes coordonnées', done: false, action: 'Faire', viewId: 'company' },
  ].slice(0, 5);

  // Chargement des données réelles
  useEffect(() => {
    const cid = company?.id ? Number(company.id) : 4;
    fetchAppointments(cid).then(list => {
      if (list) setDashboardAppointments(list);
    }).catch(() => {});

    if (company?.id) {
      fetchInvoiceKPIs(company.id).then(res => {
        if (res && (res.totalIssued > 0 || res.totalPending > 0)) {
          setKpis(res);
        }
      }).catch(() => {});

      fetchInvoicesList(company.id).then(list => {
        if (list && list.length > 0) {
          setInvoices(list);
        }
      }).catch(() => {});
    }
  }, [company]);

  // Gestion de la reconnaissance vocale
  const toggleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info("La dictée vocale n'est pas supportée par votre navigateur. Vous pouvez taper directement votre demande.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("À l'écoute... Dictez votre demande (ex : faire un devis pour Mme Laurent).");
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setAskQuery(text);
        setIsListening(false);
        handleAskSubmit(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleAskSubmit = (overrideText?: string) => {
    const q = (overrideText || askQuery).toLowerCase().trim();
    if (!q) return;

    if (q.includes('devis') || q.includes('chiffrage')) {
      toast.success("Ouverture de l'outil Devis...");
      handleSelectView('devis');
    } else if (q.includes('factur')) {
      toast.success("Ouverture de l'outil Factures...");
      handleSelectView('factures');
    } else if (q.includes('achat') || q.includes('ticket') || q.includes('dépense') || q.includes('fournisseur')) {
      toast.success("Ouverture du module Achats & Dépenses...");
      handleSelectView('expenses', { tab: 'achats' });
    } else if (q.includes('relance') || q.includes('impayé')) {
      toast.success("Ouverture des relances...");
      handleSelectView('relance');
    } else if (q.includes('mail') || q.includes('courriel') || q.includes('écri')) {
      toast.success("Ouverture de l'assistant e-mail...");
      handleSelectView('mails');
    } else if (q.includes('client') || q.includes('prospect')) {
      toast.success("Ouverture de la recherche de clients...");
      handleSelectView('clients');
    } else if (q.includes('diagnostic') || q.includes('maturité') || q.includes('audit')) {
      toast.success("Ouverture du Bilan Express...");
      handleSelectView('diagnostic_express');
    } else if (q.includes('roi') || q.includes('rentab') || q.includes('gain') || q.includes('calcul')) {
      toast.success("Ouverture du Calculateur de gains...");
      handleSelectView('calc_roi');
    } else if (q.includes('benchmark') || q.includes('compar') || q.includes('secteur')) {
      toast.success("Ouverture du Benchmark Sectoriel...");
      handleSelectView('benchmark');
    } else {
      toast.info(`Demande enregistrée : "${q}". Ouverture de l'assistant quotidien...`);
      handleSelectView('mails');
    }
  };

  // Titres conviviaux pour le fil d'Ariane
  const getViewTitle = (view: string): string => {
    const titles: Record<string, string> = {
      devis: "Devis Factur-X & Chiffrage IA",
      factures: "Facturation électronique Factur-X & Trésorerie",
      facturation: "Facturation électronique Factur-X",
      paiements: "Suivi des paiements & Trésorerie",
      efacture: "Conformité Facture électronique 2026 (PPF)",
      expenses: "Achats fournisseurs & Dépenses (Scan OCR)",
      achats: "Achats fournisseurs & Dépenses (Scan OCR)",
      rentabilite: "Marges & rentabilité par chantier",
      relance: "Relances automatiques des impayés",
      relances: "Relances automatiques des impayés",
      impayes: "Gestion du recouvrement & litiges",
      clients: "Trouver de nouveaux clients & Opportunités locales",
      rdv_online: "Prise de rendez-vous en ligne 24h/24",
      prospection: "Messages de prospection ciblés",
      rdv: "Préparation d’un rendez-vous client",
      visible: "Visibilité web & Publications chantiers",
      siteweb: "Vitrine web & Référencement local (SEO)",
      avis: "Réponses aux avis Google & e-réputation",
      mails: "Gestion des e-mails professionnels",
      docs: "Résumer et comprendre un document",
      reunions: "Comptes-rendus automatiques & mémos vocaux",
      diagnostic_express: "Bilan express de mon entreprise",
      diagnostic: "Bilan express de mon entreprise",
      calc_roi: "Calculateur mon temps gagné & mes économies",
      benchmark: "Me comparer aux pros de mon secteur",
      company: "Paramètres de l'entreprise & Logo",
    };
    return titles[view] || "Outil sélectionné";
  };

  // Rendu de l'outil sélectionné dans le panneau de droite sans perdre la sidebar
  const renderEmbeddedView = (view: string) => {
    switch (view) {
      case 'devis':
        return <ServicesIAQuote />;

      case 'facturation':
        return <ServicesIAInvoice initialTab="editor" />;

      case 'factures':
        return <ServicesIAInvoice initialTab="dashboard" />;

      case 'paiements':
        return <ServicesIAInvoice initialTab="banking" />;

      case 'expenses':
      case 'achats':
        return <ServicesIAInvoice initialTab="expenses" />;

      case 'efacture':
        return <ServicesIAInvoice initialTab="pricing" />;

      case 'rentabilite':
        return <ServicesIAInvoice initialTab="dashboard" />;

      case 'relance':
      case 'relances':
        return <ServicesIAFollowup initialFilter="all" />;

      case 'impayes':
        return <ServicesIAFollowup initialFilter="litiges" />;

      case 'clients':
        return <ServicesIALeads />;

      case 'rdv_online':
      case 'planning':
      case 'appointments':
        return <ServicesIAAppointments onNavigateView={handleSelectView} />;

      case 'prospection':
        return <ServicesIAProspecting />;

      case 'rdv':
      case 'prepa-rdv':
        return <ServicesIAMeetingPrep />;

      case 'visible':
      case 'siteweb':
      case 'avis':
        return <ServicesIAContent />;

      case 'mails':
        return <ServicesIAEmail />;

      case 'docs':
        return <ServicesIASummarizer />;

      case 'reunions':
        return <ServicesIAMeetings />;

      case 'diagnostic_express':
      case 'diagnostic':
        return <ServicesIADeepDiagnostic onNavigateView={handleSelectView} />;

      case 'calc_roi':
        return <ServicesIACalcROI />;

      case 'benchmark':
        return <ServicesIABenchmark />;

      case 'company':
        return <CompanyDashboard />;

      default:
        return <ServicesIAInvoice initialTab="editor" />;
    }
  };

  // État de masquage / repliement du menu latéral (chevron de repliement)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mdiv_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('mdiv_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Thème de couleur personnalisé de la barre latérale (avec persistance localStorage)
  const [sidebarTheme, setSidebarTheme] = useState<SidebarThemeKey>(() => {
    try {
      const saved = localStorage.getItem('mdiv_sidebar_theme') as SidebarThemeKey;
      if (saved && SIDEBAR_THEMES[saved]) return saved;
    } catch {}
    return 'navy';
  });

  const handleSidebarThemeChange = (key: SidebarThemeKey) => {
    setSidebarTheme(key);
    try {
      localStorage.setItem('mdiv_sidebar_theme', key);
    } catch {}
  };

  // Largeur ajustable manuellement pour la barre latérale SaaS (cible 250–270 px, par défaut 260 px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('mdiv_sidebar_width_saas');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 240 && parsed <= 300) return parsed;
      }
    } catch {}
    return 260;
  });

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 240), 300);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem('mdiv_sidebar_width_saas', sidebarWidth.toString());
        } catch {}
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);

  // État de déroulement des familles dans la barre latérale avec persistance
  const [openSidebarFamilies, setOpenSidebarFamilies] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mdiv_sidebar_families_open');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      }
    } catch {}
    return {
      factures: true,
      clients: true,
      visibilite: true,
      quotidien: true,
      audit_roi: true,
    };
  });

  const familyRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const toolsScrollRef = useRef<HTMLDivElement | null>(null);

  // Basculer le déroulement d'une famille d'outils avec recentrage fluide si elle s'ouvre
  const toggleSidebarFamily = (famId: string) => {
    setOpenSidebarFamilies(prev => {
      const willOpen = !prev[famId];
      const next = {
        ...prev,
        [famId]: willOpen
      };
      try {
        localStorage.setItem('mdiv_sidebar_families_open', JSON.stringify(next));
      } catch {}

      if (willOpen) {
        // Faire défiler doucement pour que le bloc qui s'ouvre reste entièrement visible
        setTimeout(() => {
          const el = familyRefs.current[famId];
          if (el && toolsScrollRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 60);
      }
      return next;
    });
  };

  // Basculer l'ouverture/fermeture de toutes les familles en 1 clic
  const isAnyFamilyOpen = Object.values(openSidebarFamilies).some(Boolean);
  const toggleAllSidebarFamilies = () => {
    const nextState = !isAnyFamilyOpen;
    const next: Record<string, boolean> = {
      factures: nextState,
      clients: nextState,
      visibilite: nextState,
      quotidien: nextState,
      audit_roi: nextState,
    };
    setOpenSidebarFamilies(next);
    try {
      localStorage.setItem('mdiv_sidebar_families_open', JSON.stringify(next));
    } catch {}
  };

  // Basculer l'activation d'un outil individuel (avec garantie de persistance)
  const toggleTool = (toolId: string) => {
    setActivatedTools(prev => {
      const next = prev.includes(toolId) ? prev.filter(x => x !== toolId) : [...prev, toolId];
      const updatedConfig: UserServicesConfig = {
        ...(profile || {
          needs: next,
          activatedTools: next,
          hoursSaved: calculateHoursSaved(next),
        }),
        needs: next,
        activatedTools: next,
        hoursSaved: calculateHoursSaved(next),
      };
      savePersonaToDatabase(updatedConfig, company?.id);
      setProfile(updatedConfig);
      toast.success(next.includes(toolId) ? "Outil activé dans votre espace" : "Outil retiré de votre espace");
      return next;
    });
  };

  // Basculer l'activation de tous les outils d'une famille entière
  const toggleAllFamily = (category: string, activate: boolean) => {
    const familyIds = ALL_TOOLS.filter(t => t.category === category).map(t => t.id);
    setActivatedTools(prev => {
      const set = new Set(prev);
      if (activate) {
        familyIds.forEach(id => set.add(id));
      } else {
        familyIds.forEach(id => set.delete(id));
      }
      const next = Array.from(set);
      const updatedConfig: UserServicesConfig = {
        ...(profile || {
          needs: next,
          activatedTools: next,
          hoursSaved: calculateHoursSaved(next),
        }),
        needs: next,
        activatedTools: next,
        hoursSaved: calculateHoursSaved(next),
      };
      savePersonaToDatabase(updatedConfig, company?.id);
      setProfile(updatedConfig);
      toast.success(activate ? `Tous les outils de "${category}" sont activés` : `Outils de "${category}" retirés`);
      return next;
    });
  };

  // Envoyer la demande de rappel
  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) {
      toast.error("Veuillez renseigner votre numéro de téléphone.");
      return;
    }
    toast.success("Demande de rappel transmise. Votre conseiller vous contactera au " + callbackPhone);
    setIsCallbackModalOpen(false);
    setCallbackPhone("");
  };

  // Liste de tous les outils possibles dans la plateforme (source unique de vérité)
  const ALL_TOOLS = PLATFORM_SERVICES;

  // Outils activés par l'utilisateur
  const userTools = ALL_TOOLS.filter(t => activatedTools.includes(t.id));
  const otherTools = ALL_TOOLS.filter(t => !activatedTools.includes(t.id));

  // Vérification de l'activation du calendrier / prise de rendez-vous en ligne
  const isCalendarActive = activatedTools.includes('rdv_online') || activatedTools.includes('rdv') || activatedTools.includes('planning') || activatedTools.includes('appointments');

  // Helper d'icône pour les outils
  const getToolIcon = (id: string, size = 18, className = "") => {
    switch (id) {
      case 'devis': return <FileText size={size} className={className} />;
      case 'facturation': return <Receipt size={size} className={className} />;
      case 'paiements': return <Receipt size={size} className={className} />;
      case 'relance': return <RefreshCw size={size} className={className} />;
      case 'impayes': return <ShieldCheck size={size} className={className} />;
      case 'efacture': return <ShieldCheck size={size} className={className} />;
      case 'expenses': return <ShoppingBag size={size} className={className} />;
      case 'rentabilite': return <Receipt size={size} className={className} />;
      case 'clients': return <Users size={size} className={className} />;
      case 'rdv_online':
      case 'rdv': return <Calendar size={size} className={className} />;
      case 'prospection': return <Mail size={size} className={className} />;
      case 'siteweb':
      case 'visible': return <Megaphone size={size} className={className} />;
      case 'avis': return <MessageSquare size={size} className={className} />;
      case 'mails': return <Mail size={size} className={className} />;
      case 'docs':
      case 'reunions': return <FileText size={size} className={className} />;
      case 'diagnostic_express': return <Sparkles size={size} className={className} />;
      case 'calc_roi': return <TrendingUp size={size} className={className} />;
      case 'benchmark': return <BarChart3 size={size} className={className} />;
      default: return <Zap size={size} className={className} />;
    }
  };

  // Actions rapides dynamiques basées sur les outils activés
  const TOOL_QUICK_ACTIONS: Record<string, { label: string; link: string; icon: any }> = {
    devis: { label: 'Faire un devis', link: '/services-ia/factures', icon: FileText },
    facturation: { label: 'Facture électronique', link: '/services-ia/factures', icon: Receipt },
    paiements: { label: 'Suivre paiements', link: '/services-ia/factures', icon: Receipt },
    relance: { label: 'Relancer un client', link: '/services-ia/relances', icon: RefreshCw },
    impayes: { label: 'Recouvrement', link: '/services-ia/relances', icon: ShieldCheck },
    efacture: { label: 'Facture électronique', link: '/services-ia/factures', icon: ShieldCheck },
    expenses: { label: 'Ajouter un achat', link: '/services-ia/factures?tab=achats', icon: ShoppingBag },
    rentabilite: { label: 'Marges & rentabilité', link: '/services-ia/factures', icon: Receipt },
    clients: { label: 'Trouver des clients', link: '/services-ia/generateur-leads', icon: Users },
    rdv_online: { label: 'Prendre un RDV 24h/24', link: '/services-ia/dashboard?view=rdv_online', icon: Calendar },
    prospection: { label: 'Message prospection', link: '/services-ia/prospection-email', icon: Mail },
    rdv: { label: 'Préparer un rendez-vous', link: '/services-ia/prepa-reunion', icon: Calendar },
    siteweb: { label: 'Site web vitrine', link: '/services-ia/generateur-contenu', icon: Megaphone },
    visible: { label: 'Publier un chantier', link: '/services-ia/generateur-contenu', icon: Megaphone },
    avis: { label: 'Répondre avis Google', link: '/services-ia/generateur-contenu', icon: MessageSquare },
    mails: { label: 'Gérer mes e-mails', link: '/services-ia/assistant-email', icon: Mail },
    docs: { label: 'Résumer un document', link: '/services-ia/resume-documents', icon: FileText },
    reunions: { label: 'Compte-rendu vocal', link: '/services-ia/comptes-rendus', icon: Mic },
    diagnostic_express: { label: 'Bilan de mon entreprise', link: '/services-ia/dashboard?view=diagnostic_express', icon: Sparkles },
    calc_roi: { label: 'Calculer mes gains', link: '/services-ia/calc-roi', icon: TrendingUp },
    benchmark: { label: 'Comparer mon métier', link: '/services-ia/benchmark', icon: BarChart3 },
  };

  const dynamicQuickActions = activatedTools
    .map(id => ({ id, ...TOOL_QUICK_ACTIONS[id] }))
    .filter(item => !!item.label)
    .slice(0, 4);

  const displayQuickActions = [...dynamicQuickActions];
  const fallbackToolIds = ['devis', 'relance', 'clients', 'visible', 'mails'];
  for (const fId of fallbackToolIds) {
    if (displayQuickActions.length >= 4) break;
    if (!displayQuickActions.some(item => item.id === fId) && TOOL_QUICK_ACTIONS[fId]) {
      displayQuickActions.push({ id: fId, ...TOOL_QUICK_ACTIONS[fId] });
    }
  }

  const displayName = company?.name || profile?.companyName || profile?.userName || 'Mon Espace Entreprise';
  const displayCompany = company?.name || profile?.companyName || 'Mon Entreprise';
  const initialLetters = displayName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'MD';
  const isTeamShown = profile?.profile === 'petite' || profile?.profile === 'grande';

  if (!isAuthenticated) {
    return <Navigate to="/services-ia/diagnostic/login" replace />;
  }

  return (
    <div className="min-h-screen md:h-screen md:max-h-screen md:overflow-hidden bg-[#F6F3EE] text-[#14213D] flex flex-col md:flex-row font-sans">
      
      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVIGATION — DESIGN SAAS PREMIUM (260px développé / 72px rail) */}
      {/* ========================================================================= */}
      <TooltipProvider delayDuration={120}>
        <aside 
          style={{
            width: isSidebarCollapsed ? '72px' : `${sidebarWidth}px`,
            background: SIDEBAR_THEMES[sidebarTheme].gradient,
          }}
          className={`relative w-full md:h-screen md:max-h-screen md:sticky md:top-0 bg-[#142B52] border-r border-white/[0.08] text-white flex flex-col shrink-0 ${
            isSidebarCollapsed 
              ? 'hidden md:flex md:w-[72px] px-2 py-2.5 items-center' 
              : 'flex max-md:!w-full px-2.5 py-2.5'
          } ${isResizing ? 'transition-none select-none' : 'transition-[width,padding,background] duration-300 ease-out'}`}
        >
          {/* Poignée de redimensionnement manuel discrète (mode développé) */}
          {!isSidebarCollapsed && (
            <div
              onMouseDown={() => setIsResizing(true)}
              onDoubleClick={() => {
                setSidebarWidth(260);
                try { localStorage.setItem('mdiv_sidebar_width_saas', '260'); } catch {}
                toast.info("Largeur du menu réinitialisée (260 px)");
              }}
              className="hidden md:flex absolute top-0 -right-1 w-2 h-full cursor-col-resize items-center justify-center hover:bg-amber-400/30 active:bg-amber-400/50 transition-colors group z-30"
              title="Glisser pour ajuster la largeur (double-clic pour 260 px)"
            >
              <div className="w-0.5 h-10 rounded-full bg-white/10 group-hover:bg-amber-300/80 transition-colors" />
            </div>
          )}

          {/* EN-TÊTE ENTREPRISE & BASCULE COMPACT/DÉVELOPPÉ */}
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 pb-2.5 mb-2 border-b border-white/[0.07] w-full shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleSelectView('company')}
                    className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer group ${
                      activeView === 'company' ? 'ring-2 ring-amber-400 bg-white/10' : 'hover:bg-white/[0.08]'
                    }`}
                  >
                    {company?.logo || company?.logo_url ? (
                      <img
                        src={company.logo || company.logo_url}
                        alt={company.name || 'Logo Entreprise'}
                        className="w-7 h-7 rounded-md object-contain bg-white p-0.5 shadow-2xs"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-md bg-white text-[#142B52] font-bold flex items-center justify-center text-xs shadow-2xs">
                        {(company?.name || profile?.companyName || 'E').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#142B52] absolute -bottom-0.5 -right-0.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1.5 text-xs shadow-xl">
                  <div className="font-semibold text-[12px]">{company?.name || profile?.companyName || 'Mon Entreprise'}</div>
                  <div className="text-[10.5px] text-slate-300/80">Paramètres de l'entreprise</div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleSidebarCollapsed}
                    className="w-7 h-7 rounded-md text-slate-300/75 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Développer le menu latéral"
                  >
                    <PanelLeftOpen size={14} strokeWidth={1.75} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11.5px] font-medium shadow-xl">
                  Développer le menu
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-1 pb-2 mb-1.5 border-b border-white/[0.07] shrink-0">
              <button
                type="button"
                onClick={() => handleSelectView('company')}
                title="Paramétrer l'entreprise et modifier le logo"
                className={`flex items-center gap-2.5 px-1.5 py-1 text-white text-left cursor-pointer group rounded-lg transition-colors flex-1 min-w-0 ${
                  activeView === 'company' ? 'bg-white/[0.11]' : 'hover:bg-white/[0.06]'
                }`}
              >
                {company?.logo || company?.logo_url ? (
                  <img
                    src={company.logo || company.logo_url}
                    alt={company.name || 'Logo Entreprise'}
                    className="w-7 h-7 rounded-md object-contain bg-white border border-white/15 p-0.5 shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-md bg-white text-[#142B52] font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                    {(company?.name || profile?.companyName || 'E').charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className="font-semibold text-[13px] tracking-tight text-white truncate leading-tight"
                    title={company?.name || profile?.companyName || 'Mon Entreprise'}
                  >
                    {company?.name || profile?.companyName || 'Mon Entreprise'}
                  </span>
                  <span className="text-[11px] text-slate-300/75 font-normal flex items-center gap-1.5 mt-0.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{company?.legal_form ? `${company.legal_form} • ` : ''}Espace Entreprise</span>
                  </span>
                </div>
              </button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleSidebarCollapsed}
                    className="w-7 h-7 rounded-md text-slate-300/70 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Passer en mode compact"
                  >
                    <PanelLeftClose size={15} strokeWidth={1.75} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11.5px] font-medium shadow-xl">
                  Réduire le menu
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* CORPS DE LA NAVIGATION */}
          <nav className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
            {/* 1. NAVIGATION PRINCIPALE (SUR UNE SEULE LIGNE AVEC COULEURS DISTINCTES) */}
            {isSidebarCollapsed ? (
              <div className="flex flex-col items-center shrink-0 pb-2 border-b border-white/[0.07]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectView('overview')}
                      className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer border ${
                        ['overview', 'rdv_online', 'planning', 'appointments', 'factures', 'expenses'].includes(activeView)
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-2xs'
                          : 'bg-white/[0.06] text-slate-200 border-white/10 hover:bg-white/[0.12] hover:text-white'
                      }`}
                      title="Navigation principale (Espace, Agenda, Docs, Achats)"
                    >
                      {['overview', 'rdv_online', 'planning', 'appointments', 'factures', 'expenses'].includes(activeView) && (
                        <span className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-r-full bg-amber-400" />
                      )}
                      <LayoutDashboard size={16} strokeWidth={1.85} className="text-amber-300" />
                      <span className="text-[9px] font-semibold px-1 rounded-full bg-white/15 text-white absolute -bottom-0.5 -right-0.5 leading-tight">
                        4
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 p-2.5 shadow-xl rounded-xl min-w-[235px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400 px-1 pb-1.5 mb-1.5 border-b border-white/10 flex items-center justify-between">
                      <span>NAVIGATION PRINCIPALE</span>
                      <span className="text-[10px] text-slate-300">4</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {/* 1. Mon espace (Ambre) */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('overview')}
                        title="Mon espace (Vue d'ensemble)"
                        className={`relative h-10 px-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                          activeView === 'overview'
                            ? 'bg-amber-400 text-[#142B52] font-bold border-amber-300 shadow-xs'
                            : 'bg-amber-500/12 text-amber-200 border-amber-400/25 hover:bg-amber-500/25 hover:text-white font-semibold'
                        }`}
                      >
                        <LayoutDashboard size={14} strokeWidth={1.9} className="shrink-0" />
                        <span className="truncate leading-none">Espace</span>
                      </button>

                      {/* 2. Calendrier (Émeraude) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isCalendarActive) {
                            handleSelectView('rdv_online');
                          } else {
                            toast.info("Le calendrier n'est pas encore activé. Activez la prise de rendez-vous en ligne dans 'Ajouter ou enlever des outils'.");
                          }
                        }}
                        title={isCalendarActive ? "Accéder à mon calendrier & planning de rendez-vous" : "Calendrier non activé (à activer dans vos outils)"}
                        className={`relative h-10 px-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 border min-w-0 ${
                          !isCalendarActive
                            ? 'bg-emerald-500/5 text-emerald-300/40 border-emerald-500/15 cursor-not-allowed select-none font-normal opacity-65'
                            : activeView === 'rdv_online' || activeView === 'planning' || activeView === 'appointments'
                              ? 'bg-emerald-400 text-[#142B52] font-bold border-emerald-300 shadow-xs cursor-pointer'
                              : 'bg-emerald-500/12 text-emerald-200 border-emerald-400/25 hover:bg-emerald-500/25 hover:text-white font-semibold cursor-pointer'
                        }`}
                      >
                        <Calendar size={14} strokeWidth={1.9} className="shrink-0" />
                        <span className="truncate leading-none">Agenda</span>
                        {!isCalendarActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500/60 absolute top-1 right-1" />
                        ) : dashboardAppointments.length > 0 ? (
                          <span className="text-[8.5px] font-bold px-1 rounded-full bg-emerald-400 text-[#142B52] absolute -top-1 -right-1 leading-tight shadow-2xs">
                            {dashboardAppointments.length}
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                        )}
                      </button>

                      {/* 3. Mes documents (Bleu ciel) */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('factures')}
                        title="Mes documents (Devis & Factures)"
                        className={`relative h-10 px-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                          activeView === 'factures'
                            ? 'bg-sky-400 text-[#142B52] font-bold border-sky-300 shadow-xs'
                            : 'bg-sky-500/12 text-sky-200 border-sky-400/25 hover:bg-sky-500/25 hover:text-white font-semibold'
                        }`}
                      >
                        <FileText size={14} strokeWidth={1.9} className="shrink-0" />
                        <span className="truncate leading-none">Docs</span>
                      </button>

                      {/* 4. Mes achats & dépenses (Violet) */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('expenses', { tab: 'achats' })}
                        title="Mes achats & dépenses"
                        className={`relative h-10 px-1.5 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                          activeView === 'expenses'
                            ? 'bg-purple-400 text-[#142B52] font-bold border-purple-300 shadow-xs'
                            : 'bg-purple-500/12 text-purple-200 border-purple-400/25 hover:bg-purple-500/25 hover:text-white font-semibold'
                        }`}
                      >
                        <ShoppingBag size={14} strokeWidth={1.9} className="shrink-0" />
                        <span className="truncate leading-none">Achats</span>
                      </button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1 shrink-0 pb-2 border-b border-white/[0.07]">
                {/* 1. Mon espace (Ambre) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectView('overview')}
                      title="Mon espace (Vue d'ensemble)"
                      className={`relative h-10 px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                        activeView === 'overview'
                          ? 'bg-amber-400 text-[#142B52] font-bold border-amber-300 shadow-xs'
                          : 'bg-amber-500/12 text-amber-200 border-amber-400/25 hover:bg-amber-500/25 hover:text-white font-semibold'
                      }`}
                    >
                      <LayoutDashboard size={14} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate leading-none">Espace</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                    Mon espace (Vue d'ensemble)
                  </TooltipContent>
                </Tooltip>

                {/* 2. Calendrier (Émeraude) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCalendarActive) {
                          handleSelectView('rdv_online');
                        } else {
                          toast.info("Le calendrier n'est pas encore activé. Activez la prise de rendez-vous en ligne dans 'Ajouter ou enlever des outils'.");
                        }
                      }}
                      title={isCalendarActive ? "Accéder à mon calendrier & planning de rendez-vous" : "Calendrier non activé (à activer dans vos outils)"}
                      className={`relative h-10 px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 border min-w-0 ${
                        !isCalendarActive
                          ? 'bg-emerald-500/5 text-emerald-300/40 border-emerald-500/15 cursor-not-allowed select-none font-normal opacity-65'
                          : activeView === 'rdv_online' || activeView === 'planning' || activeView === 'appointments'
                            ? 'bg-emerald-400 text-[#142B52] font-bold border-emerald-300 shadow-xs cursor-pointer'
                            : 'bg-emerald-500/12 text-emerald-200 border-emerald-400/25 hover:bg-emerald-500/25 hover:text-white font-semibold cursor-pointer'
                      }`}
                    >
                      <Calendar size={14} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate leading-none">Agenda</span>
                      {!isCalendarActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500/60 absolute top-1 right-1" />
                      ) : dashboardAppointments.length > 0 ? (
                        <span className="text-[8.5px] font-bold px-1 rounded-full bg-emerald-400 text-[#142B52] absolute -top-1 -right-1 leading-tight shadow-2xs">
                          {dashboardAppointments.length}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl flex items-center gap-1.5">
                    <span>Calendrier</span>
                    {!isCalendarActive ? (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Désactivé</span>
                    ) : dashboardAppointments.length > 0 ? (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{dashboardAppointments.length} RDV</span>
                    ) : null}
                  </TooltipContent>
                </Tooltip>

                {/* 3. Mes documents (Bleu ciel) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectView('factures')}
                      title="Mes documents (Devis & Factures)"
                      className={`relative h-10 px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                        activeView === 'factures'
                          ? 'bg-sky-400 text-[#142B52] font-bold border-sky-300 shadow-xs'
                          : 'bg-sky-500/12 text-sky-200 border-sky-400/25 hover:bg-sky-500/25 hover:text-white font-semibold'
                      }`}
                    >
                      <FileText size={14} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate leading-none">Docs</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                    Mes documents (Devis & Factures)
                  </TooltipContent>
                </Tooltip>

                {/* 4. Mes achats & dépenses (Violet) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectView('expenses', { tab: 'achats' })}
                      title="Mes achats & dépenses"
                      className={`relative h-10 px-1 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-150 cursor-pointer border min-w-0 ${
                        activeView === 'expenses'
                          ? 'bg-purple-400 text-[#142B52] font-bold border-purple-300 shadow-xs'
                          : 'bg-purple-500/12 text-purple-200 border-purple-400/25 hover:bg-purple-500/25 hover:text-white font-semibold'
                      }`}
                    >
                      <ShoppingBag size={14} strokeWidth={1.9} className="shrink-0" />
                      <span className="truncate leading-none">Achats</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                    Mes achats & dépenses
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* 2. SECTION MES OUTILS (CATÉGORIES & SOUS-MODULES COMPACTS) */}
            {!isSidebarCollapsed && (
              <div className="pt-2.5 pb-1 px-2 flex items-center justify-between shrink-0">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.07em] text-slate-400/85 select-none">
                  MES OUTILS
                </span>
                <div className="flex items-center gap-1.5">
                  {userTools.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllSidebarFamilies}
                      className="text-[10.5px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isAnyFamilyOpen ? "Tout replier" : "Tout déplier"}
                    >
                      {isAnyFamilyOpen ? "Tout replier" : "Tout déplier"}
                    </button>
                  )}
                  <span className="bg-white/[0.08] text-slate-200 text-[10px] px-1.5 py-0.5 rounded font-semibold leading-none">
                    {userTools.length}
                  </span>
                </div>
              </div>
            )}

            {/* Liste des familles et sous-modules */}
            <div
              ref={toolsScrollRef}
              className={`flex-1 min-h-[100px] overflow-y-auto overscroll-contain flex flex-col custom-sidebar-scroll ${
                isSidebarCollapsed ? 'items-center gap-1 py-2' : 'pr-0.5 gap-0.5'
              }`}
            >
              {userTools.length > 0 ? (
                SERVICE_FAMILIES.map(family => {
                  const familyTools = userTools.filter(t => t.category === family.category);
                  if (familyTools.length === 0) return null;
                  const isOpen = openSidebarFamilies[family.id] ?? true;
                  const FamilyIcon = family.icon;
                  const hasActiveTool = familyTools.some(
                    t => activeView === t.id || (t.id === 'facturation' && activeView === 'factures')
                  );

                  if (isSidebarCollapsed) {
                    return (
                      <Tooltip key={family.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleSelectView(familyTools[0].id)}
                            className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
                              hasActiveTool
                                ? 'bg-white/[0.13] text-white shadow-2xs'
                                : 'text-slate-300/85 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            {hasActiveTool && (
                              <span className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-r-full bg-amber-400" />
                            )}
                            <FamilyIcon size={16} strokeWidth={1.75} className={family.sidebar.accentText} />
                            <span className="text-[9px] font-semibold px-1 rounded-full bg-white/10 text-slate-300 absolute -bottom-0.5 -right-0.5 leading-tight">
                              {familyTools.length}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 p-2 shadow-xl rounded-lg min-w-[190px]">
                          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-1.5 pb-1 mb-1 border-b border-white/10 flex items-center justify-between">
                            <span>{family.name}</span>
                            <span className="text-[10px] text-slate-300">{familyTools.length}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {familyTools.map(tool => {
                              const isAct = activeView === tool.id || (tool.id === 'facturation' && activeView === 'factures');
                              return (
                                <button
                                  key={tool.id}
                                  type="button"
                                  onClick={() => handleSelectView(tool.id)}
                                  className={`flex items-center gap-2 px-2 py-1 rounded text-[11.5px] text-left transition-colors cursor-pointer ${
                                    isAct ? 'bg-white/15 text-white font-semibold' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${family.sidebar.dotBg}`} />
                                  <span className="truncate">{tool.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <div
                      key={family.id}
                      ref={el => { familyRefs.current[family.id] = el; }}
                      className="shrink-0 flex flex-col"
                    >
                      {/* En-tête de catégorie compact (style Linear / Notion) */}
                      <button
                        type="button"
                        onClick={() => toggleSidebarFamily(family.id)}
                        className={`shrink-0 flex items-center justify-between h-7 px-2 rounded-md transition-colors cursor-pointer w-full text-left select-none group ${family.sidebar.headerBg}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <ChevronRight
                            size={13}
                            strokeWidth={2}
                            className={`text-slate-400/70 group-hover:text-slate-200 transition-transform duration-150 shrink-0 ${
                              isOpen ? 'rotate-90 text-slate-300' : ''
                            }`}
                          />
                          <FamilyIcon size={14} strokeWidth={1.75} className={`shrink-0 ${family.sidebar.accentText}`} />
                          <span
                            className={`text-[12.5px] leading-tight truncate ${
                              hasActiveTool ? 'font-semibold text-white' : 'font-medium text-slate-200/90 group-hover:text-white'
                            }`}
                          >
                            {family.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          {hasActiveTool && !isOpen && (
                            <span className={`w-1.5 h-1.5 rounded-full ${family.sidebar.dotBg}`} />
                          )}
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 group-hover:text-slate-200 leading-none">
                            {familyTools.length}
                          </span>
                        </div>
                      </button>

                      {/* Sous-modules légèrement indentés avec filet vertical */}
                      {isOpen && (
                        <div className="shrink-0 flex flex-col gap-0.5 ml-[14px] pl-2.5 border-l border-white/[0.08] mt-0.5 mb-1">
                          {familyTools.map(tool => {
                            const isActive = activeView === tool.id || (tool.id === 'facturation' && activeView === 'factures');
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => handleSelectView(tool.id)}
                                className={`relative shrink-0 flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[12px] transition-all duration-150 group/item w-full text-left cursor-pointer ${
                                  isActive
                                    ? 'bg-white/[0.11] text-white font-medium shadow-2xs'
                                    : 'text-slate-300/80 hover:text-white hover:bg-white/[0.05] font-normal'
                                }`}
                                title={tool.name}
                              >
                                {isActive && (
                                  <span className="absolute -left-[11px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-amber-400" />
                                )}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                                      isActive ? `${family.sidebar.dotBg} scale-110` : 'bg-slate-400/50 group-hover/item:bg-slate-300'
                                    }`}
                                  />
                                  <span className="truncate leading-snug">
                                    {tool.name}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                !isSidebarCollapsed && (
                  <div className="shrink-0 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11.5px] text-slate-400 italic text-center">
                    Aucun outil activé
                  </div>
                )
              )}
            </div>

            {/* Bouton Ajouter ou enlever des outils (toujours en surbrillance) */}
            {isSidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsAddToolsOpen(true)}
                    className="shrink-0 mt-1.5 w-9 h-9 rounded-lg border border-amber-300/80 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#142B52] shadow-[0_0_12px_rgba(251,191,36,0.35)] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-amber-400/40 px-2.5 py-1 text-xs font-semibold shadow-xl">
                  Ajouter ou enlever des outils
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddToolsOpen(true)}
                className="shrink-0 mt-1.5 h-8 px-2.5 rounded-lg border border-amber-300/80 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-[#142B52] font-semibold text-[11.5px] shadow-[0_0_12px_rgba(251,191,36,0.3)] hover:shadow-[0_0_16px_rgba(251,191,36,0.5)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} className="shrink-0" />
                <span className="truncate">Ajouter ou enlever des outils</span>
              </button>
            )}

            {/* Équipe & RH si >= 2 personnes */}
            {isTeamShown && !isSidebarCollapsed && (
              <div className="shrink-0 pt-2 mt-1.5 border-t border-white/[0.06] px-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400/80">
                  ÉQUIPE & RH
                </div>
                <div className="text-[11.5px] text-slate-300/85 truncate mt-0.5">
                  Petite équipe ({profile?.profile === 'grande' ? '10+ personnes' : '2 à 9 personnes'})
                </div>
              </div>
            )}

            {/* 3. SECTION M'AIDER (NAVIGATION SECONDAIRE COMPACTE) */}
            {isSidebarCollapsed ? (
              <div className="shrink-0 pt-2 mt-1.5 border-t border-white/[0.07] flex flex-col items-center w-full">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleSelectView('diagnostic_express')}
                      className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer border ${
                        activeView === 'diagnostic_express' || activeView === 'diagnostic'
                          ? 'bg-white/[0.15] text-white border-white/25 shadow-2xs'
                          : 'bg-white/[0.05] text-slate-200 border-white/10 hover:bg-white/[0.12] hover:text-white'
                      }`}
                      title="M'aider (Bilan, Tutoriels, Conseiller)"
                    >
                      {(activeView === 'diagnostic_express' || activeView === 'diagnostic') && (
                        <span className="absolute -left-2 top-2 bottom-2 w-[3px] rounded-r-full bg-amber-400" />
                      )}
                      <HelpCircle size={16} strokeWidth={1.85} className="text-amber-300" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" title="Conseiller disponible" />
                      <span className="text-[9px] font-semibold px-1 rounded-full bg-white/15 text-white absolute -bottom-0.5 -right-0.5 leading-tight">
                        3
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 p-2.5 shadow-xl rounded-xl min-w-[235px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400 px-1 pb-1.5 mb-1.5 border-b border-white/10 select-none flex items-center justify-between">
                      <span>M'AIDER</span>
                      <span className="text-[9.5px] font-medium normal-case tracking-normal text-slate-300">
                        {profile?.hoursSaved || 6} h/sem
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => handleSelectView('diagnostic_express')}
                        title={`Mon bilan (${profile?.hoursSaved || 6} h/sem)`}
                        className={`h-8 px-1.5 rounded-md flex items-center justify-center gap-1 text-[10.5px] transition-colors cursor-pointer min-w-0 ${
                          activeView === 'diagnostic_express' || activeView === 'diagnostic'
                            ? 'bg-white/[0.18] text-white font-semibold shadow-2xs'
                            : 'bg-white/[0.06] text-slate-200 hover:text-white hover:bg-white/[0.14] font-medium'
                        }`}
                      >
                        <Clock size={13} strokeWidth={1.75} className="text-slate-300/85 shrink-0" />
                        <span className="truncate leading-none">Bilan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.info("Vidéos pas à pas en cours de chargement. Votre conseiller peut aussi vous montrer au téléphone.")}
                        title="Vidéos pour apprendre"
                        className="h-8 px-1.5 rounded-md bg-white/[0.06] text-slate-200 hover:text-white hover:bg-white/[0.14] flex items-center justify-center gap-1 text-[10.5px] font-medium transition-colors cursor-pointer min-w-0"
                      >
                        <PlayCircle size={13} strokeWidth={1.75} className="text-slate-300/85 shrink-0" />
                        <span className="truncate leading-none">Tutoriels</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsCallbackModalOpen(true)}
                        title="Mon conseiller (joignable)"
                        className="relative h-8 px-1.5 rounded-md bg-white/[0.06] text-amber-300/90 hover:text-amber-200 hover:bg-white/[0.14] flex items-center justify-center gap-1 text-[10.5px] font-medium transition-colors cursor-pointer min-w-0"
                      >
                        <PhoneCall size={13} strokeWidth={1.75} className="shrink-0" />
                        <span className="truncate leading-none">Conseil</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Conseiller disponible" />
                      </button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="shrink-0 pt-2 mt-1.5 border-t border-white/[0.07]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400/85 px-1 pb-1 select-none flex items-center justify-between">
                  <span>M'AIDER</span>
                  <span className="text-[9.5px] font-medium normal-case tracking-normal text-slate-400/75">
                    {profile?.hoursSaved || 6} h/sem
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleSelectView('diagnostic_express')}
                        title={`Mon bilan (${profile?.hoursSaved || 6} h/sem)`}
                        className={`h-8 px-1.5 rounded-md flex items-center justify-center gap-1 text-[10.5px] transition-colors cursor-pointer min-w-0 ${
                          activeView === 'diagnostic_express' || activeView === 'diagnostic'
                            ? 'bg-white/[0.14] text-white font-semibold shadow-2xs'
                            : 'bg-white/[0.04] text-slate-300/90 hover:text-white hover:bg-white/[0.09] font-medium'
                        }`}
                      >
                        <Clock size={13} strokeWidth={1.75} className="text-slate-300/85 shrink-0" />
                        <span className="truncate leading-none">Bilan</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                      Mon bilan ({profile?.hoursSaved || 6} h/semaine)
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toast.info("Vidéos pas à pas en cours de chargement. Votre conseiller peut aussi vous montrer au téléphone.")}
                        title="Vidéos pour apprendre"
                        className="h-8 px-1.5 rounded-md bg-white/[0.04] text-slate-300/90 hover:text-white hover:bg-white/[0.09] flex items-center justify-center gap-1 text-[10.5px] font-medium transition-colors cursor-pointer min-w-0"
                      >
                        <PlayCircle size={13} strokeWidth={1.75} className="text-slate-300/85 shrink-0" />
                        <span className="truncate leading-none">Tutoriels</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                      Vidéos pour apprendre
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsCallbackModalOpen(true)}
                        title="Mon conseiller (joignable)"
                        className="relative h-8 px-1.5 rounded-md bg-white/[0.04] text-amber-300/90 hover:text-amber-200 hover:bg-white/[0.09] flex items-center justify-center gap-1 text-[10.5px] font-medium transition-colors cursor-pointer min-w-0"
                      >
                        <PhoneCall size={13} strokeWidth={1.75} className="shrink-0" />
                        <span className="truncate leading-none">Conseil</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Conseiller disponible" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-[11px] font-medium shadow-xl">
                      Mon conseiller (joignable)
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </nav>

          {/* PIED DE SIDEBAR & PALETTE DE COULEURS PERSONNALISABLE */}
          {isSidebarCollapsed ? (
            <div className="shrink-0 pt-2 mt-auto border-t border-white/[0.07] flex flex-col items-center gap-1.5 w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 border border-white/15 text-white/85 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Personnaliser la couleur du menu"
                  >
                    <Palette size={14} strokeWidth={1.75} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 p-2 shadow-xl rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-300 mb-1.5 px-1">Couleur du menu</div>
                  <div className="flex items-center gap-1.5 px-1">
                    {(Object.keys(SIDEBAR_THEMES) as SidebarThemeKey[]).map((key) => {
                      const t = SIDEBAR_THEMES[key];
                      const isSelected = sidebarTheme === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSidebarThemeChange(key)}
                          style={{ backgroundColor: t.dotHex }}
                          className={`w-4 h-4 rounded-full transition-all cursor-pointer border border-white/25 ${
                            isSelected ? 'ring-2 ring-white scale-125 shadow-sm' : 'opacity-75 hover:opacity-100 hover:scale-110'
                          }`}
                          title={t.label}
                          aria-label={t.label}
                        />
                      );
                    })}
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      toast.success("Vous êtes déconnecté.");
                      navigate('/services-ia');
                    }}
                    className="w-8 h-8 rounded-lg text-rose-300/85 hover:text-rose-200 hover:bg-rose-500/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <LogOut size={14} strokeWidth={1.75} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#0F2140] text-white border-white/15 px-2.5 py-1 text-xs font-medium shadow-xl">
                  Se déconnecter
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="shrink-0 pt-2 mt-1.5 border-t border-white/[0.08] flex flex-col gap-1.5">
              {/* Palette de couleurs de l'aside (style page de connexion) */}
              <div
                className="flex items-center justify-between gap-1.5 bg-black/25 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15 shadow-2xs"
                title="Changer la couleur du menu latéral"
              >
                <Palette size={11} className="text-white/80 shrink-0" />
                <div className="flex items-center justify-between flex-1 max-w-[180px]">
                  {(Object.keys(SIDEBAR_THEMES) as SidebarThemeKey[]).map((key) => {
                    const t = SIDEBAR_THEMES[key];
                    const isSelected = sidebarTheme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSidebarThemeChange(key)}
                        style={{ backgroundColor: t.dotHex }}
                        className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer border border-white/25 ${
                          isSelected ? 'ring-2 ring-white scale-125 shadow-sm' : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                        title={t.label}
                        aria-label={t.label}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="px-1 flex items-center justify-between text-[11px] font-medium text-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleSelectView('company')}
                  className="py-0.5 px-1 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Mon compte
                </button>
                <a
                  href="#questions"
                  onClick={() => navigate('/services-ia#questions')}
                  className="py-0.5 px-1 hover:text-white transition-colors"
                >
                  FAQ & Aide
                </a>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast.success("Vous êtes déconnecté.");
                    navigate('/services-ia');
                  }}
                  className="py-0.5 px-1 hover:text-rose-200 transition-colors flex items-center gap-1 cursor-pointer text-rose-300/90 font-medium"
                >
                  <LogOut size={12} strokeWidth={1.75} /> Quitter
                </button>
              </div>
            </div>
          )}
        </aside>
      </TooltipProvider>

      {/* ========================================================================= */}
      {/* 2. ZONE PRINCIPALE DU DASHBOARD                                           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 w-full md:h-screen md:max-h-screen md:overflow-y-auto">
        
        {/* Topbar SaaS harmonisée avec recherche globale & profil */}
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E3DED4]/80 px-4 md:px-6 h-14 flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
          
          {/* Bouton mobile ou réouverture rapide si mode compact */}
          {isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-[#142B52] text-white hover:bg-[#1C3A6B] rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
              title="Afficher le menu latéral"
            >
              <PanelLeftOpen size={14} />
              <span>Menu</span>
            </button>
          )}

          {/* Barre de commande rapide "Que voulez-vous faire ?" */}
          <div className="flex-1 max-w-xl flex items-center gap-2 border border-slate-200/90 hover:border-slate-300 focus-within:border-[#1C3A6B] focus-within:ring-2 focus-within:ring-[#1C3A6B]/10 rounded-lg px-3 h-9 bg-[#F8F7F4] transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAskSubmit(); }}
              placeholder="Que voulez-vous faire ? Ex : faire un devis pour Mme Laurent"
              className="no-modern-style h-7 flex-1 !border-none !bg-transparent !shadow-none !px-0 !py-0 outline-none text-xs md:text-[13px] text-[#14213D]"
            />
            <button
              type="button"
              onClick={toggleVoiceSearch}
              title={isListening ? "Arrêter la dictée" : "Dicter votre demande à la voix"}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-500 hover:bg-slate-200/70 hover:text-[#1C3A6B]"
              }`}
            >
              {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            </button>
          </div>

          {/* Profil et alertes interactifs */}
          <div className="flex items-center gap-2">
            {/* Popover Notifications / Alertes */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(prev => !prev);
                  setIsProfileMenuOpen(false);
                }}
                className="w-9 h-9 rounded-lg border border-[#E3DED4] bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative cursor-pointer transition-colors"
                title="Notifications et alertes réglementaires"
              >
                <Bell size={16} strokeWidth={1.75} />
                <span className="w-2 h-2 rounded-full bg-[#C24A23] ring-2 ring-white absolute top-2 right-2"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-amber-600" />
                      <h4 className="font-bold text-sm text-slate-900">Notifications & Alertes</h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      2 alertes
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 py-3">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={14} className="text-amber-700" />
                        Réforme Facturation 2026
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        Votre espace est prêt pour l'émission Factur-X. Vérifiez que votre SIRET et votre TVA sont bien complétés.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs">
                      <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                        <Building2 size={14} className="text-blue-700" />
                        Fiche & Logo Entreprise
                      </div>
                      <p className="text-blue-800 leading-relaxed">
                        {company?.logo || company?.logo_url ? "Votre logo officiel est bien configuré." : "Ajoutez votre logo officiel pour l'afficher sur vos devis et factures."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        handleSelectView('company');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-left"
                    >
                      Paramétrer mon entreprise →
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Déroulant Profil Entreprise & Navigation Dashboard */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(prev => !prev);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left border border-transparent hover:border-slate-200"
              >
                {company?.logo || company?.logo_url ? (
                  <img 
                    src={company.logo || company.logo_url} 
                    alt={displayName} 
                    className="w-9 h-9 rounded-full object-contain bg-white border border-slate-200 shadow-xs p-0.5 shrink-0" 
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-[#FBEBD9] text-[#8A4510] font-black text-xs flex items-center justify-center shrink-0">
                    {initialLetters}
                  </span>
                )}
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    {displayName}
                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="text-[11px] text-[#5A5F6B] truncate max-w-[130px]">{displayCompany}</span>
                </div>
              </button>

              {/* Menu Déroulant */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                  {/* En-tête profil */}
                  <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                    <div className="flex items-center gap-3">
                      {company?.logo || company?.logo_url ? (
                        <img 
                          src={company.logo || company.logo_url} 
                          alt="Logo" 
                          className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-xs" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                          {initialLetters}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {company?.name || displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {company?.email || 'contact@mon-entreprise.fr'}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Compte Entreprise #{company?.id || 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options de navigation */}
                  <div className="flex flex-col gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSelectView('company');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-amber-950 font-bold transition-colors group text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Building2 size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span>Paramétrer l'Entreprise & Logo</span>
                        <span className="text-[10px] text-amber-700/80 font-normal">SIRET, TVA, logo, adresse, IBAN...</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSelectView('overview');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold transition-colors group text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <LayoutDashboard size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span>Mon Espace (Vue d'ensemble)</span>
                        <span className="text-[10px] text-slate-500 font-normal">KPIs, alertes & actions rapides</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSelectView('factures');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold transition-colors group text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Receipt size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span>Devis & Facturation Factur-X</span>
                        <span className="text-[10px] text-slate-500 font-normal">Émettre et suivre vos factures</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSelectView('expenses', { tab: 'achats' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold transition-colors group text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShoppingBag size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span>Achats & Scan de Tickets</span>
                        <span className="text-[10px] text-slate-500 font-normal">Gestion des dépenses fournisseurs</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSelectView('diagnostic_express');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold transition-colors group text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Sparkles size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span>Bilan & Gains de temps</span>
                        <span className="text-[10px] text-slate-500 font-normal">Mesurer mes heures gagnées</span>
                      </div>
                    </button>
                  </div>

                  {/* Séparateur & Déconnexion */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Corps principal : Vue d'ensemble OU Outil sélectionné dans le panneau de droite */}
        {activeView === 'overview' ? (
          <main className="p-4 md:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
            
            {/* Titre et bienvenue */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#14213D] tracking-tight">
                Bonjour {displayName.split(' ')[0]}
              </h1>
              <p className="text-sm md:text-base text-[#3A4152] mt-0.5">
                Voici où en est votre entreprise aujourd'hui.
              </p>
            </div>

            {/* Bandeau d'alerte réglementaire 2026 */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FBEBD9] border border-[#F0CFA8] rounded-2xl p-4 text-xs md:text-sm">
              <div className="flex items-center gap-3">
                <AlertCircle size={22} className="text-[#8A4510] shrink-0" />
                <span>
                  <strong>La facture électronique devient obligatoire.</strong> Vérifiez en 2 minutes que vous êtes prêt.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectView('efacture')}
                className="px-4 py-2 bg-[#14213D] text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Vérifier maintenant
              </button>
            </div>

            {/* Actions Rapides dynamiques adaptées aux besoins de l'utilisateur */}
            <section aria-label="Actions rapides" className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {displayQuickActions.map((action) => {
                const IconComp = action.icon || Zap;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleSelectView(action.id)}
                    className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] hover:shadow-sm rounded-2xl p-4 flex flex-col gap-3 transition-all text-left cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#E4ECF8] text-[#1C3A6B] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComp size={22} />
                    </div>
                    <span className="font-bold text-sm text-[#14213D] leading-tight truncate">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* Deux colonnes : Trésorerie & Prochaines étapes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Mon argent ce mois-ci (2 cols) */}
              <div className="lg:col-span-2 bg-white border border-[#E3DED4] rounded-2xl p-5 md:p-6 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base md:text-lg text-slate-900">
                    Mon argent ce mois-ci
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => handleSelectView('factures')} 
                    className="text-xs font-bold text-[#1C3A6B] hover:underline cursor-pointer"
                  >
                    Voir le détail
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#E3F1E7] rounded-xl p-4">
                    <div className="text-xs font-bold text-[#2E6B45]">Déjà encaissé</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {kpis.totalPaid > 0 ? kpis.totalPaid.toLocaleString('fr-FR') : '6 900'} €
                    </div>
                    <div className="text-[11px] text-[#3A4152] mt-0.5">8 factures payées</div>
                  </div>

                  <div className="bg-[#F6F3EE] rounded-xl p-4">
                    <div className="text-xs font-bold text-[#3A4152]">À encaisser</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {kpis.totalPending > 0 ? kpis.totalPending.toLocaleString('fr-FR') : '4 280'} €
                    </div>
                    <div className="text-[11px] text-[#3A4152] mt-0.5">5 factures envoyées</div>
                  </div>

                  <div className="bg-[#FBE4DC] rounded-xl p-4">
                    <div className="text-xs font-bold text-[#7A2A16]">En retard</div>
                    <div className="text-2xl font-black text-[#7A2A16] mt-0.5">
                      {kpis.totalOverdue > 0 ? kpis.totalOverdue.toLocaleString('fr-FR') : '1 150'} €
                    </div>
                    <div className="text-[11px] text-[#7A2A16] mt-0.5">2 clients</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E3DED4] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#3A4152]">2 clients ont dépassé la date limite de paiement.</span>
                  <button
                    type="button"
                    onClick={() => handleSelectView('relance')}
                    className="px-4 py-2 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52] transition-colors cursor-pointer"
                  >
                    Les relancer pour moi
                  </button>
                </div>
              </div>

              {/* Mes prochaines étapes (1 col) */}
              <div className="bg-white border border-[#E3DED4] rounded-2xl p-5 md:p-6 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-extrabold text-base text-slate-900">Mes prochaines étapes</h2>
                    <span className="text-xs font-bold text-[#2E6B45]">
                      {checklist.filter(c => c.done).length} sur {checklist.length}
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div className="h-2 rounded-full bg-[#E8E2D6] overflow-hidden mb-4">
                    <div 
                      className="h-full bg-[#2E6B45] rounded-full transition-all duration-300"
                      style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }}
                    />
                  </div>

                  {/* Items */}
                  <div className="space-y-2 text-xs">
                    {checklist.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                          !item.done && item.action ? "bg-[#E4ECF8] font-bold text-slate-900" : "text-[#5A5F6B]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.done ? (
                            <div className="w-5 h-5 rounded-full bg-[#2E6B45] text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                          <span className={item.done ? "line-through opacity-75" : ""}>{item.label}</span>
                        </div>
                        
                        {!item.done && (item as any).viewId && (
                          <button
                            type="button"
                            onClick={() => handleSelectView((item as any).viewId)}
                            className="text-[#1C3A6B] font-bold hover:underline shrink-0 cursor-pointer"
                          >
                            {item.action}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Widget Rendez-vous & Visites de chantier (Planning 24h/24) */}
            <div className="bg-white border border-[#E3DED4] rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4ECF8] text-[#1C3A6B] flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base md:text-lg text-slate-900">
                        Mes prochains rendez-vous de chantier & clients
                      </h2>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {dashboardAppointments.filter(a => a.status !== 'cancelled').length} confirmés
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prise de rendez-vous en ligne 24h/24 activée • Vos clients réservent sans vous déranger sur le chantier
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectView('rdv_online')}
                  className="text-xs font-bold text-[#1C3A6B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Gérer mon planning 24h/24
                  <ArrowRight size={14} />
                </button>
              </div>

              {dashboardAppointments.filter(a => a.status !== 'cancelled').length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
                  <Calendar size={28} className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">Aucun rendez-vous planifié pour l'instant</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Donnez votre lien de réservation public à vos clients pour qu'ils bloquent un créneau en toute autonomie.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectView('rdv_online')}
                    className="mt-1 px-4 py-2 rounded-xl bg-[#1C3A6B] text-white text-xs font-bold hover:bg-[#142B52] transition-colors cursor-pointer"
                  >
                    Activer la prise de rendez-vous 24h/24
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dashboardAppointments
                    .filter(a => a.status !== 'cancelled')
                    .slice(0, 3)
                    .map(apt => (
                      <div
                        key={apt.id}
                        className="bg-slate-50/70 hover:bg-[#E4ECF8]/30 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                            <span className="text-[#1C3A6B] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs font-semibold">
                              {new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {apt.time}
                            </span>
                            <span className="text-emerald-700 font-extrabold text-[10px]">
                              {apt.duration_minutes} min
                            </span>
                          </div>

                          <div className="font-extrabold text-sm text-slate-900 truncate">
                            {apt.client_name}
                          </div>
                          <div className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-medium">
                            {apt.title}
                          </div>

                          {apt.location && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-1.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              {apt.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => handleSelectView('rdv')}
                            className="text-[11px] text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles size={12} />
                            Préparer avec l'IA
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectView('rdv_online')}
                            className="text-[11px] text-slate-600 font-bold hover:text-slate-900 cursor-pointer"
                          >
                            Voir détails →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Deux colonnes : Derniers documents & Mon conseiller */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Mes derniers documents (2 cols) */}
              <div className="lg:col-span-2 bg-white border border-[#E3DED4] rounded-2xl p-5 md:p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base md:text-lg text-slate-900">
                    Mes derniers documents
                  </h2>
                  <button 
                    type="button"
                    onClick={() => handleSelectView('factures')} 
                    className="text-xs font-bold text-[#1C3A6B] hover:underline cursor-pointer"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[#5A5F6B] border-b border-[#E3DED4]">
                        <th className="py-2.5 font-bold">Document</th>
                        <th className="py-2.5 font-bold">Client</th>
                        <th className="py-2.5 font-bold text-right">Montant</th>
                        <th className="py-2.5 font-bold text-right">Où ça en est</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3DED4]">
                      {invoices.length > 0 ? (
                        invoices.slice(0, 4).map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                              <div className="text-[11px] text-[#5A5F6B]">Date : {inv.date}</div>
                            </td>
                            <td className="py-3 font-medium text-slate-800">{inv.clientName}</td>
                            <td className="py-3 text-right font-extrabold text-slate-900">
                              {inv.amountTTC?.toLocaleString('fr-FR')} €
                            </td>
                            <td className="py-3 text-right">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                inv.ppf_status === 'PAYEE' || inv.status === 'paid'
                                  ? "bg-[#E3F1E7] text-[#2E6B45]"
                                  : (inv.status === 'overdue' ? "bg-[#FBE4DC] text-[#7A2A16]" : "bg-[#E4ECF8] text-[#1C3A6B]")
                              }`}>
                                {inv.ppf_status || (inv.status === 'paid' ? 'Payée' : 'En attente')}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">Facture F-2026-029</div>
                              <div className="text-[11px] text-[#5A5F6B]">Envoyée le 24 sept.</div>
                            </td>
                            <td className="py-3 font-medium text-slate-800">M. Petit</td>
                            <td className="py-3 text-right font-extrabold text-slate-900">640,00 €</td>
                            <td className="py-3 text-right">
                              <span className="bg-[#FBE4DC] text-[#7A2A16] font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                                En retard de 12 jours
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">Devis D-2026-014</div>
                              <div className="text-[11px] text-[#5A5F6B]">Envoyé le 8 oct.</div>
                            </td>
                            <td className="py-3 font-medium text-slate-800">Mme Laurent</td>
                            <td className="py-3 text-right font-extrabold text-slate-900">1 850,00 €</td>
                            <td className="py-3 text-right">
                              <span className="bg-[#E3F1E7] text-[#2E6B45] font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                                Signé
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">Facture F-2026-031</div>
                              <div className="text-[11px] text-[#5A5F6B]">Envoyée le 2 oct.</div>
                            </td>
                            <td className="py-3 font-medium text-slate-800">SCI Les Tilleuls</td>
                            <td className="py-3 text-right font-extrabold text-slate-900">2 300,00 €</td>
                            <td className="py-3 text-right">
                              <span className="bg-[#E3F1E7] text-[#2E6B45] font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                                Payée
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="py-3">
                              <div className="font-bold text-slate-900">Ticket fournisseur (Scan OCR)</div>
                              <div className="text-[11px] text-[#5A5F6B]">Photo du 11 oct.</div>
                            </td>
                            <td className="py-3 font-medium text-slate-800">Cedeo</td>
                            <td className="py-3 text-right font-extrabold text-slate-900">312,40 €</td>
                            <td className="py-3 text-right">
                              <span className="bg-[#E4ECF8] text-[#1C3A6B] font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                                Rangé
                              </span>
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mon conseiller & Mon bilan (1 col) */}
              <div className="flex flex-col gap-4">
                
                {/* Carte Conseiller */}
                <div className="bg-[#142B52] text-white rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
                  <h3 className="font-extrabold text-base text-white">Besoin d'un coup de main ?</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8E2D6] text-[#142B52] font-black text-sm flex items-center justify-center shrink-0">
                      AD
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Alexandre, votre conseiller</div>
                      <div className="text-[11px] text-[#D6DEEC]">Lundi au vendredi, 9 h – 18 h</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCallbackModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white text-[#142B52] font-extrabold text-xs hover:bg-slate-100 transition-colors cursor-pointer text-center"
                    >
                      Être rappelé
                    </button>
                    <a
                      href="mailto:contact@mdiv-business.fr"
                      className="flex-1 py-2 px-3 rounded-xl border border-white/30 text-white font-bold text-xs hover:bg-white/10 transition-colors text-center text-decoration-none"
                    >
                      Écrire
                    </a>
                  </div>
                </div>

                {/* Bilan */}
                <div className="bg-white border border-[#E3DED4] rounded-2xl p-5 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Mon bilan</h3>
                  <p className="text-xs text-[#3A4152] leading-relaxed">
                    Vous pourriez gagner environ <strong>{profile?.hoursSaved || 6} heures par semaine</strong>, surtout sur les devis, factures et relances.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => handleSelectView('diagnostic_express')} 
                    className="text-xs font-bold text-[#1C3A6B] hover:underline mt-1 text-left cursor-pointer"
                  >
                    Revoir mon bilan →
                  </button>
                </div>

              </div>

            </div>

            {/* Section Mes Outils personnalisés */}
            <div className="bg-white border border-[#E3DED4] rounded-2xl p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-extrabold text-base md:text-lg text-slate-900">
                      Mes outils activés
                    </h2>
                    <span className="bg-[#1C3A6B] text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                      {userTools.length} service{userTools.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A5F6B] mt-0.5">
                    Ces services correspondent exactement aux besoins cochés lors de votre diagnostic ({profile?.metierLabel || 'votre métier'}).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectView('diagnostic_express')}
                    className="text-xs font-bold text-[#5A5F6B] hover:text-[#14213D] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Revoir le questionnaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddToolsOpen(true)}
                    className="text-xs font-bold text-white bg-[#1C3A6B] hover:bg-[#142B52] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus size={15} /> Ajouter des outils
                  </button>
                </div>
              </div>

              {/* Grille des outils activés */}
              {userTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {userTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="p-5 rounded-2xl border-2 border-[#1C3A6B] bg-[#E4ECF8]/30 hover:bg-[#E4ECF8]/50 transition-all flex flex-col justify-between gap-3 group relative shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-[#5A5F6B] uppercase tracking-wider">
                            {tool.category}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-[#E3F1E7] text-[#2E6B45] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                            <Check size={11} strokeWidth={3} />
                            Activé
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#1C3A6B]/20 text-[#1C3A6B] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            {getToolIcon(tool.id, 20)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#1C3A6B] transition-colors leading-snug">
                              {tool.name}
                            </h3>
                          </div>
                        </div>

                        <p className="text-xs text-[#5A5F6B] mt-2.5 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#1C3A6B]/15 flex items-center justify-between gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer py-1"
                          title="Désactiver ce service de mon espace"
                        >
                          Retirer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectView(tool.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C3A6B] text-white text-xs font-bold hover:bg-[#142B52] transition-colors shadow-xs cursor-pointer"
                        >
                          <span>Accéder</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Carte d'ajout d'un autre service */}
                  <button
                    type="button"
                    onClick={() => setIsAddToolsOpen(true)}
                    className="p-5 rounded-2xl border-2 border-dashed border-[#C9C2B5] hover:border-[#1C3A6B] bg-white hover:bg-[#E4ECF8]/20 transition-all flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer min-h-[160px] group"
                  >
                    <div className="w-11 h-11 rounded-full bg-slate-100 group-hover:bg-[#1C3A6B] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Plus size={20} />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 block group-hover:text-[#1C3A6B] transition-colors">
                        Activer un autre service
                      </span>
                      <span className="text-xs text-[#5A5F6B] block mt-0.5">
                        {otherTools.length} autre{otherTools.length > 1 ? 's' : ''} service{otherTools.length > 1 ? 's' : ''} disponible{otherTools.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-[#C9C2B5] bg-slate-50 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E4ECF8] text-[#1C3A6B] flex items-center justify-center">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Aucun outil activé pour l'instant</h3>
                    <p className="text-xs text-[#5A5F6B] max-w-md mx-auto mt-1">
                      Vous n'avez pas encore sélectionné d'outils. Cliquez ci-dessous pour choisir les services adaptés à votre activité.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddToolsOpen(true)}
                    className="mt-1 px-5 py-2.5 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52] transition-colors cursor-pointer"
                  >
                    + Choisir mes outils
                  </button>
                </div>
              )}

              {/* Services additionnels prêts à l'emploi */}
              {otherTools.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E3DED4]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#5A5F6B]">
                      Autres services disponibles à activer ({otherTools.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddToolsOpen(true)}
                      className="text-xs font-semibold text-[#1C3A6B] hover:underline cursor-pointer"
                    >
                      Voir tout ({ALL_TOOLS.length} services)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {otherTools.slice(0, 4).map((tool) => (
                      <div
                        key={tool.id}
                        className="p-3.5 rounded-xl border border-[#D6CFC2] bg-white hover:border-[#1C3A6B] transition-colors flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <span className="text-[#1C3A6B] shrink-0">{getToolIcon(tool.id, 15)}</span>
                            <span className="truncate">{tool.name}</span>
                          </div>
                          <p className="text-[11px] text-[#5A5F6B] mt-1 line-clamp-2 leading-relaxed">
                            {tool.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className="mt-1 w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-[#1C3A6B] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus size={13} /> Activer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </main>
        ) : (
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {/* En-tête contextuel de l'outil avec fil d'Ariane & retour vue d'ensemble */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-[#E3DED4]/80 px-4 md:px-6 h-11 flex items-center justify-between gap-4 shrink-0 sticky top-14 z-10">
              <div className="flex items-center gap-2 text-[12.5px] min-w-0">
                <button
                  type="button"
                  onClick={() => handleSelectView('overview')}
                  className="text-slate-500 hover:text-[#1C3A6B] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <LayoutDashboard size={14} strokeWidth={1.75} />
                  <span>Mon espace</span>
                </button>
                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-[#14213D] truncate">
                  {getViewTitle(activeView)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSelectView('overview')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#1C3A6B] hover:text-white text-[#142B52] font-medium text-xs transition-all cursor-pointer shrink-0"
              >
                ← Vue d'ensemble
              </button>
            </div>

            {/* Outil affiché directement dans le container de droite sans rechargement ni perte du menu gauche */}
            <div className="dashboard-embedded-view w-full p-2 sm:p-4 md:p-6 flex-1">
              <Suspense fallback={<EmbeddedLoader />}>
                {renderEmbeddedView(activeView)}
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALE : AJOUTER DES OUTILS                                               */}
      {/* ========================================================================= */}
      {isAddToolsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">Personnaliser mes outils</h3>
                <p className="text-xs text-slate-500 mt-0.5">Activez ou retirez n'importe quel service d'un simple clic par famille ou élément par élément.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddToolsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Groupes d'outils organisés par famille */}
            <div className="flex flex-col gap-5">
              {SERVICE_FAMILIES.map(family => {
                const familyTools = ALL_TOOLS.filter(t => t.category === family.category);
                const activeInFamily = familyTools.filter(t => activatedTools.includes(t.id)).length;
                const allActive = activeInFamily === familyTools.length && familyTools.length > 0;
                const FamilyIcon = family.icon;

                return (
                  <div 
                    key={family.id}
                    className={`rounded-2xl border ${family.modal.border} ${family.modal.bgSubtle} p-4 sm:p-5 flex flex-col gap-3.5`}
                  >
                    {/* En-tête de la famille avec statistiques et action rapide */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${family.modal.badgeBg}`}>
                          <FamilyIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-slate-900">{family.name}</h4>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              activeInFamily > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {activeInFamily} / {familyTools.length} actif{activeInFamily > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{family.shortDesc}</p>
                        </div>
                      </div>

                      {/* Action rapide pour tout le bloc */}
                      <button
                        type="button"
                        onClick={() => toggleAllFamily(family.category, !allActive)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-colors self-start sm:self-auto cursor-pointer ${
                          allActive 
                            ? "border-slate-300 text-slate-600 hover:bg-slate-100 bg-white" 
                            : "border-slate-300 text-slate-800 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {allActive ? "Tout retirer" : "+ Tout activer le bloc"}
                      </button>
                    </div>

                    {/* Grille des outils individuels de cette famille */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {familyTools.map((tool) => {
                        const isAct = activatedTools.includes(tool.id);
                        return (
                          <div 
                            key={tool.id}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                              isAct 
                                ? `${family.modal.activeCardBorder} ${family.modal.activeCardBg} shadow-xs` 
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                                <span className="font-semibold text-slate-600">{tool.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isAct ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {isAct ? "✓ Activé" : "Inactif"}
                                </span>
                              </div>
                              <h5 className="font-bold text-sm text-slate-900">{tool.name}</h5>
                              <p className="text-xs text-slate-500 mt-1 leading-snug">{tool.desc}</p>
                            </div>

                            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => toggleTool(tool.id)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isAct 
                                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200" 
                                    : `${family.modal.btnActivate}`
                                }`}
                              >
                                {isAct ? "Retirer" : "+ Activer"}
                              </button>

                              <Link to={tool.link} className="text-xs font-bold text-[#1C3A6B] hover:underline flex items-center gap-1">
                                <span>Ouvrir</span>
                                <span>→</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddToolsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#14213D] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : ÊTRE RAPPELÉ PAR UN CONSEILLER                                   */}
      {/* ========================================================================= */}
      {isCallbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Demande de rappel gratuit</h3>
                <p className="text-xs text-slate-500">Un conseiller vous appelle au créneau de votre choix.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCallbackModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCallbackSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Votre numéro de téléphone</label>
                <input
                  type="tel"
                  required
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="ex : 06 12 34 56 78"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#1C3A6B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quand préférez-vous être appelé ?</label>
                <select
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#1C3A6B] outline-none bg-white"
                >
                  <option value="Dès que possible">Dès que possible (9h - 18h)</option>
                  <option value="En fin de matinée (11h - 12h30)">En fin de matinée (11h - 12h30)</option>
                  <option value="En début d'après-midi (14h - 16h)">En début d'après-midi (14h - 16h)</option>
                  <option value="En fin de journée (17h - 19h)">En fin de journée (17h - 19h)</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Aucun démarchage commercial abusif. Votre conseiller vous aide à régler vos outils et répond à vos questions techniques.
              </p>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallbackModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52] transition-colors cursor-pointer"
                >
                  Valider la demande de rappel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
