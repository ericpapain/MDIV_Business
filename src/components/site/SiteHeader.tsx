import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, User, LogIn, LogOut, Building2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navKeys = [
  { to: "/", key: "nav.home" },
  { to: "/sejour", key: "nav.sejour" },
  { to: "/offres", key: "nav.offers" },
  { to: "/evenements", key: "nav.events" },
  { to: "/partenaires", key: "nav.partners", labelFr: "Partenaires & Ambassadeurs", labelEn: "Partners & Ambassadors" },
  { to: "/contact", key: "nav.contact" },
  { to: "/charte", key: "La Charte" },
];

export function SiteHeader() {
  const { t, language, toggleLanguage } = useLanguage();
  const { company, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isIAPage = location.pathname.startsWith('/services-ia');
  const isEn = language === 'en';

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f(); window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  const headerBgClass = isIAPage 
    ? (scrolled ? "bg-foreground/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm" : "bg-transparent py-5")
    : (scrolled ? "glass-strong py-3" : "bg-transparent py-5");

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${headerBgClass}`}>
      <div className="container flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-sm flex items-center justify-center gold-border bg-emerald-deep/40 relative overflow-hidden">
            <span className="font-display text-sm gold-text font-bold tracking-tight">MD</span>
          </div>
          <div className="leading-none">
            <div className={`font-display text-lg tracking-wider ${isIAPage ? "text-slate-800" : ""}`}>
              M<span className="gold-text">.</span>DIV<span className={`${isIAPage ? "text-muted-foreground" : "text-foreground/40"} mx-1`}>·</span><span className="gold-text text-base">Business</span>
            </div>
            <div className={`text-[9px] tracking-[0.32em] uppercase ${isIAPage ? "text-slate-500" : "text-muted-foreground"}`}>
              Business · Travel · Capital
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navKeys.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) => {
                const activeColor = isIAPage ? "text-blue-600 font-semibold" : "text-primary";
                const inactiveColor = isIAPage ? "text-slate-600 hover:text-blue-600" : "text-foreground/70 hover:text-primary";
                return `text-[12px] uppercase tracking-[0.2em] transition-colors relative py-2 ${isActive ? activeColor : inactiveColor}`;
              }}
            >
              {n.key.startsWith("nav.") ? (n.labelFr ? (language === 'en' ? n.labelEn : n.labelFr) : t(n.key)) : n.key}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {/* Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Building2 size={14} />
                <span className="max-w-[120px] truncate">{company?.name || (isEn ? "Dashboard" : "Mon Espace")}</span>
              </Link>
              <button 
                onClick={logout}
                title={isEn ? "Logout" : "Déconnexion"}
                className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isIAPage 
                    ? "border-blue-600 text-blue-600 hover:bg-blue-50" 
                    : "border-gold/40 text-gold-light hover:bg-gold/10"
                }`}
              >
                <LogIn size={13} />
                {isEn ? "Login" : "Connexion"}
              </Link>
              <Link 
                to="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
              >
                {isEn ? "Register" : "Créer un compte"}
              </Link>
            </div>
          )}

          <ThemeToggle />
          <button onClick={toggleLanguage} className={`flex items-center text-[10px] uppercase tracking-[0.2em] font-semibold border rounded-sm overflow-hidden ${isIAPage ? "border-slate-300" : "border-border"}`}>
            <span className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${language === 'fr' ? 'bg-gold/20 text-gold-light' : (isIAPage ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-muted text-muted-foreground')}`}>
              <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-3.5 h-[10px] object-cover rounded-[2px]" /> FR
            </span>
            <span className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors ${language === 'en' ? 'bg-gold/20 text-gold-light' : (isIAPage ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-muted text-muted-foreground')}`}>
              <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-3.5 h-[10px] object-cover rounded-[2px]" /> EN
            </span>
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className={`lg:hidden p-2 ${isIAPage ? "text-slate-800" : "text-foreground"}`}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className={`lg:hidden animate-fade-up ${isIAPage ? "bg-white border-t border-slate-200 shadow-lg" : "glass-strong border-t border-gold/10"}`}>
          <div className="container py-6 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 pb-3 border-b border-slate-100">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <Building2 size={16} /> {company?.name || "Mon Espace"}
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-xs text-red-500 flex items-center gap-1">
                    <LogOut size={14} /> Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                    <LogIn size={15} /> Connexion
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md">
                    Créer un compte
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button onClick={toggleLanguage} className={`flex items-center text-xs uppercase tracking-[0.2em] font-semibold border rounded-sm overflow-hidden ${isIAPage ? "border-slate-300" : "border-border"}`}>
                  <span className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${language === 'fr' ? 'bg-gold/20 text-gold-light' : (isIAPage ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-muted text-muted-foreground')}`}>
                    <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-4 h-3 object-cover rounded-[2px]" /> FR
                  </span>
                  <span className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${language === 'en' ? 'bg-gold/20 text-gold-light' : (isIAPage ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-muted text-muted-foreground')}`}>
                    <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-[2px]" /> EN
                  </span>
                </button>
              </div>
            </div>

            {navKeys.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setOpen(false)}
                className={({ isActive }) => {
                  const activeColor = isIAPage ? "text-blue-600 font-bold" : "text-primary";
                  const inactiveColor = isIAPage ? "text-slate-700" : "text-foreground/80";
                  return `text-sm uppercase tracking-[0.2em] py-2 ${isActive ? activeColor : inactiveColor}`;
                }}>
                {n.key.startsWith("nav.") ? (n.labelFr ? (language === 'en' ? n.labelEn : n.labelFr) : t(n.key)) : n.key}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}