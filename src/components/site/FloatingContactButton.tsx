import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";

export function FloatingContactButton() {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <Link
        to="/contact"
        className="btn-gold flex items-center gap-0 md:gap-3 p-3 md:px-5 md:py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <PhoneCall size={18} />
        <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] font-bold">Réserver un appel découverte</span>
      </Link>
    </div>
  );
}
