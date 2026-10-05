import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import type { ClassificationResult } from "@/lib/documentClassifierService";

interface DocumentMismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  classification: ClassificationResult | null;
  onProceedAnyway: () => void;
  currentModuleName?: string;
}

export const DocumentMismatchModal: React.FC<DocumentMismatchModalProps> = ({
  isOpen,
  onClose,
  classification,
  onProceedAnyway,
  currentModuleName = "ce module"
}) => {
  const navigate = useNavigate();

  if (!classification) return null;

  const detectedType = classification.detected_type || "Autre";
  const confidence = Math.round(classification.confidence || 0);
  const scores = classification.scores || {};

  const handleNavigate = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg border-amber-500/30 bg-slate-950 text-slate-100 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Document inattendu détecté
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">
                  {confidence}% de certitude
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Garde-fou d'orientation intelligente MDIV Business
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Constat d'analyse */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
            <p className="text-sm text-slate-300 leading-relaxed">
              Le contenu que vous venez de soumettre ressemble principalement à un document de type{" "}
              <strong className="text-amber-300 font-semibold">{detectedType}</strong> ({confidence}%), 
              et non aux éléments attendus dans <span className="text-slate-200 font-medium">{currentModuleName}</span>.
            </p>
            {classification.summary_snippet && (
              <p className="text-xs text-slate-400 italic border-l-2 border-amber-500/50 pl-2.5 py-0.5">
                « {classification.summary_snippet} »
              </p>
            )}
          </div>

          {/* Décomposition des probabilités */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Analyse de conformité probabiliste
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(scores)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 4)
                .map(([cat, score]) => (
                  <div
                    key={cat}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                      cat === detectedType
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200 font-semibold"
                        : "border-slate-800/80 bg-slate-900/40 text-slate-400"
                    }`}
                  >
                    <span>{cat}</span>
                    <span>{score}%</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions recommandées */}
          {classification.suggested_actions && classification.suggested_actions.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Actions recommandées pour ce document :
              </span>
              <div className="space-y-1.5">
                {classification.suggested_actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(act.route)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-900/30 text-left text-xs text-emerald-200 transition-all hover:border-emerald-500/40 group"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      {act.title}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Modifier ma saisie
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onProceedAnyway();
            }}
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Traiter quand même ici
          </Button>

          {classification.recommended_module && (
            <Button
              type="button"
              onClick={() => handleNavigate(classification.recommended_module!)}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/20"
            >
              Aller vers le bon module
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
