import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Plane, MapPin, Loader2, Edit, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function AdminSejours() {
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [billetterieUrl, setBilletterieUrl] = useState("");
  const [program, setProgram] = useState<ProgramDay[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showProgram, setShowProgram] = useState(false);

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

  // Filtrer uniquement les séjours
  const upcomingSejours = data?.upcoming?.filter((e: any) => e.type === "Séjour") || [];
  const pastSejours = data?.past?.filter((e: any) => e.type === "Séjour") || [];

  const resetForm = () => {
    setTitle(""); setTitleEn(""); setDate(""); setLocation(""); setDescription(""); setDescriptionEn("");
    setImageUrl(""); setPrice(""); setBilletterieUrl(""); setProgram([]); setEditingId(null); setShowProgram(false);
  };

  const submitSejour = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_event" : "add_event";
      const payload = {
        id: editingId, title, title_en: titleEn, date, location, description, description_en: descriptionEn,
        type: "Séjour", image_url: imageUrl, price, billetterie_url: billetterieUrl,
        program: program.length > 0 ? program : null,
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
    onSuccess: () => {
      toast({ title: editingId ? "Séjour modifié" : "Séjour créé" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteSejour = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Séjour supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
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
    const prog = typeof ev.program === 'string' ? JSON.parse(ev.program) : ev.program;
    setProgram(prog || []);
    setShowProgram(!!(prog && prog.length > 0));
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
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Séjours</div>
        <h1 className="font-display text-4xl">Gestion des Séjours BNE</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="luxe-card p-6 rounded-sm sticky top-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl mb-4">{editingId ? "Modifier un Séjour" : "Créer un Séjour"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitSejour.mutate(); }} className="space-y-4">
              {/* Titre FR */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Titre (FR)</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Titre EN */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Titre (EN) <span className="text-gold/50">optionnel</span></label>
                <input value={titleEn} onChange={e => setTitleEn(e.target.value)} type="text" placeholder="English title..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Date */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Date & Heure</label>
                <input required value={date} onChange={e => setDate(e.target.value)} type="datetime-local" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Lieu */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lieu (Ville, Pays ou Adresse)</label>
                <input required value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Image */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lien de l'image (Optionnel)</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} type="text" placeholder="/assets/image.jpg ou https://..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Prix */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Prix <span className="text-gold/50">ex: 490€, Gratuit</span></label>
                <input value={price} onChange={e => setPrice(e.target.value)} type="text" placeholder="490€" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Billetterie */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lien Billetterie <span className="text-gold/50">optionnel</span></label>
                <input value={billetterieUrl} onChange={e => setBilletterieUrl(e.target.value)} type="text" placeholder="https://eventbrite.fr/..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              {/* Description FR */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Description (FR)</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm resize-none" />
              </div>
              {/* Description EN */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Description (EN) <span className="text-gold/50">optionnel</span></label>
                <textarea value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} rows={3} placeholder="English description..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm resize-none" />
              </div>

              {/* Programme Section */}
              <div className="border-t border-border/30 pt-4">
                <button type="button" onClick={() => setShowProgram(!showProgram)} className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-gold transition-colors">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-gold" /> Programme du séjour</span>
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
              
              <div className="flex gap-2">
                <button type="submit" disabled={submitSejour.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                  {submitSejour.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Créer</>}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 bg-muted border border-border text-foreground font-medium text-xs tracking-wide uppercase rounded-sm">
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gold" /></div>
          ) : (
            <>
              <div>
                <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Plane className="text-gold" size={20} /> À venir</h2>
                <div className="space-y-3">
                  {upcomingSejours.map((ev: any) => (
                    <SejourCard key={ev.id} ev={ev} onEdit={() => startEdit(ev)} onDelete={() => { if(confirm("Supprimer ?")) deleteSejour.mutate(ev.id); }} />
                  ))}
                  {upcomingSejours.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun séjour à venir.</p>}
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h2 className="font-display text-xl mb-4 flex items-center gap-2 text-muted-foreground"><Plane size={20} /> Passés</h2>
                <div className="space-y-3 opacity-70">
                  {pastSejours.map((ev: any) => (
                    <SejourCard key={ev.id} ev={ev} onEdit={() => startEdit(ev)} onDelete={() => { if(confirm("Supprimer ?")) deleteSejour.mutate(ev.id); }} />
                  ))}
                  {pastSejours.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun séjour passé.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SejourCard({ ev, onEdit, onDelete }: { ev: any, onEdit: () => void, onDelete: () => void }) {
  const prog = typeof ev.program === 'string' ? JSON.parse(ev.program) : ev.program;
  const hasProgram = prog && prog.length > 0;
  return (
    <div className="luxe-card p-4 rounded-sm flex gap-4 items-center group">
      {ev.image_url ? (
        <img src={ev.image_url} alt={ev.title} className="w-16 h-16 object-cover rounded-sm border border-border shrink-0" />
      ) : (
        <div className="w-16 h-16 bg-muted/50 rounded-sm flex flex-col items-center justify-center border border-border shrink-0">
          <span className="text-xs uppercase text-gold">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
          <span className="font-display text-xl">{new Date(ev.date).getDate()}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-1.5 py-0.5 bg-muted rounded-sm text-[10px] uppercase tracking-wider text-muted-foreground">{ev.type}</span>
          {ev.price && <span className="px-1.5 py-0.5 bg-gold/10 rounded-sm text-[10px] uppercase tracking-wider text-gold">{ev.price}</span>}
          {hasProgram && <span className="px-1.5 py-0.5 bg-green-500/10 rounded-sm text-[10px] uppercase tracking-wider text-green-400">Programme ✓</span>}
          <h3 className="font-medium text-base truncate">{ev.title}</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin size={12} /> {ev.location}</span>
          <span>{new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-gold transition-colors rounded-sm">
          <Edit size={16} />
        </button>
        <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
