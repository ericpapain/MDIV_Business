import { offers, computeFinalPrice } from "@/data/mockData";
import { Check, ArrowRight, Crown, Users, Diamond, Handshake, Network, Utensils, TrendingUp, Camera, UserCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import destChampagne from "@/assets/original/dest-champagne.png";
import destSuisse from "@/assets/original/dest-suisse.png";
import destLuxembourg from "@/assets/original/dest-luxembourg.png";
import destBelgique from "@/assets/original/dest-belgique.png";

/* ─── Destinations cliquables ─── */
const destinations = [
  {
    id: "champagne",
    name: "CHAMPAGNE",
    country: "FRANCE",
    subtitle: "",
    image: destChampagne,
    href: "/evenements",
    flagType: "france",
  },
  {
    id: "suisse",
    name: "SUISSE",
    country: "",
    subtitle: "EXCELLENCE & INNOVATION",
    image: destSuisse,
    href: "/evenements",
    flagType: "suisse",
  },
  {
    id: "luxembourg",
    name: "LUXEMBOURG",
    country: "",
    subtitle: "ENTREPRENDRE & SE DÉVELOPPER",
    image: destLuxembourg,
    href: "/evenements",
    flagType: "luxembourg",
  },
  {
    id: "belgique",
    name: "BELGIQUE",
    country: "",
    subtitle: "RÉSEAUX & OPPORTUNITÉS",
    image: destBelgique,
    href: "/evenements",
    flagType: "belgique",
  },
];

/* ─── Mini-drapeaux CSS ─── */
function FlagCSS({ type }: { type: string }) {
  const base = "shrink-0 w-14 h-14 md:w-18 md:h-18 rounded-lg overflow-hidden shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500";

  if (type === "france") {
    return (
      <div className={base} style={{ display: "flex" }}>
        <div style={{ flex: 1, background: "#002395" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#ED2939" }} />
      </div>
    );
  }
  if (type === "suisse") {
    return (
      <div className={base} style={{ background: "#FF0000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Croix blanche suisse responsive */}
        <div style={{ position: "relative", width: "40%", height: "40%" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "25%", background: "#fff", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "25%", background: "#fff", transform: "translateX(-50%)" }} />
        </div>
      </div>
    );
  }
  if (type === "luxembourg") {
    return (
      <div className={base} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "#EF3340" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#00A1DE" }} />
      </div>
    );
  }
  if (type === "belgique") {
    return (
      <div className={base} style={{ display: "flex" }}>
        <div style={{ flex: 1, background: "#000000" }} />
        <div style={{ flex: 1, background: "#FAE042" }} />
        <div style={{ flex: 1, background: "#EF3340" }} />
      </div>
    );
  }
  return null;
}

/* ─── Services inclus ─── */
const services = [
  { icon: Network, label: "Networking", sub: "qualifié" },
  { icon: Utensils, label: "Expériences", sub: "gastronomiques" },
  { icon: Handshake, label: "Rencontres", sub: "d'affaires exclusives" },
  { icon: TrendingUp, label: "Développement", sub: "de partenariats" },
  { icon: Camera, label: "Découverte", sub: "des territoires" },
  { icon: UserCheck, label: "Accompagnement", sub: "personnalisé" },
];

export default function Offers() {
  return (
    <div className="pt-32 pb-20 container">


      {/* ══════════════════════════════════════════════
          BANNIÈRE — BUSINESS EXPERIENCE INTERNATIONAL
         ══════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_80px_-20px_rgba(197,160,89,0.25)] mb-20 bg-[#0a0d0f]">

        <div className="grid lg:grid-cols-[38%_62%]">

          {/* ── Colonne gauche ── */}
          <div className="p-8 md:p-12 flex flex-col gap-6">

            {/* Badge NOUVEAU */}
            <div className="self-start px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] font-bold border border-gold/50 text-gold-light rounded-sm bg-gold/5">
              Nouveau
            </div>

            {/* Titre principal */}
            <div>
              <div className="font-display text-5xl md:text-6xl leading-none uppercase text-white mb-1">
                Business
              </div>
              <div className="font-display text-5xl md:text-6xl leading-none uppercase gold-text mb-2">
                Experience
              </div>
              <div className="text-[11px] uppercase tracking-[0.4em] text-foreground/60 border-t border-b border-gold/20 py-2 mt-3">
                — International —
              </div>
            </div>

            {/* 3 Piliers cliquables */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: "Connecter", sub: "les dirigeants" },
                { icon: Diamond, label: "Valoriser", sub: "les territoires" },
                { icon: Handshake, label: "Créer", sub: "des opportunités" },
              ].map(({ icon: Icon, label, sub }) => (
                <button
                  key={label}
                  onClick={() => {/* TODO: redirection */ }}
                  className="flex flex-col items-center gap-2 p-3 rounded-sm border border-gold/10 bg-gold/5 hover:border-gold/40 hover:bg-gold/10 transition-all duration-300 group text-center"
                >
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center group-hover:border-gold/60 transition-colors">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-gold-light font-semibold leading-tight">{label}</div>
                  <div className="text-[8px] uppercase tracking-[0.15em] text-foreground/50 leading-tight">{sub}</div>
                </button>
              ))}
            </div>

            {/* Accroche */}
            <p className="text-sm text-foreground/70 font-semibold text-center leading-relaxed border-t border-b border-gold/10 py-4">
              4 DESTINATIONS D'EXCEPTION.<br />
              <span className="text-foreground/50 font-normal text-xs">
                UN SEUL OBJECTIF : DES RENCONTRES QUI<br />
                TRANSFORMENT VOS AMBITIONS EN OPPORTUNITÉS.
              </span>
            </p>

            {/* Encadré services */}
            <div className="rounded-sm border border-gold/25 bg-gold/5 p-5">
              <div className="text-[9px] uppercase tracking-[0.3em] text-gold-light font-bold text-center mb-4">
                Des week-ends premium clés en main
              </div>
              <div className="grid grid-cols-2 gap-3">
                {services.map(({ icon: Icon, label, sub }) => (
                  <button
                    key={label}
                    onClick={() => {/* TODO: redirection */ }}
                    className="flex items-start gap-2.5 text-left hover:opacity-80 transition-opacity group"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-sm border border-gold/20 bg-gold/5 flex items-center justify-center group-hover:border-gold/50 transition-colors mt-0.5">
                      <Icon size={13} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-foreground/80 font-semibold leading-tight">{label}</div>
                      <div className="text-[8px] uppercase tracking-[0.12em] text-foreground/40 leading-tight mt-0.5">{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pied de colonne gauche */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gold/10 mt-auto">
              <p className="text-[9px] uppercase tracking-[0.15em] text-foreground/50 leading-relaxed max-w-[200px]">
                Une expérience conçue pour les entrepreneurs, dirigeants, investisseurs et décideurs.
              </p>
              <p className="font-serif italic text-sm text-gold-light text-center sm:text-right">
                Votre passerelle vers<br />
                <em>de nouveaux écosystèmes d'affaires.</em>
              </p>
              <Link
                to="/contact"
                className="shrink-0 flex items-center gap-2 px-5 py-3 btn-gold rounded-sm text-[9px] uppercase tracking-[0.25em] font-bold"
              >
                <Mail size={13} />
                Pré-inscriptions<br />ouvertes
              </Link>
            </div>
          </div>

          {/* ── Colonne droite — 4 destinations cliquables (effet voile) ── */}
          <div className="relative">
            {/* Définition SVG du clip-path voile : bordure gauche en arc concave */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
              <defs>
                <clipPath id="dest-veil-clip" clipPathUnits="objectBoundingBox">
                  {/* Courbe convexe sur le bord gauche : arc qui bombe vers la GAUCHE, réduit à 8% de protrusion */}
                  <path d="M 0.0 0 C 0.08 0.25 0.08 0.75 0.0 1 L 1 1 L 1 0 Z" />
                </clipPath>
              </defs>
            </svg>

            <div
              className="flex flex-col"
              style={{ clipPath: "url(#dest-veil-clip)" }}
            >
              {destinations.map((dest, i) => (
                <Link
                  key={dest.id}
                  to={dest.href}
                  className={`relative flex-1 group overflow-hidden cursor-pointer min-h-[230px] ${i < destinations.length - 1 ? "border-b border-gold/10" : ""}`}
                >
                  {/* Image de fond */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                  />
                  {/* Dégradé sombre renforcé à gauche pour fusionner avec le voile */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0f]/95 via-[#0a0d0f]/50 to-transparent" />

                  {/* Contenu décalé vers la droite pour ne pas être caché par le voile */}
                  <div className="relative z-10 h-full flex items-center pl-16 md:pl-24 pr-6 py-5 justify-between gap-4">
                    {/* Texte gauche */}
                    <div className="flex flex-col gap-1.5">
                      <div className="font-display text-2xl md:text-3xl italic text-white tracking-wide group-hover:text-gold-light transition-colors duration-300">
                        {dest.name}
                      </div>
                      {dest.country && (
                        <div className="text-[10px] uppercase tracking-[0.28em] text-gold">{dest.country}</div>
                      )}
                      {dest.subtitle && (
                        <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60 group-hover:text-gold/80 transition-colors">{dest.subtitle}</div>
                      )}
                    </div>

                    {/* Drapeau CSS aux couleurs réelles du pays */}
                    <FlagCSS type={dest.flagType} />
                  </div>

                  {/* Flèche hover */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={18} className="text-gold-light" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Barre footer ── */}
        <div className="border-t border-gold/15 bg-gold/5 py-3">
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap px-6">
            {["Networking", "Découverte", "Partage", "Croissance"].map((item, i) => (
              <span key={item} className="flex items-center gap-3 md:gap-6">
                <span className="text-[9px] uppercase tracking-[0.35em] text-foreground/50 hover:text-gold-light transition-colors cursor-pointer">{item}</span>
                {i < 3 && <span className="text-gold/20 text-xs">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── En-tête formules ── */}
      {/* 
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">Nos formules</div>
        <h2 className="font-display text-5xl md:text-7xl leading-[0.95]">
          Trois portes. <em className="italic gold-text">Un seul cercle.</em>
        </h2>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">
          Chaque expérience est sur-mesure. Voici nos cadres de référence.
        </p>
      </div>
      */}

      {/* ── Cartes formules ── */}

      <div className="grid lg:grid-cols-3 gap-6">
        {offers.map((o, i) => {
          const price = computeFinalPrice(o);
          const featured = i === 1;
          return (
            <div key={o.id} className={`luxe-card rounded-sm p-8 flex flex-col ${featured ? "border-gold/60 lg:-translate-y-4 shadow-[0_30px_80px_-30px_hsl(42_60%_54%/0.4)]" : ""}`}>
              {o.badge && <div className="self-start px-3 py-1 mb-4 text-[10px] uppercase tracking-[0.22em] gold-border rounded-sm text-gold-light">{o.badge}</div>}
              <div className="font-display text-3xl mb-2">{o.name}</div>
              <div className="text-sm text-muted-foreground font-serif italic mb-6">{o.tagline}</div>
              {/* <div className="mb-6">
                <div className="font-display text-5xl gold-text">{price.toLocaleString("fr-FR")} €</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">par personne · TTC</div>
              </div> */}
              <div className="hairline mb-6" />
              <ul className="space-y-3 mb-8 flex-1">
                {o.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/experience" className={`${featured ? "btn-gold" : "btn-ghost-gold"} text-center px-6 py-3.5 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3`}>
                Choisir <ArrowRight size={14} />
              </Link>
              {/* <details className="mt-6 group">
                <summary className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground cursor-pointer hover:text-primary">Détail des coûts</summary>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground font-mono">
                  <div className="flex justify-between"><span>Hôtellerie</span><span>{o.costBreakdown.hotel} €</span></div>
                  <div className="flex justify-between"><span>Gastronomie</span><span>{o.costBreakdown.dining} €</span></div>
                  <div className="flex justify-between"><span>Activités</span><span>{o.costBreakdown.activity} €</span></div>
                  <div className="flex justify-between"><span>Commissions</span><span>{o.costBreakdown.commission} €</span></div>
                  <div className="flex justify-between border-t border-border pt-1 mt-1"><span>Marge ({Math.round(o.margin * 100)}%)</span><span className="text-gold">+{price - (o.costBreakdown.hotel + o.costBreakdown.dining + o.costBreakdown.activity + o.costBreakdown.commission)} €</span></div>
                </div>
              </details> */}
            </div>
          );
        })}
      </div>


      <div className="mt-20 text-center">
        <Crown size={28} className="mx-auto text-primary mb-4" />
        <h2 className="font-display text-3xl mb-3">Au-delà du sur-mesure ?</h2>
        <p className="text-muted-foreground mb-6 font-serif italic">Notre offre Atelier compose à 100 %. Sur demande qualifiée uniquement.</p>
        <Link to="/contact" className="btn-ghost-gold inline-flex px-7 py-3 text-xs uppercase tracking-[0.22em] rounded-sm items-center gap-3">Solliciter l'Atelier <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
