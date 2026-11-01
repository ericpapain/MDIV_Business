// src/components/events/EventRegistrationConfirmation.tsx
// Écran de confirmation d'inscription avec badge numérique et QR Code

import { RegistrationResult } from '@/types/eventEngine';
import { DigitalBadgeCard } from './DigitalBadgeCard';
import { CheckCircle2, Download, Printer, ArrowLeft, Mail, Calendar } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-center animate-fade-in py-2">
      {/* Icône de succès */}
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
        <CheckCircle2 size={32} />
      </div>

      <div>
        <h3 className="font-extrabold text-xl md:text-2xl text-foreground font-serif">
          Inscription Confirmée !
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Félicitations <span className="font-semibold text-foreground">{attendee?.first_name}</span>, votre place pour l'événement <span className="text-amber-400 font-semibold">« {event.title} »</span> est réservée.
        </p>
      </div>

      {/* Mention de confirmation par e-mail */}
      <div className="bg-muted/40 border border-border rounded-2xl p-4 max-w-md mx-auto text-xs text-muted-foreground flex items-center gap-3 text-left">
        <Mail className="text-amber-400 shrink-0" size={20} />
        <div>
          Un e-mail récapitulatif avec vos accès et votre billet a été envoyé à l'adresse <strong className="text-foreground">{attendee?.email}</strong>.
        </div>
      </div>

      {/* Rendu visuel du Badge Numérique */}
      {attendee && (
        <div className="py-2">
          <DigitalBadgeCard
            attendee={attendee}
            eventTitle={event.title}
            eventDate={event.date}
            eventLocation={event.location}
            qrCodeUrl={qr_code_data_url}
          />
        </div>
      )}

      {/* Actions (Imprimer, Télécharger, Fermer) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          onClick={handlePrint}
          variant="outline"
          className="text-xs rounded-xl border-border flex items-center gap-2 hover:bg-muted"
        >
          <Printer size={14} /> Imprimer mon pass
        </Button>

        <a
          href={qr_code_data_url}
          download={`ticket_${ticket_code}.png`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
        >
          <Download size={14} /> Télécharger le QR Code
        </a>

        <Button
          type="button"
          onClick={onReset}
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Retourner aux événements
        </Button>
      </div>
    </div>
  );
}

