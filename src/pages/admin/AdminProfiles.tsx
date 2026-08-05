import { partners } from "@/data/mockData";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

// Agréger les partenaires par catégorie
const categoriesCount = partners.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const profCount = Object.entries(categoriesCount).map(([name, v]) => ({ name, v }));

const radar = [
  { axis: "Immobilier", v: 88 },
  { axis: "Finance", v: 72 },
  { axis: "Tech & IA", v: 81 },
  { axis: "Luxe & Mode", v: 56 },
  { axis: "Santé", v: 64 },
  { axis: "Gastronomie", v: 78 },
];

export default function AdminProfiles() {
  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">Profils & Partenaires</div>
        <h1 className="font-display text-4xl">Analyse de la Communauté</h1>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="luxe-card p-6 rounded-sm">
          <div className="eyebrow mb-5">Distribution des Partenaires</div>
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
          <div className="eyebrow mb-5">Centres d'intérêts (Global)</div>
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