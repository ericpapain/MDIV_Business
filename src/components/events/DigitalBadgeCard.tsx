// src/components/events/DigitalBadgeCard.tsx
// Rendu du Badge Numérique Participant avec QR Code d'émargement

import { EventAttendee } from '@/types/eventEngine';
import { Calendar, MapPin, Building2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

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
  return (
    <div className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-[#142B52] border-2 border-amber-400/50 rounded-3xl p-6 text-white shadow-2xl overflow-hidden font-sans">
      {/* Halo doré supérieur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-400/20 blur-3xl rounded-full pointer-events-none" />

      {/* En-tête du badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-300">
            Pass Participant Officiel
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">MDIV NETWORK</span>
      </div>

      {/* Titre de l'événement */}
      <div className="text-center mb-4">
        <h4 className="font-bold text-sm text-white leading-tight font-serif">
          {eventTitle}
        </h4>
        <div className="text-[10.5px] text-amber-200/80 flex items-center justify-center gap-2 mt-1">
          {eventDate && <span>📅 {new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          {eventLocation && <span>📍 {eventLocation}</span>}
        </div>
      </div>

      {/* Photo du participant */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative">
          {attendee.photo_url ? (
            <img 
              src={attendee.photo_url} 
              alt={attendee.first_name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 text-amber-300 font-extrabold text-2xl flex items-center justify-center shadow-lg">
              {attendee.first_name.charAt(0)}{attendee.last_name.charAt(0)}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full shadow" title="Accès Validé">
            <ShieldCheck size={14} className="stroke-[2.5]" />
          </div>
        </div>

        <div className="text-center mt-3">
          <h3 className="font-extrabold text-lg text-white leading-tight">
            {attendee.first_name} {attendee.last_name}
          </h3>
          <div className="text-xs text-amber-300 font-medium mt-0.5">
            {attendee.job_title || "Participant"}
          </div>
          <div className="text-[11px] text-slate-300 flex items-center justify-center gap-1 mt-0.5 font-semibold">
            <Building2 size={11} className="text-amber-400" />
            {attendee.company || "Professionnel"}
          </div>
        </div>
      </div>

      {/* Section QR Code d'émargement */}
      <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner my-4 text-slate-900">
        <img 
          src={qrCodeUrl} 
          alt={`QR Code ${attendee.ticket_code}`}
          className="w-36 h-36 object-contain"
        />
        <div className="mt-2 text-center">
          <span className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold block">
            Code d'accès sécurisé
          </span>
          <span className="font-mono text-xs font-black text-slate-900 tracking-wider">
            {attendee.ticket_code}
          </span>
        </div>
      </div>

      {/* Pied de badge */}
      <div className="text-center text-[9.5px] text-slate-400 pt-1 border-t border-white/10 flex items-center justify-between">
        <span>Présentez ce QR code à l'accueil</span>
        <span className="text-emerald-400 font-semibold flex items-center gap-1">
          <UserCheck size={11} /> Confirmé
        </span>
      </div>
    </div>
  );
}

