import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Sparkles, Star, Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface BlogSection {
  image: string;
  subtitle: string;
  text: string;
}

interface BlogArticle {
  id: number | string;
  title: string;
  category: string;
  color?: string;
  date: string;
  desc: string;
  img: string;
  tags: string[];
  sections?: BlogSection[];
  is_featured?: number | boolean;
  show_in_slider?: number | boolean;
}

const DEFAULT_ARTICLES: BlogArticle[] = [
  {
    id: 1,
    title: "Le Maroc, 4ème producteur automobile d'Afrique : la montée en puissance",
    category: "BNE BUSINESS",
    color: "gold",
    date: "16/06/2026",
    desc: "Morocco consolidates its position as the 4th largest African car producer with 46,000 vehicles/year and investments of USD 400M.",
    tags: ["#industrie", "#automobile", "#Maroc"],
    img: "https://www.infomediaire.net/wp-content/uploads/2023/06/automobile.jpg",
    is_featured: 1
  },
  {
    id: 2,
    title: "Cybersécurité en Afrique : les entreprises face aux nouvelles menaces",
    category: "BNE EXPERTISE",
    color: "emerald-500",
    date: "15/06/2026",
    desc: "Les cyberattaques en Afrique augmentent de 35% par an. Comment les entreprises se protègent en 2026.",
    tags: ["#cybersécurité", "#Afrique", "#protection"],
    img: "https://mtsgroup.ma/wp-content/uploads/2024/10/MTS-GROUP-AFRICA-CSE-cybersecurity-in-Africa.-The-scene-should-show-a-digital-map-of-Africa-glowing-in-blue-with-circui.webp",
    is_featured: 0
  },
  {
    id: 3,
    title: "E-commerce beauté en Afrique : +15% de croissance annuelle",
    category: "BNE INSIGHTS",
    color: "gold",
    date: "14/06/2026",
    desc: "Les ventes en ligne de cosmétiques en Afrique croissent de 15% par an. Plateformes, marques et tendances.",
    tags: ["#ecommerce", "#beauté", "#Afrique"],
    img: "https://panafricanbeauty.com/wp-content/uploads/2017/01/12-things.jpg",
    is_featured: 0
  },
  {
    id: 4,
    title: "L'Afrique construit plus vite que jamais : +7,1% de croissance des Infrastructures",
    category: "BNE BUSINESS",
    color: "gold",
    date: "14/06/2026",
    desc: "Le secteur des infrastructures africain croît de 7,1% par an pour atteindre 363 milliards USD en 2031. Opportunités massives.",
    tags: ["#Infrastructures", "#Afrique", "#croissance"],
    img: "https://fr.le360.ma/resizer/v2/34EWUQBKCVAXFATUWWZO7IUFR4.jpg?auth=869e94ca59a8dd7324fd07cbf74a99cf2062d8761c934d34fd050572523ab7ee&smart=true&width=1216&height=684",
    is_featured: 0
  },
  {
    id: 5,
    title: "Transport maritime vert : vers des navires zéro émission",
    category: "BNE EXPERTISE",
    color: "emerald-500",
    date: "13/06/2026",
    desc: "L'industrie maritime s'engage vers le zéro émission. GNL, hydrogène, voiles solaires et propulsion éolienne.",
    tags: ["#transport", "#maritime", "#vert"],
    img: "https://media.sudouest.fr/8326334/1200x-1/38479712.jpg",
    is_featured: 0
  },
  {
    id: 6,
    title: "Comment MDIV a doublé la conversion client en 90 jours",
    category: "BNE INSIGHTS",
    color: "gold",
    date: "12/06/2026",
    desc: "Étude de cas MDIV Business : stratégie de digitalisation et refonte de l'écosystème B2B.",
    tags: ["#MDIV", "#conversion", "#digitalisation"],
    img: "https://sestoidee.it/wp-content/uploads/2025/03/specialistes-wix.webp",
    is_featured: 0
  }
];

