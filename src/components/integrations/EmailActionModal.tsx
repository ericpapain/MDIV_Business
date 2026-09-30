// src/components/integrations/EmailActionModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Send, Mail, X, CheckCircle2, Loader2, Sparkles, 
  ExternalLink, UserPlus, FileEdit, Check, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  sendEmailViaIntegration, 
  createDraftViaIntegration, 
  syncContactViaIntegration, 
  fetchCompanyIntegrations,
  connectProvider,
  IntegrationProvider,
  CompanyIntegrationsState
} from '@/lib/integrationService';

interface EmailActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: {
    to: string;
    subject: string;
    body: string;
    leadName?: string;
    leadCompany?: string;
  };
  companyId?: number;
}

export const EmailActionModal: React.FC<EmailActionModalProps> = ({
  isOpen,
  onClose,
  emailData,
  companyId
}) => {
  const [integrations, setIntegrations] = useState<CompanyIntegrationsState | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider>('google');
  
  // Form fields
  const [recipient, setRecipient] = useState(emailData.to || '');
  const [subject, setSubject] = useState(emailData.subject || '');
  const [body, setBody] = useState(emailData.body || '');

  // Action states
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSyncingContact, setIsSyncingContact] = useState(false);
  const [contactSynced, setContactSynced] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setRecipient(emailData.to || '');
    setSubject(emailData.subject || '');
    setBody(emailData.body || '');
    setContactSynced(false);

    loadStatus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, emailData, companyId]);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const state = await fetchCompanyIntegrations(companyId);
      setIntegrations(state);
      if (state.google.connected) {
        setSelectedProvider('google');
      } else if (state.microsoft.connected) {
        setSelectedProvider('microsoft');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      const res = await connectProvider(provider, undefined, companyId);
      toast.success(res.message);
      await loadStatus();
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion');
    }
  };

  const handleSend = async () => {
    if (!recipient.trim()) {
      toast.error("Veuillez spécifier l'adresse email du destinataire.");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendEmailViaIntegration({
        provider: selectedProvider,
        to: recipient.trim(),
        subject: subject.trim(),
        body: body.trim(),
        leadName: emailData.leadName,
        companyId
      });
      toast.success(res.info);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Échec d'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await createDraftViaIntegration({
        provider: selectedProvider,
        to: recipient.trim(),
        subject: subject.trim(),
        body: body.trim(),
        companyId
      });
      toast.success(res.info);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Échec de création du brouillon");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSyncContact = async () => {
    if (!emailData.leadName && !recipient) {
      toast.error("Nom ou email manquant pour synchroniser le contact.");
      return;
    }
    setIsSyncingContact(true);
    try {
      const res = await syncContactViaIntegration({
        provider: selectedProvider,
        name: emailData.leadName || 'Contact Prospect',
        email: recipient,
        companyName: emailData.leadCompany,
        companyId
      });
      toast.success(res.info);
      setContactSynced(true);
    } catch (err: any) {
      toast.error(err.message || "Échec de synchronisation");
    } finally {
      setIsSyncingContact(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const currentAccount = integrations ? integrations[selectedProvider] : null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-[#121624] border border-gold/30 rounded-3xl p-6 md:p-8 shadow-2xl text-white my-8 z-10">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10 shrink-0">
            <Mail size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                Envoyer ou Synchroniser
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gold/20 text-gold border border-gold/30">
                Gmail & Outlook
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-300">
              Expédiez en 1 clic ou sauvegardez en brouillon dans votre boîte professionnelle.
            </p>
          </div>
        </div>

        {/* Choix Fournisseur (Google vs Microsoft) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSelectedProvider('google')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedProvider === 'google'
                ? 'bg-red-500/10 border-red-500/40 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
              </svg>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate">Google Workspace / Gmail</div>
              <div className="text-[11px] text-gray-400 truncate">
                {integrations?.google.connected ? (integrations.google.email || 'Connecté') : 'Non relié'}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedProvider('microsoft')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              selectedProvider === 'microsoft'
                ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-md'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M22 6.5A1.5 1.5 0 0 0 20.5 5h-17A1.5 1.5 0 0 0 2 6.5v11A1.5 1.5 0 0 0 3.5 19h17a1.5 1.5 0 0 0 1.5-1.5v-11zm-1.8.5-7.7 5.7a1 1 0 0 1-1 0L3.8 7h16.4zm1.8 11a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5V8.1l7.8 5.8a2 2 0 0 0 2.4 0l7.8-5.8v9.9z"/>
              </svg>
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate">Microsoft 365 / Outlook</div>
              <div className="text-[11px] text-gray-400 truncate">
                {integrations?.microsoft.connected ? (integrations.microsoft.email || 'Connecté') : 'Non relié'}
              </div>
            </div>
          </button>
        </div>

        {/* Si non connecté, inviter à connecter */}
        {currentAccount && !currentAccount.connected && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 text-xs text-amber-200">
              <AlertCircle size={20} className="shrink-0 text-amber-400" />
              <span>Votre compte {selectedProvider === 'google' ? 'Google' : 'Microsoft'} n'est pas encore relié.</span>
            </div>
            <button
              type="button"
              onClick={() => handleConnect(selectedProvider)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-[#0b0d14] font-bold text-xs rounded-xl shrink-0 transition-colors"
            >
              Relier maintenant
            </button>
          </div>
        )}

        {/* Champs du message */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Destinataire (Email) *
            </label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="prospect@entreprise.fr"
              className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Objet du message
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Corps du message
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0b0d14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-xs focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Synchronisation Contact Optionnelle */}
        {(emailData.leadName || recipient) && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <UserPlus size={16} className="text-gold" />
              <span>
                Ajouter <strong>{emailData.leadName || recipient}</strong> à vos contacts {selectedProvider === 'google' ? 'Google Contacts' : 'Microsoft People'}
              </span>
            </div>
            <button
              type="button"
              disabled={isSyncingContact || contactSynced}
              onClick={handleSyncContact}
              className="px-3 py-1.5 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSyncingContact ? (
                <Loader2 size={12} className="animate-spin" />
              ) : contactSynced ? (
                <>
                  <Check size={12} /> Synchronisé
                </>
              ) : (
                'Synchroniser'
              )}
            </button>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={isDrafting || isSending}
            onClick={handleCreateDraft}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all"
          >
            {isDrafting ? <Loader2 size={16} className="animate-spin" /> : <FileEdit size={16} />}
            Créer en Brouillon ({selectedProvider === 'google' ? 'Gmail' : 'Outlook'})
          </button>

          <button
            type="button"
            disabled={isSending || isDrafting}
            onClick={handleSend}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#0b0d14] text-sm font-bold shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Expédition en cours...
              </>
            ) : (
              <>
                <Send size={16} />
                Envoyer Directement ({selectedProvider === 'google' ? 'Gmail' : 'Outlook'})
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
