import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, FileText, Download, Plus, Trash2, 
  Sparkles, Loader2, Calculator, Users, Box, Save, AlertTriangle, MessageSquare, Camera,
  CheckCircle2, FolderKanban
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  fetchClients,
  fetchProducts,
  generateQuoteAIAssist,
  exportQuotePDF,
  saveQuote,
  saveProject,
  Client,
  Product,
  QuoteLine
} from '@/lib/quoteService';
import { DocumentUploadCapture } from '@/components/ui/DocumentUploadCapture';
import { ClientSelectWithCreate } from '@/components/clients/ClientSelectWithCreate';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

export default function ServicesIAQuote() {
  const { language } = useLanguage();
  const { company, token, isAuthenticated } = useAuth();
  const isEn = language === "en";

  // Données de base
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // État du devis
  const [quoteNumber, setQuoteNumber] = useState(() => 'DEV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: '1', description: '', quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }
  ]);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Acompte 30% à la commande, solde à 30 jours fin de mois.');

  // Sauvegarde & Authentification
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [savedQuoteSuccess, setSavedQuoteSuccess] = useState(false);
  const [savedProjectSuccess, setSavedProjectSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'quote' | 'project' | null>(null);

  // État de l'assistant IA
  const [aiContext, setAiContext] = useState('');
  const [isGeneratingAIAssist, setIsGeneratingAIAssist] = useState(false);

  useEffect(() => {
    loadBaseData();
  }, [company?.id]);

  const loadBaseData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedClients, fetchedProducts] = await Promise.all([
        fetchClients(company?.id),
        fetchProducts(company?.id)
      ]);
      setClients(fetchedClients);
      setProducts(fetchedProducts);
    } catch (err) {
      toast.error("Erreur lors de la récupération des données de base.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAIAssist = async () => {
    if (!aiContext.trim()) {
      toast.error("Veuillez décrire le besoin du client pour que l'IA puisse générer le devis.");
      return;
    }

    setIsGeneratingAIAssist(true);
    try {
      const selectedClient = clients.find(c => c.id === selectedClientId);
      const res = await generateQuoteAIAssist({
        clientContext: selectedClient ? `${selectedClient.name} (${selectedClient.company})` : "Nouveau prospect",
        projectDescription: aiContext
      }, company?.id);

      setLines(res.suggestedLines.map(l => ({ ...l, id: Math.random().toString(36).substr(2, 9) })));
      if (res.executiveSummary) setExecutiveSummary(res.executiveSummary);
      if (res.paymentTerms) setPaymentTerms(res.paymentTerms);
      toast.success("Proposition commerciale générée par l'IA.");
    } catch (err: any) {
      toast.error(err.message || "Erreur de génération IA");
    } finally {
      setIsGeneratingAIAssist(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPriceHT: 0, vatRate: 20, discountPercentage: 0 }]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof QuoteLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleProductSelect = (id: string, productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (p) {
      setLines(lines.map(l => l.id === id ? { ...l, description: p.name + (p.description ? `\n${p.description}` : ''), unitPriceHT: p.defaultPrice, vatRate: p.vatRate } : l));
    }
  };

  const handleExportPDF = () => {
    exportQuotePDF({
      clientId: selectedClientId,
      lines,
      executiveSummary,
      paymentTerms
    }, company?.id);
  };

  // Calculs totaux
  const totals = lines.reduce((acc, line) => {
    const amountHT = line.quantity * line.unitPriceHT;
    const discountAmount = amountHT * (line.discountPercentage / 100);
    const netHT = amountHT - discountAmount;
    const vatAmount = netHT * (line.vatRate / 100);
    
    return {
      totalHT: acc.totalHT + netHT,
      totalVAT: acc.totalVAT + vatAmount,
      totalTTC: acc.totalTTC + netHT + vatAmount
    };
  }, { totalHT: 0, totalVAT: 0, totalTTC: 0 });

  // Sauvegarde permanente du Devis
  const handleSaveQuote = async () => {
    const hasValidLines = lines.some(l => l.description.trim() !== '');
    if (!hasValidLines) {
      toast.error("Veuillez renseigner au moins une ligne de prestation avant d'enregistrer.");
      return;
    }

    // Si non connecté, demander l'authentification sans perdre les données
    if (!isAuthenticated) {
      setPendingAction('quote');
      setIsAuthModalOpen(true);
      return;
    }

    setIsSavingQuote(true);
    setSavedQuoteSuccess(false);

    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const res = await saveQuote({
        quoteNumber,
        clientId: selectedClientId || null,
        clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
        totalHT: totals.totalHT,
        totalVAT: totals.totalVAT,
        totalTTC: totals.totalTTC,
        status: 'draft',
        executiveSummary,
        paymentTerms,
        lines
      }, company?.id, token || undefined);

      setSavedQuoteSuccess(true);
      toast.success(`✓ Devis ${res.quoteNumber || quoteNumber} enregistré avec succès dans votre espace entreprise !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du devis.");
    } finally {
      setIsSavingQuote(false);
    }
  };

  // Sauvegarde comme Chantier / Projet lié
  const handleSaveProject = async () => {
    if (!isAuthenticated) {
      setPendingAction('project');
      setIsAuthModalOpen(true);
      return;
    }

    setIsSavingProject(true);
    setSavedProjectSuccess(false);

    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const projectTitle = executiveSummary ? executiveSummary.slice(0, 50) + "..." : `Projet Devis ${quoteNumber}`;
      
      const res = await saveProject({
        title: projectTitle,
        description: aiContext || executiveSummary || 'Projet initié depuis le Devis IA.',
        budget: totals.totalTTC,
        clientId: selectedClientId || null,
        clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
        quoteId: quoteNumber,
        status: 'in_progress',
        startDate: new Date().toISOString().split('T')[0]
      }, company?.id, token || undefined);

      setSavedProjectSuccess(true);
      toast.success(`✓ Chantier/Travail "${res.title}" enregistré dans votre suivi de projets !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du projet.");
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction === 'quote') {
      handleSaveQuote();
    } else if (pendingAction === 'project') {
      handleSaveProject();
    }
    setPendingAction(null);
  };

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <EnterpriseAuthBar className="mb-8" />
        
        <div className="mb-8">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors mb-4">
            <ArrowLeft size={16} /> Retour aux Services IA
          </Link>
          <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">
            <Calculator size={16} /> Proposition Commerciale
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
            Devis IA
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl">
            Générez instantanément des propositions commerciales complexes. L'IA structure votre offre et calcule les marges.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
          
          {/* Colonne Principale: Éditeur du Devis */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Client avec Création Intégrée */}
            <div className="ia-card bg-white p-6 border border-slate-200">
              <ClientSelectWithCreate
                selectedClientId={selectedClientId}
                onSelectClient={(c) => setSelectedClientId(c ? String(c.id) : '')}
                label="Client associé au devis"
                placeholder="Sélectionner un client existant ou en créer un nouveau..."
              />
            </div>

            {/* Lignes du devis */}
            <div className="ia-card bg-white border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Box size={20} className="text-emerald-600" /> Détail des Prestations
                </h3>
                <button onClick={addLine} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition-colors">
                  <Plus size={16} /> Ajouter Ligne
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <div key={line.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button onClick={() => removeLine(line.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="grid md:grid-cols-12 gap-4 mb-3">
                        <div className="md:col-span-8">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Désignation</label>
                          <textarea 
                            value={line.description} 
                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                            className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-3.5 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[70px] resize-y transition-all"
                            placeholder="Description détaillée de la prestation..."
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Produit du catalogue</label>
                          <select 
                            onChange={(e) => handleProductSelect(line.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none text-slate-500"
                          >
                            <option value="">Sélection rapide...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.defaultPrice}€</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">QTE</label>
                           <input type="number" min="0" step="1" value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prix Unitaire HT</label>
                           <div className="relative">
                             <input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, 'unitPriceHT', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pl-7 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" />
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">€</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remise %</label>
                           <input type="number" min="0" max="100" step="1" value={line.discountPercentage} onChange={(e) => updateLine(line.id, 'discountPercentage', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-amber-600 outline-none focus:border-blue-500" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TVA %</label>
                           <select value={line.vatRate} onChange={(e) => updateLine(line.id, 'vatRate', parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500">
                             <option value={20}>20%</option>
                             <option value={10}>10%</option>
                             <option value={5.5}>5.5%</option>
                             <option value={0}>0% (Exo)</option>
                           </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {lines.length === 0 && (
                     <div className="text-center py-8 text-slate-400 bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                       <p className="font-medium">Aucune ligne de prestation.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proposition de valeur & Conditions */}
            <div className="ia-card bg-white p-6 border border-slate-200 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Pitch / Résumé Exécutif</label>
                <textarea 
                  value={executiveSummary}
                  onChange={e => setExecutiveSummary(e.target.value)}
                  className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-normal text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[120px] resize-y transition-all"
                  placeholder="Ex: Dans le cadre de votre transformation digitale..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Conditions de règlement</label>
                <textarea 
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-normal text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[120px] resize-y transition-all"
                />
              </div>
            </div>

          </div>
          
          {/* Colonne Latérale: Actions & Totaux */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Assistant IA Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-1 rounded-3xl overflow-hidden shadow-xl shadow-blue-900/10 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
              <div className="bg-white rounded-[22px] p-6 relative z-10">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3">
                  <Sparkles size={20} /> Assistant Commercial IA
                </div>
                <p className="text-sm text-slate-600 font-medium mb-3">
                  Décrivez le besoin exprimé ou photographiez / importez un cahier des charges :
                </p>

                <div className="mb-4">
                  <DocumentUploadCapture 
                    label="Scanner / Photographier le cahier des charges (OCR)"
                    acceptedFormats=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                    onDocumentProcessed={({ text }) => {
                      if (text) {
                        setAiContext(prev => (prev ? prev + "\n\n" : "") + text);
                        toast.success("Texte du document extrait par OCR et ajouté à la description !");
                      }
                    }}
                  />
                </div>

                <textarea 
                  value={aiContext}
                  onChange={e => setAiContext(e.target.value)}
                  placeholder="Ex: Le client souhaite automatiser son service client et connecter un agent IA à son CRM..."
                  className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-normal text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[100px] resize-y mb-4 transition-all"
                />
                <button 
                  onClick={handleAIAssist}
                  disabled={isGeneratingAIAssist}
                  className="w-full ia-btn-primary py-3 text-sm font-bold flex justify-center items-center gap-2"
                >
                  {isGeneratingAIAssist ? <><Loader2 className="animate-spin" size={16}/> Analyse...</> : <><Sparkles size={16}/> Générer l'offre</>}
                </button>
              </div>
            </div>

            {/* Totaux & Export */}
            <div className="ia-card bg-white p-6 border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Calculator size={20} className="text-slate-700" /> Récapitulatif
              </h3>
              
              <div className="space-y-3 mb-6">
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

              <div className="space-y-3">
                <button 
                  onClick={handleSaveQuote}
                  disabled={isSavingQuote}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {isSavingQuote ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enregistrement...
                    </>
                  ) : savedQuoteSuccess ? (
                    <>
                      <CheckCircle2 size={16} /> ✓ Devis enregistré
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Enregistrer le devis
                    </>
                  )}
                </button>

                <button 
                  onClick={handleSaveProject}
                  disabled={isSavingProject}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {isSavingProject ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Enregistrement...
                    </>
                  ) : savedProjectSuccess ? (
                    <>
                      <CheckCircle2 size={16} /> ✓ Chantier créé
                    </>
                  ) : (
                    <>
                      <FolderKanban size={16} /> Enregistrer comme Chantier / Travail
                    </>
                  )}
                </button>

                <button 
                  onClick={handleExportPDF}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2"
                >
                  <Download size={16} /> Exporter PDF
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Modal d'authentification sans perte de données */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title={pendingAction === 'project' ? "Connectez-vous pour enregistrer ce chantier" : "Connectez-vous pour enregistrer votre devis"}
        description="Votre devis et l'ensemble de vos lignes chiffrées seront immédiatement sauvegardés dans votre espace entreprise sans aucune perte."
      />
    </div>
  );
}
