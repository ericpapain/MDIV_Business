import { useState } from "react";
import { Relation, Project, KPI, Activity } from "@/types/performance";
import { formatCurrency } from "@/services/performanceService";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  Edit2,
  Trash2,
  Send
} from "lucide-react";

interface RelationDetailSheetProps {
  relation: Relation | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  kpis: KPI[];
  activities: Activity[];
  onEdit: (relation: Relation) => void;
  onDelete: (id: number) => void;
  onUpdateNextAction: (relationId: number, nextAction: string, nextDate: string) => void;
}

export function RelationDetailSheet({
  relation,
  isOpen,
  onClose,
  projects,
  kpis,
  activities,
  onEdit,
  onDelete,
  onUpdateNextAction,
}: RelationDetailSheetProps) {
  if (!relation) return null;

  const [quickAction, setQuickAction] = useState(relation.next_action || "");
  const [quickDate, setQuickDate] = useState(relation.next_contact_date || "");

  const relationProjects = projects.filter((p) => p.relation_id === relation.id);
  const relationKpis = kpis.filter((k) => k.relation_id === relation.id);
  const relationActivities = activities.filter((a) => a.relation_id === relation.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Actif</Badge>;
      case "discussion":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">En discussion</Badge>;
      case "contacted":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Contacté</Badge>;
      case "prospect":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Prospect</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      client: "Client Partenaire",
      ambassador: "Ambassadeur",
      business_referrer: "Apporteur d'Affaires",
      partner: "Partenaire",
      prospect: "Prospect",
      prescriber: "Prescripteur",
    };
    return labels[type] || type;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-[#0d1115] border-border overflow-y-auto p-6 text-foreground">
        <SheetHeader className="pb-4 border-b border-border/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-gold">
                  {getTypeLabel(relation.type)}
                </span>
                {getStatusBadge(relation.status)}
                {relation.is_demo ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px]">
                    Données de démonstration
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px]">
                    Cas Réel Contractuel
                  </Badge>
                )}
              </div>

              <SheetTitle className="text-2xl font-bold font-display text-foreground">
                {relation.name}
              </SheetTitle>

              {relation.company && (
                <SheetDescription className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {relation.company} {relation.role ? `• ${relation.role}` : ""}
                </SheetDescription>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(relation)}
                className="h-8 w-8 p-0 hover:text-gold"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`Confirmer la suppression de "${relation.name}" ?`)) {
                    onDelete(relation.id);
                    onClose();
                  }
                }}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6 text-sm">
          {/* COORDONNÉES & CONTACT */}
          <div className="bg-muted/10 border border-border/60 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {relation.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <a href={`mailto:${relation.email}`} className="text-foreground hover:underline">
                  {relation.email}
                </a>
              </div>
            )}
            {relation.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-gold" />
                <a href={`tel:${relation.phone}`} className="text-foreground hover:underline">
                  {relation.phone}
                </a>
              </div>
            )}
            {relation.website && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <Globe className="w-3.5 h-3.5 text-gold" />
                <a href={relation.website} target="_blank" rel="noreferrer" className="text-gold-light hover:underline flex items-center gap-1">
                  {relation.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {relation.manager && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <User className="w-3.5 h-3.5 text-gold" />
                <span>Responsable interne : <strong className="text-foreground">{relation.manager}</strong></span>
              </div>
            )}
          </div>

          {/* DÉTAILS DU CONTRAT (CAS CLIENT NOTAMMENT ITID) */}
          {relation.contract_details && (
            <div className="bg-gold/5 border border-gold/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  <span className="font-semibold text-sm text-foreground">Éléments Contractuels</span>
                </div>
                {relation.contract_details.monthly_fee && (
                  <Badge className="bg-gold text-black font-semibold text-xs">
                    {relation.contract_details.monthly_fee} € TTC / mois
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                {relation.contract_details.duration && (
                  <div>
                    <strong className="text-foreground">Durée :</strong> {relation.contract_details.duration}
                  </div>
                )}
                {relation.contract_details.review_6m_date && (
                  <div className="text-gold-light font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Bilan intermédiaire prévu le : {relation.contract_details.review_6m_date}
                  </div>
                )}

                {relation.contract_details.services && relation.contract_details.services.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gold/15">
                    <span className="font-medium text-foreground block mb-1.5">Prestations incluses :</span>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {relation.contract_details.services.map((srv, idx) => (
                        <li key={idx} className="text-foreground/80">{srv}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION PROCHAINE ACTION (POUR ÉVITER LE SANS SUIVI) */}
          <div className="bg-background/80 border border-border/80 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Clock className="w-4 h-4 text-gold" />
              Prochaine Action de Suivi
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Définir la prochaine étape concrète pour cette relation afin de garantir un accompagnement réactif.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={quickAction}
                onChange={(e) => setQuickAction(e.target.value)}
                placeholder="Ex: Préparation tournage vidéo Essoyes..."
                className="flex-1 bg-muted/30 border border-border rounded px-3 py-1.5 text-xs text-foreground outline-none focus:border-gold"
              />
              <input
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                className="bg-muted/30 border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
              />
              <Button
                size="sm"
                onClick={() => onUpdateNextAction(relation.id, quickAction, quickDate)}
                className="bg-gold hover:bg-gold-light text-black text-xs font-medium"
              >
                Mettre à jour
              </Button>
            </div>
          </div>

          {/* PERFORMANCE & CHIFFRES CLÉS */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Bilan de Performance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/20 border border-border/60 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Leads Reçus</span>
                <span className="text-lg font-bold text-foreground font-display">{relation.leads_generated}</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Contacts Qualifiés</span>
                <span className="text-lg font-bold text-emerald-400 font-display">{relation.qualified_contacts}</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">CA Réalisé</span>
                <span className="text-lg font-bold text-gold font-display">{formatCurrency(relation.revenue_generated)}</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border/60 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground uppercase block">Taux Conversion</span>
                <span className="text-lg font-bold text-foreground font-display">
                  {relation.conversion_rate !== null && relation.conversion_rate !== undefined 
                    ? `${relation.conversion_rate}%` 
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* PROJETS ASSOCIÉS */}
          {relationProjects.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                <span>Projets Liés ({relationProjects.length})</span>
              </h4>
              <div className="space-y-2">
                {relationProjects.map((p) => (
                  <div key={p.id} className="p-3 bg-muted/20 border border-border/60 rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium text-xs text-foreground">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">Progression : {p.progress_percent}% • Statut : {p.status}</div>
                    </div>
                    <Badge variant="outline" className="text-xs border-gold/40 text-gold">
                      {formatCurrency(p.budget)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORIQUE D'ACTIVITÉ */}
          {relationActivities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Dernières Activités
              </h4>
              <div className="space-y-2">
                {relationActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="p-2.5 bg-muted/15 border border-border/50 rounded text-xs flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{act.title}</div>
                      <div className="text-[10px] text-muted-foreground">{act.date} • {act.manager}</div>
                      {act.comments && <p className="text-[11px] text-muted-foreground/90 mt-1">{act.comments}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
