import { Campaign } from "@/types/performance";
import { formatCurrency, formatNumber, calculateRate } from "@/services/performanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Calendar, DollarSign, Target, MousePointer, Eye, CheckCircle2, AlertCircle } from "lucide-react";

interface CampaignsEventsTabProps {
  campaigns: Campaign[];
  onOpenAddCampaign: () => void;
}

export function CampaignsEventsTab({
  campaigns,
  onOpenAddCampaign,
}: CampaignsEventsTabProps) {
  // Événements clés contractualisés (notamment ITID BNE Essoyes 24 Octobre 2026)
  const scheduledEvents = [
    {
      id: "ev1",
      name: "BNE × ESSOYES — Business Networking Experience",
      date: "24 Octobre 2026",
      location: "Essoyes (Aube)",
      client: "Institut ITID & Partenaires MDIV",
      type: "Captation Vidéo & Conférence",
      status: "Confirmé au contrat",
      focus: "Captation d'interviews, valorisation de l'expertise médicale et networking B2B.",
    },
    {
      id: "ev2",
      name: "Événement de l'Écosystème Professionnel ITID",
      date: "Date à confirmer (T4 2026)",
      location: "Région Client",
      client: "Institut ITID",
      type: "Rencontre Partenaires",
      status: "Prévu au contrat",
      focus: "Création de contenu exclusif et échanges avec les praticiens de l'écosystème.",
    },
    {
      id: "ev3",
      name: "Rencontre Professionnelle & Salon Paris",
      date: "Novembre 2026",
      location: "Paris",
      client: "Institut ITID & Réseau MDIV",
      type: "Salon & Captation",
      status: "En préparation",
      focus: "Diffusion multicanale des formats courts et génération de contacts qualifiés.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* SECTION 1 : CAMPAGNES MARKETING & GOOGLE ADS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold" />
              <h3 className="font-semibold text-sm text-foreground font-display">
                Campagnes Marketing & Publicité Digitale
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Suivi des investissements et retours sur investissement par canal.
            </p>
          </div>
        </div>

        {/* ALERTE CONTRACTUELLE GOOGLE ADS */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-blue-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-200">Principe contractuel Google Ads :</strong> Conformément à la convention de partenariat (ex: ITID), les budgets publicitaires sont financés directement par le client. MDIV Business assure l'accompagnement stratégique, le ciblage, la création des annonces et le suivi d'optimisation.
          </div>
        </div>

        {/* LISTE DES CAMPAGNES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => {
            const costPerLead = camp.leads > 0 ? Math.round((camp.budget / camp.leads) * 10) / 10 : null;
            const costPerQualified = camp.qualified_contacts > 0 ? Math.round((camp.budget / camp.qualified_contacts) * 10) / 10 : null;

            return (
              <div
                key={camp.id}
                className="bg-card/50 border border-border/80 rounded-lg p-5 space-y-4 hover:border-gold/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
                      {camp.channel === "google_ads" ? "Google Ads Search" : camp.channel}
                    </span>
                    <h4 className="font-semibold text-sm text-foreground mt-0.5">{camp.name}</h4>
                    {camp.client_name && (
                      <div className="text-xs text-muted-foreground">{camp.client_name}</div>
                    )}
                  </div>

                  <div className="text-right">
                    <Badge className="bg-muted text-foreground border-border text-xs font-mono">
                      Budget : {formatCurrency(camp.budget)}
                    </Badge>
                    {camp.client_funded && (
                      <span className="text-[9px] text-muted-foreground block mt-1">
                        Financé par le client
                      </span>
                    )}
                  </div>
                </div>

                {/* MÉTRIQUES DE PERFORMANCE DE LA CAMPAGNE */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-muted/20 border border-border/50 rounded text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase">Impressions</span>
                    <span className="font-bold text-foreground">{formatNumber(camp.impressions)}</span>
                  </div>
                  <div className="p-2 bg-muted/20 border border-border/50 rounded text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase">Clics</span>
                    <span className="font-bold text-foreground">{formatNumber(camp.clicks)}</span>
                  </div>
                  <div className="p-2 bg-muted/20 border border-border/50 rounded text-center">
                    <span className="text-[10px] text-muted-foreground block uppercase">Qualifiés</span>
                    <span className="font-bold text-emerald-400">{camp.qualified_contacts}</span>
                  </div>
                </div>

                {/* COÛTS PAR LEAD ET QUALIFIÉ */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/40 text-muted-foreground">
                  <span>Coût / lead : <strong className="text-foreground">{costPerLead ? `${costPerLead} €` : "N/A"}</strong></span>
                  <span>Coût / contact qualifié : <strong className="text-emerald-400">{costPerQualified ? `${costPerQualified} €` : "N/A"}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 : ÉVÉNEMENTS CONTRACTUELS & COUVERTURE VIDÉO */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-sm text-foreground font-display">
              Événements Contractuels & Captations Prévues
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Planification des temps forts en présentiel stipulés dans la convention (captation vidéo & valorisation).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scheduledEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-muted/15 border border-border/70 rounded-lg p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <Badge variant="outline" className="text-gold border-gold/40 text-[10px]">
                    {ev.date}
                  </Badge>
                  <span className="text-[10px] text-emerald-400 font-medium">{ev.status}</span>
                </div>

                <h4 className="font-bold text-xs text-foreground mb-1 leading-snug">
                  {ev.name}
                </h4>

                <div className="text-[11px] text-muted-foreground mb-2">
                  📍 {ev.location} • {ev.client}
                </div>

                <p className="text-[11px] text-foreground/80 leading-relaxed">
                  {ev.focus}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                <span>Rôle MDIV : Captation & Diffusion</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
