// src/components/email/EmailThreadHistoryView.tsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, Search, RefreshCcw, Loader2, Sparkles, Send, 
  Inbox, CornerUpLeft, User, Calendar, ShieldCheck, ArrowDownLeft, ArrowUpRight,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  UniversalMailbox, 
  EmailThreadMessage, 
  fetchEmailHistoryThread,
  syncMailboxHistory 
} from '@/lib/integrationService';

/**
 * Nettoie et formate le texte brut d'un email (suppression des balises, images de tracking,
 * pixels d'ouverture, entités HTML &nbsp;, URLs brutes kilométriques et mots orphelins)
 * pour un affichage propre, lisible et aéré.
 */
function cleanEmailText(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 1. Décodage exhaustif des entités HTML courantes et numériques
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&bull;/gi, '•')
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(Number(dec));
      } catch {
        return '';
      }
    });

  // 2. Nettoyage des balises scripts, styles et balises HTML résiduelles
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');

  // 3. Réparation des URLs brisées sur plusieurs lignes dans les crochets [https://... \n ...]
  text = text.replace(/\[\s*(https?:\/\/[^\]]+)\s*\]/gi, (match) => {
    return match.replace(/\r?\n\s*/g, '');
  });

  // 4. Suppression des URLs d'images entre crochets [https://... .(png|jpg|jpeg|gif|svg|webp|ico)]
  text = text.replace(/\[https?:\/\/[^\]]+\.(?:png|jpe?g|gif|svg|webp|ico)(?:\?[^\]]*)?\]/gi, '');

  // 5. Suppression des pixels de tracking et beacons invisibles (open, brandview, pixel, tracker)
  text = text.replace(/\[https?:\/\/[^\]]*(?:wf\/open|brandview|brandRefresh|pixel|track|beacon|analytics|open\?|trck|logomark)[^\]]*\]/gi, '');

  // 6. Suppression des doublons d'email entre crochets [nom@domaine.com]
  text = text.replace(/\[\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\s*\]/gi, '');

  // 7. Simplification élégante des URLs de redirection et liens partenaires longs
  text = text.replace(/\[\s*https?:\/\/([^\/\s\]]+)(?:\/[^\]]*)?\s*\]/gi, (_match, domain) => {
    const cleanDomain = String(domain).replace(/^www\./, '');
    return `[🔗 ${cleanDomain}]`;
  });

  // 8. Suppression des mots orphelins isolés (restes de balises d'images supprimées)
  text = text.replace(/^\s*(avatar|logo|logomark|icon|bannière|image|spacer)\s*$/gim, '');

  // 9. Séparation des textes collés aux boutons (ex: "data engineerCréer" -> "data engineer · Créer")
  text = text.replace(/([a-z\u00C0-\u017F])(Créer|Postuler|Modifier|Voir|En savoir plus)\b/g, '$1 · $2');

  // 10. Normalisation des espaces par ligne
  text = text
    .split('\n')
    .map(line => line.replace(/[ \t]{2,}/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');

  // 11. Réduction des retours à la ligne consécutifs excessifs (max 2)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

interface EmailThreadHistoryViewProps {
  mailboxes?: UniversalMailbox[];
  selectedMailboxId?: number | string | null;
  onSelectMailbox?: (id: number | string) => void;
  onOpenAddMailbox?: () => void;
  activeMailbox?: UniversalMailbox | null;
  clientEmail?: string;
  clientName?: string;
  companyId?: number;
  onSelectEmailToReply?: (message: EmailThreadMessage) => void;
  onOpenConnectModal?: () => void;
}

export const EmailThreadHistoryView: React.FC<EmailThreadHistoryViewProps> = ({
  mailboxes,
  selectedMailboxId,
  onSelectMailbox,
  onOpenAddMailbox,
  activeMailbox,
  clientEmail,
  clientName,
  companyId,
  onSelectEmailToReply,
  onOpenConnectModal
}) => {
  const currentMailbox = activeMailbox || (
    mailboxes && mailboxes.length > 0 
      ? mailboxes.find(m => String(m.id) === String(selectedMailboxId)) || mailboxes[0]
      : null
  );

  const [messages, setMessages] = useState<EmailThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);

  const handleOpenModal = onOpenAddMailbox || onOpenConnectModal || (() => {});

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEmailHistoryThread({
        mailboxId: currentMailbox?.id,
        contactEmail: clientEmail || undefined,
        search: searchQuery || undefined,
        limit: 50,
        companyId: companyId || 1
      });
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncImap = async () => {
    if (!currentMailbox) {
      toast.error("Veuillez d'abord connecter une boîte email.");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncMailboxHistory({
        mailboxId: currentMailbox.id,
        contactEmail: clientEmail,
        companyId: companyId || 1
      });
      if (res.imported > 0) {
        toast.success(`${res.imported} nouveau(x) email(s) importé(s) depuis ${currentMailbox.email} !`);
      } else {
        toast.info(`Boîte à jour : aucun nouvel email détecté.`);
      }
      await loadEmails();
    } catch (e: any) {
      toast.error(e.message || "Erreur de synchronisation IMAP.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyText = (id: number | string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texte du message copié dans le presse-papiers !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    loadEmails();
  }, [currentMailbox?.id, clientEmail]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmails();
  };

  const filteredMessages = messages.filter(m => {
    if (activeFilter === 'inbound') return m.direction === 'inbound';
    if (activeFilter === 'outbound') return m.direction === 'outbound';
    return true;
  });

  // Affichage limité à 3 emails par défaut, ou tous si déplié
  const displayedMessages = showAllMessages ? filteredMessages : filteredMessages.slice(0, 3);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 md:p-6 space-y-5 animate-fade-in">
      {/* Header avec état de la boîte et barre de recherche */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Inbox size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                {clientEmail ? `Échanges avec ${clientName || clientEmail}` : "Boîte de Réception & Historique Complet"}
              </h3>
              {currentMailbox ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {currentMailbox.email}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Aucune boîte active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {clientEmail 
                ? "Tous les emails reçus et envoyés avec ce contact sont regroupés ici."
                : "Consultez l'ensemble de vos correspondances réelles et synchronisez vos boîtes."}
            </p>
          </div>
        </div>

        {/* Boutons d'action / rafraîchir / synchro IMAP */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentMailbox && (
            <button
              type="button"
              onClick={handleSyncImap}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Synchroniser immédiatement via IMAP"
            >
              <RefreshCcw size={13} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Synchronisation IMAP..." : "Synchroniser la boîte"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadEmails}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
            title="Actualiser la liste locale"
          >
            <RefreshCcw size={15} className={isLoading ? "animate-spin text-blue-600" : ""} />
          </button>

          {!currentMailbox && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              + Connecter une boîte
            </button>
          )}
        </div>
      </div>

      {/* Sélecteur de boîte si plusieurs boîtes sont configurées */}
      {mailboxes && mailboxes.length > 1 && onSelectMailbox && (
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <span className="text-xs font-bold text-slate-600 pl-2">Boîte active :</span>
          <div className="flex items-center gap-1 flex-wrap">
            {mailboxes.map((mb) => {
              const isSelected = String(mb.id) === String(currentMailbox?.id);
              return (
                <button
                  key={mb.id}
                  type="button"
                  onClick={() => onSelectMailbox(mb.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mb.email}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par adresse email, objet ou mot-clé (ex: devis, rdv, contact@...)"
            className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-200 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            Filtrer
          </button>
        </form>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tous ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('inbound')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'inbound' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📥 Reçus ({messages.filter(m => m.direction === 'inbound').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('outbound')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'outbound' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📤 Envoyés ({messages.filter(m => m.direction === 'outbound').length})
          </button>
        </div>
      </div>

      {/* Liste chronologique des messages */}
      <div className="space-y-4 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-xs font-medium">Recherche et synchronisation des emails...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6">
            <Mail size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              {searchQuery ? "Aucun email ne correspond à cette recherche." : "Aucun email dans ce fil de discussion pour l'instant."}
            </h4>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mb-4">
              {!activeMailbox 
                ? "Connectez votre boîte mail (Gmail, ITID France ou domaine personnalisé) pour afficher l'historique complet."
                : "Les nouveaux emails reçus ou envoyés avec cette adresse apparaîtront ici automatiquement."}
            </p>
            {!activeMailbox && (
              <button
                type="button"
                onClick={onOpenConnectModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                + Connecter ma boîte mail
              </button>
            )}
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isInbound = msg.direction === 'inbound';
            const rawBody = msg.body_text || msg.snippet || '';
            const cleanedText = cleanEmailText(rawBody);

            return (
              <div
                key={msg.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isInbound 
                    ? 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20' 
                    : 'bg-white border-blue-100/70 hover:border-blue-300 shadow-sm'
                }`}
              >
                {/* Entête du mail : expéditeur, date, badge sens */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isInbound ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isInbound ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                      {isInbound ? 'Reçu de' : 'Envoyé à'}
                    </span>
                    <strong className="text-xs font-bold text-slate-900">
                      {isInbound ? (msg.sender_name || msg.sender_email) : (msg.recipient_name || msg.recipient_email)}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-mono">
                      &lt;{isInbound ? msg.sender_email : msg.recipient_email}&gt;
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
                    <Calendar size={11} />
                    {new Date(msg.received_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Objet du mail */}
                <div className="font-bold text-xs sm:text-sm text-slate-800 mb-2">
                  {msg.subject || "(Sans objet)"}
                </div>

                {/* Corps de l'email agrandi en hauteur et scrollable avec texte nettoyé */}
                <div className="mb-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto custom-scrollbar text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap pr-2 select-text">
                    {cleanedText || "(Message vide ou contenu non textuel)"}
                  </div>
                </div>

                {/* Actions sous le mail : copier et répondre avec l'IA */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.id, cleanedText)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Copier le texte de cet email"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copier le texte</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectEmailToReply) {
                        onSelectEmailToReply(msg);
                        toast.success("Message chargé ! L'IA prépare la réponse contextuelle...");
                      } else {
                        toast.info("Message sélectionné.");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[11px] font-bold shadow-md shadow-indigo-500/10 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles size={12} />
                    <span>Répondre avec l'IA</span>
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Bouton pour déplier/replier si plus de 3 emails */}
        {!isLoading && filteredMessages.length > 3 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAllMessages(!showAllMessages)}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group cursor-pointer"
            >
              <span>
                {showAllMessages 
                  ? `Réduire aux 3 messages récents` 
                  : `Afficher tous les emails (${filteredMessages.length} messages au total)`}
              </span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 text-slate-400 group-hover:text-blue-600 ${
                  showAllMessages ? 'rotate-180 text-blue-600' : 'group-hover:translate-y-0.5'
                }`} 
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

