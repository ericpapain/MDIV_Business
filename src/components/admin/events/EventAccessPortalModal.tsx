// src/components/admin/events/EventAccessPortalModal.tsx
// Modale de Gestion des Accès : QR Code Kakemono / Pupitre d'entrée de salle & Liens de Self-Checkin

import { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  ExternalLink, 
  Download, 
  Printer, 
  Check, 
  X, 
  Sparkles,
  Smartphone,
  ShieldCheck,
  Calendar,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadQrCode } from '@/utils/downloadQrCode';
import { toast } from 'sonner';

interface EventAccessPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

export function EventAccessPortalModal({
  isOpen,
  onClose,
  event
}: EventAccessPortalModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !event) return null;

  // URL absolue vers la borne publique de présence
  const selfCheckInUrl = `${window.location.origin}/evenements/${event.id}/presence`;
  
  // QR Code grand format haute résolution
  const qrCodeKakemonoUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(selfCheckInUrl)}&margin=15`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(selfCheckInUrl);
      setCopied(true);
      toast.success("Lien de la borne copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleDownloadKakemonoQr = async () => {
    setIsDownloading(true);
    try {
      await downloadQrCode(
        qrCodeKakemonoUrl,
        event.title || 'Evenement',
        'AFFICHE_ENTREE_SALLE_KAKEMONO'
      );
      toast.success("QR Code pour kakemono téléchargé en haute résolution !");
    } catch {
      toast.error("Erreur de téléchargement");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintAffiche = () => {
    window.open(selfCheckInUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-amber-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base font-serif">
                Borne d'Entrée & Kakemono d'Accueil
              </h3>
              <p className="text-xs text-muted-foreground">
                Génération des accès pour le self check-in des participants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Cadre Affiche / Kakemono */}
          <div className="bg-gradient-to-b from-amber-500/10 via-background to-background border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-lg relative">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-0.5 rounded-full inline-block mb-3">
              À imprimer & poser à l'entrée
            </span>

            <h4 className="text-base font-bold text-foreground font-serif leading-tight">
              {event.title}
            </h4>

            {event.date && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <Calendar size={12} className="text-amber-400" />
                {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}

            {/* Aperçu QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-xl w-48 h-48 mx-auto my-4 flex items-center justify-center border-2 border-amber-400">
              <img 
                src={qrCodeKakemonoUrl} 
                alt="QR Code d'accueil"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs font-semibold text-foreground">
              Scannez pour valider votre présence
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs mx-auto">
              Les participants scannent ce code avec leur téléphone et renseignent leur email pour pointer instantanément.
            </p>
          </div>

          {/* Lien Direct & Partage */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Lien direct de la borne de présence
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={selfCheckInUrl}
                className="flex-1 bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs font-mono text-foreground focus:outline-hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="text-xs gap-1.5 rounded-xl border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? "Copié !" : "Copier"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(selfCheckInUrl, '_blank')}
                className="text-xs gap-1.5 rounded-xl"
                title="Ouvrir la borne dans un nouvel onglet"
              >
                <ExternalLink size={14} /> Tester
              </Button>
            </div>
          </div>
        </div>

        {/* Pied */}
        <div className="p-4 bg-muted/20 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadKakemonoQr}
            disabled={isDownloading}
            className="text-xs gap-1.5 rounded-xl border-amber-400/40 text-amber-400 hover:bg-amber-400/10 font-medium"
          >
            <Download size={14} /> Télécharger QR Kakemono (HD)
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
          >
            Terminer
          </Button>
        </div>
      </div>
    </div>
  );
}

