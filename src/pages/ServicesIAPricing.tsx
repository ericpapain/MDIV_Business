import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Tag as TagIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { FintechPricingTab } from '@/components/fintech/FintechPricingTab';

export default function ServicesIAPricing() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="ia-page min-h-screen pt-32 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/services-ia" 
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
            >
              <ArrowLeft size={16} /> {isEn ? "Back to AI Services" : "Retour aux Services IA"}
            </Link>
            <Link 
              to="/services-ia/factures" 
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-semibold transition-colors"
            >
              Ouvrir l'Espace Facturation & Suite FinTech ➔
            </Link>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold transition-colors"
            title="Actualiser"
          >
            <RefreshCcw size={16} /> {isEn ? "Refresh" : "Actualiser"}
          </button>
        </div>

        {/* Composant Grille Tarifaire Complète IT4ALL */}
        <FintechPricingTab />

      </div>
    </div>
  );
}
