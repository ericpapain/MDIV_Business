import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profile = searchParams.get("profile");
  const objective = searchParams.get("objective");
  const budget = searchParams.get("budget");
  const duration = searchParams.get("duration");
  const country = searchParams.get("country");

  const defaultMsg = profile ? `Bonjour,
Je souhaite être contacté pour organiser une expérience.
Voici mes préférences :
- Profil : ${profile}
- Objectif : ${objective}
- Budget : ${budget} €
- Durée : ${duration} jours
- Destination : ${country}

Merci.` : "";

  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("contact.hero.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("contact.hero.title1")} <em className="italic gold-text">{t("contact.hero.title2")}</em></h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {[
            { I: Mail, t: t("contact.info.mail"), v: "m.div-network@bne.com", href: "mailto:m.divcsltg@gmail.com,ericpapainmezatio@gmail.com" },
            { I: Phone, t: t("contact.info.phone"), v: "+33 6 66 07 88 70", href: "tel:+33666078870" },
            { I: MapPin, t: t("contact.info.address"), v: "En cours..." },
          ].map(({ I, t: title, v, href }) => (
            <div key={title} className="glass p-5 rounded-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-sm bg-emerald-deep/60 gold-border flex items-center justify-center"><I size={16} className="text-primary" /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</div>
                {href ? (
                  <a href={href} className="font-display text-lg mt-0.5 hover:text-gold-light transition-colors block">{v}</a>
                ) : (
                  <div className="font-display text-lg mt-0.5">{v}</div>
                )}
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
          onSubmit={(e) => { 
            e.preventDefault(); 
            const fd = new FormData(e.currentTarget);
            const data = Object.fromEntries(fd.entries());
            const subject = encodeURIComponent("Nouvelle demande de contact - M.DIV");
            const body = encodeURIComponent(`Prénom: ${data.fn || ''}\nNom: ${data.ln || ''}\nEmail: ${data.email || ''}\nTéléphone: ${data.phone || ''}\nProfil: ${data.profile || ''}\n\nMessage:\n${data.msg || ''}`);
            window.location.href = `mailto:m.divcsltg@gmail.com,ericpapainmezatio@gmail.com?subject=${subject}&body=${body}`;
            setSent(true); 
            toast.success("Votre demande a été préparée dans votre logiciel de messagerie."); 
          }}
          className="lg:col-span-3 glass-strong p-8 md:p-10 rounded-sm space-y-5 corner-deco relative"
        >
          <h2 className="font-display text-3xl mb-2">{t("contact.form.title")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("contact.form.sub")}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("contact.form.fn")} name="fn" />
            <Field label={t("contact.form.ln")} name="ln" />
            <Field label={t("contact.form.email")} name="email" type="email" />
            <Field label={t("contact.form.phone")} name="phone" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{t("contact.form.profile")}</div>
            <div className="flex flex-wrap gap-2">
              {[t("contact.form.p1"), t("contact.form.p2"), t("contact.form.p3"), t("contact.form.p4")].map((p) => (
                <label key={p} className="px-4 py-2 text-sm rounded-sm border border-border hover:border-gold/40 cursor-pointer">
                  <input type="radio" name="profile" value={p} className="hidden" /> {p}
                </label>
              ))}
            </div>
          </div>
          <Field label={t("contact.form.msg")} name="msg" textarea defaultValue={defaultMsg} />
          <button type="submit" disabled={sent} className="btn-gold w-full py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
            {sent ? t("contact.form.sent") : <><Send size={14} /> {t("contact.form.submit")}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", textarea, defaultValue }: { label: string; name?: string; type?: string; textarea?: boolean; defaultValue?: string }) {
  const cls = "w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{label}</div>
      {textarea ? <textarea name={name} rows={8} className={cls} defaultValue={defaultValue} /> : <input name={name} type={type} className={cls} defaultValue={defaultValue} />}
    </div>
  );
}