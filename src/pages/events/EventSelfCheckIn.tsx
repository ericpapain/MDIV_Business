// src/pages/events/EventSelfCheckIn.tsx
// Borne Publique Mobile-First de Self Check-in à l'entrée de la salle d'événement

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Building2, 
  UserCheck, 
  ArrowRight, 
  QrCode, 
  Sparkles, 
  Loader2, 
  Mail, 
  Ticket,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function EventSelfCheckIn() {
  const { eventId } = useParams<{ eventId: string }>();
  const [emailQuery, setEmailQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    already_checked_in?: boolean;
    ambiguous?: boolean;
    message?: string;
    error?: string;
    attendee?: any;
  } | null>(null);

  // Récupération des informations de l'événement
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ['self-checkin-event', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/event_engine.php?action=get_event&id=${eventId}`);
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!eventId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = emailQuery.trim();
    if (!query) {
      toast.error("Veuillez saisir votre email ou début d'email.");
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/event_engine.php?action=self_check_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: Number(eventId),
          email_query: query
        })
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        if (data.already_checked_in) {
          toast.warning("Votre présence était déjà enregistrée !");
        } else {
          toast.success("Présence validée avec succès !");
        }
      } else {
        toast.error(data.error || "Aucun participant trouvé");
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: "Erreur de connexion avec le serveur. Veuillez réessayer ou vous adresser à l'accueil."
      });
      toast.error("Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmailQuery('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 text-foreground flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* En-tête MDIV BRANDING */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between pt-2 pb-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-serif text-sm group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="font-serif tracking-widest text-xs uppercase font-extrabold text-foreground">
            MDIV Business
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Sparkles size={11} /> Borne Présence
        </div>
      </header>

      {/* Conteneur Principal */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        {isEventLoading ? (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Chargement de la borne...
            </p>
          </div>
        ) : !event || !event.id ? (
          <div className="text-center bg-card/60 backdrop-blur-md border border-border/60 rounded-3xl p-8 space-y-4 shadow-xl">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Événement introuvable</h2>
            <p className="text-xs text-muted-foreground">
              Le lien de cet événement semble invalide. Veuillez vérifier le QR Code ou vous adresser à l'accueil Sandra.
            </p>
          </div>
        ) : (
          <div className="bg-card/75 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Lueur dorée d'ambiance */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl rounded-full pointer-events-none" />

            {/* En-tête Événement */}
            <div className="text-center space-y-2 relative">
              <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full inline-block">
                Émargement Entrée de Salle
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground font-serif leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
                {event.date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-amber-400" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin size={13} className="text-amber-400 shrink-0" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>

            {/* ÉCRAN DE RÉSULTAT */}
            {result ? (
              <div className="space-y-6 text-center animate-scale-in py-2">
                {result.success && result.attendee ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xl text-foreground font-serif">
                        {result.already_checked_in ? "Déjà Enregistré !" : "Présence Validée !"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {result.message}
                      </p>
                    </div>

                    {/* Fiche Participant */}
                    <div className="bg-muted/30 border border-border rounded-2xl p-4 text-left flex items-center gap-3.5 shadow-inner">
                      {result.attendee.photo_url ? (
                        <img 
                          src={result.attendee.photo_url} 
                          alt={result.attendee.first_name}
                          className="w-14 h-14 rounded-xl object-cover border border-amber-400/60 shadow-sm shrink-0 bg-slate-800"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-lg flex items-center justify-center shrink-0">
                          {result.attendee.first_name?.[0]}{result.attendee.last_name?.[0]}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground text-sm truncate">
                          {result.attendee.first_name} {result.attendee.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                          <Building2 size={12} className="text-amber-400 shrink-0" />
                          <span className="truncate">{result.attendee.company || "Indépendant"}</span>
                        </div>
                        <div className="text-[11px] font-mono text-amber-400 mt-1 flex items-center gap-1">
                          <Ticket size={11} /> {result.attendee.ticket_code}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Button
                        type="button"
                        onClick={handleReset}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs py-2.5 shadow-md cursor-pointer"
                      >
                        Enregistrer un autre participant
                      </Button>
                      <p className="text-[11px] text-muted-foreground">
                        Vous pouvez à présent entrer et vous installer en salle.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-destructive/15 border-2 border-destructive/40 text-destructive mx-auto flex items-center justify-center shadow-lg">
                      <AlertCircle size={36} />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-foreground">
                        {result.ambiguous ? "Précision Requise" : "Inscription Introuvable"}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        {result.error}
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        type="button"
                        onClick={() => setResult(null)}
                        variant="outline"
                        className="w-full rounded-xl text-xs py-2.5 border-border hover:bg-muted"
                      >
                        <ChevronLeft size={14} className="mr-1" /> Corriger ma saisie
                      </Button>
                      <p className="text-[10.5px] text-muted-foreground">
                        En cas de difficulté, rapprochez-vous de Sandra au comptoir d'accueil.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* FORMULAIRE DE POINTAGE */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="email-query" 
                    className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                  >
                    <Mail size={14} className="text-amber-400" />
                    Votre adresse email d'inscription
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Saisissez votre email ou seulement le début avant le @ (ex: <span className="font-mono text-amber-300">jean.dupont</span>).
                  </p>
                  <div className="relative">
                    <Input
                      id="email-query"
                      type="text"
                      autoFocus
                      autoComplete="email"
                      value={emailQuery}
                      onChange={(e) => setEmailQuery(e.target.value)}
                      placeholder="ex: prenom.nom ou contact@entreprise.com"
                      className="bg-muted/40 border-border rounded-xl text-xs py-3 pl-3.5 pr-10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-foreground placeholder:text-muted-foreground/60"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !emailQuery.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs py-3 shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Validation de présence...
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} /> Valider ma présence
                    </>
                  )}
                </Button>

                <div className="pt-2 border-t border-border/40 text-center">
                  <span className="text-[10.5px] text-muted-foreground flex items-center justify-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    Validation instantanée & sécurisée par MDIV Network
                  </span>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="w-full max-w-lg mx-auto text-center py-3 text-[11px] text-muted-foreground/70">
        © {new Date().getFullYear()} MDIV Business Network — Tous droits réservés.
      </footer>
    </div>
  );
}

