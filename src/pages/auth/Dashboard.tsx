import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LogOut, Activity, BarChart, Calendar, FileText, ArrowRight, 
  Search, Filter, Plus, Trash2, Download, Eye, CheckCircle2, 
  Clock, AlertTriangle, Building2, Users, FolderKanban, 
  Receipt, Sparkles, ExternalLink, Loader2, X, RefreshCw,
  Upload, Image, Globe, Mail, Phone, MapPin, CreditCard, ShieldCheck, Save, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  fetchQuotes, 
  deleteQuote, 
  fetchProjects, 
  saveProject, 
  deleteProject, 
  fetchClients, 
  createClient,
  Quote, 
  ProjectWork, 
  Client, 
  exportQuotePDF 
} from '@/lib/quoteService';
import { 
  fetchInvoicesList, fetchInvoiceKPIs, Invoice, InvoiceKPIs, exportInvoicePDF 
} from '@/lib/invoiceService';
import { 
  fetchExpenses, deleteExpense, getExpensesExportUrl, Expense, ExpenseStats 
} from '@/lib/expenseService';
import { ExpenseCaptureModal } from '@/components/expenses/ExpenseCaptureModal';
import { CATEGORY_LABELS } from '@/lib/ocrVisionService';
import { Camera, FileSpreadsheet } from 'lucide-react';

