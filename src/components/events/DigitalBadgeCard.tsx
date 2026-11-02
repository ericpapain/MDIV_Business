// src/components/events/DigitalBadgeCard.tsx
// Rendu Haute Définition du Badge Numérique Participant avec QR Code d'émargement & Impression

import { useState } from 'react';
import { EventAttendee } from '@/types/eventEngine';
import { Calendar, MapPin, Building2, ShieldCheck, Sparkles, UserCheck, Printer, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DigitalBadgeCardProps {
  attendee: EventAttendee;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  qrCodeUrl: string;
}

export function DigitalBadgeCard({
  attendee,
  eventTitle,
  eventDate,
  eventLocation,
  qrCodeUrl
}: DigitalBadgeCardProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownload = () => {
    // Téléchargement direct du QR code ou invitation à imprimer
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `pass-${attendee.ticket_code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Votre QR Code d'accès a été téléchargé.");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto font-sans">
      {/* Conteneur principal du Badge Physique / Digital */}
      <div 
        id="digital-badge-print-area"
        className="relative w-full bg-gradient-to-b from-[#0c1322] via-[#101d36] to-[#080d18] border-2 border-amber-400/60 rounded-3xl p-6 text-white shadow-[0_20px_50px_rgba(217,119,6,0.15)] overflow-hidden"
      >
        {/* Fente supérieure pour cordon / tour de cou (Lanyard punch hole) */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-2.5 bg-black/60 border border-amber-400/40 rounded-full shadow-inner" />
        </div>

        {/* Halo doré décoratif en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-gradient-to-b from-amber-400/25 to-transparent blur-2xl rounded-full pointer-events-none" />

        {/* En-tête officiel du badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-amber-300">
              Pass VIP Officiel
            </span>
          </div>
          <span className="text-[9.5px] font-mono font-bold tracking-widest text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            MDIV NETWORK
          </span>
        </div>

        {/* Titre & Date de l'événement */}
        <div className="text-center mb-4">
          <h4 className="font-bold text-sm text-white leading-tight font-serif drop-shadow-sm">
            {eventTitle}
          </h4>
          <div className="text-[10px] text-amber-200/90 flex flex-wrap items-center justify-center gap-2 mt-1">
            {eventDate && (
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-amber-400" />
                {new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {eventLocation && (
              <span className="flex items-center gap-1 truncate max-w-[170px]">
                <MapPin size={11} className="text-amber-400 shrink-0" />
                {eventLocation}
              </span>
            )}
          </div>
        </div>

        {/* Photo & Identité du participant */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative">
            {attendee.photo_url ? (
              <img 
                src={attendee.photo_url} 
                alt={`${attendee.first_name} ${attendee.last_name}`}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] bg-slate-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border-2 border-amber-400/60 text-amber-300 font-extrabold text-2xl flex items-center justify-center shadow-lg">
                {attendee.first_name?.charAt(0)}{attendee.last_name?.charAt(0)}
              </div>
            )}
            <div 
              className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg border border-white/20" 
              title="Accès Contrôlé & Validé"
            >
              <ShieldCheck size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="text-center mt-3 w-full px-2">
            <h3 className="font-extrabold text-lg text-white leading-tight tracking-tight drop-shadow-sm truncate">
              {attendee.first_name} {attendee.last_name}
            </h3>
            <div className="text-xs text-amber-300 font-semibold mt-0.5 truncate">
              {attendee.job_title || "Participant Certifié"}
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5 mt-1 font-medium truncate">
              <Building2 size={12} className="text-amber-400 shrink-0" />
              <span className="truncate">{attendee.company || "Professionnel Indépendant"}</span>
            </div>
          </div>
        </div>

        {/* Section QR Code d'émargement haute résolution */}
        <div className="bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center shadow-xl my-3 text-slate-900 border border-amber-400/30">
          <img 
            src={qrCodeUrl} 
            alt={`QR Code ${attendee.ticket_code}`}
            className="w-36 h-36 object-contain"
          />
          <div className="mt-2 text-center w-full">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
              Billet d'accès unique sécurisé
            </span>
            <span className="font-mono text-xs font-black text-slate-950 tracking-wider bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
              {attendee.ticket_code}
            </span>
          </div>
        </div>

        {/* Pied de badge */}
        <div className="text-center text-[9.5px] text-slate-400 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-slate-300">Présentez ce QR code à l'entrée</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <UserCheck size={12} /> Confirmé
          </span>
        </div>
      </div>

      {/* Barre d'actions : Téléchargement & Impression */}
      <div className="flex items-center gap-2 w-full justify-center pt-1 print:hidden">
        <Button
          type="button"
          onClick={handlePrint}
          variant="outline"
          className="text-xs rounded-xl border-amber-400/40 text-amber-300 hover:bg-amber-400/10 flex items-center gap-1.5 cursor-pointer px-4"
        >
          <Printer size={14} /> Imprimer mon badge
        </Button>
        <Button
          type="button"
          onClick={handleDownload}
          className="text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer px-4 shadow"
        >
          <Download size={14} /> Télécharger QR
        </Button>
      </div>
    </div>
  );
}
