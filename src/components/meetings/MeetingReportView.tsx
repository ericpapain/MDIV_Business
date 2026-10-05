import React from 'react';
import { MeetingReport, exportMeetingReport } from '@/lib/meetingReportService';
import { FileText, Download, Clock, Users, Target, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { SectionDeepDive } from '@/components/common/SectionDeepDive';

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
            <button onClick={() => exportMeetingReport(report, 'pdf')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm font-semibold">
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
        <section className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Target size={20} className="text-blue-600" /> Synthèse Exécutive
          </h3>
          <div className="p-5 bg-white rounded-xl border border-blue-100 text-slate-800 leading-relaxed font-semibold">
            {report.executiveSummary}
          </div>

          <SectionDeepDive
            sectionTitle="Synthèse Exécutive de la Réunion"
            sectionContent={report.executiveSummary}
            toolType="Compte-rendu & Gestion de Réunion"
            placeholder="Approfondir la synthèse (ex: faire ressortir les arbitrages de gouvernance...)"
            suggestedQuestions={[
              'Résumer les 3 enseignements stratégiques majeurs',
              'Formuler une note de cadrage pour la Direction Générale',
              'Détailler les impacts sur le planning global'
            ]}
          />
        </section>

        {/* Ordre du jour & Participants */}
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Ordre du jour</h3>
            <ul className="space-y-2">
              {report.agenda.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-slate-800">
                  <span className="text-blue-600 mt-0.5 font-bold">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Participants</h3>
            <div className="flex flex-wrap gap-2">
              {report.participants.map((person, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200">
                  {person}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Décisions */}
        {report.decisions && report.decisions.length > 0 && (
          <section className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" /> Décisions Actées
            </h3>
            <div className="grid gap-3">
              {report.decisions.map((dec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">{idx + 1}</div>
                  <div>
                    <div className="font-bold text-slate-900">{dec.decision}</div>
                    {dec.context && <div className="text-sm font-medium text-slate-600 mt-1">{dec.context}</div>}
                  </div>
                </div>
              ))}
            </div>

            <SectionDeepDive
              sectionTitle="Décisions Actées"
              sectionContent={report.decisions}
              toolType="Gouvernance & Décisions de Réunion"
              placeholder="Approfondir une décision (ex: comment sécuriser la décision 1 ?)"
              suggestedQuestions={[
                'Rédiger un plan de communication interne pour ces décisions',
                'Identifier les conditions suspensives ou préalables à valider'
              ]}
            />
          </section>
        )}

        {/* Actions à réaliser */}
        {report.actions && report.actions.length > 0 && (
          <section className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowRight size={20} className="text-blue-600" /> Actions & Livrables Assignés
            </h3>
            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs font-bold text-slate-900 uppercase">
                    <th className="py-3 px-4 font-bold">Tâche</th>
                    <th className="py-3 px-4 font-bold">Responsable</th>
                    <th className="py-3 px-4 font-bold">Échéance</th>
                    <th className="py-3 px-4 font-bold">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {report.actions.map((act, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-900">{act.task}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">{act.assignee}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 text-xs">{act.deadline}</td>
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

            <SectionDeepDive
              sectionTitle="Plan d'Actions & Responsabilités"
              sectionContent={report.actions}
              toolType="Pilotage Opérationnel"
              placeholder="Approfondir les actions (ex: décomposer la tâche 1 en sous-tâches concrètes...)"
              suggestedQuestions={[
                'Découper les actions complexes en jalons hebdomadaires',
                'Estimer la charge de travail en jours/homme par responsable',
                'Identifier les dépendances critiques entre les tâches'
              ]}
            />
          </section>
        )}

        {/* Risques */}
        {report.risks && report.risks.length > 0 && (
          <section className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" /> Risques & Points de Vigilance
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {report.risks.map((risk, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-red-200 bg-red-50/70 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-red-950">{risk.risk}</div>
                    <div className="text-xs font-bold text-red-700 uppercase mt-1">Impact : {risk.impact}</div>
                  </div>
                </div>
              ))}
            </div>

            <SectionDeepDive
              sectionTitle="Risques & Points de Vigilance"
              sectionContent={report.risks}
              toolType="Gestion des Risques & Conformité"
              placeholder="Approfondir un risque (ex: proposer un plan de contingence pour le risque 1...)"
              suggestedQuestions={[
                'Proposer un plan d’atténuation immédiat pour chaque risque',
                'Chiffrer le coût potentiel en cas de réalisation du risque',
                'Désigner les indicateurs d’alerte précoce à surveiller'
              ]}
            />
          </section>
        )}

      </div>
    </div>
  );
}
