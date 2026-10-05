import { Activity } from "@/types/performance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  Users, 
  Video, 
  FileText, 
  AlertTriangle,
  Plus
} from "lucide-react";

interface ActivitiesTimelineProps {
  activities: Activity[];
  onOpenAddActivity: () => void;
}

export function ActivitiesTimeline({
  activities,
  onOpenAddActivity,
}: ActivitiesTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-3.5 h-3.5 text-blue-400" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-purple-400" />;
      case "meeting":
        return <Users className="w-3.5 h-3.5 text-gold" />;
      case "publication":
      case "content_creation":
        return <Video className="w-3.5 h-3.5 text-pink-400" />;
      case "event":
        return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground font-display">
            Journal des Actions & Prochaines Échéances
          </h3>
          <p className="text-xs text-muted-foreground">
            Historique chronologique des interactions et relances pour garantir la continuité des relations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenAddActivity}
          className="bg-gold hover:bg-gold-light text-black text-xs font-medium self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Enregistrer une Action
        </Button>
      </div>

      <div className="relative pl-6 space-y-4 border-l-2 border-border/70 ml-2">
        {activities.map((act) => {
          const isOverdue = act.status === "planned" && act.date < today;

          return (
            <div key={act.id} className="relative group">
              {/* Point sur la timeline */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                  act.status === "completed"
                    ? "border-emerald-500 text-emerald-500"
                    : isOverdue
                    ? "border-rose-500 text-rose-500"
                    : "border-gold text-gold"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              {/* Contenu de l'action */}
              <div className="bg-card/50 border border-border/80 rounded-lg p-4 space-y-2 hover:border-gold/40 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-muted/40 border border-border/60">
                      {getActivityIcon(act.type)}
                    </div>
                    <span className="font-semibold text-xs text-foreground">{act.title}</span>
                    {act.relation_name && (
                      <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                        {act.relation_name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{act.date}</span>
                    {act.status === "completed" ? (
                      <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Réalisé
                      </span>
                    ) : (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        isOverdue 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {isOverdue ? "En retard" : "Planifié"}
                      </span>
                    )}
                  </div>
                </div>

                {act.comments && (
                  <p className="text-xs text-muted-foreground pl-7">{act.comments}</p>
                )}

                {/* PROCHAINE ACTION ASSOCIÉE */}
                {act.next_action_title && (
                  <div className="mt-2 ml-7 p-2.5 bg-gold/5 border border-gold/20 rounded text-xs text-foreground/90 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gold-light">Prochaine étape : </span>
                      {act.next_action_title}
                      {act.next_action_date && (
                        <span className="text-muted-foreground block text-[10px] mt-0.5">
                          Échéance prévue le : {act.next_action_date}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
