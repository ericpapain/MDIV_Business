import { motion } from "framer-motion";
import { 
  Building2, TrendingUp, Calculator, DollarSign, Zap, 
  ArrowRight, CheckCircle2, User, Mail, Phone
} from "lucide-react";
import { ROIFormData } from "./roiUtils";

const stepAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -20 },
};

const INPUT_CLASS =
  "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-200";

interface StepProps {
  data: ROIFormData;
  onUpdate: (field: keyof ROIFormData, value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── Step 1 : Company ─────────────────────────────────────────────────────────
export function StepCompany({ data, onUpdate, onNext }: Omit<StepProps, "onBack">) {
  const isValid = data.companyName && data.sector && data.employees && data.country;
  return (
    <motion.div key="step1" {...stepAnim}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Building2 className="text-blue-500" /> Informations de l'entreprise
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Nom de l'entreprise *</label>
          <input
            type="text"
            value={data.companyName}
            onChange={(e) => onUpdate("companyName", e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ex: M.DIV Solutions"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Pays *</label>
          <select
            value={data.country}
            onChange={(e) => onUpdate("country", e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Sélectionner un pays</option>
            <option value="France">France</option>
            <option value="Suisse">Suisse</option>
            <option value="Belgique">Belgique</option>
            <option value="Maroc">Maroc</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Secteur d'activité *</label>
          <select
            value={data.sector}
            onChange={(e) => onUpdate("sector", e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Sélectionner un secteur</option>
            <option value="Immobilier">Immobilier &amp; Construction</option>
            <option value="Finance">Finance &amp; Assurance</option>
            <option value="Santé">Santé</option>
            <option value="Commerce">Commerce &amp; E-commerce</option>
            <option value="Services">Services B2B</option>
            <option value="Industrie">Industrie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Nombre d'employés *</label>
          <select
            value={data.employees}
            onChange={(e) => onUpdate("employees", e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Sélectionner une taille</option>
            <option value="1-10">1 - 10 employés</option>
            <option value="11-50">11 - 50 employés</option>
            <option value="51-250">51 - 250 employés</option>
            <option value="250+">Plus de 250 employés</option>
          </select>
        </div>
      </div>
      <div className="mt-10 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="ia-btn-primary px-8 py-3 disabled:opacity-50"
        >
          Suivant <ArrowRight size={16} className="ml-2 inline" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 2 : Process ─────────────────────────────────────────────────────────
const PROCESSES = [
  "Support client", "Ressources humaines", "Finance", "Marketing",
  "Vente", "Administration", "Production", "Autre",
];

export function StepProcess({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid = !!data.process;
  return (
    <motion.div key="step2" {...stepAnim}>
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <TrendingUp className="text-blue-500" /> Processus concerné
      </h2>
      <p className="text-slate-400 mb-6">
        Quel département ou processus souhaitez-vous analyser pour l'automatisation IA ?
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PROCESSES.map((proc) => (
          <button
            key={proc}
            onClick={() => onUpdate("process", proc)}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 h-24 ${
              data.process === proc
                ? "border-blue-500 bg-blue-500/10 text-blue-400 font-bold"
                : "border-slate-800 bg-slate-900/40 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-300"
            }`}
          >
            {proc}
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="ia-btn-primary px-8 py-3 disabled:opacity-50"
        >
          Suivant <ArrowRight size={16} className="ml-2 inline" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 3 : Metrics ─────────────────────────────────────────────────────────
export function StepMetrics({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid =
    data.employeesTask > 0 &&
    data.hoursPerWeek > 0 &&
    data.avgHourlyRate > 0 &&
    data.aiMonthlyCost >= 0;

  return (
    <motion.div key="step3" {...stepAnim}>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="text-blue-500" /> Calcul des gains ({data.process})
      </h2>
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-semibold flex justify-between">
              <span className="text-slate-300">Employés assignés à cette tâche</span>
              <span className="text-blue-400 font-bold text-lg">{data.employeesTask}</span>
            </label>
            <input
              type="range" min="1" max="100"
              value={data.employeesTask}
              onChange={(e) => onUpdate("employeesTask", parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-4">
            <label className="text-sm font-semibold flex justify-between">
              <span className="text-slate-300">Heures / semaine (par employé)</span>
              <span className="text-blue-400 font-bold text-lg">{data.hoursPerWeek}h</span>
            </label>
            <input
              type="range" min="1" max="40"
              value={data.hoursPerWeek}
              onChange={(e) => onUpdate("hoursPerWeek", parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Coût horaire moyen d'un employé (€)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="number" min="10"
                value={data.avgHourlyRate}
                onChange={(e) => onUpdate("avgHourlyRate", parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">
              Coût mensuel estimé de l'outil IA (€)
            </label>
            <div className="relative">
              <Zap className="absolute left-3 top-3.5 text-slate-500" size={18} />
              <input
                type="number" min="0"
                value={data.aiMonthlyCost}
                onChange={(e) => onUpdate("aiMonthlyCost", parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <label className="text-sm font-semibold flex justify-between items-center">
            <span className="text-slate-300">Estimation du % d'automatisation possible</span>
            <span className="text-emerald-400 font-bold text-2xl bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              {data.automationPercent}%
            </span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Un taux réaliste pour la plupart des processus administratifs se situe entre 30% et 70%.
          </p>
          <input
            type="range" min="5" max="100" step="5"
            value={data.automationPercent}
            onChange={(e) => onUpdate("automationPercent", parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="ia-btn-primary px-8 py-3 disabled:opacity-50"
        >
          Calculer mon ROI <ArrowRight size={16} className="ml-2 inline" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 4 : Lead capture ────────────────────────────────────────────────────
export function StepLead({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid = data.leadName && data.leadEmail && data.leadPhone;
  return (
    <motion.div key="step4" {...stepAnim}>
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Votre analyse est prête !</h2>
        <p className="text-slate-400">
          Pour découvrir vos résultats complets et générer votre rapport détaillé, veuillez renseigner vos coordonnées ci-dessous.
        </p>
      </div>
      <div className="max-w-md mx-auto space-y-4 bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-white/5">
        <div className="relative">
          <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input
            type="text" placeholder="Nom et Prénom"
            value={data.leadName}
            onChange={(e) => onUpdate("leadName", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input
            type="email" placeholder="Adresse Email Professionnelle"
            value={data.leadEmail}
            onChange={(e) => onUpdate("leadEmail", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input
            type="tel" placeholder="Numéro de téléphone"
            value={data.leadPhone}
            onChange={(e) => onUpdate("leadPhone", e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-black/40 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 outline-none transition-all"
          />
        </div>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full ia-btn-primary py-4 mt-6 font-bold text-lg disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          Découvrir mes résultats <ArrowRight size={18} />
        </button>
        <p className="text-xs text-center text-slate-500 mt-4">
          En soumettant ce formulaire, vous acceptez d'être contacté(e) par l'équipe M.DIV pour un suivi personnalisé.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-slate-200 underline"
        >
          Retourner aux paramètres
        </button>
      </div>
    </motion.div>
  );
}
