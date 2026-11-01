import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Users, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  FileCheck, 
  Landmark, 
  FolderGit2, 
  Plus, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  Headphones, 
  Clock, 
  Layers, 
  Lock,
  Zap,
  Info
} from 'lucide-react';

type SegmentType = 'creator' | 'independent' | 'tpe' | 'pme';
type BillingPeriod = 'monthly' | 'yearly';

export const FintechPricingTab: React.FC = () => {
  const [segment, setSegment] = useState<SegmentType>('independent');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  
  // Modules sélectionnés
  const [hasPurchasesModule, setHasPurchasesModule] = useState(false);
  const [hasSalesModule, setHasSalesModule] = useState(false);
  
  // Accordions de fonctionnalités
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({
    essential: false,
    purchases: false,
    sales: false
  });

  // Accordion FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFeatureAccordion = (key: string) => {
    setExpandedFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Données dynamiques selon le segment
  const segmentData = {
    creator: {
      name: "Créateur",
      subtitle: "Les 12 premiers mois de création",
      badge: "Offre Spéciale Lancement",
      essentialPrice: 0,
      essentialAnnualPrice: 0,
      essentialFeatures: [
        "Diagnostic (Audit) & ROI : 3 audits/mois (Sans export PDF)",
        "Préparation Réunion : Sans assistance vocale",
        "Chatbot RAG : 1 document max (2 MB)",
      ],
      purchasesFeatures: [
        "Scanner OCR : 10 scans/mois",
        "Paiements simplifiés : Non inclus",
        "Assistant Email IA : Non inclus",
      ],
      salesFeatures: [
        "Studio Multi-Canal : 3 générations/mois (LinkedIn)",
        "Prospection Leads : 5 recherches (Sans export)",
        "Appels d'Offres : 2 recherches (Décryptage IA bloqué)",
        "Devis & Factures : 10 devis/an (Sans Factur-X)",
        "Relances : Manuelles uniquement",
      ],
      welcomeBonus: ["1 vérification IBAN offerte", "1 signature électronique offerte"],
    },
    independent: {
      name: "Indépendants & Micro-Entreprises",
      subtitle: "0 à 3 collaborateurs",
      badge: "Idéal Freelances & Indépendants",
      essentialPrice: 12,
      essentialAnnualPrice: 10.80,
      purchasesPrice: 15,
      salesPrice: 15,
      essentialFeatures: [
        "Diagnostic (Audit) & ROI : 10 audits/mois avec Export PDF",
        "Préparation Réunion : Assistant Vocal Activé",
        "Chatbot RAG : 3 documents max (10 MB)",
      ],
      purchasesFeatures: [
        "Scanner OCR : 500 factures/an",
        "Paiements simplifiés : 20/mois",
        "Assistant Email : Activé (50 mails/mois triés & traités par IA)",
      ],
      salesFeatures: [
        "Studio Multi-Canal : 20 générations/mois (Tous réseaux)",
        "Prospection Leads : 50 recherches (Export Excel débloqué)",
        "Appels d'Offres : 20 recherches (Décryptage IA inclus)",
        "Devis & Factures : 250 factures/an (Norme Factur-X)",
        "Relances : Assistant IA Standard",
      ],
      welcomeBonus: ["1 vérification IBAN offerte", "1 signature électronique offerte"],
      purchasesBonus: "10 vérifications IBAN offertes",
      salesBonus: "10 signatures électroniques offertes"
    },
    tpe: {
      name: "TPE",
      subtitle: "4 à 9 collaborateurs",
      badge: "Le plus populaire",
      essentialPrice: 39,
      essentialAnnualPrice: 35.10,
      purchasesPrice: 25,
      salesPrice: 25,
      essentialFeatures: [
        "Diagnostic (Audit) & ROI : 50 audits/mois (Mode Challenge IA & Benchmark)",
        "Préparation Réunion : Illimité",
        "Chatbot RAG : 10 documents",
      ],
      purchasesFeatures: [
        "Scanner OCR : 1000 factures/an",
        "Paiements SEPA 1-clic & Rapprochement bancaire auto",
        "Assistant Email : IA Illimitée",
      ],
      salesFeatures: [
        "Studio Multi-Canal : Illimité (Mode Challenge IA)",
        "Prospection Leads : 500 recherches (Sauvegarde CRM)",
        "Appels d'Offres : 200 recherches (Sauvegarde BDD)",
        "Devis & Factures : 500 factures/an (Liens de paiement sécurisés)",
        "Relances : Alertes & relances automatiques en 1 clic",
      ],
      welcomeBonus: ["10 vérifications IBAN offertes", "5 signatures électroniques offertes"],
      purchasesBonus: "20 vérifications IBAN offertes",
      salesBonus: "20 signatures électroniques offertes"
    },
    pme: {
      name: "PME",
      subtitle: "10 collaborateurs et plus",
      badge: "Équipes & Multi-collaborateurs",
      essentialPrice: 99,
      essentialAnnualPrice: 89.10,
      purchasesPrice: 30,
      salesPrice: 30,
      essentialFeatures: [
        "Intelligence Maximale : Mode Fusion (Astra + Groq) partout",
        "Gouvernance : Interface AdminAIGovernance",
        "Chatbot RAG : Illimité",
      ],
      purchasesFeatures: [
        "Scanner OCR : 2500 factures/an",
        "Banque : Bouclier anti-fraude faux IBAN illimité",
        "Assistant Email : Hub de traitement dédié",
      ],
      salesFeatures: [
        "Studio Multi-Canal : Intelligence Maximale",
        "Prospection Leads & Appels d'Offres : Requêtes illimitées",
        "Devis & Factures : 1000 factures/an (Signature électronique illimitée)",
        "Relances : Cycle complet automatisé",
      ],
      welcomeBonus: ["20 vérifications IBAN offertes", "10 signatures électroniques offertes"],
      purchasesBonus: "50 vérifications IBAN offertes",
      salesBonus: "50 signatures électroniques offertes"
    }
  };

  const current = segmentData[segment];

  // Calcul du prix total affiché
  const currentEssential = billingPeriod === 'yearly' && 'essentialAnnualPrice' in current 
    ? current.essentialAnnualPrice 
    : current.essentialPrice;

  const purchasesPrice = 'purchasesPrice' in current ? current.purchasesPrice : 0;
  const salesPrice = 'salesPrice' in current ? current.salesPrice : 0;

  const totalPrice = currentEssential + (hasPurchasesModule ? purchasesPrice : 0) + (hasSalesModule ? salesPrice : 0);

  const faqs = [
    {
      q: "Qu'est-ce que la solution Factur-X IT4ALL / MDIV Business ?",
      a: "IT4ALL en partenariat avec MDIV Business accompagne les créateurs d'entreprise, indépendants, TPE et PME dans la gestion de leur activité et leur mise en conformité avec la réforme sur la facturation électronique 2026 (Plateforme Agréée DGFiP / Factur-X). Notre solution centralise la facturation, sécurise le paiement des factures fournisseurs et offre un contrôle complet de trésorerie."
    },
    {
      q: "Comment la plateforme simplifie-t-elle la gestion administrative et financière ?",
      a: "1. Centralisation et OCR automatique : Dématérialisation et lecture automatique de toutes vos factures papier et PDF avec détection anti-doublon.\n2. Encaissements accélérés : Devis avec signature électronique certifiée et liens de paiement sécurisés intégrés aux factures.\n3. Contrôle & Sécurité bancaire : Agrégation des comptes bancaires en temps réel, rapprochement automatique et bouclier anti-fraude aux faux IBAN fournisseurs."
    },
    {
      q: "Quelles entreprises peuvent bénéficier de ces offres ?",
      a: "Toutes les structures : créateurs d'entreprise (qui bénéficient du module Essentiel gratuit la 1ère année), indépendants, dirigeants, professions libérales, TPE et PME françaises. Des offres sur-mesure sont également disponibles pour les volumes importants."
    },
    {
      q: "Les tarifs sont-ils sans engagement ?",
      a: "Oui, tous nos forfaits sont sans engagement avec 15 jours d'essai gratuit. Vous pouvez ajuster ou résilier vos modules à tout moment depuis votre espace client. En choisissant la facturation annuelle, vous bénéficiez de 10% de réduction immédiate."
    },
    {
      q: "Comment démarrer et me mettre en conformité e-facturation ?",
      a: "Vous pouvez activer votre essai gratuit en 1 clic directement dans cet espace. Vous aurez immédiatement accès à l'émission de factures Factur-X, à la détection OCR et à la synchronisation bancaire."
    }
  ];

  return (
    <div className="ia-animate-in space-y-12 max-w-6xl mx-auto pb-16">
      
      {/* HERO HEADER BRANDÉ IT4ALL */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0F172A] to-blue-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} className="text-cyan-400" />
              Plateforme Agréée Facturation Électronique 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              Des forfaits adaptés à vos besoins
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Le module <strong className="text-white font-semibold">Essentiel</strong> est inclus par défaut — ajoutez des modules complémentaires en 1 clic selon l'évolution de votre activité.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 size={14} className="text-emerald-400" /> 15 jours d'essai gratuit
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock size={14} className="text-blue-400" /> Résiliable à tout moment
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Smartphone size={14} className="text-purple-400" /> Web & Mobile
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Headphones size={14} className="text-amber-400" /> Conseiller 5j/7
              </span>
            </div>
          </div>

          {/* LOGO OFFICIEL IT4ALL & BADGE CONFIANCE */}
          <div className="flex flex-col items-center gap-3 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center flex-shrink-0">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <img 
                src="/IT4ALL.jpeg" 
                alt="Logo IT4WORK" 
                className="h-12 w-auto object-contain" 
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">IT4ALL Fintech Suite</div>
              <div className="text-[11px] text-slate-400">Norme Factur-X & Conformité DGFiP</div>
            </div>
          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE SEGMENT (4 PROFILS) */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-slate-900">1. Choisissez votre profil d'entreprise</h2>
          <p className="text-sm text-slate-500">Adaptez les fonctionnalités à la taille de votre structure</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-2 rounded-2xl">
          {(['creator', 'independent', 'tpe', 'pme'] as SegmentType[]).map((segKey) => {
            const seg = segmentData[segKey];
            const isSelected = segment === segKey;
            return (
              <button
                key={segKey}
                onClick={() => {
                  setSegment(segKey);
                  // Réinitialiser les modules si passage à creator
                  if (segKey === 'creator') {
                    setHasPurchasesModule(false);
                    setHasSalesModule(false);
                  }
                }}
                className={`p-4 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-white text-slate-900 shadow-md border-2 border-blue-600 scale-[1.02]' 
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    Actif
                  </span>
                )}
                <div>
                  <div className="text-sm font-bold">{seg.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{seg.subtitle}</div>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-blue-600">
                  {segKey === 'creator' ? '0 € /mois (1 an)' : `Dès ${seg.essentialPrice} € HT/mois`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOGGLE PÉRIODE DE FACTURATION */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <span className={`text-sm font-semibold cursor-pointer ${billingPeriod === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`} onClick={() => setBillingPeriod('monthly')}>
          Facturation Mensuelle
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className="w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: billingPeriod === 'yearly' ? '#2563eb' : '#cbd5e1' }}
        >
          <div 
            className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </button>
        <span className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setBillingPeriod('yearly')}>
          Facturation Annuelle
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-300">
            -10%
          </span>
        </span>
      </div>

      {/* GRILLE DES 3 MODULES DE L'OFFRE (ESSENTIEL + ACHATS + VENTES) */}
      <div className="grid md:grid-cols-3 gap-6 items-stretch">
        
        {/* CARTE 1 : MODULE ESSENTIEL */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200 shadow-sm flex flex-col justify-between relative hover:border-slate-300 transition-all">
          <div className="absolute top-4 right-4 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            Inclus d'office
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Socle de base</div>
              <h3 className="text-2xl font-black text-slate-900">Module Essentiel</h3>
              <p className="text-xs text-slate-500 mt-1">Soyez 100% conforme avec la réforme sur la facturation électronique.</p>
            </div>

            <div className="py-3 border-y border-slate-100">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{currentEssential} €</span>
                <span className="text-xs text-slate-500 font-semibold">/mois HT</span>
              </div>
              {billingPeriod === 'yearly' && current.essentialPrice > 0 && (
                <div className="text-xs text-emerald-600 font-medium mt-0.5">
                  Soit {(currentEssential * 12).toFixed(2)} € /an facturé annuellement
                </div>
              )}
            </div>

            {/* Inclusions clés */}
            <div className="space-y-2.5 text-xs text-slate-700">
              {current.essentialFeatures.map((feat, idx) => {
                const [boldPart, rest] = feat.split(' : ');
                return (
                  <div key={idx} className="flex items-start gap-2 text-slate-600">
                    <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span><strong>{boldPart}</strong> {rest ? `: ${rest}` : ''}</span>
                  </div>
                );
              })}
            </div>

            {/* Offre de bienvenue */}
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs space-y-1">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-600" /> Offre de bienvenue
              </div>
              {current.welcomeBonus.map((b, i) => (
                <div key={i} className="text-blue-700 text-[11px]">• {b}</div>
              ))}
            </div>
          </div>

          <button 
            type="button" 
            className="w-full mt-6 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
          >
            Module Inclus
          </button>
        </div>

        {/* CARTE 2 : MODULE ACHATS */}
        {segment !== 'creator' ? (
          <div className={`rounded-3xl p-6 md:p-8 border-2 shadow-sm flex flex-col justify-between transition-all ${
            hasPurchasesModule 
              ? 'bg-blue-50/50 border-blue-500 shadow-blue-500/10' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Gestion Fournisseurs</div>
                <h3 className="text-2xl font-black text-slate-900">Module Achats</h3>
                <p className="text-xs text-slate-500 mt-1">Centralisez, contrôlez et sécurisez le paiement de vos dépenses.</p>
              </div>

              <div className="py-3 border-y border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">+{purchasesPrice} €</span>
                  <span className="text-xs text-slate-500 font-semibold">/mois HT</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                {current.purchasesFeatures?.map((feat, idx) => {
                  const [boldPart, rest] = feat.split(' : ');
                  return (
                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                      <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>{boldPart}</strong> {rest ? `: ${rest}` : ''}</span>
                    </div>
                  );
                })}
              </div>

              {'purchasesBonus' in current && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-emerald-600" /> Offre de bienvenue
                  </div>
                  <div className="text-emerald-700 text-[11px]">• {current.purchasesBonus}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setHasPurchasesModule(!hasPurchasesModule)}
              className={`w-full mt-6 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                hasPurchasesModule 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-600'
              }`}
            >
              {hasPurchasesModule ? (
                <>
                  <Check size={16} /> Module sélectionné
                </>
              ) : (
                <>
                  <Plus size={16} /> Ajouter ce module (+{purchasesPrice}€)
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/70 rounded-3xl p-6 md:p-8 border border-dashed border-slate-300 flex flex-col justify-center items-center text-center space-y-3">
            <Building2 size={36} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">Pack Créateur Tout Inclus</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Pour votre 1ère année d'activité, profitez de la gratuité complète du socle Essentiel et ajoutez des packs à l'unité selon vos besoins.
            </p>
          </div>
        )}

        {/* CARTE 3 : MODULE VENTES */}
        {segment !== 'creator' ? (
          <div className={`rounded-3xl p-6 md:p-8 border-2 shadow-sm flex flex-col justify-between transition-all ${
            hasSalesModule 
              ? 'bg-blue-50/50 border-blue-500 shadow-blue-500/10' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Encaissements Clients</div>
                <h3 className="text-2xl font-black text-slate-900">Module Ventes</h3>
                <p className="text-xs text-slate-500 mt-1">Gérez vos devis et factures, réduisez vos délais d'encaissement.</p>
              </div>

              <div className="py-3 border-y border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">+{salesPrice} €</span>
                  <span className="text-xs text-slate-500 font-semibold">/mois HT</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                {current.salesFeatures?.map((feat, idx) => {
                  const [boldPart, rest] = feat.split(' : ');
                  return (
                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                      <Check size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                      <span><strong>{boldPart}</strong> {rest ? `: ${rest}` : ''}</span>
                    </div>
                  );
                })}
              </div>

              {'salesBonus' in current && (
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-purple-600" /> Offre de bienvenue
                  </div>
                  <div className="text-purple-700 text-[11px]">• {current.salesBonus}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setHasSalesModule(!hasSalesModule)}
              className={`w-full mt-6 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                hasSalesModule 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-600'
              }`}
            >
              {hasSalesModule ? (
                <>
                  <Check size={16} /> Module sélectionné
                </>
              ) : (
                <>
                  <Plus size={16} /> Ajouter ce module (+{salesPrice}€)
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/70 rounded-3xl p-6 md:p-8 border border-dashed border-slate-300 flex flex-col justify-center items-center text-center space-y-3">
            <Zap size={36} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Assistance Démarrage Rapide</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Accompagnement personnalisé par nos spécialistes pour paramétrer vos modèles de devis et connecter votre compte bancaire.
            </p>
          </div>
        )}
      </div>

      {/* BANDEAU RÉCAPITULATIF / TOTAL MENSUEL */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Votre configuration sur-mesure</div>
          <div className="text-xl font-bold mt-1">
            Formule {current.name} {hasPurchasesModule && '+ Achats'} {hasSalesModule && '+ Ventes'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            15 jours d'essai gratuit • Sans engagement • Facturation {billingPeriod === 'yearly' ? 'annuelle (-10%)' : 'mensuelle'}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total estimé</div>
            <div className="text-3xl font-black text-white">{totalPrice.toFixed(2)} € <span className="text-sm font-normal text-slate-400">HT/mois</span></div>
          </div>
          <button 
            type="button" 
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 hover:scale-105"
          >
            Démarrer l'essai gratuit <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* PACKS ADDITIONNELS (À LA CARTE) */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <Layers size={14} /> Options flexibles
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Des packs additionnels pour aller plus loin</h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Personnalisez votre forfait avec des packs additionnels et accédez à des fonctionnalités de pointe sans surcoût d'abonnement fixe.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Pack 1 : Multi-entreprises */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Gestion Multi-Entreprises</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gérez toutes vos entités et filiales depuis un seul espace centralisé.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                <div>• Un seul accès pour tout piloter</div>
                <div>• Gestion des flux unifiée</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Dès</span>
              <span className="text-sm font-bold text-slate-900">5 € HT / entité / mois</span>
            </div>
          </div>

          {/* Pack 2 : Vérification IBAN */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Bouclier Anti-Fraude IBAN</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vérifiez automatiquement l'identité bancaire de vos fournisseurs (Norme CAPS).
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                <div>• Réduction du risque de fraude</div>
                <div>• Contrôle certifié SEPA / RIB</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">À partir de</span>
              <span className="text-sm font-bold text-slate-900">8 € HT / 10 vérifs</span>
            </div>
          </div>

          {/* Pack 3 : Signature Électronique */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Signature Électronique</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Faites signer vos devis et contrats en ligne en quelques secondes (eIDAS).
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                <div>• Procédure légale & sécurisée</div>
                <div>• Accélération des encaissements</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">À partir de</span>
              <span className="text-sm font-bold text-slate-900">9 € HT / 10 signatures</span>
            </div>
          </div>

          {/* Pack 4 : Paiement Simplifié */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Paiements 1-Clic</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Réglez vos factures fournisseurs directement via Open Banking Bridge.
              </p>
              <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                <div>• Virement direct sans ressaisie</div>
                <div>• Rapprochement automatique</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">À partir de</span>
              <span className="text-sm font-bold text-slate-900">3 € HT / 10 paiements</span>
            </div>
          </div>

        </div>
      </div>

      {/* MATRICE DÉTAILLÉE DES FONCTIONNALITÉS (ACCORDIONS) */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Détail exhaustif des fonctionnalités</h2>
          <p className="text-sm text-slate-500">Comparez en profondeur tout ce qui est inclus dans chaque brique</p>
        </div>

        <div className="space-y-4">
          
          {/* Section 1 : Essentiel */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleFeatureAccordion('essential')}
              className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Layers size={18} /></div>
                <span>Fonctionnalités du Module Essentiel (Inclus de base)</span>
              </div>
              {expandedFeatures.essential ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {expandedFeatures.essential && (
              <div className="p-6 border-t border-slate-100 grid md:grid-cols-2 gap-6 bg-slate-50/50 text-xs text-slate-700">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> Achats & Numérisation
                  </div>
                  <div>• Import PDF direct et scan mobile avec détection automatique OCR.</div>
                  <div>• Alertes intelligentes de proximité d'échéance.</div>
                  <div>• Détection automatique des doublons de facturation.</div>
                  <div>• Fiches fournisseurs unifiées avec historique.</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> Ventes & E-Invoicing
                  </div>
                  <div>• Facturation électronique 2026 (Factur-X, UBL, CII).</div>
                  <div>• Personnalisation complète avec logo et charte graphique.</div>
                  <div>• Suivi des statuts (Déposée, Reçue, Rejetée, Encaissée).</div>
                  <div>• Journal d'audit transparent de toutes les actions.</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> Banque & Pré-comptabilité
                  </div>
                  <div>• Connexion Open Banking sécurisée à l'ensemble de vos banques pro.</div>
                  <div>• Graphique d'évolution des flux de trésorerie en temps réel.</div>
                  <div>• Export comptable multi-formats : FEC, XLS, CSV et PDF.</div>
                  <div>• Association automatique des factures aux lignes bancaires.</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-blue-500" /> Classeur Intelligent IA
                  </div>
                  <div>• Archivage de tous vos documents administratifs (k-bis, statuts, contrats).</div>
                  <div>• Classement automatique et recherche plein texte (Full-Text Search).</div>
                  <div>• Coffre-fort numérique conforme aux exigences légales.</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2 : Achats */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleFeatureAccordion('purchases')}
              className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CreditCard size={18} /></div>
                <span>Fonctionnalités Avancées du Module Achats</span>
              </div>
              {expandedFeatures.purchases ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {expandedFeatures.purchases && (
              <div className="p-6 border-t border-slate-100 grid md:grid-cols-2 gap-6 bg-slate-50/50 text-xs text-slate-700">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm mb-2">Collecte Automatisée</div>
                  <div>• Connecteurs portails fournisseurs : Orange, SFR, EDF, TotalEnergies, etc.</div>
                  <div>• Boîte email dédiée pour transférer les factures en pièce jointe.</div>
                  <div>• Récupération sans aucune intervention manuelle.</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm mb-2">Paiements & Anti-Fraude</div>
                  <div>• Paiement par virement SEPA en 1 clic sans ressaisie d'IBAN.</div>
                  <div>• Émission de virements groupés par fichier XML standard européen.</div>
                  <div>• Vérification systématique du nom du titulaire et de l'IBAN fournisseur.</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3 : Ventes */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleFeatureAccordion('sales')}
              className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><FileCheck size={18} /></div>
                <span>Fonctionnalités Avancées du Module Ventes</span>
              </div>
              {expandedFeatures.sales ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>

            {expandedFeatures.sales && (
              <div className="p-6 border-t border-slate-100 grid md:grid-cols-2 gap-6 bg-slate-50/50 text-xs text-slate-700">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm mb-2">Cycle Commercial & Devis</div>
                  <div>• Signature électronique conforme eIDAS intégrée directement dans le devis.</div>
                  <div>• Transformation instantanée d'un devis accepté en facture Factur-X.</div>
                  <div>• Envoi depuis votre propre adresse professionnelle (Google Workspace / M365).</div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 text-sm mb-2">Paiement en ligne & Relances</div>
                  <div>• Bouton de paiement Carte Bancaire / Prélèvement SEPA sur la facture.</div>
                  <div>• Scénarios de relance automatique (J-3, J+0, J+7, J+15).</div>
                  <div>• Synchronisation bidirectionnelle avec vos outils CRM et comptables.</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FAQ INTERACTIVE */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <HelpCircle size={14} /> Réponses aux questions
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Les questions qu'on nous pose souvent</h2>
        </div>

        <div className="space-y-3 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors text-sm"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CALL TO ACTION FINAL */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12 space-y-4 shadow-xl">
        <h2 className="text-2xl md:text-3xl font-black">
          La facturation électronique est là !
        </h2>
        <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto">
          IT4ALL et MDIV Business vous accompagnent pour une mise en conformité simple, rapide et sans surcoût.
        </p>
        <div className="pt-2">
          <button 
            type="button" 
            className="px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-black rounded-xl shadow-lg transition-all hover:scale-105"
          >
            Me mettre en conformité (15 jours offerts)
          </button>
        </div>
      </div>

    </div>
  );
};
