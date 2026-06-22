import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const navKeys = [
  { to: "/", key: "nav.home" },
  //{ to: "/experience", key: "nav.builder" }, // page web cachée
  { to: "/offres", key: "nav.offers" },
  //{ to: "/experiences", key: "nav.experiences" },
  { to: "/evenements", key: "nav.events" },
  //{ to: "/partenaires", key: "nav.partners" },
  //{ to: "/media", key: "nav.media" },
  { to: "/contact", key: "nav.contact" },
];

export function SiteHeader() {
  const { t, language, toggleLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "glass-strong py-3" : "bg-transparent py-5"}`}>
      <div className="container flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center gold-border bg-emerald-deep/40 relative overflow-hidden">
            <span className="font-display text-sm gold-text font-bold tracking-tight">MD</span>
          </div>
          <div className="leading-none">
            <div className="font-display text-lg tracking-wider">M<span className="gold-text">.</span>DIV<span className="text-foreground/40 mx-1">·</span><span className="gold-text text-base">Business</span></div>
            <div className="text-[9px] tracking-[0.32em] text-muted-foreground uppercase">Business · Travel · Capital</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navKeys.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `text-[12px] uppercase tracking-[0.22em] transition-colors relative py-2 ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
                }`
              }
            >
              {t(n.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button onClick={toggleLanguage} className="flex items-center text-[10px] uppercase tracking-[0.2em] font-semibold mr-2 border border-border rounded-sm overflow-hidden">
            <span className={`px-2 py-1.5 transition-colors ${language === 'fr' ? 'bg-gold/20 text-gold-light' : 'hover:bg-muted text-muted-foreground'}`}>FR</span>
            <span className={`px-2 py-1.5 transition-colors ${language === 'en' ? 'bg-gold/20 text-gold-light' : 'hover:bg-muted text-muted-foreground'}`}>EN</span>
          </button>
          {/* <Link to="/admin" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary transition-colors">{t("nav.admin")}</Link>
          <Link to="/experience" className="btn-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] font-medium rounded-sm">
            {t("nav.reserve")}
          </Link> */}
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground p-2">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden glass-strong border-t border-gold/10 animate-fade-up">
          <div className="container py-6 flex flex-col gap-4">
            <div className="flex justify-end mb-2">
              <button onClick={toggleLanguage} className="flex items-center text-xs uppercase tracking-[0.2em] font-semibold border border-border rounded-sm overflow-hidden">
                <span className={`px-3 py-1.5 transition-colors ${language === 'fr' ? 'bg-gold/20 text-gold-light' : 'hover:bg-muted text-muted-foreground'}`}>FR</span>
                <span className={`px-3 py-1.5 transition-colors ${language === 'en' ? 'bg-gold/20 text-gold-light' : 'hover:bg-muted text-muted-foreground'}`}>EN</span>
              </button>
            </div>
            {navKeys.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setOpen(false)}
                className={({ isActive }) => `text-sm uppercase tracking-[0.2em] py-2 ${isActive ? "text-primary" : "text-foreground/80"}`}>
                {t(n.key)}
              </NavLink>
            ))}
            {/* <Link to="/experience" onClick={() => setOpen(false)} className="btn-gold mt-2 px-5 py-3 text-xs uppercase tracking-[0.2em] text-center rounded-sm">
              {t("nav.reserve")}
            </Link> */}
          </div>
        </div>
      )}
    </header>
  );
}