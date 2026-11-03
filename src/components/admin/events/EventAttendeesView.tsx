// src/components/admin/events/EventAttendeesView.tsx
// Tableau CRM & Gestion des Inscrits MDIV EVENT ENGINE

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EventAttendee } from '@/types/eventEngine';
import { 
  Users, Search, Download, Trash2, CheckCircle2, Clock, XCircle, 
  ExternalLink, QrCode, Filter, UserCheck, Eye, Mail, Phone, 
  Building2, Camera, ShieldCheck, RefreshCw, X, Upload, UserMinus, Percent, Sparkles, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCameraCheckInModal } from './EventCameraCheckInModal';
import { EventAccessPortalModal } from './EventAccessPortalModal';
import { downloadQrCode } from '@/utils/downloadQrCode';
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
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isAccessPortalModalOpen, setIsAccessPortalModalOpen] = useState(false);

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

  // Récupération des questions personnalisées de l'événement pour enrichir l'export CSV et la modale participant
  const { data: customFields = [] } = useQuery<any[]>({
    queryKey: ['custom-fields', selectedEventId],
    queryFn: async () => {
      const url = selectedEventId 
        ? `/api/event_engine.php?action=get_custom_fields&event_id=${selectedEventId}`
        : `/api/event_engine.php?action=get_custom_fields`;
      const res = await fetch(url);
      const json = await res.json();
      return json.data || [];
    }
  });

  
  // Suppression d'un participant dans le CRM
  const deleteAttendeeMutation = useMutation({
    mutationFn: async (attendeeId: number) => {
      const res = await fetch('/api/event_engine.php?action=delete_attendee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendee_id: attendeeId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Impossible de supprimer l'inscription");
      return data;
    },
    onSuccess: () => {
      toast.success("Inscription supprimée avec succès du CRM.");
      queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
      setSelectedAttendee(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Erreur lors de la suppression de l'inscription");
    }
  });

  // Téléchargement sécurisé de la photo du participant en HD (usage vidéo / cartes PPTX)
  const handleDownloadPhoto = async (photoUrl: string, attendeeName: string) => {
    try {
      toast.info("Téléchargement de la photo...");
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanName = attendeeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `photo_${cleanName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Photo téléchargée avec succès !");
    } catch (e) {
      const a = document.createElement('a');
      a.href = photoUrl;
      a.target = '_blank';
      a.download = `photo_${attendeeName}.jpg`;
      a.click();
    }
  };

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

  // Calcul dynamique des compteurs en temps réel (zéro valeur figée)
  const totalRegistered = attendees.length;
  const attendedCount = attendees.filter(a => a.status === 'attended').length;
  const absentCount = attendees.filter(a => a.status !== 'attended' && a.status !== 'cancelled').length;
  const cancelledCount = attendees.filter(a => a.status === 'cancelled').length;
  const attendanceRate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  // Import CSV intelligent des participants avec prise en charge des questions personnalisées
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          toast.error("Le fichier CSV est vide ou ne contient que l'en-tête.");
          return;
        }

        const delimiter = lines[0].includes(';') ? ';' : ',';
        const rawHeaders = lines[0].split(delimiter).map(c => c.replace(/^[\"']|[\"']$/g, '').trim());

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(c => c.replace(/^[\"']|[\"']$/g, '').trim());
          if (cols.length >= 2) {
            const emailIdx = rawHeaders.findIndex(h => /email|courriel|mail/i.test(h));
            const email = (emailIdx !== -1 && cols[emailIdx]) ? cols[emailIdx] : cols.find(c => c.includes('@'));
            if (!email || !email.includes('@')) continue;

            const lastNameIdx = rawHeaders.findIndex(h => /^nom/i.test(h));
            const firstNameIdx = rawHeaders.findIndex(h => /^pr[eé]nom/i.test(h));
            const phoneIdx = rawHeaders.findIndex(h => /t[eé]l/i.test(h));
            const companyIdx = rawHeaders.findIndex(h => /entreprise|soci[eé]t[eé]/i.test(h));
            const roleIdx = rawHeaders.findIndex(h => /fonction|poste|r[oô]le/i.test(h));

            const lastName = lastNameIdx !== -1 ? cols[lastNameIdx] : cols[0] || "Participant";
            const firstName = firstNameIdx !== -1 ? cols[firstNameIdx] : cols[1] || "";
            const phone = phoneIdx !== -1 ? cols[phoneIdx] : "";
            const company = companyIdx !== -1 ? cols[companyIdx] : "";
            const jobTitle = roleIdx !== -1 ? cols[roleIdx] : "";

            // Mapping automatique des réponses personnalisées par intitulé (label) ou par clé
            const customAnswers: Record<string, any> = {};
            rawHeaders.forEach((h, hIdx) => {
              const cf = (customFields || []).find((f: any) => 
                (f.label && f.label.toLowerCase() === h.toLowerCase()) || 
                (f.field_key && f.field_key.toLowerCase() === h.toLowerCase())
              );
              if (cf && cols[hIdx] !== undefined && cols[hIdx] !== "") {
                customAnswers[cf.field_key] = cols[hIdx];
              }
            });

            try {
              await fetch('/api/event_engine.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event_id: selectedEventId || 1,
                  first_name: firstName || "Participant",
                  last_name: lastName || "MDIV",
                  email: email,
                  phone: phone,
                  company: company,
                  job_title: jobTitle,
                  custom_answers: customAnswers,
                  gdpr_consent: true
                })
              });
              importedCount++;
            } catch (err) {}
          }
        }

        queryClient.invalidateQueries({ queryKey: ['admin-attendees'] });
        toast.success(`Import terminé : ${importedCount} participant(s) synchronisé(s) dans le CRM avec leurs réponses.`);
      } catch (err) {
        toast.error("Erreur lors de la lecture du fichier CSV.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export CSV complet avec intitulés exacts de TOUTES les questions personnalisées
  const handleExportCsv = () => {
    if (filteredAttendees.length === 0) {
      toast.error("Aucun participant à exporter.");
      return;
    }

    // 1. Rassembler l'ensemble des questions personnalisées avec leurs intitulés (labels) complets
    const questionMap = new Map<string, { label: string; field_key: string }>();

    // D'abord les questions configurées sur l'événement
    (customFields || []).forEach((cf: any) => {
      if (cf.field_key) {
        questionMap.set(cf.field_key, {
          label: cf.label || cf.field_key,
          field_key: cf.field_key
        });
      }
    });

    // Ensuite toutes les questions trouvées dans l'historique des participants
    filteredAttendees.forEach((a: any) => {
      if (a.custom_answers_details && Array.isArray(a.custom_answers_details)) {
        a.custom_answers_details.forEach((item: any) => {
          if (!questionMap.has(item.field_key)) {
            questionMap.set(item.field_key, {
              label: item.label || item.field_key,
              field_key: item.field_key
            });
          }
        });
      } else if (a.custom_answers) {
        Object.keys(a.custom_answers).forEach((k: string) => {
          if (!questionMap.has(k)) {
            questionMap.set(k, {
              label: k,
              field_key: k
            });
          }
        });
      }
    });

    const questionList = Array.from(questionMap.values());

    // 2. Colonnes de base + chaque intitulé de question en colonne dédiée
    const baseHeaders = [
      "Ticket",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Entreprise",
      "Fonction",
      "Secteur",
      "Statut Billet",
      "Émargement",
      "Date/Heure Émargement",
      "Opérateur Accueil",
      "Networking Opt-in",
      "Droit Image",
      "ID Client CRM",
      "Date Inscription"
    ];

    const questionHeaders = questionList.map(q => q.label);
    const allHeaders = [...baseHeaders, ...questionHeaders];

    // 3. Données des participants avec réponses placées sous les bonnes colonnes
    const rows = filteredAttendees.map((a: any) => {
      const baseCols = [
        a.ticket_code || "",
        a.last_name || "",
        a.first_name || "",
        a.email || "",
        a.phone || "",
        a.company || "",
        a.job_title || "",
        a.sector || "",
        a.status || "registered",
        a.status === 'attended' ? "Présent" : "Non émargé",
        a.checked_in_at ? new Date(a.checked_in_at).toLocaleString('fr-FR') : "",
        a.checked_in_by || "",
        a.networking_opt_in ? "Oui" : "Non",
        a.photo_consent ? "Oui" : "Non",
        a.client_id ? `Client #${a.client_id}` : "Nouveau",
        a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : ""
      ];

      const questionCols = questionList.map(q => {
        let val: any = undefined;

        if (a.custom_answers_details && Array.isArray(a.custom_answers_details)) {
          const detail = a.custom_answers_details.find((d: any) => d.field_key === q.field_key);
          if (detail !== undefined) val = detail.value;
        }

        if (val === undefined && a.custom_answers && a.custom_answers[q.field_key] !== undefined) {
          val = a.custom_answers[q.field_key];
        }

        if (Array.isArray(val)) {
          return val.join(", ");
        }
        if (typeof val === 'boolean') {
          return val ? "Oui" : "Non";
        }
        if (val === null || val === undefined) {
          return "";
        }
        return String(val);
      });

      return [...baseCols, ...questionCols];
    });

    // Échappement CSV Excel (séparateur point-virgule compatible France/Europe avec BOM UTF-8)
    const escapeCsv = (str: any) => {
      const s = String(str ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvContent = "\uFEFF" + [
      allHeaders.map(escapeCsv).join(";"),
      ...rows.map(r => r.map(escapeCsv).join(";"))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    const currentEvent = eventsList?.find(e => e.id === selectedEventId);
    const evTitle = currentEvent?.title || "MDIV_Evenement";
    const cleanTitle = evTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `inscrits_${cleanTitle}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

    toast.success(`Export CSV généré avec ${questionList.length} question(s) personnalisée(s) et ${filteredAttendees.length} participant(s).`);
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

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted text-xs rounded-xl cursor-pointer transition-colors text-foreground">
            <Upload size={14} className="text-amber-400" />
            <span>Importer CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>

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

      {/* MODULE ACCUEIL & ÉMARGEMENT : MODE SANDRA + BORNE ENTRÉE */}
      <div className="bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Camera size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground text-sm font-serif">
                Poste d'Accueil & Contrôle d'Accès
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                Studio Régie
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Validez les arrivées via la caméra (Sandra) ou téléchargez le QR Code à poser sur le kakemono d'entrée.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            onClick={() => setIsCameraModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Camera size={15} />
            <span>Scanner Caméra (Mode Sandra)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAccessPortalModalOpen(true)}
            className="border-amber-400/40 text-amber-300 hover:bg-amber-400/10 font-medium text-xs rounded-xl px-3.5 py-2.5 flex items-center gap-2 cursor-pointer"
          >
            <QrCode size={15} />
            <span>Borne Entrée (QR Kakemono)</span>
          </Button>
        </div>
      </div>

      {/* Compteurs dynamiques en temps réel (Recalculés automatiquement) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
            <span>Total Inscrits</span>
            <Users size={14} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{totalRegistered}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Participants enregistrés</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
            <span>Présents (Émargés)</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{attendedCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Badges scannés à l'accueil</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
            <span>En attente / Absents</span>
            <UserMinus size={14} className="text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{absentCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Non encore émargés</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
            <span>Taux de Présence</span>
            <Percent size={14} className="text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">{attendanceRate}%</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Ratio présence effective</div>
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
              <thead className="bg-slate-900 border-b border-border/80 uppercase tracking-wider text-[11px] font-bold text-white shadow-xs">
                <tr>
                  <th className="py-3.5 px-4 text-white font-bold tracking-wider">Participant</th>
                  <th className="py-3.5 px-4 text-white font-bold tracking-wider">Entreprise & Rôle</th>
                  <th className="py-3.5 px-4 text-white font-bold tracking-wider">Coordonnées</th>
                  <th className="py-3.5 px-4 text-white font-bold tracking-wider">Billet & Statut</th>
                  <th className="py-3.5 px-4 text-white font-bold tracking-wider">Émargement</th>
                  <th className="py-3.5 px-4 text-right text-white font-bold tracking-wider">Actions</th>
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

                      {/* Actions : Détail, Télécharger Photo HD, Supprimer */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Téléchargement direct du QR Billet de ce participant */}
                          <button
                            type="button"
                            onClick={() => {
                              const evTitle = eventsList?.find(e => e.id === attendee.event_id)?.title || 'Evenement_MDIV';
                              const qrUrl = attendee.badge_url || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(attendee.ticket_code)}&margin=10`;
                              downloadQrCode(qrUrl, evTitle, `${attendee.first_name}_${attendee.last_name}`);
                              toast.success(`Téléchargement du QR Code de ${attendee.first_name} ${attendee.last_name}`);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Télécharger le QR Code d'accès de ce participant"
                          >
                            <QrCode size={15} />
                          </button>

                          {attendee.photo_url && (
                            <button
                              type="button"
                              onClick={() => handleDownloadPhoto(attendee.photo_url!, `${attendee.first_name}_${attendee.last_name}`)}
                              className="p-1.5 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-colors"
                              title="Télécharger la photo du participant en HD (PPTX / Vidéo)"
                            >
                              <Download size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedAttendee(attendee)}
                            className="p-1.5 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Voir la fiche complète & réponses"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Confirmez-vous la suppression définitive de l'inscription de ${attendee.first_name} ${attendee.last_name} ?\n\nCette action retirera le participant du CRM, du listing et supprimera ses réponses.`)) {
                                deleteAttendeeMutation.mutate(attendee.id);
                              }
                            }}
                            disabled={deleteAttendeeMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                            title="Supprimer définitivement cette inscription"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className="text-amber-400 shrink-0" size={18} />
                <h3 className="font-bold text-sm text-foreground truncate">
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
                    {(selectedAttendee.first_name || "P").charAt(0)}{(selectedAttendee.last_name || "").charAt(0)}
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

              {/* Pitch de présentation entreprise avec protection anti-débordement totale */}
              {selectedAttendee.pitch_text && (
                <div className="p-3.5 bg-card/60 border border-border rounded-xl w-full min-w-0 max-w-full overflow-hidden">
                  <div className="font-bold text-foreground mb-1.5 text-[11px]">Pitch de présentation entreprise :</div>
                  <p className="text-muted-foreground italic leading-relaxed break-all break-words [word-break:break-all] [overflow-wrap:anywhere] max-w-full overflow-hidden">
                    « {selectedAttendee.pitch_text} »
                  </p>
                </div>
              )}

              {/* Téléchargement direct photo HD si disponible */}
              {selectedAttendee.photo_url && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-emerald-400" />
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-300">Photo HD du participant</div>
                      <div className="text-[10px] text-muted-foreground">Format réutilisable pour cartes de visite, trombinoscope & présentations PPTX</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleDownloadPhoto(selectedAttendee.photo_url!, `${selectedAttendee.first_name}_${selectedAttendee.last_name}`)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg px-3 py-1 h-7"
                  >
                    <Download size={13} className="mr-1.5" /> Télécharger HD
                  </Button>
                </div>
              )}

              {/* Billet & QR Code d'accès rapide */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center border border-amber-400 shadow-sm">
                    <img 
                      src={selectedAttendee.badge_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedAttendee.ticket_code)}&margin=10`}
                      alt="QR Billet" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">Billet d'Accès Officiel</div>
                    <div className="text-[11px] font-mono text-amber-400 font-semibold truncate">{selectedAttendee.ticket_code}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {selectedAttendee.status === 'attended' 
                        ? `✓ Émargé le ${selectedAttendee.checked_in_at ? new Date(selectedAttendee.checked_in_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''} (${selectedAttendee.checked_in_by || 'Accueil'})` 
                        : "Non émargé"}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const evTitle = eventsList?.find(e => e.id === selectedAttendee.event_id)?.title || 'Evenement_MDIV';
                    const qrUrl = selectedAttendee.badge_url || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(selectedAttendee.ticket_code)}&margin=10`;
                    downloadQrCode(qrUrl, evTitle, `${selectedAttendee.first_name}_${selectedAttendee.last_name}`);
                    toast.success("QR Code téléchargé avec succès !");
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-xl px-3 py-1.5 h-8 gap-1.5 shrink-0 shadow cursor-pointer"
                >
                  <Download size={13} /> Télécharger QR
                </Button>
              </div>

              {/* Réponses aux questions personnalisées avec vrais intitulés */}
              <div className="space-y-2.5 w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <FileText className="text-amber-400" size={14} />
                    <span>Réponses au formulaire d'inscription :</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {selectedAttendee.custom_answers_details?.length || Object.keys(selectedAttendee.custom_answers || {}).length || 0} question(s)
                  </span>
                </div>

                {selectedAttendee.custom_answers_details && selectedAttendee.custom_answers_details.length > 0 ? (
                  <div className="bg-card/70 border border-border/70 rounded-2xl p-4 space-y-3.5 divide-y divide-border/40">
                    {selectedAttendee.custom_answers_details.map((item, idx) => (
                      <div key={item.field_key || idx} className={idx > 0 ? "pt-3" : ""}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-foreground leading-snug">
                            {item.label}
                          </span>
                          {item.field_type && (
                            <span className="text-[9.5px] uppercase tracking-wider font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                              {item.field_type}
                            </span>
                          )}
                        </div>

                        {/* Rendu dynamique de la réponse */}
                        {Array.isArray(item.value) ? (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.value.map((opt: any, oIdx: number) => (
                              <Badge key={oIdx} className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-[10.5px] font-medium">
                                {String(opt)}
                              </Badge>
                            ))}
                          </div>
                        ) : typeof item.value === 'boolean' ? (
                          <span className="text-xs font-semibold text-amber-300">
                            {item.value ? "✓ Oui" : "✗ Non"}
                          </span>
                        ) : typeof item.value === 'string' && item.value.length > 80 ? (
                          <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/40 leading-relaxed italic mt-1 break-words">
                            « {item.value} »
                          </p>
                        ) : (
                          <span className="text-xs font-medium text-amber-200/95 bg-muted/20 px-2.5 py-1 rounded-lg inline-block mt-0.5 break-words">
                            {item.value !== null && item.value !== undefined && String(item.value).trim() !== "" 
                              ? String(item.value) 
                              : <span className="text-muted-foreground italic">Non renseigné</span>}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : selectedAttendee.custom_answers && Object.keys(selectedAttendee.custom_answers).length > 0 ? (
                  <div className="bg-card/70 border border-border/70 rounded-2xl p-4 space-y-3 divide-y divide-border/40">
                    {Object.entries(selectedAttendee.custom_answers).map(([key, value], idx) => {
                      const matchedField = (customFields || []).find((f: any) => f.field_key === key);
                      const displayLabel = matchedField?.label || key.replace(/_/g, ' ');
                      return (
                        <div key={key} className={idx > 0 ? "pt-2.5" : ""}>
                          <div className="text-xs font-semibold text-foreground mb-0.5">
                            {displayLabel}
                          </div>
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {value.map((v: any, vIdx: number) => (
                                <Badge key={vIdx} className="bg-amber-500/15 text-amber-300 text-[10px]">
                                  {String(v)}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-200/90 font-medium break-words">
                              {String(value)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-muted/20 rounded-xl text-xs text-muted-foreground italic text-center">
                    Aucune question personnalisée pour cette inscription.
                  </div>
                )}
              </div>

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

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (window.confirm(`Confirmez-vous la suppression définitive de l'inscription de ${selectedAttendee.first_name} ${selectedAttendee.last_name} ?`)) {
                      deleteAttendeeMutation.mutate(selectedAttendee.id);
                    }
                  }}
                  disabled={deleteAttendeeMutation.isPending}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-xs rounded-xl"
                >
                  <Trash2 size={13} className="mr-1.5" /> Supprimer l'inscription
                </Button>
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

      {/* Modale Scanner Caméra Accueil Sandra */}
      <EventCameraCheckInModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSuccessCheckIn={() => refetch()}
      />

      {/* Modale Borne d'Entrée & Kakemono */}
      <EventAccessPortalModal
        isOpen={isAccessPortalModalOpen}
        onClose={() => setIsAccessPortalModalOpen(false)}
        event={
          eventsList?.find(e => e.id === selectedEventId) || 
          eventsList?.[0] || 
          { id: selectedEventId || 1, title: "Événement MDIV" }
        }
      />
    </div>
  );
}

