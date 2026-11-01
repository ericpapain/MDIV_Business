import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Video, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminVideos() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=videos");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    },
  });

  // Combiner les événements et séjours
  const allEvents = [...(eventsData?.upcoming || []), ...(eventsData?.past || [])];

  const addVideo = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api-admin.php?action=add_video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, category }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Vidéo ajoutée avec succès" });
      setTitle("");
      setUrl("");
      setCategory("general");
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vidéo supprimée" });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    }
  });

  const getEventName = (catId: string) => {
    if (catId === "general") return "Général";
    const ev = allEvents.find(e => e.id.toString() === catId);
    return ev ? `${ev.type} : ${ev.title}` : "Inconnu";
  };

  return (
    <div className="">
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Vidéos</div>
        <h1 className="font-display text-4xl">Gestion des vidéos YouTube</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="luxe-card p-6 rounded-sm sticky top-8">
            <h2 className="font-display text-xl mb-4">Ajouter une vidéo</h2>
            <form onSubmit={(e) => { e.preventDefault(); addVideo.mutate(); }} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Titre de la vidéo</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Ex: Aftermovie Fondateur 2026" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Lien YouTube</label>
                <input required value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://www.youtube.com/watch?v=..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Associer à</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm outline-none">
                  <option value="general">Général (non associé)</option>
                  {allEvents.map(ev => (
                    <option key={ev.id} value={ev.id.toString()}>{ev.type} : {ev.title}</option>
                  ))}
                </select>
              </div>
              <button disabled={addVideo.isPending} className="w-full py-2.5 bg-gold text-background rounded-sm text-sm uppercase tracking-wider font-medium flex items-center justify-center gap-2 hover:bg-gold-light transition-colors">
                {addVideo.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Ajouter à la playlist
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl mb-4">Vidéos en ligne ({videos?.length || 0})</h2>
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gold" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {videos?.map((v: any) => (
                <div key={v.id} className="luxe-card rounded-sm overflow-hidden group">
                  <div className="aspect-video relative bg-muted">
                    <img src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Video className="text-white w-10 h-10" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h3 className="font-medium text-sm line-clamp-1">{v.title}</h3>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar size={12} /> {getEventName(v.category)}
                      </div>
                    </div>
                    <button onClick={() => { if(confirm("Supprimer cette vidéo ?")) deleteVideo.mutate(v.id); }} className="text-muted-foreground hover:text-destructive p-1 transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {videos?.length === 0 && <div className="col-span-2 text-center p-10 text-muted-foreground border border-dashed border-border rounded-sm">Aucune vidéo en ligne.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
