import { PerformanceStatsSummary } from "@/types/performance";
import { formatCurrency, formatNumber } from "@/services/performanceService";
import { 
  Users, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  Handshake,
  Star
} from "lucide-react";

interface KPICardsGridProps {
  summary: PerformanceStatsSummary;
  selectedType: string;
}

export function KPICardsGrid({ summary, selectedType }: KPICardsGridProps) {
  const cards = [
    {
      title: "Relations Actives",
      value: summary.active_relations,
      subtext: `${summary.new_contacts} répertoriées au total`,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Contacts Qualifiés",
      value: summary.qualified_contacts,
      subtext: `${summary.leads_generated} leads bruts traités`,
      icon: Target,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      badge: "KPI Contractuel Clé",
    },
    {
      title: "Taux de Conversion",
      value: `${summary.conversion_rate}%`,
      subtext: "Leads transformés en clients / contrats",
      icon: TrendingUp,
      color: "text-gold",
      bgColor: "bg-gold/10",
      borderColor: "border-gold/20",
    },
    {
      title: "Projets Opérationnels",
      value: summary.active_projects,
      subtext: `${summary.completed_projects} projets finalisés`,
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Chiffre d'Affaires Réalisé",
      value: formatCurrency(summary.revenue_generated),
      subtext: `Potentiel identifié : ${formatCurrency(summary.potential_revenue)}`,
      icon: DollarSign,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Actions de Suivi",
      value: summary.actions_completed,
      subtext: summary.actions_delayed > 0 
        ? `${summary.actions_delayed} action(s) en attente / en retard`
        : "Toutes les actions sont à jour",
      icon: summary.actions_delayed > 0 ? AlertTriangle : Activity,
      color: summary.actions_delayed > 0 ? "text-rose-400" : "text-teal-400",
      bgColor: summary.actions_delayed > 0 ? "bg-rose-500/10" : "bg-teal-500/10",
      borderColor: summary.actions_delayed > 0 ? "border-rose-500/30" : "border-teal-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="relative bg-card/60 backdrop-blur-sm border border-border/70 rounded-lg p-4 transition-all duration-200 hover:border-gold/40 hover:shadow-md flex flex-col justify-between"
        >
          {card.badge && (
            <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {card.badge}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-md ${card.bgColor} ${card.borderColor} border`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                {card.title}
              </span>
            </div>

            <div className="text-2xl font-bold tracking-tight text-foreground font-display">
              {card.value}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground pt-2 border-t border-border/40 line-clamp-1">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
}
