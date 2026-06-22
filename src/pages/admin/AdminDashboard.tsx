import { TrendingUp, Users, DollarSign, Target, ArrowUpRight } from "lucide-react";
import { leads, offers, computeFinalPrice } from "@/data/mockData";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const trend = Array.from({ length: 12 }, (_, i) => ({ m: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][i], v: 12 + Math.round(Math.sin(i / 1.6) * 8 + i * 2.5) }));
const byOffer = offers.map((o) => ({ name: o.name.split(" ")[0], v: leads.filter((l) => l.offer === o.name).length }));
const COLORS = ["hsl(var(--gold))", "hsl(var(--gold-light))", "hsl(var(--gold-deep))"];

export default function AdminDashboard() {
  const totalRevenue = leads.reduce((a, l) => a + l.budget, 0);
  const qualifiedRate = Math.round((leads.filter((l) => l.score >= 70).length / leads.length) * 100);
  return (
    <div className="p-8 md:p-10">
      <div className="mb-10">
        <div className="eyebrow mb-2">Tableau de bord</div>
        <h1 className="font-display text-4xl">Pilotage du Cercle</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { I: Users, t: "Leads totaux", v: leads.length, d: "+12 ce mois", c: "text-success" },
          { I: Target, t: "Taux qualifié", v: `${qualifiedRate}%`, d: "+4 pts", c: "text-success" },
          { I: DollarSign, t: "Revenu potentiel", v: `${(totalRevenue / 1000).toFixed(1)} k€`, d: "+8.2%", c: "text-success" },
          { I: TrendingUp, t: "Marge moyenne", v: "38%", d: "Objectif 40%", c: "text-warning" },
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

      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        <div className="luxe-card p-6 rounded-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="eyebrow">Évolution leads · 12 derniers mois</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.4)", borderRadius: 2 }} />
              <Line type="monotone" dataKey="v" stroke="hsl(var(--gold))" strokeWidth={2} dot={{ fill: "hsl(var(--gold))" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Répartition par offre</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byOffer} dataKey="v" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {byOffer.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.4)", borderRadius: 2 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {byOffer.map((b, i) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-sm" style={{ background: COLORS[i] }} /> {b.name}</span>
                <span className="font-mono text-muted-foreground">{b.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="luxe-card rounded-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="eyebrow mb-1">Derniers leads</div>
            <div className="font-display text-xl">Activité récente</div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Membre</th>
              <th className="text-left p-4">Profil</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Offre</th>
              <th className="text-right p-4">Budget</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 6).map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="p-4 font-mono text-xs text-muted-foreground">{l.id}</td>
                <td className="p-4">{l.name} <span className="text-muted-foreground text-xs">· {l.country}</span></td>
                <td className="p-4 text-xs uppercase tracking-wider text-muted-foreground">{l.profile}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-border rounded-full overflow-hidden"><div className="h-full bg-gold" style={{ width: `${l.score}%` }} /></div>
                    <span className="text-xs font-mono gold-text">{l.score}</span>
                  </div>
                </td>
                <td className="p-4 text-xs">{l.offer}</td>
                <td className="p-4 text-right font-mono text-gold-light">{l.budget.toLocaleString("fr-FR")} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}