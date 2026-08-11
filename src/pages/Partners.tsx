import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building, Search, Users, Calendar, Globe, Lightbulb, Eye, TrendingUp, Plane, Handshake, Shield, ChevronDown, Star, Send, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import partnersHero from "@/assets/partners_hands_map_solid.png";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

/* ─── Accordion ─── */
const AccordionSection = ({ index, eyebrow, title, isActive, onClick, children }: { index: number; eyebrow: string; title: string; isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
  <section className="scroll-spy-section relative animate-fade-up" data-index={index}>
    <div className="cursor-pointer group flex items-start justify-between" onClick={onClick}>
      <div className="flex-1">
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h2 className="font-display text-lg md:text-xl gold-text transition-colors">{title}</h2>
      </div>
      <div className="mt-4 ml-4 flex-shrink-0">
        <motion.div initial={false} animate={{ rotate: isActive ? 180 : 0, opacity: isActive ? 0 : 1 }} transition={{ duration: 0.3 }}>
          {!isActive && <ChevronDown className="text-gold/60 w-6 h-6 transition-transform group-hover:scale-110" />}
        </motion.div>
      </div>
    </div>
    <div className={`hairline mt-2 mb-2 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
    <AnimatePresence>
      {isActive && (
        <motion.div initial={{ height: 0, opacity: 0, y: 30 }} animate={{ height: "auto", opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
          <div className="pt-2 pb-2 max-h-[45vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </section>
);

/* ─── Emoji Wrapper to fix Windows rendering & Convert Flags to Images ─── */
const Emoji = ({ symbol }: { symbol: string }) => {
  if (!symbol) return null;
  const chars = Array.from(symbol);
  if (chars.length >= 2) {
    const cp1 = chars[0].codePointAt(0);
    const cp2 = chars[1].codePointAt(0);
    if (cp1 && cp2 && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff && cp2 >= 0x1f1e6 && cp2 <= 0x1f1ff) {
      const code = String.fromCharCode(cp1 - 0x1f1e6 + 97) + String.fromCharCode(cp2 - 0x1f1e6 + 97);
      return <img src={`https://flagcdn.com/w40/${code}.png`} alt={symbol} className="w-8 h-auto object-contain inline-block drop-shadow-sm rounded-[2px]" />;
    }
  }
  return (
    <span style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>
      {symbol}
    </span>
  );
};

