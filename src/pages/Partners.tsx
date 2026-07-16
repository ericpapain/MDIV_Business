import { useState } from "react";
import { toast } from "sonner";
import { Send, MapPin, Briefcase, User, Mail, Building } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Partners() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  return (
    <div className="pt-32 pb-20 container max-w-4xl">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("partners.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("partners.title1")} <em className="italic gold-text">{t("partners.title2")}</em>.</h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">
          {t("partners.desc")}
        </p>
      </div>

      <form
        onSubmit={(e) => { 
          e.preventDefault(); 
          const fd = new FormData(e.currentTarget);
          const data = Object.fromEntries(fd.entries());
          const subject = encodeURIComponent("Candidature Partenaire - M.DIV");
          const body = encodeURIComponent(`Entreprise: ${data.company || ''}\nSecteur: ${data.sector || ''}\nNom: ${data.name || ''}\nEmail: ${data.email || ''}\nTéléphone: ${data.phone || ''}\nPays: ${data.country || ''}\n\nPourquoi devenir partenaire ?\n${data.why || ''}\n\nValeur ajoutée :\n${data.value || ''}`);
          window.location.href = `mailto:m.divcsltg@gmail.com,ericpapainmezatio@gmail.com?subject=${subject}&body=${body}`;
          setSent(true); 
          toast.success(t("partners.form.success")); 
        }}
        className="glass-strong p-8 md:p-12 rounded-sm space-y-6 corner-deco relative"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label={t("partners.form.company")} name="company" icon={<Building size={14} />} required />
          <Field label={t("partners.form.sector")} name="sector" icon={<Briefcase size={14} />} required />
          <Field label={t("partners.form.name")} name="name" icon={<User size={14} />} required />
          <Field label={t("partners.form.email")} name="email" type="email" icon={<Mail size={14} />} required />
          <Field label={t("partners.form.phone")} name="phone" type="tel" />
          <Field label={t("partners.form.country")} name="country" icon={<MapPin size={14} />} />
        </div>
        
        <Field label={t("partners.form.why")} name="why" textarea required />
        <Field label={t("partners.form.value")} name="value" textarea required />

        <button type="submit" disabled={sent} className="btn-gold w-full py-4 mt-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
          {sent ? t("partners.form.sent") : <><Send size={14} /> {t("partners.form.submit")}</>}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", textarea, icon, required }: { label: string; name?: string; type?: string; textarea?: boolean; icon?: React.ReactNode; required?: boolean }) {
  const cls = "w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 flex items-center gap-2">
        {icon}
        {label} {required && <span className="text-gold">*</span>}
      </div>
      {textarea ? <textarea name={name} rows={4} className={cls} required={required} /> : <input name={name} type={type} className={cls} required={required} />}
    </div>
  );
}