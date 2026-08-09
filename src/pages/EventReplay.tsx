import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Quote, X, Calendar, MapPin, Users, Image as ImageIcon, Video, Clock, Award, Star, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

export default function EventReplay() {
  const { id } = useParams();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("apercu");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data: dbEvents, isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=events");
      const json = await res.json();
      return json.data || { upcoming: [], past: [] };
    }
  });

  if (isLoading) {
    return <div className="pt-40 pb-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full" /></div>;
  }

  const allPastEvents = dbEvents?.past || [];
  const event = allPastEvents.find((e: any) => e.id.toString() === id?.toString());

  if (!event) {
    return (
      <div className="pt-40 pb-20 container text-center min-h-[60vh] flex flex-col items-center justify-center text-foreground">
        <h1 className="font-display text-4xl mb-6">Événement introuvable</h1>
        <Link to="/evenements" className="btn-ghost-gold px-6 py-3 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2">
          <ArrowLeft size={14} /> Retour aux événements
        </Link>
      </div>
    );
  }

  // Parser le replay_data
  let replayData = {
    hero_video_url: "",
    stats: { participants: "", photos: "", videos: "", duration: "" },
    highlights: [],
    photos: [],
    videos: [],
    testimonials: [],
    souvenirs: { quote: "", key_figures: "" }
  };

  if (event.replay_data) {
    try {
      replayData = { ...replayData, ...JSON.parse(event.replay_data) };
    } catch (e) {
      console.error("Erreur parsing replay_data", e);
    }
  }

  const similarEvents = allPastEvents.filter((e: any) => e.id.toString() !== id?.toString()).slice(0, 3);

  const extractYouTubeId = (url: string) => {
    if (!url) return "";
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^"&?\/\s]{11})/);
    return match ? match[1] : url; 
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground relative selection:bg-gold/30 selection:text-gold-light">
      
      {/* ── 1. Hero Header ── */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {replayData.hero_video_url ? (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
            <source src={replayData.hero_video_url} type="video/mp4" />
          </video>
        ) : (
          <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 animate-ken-burns" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d0f] via-[#0a0d0f]/60 to-transparent" />
        
        <div className="relative z-10 container text-center pt-20 animate-fade-up">
          <div className="eyebrow mb-6 flex items-center justify-center gap-3 text-gold">
            <span className="w-12 h-px bg-gold/60" /> Archives Confidentielles <span className="w-12 h-px bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6 text-foreground drop-shadow-2xl">
            {event.title}
          </h1>
          <div className="flex items-center justify-center gap-6 font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-gold-light mb-8 drop-shadow-md">
            <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><MapPin size={14} /> {event.location}</span>
          </div>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 font-serif italic mb-10">
            {event.description}
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => scrollToSection('apercu')} className="btn-gold px-8 py-4 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-3 shadow-[0_0_30px_rgba(197,160,89,0.2)]">
              Revivre l'expérience <ArrowRight size={14} />
            </button>
            <Link to="/evenements" className="btn-ghost-gold px-6 py-4 text-xs uppercase tracking-[0.2em] rounded-sm flex items-center gap-2 bg-black/20 backdrop-blur-md">
              <ArrowLeft size={14} /> Événements
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Statistiques ── */}
      <section className="relative z-20 -mt-16 container">
        <div className="glass-strong rounded-sm border border-gold/10 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-2xl backdrop-blur-xl bg-[#0f1318]/90">
          <div className="text-center group">
            <Users className="mx-auto mb-3 text-gold/50 group-hover:text-gold transition-colors" size={24} />
            <div className="font-display text-3xl md:text-4xl text-gold-light mb-1">{replayData.stats?.participants || "-"}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Participants</div>
          </div>
          <div className="text-center group border-l border-gold/10">
            <ImageIcon className="mx-auto mb-3 text-gold/50 group-hover:text-gold transition-colors" size={24} />
            <div className="font-display text-3xl md:text-4xl text-gold-light mb-1">{replayData.stats?.photos || "-"}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Photos</div>
          </div>
          <div className="text-center group border-l border-gold/10">
            <Video className="mx-auto mb-3 text-gold/50 group-hover:text-gold transition-colors" size={24} />
            <div className="font-display text-3xl md:text-4xl text-gold-light mb-1">{replayData.stats?.videos || "-"}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vidéos</div>
          </div>
          <div className="text-center group border-l border-gold/10">
            <Clock className="mx-auto mb-3 text-gold/50 group-hover:text-gold transition-colors" size={24} />
            <div className="font-display text-3xl md:text-4xl text-gold-light mb-1">{replayData.stats?.duration || "-"}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Durée</div>
          </div>
        </div>
      </section>

      {/* ── 3. Navigation par onglets (Sticky) ── */}
      <div className="sticky top-[72px] z-40 bg-[#0a0d0f]/95 backdrop-blur-xl border-b border-border py-4 mt-12 transition-all">
        <div className="container flex items-center justify-center gap-2 md:gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'apercu', label: 'Aperçu' },
            { id: 'photos', label: 'Galerie Photos' },
            { id: 'videos', label: 'Vidéos' },
            { id: 'highlights', label: 'Temps forts' },
            { id: 'testimonials', label: 'Témoignages' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`whitespace-nowrap text-[10px] md:text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-gold/10 text-gold border border-gold/30' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container space-y-32 py-20">
        
        {/* ── 8. Souvenirs (Aperçu) ── */}
        <section id="apercu" className="scroll-mt-32 max-w-4xl mx-auto text-center space-y-12">
          {replayData.souvenirs?.quote && (
            <div className="relative p-10 md:p-16">
              <Quote className="absolute top-0 left-0 text-gold/10 w-24 h-24" />
              <p className="font-serif italic text-2xl md:text-4xl leading-relaxed text-foreground/90 relative z-10">
                "{replayData.souvenirs.quote}"
              </p>
            </div>
          )}
          {replayData.souvenirs?.key_figures && (
            <div className="inline-block border border-gold/20 bg-gold/5 px-8 py-6 rounded-sm">
              <Award className="mx-auto text-gold mb-3" size={32} />
              <div className="font-display text-xl">{replayData.souvenirs.key_figures}</div>
            </div>
          )}
        </section>

        {/* ── 5. Galerie Photos ── */}
        {(replayData.photos && replayData.photos.length > 0) && (
          <section id="photos" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Instants figés</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {replayData.photos.map((photo: string, index: number) => (
                <div 
                  key={index} 
                  className="relative group overflow-hidden rounded-sm cursor-pointer break-inside-avoid border border-border/50 bg-[#111]"
                  onClick={() => setActiveImage(photo)}
                >
                  <img src={photo} alt={`Souvenir ${index + 1}`} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-gold/50 bg-black/50 backdrop-blur-sm flex items-center justify-center text-gold">
                      <Plus size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. Galerie Vidéos ── */}
        {(replayData.videos && replayData.videos.length > 0) && (
          <section id="videos" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Expérience Vidéo</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>
            
            {/* Vidéo Principale */}
            <div className="relative aspect-video w-full rounded-sm overflow-hidden border border-border shadow-2xl bg-black mb-8 group cursor-pointer"
                 onClick={() => setActiveVideo(extractYouTubeId(replayData.videos[0].youtube_id))}>
              <img src={`https://i.ytimg.com/vi/${extractYouTubeId(replayData.videos[0].youtube_id)}/maxresdefault.jpg`} alt={replayData.videos[0].title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-[0_0_50px_rgba(197,160,89,0.5)] group-hover:scale-110 transition-transform duration-500">
                  <Play className="ml-2" size={32} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="font-display text-3xl mb-2">{replayData.videos[0].title}</h3>
                <p className="text-gold-light text-sm tracking-wider uppercase font-mono">{replayData.videos[0].description}</p>
              </div>
            </div>

            {/* Miniatures */}
            {replayData.videos.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {replayData.videos.slice(1).map((vid: any, i: number) => (
                  <div key={i} className="relative aspect-video rounded-sm overflow-hidden border border-border/50 group cursor-pointer bg-[#111]"
                       onClick={() => setActiveVideo(extractYouTubeId(vid.youtube_id))}>
                    <img src={`https://i.ytimg.com/vi/${extractYouTubeId(vid.youtube_id)}/hqdefault.jpg`} alt={vid.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-colors">
                        <Play className="ml-1" size={16} fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
                      <div className="text-xs font-bold line-clamp-1">{vid.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 4. Temps forts (Timeline) ── */}
        {(replayData.highlights && replayData.highlights.length > 0) && (
          <section id="highlights" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-16">
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Chronologie des Temps Forts</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/0 via-gold/30 to-gold/0 md:-translate-x-1/2" />
              
              <div className="space-y-12">
                {replayData.highlights.map((hl: any, index: number) => (
                  <div key={index} className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    
                    <div className="absolute left-4 md:left-1/2 top-8 -translate-x-1/2 w-4 h-4 rounded-full bg-gold shadow-[0_0_15px_rgba(197,160,89,0.5)] border-4 border-background z-10" />
                    
                    <div className="ml-12 md:ml-0 md:w-1/2 flex-1 pt-6">
                      <div className={`glass-strong p-6 rounded-sm border border-gold/10 hover:border-gold/30 transition-colors ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className="text-gold font-mono text-sm tracking-widest mb-2">{hl.time}</div>
                        <h4 className="font-display text-2xl mb-3">{hl.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{hl.description}</p>
                      </div>
                    </div>
                    
                    <div className="ml-12 md:ml-0 md:w-1/2 flex-1">
                      {hl.image_url && (
                        <div className="rounded-sm overflow-hidden border border-border/50 aspect-video md:aspect-square lg:aspect-video mt-4 md:mt-0 relative group">
                          <img src={hl.image_url} alt={hl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 7. Témoignages ── */}
        {(replayData.testimonials && replayData.testimonials.length > 0) && (
          <section id="testimonials" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-16 text-center justify-center">
              <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent hidden md:block" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground px-4">Ils l'ont vécu</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent hidden md:block" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {replayData.testimonials.map((testi: any, index: number) => (
                <div key={index} className="luxe-card p-10 rounded-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors" />
                  <Quote className="text-gold/20 mb-6" size={40} />
                  <p className="font-serif italic text-lg leading-relaxed text-foreground/90 mb-8 relative z-10">
                    "{testi.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50 relative z-10">
                    {testi.image_url ? (
                      <img src={testi.image_url} alt={testi.name} className="w-12 h-12 rounded-full object-cover border border-gold/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold font-display text-xl">
                        {testi.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-display text-lg">{testi.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gold-light mt-0.5">{testi.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── 9. Événements Similaires ── */}
      {similarEvents.length > 0 && (
        <section className="bg-[#0a0d0f] py-20 border-t border-border">
          <div className="container">
            <h2 className="font-display text-3xl mb-12 text-center">Continuer l'exploration</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarEvents.map((sim: any) => (
                <Link key={sim.id} to={`/revivre/${sim.id}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden mb-4 border border-border/50">
                    <img src={sim.image_url} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="btn-ghost-gold px-6 py-2 text-[10px] uppercase tracking-[0.2em] rounded-sm bg-black/50 backdrop-blur-sm">Revivre</span>
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">{new Date(sim.date).toLocaleDateString()}</div>
                  <h3 className="font-display text-xl group-hover:text-gold transition-colors">{sim.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Call to action Final ── */}
      <section className="py-24 text-center container relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-display text-4xl md:text-5xl mb-6">Ne manquez pas la prochaine édition</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            L'excellence se vit en direct. Demandez votre invitation pour rejoindre le cercle lors de notre prochain rendez-vous.
          </p>
          <Link to="/contact" className="btn-gold inline-flex px-10 py-5 text-xs uppercase tracking-[0.2em] rounded-sm items-center gap-4 hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(197,160,89,0.3)]">
            Demander une invitation <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Modals Vidéo et Image ── */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveVideo(null)} title="Fermer" />
          <motion.div 
            drag
            dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
            dragMomentum={false}
            className="relative w-[1000px] max-w-full bg-black rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-gold/30 flex flex-col z-10"
          >
            {/* Barre de déplacement */}
            <div className="h-12 w-full bg-[#0a0d0f]/90 flex justify-between items-center px-6 cursor-grab active:cursor-grabbing border-b border-border rounded-t-3xl">
               <div className="flex gap-2">
                 <button onClick={() => setActiveVideo(null)} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
                 <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/50" />
                 <div className="w-3.5 h-3.5 rounded-full bg-green-500/50" />
               </div>
               <div className="text-[10px] font-mono tracking-[0.3em] text-gold-light/60 uppercase pointer-events-none">Glisser pour déplacer</div>
               <button onClick={() => setActiveVideo(null)} className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
                 <X size={18} />
               </button>
            </div>
            
            {/* Vidéo */}
            <div className="w-full aspect-video rounded-b-3xl overflow-hidden bg-black pointer-events-auto">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </motion.div>
        </div>
      )}

      {activeImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveImage(null)} title="Fermer" />
          <motion.div 
            drag
            dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
            dragMomentum={false}
            className="relative inline-block max-w-[90vw] max-h-[85vh] bg-[#0a0d0f] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-gold/30 flex flex-col z-10"
          >
            {/* Barre de déplacement */}
            <div className="h-12 w-full bg-[#0a0d0f] flex justify-between items-center px-6 cursor-grab active:cursor-grabbing border-b border-border rounded-t-3xl">
               <div className="flex gap-2">
                 <button onClick={() => setActiveImage(null)} className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
                 <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/50" />
                 <div className="w-3.5 h-3.5 rounded-full bg-green-500/50" />
               </div>
               <div className="text-[10px] font-mono tracking-[0.3em] text-gold-light/60 uppercase pointer-events-none">Glisser pour déplacer</div>
               <button onClick={() => setActiveImage(null)} className="text-muted-foreground hover:text-white transition-colors cursor-pointer">
                 <X size={18} />
               </button>
            </div>
            <div className="rounded-b-3xl overflow-hidden bg-black flex items-center justify-center pointer-events-auto max-h-[calc(85vh-48px)]">
              <img src={activeImage} alt="Aperçu HD" className="max-w-full max-h-full object-contain pointer-events-none" />
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-ken-burns {
          animation: ken-burns 20s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