/* ─── Snap Carousel with Auto-Scroll & Buttons ─── */
function SnapCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!ref.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      // Scroll by 1 card approximately
      const cardWidth = 320; 
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        ref.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        ref.current.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const next = () => ref.current?.scrollBy({ left: 320, behavior: "smooth" });
  const prev = () => ref.current?.scrollBy({ left: -320, behavior: "smooth" });

  return (
    <div className="relative group">
      <button onClick={prev} className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
        <ChevronLeft size={18} />
      </button>
      <div ref={ref} className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </div>
      <button onClick={next} className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted z-10 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── Ambassador Card ─── */
function AmbassadorCard({ amb, isEn, onContact, onClick }: { amb: any; isEn: boolean; onContact: (e: React.MouseEvent) => void; onClick: () => void }) {
  const expertiseList = (amb.expertises || "").split(",").map((e: string) => e.trim()).filter(Boolean);
  return (
    <div onClick={onClick} className="luxe-card cursor-pointer rounded-xl px-4 py-3 relative overflow-hidden group h-full flex flex-col min-w-[280px] max-w-[320px] mx-auto w-full hover:border-gold/50 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/15 transition-colors" />
      <div className="flex items-start gap-4 mb-3 relative z-10">
        <div className="text-3xl"><Emoji symbol={amb.flag || '🌍'} /></div>
        <div>
          <div className="font-display text-lg">{amb.country}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{amb.zone}</div>
        </div>
      </div>
      {amb.logo_url && (
        <div className="mb-3 flex justify-center h-32 relative z-10">
          <img src={amb.logo_url.startsWith('http') || amb.logo_url.startsWith('/') ? amb.logo_url : `/${amb.logo_url}`}
            alt={amb.country} className="h-full w-full object-contain rounded-lg" />
        </div>
      )}
      {amb.company && (
        <div className="mb-3 text-center relative z-10">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{isEn ? "Company" : "Entreprise"}</div>
          <div className="font-semibold text-sm">{amb.company}</div>
        </div>
      )}
      {expertiseList.length > 0 && (
        <div className="mb-2 relative z-10">
          <div className="text-[9px] uppercase tracking-[0.2em] text-gold mb-2 text-center">{isEn ? "Expertise" : "Expertises"}</div>
          <ul className="space-y-1">
            {expertiseList.slice(0, 3).map((exp: string, i: number) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold/60 shrink-0" /> <span className="line-clamp-1">{exp}</span>
              </li>
            ))}
            {expertiseList.length > 3 && (
              <li className="text-[10px] text-muted-foreground text-center italic mt-1">+{expertiseList.length - 3} {isEn ? "more" : "autres"}...</li>
            )}
          </ul>
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-1.5 my-2 mt-auto relative z-10">
        <img src="/assets/Badge/bne_ambassador_badge.png" alt="BNE Ambassador" className="w-10 h-10 object-contain" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-gold text-center">BNE Ambassador</span>
      </div>
      <div className="pt-2 border-t border-border/50 relative z-10">
        <button onClick={onContact} className="btn-gold w-full py-2 text-[10px] uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 hover:brightness-110">
          <Handshake size={12} /> {isEn ? "Request Introduction" : "Mise en relation"}
        </button>
      </div>
    </div>
  );
}

/* ─── Partner Card ─── */
function PartnerCard({ partner, isEn, onContact, onClick }: { partner: any; isEn: boolean; onContact: (e: React.MouseEvent) => void; onClick: () => void }) {
  return (
    <div onClick={onClick} className="luxe-card cursor-pointer rounded-xl px-4 py-3 relative overflow-hidden group h-full flex flex-col min-w-[280px] max-w-[320px] mx-auto w-full hover:border-gold/50 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/15 transition-colors" />
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <div className="text-2xl"><Emoji symbol={partner.flag || '🌐'} /></div>
        <div className="text-xs text-muted-foreground line-clamp-1">{partner.country}</div>
      </div>
      {partner.logo_url ? (
        <div className="mb-2 flex justify-center items-center h-32 relative z-10">
          <img src={partner.logo_url.startsWith('http') || partner.logo_url.startsWith('/') ? partner.logo_url : `/${partner.logo_url}`}
            alt={partner.name} className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="mb-2 flex justify-center items-center h-32 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Building size={28} className="text-gold/60" />
          </div>
        </div>
      )}
      <div className="font-display text-lg mb-1 text-center line-clamp-1 relative z-10">{partner.name}</div>
      <div className="text-[11px] text-muted-foreground mb-3 text-center line-clamp-2 relative z-10">{partner.sector || partner.category}</div>
      
      <div className="flex flex-col items-center justify-center gap-1.5 my-2 mt-auto relative z-10">
        <img src="/assets/Badge/bne_partner_badge.png" alt="BNE Partner" className="w-10 h-10 object-contain" />
        <span className="text-[9px] uppercase tracking-[0.2em] text-gold text-center">BNE Partner</span>
      </div>
      <div className="pt-2 border-t border-border/50 relative z-10">
        <button onClick={onContact} className="btn-gold w-full py-2 text-[10px] uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 hover:brightness-110">
          <Handshake size={12} /> {isEn ? "Request Introduction" : "Mise en relation"}
        </button>
      </div>
    </div>
  );
}

/* ─── Field Component ─── */
function Field({ label, name, type = "text", textarea, required, defaultValue, rows = 3 }: { label: string; name: string; type?: string; textarea?: boolean; required?: boolean; defaultValue?: string; rows?: number }) {
  const cls = "w-full bg-muted/40 border border-border rounded-sm px-3 py-2 text-xs outline-none focus:border-gold/60 transition-colors placeholder:text-muted-foreground/40";
  return (
    <div className="h-full flex flex-col justify-end">
      <div className="uppercase tracking-[0.2em] text-muted-foreground flex items-start gap-1.5 text-[9px] mb-1">
        {label} {required && <span className="text-gold">*</span>}
      </div>
      {textarea ? <textarea name={name} rows={rows} defaultValue={defaultValue} required={required} className={cls} /> : <input name={name} type={type} defaultValue={defaultValue} required={required} className={cls} />}
    </div>
  );
}

export default function Partners() {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<number>(1);
  const [applicationType, setApplicationType] = useState<"partner" | "ambassador">("partner");
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null); // For Modal

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.25) setActiveAccordion(1);
    else if (latest < 0.50) setActiveAccordion(2);
    else if (latest < 0.75) setActiveAccordion(3);
    else setActiveAccordion(4);
  });

  const { data: ambassadors = [] } = useQuery({
    queryKey: ["public-ambassadors"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=ambassadors");
      const json = await res.json();
      return json.success ? (json.data || []) : [];
    }
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["public-partners"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=partners");
      const json = await res.json();
      return json.success ? (json.data || []) : [];
    }
  });

  const handleContactAmbassador = (e: React.MouseEvent, amb: any) => {
    e.stopPropagation(); // Prevent opening modal
    const subject = isEn ? `Request for introduction with a BNE Ambassador in ${amb.country}` : `Demande de mise en relation avec un ambassadeur BNE en ${amb.country}`;
    const msg = `--- ${isEn ? 'Ambassador Info' : 'Infos Ambassadeur'} ---
${isEn ? 'Country' : 'Pays'} : ${amb.country}
${isEn ? 'Company' : 'Entreprise'} : ${amb.company || 'N/A'}
Zone : ${amb.zone}
Expertise : ${amb.expertises}\n\n`;
    navigate(`/contact?subject=${encodeURIComponent(subject)}&msg=${encodeURIComponent(msg)}`);
  };

  const handleContactPartner = (e: React.MouseEvent, partner: any) => {
    e.stopPropagation(); // Prevent opening modal
    const subject = isEn ? `Request for introduction with partner ${partner.name}` : `Demande de mise en relation avec le partenaire ${partner.name}`;
    const msg = `--- ${isEn ? 'Partner Info' : 'Infos Partenaire'} ---
Nom : ${partner.name}
${isEn ? 'Country' : 'Pays'} : ${partner.country}
Secteur : ${partner.sector || partner.category}\n\n`;
    navigate(`/contact?subject=${encodeURIComponent(subject)}&msg=${encodeURIComponent(msg)}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) { toast.error(t("partners.form.captchaError")); return; }
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const typeLabel = applicationType === "ambassador" ? (isEn ? "Ambassador" : "Ambassadeur") : (isEn ? "Partner" : "Partenaire");
    const subject = `Candidature ${typeLabel} - M.DIV`;
    try {
      const baseData = { "h-captcha-response": captchaToken, subject, from_name: data.company || data.ambassadorName || data.name || "Candidature", replyto: data.email, "Type de candidature": typeLabel, ...data };
      const send = (key: string) => fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ access_key: key, ...baseData }) });
      await Promise.all([send("19268cb5-9f71-4363-9602-b6ad76d8d85b"), send("42f75cf0-743a-4f15-a419-1213f3de3cd8")]);
      setSent(true);
      toast.success(t("partners.form.success"));
    } catch (error: any) {
      toast.error("Erreur: " + (error.message || "Veuillez réessayer."));
    }
  };

  const missionCards = [
    { icon: <Search size={20} />, text: t("partners.section1.card1") },
    { icon: <Users size={20} />, text: t("partners.section1.card2") },
    { icon: <Calendar size={20} />, text: t("partners.section1.card3") },
    { icon: <Globe size={20} />, text: t("partners.section1.card4") },
    { icon: <Lightbulb size={20} />, text: t("partners.section1.card5") },
  ];
  const benefitCards = [
    { icon: <Eye size={22} />, title: t("partners.section2.card1Title"), desc: t("partners.section2.card1Desc") },
    { icon: <TrendingUp size={22} />, title: t("partners.section2.card2Title"), desc: t("partners.section2.card2Desc") },
    { icon: <Plane size={22} />, title: t("partners.section2.card3Title"), desc: t("partners.section2.card3Desc") },
    { icon: <Handshake size={22} />, title: t("partners.section2.card4Title"), desc: t("partners.section2.card4Desc") },
  ];
  const timelineSteps = [t("partners.section4.step1"), t("partners.section4.step2"), t("partners.section4.step3"), t("partners.section4.step4"), t("partners.section4.step5")];

  const FormBlock = () => (
    <form onSubmit={handleSubmit} className="partner-form-card glass-strong p-5 rounded-2xl relative" style={{ border: "1px solid hsl(42 60% 54% / 0.25)" }}>
      <div className="absolute top-2 left-2 w-4 h-4 border-l border-t" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
      <div className="text-center mb-4"><h3 className="font-display text-lg gold-text">{isEn ? "Application" : "Candidature"}</h3><div className="hairline mt-2" /></div>
      <div className="mb-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{isEn ? "I would like to become:" : "Je souhaite devenir :"}</div>
        <div className="flex gap-3">
          {[{ value: "partner" as const, label: isEn ? "Partner" : "Partenaire" }, { value: "ambassador" as const, label: isEn ? "Ambassador" : "Ambassadeur" }].map(opt => (
            <button key={opt.value} type="button" onClick={() => setApplicationType(opt.value)} className={`flex-1 py-2 text-xs rounded-sm border transition-all ${applicationType === opt.value ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted-foreground hover:border-gold/40'}`}>{opt.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {applicationType === "partner" ? (
          <><div className="grid grid-cols-2 gap-3"><Field label={isEn ? "Company Name" : "Nom entreprise"} name="company" required /><Field label={isEn ? "Activity Sector" : "Secteur d'activité"} name="sector" required /><Field label={isEn ? "Country" : "Pays"} name="country" /><Field label={isEn ? "Website" : "Site internet"} name="website" /><Field label={isEn ? "Contact Name" : "Nom du contact"} name="name" required /><Field label="Email" name="email" type="email" required /><Field label={isEn ? "Phone" : "Téléphone"} name="phone" type="tel" /></div><Field label={isEn ? "Company Presentation" : "Présentation de l'entreprise"} name="presentation" textarea rows={3} required /></>
        ) : (
          <><div className="grid grid-cols-2 gap-3"><Field label={isEn ? "Country Represented" : "Pays représenté"} name="ambassadorCountry" required /><Field label={isEn ? "City" : "Ville"} name="city" required /><Field label="Email" name="email" type="email" required /><Field label={isEn ? "Phone" : "Téléphone"} name="phone" type="tel" /></div><Field label={isEn ? "Company" : "Entreprise représentée"} name="company" /><Field label={isEn ? "Areas of Expertise" : "Domaines d'expertise"} name="expertises" textarea rows={2} required /><Field label={isEn ? "Languages Spoken" : "Langues parlées"} name="languages" required /><div className="grid grid-cols-2 gap-3"><Field label={isEn ? "Last Name" : "Nom"} name="lastName" required /><Field label={isEn ? "First Name" : "Prénom"} name="firstName" required /></div></>
        )}
      </div>
      {!sent && (<div className="flex justify-center py-3" style={{ transform: "scale(0.85)", transformOrigin: "center center" }}><HCaptcha sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" onVerify={(token) => setCaptchaToken(token)} theme="dark" /></div>)}
      {sent ? (
        <button type="button" onClick={() => { setSent(false); setCaptchaToken(""); }} className="btn-gold w-full py-3 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">{t("partners.form.newRequest")}</button>
      ) : (
        <button type="submit" className="btn-gold w-full py-3 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3"><Send size={13} /> {isEn ? "Send application" : "Envoyer la demande"}</button>
      )}
      <p className="text-[9px] text-muted-foreground/50 text-center leading-relaxed flex items-center justify-center gap-1 pt-1"><Shield size={9} className="shrink-0 text-primary/30" /> {t("partners.form.reassurance")}</p>
    </form>
  );

  return (
    <div className="pt-32 pb-20 bg-background min-h-screen text-foreground">
      {/* ── PROFILE MODAL ── */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedProfile(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="luxe-card bg-card border border-border/50 rounded-2xl p-6 md:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden shadow-2xl">
              <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-full transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                {selectedProfile.type === "ambassador" ? (
                  <>
                    {selectedProfile.logo_url && (
                      <img src={selectedProfile.logo_url.startsWith('http') || selectedProfile.logo_url.startsWith('/') ? selectedProfile.logo_url : `/${selectedProfile.logo_url}`} alt={selectedProfile.country} className="h-32 object-contain mb-4" />
                    )}
                    <div className="text-4xl mb-2"><Emoji symbol={selectedProfile.flag || '🌍'} /></div>
                    <h2 className="font-display text-3xl gold-text mb-1">{selectedProfile.country}</h2>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">{selectedProfile.zone}</div>
                    
                    {selectedProfile.company && (
                      <div className="w-full bg-muted/30 p-4 rounded-xl border border-border/50 mb-4">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{isEn ? "Company" : "Entreprise"}</div>
                        <div className="font-medium">{selectedProfile.company}</div>
                      </div>
                    )}
                    
                    {selectedProfile.expertises && (
                      <div className="w-full text-left bg-muted/30 p-4 rounded-xl border border-border/50 mb-6">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">{isEn ? "Areas of Expertise" : "Domaines d'expertise"}</div>
                        <ul className="space-y-2">
                          {selectedProfile.expertises.split(",").map((exp: string, i: number) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" /> {exp.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button onClick={(e) => handleContactAmbassador(e, selectedProfile)} className="btn-gold w-full py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2">
                      <Handshake size={14} /> {isEn ? "Request Introduction" : "Mise en relation"}
                    </button>
                  </>
                ) : (
                  <>
                    {selectedProfile.logo_url ? (
                      <img src={selectedProfile.logo_url.startsWith('http') || selectedProfile.logo_url.startsWith('/') ? selectedProfile.logo_url : `/${selectedProfile.logo_url}`} alt={selectedProfile.name} className="h-32 object-contain mb-4" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                        <Building size={32} className="text-gold/60" />
                      </div>
                    )}
                    <h2 className="font-display text-3xl gold-text mb-2">{selectedProfile.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Emoji symbol={selectedProfile.flag || '🌐'} /> {selectedProfile.country}
                    </div>
                    
                    <div className="w-full bg-muted/30 p-4 rounded-xl border border-border/50 mb-6">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{isEn ? "Activity Sector" : "Secteur d'activité"}</div>
                      <div className="font-medium">{selectedProfile.sector || selectedProfile.category}</div>
                    </div>

                    <button onClick={(e) => handleContactPartner(e, selectedProfile)} className="btn-gold w-full py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2">
                      <Handshake size={14} /> {isEn ? "Request Introduction" : "Mise en relation"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="container max-w-6xl mb-6 animate-fade-up">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div className="text-left space-y-3">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[0.95]">{isEn ? "Become a BNE Partner or " : "Devenir Partenaire ou "}<em className="italic gold-text">{isEn ? "Ambassador" : "Ambassadeur"} BNE</em>.</h1>
            <div className="hairline w-12" />
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">{isEn ? "BNE supports entrepreneurs, business leaders, institutions and economic networks by creating high-value connections across territories." : "BNE accompagne les entrepreneurs, dirigeants, institutions et réseaux économiques dans la création de connexions à forte valeur entre territoires."}</p>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">{isEn ? "Our network relies on committed partners and ambassadors who help foster business opportunities, collaborations and international growth." : "Notre réseau s'appuie sur des partenaires et ambassadeurs engagés qui contribuent à renforcer les échanges, les opportunités d'affaires et les collaborations internationales."}</p>
              <p className="text-xs md:text-sm text-primary/80 leading-relaxed font-medium">{isEn ? "Joining BNE means becoming part of a trusted international ecosystem." : "Rejoindre BNE, c'est participer activement au développement d'un écosystème international de confiance."}</p>
            </div>
          </div>
          <div className="relative h-full min-h-[200px] lg:min-h-[300px]">
            <img src={partnersHero} alt="BNE Partnership" className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-lighten" style={{ maskImage: "radial-gradient(black 40%, transparent 75%)" }} />
          </div>
        </div>
      </section>

      {/* ── AMBASSADORS SECTION ── */}
      {ambassadors.length > 0 && (
        <section className="container max-w-6xl py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent hidden md:block" />
            <div className="text-center">
              <div className="eyebrow mb-2 flex items-center gap-2 justify-center"><Star size={12} className="text-gold" /> BNE Network</div>
              <h2 className="font-display text-3xl md:text-4xl">{isEn ? "Our Ambassadors" : "Nos Ambassadeurs"}</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent hidden md:block" />
          </div>
          <div className="px-4 relative group">
            <SnapCarousel>
              {ambassadors.map((amb: any) => (
                <div key={amb.id} className="snap-center shrink-0 w-[280px] sm:w-[320px]">
                  <AmbassadorCard amb={amb} isEn={isEn} onContact={(e) => handleContactAmbassador(e, amb)} onClick={() => setSelectedProfile({ ...amb, type: 'ambassador' })} />
                </div>
              ))}
            </SnapCarousel>
          </div>
        </section>
      )}

      {/* ── PARTNERS SECTION ── */}
      {partners.length > 0 && (
        <section className="container max-w-6xl py-12 border-t border-border/30">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent hidden md:block" />
            <div className="text-center">
              <div className="eyebrow mb-2 flex items-center gap-2 justify-center"><Handshake size={12} className="text-gold" /> BNE Network</div>
              <h2 className="font-display text-3xl md:text-4xl">{isEn ? "Our Partners" : "Nos Partenaires"}</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent hidden md:block" />
          </div>
          <div className="px-4 relative group">
            <SnapCarousel>
              {partners.map((partner: any) => (
                <div key={partner.id} className="snap-center shrink-0 w-[280px] sm:w-[320px]">
                  <PartnerCard partner={partner} isEn={isEn} onContact={(e) => handleContactPartner(e, partner)} onClick={() => setSelectedProfile({ ...partner, type: 'partner' })} />
                </div>
              ))}
            </SnapCarousel>
          </div>
        </section>
      )}

      {/* ── ACCORDION + FORM ── */}
      <div className="container max-w-6xl lg:h-[250vh] relative" ref={containerRef}>
        <div className="lg:sticky lg:top-24 grid lg:grid-cols-[1fr_auto_380px] gap-8 lg:gap-10">
          <div className="relative z-10">
            <div className="space-y-3">
              <AccordionSection index={1} eyebrow="01" title={t("partners.section1.title")} isActive={activeAccordion === 1} onClick={() => setActiveAccordion(activeAccordion === 1 ? 0 : 1)}>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t("partners.section1.desc")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-8">{t("partners.section1.descP2")}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {missionCards.map((card, i) => (
                    <div key={i} className="luxe-card p-5 rounded-2xl group">
                      <div className="text-primary/60 group-hover:text-primary transition-colors mb-3" style={{ color: "rgba(208, 166, 67, 0.7)" }}>{card.icon}</div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{card.text}</p>
                    </div>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection index={2} eyebrow="02" title={t("partners.section2.title")} isActive={activeAccordion === 2} onClick={() => setActiveAccordion(activeAccordion === 2 ? 0 : 2)}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefitCards.map((card, i) => (
                    <div key={i} className="luxe-card p-5 rounded-2xl group">
                      <div className="text-primary/60 group-hover:text-primary transition-colors mb-3" style={{ color: "rgba(208, 166, 67, 0.7)" }}>{card.icon}</div>
                      <h4 className="font-display text-sm mb-2">{card.title}</h4>
                      <p className="text-xs text-foreground/70 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </AccordionSection>
              <AccordionSection index={3} eyebrow="03" title={t("partners.section3.title")} isActive={activeAccordion === 3} onClick={() => setActiveAccordion(activeAccordion === 3 ? 0 : 3)}>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t("partners.section3.desc")}</p><p className="text-xs text-muted-foreground leading-relaxed mb-4">{t("partners.section3.descP2")}</p><p className="text-xs text-muted-foreground leading-relaxed">{t("partners.section3.descP3")}</p>
              </AccordionSection>
              <AccordionSection index={4} eyebrow="04" title={t("partners.section4.title")} isActive={activeAccordion === 4} onClick={() => setActiveAccordion(activeAccordion === 4 ? 0 : 4)}>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{t("partners.section4.desc")}</p><p className="text-xs text-muted-foreground leading-relaxed mb-4">{t("partners.section4.descP2")}</p>
                <ol className="space-y-2">
                  {timelineSteps.map((step, i) => (<li key={i} className="flex items-start gap-3 text-xs text-foreground/80"><span className="w-5 h-5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>{step}</li>))}
                </ol>
              </AccordionSection>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center justify-center relative py-12 opacity-50 hover:opacity-100 transition-opacity duration-700">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gold/40 to-gold/60" /><div className="py-6 flex flex-col items-center relative"><div className="absolute w-12 h-12 bg-gold/5 rounded-full animate-pulse blur-md" /><div className="w-2 h-2 rotate-45 border border-gold/80 bg-background z-10" /></div><div className="w-px flex-1 bg-gradient-to-t from-transparent via-gold/40 to-gold/60" />
          </div>
          <div className="hidden lg:block relative h-full">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6"><FormBlock /></div>
          </div>
        </div>
        <div className="lg:hidden mt-10"><FormBlock /></div>
      </div>
    </div>
  );
}