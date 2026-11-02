// src/components/events/EventRegistrationConfirmation.tsx
// Écran de confirmation d'inscription MDIV EVENT ENGINE

import { RegistrationResult } from '@/types/eventEngine';
import { CheckCircle2, Download, Calendar, MapPin, Ticket, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventRegistrationConfirmationProps {
  result: RegistrationResult;
  event: any;
  onReset: () => void;
}

export function EventRegistrationConfirmation({
  result,
  event,
  onReset
}: EventRegistrationConfirmationProps) {
  const { attendee, ticket_code, qr_code_data_url } = result;

  const displayName = attendee?.first_name 
    ? `${attendee.first_name} ${attendee.last_name || ''}`.trim()
    : "";

  return (
    <div className="space-y-6 text-center animate-fade-in py-2">
      {/* Icône de succès */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h3 className="font-extrabold text-xl md:text-2xl text-foreground font-serif">
          Votre inscription a bien été prise en compte
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
          {displayName ? (
            <>Merci <span className="font-semibold text-foreground">{displayName}</span>, votre participation à l'événement <span className="text-amber-400 font-semibold">« {event?.title} »</span> est bien enregistrée.</>
          ) : (
            <>Votre participation à l'événement <span className="text-amber-400 font-semibold">« {event?.title} »</span> est bien enregistrée.</>
          )}
        </p>
      </div>

      {/* Carte récapitulative officielle */}
      <div className="bg-card border border-border rounded-2xl p-5 max-w-md mx-auto text-left shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="text-amber-400" size={16} />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Référence Billet</span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            {ticket_code || "ENREGISTRÉ"}
          </span>
        </div>

        {event?.date && (
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            <Calendar size={14} className="text-amber-400 shrink-0" />
            <span>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        )}

        {event?.location && (
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            <MapPin size={14} className="text-amber-400 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Inscription confirmée et enregistrée auprès de l'organisation.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {qr_code_data_url && (
          <a
            href={qr_code_data_url}
            download={`billet_${ticket_code || 'mdiv'}.png`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download size={14} /> Télécharger mon pass (QR Code)
          </a>
        )}

        <Button
          type="button"
          onClick={onReset}
          variant="outline"
          className="text-xs rounded-xl border-border px-5 py-2.5 hover:bg-muted cursor-pointer"
        >
          Retourner aux événements
        </Button>
      </div>
    </div>
  );
}
