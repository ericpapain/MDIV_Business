import { useState } from "react";
import { toast } from "sonner";
import { Building, User, Mail, MapPin, Briefcase, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Partners() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

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
        onSubmit={async (e) => { 
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

            const [resEric, resMicke] = await Promise.all([
              sendToWeb3Forms("42f75cf0-743a-4f15-a419-1213f3de3cd8"), // Clé Eric
              sendToWeb3Forms("19268cb5-9f71-4363-9602-b6ad76d8d85b")  // Clé Micke
            ]);

            const resultEric = await resEric.json();
            const resultMicke = await resMicke.json();

            // Si l'une des requêtes a échoué (ou les deux)
            if (!resEric.ok || !resultEric.success || !resMicke.ok || !resultMicke.success) {
              console.error("Web3Forms Erreur (Eric):", resultEric);
              console.error("Web3Forms Erreur (Micke):", resultMicke);
              
              // Si la requête principale (Eric) passe, on ne bloque pas l'utilisateur
              if (!resEric.ok && !resultEric.success) {
                  throw new Error(resultEric.message || "Erreur lors de l'envoi");
              }
            }
            
            setSent(true); 
            toast.success(t("partners.form.success")); 
          } catch (error: any) {
            console.error("Erreur détaillée lors de l'envoi:", error);
            toast.error("Erreur: " + (error.message || "Veuillez réessayer ultérieurement."));
          }
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

        {!sent && (
          <div className="flex justify-center my-4">
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
            className="w-full py-4 mt-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3 bg-muted/40 hover:bg-muted transition-colors border border-border"
          >
            {t("partners.form.newRequest")}
          </button>
        ) : (
          <button type="submit" className="btn-gold w-full py-4 mt-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
            <Send size={14} /> {t("partners.form.submit")}
          </button>
        )}
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