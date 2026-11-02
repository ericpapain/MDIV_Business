import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Trash2, Calendar, MapPin, Loader2, Edit, Clock, 
  ChevronDown, ChevronUp, Check, X, Sliders, Layers, Users, 
  ExternalLink, Copy, CheckCircle2, Sparkles, Settings2, FileText,
  Megaphone, CalendarCheck, Gift, Radio, Tv, Archive
} from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { EventFeaturesTab } from "@/components/admin/events/EventFeaturesTab";
import { CustomFieldsBuilder } from "@/components/admin/events/CustomFieldsBuilder";
import { EventAttendeesView } from "@/components/admin/events/EventAttendeesView";
import { EventPitchesAdminTab } from "@/components/admin/events/EventPitchesAdminTab";
import { EventMeetingsAdminTab } from "@/components/admin/events/EventMeetingsAdminTab";
import { EventTombolaAdminTab } from "@/components/admin/events/EventTombolaAdminTab";
import { EventRegieControlTab } from "@/components/admin/events/EventRegieControlTab";
import { EventFeaturesConfig } from "@/types/eventEngine";
import { defaultEventFeatures } from "@/lib/eventFeatureCatalog";

interface ProgramSlot {
  time: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon: string;
}

interface ProgramDay {
  day_label: string;
  day_label_en: string;
  slots: ProgramSlot[];
}

const ICON_OPTIONS = [
  { value: "coffee", label: "☕ Café / Accueil" },
  { value: "mic", label: "🎤 Keynote / Conférence" },
  { value: "network", label: "🤝 Networking" },
  { value: "dinner", label: "🍽️ Repas / Dîner" },
  { value: "transport", label: "✈️ Transport" },
  { value: "workshop", label: "💼 Workshop / Atelier" },
  { value: "party", label: "🎉 Soirée" },
  { value: "star", label: "⭐ Spécial" },
  { value: "default", label: "🕐 Général" },
];

