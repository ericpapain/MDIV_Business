import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, MapPin, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminEvents() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

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
    setTitle(""); setDate(""); setLocation(""); setDescription(""); setImageUrl(""); setEditingId(null);
  };

  const submitEvent = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_event" : "add_event";
      const payload = { id: editingId, title, date, location, description, type: "Événement", image_url: imageUrl };
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
      toast({ title: editingId ? "Événement modifié" : "Événement créé" });
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
    }
  });

  const startEdit = (ev: any) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    
    // Format the datetime-local value (YYYY-MM-DDThh:mm)
    const dateObj = new Date(ev.date);
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0,16);
    setDate(localISOTime);
    
    setLocation(ev.location);
    setDescription(ev.description);
    setImageUrl(ev.image_url || "");
  };

  return (
    <div className="p-8 md:p-10">
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Événements</div>
        <h1 className="font-display text-4xl">Gestion des Événements</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="luxe-card p-6 rounded-sm sticky top-8">
            <h2 className="font-display text-xl mb-4">{editingId ? "Modifier un Événement" : "Créer un Événement"}</h2>
            <form onSubmit={(e) => { e.preventDefault(); submitEvent.mutate(); }} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Titre</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Date & Heure</label>
                <input required value={date} onChange={e => setDate(e.target.value)} type="datetime-local" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lieu (Ville, Pays ou Adresse)</label>
                <input required value={location} onChange={e => setLocation(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lien de l'image (Optionnel)</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} type="text" placeholder="/assets/image.jpg ou https://..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm resize-none" />
              </div>
              
              <div className="flex gap-2">
                <button type="submit" disabled={submitEvent.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                  {submitEvent.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Créer</>}
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
                <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Calendar className="text-gold" size={20} /> À venir</h2>
                <div className="space-y-3">
                  {upcomingEvents.map((ev: any) => (
                    <EventCard key={ev.id} ev={ev} onEdit={() => startEdit(ev)} onDelete={() => { if(confirm("Supprimer ?")) deleteEvent.mutate(ev.id); }} />
                  ))}
                  {upcomingEvents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun événement à venir.</p>}
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h2 className="font-display text-xl mb-4 flex items-center gap-2 text-muted-foreground"><Calendar size={20} /> Passés</h2>
                <div className="space-y-3 opacity-70">
                  {pastEvents.map((ev: any) => (
                    <EventCard key={ev.id} ev={ev} onEdit={() => startEdit(ev)} onDelete={() => { if(confirm("Supprimer ?")) deleteEvent.mutate(ev.id); }} />
                  ))}
                  {pastEvents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun événement passé.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev, onEdit, onDelete }: { ev: any, onEdit: () => void, onDelete: () => void }) {
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
