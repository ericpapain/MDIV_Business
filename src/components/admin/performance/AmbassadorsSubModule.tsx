import { useState } from "react";
import { Relation } from "@/types/performance";
import { calculateAmbassadorScore, formatCurrency } from "@/services/performanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Share2, 
  Users, 
  Activity, 
  DollarSign, 
  Sliders, 
  TrendingUp, 
  MessageSquare,
  Award,
  ChevronRight
} from "lucide-react";

interface AmbassadorsSubModuleProps {
  ambassadors: Relation[];
  onSelectRelation: (relation: Relation) => void;
}

export function AmbassadorsSubModule({
  ambassadors,
  onSelectRelation,
}: AmbassadorsSubModuleProps) {
  // Pondérations configurables par l'utilisateur
  const [weights, setWeights] = useState({
    leads: 25,
    conversions: 25,
    engagement: 20,
    activity: 15,
    revenue: 15,
  });

  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="space-y-6">
      {/* BANDEAU EXPLICATIF & CONFIGURATION DU SCORE PONDÉRÉ */}
      <div className="bg-muted/15 border border-border/70 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              <h3 className="font-semibold text-sm text-foreground font-display">
                Évaluation & Performance des Ambassadeurs
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Score transparent calculé selon les 5 dimensions configurables ci-dessous (aucun algorithme opaque).
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="border-border text-xs gap-1.5 self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-gold" />
            {showConfig ? "Masquer les coefficients" : "Ajuster la pondération"}
          </Button>
        </div>

        {/* PANNEAU DE CONFIGURATION DES COEFFICIENTS */}
        {showConfig && (
          <div className="pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Leads (%)</label>
              <input
                type="number"
                value={weights.leads}
                onChange={(e) => setWeights({ ...weights, leads: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Conversions (%)</label>
              <input
                type="number"
                value={weights.conversions}
                onChange={(e) => setWeights({ ...weights, conversions: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Engagement (%)</label>
              <input
                type="number"
                value={weights.engagement}
                onChange={(e) => setWeights({ ...weights, engagement: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Activité (%)</label>
              <input
                type="number"
                value={weights.activity}
                onChange={(e) => setWeights({ ...weights, activity: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">CA Apporté (%)</label>
              <input
                type="number"
                value={weights.revenue}
                onChange={(e) => setWeights({ ...weights, revenue: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* LISTE DES AMBASSADEURS AVEC VUE MULTI-DIMENSIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ambassadors.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Aucun ambassadeur enregistré. Vous pouvez en ajouter un via le bouton "Nouveau Dossier".
          </div>
        ) : (
          ambassadors.map((amb) => {
            const metrics = amb.ambassador_metrics || {
              posts_count: 8,
              shares_count: 22,
              mentions_count: 14,
              engagement_rate: 4.5,
              activity_score: 75,
            };

            const { score, breakdown } = calculateAmbassadorScore(
              {
                leads: amb.leads_generated,
                conversions: amb.conversions_count,
                engagementRate: metrics.engagement_rate,
                activityScore: metrics.activity_score,
                revenue: amb.revenue_generated,
              },
              weights
            );

            return (
              <div
                key={amb.id}
                className="bg-card/50 border border-border/80 rounded-lg p-5 space-y-4 hover:border-gold/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{amb.name}</h4>
                      {amb.is_demo ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Démo
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Réel
                        </span>
                      )}
                    </div>
                    {amb.company && (
                      <div className="text-xs text-muted-foreground">{amb.company}</div>
                    )}
                  </div>

                  {/* SCORE GLOBAL TRANSPARENT */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-display font-bold text-sm">
                      <Award className="w-3.5 h-3.5" />
                      {score} / 100
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Score calculé</span>
                  </div>
                </div>

                {/* 4 DIMENSIONS : ENGAGEMENT, BUSINESS, ACTIVITÉ, RELATION */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Engagement */}
                  <div className="p-2.5 bg-muted/20 border border-border/60 rounded">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block flex items-center gap-1 mb-1">
                      <Share2 className="w-3 h-3 text-blue-400" />
                      Engagement
                    </span>
                    <div className="space-y-0.5 text-[11px] text-foreground/90">
                      <div>Publications : <strong>{metrics.posts_count}</strong></div>
                      <div>Partages & Mentions : <strong>{metrics.shares_count + metrics.mentions_count}</strong></div>
                      <div>Taux d'engagement : <strong>{metrics.engagement_rate}%</strong></div>
                    </div>
                  </div>

                  {/* Business */}
                  <div className="p-2.5 bg-muted/20 border border-border/60 rounded">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Business
                    </span>
                    <div className="space-y-0.5 text-[11px] text-foreground/90">
                      <div>Leads générés : <strong>{amb.leads_generated}</strong></div>
                      <div>Qualifiés : <strong className="text-emerald-400">{amb.qualified_contacts}</strong></div>
                      <div>CA apporté : <strong className="text-gold">{formatCurrency(amb.revenue_generated)}</strong></div>
                    </div>
                  </div>
                </div>

                {/* DÉCOMPOSITION DU SCORE */}
                <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Pondération : L:{breakdown.leadsContribution} C:{breakdown.conversionsContribution} E:{breakdown.engagementContribution} A:{breakdown.activityContribution} R:{breakdown.revenueContribution}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectRelation(amb)}
                    className="h-6 text-xs text-gold hover:underline p-0"
                  >
                    Voir la fiche complète →
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
