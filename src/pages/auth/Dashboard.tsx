import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LogOut, Activity, BarChart, Calendar, FileText, ArrowRight, 
  Search, Filter, Plus, Trash2, Download, Eye, CheckCircle2, 
  Clock, AlertTriangle, Building2, Users, FolderKanban, 
  Receipt, Sparkles, ExternalLink, Loader2, X, RefreshCw
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

export const Dashboard = () => {
  const { company, token, logout } = useAuth();
  const navigate = useNavigate();

  // Onglet actif
  const [activeTab, setActiveTab] = useState<'quotes' | 'projects' | 'clients' | 'invoices' | 'diagnostics' | 'expenses'>('quotes');


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
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce travail/chantier ?")) return;
    try {
      await deleteProject(id, company?.id, token || undefined);
      toast.success("Projet supprimé avec succès.");
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      toast.error("Impossible de supprimer le projet.");
    }
  };

  // Création d'un nouveau travail/chantier depuis le Dashboard
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) {
      toast.error("Le titre du travail/chantier est requis.");
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

      toast.success(`Chantier "${res.title}" créé avec succès !`);
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
    <div className="min-h-screen bg-[#0b0d14] text-white pt-28 pb-20 selection:bg-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Espace Entreprise Multi-tenant */}
        <div className="bg-[#121624] border border-gold/30 rounded-3xl shadow-2xl p-6 md:p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold font-bold text-2xl shadow-inner">
                {company?.name?.charAt(0) || 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
                    {company?.name}
                  </h1>
                  <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30 font-semibold">
                    Compte Entreprise #{company?.id}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>{company?.email}</span>
                  <span>•</span>
                  <span className="text-emerald-400">Environnement multi-tenant isolé</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={loadAllData}
                title="Actualiser les données"
                className="p-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all border border-gray-700"
              >
                <RefreshCw size={16} />
              </button>
              <Link to="/services-ia">
                <Button className="bg-gradient-to-r from-gold to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg hover:shadow-gold/20 hover:scale-[1.02]">
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
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quotes'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <FileText size={15} />
              Mes Devis ({quotes.length})
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <FolderKanban size={15} />
              Travaux & Chantiers ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'clients'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <Users size={15} />
              Mes Clients ({clients.length})
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'invoices'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <Receipt size={15} />
              Facturation ({invoices.length})
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'diagnostics'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
              }`}
            >
              <BarChart size={15} />
              Diagnostics IA ({diagnostics.length})
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-gold text-black shadow-lg shadow-gold/20'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
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
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <FileText className="text-gold" size={22} />
                  Historique des Devis
                </h2>
                <p className="text-xs text-gray-400">
                  Retrouvez et consultez tous les devis enregistrés pour votre entreprise.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/services-ia/devis">
                  <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md">
                    <Plus size={14} /> Créer un nouveau devis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  placeholder="Rechercher par N° devis, nom de client, description..."
                  className="w-full bg-[#0d101a] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value)}
                  className="bg-[#0d101a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-gold"
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
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement de vos devis...</p>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucun devis trouvé</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  {quoteSearch || quoteStatusFilter !== 'all' 
                    ? "Aucun devis ne correspond à vos filtres de recherche."
                    : "Vous n'avez pas encore enregistré de devis dans votre espace entreprise."}
                </p>
                <Link to="/services-ia/devis">
                  <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90">
                    <Plus size={14} className="mr-1" /> Générer mon premier devis IA
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-[#121624] border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d101a] border-b border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
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
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-gold/5 transition-colors group">
                          <td className="px-5 py-4 font-mono font-bold text-gold">
                            {q.quoteNumber}
                          </td>
                          <td className="px-5 py-4 text-gray-400">
                            {q.date || (q.createdAt ? new Date(q.createdAt).toLocaleDateString('fr-FR') : '-')}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-white">
                              {q.clientName || 'Client Partenaire'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-300">
                            {Number(q.totalHT || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td className="px-5 py-4 font-bold text-white">
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
                                : 'bg-gray-700/30 text-gray-300 border-gray-600/40'
                            }`}>
                              {q.status === 'accepted' ? 'Accepté' : q.status === 'sent' ? 'Envoyé' : q.status === 'rejected' ? 'Refusé' : 'Brouillon'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedQuoteDetail(q)}
                                title="Voir les détails"
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
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
        {/* ONGLET 2 : TRAVAUX & CHANTIERS / PROJETS */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <FolderKanban className="text-gold" size={22} />
                  Suivi des Travaux & Chantiers
                </h2>
                <p className="text-xs text-gray-400">
                  Pilotez les travaux en cours, le budget engagé et le statut de réalisation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} /> + Nouveau Chantier / Travail
                </Button>
              </div>
            </div>

            {/* Recherche Projets */}
            <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Rechercher par titre de chantier, client, description..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Grille des travaux */}
            {isLoadingProjects ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement de vos chantiers...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <FolderKanban className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucun travail enregistré</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  Enregistrez vos travaux depuis le module Devis IA ou créez-en un manuellement ici.
                </p>
                <Button 
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
                >
                  <Plus size={14} className="mr-1" /> Ajouter un chantier
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((p) => (
                  <div key={p.id} className="bg-[#121624] border border-gold/20 rounded-2xl p-5 hover:border-gold/50 transition-all flex flex-col justify-between group shadow-lg">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : p.status === 'in_progress'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-gray-700/30 text-gray-300 border-gray-600/40'
                        }`}>
                          {p.status === 'completed' ? 'Terminé' : p.status === 'in_progress' ? 'En cours' : 'Brouillon'}
                        </span>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                          title="Supprimer ce projet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors mb-1 line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gold font-medium mb-2">
                        {p.clientName || 'Client Partenaire'}
                      </p>
                      {p.description && (
                        <p className="text-xs text-gray-400 line-clamp-3 mb-4">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase">Budget</span>
                        <span className="font-bold text-white text-sm">
                          {Number(p.budget || 0).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 block text-[10px] uppercase">Démarrage</span>
                        <span className="text-gray-300">
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
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Users className="text-gold" size={22} />
                  Répertoire Clients de l'Entreprise
                </h2>
                <p className="text-xs text-gray-400">
                  Gérez le fichier client dédié à {company?.name}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} /> + Nouveau client
                </Button>
              </div>
            </div>

            {/* Recherche Clients */}
            <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Rechercher par nom, entreprise, email..."
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {isLoadingClients ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement des clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucun client trouvé</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  Ajoutez vos clients pour pouvoir leur associer des devis, factures et chantiers.
                </p>
                <Button 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
                >
                  <Plus size={14} className="mr-1" /> Créer un client
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((c) => (
                  <div key={c.id} className="bg-[#121624] border border-gold/20 rounded-2xl p-5 hover:border-gold/50 transition-all shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
                        {c.company?.charAt(0) || c.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{c.company || c.name}</h4>
                        <p className="text-xs text-gray-400">{c.name}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-300 pt-2 border-t border-gray-800/80">
                      {c.email && <div className="text-gray-400">📧 {c.email}</div>}
                      {c.phone && <div className="text-gray-400">📞 {c.phone}</div>}
                      {c.address && <div className="text-gray-400">📍 {c.address}</div>}
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
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Receipt className="text-gold" size={22} />
                  Tableau de bord Facturation
                </h2>
                <p className="text-xs text-gray-400">
                  Suivi des factures émises et encaissements de l'entreprise.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/services-ia/factures">
                  <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md">
                    <Plus size={14} /> Créer une Facture
                  </Button>
                </Link>
              </div>
            </div>

            {/* KPIs Facturation */}
            {invoiceKpis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4">
                  <span className="text-[11px] text-gray-400 block mb-1">Total Émis</span>
                  <span className="text-xl font-bold text-white">
                    {(invoiceKpis.totalIssued || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-[#121624] border border-emerald-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-emerald-400 block mb-1">Encaissé</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {(invoiceKpis.totalPaid || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-[#121624] border border-amber-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-amber-400 block mb-1">En attente</span>
                  <span className="text-xl font-bold text-amber-400">
                    {(invoiceKpis.totalPending || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
                <div className="bg-[#121624] border border-red-500/30 rounded-2xl p-4">
                  <span className="text-[11px] text-red-400 block mb-1">En retard</span>
                  <span className="text-xl font-bold text-red-400">
                    {(invoiceKpis.totalOverdue || 0).toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>
            )}

            {/* Liste Factures */}
            {isLoadingInvoices ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement des factures...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucune facture émise</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  Générez vos factures certifiées via le module Facturation IA.
                </p>
                <Link to="/services-ia/factures">
                  <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90">
                    <Plus size={14} className="mr-1" /> Émettre une facture
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-[#121624] border border-gold/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d101a] border-b border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">N° Facture</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Client</th>
                        <th className="px-5 py-3.5">Total TTC</th>
                        <th className="px-5 py-3.5">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-gold">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-5 py-4 text-gray-400">{inv.date}</td>
                          <td className="px-5 py-4 text-white font-medium">{inv.clientName}</td>
                          <td className="px-5 py-4 font-bold text-white">
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
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <BarChart className="text-gold" size={22} />
                  Diagnostics de Maturité IA
                </h2>
                <p className="text-xs text-gray-400">
                  Consultez vos évaluations et vos scores de transformation.
                </p>
              </div>

              <Link to="/services-ia/diagnostic">
                <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md">
                  Nouveau Diagnostic <ArrowRight size={14} />
                </Button>
              </Link>
            </div>

            {isLoadingDiagnostics ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement de votre historique...</p>
              </div>
            ) : diagnostics.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucun diagnostic réalisé</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  Commencez dès maintenant pour évaluer votre maturité IA et identifier vos opportunités.
                </p>
                <Link to="/services-ia/diagnostic">
                  <Button className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90">
                    Lancer l'analyse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {diagnostics.map((diag) => (
                  <div key={diag.id} className="bg-[#121624] border border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-gold/20 text-gold border border-gold/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                        {diag.diagnostic_type}
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(diag.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-xs text-gray-400">Score de Maturité</span>
                      <div className="text-3xl font-black text-white flex items-end gap-1">
                        {diag.score} <span className="text-xs font-normal text-gray-500">/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 6 : MES DÉPENSES & FRAIS (ARTISANS & PME) */}
        {/* ================================================================= */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Receipt className="text-gold" size={22} />
                  Mes Dépenses, Fournisseurs & Notes de Frais
                </h2>
                <p className="text-xs text-gray-400">
                  Suivez vos coûts de chantier, votre TVA déductible et la rentabilité nette de votre entreprise.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={getExpensesExportUrl(company?.id)}
                  download
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-gray-700 transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  Exporter CSV
                </a>

                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90 flex items-center gap-1.5 shadow-md"
                >
                  <Camera size={14} /> Scanner un Reçu par IA Vision
                </Button>
              </div>
            </div>

            {/* KPIs Dépenses */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#121624] border border-gray-800 rounded-2xl p-5">
                <span className="text-xs text-gray-400 block mb-1">Total Dépenses TTC</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {(expenseStats?.totalTTC || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {expenses.length} pièce(s) justificative(s)
                </span>
              </div>

              <div className="bg-[#121624] border border-gray-800 rounded-2xl p-5">
                <span className="text-xs text-gray-400 block mb-1">TVA Déductible</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {(expenseStats?.totalTVA || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-emerald-500/80 mt-1 block">
                  Récupérable sur vos déclarations
                </span>
              </div>

              <div className="bg-[#121624] border border-gray-800 rounded-2xl p-5">
                <span className="text-xs text-gray-400 block mb-1">CA Facturé Émis</span>
                <div className="text-2xl font-bold font-mono text-gold">
                  {(invoiceKpis?.totalIssued || 0).toFixed(2)} €
                </div>
                <span className="text-[11px] text-gold/80 mt-1 block">
                  Chiffre d'affaires clients
                </span>
              </div>

              <div className="bg-[#121624] border border-gold/30 rounded-2xl p-5">
                <span className="text-xs text-gray-400 block mb-1">Marge Nette Estimée</span>
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
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        Taux de marge : <strong className={pct >= 25 ? 'text-emerald-400' : 'text-amber-400'}>{pct} %</strong>
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-[#121624] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Rechercher un fournisseur, N° de ticket, chantier..."
                  className="w-full bg-[#0d101a] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={14} className="text-gray-400 shrink-0" />
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="bg-[#0d101a] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold w-full md:w-auto"
                >
                  <option value="all">Toutes les catégories</option>
                  <option value="carburant">Carburant</option>
                  <option value="peage">Péages</option>
                  <option value="materiaux">Matériaux (Point.P...)</option>
                  <option value="outillage">Outillage</option>
                  <option value="location">Location (Kiloutou...)</option>
                  <option value="restauration">Repas</option>
                  <option value="sous_traitance">Sous-traitance</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Tableau des Dépenses */}
            {isLoadingExpenses ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-gold" />
                <p className="text-xs">Chargement de vos dépenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="bg-[#121624] border border-dashed border-gray-800 rounded-3xl p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Aucune dépense trouvée</h3>
                <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
                  Enregistrez vos factures fournisseurs ou photographiez vos tickets de caisse via l'IA Vision pour un suivi automatique.
                </p>
                <Button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
                >
                  Scanner une facture / reçu
                </Button>
              </div>
            ) : (
              <div className="bg-[#121624] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0d101a] border-b border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6">Fournisseur</th>
                        <th className="py-3.5 px-6">Catégorie</th>
                        <th className="py-3.5 px-6">N° Facture</th>
                        <th className="py-3.5 px-6">Montant HT</th>
                        <th className="py-3.5 px-6">TVA</th>
                        <th className="py-3.5 px-6">Total TTC</th>
                        <th className="py-3.5 px-6">Chantier</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {filteredExpenses.map((exp) => {
                        const catMeta = (CATEGORY_LABELS as any)[exp.category] || { label: exp.category, badge: 'bg-gray-800 text-gray-300' };
                        return (
                          <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-6 text-gray-400 whitespace-nowrap">{exp.date}</td>
                            <td className="py-3.5 px-6 font-bold text-white whitespace-nowrap">{exp.merchant}</td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${catMeta.badge}`}>
                                {catMeta.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 font-mono text-gray-400">{exp.invoice_number || '-'}</td>
                            <td className="py-3.5 px-6 text-gray-300 font-mono">{Number(exp.amount_ht).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 text-emerald-400 font-mono">{Number(exp.amount_tva).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 font-bold text-gold font-mono">{Number(exp.amount_ttc).toFixed(2)} €</td>
                            <td className="py-3.5 px-6 whitespace-nowrap">
                              {exp.project_id ? (
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
                                  {exp.project_id}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-[11px]">Général</span>
                              )}
                            </td>
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedQuoteDetail(null);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#121624] border border-gold/40 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQuoteDetail(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <div>
                <span className="text-xs text-gold font-mono font-bold">{selectedQuoteDetail.quoteNumber}</span>
                <h3 className="text-xl font-bold font-serif text-white">
                  Devis pour {selectedQuoteDetail.clientName || 'Client Partenaire'}
                </h3>
                <span className="text-xs text-gray-400">Date : {selectedQuoteDetail.date}</span>
              </div>
              <button
                onClick={() => exportQuotePDF(selectedQuoteDetail, company?.id)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Download size={14} /> PDF
              </button>
            </div>

            {selectedQuoteDetail.executiveSummary && (
              <div className="mb-6 p-4 bg-[#0d101a] rounded-xl border border-gray-800">
                <span className="text-[11px] font-bold text-gold uppercase block mb-1">Résumé de l'offre</span>
                <p className="text-xs text-gray-300 whitespace-pre-line">{selectedQuoteDetail.executiveSummary}</p>
              </div>
            )}

            <div className="mb-6">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-2">Prestations chiffrées</span>
              <div className="space-y-2">
                {selectedQuoteDetail.lines?.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#0d101a] rounded-xl text-xs border border-gray-800/60">
                    <div>
                      <div className="font-semibold text-white">{line.description}</div>
                      <div className="text-gray-400 text-[11px]">Qté : {line.quantity} × {line.unitPriceHT} € HT (TVA {line.vatRate}%)</div>
                    </div>
                    <div className="font-bold text-gold">
                      {(line.quantity * line.unitPriceHT).toFixed(2)} € HT
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gold/10 border border-gold/30 rounded-2xl flex justify-between items-center text-sm font-bold">
              <span>Total TTC :</span>
              <span className="text-lg text-gold font-mono">{Number(selectedQuoteDetail.totalTTC || 0).toFixed(2)} €</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL : AJOUT D'UN TRAVAIL / CHANTIER (PORTAL AU DESSUS DU CONTENU) */}
      {isAddProjectModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddProjectModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-[#121624] border border-gold/40 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddProjectModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <FolderKanban size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">Nouveau Chantier / Travail</h3>
                <p className="text-xs text-gray-400">Enregistrez un nouveau projet dans votre suivi.</p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Titre du chantier <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="ex: Implémentation Copilot IA & Automatisation ERP"
                  className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Client associé</label>
                <select
                  value={newProjectClientId}
                  onChange={(e) => setNewProjectClientId(e.target.value)}
                  className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company || c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Budget prévisionnel (€ TTC)</label>
                <input
                  type="number"
                  min="0"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(parseFloat(e.target.value) || 0)}
                  placeholder="ex: 15000"
                  className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description / Objectifs</label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Périmètre du chantier, livrables attendus..."
                  className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold resize-y min-h-[75px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <Button
                  type="submit"
                  disabled={isSubmittingProject}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
                >
                  {isSubmittingProject ? <Loader2 size={14} className="animate-spin" /> : "Créer le chantier"}
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
          className="fixed inset-0 z-[99999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddClientModalOpen(false);
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="relative w-full max-w-lg bg-[#121624] border border-gold/40 rounded-3xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white my-auto max-h-[92vh] overflow-y-auto transform-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddClientModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">Nouveau Client Entreprise</h3>
                <p className="text-xs text-gray-400">Ajoutez un client à votre compte entreprise.</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nom du contact *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Entreprise</label>
                  <input
                    type="text"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    placeholder="SAS Dupont"
                    className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="contact@dupont.fr"
                    className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                    className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Adresse postale</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="12 Avenue Montaigne, 75008 Paris"
                  className="w-full bg-[#0d101a] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <Button
                  type="submit"
                  disabled={isSubmittingClient}
                  className="bg-gold text-black font-semibold text-xs rounded-xl hover:bg-gold/90"
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
