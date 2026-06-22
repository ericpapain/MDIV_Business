import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface TimelineCardProps {
  time?: string;
  badge?: string;
  title: string;
  description: string;
  image?: string;
  specialAnimation?: React.ReactNode;
  delay?: number;
}

export function TimelineCard({
  time,
  badge,
  title,
  description,
  image,
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
      className="relative w-full max-w-lg mx-auto bg-white/[0.04] backdrop-blur-md rounded-sm border border-white/10 p-6 md:p-8 hover:border-gold/30 transition-colors duration-500 shadow-2xl flex flex-col gap-5 group"
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
      <div className="flex items-center justify-between gap-4 z-10">
        {time && (
          <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
            {time}
          </span>
        )}
        {badge && (
          <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm bg-primary/20 border border-primary/40 text-secondary-foreground font-semibold">
            {badge}
          </span>
        )}
      </div>

      {/* Card Visual / Graphic */}
      {image && (
        <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden border border-white/5 bg-[#030415] z-10">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05071F]/80 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Special Inline Animation (like animated charts, bubbles, or waves) */}
      {specialAnimation && <div className="w-full relative z-10">{specialAnimation}</div>}

      {/* Card Title & Description */}
      <div className="flex flex-col gap-2 z-10" style={{ transform: "translateZ(10px)" }}>
        <h3 className="font-display text-xl md:text-2xl text-white group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-white/70 leading-relaxed font-light">{description}</p>
      </div>

      {/* Corner decorations to match general site styles */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold/20 pointer-events-none group-hover:border-gold/50 transition-colors duration-500" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold/20 pointer-events-none group-hover:border-gold/50 transition-colors duration-500" />
    </motion.div>
  );
}
