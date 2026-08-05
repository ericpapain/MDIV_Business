import { useState } from "react";
import { members } from "@/data/mockData";
import { Search } from "lucide-react";

export default function AdminMembers() {
  const [q, setQ] = useState("");
  
  const filtered = members.filter((m) =>
    (q === "" || m.name.toLowerCase().includes(q.toLowerCase()) || m.role.toLowerCase().includes(q.toLowerCase()) || m.countryCode.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">Communauté & Partenaires</div>
        <h1 className="font-display text-4xl">Gestion des Membres</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un membre, un rôle…"
            className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-sm text-sm outline-none focus:border-gold/60" />
        </div>
      </div>

      <div className="luxe-card rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <th className="text-left p-4">Photo</th>
              <th className="text-left p-4">Membre</th>
              <th className="text-left p-4">Rôle / Titre</th>
              <th className="text-left p-4">Pays</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4 text-xs text-muted-foreground max-w-xs">{m.role}</td>
                <td className="p-4 text-xl">{m.flag} <span className="text-xs text-muted-foreground ml-2">{m.countryCode}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}