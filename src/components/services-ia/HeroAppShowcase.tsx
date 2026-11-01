import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Receipt, Clock, Calendar, ShieldCheck, Users, FolderArchive, 
  Mic, Megaphone, BarChart3, ChevronLeft, ChevronRight, Pause, 
  Play, ArrowRight, Check, Sparkles, ExternalLink, FileText, 
  Lock, Camera, Star, AlertCircle
} from "lucide-react";

export interface ShowcaseApp {
  id: string;
  category: string;
  categoryBadge: string;
  title: string;
  miniDescription: string;
  link: string;
  actionLabel: string;
  icon: React.ElementType;
  sidebarLabel: string;
  renderMockup: () => React.ReactNode;
}

export const HeroAppShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const applications: ShowcaseApp[] = [
    // 1. FINANCE & FACTURATION FACTUR-X
    {
      id: "facturation",
      category: "Finance & Trésorerie",
      categoryBadge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      title: "Facturation Factur-X & Devis Chiffrés",
      miniDescription: "Émission instantanée de devis et factures légales Factur-X EN 16931 conformes au Portail Public PPF 2026.",
      link: "/services-ia/factures",
      actionLabel: "Créer un devis Factur-X",
      icon: Receipt,
      sidebarLabel: "Facturation",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Receipt size={16} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs block">Facture F-2026-0042</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Norme légale Factur-X EN 16931</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
              Conforme PPF 2026
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Rénovation sanitaire complète & pose</span>
              <span className="font-extrabold text-slate-900 dark:text-white">1 950,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Fournitures certifiées NF & robinetterie</span>
              <span className="font-extrabold text-slate-900 dark:text-white">635,00 €</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>TVA réduite (10,0%)</span>
              <span className="font-extrabold text-slate-900 dark:text-white">258,50 €</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-black">
              <span className="text-slate-900 dark:text-white text-xs">Total TTC à encaisser</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-base font-black">2 843,50 €</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span>Validation SIREN client</span>
              <span className="font-bold">✓ Luhn valide</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <span>Transmission PPF</span>
              <span className="font-bold">1 clic prêt</span>
            </div>
          </div>
        </div>
      )
    },

    // 2. FINANCE & RELANCES IMPAYÉS
    {
      id: "relances",
      category: "Finance & Trésorerie",
      categoryBadge: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      title: "Relances Automatisées & Trésorerie",
      miniDescription: "Rappels préventifs polis à J-3, relances de retard graduées et mise en demeure sans friction.",
      link: "/services-ia/relances",
      actionLabel: "Activer les relances automatiques",
      icon: Clock,
      sidebarLabel: "Relances",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Encaissé ce mois</span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">4 280 €</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">92% recouvrés</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-semibold">En retard (2 factures)</span>
              <span className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200">1 150 €</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Relance active</span>
            </div>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">SCI Les Terrasses · Facture F-039</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Échéance dépassée de 7 jours · Rénovation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                Relance J+7 envoyée
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">M. Bertrand · Facture F-041</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Échéance dans 3 jours · Peinture</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                Rappel courtois J-3 prêt
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Check size={14} className="shrink-0" />
            <span>Pénalités légales de retard calculées automatiquement conformes Code de Commerce</span>
          </div>
        </div>
      )
    },

    // 3. PRODUCTIVITÉ & PLANNING CHANTIERS
    {
      id: "planning",
      category: "Productivité & Organisation",
      categoryBadge: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      title: "Planning Équipes & Interventions",
      miniDescription: "Attribution des créneaux chantiers, dispatching des équipes sans doublon et géolocalisation.",
      link: "/services-ia/generateur-leads",
      actionLabel: "Organiser mes plannings",
      icon: Calendar,
      sidebarLabel: "Planning",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-xs block">Semaine 42 · 3 équipes sur le terrain</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">12 chantiers programmés</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold border border-blue-200">
              Aujourd'hui
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300 block">08:30 - 12:00</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">Pose tableaux divisionnaires · Équipe A</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">4 rue de la Paix, 75002 Paris</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold text-[10px]">
                En cours
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 block">14:00 - 17:30</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">Raccordement pompe à chaleur · Équipe B</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pavillon Résidentiel, Créteil</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold text-[10px]">
                Planifié
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1">
            <span>📍 Synchronisé avec Google Calendar & Outlook</span>
            <span className="text-blue-700 font-bold">Vue carte active →</span>
          </div>
        </div>
      )
    },

    // 4. AUDIT & DIAGNOSTIC ENTREPRISE
    {
      id: "audit",
      category: "Audit & Stratégie",
      categoryBadge: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      title: "Audit & Diagnostic Entreprise",
      miniDescription: "Bilan personnalisé de votre activité en 3 minutes, calcul d'heures économisables et plan d'action.",
      link: "/services-ia/diagnostic",
      actionLabel: "Faire le diagnostic gratuit",
      icon: ShieldCheck,
      sidebarLabel: "Audit & Bilan",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-800 dark:text-purple-300 uppercase font-bold tracking-wider block">Bilan Certifié</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">Bâtiment & Travaux · Artisan</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-purple-700 dark:text-purple-300">~8h</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">économisées / sem.</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="font-black text-sm text-slate-900 dark:text-white block">6</span>
              <span className="text-slate-500">Modules activés</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 block">3</span>
              <span className="text-emerald-800 dark:text-emerald-300">Automatisations</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="font-black text-sm text-blue-700 dark:text-blue-400 block">100%</span>
              <span className="text-blue-800 dark:text-blue-300">PPF conforme</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Check size={13} strokeWidth={3} />
              <span>Priorité 1 : Factur-X & Archivage légal</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px]">2</span>
              <span>Priorité 2 : Raccourcir le délai de règlement à 14 jours</span>
            </div>
          </div>
        </div>
      )
    },

    // 5. COMMERCIAL & CRM CLIENTS
    {
      id: "crm",
      category: "Commercial & Ventes",
      categoryBadge: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      title: "CRM & Répertoire Chantiers",
      miniDescription: "Fichier clients et historique des devis synchronisés pour un suivi commercial rigoureux et sans perte.",
      link: "/services-ia/dashboard",
      actionLabel: "Ouvrir le CRM",
      icon: Users,
      sidebarLabel: "CRM Clients",
      renderMockup: () => (
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white text-xs">128 contacts synchronisés</span>
            <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">En direct</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">LE</div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Laurent Électricité</span>
                <span className="text-[10px] text-slate-500">Devis D-042 signé</span>
              </div>
            </div>
            <span className="font-black text-emerald-700">4 200 €</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">ST</div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">SCI Les Terrasses</span>
                <span className="text-[10px] text-slate-500">Rénovation · En attente</span>
              </div>
            </div>
            <span className="font-black text-amber-700">1 850 €</span>
          </div>

          <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 text-[10px] flex items-center justify-between">
            <span>Rappels de devis programmés pour demain</span>
            <span className="font-bold">2 actions →</span>
          </div>
        </div>
      )
    },

    // 6. GESTION DOCUMENTAIRE & COFFRE-FORT (GED)
    {
      id: "ged",
      category: "Administratif & Légal",
      categoryBadge: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
      title: "GED & Coffre-Fort Numérique",
      miniDescription: "Centralisation des décennales, attestations, contrats et factures avec archivage chiffré AES-256.",
      link: "/services-ia/dashboard",
      actionLabel: "Accéder au coffre-fort",
      icon: FolderArchive,
      sidebarLabel: "Coffre GED",
      renderMockup: () => (
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white text-xs">Espace Documentaire Sécurisé</span>
            <span className="text-[10px] text-cyan-900 font-extrabold bg-cyan-100 px-2 py-0.5 rounded-full">AES-256</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-blue-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Attestation_Decennale_2026.pdf</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">À jour</span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-amber-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Contrat_Cadre_Sous-traitance.pdf</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Signé</span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-emerald-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">Rapport_Fin_Chantier_Photos.pdf</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">Archivé</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
            <span>🔒 Hébergé en France · Sauvegarde quotidienne</span>
            <span className="text-cyan-700 font-bold">Télécharger tout →</span>
          </div>
        </div>
      )
    },

    // 7. PRODUCTIVITÉ QUOTIDIENNE (E-MAILS & MÉMOS VOCAUX)
    {
      id: "mails_notes",
      category: "Productivité & Terrain",
      categoryBadge: "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      title: "Assistant E-mails & Mémos Vocaux",
      miniDescription: "Réponses instantanées aux demandes de devis et dictée vocale transformée en compte-rendu de chantier.",
      link: "/services-ia/comptes-rendus",
      actionLabel: "Dicter un mémo vocal",
      icon: Mic,
      sidebarLabel: "Mémos & Mails",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center animate-pulse">
                <Mic size={16} />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Note vocale enregistrée en voiture</span>
                <span className="text-[10px] text-slate-500">Chantier 14 rue Victor Hugo</span>
              </div>
            </div>
            <span className="text-xs font-black text-orange-700">01:24 min</span>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Transcription automatique</span>
            <p className="text-slate-700 dark:text-slate-300 leading-snug">
              "Client a validé le carrelage gris anthracite. Prévoir 2 sacs de ragréage et démarrer la pose lundi matin 8h."
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-emerald-700 font-bold">✓ 2 tâches assignées à l'Équipe A</span>
            <span className="text-orange-700 font-bold">Email client généré →</span>
          </div>
        </div>
      )
    },

    // 8. VISIBILITÉ & AVIS GOOGLE
    {
      id: "visibilite",
      category: "Communication & Notoriété",
      categoryBadge: "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      title: "Publications Chantiers & Avis Google",
      miniDescription: "Photos avant/après transformées en posts réseaux sociaux et collecte automatisée d'avis 5 étoiles.",
      link: "/services-ia/generateur-contenu",
      actionLabel: "Publier un chantier",
      icon: Megaphone,
      sidebarLabel: "Avis & Posts",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <Star size={15} fill="currentColor" />
              <span className="text-slate-900 dark:text-white ml-1 font-black text-xs">4.9 / 5</span>
            </div>
            <span className="text-[10px] text-slate-500">48 avis Google vérifiés</span>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Dernier avis client · Rénovation</span>
              <span className="text-[10px] text-emerald-700 font-bold">Posté il y a 2h</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 italic text-[11px]">
              "Travail impeccable, chantier rendu très propre et devis parfaitement respecté !"
            </p>
            <span className="inline-block text-[10px] text-rose-700 font-bold">
              Réponse de remerciement personnalisée générée en 1 clic
            </span>
          </div>

          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-[10px] flex items-center justify-between">
            <span>Post photo Avant / Après prêt pour Instagram & Facebook</span>
            <span className="font-bold">Publier →</span>
          </div>
        </div>
      )
    },

    // 9. FINANCE & RENTABILITÉ (SIMULATEUR ROI)
    {
      id: "roi",
      category: "Finance & Performance",
      categoryBadge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      title: "Simulateur Rentabilité & Benchmark",
      miniDescription: "Calcul en direct de vos économies annuelles (+4 800 €) et comparaison avec les entreprises de votre secteur.",
      link: "/services-ia/calc-roi",
      actionLabel: "Calculer mon gain financier",
      icon: BarChart3,
      sidebarLabel: "Simulateur ROI",
      renderMockup: () => (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold tracking-wider block">Gains Annuels Estimés</span>
              <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">+ 4 800 €</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 dark:text-white">32 heures</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">gagnées par mois</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Seuil d'amortissement</span>
              <span className="font-extrabold text-slate-900 dark:text-white">Dès le 1er devis</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 block">Gain de marge nette</span>
              <span className="font-extrabold text-emerald-700">+ 14% en moyenne</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-[10px] flex items-center justify-between">
            <span>Benchmark : 124 entreprises comparées dans votre région</span>
            <span className="font-bold">Voir l'étude →</span>
          </div>
        </div>
      )
    }
  ];

  // Gestion du défilement automatique
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % applications.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, applications.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % applications.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + applications.length) % applications.length);
  };

  const currentApp = applications[currentIndex];

  return (
    <div 
      className="w-full"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Cadre Agrandit & Enrichi façon Fenêtre d'Application SaaS Moderne */}
      <div className="bg-white dark:bg-slate-900 border-2 border-[#E3DED4] dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(20,43,82,0.25)]">
        
        {/* 1. BARRE DE TITRE & CONTRÔLES SUPÉRIEURS (MAC-STYLE) */}
        <div className="bg-[#FAF8F5] dark:bg-slate-850 px-4 sm:px-5 py-3 border-b border-[#E3DED4] dark:border-slate-800 flex items-center justify-between gap-3">
          
          {/* Pastilles macOS + Statut */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B] inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-[#10B981] inline-block shadow-xs" />
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-300 dark:border-slate-700">
              Plateforme Entreprise IT4WORK
            </span>
          </div>

          {/* Badge Catégorie Dynamique */}
          <span className={`text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border shadow-xs transition-all ${currentApp.categoryBadge}`}>
            {currentApp.category}
          </span>

          {/* Contrôles Précédent / Lecture / Suivant */}
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-extrabold mr-1 text-slate-500">
              {currentIndex + 1} / {applications.length}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Application précédente"
              aria-label="Application précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-500"
              title={isPlaying ? "Mettre en pause le défilement" : "Reprendre le défilement"}
              aria-label="Pause ou lecture"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Application suivante"
              aria-label="Application suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 2. CORPS PRINCIPAL : SIDEBAR INTERACTIVE + ZONE APPLICATIVE ÉTENDUE */}
        <div className="flex min-h-[440px] sm:min-h-[480px]">
          
          {/* Mini-Sidebar Interactive de gauche avec les 9 icônes cliquables */}
          <div className="w-16 sm:w-20 bg-[#142B52] p-2.5 sm:p-3 flex flex-col items-center justify-between shrink-0 select-none">
            
            {/* Logo repère */}
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white mb-2 font-black text-xs">
              IT
            </div>

            {/* Liste des 9 icônes applicatives */}
            <div className="flex flex-col gap-1.5 w-full items-center">
              {applications.map((app, index) => {
                const IconComponent = app.icon;
                const isActive = index === currentIndex;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive 
                        ? "bg-amber-400 text-slate-950 font-bold shadow-md scale-105" 
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    title={app.title}
                    aria-label={app.title}
                  >
                    <IconComponent size={17} />
                    {/* Tooltip discret sur grand écran */}
                    <span className="hidden group-hover:block absolute left-full ml-2.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-30 shadow-lg pointer-events-none">
                      {app.sidebarLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Indicateur de sécurité */}
            <div className="mt-2 text-[9px] text-white/50 text-center font-bold">
              2026
            </div>
          </div>

          {/* Zone de contenu de l'application en cours */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between text-left bg-white dark:bg-slate-900">
            
            {/* Entête avec Titre de l'application & Mini Description */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-extrabold text-base sm:text-lg text-[#14213D] dark:text-white flex items-center gap-2">
                  <span>{currentApp.title}</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  Application #{currentIndex + 1}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentApp.miniDescription}
              </p>
            </div>

            {/* Capture / Mockup interactif de l'application */}
            <div className="flex-1 flex flex-col justify-center py-2 animate-in fade-in duration-300">
              {currentApp.renderMockup()}
            </div>

            {/* Pied du cadre : Puces de navigation + Bouton d'action directe vers l'application */}
            <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Puces de pagination interactives */}
              <div className="flex items-center gap-1.5">
                {applications.map((app, index) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsPlaying(false);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      index === currentIndex 
                        ? "w-6 bg-[#1C3A6B] dark:bg-amber-400" 
                        : "w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                    }`}
                    title={app.title}
                    aria-label={`Aller à ${app.title}`}
                  />
                ))}
              </div>

              {/* Bouton d'accès direct */}
              <Link
                to={currentApp.link}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C3A6B] hover:bg-[#142B52] dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-sm group"
              >
                <span>{currentApp.actionLabel}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Légende sous le cadre */}
      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>9 applications métier interconnectées</span>
        </span>
        <span className="font-semibold">
          Survolez pour mettre en pause le défilement
        </span>
      </div>
    </div>
  );
};
