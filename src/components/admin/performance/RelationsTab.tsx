import { useState } from "react";
import { Relation } from "@/types/performance";
import { formatCurrency } from "@/services/performanceService";
import { Search, Building2, User, Clock, ArrowRight, Star, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RelationsTabProps {
  relations: Relation[];
  selectedType: string;
  selectedStatus: string;
  onSelectRelation: (relation: Relation) => void;
  onEditRelation: (relation: Relation) => void;
  onDeleteRelation: (id: number) => void;
}

export function RelationsTab({
  relations,
  selectedType,
  selectedStatus,
  onSelectRelation,
  onEditRelation,
  onDeleteRelation,
}: RelationsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = relations.filter((r) => {
    const matchesSearch =
      searchTerm === "" ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.manager && r.manager.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "all" || r.type === selectedType;
    const matchesStatus = selectedStatus === "all" || r.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Actif</Badge>;
      case "discussion":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">En discussion</Badge>;
      case "contacted":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Contacté</Badge>;
      case "prospect":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">Prospect</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Inactif</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "client":
        return <span className="text-xs font-semibold text-gold">Client Partenaire</span>;
      case "ambassador":
        return <span className="text-xs font-semibold text-blue-400">Ambassadeur</span>;
      case "business_referrer":
        return <span className="text-xs font-semibold text-purple-400">Apporteur d'Affaires</span>;
      case "partner":
        return <span className="text-xs font-semibold text-teal-400">Partenaire</span>;
      case "prospect":
        return <span className="text-xs font-semibold text-muted-foreground">Prospect</span>;
      default:
        return <span className="text-xs font-medium text-muted-foreground">{type}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* BARRE DE RECHERCHE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, entreprise, responsable, email..."
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-md text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-gold transition-colors"
          />
        </div>

        <div className="text-xs text-muted-foreground self-center">
          {filtered.length} relation(s) trouvée(s)
        </div>
      </div>

      {/* TABLE DES RELATIONS (DESKTOP) */}
      <div className="hidden md:block rounded-lg border border-border/80 bg-card/40 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/30 border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5 pl-4">Relation / Organisation</th>
              <th className="p-3.5">Type & Statut</th>
              <th className="p-3.5 text-center">Contacts Qualifiés</th>
              <th className="p-3.5 text-center">Leads Générés</th>
              <th className="p-3.5 text-right">CA Réalisé</th>
              <th className="p-3.5">Prochaine Action</th>
              <th className="p-3.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-foreground">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Aucune relation ne correspond à vos filtres actuels.
                </td>
              </tr>
            ) : (
              filtered.map((rel) => (
                <tr
                  key={rel.id}
                  onClick={() => onSelectRelation(rel)}
                  className="hover:bg-muted/20 cursor-pointer transition-colors group"
                >
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display font-bold text-xs shrink-0">
                        {rel.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-gold transition-colors flex items-center gap-2">
                          {rel.name}
                          {rel.is_demo ? (
                            <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              Démo
                            </span>
                          ) : (
                            <span className="text-[9px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              Réel
                            </span>
                          )}
                        </div>
                        {rel.company && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {rel.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-1">
                      <div>{getTypeBadge(rel.type)}</div>
                      <div>{getStatusBadge(rel.status)}</div>
                    </div>
                  </td>

                  <td className="p-3.5 text-center font-semibold text-emerald-400">
                    {rel.qualified_contacts}
                  </td>

                  <td className="p-3.5 text-center text-foreground font-medium">
                    {rel.leads_generated}
                  </td>

                  <td className="p-3.5 text-right font-display font-semibold text-gold">
                    {formatCurrency(rel.revenue_generated)}
                  </td>

                  <td className="p-3.5 max-w-[200px]">
                    {rel.next_action ? (
                      <div className="text-[11px] text-foreground/90 truncate flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gold shrink-0" />
                        <span className="truncate">{rel.next_action}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">Aucune action planifiée</span>
                    )}
                    {rel.next_contact_date && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Échéance : {rel.next_contact_date}
                      </div>
                    )}
                  </td>

                  <td className="p-3.5 text-right pr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-gold hover:bg-gold/10"
                    >
                      Détails <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VUE MOBILE SOUS FORME DE CARTES */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filtered.map((rel) => (
          <div
            key={rel.id}
            onClick={() => onSelectRelation(rel)}
            className="p-4 bg-card/60 border border-border/80 rounded-lg space-y-3 cursor-pointer hover:border-gold/50 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-foreground flex items-center gap-2">
                  {rel.name}
                  {rel.is_demo ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Démo
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Réel
                    </span>
                  )}
                </div>
                {rel.company && (
                  <div className="text-xs text-muted-foreground">{rel.company}</div>
                )}
              </div>
              <div>{getStatusBadge(rel.status)}</div>
            </div>

            <div className="flex items-center justify-between text-xs py-2 border-y border-border/50">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Contacts Qualifiés</span>
                <span className="font-bold text-emerald-400">{rel.qualified_contacts}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase">CA Réalisé</span>
                <span className="font-bold text-gold font-display">{formatCurrency(rel.revenue_generated)}</span>
              </div>
            </div>

            {rel.next_action && (
              <div className="text-xs text-foreground/80 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="truncate">{rel.next_action}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
