import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnterpriseAuthBar } from '@/components/site/EnterpriseAuthBar';
import { 
  ArrowLeft, ArrowRight, FileText, Download, Plus, Trash2, 
  Sparkles, Loader2, Calculator, Users, Box, Save, AlertTriangle, MessageSquare, Camera,
  CheckCircle2, FolderKanban, Eye, Brain, RefreshCcw, History, UploadCloud, BookOpen
} from 'lucide-react';
import { getQuotePDFBlob } from '@/lib/pdfExportService';
import { PdfPreviewModal } from '@/components/ui/PdfPreviewModal';
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
import { useGuestQuota } from '@/hooks/useGuestQuota';
import { SaveWorkModal } from '@/components/saved-work/SaveWorkModal';
import { SavedWorkDrawer } from '@/components/saved-work/SavedWorkDrawer';
import { VersionSelectorBar, VersionItem } from '@/components/common/VersionSelectorBar';
import { SectionDeepDive } from '@/components/common/SectionDeepDive';
import { SavedWorkItem } from '@/lib/savedWorkService';
import { classifyDocumentContent, ClassificationResult } from '@/lib/documentClassifierService';
import { DocumentMismatchModal } from '@/components/common/DocumentMismatchModal';

const PRESET_FEW_SHOT_QUOTES: Record<string, { label: string; text: string }> = {
  plomberie: {
    label: 'Modèle Plomberie',
    text: `EXEMPLE DE DEVIS PLOMBERIE / SANITAIRE :
1. Dépose et évacuation ancien chauffe-eau et tuyauterie cuivre - Forfait 180 € HT - TVA 10%
2. Fourniture et pose Chauffe-eau thermodynamique 250L classe A+ - 1 Unité à 2 150 € HT - TVA 5.5%
3. Remplacement robinetterie mitigeur thermostatique Grohe et raccordement multicouche - 1 Unité à 320 € HT - TVA 10%
4. Main-d'œuvre qualifiée plombier agréé RGE (mise en eau et tests étanchéité) - 7 Heures à 65 € HT/h - TVA 10%
Conditions : Acompte 30% à la commande, solde à réception de chantier.`
  },
  renovation: {
    label: 'Modèle BTP / Rénovation',
    text: `EXEMPLE DE DEVIS BÂTIMENT / RÉNOVATION :
1. Préparation des supports, ponçage et sous-couche d'impression - 85 m² à 14 € HT/m² - TVA 10%
2. Application 2 couches peinture satinée dépolluante blanc velours - 85 m² à 22 € HT/m² - TVA 10%
3. Fourniture et pose parquet stratifié hydrofuge avec plinthes et sous-couche phonique - 35 m² à 48 € HT/m² - TVA 10%
4. Évacuation des gravats et nettoyage de fin de chantier - Forfait 250 € HT - TVA 10%
Conditions : Acompte 40% au démarrage, solde à la livraison.`
  },
  web_agence: {
    label: 'Modèle Agence Web / IA',
    text: `EXEMPLE DE DEVIS AGENCE DIGITALE & IA :
1. Cadrage stratégique, UX Design et Wireframes interactifs Figma - 3 Jours à 650 € HT/j - TVA 20%
2. Développement Front-End React & Back-End sécurisé avec intégration API IA - 8 Jours à 700 € HT/j - TVA 20%
3. Déploiement Cloud, tests de charge, SEO et formation des équipes (3h) - Forfait 1 200 € HT - TVA 20%
4. Maintenance et infogérance premium (3 mois inclus) - Forfait 0 € HT - TVA 20%
Conditions : Acompte 30% à la signature, 40% au jalon MVP, 30% à la mise en production.`
  },
  conseil_it: {
    label: 'Modèle Conseil & Audit IT',
    text: `EXEMPLE DE DEVIS AUDIT & CONSEIL :
1. Audit des processus métiers et cartographie des opportunités d'automatisation IA - Forfait 2 800 € HT - TVA 20%
2. Rédaction du schéma directeur et cahier des charges technique - Forfait 1 900 € HT - TVA 20%
3. Restitution au Comité de Direction et feuille de route opérationnelle - Forfait 950 € HT - TVA 20%
Conditions : 50% à la commande, solde à la remise du livrable final.`
  }
};

interface QuoteVersionData {
  lines: QuoteLine[];
  executiveSummary: string;
  paymentTerms: string;
}

