import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Share2, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

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
  sections: BlogSection[];
  is_featured?: number | boolean;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: article, isLoading, isError } = useQuery<BlogArticle>({
    queryKey: ["blog-article", id],
    queryFn: async () => {
      const res = await fetch(`/api-public.php?action=blog_article&id=${id}`);
      if (!res.ok) throw new Error("Article introuvable");
      const json = await res.json();
      return json.data;
    },
    retry: 1,
  });

  const { data: allArticles = [] } = useQuery<BlogArticle[]>({
    queryKey: ["blog-articles"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=blog_articles");
      const json = await res.json();
      return json.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 pt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
          <BookOpen size={28} />
        </div>
        <h1 className="font-display text-3xl mb-2">Article non trouvé</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Cet article n'existe pas ou a été déplacé.
        </p>
        <Link to="/blog" className="btn-gold px-6 py-2.5 rounded-sm text-xs uppercase tracking-wider font-semibold">
          Retour au blog
        </Link>
      </div>
    );
  }

  const sections = Array.isArray(article.sections) && article.sections.length > 0
    ? article.sections
    : [
        {
          image: article.img,
          subtitle: "Présentation générale",
          text: article.desc
        }
      ];

  const otherArticles = allArticles.filter(a => String(a.id) !== String(article.id)).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative pt-24 pb-20">
      {/* ── BACKGROUND PARTICLES ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] bg-gold" />
        <div className="absolute bottom-1/3 left-10 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] bg-emerald-500" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Navigation retour */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Retour aux articles du Blog</span>
          </Link>
        </div>

        {/* ── EN-TÊTE DE L'ARTICLE ── */}
        <header className="mb-14 space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={13} className="text-gold/70" />
              <span>{article.date}</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground font-bold tracking-tight leading-[1.08]">
            {article.title}
          </h1>

          <p className="text-lg md:text-xl text-foreground/85 font-light leading-relaxed border-l-2 border-gold/40 pl-4 py-1 italic">
            {article.desc}
          </p>

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {article.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-sm bg-white/5 text-muted-foreground border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* ── DISPOSITION ALTERNÉE DES SECTIONS (ZIGZAG IMAGE/TEXTE) ── */}
        <div className="space-y-16 md:space-y-24 mb-20">
          {sections.map((sec, idx) => {
            const isImageLeft = idx % 2 === 0;

            return (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* SI INDEX PAIR : IMAGE À GAUCHE (Col 1 à 6) */}
                {isImageLeft ? (
                  <>
                    <div className="lg:col-span-6">
                      <div className="relative rounded-2xl overflow-hidden border border-gold/30 shadow-2xl bg-black/40 group">
                        <img
                          src={sec.image || article.img}
                          alt={sec.subtitle || article.title}
                          className="w-full h-72 sm:h-84 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = article.img;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-gold border border-gold/30 font-bold">
                            Vue 0{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-4">
                      {sec.subtitle && (
                        <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold tracking-tight gold-text">
                          {sec.subtitle}
                        </h2>
                      )}
                      <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-light whitespace-pre-line">
                        {sec.text}
                      </p>
                    </div>
                  </>
                ) : (
                  /* SI INDEX IMPAIR : TEXTE À GAUCHE (Col 1 à 6) & IMAGE À DROITE (Col 7 à 12) */
                  <>
                    <div className="lg:col-span-6 order-2 lg:order-1 space-y-4">
                      {sec.subtitle && (
                        <h2 className="font-display text-2xl md:text-3xl text-foreground font-bold tracking-tight gold-text">
                          {sec.subtitle}
                        </h2>
                      )}
                      <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-light whitespace-pre-line">
                        {sec.text}
                      </p>
                    </div>

                    <div className="lg:col-span-6 order-1 lg:order-2">
                      <div className="relative rounded-2xl overflow-hidden border border-gold/30 shadow-2xl bg-black/40 group">
                        <img
                          src={sec.image || article.img}
                          alt={sec.subtitle || article.title}
                          className="w-full h-72 sm:h-84 md:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = article.img;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-gold border border-gold/30 font-bold">
                            Vue 0{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.section>
            );
          })}
        </div>

        {/* ── BANNIÈRE BAS DE PAGE ET AUTRES ARTICLES ── */}
        <div className="border-t border-border/60 pt-12 mt-16 space-y-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/blog"
              className="btn-ghost-gold px-6 py-3 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Tous les articles
            </Link>

            <Link
              to="/contact"
              className="btn-gold px-8 py-3 rounded-sm text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <span>Rejoindre le Cercle BNE</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Articles suggérés */}
          {otherArticles.length > 0 && (
            <div className="space-y-6 pt-8">
              <h3 className="font-display text-2xl text-foreground flex items-center gap-2">
                <Sparkles size={20} className="text-gold" /> À lire également
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {otherArticles.map((item) => (
                  <Link
                    key={item.id}
                    to={`/blog/${item.id}`}
                    className="group rounded-xl overflow-hidden border border-border/70 hover:border-gold/40 bg-black/30 transition-all flex flex-col"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/70 text-gold border border-gold/30">
                        {item.category}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h4 className="font-display text-sm font-bold text-foreground group-hover:text-gold transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-gold flex items-center gap-1 font-semibold pt-1">
                        Lire l'article <ArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
