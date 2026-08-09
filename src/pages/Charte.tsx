import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Shield, Handshake, Globe, Zap, ArrowRight, CornerRightDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Charte() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const articles = [
    { title: "L'ADN DU BNE", desc: "EXPÉRIENCE → CONNEXION → CONTRIBUTION → DÉVELOPPEMENT → OPPORTUNITÉS. La valeur du réseau dépend directement de la qualité des relations et de la capacité de ses membres à créer de la valeur ensemble." },
    { title: "UNE ADHÉSION SANS COTISATION", desc: "Aucun frais d'inscription, aucune cotisation mensuelle, aucune cotisation annuelle. L'adhésion au BNE ne s'achète pas, elle résulte d'une expérience ou d'un accompagnement BNE." },
    { title: "PARTICIPANT, MEMBRE ET MEMBRE ACTIF", desc: "Le BNE privilégie la qualité de l'engagement plutôt que la quantité de membres. Un membre actif entretient une relation réelle avec l'écosystème et contribue à sa dynamique." },
    { title: "LA RÉCIPROCITÉ", desc: "« Donner de la valeur pour créer de la valeur. » Chaque membre contribue selon ses compétences, ses possibilités et son réseau." },
    { title: "LES DROITS DU MEMBRE", desc: "Développer son réseau, être mis en relation, participer aux expériences, présenter son expertise et développer des collaborations nationales et internationales." },
    { title: "LES ENGAGEMENTS DU MEMBRE", desc: "Respecter l'esprit du BNE, recommander les membres, préserver la confidentialité et adopter une attitude professionnelle. Le BNE ne demande pas de le vendre, mais de le représenter par la valeur créée." },
    { title: "PAS D'OBLIGATION DE DURÉE", desc: "Aucune durée minimale d'engagement, ni contrat annuel, ni quota de recommandations. Chaque membre reste libre de son niveau de participation." },
    { title: "PAS UNE PLATEFORME DE PROSPECTION", desc: "La prospection agressive ou l'utilisation abusive des coordonnées sont incompatibles avec l'esprit du réseau. La relation vient avant la transaction." },
    { title: "QUALITÉ ET SÉLECTION", desc: "L'intégration à certaines expériences peut faire l'objet d'une sélection selon le profil, les objectifs et les complémentarités." },
    { title: "CONFIDENTIALITÉ ET CONFIANCE", desc: "Les informations, contacts ou opportunités partagés doivent être traités avec discrétion. Chaque membre s'engage à respecter la confidentialité." },
    { title: "RESPONSABILITÉ ET OPPORTUNITÉS", desc: "Le BNE facilite les rencontres, mais ne garantit aucun résultat. Chaque membre reste responsable de ses décisions et engagements." },
    { title: "ÉTHIQUE ET COMPORTEMENT", desc: "Respect, Intégrité, Professionnalisme, Contribution, Réciprocité, Ouverture. Tout comportement contraire peut entraîner la suspension de l'accès au réseau." },
    { title: "UN RÉSEAU INTERNATIONAL", desc: "Le BNE s'organise autour d'écosystèmes locaux tout en favorisant les connexions nationales et internationales." },
    { title: "LE RÔLE DU BNE", desc: "Le BNE agit comme un facilitateur entre les personnes, les entreprises et les territoires. Il cherche à créer un réseau plus pertinent, pas simplement plus grand." },
    { title: "LA PHILOSOPHIE BNE", desc: "« Je ne viens pas seulement chercher une opportunité. Je viens aussi avec la capacité d'en créer une pour quelqu'un d'autre. »" }
  ];

  const septPrincipes = [
    { title: "EXPÉRIENCE", text: "Entrer dans le BNE par une véritable expérience ou un accompagnement.", icon: Zap },
    { title: "CONFIANCE", text: "Construire des relations professionnelles durables.", icon: Shield },
    { title: "CONTRIBUTION", text: "Apporter avant de demander.", icon: Handshake },
    { title: "CONNEXION", text: "Créer les bonnes rencontres au bon moment.", icon: Globe },
    { title: "RÉCIPROCITÉ", text: "Faire circuler la valeur au sein du réseau.", icon: Check },
    { title: "DÉVELOPPEMENT", text: "Transformer les connexions en collaborations et opportunités.", icon: ArrowRight },
    { title: "INTERNATIONAL", text: "Créer des ponts entre entrepreneurs, entreprises et territoires.", icon: Globe }
  ];

  return (
    <div className="bg-[#050709] min-h-screen text-foreground font-sans overflow-hidden">
      
      {/* ── 1. Hero Header Immersif ── */}
      <section className="relative min-h-[60vh] py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050709]/80 via-[#050709]/95 to-[#050709]" />
        
        {/* Effet Halo Doré */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/20 blur-[150px] rounded-full pointer-events-none" 
        />

        <div className="relative z-10 max-w-4xl mx-auto mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="eyebrow text-gold mb-6 flex items-center justify-center gap-4"
          >
            <span className="w-12 h-px bg-gold/50" /> La Charte Officielle <span className="w-12 h-px bg-gold/50" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-8"
          >
            Au-delà du <span className="gold-text italic">Réseau.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-serif italic"
          >
            Les meilleures opportunités naissent de connexions qualifiées, de la confiance et de la valeur que chacun apporte aux autres.
          </motion.p>
        </div>
      </section>

      {/* ── 2. Le Choc de la Gratuité ── */}
      <section className="py-16 relative z-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-4">L'Adhésion ne s'achète pas.</h2>
            <p className="text-xl text-gold-light font-serif italic">Elle résulte d'une expérience.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {["0 Frais d'inscription", "0 Cotisation Mensuelle", "0 Cotisation Annuelle"].map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="glass-strong p-6 rounded-sm text-center border border-gold/10 hover:border-gold/30 transition-colors group"
              >
                <div className="font-display text-7xl text-transparent bg-clip-text bg-gradient-to-b from-gold to-gold-light/20 mb-4 group-hover:scale-110 transition-transform duration-500">
                  0€
                </div>
                <div className="text-sm uppercase tracking-[0.2em] text-foreground/80 font-bold">{text}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Une personne devient automatiquement membre lorsqu'elle participe à une immersion BNE ou bénéficie d'un accompagnement éligible. Aucun paiement supplémentaire n'est demandé pour devenir membre.
          </div>
        </div>
      </section>

      {/* ── 3. Scroll-Spy des Articles ── */}
      <section className="py-16 bg-black relative border-y border-border">
        <div className="container max-w-7xl">
          <div className="grid md:grid-cols-12 gap-12 relative">
            
            {/* Sticky Sidebar */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <div className="sticky top-32">
                <h3 className="font-display text-2xl text-gold mb-8">Les Articles</h3>
                <div className="absolute left-0 top-16 bottom-0 w-px bg-border" />
                <ul className="space-y-6 relative z-10 ml-[1px]">
                  {[0, 3, 7, 11, 14].map((idx) => (
                     <li key={idx} className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-4">
                       <span className="w-4 h-px bg-gold/50" /> {articles[idx].title}
                     </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Articles List */}
            <div className="md:col-span-8 lg:col-span-9 space-y-12">
              {articles.map((article, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative group"
                >
                  <div className="text-gold/20 font-display text-7xl absolute -top-10 -left-6 z-0 select-none group-hover:text-gold/30 transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="relative z-10 pl-4 md:pl-10 border-l-2 border-gold/30">
                    <h3 className="font-display text-2xl md:text-3xl mb-4 text-foreground">{article.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {article.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. L'Essentiel : Les 7 Principes ── */}
      <section className="py-16 container max-w-6xl relative">
        <div className="text-center mb-20">
          <div className="eyebrow text-gold mb-4">L'Essentiel</div>
          <h2 className="font-display text-4xl md:text-5xl">La Charte en 7 Principes</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {septPrincipes.map((principe, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`luxe-card p-6 rounded-sm group relative overflow-hidden ${i === 6 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition-colors" />
              <principe.icon className="text-gold/50 mb-6 group-hover:text-gold transition-colors" size={32} />
              <div className="font-display text-xl mb-3">{principe.title}</div>
              <p className="text-sm text-muted-foreground">{principe.text}</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <CornerRightDown className="text-gold/30" size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. Engagement Final ── */}
      <section className="py-16 bg-black text-center relative overflow-hidden border-t border-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
            "Connecter les bonnes personnes pour créer les bonnes opportunités."
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-4 text-xs font-mono tracking-widest text-gold-light/60 uppercase mb-12">
            <span>Une expérience pour entrer.</span>
            <span className="hidden md:inline">•</span>
            <span>De la valeur pour rester.</span>
            <span className="hidden md:inline">•</span>
            <span>Des connexions pour grandir.</span>
          </div>
          <Link to="/contact" className="btn-gold inline-flex px-10 py-5 text-xs uppercase tracking-[0.2em] rounded-sm items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(197,160,89,0.3)]">
            Vivre l'expérience <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      
    </div>
  );
}
