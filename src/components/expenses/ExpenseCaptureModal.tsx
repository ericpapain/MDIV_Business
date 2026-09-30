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

  // Étape : 'capture' | 'parsing' | 'edit'
  const [step, setStep] = useState<'capture' | 'parsing' | 'edit'>('capture');
  const [parsingProgress, setParsingProgress] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        receipt_url: previewImage ? previewImage.slice(0, 100) + '...' : null,
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-[#121624] border border-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl text-white my-8 z-10">
        {/* Bouton Fermer */}
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
            <Receipt size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                Scanner une Facture Fournisseur / Reçu
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold/20 text-gold border border-gold/30">
                IA Vision Multimodale
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              Extraction instantanée de l'enseigne, de la TVA et affectation directe au chantier.
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
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/5 hover:bg-gold/10 hover:border-gold transition-all text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Prendre en photo le reçu</h4>
                <p className="text-xs text-gray-400 max-w-xs">
                  Ouvre l'appareil photo du smartphone ou de la webcam (idéal pour ticket de caisse froissé, carburant, péage).
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
                className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Importer un fichier image / PDF</h4>
                <p className="text-xs text-gray-400 max-w-xs">
                  Glissez un ticket ou une facture (PNG, JPG, WEBP, facture Point.P, Kiloutou, Leroy Merlin).
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

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Sparkles size={16} className="text-gold" />
                <span>Vous n'avez pas de photo sous la main ? Vous pouvez aussi saisir manuellement.</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('edit')}
                className="text-xs font-bold text-gold hover:underline"
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
              <div className="w-20 h-20 rounded-full border-4 border-gold/20 border-t-gold animate-spin flex items-center justify-center">
                <Sparkles className="text-gold animate-pulse" size={28} />
              </div>
            </div>
            <h4 className="text-lg font-bold text-white">Analyse multimodale de votre reçu</h4>
            <p className="text-sm text-gold font-medium animate-pulse">{parsingProgress}</p>
            <p className="text-xs text-gray-400 max-w-md">
              Notre IA Vision inspecte les montants HT/TTC, identifie les taux de TVA déductibles et classifie l'enseigne automatiquement.
            </p>
          </div>
        )}

        {/* ÉTAPE 3 : Vérification, affectation chantier et enregistrement */}
        {step === 'edit' && (
          <form onSubmit={handleSave} className="space-y-5">
            {previewImage && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs">
                <div className="flex items-center gap-2 text-gold">
                  <CheckCircle2 size={16} />
                  <span className="font-bold">Image analysée avec succès par l'OCR Vision</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('capture')}
                  className="text-gray-400 hover:text-white underline text-[11px]"
                >
                  Scanner un autre reçu
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Fournisseur */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Fournisseur / Enseigne *
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Ex: TOTAL ENERGIES, POINT.P, KILOUTOU..."
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Catégorie de Dépense *
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Date de la dépense
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* N° Facture / Ticket */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  N° Facture / Ticket
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Moyen de Paiement */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Moyen de Paiement
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#0b0d14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
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
            <div className="p-4 rounded-2xl bg-[#0b0d14] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gold uppercase tracking-wider">
                <span>Ventilation Fiscale & Comptable</span>
                <span>Calcul automatique en temps réel</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-semibold">Montant HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountHT || ''}
                    onChange={(e) => updateHT(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-semibold">Taux TVA (%)</label>
                  <select
                    value={tvaRate}
                    onChange={(e) => updateTvaRate(parseFloat(e.target.value))}
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold focus:border-gold"
                  >
                    <option value="20">20.0 % (Standard)</option>
                    <option value="10">10.0 % (Rénovation BTP)</option>
                    <option value="5.5">5.5 % (Énergie / RGE)</option>
                    <option value="2.1">2.1 % (Presse)</option>
                    <option value="0">0.0 % (Exonéré)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1 font-semibold">Montant TVA (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountTVA || ''}
                    readOnly
                    className="w-full bg-[#121624]/60 border border-white/5 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gold mb-1 font-bold">Total TTC (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountTTC || ''}
                    onChange={(e) => updateTTC(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#121624] border border-gold/50 rounded-xl px-3 py-2 text-sm text-gold font-extrabold focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Affectation Chantier / Client */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
                  <FolderGit2 size={14} className="text-gold" />
                  Rattacher au Chantier / Projet
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold"
                >
                  <option value="">-- Aucun chantier / Frais général --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5">
                  <Building2 size={14} className="text-gold" />
                  Client Associé
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-gold"
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

            {/* Actions Footer */}
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
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d14] text-sm font-bold shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
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
