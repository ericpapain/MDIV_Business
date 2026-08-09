import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Save, Loader2, Image as ImageIcon, Video, FileText, Quote, Users, Clock, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Highlight { time: string; title: string; description: string; image_url: string; }
interface VideoItem { youtube_id: string; title: string; description: string; }
interface Testimonial { name: string; role: string; quote: string; image_url: string; }

interface ReplayData {
  hero_video_url: string;
  stats: { participants: string; photos: string; videos: string; duration: string; };
  highlights: Highlight[];
  photos: string[];
  videos: VideoItem[];
  testimonials: Testimonial[];
  souvenirs: { quote: string; key_figures: string; };
}

const defaultReplayData: ReplayData = {
  hero_video_url: "",
  stats: { participants: "", photos: "", videos: "", duration: "" },
  highlights: [],
  photos: [],
  videos: [],
  testimonials: [],
  souvenirs: { quote: "", key_figures: "" }
};

export default function AdminReplays() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [formData, setFormData] = useState<ReplayData>(defaultReplayData);
  const [scanPath, setScanPath] = useState<string>("");

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    },
  });

  // Ne montrer que les événements/séjours passés
  const pastEvents = eventsData?.past || [];
  const selectedEvent = pastEvents.find((e: any) => e.id.toString() === selectedEventId);

  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.replay_data) {
        try {
          const parsed = JSON.parse(selectedEvent.replay_data);
          // Fusionner avec les valeurs par défaut pour éviter les undefined
          setFormData({
            ...defaultReplayData,
            ...parsed,
            stats: { ...defaultReplayData.stats, ...(parsed.stats || {}) },
            souvenirs: { ...defaultReplayData.souvenirs, ...(parsed.souvenirs || {}) }
          });
        } catch (e) {
          console.error("Erreur parsing replay_data", e);
          setFormData(defaultReplayData);
        }
      } else {
        setFormData(defaultReplayData);
      }
    }
  }, [selectedEventId, selectedEvent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEventId) throw new Error("Aucun événement sélectionné");
      const res = await fetch("/api-admin.php?action=save_replay_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEventId, replay_data: formData })
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      toast({ title: "Données de Replay sauvegardées avec succès !" });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^"&?\/\s]{11})/);
    return match ? match[1] : url; // Retourne l'URL si ce n'est pas un lien standard
  };

  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!scanPath) throw new Error("Veuillez indiquer un chemin de dossier");
      const res = await fetch("/api-admin.php?action=scan_directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: scanPath })
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.images;
    },
    onSuccess: (images: string[]) => {
      if (images.length === 0) {
        toast({ title: "Dossier scanné", description: "Aucune image trouvée dans ce dossier." });
        return;
      }
      toast({ title: "Images récupérées", description: `${images.length} images ajoutées avec succès.` });
      // Ajouter les nouvelles images sans écraser celles existantes (et enlever les entrées vides)
      const currentPhotos = formData.photos.filter(p => p.trim() !== "");
      setFormData({ ...formData, photos: [...currentPhotos, ...images] });
      setScanPath("");
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur de scan", description: err.message });
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="font-display text-3xl mb-2">Gestion des Replays</h1>
        <p className="text-muted-foreground">Enrichissez les pages "Revivre l'événement" avec des médias et statistiques.</p>
      </div>

      <div className="glass-strong p-6 rounded-sm border border-border">
        <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">Sélectionner un événement passé</label>
        <select 
          className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm focus:border-gold outline-none"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Choisir un événement --</option>
          {pastEvents.map((ev: any) => (
            <option key={ev.id} value={ev.id.toString()}>[{ev.type}] {ev.title} - {new Date(ev.date).toLocaleDateString()}</option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <div className="space-y-8 animate-fade-in">
          
          {/* HEADER & HERO */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Video size={20} /> Hero Section</h2>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2">URL de la vidéo de fond (MP4 ou lien direct)</label>
              <input 
                type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm"
                placeholder="https://.../video.mp4"
                value={formData.hero_video_url}
                onChange={e => setFormData({...formData, hero_video_url: e.target.value})}
              />
            </div>
          </div>

          {/* STATISTIQUES */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Users size={20} /> Statistiques clés</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Participants (ex: 150+)</label>
                <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm"
                  value={formData.stats.participants} onChange={e => setFormData({...formData, stats: {...formData.stats, participants: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Photos (ex: 500+)</label>
                <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm"
                  value={formData.stats.photos} onChange={e => setFormData({...formData, stats: {...formData.stats, photos: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Vidéos (ex: 12)</label>
                <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm"
                  value={formData.stats.videos} onChange={e => setFormData({...formData, stats: {...formData.stats, videos: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Durée (ex: 48h)</label>
                <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm"
                  value={formData.stats.duration} onChange={e => setFormData({...formData, stats: {...formData.stats, duration: e.target.value}})} />
              </div>
            </div>
          </div>

          {/* PHOTOS (Masonry) */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><ImageIcon size={20} /> Galerie Photos (URLs)</h2>
            
            <div className="bg-black/20 p-4 rounded-sm border border-border/50 mb-6">
              <h3 className="text-sm font-bold mb-2">Récupération automatique</h3>
              <p className="text-xs text-muted-foreground mb-3">Si vos images sont stockées sur le serveur (ex: dans public), entrez le chemin du dossier pour récupérer toutes les images d'un coup.</p>
              <div className="flex gap-2">
                <input type="text" className="flex-1 bg-[#0a0d0f] border border-border rounded-sm px-4 py-2 text-sm"
                  placeholder="Ex: assets/events/namaste" value={scanPath}
                  onChange={e => setScanPath(e.target.value)} />
                <button 
                  className="btn-gold px-4 py-2 text-xs rounded-sm flex items-center gap-2 font-bold"
                  onClick={() => scanMutation.mutate()}
                  disabled={scanMutation.isPending}
                >
                  {scanMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  Scanner le dossier
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" className="flex-1 bg-[#0a0d0f] border border-border rounded-sm px-4 py-2 text-sm"
                    placeholder="URL de l'image" value={photo}
                    onChange={e => { const np = [...formData.photos]; np[index] = e.target.value; setFormData({...formData, photos: np}); }} />
                  <button className="bg-red-500/10 text-red-500 px-3 rounded-sm hover:bg-red-500/20"
                    onClick={() => { const np = formData.photos.filter((_, i) => i !== index); setFormData({...formData, photos: np}); }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button className="btn-ghost-gold w-full py-2 text-xs flex justify-center items-center gap-2"
                onClick={() => setFormData({...formData, photos: [...formData.photos, ""]})}><Plus size={14} /> Ajouter une photo manuellement</button>
            </div>
          </div>

          {/* VIDEOS (YouTube) */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Video size={20} /> Galerie Vidéos YouTube</h2>
            <div className="space-y-4">
              {formData.videos.map((vid, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-black/20 p-4 rounded-sm border border-border/50">
                  <div className="md:col-span-1">
                    <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm mb-2"
                      placeholder="Lien YouTube" value={vid.youtube_id}
                      onChange={e => {
                        const nv = [...formData.videos];
                        nv[index].youtube_id = extractYouTubeId(e.target.value);
                        setFormData({...formData, videos: nv});
                      }} />
                     {vid.youtube_id && <div className="text-[10px] text-green-500">ID: {vid.youtube_id}</div>}
                  </div>
                  <div className="md:col-span-1">
                    <input type="text" className="w-full bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm"
                      placeholder="Titre court" value={vid.title}
                      onChange={e => { const nv = [...formData.videos]; nv[index].title = e.target.value; setFormData({...formData, videos: nv}); }} />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <input type="text" className="flex-1 bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm"
                      placeholder="Description" value={vid.description}
                      onChange={e => { const nv = [...formData.videos]; nv[index].description = e.target.value; setFormData({...formData, videos: nv}); }} />
                    <button className="bg-red-500/10 text-red-500 px-3 rounded-sm hover:bg-red-500/20"
                      onClick={() => { const nv = formData.videos.filter((_, i) => i !== index); setFormData({...formData, videos: nv}); }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <button className="btn-ghost-gold w-full py-2 text-xs flex justify-center items-center gap-2"
                onClick={() => setFormData({...formData, videos: [...formData.videos, { youtube_id: "", title: "", description: "" }]})}><Plus size={14} /> Ajouter une vidéo</button>
            </div>
          </div>

          {/* TEMPS FORTS */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Clock size={20} /> Temps Forts (Timeline)</h2>
            <div className="space-y-4">
              {formData.highlights.map((hl, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-black/20 p-4 rounded-sm border border-border/50">
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="Heure (ex: 20:00)"
                    value={hl.time} onChange={e => { const nh = [...formData.highlights]; nh[index].time = e.target.value; setFormData({...formData, highlights: nh}); }} />
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="Titre"
                    value={hl.title} onChange={e => { const nh = [...formData.highlights]; nh[index].title = e.target.value; setFormData({...formData, highlights: nh}); }} />
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="URL Image"
                    value={hl.image_url} onChange={e => { const nh = [...formData.highlights]; nh[index].image_url = e.target.value; setFormData({...formData, highlights: nh}); }} />
                  <div className="md:col-span-4 flex gap-2">
                    <textarea className="flex-1 bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="Description" rows={2}
                      value={hl.description} onChange={e => { const nh = [...formData.highlights]; nh[index].description = e.target.value; setFormData({...formData, highlights: nh}); }} />
                    <button className="bg-red-500/10 text-red-500 px-3 rounded-sm hover:bg-red-500/20"
                      onClick={() => { const nh = formData.highlights.filter((_, i) => i !== index); setFormData({...formData, highlights: nh}); }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <button className="btn-ghost-gold w-full py-2 text-xs flex justify-center items-center gap-2"
                onClick={() => setFormData({...formData, highlights: [...formData.highlights, { time: "", title: "", description: "", image_url: "" }]})}><Plus size={14} /> Ajouter un temps fort</button>
            </div>
          </div>

          {/* TEMOIGNAGES */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Quote size={20} /> Témoignages spécifiques</h2>
            <div className="space-y-4">
              {formData.testimonials.map((testi, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-black/20 p-4 rounded-sm border border-border/50">
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="Nom"
                    value={testi.name} onChange={e => { const nt = [...formData.testimonials]; nt[index].name = e.target.value; setFormData({...formData, testimonials: nt}); }} />
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="Rôle/Entreprise"
                    value={testi.role} onChange={e => { const nt = [...formData.testimonials]; nt[index].role = e.target.value; setFormData({...formData, testimonials: nt}); }} />
                  <input type="text" className="bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm" placeholder="URL Photo profil"
                    value={testi.image_url} onChange={e => { const nt = [...formData.testimonials]; nt[index].image_url = e.target.value; setFormData({...formData, testimonials: nt}); }} />
                  <div className="md:col-span-3 flex gap-2">
                    <textarea className="flex-1 bg-[#0a0d0f] border border-border rounded-sm px-3 py-2 text-sm font-serif italic" placeholder="Citation..." rows={2}
                      value={testi.quote} onChange={e => { const nt = [...formData.testimonials]; nt[index].quote = e.target.value; setFormData({...formData, testimonials: nt}); }} />
                    <button className="bg-red-500/10 text-red-500 px-3 rounded-sm hover:bg-red-500/20"
                      onClick={() => { const nt = formData.testimonials.filter((_, i) => i !== index); setFormData({...formData, testimonials: nt}); }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <button className="btn-ghost-gold w-full py-2 text-xs flex justify-center items-center gap-2"
                onClick={() => setFormData({...formData, testimonials: [...formData.testimonials, { name: "", role: "", quote: "", image_url: "" }]})}><Plus size={14} /> Ajouter un témoignage</button>
            </div>
          </div>

          {/* SOUVENIRS / MOT DE LA FIN */}
          <div className="glass-strong p-6 rounded-sm border border-border space-y-4">
            <h2 className="text-xl font-display text-gold flex items-center gap-2"><Award size={20} /> Souvenir / Mot de la fin</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Citation marquante (ex: du CEO)</label>
                <textarea className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm" rows={3}
                  value={formData.souvenirs.quote} onChange={e => setFormData({...formData, souvenirs: {...formData.souvenirs, quote: e.target.value}})} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Chiffre/Fait clé additionnel</label>
                <textarea className="w-full bg-[#0a0d0f] border border-border rounded-sm px-4 py-3 text-sm" rows={3}
                  value={formData.souvenirs.key_figures} onChange={e => setFormData({...formData, souvenirs: {...formData.souvenirs, key_figures: e.target.value}})} />
              </div>
            </div>
          </div>

          <div className="sticky bottom-8 flex justify-end">
            <button 
              className="btn-gold px-8 py-3 rounded-sm flex items-center gap-2 font-bold shadow-lg shadow-gold/20"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saveMutation.isPending ? "Sauvegarde..." : "Sauvegarder le Replay"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
