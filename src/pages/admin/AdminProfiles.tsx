import { leads } from "@/data/mockData";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const profCount = ["entrepreneur", "investor", "freelancer"].map((p) => ({ name: p, v: leads.filter((l) => l.profile === p).length }));
const radar = [
  { axis: "Réseau", v: 88 },
  { axis: "Capital", v: 72 },
  { axis: "Voyage", v: 81 },
  { axis: "Wellness", v: 56 },
  { axis: "Art & culture", v: 64 },
  { axis: "Tech", v: 78 },
];

export default function AdminProfiles() {
  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">Profils membres</div>
        <h1 className="font-display text-4xl">Analyse comportementale IA</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Distribution des profils</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profCount}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.4)", borderRadius: 2 }} />
              <Bar dataKey="v" fill="hsl(var(--gold))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Intérêts agrégés</div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="axis" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(var(--border))" />
              <Radar dataKey="v" stroke="hsl(var(--gold))" fill="hsl(var(--gold) / 0.3)" />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}