function isValidFrenchLuhn(code: string): boolean {
  const cleaned = String(code || '').replace(/\s+/g, '');
  if (!/^\d+$/.test(cleaned) || cleaned.length === 0) return false;
  let sum = 0;
  for (let i = 0; i < cleaned.length; i++) {
    let digit = parseInt(cleaned.charAt(cleaned.length - 1 - i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function computeFrenchVAT(sirenOrSiret: string): string {
  const cleaned = String(sirenOrSiret || '').replace(/\D/g, '').slice(0, 9);
  if (cleaned.length !== 9) return '';
  const num = parseInt(cleaned, 10);
  const key = (12 + 3 * (num % 97)) % 97;
  return `FR${key < 10 ? '0' + key : key}${cleaned}`;
}

export const Dashboard = () => {
  const { company, token, logout, updateCompany } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Onglet actif avec support de ?tab=company ou ?tab=entreprise
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'quotes' | 'projects' | 'clients' | 'invoices' | 'diagnostics' | 'expenses' | 'company'>(
    initialTab === 'company' || initialTab === 'entreprise' ? 'company' :
    initialTab === 'invoices' || initialTab === 'factures' ? 'invoices' :
    initialTab === 'expenses' || initialTab === 'achats' ? 'expenses' :
    initialTab === 'projects' || initialTab === 'projets' ? 'projects' :
    initialTab === 'clients' ? 'clients' :
    initialTab === 'diagnostics' ? 'diagnostics' : 'quotes'
  );

  // Synchronisation avec l'URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'company' || tabParam === 'entreprise') {
      setActiveTab('company');
    } else if (tabParam === 'invoices' || tabParam === 'factures') {
      setActiveTab('invoices');
    } else if (tabParam === 'expenses' || tabParam === 'achats') {
      setActiveTab('expenses');
    } else if (tabParam === 'projects' || tabParam === 'projets') {
      setActiveTab('projects');
    } else if (tabParam === 'clients') {
      setActiveTab('clients');
    } else if (tabParam === 'diagnostics') {
      setActiveTab('diagnostics');
    } else if (tabParam === 'quotes' || tabParam === 'devis') {
      setActiveTab('quotes');
    }
  }, [searchParams]);

  // Changement d'onglet fluide tout en préservant view=company (ou tout autre paramètre de l'App Shell)
  const handleTabSwitch = (tab: 'quotes' | 'projects' | 'clients' | 'invoices' | 'diagnostics' | 'expenses' | 'company') => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      const currentView = prev.get('view') || 'company';
      next.set('view', currentView);
      return next;
    });
  };

  // État du formulaire complet pour la table `companies`
  const [companyForm, setCompanyForm] = useState({
    name: company?.name || company?.company_name || '',
    company_name: company?.company_name || company?.name || '',
    trade_name: company?.trade_name || '',
    siren: company?.siren || '',
    siret: company?.siret || '',
    vat_number: company?.vat_number || '',
    legal_form: company?.legal_form || 'SARL',
    naf_code: company?.naf_code || '',
    activity: company?.activity || '',
    address: company?.address || '',
    postal_code: company?.postal_code || '',
    city: company?.city || '',
    country: company?.country || 'France',
    creation_date: company?.creation_date || '',
    employee_range: company?.employee_range || '1 à 5 salariés',
    capital: company?.capital || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    iban: company?.iban || '',
    bic: company?.bic || '',
    logo: company?.logo || company?.logo_url || '',
    logo_url: company?.logo_url || company?.logo || ''
  });
  const [logoPreview, setLogoPreview] = useState<string>(company?.logo || company?.logo_url || '');
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Synchronisation quand company change ou à l'arrivée
  useEffect(() => {
    if (company) {
      setCompanyForm(prev => ({
        ...prev,
        name: company.name || company.company_name || prev.name,
        company_name: company.company_name || company.name || prev.company_name,
        trade_name: company.trade_name !== undefined ? company.trade_name : prev.trade_name,
        siren: company.siren !== undefined ? company.siren : prev.siren,
        siret: company.siret !== undefined ? company.siret : prev.siret,
        vat_number: company.vat_number !== undefined ? company.vat_number : prev.vat_number,
        legal_form: company.legal_form || prev.legal_form,
        naf_code: company.naf_code !== undefined ? company.naf_code : prev.naf_code,
        activity: company.activity !== undefined ? company.activity : prev.activity,
        address: company.address !== undefined ? company.address : prev.address,
        postal_code: company.postal_code !== undefined ? company.postal_code : prev.postal_code,
        city: company.city !== undefined ? company.city : prev.city,
        country: company.country || prev.country,
        creation_date: company.creation_date !== undefined ? company.creation_date : prev.creation_date,
        employee_range: company.employee_range !== undefined ? company.employee_range : prev.employee_range,
        capital: company.capital !== undefined ? company.capital : prev.capital,
        email: company.email || prev.email,
        phone: company.phone !== undefined ? company.phone : prev.phone,
        website: company.website !== undefined ? company.website : prev.website,
        iban: company.iban !== undefined ? company.iban : prev.iban,
        bic: company.bic !== undefined ? company.bic : prev.bic,
        logo: company.logo || company.logo_url || prev.logo,
        logo_url: company.logo_url || company.logo || prev.logo_url
      }));
      if (company.logo || company.logo_url) {
        setLogoPreview(company.logo || company.logo_url || '');
      }
    }
  }, [company]);

  // Chargement approfondi de la fiche entreprise depuis l'API backend
  useEffect(() => {
    const fetchFullCompany = async () => {
      try {
        const cId = company?.id || 1;
        const res = await fetch(`/api/company_profile.php?company_id=${cId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.company) {
            const c = data.company;
            setCompanyForm(prev => ({
              ...prev,
              name: c.company_name || c.name || prev.name,
              company_name: c.company_name || c.name || prev.company_name,
              trade_name: c.trade_name || prev.trade_name,
              siren: c.siren || prev.siren,
              siret: c.siret || prev.siret,
              vat_number: c.vat_number || prev.vat_number,
              legal_form: c.legal_form || prev.legal_form,
              naf_code: c.naf_code || prev.naf_code,
              activity: c.activity || prev.activity,
              address: c.address || prev.address,
              postal_code: c.postal_code || prev.postal_code,
              city: c.city || prev.city,
              country: c.country || prev.country,
              creation_date: c.creation_date || prev.creation_date,
              employee_range: c.employee_range || prev.employee_range,
              capital: c.capital || prev.capital,
              email: c.email || prev.email,
              phone: c.phone || prev.phone,
              website: c.website || prev.website,
              iban: c.iban || prev.iban,
              bic: c.bic || prev.bic,
              logo: c.logo_url || c.logo || prev.logo,
              logo_url: c.logo_url || c.logo || prev.logo_url
            }));
            if (c.logo_url || c.logo) {
              setLogoPreview(c.logo_url || c.logo);
            }
          }
        }
      } catch {}
    };
    fetchFullCompany();
  }, [company?.id]);

  // Gestion du SIRET : auto-calcul du SIREN et de la TVA
  const handleSiretChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 14);
    const siren = cleaned.slice(0, 9);
    setCompanyForm(prev => {
      let vat = prev.vat_number;
      if (!vat || vat.startsWith('FR')) {
        vat = computeFrenchVAT(siren);
      }
      return {
        ...prev,
        siret: cleaned,
        siren: siren || prev.siren,
        vat_number: vat
      };
    });
  };

  // Upload du logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Le fichier du logo ne doit pas dépasser 3 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      setCompanyForm(prev => ({
        ...prev,
        logo: dataUrl,
        logo_url: dataUrl
      }));
      toast.info("Logo chargé ! Cliquez sur 'Enregistrer les modifications' pour valider.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setCompanyForm(prev => ({
      ...prev,
      logo: '',
      logo_url: ''
    }));
    toast.info("Logo retiré. N'oubliez pas d'enregistrer.");
  };

  // Enregistrement complet de la fiche entreprise dans la table `companies`
  const handleSaveCompany = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingCompany(true);
    try {
      const cleanSiret = (companyForm.siret || '').replace(/\D/g, '');
      const cleanSiren = (companyForm.siren || cleanSiret.slice(0, 9)).replace(/\D/g, '');
      const companyName = companyForm.company_name || companyForm.name || 'Mon Entreprise';

      const payload = {
        ...companyForm,
        id: company?.id || 1,
        company_name: companyName,
        name: companyName,
        siret: cleanSiret,
        siren: cleanSiren,
        logo: logoPreview,
        logo_url: logoPreview
      };

      const res = await fetch('/api/company_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      // Mise à jour locale dans le contexte Auth (déclenche company_updated pour tout le site)
      updateCompany({
        ...payload,
        ...(data.company || {})
      });

      toast.success("Fiche entreprise et logo enregistrés avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement de l'entreprise.");
    } finally {
      setIsSavingCompany(false);
    }
  };


  // Diagnostics existants
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);

  // Devis
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<Quote | null>(null);

  // Travaux & Projets
  const [projects, setProjects] = useState<ProjectWork[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState<number>(0);
  const [newProjectClientId, setNewProjectClientId] = useState('');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Clients
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);

  // Factures
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceKpis, setInvoiceKpis] = useState<InvoiceKPIs | null>(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Dépenses & Frais
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Chargement des données au montage ou changement d'entreprise
  useEffect(() => {
    if (company?.id) {
      loadAllData();
    }
  }, [company?.id]);

  // Bloquer le défilement et écouter Échap quand une modale est ouverte
  useEffect(() => {
    const isAnyModalOpen = !!selectedQuoteDetail || isAddProjectModalOpen || isAddClientModalOpen || isExpenseModalOpen;
    if (!isAnyModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedQuoteDetail(null);
        setIsAddProjectModalOpen(false);
        setIsAddClientModalOpen(false);
        setIsExpenseModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedQuoteDetail, isAddProjectModalOpen, isAddClientModalOpen, isExpenseModalOpen]);

  const loadAllData = async () => {
    loadQuotes();
    loadProjects();
    loadClients();
    loadInvoices();
    loadDiagnostics();
    loadExpenses();
  };


  const loadQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const data = await fetchQuotes(company?.id, token || undefined);
      setQuotes(data);
    } catch (e) {
      console.error("Erreur chargement devis:", e);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await fetchProjects(company?.id, token || undefined);
      setProjects(data);
    } catch (e) {
      console.error("Erreur chargement projets:", e);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const data = await fetchClients(company?.id);
      setClients(data);
    } catch (e) {
      console.error("Erreur chargement clients:", e);
    } finally {
      setIsLoadingClients(false);
    }
  };

  const loadInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const [invs, kpis] = await Promise.all([
        fetchInvoicesList(company?.id),
        fetchInvoiceKPIs(company?.id)
      ]);
      setInvoices(invs);
      setInvoiceKpis(kpis);
    } catch (e) {
      console.error("Erreur chargement factures:", e);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const loadDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    try {
      const response = await fetch('/api/user/diagnostics.php', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDiagnostics(data.diagnostics || []);
      }
    } catch (e) {
      // Diagnostic optionnel en mode local
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const res = await fetchExpenses(company?.id);
      setExpenses(res.expenses);
      setExpenseStats(res.stats);
    } catch (e) {
      console.error("Erreur chargement dépenses:", e);
    } finally {
      setIsLoadingExpenses(false);
    }
  };


  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;
    try {
      await deleteExpense(id, company?.id);
      toast.success("Dépense supprimée avec succès.");
      loadExpenses();
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression.");
    }
  };


  // Suppression d'un devis
  const handleDeleteQuote = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) return;
    try {
      await deleteQuote(id, company?.id, token || undefined);
      toast.success("Devis supprimé avec succès.");
      setQuotes(prev => prev.filter(q => q.id !== id));
      if (selectedQuoteDetail?.id === id) setSelectedQuoteDetail(null);
    } catch (e) {
      toast.error("Impossible de supprimer le devis.");
    }
  };

  // Suppression d'un projet
  const handleDeleteProject = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
    try {
      await deleteProject(id, company?.id, token || undefined);
      toast.success("Projet supprimé avec succès.");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      toast.error("Impossible de supprimer le projet.");
    }
  };

  // Création d'un nouveau projet depuis le Dashboard
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      toast.error("Le titre du projet est requis.");
      return;
    }
    setIsSubmittingProject(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(newProjectClientId));
      const res = await saveProject({
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        budget: Number(newProjectBudget) || 0,
        clientId: newProjectClientId || null,
        clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
        status: 'in_progress',
        startDate: new Date().toISOString().split('T')[0]
      }, company?.id, token || undefined);

      toast.success(`Projet "${res.title}" créé avec succès !`);
      setProjects(prev => [res, ...prev]);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setNewProjectBudget(0);
      setNewProjectClientId('');
      setIsAddProjectModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du projet.");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Création d'un client depuis le Dashboard
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error("Le nom du contact est obligatoire.");
      return;
    }
    setIsSubmittingClient(true);
    try {
      const res = await createClient({
        name: newClientName.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        email: newClientEmail.trim(),
        phone: newClientPhone.trim(),
        address: newClientAddress.trim()
      }, company?.id, token || undefined);

      toast.success(`Client ${res.name} enregistré avec succès !`);
      setClients(prev => [...prev, res]);
      setNewClientName('');
      setNewClientCompany('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientAddress('');
      setIsAddClientModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur création client.");
    } finally {
      setIsSubmittingClient(false);
    }
  };

  // Filtrage devis
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      (q.quoteNumber && q.quoteNumber.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      (q.clientName && q.clientName.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      (q.executiveSummary && q.executiveSummary.toLowerCase().includes(quoteSearch.toLowerCase()));
    const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtrage projets
  const filteredProjects = projects.filter(p => {
    return (
      (p.title && p.title.toLowerCase().includes(projectSearch.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(projectSearch.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
    );
  });

  // Filtrage clients
  const filteredClients = clients.filter(c => {
    const s = clientSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.company && c.company.toLowerCase().includes(s)) ||
      (c.email && c.email.toLowerCase().includes(s))
    );
  });

  // Filtrage dépenses
  const filteredExpenses = expenses.filter(e => {
    const s = expenseSearch.toLowerCase();
    const matchesSearch = 
      (e.merchant && e.merchant.toLowerCase().includes(s)) ||
      (e.invoice_number && e.invoice_number.toLowerCase().includes(s)) ||
      (e.project_id && e.project_id.toLowerCase().includes(s)) ||
      (e.notes && e.notes.toLowerCase().includes(s));
    const matchesCategory = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="ia-page min-h-screen pt-28 pb-20 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Espace Entreprise Multi-tenant */}
        <div className="bg-white border border-[hsl(221,83%,53%)]/30 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleTabSwitch('company')}
                title="Modifier le logo et les paramètres de votre entreprise"
                className="group relative cursor-pointer focus:outline-none"
              >
                {company?.logo ? (
                  <img src={company.logo} alt={company.name || ''} className="w-14 h-14 rounded-2xl object-cover border border-border shadow-sm bg-white p-1 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform">
                    {company?.name?.charAt(0) || 'M'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow border border-slate-200 text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                  <Camera size={12} />
                </span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
                    {company?.name}
                  </h1>
                  <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[hsl(221,83%,53%)]/20 text-[hsl(221,83%,53%)] border border-[hsl(221,83%,53%)]/30 font-semibold">
                    Compte Entreprise #{company?.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('company')}
                    className="text-xs text-[hsl(221,83%,53%)] hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    (Paramétrer)
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span>{company?.email}</span>
                  {company?.siret && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-slate-700">SIRET: {company.siret}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-emerald-500 font-medium">Environnement multi-tenant isolé</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={loadAllData}
                title="Actualiser les données"
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-300 text-slate-600 hover:text-foreground transition-all border border-input cursor-pointer"
              >
                <RefreshCw size={16} />
              </button>
              <Link to="/services-ia/dashboard">
                <Button className="bg-gradient-to-r from-[hsl(221,83%,53%)] to-[hsl(263,70%,50%)] text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02]">
                  <Sparkles size={14} className="mr-1.5" /> Accéder aux Outils IA
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={logout} 
                className="text-red-400 border-red-500/30 hover:bg-red-500/10 rounded-xl text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Déconnexion
              </Button>
            </div>
          </div>

          {/* Navigation par Onglets */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-border">
            <button
              onClick={() => handleTabSwitch('company')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'company'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-600/30'
                  : 'bg-amber-50/80 text-amber-900 hover:bg-amber-100 hover:text-amber-950 border border-amber-200'
              }`}
            >
              <Building2 size={15} />
              Fiche Entreprise & Logo
            </button>

            <button
              onClick={() => handleTabSwitch('quotes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <FileText size={15} />
              Mes Devis ({quotes.length})
            </button>

            <button
              onClick={() => handleTabSwitch('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <FolderKanban size={15} />
              Projets & Missions ({projects.length})
            </button>

            <button
              onClick={() => handleTabSwitch('clients')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <Users size={15} />
              Mes Clients ({clients.length})
            </button>

            <button
              onClick={() => handleTabSwitch('invoices')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <Receipt size={15} />
              Facturation ({invoices.length})
            </button>

            <button
              onClick={() => handleTabSwitch('diagnostics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'diagnostics'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <BarChart size={15} />
              Diagnostics IA ({diagnostics.length})
            </button>

            <button
              onClick={() => handleTabSwitch('expenses')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-foreground border border-border'
              }`}
            >
              <Receipt size={15} />
              Dépenses & Frais ({expenses.length})
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ONGLET 1 : MES DEVIS */}
        {/* ================================================================= */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <FileText className="text-[hsl(221,83%,53%)]" size={22} />
                  Historique des Devis
                </h2>
                <p className="text-xs text-muted-foreground">
                  Retrouvez et consultez tous les devis enregistrés pour votre entreprise.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/services-ia/devis">
                  <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md">
                    <Plus size={14} /> Créer un nouveau devis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  placeholder="Rechercher par N° devis, nom de client, description..."
                  className="w-full bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-[hsl(221,83%,53%)]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={14} className="text-muted-foreground" />
                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none focus:border-[hsl(221,83%,53%)]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>
            </div>

            {/* Liste des devis */}
            {isLoadingQuotes ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement de vos devis...</p>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-3xl p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucun devis trouvé</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  {quoteSearch || quoteStatusFilter !== 'all' 
                    ? "Aucun devis ne correspond à vos filtres de recherche."
                    : "Vous n'avez pas encore enregistré de devis dans votre espace entreprise."}
                </p>
                <Link to="/services-ia/devis">
                  <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl ">
                    <Plus size={14} className="mr-1" /> Générer mon premier devis IA
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-[hsl(221,83%,53%)]/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">N° Devis</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Client</th>
                        <th className="px-5 py-3.5">Montant HT</th>
                        <th className="px-5 py-3.5">Total TTC</th>
                        <th className="px-5 py-3.5">Statut</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-[hsl(221,83%,53%)]/5 transition-colors group">
                          <td className="px-5 py-4 font-mono font-bold text-[hsl(221,83%,53%)]">
                            {q.quoteNumber}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {q.date || (q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : '-')}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-foreground">
                              {q.clientName || 'Client Partenaire'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {Number(q.totalHT || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-5 py-4 font-bold text-foreground">
                            {Number(q.totalTTC || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              q.status === 'accepted' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : q.status === 'sent' 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                                : q.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}>
                              {q.status === 'accepted' ? 'Accepté' : q.status === 'sent' ? 'Envoyé' : q.status === 'rejected' ? 'Refusé' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedQuoteDetail(q)}
                                title="Voir les détails"
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => exportQuotePDF(q, company?.id)}
                                title="Télécharger en PDF"
                                className="p-1.5 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-500/10 transition-colors"
                              >
                                <Download size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuote(q.id)}
                                title="Supprimer"
                                className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 2 : PROJETS & MISSIONS */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <FolderKanban className="text-[hsl(221,83%,53%)]" size={22} />
                  Suivi des Projets & Missions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pilotez les projets en cours, le budget engagé et le statut de réalisation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} /> + Nouveau Projet / Mission
                </Button>
              </div>
            </div>

            {/* Recherche Projets */}
            <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <Search size={15} className="text-muted-foreground" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Rechercher par titre de projet, client, description..."
                className="w-full bg-transparent text-xs text-foreground placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Grille des travaux */}
            {isLoadingProjects ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement de vos projets...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-3xl p-12 text-center">
                <FolderKanban className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucun projet enregistré</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  Enregistrez vos projets depuis le module Devis IA ou créez-en un manuellement ici.
                </p>
                <Button 
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl "
                >
                  <Plus size={14} className="mr-1" /> Ajouter un projet
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((p) => (
                  <div key={p.id} className="bg-white border border-[hsl(221,83%,53%)]/20 rounded-2xl p-5 hover:border-[hsl(221,83%,53%)]/50 transition-all flex flex-col justify-between group shadow-lg">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : p.status === 'in_progress'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {p.status === 'completed' ? 'Terminé' : p.status === 'in_progress' ? 'En cours' : 'Brouillon'}
                        </span>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Supprimer ce projet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-[hsl(221,83%,53%)] transition-colors mb-1 line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-[hsl(221,83%,53%)] font-medium mb-2">
                        {p.clientName || 'Client Partenaire'}
                      </p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Budget</span>
                        <span className="font-bold text-foreground text-sm">
                          {Number(p.budget || 0).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px] uppercase">Démarrage</span>
                        <span className="text-slate-600">
                          {p.startDate || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '-')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 3 : MES CLIENTS */}
        {/* ================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Users className="text-[hsl(221,83%,53%)]" size={22} />
                  Répertoire Clients de l'Entreprise
                </h2>
                <p className="text-xs text-muted-foreground">
                  Gérez le fichier client dédié à {company?.name}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} /> + Nouveau client
                </Button>
              </div>
            </div>

            {/* Recherche Clients */}
            <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3">
              <Search size={15} className="text-muted-foreground" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Rechercher par nom, entreprise, email..."
                className="w-full bg-transparent text-xs text-foreground placeholder-gray-500 focus:outline-none"
              />
            </div>

            {isLoadingClients ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement des clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-3xl p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucun client trouvé</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  Ajoutez vos clients pour pouvoir leur associer des devis, factures et projets.
                </p>
                <Button 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl "
                >
                  <Plus size={14} className="mr-1" /> Créer un client
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((c) => (
                  <div key={c.id} className="bg-white border border-[hsl(221,83%,53%)]/20 rounded-2xl p-5 hover:border-[hsl(221,83%,53%)]/50 transition-all shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(221,83%,53%)]/15 border border-[hsl(221,83%,53%)]/30 flex items-center justify-center text-[hsl(221,83%,53%)] font-bold text-sm">
                        {c.company?.charAt(0) || c.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{c.company || c.name}</h4>
                        <p className="text-xs text-muted-foreground">{c.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-border/60">
                      {c.email && <div className="text-muted-foreground">📧 {c.email}</div>}
                      {c.phone && <div className="text-muted-foreground">📞 {c.phone}</div>}
                      {c.address && <div className="text-muted-foreground">📍 {c.address}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 4 : FACTURATION */}
        {/* ================================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Receipt className="text-[hsl(221,83%,53%)]" size={22} />
                  Tableau de bord Facturation
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suivi des factures émises et encaissements de l'entreprise.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/services-ia/factures">
                  <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md">
                    <Plus size={14} /> Créer une Facture
                  </Button>
                </Link>
              </div>
            </div>

            {/* KPIs Facturation */}
            {invoiceKpis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <span className="text-[11px] text-muted-foreground block mb-1">Total Émis</span>
                  <span className="text-xl font-bold text-foreground">
                    {(invoiceKpis.totalIssued || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-card border border-emerald-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-emerald-400 block mb-1">Encaissé</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {(invoiceKpis.totalPaid || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-card border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-amber-400 block mb-1">En attente</span>
                  <span className="text-xl font-bold text-amber-400">
                    {(invoiceKpis.totalPending || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-card border border-red-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-red-400 block mb-1">En retard</span>
                  <span className="text-xl font-bold text-red-400">
                    {(invoiceKpis.totalOverdue || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            )}

            {/* Liste Factures */}
            {isLoadingInvoices ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement des factures...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucune facture émise</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  Générez vos factures certifiées via le module Facturation IA.
                </p>
                <Link to="/services-ia/factures">
                  <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl ">
                    <Plus size={14} className="mr-1" /> Émettre une facture
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-card border border-[hsl(221,83%,53%)]/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">N° Facture</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Client</th>
                        <th className="px-5 py-3.5">Total TTC</th>
                        <th className="px-5 py-3.5">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[hsl(221,83%,53%)]/5 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-[hsl(221,83%,53%)]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{inv.date}</td>
                          <td className="px-5 py-4 text-foreground font-medium">{inv.clientName}</td>
                          <td className="px-5 py-4 font-bold text-foreground">
                            {Number(inv.amountTTC || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              inv.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : inv.status === 'overdue'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {inv.status === 'paid' ? 'Payée' : inv.status === 'overdue' ? 'En retard' : 'En attente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 5 : DIAGNOSTICS IA */}
        {/* ================================================================= */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <BarChart className="text-[hsl(221,83%,53%)]" size={22} />
                  Diagnostics de Maturité IA
                </h2>
                <p className="text-xs text-muted-foreground">
                  Consultez vos évaluations et vos scores de transformation.
                </p>
              </div>

              <Link to="/services-ia/diagnostic">
                <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md">
                  Nouveau Diagnostic <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            {isLoadingDiagnostics ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement de votre historique...</p>
              </div>
            ) : diagnostics.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucun diagnostic réalisé</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  Commencez dès maintenant pour évaluer votre maturité IA et identifier vos opportunités.
                </p>
                <Link to="/services-ia/diagnostic">
                  <Button className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl ">
                    Lancer l'analyse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {diagnostics.map((diag) => (
                  <div key={diag.id} className="bg-card border border-[hsl(221,83%,53%)]/20 rounded-2xl p-6 hover:border-[hsl(221,83%,53%)]/50 transition-all shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-[hsl(221,83%,53%)]/20 text-[hsl(221,83%,53%)] border border-[hsl(221,83%,53%)]/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                        {diag.diagnostic_type}
                      </div>
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(diag.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground">Score de Maturité</span>
                      <div className="text-3xl font-black text-foreground flex items-end gap-1">
                        {diag.score} <span className="text-xs font-normal text-slate-500">/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 6 : MES DÉPENSES & FRAIS (ENTREPRISES & PME) */}
        {/* ================================================================= */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Receipt className="text-[hsl(221,83%,53%)]" size={22} />
                  Mes Dépenses, Fournisseurs & Notes de Frais
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suivez vos coûts de projets, votre TVA déductible et la rentabilité nette de votre entreprise.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={getExpensesExportUrl(company?.id)}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-foreground rounded-xl text-xs font-semibold border border-input transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  Exporter CSV
                </a>

                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl  flex items-center gap-1.5 shadow-md"
                >
                  <Camera size={14} /> Scanner un Reçu par IA Vision
                </Button>
              </div>
            </div>

            {/* KPIs Dépenses */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground block mb-1">Total Dépenses TTC</span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {(expenseStats?.totalTTC || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {expenses.length} pièce(s) justificative(s)
                </span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground block mb-1">TVA Déductible</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {(expenseStats?.totalTVA || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-emerald-500/80 mt-1 block">
                  Récupérable sur vos déclarations
                </span>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <span className="text-xs text-muted-foreground block mb-1">CA Facturé Émis</span>
                <div className="text-2xl font-bold font-mono text-[hsl(221,83%,53%)]">
                  {(invoiceKpis?.totalIssued || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-[hsl(221,83%,53%)]/80 mt-1 block">
                  Chiffre d'affaires clients
                </span>
              </div>

              <div className="bg-card border border-[hsl(221,83%,53%)]/30 rounded-2xl p-5">
                <span className="text-xs text-muted-foreground block mb-1">Marge Nette Estimée</span>
                {(() => {
                  const ca = invoiceKpis?.totalIssued || 0;
                  const dep = expenseStats?.totalTTC || 0;
                  const margin = ca - dep;
                  const pct = ca > 0 ? Math.round((margin / ca) * 100) : 0;
                  return (
                    <>
                      <div className={`text-2xl font-bold font-mono ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {margin.toFixed(2)} €
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Taux de marge : <strong className={pct >= 25 ? 'text-emerald-400' : 'text-amber-400'}>{pct} %</strong>
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Rechercher un fournisseur, N° de ticket, projet..."
                  className="w-full bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-[hsl(221,83%,53%)]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={14} className="text-muted-foreground shrink-0" />
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)] w-full md:w-auto"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="carburant">Carburant & Énergie</option>
                  <option value="peage">Déplacements & Transports</option>
                  <option value="materiaux">Achats & Fournitures</option>
                  <option value="outillage">Matériel & Équipements</option>
                  <option value="location">Location & Abonnements</option>
                  <option value="restauration">Repas & Frais de Mission</option>
                  <option value="sous_traitance">Sous-traitance & Prestataires</option>
                  <option value="autre">Autres Frais Généraux</option>
                </select>
              </div>
            </div>

            {/* Tableau des Dépenses */}
            {isLoadingExpenses ? (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-[hsl(221,83%,53%)]" />
                <p className="text-xs">Chargement de vos dépenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">Aucune dépense trouvée</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
                  Enregistrez vos factures fournisseurs ou photographiez vos tickets de caisse via l'IA Vision pour un suivi automatique.
                </p>
                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl "
                >
                  Scanner une facture / reçu
                </Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6">Fournisseur</th>
                        <th className="py-3.5 px-6">Catégorie</th>
                        <th className="py-3.5 px-6">N° Facture</th>
                        <th className="py-3.5 px-6">Montant HT</th>
                        <th className="py-3.5 px-6">TVA</th>
                        <th className="py-3.5 px-6">Total TTC</th>
                        <th className="py-3.5 px-6">Projet</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {filteredExpenses.map((exp) => {
                        const catMeta = (CATEGORY_LABELS as any)[exp.category] || { label: exp.category, badge: 'bg-slate-200 text-slate-600' };
                        return (
                          <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-6 text-muted-foreground whitespace-nowrap">{exp.date}</td>
                            <td className="py-3.5 px-6 font-bold text-foreground whitespace-nowrap">{exp.merchant}</td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catMeta.badge}`}>
                                {catMeta.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-mono text-muted-foreground">{exp.invoice_number || '-'}</td>
                            <td className="py-3.5 px-6 text-slate-600 font-mono">{Number(exp.amount_ht).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 text-emerald-400 font-mono">{Number(exp.amount_tva).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 font-bold text-[hsl(221,83%,53%)] font-mono">{Number(exp.amount_ttc).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              {exp.project_id ? (
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
                                  {exp.project_id}
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px]">Général</span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET : FICHE ENTREPRISE & LOGO (TABLE companies) */}
        {/* ================================================================= */}
        {activeTab === 'company' && (
          <div className="space-y-8 animate-fade-in">
            {/* Titre & CTA Sauvegarde rapide */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-foreground flex items-center gap-2.5">
                  <Building2 className="text-amber-600" size={24} />
                  Fiche Entreprise & Paramètres Légaux
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Complétez les informations de votre entreprise (table <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">companies</code>) pour vos devis, factures Factur-X 2026 et l'en-tête du menu.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => handleSaveCompany()}
                  disabled={isSavingCompany}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 px-5 py-2.5 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingCompany ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement en cours...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-8">
              {/* CARTE 1 : LOGO & IDENTITÉ VISUELLE */}
              <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <Image size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Logo & Image de Marque</h3>
                      <p className="text-xs text-muted-foreground">Ce logo apparaîtra en haut du menu SaaS IA et sur l'ensemble de vos devis et factures.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Aperçu en direct
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Boîte d'aperçu du logo */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                    {logoPreview ? (
                      <div className="relative group">
                        <img 
                          src={logoPreview} 
                          alt="Logo entreprise" 
                          className="w-32 h-32 object-contain bg-white rounded-2xl border border-slate-200 shadow-md p-2"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          title="Supprimer le logo"
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                        <Building2 size={40} className="text-slate-300 mb-1" />
                        <span className="text-[11px] font-medium text-slate-400">Aucun logo</span>
                      </div>
                    )}

                    <div className="mt-4 text-xs font-semibold text-slate-700">
                      {companyForm.company_name || 'Votre Entreprise'}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {logoPreview ? "Logo configuré" : "Initiales par défaut affichées"}
                    </span>
                  </div>

                  {/* Contrôles de téléversement et URL */}
                  <div className="lg:col-span-8 flex flex-col justify-center gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Téléverser un fichier image (PNG, JPG, SVG, WebP)
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label 
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all hover:scale-[1.01] mb-0"
                          style={{ color: '#ffffff', backgroundColor: '#0f172a' }}
                        >
                          <Upload size={14} style={{ color: '#ffffff', stroke: '#ffffff' }} className="shrink-0" />
                          <span style={{ color: '#ffffff' }} className="text-white font-semibold">Choisir un fichier depuis mon appareil</span>
                          <input 
                            type="file" 
                            accept="image/png,image/jpeg,image/webp,image/svg+xml" 
                            onChange={handleLogoUpload}
                            className="hidden" 
                          />
                        </label>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors cursor-pointer"
                          >
                            Retirer le logo
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Taille recommandée : 400x400 px, fond transparent ou blanc. Poids max : 3 Mo.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                        Ou saisir l'URL directe d'une image en ligne :
                      </label>
                      <input
                        type="url"
                        value={companyForm.logo_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCompanyForm(prev => ({ ...prev, logo_url: val, logo: val }));
                          setLogoPreview(val);
                        }}
                        placeholder="https://monsite.fr/assets/mon-logo.png"
                        className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Aperçu de rendu dans le menu SaaS IA */}
                    <div className="p-3 bg-slate-900 rounded-2xl flex items-center gap-3 text-white">
                      <div className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Rendu menu :</div>
                      <div className="flex items-center gap-2.5 px-2 py-1 rounded-xl bg-white/10 shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Aperçu" className="w-7 h-7 rounded-lg object-contain bg-white p-0.5" />
                        ) : (
                          <span className="w-7 h-7 rounded-lg bg-white text-[#142B52] font-black flex items-center justify-center text-xs">
                            {(companyForm.company_name || 'E').charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="font-extrabold text-sm tracking-tight text-white truncate max-w-[150px]">
                          {companyForm.company_name || 'Mon Entreprise'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline ml-auto">
                        Mise à jour instantanée en direct
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARTE 2 : INFORMATIONS LÉGALES & FACTURATION 2026 */}
              <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Identification Légale & Réglementaire</h3>
                      <p className="text-xs text-muted-foreground">Données obligatoires pour l'émission des factures électroniques (Factur-X / PDP 2026).</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    Conforme Réforme 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Raison sociale */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Raison Sociale / Nom officiel de l'entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyForm.company_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCompanyForm(prev => ({ ...prev, company_name: val, name: val }));
                      }}
                      placeholder="ex: ACME SOLUTIONS FRANCE"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Nom commercial */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nom commercial / Enseigne (si différent)
                    </label>
                    <input
                      type="text"
                      value={companyForm.trade_name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, trade_name: e.target.value }))}
                      placeholder="ex: Acme Tech"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Forme Juridique */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Forme juridique <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={companyForm.legal_form}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, legal_form: e.target.value }))}
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                      <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                      <option value="SASU">SASU (SAS Unipersonnelle)</option>
                      <option value="EURL">EURL (SARL Unipersonnelle)</option>
                      <option value="EI">Entreprise Individuelle (EI)</option>
                      <option value="Micro-entreprise">Micro-entreprise / Auto-entrepreneur</option>
                      <option value="SA">SA (Société Anonyme)</option>
                      <option value="SCI">SCI (Société Civile Immobilière)</option>
                      <option value="SNC">SNC (Société en Nom Collectif)</option>
                      <option value="Association">Association loi 1901</option>
                      <option value="Autre">Autre statut</option>
                    </select>
                  </div>

                  {/* SIRET */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Numéro SIRET (14 chiffres)
                      </label>
                      {companyForm.siret && (
                        companyForm.siret.length === 14 ? (
                          isValidFrenchLuhn(companyForm.siret) ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={11} /> Luhn Valide
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle size={11} /> Clé Luhn incorrecte
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {companyForm.siret.length}/14 chiffres
                          </span>
                        )
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={14}
                      value={companyForm.siret}
                      onChange={(e) => handleSiretChange(e.target.value)}
                      placeholder="ex: 91198272600018"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* SIREN (auto calculé) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Numéro SIREN (9 chiffres)
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      value={companyForm.siren}
                      onChange={(e) => {
                        const s = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setCompanyForm(prev => ({ 
                          ...prev, 
                          siren: s,
                          vat_number: computeFrenchVAT(s) || prev.vat_number 
                        }));
                      }}
                      placeholder="ex: 911982726"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Numéro de TVA Intracommunautaire */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        N° TVA Intracommunautaire
                      </label>
                      {companyForm.siren && companyForm.siren.length === 9 && (
                        <button
                          type="button"
                          onClick={() => {
                            const vat = computeFrenchVAT(companyForm.siren);
                            setCompanyForm(prev => ({ ...prev, vat_number: vat }));
                            toast.info(`TVA calculée : ${vat}`);
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                        >
                          Auto-calculer
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={companyForm.vat_number}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, vat_number: e.target.value.toUpperCase() }))}
                      placeholder="ex: FR32911982726"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>

                  {/* Code NAF / APE */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Code NAF / APE
                    </label>
                    <input
                      type="text"
                      value={companyForm.naf_code}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, naf_code: e.target.value.toUpperCase() }))}
                      placeholder="ex: 70.22Z"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Capital Social */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Capital Social
                    </label>
                    <input
                      type="text"
                      value={companyForm.capital}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, capital: e.target.value }))}
                      placeholder="ex: 10 000 €"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Tranche d'effectifs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tranche d'effectifs
                    </label>
                    <select
                      value={companyForm.employee_range}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, employee_range: e.target.value }))}
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="0 salarié">0 salarié (Indépendant / Freelance)</option>
                      <option value="1 à 5 salariés">1 à 5 salariés</option>
                      <option value="6 à 9 salariés">6 à 9 salariés</option>
                      <option value="10 à 19 salariés">10 à 19 salariés</option>
                      <option value="20 à 49 salariés">20 à 49 salariés</option>
                      <option value="50 salariés et plus">50 salariés et plus</option>
                    </select>
                  </div>

                  {/* Date de création */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Date de création / immatriculation
                    </label>
                    <input
                      type="date"
                      value={companyForm.creation_date}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, creation_date: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Activité principale */}
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Activité principale / Objet social
                    </label>
                    <input
                      type="text"
                      value={companyForm.activity}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, activity: e.target.value }))}
                      placeholder="ex: Conseil en systèmes informatiques, intelligence artificielle et transition numérique"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* CARTE 3 : COORDONNÉES & SIÈGE SOCIAL */}
              <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Coordonnées & Siège Social</h3>
                      <p className="text-xs text-muted-foreground">Adresse légale et moyens de contact affichés dans les pieds de page des factures.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Adresse */}
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Adresse (Numéro et voie) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="ex: 8 Rue Jacques Bingen"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Code postal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={companyForm.postal_code}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, postal_code: e.target.value }))}
                      placeholder="ex: 10600"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={companyForm.city}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="ex: La Chapelle-Saint-Luc"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Pays */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={companyForm.country}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="France"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Téléphone professionnel
                    </label>
                    <input
                      type="tel"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="ex: +33 1 23 45 67 89"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email de contact / facturation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@mon-entreprise.fr"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Site Web */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Site Internet vitrine
                    </label>
                    <input
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.mon-entreprise.fr"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* CARTE 4 : COORDONNÉES BANCAIRES POUR FACTURATION */}
              <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">Coordonnées Bancaires (Facturation & Règlements)</h3>
                      <p className="text-xs text-muted-foreground">Indispensable pour que vos clients puissent régler vos devis et factures par virement.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* IBAN */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      IBAN (Numéro de compte international)
                    </label>
                    <input
                      type="text"
                      value={companyForm.iban}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                      placeholder="ex: FR76 3000 6000 0112 3456 7890 189"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-foreground focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>

                  {/* BIC */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Code BIC / SWIFT
                    </label>
                    <input
                      type="text"
                      value={companyForm.bic}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                      placeholder="ex: BNPAFR22XXX"
                      className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-foreground focus:outline-none focus:border-amber-500 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* BARRE D'ACTION INFÉRIEURE */}
              <div className="sticky bottom-6 z-20 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ✓
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Synchronisation Multi-tenant Active</div>
                    <div className="text-slate-300">Vos modifications seront répercutées immédiatement sur la barre de menu, vos devis et factures.</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    type="submit"
                    disabled={isSavingCompany}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg px-6 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    {isSavingCompany ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Enregistrer la fiche entreprise
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* MODAL : SCANNER REÇU / FACTURE AVEC IA VISION */}
      <ExpenseCaptureModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onExpenseSaved={() => loadExpenses()}
        companyId={company?.id}
      />

      {/* MODAL : DÉTAIL D'UN DEVIS (PORTAL AU DESSUS DU CONTENU) */}
      {selectedQuoteDetail && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedQuoteDetail(null);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-2xl bg-card border border-[hsl(221,83%,53%)]/40 rounded-3xl p-6 md:p-8 shadow-2xl text-foreground my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQuoteDetail(null)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <div>
                <span className="text-xs text-[hsl(221,83%,53%)] font-mono font-bold">{selectedQuoteDetail.quoteNumber}</span>
                <h3 className="text-xl font-bold font-serif text-foreground">
                  Devis pour {selectedQuoteDetail.clientName || 'Client Partenaire'}
                </h3>
                <span className="text-xs text-muted-foreground">Date : {selectedQuoteDetail.date}</span>
              </div>
              <button
                onClick={() => exportQuotePDF(selectedQuoteDetail, company?.id)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download size={14} /> PDF
              </button>
            </div>

            {selectedQuoteDetail.executiveSummary && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-border">
                <span className="text-[11px] font-bold text-[hsl(221,83%,53%)] uppercase block mb-1">Résumé de l'offre</span>
                <p className="text-xs text-slate-600 whitespace-pre-line">{selectedQuoteDetail.executiveSummary}</p>
              </div>
            )}

            <div className="mb-6">
              <span className="text-[11px] font-bold text-muted-foreground uppercase block mb-2">Prestations chiffrées</span>
              <div className="space-y-2">
                {selectedQuoteDetail.lines?.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border border-border/40">
                    <div>
                      <div className="font-semibold text-foreground">{line.description}</div>
                      <div className="text-muted-foreground text-[11px]">Qté : {line.quantity} × {line.unitPriceHT} € HT (TVA {line.vatRate}%)</div>
                    </div>
                    <div className="font-bold text-[hsl(221,83%,53%)]">
                      {(line.quantity * line.unitPriceHT).toFixed(2)} € HT
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[hsl(221,83%,53%)]/10 border border-[hsl(221,83%,53%)]/30 rounded-2xl flex justify-between items-center text-sm font-bold">
              <span>Total TTC :</span>
              <span className="text-lg text-[hsl(221,83%,53%)] font-mono">{Number(selectedQuoteDetail.totalTTC || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL : AJOUT D'UN TRAVAIL / PROJET (PORTAL AU DESSUS DU CONTENU) */}
      {isAddProjectModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddProjectModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-card border border-[hsl(221,83%,53%)]/40 rounded-3xl p-6 md:p-8 shadow-2xl text-foreground my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddProjectModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[hsl(221,83%,53%)]/15 border border-[hsl(221,83%,53%)]/30 flex items-center justify-center text-[hsl(221,83%,53%)]">
                <FolderKanban size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-foreground">Nouveau Projet / Mission</h3>
                <p className="text-xs text-muted-foreground">Enregistrez un nouveau projet dans votre suivi.</p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Titre du projet <span className="text-[hsl(221,83%,53%)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="ex: Implémentation Copilot IA & Automatisation ERP"
                  className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Client associé</label>
                <select
                  value={newProjectClientId}
                  onChange={(e) => setNewProjectClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company || c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Budget prévisionnel (€ TTC)</label>
                <input
                  type="number"
                  min="0"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 15000"
                  className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Description / Objectifs</label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Périmètre du projet, livrables attendus..."
                  className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)] resize-y min-h-[75px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
                <Button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl "
                >
                  {isSubmittingProject ? <Loader2 size={14} className="animate-spin" /> : "Créer le projet"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL : AJOUT D'UN CLIENT (PORTAL AU DESSUS DU CONTENU) */}
      {isAddClientModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddClientModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-card border border-[hsl(221,83%,53%)]/40 rounded-3xl p-6 md:p-8 shadow-2xl text-foreground my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddClientModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[hsl(221,83%,53%)]/15 border border-[hsl(221,83%,53%)]/30 flex items-center justify-center text-[hsl(221,83%,53%)]">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-foreground">Nouveau Client Entreprise</h3>
                <p className="text-xs text-muted-foreground">Ajoutez un client à votre compte entreprise.</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Nom du contact *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Entreprise</label>
                  <input
                    type="text"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="SAS Dupont"
                    className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="contact@dupont.fr"
                    className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">Adresse postale</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="12 Avenue Montaigne, 75008 Paris"
                  className="w-full bg-slate-50 border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-[hsl(221,83%,53%)]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
                <Button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="bg-[hsl(221,83%,53%)] text-white hover:bg-[hsl(221,83%,45%)] font-semibold text-xs rounded-xl "
                >
                  {isSubmittingClient ? <Loader2 size={14} className="animate-spin" /> : "Enregistrer le client"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
export default Dashboard;
