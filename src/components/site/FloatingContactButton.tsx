import { Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";

export function FloatingContactButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/contact"
        className="btn-gold flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform"
      >
        <PhoneCall size={18} />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Réserver un appel découverte</span>
      </Link>
    </div>
  );
}
