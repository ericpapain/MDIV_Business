import { Users, Building, Globe, Shield, Handshake, Diamond, Lightbulb, Search, Briefcase, TrendingUp, Cpu } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function AboutBNE() {
  const { t } = useLanguage();
  return (
    <section className="container py-20">
      <div className="text-center mb-16">
        <div className="eyebrow mb-4">{t("about_bne.eyebrow")}</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05] mb-6">
          {t("about_bne.title")}
        </h2>
        <p className="text-xl md:text-2xl text-gold-light font-display tracking-widest mb-6">
          {t("about_bne.subtitle")}
        </p>
        <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
          {t("about_bne.intro")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-20">
        {/* VISION */}
        <div className="glass-strong p-8 md:p-10 rounded-sm corner-deco relative">
          <h3 className="font-display text-3xl mb-4 text-foreground">{t("about_bne.vision_title")}</h3>
          <p className="text-muted-foreground mb-8">
            {t("about_bne.vision_desc")}
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">{t("about_bne.vision_tags.t1")}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">{t("about_bne.vision_tags.t2")}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">{t("about_bne.vision_tags.t3")}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">{t("about_bne.vision_tags.t4")}</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">{t("about_bne.vision_tags.t5")}</span>
          </div>
        </div>

        {/* POUR QUI */}
        <div className="glass-strong p-8 md:p-10 rounded-sm corner-deco relative">
          <h3 className="font-display text-3xl mb-6 text-foreground">{t("about_bne.for_who_title")}</h3>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-3 bg-background/50">
                  <Users className="text-gold" size={20} />
                </div>
                <h4 className="font-display text-sm uppercase tracking-[0.15em] text-foreground min-h-[40px] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: t("about_bne.for_entrepreneurs_title") }}></h4>
              </div>
              <ul className="text-[14px] text-muted-foreground space-y-2 list-disc pl-4">
                <li>{t("about_bne.for_entrepreneurs_items.i1")}</li>
                <li>{t("about_bne.for_entrepreneurs_items.i2")}</li>
                <li>{t("about_bne.for_entrepreneurs_items.i3")}</li>
                <li>{t("about_bne.for_entrepreneurs_items.i4")}</li>
              </ul>
            </div>
            <div>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-3 bg-background/50">
                  <Building className="text-gold" size={20} />
                </div>
                <h4 className="font-display text-sm uppercase tracking-[0.15em] text-foreground min-h-[40px] flex items-center justify-center">{t("about_bne.for_companies_title")}</h4>
              </div>
              <ul className="text-[14px] text-muted-foreground space-y-2 list-disc pl-4">
                <li>{t("about_bne.for_companies_items.i1")}</li>
                <li>{t("about_bne.for_companies_items.i2")}</li>
                <li>{t("about_bne.for_companies_items.i3")}</li>
                <li>{t("about_bne.for_companies_items.i4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PARCOURS D'ENGAGEMENT */}
      <div className="mb-20">
        <h3 className="font-display text-3xl mb-10 text-center text-foreground">{t("about_bne.path_title")}</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gold/20" />

          {[
            { step: 1, title: t("about_bne.path_steps.s1.title"), desc: t("about_bne.path_steps.s1.desc"), icon: Search },
            { step: 2, title: t("about_bne.path_steps.s2.title"), desc: t("about_bne.path_steps.s2.desc"), icon: Briefcase },
            { step: 3, title: t("about_bne.path_steps.s3.title"), desc: t("about_bne.path_steps.s3.desc"), icon: Users },
            { step: 4, title: t("about_bne.path_steps.s4.title"), desc: t("about_bne.path_steps.s4.desc"), icon: TrendingUp },
            { step: 5, title: t("about_bne.path_steps.s5.title"), desc: t("about_bne.path_steps.s5.desc"), icon: Cpu },
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5">
              <div className="w-16 h-16 rounded-full glass border border-gold/40 flex items-center justify-center mb-4 bg-background">
                <item.icon className="text-gold" size={24} />
              </div>
              <div className="w-6 h-6 rounded-full bg-gold text-background font-bold text-xs flex items-center justify-center mb-3">
                {item.step}
              </div>
              <h4 className="font-display text-lg text-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VALEURS */}
      <div>
        <h3 className="font-display text-3xl mb-10 text-center text-foreground">{t("about_bne.values_title")}</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { title: t("about_bne.values.v1"), icon: Shield },
            { title: t("about_bne.values.v2"), icon: Handshake },
            { title: t("about_bne.values.v3"), icon: Diamond },
            { title: t("about_bne.values.v4"), icon: Globe },
            { title: t("about_bne.values.v5"), icon: Lightbulb },
          ].map((val) => (
            <div key={val.title} className="flex flex-col items-center text-center w-32">
              <val.icon className="text-gold mb-3" size={32} />
              <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">{val.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
