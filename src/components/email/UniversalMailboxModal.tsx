// src/components/email/UniversalMailboxModal.tsx
import React, { useState } from 'react';
import { 
  X, Mail, Shield, Check, AlertCircle, Loader2, Sparkles, 
  Server, KeyRound, Globe, ArrowRight, Eye, EyeOff, ExternalLink, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  UniversalMailbox, 
  detectMailboxPreset, 
  saveAndTestMailbox,
  fetchMailboxAutoconfig
} from '@/lib/integrationService';

interface UniversalMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (mailbox: UniversalMailbox) => void;
  onMailboxSaved?: () => void;
  companyId?: number;
}

export const UniversalMailboxModal: React.FC<UniversalMailboxModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onMailboxSaved,
  companyId
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [provider, setProvider] = useState<'gmail' | 'itid_ovh' | 'ovh' | 'outlook' | 'yahoo' | 'icloud' | 'custom_imap'>('custom_imap');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);
  const [imapSsl, setImapSsl] = useState(true);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSsl, setSmtpSsl] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [autoConfigNote, setAutoConfigNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailChange = async (val: string) => {
    setEmail(val);
    if (val.includes('@') && val.split('@')[1].length >= 3) {
      const localPreset = detectMailboxPreset(val);
      if (localPreset.provider) setProvider(localPreset.provider as any);
      if (localPreset.display_name && !displayName) setDisplayName(localPreset.display_name);
      if (localPreset.imap_host) setImapHost(localPreset.imap_host);
      if (localPreset.imap_port) setImapPort(localPreset.imap_port);
      if (localPreset.imap_ssl !== undefined) setImapSsl(localPreset.imap_ssl);
      if (localPreset.smtp_host) setSmtpHost(localPreset.smtp_host);
      if (localPreset.smtp_port) setSmtpPort(localPreset.smtp_port);
      if (localPreset.smtp_ssl !== undefined) setSmtpSsl(localPreset.smtp_ssl);

      // Autoconfig dynamique par l'API
      try {
        const auto = await fetchMailboxAutoconfig(val, companyId);
        if (auto?.config) {
          if (auto.config.imap_host) setImapHost(auto.config.imap_host);
          if (auto.config.imap_port) setImapPort(auto.config.imap_port);
          if (auto.config.imap_ssl !== undefined) setImapSsl(auto.config.imap_ssl);
          if (auto.config.smtp_host) setSmtpHost(auto.config.smtp_host);
          if (auto.config.smtp_port) setSmtpPort(auto.config.smtp_port);
          if (auto.config.smtp_ssl !== undefined) setSmtpSsl(auto.config.smtp_ssl);
          if (auto.config.note) setAutoConfigNote(auto.config.note);
          else setAutoConfigNote(null);
        }
      } catch {}
    }
  };

  const handleApplyPreset = (prov: 'gmail' | 'itid_ovh' | 'outlook' | 'custom_imap') => {
    setProvider(prov);
    if (prov === 'itid_ovh') {
      setEmail('contact@itid-france.com');
      setDisplayName('ITID France (OVHcloud)');
      setImapHost('ssl0.ovh.net');
      setImapPort(993);
      setImapSsl(true);
      setSmtpHost('ssl0.ovh.net');
      setSmtpPort(465);
      setSmtpSsl(true);
    } else if (prov === 'gmail') {
      setDisplayName('Compte Google / Gmail');
      setImapHost('imap.gmail.com');
      setImapPort(993);
      setImapSsl(true);
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(465);
      setSmtpSsl(true);
    } else if (prov === 'outlook') {
      setDisplayName('Compte Microsoft Outlook');
      setImapHost('outlook.office365.com');
      setImapPort(993);
      setImapSsl(true);
      setSmtpHost('smtp.office365.com');
      setSmtpPort(587);
      setSmtpSsl(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error("Veuillez saisir une adresse email valide.");
      return;
    }
    if (!password.trim()) {
      toast.error("Veuillez saisir le mot de passe de votre boîte ou mot de passe d'application.");
      return;
    }
    if (!imapHost || !smtpHost) {
      toast.error("Veuillez renseigner les serveurs IMAP et SMTP.");
      return;
    }

    setIsTesting(true);
    try {
      let cleanPassword = password.trim();
      if (provider === 'gmail' || imapHost.includes('gmail.com') || smtpHost.includes('gmail.com')) {
        cleanPassword = cleanPassword.replace(/\s+/g, '');
      }

      const res = await saveAndTestMailbox({
        mailbox: {
          email: email.trim(),
          display_name: displayName.trim() || email.trim(),
          provider,
          imap_host: imapHost.trim(),
          imap_port: imapPort,
          imap_ssl: imapSsl,
          imap_user: email.trim(),
          smtp_host: smtpHost.trim(),
          smtp_port: smtpPort,
          smtp_ssl: smtpSsl,
          smtp_user: email.trim()
        },
        password: cleanPassword,
        companyId: companyId || 1
      });

      if (res.success && res.mailbox) {
        toast.success(`La boîte ${email} a été connectée avec succès !`);
        onSuccess?.(res.mailbox);
        onMailboxSaved?.();
        onClose();
      } else {
        toast.error(res.message || "Échec de connexion");
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible de joindre le serveur de messagerie.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 text-slate-900 my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connecter une Boîte Email Universelle</h2>
            <p className="text-xs text-slate-500 font-medium">
              Accédez à tous vos emails et envoyez des réponses rédigées par l'IA avec votre propre adresse.
            </p>
          </div>
        </div>

        {/* Boutons d'accès rapide 1-clic */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Profils pré-configurés en 1 clic
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('itid_ovh')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                provider === 'itid_ovh' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🏥 ITID France</span>
              <span className="text-[10px] text-slate-400 font-normal">OVHcloud</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('gmail')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                provider === 'gmail' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🔴 Gmail</span>
              <span className="text-[10px] text-slate-400 font-normal">Google Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('outlook')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                provider === 'outlook' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🔵 Outlook</span>
              <span className="text-[10px] text-slate-400 font-normal">Microsoft 365</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('custom_imap')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                provider === 'custom_imap' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🌐 Autre Pro</span>
              <span className="text-[10px] text-slate-400 font-normal">IMAP / SMTP</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Adresse email complète <span className="text-blue-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="ex: contact@itid-france.com ou prenom.nom@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nom d'affichage (ex: ITID France · Dr Mezat ou Eric Papain)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nom affiché aux destinataires"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Mot de passe de la boîte ou Mot de passe d'application <span className="text-blue-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? "Masquer" : "Afficher"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={provider === 'gmail' ? "ex: abcd efgh ijkl mnop (16 lettres)" : "••••••••••••••••"}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:bg-white focus:border-blue-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {autoConfigNote && (
              <p className="mt-1 text-[11px] text-blue-600 font-medium flex items-center gap-1.5 bg-blue-50 p-2 rounded-lg border border-blue-100">
                <AlertCircle size={13} className="shrink-0 text-blue-500" />
                <span>{autoConfigNote}</span>
              </p>
            )}

            {!autoConfigNote && provider === 'gmail' && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                <div className="flex items-start gap-1.5 font-bold">
                  <Shield size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>Important : Google refuse les mots de passe de compte habituels.</span>
                </div>
                <p className="text-slate-600 leading-snug">
                  Pour connecter Gmail en IMAP/SMTP sécurisé, utilisez un <strong>Mot de passe d'application de 16 lettres</strong> :
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors shadow-xs"
                  >
                    <span>1. Créer le mot de passe Google (16 lettres)</span>
                    <ExternalLink size={11} />
                  </a>
                  <a
                    href="https://mail.google.com/mail/u/0/#settings/fwdandpop"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 transition-colors"
                  >
                    <span>2. Vérifier que IMAP est activé</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <p className="text-[10px] text-slate-500">
                  (Validation en 2 étapes requise sur votre compte Google. Les espaces entre les lettres sont retirés automatiquement).
                </p>
              </div>
            )}

            {!autoConfigNote && provider === 'itid_ovh' && (
              <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check size={13} className="text-blue-600" />
                  <span>Paramètres OVHcloud détectés (`ssl0.ovh.net` SSL).</span>
                </div>
                <p className="text-slate-600 text-[10.5px]">
                  Utilisez le mot de passe défini pour cette adresse email sur le Webmail OVH (et non votre identifiant client OVH xx12345-ovh).
                </p>
              </div>
            )}

            {!autoConfigNote && provider === 'outlook' && (
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield size={13} className="text-indigo-600" />
                  <span>Microsoft Outlook / Office 365 :</span>
                </div>
                <p className="text-slate-600 text-[10.5px]">
                  Pour les comptes personnels Outlook.com, utilisez un mot de passe d'application. Pour Microsoft 365 Entreprise, assurez-vous que l'administrateur a coché « SMTP Authentifié » dans le centre d'administration M365.
                </p>
              </div>
            )}
          </div>

          {/* Paramètres avancés IMAP / SMTP */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Server size={13} />
              {showAdvanced ? "Masquer les réglages serveur" : "Voir / Personnaliser les serveurs IMAP & SMTP"}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Serveur entrant IMAP</label>
                    <input
                      type="text"
                      value={imapHost}
                      onChange={(e) => setImapHost(e.target.value)}
                      placeholder="imap.domain.com"
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-0.5">Port entrant & SSL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={imapPort}
                        onChange={(e) => setImapPort(parseInt(e.target.value) || 993)}
                        className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none"
                      />
                      <label className="text-[11px] text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={imapSsl}
                          onChange={(e) => setImapSsl(e.target.checked)}
                          className="rounded text-blue-600 border-slate-400 dark:border-slate-500"
                        /> SSL
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-0.5">Serveur sortant SMTP</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.domain.com"
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-0.5">Port sortant & SSL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(parseInt(e.target.value) || 465)}
                        className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg outline-none"
                      />
                      <label className="text-[11px] text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpSsl}
                          onChange={(e) => setSmtpSsl(e.target.checked)}
                          className="rounded text-blue-600 border-slate-400 dark:border-slate-500"
                        /> SSL
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isTesting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isTesting || !email.trim() || !password.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isTesting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Test de connexion en direct...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Tester & Enregistrer la boîte
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
