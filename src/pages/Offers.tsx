import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getOffers, computeFinalPrice } from "@/data/mockData";
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


export default function Offers() {
  const { t } = useLanguage();
  const offers = getOffers(t);

  const destinations = [
    {
      id: "champagne",
      name: t("offers.destinations.champagne.name"),
      country: t("offers.destinations.champagne.country"),
      subtitle: t("offers.destinations.champagne.subtitle"),
      image: destChampagne,
      href: "/sejour#a-venir",
      flagType: "france",
    },
    {
      id: "suisse",
      name: t("offers.destinations.suisse.name"),
      country: t("offers.destinations.suisse.country"),
      subtitle: t("offers.destinations.suisse.subtitle"),
      image: destSuisse,
      href: "/sejour#a-venir",
      flagType: "suisse",
    },
    {
      id: "luxembourg",
      name: t("offers.destinations.luxembourg.name"),
      country: t("offers.destinations.luxembourg.country"),
      subtitle: t("offers.destinations.luxembourg.subtitle"),
      image: destLuxembourg,
      href: "/sejour#a-venir",
      flagType: "luxembourg",
    },
    {
      id: "belgique",
      name: t("offers.destinations.belgique.name"),
      country: t("offers.destinations.belgique.country"),
      subtitle: t("offers.destinations.belgique.subtitle"),
      image: destBelgique,
      href: "/sejour#a-venir",
      flagType: "belgique",
    },
  ];
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
                  <div className="flex-1 text-[14px] font-ubuntu text-foreground/90 leading-relaxed space-y-4 mb-8">
                    <div className="space-y-3">
                      <div 
                        onClick={() => toggleService('sejours')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">✈️</span> {t("offers.accordion.sejours")}</span>
                        {activeServices.includes('sejours') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('sejours') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.decouverte")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.rencontres_ent")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.exp_immersives")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.partage")}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('participants')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">🌍</span> {t("offers.accordion.valeur_participants")}</span>
                        {activeServices.includes('participants') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('participants') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.reseau")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.ouverture")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.partenariats")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.opportunites")}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('territoires')}
                        className="custom-accordion-header"
                      >
                        <span className="flex items-center"><span className="mr-2">📈</span> {t("offers.accordion.valeur_territoires")}</span>
                        {activeServices.includes('territoires') ? <ChevronUp size={16} className="text-white/70" /> : <ChevronDown size={16} className="text-white/70" />}
                      </div>
                      {activeServices.includes('territoires') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.visibilite")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.attractivite")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.valorisation")}</div>
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
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.comprehension")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Positionnement &amp; stratégie</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.contenus")}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold/10 pt-4 space-y-3">
                      <div 
                        onClick={() => toggleService('amplification')}
                        className="custom-accordion-header"
                      >
                        <span>{t("offers.accordion.amplification")}</span>
                        {activeServices.includes('amplification') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('amplification') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.diffusion")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">Valorisation &amp; storytelling</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.activation")}</div>
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
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.event_dedie")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.rencontres_ciblees")}</div>
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
                        <span className="flex items-center">{t("offers.accordion.diagnostic")}</span>
                        {activeServices.includes('diagnostic') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('diagnostic') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.identifier_taches")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.reperer_opportunites")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.mesurer_gains")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.definir_priorites")}</div>
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
                        <span className="flex items-center">{t("offers.accordion.automatisation")}</span>
                        {activeServices.includes('automatisation') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('automatisation') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.gerer_emails")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.repondre_appels")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.cr_reunion")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.creer_docs")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.reduire_taches")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.outils_ensemble")}</div>
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
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.creer_contenu_facile")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.animer_reseaux")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.ameliorer_google")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.preparer_supports")}</div>
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
                        <span className="flex items-center">{t("offers.accordion.commercial")}</span>
                        {activeServices.includes('commercial') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('commercial') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.trouver_clients")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.identifier_prospects")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.preparer_rdv")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.suivre_opportunites")}</div>
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
                        <span className="flex items-center">{t("offers.accordion.ia")}</span>
                        {activeServices.includes('ia') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('ia') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.utiliser_chatgpt")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.creer_assistants")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.exploiter_copilot")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.retrouver_infos")}</div>
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
                        <span className="flex items-center">{t("offers.accordion.formation")}</span>
                        {activeServices.includes('formation') ? <ChevronUp size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" /> : <ChevronDown size={24} className="text-gold animate-attention drop-shadow-[0_0_6px_rgba(197,160,89,0.7)]" />}
                      </div>
                      {activeServices.includes('formation') && (
                        <div className="custom-service-content">
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.decouvrir_usages")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.apprendre_cas")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.prendre_en_main")}</div>
                          </div>
                          <div className="custom-service-item">
                            <div className="font-medium text-foreground/90">{t("offers.accordion.items.accompagner_changement")}</div>
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
                  {t("offers.choose")} <ArrowRight size={14} />
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
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">

            {/* Badge NOUVEAU */}
            <div className="self-start px-4 py-1 text-[10px] uppercase tracking-[0.3em] font-bold border border-gold/50 text-gold-light rounded-sm bg-gold/5">
              {t("offers.banner.new")}
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
              {t("offers.banner.destinations_text1")}<br />
              <span className="text-foreground/50 font-normal text-xs">
                {t("offers.banner.destinations_text2").split("\\n")[0]}<br />
                {t("offers.banner.destinations_text2").split("\\n")[1]}
              </span>
            </p>



            {/* Pied de colonne gauche */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gold/10 mt-auto w-full">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                {t("offers.banner.pre_registrations").split("\\n").map((line: string, i: number) => <span key={i}>{line}<br /></span>)}
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
              className="flex flex-col lg:[clip-path:url(#dest-veil-clip)]"
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
            {(t("offers.banner.footer") as unknown as string[]).map((item, i) => (
              <span key={item} className="flex items-center gap-3 md:gap-6">
                <span className="text-[9px] uppercase tracking-[0.35em] text-foreground/50 hover:text-gold-light transition-colors cursor-pointer">{item}</span>
                {i < 3 && <span className="text-gold/20 text-xs">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-32 border-y border-gold/10 bg-black/20 py-24 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 relative overflow-hidden">
        <div className="text-center mb-12">
          <div className="eyebrow mb-4">Partenaires & Membres</div>
          <h2 className="font-display text-3xl">Ils nous font confiance</h2>
        </div>
        
        <div className="relative flex overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6 md:gap-10 px-3 md:px-5 items-center">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="w-40 md:w-56 h-28 luxe-card rounded-sm flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default p-4 text-center">
                    <span className="font-display text-xs md:text-sm text-foreground/40 font-bold tracking-[0.2em] uppercase leading-tight">En cours de mise à jour</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
