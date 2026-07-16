import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface TimelineCardProps {
  time?: string;
  badge?: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  specialAnimation?: React.ReactNode;
  delay?: number;
}

export function TimelineCard({
  time,
  badge,
  title,
  description = "",
  icon: Icon,
  specialAnimation,
  delay = 0,
}: TimelineCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D tilt effect
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [7, -7]);
  const rotateY = useTransform(x, [0, 1], [-7, 7]);

  // Mouse tracking for glare/light sweep reflection
  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(y, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    // Reset values smoothly
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
        delay: delay,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="relative w-full max-w-lg mx-auto bg-white/[0.04] backdrop-blur-md rounded-sm border border-white/10 p-3 sm:p-4 md:p-8 hover:border-gold/30 transition-colors duration-500 shadow-2xl flex flex-col gap-3 sm:gap-4 md:gap-5 group"
    >
      {/* Glare Shine Overlay */}
      <motion.div
        style={{
          background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
        className="absolute inset-0 pointer-events-none rounded-sm z-20"
      />

      {/* Subtle border shine effect */}
      <div className="absolute inset-px bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-sm" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 z-10 w-full overflow-hidden">
        {time && (
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold font-semibold shrink-0 break-words whitespace-normal">
            {time}
          </span>
        )}
        {badge && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] px-1.5 sm:px-2 py-0.5 rounded-sm bg-primary/20 border border-primary/40 text-secondary-foreground font-semibold shrink-0 w-fit max-w-full break-words whitespace-normal">
            {badge}
          </span>
        )}
      </div>

      {/* Card Visual / Graphic */}
      {Icon && (
        <div className="relative aspect-[21/9] w-full rounded-sm overflow-hidden border border-white/5 bg-gradient-to-br from-[#0b153b]/50 to-[#030415] z-10 flex items-center justify-center group-hover:border-gold/20 transition-colors duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gold/60 transform group-hover:scale-110 group-hover:text-gold transition-all duration-700 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" strokeWidth={1.5} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05071F]/80 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Special Inline Animation (like animated charts, bubbles, or waves) */}
      {specialAnimation && <div className="w-full relative z-10">{specialAnimation}</div>}

      {/* Card Title & Description */}
      <div className="flex flex-col gap-2 z-10 w-full overflow-hidden" style={{ transform: "translateZ(10px)" }}>
        <h3 className="font-display text-lg sm:text-xl md:text-2xl text-white group-hover:text-gold transition-colors duration-300 break-words whitespace-normal">
          {title}
        </h3>
        {description && <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light break-words whitespace-normal">{description}</p>}
      </div>

      {/* Corner decorations to match general site styles */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold/20 pointer-events-none group-hover:border-gold/50 transition-colors duration-500" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold/20 pointer-events-none group-hover:border-gold/50 transition-colors duration-500" />
    </motion.div>
  );
}
