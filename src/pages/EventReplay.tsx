import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Quote, X } from "lucide-react";
import { events, images } from "@/data/mockData";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import mickePhoto from "@/assets/original/CEO.jpg";
import kassaPhoto from "@/assets/profils/kassa.jpg";

const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

export default function EventReplay() {
  const { id } = useParams();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const event = events.past.find(e => e.id === id);

  if (!event) {
  
const immersionVideos = [
  { id: 'KMZT7eYhURA', title: 'Cerise', desc: 'LA FORCE DE LA DIVERSITÉ DES PROFILS' },
  { id: 'Kvlq85gxpdY', title: 'Témoignage', desc: "L'ÉCOSYSTÈME UNE RÉELLE OPPORTUNITÉ" },
  { id: 'Ycsw4STiU_I', title: 'Micke', desc: 'LA NAISSANCE DU BNE' },
  { id: 'dJAelLe1ZmY', title: 'Olivier', desc: "L'IMPORTANCE DU RÉSEAU" },
  { id: 'X8kX2YtiDuA', title: 'Partenaire', desc: 'FOCUS PARTENAIRE' },
];

  return (
      <div className="pt-40 pb-20 container text-center min-h-[60vh] flex flex-col items-center justify-center text-foreground">
        <h1 className="font-display text-4xl mb-6">Événement introuvable</h1>
        <Link to="/evenements" className="btn-ghost-gold px-6 py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2">
          <ArrowLeft size={14} /> Retour aux événements
        </Link>
      </div>
    );
  }


const immersionVideos = [
  { id: 'KMZT7eYhURA', title: 'Cerise', desc: 'LA FORCE DE LA DIVERSITÉ DES PROFILS' },
  { id: 'Kvlq85gxpdY', title: 'Témoignage', desc: "L'ÉCOSYSTÈME UNE RÉELLE OPPORTUNITÉ" },
  { id: 'Ycsw4STiU_I', title: 'Micke', desc: 'LA NAISSANCE DU BNE' },
  { id: 'dJAelLe1ZmY', title: 'Olivier', desc: "L'IMPORTANCE DU RÉSEAU" },
  { id: 'X8kX2YtiDuA', title: 'Partenaire', desc: 'FOCUS PARTENAIRE' },
];

  return (
    <div className="bg-background min-h-screen text-foreground pt-20">
      {/* ── Hero Vidéo ── */}
      <section className="relative min-h-[22vh] py-10 md:py-12 w-full overflow-hidden flex items-center justify-center bg-black">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src={DEMO_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0f] via-black/40 to-transparent" />
        
        <div className="relative z-10 container text-center">
          <div className="eyebrow mb-2 flex items-center justify-center gap-3 text-gold">
            <span className="w-8 h-px bg-gold/60" /> Archives Confidentielles <span className="w-8 h-px bg-gold/60" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-none mb-3 text-foreground drop-shadow-lg">
            {event.title}
          </h1>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-light mb-5 drop-shadow-md">
            {event.date} · {event.city}
          </div>
          <Link to="/evenements" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground transition-colors border border-border/20 px-4 py-2 rounded-sm bg-black/40 dark:bg-black/40 bg-foreground/20 backdrop-blur-md">
            <ArrowLeft size={10} /> Retour aux événements
          </Link>
        </div>
      </section>

      {/* ── Moments d'immersion (Grid Vidéos/Photos) ── */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl mb-2">Moments d'immersion</h2>
            <p className="text-muted-foreground font-serif italic text-lg">L'essence de nos rencontres en images.</p>
          </div>
          <div className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/20 px-3 py-1.5 rounded-sm bg-gold/5">
            Galerie Privée
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee-reverse {
            animation: marquee-reverse 35s linear infinite;
          }
          .animate-marquee:hover, .animate-marquee-reverse:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        {/* Défilement Automatique Vidéos - Section 1 : Interviews (Marquee Inversé) */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-xl md:text-2xl text-foreground/90">Interviews & Témoignages</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="relative w-full overflow-hidden rounded-sm py-2">
            <div className="flex w-max animate-marquee-reverse gap-4 md:gap-8 items-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 md:gap-8 shrink-0">
                  {immersionVideos.map((vid) => (
                    <div 
                      key={vid.id}
                      className="relative overflow-hidden rounded-sm aspect-[9/16] w-[140px] md:w-[180px] shrink-0 group border border-border/50 cursor-pointer"
                      onClick={() => setActiveVideo(`https://www.youtube.com/shorts/${vid.id}`)}
                    >
                      <img src={`https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg`} alt={vid.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 dark:bg-black/40 bg-foreground/20 group-hover:bg-black/20 dark:bg-black/20 bg-foreground/10 transition-colors duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-foreground/10 dark:bg-foreground/10 bg-background/50 backdrop-blur-md flex items-center justify-center border border-border/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          <Play className="text-foreground ml-1" size={18} />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-sm font-display mb-1">{vid.title}</div>
                        <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest leading-tight">{vid.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
<div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#0a0d0f] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#0a0d0f] to-transparent pointer-events-none" />
          </div>
        </div>


      </section>

      {/* ── Témoignages & LinkedIn ── */}
      <section className="bg-[#0f1318] py-16 border-t border-b border-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-4">Ce qu'ils en disent</h2>
            <p className="text-muted-foreground font-serif italic text-lg">L'impact de nos rencontres à travers leurs mots.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Témoignage Participant */}
            <div className="relative p-10 md:p-14 rounded-sm border border-gold/20 bg-[#161b22] shadow-[0_20px_50px_-20px_rgba(197,160,89,0.15)]">
              <Quote className="absolute top-8 left-8 text-gold/20" size={80} />
              <div className="relative z-10">
                <p className="text-xl md:text-2xl leading-relaxed mb-10 italic font-serif text-foreground/90">
                  "Ce séjour a été une formidable opportunité de croiser des perspectives financières et économiques avec des entrepreneurs de premier plan. Les échanges confidentiels et de haut niveau créent une valeur réelle et immédiate."
                </p>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold/40">
                    <img src={kassaPhoto} alt="Kassa-Kassa" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-base mb-0.5">Kassa-Kassa</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Économiste - Financier - Fiscaliste</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extrait LinkedIn Fictif */}
            <div className="flex flex-col gap-6 transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="p-8 rounded-lg bg-white text-black shadow-2xl relative">
                <div className="absolute -top-3 -right-3 bg-[#0a66c2] text-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Vu sur LinkedIn
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img src={mickePhoto} alt="Micke Ponho Dimvula" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-base leading-tight text-gray-900">Micke Ponho Dimvula</div>
                    <div className="text-xs text-gray-600 mt-0.5">CEO & Fondateur, M.DIV Consulting · 1er</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Il y a 3 mois</div>
                  </div>
                </div>
                <p className="text-sm md:text-base leading-relaxed mb-4 text-gray-800">
                  Un immense plaisir d'avoir partagé ces moments d'exception lors du <strong>#{event.title.replace(/\s+/g, '')}</strong>. M.DIV s'engage à connecter les leaders et entrepreneurs autour d'opportunités réelles. 
                  <br/><br/>
                  Merci à tous nos membres fondateurs pour leur confiance et leur vision. Ensemble, nous façonnons l'excellence et le développement d'affaires de demain. 🚀
                </p>
                <div className="text-xs text-[#0a66c2] font-semibold hover:underline cursor-pointer mb-5">Voir la traduction</div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full"><span className="text-base">👍❤️💡</span> 284</span>
                  <span className="hover:underline cursor-pointer">42 commentaires · 12 partages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to action ── */}
      <section className="py-16 text-center container relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-5xl mb-6">Faites partie de la prochaine édition</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto text-lg leading-relaxed">
            Nos événements sont strictement sur invitation. Rejoignez le cercle privilégié pour accéder aux futurs rendez-vous.
          </p>
          <Link to="/contact" className="btn-gold inline-flex px-10 py-5 text-xs uppercase tracking-[0.2em] rounded-sm items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(197,160,89,0.3)]">
            Demander une invitation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      {/* ── Modal Vidéo ── */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-end p-4 md:p-8">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/20 bg-foreground/10 pointer-events-none backdrop-blur-sm" />
          
          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
            className="relative pointer-events-auto w-[280px] md:w-[320px] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-border/20 cursor-grab active:cursor-grabbing"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveVideo(null); }}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-foreground flex items-center justify-center hover:bg-white hover:text-black transition-colors pointer-events-auto"
            >
              <X size={16} />
            </button>
            <div className="w-full h-full pointer-events-auto">
              {activeVideo.includes('youtube.com') ? (
                <iframe
                  src={activeVideo.replace('/shorts/', '/embed/') + '?autoplay=1'}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <video 
                  key={activeVideo}
                  src={activeVideo} 
                  autoPlay 
                  controls 
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* ── Modal Image ── */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-transparent rounded-lg flex items-center justify-center">
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute top-0 right-0 md:-right-12 md:-top-12 z-10 w-12 h-12 rounded-full bg-black/50 dark:bg-black/50 bg-foreground/30 text-foreground flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
            <img 
              src={activeImage} 
              alt="Aperçu" 
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
