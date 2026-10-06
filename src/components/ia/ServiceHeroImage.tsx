import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Visuel illustratif des services IA.
 * Remplace les anciennes vidéos tierces (droits d'auteur) par une illustration originale.
 */
export default function ServiceHeroImage({ alt = "Illustration du service IA MDIV Business" }: { alt?: string }) {
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="relative w-full h-full group cursor-pointer" onClick={handleClick}>
      <img
        src="/images/service-ia-visual.jpg"
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Overlay dégradé pour faire ressortir le bouton et le texte */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent transition-opacity duration-300 group-hover:bg-slate-900/40" />

      {/* Contenu superposé (Play + Texte) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-transform duration-300 group-hover:scale-110 mb-4">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
      </div>
      
      {/* Texte en bas */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <p className="text-white font-semibold text-sm tracking-wide bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          Découvrir comment ça marche
        </p>
      </div>

      {/* Message "Arrive bientôt" */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl transition-all duration-300 pointer-events-none z-10 flex items-center gap-2 ${
          showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <span className="text-xl">🚀</span> Arrive bientôt !
      </div>
    </div>
  );
}
