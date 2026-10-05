// src/components/expenses/ExpenseCaptureModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Camera, Upload, Sparkles, Loader2, X, Check, AlertTriangle, 
  Receipt, Building2, Tag, Calendar, CreditCard, FolderGit2, FileText, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  parseReceiptWithVision, 
  ExpenseCategory, 
  PaymentMethod, 
  CATEGORY_LABELS,
  fileToOptimizedBase64
} from '@/lib/ocrVisionService';
import { saveExpense, Expense } from '@/lib/expenseService';
import { fetchClients, Client } from '@/lib/quoteService';
import { getApiUrl } from '@/lib/apiConfig';

interface ExpenseCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseSaved: (expense: Expense) => void;
  companyId?: number;
  initialProjectId?: string;
  initialClientId?: number;
}

export const ExpenseCaptureModal: React.FC<ExpenseCaptureModalProps> = ({
  isOpen,
  onClose,
  onExpenseSaved,
  companyId,
  initialProjectId,
  initialClientId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const editCameraInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Étape : 'capture' | 'parsing' | 'edit'
  const [step, setStep] = useState<'capture' | 'parsing' | 'edit'>('capture');
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAttachProof = async (file: File) => {
    try {
      const base64 = await fileToOptimizedBase64(file);
      setPreviewImage(base64);
      toast.success("Pièce justificative jointe avec succès !");
    } catch (err: any) {
      toast.error("Impossible de charger l'image : " + err.message);
    }
  };

  // Formulaire Dépense
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('materiaux');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amountHT, setAmountHT] = useState<number>(0);
  const [tvaRate, setTvaRate] = useState<number>(20);
  const [amountTVA, setAmountTVA] = useState<number>(0);
  const [amountTTC, setAmountTTC] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cb');
  const [projectId, setProjectId] = useState<string>(initialProjectId || '');
  const [clientId, setClientId] = useState<number | ''>(initialClientId || '');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Listes déroulantes projets et clients
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Charger clients et projets de l'entreprise
    fetchClients(companyId).then(setClients).catch(() => {});
    fetch(getApiUrl(`projects.php?company_id=${companyId || 1}`))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {});

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, companyId, onClose]);

  // Réinitialisation à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep('capture');
      setParsingProgress('');
      setPreviewImage(null);
      setMerchant('');
      setCategory('materiaux');
      setInvoiceNumber('REC-' + Math.floor(100000 + Math.random() * 900000));
      setDate(new Date().toISOString().split('T')[0]);
      setAmountHT(0);
      setAmountTVA(0);
      setAmountTTC(0);
      setTvaRate(20);
      setPaymentMethod('cb');
      setNotes('');
      if (initialProjectId) setProjectId(initialProjectId);
      if (initialClientId) setClientId(initialClientId);
    }
  }, [isOpen, initialProjectId, initialClientId]);

  // Recalcul automatique montants
  const updateHT = (val: number) => {
    setAmountHT(val);
    const tva = Math.round((val * (tvaRate / 100)) * 100) / 100;
    setAmountTVA(tva);
    setAmountTTC(Math.round((val + tva) * 100) / 100);
  };

  const updateTTC = (val: number) => {
    setAmountTTC(val);
    const ht = Math.round((val / (1 + (tvaRate / 100))) * 100) / 100;
    setAmountHT(ht);
    setAmountTVA(Math.round((val - ht) * 100) / 100);
  };

  const updateTvaRate = (rate: number) => {
    setTvaRate(rate);
    const tva = Math.round((amountHT * (rate / 100)) * 100) / 100;
    setAmountTVA(tva);
    setAmountTTC(Math.round((amountHT + tva) * 100) / 100);
  };

  const handleProcessImage = async (file: File) => {
    try {
      setStep('parsing');
      setParsingProgress("Optimisation du reçu...");

      const base64 = await fileToOptimizedBase64(file);
      setPreviewImage(base64);

      const extracted = await parseReceiptWithVision(base64, (msg) => {
        setParsingProgress(msg);
      });

      // Alimentation automatique du formulaire
      setMerchant(extracted.merchant || 'Fournisseur');
      setCategory(extracted.category || 'materiaux');
      setInvoiceNumber(extracted.invoice_number || ('REC-' + Date.now().toString().slice(-6)));
      setDate(extracted.date || new Date().toISOString().split('T')[0]);
      setAmountHT(extracted.amount_ht || 0);
      setTvaRate(extracted.tva_rate || 20);
      setAmountTVA(extracted.amount_tva || 0);
      setAmountTTC(extracted.amount_ttc || 0);
      setPaymentMethod(extracted.payment_method || 'cb');
      if (extracted.raw_text) {
        setNotes(extracted.raw_text);
      }

      setStep('edit');
      toast.success("Facture analysée avec succès par IA Vision !");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'analyse OCR.");
      setStep('edit'); // Permet quand même à l'utilisateur de saisir manuellement
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      toast.error("Veuillez renseigner le nom du fournisseur ou enseigne.");
      return;
    }
    if (amountTTC <= 0) {
      toast.error("Le montant TTC doit être supérieur à zéro.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveExpense({
        company_id: companyId || 1,
        project_id: projectId || null,
        client_id: clientId ? Number(clientId) : null,
        merchant: merchant.trim(),
        category,
        invoice_number: invoiceNumber.trim(),
        date,
        amount_ht: amountHT,
        amount_tva: amountTVA,
        tva_rate: tvaRate,
        amount_ttc: amountTTC,
        payment_method: paymentMethod,
        receipt_url: previewImage || null,
        notes: notes.trim()
      }, companyId);

      toast.success(`Dépense de ${amountTTC.toFixed(2)} € enregistrée avec succès !`);
      onExpenseSaved(res.expense);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Échec de l'enregistrement de la dépense.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100/95 border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-900 my-8 z-10">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-xl hover:bg-slate-200/60 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-lg shadow-amber-500/10 shrink-0">
            <Receipt size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                Scanner une Facture Fournisseur / Reçu
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                IA Vision Multimodale
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Extraction instantanée du fournisseur, des montants et de la TVA avec affectation directe au projet.
            </p>
          </div>
        </div>

        {/* ÉTAPE 1 : Capture / Téléversement */}
        {step === 'capture' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Option Smartphone Caméra */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-amber-400/70 bg-gradient-to-b from-amber-50/70 to-amber-100/40 hover:from-amber-100/80 hover:to-amber-200/50 hover:border-amber-500 transition-all text-center cursor-pointer shadow-xs"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <Camera size={32} />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Prendre en photo le reçu</h4>
                <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
                  Ouvre l'appareil photo du smartphone ou de la webcam (idéal pour ticket de caisse, frais de déplacement, achats).
                </p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessImage(file);
                  }}
                />
              </button>

              {/* Option Téléversement / Glisser-déposer */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-blue-300/80 bg-gradient-to-b from-blue-50/70 to-indigo-50/40 hover:from-blue-100/80 hover:to-blue-200/50 hover:border-blue-500 transition-all text-center cursor-pointer shadow-xs"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/15 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  <Upload size={32} />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Importer un fichier image / PDF</h4>
                <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
                  Glissez un ticket ou une facture d'achat (PNG, JPG, WEBP, facture PDF).
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessImage(file);
                  }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <Sparkles size={16} className="text-amber-600 shrink-0" />
                <span>Vous n'avez pas de photo sous la main ? Vous pouvez aussi saisir manuellement.</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('edit')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
              >
                Saisie manuelle &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Analyse OCR Vision en cours */}
        {step === 'parsing' && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin flex items-center justify-center">
                <Sparkles className="text-amber-600 animate-pulse" size={28} />
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Analyse multimodale de votre reçu</h4>
            <p className="text-sm text-amber-700 font-semibold animate-pulse">{parsingProgress}</p>
            <p className="text-xs text-slate-500 font-medium max-w-md">
              Notre IA Vision inspecte les montants HT/TTC, identifie les taux de TVA déductibles et classifie l'enseigne automatiquement.
            </p>
          </div>
        )}

        {/* ÉTAPE 3 : Vérification, affectation projet et enregistrement */}
        {step === 'edit' && (
          <form onSubmit={handleSave} className="space-y-5">
            {previewImage && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-2 text-amber-900">
                  <CheckCircle2 size={16} className="text-amber-600" />
                  <span className="font-bold">Image analysée avec succès par l'OCR Vision</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('capture')}
                  className="text-slate-500 hover:text-slate-900 font-bold underline text-[11px] cursor-pointer"
                >
                  Scanner un autre reçu
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Fournisseur */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-600" />
                  Fournisseur / Enseigne *
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Ex: FOURNISSEUR SAS, SERVICE PRO..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Tag size={15} className="text-blue-600" />
                  Catégorie de Dépense *
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all cursor-pointer"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={15} className="text-blue-600" />
                  Date de la dépense
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>

              {/* N° Facture / Ticket */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-600" />
                  N° Facture / Ticket
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>

              {/* Moyen de Paiement */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-blue-600" />
                  Moyen de Paiement
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all cursor-pointer"
                  >
                    <option value="cb">Carte Bancaire (CB)</option>
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque</option>
                    <option value="especes">Espèces</option>
                    <option value="prelevement">Prélèvement</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ventilation Financière & Fiscale (HT, TVA, TTC) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-slate-50 to-blue-50/60 border border-amber-200/80 space-y-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Receipt size={14} className="text-amber-600" />
                  Ventilation Fiscale & Comptable
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Calcul automatique en temps réel
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-900 mb-1.5 font-extrabold uppercase tracking-wider">Montant HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountHT || ''}
                    onChange={(e) => updateHT(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-900 mb-1.5 font-extrabold uppercase tracking-wider">Taux TVA (%)</label>
                  <select
                    value={tvaRate}
                    onChange={(e) => updateTvaRate(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  >
                    <option value="20">20.0 % (Taux normal)</option>
                    <option value="10">10.0 % (Taux intermédiaire)</option>
                    <option value="5.5">5.5 % (Taux réduit)</option>
                    <option value="2.1">2.1 % (Presse / Médicaments)</option>
                    <option value="0">0.0 % (Exonéré)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-emerald-800 mb-1.5 font-extrabold uppercase tracking-wider">Montant TVA (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountTVA || ''}
                    readOnly
                    className="w-full bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 text-sm text-emerald-800 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs text-amber-900 mb-1.5 font-black uppercase tracking-wider">Total TTC (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountTTC || ''}
                    onChange={(e) => updateTTC(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border-2 border-amber-500 rounded-xl px-3 py-2 text-sm text-amber-950 font-black focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Affectation Projet / Client */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <FolderGit2 size={15} className="text-blue-600" />
                  Rattacher au Projet / Mission
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                >
                  <option value="">-- Aucun projet / Frais généraux --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={15} className="text-blue-600" />
                  Client Associé
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                >
                  <option value="">-- Aucun client spécifique --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company_name ? `(${c.company_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pièce Justificative / Preuve (Optionnelle) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Receipt size={15} className="text-blue-600" />
                  Pièce Justificative / Preuve <span className="text-[10px] font-bold text-slate-500 lowercase">(optionnelle)</span>
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    Retirer la pièce
                  </button>
                )}
              </div>

              {previewImage ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <img
                    src={previewImage}
                    alt="Preuve justificative"
                    className="w-16 h-16 object-cover rounded-lg border border-amber-300 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                      <CheckCircle2 size={14} className="text-amber-600" /> Pièce justificative prête à être enregistrée
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                      Cette preuve sera sauvegardée en base de données et téléchargeable à tout moment.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-xs transition-colors cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => editCameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-dashed border-slate-300 hover:border-amber-400 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                  >
                    <Camera size={16} className="text-amber-600" />
                    <span>Photographier le ticket</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-dashed border-slate-300 hover:border-blue-400 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                  >
                    <Upload size={16} className="text-blue-600" />
                    <span>Joindre un fichier (PDF / Image)</span>
                  </button>
                </div>
              )}

              <input
                ref={editCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAttachProof(file);
                }}
              />
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAttachProof(file);
                }}
              />
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Valider et Sauvegarder la Dépense
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