export default function ServicesIAQuote() {
  const { language } = useLanguage();
  const { company, token, isAuthenticated } = useAuth();
  const isEn = language === "en";

  // Quota Freemium 3 essais invité
  const { 
    remainingTrials, 
    isLimitReached: isQuotaLimitReached, 
    isAuthModalOpen: isQuotaModalOpen, 
    setIsAuthModalOpen: setIsQuotaModalOpen, 
    checkCanExecute, 
    recordExecution 
  } = useGuestQuota('quote');

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

  // Few-Shot Exemples de Devis
  const [exampleQuotesText, setExampleQuotesText] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Gestion des Versions (Propositions multiples)
  const [versions, setVersions] = useState<VersionItem<QuoteVersionData>[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState<number>(0);

  // Sauvegarde Universelle & Tiroir d'historique
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Document Mismatch Guardrail State
  const [mismatchResult, setMismatchResult] = useState<ClassificationResult | null>(null);
  const [isMismatchModalOpen, setIsMismatchModalOpen] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  // Sauvegarde Standard & Authentification
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [savedQuoteSuccess, setSavedQuoteSuccess] = useState(false);
  const [savedProjectSuccess, setSavedProjectSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'quote' | 'project' | null>(null);

  // État de l'assistant IA
  const [aiContext, setAiContext] = useState('');
  const [isGeneratingAIAssist, setIsGeneratingAIAssist] = useState(false);

  // État de la prévisualisation PDF
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPdfBlob, setPreviewPdfBlob] = useState<Blob | null>(null);

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
    } catch {
      toast.error("Erreur lors de la récupération des données de base.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleApplyPreset = (key: string) => {
    if (activePreset === key) {
      setActivePreset(null);
      setExampleQuotesText('');
      toast.info("Modèle d'exemple retiré.");
    } else {
      setActivePreset(key);
      setExampleQuotesText(PRESET_FEW_SHOT_QUOTES[key].text);
      toast.success(`Modèle « ${PRESET_FEW_SHOT_QUOTES[key].label} » activé comme référence tarifaire !`);
    }
  };

  const handleAIAssist = async (isNewVersion = false, bypassMismatch = false) => {
    if (!aiContext.trim()) {
      toast.error("Veuillez décrire le besoin du client pour que l'IA puisse générer le devis.");
      return;
    }

    const cleanInput = aiContext.trim();
    const isGibberish = 
      cleanInput.length < 8 ||
      /^(.)\1{4,}/i.test(cleanInput) ||
      (/^[b-df-hj-np-tv-z0-9\s.,;:!?'-]{10,}$/i.test(cleanInput) && !/[aeiouy]/i.test(cleanInput));

    if (isGibberish) {
      toast.error("Votre saisie semble incomplète ou incompréhensible. Pour générer un devis précis, veuillez indiquer au minimum la nature des prestations, le contexte client et les quantités ou budgets indicatifs.");
      return;
    }

    // Garde-fou d'inadéquation de document
    if (!bypassMismatch && cleanInput.length >= 25) {
      setIsClassifying(true);
      try {
        const classif = await classifyDocumentContent(cleanInput, 'quote');
        if (classif && classif.is_mismatch) {
          setMismatchResult(classif);
          setIsMismatchModalOpen(true);
          setIsClassifying(false);
          return;
        }
      } catch (e) {
        console.warn("[Classification] Non-blocking classification error:", e);
      } finally {
        setIsClassifying(false);
      }
    }

    if (!checkCanExecute()) return;

    setIsGeneratingAIAssist(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const res = await generateQuoteAIAssist({
        clientContext: selectedClient ? `${selectedClient.name} (${selectedClient.company})` : "Nouveau prospect",
        projectDescription: isNewVersion 
          ? `${aiContext}\n\n[CONSIGNE VARIATION] : Propose une variante alternative avec une répartition ou une formule tarifaire distincte.`
          : aiContext,
        exampleQuotesText: exampleQuotesText.trim() || undefined,
      }, company?.id);

      const generatedLines = res.suggestedLines.map(l => ({ ...l, id: Math.random().toString(36).substr(2, 9) }));
      const newSummary = res.executiveSummary || executiveSummary;
      const newTerms = res.paymentTerms || paymentTerms;

      setLines(generatedLines);
      if (res.executiveSummary) setExecutiveSummary(newSummary);
      if (res.paymentTerms) setPaymentTerms(newTerms);

      // Enregistrement dans les versions
      const newVersionNumber = versions.length + 1;
      const newVer: VersionItem<QuoteVersionData> = {
        id: 'ver_' + Date.now(),
        versionNumber: newVersionNumber,
        label: `Proposition V${newVersionNumber}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        data: {
          lines: generatedLines,
          executiveSummary: newSummary,
          paymentTerms: newTerms,
        }
      };

      const updatedVersions = [...versions, newVer];
      setVersions(updatedVersions);
      setActiveVersionIndex(updatedVersions.length - 1);

      recordExecution();
      toast.success(isNewVersion ? `Nouvelle variante V${newVersionNumber} générée !` : "Proposition commerciale générée par l'IA.");
    } catch (err: any) {
      toast.error(err.message || "Erreur de génération IA");
    } finally {
      setIsGeneratingAIAssist(false);
    }
  };

  const handleSwitchVersion = (index: number) => {
    if (versions[index]) {
      setActiveVersionIndex(index);
      const verData = versions[index].data;
      setLines(verData.lines);
      setExecutiveSummary(verData.executiveSummary);
      setPaymentTerms(verData.paymentTerms);
      toast.info(`Affichage de la ${versions[index].label || `Version ${index + 1}`}`);
    }
  };

  const handleLoadSavedWork = (item: SavedWorkItem) => {
    try {
      const payload = item.content_payload;
      if (payload.lines && Array.isArray(payload.lines)) {
        setLines(payload.lines);
      }
      if (payload.executiveSummary) setExecutiveSummary(payload.executiveSummary);
      if (payload.paymentTerms) setPaymentTerms(payload.paymentTerms);
      if (payload.quoteNumber) setQuoteNumber(payload.quoteNumber);
      if (item.client_id) setSelectedClientId(String(item.client_id));
      toast.success(`Travail « ${item.title} » restauré avec succès !`);
    } catch {
      toast.error("Format de travail invalide.");
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

  const getQuoteExportPayload = () => {
    const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
    return {
      quoteNumber,
      date: new Date().toISOString().split('T')[0],
      validityDays: 30,
      client: selectedClient,
      clientName: selectedClient ? (selectedClient.company || selectedClient.name) : 'Client Partenaire',
      lines,
      executiveSummary,
      paymentTerms,
      totals,
      company: company ? {
        name: company.name,
        email: company.email
      } : undefined
    };
  };

  const handleExportPDF = async () => {
    try {
      const payload = getQuoteExportPayload();
      await exportQuotePDF(payload, company?.id);
      toast.success(`Devis ${quoteNumber} téléchargé en PDF haute qualité !`);
    } catch {
      toast.error("Erreur lors de la génération du PDF.");
    }
  };

  const handlePreviewPDF = () => {
    try {
      const payload = getQuoteExportPayload();
      const { blob } = getQuotePDFBlob(payload);
      setPreviewPdfBlob(blob);
      setIsPreviewOpen(true);
    } catch {
      toast.error("Erreur lors de la génération de l'aperçu PDF.");
    }
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

    if (!isAuthenticated) {
      setPendingAction('quote');
      setIsAuthModalOpen(true);
      return;
    }

    setIsSavingQuote(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      await saveQuote({
        quoteNumber,
        company_id: company?.id || 1,
        clientId: selectedClientId || null,
        clientName: selectedClient ? `${selectedClient.name} (${selectedClient.company})` : 'Client',
        date: new Date().toISOString().split('T')[0],
        totalHT: totals.totalHT,
        totalVAT: totals.totalVAT,
        totalTTC: totals.totalTTC,
        status: 'draft',
        executiveSummary,
        paymentTerms,
        lines
      }, company?.id, token);

      setSavedQuoteSuccess(true);
      toast.success(`Devis ${quoteNumber} sauvegardé avec succès dans votre base de données !`);
      setTimeout(() => setSavedQuoteSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde du devis.");
    } finally {
      setIsSavingQuote(false);
    }
  };

  // Enregistrer comme Projet / Mission
  const handleSaveProject = async () => {
    const hasValidLines = lines.some(l => l.description.trim() !== '');
    if (!hasValidLines) {
      toast.error("Veuillez générer ou saisir votre devis avant de créer un projet.");
      return;
    }

    if (!isAuthenticated) {
      setPendingAction('project');
      setIsAuthModalOpen(true);
      return;
    }

    setIsSavingProject(true);
    try {
      const selectedClient = clients.find(c => String(c.id) === String(selectedClientId));
      const firstLineDesc = lines[0]?.description || 'Mission';
      const projectTitle = firstLineDesc.length > 50 ? firstLineDesc.slice(0, 47) + '...' : firstLineDesc;

      await saveProject({
        company_id: company?.id || 1,
        clientId: selectedClientId || null,
        clientName: selectedClient ? `${selectedClient.name} (${selectedClient.company})` : 'Client',
        title: projectTitle,
        description: executiveSummary || aiContext || 'Prestation issue du devis IA',
        budget: totals.totalHT,
        status: 'in_progress',
        startDate: new Date().toISOString().split('T')[0]
      }, company?.id, token);

      setSavedProjectSuccess(true);
      toast.success(`Projet créé avec succès ! Suivez l'avancement dans votre espace.`);
      setTimeout(() => setSavedProjectSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création du projet.");
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
    <div className="ia-page min-h-screen pt-32 pb-12 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barre d'Authentification / Entreprise */}
        <EnterpriseAuthBar 
          appName="Devis IA & Propositions Commerciales"
          onOpenAuthModal={() => {
            setPendingAction(null);
            setIsAuthModalOpen(true);
          }}
        />

        {/* Top Header & Actions Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link to="/services-ia" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-sm transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {isEn ? "Back to AI Services" : "Retour aux Services IA"}
          </Link>

          {/* Action Buttons: Universal Save & History */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-colors"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>Historique Sauvegardes</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder dans l'historique</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
              Devis IA
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
              Générez instantanément des propositions commerciales complexes basées sur vos modèles de devis ou vos grilles tarifaires.
            </p>

            {/* Séparateur créatif */}
            <div className="flex items-center gap-4 mb-8 max-w-lg">
              <div className="h-px bg-gradient-to-r from-blue-300 via-cyan-300 to-transparent flex-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
              <div className="w-1 h-1 rounded-full bg-blue-400 opacity-50"></div>
            </div>

            {/* Comment ça marche */}
            <div className="max-w-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Users size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">1. Client & Modèle</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">Sélectionnez le client et un exemple de devis.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-blue-500 bg-blue-50/80 h-8 w-8 rounded-full border border-blue-100/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]">
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all group relative flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:rotate-12 transition-transform flex-shrink-0">
                      <Brain size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">2. IA Few-Shot</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium pl-11">L'IA reproduit les tarifs et structure l'offre.</p>
                </div>

                <div className="hidden sm:flex items-center justify-center flex-shrink-0 text-cyan-500 bg-cyan-50/80 h-8 w-8 rounded-full border border-cyan-100/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-[pulse_1.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                  <ArrowRight size={16} strokeWidth={3} className="ml-0.5" />
                </div>

                <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all group flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-white">3. Devis & Export</span>
                  </div>
                  <p className="text-xs text-white font-medium pl-11">Générez le PDF ou sauvez en base.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc Vidéo */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full rounded-2xl overflow-hidden shadow-xl shadow-blue-600/10 border border-slate-100 flex-shrink-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://cdn.prod.website-files.com/6373b53b7e4adf70ce44cbd5%2F6a71f36dba060eceb7c770d6_anim%20-%20gestion%20des%20achats_webm.webm" type="video/webm" />
            </video>
          </div>
        </div>

        {/* Version Selector Bar */}
        {versions.length > 0 && (
          <div className="mb-6">
            <VersionSelectorBar
              versions={versions}
              activeVersionIndex={activeVersionIndex}
              onSelectVersion={handleSwitchVersion}
              onGenerateNewVersion={() => handleAIAssist(true)}
              isGeneratingNewVersion={isGeneratingAIAssist}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 ia-animate-in">
          
          {/* Colonne Principale: Éditeur du Devis */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Client avec Création Intégrée */}
            <div className="ia-card bg-white p-6 border border-slate-200 relative z-30 overflow-visible">
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
                  {lines.map((line) => (
                    <div key={line.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                      <button onClick={() => removeLine(line.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="grid md:grid-cols-12 gap-4 mb-3">
                        <div className="md:col-span-8">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Désignation</label>
                          <textarea 
                            value={line.description} 
                            onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                            className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[70px] resize-y transition-all"
                            placeholder="Description détaillée de la prestation..."
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Produit du catalogue</label>
                          <select 
                            onChange={(e) => handleProductSelect(line.id, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold outline-none text-slate-900"
                          >
                            <option value="">Sélection rapide...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.defaultPrice}€</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">QTE</label>
                           <input type="number" min="0" step="1" value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Prix Unitaire HT</label>
                           <div className="relative">
                             <input type="number" min="0" step="0.01" value={line.unitPriceHT} onChange={(e) => updateLine(line.id, 'unitPriceHT', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500" />
                             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-sm pointer-events-none">€</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Remise %</label>
                           <input type="number" min="0" max="100" step="1" value={line.discountPercentage} onChange={(e) => updateLine(line.id, 'discountPercentage', parseFloat(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-amber-700 outline-none focus:border-blue-500" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">TVA %</label>
                           <select value={line.vatRate} onChange={(e) => updateLine(line.id, 'vatRate', parseFloat(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500">
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
                     <div className="text-center py-8 text-slate-600 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                       <p className="font-bold">Aucune ligne de prestation.</p>
                     </div>
                  )}
                </div>

                {/* Section Deep Dive sur les Lignes Chiffrées */}
                <SectionDeepDive
                  sectionTitle="Chiffrage & Décomposition des Lignes"
                  sectionContent={lines}
                  toolType="Devis & Tarification Commerciale"
                  placeholder="Posez une question sur le chiffrage (ex: comment optimiser la marge sur la ligne 1 ?)"
                  suggestedQuestions={[
                    'Calculer la marge brute prévisionnelle sur ces lignes',
                    'Proposer des options complémentaires à forte valeur ajoutée (Upsell)',
                    'Adapter la formulation pour maximiser le taux de conversion'
                  ]}
                />
              </div>
            </div>

            {/* Proposition de valeur & Conditions */}
            <div className="ia-card bg-white p-6 border border-slate-200 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Pitch / Résumé Exécutif</label>
                  <textarea 
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[120px] resize-y transition-all"
                    placeholder="Ex: Dans le cadre de votre transformation digitale..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Conditions de règlement</label>
                  <textarea 
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[120px] resize-y transition-all"
                  />
                </div>
              </div>

              {/* Section Deep Dive sur le Pitch Commercial */}
              <SectionDeepDive
                sectionTitle="Pitch Commercial & Conditions"
                sectionContent={{ executiveSummary, paymentTerms }}
                toolType="Négociation Commerciale"
                placeholder="Approfondir le pitch (ex: adapter pour convaincre un DAF frileux sur l'acompte...)"
                suggestedQuestions={[
                  'Formuler un argumentaire d’urgence et de ROI immédiat',
                  'Proposer un échéancier de paiement sécurisé pour le client',
                  'Rédiger une clause de garantie de satisfaction'
                ]}
              />
            </div>

          </div>
          
          {/* Colonne Latérale: Actions, Few-Shot Exemples & Totaux */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Assistant IA Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-1 rounded-3xl overflow-hidden shadow-xl shadow-blue-900/10 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
              <div className="bg-white rounded-[22px] p-6 relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <Sparkles size={20} /> Assistant Commercial IA
                  </div>
                  {versions.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {versions.length} version{versions.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* 1. Zone Exemples de Devis (Few-Shot Learning) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      Exemple de devis de référence (Few-shot)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Importez un devis existant ou activez un modèle type pour que l'IA calque ses tarifs et intitulés :
                  </p>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(PRESET_FEW_SHOT_QUOTES).map(([key, item]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold text-left transition-all border ${
                          activePreset === key
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/40'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Upload custom quote example */}
                  <DocumentUploadCapture 
                    label="Scanner / Importer votre propre exemple de devis"
                    acceptedFormats=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                    onDocumentProcessed={({ text, filename }) => {
                      if (text) {
                        setExampleQuotesText(text);
                        setActivePreset(null);
                        toast.success(`Exemple de devis « ${filename || 'Document'} » importé comme référence !`);
                      }
                    }}
                  />

                  {exampleQuotesText && (
                    <div className="relative">
                      <textarea
                        value={exampleQuotesText}
                        onChange={(e) => setExampleQuotesText(e.target.value)}
                        placeholder="Contenu de votre exemple de devis de référence..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-[11px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-y"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setExampleQuotesText('');
                          setActivePreset(null);
                        }}
                        className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-200 hover:bg-red-100 hover:text-red-700 text-[10px] font-bold text-slate-600"
                      >
                        Effacer
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Cahier des charges / Besoin du client */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Description du besoin client
                  </label>
                  <div className="mb-2">
                    <DocumentUploadCapture 
                      label="Importer le cahier des charges (PDF, Docx, Scan)"
                      acceptedFormats=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp"
                      onDocumentProcessed={({ text }) => {
                        if (text) {
                          setAiContext(prev => (prev ? prev + "\n\n" : "") + text);
                          toast.success("Texte du cahier des charges extrait et ajouté !");
                        }
                      }}
                    />
                  </div>

                  <textarea 
                    value={aiContext}
                    onChange={e => setAiContext(e.target.value)}
                    placeholder="Ex: Le client souhaite refaire la plomberie d'une salle de bain et poser un chauffe-eau 250L..."
                    className="w-full bg-white border border-[#D9D9D9] dark:border-slate-700 rounded-[12px] px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 min-h-[90px] resize-y transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={() => handleAIAssist(false)}
                    disabled={isGeneratingAIAssist || isClassifying}
                    className="w-full ia-btn-primary py-3 text-sm font-bold flex justify-center items-center gap-2"
                  >
                    {isClassifying ? (
                      <><Loader2 className="animate-spin" size={16}/> Vérification du document...</>
                    ) : isGeneratingAIAssist ? (
                      <><Loader2 className="animate-spin" size={16}/> Génération en cours...</>
                    ) : (
                      <>
                        <Sparkles size={16}/> Générer le devis IA
                        {!isAuthenticated && (
                          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-normal">
                            {remainingTrials > 0 ? `⚡ ${remainingTrials}/3 essai${remainingTrials > 1 ? 's' : ''}` : '⚡ 0/3'}
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {versions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAIAssist(true)}
                      disabled={isGeneratingAIAssist}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 text-blue-600" />
                      Proposer une autre variante
                    </button>
                  )}
                </div>
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
                      <CheckCircle2 size={16} /> ✓ Projet créé
                    </>
                  ) : (
                    <>
                      <FolderKanban size={16} /> Enregistrer comme Projet / Mission
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={handlePreviewPDF}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition-colors flex justify-center items-center gap-2"
                  >
                    <Eye size={16} /> Aperçu
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportPDF}
                    className="py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2"
                  >
                    <Download size={16} /> Exporter PDF
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Universal Save Modal */}
      <SaveWorkModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        toolType="quote"
        defaultTitle={`Devis ${quoteNumber} - Total ${totals.totalTTC.toFixed(2)} €`}
        contentPayload={{
          quoteNumber,
          lines,
          executiveSummary,
          paymentTerms,
          totals,
          date: new Date().toISOString().split('T')[0]
        }}
        summary={`Devis chiffré comprenant ${lines.length} lignes de prestations pour un montant total de ${totals.totalTTC.toFixed(2)} € TTC.`}
        initialClientId={selectedClientId}
        currentVersion={activeVersionIndex + 1}
      />

      {/* Universal Saved Work Drawer */}
      <SavedWorkDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        toolType="quote"
        onSelectWork={handleLoadSavedWork}
      />

      {/* Modal Quota 3 Essais Atteints */}
      <AuthRequiredModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={() => {
          setIsQuotaModalOpen(false);
          handleAIAssist();
        }}
        quotaLimitReached={isQuotaLimitReached}
        title="Vous avez utilisé vos 3 essais gratuits"
        description="Créez votre compte entreprise en 30 secondes ou connectez-vous pour débloquer l'accès illimité et sauvegarder tous vos devis en base de données."
      />

      {/* Modal d'authentification sans perte de données */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title={pendingAction === 'project' ? "Connectez-vous pour enregistrer ce projet" : "Connectez-vous pour enregistrer votre devis"}
        description="Votre devis et l'ensemble de vos lignes chiffrées seront immédiatement sauvegardés dans votre espace entreprise sans aucune perte."
      />

      {/* Modal de prévisualisation PDF haute qualité */}
      <PdfPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfBlob={previewPdfBlob}
        title={`Devis ${quoteNumber}`}
        fileName={`Devis-${quoteNumber}.pdf`}
        onDownload={handleExportPDF}
      />

      {/* Document Mismatch Guardrail Modal */}
      <DocumentMismatchModal
        isOpen={isMismatchModalOpen}
        onClose={() => setIsMismatchModalOpen(false)}
        onProceedAnyway={() => {
          setIsMismatchModalOpen(false);
          handleAIAssist(false, true);
        }}
        result={mismatchResult}
        currentModule="quote"
      />
    </div>
  );
}
