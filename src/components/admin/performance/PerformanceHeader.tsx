import { PeriodFilter, RelationType } from "@/types/performance";
import { Plus, Download, Filter, TrendingUp, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerformanceHeaderProps {
  period: PeriodFilter;
  setPeriod: (p: PeriodFilter) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  onOpenAddModal: () => void;
  onOpenKPIModal: () => void;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export function PerformanceHeader({
  period,
  setPeriod,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  onOpenAddModal,
  onOpenKPIModal,
  onExportCSV,
}: PerformanceHeaderProps) {
  return (
    <div className="flex flex-col gap-6 pb-6 border-b border-border/80">
      {/* LIGNE PRINCIPALE : TITRE & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
              <TrendingUp className="w-3.5 h-3.5" />
              Pilotage Opérationnel & Commercial
            </span>
            <span className="text-xs text-muted-foreground">MDIV Business × Partenaires</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground font-semibold tracking-tight">
            Pilotage & Performance
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Suivi stratégique des relations, KPI contractuels, projets, campagnes marketing et revues d'objectifs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenKPIModal}
            className="border-border hover:border-gold/50 text-xs gap-1.5 bg-background/50 hover:bg-muted/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
            Gérer les KPI
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="border-border hover:border-gold/50 text-xs gap-1.5 bg-background/50 hover:bg-muted/40"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </Button>

          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="bg-gold hover:bg-gold-light text-black font-medium text-xs gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau Dossier / Action
          </Button>
        </div>
      </div>

      {/* BARRE DE FILTRES RESPONSIVE */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/20 border border-border/60 rounded-lg text-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pl-1">
          <Filter className="w-3.5 h-3.5 text-gold" />
          <span>Filtres :</span>
        </div>

        {/* Période */}
        <div className="flex items-center gap-1 bg-background/60 border border-border/80 rounded-md p-0.5">
          {[
            { id: "all", label: "Toutes" },
            { id: "month", label: "Ce mois" },
            { id: "quarter", label: "Ce trimestre" },
            { id: "year", label: "Cette année" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id as PeriodFilter)}
              className={`px-2.5 py-1 text-xs rounded transition-all font-medium ${
                period === p.id
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Type de relation */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-background/80 border border-border/80 text-foreground text-xs rounded-md px-3 py-1.5 outline-none focus:border-gold"
        >
          <option value="all">Tous les types de relation</option>
          <option value="client">Clients</option>
          <option value="ambassador">Ambassadeurs</option>
          <option value="business_referrer">Apporteurs d'affaires</option>
          <option value="partner">Partenaires</option>
          <option value="prospect">Prospects</option>
          <option value="prescriber">Prescripteurs</option>
        </select>

        {/* Statut de la relation */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-background/80 border border-border/80 text-foreground text-xs rounded-md px-3 py-1.5 outline-none focus:border-gold"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="discussion">En discussion</option>
          <option value="contacted">Contacté</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactif</option>
          <option value="completed">Terminé</option>
        </select>
      </div>
    </div>
  );
}
