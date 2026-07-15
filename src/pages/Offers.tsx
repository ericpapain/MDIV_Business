import { useState } from "react";
import { offers, computeFinalPrice } from "@/data/mockData";
import { Check, ArrowRight, Crown, Users, Diamond, Handshake, Network, Utensils, TrendingUp, Camera, UserCheck, Mail, Globe, Cpu, Compass, Rocket, Target, Zap, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import destChampagne from "@/assets/original/dest-champagne.png";
import destSuisse from "@/assets/original/dest-suisse.png";
import destLuxembourg from "@/assets/original/dest-luxembourg.png";
import destBelgique from "@/assets/original/dest-belgique.png";

function CountryFlag({ type, className }: { type: string; className?: string }) {
  const base = `w-12 h-8 border border-white/10 shrink-0 rounded-xs ${className || ""}`;
  if (type === "france") {
    return (
      <div className={base} style={{ display: "flex" }}>
        <div style={{ flex: 1, background: "#0055A5" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#E70020" }} />
      </div>
    );
  }
  if (type === "suisse") {
    return (
      <div className={`${base} bg-[#D81E05] flex items-center justify-center`} style={{ position: "relative" }}>
        <div style={{ width: "3px", height: "14px", background: "#FFFFFF", position: "absolute" }} />
        <div style={{ width: "14px", height: "3px", background: "#FFFFFF", position: "absolute" }} />
      </div>
    );
  }
  if (type === "luxembourg") {
    return (
      <div className={base} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "#EA1821" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#00A3E0" }} />
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
  const [activeServices, setActiveServices] = useState<string[]>([]);

  const toggleService = (serviceId: string) => {
    if (activeServices.includes(serviceId)) {
      setActiveServices(activeServices.filter(s => s !== serviceId));
    } else {
      setActiveServices([...activeServices, serviceId]);
    }
  };

  return (
    <div className="pt-24 pb-12 container">

      {/* ── Cartes formules ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-12">
        {offers.map((o, i) => {
          const price = computeFinalPrice(o);
          const featured = i === 1;
          let IconComp = () => (
            <div className="relative flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/15 transition-colors duration-700" />
              <Globe size={80} strokeWidth={0.5} className="text-gold/20 absolute group-hover:rotate-180 transition-transform duration-1000" />
              <Compass size={36} strokeWidth={1.5} className="text-gold-light relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <Sparkles size={16} strokeWidth={1.5} className="text-primary absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          );

          if (o.id === "investor") {
            IconComp = () => (
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/15 transition-colors duration-700" />
                <Target size={80} strokeWidth={0.5} className="text-gold/20 absolute group-hover:scale-110 transition-transform duration-1000" />
                <Rocket size={36} strokeWidth={1.5} className="text-gold-light relative z-10 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform duration-500" />
                <Sparkles size={16} strokeWidth={1.5} className="text-primary absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
              </div>
            );
          }

          if (o.id === "exclusive") {
            IconComp = () => (
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/15 transition-colors duration-700" />
                <Cpu size={80} strokeWidth={0.5} className="text-gold/20 absolute group-hover:rotate-90 transition-transform duration-1000" />
                <Zap size={36} strokeWidth={1.5} className="text-gold-light relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <Sparkles size={16} strokeWidth={1.5} className="text-primary absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          }

          return (
            <div key={o.id} className={`luxe-card overflow-hidden rounded-sm flex flex-col ${featured ? "border-gold/60 lg:-translate-y-4 shadow-[0_30px_80px_-30px_hsl(42_60%_54%/0.4)]" : ""}`}>
              <div className="w-full h-48 relative overflow-hidden group bg-gradient-to-br from-background via-background to-gold/5 flex items-center justify-center border-b border-gold/10">
                <div className="absolute inset-0 bg-noise opacity-20" />
                <IconComp />
                {o.badge && <div className="absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-[0.22em] gold-border rounded-sm bg-emerald-deep/90 text-gold-light shadow-lg z-20">{o.badge}</div>}
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="font-display text-3xl mb-2">{o.name}</div>
                <div className="text-sm text-muted-foreground font-serif italic mb-6">{o.tagline}</div>
                <div className="hairline mb-6" />
                {o.id === 'networking' ? (
                  <div className="flex-1 text-[14px] font-ubuntu text-foreground/90 leading-relaxed space-y-4">
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('sejours')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">✈️</span> Séjours immersifs</span>
                        {activeServices.includes('sejours') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('sejours') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Découverte d'un territoire</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Rencontres entrepreneuriales</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Expériences immersives</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Moments de partage</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('participants')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">🌍</span> Valeur participants</span>
                        {activeServices.includes('participants') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('participants') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Réseau</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Ouverture internationale</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Partenariats</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Opportunités</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('territoires')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">📈</span> Valeur territoires</span>
                        {activeServices.includes('territoires') ? <ChevronUp size={16} className="text-white/70" /> : <ChevronDown size={16} className="text-white/70" />}
                      </div>
                      {activeServices.includes('territoires') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Visibilité</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Attractivité</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Valorisation économique</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : o.id === 'investor' ? (
                  <div className="flex-1 text-[14px] font-ubuntu text-foreground/90 leading-relaxed space-y-4 mb-8">
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('analyse')}
                        className="custom-accordion-header"
                      >
                        <span>1️⃣ Analyse &amp; Construction</span>
                        {activeServices.includes('analyse') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('analyse') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Compréhension du besoin</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Positionnement &amp; stratégie</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Création de contenus</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('amplification')}
                        className="custom-accordion-header"
                      >
                        <span>2️⃣ Amplification</span>
                        {activeServices.includes('amplification') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('amplification') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Diffusion digitale</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Valorisation &amp; storytelling</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Activation du réseau</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('connexion')}
                        className="custom-accordion-header"
                      >
                        <span>3️⃣ Connexion &amp; Développement</span>
                        {activeServices.includes('connexion') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('connexion') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Événement dédié</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Rencontres ciblées</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Mises en relation &amp; suivi</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-4 mb-8 text-[14px]">
                    {/* Diagnostic */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('diagnostic')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">🤖 Diagnostic IA</span>
                        {activeServices.includes('diagnostic') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('diagnostic') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Identifier les tâches qui prennent du temps</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Repérer les opportunités d'amélioration</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Mesurer les gains possibles</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Définir les priorités d'action</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Automatisation */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('automatisation')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">⚡ Automatisation</span>
                        {activeServices.includes('automatisation') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('automatisation') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Gérer les emails plus rapidement</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Répondre aux appels d'offres</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Créer des comptes-rendus de réunion automatiquement</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Créer des documents automatiquement</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Réduire les tâches répétitives</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Faire travailler les outils ensemble</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Communication */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('communication')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">📣 Communication &amp; Visibilité</span>
                        {activeServices.includes('communication') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('communication') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Créer du contenu facilement</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Animer les réseaux sociaux</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Améliorer la visibilité sur Google</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Préparer des supports professionnels</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Commercial */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('commercial')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">📈 Développement Commercial</span>
                        {activeServices.includes('commercial') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('commercial') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Trouver de nouveaux clients</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Identifier les prospects prioritaires</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Préparer les rendez-vous</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Suivre les opportunités commerciales</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* IA */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('ia')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">🧠 IA Générative</span>
                        {activeServices.includes('ia') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('ia') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Utiliser efficacement ChatGPT et les IA gratuites</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Créer des assistants IA sur mesure</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Exploiter Microsoft Copilot</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Retrouver facilement les informations utiles</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Formation */}
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('formation')} 
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center">🎓 Formation des Équipes</span>
                        {activeServices.includes('formation') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('formation') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Découvrir les usages de l'IA</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Apprendre par des cas concrets</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Prendre en main les outils</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Accompagner le changement</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <Link 
                  to={o.id === 'networking' ? "/sejour#a-venir" : "/contact"} 
                  className={`${featured ? "btn-gold" : "btn-ghost-gold"} text-center px-6 py-3.5 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3 mt-auto`}
                >
                  Choisir <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════
          BANNIÈRE — BUSINESS EXPERIENCE INTERNATIONAL
         ══════════════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_80px_-20px_rgba(197,160,89,0.25)] bg-[#0a0d0f]">

        <div className="grid lg:grid-cols-[38%_62%]">

          {/* ── Colonne gauche ── */}
          <div className="p-6 md:p-8 flex flex-col gap-4">

            {/* Badge NOUVEAU */}
            <div className="self-start px-4 py-1 text-[10px] uppercase tracking-[0.3em] font-bold border border-gold/50 text-gold-light rounded-sm bg-gold/5">
              Nouveau
            </div>

            {/* Titre principal */}
            <div>
              <div className="font-display text-4xl md:text-5xl leading-none uppercase text-white mb-1">
                Business
              </div>
              <div className="font-display text-4xl md:text-5xl leading-none uppercase gold-text mb-2">
                Experience
              </div>
              <div className="text-[11px] uppercase tracking-[0.4em] text-foreground/60 border-t border-b border-gold/20 py-2 mt-2">
                — International —
              </div>
            </div>



            {/* Accroche */}
            <p className="text-sm text-foreground/70 font-semibold text-center leading-relaxed border-t border-b border-gold/10 py-4">
              4 DESTINATIONS D'EXCEPTION.<br />
              <span className="text-foreground/50 font-normal text-xs">
                UN SEUL OBJECTIF : DES RENCONTRES QUI<br />
                TRANSFORMENT VOS AMBITIONS EN OPPORTUNITÉS.
              </span>
            </p>



            {/* Pied de colonne gauche */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-gold/10 mt-auto w-full">
              <div className="flex items-center gap-1.5">
                <CountryFlag type="france" />
                <CountryFlag type="suisse" />
                <CountryFlag type="luxembourg" />
                <CountryFlag type="belgique" />
              </div>
              <Link
                to="/sejour#a-venir"
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 btn-gold rounded-sm text-[9px] uppercase tracking-[0.25em] font-bold"
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
                  className={`relative flex-1 group overflow-hidden cursor-pointer min-h-[100px] ${i < destinations.length - 1 ? "border-b border-gold/10" : ""}`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d0f]/95 via-[#0a0d0f]/50 to-transparent" />

                  <div className="relative z-10 h-full flex items-center pl-10 md:pl-16 pr-6 py-3 justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-display text-xl md:text-2xl italic text-white tracking-wide group-hover:text-gold-light transition-colors duration-300">
                        {dest.name}
                      </div>
                      {dest.country && (
                        <div className="text-[10px] uppercase tracking-[0.28em] text-gold">{dest.country}</div>
                      )}
                      {dest.subtitle && (
                        <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60 group-hover:text-gold/80 transition-colors">{dest.subtitle}</div>
                      )}
                    </div>

                    <CountryFlag type={dest.flagType} />
                  </div>

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

      <div className="mt-20 text-center">
        <Crown size={28} className="mx-auto text-primary mb-4" />
        <h2 className="font-display text-3xl mb-3">Au-delà du sur-mesure ?</h2>
        <p className="text-muted-foreground mb-6 font-serif italic">Notre offre Atelier compose à 100 %. Sur demande qualifiée uniquement.</p>
        <Link to="/contact" className="btn-ghost-gold inline-flex px-7 py-3 text-xs uppercase tracking-[0.22em] rounded-sm items-center gap-3">Solliciter l'Atelier <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
