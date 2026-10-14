import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Tag, ArrowLeft, Video, Calendar, LogOut, Loader2, Handshake, MessageSquare, Plane, Play, Menu, X, Star, TrendingUp, Cpu, Newspaper, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/blog", label: "Blog & Actualités", icon: BookOpen },
  { to: "/admin/actualites", label: "Actualités Hero", icon: Newspaper },
  { to: "/admin/ai-settings", label: "Modèles & Fournisseurs IA", icon: Cpu },
  { to: "/admin/performance", label: "Pilotage & Performance", icon: TrendingUp },
  { to: "/admin/demandes", label: "Candidatures", icon: Star },
  { to: "/admin/members", label: "Membres", icon: Users },
  { to: "/admin/partners", label: "Partenaires", icon: Handshake },
  { to: "/admin/ambassadors", label: "Ambassadeurs", icon: Star },
  { to: "/admin/videos", label: "Vidéos", icon: Video },
  { to: "/admin/events", label: "Événements", icon: Calendar },
  { to: "/admin/sejours", label: "Séjours", icon: Plane },
  { to: "/admin/reviews", label: "Avis & Témoignages", icon: MessageSquare },
  { to: "/admin/replays", label: "Replays", icon: Play },
  { to: "/admin/tarification", label: "Tarification", icon: Tag },
];

export function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Accès direct sans login pour le module performance et configuration IA (mode local / démo)
    if (location.pathname.startsWith("/admin/performance") || location.pathname.startsWith("/admin/ai-settings")) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    fetch("/api-auth.php?action=check")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          navigate("/admin/login");
        }
      })
      .catch(() => {
        navigate("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [navigate, location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    fetch("/api-auth.php?action=logout", { method: "POST" })
      .then(() => {
        toast({ title: "Déconnexion réussie" });
        navigate("/admin/login");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* HEADER MOBILE */}
      <div className="md:hidden flex flex-shrink-0 items-center justify-between p-4 border-b border-border bg-[#0a0d0f] z-50 sticky top-0 h-[70px]">
        <Link to="/" className="group flex flex-col">
          <div className="font-display text-lg tracking-wider">PRIVÉ<span className="gold-text">·</span>ADMIN</div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5 flex items-center gap-1 group-hover:text-primary transition-colors">
            <ArrowLeft size={10} /> Retour site
          </div>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 text-foreground/70 hover:text-gold transition-colors"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex w-full md:w-64 border-r border-border bg-[#0a0d0f] shrink-0 flex-col 
        absolute md:relative z-40 h-[calc(100vh-70px)] md:h-screen top-[70px] md:top-0
      `}>
        <Link to="/" className="hidden md:block p-6 border-b border-border group">
          <div className="font-display text-lg tracking-wider">PRIVÉ<span className="gold-text">·</span>ADMIN</div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1 flex items-center gap-2 group-hover:text-primary transition-colors">
            <ArrowLeft size={10} /> Retour au site
          </div>
        </Link>
        <nav className="p-4 md:p-3 space-y-2 md:space-y-1 flex-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 md:px-3 py-3 md:py-2.5 rounded-sm text-sm transition-all ${
                  isActive ? "bg-gold/10 text-gold-light border-l-2 border-gold" : "text-foreground/70 hover:bg-muted/30 hover:text-foreground border-l-2 border-transparent"
                }`
              }>
              <it.icon size={18} className="md:w-[15px] md:h-[15px]" /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 md:px-3 py-3 md:py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors">
            <LogOut size={18} className="md:w-[15px] md:h-[15px]" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className={`flex-1 min-w-0 overflow-x-hidden ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}