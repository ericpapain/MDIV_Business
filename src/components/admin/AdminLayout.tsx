import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Users, BarChart3, Tag, Settings, ArrowLeft } from "lucide-react";

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/profils", label: "Profils", icon: BarChart3 },
  { to: "/admin/tarification", label: "Tarification", icon: Tag },
];

export function AdminLayout() {
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
          <div className="glass p-3 rounded-sm">
            <div className="eyebrow mb-1">Plan</div>
            <div className="font-display text-base">Operator</div>
            <div className="text-[10px] text-muted-foreground mt-1">Accès complet</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}