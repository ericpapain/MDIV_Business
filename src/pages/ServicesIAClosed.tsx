// src/pages/ServicesIAClosed.tsx - Page de fermeture / maintenance des Services IA
import { Link } from "react-router-dom";
import { Lock, ArrowLeft, Mail, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ServicesIAClosed() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 bg-[#020c1b] relative overflow-hidden">
      {/* Halos de lumière dorée & cyan */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-2xl bg-[#071526]/90 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-center">
        {/* Icône de cadenas & maintenance */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-black/50 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-6 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
          <Lock size={28} className="animate-pulse" />
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert size={13} />
          <span>Section Temporairement Fermée</span>
        </div>

        {/* Titre principal */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Pôle Solutions & Services IA
        </h1>

        {/* Texte descriptif */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
          L'accès public aux applications d'intelligence artificielle et aux outils décisionnels est actuellement fermé.
          Nos équipes procèdent à la mise à niveau des infrastructures de traitement et à l'intégration des protocoles sécurisés.
        </p>

        {/* Encadré d'information */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left mb-8 flex items-start gap-3">
          <AlertCircle size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-white">Accès Réservé & Sessions Privées</div>
            <div>
              Les démonstrations et déploiements personnalisés restent accessibles exclusivement sur demande ou lors des missions économiques et séjours immersifs BNE.
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#e5be48] text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Retour au Site Principal</span>
          </Link>

          <Link
            to="/contact?subject=Renseignements Services IA"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Mail size={14} />
            <span>Demande de Renseignements</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
