import { TrendingUp, Users, Video, Calendar, ArrowUpRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = ["hsl(var(--gold))", "hsl(var(--gold-light))", "hsl(var(--gold-deep))", "hsl(var(--muted-foreground))"];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=stats");
      const json = await res.json();
      return json.data;
    }
  });

  if (isLoading) {
    return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold w-8 h-8" /></div>;
  }

  const byCountry = stats?.countries?.map((c: any) => ({ name: c.country, v: parseInt(c.count) })) || [];

  return (
    <div className="">
      <div className="mb-10">
        <div className="eyebrow mb-2">Tableau de bord</div>
        <h1 className="font-display text-4xl">Pilotage du Site</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { I: Users, t: "Visites Totales", v: stats?.total_visits || 0, d: "Historique", c: "text-success" },
          { I: Calendar, t: "Événements à venir", v: stats?.upcoming_events || 0, d: "Programme", c: "text-success" },
          { I: Video, t: "Vidéos en ligne", v: stats?.total_videos || 0, d: "Playlist", c: "text-gold" },
          { I: TrendingUp, t: "Membres Cercle", v: "7", d: "Réseau", c: "text-success" }, // Fixé pour le moment via mock
        ].map((s) => (
          <div key={s.t} className="luxe-card p-5 rounded-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-sm bg-emerald-deep/50 gold-border flex items-center justify-center"><s.I size={14} className="text-primary" /></div>
              <div className={`text-[10px] uppercase tracking-[0.22em] flex items-center gap-1 ${s.c}`}><ArrowUpRight size={10} /> {s.d}</div>
            </div>
            <div className="font-display text-3xl gold-text">{s.v}</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1">{s.t}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-10">
        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Répartition des visites (Top Pays)</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byCountry} dataKey="v" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {byCountry.map((_, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.4)", borderRadius: 2 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
            {byCountry.map((b: any, i: number) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} /> {b.name}</span>
                <span className="font-mono text-muted-foreground">{b.v} visites</span>
              </div>
            ))}
          </div>
        </div>

        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Actions Rapides CMS</div>
          <div className="space-y-4 mt-6">
            <a href="/admin/events" className="block p-4 bg-muted/30 border border-border rounded-sm hover:border-gold/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-gold" size={18} />
                <h3 className="font-display text-lg">Gérer les événements</h3>
              </div>
              <p className="text-sm text-muted-foreground">Ajoutez de nouveaux séjours BNE ou événements locaux.</p>
            </a>
            <a href="/admin/videos" className="block p-4 bg-muted/30 border border-border rounded-sm hover:border-gold/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Video className="text-gold" size={18} />
                <h3 className="font-display text-lg">Gérer les vidéos</h3>
              </div>
              <p className="text-sm text-muted-foreground">Ajoutez des replays YouTube aux pages du site.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}