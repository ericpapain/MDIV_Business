// src/components/admin/events/EventCameraCheckInModal.tsx
// Mode réception  / Accueil : Scanner Caméra en direct pour émargement ultra-rapide des participants

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  RefreshCw,
  Sparkles,
  Building2,
  Mail,
  Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EventCameraCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCheckIn: () => void;
}

export function EventCameraCheckInModal({
  isOpen,
  onClose,
  onSuccessCheckIn
}: EventCameraCheckInModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedAttendee, setLastScannedAttendee] = useState<any | null>(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanRegionId = "sandra-camera-scan-box";
  const cooldownRef = useRef(false);

  // Bip audio de confirmation
  const playBeep = (freq = 880, duration = 0.22) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { }
  };

  // Extraction intelligente du ticket_code
  const extractCode = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj.ticket_code) return obj.ticket_code;
        if (obj.ticket) return obj.ticket;
      } catch { }
    }
    try {
      const u = new URL(trimmed);
      const code = u.searchParams.get('ticket') || u.searchParams.get('ticket_code');
      if (code) return code;
    } catch { }
    return trimmed;
  };

  const handleScanCode = async (decodedText: string) => {
    if (cooldownRef.current || isProcessing) return;
    const ticketCode = extractCode(decodedText);
    if (!ticketCode) return;

    cooldownRef.current = true;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/event_engine.php?action=check_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_code: ticketCode,
          checked_in_by: "Sandra (Accueil)"
        })
      });

      const data = await res.json();

      if (data.success && data.attendee) {
        setLastScannedAttendee(data.attendee);
        setAlreadyCheckedIn(Boolean(data.already_checked_in));
        setScanCount(prev => prev + 1);

        if (data.already_checked_in) {
          playBeep(440, 0.35); // Bip plus grave pour déjà pointé
          toast.warning(`Participant déjà émargé : ${data.attendee.first_name} ${data.attendee.last_name}`);
        } else {
          playBeep(880, 0.22); // Bip joyeux
          toast.success(`Émargement validé : ${data.attendee.first_name} ${data.attendee.last_name}`);
        }

        onSuccessCheckIn();
      } else {
        toast.error(data.error || "Billet inconnu ou invalide");
      }
    } catch (err: any) {
      toast.error("Erreur de connexion au serveur d'émargement");
    } finally {
      setIsProcessing(false);
      // Délai de 2.5s avant de pouvoir rescanner
      setTimeout(() => {
        cooldownRef.current = false;
      }, 2500);
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      const scanner = new Html5Qrcode(scanRegionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScanCode(decodedText);
        },
        () => {
          // Scan frame sans détection, silencieux
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraError(
        err?.message || "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Camera stop error:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      // Démarrage automatique après ouverture de la modale
      const t = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    } else {
      stopScanner();
      setLastScannedAttendee(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-amber-500/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-base font-serif">
                  Scanner d'Accueil & Émargement
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Mode réception
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pointez la caméra vers le QR Code du participant
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

        {/* Corps : Viseur caméra + Statut */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {cameraError ? (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <div className="text-sm font-semibold text-destructive">
                Accès caméra requis
              </div>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {cameraError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={startScanner}
                className="gap-2 text-xs"
              >
                <RefreshCw size={14} /> Réessayer
              </Button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black aspect-square max-w-[340px] mx-auto shadow-inner flex items-center justify-center">
              {/* Conteneur HTML5-QRCode */}
              <div id={scanRegionId} className="w-full h-full" />

              {/* Viseur animé de cadrage */}
              <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-amber-400/70 rounded-2xl animate-pulse flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute top-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              </div>

              {isProcessing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-amber-400 gap-2">
                  <RefreshCw className="animate-spin" size={32} />
                  <span className="text-xs font-bold uppercase tracking-wider">Validation de présence...</span>
                </div>
              )}
            </div>
          )}

          {/* Fiche du dernier participant pointé */}
          {lastScannedAttendee && (
            <div className={`p-4 rounded-2xl border transition-all animate-scale-in ${alreadyCheckedIn
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
              <div className="flex items-center gap-3.5">
                {lastScannedAttendee.photo_url ? (
                  <img
                    src={lastScannedAttendee.photo_url}
                    alt={lastScannedAttendee.first_name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-lg flex items-center justify-center shrink-0">
                    {lastScannedAttendee.first_name?.[0]}{lastScannedAttendee.last_name?.[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm truncate">
                      {lastScannedAttendee.first_name} {lastScannedAttendee.last_name}
                    </h4>
                    {alreadyCheckedIn ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30 whitespace-nowrap">
                        Déjà Pointé
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle2 size={11} /> Présent
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Building2 size={12} className="text-amber-400 shrink-0" />
                    <span className="truncate">{lastScannedAttendee.company || "Indépendant"}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-amber-400">
                    <Ticket size={11} />
                    <span>{lastScannedAttendee.ticket_code}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de modale */}
        <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Scans validés cette session : <strong className="text-amber-400">{scanCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            {isScanning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={stopScanner}
                className="text-xs gap-1.5"
              >
                <CameraOff size={14} /> Mettre en pause
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startScanner}
                className="text-xs gap-1.5"
              >
                <Camera size={14} /> Réactiver caméra
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

