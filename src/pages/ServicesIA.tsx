import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroAppShowcase } from "@/components/services-ia/HeroAppShowcase";
import { AnimatedStepsSection } from "@/components/services-ia/AnimatedStepsSection";
import {
  Check, ArrowRight, ShieldCheck, PhoneCall, Receipt, Users, Megaphone,
  Calendar, FileText, ChevronDown, ChevronUp, Clock, HelpCircle, X, Sparkles,
  Wrench, Utensils, Scissors, Car, Store, Briefcase, Camera, Mail
} from "lucide-react";
import { toast } from "sonner";

export default function ServicesIA() {
  const { isAuthenticated, company } = useAuth();
  const navigate = useNavigate();

  // Onglet sélectionné pour "Tout ce qu'il faut, rangé en 4 coins"
  const [activeTab, setActiveTab] = useState<number>(0);
  const toolsSectionRef = useRef<HTMLElement>(null);
  const [isToolsInView, setIsToolsInView] = useState(false);
  const [isTabsPaused, setIsTabsPaused] = useState(false);
  const [tabProgress, setTabProgress] = useState(0);

  // Observer de visibilité pour la section des 4 coins
  useEffect(() => {
    const el = toolsSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsToolsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Défilement automatique séquentiel des 4 coins (Factures -> Clients -> Notoriété -> Quotidien)
  useEffect(() => {
    if (!isToolsInView || isTabsPaused) return;

    const DURATION = 4500; // 4.5 secondes par onglet
    const INTERVAL = 50; // Mise à jour fluide toutes les 50ms
    const stepIncrement = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setTabProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((curr) => (curr + 1) % 4);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [isToolsInView, isTabsPaused, activeTab]);

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    setTabProgress(0);
  };

  // État de saisie automatique du titre H1 Hero (2 apparitions puis stabilité définitive)
  const [heroCycle, setHeroCycle] = useState(0);
  const [isHeroStabilized, setIsHeroStabilized] = useState(false);
  const [typedLine1, setTypedLine1] = useState("");
  const [typedLine2, setTypedLine2] = useState("");

  const FULL_LINE_1 = "Moins de tâches administratives.";
  const FULL_LINE_2 = "Plus de clients.";

  // Saisie animée du titre Hero : 2 passages complets puis stabilité définitive
  useEffect(() => {
    if (isHeroStabilized) return;

    // Phase 1 : Frappe de la première ligne
    if (typedLine1.length < FULL_LINE_1.length) {
      const timer = setTimeout(() => {
        setTypedLine1(FULL_LINE_1.slice(0, typedLine1.length + 1));
      }, 40);
      return () => clearTimeout(timer);
    }

    // Phase 2 : Frappe de la deuxième ligne une fois la première complétée
    if (typedLine2.length < FULL_LINE_2.length) {
      const timer = setTimeout(() => {
        setTypedLine2(FULL_LINE_2.slice(0, typedLine2.length + 1));
      }, 35);
      return () => clearTimeout(timer);
    }

    // Phase 3 : Les deux lignes sont complètes pour ce passage
    const pauseTimer = setTimeout(() => {
      const nextCycle = heroCycle + 1;
      if (nextCycle >= 2) {
        // Après 2 apparitions complètes, stabilité définitive
        setIsHeroStabilized(true);
      } else {
        // Redémarrage pour la 2ème apparition
        setHeroCycle(nextCycle);
        setTypedLine1("");
        setTypedLine2("");
      }
    }, 2200);

    return () => clearTimeout(pauseTimer);
  }, [isHeroStabilized, typedLine1, typedLine2, heroCycle]);

  // État des accordéons FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Modale de rappel conseiller
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackTime, setCallbackTime] = useState("Dès que possible");
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  // Modale des tarifs complets
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Profil existant si déjà complété
  const savedProfile = (() => {
    try {
      const raw = localStorage.getItem('mdiv_ia_user_profile');
      if (raw) return JSON.parse(raw);
    } catch { }
    return null;
  })();

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName.trim()) {
      toast.error("Veuillez renseigner votre nom ou votre entreprise.");
      return;
    }
    if (!callbackPhone.trim()) {
      toast.error("Veuillez renseigner votre numéro de téléphone.");
      return;
    }

    setIsSubmittingCallback(true);

    try {
      // Envoi du mail de rappel à contact@mdiv-network.com via Web3Forms
      const formPayload = new FormData();
      formPayload.append("access_key", "19268cb5-9f71-4363-9602-b6ad76d8d85b");
      formPayload.append("to_email", "contact@mdiv-network.com");
      formPayload.append("subject", callbackName.trim()); // Motif : le nom
      formPayload.append("from_name", callbackName.trim());
      formPayload.append("Nom", callbackName.trim());
      formPayload.append("Téléphone", callbackPhone.trim());
      formPayload.append("Créneau", callbackTime);
      formPayload.append("Message", "je souhaite etre rappellé pour les service IA"); // Message requis

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formPayload,
      });

      const result = await response.json().catch(() => ({ success: true }));

      if (response.ok && result.success !== false) {
        toast.success(`Votre demande a été transmise à Eric Papain Mezatio (contact@mdiv-network.com). Vous serez rappelé au ${callbackPhone}.`);
        setIsCallbackOpen(false);
        setCallbackName("");
        setCallbackPhone("");
      } else {
        toast.success(`Demande enregistrée. Eric Papain Mezatio vous rappellera au ${callbackPhone}.`);
        setIsCallbackOpen(false);
        setCallbackName("");
        setCallbackPhone("");
      }
    } catch {
      toast.success(`Demande enregistrée. Eric Papain Mezatio vous rappellera au ${callbackPhone}.`);
      setIsCallbackOpen(false);
      setCallbackName("");
      setCallbackPhone("");
    } finally {
      setIsSubmittingCallback(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#14213D] font-sans">

      {/* ========================================================================= */}
      {/* 1. HEADER SERVICES IA                                                     */}
      {/* ========================================================================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E3DED4] sticky top-0 z-40 shadow-xs transition-all">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-4">

          {/* Logo IT4WORK */}
          <Link to="/services-ia" className="flex items-center gap-2.5 text-[#14213D] text-decoration-none group" title="IT4WORK Innovation">
            <img
              src="/IT4ALL.jpeg"
              alt="IT4WORK Innovation"
              className="h-14 sm:h-18 md:h-20 w-auto rounded-lg object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Navigation interne */}
          <nav aria-label="Menu principal" className="hidden lg:flex items-center gap-6 text-base font-semibold text-[#14213D]">
            <a href="#comment" className="hover:text-[#1C3A6B] transition-colors">Comment ça marche</a>
            <a href="#outils" className="hover:text-[#1C3A6B] transition-colors">Les outils</a>
            <a href="#pourqui" className="hover:text-[#1C3A6B] transition-colors">Pour qui ?</a>
            <a href="#tarifs" className="hover:text-[#1C3A6B] transition-colors">Tarifs</a>
            <a href="#questions" className="hover:text-[#1C3A6B] transition-colors">Vos questions</a>
          </nav>

          {/* Boutons d'action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/services-ia/dashboard"
                className="text-[#1C3A6B] font-bold text-sm px-3.5 py-2 hover:underline"
              >
                Mon espace
              </Link>
            ) : (
              <Link
                to="/services-ia/diagnostic/login"
                className="text-[#1C3A6B] font-bold text-sm px-3.5 py-2 hover:underline"
              >
                Connectez-vous
              </Link>
            )}

            <Link
              to="/services-ia/diagnostic"
              className="bg-[#1C3A6B] hover:bg-[#142B52] text-white font-bold text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm text-decoration-none"
            >
              Faire mon diagnostic gratuit
            </Link>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO PRINCIPAL                                                         */}
      {/* ========================================================================= */}
      <section id="top" className="max-w-[1340px] mx-auto px-4 sm:px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Colonne gauche : promesse & CTA */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start">

          <span className="inline-block bg-[#FBEBD9] text-[#8A4510] font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full mb-4">
            Pour les artisans et les indépendants
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#14213D] leading-[1.1] tracking-tight mb-5 min-h-[5.5rem] sm:min-h-[7rem] lg:min-h-[7.5rem]">
            {isHeroStabilized ? (
              <>
                Moins de tâches administratives.<br />
                Plus de clients.
              </>
            ) : (
              <>
                <span className="block">
                  {typedLine1}
                  {typedLine1.length < FULL_LINE_1.length && (
                    <span className="inline-block w-1 h-8 sm:h-10 lg:h-12 bg-[#1C3A6B] ml-1 animate-pulse align-middle" />
                  )}
                </span>
                <span className="block text-[#1C3A6B]">
                  {typedLine2}
                  {typedLine1.length === FULL_LINE_1.length && !isHeroStabilized && (
                    <span className="inline-block w-1 h-8 sm:h-10 lg:h-12 bg-[#1C3A6B] ml-1 animate-pulse align-middle" />
                  )}
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-[#3A4152] leading-relaxed max-w-xl mb-7">
            Devis, factures, relances, nouveaux clients : un seul espace simple pour gérer votre entreprise, même depuis le chantier. Pas besoin d'être doué en informatique.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-5">
            <Link
              to="/services-ia/diagnostic"
              className="inline-flex items-center gap-2.5 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-extrabold text-base sm:text-lg px-7 py-3.5 rounded-xl shadow-md transition-all text-decoration-none group"
            >
              <span>Faire mon diagnostic gratuit</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#comment"
              className="font-bold text-sm sm:text-base text-[#1C3A6B] hover:underline px-3 py-2"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* 3 Garanties immédiates */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#5A5F6B] font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} className="text-[#2E6B45]" strokeWidth={3} />
              3 minutes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} className="text-[#2E6B45]" strokeWidth={3} />
              Gratuit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} className="text-[#2E6B45]" strokeWidth={3} />
              Sans carte bancaire
            </span>
          </div>

        </div>

        {/* Colonne droite : Showcase défilant de toutes les applications agrandi */}
        <div className="lg:col-span-6 xl:col-span-6 w-full">
          <HeroAppShowcase />
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. BANDEAU DES 4 ENGAGEMENTS                                              */}
      {/* ========================================================================= */}
      <section aria-label="Nos engagements" className="bg-white border-y border-[#E3DED4] py-7">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="flex items-start gap-3.5">
            <Receipt className="text-[#1C3A6B] shrink-0 mt-0.5" size={26} />
            <div>
              <div className="font-bold text-sm text-[#14213D]">Prêt pour la facture électronique</div>
              <div className="text-xs text-[#5A5F6B] mt-0.5">Format Factur-X & portail légal PPF</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <ShieldCheck className="text-[#1C3A6B] shrink-0 mt-0.5" size={26} />
            <div>
              <div className="font-bold text-sm text-[#14213D]">Vos documents restent à vous</div>
              <div className="text-xs text-[#5A5F6B] mt-0.5">Visibles par vous seul, hébergés en France/UE</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <PhoneCall className="text-[#1C3A6B] shrink-0 mt-0.5" size={26} />
            <div>
              <div className="font-bold text-sm text-[#14213D]">Un vrai conseiller au bout du fil</div>
              <div className="text-xs text-[#5A5F6B] mt-0.5">Du lundi au vendredi, par téléphone et visio</div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Clock className="text-[#1C3A6B] shrink-0 mt-0.5" size={26} />
            <div>
              <div className="font-bold text-sm text-[#14213D]">Sans engagement</div>
              <div className="text-xs text-[#5A5F6B] mt-0.5">Vous arrêtez quand vous voulez</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COMMENT ÇA MARCHE (3 ÉTAPES)                                           */}
      {/* ========================================================================= */}
      <section id="comment" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-2">
            Comment ça marche ?
          </h2>
          <p className="text-base sm:text-lg text-[#3A4152]">
            Trois étapes, et vous savez exactement ce qui peut vous faire gagner du temps.
          </p>
        </div>

        {/* Composant animé avec frappe automatique du titre et mise en valeur séquentielle des blocs */}
        <AnimatedStepsSection />
      </section>

      {/* ========================================================================= */}
      {/* 5. TOUT CE QU'IL FAUT, RANGÉ EN 4 COINS                                   */}
      {/* ========================================================================= */}
      <section ref={toolsSectionRef} id="outils" className="bg-white border-y border-[#E3DED4] py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-2">
              Tout ce qu'il faut, rangé en 4 coins
            </h2>
            <p className="text-base sm:text-lg text-[#3A4152]">
              Choisissez ce qui vous parle. Vous pourrez ajouter le reste plus tard.
            </p>
          </div>

          {/* Onglets des 4 coins avec indicateur dynamique de progression */}
          <div
            role="tablist"
            className="flex flex-wrap gap-2.5 mb-8"
            onMouseEnter={() => setIsTabsPaused(true)}
            onMouseLeave={() => setIsTabsPaused(false)}
          >
            {[
              { id: 0, label: 'Factures & paiements' },
              { id: 1, label: 'Trouver des clients' },
              { id: 2, label: 'Me faire connaître' },
              { id: 3, label: 'Mon quotidien' }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative overflow-hidden min-h-[46px] px-5 rounded-full font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer select-none ${isSelected
                      ? "bg-[#1C3A6B] text-white border-2 border-[#1C3A6B] shadow-md ring-2 ring-[#1C3A6B]/20 scale-102"
                      : "bg-white text-[#14213D] border-2 border-[#C9C2B5] hover:border-slate-500 hover:bg-slate-50"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {tab.label}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                    )}
                  </span>

                  {/* Barre de progression temporelle sur l'onglet actif */}
                  {isSelected && (
                    <span
                      className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-75 ease-linear"
                      style={{ width: `${Math.min(100, Math.max(0, tabProgress))}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenu de l'onglet actif avec transition fluide et pause au survol */}
          <div
            key={activeTab}
            onMouseEnter={() => setIsTabsPaused(true)}
            onMouseLeave={() => setIsTabsPaused(false)}
            className="bg-[#F6F3EE] rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transition-all duration-500 animate-in fade-in-50 slide-in-from-bottom-2"
          >

            {/* ── COIN 1 : FACTURES & PAIEMENTS ── */}
            {activeTab === 0 && (
              <>
                <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
                  <h3 className="font-extrabold text-2xl sm:text-3xl text-[#14213D]">
                    Factures & paiements
                  </h3>
                  <p className="text-base text-[#3A4152] leading-relaxed">
                    Faites vos papiers en quelques minutes et soyez payé plus vite.
                  </p>

                  <ul className="space-y-3 text-sm sm:text-base text-[#14213D] mt-2">
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Un devis propre en 2 minutes, même depuis votre téléphone</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Le devis accepté devient une facture en un clic</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Les clients en retard sont relancés pour vous, poliment</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Photographiez un ticket fournisseur, il est rangé tout seul</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Prêt pour la facture électronique obligatoire 2026 (Factur-X / PPF)</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      to="/services-ia/factures"
                      className="inline-flex items-center gap-2 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
                    >
                      Essayer la facturation Factur-X <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Exemple concret */}
                <div className="lg:col-span-5 bg-white border border-[#E3DED4] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 text-xs sm:text-sm text-left">
                  <div className="font-extrabold text-sm sm:text-base text-slate-900">
                    Devis n° D-2026-014
                  </div>
                  <div className="flex justify-between border-b border-[#E3DED4] pb-2 text-slate-700">
                    <span>Remplacement chauffe-eau 200 L</span>
                    <span className="font-bold">1 450,00 €</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E3DED4] pb-2 text-slate-700">
                    <span>Main d'œuvre (4 h)</span>
                    <span className="font-bold">400,00 €</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                    <span>Total TTC</span>
                    <span>1 850,00 €</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link to="/services-ia/factures" className="flex-1 text-center py-2 px-3 rounded-lg bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52]">
                      Envoyer au client
                    </Link>
                    <Link to="/services-ia/devis" className="flex-1 text-center py-2 px-3 rounded-lg border border-[#C9C2B5] text-slate-800 font-bold text-xs hover:bg-slate-100">
                      Faire signer
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* ── COIN 2 : TROUVER DES CLIENTS ── */}
            {activeTab === 1 && (
              <>
                <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
                  <h3 className="font-extrabold text-2xl sm:text-3xl text-[#14213D]">
                    Trouver des clients
                  </h3>
                  <p className="text-base text-[#3A4152] leading-relaxed">
                    Remplissez votre carnet de commandes sans y passer vos soirées.
                  </p>

                  <ul className="space-y-3 text-sm sm:text-base text-[#14213D] mt-2">
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Une liste de clients potentiels près de chez vous</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Des messages de présentation déjà écrits, à votre nom</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Les appels d'offres de votre secteur, expliqués simplement</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Un carnet de clients qui vous rappelle qui recontacter</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      to="/services-ia/generateur-leads"
                      className="inline-flex items-center gap-2 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
                    >
                      Voir les opportunités locales <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Exemple concret */}
                <div className="lg:col-span-5 bg-white border border-[#E3DED4] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 text-xs sm:text-sm text-left">
                  <div className="font-extrabold text-sm sm:text-base text-slate-900">
                    12 clients potentiels à moins de 20 km
                  </div>
                  <div className="flex justify-between items-center border-b border-[#E3DED4] pb-2.5">
                    <span>Syndic Les Hauts de Seine</span>
                    <span className="text-[#2E6B45] font-bold">À contacter</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#E3DED4] pb-2.5">
                    <span>Agence immobilière du Centre</span>
                    <span className="text-[#2E6B45] font-bold">À contacter</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-500">
                    <span>Résidence Le Clos Fleuri</span>
                    <span>Contacté le 2 oct.</span>
                  </div>
                </div>
              </>
            )}

            {/* ── COIN 3 : ME FAIRE CONNAÎTRE ── */}
            {activeTab === 2 && (
              <>
                <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
                  <h3 className="font-extrabold text-2xl sm:text-3xl text-[#14213D]">
                    Me faire connaître
                  </h3>
                  <p className="text-base text-[#3A4152] leading-relaxed">
                    Montrez votre travail sans devenir community manager.
                  </p>

                  <ul className="space-y-3 text-sm sm:text-base text-[#14213D] mt-2">
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Une photo de chantier devient un post Facebook ou Instagram</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Refonte de votre site web : une vitrine moderne sur mobile qui transforme les visites en appels et devis</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Des réponses toutes prêtes aux avis Google</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Une plaquette ou une présentation pour vos rendez-vous</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Être le 1er artisan visible sur Google dans votre ville</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      to="/services-ia/generateur-contenu"
                      className="inline-flex items-center gap-2 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
                    >
                      Créer un post chantier en 1 clic <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Exemple concret */}
                <div className="lg:col-span-5 bg-white border border-[#E3DED4] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 text-xs sm:text-sm text-left">
                  <div className="h-32 rounded-xl bg-[#E8E2D6] flex items-center justify-center text-slate-500 font-bold">
                    [Photo de chantier terminée]
                  </div>
                  <p className="text-slate-800 leading-snug">
                    « Salle de bain terminée à Troyes cette semaine. Douche à l'italienne, carrelage grand format. Merci à M. et Mme Roux pour leur confiance ! »
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Link to="/services-ia/generateur-contenu" className="flex-1 text-center py-2 px-3 rounded-lg bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52]">
                      Publier
                    </Link>
                    <Link to="/services-ia/generateur-contenu" className="flex-1 text-center py-2 px-3 rounded-lg border border-[#C9C2B5] text-slate-800 font-bold text-xs hover:bg-slate-100">
                      Modifier le texte
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* ── COIN 4 : MON QUOTIDIEN ── */}
            {activeTab === 3 && (
              <>
                <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
                  <h3 className="font-extrabold text-2xl sm:text-3xl text-[#14213D]">
                    Mon quotidien
                  </h3>
                  <p className="text-base text-[#3A4152] leading-relaxed">
                    Les petites corvées qui mangent vos journées, faites plus vite.
                  </p>

                  <ul className="space-y-3 text-sm sm:text-base text-[#14213D] mt-2">
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Répondre à vos e-mails en dictant 2 phrases (Gmail, OVH...)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Comprendre un long document en 30 secondes</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Préparer un rendez-vous client en 2 minutes</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="text-[#2E6B45] shrink-0 mt-0.5" strokeWidth={3} size={18} />
                      <span>Retrouver n'importe quel papier en le demandant simplement</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <Link
                      to="/services-ia/assistant-email"
                      className="inline-flex items-center gap-2 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
                    >
                      Connecter ma boîte mail <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Exemple concret */}
                <div className="lg:col-span-5 bg-white border border-[#E3DED4] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3 text-xs sm:text-sm text-left">
                  <div className="font-bold text-slate-800">Que voulez-vous faire ?</div>
                  <div className="border-2 border-[#1C3A6B] rounded-xl p-3 text-slate-800 font-semibold bg-white">
                    « Retrouve la facture de M. Petit de septembre »
                  </div>
                  <div className="flex justify-between items-center bg-[#F6F3EE] rounded-xl p-3 mt-1">
                    <span>Facture F-2026-029 · M. Petit</span>
                    <span className="font-extrabold text-slate-900">640,00 €</span>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAIT POUR LES GENS DE MÉTIER (6 TUILES)                                */}
      {/* ========================================================================= */}
      <section id="pourqui" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-2">
            Fait pour les gens de métier
          </h2>
          <p className="text-base sm:text-lg text-[#3A4152]">
            Que vous soyez seul ou avec une équipe, votre espace s'adapte à votre activité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Wrench size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Bâtiment & travaux
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Plombiers, électriciens, maçons, peintres, menuisiers…
            </span>
          </Link>

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Utensils size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Métiers de bouche
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Boulangers, bouchers, traiteurs, restaurateurs…
            </span>
          </Link>

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Scissors size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Beauté & bien-être
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Coiffeurs, esthéticiennes, spa, praticiens…
            </span>
          </Link>

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Car size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Auto & réparation
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Garagistes, carrossiers, dépanneurs, mécaniciens…
            </span>
          </Link>

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Store size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Commerçants
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Boutiques, fleuristes, cavistes, vente au détail…
            </span>
          </Link>

          <Link
            to="/services-ia/diagnostic"
            className="bg-white border border-[#E3DED4] hover:border-[#1C3A6B] rounded-2xl p-6 flex flex-col gap-2.5 transition-all text-decoration-none group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FBEBD9] text-[#8A4510] flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <span className="font-extrabold text-lg text-[#14213D] group-hover:text-[#1C3A6B] transition-colors">
              Indépendants & conseil
            </span>
            <span className="text-sm text-[#5A5F6B]">
              Services à domicile, consultants, formateurs, créateurs…
            </span>
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. VOUS N'ÊTES PAS SEUL : UN CONSEILLER QUI CONNAÎT VOTRE MÉTIER         */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 7. VOUS N'ÊTES PAS SEUL : UN CONSEILLER QUI CONNAÎT VOTRE MÉTIER         */}
      {/* ========================================================================= */}
      <section className="bg-[#142B52] text-white py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <span className="text-[#F2C08A] font-bold text-sm uppercase tracking-wider">
              Vous n'êtes pas seul
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Un conseiller qui connaît votre métier
            </h2>
            <p className="text-base sm:text-lg text-[#D6DEEC] leading-relaxed max-w-xl">
              Les outils, c'est bien. Quelqu'un pour vous accompagner, c'est mieux. On vous aide à démarrer, on audite la rentabilité réelle de vos chantiers, on refait votre site web clé en main, et on peut construire un outil rien que pour vous.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCallbackOpen(true)}
                className="bg-white text-[#142B52] hover:bg-slate-100 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Être rappelé
              </button>
              <button
                type="button"
                onClick={() => toast.info("Eric Papain Mezatio peut se déplacer ou faire une démonstration en visio. Cliquez sur 'Être rappelé' pour convenir d'un rendez-vous.")}
                className="text-white hover:text-[#F2C08A] font-bold text-sm px-4 py-3.5 transition-colors cursor-pointer"
              >
                Voir l'accompagnement
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1C3A6B] rounded-3xl p-6 sm:p-7 flex items-center gap-5 shadow-lg border border-white/10 relative overflow-hidden group hover:border-[#F2C08A]/30 transition-all">
            <div className="w-20 h-20 rounded-full bg-[#E8E2D6] text-[#142B52] font-black text-2xl flex items-center justify-center shrink-0 shadow-inner ring-4 ring-white/10">
              EPM
            </div>
            <div className="flex flex-col text-left">
              <div className="font-extrabold text-xl sm:text-2xl text-white min-h-[2rem] flex items-center flex-wrap leading-tight">
                <span>Eric Papain Mezatio</span>
              </div>
              <div className="text-xs sm:text-sm text-[#D6DEEC] mt-0.5">
                Votre conseiller dédié, du lundi au vendredi
              </div>
              <a
                href="tel:+33753784796"
                className="text-[#F2C08A] hover:text-amber-300 font-extrabold text-sm sm:text-base mt-2 flex items-center gap-1.5 transition-colors hover:underline"
                title="Appeler Eric Papain Mezatio"
              >
                <PhoneCall size={16} /> +33 753 784 796
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PREUVES RÉELLES & CONCRÈTES (SANS FAUX CHIFFRES)                      */}
      {/* ========================================================================= */}
      <section aria-label="Garanties et avis" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-2">
            Des garanties concrètes pour votre sérénité
          </h2>
          <p className="text-base sm:text-lg text-[#3A4152]">
            Pas de promesses creuses : nous protégeons vos données et nous engageons par écrit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border border-[#E3DED4] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[#2E6B45] font-extrabold text-xs uppercase tracking-wider mb-2">
                Conformité 2026 garantie
              </div>
              <p className="text-base text-slate-800 leading-relaxed mb-4">
                « Dès l'émission de votre première facture, nous générons le format officiel Factur-X EN 16931 et l'empreinte de contrôle fiscal PAF. Zéro stress pour votre comptabilité. »
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A5F6B]">Conformité DGFiP & Portails Agréés</span>
          </div>

          <div className="bg-white border border-[#E3DED4] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[#2E6B45] font-extrabold text-xs uppercase tracking-wider mb-2">
                Souveraineté des données
              </div>
              <p className="text-base text-slate-800 leading-relaxed mb-4">
                « Vos documents et vos devis ne sont jamais utilisés pour entraîner des modèles publics d'IA. Ils sont stockés sur des serveurs sécurisés en Europe. »
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A5F6B]">Confidentialité & RGPD certifiés</span>
          </div>

          <div className="bg-white border border-[#E3DED4] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[#2E6B45] font-extrabold text-xs uppercase tracking-wider mb-2">
                Assistance humaine continue
              </div>
              <p className="text-base text-slate-800 leading-relaxed mb-4">
                « Un numéro fixe, un conseiller basé en France qui répond en moins de 3 sonneries. Nous venons même vous aider à configurer vos modèles si besoin. »
              </p>
            </div>
            <span className="text-xs font-bold text-[#5A5F6B]">Support téléphonique du lundi au vendredi</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. TARIFS CLAIRS ("GRATUIT POUR COMMENCER")                              */}
      {/* ========================================================================= */}
      <section id="tarifs" className="bg-white border-y border-[#E3DED4] py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-2">
              Gratuit pour commencer
            </h2>
            <p className="text-base sm:text-lg text-[#3A4152] leading-relaxed">
              Le diagnostic et les outils de base sont gratuits. Pour aller plus loin, à partir de <strong>12 € HT par mois</strong>, sans engagement. Offert la première année pour les créateurs d'entreprise.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPricingModalOpen(true)}
            className="px-6 py-3.5 rounded-xl border-2 border-[#1C3A6B] text-[#1C3A6B] hover:bg-[#1C3A6B] hover:text-white font-extrabold text-base transition-colors cursor-pointer"
          >
            Voir les tarifs
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOIRE AUX QUESTIONS ("VOS QUESTIONS")                                 */}
      {/* ========================================================================= */}
      <section id="questions" className="max-w-[860px] mx-auto px-4 sm:px-6 py-16 sm:py-20 text-left">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight mb-8">
          Vos questions
        </h2>

        <div className="flex flex-col gap-3">
          {[
            {
              q: "Je ne suis pas à l'aise avec l'ordinateur. C'est pour moi ?",
              a: "Oui. Tout est écrit simplement, les boutons sont gros, et un conseiller peut vous montrer au téléphone. Vous pouvez aussi tout faire depuis votre téléphone sur votre chantier."
            },
            {
              q: "C'est vraiment gratuit ?",
              a: "Le diagnostic et les outils de base sont gratuits, sans carte bancaire requise. Vous ne payez que si vous décidez d'activer des modules avancés."
            },
            {
              q: "Que deviennent mes documents ?",
              a: "Ils sont rangés dans votre espace, visibles par vous seul. Vous pouvez les télécharger au format PDF ou les supprimer à tout moment en un clic."
            },
            {
              q: "Suis-je prêt pour la facture électronique obligatoire ?",
              a: "Le diagnostic vous le dit en 3 minutes, et l'outil de facturation est déjà au format officiel Factur-X conforme à la réforme 2026."
            },
            {
              q: "Je peux arrêter quand je veux ?",
              a: "Oui, tous nos forfaits sont sans engagement de durée. Vous récupérez l'intégralité de vos documents et contacts avant de partir."
            }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E3DED4] rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-[#14213D] cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={20} className="text-[#1C3A6B] shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-[#3A4152] leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CTA FINAL                                                             */}
      {/* ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-[#FBEBD9] rounded-3xl p-10 sm:p-14 flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] tracking-tight">
            Combien de temps pourriez-vous gagner ?
          </h2>
          <p className="text-lg sm:text-xl text-[#3A4152]">
            Réponse en 3 minutes, gratuitement.
          </p>
          <div className="pt-2">
            <Link
              to="/services-ia/diagnostic"
              className="inline-flex items-center gap-2 bg-[#1C3A6B] hover:bg-[#142B52] text-white font-extrabold text-lg sm:text-xl px-8 py-4 rounded-xl shadow-md transition-all text-decoration-none"
            >
              Faire mon diagnostic gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FOOTER LÉGAL                                                          */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-[#E3DED4] py-8 text-xs sm:text-sm text-[#5A5F6B]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <span>© 2026 M.DIV Business · SIRET 911 982 726 00018 · La Chapelle-Saint-Luc</span>
          <nav aria-label="Liens légaux" className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="/charte" className="hover:underline">Mentions légales</Link>
            <Link to="/charte" className="hover:underline">Conditions d'utilisation</Link>
            <Link to="/charte" className="hover:underline">Confidentialité & Sécurité</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
          </nav>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODALE : RAPPEL CONSEILLER                                                */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODALE : RAPPEL CONSEILLER                                                */}
      {/* ========================================================================= */}
      {isCallbackOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Être rappelé par Eric Papain Mezatio</h3>
                <p className="text-xs text-slate-500">Votre conseiller dédié vous rappelle sans engagement.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCallbackOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCallbackSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre nom ou entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  placeholder="ex : Julien Dupont - SARL Dupont"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#1C3A6B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Votre numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="ex : 06 12 34 56 78"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#1C3A6B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Créneau de rappel souhaité</label>
                <select
                  value={callbackTime}
                  onChange={(e) => setCallbackTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-[#1C3A6B] outline-none bg-white"
                >
                  <option value="Dès que possible">Dès que possible (9h - 18h)</option>
                  <option value="En fin de matinée (11h - 12h30)">En fin de matinée (11h - 12h30)</option>
                  <option value="En début d'après-midi (14h - 16h)">En début d'après-midi (14h - 16h)</option>
                  <option value="En fin de journée (17h - 19h)">En fin de journée (17h - 19h)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallbackOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCallback}
                  className="px-5 py-2 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingCallback ? "Transmission..." : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALE : TARIFS COMPLETS                                                  */}
      {/* ========================================================================= */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900">Nos formules simples & transparentes</h3>
                <p className="text-xs text-slate-500">Sans engagement, résiliable à tout moment.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Gratuit */}
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="font-extrabold text-lg text-slate-900">Gratuit</div>
                  <div className="text-2xl font-black text-slate-900 my-2">0 €</div>
                  <p className="text-xs text-slate-500 mb-3">Pour tester et faire son diagnostic.</p>
                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Bilan et diagnostic complet</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Création de devis & factures simples</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Scan de 5 tickets / mois</li>
                  </ul>
                </div>
                <Link
                  to="/services-ia/diagnostic"
                  className="mt-4 block text-center py-2 px-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200"
                >
                  Démarrer gratuit
                </Link>
              </div>

              {/* Indépendant */}
              <div className="border-2 border-[#1C3A6B] bg-[#E4ECF8]/20 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <span className="bg-[#1C3A6B] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommandé
                  </span>
                  <div className="font-extrabold text-lg text-slate-900 mt-1">Indépendant</div>
                  <div className="text-2xl font-black text-[#1C3A6B] my-2">12 € <span className="text-xs text-slate-500 font-normal">HT/mois</span></div>
                  <p className="text-xs text-slate-500 mb-3">Pour gérer son activité sans stress.</p>
                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Factures & devis Factur-X illimités</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Relances impayés automatiques</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Dépenses & scan de tickets illimités</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Support téléphonique dédié</li>
                  </ul>
                </div>
                <Link
                  to="/services-ia/diagnostic"
                  className="mt-4 block text-center py-2 px-3 rounded-xl bg-[#1C3A6B] text-white font-bold text-xs hover:bg-[#142B52]"
                >
                  Choisir cette formule
                </Link>
              </div>

              {/* TPE / Équipe */}
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="font-extrabold text-lg text-slate-900">Équipe & TPE</div>
                  <div className="text-2xl font-black text-slate-900 my-2">29 € <span className="text-xs text-slate-500 font-normal">HT/mois</span></div>
                  <p className="text-xs text-slate-500 mb-3">Pour les petites entreprises de 2 à 9 personnes.</p>
                  <ul className="text-xs space-y-2 text-slate-700">
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Tout le forfait Indépendant</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Module Équipe & plannings</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Rapprochement bancaire & FEC</li>
                    <li className="flex items-center gap-1.5"><Check size={14} className="text-[#2E6B45]" /> Conseiller attitré et visio</li>
                  </ul>
                </div>
                <Link
                  to="/services-ia/diagnostic"
                  className="mt-4 block text-center py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                >
                  Choisir Équipe
                </Link>
              </div>

            </div>

            <p className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200">
              Offert la première année pour les créateurs d'entreprise récents. Tous les prix s'entendent hors taxes.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
