import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [captchaToken, setCaptchaToken] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profile = searchParams.get("profile");
  const objective = searchParams.get("objective");
  const budget = searchParams.get("budget");
  const duration = searchParams.get("duration");
  const country = searchParams.get("country");

  const defaultMsg = profile ? `${t("contact.form.msgIntro")}
${t("contact.form.profile")} : ${profile}
${t("contact.form.msgObjective")} ${objective}
${t("contact.form.msgBudget")} ${budget} €
${t("contact.form.msgDuration")} ${duration} jours
${t("contact.form.msgCountry")} ${country}
${t("contact.form.msgOutro")}` : "";

  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">{t("contact.hero.eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">{t("contact.hero.title1")} <em className="italic gold-text">{t("contact.hero.title2")}</em></h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {[
            { I: Mail, t: t("contact.info.mail"), v: "contact@mdiv-network.com", href: "mailto:contact@mdiv-network.com" },
            { I: Phone, t: t("contact.info.phone"), v: "+33 6 66 07 88 70", href: "tel:+33666078870" },
            { I: MapPin, t: t("contact.info.address"), v: "10000 Troyes" },
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
          onSubmit={async (e) => { 
            e.preventDefault();
            if (!captchaToken) {
              toast.error("Veuillez vérifier que vous n'êtes pas un robot.");
              return;
            }
             
            const fd = new FormData(e.currentTarget);
            const data = Object.fromEntries(fd.entries());
            const subject = data.subject || t("contact.form.emailSubject");

            try {
              const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json"
                },
                body: JSON.stringify({
                  access_key: "42f75cf0-743a-4f15-a419-1213f3de3cd8",
                  "h-captcha-response": captchaToken,
                  subject: subject,
                  from_name: `${data.fn || ''} ${data.ln || ''}`.trim() || "Nouveau Contact",
                  replyto: data.email,
                  Nom: data.fn,
                  Prénom: data.ln,
                  Téléphone: data.phone,
                  Profil: data.profile,
                  Message: data.msg,
                })
              });

              const result = await res.json();
              if (!res.ok || !result.success) {
                console.error("Web3Forms Erreur:", result);
                throw new Error(result.message || "Erreur lors de l'envoi");
              }
              
              setSent(true); 
              toast.success(t("contact.form.success"));
            } catch (error: any) {
              console.error("Erreur détaillée lors de l'envoi:", error);
              toast.error("Erreur: " + (error.message || "Veuillez réessayer ultérieurement."));
            }
          }}
          className="lg:col-span-3 glass-strong p-8 md:p-10 rounded-sm space-y-5 corner-deco relative"
        >
          <h2 className="font-display text-3xl mb-2">{t("contact.form.title")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("contact.form.sub")}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t("contact.form.fn")} name="fn" required />
            <Field label={t("contact.form.ln")} name="ln" required />
            <Field label={t("contact.form.email")} name="email" type="email" required />
            <Field label={t("contact.form.phone")} name="phone" />
          </div>
          <Field label="Objet de la demande" name="subject" required />
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{t("contact.form.profile")}</div>
            <div className="flex flex-wrap gap-2">
              {[t("contact.form.p1"), t("contact.form.p2"), t("contact.form.p3"), t("contact.form.p4")].map((p) => (
                <label 
                  key={p} 
                  className={`px-4 py-2 text-sm rounded-sm border cursor-pointer transition-colors ${selectedProfile === p ? 'border-gold bg-gold/10 text-gold' : 'border-border hover:border-gold/40'}`}
                >
                  <input type="radio" name="profile" value={p} className="hidden" required onChange={() => setSelectedProfile(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <Field label={t("contact.form.msg")} name="msg" textarea defaultValue={defaultMsg} required minLength={50} />
          
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
                setSelectedProfile("");
                setCaptchaToken("");
                e.currentTarget.closest('form')?.reset();
              }}
              className="w-full py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3 bg-muted/40 hover:bg-muted transition-colors border border-border"
            >
              Faire une nouvelle demande
            </button>
          ) : (
            <button type="submit" className="btn-gold w-full py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3">
              <Send size={14} /> {t("contact.form.submit")}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", textarea, defaultValue, required, minLength }: { label: string; name?: string; type?: string; textarea?: boolean; defaultValue?: string; required?: boolean; minLength?: number }) {
  const cls = "w-full bg-muted/40 border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold/60 transition-colors";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
        {label} {required && <span className="text-gold">*</span>}
      </div>
      {textarea ? <textarea name={name} rows={8} className={cls} defaultValue={defaultValue} required={required} minLength={minLength} /> : <input name={name} type={type} className={cls} defaultValue={defaultValue} required={required} minLength={minLength} />}
    </div>
  );
}