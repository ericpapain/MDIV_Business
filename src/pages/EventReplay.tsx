import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Quote, X } from "lucide-react";
import { events, images } from "@/data/mockData";
import { useEffect, useState } from "react";
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
    return (
      <div className="pt-40 pb-20 container text-center min-h-[60vh] flex flex-col items-center justify-center text-white">
        <h1 className="font-display text-4xl mb-6">Événement introuvable</h1>
        <Link to="/evenements" className="btn-ghost-gold px-6 py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2">
          <ArrowLeft size={14} /> Retour aux événements
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0d0f] min-h-screen text-white pt-20">
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
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-none mb-3 text-white drop-shadow-lg">
            {event.title}
          </h1>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-light mb-5 drop-shadow-md">
            {event.date} · {event.city}
          </div>
          <Link to="/evenements" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/80 hover:text-white transition-colors border border-white/20 px-4 py-2 rounded-sm bg-black/40 backdrop-blur-md">
            <ArrowLeft size={10} /> Retour aux événements
          </Link>
        </div>
      </section>

      {/* ── Moments d'immersion (Grid Vidéos/Photos) ── */}
      <section className="container py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-4xl md:text-5xl mb-2">Moments d'immersion</h2>
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
            <h3 className="font-display text-2xl md:text-3xl text-white/90">Interviews & Témoignages</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="relative w-full overflow-hidden rounded-sm py-2">
            <div className="flex w-max animate-marquee-reverse gap-4 md:gap-8 items-center">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 md:gap-8 shrink-0">
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[4/3] w-[260px] md:w-[360px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Cerise.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Cerise.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Cerise</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">3 mots à propos du séjour fondateur...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-square w-[220px] md:w-[320px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Hakan.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Hakan.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={16} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Hakan</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Témoignage</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-video w-[280px] md:w-[400px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Kassa-kassa.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Kassa-kassa.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Kassa-Kassa</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Retour du séjour fondateur...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[4/3] w-[260px] md:w-[360px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Pierre.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Pierre.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Pierre</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Retour séjour fondateur...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-square w-[220px] md:w-[320px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Micke-1BNE.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Micke-1BNE.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={16} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Micke</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Initiateur BNE...</div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            {/* Dégradés pour masquer les bords */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#0a0d0f] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#0a0d0f] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Défilement Automatique Vidéos - Section 2 : Ambiance & Masterclass (Marquee Normal) */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6 flex-row-reverse">
            <h3 className="font-display text-2xl md:text-3xl text-white/90">Ambiance & Masterclass</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
          </div>
          <div className="relative w-full overflow-hidden rounded-sm py-2">
            <div className="flex w-max animate-marquee gap-4 md:gap-8 items-center">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 md:gap-8 shrink-0">
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-video w-[280px] md:w-[420px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Visite-Champagne-Trailer.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Visite-Champagne-Trailer.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Trailer</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Visite Champagne</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[3/4] w-[200px] md:w-[280px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Micke-2BNE.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Micke-2BNE.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={16} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Micke</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Ambiance BNE...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[3/4] w-[200px] md:w-[280px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Mathilda-Ret-Champ.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Mathilda-Ret-Champ.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={16} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Mathilda</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Retour Champagne...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-video w-[260px] md:w-[380px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/Imp_Reseau_Olivier.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/Imp_Reseau_Olivier.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Olivier</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Importance du réseau...</div>
                    </div>
                  </div>

                  <div 
                    className="relative overflow-hidden rounded-sm aspect-video w-[280px] md:w-[420px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveVideo("/videos/His-champ-Dautel-Cadot.mp4")}
                  >
                    <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
                      <source src="/videos/His-champ-Dautel-Cadot.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Play className="text-white ml-1" size={24} />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-sm font-display mb-1">Dautel-Cadot</div>
                      <div className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Histoire de notre champagne Dautel-Cadot...</div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            {/* Dégradés pour masquer les bords */}
            <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[#0a0d0f] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[#0a0d0f] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Défilement Automatique Photos (Marquee) */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-2xl md:text-3xl text-white/90">Galerie Privée</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="relative w-full overflow-hidden rounded-sm py-8 border-t border-b border-white/5 bg-black/20">
            <div className="flex w-max animate-marquee-reverse gap-4 md:gap-8 items-center">
              {/* On duplique le contenu pour l'effet infini */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 md:gap-8 shrink-0">
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[4/3] w-[220px] md:w-[320px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveImage(images.portrait1)}
                  >
                    <img src={images.portrait1} alt="Participant" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-square w-[180px] md:w-[260px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveImage(images.eventNetworking)}
                  >
                    <img src={images.eventNetworking} alt="Networking" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-[3/4] w-[180px] md:w-[240px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveImage(images.expDining)}
                  >
                    <img src={images.expDining} alt="Diner" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div 
                    className="relative overflow-hidden rounded-sm aspect-video w-[260px] md:w-[380px] shrink-0 group border border-white/5 cursor-pointer"
                    onClick={() => setActiveImage(images.expHotel)}
                  >
                    <img src={images.expHotel} alt="Hotel" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                </div>
              ))}
            </div>
            {/* Dégradés pour masquer les bords */}
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
                <p className="text-xl md:text-2xl leading-relaxed mb-10 italic font-serif text-white/90">
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
                <div className="absolute -top-3 -right-3 bg-[#0a66c2] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Vu sur LinkedIn
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img src={mickePhoto} alt="Micke Ponho Dimvula" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-base leading-tight text-gray-900">Micke Ponho Dimvula</div>
                    <div className="text-xs text-gray-600 mt-0.5">CEO & Fondateur, M.DIV Consulting · 1er</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Il y a 3 mois</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            <video 
              key={activeVideo}
              src={activeVideo} 
              autoPlay 
              controls 
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      {/* ── Modal Image ── */}
      {activeImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-transparent rounded-lg flex items-center justify-center">
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute top-0 right-0 md:-right-12 md:-top-12 z-10 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={activeImage} 
              alt="Aperçu" 
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
