// src/components/common/FeedbackCorrectionModal.tsx
import React, { useState } from "react";
import { CheckCircle2, Star, Sparkles, X, Brain, Shield, Loader2 } from "lucide-react";
import { FeedbackService } from "@/lib/feedbackService";
import { useToast } from "@/hooks/use-toast";

interface FeedbackCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  toolType: string;
  deliverableTitle: string;
  originalAiOutput: any;
  currentEditedOutput: any;
  onSuccess?: () => void;
}

export const FeedbackCorrectionModal: React.FC<FeedbackCorrectionModalProps> = ({
  isOpen,
  onClose,
  companyId,
  toolType,
  deliverableTitle,
  originalAiOutput,
  currentEditedOutput,
  onSuccess
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await FeedbackService.submitCorrection({
        companyId,
        toolType,
        title: deliverableTitle,
        inputSummary: `Livrable ${toolType} pour ${deliverableTitle}`,
        originalAiOutput,
        humanApprovedOutput: currentEditedOutput,
        correctionNotes: notes,
        rating
      });

      toast({
        title: "Apprentissage continu validé",
        description: "Vos corrections ont été intégrées dans les exemples de référence (Few-Shot) de l'entreprise.",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Impossible d'enregistrer la correction.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d111a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Valider & Entraîner l'IA
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Few-Shot Learning
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Vos corrections servent de modèle de référence pour les prochaines générations d'agents.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Note / Satisfaction */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Qualité globale du brouillon initial :
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                  rating >= star ? "text-amber-400" : "text-muted-foreground/30 hover:text-muted-foreground"
                }`}
              >
                <Star size={22} className={rating >= star ? "fill-amber-400" : ""} />
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {rating === 5 ? "Excellente base" : rating >= 3 ? "Bon mais à ajuster" : "Nombreuses retouches"}
            </span>
          </div>
        </div>

        {/* Exigences / Notes de correction du Dirigeant */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Précisions & exigences à retenir pour vos prochains livrables :
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex : Toujours exiger 30% d'acompte à la commande, mentionner la garantie décennale, être plus concis sur le résumé exécutif..."
            className="w-full h-24 text-xs bg-slate-950/60 border border-white/10 rounded-xl p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Info éthique & sécurité */}
        <div className="p-3 bg-secondary/30 rounded-xl border border-white/5 flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <Shield size={16} className="text-primary shrink-0" />
          <span>
            Cet exemple sera strictement isolé et réservé à votre entreprise pour personnaliser vos agents.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Enregistrer comme Modèle de Référence
          </button>
        </div>
      </div>
    </div>
  );
};
