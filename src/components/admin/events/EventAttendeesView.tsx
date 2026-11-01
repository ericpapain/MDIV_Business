// src/components/admin/events/EventAttendeesView.tsx
// Tableau CRM & Gestion des Inscrits MDIV EVENT ENGINE

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventAttendee } from '@/types/eventEngine';
import { 
  Users, Search, Download, CheckCircle2, Clock, XCircle, 
  ExternalLink, QrCode, Filter, UserCheck, Eye, Mail, Phone, 
  Building2, Camera, ShieldCheck, RefreshCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EventAttendeesViewProps {
  eventId?: number;
  eventsList?: any[];
}

export function EventAttendeesView({ eventId, eventsList }: EventAttendeesViewProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(eventId);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null);

  const queryClient = useQueryClient();

  const { data: attendees = [], isLoading, refetch } = useQuery<EventAttendee[]>({
    queryKey: ['admin-attendees', selectedEventId],
    queryFn: async () => {
      const url = selectedEventId 
        ? `/api/event_engine.php?action=get_attendees&event_id=${selectedEventId}`
        : `/api/event_engine.php?action=get_attendees`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      const res = await fetch('/api/event_engine.php?action=check_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: ticketCode, checked_in_by: "Admin Accueil" })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Émargement validé avec succès !");
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de l'émargement");
    }
  });

  // Filtrage des participants
  const filteredAttendees = attendees.filter(att => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      q === "" ||
      att.first_name.toLowerCase().includes(q) ||
      att.last_name.toLowerCase().includes(q) ||
      (att.company && att.company.toLowerCase().includes(q)) ||
      att.email.toLowerCase().includes(q) ||
      att.ticket_code.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || att.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCsv = () => {
    if (filteredAttendees.length === 0) {
      toast.error("Aucun participant à exporter.");
      return;
    }

    const headers = ["Ticket", "Nom", "Prénom", "Email", "Téléphone", "Entreprise", "Fonction", "Secteur", "Statut", "Émargement", "Networking Opt-in", "ID Client CRM", "Date Inscription"];
    const rows = filteredAttendees.map(a => [
      a.ticket_code,
      `"${a.last_name}"`,
      `"${a.first_name}"`,
      a.email,
      a.phone || "",
      `"${a.company || ""}"`,
      `"${a.job_title || ""}"`,
      `"${a.sector || ""}"`,
      a.status,
      a.checked_in_at ? new Date(a.checked_in_at).toLocaleString('fr-FR') : "Non",
      a.networking_opt_in ? "Oui" : "Non",
      a.client_id || "Nouveau",
      new Date(a.created_at).toLocaleDateString('fr-FR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inscrits_evenement_${selectedEventId || 'tous'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export CSV téléchargé avec succès.");
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils et sélecteur d'événement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Users className="text-amber-400" size={18} />
            Inscrits, Billetterie & Émargement (Vue CRM)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suivi des participants en temps réel, vérification des photos, réponses personnalisées et synchronisation CRM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {eventsList && eventsList.length > 0 && (
            <select
              value={selectedEventId || ""}
              onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-card border border-input rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="">Tous les événements</option>
              {eventsList.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          )}

          <Button
            type="button"
            onClick={handleExportCsv}
            variant="outline"
            className="text-xs rounded-xl border-border hover:bg-muted flex items-center gap-1.5"
          >
            <Download size={14} /> Exporter CSV
          </Button>

          <Button
            type="button"
            onClick={() => refetch()}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, entreprise, email, ticket..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-card border border-input rounded-xl text-xs text-foreground focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmés</option>
            <option value="attended">Émargés / Présents</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>
      </div>

      {/* Tableau des inscrits */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          Chargement des participants...
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-card/30">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
          <h4 className="text-xs font-semibold text-foreground">Aucun participant trouvé</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Dès qu'un participant s'inscrira sur la page publique, sa fiche s'affichera ici avec synchronisation CRM immédiate.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Entreprise & Rôle</th>
                  <th className="py-3 px-4">Coordonnées</th>
                  <th className="py-3 px-4">Billet & Statut</th>
                  <th className="py-3 px-4">Émargement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAttendees.map(attendee => {
                  const isAttended = attendee.status === 'attended';

                  return (
                    <tr key={attendee.id} className="hover:bg-muted/20 transition-colors">
                      {/* Photo & Nom */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {attendee.photo_url ? (
                            <img
                              src={attendee.photo_url}
                              alt={attendee.first_name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/20">
                              {attendee.first_name.charAt(0)}{attendee.last_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground">
                              {attendee.first_name} {attendee.last_name}
                            </div>
                            {attendee.client_id && (
                              <span className="text-[9.5px] text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Lié au CRM (#CLI-{attendee.client_id})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Entreprise & Rôle */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{attendee.company || "Non renseignée"}</div>
                        <div className="text-[11px] text-muted-foreground">{attendee.job_title || attendee.sector || "Participant"}</div>
                      </td>

                      {/* Coordonnées */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail size={12} className="text-amber-400/80" /> {attendee.email}
                        </div>
                        {attendee.phone && (
                          <div className="flex items-center gap-1.5 text-[10.5px] mt-0.5">
                            <Phone size={11} className="text-amber-400/80" /> {attendee.phone}
                          </div>
                        )}
                      </td>

                      {/* Ticket Code & Statut */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-[10.5px] font-semibold text-amber-300">
                          {attendee.ticket_code}
                        </div>
                        <div className="mt-0.5">
                          {isAttended ? (
                            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[9.5px]">
                              Présent / Pointé
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-sky-300 border-sky-500/20 bg-sky-500/5 text-[9.5px]">
                              Inscrit confirmé
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Bouton d'émargement */}
                      <td className="py-3 px-4">
                        {isAttended ? (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {attendee.checked_in_at ? new Date(attendee.checked_in_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "Émargé"}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => checkInMutation.mutate(attendee.ticket_code)}
                            disabled={checkInMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] rounded-lg px-2.5 py-1 h-7"
                          >
                            <UserCheck size={12} className="mr-1" /> Pointer
                          </Button>
                        )}
                      </td>

                      {/* Action Détail */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttendee(attendee)}
                          className="p-1.5 text-muted-foreground hover:text-amber-400 cursor-pointer transition-colors"
                          title="Voir la fiche complète & réponses"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Détail Participant */}
      {selectedAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Users className="text-amber-400" size={18} />
                <h3 className="font-bold text-sm text-foreground">
                  Fiche Participant : {selectedAttendee.first_name} {selectedAttendee.last_name}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedAttendee(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Carte profil */}
              <div className="p-4 bg-muted/30 rounded-xl flex items-center gap-4">
                {selectedAttendee.photo_url ? (
                  <img
                    src={selectedAttendee.photo_url}
                    alt={selectedAttendee.first_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-xl border border-amber-500/30">
                    {selectedAttendee.first_name.charAt(0)}{selectedAttendee.last_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {selectedAttendee.first_name} {selectedAttendee.last_name}
                  </h4>
                  <div className="text-amber-300 font-medium">{selectedAttendee.job_title || "Professionnel"}</div>
                  <div className="text-muted-foreground">{selectedAttendee.company}</div>
                  <div className="font-mono text-[11px] text-slate-400 mt-1">Ticket : {selectedAttendee.ticket_code}</div>
                </div>
              </div>

              {/* Pitch */}
              {selectedAttendee.pitch_text && (
                <div className="p-3 bg-card border border-border rounded-xl">
                  <div className="font-bold text-foreground mb-1 text-[11px]">Pitch de présentation entreprise :</div>
                  <p className="text-muted-foreground italic leading-relaxed">« {selectedAttendee.pitch_text} »</p>
                </div>
              )}

              {/* Réponses aux questions personnalisées */}
              {selectedAttendee.custom_answers && Object.keys(selectedAttendee.custom_answers).length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-foreground text-[11px]">Réponses au formulaire d'inscription :</div>
                  <div className="bg-card border border-border rounded-xl p-3 space-y-2">
                    {Object.entries(selectedAttendee.custom_answers).map(([key, value]) => (
                      <div key={key} className="border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                        <div className="text-[10px] text-muted-foreground uppercase">{key}</div>
                        <div className="font-medium text-foreground">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consentements RGPD & Networking */}
              <div className="p-3 bg-muted/20 rounded-xl space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Partage Networking Wall :</span>
                  <span className={selectedAttendee.networking_opt_in ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                    {selectedAttendee.networking_opt_in ? "Autorisé (Opt-in)" : "Refusé"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Droit à l'image & Diffusion :</span>
                  <span className={selectedAttendee.photo_consent ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
                    {selectedAttendee.photo_consent ? "Accordé" : "Non accordé"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Synchronisation CRM client :</span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedAttendee.client_id ? `Client #${selectedAttendee.client_id}` : "Créé"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setSelectedAttendee(null)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

