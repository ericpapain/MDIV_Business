import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Building, User, Mail, MapPin, Briefcase, Send, Search, Users, Calendar, Globe, Lightbulb, Eye, TrendingUp, Plane, Handshake, Shield, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import partnersHero from "@/assets/partners_hands_map_solid.png";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
const AccordionSection = ({
  index,
  eyebrow,
  title,
  isActive,
  onClick,
  children
}: {
  index: number;
  eyebrow: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <section className="scroll-spy-section relative animate-fade-up" data-index={index}>
      <div 
        className="cursor-pointer group flex items-start justify-between"
        onClick={onClick}
      >
        <div className="flex-1">
          <div className="eyebrow mb-2">{eyebrow}</div>
          <h2 className="font-display text-lg md:text-xl gold-text transition-colors">{title}</h2>
        </div>
        <div className="mt-4 ml-4 flex-shrink-0">
          <motion.div
            initial={false}
            animate={{ rotate: isActive ? 180 : 0, opacity: isActive ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
             {!isActive && <ChevronDown className="text-gold/60 w-6 h-6 transition-transform group-hover:scale-110" />}
          </motion.div>
        </div>
      </div>
      <div className={`hairline mt-2 mb-2 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 30 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-2 max-h-[45vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default function Partners() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // There are 4 sections.
    if (latest < 0.25) setActiveAccordion(1);
    else if (latest < 0.50) setActiveAccordion(2);
    else if (latest < 0.75) setActiveAccordion(3);
    else setActiveAccordion(4);
  });

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

  const timelineSteps = [
    t("partners.section4.step1"),
    t("partners.section4.step2"),
    t("partners.section4.step3"),
    t("partners.section4.step4"),
    t("partners.section4.step5"),
  ];

  /* ─── FORM SUBMISSION ─── */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error(t("partners.form.captchaError"));
      return;
    }

    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const subject = "Candidature Partenaire - M.DIV";
    try {
      const baseData = {
        "h-captcha-response": captchaToken,
        subject: subject,
        from_name: data.company || data.name || "Nouveau Partenaire",
        replyto: data.email,
        Entreprise: data.company,
        Secteur: data.sector,
        Nom: data.name,
        Email: data.email,
        Téléphone: data.phone,
        Pays: data.country,
        "Pourquoi devenir partenaire": data.why,
        "Valeur ajoutée": data.value,
      };

      const sendToWeb3Forms = async (accessKey: string) => {
        return fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            access_key: accessKey,
            ...baseData
          })
        });
      };

      // Envoi séquentiel : Micke en premier, puis Eric
      const resMicke = await sendToWeb3Forms("19268cb5-9f71-4363-9602-b6ad76d8d85b");
      const resEric = await sendToWeb3Forms("42f75cf0-743a-4f15-a419-1213f3de3cd8");

      const resultMicke = await resMicke.json();
      const resultEric = await resEric.json();

      if (!resMicke.ok || !resultMicke.success || !resEric.ok || !resultEric.success) {
        console.error("Web3Forms Erreur (Micke):", resultMicke);
        console.error("Web3Forms Erreur (Eric):", resultEric);

        if (!resMicke.ok && !resultMicke.success) {
          throw new Error(resultMicke.message || "Erreur lors de l'envoi");
        }
      }

      setSent(true);
      toast.success(t("partners.form.success"));
    } catch (error: any) {
      console.error("Erreur détaillée lors de l'envoi:", error);
      toast.error("Erreur: " + (error.message || "Veuillez réessayer ultérieurement."));
    }
  };

  /* ─── FORM COMPONENT ─── */
  const FormBlock = () => (
    <form
      onSubmit={handleSubmit}
      className="partner-form-card glass-strong p-6 lg:p-8 rounded-sm space-y-5 relative overflow-hidden"
      style={{ border: "1px solid hsl(42 60% 54% / 0.25)" }}
    >
      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l border-t" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />

      <div className="text-center mb-2">
        <h3 className="font-display text-xl gold-text">{t("partners.form.title")}</h3>
        <div className="hairline mt-3" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t("partners.form.company")} name="company" icon={<Building size={13} />} required />
        <Field label={t("partners.form.sector")} name="sector" icon={<Briefcase size={13} />} required />
        <Field label={t("partners.form.name")} name="name" icon={<User size={13} />} required />
        <Field label={t("partners.form.email")} name="email" type="email" icon={<Mail size={13} />} required />
        <Field label={t("partners.form.phone")} name="phone" type="tel" />
        <Field label={t("partners.form.country")} name="country" icon={<MapPin size={13} />} />
      </div>

      <Field label={t("partners.form.why")} name="why" textarea required />
      <Field label={t("partners.form.value")} name="value" textarea required />

      {!sent && (
        <div className="flex justify-center my-3">
          <HCaptcha
            sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
            onVerify={(token) => setCaptchaToken(token)}
          />
        </div>
      )}

      {sent ? (
        <button
          type="button"
          onClick={(e) => {
            setSent(false);
            setCaptchaToken("");
            e.currentTarget.closest('form')?.reset();
          }}
          className="w-full py-3.5 mt-2 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3 bg-muted/40 hover:bg-muted transition-colors border border-border"
        >
          {t("partners.form.newRequest")}
        </button>
      ) : (
        <button type="submit" className="btn-gold w-full py-3.5 mt-2 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
          <Send size={14} /> {t("partners.form.submit")}
        </button>
      )}

      {/* Reassurance */}
      <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed flex items-center justify-center gap-1.5 mt-2">
        <Shield size={10} className="shrink-0 text-primary/40" />
        {t("partners.form.reassurance")}
      </p>
    </form>
  );

  /* ─── RENDER ─── */
  return (
    <div className="pt-28 pb-10">
      {/* ═══════════════════ HERO (full width) ═══════════════════ */}
      <section className="container max-w-6xl mb-6 animate-fade-up">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Texte */}
          <div className="text-left space-y-3">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[0.95]">
              {t("partners.title1")} <em className="italic gold-text">{t("partners.title2")}</em>.
            </h1>
            <div className="hairline w-12" />
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
                {t("partners.desc")}
              </p>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                {t("partners.descP2")}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {t("partners.descP3")}
              </p>
              <p className="text-xs md:text-sm text-primary/80 leading-relaxed font-medium">
                {t("partners.descP4")}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-full min-h-[200px] lg:min-h-[300px]">
            <img 
              src={partnersHero} 
              alt="BNE Partnership" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-lighten"
              style={{ 
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)", 
                WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)" 
              }} 
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ MOBILE: Form after Hero ═══════════════ */}
      <div className="lg:hidden container max-w-xl mb-16">
        <FormBlock />
      </div>

      {/* ═══════════════════ CREATIVE SEPARATOR ═══════════════════ */}
      <div className="flex items-center justify-center py-4 mb-4 opacity-70">
        <div className="w-1/3 max-w-[150px] h-px bg-gradient-to-r from-transparent to-gold/40" />
        <div className="mx-3 relative flex items-center justify-center">
          <div className="absolute w-6 h-6 bg-gold/20 rounded-full animate-pulse blur-[3px]" />
          <div className="w-1.5 h-1.5 bg-gold rotate-45 relative z-10" />
        </div>
        <div className="w-1/3 max-w-[150px] h-px bg-gradient-to-l from-transparent to-gold/40" />
      </div>

      {/* ═══════════════════ TWO-COLUMN STICKY LAYOUT ═══════════════════ */}
      <div ref={containerRef} className="container max-w-6xl lg:h-[250vh] relative">
        <div className="lg:sticky lg:top-24 grid lg:grid-cols-[1fr_auto_380px] gap-8 lg:gap-10">

          {/* ─── LEFT COLUMN: Editorial Content ─── */}
          <div className="relative z-10">
            <div className="space-y-3">

            {/* ─── SECTION 1 ─── */}
            <AccordionSection
              index={1}
              eyebrow="01"
              title={t("partners.section1.title")}
              isActive={activeAccordion === 1}
              onClick={() => setActiveAccordion(1)}
            >
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t("partners.section1.desc")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-8">{t("partners.section1.descP2")}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {missionCards.map((card, i) => (
                  <div key={i} className="luxe-card p-5 rounded-2xl group">
                    <div className="text-primary/60 group-hover:text-primary transition-colors mb-3" style={{ color: "hsl(42 60% 54% / 0.7)" }}>
                      {card.icon}
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* ─── SECTION 2 ─── */}
            <AccordionSection
              index={2}
              eyebrow="02"
              title={t("partners.section2.title")}
              isActive={activeAccordion === 2}
              onClick={() => setActiveAccordion(2)}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                {benefitCards.map((card, i) => (
                  <div key={i} className="luxe-card p-6 rounded-2xl group">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-colors"
                      style={{ background: "hsl(42 60% 54% / 0.1)", border: "1px solid hsl(42 60% 54% / 0.25)" }}>
                      <span style={{ color: "hsl(42 60% 54%)" }}>{card.icon}</span>
                    </div>
                    <h3 className="font-display text-sm mb-1.5">{card.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* ─── SECTION 3 ─── */}
            <AccordionSection
              index={3}
              eyebrow="03"
              title={t("partners.section3.title")}
              isActive={activeAccordion === 3}
              onClick={() => setActiveAccordion(3)}
            >
              <div className="glass-strong p-8 md:p-10 rounded-2xl relative" style={{ border: "1px solid hsl(42 60% 54% / 0.2)" }}>
                <div className="absolute top-3 left-3 w-5 h-5 border-l border-t" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
                <p className="text-sm text-foreground/90 leading-relaxed font-serif italic mb-4">
                  {t("partners.section3.desc")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {t("partners.section3.descP2")}
                </p>
                <p className="text-xs text-primary/80 leading-relaxed font-medium">
                  {t("partners.section3.descP3")}
                </p>
              </div>
            </AccordionSection>

            {/* ─── SECTION 4 ─── */}
            <AccordionSection
              index={4}
              eyebrow="04"
              title={t("partners.section4.title")}
              isActive={activeAccordion === 4}
              onClick={() => setActiveAccordion(4)}
            >
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{t("partners.section4.desc")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t("partners.section4.descP2")}</p>
              <div className="relative pl-8 pr-6 py-2">
                {/* Vertical gold line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ background: "linear-gradient(180deg, hsl(42 60% 54% / 0.6), hsl(42 60% 54% / 0.1))" }} />
                {timelineSteps.map((step, i) => (
                  <div key={i} className="relative mb-3 last:mb-0 group cursor-pointer">
                    {/* Gold marker dot */}
                    <div className="absolute -left-8 top-1 w-[20px] h-[20px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-gold/20"
                      style={{ background: "hsl(42 60% 54% / 0.15)", border: "1px solid hsl(42 60% 54% / 0.6)" }}>
                      <span className="text-[8px] font-bold" style={{ color: "hsl(42 60% 54%)" }}>{i + 1}</span>
                    </div>
                    <div className="transition-all duration-500 group-hover:translate-x-4 group-hover:scale-105">
                      <div className="luxe-card py-2.5 px-4 rounded-xl">
                        <p className="text-xs text-foreground/85 leading-snug">{step}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>

            {/* Section Finale: CTA */}
            <section className="animate-fade-up">
              <div className="relative glass-strong p-4 rounded-xl text-center overflow-hidden"
                style={{ border: "1px solid hsl(42 60% 54% / 0.3)" }}>
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-10"
                  style={{ background: "radial-gradient(ellipse at center, hsl(42 60% 54% / 0.4), transparent 70%)" }} />
                <div className="relative flex flex-col md:flex-row items-center justify-between text-left gap-4">
                  <div>
                    <h2 className="font-display text-lg leading-snug mb-2">
                      {t("partners.sectionFinal.title")}
                    </h2>
                    <div className="hairline w-12 mb-2" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">
                      {t("partners.sectionFinal.desc")}
                    </p>
                  </div>
                  <Link to="/contact" className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-black transition-all duration-300 text-xs font-semibold tracking-wider uppercase">
                    Nous contacter
                  </Link>
                </div>
              </div>
            </section>
            </div>
          </div>

          {/* ─── CREATIVE SEPARATOR (Desktop only) ─── */}
          <div className="hidden lg:flex flex-col items-center justify-center relative py-12 opacity-50 hover:opacity-100 transition-opacity duration-700">
            {/* Top gradient line */}
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-gold/40 to-gold/60" />
            
            {/* Center Decorative Ornament */}
            <div className="py-6 flex flex-col items-center relative">
              <div className="absolute w-12 h-12 bg-gold/5 rounded-full animate-pulse blur-md" />
              <div className="w-2 h-2 rotate-45 border border-gold/80 bg-background z-10" />
              <div className="w-1 h-1 rotate-45 bg-gold/60 mt-2 z-10" />
              <div className="w-1 h-1 rotate-45 bg-gold/30 mt-1.5 z-10" />
            </div>

            {/* Bottom gradient line */}
            <div className="w-px flex-1 bg-gradient-to-t from-transparent via-gold/40 to-gold/60" />
          </div>

          {/* ─── RIGHT COLUMN: Sticky Form (desktop only) ─── */}
          <div className="hidden lg:block relative h-full">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
              <form
                onSubmit={handleSubmit}
                className="partner-form-card glass-strong p-5 rounded-2xl relative"
                style={{ border: "1px solid hsl(42 60% 54% / 0.25)" }}
              >
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l border-t" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b" style={{ borderColor: "hsl(42 60% 54% / 0.5)" }} />

                <div className="text-center mb-3">
                  <h3 className="font-display text-lg gold-text">{t("partners.form.title")}</h3>
                  <div className="hairline mt-2" />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("partners.form.company")} name="company" icon={<Building size={12} />} required compact />
                    <Field label={t("partners.form.sector")} name="sector" icon={<Briefcase size={12} />} required compact />
                    <Field label={t("partners.form.name")} name="name" icon={<User size={12} />} required compact />
                    <Field label={t("partners.form.email")} name="email" type="email" icon={<Mail size={12} />} required compact />
                    <Field label={t("partners.form.phone")} name="phone" type="tel" compact />
                    <Field label={t("partners.form.country")} name="country" icon={<MapPin size={12} />} compact />
                  </div>

                  <Field label={t("partners.form.why")} name="why" textarea required compact />
                  <Field label={t("partners.form.value")} name="value" textarea required compact />

                  {!sent && (
                    <div className="flex justify-center py-2" style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
                      <HCaptcha
                        sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
                        onVerify={(token) => setCaptchaToken(token)}
                      />
                    </div>
                  )}

                  {sent ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        setSent(false);
                        setCaptchaToken("");
                        e.currentTarget.closest('form')?.reset();
                      }}
                      className="w-full py-3 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3 bg-muted/40 hover:bg-muted transition-colors border border-border"
                    >
                      {t("partners.form.newRequest")}
                    </button>
                  ) : (
                    <button type="submit" className="btn-gold w-full py-3 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
                      <Send size={13} /> {t("partners.form.submit")}
                    </button>
                  )}

                  <p className="text-[9px] text-muted-foreground/50 text-center leading-relaxed flex items-center justify-center gap-1 pt-1">
                    <Shield size={9} className="shrink-0 text-primary/30" />
                    {t("partners.form.reassurance")}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FIELD COMPONENT ─── */
function Field({ label, name, type = "text", textarea, icon, required, compact }: { label: string; name?: string; type?: string; textarea?: boolean; icon?: React.ReactNode; required?: boolean; compact?: boolean }) {
  const cls = compact
    ? "w-full bg-muted/40 border border-border rounded-sm px-3 py-2 text-xs outline-none focus:border-gold/60 transition-colors placeholder:text-muted-foreground/40"
    : "w-full bg-muted/40 border border-border rounded-sm px-4 py-2.5 text-sm outline-none focus:border-gold/60 transition-colors placeholder:text-muted-foreground/40";
  return (
    <div className="h-full flex flex-col justify-end">
      <div className={`uppercase tracking-[0.2em] text-muted-foreground flex items-start gap-1.5 ${compact ? "text-[9px] mb-1" : "text-[10px] mb-1.5"}`}>
        {icon}
        {label} {required && <span className="text-gold">*</span>}
      </div>
      {textarea ? <textarea name={name} rows={compact ? 2 : 3} className={cls} required={required} /> : <input name={name} type={type} className={cls} required={required} />}
    </div>
  );
}