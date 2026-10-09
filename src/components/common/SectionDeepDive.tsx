import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Loader2, CheckCircle2, CornerDownRight, Lock } from 'lucide-react';
import { requestDeepDive } from '@/lib/deepDiveService';
import { toast } from 'sonner';
import { getCurrentUserPlan } from '@/lib/planLimitsService';

// Fonction de formatage ultra-rapide pour rendre le gras et les listes
const formatAIResponse = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />; // Espace vide
    
    const isListItem = line.trim().startsWith('- ') || line.trim().match(/^\[\d+\]/);
    let content = line.trim();
    if (content.startsWith('- ')) {
      content = content.substring(2);
    }

    // Extraction du gras ( **texte** )
    const parts = content.split(/(\*\*.*?\*\*)/g);

    return (
      <div key={i} className={`text-slate-800 ${isListItem ? 'pl-4 relative before:content-["•"] before:absolute before:-left-0.5 before:text-blue-500' : ''}`}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
};

interface DeepDiveMessage {
  id: string;
  question: string;
  answer: string;
  keyTakeaways?: string[];
  timestamp: string;
}

interface SectionDeepDiveProps {
  sectionTitle: string;
  sectionContent: any;
  toolType?: string;
  globalContext?: string;
  placeholder?: string;
  suggestedQuestions?: string[];
  className?: string;
}

export const SectionDeepDive: React.FC<SectionDeepDiveProps> = ({
  sectionTitle,
  sectionContent,
  toolType = 'Consulting & Analyse IA',
  globalContext,
  placeholder,
  suggestedQuestions = [
    'Détailler le plan d’action et les étapes prioritaires',
    'Chiffrer les impacts et estimer les coûts associés',
    'Donner des exemples concrets d’application'
  ],
  className = '',
}) => {
  const [messages, setMessages] = useState<DeepDiveMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Gestion des quotas liés aux forfaits
  const currentPlan = getCurrentUserPlan();
  const limits: Record<string, number> = {
    creator: 1, // Plan basique : 1 seule question d'approfondissement
    independent: 3,
    tpe: 10,
    pme: 999 // Illimité
  };
  const maxRequests = limits[currentPlan] || 1;
  const requestsMade = messages.length;
  const hasReachedLimit = requestsMade >= maxRequests;

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    
    if (hasReachedLimit) {
      toast.error(`Vous avez atteint la limite de ${maxRequests} question(s) pour votre forfait actuel.`);
      return;
    }

    const query = (customQuestion || question).trim();
    if (!query) return;

    setIsLoading(true);
    setIsExpanded(true);
    try {
      const res = await requestDeepDive({
        sectionTitle,
        sectionContent,
        question: query,
        toolType,
        globalContext,
      });

      const newMsg: DeepDiveMessage = {
        id: 'dd_' + Date.now(),
        question: query,
        answer: res.answer,
        keyTakeaways: res.key_takeaways,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, newMsg]);
      setQuestion('');
      toast.success(`Section « ${sectionTitle} » approfondie avec succès !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'approfondissement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`mt-3 pt-3 border-t border-slate-200/80 ${className}`}>
      {/* Messages / Continuations déjà générés */}
      {messages.length > 0 && (
        <div className="space-y-3 mb-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-slate-800 space-y-2 animate-in fade-in duration-200"
            >
              {/* Question de l'utilisateur */}
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Question : « {msg.question} »</span>
                <span className="text-[10px] font-normal text-slate-600 ml-auto">{msg.timestamp}</span>
              </div>

              {/* Réponse IA formatée */}
              <div className="pl-5 border-l-2 border-blue-400/50 space-y-1 text-sm leading-relaxed font-medium">
                {formatAIResponse(msg.answer)}
              </div>

              {/* Points clés si présents */}
              {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-5">
                  {msg.keyTakeaways.map((point, pIdx) => (
                    <span
                      key={pIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-blue-800 border border-blue-200 font-bold text-[10px]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      {point}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suggestion Chips */}
      {suggestedQuestions.length > 0 && messages.length === 0 && !hasReachedLimit && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 text-[11px]">
          <span className="text-slate-600 font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> Approfondir :
          </span>
          {suggestedQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => handleSubmit(undefined, q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
        <div className="relative flex-1">
          {hasReachedLimit ? (
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500" />
          ) : (
             <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          )}
          
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading || hasReachedLimit}
            placeholder={
              hasReachedLimit 
                ? `Limite atteinte (${maxRequests}/${maxRequests}). Passez au forfait supérieur.`
                : (placeholder || `Poser une question pour approfondir « ${sectionTitle} »...`)
            }
            className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all shadow-xs ${
              hasReachedLimit
                ? 'bg-amber-50/50 border-amber-200 text-amber-900 placeholder:text-amber-600/70 cursor-not-allowed'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !question.trim() || hasReachedLimit}
          className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs shadow-blue-500/20 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          title={hasReachedLimit ? "Passez au forfait supérieur" : "Envoyer la question d'approfondissement"}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasReachedLimit ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      
      {/* Alerte visuelle pour l'upsell */}
      {hasReachedLimit && (
        <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 flex items-center justify-between">
          <span>Vous avez utilisé toutes vos requêtes d'approfondissement pour cette section.</span>
          <a href="/tarifs" className="font-bold underline hover:text-amber-900">Voir les forfaits</a>
        </div>
      )}
    </div>
  );
};
