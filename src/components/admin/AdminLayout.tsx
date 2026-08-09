import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Tag, ArrowLeft, Video, Calendar, LogOut, Loader2, Handshake, MessageSquare, Plane, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/members", label: "Membres", icon: Users },
  { to: "/admin/partners", label: "Partenaires", icon: Handshake },
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
  const navigate = useNavigate();
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
  }, [navigate]);

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
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col">
        <Link to="/" className="p-6 border-b border-border block group">
          <div className="font-display text-lg tracking-wider">PRIVÉ<span className="gold-text">·</span>ADMIN</div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mt-1 flex items-center gap-2 group-hover:text-primary transition-colors">
            <ArrowLeft size={10} /> Retour au site
          </div>
        </Link>
        <nav className="p-3 space-y-1 flex-1">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all ${
                  isActive ? "bg-gold/10 text-gold-light border-l-2 border-gold" : "text-foreground/70 hover:bg-muted/30 hover:text-foreground border-l-2 border-transparent"
                }`
              }>
              <it.icon size={15} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}