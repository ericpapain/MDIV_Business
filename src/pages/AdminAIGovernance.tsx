import React, { useState } from 'react';
import { Settings, Zap, BrainCircuit, Activity, DollarSign, Target, Shield, CheckCircle2, Lock } from 'lucide-react';
import { hasFeatureAccess } from '@/lib/planLimitsService';

const AI_PROVIDERS = ['OpenAI', 'Mistral', 'Groq'];
const AI_MODELS = [
  { id: 'gpt-6-astra', name: 'GPT-6 Astra', provider: 'OpenAI', specialty: 'Raisonnement Complexe & Fusion' },
  { id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol', provider: 'OpenAI', specialty: 'Performance Équilibrée' },
  { id: 'gpt-6-luna', name: 'GPT-6 Luna', provider: 'OpenAI', specialty: 'Tâches de Volume Rapides' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', specialty: 'Vitesse & RAG' },
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral', specialty: 'Synthèse & Français Natif' }
];

const APPS = [
  { key: 'leads_generator', name: 'Générateur de Leads IA' },
  { key: 'ocr_extractor', name: 'Extracteur OCR Factures' },
  { key: 'diagnostic', name: 'Diagnostic Express' },
  { key: 'meeting_prep', name: 'Préparation de Réunion' },
  { key: 'email_analyze', name: 'Analyseur d\'Emails' },
  { key: 'rag_chatbot', name: 'Chatbot Documentaire RAG' }
];

export default function AdminAIGovernance() {
  const [activeTab, setActiveTab] = useState<'providers' | 'apps' | 'logs'>('apps');
  const { allowed } = hasFeatureAccess('admin_ai_governance');

  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 pt-32 flex flex-col items-center justify-center text-center">
        <Lock size={64} className="text-slate-300 mb-6" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Accès Restreint</h1>
        <p className="text-slate-500 max-w-md">Le Plan PME est requis pour accéder à la Gouvernance Multi-LLM et piloter la flotte de modèles IA.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-32">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-[#020617] mb-2 flex items-center gap-3">
            <BrainCircuit className="text-gold" size={32} />
            Gouvernance Multi-LLM (Hub IA)
          </h1>
          <p className="text-slate-600">Pilotez la flotte de modèles IA, configurez le mode "Challenge", et surveillez les coûts d'inférence en temps réel.</p>
        </header>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <DollarSign size={18} /> Coût Mensuel
            </div>
            <div className="text-3xl font-bold text-[#020617]">$124.50</div>
            <div className="text-xs text-emerald-500 mt-2 font-medium">-12% vs mois dernier</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Activity size={18} /> Temps de Rép. Moyen
            </div>
            <div className="text-3xl font-bold text-[#020617]">850ms</div>
            <div className="text-xs text-blue-500 mt-2 font-medium">Parallélisation active</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Target size={18} /> Taux de Victoire (Challenge)
            </div>
            <div className="text-sm font-bold text-[#020617]">GPT-6 Astra (45%)</div>
            <div className="text-xs text-slate-500 mt-2 font-medium">Mixtral (35%), Mistral (20%)</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 mb-2">
              <Shield size={18} /> Taux de Fusion
            </div>
            <div className="text-3xl font-bold text-[#020617]">18%</div>
            <div className="text-xs text-slate-500 mt-2 font-medium">des requêtes critiques</div>
          </div>
        </div>

        {/* Configuration par App */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-[#020617]">Configuration des Applications IA</h2>
            <button className="px-4 py-2 bg-[#020617] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              Sauvegarder
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {APPS.map((app) => (
              <div key={app.key} className="p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                <div className="w-full lg:w-1/4">
                  <h3 className="font-bold text-[#020617] mb-1">{app.name}</h3>
                  <p className="text-xs text-slate-500">ID: {app.key}</p>
                </div>
                
                <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Niveau d'intelligence */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-2">Niveau (Nb Modèles)</label>
                    <select className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <option value="Standard">Standard (1 modèle)</option>
                      <option value="Advanced">Advanced (2 modèles)</option>
                      <option value="Expert">Expert (3 modèles)</option>
                      <option value="Research">Research (Fusion)</option>
                    </select>
                  </div>

                  {/* Mode d'Exécution */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-2">Mode d'Exécution</label>
                    <select className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50">
                      <option value="Single">Single (Rapide)</option>
                      <option value="Challenge">Multi-Model Challenge (Scoring)</option>
                      <option value="Fusion">Response Fusion (Synthèse)</option>
                    </select>
                  </div>

                  {/* Poids de Scoring */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase mb-2">Pondération du Scoring</label>
                    <div className="flex gap-2">
                      <input type="text" defaultValue="30/30/20/20" className="w-full text-sm border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center" title="Confiance / Raisonnement / Exhaustivité / Qualité" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
