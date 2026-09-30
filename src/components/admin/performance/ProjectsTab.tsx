import { useState } from "react";
import { Project, KPI } from "@/types/performance";
import { formatCurrency } from "@/services/performanceService";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  BarChart2, 
  User, 
  Edit2, 
  Trash2, 
  Search,
  Clock
} from "lucide-react";
import { ProjectEvaluationModal } from "./ProjectEvaluationModal";

interface ProjectsTabProps {
  projects: Project[];
  kpis: KPI[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: number) => void;
}

export function ProjectsTab({
  projects,
  kpis,
  onEditProject,
  onDeleteProject,
}: ProjectsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectForEval, setSelectedProjectForEval] = useState<Project | null>(null);

  const filtered = projects.filter((p) => {
    return (
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.manager && p.manager.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">En cours</Badge>;
      case "planned":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Planifié</Badge>;
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Terminé</Badge>;
      case "blocked":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">Bloqué</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="text-[10px] text-rose-400 font-semibold uppercase">Urgent</span>;
      case "high":
        return <span className="text-[10px] text-amber-400 font-semibold uppercase">Haute</span>;
      default:
        return <span className="text-[10px] text-muted-foreground uppercase">Normale</span>;
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
            placeholder="Rechercher un projet, client, responsable..."
            className="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-md text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-gold"
          />
        </div>

        <div className="text-xs text-muted-foreground self-center">
          {filtered.length} projet(s) suivi(s)
        </div>
      </div>

      {/* GRILLE DES PROJETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="bg-card/50 border border-border/80 rounded-lg p-4 flex flex-col justify-between space-y-4 hover:border-gold/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {getStatusBadge(proj.status)}
                  {getPriorityBadge(proj.priority)}
                  {proj.is_demo ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Démo
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Réel
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditProject(proj)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-gold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Confirmer la suppression du projet "${proj.name}" ?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-sm text-foreground mb-1 leading-snug">
                {proj.name}
              </h3>

              {proj.client_name && (
                <div className="text-xs text-gold-light font-medium mb-2">
                  Client : {proj.client_name}
                </div>
              )}

              {proj.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {proj.description}
                </p>
              )}

              {/* PROGRESSION */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Progression globale</span>
                  <span className="font-bold text-foreground">{proj.progress_percent}%</span>
                </div>
                <Progress value={proj.progress_percent} className="h-1.5 bg-muted" />
              </div>

              {/* FINANCES & ÉCHÉANCE */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-border/50 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase block">Budget Dédié</span>
                  <span className="font-semibold text-foreground font-display">
                    {formatCurrency(proj.budget)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase block">Échéance</span>
                  <span className="font-medium text-foreground">
                    {proj.target_end_date || "Non définie"}
                  </span>
                </div>
              </div>

              {/* RISQUES ÉVENTUELS */}
              {proj.risks && (
                <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{proj.risks}</span>
                </div>
              )}
            </div>

            {/* BOUTON D'ÉVALUATION OBJECTIFS VS RÉALISÉ */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProjectForEval(proj)}
              className="w-full border-border/80 hover:border-gold/60 text-xs gap-1.5 text-foreground hover:bg-gold/10"
            >
              <BarChart2 className="w-3.5 h-3.5 text-gold" />
              Évaluer Objectifs vs Réalisé
            </Button>
          </div>
        ))}
      </div>

      {/* MODALE D'ÉVALUATION COMPARATIVE */}
      <ProjectEvaluationModal
        project={selectedProjectForEval}
        isOpen={!!selectedProjectForEval}
        onClose={() => setSelectedProjectForEval(null)}
        kpis={kpis}
      />
    </div>
  );
}
