import { useState } from "react";
import { Relation, RelationStatus } from "@/types/performance";
import { formatCurrency } from "@/services/performanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, ArrowLeft, Clock, DollarSign } from "lucide-react";

interface PipelineKanbanProps {
  relations: Relation[];
  onSelectRelation: (relation: Relation) => void;
  onUpdateStatus: (relationId: number, newStatus: RelationStatus) => void;
}

export function PipelineKanban({
  relations,
  onSelectRelation,
  onUpdateStatus,
}: PipelineKanbanProps) {
  const columns: { id: RelationStatus; title: string; color: string }[] = [
    { id: "prospect", title: "1. Prospects / Nouveaux", color: "border-purple-500/40 text-purple-400" },
    { id: "contacted", title: "2. Contactés / Qualif.", color: "border-amber-500/40 text-amber-400" },
    { id: "discussion", title: "3. En Discussion / Offre", color: "border-blue-500/40 text-blue-400" },
    { id: "active", title: "4. Actifs / Clients / Signés", color: "border-emerald-500/40 text-emerald-400" },
  ];

  const getNextStatus = (current: RelationStatus): RelationStatus | null => {
    switch (current) {
      case "prospect":
        return "contacted";
      case "contacted":
        return "discussion";
      case "discussion":
        return "active";
      default:
        return null;
    }
  };

  const getPrevStatus = (current: RelationStatus): RelationStatus | null => {
    switch (current) {
      case "active":
        return "discussion";
      case "discussion":
        return "contacted";
      case "contacted":
        return "prospect";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
        <span>Pipeline Commercial & Opérationnel — Déplacement rapide d'étape en étape</span>
        <span>{relations.length} dossier(s) en circulation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colRelations = relations.filter((r) => r.status === col.id);

          return (
            <div
              key={col.id}
              className="bg-card/40 border border-border/70 rounded-lg p-3 flex flex-col space-y-3 min-h-[450px]"
            >
              {/* HEADER DE COLONNE */}
              <div className={`flex items-center justify-between pb-2 border-b ${col.color}`}>
                <span className="font-semibold text-xs text-foreground">{col.title}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted/40 text-foreground">
                  {colRelations.length}
                </span>
              </div>

              {/* LISTE DES CARTES */}
              <div className="space-y-2.5 flex-1">
                {colRelations.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-center text-[11px] text-muted-foreground/60 border border-dashed border-border/40 rounded">
                    Aucun élément
                  </div>
                ) : (
                  colRelations.map((rel) => {
                    const nextSt = getNextStatus(rel.status);
                    const prevSt = getPrevStatus(rel.status);

                    return (
                      <div
                        key={rel.id}
                        className="p-3 bg-muted/20 border border-border/70 rounded-md space-y-2 hover:border-gold/40 transition-all shadow-sm"
                      >
                        <div
                          onClick={() => onSelectRelation(rel)}
                          className="cursor-pointer space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-xs text-foreground hover:text-gold transition-colors">
                              {rel.name}
                            </span>
                            {rel.is_demo && (
                              <span className="text-[8px] px-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Démo
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

                        {/* CHIFFRES RAPIDES */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                          <span>Qualifiés : <strong className="text-emerald-400">{rel.qualified_contacts}</strong></span>
                          <span>CA : <strong className="text-gold">{formatCurrency(rel.revenue_generated)}</strong></span>
                        </div>

                        {/* BOUTONS DE DÉPLACEMENT D'ÉTAPE */}
                        <div className="flex items-center justify-between pt-1">
                          {prevSt ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateStatus(rel.id, prevSt)}
                              className="h-5 px-1 text-[10px] text-muted-foreground hover:text-foreground"
                              title="Reculer d'une étape"
                            >
                              <ArrowLeft className="w-3 h-3 mr-0.5" /> Reculer
                            </Button>
                          ) : (
                            <div />
                          )}

                          {nextSt && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdateStatus(rel.id, nextSt)}
                              className="h-5 px-1.5 text-[10px] text-gold hover:text-gold-light hover:bg-gold/10 font-medium"
                              title="Avancer à l'étape suivante"
                            >
                              Avancer <ArrowRight className="w-3 h-3 ml-0.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
