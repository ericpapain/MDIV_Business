import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Receipt, BarChart3, FolderArchive,
  ChevronLeft, ChevronRight, ShieldCheck, Briefcase, Palette, CheckCircle2, FileText
} from 'lucide-react';

export type VibrantThemeKey = 'orange' | 'emerald' | 'amber' | 'coral' | 'blue' | 'slate' | 'purple';

export interface VibrantThemeConfig {
  id: VibrantThemeKey;
  label: string;
  dotHex: string;
  gradient: string;
  badgeBg: string;
  subtextColor: string;
}

export const VIBRANT_THEMES: Record<VibrantThemeKey, VibrantThemeConfig> = {
  orange: {
    id: 'orange',
    label: 'Orange Vif & Mandarine',
    dotHex: '#F97316',
    gradient: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #FB923C 100%)',
    badgeBg: 'bg-white text-orange-950',
    subtextColor: 'text-orange-50/95',
  },
  emerald: {
    id: 'emerald',
    label: 'Vert Émeraude Vif',
    dotHex: '#10B981',
    gradient: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
    badgeBg: 'bg-white text-emerald-950',
    subtextColor: 'text-emerald-50/95',
  },
  amber: {
    id: 'amber',
    label: 'Safran & Ocre Solaire',
    dotHex: '#F59E0B',
    gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 50%, #F59E0B 100%)',
    badgeBg: 'bg-white text-amber-950',
    subtextColor: 'text-amber-50/95',
  },
  coral: {
    id: 'coral',
    label: 'Corail & Écarlate Vif',
    dotHex: '#F43F5E',
    gradient: 'linear-gradient(135deg, #9F1239 0%, #E11D48 50%, #FB7185 100%)',
    badgeBg: 'bg-white text-rose-950',
    subtextColor: 'text-rose-50/95',
  },
  blue: {
    id: 'blue',
    label: 'Bleu Royal & Cobalt Éclatant',
    dotHex: '#2563EB',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #38BDF8 100%)',
    badgeBg: 'bg-white text-blue-950',
    subtextColor: 'text-blue-50/95',
  },
  slate: {
    id: 'slate',
    label: 'Gris Titane & Ardoise Élégant',
    dotHex: '#64748B',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #64748B 100%)',
    badgeBg: 'bg-white text-slate-950',
    subtextColor: 'text-slate-100/95',
  },
  purple: {
    id: 'purple',
    label: 'Violet Impérial & Améthyste',
    dotHex: '#9333EA',
    gradient: 'linear-gradient(135deg, #581C87 0%, #7E22CE 50%, #C084FC 100%)',
    badgeBg: 'bg-white text-purple-950',
    subtextColor: 'text-purple-50/95',
  }
};

interface CarouselSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  renderMockup: () => React.ReactNode;
}

