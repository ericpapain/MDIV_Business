import { useState } from "react";
import { Project, KPI } from "@/types/performance";
import { calculateVariance, formatCurrency, formatNumber } from "@/services/performanceService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  FileCheck,
  Plus,
  Trash2,
  Sliders
} from "lucide-react";

interface EvaluationItem {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  isCurrency?: boolean;
}

interface ProjectEvaluationModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  kpis: KPI[];
}

export function ProjectEvaluationModal({
  project,
  isOpen,
  onClose,
  kpis,
}: ProjectEvaluationModalProps) {
  if (!project) return null;

  // Seuil configurable d'alerte (par exemple 15% d'écart négatif)
  const [warningThreshold, setWarningThreshold] = useState<number>(15);

  // Éléments d'évaluation configurables pour ce projet
  const [evalItems, setEvalItems] = useState<EvaluationItem[]>([
    {
      id: "leads",
      name: "Leads Bruts Générés",
      target: 60,
      actual: 52,
      unit: "leads",
    },
    {
      id: "qualified",
      name: "Contacts Qualifiés",
      target: 40,
      actual: 37,
      unit: "contacts",
    },
    {
      id: "followers",
      name: "Évolution Abonnés Réseaux",
      target: 1000,
      actual: 850,
      unit: "abonnés",
    },
    {
      id: "revenue",
      name: "Chiffre d'Affaires Associé",
      target: project.expected_revenue || 2100,
      actual: project.actual_revenue || 2100,
      unit: "€",
      isCurrency: true,
    },
    {
      id: "contents",
      name: "Contenus / Reels Réalisés",
      target: 20,
      actual: 16,
      unit: "contenus",
    },
    {
      id: "adequacy",
      name: "Adéquation aux Objectifs Client",
      target: 95,
      actual: 92,
      unit: "%",
    },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemTarget, setNewItemTarget] = useState<number>(10);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemUnit, setNewItemUnit] = useState("unités");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setEvalItems([
      ...evalItems,
      {
        id: `custom_${Date.now()}`,
        name: newItemName,
        target: newItemTarget,
        actual: newItemActual,
        unit: newItemUnit,
      },
    ]);
    setNewItemName("");
    setNewItemTarget(10);
    setNewItemActual(0);
  };

  const handleRemoveItem = (id: string) => {
    setEvalItems(evalItems.filter((item) => item.id !== id));
  };

  const handleUpdateActual = (id: string, value: number) => {
    setEvalItems(
      evalItems.map((item) =>
        item.id === id ? { ...item, actual: value } : item
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[#0d1115] border-border text-foreground max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-gold/10 text-gold border-gold/30">
              Évaluation d'Objectifs vs Réalisé
            </Badge>
            {project.is_demo ? (
              <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[10px]">
                Données de démonstration
              </Badge>
            ) : (
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                Données Réelles
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold font-display text-foreground mt-1">
            Évaluation : {project.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Comparatif factuel entre les cibles définies et les réalisations concrètes. Calcul automatique des écarts et des tendances sans seuils arbitraires.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 text-xs">
          {/* CONFIGURATION DU SEUIL D'ALERTE */}
          <div className="p-3 bg-muted/20 border border-border/60 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sliders className="w-4 h-4 text-gold" />
              <span>Seuil d'alerte configurable (écart négatif acceptable) :</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <input
                type="number"
                min="1"
                max="50"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-14 bg-background border border-border rounded px-2 py-1 text-xs text-center outline-none focus:border-gold"
              />
              <span>%</span>
            </div>
          </div>

          {/* TABLEAU COMPARATIF OBJECTIFS VS RÉALISÉ */}
          <div className="border border-border/70 rounded-lg overflow-hidden bg-card/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3 pl-4">Indicateur Clé</th>
                  <th className="p-3 text-center">Objectif Cible</th>
                  <th className="p-3 text-center">Réalisé Concret</th>
                  <th className="p-3 text-center">Écart Absolu</th>
                  <th className="p-3 text-center">Écart (%)</th>
                  <th className="p-3 text-center">Tendance</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {evalItems.map((item) => {
                  const variance = calculateVariance(item.target, item.actual);
                  const isCritical =
                    variance.percent !== null &&
                    variance.percent < -warningThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-muted/15 transition-colors">
                      <td className="p-3 pl-4 font-medium text-foreground">
                        {item.name}
                      </td>

                      <td className="p-3 text-center text-muted-foreground font-mono">
                        {item.isCurrency ? formatCurrency(item.target) : `${item.target} ${item.unit}`}
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={item.actual}
                          onChange={(e) => handleUpdateActual(item.id, Number(e.target.value))}
                          className="w-20 bg-background/80 border border-border rounded px-2 py-0.5 text-center text-xs font-semibold text-foreground focus:border-gold outline-none"
                        />
                      </td>

                      <td className="p-3 text-center font-semibold font-mono">
                        <span
                          className={
                            variance.absolute > 0
                              ? "text-emerald-400"
                              : variance.absolute < 0
                              ? "text-rose-400"
                              : "text-muted-foreground"
                          }
                        >
                          {variance.absolute > 0 ? `+${variance.absolute}` : variance.absolute}
                        </span>
                      </td>

                      <td className="p-3 text-center font-semibold font-mono">
                        <span
                          className={
                            isCritical
                              ? "px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : variance.trend === "positive"
                              ? "text-emerald-400"
                              : variance.trend === "negative"
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          }
                        >
                          {variance.percentFormatted}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {variance.trend === "positive" ? (
                          <div className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Avance</span>
                          </div>
                        ) : variance.trend === "negative" ? (
                          <div className="inline-flex items-center gap-1 text-rose-400 text-[11px]">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Retard</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">— Neutre</span>
                        )}
                      </td>

                      <td className="p-3 text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AJOUT D'UN CRITÈRE D'ÉVALUATION PERSONNALISÉ */}
          <div className="bg-muted/15 border border-border/60 rounded-lg p-3 space-y-2">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-gold" />
              Ajouter un indicateur personnalisé d'évaluation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Nom (ex: Taux de rebond)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="sm:col-span-2 bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-gold"
              />
              <input
                type="number"
                placeholder="Cible"
                value={newItemTarget}
                onChange={(e) => setNewItemTarget(Number(e.target.value))}
                className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-gold"
              />
              <Button
                size="sm"
                onClick={handleAddItem}
                className="bg-gold hover:bg-gold-light text-black text-xs font-medium"
              >
                Ajouter au tableau
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
