import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube, Music2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="relative border-t border-border mt-32">
      <div className="container py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center gold-border bg-emerald-deep/40">
              <span className="font-display text-base gold-text font-bold tracking-tight">MD</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-2xl tracking-wider">M<span className="gold-text">.</span>DIV<span className="text-foreground/40 mx-1">·</span><span className="gold-text text-xl">Business</span></div>
              <div className="text-[9px] tracking-[0.28em] text-muted-foreground uppercase mt-0.5">Business · Travel · Capital</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed font-serif italic">
            {t("footer.tagline")}
          </p>
          <div className="hairline my-6 max-w-xs" />
          <div className="flex gap-3">
            {[Instagram, Linkedin, Youtube, Music2].map((I, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-sm border border-border hover:border-gold/60 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary">
                <I size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-4">{t("footer.navigation")}</div>
          <ul className="space-y-2 text-sm text-foreground/70">
            {/* <li><Link to="/experience" className="hover:text-primary">{t("nav.builder")}</Link></li> */}
            <li><Link to="/offres" className="hover:text-primary">{t("nav.offers")}</Link></li>
            <li><Link to="/evenements" className="hover:text-primary">{t("nav.events")}</Link></li>
            <li><Link to="/home" className="hover:text-primary">{t("nav.home")}</Link></li>
            <li><Link to="/contact" className="hover:text-primary">{t("nav.contact")}</Link></li>
            {/* <li><Link to="/partenaires" className="hover:text-primary">{t("nav.partners")}</Link></li> */}
            {/* <li><Link to="/media" className="hover:text-primary">{t("nav.media")}</Link></li> */}
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">{t("footer.contact")}</div>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li>m.div-network@bne.com</li>
            <li>+33 6 66 07 88 70</li>
            <li>En cours...</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <div>© {new Date().getFullYear()} M.DIV Business · {t("footer.rights")}</div>
          <div className="flex gap-6">
            <a href="#">{t("footer.privacy")}</a>
            <a href="#">{t("footer.terms")}</a>
            <a href="#">{t("footer.charter")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}