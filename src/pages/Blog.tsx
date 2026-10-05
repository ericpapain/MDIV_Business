import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { name: "Tous les articles", filter: "all", color: "bg-gold" },
    { name: "BNE BUSINESS", filter: "business", color: "bg-gold" },
    { name: "BNE EXPERTISE", filter: "expertise", color: "bg-emerald-500" },
    { name: "BNE INSIGHTS", filter: "insights", color: "bg-gold" },
    { name: "MDIV EVENTS", filter: "events", color: "bg-emerald-500" },
  ];

  const articles = [
    {
      id: 1,
      title: "Le Maroc, 4ème producteur automobile d'Afrique : la montée en puissance",
      category: "BNE BUSINESS",
      color: "gold",
      date: "16/06/2026",
      desc: "Morocco consolidates its position as the 4th largest African car producer with 46,000 vehicles/year and investments of USD 400M.",
      tags: ["#industrie", "#automobile", "#Maroc"],
      img: "https://www.infomediaire.net/wp-content/uploads/2023/06/automobile.jpg"
    },
    {
      id: 2,
      title: "Cybersécurité en Afrique : les entreprises face aux nouvelles menaces",
      category: "BNE EXPERTISE",
      color: "emerald-500",
      date: "15/06/2026",
      desc: "Les cyberattaques en Afrique augmentent de 35% par an. Comment les entreprises se protègent en 2026.",
      tags: ["#cybersécurité", "#Afrique", "#protection"],
      img: "https://mtsgroup.ma/wp-content/uploads/2024/10/MTS-GROUP-AFRICA-CSE-cybersecurity-in-Africa.-The-scene-should-show-a-digital-map-of-Africa-glowing-in-blue-with-circui.webp"
    },
    {
      id: 3,
      title: "E-commerce beauté en Afrique : +15% de croissance annuelle",
      category: "BNE INSIGHTS",
      color: "gold",
      date: "14/06/2026",
      desc: "Les ventes en ligne de cosmétiques en Afrique croissent de 15% par an. Plateformes, marques et tendances.",
      tags: ["#ecommerce", "#beauté", "#Afrique"],
      img: "https://panafricanbeauty.com/wp-content/uploads/2017/01/12-things.jpg"
    },
    {
      id: 4,
      title: "L'Afrique construit plus vite que jamais : +7,1% de croissance des Infrastructures",
      category: "BNE BUSINESS",
      color: "gold",
      date: "14/06/2026",
      desc: "Le secteur des infrastructures africain croît de 7,1% par an pour atteindre 363 milliards USD en 2031. Opportunités massives.",
      tags: ["#Infrastructures", "#Afrique", "#croissance"],
      img: "https://fr.le360.ma/resizer/v2/34EWUQBKCVAXFATUWWZO7IUFR4.jpg?auth=869e94ca59a8dd7324fd07cbf74a99cf2062d8761c934d34fd050572523ab7ee&smart=true&width=1216&height=684"
    },
    {
      id: 5,
      title: "Transport maritime vert : vers des navires zéro émission",
      category: "BNE EXPERTISE",
      color: "emerald-500",
      date: "13/06/2026",
      desc: "L'industrie maritime s'engage vers le zéro émission. GNL, hydrogène, voiles solaires et propulsion éolienne.",
      tags: ["#transport", "#maritime", "#vert"],
      img: "https://media.sudouest.fr/8326334/1200x-1/38479712.jpg"
    },
    {
      id: 6,
      title: "Comment MDIV a doublé la conversion client en 90 jours",
      category: "BNE INSIGHTS",
      color: "gold",
      date: "12/06/2026",
      desc: "Étude de cas MDIV Business : stratégie de digitalisation et refonte de l'écosystème B2B.",
      tags: ["#MDIV", "#conversion", "#digitalisation"],
      img: "https://sestoidee.it/wp-content/uploads/2025/03/specialistes-wix.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      
      {/* ── BACKGROUND PARTICLES / GLOW ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(197, 160, 89, 0.5) 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[100px] bg-gold" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[100px] bg-emerald-500" />
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-32 pb-16">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-8"
            >
              <span className="text-gold text-sm">↗</span>
              <span className="text-sm font-medium">Insights & Tendances Business</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Le Blog <span className="gold-text italic pr-4">BNE</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Découvrez nos derniers articles sur la stratégie, l'innovation, le développement commercial et l'écosystème BNE.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16"
            >
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-gold mb-1">120+</div>
                <div className="text-sm text-muted-foreground">Articles exclusifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-gold mb-1">5</div>
                <div className="text-sm text-muted-foreground">Catégories d'expertise</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-gold mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Lecteurs B2B</div>
              </div>
            </motion.div>
            
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
      </section>

      {/* ── CONTENT ── */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="font-display text-3xl font-bold">Tous les Articles</h2>
              <p className="text-sm text-muted-foreground hidden md:block">
                Page 1/10 • 120 articles
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article, i) => (
                <motion.article 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-background/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${article.img})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg backdrop-blur-md bg-${article.color}/60 border border-${article.color}/20`}>
                      {article.category}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow relative z-10">
                    <h3 className="font-display text-xl font-bold mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 h-14">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
                      {article.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag, j) => (
                        <span key={j} className="px-2 py-1 text-xs rounded-md bg-white/5 text-muted-foreground border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted-foreground/60">{article.date}</span>
                      <Link to={`/blog/${article.id}`} className="text-sm font-semibold text-gold group-hover:text-gold/80 flex items-center gap-1 group/link">
                        Lire l'article 
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">Affichage 1–6 sur 120</div>
              <nav className="flex items-center gap-2">
                <button disabled className="px-3 py-2 rounded-md border border-white/10 text-muted-foreground/50 cursor-not-allowed text-sm">
                  ← Précédent
                </button>
                <button className="min-w-[40px] px-3 py-2 rounded-md border border-gold/60 bg-gold/10 text-gold text-sm font-bold">
                  1
                </button>
                <button className="min-w-[40px] px-3 py-2 rounded-md border border-white/10 text-muted-foreground hover:border-gold/50 hover:text-gold transition-colors text-sm">
                  2
                </button>
                <span className="px-2 text-muted-foreground/50">…</span>
                <button className="min-w-[40px] px-3 py-2 rounded-md border border-white/10 text-muted-foreground hover:border-gold/50 hover:text-gold transition-colors text-sm">
                  20
                </button>
                <button className="px-3 py-2 rounded-md border border-white/10 text-foreground hover:border-gold/50 hover:text-gold transition-colors text-sm">
                  Suivant →
                </button>
              </nav>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Search */}
            <section className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Search size={20} className="text-gold" />
                Rechercher
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Rechercher un article..." 
                  className="w-full bg-black/40 border border-white/10 focus:border-gold/50 focus:ring-1 focus:ring-gold rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </section>

            {/* Categories */}
            <section className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-gold" />
                Catégories
              </h3>
              <div className="space-y-2">
                {categories.map((cat, i) => (
                  <button 
                    key={i}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group border ${
                      i === 0 
                        ? "bg-gold/10 text-gold border-gold/30" 
                        : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground border-transparent"
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color} ${i===0?'':'opacity-50 group-hover:opacity-100'} transition-opacity`}></span>
                  </button>
                ))}
              </div>
            </section>

            {/* Popular Tags */}
            <section className="bg-background/40 backdrop-blur-md rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold mb-4">Tags Populaires</h3>
              <div className="flex flex-wrap gap-2">
                {["#Stratégie", "#Afrique", "#BNE", "#MDIV", "#Immobilier", "#Croissance", "#Réseau", "#Luxe", "#Evénementiel"].map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-muted-foreground border border-white/10 hover:border-gold/30 hover:text-gold cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <section className="bg-gradient-to-br from-gold/10 via-background/40 to-background/40 backdrop-blur-md rounded-2xl p-6 border border-gold/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                <Zap size={24} className="text-gold group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Newsletter BNE</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Recevez nos derniers insights, conseils stratégiques et actualités directement dans votre boîte mail.
              </p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  required 
                  placeholder="Votre adresse email" 
                  className="w-full bg-black/40 border border-white/10 focus:border-gold/50 focus:ring-1 focus:ring-gold rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
                <button type="submit" className="w-full btn-gold rounded-xl px-4 py-3 text-sm font-bold shadow-[0_0_20px_rgba(197,160,89,0.2)] hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all">
                  S'abonner
                </button>
              </form>
            </section>

          </aside>
        </div>
      </div>
      
    </div>
  );
}
