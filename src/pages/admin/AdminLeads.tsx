import { useState } from "react";
import { leads } from "@/data/mockData";
import { Search } from "lucide-react";

export default function AdminLeads() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Tout");
  const filtered = leads.filter((l) =>
    (status === "Tout" || l.status === status) &&
    (q === "" || l.name.toLowerCase().includes(q.toLowerCase()) || l.country.toLowerCase().includes(q.toLowerCase()))
  );
  const statuses = ["Tout", "Qualifié", "Contact privé", "Nurturing", "Froid", "Closed"];

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">Leads · Pipeline</div>
        <h1 className="font-display text-4xl">Gestion des prospects</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un membre, un pays…"
            className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-sm text-sm outline-none focus:border-gold/60" />
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 text-[11px] uppercase tracking-[0.18em] rounded-sm border ${status === s ? "border-gold bg-gold/10 text-gold-light" : "border-border hover:border-gold/40 text-muted-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="luxe-card rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Membre</th>
              <th className="text-left p-4">Profil</th>
              <th className="text-left p-4">Score</th>
              <th className="text-left p-4">Offre</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-right p-4">Budget</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer">
                <td className="p-4 font-mono text-xs text-muted-foreground">{l.id}</td>
                <td className="p-4">{l.name} <span className="text-muted-foreground text-xs">· {l.country}</span></td>
                <td className="p-4 text-xs uppercase tracking-wider text-muted-foreground">{l.profile}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-border rounded-full overflow-hidden"><div className={`h-full ${l.score >= 80 ? "bg-success" : l.score >= 60 ? "bg-gold" : "bg-muted-foreground"}`} style={{ width: `${l.score}%` }} /></div>
                    <span className="text-xs font-mono gold-text">{l.score}</span>
                  </div>
                </td>
                <td className="p-4 text-xs">{l.offer}</td>
                <td className="p-4"><span className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] rounded-sm bg-muted/40 text-foreground/80">{l.status}</span></td>
                <td className="p-4 text-right font-mono text-gold-light">{l.budget.toLocaleString("fr-FR")} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}