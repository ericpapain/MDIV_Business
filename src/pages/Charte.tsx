import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Handshake, 
  Globe, 
  Zap, 
  ArrowRight, 
  Fingerprint, 
  CreditCard, 
  Users, 
  RefreshCw, 
  Key, 
  Timer, 
  ShieldAlert, 
  Star, 
  Lock, 
  Briefcase, 
  Heart, 
  Network, 
  Lightbulb, 
  CheckCircle2,
  CalendarCheck,
  Award
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Charte() {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const articles = isEn ? [
    { num: "01", category: "dna", title: "THE BNE DNA", desc: "EXPERIENCE → CONNECTION → CONTRIBUTION → DEVELOPMENT → OPPORTUNITIES. The network's value depends on relationship quality and our collective ability to generate value.", icon: Fingerprint },
    { num: "02", category: "membership", title: "MEMBERSHIP WITHOUT FEES", desc: "No registration fees, no monthly fees, no annual dues. BNE membership cannot be bought: it stems from participating in an experience or coaching program.", icon: CreditCard },
    { num: "03", category: "membership", title: "MEMBERS & ENGAGEMENT", desc: "BNE prioritizes relationship depth over sheer member count. An active member nurtures authentic relationships and energizes the ecosystem.", icon: Users },
    { num: "04", category: "values", title: "RECIPROCITY", desc: "« Give value to create value. » Each member contributes according to their skills, resources, and connections.", icon: RefreshCw },
    { num: "05", category: "rights", title: "MEMBER RIGHTS", desc: "Expand your trusted network, get introduced to high-level peers, attend exclusive immersions, share your expertise, and build joint ventures.", icon: Key },
    { num: "06", category: "commitments", title: "MEMBER COMMITMENTS", desc: "Uphold the BNE spirit, recommend fellow members, maintain confidentiality, and exhibit high professionalism. Represent BNE through the value you create.", icon: Handshake },
    { num: "07", category: "membership", title: "FREEDOM OF PARTICIPATION", desc: "No minimum duration, no annual locked-in contract, no quota obligations. Every entrepreneur remains free to modulate their involvement.", icon: Timer },
    { num: "08", category: "ethics", title: "NO SPAM OR AGGRESSIVE PROSPECTING", desc: "Cold aggressive pitching and mass harvesting of member details are strictly prohibited. Trust and genuine connection always precede business transactions.", icon: ShieldAlert },
    { num: "09", category: "ethics", title: "CURATED EXPERIENCES", desc: "Certain summits and immersion retreats may feature a selection process based on profile complementarity, shared ambitions, and ethics.", icon: Star },
    { num: "10", category: "ethics", title: "CONFIDENTIALITY & TRUST", desc: "Shared insights, opportunities, and strategic contacts must remain treated with the utmost discretion and mutual confidentiality.", icon: Lock },
    { num: "11", category: "commitments", title: "RESPONSIBILITY & OPPORTUNITY", desc: "BNE catalyzes high-level connections but members remain exclusively responsible for their own commitments, contracts, and business decisions.", icon: Briefcase },
    { num: "12", category: "ethics", title: "ETHICS & CONDUCT", desc: "Respect, integrity, active contribution, and openness. Any behavior conflicting with these values may result in network access suspension.", icon: Heart },
    { num: "13", category: "dna", title: "INTERNATIONAL REACH", desc: "Anchored in regional ecosystems across France, Switzerland, Belgium, Luxembourg, and India, BNE fosters cross-border business bridges.", icon: Globe },
    { num: "14", category: "dna", title: "THE ROLE OF BNE", desc: "A human-scale catalyst connecting decision-makers, enterprises, and territories. We build a more qualitative network, not just a wider one.", icon: Network },
    { num: "15", category: "values", title: "THE BNE PHILOSOPHY", desc: "« I do not come merely seeking an opportunity. I also come ready to create one for someone else. »", icon: Lightbulb }
  ] : [
    { num: "01", category: "dna", title: "L'ADN DU BNE", desc: "EXPÉRIENCE → CONNEXION → CONTRIBUTION → DÉVELOPPEMENT → OPPORTUNITÉS. La valeur du réseau repose sur la qualité humaine des liens et la capacité à créer de la valeur ensemble.", icon: Fingerprint },
    { num: "02", category: "membership", title: "UNE ADHÉSION SANS COTISATION", desc: "0€ de frais d'inscription, 0€ de cotisation mensuelle ou annuelle. L'adhésion ne s'achète pas : elle découle d'une immersion ou d'un accompagnement BNE.", icon: CreditCard },
    { num: "03", category: "membership", title: "MEMBRES & ENGAGEMENT", desc: "Le BNE privilégie l'authenticité de l'engagement plutôt que la masse. Un membre actif cultive un lien sincère avec l'écosystème.", icon: Users },
    { num: "04", category: "values", title: "LA RÉCIPROCITÉ", desc: "« Donner de la valeur pour créer de la valeur. » Chaque membre contribue selon son expertise, ses moyens et ses synergies.", icon: RefreshCw },
    { num: "05", category: "rights", title: "LES DROITS DU MEMBRE", desc: "Développer son carnet d'adresses qualifié, être mis en relation directe, participer aux expériences, pitcher son savoir-faire et bâtir des collaborations.", icon: Key },
    { num: "06", category: "commitments", title: "LES ENGAGEMENTS DU MEMBRE", desc: "Respecter l'esprit BNE, recommander les pairs, préserver la confidentialité et incarner le professionnalisme. Incarner le cercle par vos réussites partagées.", icon: Handshake },
    { num: "07", category: "membership", title: "LIBERTÉ & SANS ENGAGEMENT FORCÉ", desc: "Aucune obligation de durée, aucun contrat annuel restrictif, aucun quota artificiel de recommandation. Chacun participe à son propre rythme.", icon: Timer },
    { num: "08", category: "ethics", title: "PAS DE PROSPECTION AGRESSIVE", desc: "Le spam, la sollicitation sauvage ou l'abus de coordonnées sont rigoureusement proscrits. La relation de confiance précède toujours la transaction.", icon: ShieldAlert },
    { num: "09", category: "ethics", title: "SÉLECTION & EXCELLENCE", desc: "L'accès à certains séjours et expériences immersives est sélectionné afin de garantir une totale complémentarité entre dirigeants.", icon: Star },
    { num: "10", category: "ethics", title: "CONFIDENTIALITÉ & DISCRÉTION", desc: "Les échanges d'opportunités, données stratégiques et contacts doivent être traités sous le sceau de la confidentialité la plus stricte.", icon: Lock },
    { num: "11", category: "commitments", title: "RESPONSABILITÉ INDIVIDUELLE", desc: "Le BNE favorise les ponts mais ne saurait garantir de résultats financiers. Chaque membre demeure seul décisionnaire de ses partenariats.", icon: Briefcase },
    { num: "12", category: "ethics", title: "ÉTHIQUE & BIENVEILLANCE", desc: "Intégrité, respect mutuel, ouverture d'esprit et rigueur professionnelle. Tout manquement avéré peut entraîner la suspension de l'accès au réseau.", icon: Heart },
    { num: "13", category: "dna", title: "ENVERGURE INTERNATIONALE", desc: "Fédéré autour d'écosystèmes locaux (France, Suisse, Belgique, Luxembourg, Inde), le BNE relie dirigeants et territoires d'affaires.", icon: Globe },
    { num: "14", category: "dna", title: "LE RÔLE DU BNE", desc: "Agir comme accélérateur relationnel et facilitateur d'opportunités. Construire un cercle plus pertinent plutôt qu'une foule anonyme.", icon: Network },
    { num: "15", category: "values", title: "LA PHILOSOPHIE BNE", desc: "« Je ne viens pas seulement chercher une opportunité. Je viens aussi avec la capacité d'en créer une pour quelqu'un d'autre. »", icon: Lightbulb }
  ];

  const septPiliers = isEn ? [
    { title: "EXPÉRIENCE", text: "Immersion concrète d'abord", icon: Zap },
    { title: "CONFIANCE", text: "Relations solides et durables", icon: Shield },
    { title: "CONTRIBUTION", text: "Donner avant de demander", icon: Handshake },
    { title: "CONNEXION", text: "Rencontres qualifiées au bon moment", icon: Globe },
    { title: "RÉCIPROCITÉ", text: "Faire circuler la valeur créée", icon: CheckCircle2 },
    { title: "DÉVELOPPEMENT", text: "Du contact à la collaboration réelle", icon: ArrowRight },
    { title: "INTERNATIONAL", text: "Des ponts entre territoires d'affaires", icon: Globe }
  ] : [
    { title: "EXPÉRIENCE", text: "Immersion concrète d'abord", icon: Zap },
    { title: "CONFIANCE", text: "Relations solides et durables", icon: Shield },
    { title: "CONTRIBUTION", text: "Donner avant de demander", icon: Handshake },
    { title: "CONNEXION", text: "Rencontres qualifiées au bon moment", icon: Globe },
    { title: "RÉCIPROCITÉ", text: "Faire circuler la valeur créée", icon: CheckCircle2 },
    { title: "DÉVELOPPEMENT", text: "Du contact à la collaboration réelle", icon: ArrowRight },
    { title: "INTERNATIONAL", text: "Des ponts entre territoires d'affaires", icon: Globe }
  ];

  const categories = isEn ? [
    { id: "all", label: "All Articles" },
    { id: "dna", label: "DNA & Vision" },
    { id: "membership", label: "Membership (0€)" },
    { id: "ethics", label: "Ethics & Trust" },
    { id: "values", label: "Values & Rights" }
  ] : [
    { id: "all", label: "Tous les Articles" },
    { id: "dna", label: "ADN & Vision" },
    { id: "membership", label: "Adhésion (0€)" },
    { id: "ethics", label: "Éthique & Confiance" },
    { id: "values", label: "Valeurs & Droits" }
  ];

  const filteredArticles = activeFilter === "all" 
    ? articles 
    : articles.filter(a => a.category === activeFilter);

  return (
    <div className="bg-[#0a0d0f] min-h-screen text-foreground font-sans pt-24 pb-16">
      
      {/* ── 1. Header Compact & Typographie Accueil ── */}
      <section className="container max-w-5xl mx-auto px-4 text-center mb-8">
        <div className="eyebrow mb-3 flex items-center justify-center gap-2.5 text-xs uppercase tracking-[0.22em] text-amber-400 font-semibold">
          <Shield size={14} className="text-amber-400" />
          <span>{isEn ? "Official BNE Charter" : "La Charte Officielle BNE"}</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          {isEn ? "Principles & Commitments of the " : "L'Esprit & les Engagements du "}<span className="gold-text">Cercle BNE</span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-serif italic leading-relaxed">
          {isEn 
            ? "« Give value to create value. » The human, ethical, and collaborative foundations uniting our business ecosystem." 
            : "« Donner de la valeur pour créer de la valeur. » Les fondations humaines, déontologiques et professionnelles qui unissent notre écosystème d'affaires."}
        </p>
      </section>

      {/* ── 2. Bandeau Synthèse : Adhésion sans Cotisation (Compact) ── */}
      <section className="container max-w-5xl mx-auto px-4 mb-8">
        <div className="bg-card/70 backdrop-blur-md border border-amber-500/25 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
            <div className="text-center md:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-1">
                <Award size={11} /> Modèle Vertueux
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                {isEn ? "An Ecosystem Accessible on Quality, Not on Price" : "Une Adhésion Qui Ne S'Achète Pas"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                {isEn
                  ? "Membership results exclusively from participation in an event, immersion, or eligible coaching program. No recurring membership fees."
                  : "Le statut de membre s'acquiert par l'expérience vécue (événement, séjour ou accompagnement). Aucun droit d'entrée récurrent n'est exigé."}
              </p>
            </div>

            {/* 3 Pills 0€ */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0">
              {(isEn 
                ? [
                    { label: "Registration", sub: "0€ entry" },
                    { label: "Monthly", sub: "0€ / month" },
                    { label: "Annual", sub: "0€ / year" }
                  ]
                : [
                    { label: "Inscription", sub: "0€ de frais" },
                    { label: "Mensuel", sub: "0€ / mois" },
                    { label: "Annuel", sub: "0€ / an" }
                  ]
              ).map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-muted/40 border border-white/10 rounded-xl px-3 py-2 text-center hover:border-amber-400/40 transition-colors"
                >
                  <div className="font-display font-extrabold text-base sm:text-lg text-amber-400 leading-none">0€</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Les 7 Piliers Fondamentaux (Bande Déroulante Compacte) ── */}
      <section className="container max-w-5xl mx-auto px-4 mb-8">
        <div className="mb-3 text-center sm:text-left flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-amber-400">
            {isEn ? "The 7 Core Pillars" : "Les 7 Piliers BNE"}
          </h3>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {isEn ? "The essence in 7 words" : "L'essentiel en 7 notions clés"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {septPiliers.map((pilier, i) => {
            const Icon = pilier.icon;
            return (
              <div 
                key={i}
                className="bg-card/50 border border-border/80 rounded-xl p-2.5 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono text-muted-foreground">0{i+1}</span>
                </div>
                <div>
                  <div className="font-display text-[11px] font-bold text-white tracking-wide truncate">{pilier.title}</div>
                  <div className="text-[9.5px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{pilier.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Filtres de Navigation Rapide par Catégorie ── */}
      <section className="container max-w-5xl mx-auto px-4 mb-5">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveFilter(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                activeFilter === c.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-muted/40 text-muted-foreground hover:text-white hover:bg-muted/70 border border-border/60"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 5. Grille Compacte des 15 Articles (2 Colonnes) ── */}
      <section className="container max-w-5xl mx-auto px-4 mb-10">
        <div className="grid md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredArticles.map((art) => {
            const Icon = art.icon;
            return (
              <div
                key={art.num}
                className="bg-card/55 hover:bg-card/85 border border-border/80 hover:border-amber-400/40 rounded-xl p-4 sm:p-4.5 transition-all shadow-sm flex items-start gap-3.5 group"
              >
                {/* Badge Numéro & Icône */}
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-amber-400">
                  <Icon size={16} />
                  <span className="text-[8.5px] font-mono font-bold text-amber-300 mt-0.5">{art.num}</span>
                </div>

                {/* Texte de l'article */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-foreground group-hover:text-amber-300 transition-colors mb-1 tracking-wide">
                    {art.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {art.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. Engagement & Passerelle Vers l'Action ── */}
      <section className="container max-w-4xl mx-auto px-4 text-center">
        <div className="border-t border-border/60 pt-8 space-y-4">
          <blockquote className="text-sm sm:text-base font-serif italic text-amber-300/90 max-w-2xl mx-auto">
            "{isEn ? "Connecting the right people to create the right opportunities." : "Connecter les bonnes personnes pour créer les bonnes opportunités."}"
          </blockquote>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/evenements"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-transform active:scale-[0.98]"
            >
              <CalendarCheck size={14} />
              <span>{isEn ? "Explore Upcoming Events" : "Découvrir les Événements BNE"}</span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-border hover:bg-muted text-foreground text-xs px-5 py-2.5 rounded-xl transition-colors"
            >
              <span>{isEn ? "Contact the Secretariat" : "Contacter le Secrétariat"}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
