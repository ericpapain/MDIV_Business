import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center glass-strong p-12 max-w-md rounded-sm corner-deco relative">
        <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-7xl gold-text mb-2">{t("notfound.title")}</h1>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">{t("notfound.sub")}</p>
        <p className="text-sm text-foreground/80 mb-6 font-serif italic">{t("notfound.desc")} <code className="text-gold-light">{location.pathname}</code></p>
        <a href="/" className="btn-gold inline-flex px-6 py-3 rounded-sm text-xs uppercase tracking-[0.22em]">{t("notfound.btn")}</a>
      </div>
    </div>
  );
};

export default NotFound;