export default function Blog() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: articles = DEFAULT_ARTICLES } = useQuery<BlogArticle[]>({
    queryKey: ["blog-articles"],
    queryFn: async () => {
      try {
        const res = await fetch("/api-public.php?action=blog_articles");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          return json.data;
        }
      } catch (e) {
        console.warn("Utilisation du fallback blog articles", e);
      }
      return DEFAULT_ARTICLES;
    },
  });

  const categories = [
    { name: "Tous les articles", filter: "all" },
    { name: "BNE BUSINESS", filter: "business" },
    { name: "ÉVÉNEMENTS & SALONS", filter: "event" },
    { name: "IMMERSIONS & SÉJOURS", filter: "sejour" },
    { name: "SUCCÈS & CAS CLIENTS", filter: "client" },
    { name: "INNOVATION & IA", filter: "ia" },
    { name: "BNE EXPERTISE", filter: "expertise" },
    { name: "BNE INSIGHTS", filter: "insights" },
    { name: "STRATÉGIE & INVEST.", filter: "stratégie" },
    { name: "PARTENARIATS", filter: "partenariat" },
  ];

  const matchCategory = (cat: string, filter: string) => {
    if (filter === "all") return true;
    const c = (cat || "").toLowerCase();
    if (filter === "business") return c.includes("business") || c.includes("stratégie");
    if (filter === "event") return c.includes("event") || c.includes("événement") || c.includes("evenement") || c.includes("salon");
    if (filter === "sejour") return c.includes("séjour") || c.includes("sejour") || c.includes("immersion");
    if (filter === "client") return c.includes("client") || c.includes("succès") || c.includes("succes") || c.includes("témoignage");
    if (filter === "ia") return c.includes("ia") || c.includes("innovation") || c.includes("tech");
    if (filter === "expertise") return c.includes("expertise");
    if (filter === "insights") return c.includes("insights");
    if (filter === "stratégie") return c.includes("stratégie") || c.includes("strategie") || c.includes("invest");
    if (filter === "partenariat") return c.includes("partenariat") || c.includes("réseau") || c.includes("reseau");
    return c.includes(filter.toLowerCase());
  };

  // Article à la une (Actualité Principale)
  const featuredArticle = articles.find(a => Boolean(a.is_featured)) || articles[0];

  // Articles filtrés pour la grille
  const filteredArticles = articles.filter(article => {
    const matchesFilter = matchCategory(article.category, selectedFilter);
    const matchesSearch = searchQuery === "" || 
      (article.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.desc || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(article.tags) && article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* ── BACKGROUND PARTICLES / GLOW ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(197, 160, 89, 0.5) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[100px] bg-gold" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[100px] bg-emerald-500" />
      </div>

      {/* ── EN-TÊTE PRINCIPAL DU BLOG AVEC ACTUALITÉ PRINCIPALE (IMAGE GAUCHE, TEXTE DROITE) ── */}
      <section className="relative pt-24 pb-0">
        <div className="container mx-auto px-4 relative z-10">
          
          {/* ── GRANDE ZONE ACTUALITÉ PRINCIPALE (IMAGE À GAUCHE & TEXTE À DROITE) ── */}
          {featuredArticle && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full rounded-2xl overflow-hidden border border-gold/40 bg-gradient-to-br from-black/60 via-black/40 to-[#0a0d0f] backdrop-blur-xl shadow-2xl p-6 sm:p-8 lg:p-10 relative group"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                {/* ZONE IMAGE À GAUCHE (Col 1 à 6) */}
                <div className="lg:col-span-6">
                  <div className="relative rounded-xl overflow-hidden border border-gold/30 h-72 sm:h-84 md:h-96 lg:h-[420px] w-full shadow-2xl group/img">
                    <img 
                      src={featuredArticle.img} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    
                    {/* Badge Catégorie */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-gold border border-gold/40">
                        {featuredArticle.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-4 text-xs text-white/80 font-mono">
                      {featuredArticle.date}
                    </div>
                  </div>
                </div>

                {/* ZONE TEXTE À DROITE (Col 7 à 12) */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-gold/15 text-gold border border-gold/40 text-[10px] font-bold uppercase tracking-widest">
                    <Star size={12} fill="currentColor" /> Actualité Principale &middot; À la une
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-gold-light transition-colors">
                    <Link to={`/blog/${featuredArticle.id}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed line-clamp-4">
                    {featuredArticle.desc}
                  </p>

                  {/* Tags */}
                  {Array.isArray(featuredArticle.tags) && featuredArticle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {featuredArticle.tags.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs rounded-sm bg-white/5 text-muted-foreground border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bouton d'action */}
                  <div className="pt-3">
                    <Link
                      to={`/blog/${featuredArticle.id}`}
                      className="btn-gold px-7 py-3 rounded-sm text-xs uppercase tracking-widest font-bold inline-flex items-center gap-3 shadow-lg shadow-gold/10 group/btn"
                    >
                      <span>Lire l'article complet</span>
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SÉPARATEUR ÉLÉGANT AVEC LE BLOC DU BAS ── */}
          <div className="relative my-8">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold/70" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LISTE DE TOUS LES ARTICLES ── */}
      <div className="container mx-auto px-4 pt-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold">Tous les Articles</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {filteredArticles.length} article(s) disponible(s)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredArticles.map((article, i) => (
                <motion.article 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group bg-background/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                      style={{ backgroundImage: `url(${article.img})` }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg backdrop-blur-md bg-gold/60 border border-gold/20">
                      {article.category}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow relative z-10">
                    <h3 className="font-display text-xl font-bold mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 h-14">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                      {article.desc}
                    </p>
                    {Array.isArray(article.tags) && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag, j) => (
                          <span key={j} className="px-2 py-1 text-xs rounded-md bg-white/5 text-muted-foreground border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                      <span className="text-xs text-muted-foreground/60">{article.date}</span>
                      <Link 
                        to={`/blog/${article.id}`} 
                        className="text-sm font-semibold text-gold group-hover:text-gold/80 flex items-center gap-1 group/link"
                      >
                        Lire l'article
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-16 p-8 border border-border/60 rounded-xl">
                <BookOpen size={32} className="mx-auto text-gold mb-3" />
                <h3 className="font-display text-lg mb-1">Aucun article trouvé</h3>
                <p className="text-xs text-muted-foreground">Essayez de modifier votre recherche ou le filtre de catégorie.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Search */}
            <div className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold mb-4">Rechercher</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher un article..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
                <Search className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold mb-4">Catégories</h3>
              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedFilter(cat.filter)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                      selectedFilter === cat.filter 
                        ? 'bg-gold/20 text-gold border border-gold/40 font-bold' 
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5">
                      {cat.filter === 'all' 
                        ? articles.length 
                        : articles.filter(a => matchCategory(a.category, cat.filter)).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter BNE */}
            <div className="rounded-2xl p-6 border border-gold/30 bg-gradient-to-br from-gold/10 via-black/40 to-background">
              <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center mb-4">
                <Sparkles size={18} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Restez informé</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Recevez directement chaque mois nos analyses stratégiques et comptes-rendus d'affaires.
              </p>
              <Link 
                to="/contact" 
                className="btn-gold w-full py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold text-center block"
              >
                Rejoindre le Cercle
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
