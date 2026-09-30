import React from 'react';
import { DocumentSummaryReport, exportDocumentSummary } from '@/lib/summarizerService';
import { 
  FileText, Download, Clock, Zap, Target, AlertTriangle, 
  CheckCircle2, ArrowRight, Users, Copy, BookOpen, Layers, 
  Activity, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  report: DocumentSummaryReport;
}

export function DocumentSummaryView({ report }: Props) {
  const getModeLabel = (mode: string) => {
    switch(mode) {
      case 'express': return 'Résumé Express (10 lignes)';
      case 'standard': return 'Résumé Standard';
      case 'detailed': return 'Analyse Détaillée';
      case 'direction': return 'Synthèse Direction';
      case 'comex': return 'Synthèse Comité Exécutif';
      default: return 'Résumé IA';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Rapport: ${report.documentName}\n\n${report.executiveSummary}`);
    toast.success('Résumé copié dans le presse-papier');
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ia-animate-in">
      {/* Header Premium */}
      <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 60%)' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
              <FileText size={16} /> Document IA • {getModeLabel(report.mode)}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{report.documentName}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <BookOpen size={16} className="text-blue-400" /> Lisibilité: {report.kpis.readabilityScore}/100
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <Layers size={16} className="text-emerald-400" /> {report.kpis.pageCount} Pages analysées
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                <Clock size={16} className="text-purple-400" /> Gain de temps: {report.kpis.estimatedTimeSavedMinutes} min
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-semibold">
              <Copy size={16} /> Copier
            </button>
            <button onClick={() => exportDocumentSummary(report.id, 'pdf')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500 transition-colors text-sm font-semibold shadow-lg shadow-blue-900/50">
              <Download size={16} /> PDF
            </button>
            <button onClick={() => exportDocumentSummary(report.id, 'docx')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 transition-colors text-sm font-semibold shadow-lg shadow-indigo-900/50">
              <Download size={16} /> Word
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        
        {/* Synthèse principale */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-blue-600" /> Synthèse Exécutive
          </h3>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium text-lg shadow-sm">
            {report.executiveSummary}
          </div>
        </section>

        {/* Mots-clés & Concepts (Tags) */}
        {(report.keywords.length > 0 || report.majorConcepts.length > 0) && (
          <section className="flex flex-col md:flex-row gap-6">
            {report.keywords.length > 0 && (
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mots-clés</h3>
                <div className="flex flex-wrap gap-2">
                  {report.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {report.majorConcepts.length > 0 && (
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Concepts Majeurs</h3>
                <div className="flex flex-wrap gap-2">
                  {report.majorConcepts.map((concept, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Grille : Objectifs / Points clés */}
        <section className="grid md:grid-cols-2 gap-8">
          {report.objectives.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-emerald-600" /> Objectifs identifiés
              </h3>
              <ul className="space-y-3">
                {report.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                    <Target size={16} className="text-emerald-500 shrink-0 mt-0.5" /> 
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {report.keyPoints.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" /> Points Clés
              </h3>
              <ul className="space-y-3">
                {report.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <ArrowRight size={16} className="text-blue-500 shrink-0 mt-0.5" /> 
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Décisions & Échéances */}
        {(report.decisions.length > 0 || report.deadlines.length > 0) && (
          <section className="grid md:grid-cols-2 gap-8">
            {report.decisions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-indigo-600" /> Décisions Importantes
                </h3>
                <div className="space-y-2">
                  {report.decisions.map((dec, i) => (
                    <div key={i} className="p-3 border-l-2 border-indigo-500 bg-slate-50 text-sm font-medium text-slate-800">
                      {dec}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {report.deadlines.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-amber-600" /> Échéances
                </h3>
                <div className="flex flex-wrap gap-3">
                  {report.deadlines.map((dl, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 font-bold text-sm border border-amber-200">
                      <Clock size={14} /> {dl}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Actions recommandées */}
        {report.recommendedActions.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-purple-600" /> Actions Recommandées
            </h3>
            <div className="grid gap-3">
              {report.recommendedActions.map((act, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold text-sm">{i + 1}</div>
                  <div>
                    <div className="font-bold text-slate-800">{act.action}</div>
                    {act.context && <div className="text-sm text-slate-500 mt-1 font-medium">{act.context}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Risques */}
        {report.risks.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Risques identifiés
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {report.risks.map((risk, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <div className="font-bold text-red-900 text-sm leading-relaxed">{risk}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Parties prenantes */}
        {report.stakeholders.length > 0 && (
          <section className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users size={16} /> Parties Prenantes
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.stakeholders.map((person, idx) => (
                <span key={idx} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200">
                  {person}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Encart Commercial (Copilot / Gestion Doc) */}
        <section className="mt-12">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 md:p-10 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             {/* Abstract background shapes */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
             
             <div className="relative z-10 flex-1">
               <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-widest text-xs mb-3">
                 <Sparkles size={14} /> Intelligence Artificielle d'Entreprise
               </div>
               <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                 Rendez tout votre patrimoine documentaire intelligent
               </h3>
               <p className="text-blue-100/80 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
                 Ce résumé démontre la puissance de l'IA sur un document unique. Imaginez cette capacité connectée à tous vos fichiers (OneDrive, SharePoint) via <strong>Microsoft 365 Copilot</strong> ou nos <strong>Agents IA sur-mesure</strong> pour automatiser votre gestion des connaissances.
               </p>
             </div>
             
             <div className="relative z-10 shrink-0">
               <button className="px-8 py-4 bg-white text-indigo-900 hover:bg-slate-50 font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                 Découvrir l'Audit IA
               </button>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
