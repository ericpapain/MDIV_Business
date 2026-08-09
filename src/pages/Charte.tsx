import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Shield, Handshake, Globe, Zap, ArrowRight, CornerRightDown, Fingerprint, CreditCard, Users, RefreshCw, Key, Timer, ShieldAlert, Star, Lock, Briefcase, Heart, Network, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Charte() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const { language } = useLanguage();
  const isEn = language === "en";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const articles = isEn ? [
    { title: "THE BNE DNA", desc: "EXPERIENCE → CONNECTION → CONTRIBUTION → DEVELOPMENT → OPPORTUNITIES. The value of the network depends directly on the quality of relationships and the ability of its members to create value together.", icon: Fingerprint },
    { title: "MEMBERSHIP WITHOUT FEES", desc: "No registration fees, no monthly fees, no annual fees. Membership in BNE cannot be bought; it results from an experience or BNE coaching.", icon: CreditCard },
    { title: "PARTICIPANT, MEMBER, AND ACTIVE MEMBER", desc: "BNE prioritizes the quality of engagement over the quantity of members. An active member maintains a real relationship with the ecosystem and contributes to its dynamics.", icon: Users },
    { title: "RECIPROCITY", desc: "« Give value to create value. » Each member contributes according to their skills, possibilities, and network.", icon: RefreshCw },
    { title: "MEMBER RIGHTS", desc: "Develop your network, be connected, participate in experiences, present your expertise, and develop national and international collaborations.", icon: Key },
    { title: "MEMBER COMMITMENTS", desc: "Respect the spirit of BNE, recommend members, preserve confidentiality, and adopt a professional attitude. BNE does not ask you to sell it, but to represent it through the value created.", icon: Handshake },
    { title: "NO DURATION OBLIGATION", desc: "No minimum commitment duration, no annual contract, no recommendation quota. Each member remains free in their level of participation.", icon: Timer },
    { title: "NOT A PROSPECTING PLATFORM", desc: "Aggressive prospecting or misuse of contact details is incompatible with the spirit of the network. The relationship comes before the transaction.", icon: ShieldAlert },
    { title: "QUALITY AND SELECTION", desc: "Integration into certain experiences may be subject to selection based on profile, objectives, and complementarities.", icon: Star },
    { title: "CONFIDENTIALITY AND TRUST", desc: "Information, contacts, or opportunities shared must be treated with discretion. Each member commits to respecting confidentiality.", icon: Lock },
    { title: "RESPONSIBILITY AND OPPORTUNITIES", desc: "BNE facilitates meetings but guarantees no results. Each member remains responsible for their decisions and commitments.", icon: Briefcase },
    { title: "ETHICS AND BEHAVIOR", desc: "Respect, Integrity, Professionalism, Contribution, Reciprocity, Openness. Any behavior contrary to these can lead to the suspension of network access.", icon: Heart },
    { title: "AN INTERNATIONAL NETWORK", desc: "BNE is organized around local ecosystems while fostering national and international connections.", icon: Globe },
    { title: "THE ROLE OF BNE", desc: "BNE acts as a facilitator between individuals, companies, and territories. It seeks to create a more relevant network, not just a larger one.", icon: Network },
    { title: "THE BNE PHILOSOPHY", desc: "« I don't just come looking for an opportunity. I also come with the ability to create one for someone else. »", icon: Lightbulb }
  ] : [
    { title: "L'ADN DU BNE", desc: "EXPÉRIENCE → CONNEXION → CONTRIBUTION → DÉVELOPPEMENT → OPPORTUNITÉS. La valeur du réseau dépend directement de la qualité des relations et de la capacité de ses membres à créer de la valeur ensemble.", icon: Fingerprint },
    { title: "UNE ADHÉSION SANS COTISATION", desc: "Aucun frais d'inscription, aucune cotisation mensuelle, aucune cotisation annuelle. L'adhésion au BNE ne s'achète pas, elle résulte d'une expérience ou d'un accompagnement BNE.", icon: CreditCard },
    { title: "PARTICIPANT, MEMBRE ET MEMBRE ACTIF", desc: "Le BNE privilégie la qualité de l'engagement plutôt que la quantité de membres. Un membre actif entretient une relation réelle avec l'écosystème et contribue à sa dynamique.", icon: Users },
    { title: "LA RÉCIPROCITÉ", desc: "« Donner de la valeur pour créer de la valeur. » Chaque membre contribue selon ses compétences, ses possibilités et son réseau.", icon: RefreshCw },
    { title: "LES DROITS DU MEMBRE", desc: "Développer son réseau, être mis en relation, participer aux expériences, présenter son expertise et développer des collaborations nationales et internationales.", icon: Key },
    { title: "LES ENGAGEMENTS DU MEMBRE", desc: "Respecter l'esprit du BNE, recommander les membres, préserver la confidentialité et adopter une attitude professionnelle. Le BNE ne demande pas de le vendre, mais de le représenter par la valeur créée.", icon: Handshake },
    { title: "PAS D'OBLIGATION DE DURÉE", desc: "Aucune durée minimale d'engagement, ni contrat annuel, ni quota de recommandations. Chaque membre reste libre de son niveau de participation.", icon: Timer },
    { title: "PAS UNE PLATEFORME DE PROSPECTION", desc: "La prospection agressive ou l'utilisation abusive des coordonnées sont incompatibles avec l'esprit du réseau. La relation vient avant la transaction.", icon: ShieldAlert },
    { title: "QUALITÉ ET SÉLECTION", desc: "L'intégration à certaines expériences peut faire l'objet d'une sélection selon le profil, les objectifs et les complémentarités.", icon: Star },
    { title: "CONFIDENTIALITÉ ET CONFIANCE", desc: "Les informations, contacts ou opportunités partagés doivent être traités avec discrétion. Chaque membre s'engage à respecter la confidentialité.", icon: Lock },
    { title: "RESPONSABILITÉ ET OPPORTUNITÉS", desc: "Le BNE facilite les rencontres, mais ne garantit aucun résultat. Chaque membre reste responsable de ses décisions et engagements.", icon: Briefcase },
    { title: "ÉTHIQUE ET COMPORTEMENT", desc: "Respect, Intégrité, Professionnalisme, Contribution, Réciprocité, Ouverture. Tout comportement contraire peut entraîner la suspension de l'accès au réseau.", icon: Heart },
    { title: "UN RÉSEAU INTERNATIONAL", desc: "Le BNE s'organise autour d'écosystèmes locaux tout en favorisant les connexions nationales et internationales.", icon: Globe },
    { title: "LE RÔLE DU BNE", desc: "Le BNE agit comme un facilitateur entre les personnes, les entreprises et les territoires. Il cherche à créer un réseau plus pertinent, pas simplement plus grand.", icon: Network },
    { title: "LA PHILOSOPHIE BNE", desc: "« Je ne viens pas seulement chercher une opportunité. Je viens aussi avec la capacité d'en créer une pour quelqu'un d'autre. »", icon: Lightbulb }
  ];

  const septPrincipes = isEn ? [
    { title: "EXPERIENCE", text: "Enter BNE through a true experience or coaching.", icon: Zap },
    { title: "TRUST", text: "Build lasting professional relationships.", icon: Shield },
    { title: "CONTRIBUTION", text: "Bring value before asking.", icon: Handshake },
    { title: "CONNECTION", text: "Create the right meetings at the right time.", icon: Globe },
    { title: "RECIPROCITY", text: "Circulate value within the network.", icon: Check },
    { title: "DEVELOPMENT", text: "Transform connections into collaborations and opportunities.", icon: ArrowRight },
    { title: "INTERNATIONAL", text: "Build bridges between entrepreneurs, companies, and territories.", icon: Globe }
  ] : [
    { title: "EXPÉRIENCE", text: "Entrer dans le BNE par une véritable expérience ou un accompagnement.", icon: Zap },
    { title: "CONFIANCE", text: "Construire des relations professionnelles durables.", icon: Shield },
    { title: "CONTRIBUTION", text: "Apporter avant de demander.", icon: Handshake },
    { title: "CONNEXION", text: "Créer les bonnes rencontres au bon moment.", icon: Globe },
    { title: "RÉCIPROCITÉ", text: "Faire circuler la valeur au sein du réseau.", icon: Check },
    { title: "DÉVELOPPEMENT", text: "Transformer les connexions en collaborations et opportunités.", icon: ArrowRight },
    { title: "INTERNATIONAL", text: "Créer des ponts entre entrepreneurs, entreprises et territoires.", icon: Globe }
  ];

  return (
    <div className="bg-[#0a0d0f] min-h-screen text-foreground font-sans overflow-hidden">
      
      {/* ── 1. Hero Header Immersif ── */}
      <section className="relative min-h-[60vh] py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d0f]/80 via-[#0a0d0f]/95 to-[#0a0d0f]" />
        
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
            <span className="w-12 h-px bg-gold/50" /> {isEn ? "The Official Charter" : "La Charte Officielle"} <span className="w-12 h-px bg-gold/50" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] mb-8"
          >
            {isEn ? "Beyond the " : "Au-delà du "}<span className="gold-text italic">{isEn ? "Network." : "Réseau."}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-serif italic"
          >
            {isEn 
              ? "The best opportunities arise from qualified connections, trust, and the value each person brings to others." 
              : "Les meilleures opportunités naissent de connexions qualifiées, de la confiance et de la valeur que chacun apporte aux autres."}
          </motion.p>
        </div>
      </section>

      {/* ── 2. Le Choc de la Gratuité ── */}
      <section className="py-16 relative z-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-4">{isEn ? "Membership Cannot Be Bought." : "L'Adhésion ne s'achète pas."}</h2>
            <p className="text-xl text-gold-light font-serif italic">{isEn ? "It is the result of an experience." : "Elle résulte d'une expérience."}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {(isEn 
              ? ["0 Registration Fee", "0 Monthly Fee", "0 Annual Fee"]
              : ["0 Frais d'inscription", "0 Cotisation Mensuelle", "0 Cotisation Annuelle"]
            ).map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="glass-strong p-6 rounded-2xl text-center border border-gold/10 hover:border-gold/30 transition-colors group relative overflow-hidden"
              >
                <div className="font-display text-7xl text-transparent bg-clip-text bg-gradient-to-b from-gold to-gold-light/20 mb-4 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  0€
                </div>
                <div className="text-sm uppercase tracking-[0.2em] text-foreground/80 font-bold relative z-10">{text}</div>
                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            {isEn 
              ? "A person automatically becomes a member when they participate in a BNE immersion or benefit from eligible coaching. No additional payment is required to become a member."
              : "Une personne devient automatiquement membre lorsqu'elle participe à une immersion BNE ou bénéficie d'un accompagnement éligible. Aucun paiement supplémentaire n'est demandé pour devenir membre."}
          </div>
        </div>
      </section>

      {/* ── 3. Scroll-Spy des Articles ── */}
      <section className="py-16 bg-[#0a0d0f] relative border-y border-border">
        <div className="container max-w-7xl">
          <div className="grid md:grid-cols-12 gap-12 relative">
            
            {/* Sticky Sidebar */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3">
              <div className="sticky top-32">
                <h3 className="font-display text-2xl text-gold mb-8">{isEn ? "The Articles" : "Les Articles"}</h3>
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
                  className="relative group luxe-card p-8 md:p-10 rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 right-0 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 flex items-center justify-end pointer-events-none">
                     <article.icon className="w-64 h-64 text-gold translate-x-8 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-700" />
                  </div>

                  <div className="text-gold/20 font-display text-5xl md:text-6xl mb-6 select-none group-hover:text-gold/40 transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                  
                  <div className="relative z-10 border-l-2 border-gold/30 pl-4 md:pl-6">
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
          <div className="eyebrow text-gold mb-4">{isEn ? "The Essentials" : "L'Essentiel"}</div>
          <h2 className="font-display text-4xl md:text-5xl">{isEn ? "The Charter in 7 Principles" : "La Charte en 7 Principes"}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {septPrincipes.map((principe, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`luxe-card p-8 rounded-2xl group relative overflow-hidden ${i === 6 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition-colors" />
              
              {/* Interactive Background Icon */}
              <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-500 pointer-events-none">
                <principe.icon className="w-32 h-32 text-gold" />
              </div>

              <principe.icon className="text-gold/50 mb-6 group-hover:text-gold transition-colors relative z-10" size={32} />
              <div className="font-display text-xl mb-3 relative z-10">{principe.title}</div>
              <p className="text-sm text-muted-foreground relative z-10">{principe.text}</p>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CornerRightDown className="text-gold/30" size={24} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. Engagement Final ── */}
      <section className="py-16 bg-[#0a0d0f] text-center relative overflow-hidden border-t border-border">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl mb-8 leading-tight">
            "{isEn ? "Connecting the right people to create the right opportunities." : "Connecter les bonnes personnes pour créer les bonnes opportunités."}"
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-4 text-xs font-mono tracking-widest text-gold-light/60 uppercase mb-12">
            <span>{isEn ? "An experience to enter." : "Une expérience pour entrer."}</span>
            <span className="hidden md:inline">•</span>
            <span>{isEn ? "Value to remain." : "De la valeur pour rester."}</span>
            <span className="hidden md:inline">•</span>
            <span>{isEn ? "Connections to grow." : "Des connexions pour grandir."}</span>
          </div>
          <Link to="/contact" className="btn-gold inline-flex px-10 py-5 text-xs uppercase tracking-[0.2em] rounded-sm items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(197,160,89,0.3)]">
            {isEn ? "Live the experience" : "Vivre l'expérience"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      
    </div>
  );
}