export default function AdminEvents() {
  // Formulaire classique
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [billetterieUrl, setBilletterieUrl] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [program, setProgram] = useState<ProgramDay[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showProgram, setShowProgram] = useState(false);
  const [showInSlider, setShowInSlider] = useState(false);
  const [featuresConfig, setFeaturesConfig] = useState<EventFeaturesConfig>(defaultEventFeatures);
  const [formTab, setFormTab] = useState<"infos" | "features">("infos");

  // Modal / Panneau MDIV EVENT ENGINE
  const [selectedEngineEvent, setSelectedEngineEvent] = useState<any | null>(null);
  const [engineTab, setEngineTab] = useState<"features" | "fields" | "attendees" | "pitches" | "meetings" | "tombola" | "regie" | "links">("features");
  const [copiedLink, setCopiedLink] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    },
  });

  // Filtrer uniquement les événements (pas les séjours)
  const upcomingEvents = data?.upcoming?.filter((e: any) => e.type === "Événement") || [];
  const pastEvents = data?.past?.filter((e: any) => e.type === "Événement") || [];

  const resetForm = () => {
    setTitle(""); setTitleEn(""); setDate(""); setLocation(""); setDescription(""); setDescriptionEn("");
    setImageUrl(""); setPrice(""); setBilletterieUrl(""); setEventCode(""); setProgram([]); setEditingId(null); setShowProgram(false);
    setShowInSlider(false);
    setFeaturesConfig(defaultEventFeatures);
    setFormTab("infos");
  };

  const submitEvent = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_event" : "add_event";
      const payload = {
        id: editingId, 
        title, 
        title_en: titleEn, 
        date, 
        location, 
        description, 
        description_en: descriptionEn,
        type: "Événement", 
        image_url: imageUrl, 
        price, 
        billetterie_url: billetterieUrl, 
        event_code: eventCode,
        program: program.length > 0 ? program : null,
        features_config: featuresConfig,
      };
      const res = await fetch(`/api-admin.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: async () => {
      if (showInSlider) {
        try {
          await fetch("/api-admin.php?action=save_hero_news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              comment: description,
              image_url: imageUrl,
              tag: "Événement",
              link_url: "/evenements",
            }),
          });
          queryClient.invalidateQueries({ queryKey: ["hero-news"] });
        } catch (e) {
          console.error("Slider sync failed:", e);
        }
      }
      toast({ 
        title: editingId ? "Événement modifié" : "Événement créé",
        description: "Les informations et fonctionnalités du moteur événementiel ont été enregistrées."
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Événement supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      if (selectedEngineEvent?.id) setSelectedEngineEvent(null);
    }
  });

  const duplicateEvent = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/event_engine.php?action=duplicate_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, event_id: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Événement dupliqué", description: "Une copie complète avec configuration et champs sur-mesure a été créée." });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const archiveEvent = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/event_engine.php?action=archive_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, event_id: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Statut mis à jour", description: "L'événement a été basculé entre actif et archivé." });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const saveFeaturesMutation = useMutation({
    mutationFn: async ({ eventId, config }: { eventId: number; config: EventFeaturesConfig }) => {
      const res = await fetch("/api/event_engine.php?action=save_features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, features_config: config }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Succès", description: "Fonctionnalités de l'événement sauvegardées avec succès." });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const startEdit = (ev: any) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setTitleEn(ev.title_en || "");
    const dateObj = new Date(ev.date);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0,16);
    setDate(localISOTime);
    setLocation(ev.location);
    setDescription(ev.description);
    setDescriptionEn(ev.description_en || "");
    setImageUrl(ev.image_url || "");
    setPrice(ev.price || "");
    setBilletterieUrl(ev.billetterie_url || "");
    setEventCode(ev.event_code || "");
    const prog = typeof ev.program === 'string' ? JSON.parse(ev.program) : ev.program;
    setProgram(prog || []);
    setShowProgram(!!(prog && prog.length > 0));
    
    const parsedFeatures = typeof ev.features_config === 'string' ? JSON.parse(ev.features_config) : (ev.features_config || defaultEventFeatures);
    setFeaturesConfig(parsedFeatures);
    setFormTab("infos");
  };

  const openEngineModal = (ev: any, defaultTab: "features" | "fields" | "attendees" | "pitches" | "meetings" | "tombola" | "regie" | "links" = "features") => {
    setSelectedEngineEvent(ev);
    setEngineTab(defaultTab);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast({ title: "Lien copié", description: "Le lien public d'inscription a été copié dans le presse-papiers." });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // --- Programme helpers ---
  const addDay = () => {
    setProgram([...program, { day_label: `Jour ${program.length + 1}`, day_label_en: `Day ${program.length + 1}`, slots: [] }]);
  };
  const removeDay = (idx: number) => {
    setProgram(program.filter((_, i) => i !== idx));
  };
  const updateDayLabel = (idx: number, key: "day_label" | "day_label_en", value: string) => {
    const updated = [...program];
    updated[idx] = { ...updated[idx], [key]: value };
    setProgram(updated);
  };
  const addSlot = (dayIdx: number) => {
    const updated = [...program];
    updated[dayIdx].slots.push({ time: "", title: "", title_en: "", description: "", description_en: "", icon: "default" });
    setProgram(updated);
  };
  const removeSlot = (dayIdx: number, slotIdx: number) => {
    const updated = [...program];
    updated[dayIdx].slots = updated[dayIdx].slots.filter((_, i) => i !== slotIdx);
    setProgram(updated);
  };
  const updateSlot = (dayIdx: number, slotIdx: number, key: keyof ProgramSlot, value: string) => {
    const updated = [...program];
    updated[dayIdx].slots[slotIdx] = { ...updated[dayIdx].slots[slotIdx], [key]: value };
    setProgram(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <span>CMS Événements</span>
            <span className="text-gold">•</span>
            <span className="text-gold font-mono text-xs">MDIV EVENT ENGINE</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Gestion des Événements & Inscriptions</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Formulaire de création / modification */}
        <div className="lg:col-span-1">
          <div className="luxe-card p-6 rounded-sm sticky top-8 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="font-display text-xl">{editingId ? "Modifier l'Événement" : "Créer un Événement"}</h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X size={12} /> Annuler
                </button>
              )}
            </div>

            {editingId && (
              <div className="p-3 bg-gold/10 border border-gold/30 rounded-sm space-y-1.5 animate-in fade-in">
                <div className="text-[11px] font-bold text-gold flex items-center justify-between">
                  <span>Outils Événementiels Avancés :</span>
                  <button
                    type="button"
                    onClick={() => {
                      const ev = (data?.upcoming || []).concat(data?.past || []).find((e: any) => e.id === editingId);
                      if (ev) openEngineModal(ev, "features");
                    }}
                    className="px-2 py-0.5 bg-gold text-black rounded text-[10px] font-semibold uppercase hover:bg-gold/90 cursor-pointer shadow-sm"
                  >
                    Ouvrir Moteur ➔
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Tombola, Rendez-vous B2B, Pitchs, Inscrits CRM, Champs personnalisés & Régie LIVE.
                </p>
              </div>
            )}

            {/* Onglets internes du formulaire : Infos Générales vs Fonctionnalités de base */}
            <div className="flex border border-border/40 rounded-sm p-1 bg-muted/20">
              <button
                type="button"
                onClick={() => setFormTab("infos")}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all ${
                  formTab === "infos" ? "bg-gold text-black shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Infos
              </button>
              <button
                type="button"
                onClick={() => setFormTab("features")}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5 ${
                  formTab === "features" ? "bg-gold text-black shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers size={13} />
                2. Modules ({Object.values(featuresConfig || {}).filter((f: any) => f?.enabled).length})
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitEvent.mutate(); }} className="space-y-4">
              {formTab === "infos" ? (
                <>
                  {/* Titre FR */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Titre (FR)</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
                  </div>
                  {/* Titre EN */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Titre (EN) <span className="text-gold/50">optionnel</span></label>
                    <input value={titleEn} onChange={e => setTitleEn(e.target.value)} type="text" placeholder="English title..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
                  </div>
                  {/* Date */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Date & Heure</label>
                    <input required value={date} onChange={e => setDate(e.target.value)} type="datetime-local" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
                  </div>
                  {/* Lieu */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Lieu (Ville, Pays ou Adresse)</label>
                    <input required value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
                  </div>
                  {/* Image */}
                  <ImageUpload value={imageUrl} onChange={setImageUrl} label="Image de l'événement" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Prix (ex: 2990€)" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" value={price} onChange={e => setPrice(e.target.value)} />
                    <input type="text" placeholder="Code Événement (ex: BN26)" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" value={eventCode} onChange={e => setEventCode(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <input type="text" placeholder="URL billetterie externe (optionnel)" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" value={billetterieUrl} onChange={e => setBilletterieUrl(e.target.value)} />
                  </div>

                  {/* Description FR */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Description (FR)</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-sm resize-y min-h-[80px]" />
                  </div>
                  {/* Description EN */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Description (EN) <span className="text-gold/50">optionnel</span></label>
                    <textarea value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} placeholder="English description..." className="w-full px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-sm resize-y min-h-[80px]" />
                  </div>

                  {/* Slider Toggle */}
                  <div className="p-3.5 rounded-sm border border-gold/40 bg-gold/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sliders size={15} className="text-gold" />
                      <span className="text-xs uppercase tracking-wider font-bold text-foreground">
                        Afficher dans le slider d'accueil ?
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Si OUI, cet événement défilera avec son image et ses infos dans le carrousel principal de la page d'accueil.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowInSlider(true)}
                        className={`px-3.5 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                          showInSlider 
                            ? "bg-gold text-black shadow-md shadow-gold/20" 
                            : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                        }`}
                      >
                        <Check size={13} /> Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInSlider(false)}
                        className={`px-3.5 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                          !showInSlider 
                            ? "bg-white/10 text-white border border-white/20" 
                            : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                        }`}
                      >
                        <X size={13} /> Non
                      </button>
                    </div>
                  </div>

                  {/* Programme Section */}
                  <div className="border-t border-border/30 pt-4">
                    <button type="button" onClick={() => setShowProgram(!showProgram)} className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-gold transition-colors">
                      <span className="flex items-center gap-2"><Clock size={14} className="text-gold" /> Programme de l'événement</span>
                      {showProgram ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showProgram && (
                      <div className="mt-4 space-y-4">
                        {program.map((day, dayIdx) => (
                          <div key={dayIdx} className="border border-border/30 rounded-sm p-3 bg-muted/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <input value={day.day_label} onChange={e => updateDayLabel(dayIdx, "day_label", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-xs" placeholder="Jour 1 - Arrivée" />
                                <input value={day.day_label_en} onChange={e => updateDayLabel(dayIdx, "day_label_en", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-xs" placeholder="Day 1 - Arrival" />
                              </div>
                              <button type="button" onClick={() => removeDay(dayIdx)} className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {day.slots.map((slot, slotIdx) => (
                              <div key={slotIdx} className="ml-2 mb-3 pl-3 border-l-2 border-gold/20 space-y-1.5">
                                <div className="flex gap-2 items-center">
                                  <input value={slot.time} onChange={e => updateSlot(dayIdx, slotIdx, "time", e.target.value)} className="w-24 px-2 py-1 bg-muted/30 border border-border rounded-sm text-[11px]" placeholder="09:00-10:30" />
                                  <select value={slot.icon} onChange={e => updateSlot(dayIdx, slotIdx, "icon", e.target.value)} className="px-1 py-1 bg-muted/30 border border-border rounded-sm text-[11px] w-auto">
                                    {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                  <button type="button" onClick={() => removeSlot(dayIdx, slotIdx)} className="ml-auto p-1 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input value={slot.title} onChange={e => updateSlot(dayIdx, slotIdx, "title", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-[11px]" placeholder="Titre FR" />
                                  <input value={slot.title_en} onChange={e => updateSlot(dayIdx, slotIdx, "title_en", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-[11px]" placeholder="Title EN" />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input value={slot.description} onChange={e => updateSlot(dayIdx, slotIdx, "description", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-[11px]" placeholder="Description FR" />
                                  <input value={slot.description_en} onChange={e => updateSlot(dayIdx, slotIdx, "description_en", e.target.value)} className="px-2 py-1 bg-muted/30 border border-border rounded-sm text-[11px]" placeholder="Description EN" />
                                </div>
                              </div>
                            ))}

                            <button type="button" onClick={() => addSlot(dayIdx)} className="text-[10px] uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors flex items-center gap-1 ml-2 mt-1">
                              <Plus size={10} /> Ajouter un créneau
                            </button>
                          </div>
                        ))}

                        <button type="button" onClick={addDay} className="w-full py-2 border border-dashed border-gold/30 rounded-sm text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold/5 transition-colors flex items-center justify-center gap-2">
                          <Plus size={12} /> Ajouter une journée
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Aperçu rapide des modules activés */
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Activez les briques événementielles qui seront instanciées lors de l'enregistrement de cet événement.
                  </p>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {Object.entries(featuresConfig).map(([key, f]: [string, any]) => (
                      <label key={key} className="flex items-center justify-between p-2.5 rounded-sm bg-muted/20 border border-border/40 hover:border-gold/30 cursor-pointer">
                        <span className="text-xs font-mono font-medium text-foreground">{key}</span>
                        <input
                          type="checkbox"
                          checked={f?.enabled ?? false}
                          onChange={(e) => {
                            setFeaturesConfig({
                              ...featuresConfig,
                              [key]: { ...f, enabled: e.target.checked }
                            });
                          }}
                          className="accent-gold h-4 w-4 rounded cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitEvent.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2 hover:bg-gold/90 transition-all cursor-pointer">
                  {submitEvent.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Créer l'événement</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Colonne droite : Liste des événements & actions Moteur Événementiel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gold" /></div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl flex items-center gap-2 text-foreground">
                    <Calendar className="text-gold" size={20} /> Événements à venir
                  </h2>
                  <span className="text-xs px-2.5 py-1 bg-gold/10 text-gold rounded-full font-mono">
                    {upcomingEvents.length} actif{upcomingEvents.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((ev: any) => (
                    <EnhancedEventCard 
                      key={ev.id} 
                      ev={ev} 
                      onEdit={() => startEdit(ev)} 
                      onDuplicate={() => duplicateEvent.mutate(ev.id)}
                      onArchive={() => archiveEvent.mutate(ev.id)}
                      onDelete={() => { if(confirm("Supprimer cet événement ?")) deleteEvent.mutate(ev.id); }}
                      onOpenEngine={(tab) => openEngineModal(ev, tab)}
                    />
                  ))}
                  {upcomingEvents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun événement à venir.</p>}
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h2 className="font-display text-xl mb-4 flex items-center gap-2 text-muted-foreground"><Calendar size={20} /> Événements passés</h2>
                <div className="space-y-3 opacity-80">
                  {pastEvents.map((ev: any) => (
                    <EnhancedEventCard 
                      key={ev.id} 
                      ev={ev} 
                      onEdit={() => startEdit(ev)} 
                      onDuplicate={() => duplicateEvent.mutate(ev.id)}
                      onArchive={() => archiveEvent.mutate(ev.id)}
                      onDelete={() => { if(confirm("Supprimer cet événement ?")) deleteEvent.mutate(ev.id); }}
                      onOpenEngine={(tab) => openEngineModal(ev, tab)}
                    />
                  ))}
                  {pastEvents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun événement passé.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL / DRAWER PLEIN ÉCRAN MDIV EVENT ENGINE */}
      {selectedEngineEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-background border border-gold/30 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header & Navigation Tabs intégrés dans le même conteneur (shrink-0, toujours visible et solidaire) */}
            <div className="border-b border-border/40 bg-muted/20 shrink-0">
              <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-gold/15 text-gold text-[10px] font-mono rounded tracking-wider uppercase">MDIV EVENT ENGINE</span>
                    <span className="text-xs text-muted-foreground font-mono">ID #{selectedEngineEvent.id}</span>
                  </div>
                  <h2 className="font-display text-2xl text-foreground flex items-center gap-3">
                    {selectedEngineEvent.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar size={13} className="text-gold" /> {new Date(selectedEngineEvent.date).toLocaleDateString()} à {new Date(selectedEngineEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} className="text-gold" /> {selectedEngineEvent.location}</span>
                  </div>
                </div>

                {/* Action Buttons & Close */}
                <div className="flex items-center gap-2">
                  <a
                    href={`/evenements/${selectedEngineEvent.id}/inscription`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-sm bg-muted/40 hover:bg-gold/10 text-muted-foreground hover:text-gold border border-border/60 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} /> Page publique
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedEngineEvent(null)}
                    className="p-2 rounded-sm bg-muted/40 hover:bg-destructive/15 text-muted-foreground hover:text-destructive border border-border/60 transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs (Directement dans le même div parent pour ne jamais être masqué) */}
              <div className="flex border-t border-border/30 bg-muted/10 px-6 gap-2 overflow-x-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setEngineTab("features")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "features"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <Layers size={14} /> 1. Catalogue
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("fields")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "fields"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <FileText size={14} /> 2. Champs & Questions
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("attendees")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "attendees"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <Users size={14} /> 3. Inscrits & CRM
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("pitches")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "pitches"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <Megaphone size={14} /> 4. Pitchs Entreprises
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("meetings")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "meetings"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <CalendarCheck size={14} /> 5. Rendez-vous B2B
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("tombola")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "tombola"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <Gift size={14} /> 6. Tombola
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("regie")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "regie"
                      ? "border-rose-500 text-rose-400 bg-rose-500/15 font-bold"
                      : "border-transparent text-muted-foreground hover:text-rose-400 hover:border-rose-500/30"
                  }`}
                >
                  <Radio size={14} className="text-rose-500 animate-pulse" /> 7. Régie LIVE (1080p)
                </button>
                <button
                  type="button"
                  onClick={() => setEngineTab("links")}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    engineTab === "links"
                      ? "border-gold text-gold bg-gold/10 font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-gold/30"
                  }`}
                >
                  <Sparkles size={14} /> 8. Diffusion & Liens
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {engineTab === "features" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Catalogue dynamique des fonctionnalités</h3>
                      <p className="text-xs text-muted-foreground">Activez ou désactivez les fonctionnalités et ajustez leurs réglages fins en temps réel.</p>
                    </div>
                  </div>
                  <EventFeaturesTab
                    eventId={selectedEngineEvent.id}
                    config={selectedEngineEvent.features_config || defaultEventFeatures}
                    onChange={(newConfig) => {
                      setSelectedEngineEvent({ ...selectedEngineEvent, features_config: newConfig });
                      saveFeaturesMutation.mutate({ eventId: selectedEngineEvent.id, config: newConfig });
                    }}
                  />
                </div>
              )}

              {engineTab === "fields" && (
                <div className="space-y-4">
                  <CustomFieldsBuilder eventId={selectedEngineEvent.id} />
                </div>
              )}

              {engineTab === "attendees" && (
                <div className="space-y-4">
                  <EventAttendeesView 
                    eventId={selectedEngineEvent.id} 
                    eventTitle={selectedEngineEvent.title} 
                  />
                </div>
              )}

              {engineTab === "pitches" && (
                <div className="space-y-4">
                  <EventPitchesAdminTab eventId={selectedEngineEvent.id} />
                </div>
              )}

              {engineTab === "meetings" && (
                <div className="space-y-4">
                  <EventMeetingsAdminTab eventId={selectedEngineEvent.id} />
                </div>
              )}

              {engineTab === "tombola" && (
                <div className="space-y-4">
                  <EventTombolaAdminTab eventId={selectedEngineEvent.id} />
                </div>
              )}

              {engineTab === "regie" && (
                <div className="space-y-4">
                  <EventRegieControlTab eventId={selectedEngineEvent.id} />
                </div>
              )}

              {engineTab === "links" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="p-5 rounded-md bg-muted/20 border border-border/40 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ExternalLink size={16} className="text-gold" /> Liens d'accès direct aux modules publics
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Diffusez ces liens pour donner un accès direct à vos participants, conférenciers et partenaires.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-300">1. Hub Événement & Inscription complète :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-300">2. Candidatures Pitchs Entreprises :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=pitches`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=pitches`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-300">3. Réservations Rendez-vous B2B :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=meetings`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=meetings`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-300">4. Tombola & Animation du Tirage :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=tombola`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=tombola`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-300">5. Networking Wall (Mur des Décideurs) :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=networking`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}?tab=networking`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-amber-300">6. Écran de Scène LIVE (1920×1080 Full HD) :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/evenements/${selectedEngineEvent.id}/live`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/evenements/${selectedEngineEvent.id}/live`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                          <a
                            href={`/evenements/${selectedEngineEvent.id}/live`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-sm flex items-center gap-1 hover:bg-amber-400"
                          >
                            Ouvrir
                          </a>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-rose-400">7. Pupitre de Régie Événementielle (Privé Admin) :</span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            readOnly
                            value={`${window.location.origin}/admin/events/${selectedEngineEvent.id}/regie`}
                            className="flex-1 px-3 py-1.5 bg-black/40 border border-border/60 rounded-sm text-xs font-mono text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`${window.location.origin}/admin/events/${selectedEngineEvent.id}/regie`)}
                            className="px-3 py-1.5 bg-gold text-black text-xs font-medium uppercase tracking-wider rounded-sm flex items-center gap-1 hover:bg-gold/90 transition-all cursor-pointer"
                          >
                            Copier
                          </button>
                          <a
                            href={`/admin/events/${selectedEngineEvent.id}/regie`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-sm flex items-center gap-1 hover:bg-rose-500"
                          >
                            Régie
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-md bg-muted/20 border border-border/40 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles size={16} className="text-gold" /> Intégration sur la page Événements du site
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Cet événement est automatiquement synchronisé sur la page publique <code className="text-gold">/evenements</code>. Le bouton <strong>"Réserver une place"</strong> déclenche la modal d'inscription modulaire avec upload de photo et synchronisation CRM temps réel.
                    </p>
                    <a
                      href="/evenements"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-gold hover:underline pt-1"
                    >
                      Consulter le catalogue public des événements &rarr;
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function EnhancedEventCard({ 
  ev, 
  onEdit, 
  onDuplicate,
  onArchive,
  onDelete, 
  onOpenEngine 
}: { 
  ev: any; 
  onEdit: () => void; 
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void; 
  onOpenEngine: (tab?: "features" | "fields" | "attendees" | "pitches" | "meetings" | "tombola" | "regie" | "links") => void; 
}) {
  const prog = typeof ev.program === 'string' ? JSON.parse(ev.program) : ev.program;
  const hasProgram = prog && prog.length > 0;
  const features = typeof ev.features_config === 'string' ? JSON.parse(ev.features_config) : (ev.features_config || {});
  const activeFeaturesCount = Object.values(features).filter((f: any) => f?.enabled).length;
  const attendeesCount = ev.attendees_count || 0;

  return (
    <div className="luxe-card p-4 rounded-sm flex flex-col md:flex-row gap-4 md:items-center group border border-border/40 hover:border-gold/30 transition-all">
      {ev.image_url ? (
        <img src={ev.image_url} alt={ev.title} className="w-16 h-16 object-cover rounded-sm border border-border shrink-0" />
      ) : (
        <div className="w-16 h-16 bg-muted/50 rounded-sm flex flex-col items-center justify-center border border-border shrink-0">
          <span className="text-xs uppercase text-gold">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
          <span className="font-display text-xl">{new Date(ev.date).getDate()}</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="px-1.5 py-0.5 bg-muted rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground">{ev.type}</span>
          {ev.price && <span className="px-1.5 py-0.5 bg-gold/10 rounded-sm text-[10px] uppercase tracking-wider text-gold">{ev.price}</span>}
          {hasProgram && <span className="px-1.5 py-0.5 bg-green-500/10 rounded-sm text-[10px] uppercase tracking-wider text-green-400">Programme ✓</span>}
          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-sm text-[10px] uppercase tracking-wider font-mono">
            {activeFeaturesCount} module{activeFeaturesCount > 1 ? "s" : ""}
          </span>
          <h3 className="font-medium text-base truncate">{ev.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin size={12} /> {ev.location}</span>
          <span>{new Date(ev.date).toLocaleDateString()} {new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Boutons d'accès direct au Moteur Événementiel */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
        <button
          type="button"
          onClick={() => onOpenEngine("attendees")}
          className="px-2 py-1.5 rounded-sm bg-muted/40 hover:bg-gold/15 text-muted-foreground hover:text-gold border border-border/60 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Consulter les inscrits CRM"
        >
          <Users size={12} className="text-gold" />
          <span className="font-mono font-medium">{attendeesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenEngine("tombola")}
          className="px-2 py-1.5 rounded-sm bg-muted/40 hover:bg-gold/15 text-muted-foreground hover:text-gold border border-border/60 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Gérer la Tombola & Tirages"
        >
          <Gift size={12} className="text-amber-400" />
          <span className="hidden lg:inline text-[11px]">Tombola</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenEngine("meetings")}
          className="px-2 py-1.5 rounded-sm bg-muted/40 hover:bg-gold/15 text-muted-foreground hover:text-gold border border-border/60 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Gérer les Rendez-vous B2B Partenaires"
        >
          <CalendarCheck size={12} className="text-blue-400" />
          <span className="hidden lg:inline text-[11px]">B2B</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenEngine("regie")}
          className="px-2 py-1.5 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1 transition-colors cursor-pointer font-medium"
          title="Accéder au Pupitre Régie LIVE"
        >
          <Radio size={12} className="text-rose-400" />
          <span className="hidden lg:inline text-[11px]">Régie</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenEngine("features")}
          className="px-2.5 py-1.5 rounded-sm bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/40 text-xs flex items-center gap-1.5 transition-all cursor-pointer font-semibold shadow-sm"
          title="Ouvrir le Moteur Événementiel complet"
        >
          <Settings2 size={13} />
          <span>Moteur</span>
        </button>

        <a 
          href={`/evenements/${ev.id}`} 
          target="_blank" 
          rel="noreferrer"
          className="p-1.5 text-muted-foreground hover:text-gold transition-colors rounded-sm cursor-pointer ml-1"
          title="Voir la page publique de l'événement"
        >
          <ExternalLink size={15} />
        </a>

        <button 
          onClick={onEdit} 
          className="p-1.5 text-muted-foreground hover:text-gold transition-colors rounded-sm cursor-pointer"
          title="Modifier les infos de base"
        >
          <Edit size={15} />
        </button>

        <button 
          onClick={onDuplicate} 
          className="p-1.5 text-muted-foreground hover:text-amber-400 transition-colors rounded-sm cursor-pointer"
          title="Dupliquer l'événement (avec tous ses modules)"
        >
          <Copy size={15} />
        </button>

        <button 
          onClick={onArchive} 
          className="p-1.5 text-muted-foreground hover:text-amber-300 transition-colors rounded-sm cursor-pointer"
          title={ev.status === 'past' ? "Désarchiver (Repasser à venir)" : "Archiver l'événement"}
        >
          <Archive size={15} />
        </button>

        <button 
          onClick={onDelete} 
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors cursor-pointer"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
