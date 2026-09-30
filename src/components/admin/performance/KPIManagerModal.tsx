import { useState } from "react";
import { KPI, KPICategory, KPIUnit } from "@/types/performance";
import { calculateVariance } from "@/services/performanceService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Plus, Trash2, Check, Edit2, ShieldAlert } from "lucide-react";

interface KPIManagerModalProps {
  kpis: KPI[];
  isOpen: boolean;
  onClose: () => void;
  onSaveKPI: (kpi: Partial<KPI>) => void;
  onUpdateKPIValue: (id: number, val: number) => void;
  onDeleteKPI: (id: number) => void;
}

export function KPIManagerModal({
  kpis,
  isOpen,
  onClose,
  onSaveKPI,
  onUpdateKPIValue,
  onDeleteKPI,
}: KPIManagerModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<KPICategory>("commercial");
  const [unit, setUnit] = useState<KPIUnit>("number");
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [frequency, setFrequency] = useState("mensuel");
  const [source, setSource] = useState("");
  const [isContractual, setIsContractual] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("commercial");
    setUnit("number");
    setTargetValue(100);
    setCurrentValue(0);
    setFrequency("mensuel");
    setSource("");
    setIsContractual(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveKPI({
      id: editingId || undefined,
      name,
      category,
      unit,
      target_value: targetValue,
      current_value: currentValue,
      frequency,
      source,
      is_contractual: isContractual,
      status: currentValue >= targetValue ? "completed" : "on_track",
    });

    resetForm();
  };

  const handleEdit = (k: KPI) => {
    setEditingId(k.id);
    setName(k.name);
    setCategory(k.category);
    setUnit(k.unit);
    setTargetValue(k.target_value);
    setCurrentValue(k.current_value);
    setFrequency(k.frequency || "mensuel");
    setSource(k.source || "");
    setIsContractual(!!k.is_contractual);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-[#0d1115] border-border text-foreground max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <DialogTitle className="text-xl font-bold font-display text-foreground">
              Catalogue & Paramétrage des KPI
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configurez vos indicateurs clés de performance : aucun KPI n'est figé dans le code. Définissez les unités, fréquences et objectifs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 text-xs">
          {/* FORMULAIRE D'AJOUT / ÉDITION DE KPI */}
          <div className="bg-muted/15 border border-border/70 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-xs text-gold uppercase tracking-wider">
              {editingId ? "Modifier le KPI" : "Créer un Nouveau KPI"}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Nom de l'indicateur</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Taux de rétention clients"
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as KPICategory)}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="acquisition">Acquisition</option>
                    <option value="reseaux_sociaux">Réseaux Sociaux</option>
                    <option value="contenu">Contenu</option>
                    <option value="marketing">Marketing</option>
                    <option value="ambassadeurs">Ambassadeurs</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="projets">Projets</option>
                    <option value="finance">Finance</option>
                    <option value="site_web">Site Web</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Unité</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as KPIUnit)}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    <option value="number">Nombre</option>
                    <option value="eur">Euros (€)</option>
                    <option value="percent">Pourcentage (%)</option>
                    <option value="followers">Abonnés</option>
                    <option value="leads">Leads</option>
                    <option value="qualified_contacts">Contacts Qualifiés</option>
                    <option value="score">Score</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Valeur Cible</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Valeur Actuelle</label>
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Source des données</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Ex: Formulaires web, Analytics, etc."
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contractual"
                  checked={isContractual}
                  onChange={(e) => setIsContractual(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="contractual" className="text-xs text-foreground font-medium cursor-pointer">
                  Marquer comme KPI Contractuel Majeur
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="sm" className="bg-gold hover:bg-gold-light text-black font-semibold text-xs flex-1">
                  {editingId ? "Mettre à jour" : "Ajouter le KPI"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" size="sm" onClick={resetForm} className="text-xs">
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* LISTE DES KPIS ACTUELS */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Indicateurs Actifs ({kpis.length})
            </h4>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {kpis.map((k) => {
                const variance = calculateVariance(k.target_value, k.current_value);

                return (
                  <div
                    key={k.id}
                    className="p-3 bg-muted/15 border border-border/70 rounded-lg flex items-center justify-between gap-3 hover:border-gold/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{k.name}</span>
                        {k.is_contractual && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold/10 text-gold border border-gold/30 font-medium">
                            Contractuel
                          </span>
                        )}
                        {k.is_demo && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Démo
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Catégorie : {k.category} • Unité : {k.unit} • Fréquence : {k.frequency}
                      </div>

                      <div className="text-xs font-mono">
                        Réalisé : <strong className="text-foreground">{k.current_value}</strong> / Cible : {k.target_value}
                        <span className={`ml-2 font-semibold ${variance.trend === "positive" ? "text-emerald-400" : "text-rose-400"}`}>
                          ({variance.percentFormatted})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(k)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-gold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Supprimer le KPI "${k.name}" ?`)) {
                            onDeleteKPI(k.id);
                          }
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
