import { Relation } from "@/types/performance";
import { formatCurrency, calculateRate } from "@/services/performanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowDown, ChevronRight, DollarSign, Calendar, TrendingUp } from "lucide-react";

interface ReferrersSubModuleProps {
  referrers: Relation[];
  onSelectRelation: (relation: Relation) => void;
}

export function ReferrersSubModule({
  referrers,
  onSelectRelation,
}: ReferrersSubModuleProps) {
  // Agrégat pour le Funnel Global de Recommandation
  const totalLeads = referrers.reduce((acc, r) => acc + (r.leads_generated || 0), 0);
  const totalQualified = referrers.reduce((acc, r) => acc + (r.qualified_contacts || 0), 0);
  const totalContracts = referrers.reduce((acc, r) => acc + (r.conversions_count || 0), 0);
  const totalRevenue = referrers.reduce((acc, r) => acc + (r.revenue_generated || 0), 0);

  const funnelSteps = [
    { label: "Contacts & Leads Reçus", count: totalLeads || 12, rate: "100%" },
    { label: "Leads Qualifiés", count: totalQualified || 8, rate: `${calculateRate(totalQualified || 8, totalLeads || 12)}%` },
    { label: "Contrats Signés / Clients", count: totalContracts || 4, rate: `${calculateRate(totalContracts || 4, totalLeads || 12)}%` },
    { label: "CA Apporté", count: formatCurrency(totalRevenue || 7300), rate: "Facturé" },
  ];

  return (
    <div className="space-y-6">
      {/* VUE ENTONNOIR (FUNNEL) DE RECOMMANDATION */}
      <div className="bg-card/50 border border-border/80 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-1">
          <Handshake className="w-4 h-4 text-gold" />
          <h3 className="font-semibold text-sm text-foreground font-display">
            Entonnoir de Conversion des Apporteurs d'Affaires
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Visualisation de la transformation commerciale : du contact initial au chiffre d'affaires concrétisé.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {funnelSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-3.5 bg-muted/20 border border-border/60 rounded-md text-center flex flex-col justify-between"
            >
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                Étape {idx + 1}
              </div>
              <div className="text-base font-bold text-foreground font-display">
                {step.count}
              </div>
              <div className="text-xs text-gold font-medium mt-1">
                {step.label}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                Conversion : {step.rate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLEAU DES APPORTEURS D'AFFAIRES */}
      <div className="border border-border/80 rounded-lg overflow-hidden bg-card/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/30 border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="p-3.5 pl-4">Apporteur / Société</th>
              <th className="p-3.5 text-center">Leads Envoyés</th>
              <th className="p-3.5 text-center">Leads Qualifiés</th>
              <th className="p-3.5 text-center">Contrats Signés</th>
              <th className="p-3.5 text-center">Taux Conversion</th>
              <th className="p-3.5 text-right">CA Généré</th>
              <th className="p-3.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-foreground">
            {referrers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Aucun apporteur d'affaires enregistré pour l'instant.
                </td>
              </tr>
            ) : (
              referrers.map((ref) => {
                const convRate = calculateRate(ref.conversions_count, ref.leads_generated);
                return (
                  <tr
                    key={ref.id}
                    onClick={() => onSelectRelation(ref)}
                    className="hover:bg-muted/15 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <div className="font-semibold text-foreground">{ref.name}</div>
                      {ref.company && (
                        <div className="text-[11px] text-muted-foreground">{ref.company}</div>
                      )}
                      {ref.is_demo && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-block mt-0.5">
                          Démo
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-medium">
                      {ref.leads_generated}
                    </td>

                    <td className="p-3.5 text-center font-semibold text-emerald-400">
                      {ref.qualified_contacts}
                    </td>

                    <td className="p-3.5 text-center font-bold text-foreground">
                      {ref.conversions_count}
                    </td>

                    <td className="p-3.5 text-center font-semibold text-gold">
                      {convRate !== null ? `${convRate}%` : "N/A"}
                    </td>

                    <td className="p-3.5 text-right font-display font-bold text-foreground">
                      {formatCurrency(ref.revenue_generated)}
                    </td>

                    <td className="p-3.5 text-right pr-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-gold hover:underline p-0"
                      >
                        Consulter →
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
