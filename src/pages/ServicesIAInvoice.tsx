import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, FileText, Download, Plus, Trash2, 
  Sparkles, Loader2, Calculator, Users, Box, Save, AlertTriangle, CheckCircle2,
  TrendingUp, CreditCard, Clock, FileWarning, Camera, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { getInvoicePDFBlob } from '@/lib/pdfExportService';
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal';
import { toast } from 'sonner';
import { fetchClients, fetchProducts, generateQuoteAIAssist, Client, Product, QuoteLine } from '@/lib/quoteService';
import { 
  fetchInvoiceKPIs, fetchInvoicesList, checkInvoiceWithAI, exportInvoicePDF,
  deleteInvoice, saveInvoice,
  InvoiceKPIs, Invoice, InvoiceAICheckResult 
} from '@/lib/invoiceService';
import { DocumentUploadCapture } from '@/components/ui/DocumentUploadCapture';
import { ClientSelectWithCreate } from '@/components/clients/ClientSelectWithCreate';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { UserProfileModal } from '@/components/auth/UserProfileModal';
import { getApiUrl } from '@/lib/apiConfig';
import { 
  Receipt, Filter, FolderGit2, Tag as TagIcon, Trash, FileSpreadsheet,
  ShieldCheck, ShieldAlert, Landmark, BookOpen, Send, Check, RefreshCw, FileCode, CheckSquare, Square,
  ArrowUpRight, ArrowDownRight, LayoutDashboard, Edit3Icon, Settings, X, Edit, ExternalLink
} from 'lucide-react';
import { 
  fetchExpenses, deleteExpense, getExpensesExportUrl, Expense, ExpenseStats 
} from '@/lib/expenseService';
import { ExpenseCaptureModal } from '@/components/expenses/ExpenseCaptureModal';
import { CATEGORY_LABELS, ExpenseCategory } from '@/lib/ocrVisionService';
import { 
  verifySupplierIban, generateFacturX, executeSepaPayment, 
  fetchBankReconciliationQueue, validateReconciliation, generateFecAudit,
  IbanSecurityCheckResult, FacturXGenerationResult, ReconciliationItem, FecExportDiagnosis
} from '@/lib/fintechKolectoService';
import { FintechPricingTab } from '@/components/fintech/FintechPricingTab';
import { useGuestQuota } from '@/hooks/useGuestQuota';

