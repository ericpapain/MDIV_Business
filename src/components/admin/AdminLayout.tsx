import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Tag, ArrowLeft, Video, Calendar, LogOut, Loader2, Handshake, MessageSquare, Plane, Play, Menu, X, Star, TrendingUp, Cpu, Newspaper, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
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
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen flex flex-col md:flex-row bg-background">
        {/* HEADER MOBILE */}
        <div className="md:hidden flex flex-shrink-0 items-center justify-between px-4 border-b border-border bg-[#0a0d0f] z-50 sticky top-0 h-14">
          <Link to="/" className="group flex flex-col">
            <div className="font-display text-sm font-semibold tracking-wider">PRIVÉ<span className="gold-text">·</span>ADMIN</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
              <ArrowLeft size={10} /> Retour site
            </div>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-foreground/70 hover:text-gold transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* SIDEBAR SAAS COMPACTE */}
        <aside className={`
          ${isMobileMenuOpen ? 'flex' : 'hidden'} 
          md:flex w-full ${isCollapsed ? 'md:w-[72px]' : 'md:w-[256px]'} border-r border-border/70 bg-[#0a0d0f] shrink-0 flex-col 
          absolute md:sticky z-40 h-[calc(100vh-56px)] md:h-screen top-14 md:top-0 transition-[width] duration-200 ease-out
        `}>
          <div className={`hidden md:flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-3 border-b border-border/60`}>
            {!isCollapsed && (
              <Link to="/" className="group min-w-0">
                <div className="font-display text-[13.5px] font-semibold tracking-wider truncate">PRIVÉ<span className="gold-text">·</span>ADMIN</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                  <ArrowLeft size={10} /> Retour au site
                </div>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title={isCollapsed ? "Développer le menu" : "Réduire le menu"}
            >
              {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>

          <nav className={`p-2.5 space-y-0.5 flex-1 overflow-y-auto custom-sidebar-scroll ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {items.map((it) => {
              const linkNode = (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `relative flex items-center ${isCollapsed ? 'justify-center w-9 h-9' : 'gap-2.5 px-2.5 h-8'} rounded-lg text-[12.5px] transition-all duration-150 ${
                      isActive
                        ? "bg-gold/12 text-gold-light font-semibold"
                        : "text-foreground/75 hover:bg-muted/25 hover:text-foreground font-medium"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r-full bg-gold" />
                      )}
                      <it.icon size={15} strokeWidth={1.75} className="shrink-0" />
                      {!isCollapsed && <span className="truncate">{it.label}</span>}
                    </>
                  )}
                </NavLink>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={it.to}>
                    <TooltipTrigger asChild>{linkNode}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
                      {it.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return linkNode;
            })}
          </nav>

          <div className="p-2.5 border-t border-border/60 mt-auto">
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center h-8' : 'gap-2.5 px-2.5 h-8'} text-[11.5px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer`}
            >
              <LogOut size={14} strokeWidth={1.75} className="shrink-0" />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <div className={`flex-1 min-w-0 overflow-x-hidden ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