export const AuthRightColumn: React.FC = () => {
  // Thème stocké dans localStorage pour cohérence entre /login et /register
  const [vibrantTheme, setVibrantTheme] = useState<VibrantThemeKey>(() => {
    const saved = localStorage.getItem('it4work_auth_vibrant_theme') as VibrantThemeKey;
    return saved && VIBRANT_THEMES[saved] ? saved : 'orange';
  });

  const handleThemeChange = (key: VibrantThemeKey) => {
    setVibrantTheme(key);
    localStorage.setItem('it4work_auth_vibrant_theme', key);
  };

  const currentTheme = VIBRANT_THEMES[vibrantTheme];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ── Slides de présentation de l'écosystème IT4WORK ─────────────────────────
  // Strictement sans termes AI / Intelligence artificielle / Machine Learning / Algorithme
  const slides: CarouselSlide[] = [
    {
      id: 'crm',
      badge: 'Relation Client & Ventes',
      title: 'CRM IT4WORK',
      description: 'Centralisez vos clients, devis et échanges dans un seul espace pour gagner du temps au quotidien.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Répertoire Clients & Chantiers</span>
                <span className="text-[11px] text-slate-500 font-medium">128 contacts synchronisés</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              En direct
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  LE
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Laurent Électricité</div>
                  <div className="text-[11px] text-slate-500">Chantier Paris 11e · Devis D-042</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                Devis signé (4 200 €)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                  ST
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">SCI Les Terrasses</div>
                  <div className="text-[11px] text-slate-500">Rénovation globale · Relance effectuée</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                En attente (1 850 €)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  CD
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">Cabinet Médical Durand</div>
                  <div className="text-[11px] text-slate-500">Maintenance annuelle contrat pro</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                Contrat actif
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>💡 Relance client programmée pour demain</span>
            <span className="text-blue-700 font-bold">128 contacts actifs →</span>
          </div>
        </div>
      )
    },
    {
      id: 'planning',
      badge: 'Planning & Terrain',
      title: 'Gestion des interventions',
      description: 'Organisez vos journées d’équipe et chantiers avec un suivi en direct accessible sur mobile et ordinateur.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Calendar size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Planning d'Aujourd'hui</span>
                <span className="text-[11px] text-slate-500 font-medium">3 équipes sur le terrain</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
              100% à l'heure
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-emerald-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">08:30 - 11:30</span>
                  <span className="text-[11px] font-bold text-slate-500">Terminé</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Remplacement ballon d'eau · M. Petit</div>
                <div className="text-[11px] text-slate-500">Troyes centre · 2 techniciens</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                Validé client
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-blue-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">13:30 - 16:00</span>
                  <span className="text-[11px] font-bold text-blue-600">En cours</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Pose pompe à chaleur · Mme Girard</div>
                <div className="text-[11px] text-slate-500">Sainte-Savine · Matériel livré</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                Sur place
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-l-amber-500 border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">16:30 - 18:00</span>
                  <span className="text-[11px] font-bold text-slate-500">Prévu</span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs">Visite technique & métré · Résidence Parc</div>
                <div className="text-[11px] text-slate-500">Rendez-vous confirmé par SMS</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[11px]">
                Marc D.
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>📍 Trajets optimisés pour limiter le carburant</span>
            <span className="text-blue-700 font-bold">Ouvrir la carte →</span>
          </div>
        </div>
      )
    },
    {
      id: 'facturation',
      badge: 'Factur-X & PPF 2026',
      title: 'Facturation',
      description: 'Créez vos devis et factures rapidement tout en gardant une vision claire de votre activité.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Receipt size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Facture F-2026-0042</span>
                <span className="text-[11px] text-slate-500 font-medium">Norme Factur-X EN 16931</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              Conforme PPF 2026
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 mb-3 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>Rénovation sanitaire complète</span>
              <span className="font-extrabold text-slate-900">1 950,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>Fournitures certifiées NF & robinetterie</span>
              <span className="font-extrabold text-slate-900">635,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium text-xs">
              <span>TVA réduite (10.0%)</span>
              <span className="font-extrabold text-slate-900">258,50 €</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline font-black">
              <span className="text-slate-900 text-sm">Total TTC</span>
              <span className="text-emerald-700 text-lg font-black">2 843,50 €</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
            <span>Destinataire : SCI Saint-Martin</span>
            <span className="text-emerald-700 font-extrabold">Envoi en 1 clic prêt</span>
          </div>
        </div>
      )
    },
    {
      id: 'activite',
      badge: 'Pilotage Financier',
      title: 'Suivi d\'activité',
      description: 'Visualisez les indicateurs essentiels de votre entreprise depuis un tableau de bord unique.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <BarChart3 size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Tableau de bord de gestion</span>
                <span className="text-[11px] text-slate-500 font-medium">Suivi de trésorerie en temps réel</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              +18.5% ce mois
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-800 block">Chiffre d'affaires</span>
              <span className="text-xl font-black text-slate-900 block mt-0.5">14 850 €</span>
              <span className="text-[10px] text-slate-500 font-semibold">8 devis encaissés</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 block">Déjà encaissé</span>
              <span className="text-xl font-black text-emerald-700 block mt-0.5">11 200 €</span>
              <span className="text-[10px] text-slate-500 font-semibold">Zéro impayé en litige</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Taux de paiement à l'échéance</span>
            <span className="font-black text-slate-900 text-sm">94.2%</span>
          </div>
        </div>
      )
    },
    {
      id: 'ged',
      badge: 'Gestion Documentaire',
      title: 'Documents',
      description: 'Retrouvez facilement les pièces administratives de vos clients et partenaires au même endroit.',
      renderMockup: () => (
        <div className="bg-white text-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.3)] border border-white/90">
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FolderArchive size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">Espace Documentaire</span>
                <span className="text-[11px] text-slate-500 font-medium">Classement automatique par dossier</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
              Coffre sécurisé
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">Attestation_Decennale_2026.pdf</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">À jour</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                <span className="font-bold text-slate-800 text-xs">Contrat_Cadre_Sous-traitance.pdf</span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Signé</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                <span className="font-bold text-slate-800 text-xs">Rapport_Fin_Chantier_Photos.pdf</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">Archivé</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>🔒 Chiffrement AES-256 certifié France</span>
            <span className="text-blue-700 font-bold">Recherche rapide →</span>
          </div>
        </div>
      )
    }
  ];

  // Rotation automatique toutes les 4.5s sauf au survol
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Support des flèches clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const current = slides[currentSlide];

  return (
    <section 
      aria-label="Présentation de l'écosystème IT4WORK"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ background: currentTheme.gradient }}
      className="hidden lg:flex flex-1 h-full relative overflow-hidden text-white flex-col justify-between p-8 xl:p-12 select-none shadow-inner transition-all duration-500"
    >
      {/* Motifs géométriques fins d'ingénierie & d'architecture (pas de flou cyber/AI) */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[32px] border-white/10 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[24px] border-white/10 pointer-events-none" />

      {/* En-tête de la colonne droite */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black text-white shadow-xs">
          <Briefcase size={14} className="text-white" />
          <span>Écosystème Entreprise IT4WORK</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur étendu de 7 nuances vives : Orange, Émeraude, Safran, Corail, Bleu, Gris, Violet */}
          <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25 shadow-xs" title="Changer la couleur d'ambiance">
            <Palette size={12} className="text-white/80 mr-0.5 shrink-0" />
            {(Object.keys(VIBRANT_THEMES) as VibrantThemeKey[]).map((key) => {
              const t = VIBRANT_THEMES[key];
              const isSelected = vibrantTheme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleThemeChange(key)}
                  style={{ backgroundColor: t.dotHex }}
                  className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-white scale-125 shadow-sm' : 'opacity-70 hover:opacity-100 hover:scale-110'
                  }`}
                  title={t.label}
                  aria-label={t.label}
                />
              );
            })}
          </div>

          <div className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full border border-white/25 shrink-0">
            Module {currentSlide + 1} sur {slides.length}
          </div>
        </div>
      </div>

      {/* Zone centrale du carousel : Mockup Blanc Lumineux + Textes */}
      <div className="relative z-10 my-auto py-4 max-w-xl mx-auto w-full">
        <div 
          key={current.id}
          className="animate-in fade-in slide-in-from-right-4 duration-300"
        >
          {/* Tag catégorie du module */}
          <div className="mb-2">
            <span className={`inline-block text-[11px] font-black uppercase tracking-wider ${currentTheme.badgeBg} px-2.5 py-0.5 rounded-md shadow-xs`}>
              {current.badge}
            </span>
          </div>

          {/* Titre du module */}
          <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
            {current.title}
          </h2>

          {/* Description marketing accessible aux artisans et PME */}
          <p className={`text-sm xl:text-base ${currentTheme.subtextColor} font-medium leading-relaxed mb-6 drop-shadow-xs`}>
            {current.description}
          </p>

          {/* Rendu du Mockup Blanc Lumineux haute fidélité */}
          <div className="relative transform hover:scale-[1.01] transition-transform duration-300">
            {current.renderMockup()}
          </div>
        </div>
      </div>

      {/* Pied du carousel : Indicateurs de progression & Contrôles */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/25">
        
        {/* 5 Dots de navigation cliquables */}
        <div className="flex items-center gap-2">
          {slides.map((s, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all cursor-pointer shadow-xs ${
                  isActive 
                    ? 'w-9 bg-white ring-2 ring-black/15' 
                    : 'w-2.5 bg-white/45 hover:bg-white/80'
                }`}
                aria-label={`Aller au module ${index + 1} : ${s.title}`}
              />
            );
          })}
        </div>

        {/* Boutons précédent / suivant & Réassurance */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-white mr-2">
            <ShieldCheck size={16} className="text-white" />
            <span>Hébergé en France · Conforme RGPD</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs hover:scale-105"
              aria-label="Module précédent"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs hover:scale-105"
              aria-label="Module suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