export default function ServicesIAInvoice() {
  const { language } = useLanguage();
  const { company, token, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEn = language === "en";

  // Quota Freemium 3 essais invité
  const { 
    remainingTrials, 
    isLimitReached: isQuotaLimitReached, 
    isAuthModalOpen: isQuotaModalOpen, 
    setIsAuthModalOpen: setIsQuotaModalOpen, 
    checkCanExecute, 
    recordExecution 
  } = useGuestQuota('invoice');

  const getInitialTab = (): 'dashboard' | 'editor' | 'expenses' | 'payments' | 'banking' | 'accounting' | 'pricing' => {
    const tab = searchParams.get('tab');
    if (tab === 'pricing' || tab === 'tarifs' || tab === 'tarification') return 'pricing';
    if (tab === 'editor' || tab === 'ventes') return 'editor';
    if (tab === 'expenses' || tab === 'achats') return 'expenses';
    if (tab === 'payments' || tab === 'transactions') return 'payments';
    if (tab === 'banking' || tab === 'tresorerie') return 'banking';
    if (tab === 'accounting' || tab === 'comptabilite') return 'accounting';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'expenses' | 'payments' | 'banking' | 'accounting' | 'pricing'>(getInitialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pricing' || tab === 'tarifs' || tab === 'tarification') setActiveTab('pricing');
    else if (tab === 'editor' || tab === 'ventes') setActiveTab('editor');
    else if (tab === 'expenses' || tab === 'achats') setActiveTab('expenses');
    else if (tab === 'payments' || tab === 'transactions') setActiveTab('payments');
    else if (tab === 'banking' || tab === 'tresorerie') setActiveTab('banking');
    else if (tab === 'accounting' || tab === 'comptabilite') setActiveTab('accounting');
  }, [searchParams]);

  // Factur-X State
  const [facturXResult, setFacturXResult] = useState<FacturXGenerationResult | null>(null);
  const [isGeneratingFacturX, setIsGeneratingFacturX] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'standard' | 'downpayment' | 'situation' | 'recurring'>('standard');
  const [downpaymentPercent, setDownpaymentPercent] = useState<number>(30);
  const [situationProgress, setSituationProgress] = useState<number>(50);

  // Anti-Fraud IBAN State
  const [testIban, setTestIban] = useState<string>('FR7630006000011234567890189');
  const [ibanSupplierName, setIbanSupplierName] = useState<string>('Fournisseur Partenaire SAS');
  const [ibanSiret, setIbanSiret] = useState<string>('55204487000120');
  const [ibanAmount, setIbanAmount] = useState<number>(1420.00);
  const [ibanCheckResult, setIbanCheckResult] = useState<IbanSecurityCheckResult | null>(null);
  const [isCheckingIban, setIsCheckingIban] = useState(false);

  // SEPA 3-Clicks Payment State
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [isPayingSepa, setIsPayingSepa] = useState(false);
  const [sepaOrderSuccess, setSepaOrderSuccess] = useState<any | null>(null);

  // Banking Reconciliation State
  const [reconcileQueue, setReconcileQueue] = useState<ReconciliationItem[]>([]);
  const [isLoadingReconciliation, setIsLoadingReconciliation] = useState(false);
  const [isReconcilingId, setIsReconcilingId] = useState<string | null>(null);

  // FEC & Pre-Accounting State
  const [fecAudit, setFecAudit] = useState<FecExportDiagnosis | null>(null);
  const [isLoadingFec, setIsLoadingFec] = useState(false);

  // Expenses State (Achats, Reçus & Notes de frais Entreprises)
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseStats, setExpenseStats] = useState<ExpenseStats | null>(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [selectedProofExpense, setSelectedProofExpense] = useState<Expense | null>(null);

  const loadBankingData = async () => {
    setIsLoadingReconciliation(true);
    try {
      const res = await fetchBankReconciliationQueue(company?.id);
      setReconcileQueue(res.queue || []);
    } catch (e) {}
    setIsLoadingReconciliation(false);
  };

  const loadFecData = async () => {
    setIsLoadingFec(true);
    try {
      const res = await generateFecAudit(company?.id);
      setFecAudit(res);
    } catch (e) {}
    setIsLoadingFec(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'editor') loadEditorData();
    if (activeTab === 'expenses' || activeTab === 'payments') loadExpenses();
    if (activeTab === 'banking') loadBankingData();
    if (activeTab === 'accounting') loadFecData();
  }, [activeTab, company?.id, filterCategory, filterProject]);

  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const res = await fetchExpenses(company?.id, {
        category: filterCategory || undefined,
        projectId: filterProject || undefined
      });
      setExpenses(res.expenses || []);
      setExpenseStats(res.stats);
    } catch(e) {}
    setIsLoadingExpenses(false);
  };

  const [kpis, setKpis] = useState<InvoiceKPIs | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Editor State
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: '1', description: '', quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(() => 'FA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [downpayment, setDownpayment] = useState(0);

  // Sauvegarde & Authentification
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [savedInvoiceSuccess, setSavedInvoiceSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Document OCR Scanning State
  const [showScanner, setShowScanner] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [isParsingOcr, setIsParsingOcr] = useState(false);

  // AI Verification State
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<InvoiceAICheckResult | null>(null);

  // État de la prévisualisation PDF
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPdfBlob, setPreviewPdfBlob] = useState<Blob | null>(null);

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;
    try {
      const ok = await deleteExpense(id, company?.id);
      if (ok) {
        toast.success("Dépense supprimée avec succès.");
        loadExpenses();
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de suppression.");
    }
  };

  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const [k, invs] = await Promise.all([
        fetchInvoiceKPIs(company?.id),
        fetchInvoicesList(company?.id)
      ]);
      setKpis(k);
      setInvoices(invs);
    } catch(e) {}
    setIsLoadingDashboard(false);
  };

  const loadEditorData = async () => {
    try {
      const [c, p] = await Promise.all([
        fetchClients(company?.id),
        fetchProducts(company?.id)
      ]);
      setClients(c);
      setProducts(p);
    } catch(e) {}
  };

  const handleAICheck = async () => {
    if (lines.length === 0 || !selectedClientId) {
      toast.error("Veuillez sélectionner un client et ajouter des lignes avant la vérification IA.");
      return;
    }

    setIsCheckingAI(true);
    setAiCheckResult(null);
    try {
      const res = await checkInvoiceWithAI({
        clientId: selectedClientId,
        lines,
        downpayment
      }, company?.id);
      setAiCheckResult(res);
      
      if (res.isValid) {
        toast.success("La facture est conforme !");
      } else {
        toast.warning("L'IA a détecté des anomalies sur la facture.");
      }
    } catch(err: any) {
      toast.error(err.message || "Erreur de vérification IA");
    } finally {
      setIsCheckingAI(false);
    }
  };

  // Editor Actions
  const addLine = () => setLines([...lines, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }]);
  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));
  const updateLine = (id: string, field: keyof QuoteLine, value: any) => setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  const handleProductSelect = (id: string, productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (p) setLines(lines.map(l => l.id === id ? { ...l, description: p.name + (p.description ? `\n${p.description}` : ''), unitPriceHT: p.defaultPrice, vatRate: p.vatRate } : l));
  };

  // Totals Calculation
  const totals = lines.reduce((acc, line) => {
    const amountHT = line.quantity * line.unitPriceHT;
    const netHT = amountHT * (1 - line.discountPercentage / 100);
    const vatAmount = netHT * (line.vatRate / 100);
    return {
      totalHT: acc.totalHT + netHT,
      totalVAT: acc.totalVAT + vatAmount,
      totalTTC: acc.totalTTC + netHT + vatAmount
    };
  }, { totalHT: 0, totalVAT: 0, totalTTC: 0 });
  
  const finalToPay = totals.totalTTC - downpayment;

  const getInvoiceExportPayload = () => {
    const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
    return {
      invoiceNumber,
      issueDate,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      client: selectedClient,
      clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
      lines,
      downpayment,
      totals,
      company: company ? {
        name: company.name,
        email: company.email
      } : undefined
    };
  };

  const handleExportInvoicePDF = async () => {
    try {
      const payload = getInvoiceExportPayload();
      await exportInvoicePDF(payload, company?.id);
      toast.success(`Facture ${invoiceNumber} téléchargée en PDF haute qualité !`);
    } catch (err: any) {
      toast.error("Erreur lors de la génération du PDF.");
    }
  };

  const handlePreviewInvoicePDF = () => {
    try {
      const payload = getInvoiceExportPayload();
      const { blob } = getInvoicePDFBlob(payload);
      setPreviewPdfBlob(blob);
      setIsPreviewOpen(true);
    } catch (err: any) {
      toast.error("Erreur lors de la génération de l'aperçu PDF.");
    }
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    if (inv.clientId) setSelectedClientId(String(inv.clientId));
    if (inv.date) {
      setIssueDate(inv.date.includes('/') ? inv.date.split('/').reverse().join('-') : inv.date);
    }
    if (inv.dueDate) {
      setDueDate(inv.dueDate.includes('/') ? inv.dueDate.split('/').reverse().join('-') : inv.dueDate);
    }
    if (inv.downpayment) setDownpayment(inv.downpayment);
    if (Array.isArray(inv.lines) && inv.lines.length > 0) {
      setLines(inv.lines);
    }
    setActiveTab('editor');
    toast.info(`Mode modification activé pour la facture ${inv.invoiceNumber}`);
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setInvoiceNumber('FA-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    setLines([{ id: '1', description: '', quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }]);
    setDownpayment(0);
    toast.info("Mode création d'une nouvelle facture réactivé.");
  };

  const handleDeleteInvoice = async (inv: Invoice) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la facture ${inv.invoiceNumber} (${inv.clientName}) ?`)) {
      return;
    }
    try {
      const ok = await deleteInvoice(inv.id, company?.id);
      if (ok) {
        toast.success(`Facture ${inv.invoiceNumber} supprimée avec succès.`);
        loadDashboard();
        if (activeTab === 'accounting') loadFecData();
      } else {
        toast.error("Impossible de supprimer la facture.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression de la facture.");
    }
  };

  const handleDownloadProof = (exp: Expense) => {
    if (!exp.receipt_url) return;
    const a = document.createElement('a');
    a.href = exp.receipt_url;
    a.download = `Justificatif_${exp.merchant.replace(/[^a-zA-Z0-9]/g, '_')}_${exp.invoice_number || exp.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Téléchargement du justificatif démarré.");
  };

  const handleSaveInvoice = async () => {
    const hasValidLines = lines.some(l => l.description.trim() !== '');
    if (!hasValidLines) {
      toast.error("Veuillez saisir au moins une ligne de prestation.");
      return;
    }

    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSavingInvoice(true);
    setSavedInvoiceSuccess(false);

    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      await saveInvoice({
        id: editingInvoiceId || undefined,
        company_id: company?.id,
        invoiceNumber,
        clientId: selectedClientId || null,
        clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
        date: issueDate,
        dueDate: dueDate || issueDate,
        amountHT: totals.totalHT,
        amountTTC: finalToPay,
        downpayment,
        lines,
        status: 'pending'
      }, company?.id);

      setSavedInvoiceSuccess(true);
      if (editingInvoiceId) {
        toast.success(`✓ Facture ${invoiceNumber} mise à jour avec succès !`);
        setEditingInvoiceId(null);
      } else {
        toast.success(`✓ Facture ${invoiceNumber} enregistrée avec succès dans votre espace entreprise !`);
      }
      // Recharger le tableau de bord et la comptabilité
      loadDashboard();
      if (activeTab === 'accounting') loadFecData();
    } catch (err: any) {
      toast.error(err.message || "Erreur de sauvegarde.");
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleFillFromOCR = async () => {
    if (!ocrText) {
      toast.error("Veuillez d'abord scanner ou photographier un document.");
      return;
    }

    if (!checkCanExecute()) return;

    setIsParsingOcr(true);
    try {
      const res = await generateQuoteAIAssist({
        clientContext: selectedClientId ? "Client existant sélectionné" : "Client extrait du document",
        projectDescription: "Extrais les prestations, quantités et montants depuis ce texte scanné par OCR :\n\n" + ocrText
      }, company?.id);

      if (res && res.suggestedLines && res.suggestedLines.length > 0) {
        setLines(res.suggestedLines);
        recordExecution();
        toast.success(`${res.suggestedLines.length} ligne(s) générée(s) depuis l'OCR !`);
      } else {
        toast.info("L'IA n'a pas pu identifier de lignes spécifiques. Vous pouvez éditer manuellement.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur d'analyse des lignes.");
    } finally {
      setIsParsingOcr(false);
    }
  };

  const handleGenerateFacturX = async () => {
    if (!checkCanExecute()) return;

    setIsGeneratingFacturX(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const res = await generateFacturX({
        invoiceNumber,
        clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client B2B',
        buyerSiret: selectedClient?.siret || '80123456700019',
        buyerVat: 'FR44801234567',
        date: issueDate,
        dueDate: dueDate || issueDate,
        totalHT: totals.totalHT,
        totalVAT: totals.totalVAT,
        totalTTC: finalToPay,
        lines: lines.map(l => ({
          description: l.description,
          quantity: l.quantity,
          unitPriceHT: l.unitPriceHT,
          vatRate: l.vatRate
        })),
        pdp_status: 'DEPOSITED'
      });
      setFacturXResult(res);
      recordExecution();
      toast.success("Factur-X 2026 généré avec succès (Conforme DGFIP / PDP n° 0039).");
    } catch(err: any) {
      toast.error(err.message || "Erreur de génération Factur-X");
    } finally {
      setIsGeneratingFacturX(false);
    }
  };

  const handleVerifyIban = async () => {
    setIsCheckingIban(true);
    try {
      const res = await verifySupplierIban({
        iban: testIban,
        supplierName: ibanSupplierName,
        supplierSiret: ibanSiret,
        amountTTC: ibanAmount,
        companyId: company?.id
      });
      setIbanCheckResult(res);
      if (res.verdict === 'CRITICAL_ALTERED_IBAN') {
        toast.error("ALERTE CRITIQUE : Changement de RIB suspect détecté !");
      } else if (res.canPay) {
        toast.success("IBAN vérifié et conforme aux normes bancaires.");
      }
    } catch(err: any) {
      toast.error(err.message || "Erreur lors du contrôle IBAN");
    } finally {
      setIsCheckingIban(false);
    }
  };

  const handleExecuteSepa = async () => {
    if (selectedExpenseIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une facture fournisseur à payer.");
      return;
    }
    setIsPayingSepa(true);
    try {
      const toPay = expenses.filter(e => selectedExpenseIds.includes(e.id));
      const transfers = toPay.map(e => ({
        expenseId: e.id,
        creditorName: e.merchant || e.supplier || 'Fournisseur',
        creditorIban: e.iban || 'FR7630006000011234567890189',
        amount: Number(e.amount_ttc || e.total_ttc || 0),
        invoiceReference: e.invoice_number || e.id
      }));

      const res = await executeSepaPayment({
        companyId: company?.id,
        debtorName: company?.company_name || 'MDIV Business Solutions',
        debtorIban: 'FR7630006000011234567890189',
        debtorBic: 'AGRIFRPP882',
        transfers
      });
      setSepaOrderSuccess(res);
      toast.success(res.message);
      setSelectedExpenseIds([]);
      loadExpenses();
    } catch(err: any) {
      toast.error(err.message || "Erreur lors du virement SEPA");
    } finally {
      setIsPayingSepa(false);
    }
  };

  const handleReconcile = async (txId: string, docId: string, docType: 'invoice' | 'expense') => {
    setIsReconcilingId(txId);
    try {
      await validateReconciliation(txId, docId, docType);
      toast.success("Rapprochement bancaire enregistré avec succès !");
      loadBankingData();
    } catch(err: any) {
      toast.error(err.message || "Erreur lors du rapprochement");
    } finally {
      setIsReconcilingId(null);
    }
  };

  return (
    <>
      <div className="ia-page min-h-screen pt-32 pb-8 bg-slate-100/80">
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4 min-h-[calc(100vh-10.5rem)] lg:h-[calc(100vh-10.5rem)]">
        
        <div className="flex flex-col lg:flex-row w-full h-full bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          
          {/* Barre de Navigation Mobile Horizontale */}
          <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <LayoutDashboard size={14} /> Accueil
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowUpRight size={14} /> Ventes
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowDownRight size={14} /> Achats
            </button>
            <button
              onClick={() => setActiveTab('banking')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'banking' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Landmark size={14} /> Trésorerie
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <RefreshCw size={14} /> Transactions
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'accounting' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <BookOpen size={14} /> Comptabilité
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-blue-700 border border-blue-200'
              }`}
            >
              <TagIcon size={14} /> Tarifs 2026
            </button>
          </div>

          {/* Sidebar Desktop */}
          <div className="hidden lg:flex w-64 bg-slate-50/50 border-r border-slate-200 flex-col shrink-0">
            <div className="p-5">
              <div onClick={() => setIsProfileModalOpen(true)} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-900 flex items-center justify-center font-bold text-sm">
                     {company?.name ? company.name.charAt(0).toUpperCase() : 'M'}
                   </div>
                   <div className="flex flex-col overflow-hidden">
                     <span className="text-sm font-bold text-slate-900 truncate max-w-[110px]">{company?.name || 'Mon Entreprise'}</span>
                     <span className="text-[10px] text-slate-500 truncate max-w-[110px]">{company?.email || 'contact@entreprise.com'}</span>
                   </div>
                 </div>
                 <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
            
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
               <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3"><LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'} /> Accueil</div>
               </button>
               
               <div className="pt-2 pb-1">
                  <button onClick={() => setActiveTab('editor')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'editor' ? 'text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-md ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><ArrowUpRight size={14} strokeWidth={3} /></div>
                      Ventes
                    </div>
                    <ChevronDown size={14} className={activeTab === 'editor' ? 'text-blue-600' : 'text-slate-400'} />
                  </button>
                  {activeTab === 'editor' && (
                    <div className="ml-5 mt-1 border-l-2 border-slate-200 pl-3 py-1 space-y-1">
                       <div className="px-3 py-2 bg-slate-200/60 rounded-lg text-sm font-bold text-slate-900">Factures</div>
                    </div>
                  )}
               </div>

               <div className="pt-1 pb-1">
                  <button onClick={() => setActiveTab('expenses')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'expenses' ? 'text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-md ${activeTab === 'expenses' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><ArrowDownRight size={14} strokeWidth={3} /></div>
                      Achats
                    </div>
                    <ChevronDown size={14} className={activeTab === 'expenses' ? 'text-blue-600' : 'text-slate-400'} />
                  </button>
                  {activeTab === 'expenses' && (
                    <div className="ml-5 mt-1 border-l-2 border-slate-200 pl-3 py-1 space-y-1">
                       <div className="px-3 py-2 bg-slate-200/60 rounded-lg text-sm font-bold text-slate-900">Dépenses fournisseurs</div>
                    </div>
                  )}
               </div>

               <button onClick={() => setActiveTab('banking')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'banking' ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3"><Landmark size={18} className={activeTab === 'banking' ? 'text-slate-900' : 'text-slate-400'} /> Suivi de trésorerie</div>
                  <ChevronDown size={14} className="text-slate-400 opacity-50" />
               </button>
               
               <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'payments' ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3"><RefreshCw size={18} className={activeTab === 'payments' ? 'text-slate-900' : 'text-slate-400'} /> Transactions</div>
               </button>

               <button onClick={() => setActiveTab('accounting')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'accounting' ? 'bg-white shadow-sm border border-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex items-center gap-3"><BookOpen size={18} className={activeTab === 'accounting' ? 'text-slate-900' : 'text-slate-400'} /> Comptabilité</div>
                  <ChevronDown size={14} className="text-slate-400 opacity-50" />
               </button>

                <button onClick={() => setActiveTab('pricing')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                   <div className="flex items-center gap-3"><TagIcon size={18} className={activeTab === 'pricing' ? 'text-white' : 'text-slate-400'} /> Grille Tarifaire & Modules</div>
                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${activeTab === 'pricing' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>2026</span>
                </button>

               
               <button onClick={() => {}} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors text-slate-600 hover:bg-slate-100`}>
                  <div className="flex items-center gap-3"><FolderGit2 size={18} className="text-slate-400" /> Documents</div>
               </button>
            </nav>
            
            <div className="p-4 mt-auto border-t border-slate-200">
              <Link to="/services-ia" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <ArrowLeft size={18} /> Quitter
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-white relative overflow-hidden">
            <div className="relative lg:absolute lg:inset-0 lg:overflow-y-auto p-4 sm:p-6 lg:p-10">

        {/* TAB 0 : GRILLE TARIFAIRE KOLECTO / IT4ALL */}
        {activeTab === 'pricing' && (
          <FintechPricingTab />
        )}

        {/* TAB 1 : DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="ia-animate-in space-y-8">
            {isLoadingDashboard ? (
               <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><CreditCard size={16} className="text-blue-500"/> CA Émis (Année)</div>
                    <div className="text-2xl font-bold text-slate-900">{kpis?.totalIssued.toLocaleString()} €</div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-2"><CheckCircle2 size={16} /> Encaissé</div>
                    <div className="text-2xl font-bold text-slate-900">{kpis?.totalPaid.toLocaleString()} €</div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-sm font-bold text-amber-600 mb-1 flex items-center gap-2"><Clock size={16} /> En attente</div>
                    <div className="text-2xl font-bold text-slate-900">{kpis?.totalPending.toLocaleString()} €</div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-red-200 bg-red-50/30 flex flex-col justify-center">
                    <div className="text-sm font-bold text-red-600 mb-1 flex items-center gap-2"><FileWarning size={16} /> En retard</div>
                    <div className="text-2xl font-bold text-red-700">{kpis?.totalOverdue.toLocaleString()} €</div>
                  </div>
                </div>

                <div className="ia-card bg-white border border-slate-200 overflow-hidden">
                   <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                     <h3 className="font-bold text-lg text-slate-900">Dernières Factures</h3>
                     <button
                       type="button"
                       onClick={() => {
                         handleCancelEdit();
                         setActiveTab('editor');
                       }}
                       className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                     >
                       <Plus size={14} /> Nouvelle Facture
                     </button>
                   </div>
                   {invoices.length === 0 ? (
                     <div className="p-12 text-center text-slate-500 font-medium space-y-3">
                       <FileText className="mx-auto text-slate-300" size={36} />
                       <div className="text-slate-700 font-bold">Aucune facture enregistrée pour le moment.</div>
                       <p className="text-xs text-slate-400 max-w-sm mx-auto">Créez votre première facture de vente avec calcul automatique de la TVA et export PDF officiel.</p>
                       <button
                         type="button"
                         onClick={() => {
                           handleCancelEdit();
                           setActiveTab('editor');
                         }}
                         className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                       >
                         <Plus size={14} /> Créer une facture maintenant
                       </button>
                     </div>
                   ) : (
                     <div className="overflow-x-auto">
                       <table className="w-full text-left">
                         <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-400 font-bold">
                           <tr>
                             <th className="px-6 py-4">N° Facture</th>
                             <th className="px-6 py-4">Client</th>
                             <th className="px-6 py-4">Émission</th>
                             <th className="px-6 py-4">Montant TTC</th>
                             <th className="px-6 py-4">Statut</th>
                             <th className="px-6 py-4 text-right">Actions</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                           {invoices.map(inv => (
                             <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                               <td className="px-6 py-4">{inv.clientName}</td>
                               <td className="px-6 py-4">{inv.date}</td>
                               <td className="px-6 py-4 font-bold">{inv.amountTTC.toLocaleString()} €</td>
                               <td className="px-6 py-4">
                                 {inv.status === 'paid' && <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">Payée</span>}
                                 {inv.status === 'pending' && <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">En attente</span>}
                                 {inv.status === 'overdue' && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">En retard</span>}
                               </td>
                               <td className="px-6 py-4 text-right whitespace-nowrap">
                                 <div className="flex items-center justify-end gap-1.5">
                                   <button
                                     type="button"
                                     onClick={() => handleEditInvoice(inv)}
                                     className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                     title="Modifier la facture"
                                   >
                                     <Edit size={16} />
                                   </button>
                                   <button
                                     type="button"
                                     onClick={() => exportInvoicePDF(inv, company?.id)}
                                     className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                     title="Télécharger le PDF"
                                   >
                                     <Download size={16} />
                                   </button>
                                   <button
                                     type="button"
                                     onClick={() => handleDeleteInvoice(inv)}
                                     className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                     title="Supprimer la facture"
                                   >
                                     <Trash size={16} />
                                   </button>
                                 </div>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2 : EDITOR */}
        {activeTab === 'editor' && (
          <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
            {/* Colonne Principale: Éditeur du Devis */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Bannière Mode Modification */}
              {editingInvoiceId && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-4 shadow-sm ia-animate-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Edit size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm">Mode Modification : Facture {invoiceNumber}</div>
                      <div className="text-xs text-amber-700">Vous pouvez modifier les lignes, les montants ou le client et sauvegarder vos modifications.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Annuler / Nouvelle facture
                  </button>
                </div>
              )}
              
              {/* Module OCR & Scanner de Facture / Devis papier */}
              <div className="ia-card bg-white p-5 border border-slate-200">
                <div 
                  onClick={() => setShowScanner(!showScanner)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Camera size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Scanner ou photographier un justificatif / devis (OCR)</h3>
                      <p className="text-xs text-slate-500">Capturez un document avec votre smartphone ou importez une image pour extraction automatique.</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    {showScanner ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {showScanner && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <DocumentUploadCapture 
                      label="Photographiez ou déposez votre facture / bon de commande (PDF, Word, Scan)"
                      acceptedFormats=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp"
                      onDocumentProcessed={({ text, file }) => {
                        setOcrText(text);
                        if (text) {
                          toast.success("Texte du document extrait avec succès !");
                        } else {
                          toast.info(`Fichier ${file.name} joint.`);
                        }
                      }}
                    />

                    {ocrText && (
                      <div className="flex items-center justify-between bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                        <div className="text-xs text-amber-900 font-medium">
                          <strong>OCR Réussi :</strong> {ocrText.slice(0, 100)}...
                        </div>
                        <button
                          onClick={handleFillFromOCR}
                          disabled={isParsingOcr}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                          {isParsingOcr ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          Pré-remplir les lignes par IA
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="ia-card bg-white p-6 border border-slate-200 relative z-30 overflow-visible">
                {/* Type de Facture Kolecto */}
                <div className="mb-5 pb-5 border-b border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Modèle & Type de Facture
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'standard', label: 'Standard', desc: 'Facture finale de vente' },
                      { id: 'downpayment', label: "Facture d'Acompte", desc: 'Versement préalable' },
                      { id: 'situation', label: 'Facture de Situation', desc: 'Facturation à l’avancement' },
                      { id: 'recurring', label: 'Récurrente', desc: 'Abonnement / Forfait' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setInvoiceType(type.id as any);
                          if (type.id === 'downpayment' && totals.totalTTC > 0) {
                            setDownpayment(Math.round(totals.totalTTC * (downpaymentPercent / 100) * 100) / 100);
                          }
                        }}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          invoiceType === type.id
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="font-bold">{type.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{type.desc}</div>
                      </button>
                    ))}
                  </div>

                  {invoiceType === 'downpayment' && (
                    <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="text-xs text-blue-900 font-medium">
                        Pourcentage d'acompte à appliquer :
                      </div>
                      <div className="flex items-center gap-2">
                        {[20, 30, 40, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              setDownpaymentPercent(pct);
                              setDownpayment(Math.round(totals.totalTTC * (pct / 100) * 100) / 100);
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                              downpaymentPercent === pct ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {invoiceType === 'situation' && (
                    <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="text-xs text-indigo-900 font-medium">
                        Taux d'avancement du projet / mission : <strong>{situationProgress}%</strong>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="5" 
                        value={situationProgress} 
                        onChange={(e) => setSituationProgress(Number(e.target.value))}
                        className="w-36 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">N° Facture</label>
                     <input type="text" value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Date Émission</label>
                     <input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Échéance</label>
                     <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <ClientSelectWithCreate
                    selectedClientId={selectedClientId}
                    onSelectClient={(c) => setSelectedClientId(c ? String(c.id) : '')}
                    companyId={company?.id}
                    label="Client Destinataire"
                    placeholder="Sélectionner ou ajouter un client..."
                  />
                </div>
              </div>

              {/* Lignes */}
              <div className="ia-card bg-white border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                    <Box size={20} className="text-emerald-600" /> Détail des Prestations
                  </h3>
                  <button onClick={addLine} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors shadow-sm">
                    <Plus size={16} /> Ajouter Ligne
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {lines.map((line, index) => (
                    <div key={line.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button onClick={() => removeLine(line.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="grid md:grid-cols-12 gap-4 mb-3">
                        <div className="md:col-span-8">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Désignation</label>
                          <textarea 
                            value={line.description} 
                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                            className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[70px] resize-y transition-all"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Catalogue</label>
                          <select 
                            onChange={(e) => handleProductSelect(line.id, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold outline-none text-slate-900"
                          >
                            <option value="">Sélection...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">QTE</label>
                           <input type="number" min="0" step="1" value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Prix U. HT</label>
                           <input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, 'unitPriceHT', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Remise %</label>
                           <input type="number" min="0" max="100" step="1" value={line.discountPercentage} onChange={(e) => updateLine(line.id, 'discountPercentage', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-amber-700 outline-none" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">TVA %</label>
                           <select value={line.vatRate} onChange={(e) => updateLine(line.id, 'vatRate', parseFloat(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none">
                             <option value={20}>20%</option>
                             <option value={10}>10%</option>
                             <option value={5.5}>5.5%</option>
                             <option value={0}>0%</option>
                           </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Colonne Latérale: Actions & IA */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Vérificateur IA */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl overflow-hidden shadow-xl relative">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/30 blur-2xl rounded-full"></div>
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Sparkles size={20} /> Audit Facture IA
                  </div>
                </div>
                
                <p className="text-sm text-white font-medium mb-4 relative z-10">
                  Vérifiez la conformité de cette facture avant émission (calculs, mentions légales obligatoires).
                </p>

                <button 
                  onClick={handleAICheck}
                  disabled={isCheckingAI}
                  className="w-full ia-btn-primary py-3 text-sm font-bold flex justify-center items-center gap-2 relative z-10 mb-4"
                >
                  {isCheckingAI ? <><Loader2 className="animate-spin" size={16}/> Analyse en cours...</> : <><CheckCircle2 size={16}/> Vérifier la facture</>}
                </button>

                {aiCheckResult && (
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 relative z-10 space-y-3 ia-animate-in">
                    {aiCheckResult.isValid ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 size={16}/> Facture conforme
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                        <AlertTriangle size={16}/> Anomalies détectées
                      </div>
                    )}
                    
                    {aiCheckResult.errors.length > 0 && (
                      <ul className="text-xs text-red-300 list-disc pl-4 space-y-1">
                        {aiCheckResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                    
                    {aiCheckResult.suggestedMentions.length > 0 && (
                      <div className="pt-2 border-t border-slate-700">
                        <div className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-2">Mentions Légales suggérées</div>
                        <ul className="text-xs text-slate-300 list-disc pl-4 space-y-1">
                          {aiCheckResult.suggestedMentions.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totaux & Export */}
              <div className="ia-card bg-white p-6 border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Calculator size={20} className="text-slate-700" /> Totaux
                </h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>Total HT</span>
                    <span className="font-bold">{totals.totalHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>TVA</span>
                    <span>{totals.totalVAT.toFixed(2)} €</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-900 text-xl font-bold">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{totals.totalTTC.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="pb-4 mb-4 border-b border-slate-100">
                   <div className="flex justify-between items-center text-sm font-bold text-slate-700 mb-2">
                     <span>Acompte déjà versé</span>
                     <div className="relative w-24">
                       <input type="number" min="0" value={downpayment} onChange={e=>setDownpayment(parseFloat(e.target.value)||0)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none text-right pr-6" />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                     </div>
                   </div>
                   <div className="flex justify-between items-center font-bold text-lg text-emerald-600">
                     <span>Net à payer</span>
                     <span>{finalToPay.toFixed(2)} €</span>
                   </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleSaveInvoice}
                    disabled={isSavingInvoice}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                  >
                    {isSavingInvoice ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> {editingInvoiceId ? "Mise à jour en cours..." : "Enregistrement..."}
                      </>
                    ) : savedInvoiceSuccess ? (
                      <>
                        <CheckCircle2 size={16} /> {editingInvoiceId ? "✓ Facture mise à jour" : "✓ Facture enregistrée"}
                      </>
                    ) : (
                      <>
                        <Save size={16} /> {editingInvoiceId ? "Mettre à jour la facture" : "Enregistrer la facture"}
                      </>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={handlePreviewInvoicePDF}
                      className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition-colors flex justify-center items-center gap-2"
                    >
                      <Eye size={16} /> Aperçu
                    </button>
                    <button 
                      type="button"
                      onClick={handleExportInvoicePDF}
                      className="py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2"
                    >
                      <Download size={16} /> Exporter PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Module Factur-X 2026 / PDP n° 0039 */}
              <div className="ia-card bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 border border-indigo-900/50 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <FileCode size={18} /> Facture Électronique 2026
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold uppercase tracking-wider">
                    PDP n° 0039
                  </span>
                </div>

                <h4 className="font-bold text-base text-white mb-1">
                  Factur-X & Norme EN 16931
                </h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Générez le format hybride PDF/A-3 + XML obligatoire pour la réforme fiscale DGFIP avec cycle de vie officiel (Déposée, Rejetée, Refusée, Encaissée).
                </p>

                <button
                  type="button"
                  onClick={handleGenerateFacturX}
                  disabled={isGeneratingFacturX || lines.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  {isGeneratingFacturX ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Génération du XML Factur-X...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Générer Factur-X conforme DGFIP
                    </>
                  )}
                </button>

                {facturXResult && (
                  <div className="mt-4 p-3.5 bg-slate-800/80 rounded-xl border border-indigo-500/30 space-y-2.5 ia-animate-in text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Statut PDP :</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ✓ {facturXResult.pdp_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Profil :</span>
                      <span className="font-mono text-indigo-300 text-[11px] font-bold">
                        {facturXResult.profile}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Lignes validées :</span>
                      <span className="font-bold text-white">{facturXResult.lines_count} articles</span>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2">
                      <a
                        href={facturXResult.downloadUrl}
                        download={`factur-x-${facturXResult.invoiceNumber}.xml`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-center rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download size={13} /> Télécharger XML Factur-X
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}

        {/* TAB 3 : ACHATS & FRAIS REÇUS (ENTREPRISES & PME) */}
        {activeTab === 'expenses' && (
          <div className="ia-animate-in space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Receipt className="text-blue-600" size={22} />
                  Achats Fournisseurs, Dépenses & Notes de Frais
                </h3>
                <p className="text-sm text-slate-600 max-w-xl">
                  Scannez vos justificatifs, factures d'achats et frais professionnels par IA Vision multimodale pour calculer automatiquement votre rentabilité par projet ou mission.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={getExpensesExportUrl(company?.id)}
                  download
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  Export CSV Comptable
                </a>

                <button
                  type="button"
                  onClick={() => setIsCaptureModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  <Camera size={16} />
                  + Scanner / Photographier un Reçu
                </button>
              </div>
            </div>

            {/* KPIs Dépenses & Rentabilité */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                  <CreditCard size={16} className="text-red-500" /> Total Dépenses TTC
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {(expenseStats?.totalTTC || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-1">
                  Sur {expenseStats?.count || 0} facture(s) fournisseur
                </div>
              </div>

              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500" /> TVA Déductible
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-600">
                  {(expenseStats?.totalTVA || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  Récupérable sur déclarations
                </div>
              </div>

              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" /> CA Facturé Émis
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {(kpis?.totalIssued || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  Total facturé aux clients
                </div>
              </div>

              <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                  <Calculator size={16} className="text-indigo-500" /> Marge Brute Projets
                </div>
                {(() => {
                  const ca = kpis?.totalIssued || 0;
                  const dep = expenseStats?.totalTTC || 0;
                  const margin = ca - dep;
                  const pct = ca > 0 ? Math.round((margin / ca) * 100) : 0;
                  return (
                    <>
                      <div className={`text-2xl md:text-3xl font-extrabold ${margin >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {margin.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-1">
                        Rentabilité : <span className={`font-extrabold ${pct >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct} %</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Bouclier Anti-Fraude au Virement & Contrôle IBAN / RIB (Norme Kolecto) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 font-bold">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      Bouclier Anti-Fraude IBAN & Double Règlement (ISO 13616 Mod 97-10)
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 font-extrabold uppercase">
                        Sécurité Bancaire
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Détecte les usurpations de coordonnées bancaires, vérifie la clé RIB française (97 - reste) et bloque les faux ordres de virement avant décaissement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Fournisseur</label>
                  <input
                    type="text"
                    value={ibanSupplierName}
                    onChange={(e) => setIbanSupplierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    placeholder="Nom du fournisseur"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">SIRET</label>
                  <input
                    type="text"
                    value={ibanSiret}
                    onChange={(e) => setIbanSiret(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold outline-none"
                    placeholder="14 chiffres"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">IBAN à auditer</label>
                  <input
                    type="text"
                    value={testIban}
                    onChange={(e) => setTestIban(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold outline-none"
                    placeholder="FR76..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Montant TTC (€)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ibanAmount}
                      onChange={(e) => setIbanAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyIban}
                      disabled={isCheckingIban}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      {isCheckingIban ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                      Auditer
                    </button>
                  </div>
                </div>
              </div>

              {ibanCheckResult && (
                <div className={`p-4 rounded-2xl border text-xs ia-animate-in ${
                  ibanCheckResult.verdict === 'CRITICAL_ALTERED_IBAN'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : ibanCheckResult.verdict === 'SUSPICIOUS_HIGH_AMOUNT'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between font-bold mb-2">
                    <div className="flex items-center gap-2">
                      {ibanCheckResult.verdict === 'CRITICAL_ALTERED_IBAN' ? (
                        <ShieldAlert className="text-rose-600" size={18} />
                      ) : (
                        <ShieldCheck className="text-emerald-600" size={18} />
                      )}
                      <span>Verdict de Sécurité : {ibanCheckResult.verdict}</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      Clé RIB calculée : {ibanCheckResult.calculatedRibKey || 'OK'}
                    </span>
                  </div>

                  {ibanCheckResult.alterationWarning && (
                    <div className="p-2.5 bg-rose-100/80 rounded-xl font-bold text-rose-800 mb-2">
                      ⚠️ {ibanCheckResult.alterationWarning}
                    </div>
                  )}

                  {ibanCheckResult.duplicateAlert && (
                    <div className="p-2.5 bg-amber-100/80 rounded-xl font-bold text-amber-800 mb-2">
                      ⚠️ {ibanCheckResult.duplicateAlert}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] opacity-80 pt-2 border-t border-current/10">
                    <span>Validation algorithmique ISO 13616 : {ibanCheckResult.isValidIban ? 'Conforme ✓' : 'Échoué ✗'}</span>
                    <span>Autorisation de virement : {ibanCheckResult.canPay ? 'Autorisé ✓' : 'Bloqué par sécurité ✗'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Filtres par Catégorie de Dépenses */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory('')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !filterCategory 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Toutes les catégories
              </button>

              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilterCategory(k === filterCategory ? '' : k)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterCategory === k
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {v.label}
                  {expenseStats?.byCategory?.[k] ? (
                    <span className="ml-1.5 opacity-70">
                      ({expenseStats.byCategory[k].toFixed(0)} €)
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Tableau des Dépenses */}
            {isLoadingExpenses ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl max-w-2xl mx-auto p-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Receipt size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Aucune facture d'achat ou reçu enregistré</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Photographiez vos factures d'achats, notes de frais ou justificatifs. L'IA Vision extrait automatiquement montants et TVA et les rattache à vos projets.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCaptureModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all inline-flex items-center gap-2"
                >
                  <Camera size={18} />
                  Scanner mon premier reçu
                </button>
              </div>
            ) : (
              <>
                {/* Bannière d'action multi-sélection SEPA */}
                {selectedExpenseIds.length > 0 && (
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl border border-indigo-500/30 ia-animate-in">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="text-emerald-400" size={20} />
                    <span className="font-bold text-sm">
                      {selectedExpenseIds.length} facture(s) sélectionnée(s) pour règlement (Total :{' '}
                      {expenses
                        .filter(e => selectedExpenseIds.includes(e.id))
                        .reduce((sum, e) => sum + Number(e.amount_ttc || 0), 0)
                        .toFixed(2)}{' '}
                      € TTC)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedExpenseIds([])}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      Désélectionner tout
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('payments')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Send size={14} /> Payer par Virement SEPA (pain.001)
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={expenses.length > 0 && selectedExpenseIds.length === expenses.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpenseIds(expenses.map(exp => exp.id));
                              } else {
                                setSelectedExpenseIds([]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Fournisseur / Enseigne</th>
                        <th className="py-4 px-6">Catégorie</th>
                        <th className="py-4 px-6">N° Pièce</th>
                        <th className="py-4 px-6">Montant HT</th>
                        <th className="py-4 px-6">TVA</th>
                        <th className="py-4 px-6">Total TTC</th>
                        <th className="py-4 px-6">Projet / Mission</th>
                        <th className="py-4 px-6 text-center">Preuve / Justificatif</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {expenses.map((e) => {
                        const catMeta = CATEGORY_LABELS[e.category] || { label: e.category, badge: 'bg-slate-100 text-slate-700 border-slate-200' };
                        const isSelected = selectedExpenseIds.includes(e.id);
                        return (
                          <tr key={e.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(ev) => {
                                  if (ev.target.checked) {
                                    setSelectedExpenseIds(prev => [...prev, e.id]);
                                  } else {
                                    setSelectedExpenseIds(prev => prev.filter(id => id !== e.id));
                                  }
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-6 text-slate-600 text-xs whitespace-nowrap">
                              {e.date}
                            </td>
                            <td className="py-4 px-6 font-bold text-slate-900">
                              {e.merchant}
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${catMeta.badge}`}>
                                {catMeta.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 text-xs font-mono">
                              {e.invoice_number || '-'}
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-semibold whitespace-nowrap">
                              {Number(e.amount_ht).toFixed(2)} €
                            </td>
                            <td className="py-4 px-6 text-emerald-600 font-semibold whitespace-nowrap">
                              {Number(e.amount_tva).toFixed(2)} € <span className="text-[10px] text-slate-400">({e.tva_rate}%)</span>
                            </td>
                            <td className="py-4 px-6 font-extrabold text-slate-900 whitespace-nowrap">
                              {Number(e.amount_ttc).toFixed(2)} €
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              {e.project_id ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
                                  <FolderGit2 size={12} />
                                  Projet: {e.project_id}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Frais général</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center whitespace-nowrap">
                              {e.receipt_url ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedProofExpense(e)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all hover:scale-105 shadow-sm"
                                  title="Visualiser et télécharger le reçu"
                                >
                                  <Eye size={13} />
                                  <span>Voir la preuve</span>
                                </button>
                              ) : (
                                <span className="text-slate-300 text-xs font-mono">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                {e.receipt_url && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadProof(e)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Télécharger la pièce justificative"
                                  >
                                    <Download size={16} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(e.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Supprimer la dépense"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          </div>
        )}

        {/* TAB 4 : PAIEMENTS FOURNISSEURS SEPA ISO 20022 */}
        {activeTab === 'payments' && (
          <div className="ia-animate-in space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Send size={16} /> Virement Européen SEPA (pain.001.001.03)
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Règlement Fournisseurs en 3 Clics
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl mt-1">
                  Sélectionnez les factures d'achats à régler. MDIV Business génère un fichier de virement bancaire groupé conforme aux standards bancaires européens (Crédit Agricole, LCL, BNP, SG, Qonto).
                </p>
              </div>

              {/* Étapes Kolecto */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                <span className="text-blue-600">1. Sélection</span>
                <span>→</span>
                <span className="text-blue-600">2. Contrôle RIB</span>
                <span>→</span>
                <span className="text-emerald-600">3. Ordre XML pain.001</span>
              </div>
            </div>

            {/* Ordre de Virement Réussi */}
            {sepaOrderSuccess && (
              <div className="p-6 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-500/40 shadow-xl space-y-4 ia-animate-in">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Ordre de Virement Bancaire Généré avec Succès</h4>
                      <p className="text-xs text-slate-300">
                        Lot N° : <span className="font-mono text-emerald-400 font-bold">{sepaOrderSuccess.batchId}</span> • Standard ISO 20022
                      </p>
                    </div>
                  </div>

                  <a
                    href={sepaOrderSuccess.downloadUrl}
                    download={`sepa-${sepaOrderSuccess.batchId}.xml`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    <Download size={16} /> Télécharger le fichier XML pain.001
                  </a>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <strong>Total viré :</strong> {sepaOrderSuccess.totalAmount?.toFixed(2)} € • <strong>Transactions :</strong> {sepaOrderSuccess.count} virements
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    ✓ Déposez ce fichier XML sur votre portail bancaire professionnel (Espace Entreprise / Télétransmission).
                  </div>
                </div>
              </div>
            )}

            {/* Liste de sélection des factures à payer */}
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="font-bold text-slate-900 text-base flex items-center justify-between">
                  <span>Factures d'Achats en Attente de Paiement</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {expenses.length} facture(s) disponible(s)
                  </span>
                </h4>

                {expenses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Aucune dépense ou facture d'achat enregistrée. Ajoutez des reçus dans l'onglet "Achats & Reçus".
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {expenses.map((exp) => {
                      const isChecked = selectedExpenseIds.includes(exp.id);
                      return (
                        <div
                          key={exp.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedExpenseIds(prev => prev.filter(id => id !== exp.id));
                            } else {
                              setSelectedExpenseIds(prev => [...prev, exp.id]);
                            }
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {exp.merchant}
                              </div>
                              <div className="text-xs text-slate-500">
                                Facture N° {exp.invoice_number || exp.id.slice(0, 8)} • Échéance : {exp.date}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-extrabold text-slate-900">
                              {Number(exp.amount_ttc).toFixed(2)} €
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              IBAN vérifié ✓
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Récapitulatif du Lot SEPA */}
              <div className="lg:col-span-4 space-y-6">
                <div className="ia-card bg-white p-6 border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Send size={18} className="text-emerald-600" /> Récapitulatif du Lot SEPA
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Virements sélectionnés :</span>
                      <strong className="text-slate-900">{selectedExpenseIds.length}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Format bancaire :</span>
                      <strong className="text-indigo-600 font-mono text-xs">pain.001.001.03</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Compte Débiteur :</span>
                      <strong className="text-slate-900 text-xs">MDIV Solutions (CA/LCL)</strong>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-slate-900 text-lg font-bold">
                      <span>Total à Décaisser :</span>
                      <span className="text-emerald-600 font-extrabold">
                        {expenses
                          .filter(e => selectedExpenseIds.includes(e.id))
                          .reduce((sum, e) => sum + Number(e.amount_ttc || 0), 0)
                          .toFixed(2)}{' '}
                        €
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteSepa}
                    disabled={isPayingSepa || selectedExpenseIds.length === 0}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPayingSepa ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Génération du fichier pain.001...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Générer l'ordre de virement SEPA
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Vos données financières restent sous votre contrôle exclusif. Aucun prélèvement direct sans validation de votre banque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5 : RAPPROCHEMENT BANCAIRE IA */}
        {activeTab === 'banking' && (
          <div className="ia-animate-in space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Landmark size={16} /> Agrégation Bancaire & Rapprochement
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Rapprochement Bancaire Automatisé par IA
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl mt-1">
                  L'IA fait correspondre automatiquement chaque ligne de relevé bancaire avec les factures de vente ou reçus d'achat enregistrés. Validez en 1 clic pour lettrer vos comptes.
                </p>
              </div>

              <button
                type="button"
                onClick={loadBankingData}
                disabled={isLoadingReconciliation}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-2 self-start md:self-auto"
              >
                <RefreshCw size={14} className={isLoadingReconciliation ? 'animate-spin' : ''} />
                Actualiser le flux bancaire
              </button>
            </div>

            {/* File de Rapprochement */}
            {isLoadingReconciliation ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : reconcileQueue.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl max-w-2xl mx-auto p-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Tous vos flux bancaires sont rapprochés !</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Aucune ligne bancaire orpheline. L'ensemble de vos encaissements et décaissements est lettré avec vos pièces comptables.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reconcileQueue.map((item) => {
                  const isMatching = isReconcilingId === item.bank_transaction_id;
                  const isPositive = Number(item.amount) >= 0;
                  return (
                    <div
                      key={item.bank_transaction_id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-colors"
                    >
                      {/* Flux Bancaire Réel */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono font-bold">
                            {item.date}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            Ligne de compte n° {item.bank_transaction_id}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-base">
                          {item.label}
                        </div>
                        <div className={`text-xl font-extrabold ${isPositive ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isPositive ? '+' : ''}{Number(item.amount).toFixed(2)} €
                        </div>
                      </div>

                      {/* Flèche de Rapprochement IA */}
                      <div className="flex flex-col items-center justify-center text-center px-4">
                        <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold mb-1">
                          Correspondance IA : {item.match_score}%
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {item.criteria.join(' • ')}
                        </div>
                      </div>

                      {/* Document Système Détecté */}
                      <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <div className="text-xs text-slate-500 font-semibold">
                          Pièce comptable identifiée :
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {item.candidate_document.type === 'invoice' ? 'Facture Client' : 'Facture Fournisseur'} : {item.candidate_document.title}
                        </div>
                        <div className="text-xs text-slate-600">
                          Tiers : <strong>{item.candidate_document.merchant}</strong> • Montant : <strong>{Number(item.candidate_document.amount).toFixed(2)} €</strong>
                        </div>
                      </div>

                      {/* Action 1 Clic */}
                      <div className="self-center">
                        <button
                          type="button"
                          onClick={() => handleReconcile(item.bank_transaction_id, item.candidate_document.id, item.candidate_document.type)}
                          disabled={isMatching}
                          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                        >
                          {isMatching ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Rapprocher en 1 clic
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6 : PRÉ-COMPTABILITÉ & EXPORT FEC 2026 */}
        {activeTab === 'accounting' && (
          <div className="ia-animate-in space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <BookOpen size={16} /> Fichier des Écritures Comptables (FEC)
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Pré-Comptabilité & Export FEC Conforme DGFIP
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl mt-1">
                  Exportez l'ensemble de vos opérations au format FEC officiel (Article L. 47 A I du Livre des Procédures Fiscales). Vos écritures Débit / Crédit sont rigoureusement équilibrées pour votre expert-comptable.
                </p>
              </div>

              <a
                href={getApiUrl(`fec_export.php?download=1&company_id=${company?.id || ''}`)}
                download
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
              >
                <Download size={16} /> Télécharger le Fichier FEC (.txt)
              </a>
            </div>

            {/* Diagnostic d'audit comptable */}
            {isLoadingFec ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
            ) : fecAudit && fecAudit.entriesCount === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-3xl max-w-2xl mx-auto p-8 ia-animate-in space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                  <BookOpen size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Aucune écriture comptable pour le moment</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Votre journal FEC et votre balance générale des comptes se mettent à jour en temps réel à chaque facture client émise ou dépense fournisseur ajoutée.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelEdit();
                      setActiveTab('editor');
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Créer une première facture
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCaptureModalOpen(true)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all inline-flex items-center gap-2"
                  >
                    <Receipt size={16} />
                    Ajouter une dépense d'achat
                  </button>
                </div>
              </div>
            ) : fecAudit && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Débit Journal</div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {fecAudit.totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 mb-1">Total Crédit Journal</div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {fecAudit.totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 mb-1">Balance Débit / Crédit</div>
                    <div className="text-2xl font-extrabold text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 size={20} /> Strictement Équilibré
                    </div>
                  </div>
                  <div className="ia-card bg-white p-6 border border-slate-200 flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 mb-1">Écritures Comptables</div>
                    <div className="text-2xl font-extrabold text-blue-600">
                      {fecAudit.entriesCount} lignes
                    </div>
                  </div>
                </div>

                {/* Synthèse des comptes PCG */}
                {fecAudit.accountsSummary && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h4 className="font-bold text-slate-900 text-base">
                      Balance Générale des Comptes (Plan Comptable Général Français)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">N° Compte PCG</th>
                            <th className="py-3 px-4">Intitulé du Compte</th>
                            <th className="py-3 px-4 text-right">Total Débit</th>
                            <th className="py-3 px-4 text-right">Total Crédit</th>
                            <th className="py-3 px-4 text-right">Solde</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {fecAudit.accountsSummary.map((acc) => {
                            const solde = acc.debit - acc.credit;
                            return (
                              <tr key={acc.code} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{acc.code}</td>
                                <td className="py-3 px-4 font-semibold text-slate-700">{acc.name}</td>
                                <td className="py-3 px-4 text-right text-slate-900">{acc.debit > 0 ? acc.debit.toFixed(2) + ' €' : '-'}</td>
                                <td className="py-3 px-4 text-right text-slate-900">{acc.credit > 0 ? acc.credit.toFixed(2) + ' €' : '-'}</td>
                                <td className={`py-3 px-4 text-right font-bold ${solde >= 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                                  {solde.toFixed(2)} €
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
</div>

      {/* Modal Lightbox de Visualisation et Téléchargement de la Preuve */}
      {selectedProofExpense && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md ia-animate-in">
          <div className="fixed inset-0" onClick={() => setSelectedProofExpense(null)} />
          <div className="relative w-full max-w-2xl bg-[#121624] border border-gold/30 rounded-3xl p-6 md:p-7 shadow-2xl text-white z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">
                  Pièce Justificative — {selectedProofExpense.merchant}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedProofExpense.date} • {Number(selectedProofExpense.amount_ttc).toFixed(2)} € TTC • N° Pièce : {selectedProofExpense.invoice_number || 'TICKET'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofExpense(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3">
              {selectedProofExpense.receipt_url?.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedProofExpense.receipt_url}
                  className="w-full h-[55vh] rounded-xl"
                  title="Aperçu PDF"
                />
              ) : (
                <img
                  src={selectedProofExpense.receipt_url || ''}
                  alt="Pièce justificative"
                  className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Pièce authentifiée et archivée
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadProof(selectedProofExpense)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d14] text-xs font-extrabold shadow-lg shadow-gold/20 transition-all hover:scale-105"
                >
                  <Download size={14} /> Télécharger la preuve
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProofExpense(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Capture OCR Vision des Dépenses */}
      <ExpenseCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onExpenseSaved={(newExp) => {
          setExpenses(prev => [newExp, ...prev]);
          loadExpenses();
          if (activeTab === 'accounting') loadFecData();
        }}
        companyId={company?.id}
      />

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          handleGenerateFacturX();
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer la génération Factur-X illimitée et sauvegarder vos factures."
      />

      {/* Modal d'authentification sans perte de données */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          handleSaveInvoice();
        }}
        title="Connectez-vous pour enregistrer cette facture"
        description="Votre facture et tous ses détails seront immédiatement enregistrés dans votre espace entreprise."
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        defaultTab="profile"
      />

      {/* Modal de prévisualisation PDF haute qualité */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBlob={previewPdfBlob}
        title={`Facture ${invoiceNumber}`}
        fileName={`Facture-${invoiceNumber}.pdf`}
        onDownload={handleExportInvoicePDF}
      />
    </>
  );
}

// Composant icône basique pour l'UI
function Edit3Icon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3" width="18" height="18" {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
}
