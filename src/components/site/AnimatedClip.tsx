import { Stethoscope, Handshake, ShieldCheck, ArrowRight } from "lucide-react";

export function AnimatedClip() {
  return (
    <div className="container py-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />


    </div>
  );
}
