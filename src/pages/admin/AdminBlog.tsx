import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Star, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Sliders, 
  Loader2, 
  Calendar,
  Eye,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface BlogSection {
  image: string;
  subtitle: string;
  text: string;
}

export interface BlogArticle {
  id: number | string;
  title: string;
  category: string;
  color?: string;
  date: string;
  desc: string;
  img: string;
  tags: string[];
  sections: BlogSection[];
  is_featured: number | boolean;
  show_in_slider: number | boolean;
  created_at?: string;
}

const CATEGORIES = [
  "BNE BUSINESS",
  "ÉVÉNEMENTS & SALONS",
  "IMMERSIONS & SÉJOURS",
  "SUCCÈS & CAS CLIENTS",
  "BNE EXPERTISE",
  "BNE INSIGHTS",
  "INNOVATION & IA",
  "STRATÉGIE & INVESTISSEMENT",
  "PARTENARIATS & ÉCOSYSTÈME"
];

export default function AdminBlog() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BNE BUSINESS");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [color, setColor] = useState("gold");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [tagsInput, setTagsInput] = useState("#business, #afrique");
  const [isFeatured, setIsFeatured] = useState(false);
  const [showInSlider, setShowInSlider] = useState(false);
  const [sections, setSections] = useState<BlogSection[]>([
    { image: "", subtitle: "", text: "" }
  ]);

  const { data: articles = [], isLoading, refetch } = useQuery<BlogArticle[]>({
    queryKey: ["admin-blog-articles"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_blog_articles");
      const json = await res.json();
      return json.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api-admin.php?action=save_blog_article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur de sauvegarde");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] });
      queryClient.invalidateQueries({ queryKey: ["blog-articles"] });
      queryClient.invalidateQueries({ queryKey: ["hero-news"] });
      toast({ 
        title: editingId ? "Article modifié" : "Article publié avec succès",
        description: showInSlider ? "L'article est également synchronisé dans le slider d'accueil !" : undefined
      });
      handleCloseForm();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const res = await fetch("/api-admin.php?action=delete_blog_article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur de suppression");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] });
      queryClient.invalidateQueries({ queryKey: ["blog-articles"] });
      queryClient.invalidateQueries({ queryKey: ["hero-news"] });
      toast({ title: "Article supprimé" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle("");
    setCategory("BNE BUSINESS");
    setIsCustomCategory(false);
    setColor("gold");
    setDesc("");
    setImg("");
    setTagsInput("#business, #afrique");
    setIsFeatured(false);
    setShowInSlider(false);
    setSections([
      { image: "", subtitle: "Introduction et contexte stratégique", text: "" }
    ]);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (art: BlogArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    const cat = art.category || "BNE BUSINESS";
    setCategory(cat);
    setIsCustomCategory(!CATEGORIES.includes(cat));
    setColor(art.color || "gold");
    setDate(art.date || "");
    setDesc(art.desc || "");
    setImg(art.img || "");
    setTagsInput(Array.isArray(art.tags) ? art.tags.join(", ") : "");
    setIsFeatured(Boolean(art.is_featured));
    setShowInSlider(Boolean(art.show_in_slider));
    setSections(
      Array.isArray(art.sections) && art.sections.length > 0 
        ? art.sections 
        : [{ image: art.img, subtitle: "Aperçu général", text: art.desc }]
    );
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      { image: "", subtitle: `Section ${sections.length + 1}`, text: "" }
    ]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, idx) => idx !== index));
  };

  const handleSectionChange = (index: number, field: keyof BlogSection, value: string) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !img.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Champs requis", 
        description: "Le titre, le résumé et l'image de couverture sont obligatoires." 
      });
      return;
    }

    const tagsArray = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => (t.startsWith("#") ? t : `#${t}`));

    saveMutation.mutate({
      id: editingId,
      title,
      category,
      color,
      date,
      desc,
      img,
      tags: tagsArray,
      sections,
      is_featured: isFeatured ? 1 : 0,
      show_in_slider: showInSlider ? 1 : 0,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2 text-primary">
            <BookOpen size={14} className="text-gold" /> CMS &middot; Articles & Publications
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Gestion du <span className="gold-text">Blog & Actualités BNE</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Créez, modifiez et gérez vos articles de blog. Définissez l'actualité principale à la une et choisissez quelles actualités apparaissent dans le slider de l'accueil.
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
              onClick={handleOpenNew}
              className="btn-gold px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold flex items-center gap-2 shadow-lg shadow-gold/10"
            >
              <Plus size={16} /> Nouvel Article
            </button>
          )}
        </div>
      </div>

      {/* ── FORMULAIRE CMS ARTICLE & MULTI-IMAGES ── */}
      {isFormOpen && (
        <div className="glass-strong border border-gold/30 rounded-sm p-6 relative overflow-hidden animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={handleCloseForm} className="text-muted-foreground hover:text-foreground p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
              {editingId ? <Edit size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">
                {editingId ? "Modifier l'article de blog" : "Créer un nouvel article de blog"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Remplissez les informations et ajoutez autant d'images et sections que nécessaire.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations Générales */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Titre de l'article <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Le Maroc, 4ème producteur automobile d'Afrique : la montée en puissance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                    Catégorie
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory && !category) setCategory("AUTRE");
                    }}
                    className="text-[11px] text-gold hover:underline font-medium"
                  >
                    {isCustomCategory ? "Choisir dans la liste standard" : "+ Saisie personnalisée"}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    placeholder="Ex: IMMERSIONS & SÉJOURS, SUCCÈS CLIENTS..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background/80 border border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                    required
                  />
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomCategory(true);
                        setCategory("");
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="CUSTOM">+ Autre catégorie personnalisée...</option>
                  </select>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Date de publication
                </label>
                <input
                  type="text"
                  placeholder="Ex: 16/06/2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                />
              </div>

              {/* Image de couverture */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Image principale de couverture (URL) <span className="text-gold">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />
              </div>

              {/* Résumé / Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Résumé / Extrait d'accroche <span className="text-gold">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Court résumé de l'article visible sur la carte et le carrousel..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-foreground/90">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: #industrie, #automobile, #Maroc"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-4 py-2.5 text-sm text-foreground outline-none transition-colors"
                />
              </div>
            </div>

            {/* ── DEUX OPTIONS CAPITALES : SLIDER D'ACCUEIL & ACTUALITÉ PRINCIPALE (À LA UNE) ── */}
            <div className="p-5 rounded-sm border border-gold/40 bg-gold/5 grid sm:grid-cols-2 gap-6">
              {/* Option 1 : Afficher dans le slider d'accueil */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-gold" />
                  <span className="text-xs uppercase tracking-wider font-bold text-foreground">
                    Afficher dans le slider d'accueil ?
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si OUI, cet article glissera dans le carrousel dynamique de la page d'accueil après la saisie de texte.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowInSlider(true)}
                    className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      showInSlider 
                        ? "bg-gold text-black shadow-md shadow-gold/20" 
                        : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    <Check size={14} /> Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInSlider(false)}
                    className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      !showInSlider 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    <X size={14} /> Non
                  </button>
                </div>
              </div>

              {/* Option 2 : Actualité Principale (À la une du Blog) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-gold" />
                  <span className="text-xs uppercase tracking-wider font-bold text-foreground">
                    Actualité Principale (À la une du Blog) ?
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si OUI, il sera mis en valeur dans la grande zone du haut de page du Blog (Image gauche, texte droite).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFeatured(true)}
                    className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      isFeatured 
                        ? "bg-gold text-black shadow-md shadow-gold/20" 
                        : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    <Check size={14} /> Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(false)}
                    className={`px-4 py-1.5 rounded-sm text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                      !isFeatured 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "bg-black/40 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    <X size={14} /> Non
                  </button>
                </div>
              </div>
            </div>

            {/* ── GESTION MULTI-IMAGES ET SECTIONS ALTERNÉES (ZIGZAG) ── */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-lg text-foreground flex items-center gap-2">
                    <Layers size={18} className="text-gold" /> Sections & Images de l'article (Alternance G/D)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Ajoutez autant d'images et de paragraphes que vous le souhaitez. Ils s'afficheront sur la page de lecture complète de façon alternée (Image à gauche &rarr; Image à droite &rarr; etc.).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3.5 py-1.5 rounded-sm bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Ajouter une image / section
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, idx) => {
                  const isImageLeft = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-sm border border-border/80 bg-black/40 space-y-4 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 font-bold">
                            Section #{idx + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Disposition : {isImageLeft ? "🖼️ Image à GAUCHE & Texte à DROITE" : "📝 Texte à GAUCHE & Image à DROITE"}
                          </span>
                        </div>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(idx)}
                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                            title="Supprimer cette section"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/80">
                            URL de l'image pour cette section
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={section.image}
                            onChange={(e) => handleSectionChange(idx, "image", e.target.value)}
                            className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-3 py-2 text-xs text-foreground outline-none transition-colors"
                          />
                          {section.image && (
                            <div className="h-24 rounded overflow-hidden border border-border mt-2">
                              <img src={section.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/80">
                            Sous-titre de la section
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Opportunités d'investissement et perspectives"
                            value={section.subtitle}
                            onChange={(e) => handleSectionChange(idx, "subtitle", e.target.value)}
                            className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-3 py-2 text-xs text-foreground outline-none transition-colors"
                          />

                          <label className="text-[11px] uppercase tracking-wider font-semibold text-foreground/80 pt-1 block">
                            Texte détaillé / Contenu
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Développez les informations et explications..."
                            value={section.text}
                            onChange={(e) => handleSectionChange(idx, "text", e.target.value)}
                            className="w-full bg-background/80 border border-border/80 focus:border-gold rounded-sm px-3 py-2 text-xs text-foreground outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
                {editingId ? "Enregistrer les modifications" : "Publier l'article"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── LISTE DES ARTICLES DE BLOG ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-gold" /> Articles publiés ({articles.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            {articles.filter(a => Boolean(a.is_featured)).length} à la une &middot; {articles.filter(a => Boolean(a.show_in_slider)).length} dans le slider
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : articles.length === 0 ? (
          <div className="glass-strong border border-border/60 rounded-sm p-12 text-center">
            <p className="text-muted-foreground mb-4">Aucun article enregistré pour le moment.</p>
            <button
              onClick={handleOpenNew}
              className="btn-gold px-5 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold"
            >
              Créer un premier article
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => {
              const isFeat = Boolean(art.is_featured);
              const isSlide = Boolean(art.show_in_slider);

              return (
                <div
                  key={art.id}
                  className={`rounded-sm border transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                    isFeat 
                      ? "border-gold/60 bg-[#0c1013] shadow-lg shadow-gold/5" 
                      : "border-border/70 hover:border-gold/40 bg-[#0a0d0f]"
                  }`}
                >
                  <div>
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-black/40">
                      <img
                        src={art.img}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0f] via-transparent to-black/30" />

                      {/* Badges statut */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-black/80 backdrop-blur-sm border border-gold/40 text-gold font-bold">
                          {art.category}
                        </span>
                        {isFeat && (
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-gold text-black font-extrabold flex items-center gap-1 shadow-md">
                            <Star size={10} fill="currentColor" /> À LA UNE
                          </span>
                        )}
                        {isSlide && (
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-500/90 text-white font-bold flex items-center gap-1 shadow-md">
                            <Sliders size={10} /> SLIDER ACCUEIL
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-3 text-[10px] text-white/70 font-mono">
                        {art.date}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-display text-base text-foreground group-hover:text-gold-light transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {art.desc}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{Array.isArray(art.sections) ? art.sections.length : 0} section(s) image</span>
                        <a
                          href={`/blog/${art.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline flex items-center gap-1"
                        >
                          Voir l'article <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-3 border-t border-border/50 bg-black/30 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      ID #{art.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(art)}
                        className="p-1.5 rounded-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors"
                        title="Modifier"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'article "${art.title}" ?`)) {
                            deleteMutation.mutate(art.id);
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
