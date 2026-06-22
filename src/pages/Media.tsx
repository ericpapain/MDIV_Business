import { useState } from "react";
import { media } from "@/data/mockData";
import { Play, Heart, Share2 } from "lucide-react";

// Vidéos de démonstration de 10 secondes hébergées sur Google Cloud (sans restriction CORS ni hotlinking)
const CONTEXT_VIDEOS: Record<string, string> = {
  m1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", // Web Série Ep 1 (Voyage)
  m2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",  // Founders by Night (Feu chaleureux)
  m3: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", // 48h à Monaco (Voyage)
  m4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",  // Une nuit au Crillon (Feu chaleureux)
  m5: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // L'art du Deal (Balade en voiture)
  m6: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Champagne & Pitch (Balade en voiture)
};

const DEFAULT_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

export default function Media() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <div className="pt-32 pb-20 container">
      <div className="text-center mb-16 animate-fade-up">
        <div className="eyebrow mb-4">Média Originaux</div>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95]">Inside <em className="italic gold-text">the Circle.</em></h1>
        <p className="mt-6 text-muted-foreground font-serif italic max-w-xl mx-auto">Web série, reels, documentaires. L'art de raconter l'invisible.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((m, i) => {
          const isPlaying = activeVideoId === m.id;
          return (
            <div key={m.id} className={`luxe-card rounded-sm overflow-hidden group ${i % 5 === 0 ? "lg:row-span-2" : ""}`}>
              <div className={`relative overflow-hidden h-full ${i % 5 === 0 ? "aspect-[3/5]" : "aspect-[4/5]"}`}>
                {isPlaying ? (
                  <div className="w-full h-full relative bg-background">
                    <video
                      className="w-full h-full object-cover"
                      src={CONTEXT_VIDEOS[m.id] || DEFAULT_VIDEO}
                      autoPlay
                      controls
                      loop
                      muted
                      playsInline
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideoId(null);
                      }}
                      className="absolute top-3 right-3 bg-background/80 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm font-semibold glass border border-gold/30 text-gold-light hover:text-primary transition-colors z-20"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <img src={m.image} alt={m.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-[0.22em] glass-strong rounded-sm text-gold-light">{m.type}</div>
                    <button 
                      onClick={() => setActiveVideoId(m.id)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-16 h-16 rounded-full btn-gold flex items-center justify-center"><Play size={20} className="ml-1" /></div>
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      <div className="font-display text-xl mb-2">{m.title}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">{m.duration}</div>
                        <div className="flex gap-2 text-muted-foreground">
                          <button className="hover:text-primary"><Heart size={14} /></button>
                          <button className="hover:text-primary"><Share2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}