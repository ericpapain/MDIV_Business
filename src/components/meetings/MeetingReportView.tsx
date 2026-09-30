import React from 'react';
import { MeetingReport, exportMeetingReport } from '@/lib/meetingReportService';
import { FileText, Download, Clock, Users, Target, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface Props {
  report: MeetingReport;
}

export function MeetingReportView({ report }: Props) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'done': return 'Terminé';
      case 'in_progress': return 'En cours';
      default: return 'À faire';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ia-animate-in">
      {/* Header */}
      <div className="bg-slate-900 text-white p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #2563eb 0%, transparent 60%)' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
              <FileText size={16} /> Compte-rendu de Réunion
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{report.subject}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {report.date}</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-slate-400" /> {report.participants.length} Participants</span>
            </div>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button onClick={() => exportMeetingReport(report.id, 'pdf')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-semibold">
              <Download size={16} /> PDF
            </button>
            <button onClick={() => exportMeetingReport(report.id, 'docx')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500 transition-colors text-sm font-semibold shadow-lg shadow-blue-900/50">
              <Download size={16} /> Word
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        
        {/* Synthèse Exécutive */}
        <section>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" /> Synthèse Exécutive
          </h3>
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-slate-700 leading-relaxed font-medium">
            {report.executiveSummary}
          </div>
        </section>

        {/* Ordre du jour & Participants */}
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ordre du jour</h3>
            <ul className="space-y-2">
              {report.agenda.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                  <span className="text-blue-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {report.participants.map((person, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                  {person}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Décisions */}
        {report.decisions && report.decisions.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" /> Décisions Actées
            </h3>
            <div className="grid gap-3">
              {report.decisions.map((dec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
                  <div>
                    <div className="font-bold text-slate-800">{dec.decision}</div>
                    {dec.context && <div className="text-sm text-slate-500 mt-1">{dec.context}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions à réaliser */}
        {report.actions && report.actions.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowRight size={20} className="text-blue-600" /> Actions à Réaliser
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-sm font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4 font-bold">Tâche</th>
                    <th className="py-3 px-4 font-bold">Responsable</th>
                    <th className="py-3 px-4 font-bold">Échéance</th>
                    <th className="py-3 px-4 font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {report.actions.map((act, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-semibold text-slate-800">{act.task}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">{act.assignee}</span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">{act.deadline}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(act.status)}`}>
                          {getStatusLabel(act.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Risques */}
        {report.risks && report.risks.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" /> Risques & Points Bloquants
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {report.risks.map((risk, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-red-900">{risk.risk}</div>
                    <div className="text-xs font-bold text-red-500 uppercase mt-1">Impact : {risk.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Encart Commercial (Copilot / IA) */}
        <section className="mt-8">
          <div className="ia-gradient-hero p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
             
             <div className="relative z-10 flex-1">
               <div className="flex items-center gap-2 text-blue-200 font-bold uppercase tracking-wider text-xs mb-2">
                 <Zap size={14} /> Automatisation Documentaire
               </div>
               <h3 className="text-2xl font-bold mb-2">Passez à la vitesse supérieure avec Microsoft 365 Copilot</h3>
               <p className="text-blue-100 font-medium text-sm max-w-xl">
                 Vos réunions sont déjà transformées en actions. Allez plus loin en déployant Copilot pour vos équipes et nos Agents IA sur-mesure pour automatiser l'intégralité de votre Digital Workplace.
               </p>
             </div>
             
             <div className="relative z-10 shrink-0">
               <button className="px-6 py-3 bg-white text-blue-700 hover:bg-slate-50 font-bold rounded-xl shadow-lg transition-colors">
                 Découvrir nos offres IA
               </button>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
