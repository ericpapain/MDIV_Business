import { useState, useEffect } from "react";
import { TrendingUp, Users, Video, Calendar, ArrowUpRight, Loader2, Save, BarChart2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["hsl(var(--gold))", "hsl(var(--gold-light))", "hsl(var(--gold-deep))", "hsl(var(--muted-foreground))"];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=stats");
      const json = await res.json();
      return json.data;
    }
  });

  const { data: siteStats, isLoading: statsLoading } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_site_stats");
      const json = await res.json();
      return json.data;
    }
  });

  const [formData, setFormData] = useState({
    ambassadors_count: 0,
    partners_count: 0,
    events_count: 0,
    trips_count: 0,
    participants_count: 0,
    members_count: 10,
    countries_count: 4,
    satisfaction_rate: '87%'
  });

  useEffect(() => {
    if (siteStats) {
      setFormData({
        ambassadors_count: Math.max(siteStats.ambassadors_count || 0, siteStats.auto_ambassadors || 0),
        partners_count: Math.max(siteStats.partners_count || 0, siteStats.auto_partners || 0),
        events_count: Math.max(siteStats.events_count || 0, siteStats.auto_events || 0),
        trips_count: Math.max(siteStats.trips_count || 0, siteStats.auto_trips || 0),
        participants_count: Math.max(siteStats.participants_count || 0, siteStats.auto_participants || 0),
        members_count: siteStats.members_count || 0,
        countries_count: siteStats.countries_count || 0,
        satisfaction_rate: siteStats.satisfaction_rate || '0%'
      });
    }
  }, [siteStats]);

  const updateStats = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api-admin.php?action=update_site_stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      toast({ title: "Statistiques mises à jour", description: "La page d'accueil reflète maintenant ces nouvelles valeurs." });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const handleStatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStats.mutate(formData);
  };

  if (isLoading || statsLoading) {
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
          { I: TrendingUp, t: "Membres inscrits", v: stats?.total_members || 0, d: "Réseau", c: "text-success" },
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

        <div className="luxe-card p-6 rounded-sm flex flex-col">
          <div className="eyebrow mb-5 flex items-center gap-2"><BarChart2 size={14} className="text-gold" /> Statistiques Globales (Accueil)</div>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Ces valeurs sont affichées sur la page d'accueil du site pour présenter l'envergure du réseau. Vous pouvez les ajuster manuellement pour inclure votre historique.
          </p>
          <form onSubmit={handleStatsSubmit} className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Ambassadeurs</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.ambassadors_count} onChange={e => setFormData({...formData, ambassadors_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Partenaires</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.partners_count} onChange={e => setFormData({...formData, partners_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Événements</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.events_count} onChange={e => setFormData({...formData, events_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Séjours</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.trips_count} onChange={e => setFormData({...formData, trips_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Membres (Hero)</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.members_count} onChange={e => setFormData({...formData, members_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Pays (Hero)</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.countries_count} onChange={e => setFormData({...formData, countries_count: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Satisfaction (Hero)</label>
                <input type="text" className="input-field py-2 px-3 text-sm" value={formData.satisfaction_rate} onChange={e => setFormData({...formData, satisfaction_rate: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Participants Total</label>
                <input type="number" className="input-field py-2 px-3 text-sm" value={formData.participants_count} onChange={e => setFormData({...formData, participants_count: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="pt-2 mt-auto">
              <button type="submit" disabled={updateStats.isPending} className="btn-gold w-full py-2.5 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                {updateStats.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}