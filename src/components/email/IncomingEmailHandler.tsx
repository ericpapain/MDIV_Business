// src/components/email/IncomingEmailHandler.tsx

import React, { useState } from 'react';
import { Mail, Sparkles, Loader2, ArrowRight, CornerDownLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface IncomingEmailHandlerProps {
  onGenerateReply: (incomingText: string, customInstructions?: string) => Promise<void>;
  isGenerating: boolean;
  selectedClientName?: string;
  hasFinancialWarning?: boolean;
}

export const IncomingEmailHandler: React.FC<IncomingEmailHandlerProps> = ({
  onGenerateReply,
  isGenerating,
  selectedClientName,
  hasFinancialWarning = false
}) => {
  const [incomingText, setIncomingText] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  const handleTrigger = async () => {
    if (!incomingText.trim()) {
      toast.error("Veuillez coller le contenu de l'email reçu.");
      return;
    }
    await onGenerateReply(incomingText, customInstructions);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Traiter & Répondre à un Email Reçu</h3>
            <p className="text-xs text-slate-400">
              Collez l'email reçu pour que l'IA rédige une réponse contextualisée adaptée à votre relation client.
            </p>
          </div>
        </div>

        {selectedClientName && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 font-medium">
            Client lié : <strong className="text-white">{selectedClientName}</strong>
          </span>
        )}
      </div>

      {hasFinancialWarning && (
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Ce client a des factures en attente ou en retard. La réponse intègrera un rappel bienveillant.</span>
        </div>
      )}

      {/* Textarea for Incoming Email */}
      <div>
        <label className="text-xs font-medium text-slate-300 mb-1.5 block">
          Contenu du message client (copié-collé) :
        </label>
        <textarea
          rows={5}
          value={incomingText}
          onChange={(e) => setIncomingText(e.target.value)}
          placeholder="Exemple : Bonjour, suite à notre échange téléphonique, nous souhaitons revoir le devis n° 42 car le montant dépasse notre enveloppe. Pourriez-vous adapter la prestation ?"
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
        />
      </div>

      {/* Optional custom instructions */}
      <div>
        <label className="text-xs font-medium text-slate-300 mb-1.5 block">
          Consigne ou instruction clé pour la réponse (optionnel) :
        </label>
        <input
          type="text"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Ex: Refuser poliment la remise mais proposer un échelonnement en 3 fois sans frais..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleTrigger}
          disabled={isGenerating || !incomingText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération de la réponse contextualisée...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Générer la réponse IA avec contexte 360°
              <CornerDownLeft className="w-3.5 h-3.5 ml-1 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
