import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Newspaper, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ExternalLink, 
  Image as ImageIcon, 
  ArrowUpDown, 
  Eye, 
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeroNewsItem {
  id: number;
  title: string;
  comment: string;
  image_url: string;
  link_url?: string;
  tag?: string;
  order_num: number;
  is_active: number | boolean;
  created_at?: string;
}

const PRESET_IMAGES = [
  { label: "Conférence Affaires", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" },
  { label: "Sommet B2B", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80" },
  { label: "Gratte-ciel & Finance", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" },
  { label: "Rencontre Dirigeants", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80" },
  { label: "Innovation & IA", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80" },
];

export default function AdminHeroNews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    comment: string;
    image_url: string;
    link_url: string;
    tag: string;
    order_num: number;
    is_active: boolean;
  }>({
    title: "",
    comment: "",
    image_url: "",
    link_url: "",
    tag: "Actualité Principale",
    order_num: 1,
    is_active: true,
  });

  const { data: news = [], isLoading, refetch } = useQuery<HeroNewsItem[]>({
    queryKey: ["admin-hero-news"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_hero_news");
      const json = await res.json();
      return json.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api-admin.php?action=save_hero_news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur de sauvegarde");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-news"] });
      queryClient.invalidateQueries({ queryKey: ["hero-news"] });
      toast({ 
        title: editingId ? "Actualité modifiée" : "Actualité ajoutée",
        description: "Les modifications sont immédiatement répercutées sur la page d'accueil."
      });
      handleCloseForm();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_hero_news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur de suppression");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-news"] });
      queryClient.invalidateQueries({ queryKey: ["hero-news"] });
      toast({ title: "Actualité supprimée" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const handleEdit = (item: HeroNewsItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      comment: item.comment,
      image_url: item.image_url,
      link_url: item.link_url || "",
      tag: item.tag || "Actualité Principale",
      order_num: item.order_num || 1,
      is_active: Boolean(item.is_active),
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      comment: "",
      image_url: "",
      link_url: "",
      tag: "Actualité Principale",
      order_num: (news.length || 0) + 1,
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.comment.trim() || !formData.image_url.trim()) {
      toast({ variant: "destructive", title: "Champs requis", description: "Le titre, le commentaire et l'image sont obligatoires." });
      return;
    }

    saveMutation.mutate({
      id: editingId,
      ...formData,
      is_active: formData.is_active ? 1 : 0
    });
  };

  const toggleActiveStatus = (item: HeroNewsItem) => {
    saveMutation.mutate({
      id: item.id,
      title: item.title,
      comment: item.comment,
      image_url: item.image_url,
      link_url: item.link_url,
      tag: item.tag,
      order_num: item.order_num,
      is_active: item.is_active ? 0 : 1
    });
  };

  const activeCount = news.filter(n => Boolean(n.is_active)).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2 text-primary">
            <Sparkles size={14} className="text-gold" /> Page d'accueil &middot; Hero
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Actualités Principales <span className="gold-text">(Slider Hero)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Configurez les images et les commentaires qui défileront carte par carte sur la page d'accueil juste après l'animation de saisie de texte.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-sm border border-border/80 hover:border-gold/50 text-muted-foreground hover:text-gold transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>

          {!isFormOpen && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  comment: "",
                  image_url: "",
                  link_url: "",
                  tag: "Actualité Principale",
                  order_num: (news.length || 0) + 1,
                  is_active: true,
                });
                setIsFormOpen(true);
              }}
              className="btn-gold px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-lg shadow-gold/10"
            >
              <Plus size={16} /> Ajouter une actualité
            </button>
          )}
        </div>
      </div>

      {/* ── STATS RAPIDES ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-sm border border-border/60 bg-black/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Actualités</div>
          <div className="font-display text-2xl gold-text">{news.length}</div>
        </div>
        <div className="p-4 rounded-sm border border-border/60 bg-black/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Actives dans le Slider</div>
          <div className="font-display text-2xl text-emerald-400">{activeCount}</div>
        </div>
        <div className="p-4 rounded-sm border border-border/60 bg-black/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mode d'affichage</div>
          <div className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" /> Après la saisie
          </div>
        </div>
        <div className="p-4 rounded-sm border border-border/60 bg-black/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Vitesse de slide</div>
          <div className="text-sm font-semibold text-foreground mt-1">5 secondes / carte</div>
        </div>
      </div>

      {/* ── FORMULAIRE D'AJOUT / MODIFICATION ── */}
      {isFormOpen && (
        <div className="glass-strong border border-gold/30 rounded-sm p-6 relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={handleCloseForm}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              {editingId ? <Edit size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">
                {editingId ? "Modifier l'actualité" : "Nouvelle actualité principale"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Cette carte s'affichera dans le carrousel avec son image et son commentaire.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Titre de l'actualité <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sommet BNE Casablanca 2026 : 450 Dirigeants Réunis"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />
              </div>

              {/* Tag / Badge */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Badge / Catégorie
                </label>
                <input
                  type="text"
                  placeholder="Ex: Événement Majeur, Séjour Immersif, Partenariat..."
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90 flex items-center justify-between">
                  <span>URL de l'image <span className="text-gold">*</span></span>
                  <span className="text-[11px] text-muted-foreground">Recommandé : format paysage (16:9) haute définition</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />

                {/* Suggestions d'images rapides */}
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <span className="text-[11px] text-muted-foreground">Exemples rapides :</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: preset.url })}
                      className="text-[10px] uppercase tracking-wider px-2 py-1 bg-muted/60 hover:bg-gold/20 hover:text-gold border border-border/60 rounded-sm transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire / Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Commentaire correspondant <span className="text-gold">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: La plus grande rencontre d'affaires inter-entreprises du continent africain avec signature de partenariats stratégiques majeurs."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Lien URL */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Lien de redirection (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: /evenements, /sejours-bne, /contact ou https://..."
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                />
              </div>

              {/* Ordre & Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                    Ordre d'apparition
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order_num}
                    onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 1 })}
                    className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                    Statut dans le slider
                  </label>
                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 accent-gold rounded"
                      />
                      <span className="text-sm text-foreground">
                        {formData.is_active ? "Actif (Visible)" : "Inactif (Masqué)"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu en direct */}
            {formData.image_url && (
              <div className="p-4 rounded-sm border border-gold/20 bg-black/40 space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-gold font-semibold flex items-center gap-1.5">
                  <Eye size={12} /> Aperçu direct de la carte
                </div>
                <div className="relative rounded overflow-hidden h-48 border border-border/60 max-w-xl group">
                  <img
                    src={formData.image_url}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-gold/90 text-black font-bold">
                      {formData.tag || "Actualité Principale"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="font-display text-sm md:text-base text-white font-bold line-clamp-1">
                      {formData.title || "Titre de votre actualité"}
                    </h4>
                    <p className="text-xs text-white/80 line-clamp-2 mt-0.5 leading-snug">
                      {formData.comment || "Votre commentaire descriptif apparaîtra ici."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 rounded-sm border border-border text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="btn-gold px-6 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
              >
                {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Enregistrer les modifications" : "Publier l'actualité"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── LISTE DES ACTUALITÉS PRINCIPALES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Newspaper size={20} className="text-gold" /> Liste des cartes du Slider
          </h2>
          <span className="text-xs text-muted-foreground">
            Glissera carte par carte automatiquement après la saisie de texte
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : news.length === 0 ? (
          <div className="glass-strong border border-border/60 rounded-sm p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
              <Newspaper size={24} />
            </div>
            <h3 className="font-display text-lg text-foreground mb-1">Aucune actualité enregistrée</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Ajoutez vos premières actualités avec photo et commentaire pour alimenter le slider du Hero sur la page d'accueil.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-gold px-6 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2"
            >
              <Plus size={16} /> Ajouter une première actualité
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => {
              const isActive = Boolean(item.is_active);
              return (
                <div
                  key={item.id}
                  className={`group rounded-sm border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isActive 
                      ? "border-border/80 hover:border-gold/50 bg-[#0c1013]" 
                      : "border-border/30 bg-[#080a0c]/60 opacity-60"
                  }`}
                >
                  {/* Visuel Carte */}
                  <div>
                    <div className="relative h-44 overflow-hidden bg-black/50">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1013] via-transparent to-black/30" />
                      
                      {/* Badge Tag */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-black/70 backdrop-blur-sm border border-gold/40 text-gold font-bold">
                          {item.tag || "Actualité Principale"}
                        </span>
                      </div>

                      {/* Ordre Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-black/80 text-muted-foreground border border-border">
                          Slide #{item.order_num || 1}
                        </span>
                      </div>
                    </div>

                    {/* Contenu Texte */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-display text-base text-foreground group-hover:text-gold-light transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.comment}
                      </p>

                      {item.link_url && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary/80 hover:text-gold transition-colors">
                            <ExternalLink size={11} /> {item.link_url}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barre d'actions */}
                  <div className="p-4 pt-3 border-t border-border/50 bg-black/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleActiveStatus(item)}
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-sm border transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {isActive ? <Check size={12} /> : <X size={12} />}
                      {isActive ? "Visible" : "Masqué"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Supprimer cette actualité du slider ?")) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
