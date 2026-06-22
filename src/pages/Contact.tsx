import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("contact.hero.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("contact.hero.title1")} <em className="italic gold-text">{t("contact.hero.title2")}</em></h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {[
            { I: Mail, t: t("contact.info.mail"), v: "m.div-network@bne.com" },
            { I: Phone, t: t("contact.info.phone"), v: "+33 6 66 07 88 70" },
            { I: MapPin, t: t("contact.info.address"), v: "En cours..." },
          ].map(({ I, t: title, v }) => (
            <div key={title} className="glass p-5 rounded-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-sm bg-emerald-deep/60 gold-border flex items-center justify-center"><I size={16} className="text-primary" /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
                <div className="font-display text-lg mt-0.5">{v}</div>
              </div>
            </div>
          ))}
          <div className="glass-strong p-6 rounded-sm corner-deco relative">
            <div className="eyebrow mb-3">{t("contact.info.commitment_title")}</div>
            <p className="font-serif italic text-foreground/80 leading-relaxed">
              {t("contact.info.commitment_desc")}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Votre demande a été transmise à un concierge."); }}
          className="lg:col-span-3 glass-strong p-8 md:p-10 rounded-sm space-y-5 corner-deco relative"
        >
          <h2 className="font-display text-3xl mb-2">{t("contact.form.title")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("contact.form.sub")}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("contact.form.fn")} />
            <Field label={t("contact.form.ln")} />
            <Field label={t("contact.form.email")} type="email" />
            <Field label={t("contact.form.phone")} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{t("contact.form.profile")}</div>
            <div className="flex flex-wrap gap-2">
              {[t("contact.form.p1"), t("contact.form.p2"), t("contact.form.p3"), t("contact.form.p4")].map((p) => (
                <label key={p} className="px-4 py-2 text-sm rounded-sm border border-border hover:border-gold/40 cursor-pointer">
                  <input type="radio" name="profile" className="hidden" /> {p}
                </label>
              ))}
            </div>
          </div>
          <Field label={t("contact.form.msg")} textarea />
          <button type="submit" disabled={sent} className="btn-gold w-full py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
            {sent ? t("contact.form.sent") : <><Send size={14} /> {t("contact.form.submit")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type = "text", textarea }: { label: string; type?: string; textarea?: boolean }) {
  const cls = "w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{label}</div>
      {textarea ? <textarea rows={4} className={cls} /> : <input type={type} className={cls} />}
    </div>
  );
}