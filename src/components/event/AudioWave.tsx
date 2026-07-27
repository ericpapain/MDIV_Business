import { motion } from "framer-motion";

export function AudioWave() {
  const barsCount = 14;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-foreground/5 rounded-md border border-border/10 relative overflow-hidden h-28 w-full group">
      {/* Background ripple circles (ondes sonores) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full border border-gold/40"
        />
        <motion.div
          animate={{ scale: [1.2, 2.2, 1.2], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-20 h-20 rounded-full border border-gold/20"
        />
      </div>

      {/* Bouncing Audio Bars */}
      <div className="flex items-end gap-1 z-10 h-12">
        {Array.from({ length: barsCount }).map((_, i) => {
          // Curated heights to form a nice wave crest in the center
          const distFromCenter = Math.abs(i - Math.floor(barsCount / 2));
          const baseHeight = Math.max(10, 48 - distFromCenter * 6);

          return (
            <motion.div
              key={i}
              animate={{
                height: [
                  `${baseHeight * 0.3}px`,
                  `${baseHeight}px`,
                  `${baseHeight * 0.5}px`,
                  `${baseHeight * 1.1}px`,
                  `${baseHeight * 0.3}px`,
                ],
              }}
              transition={{
                duration: 1.2 + (i % 3) * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.05,
              }}
              style={{ originY: 1 }}
              className="w-1 rounded-full bg-gradient-to-t from-gold via-gold-light to-white shadow-[0_0_10px_rgba(212,175,55,0.5)]"
            />
          );
        })}
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-gold/80 mt-3 font-semibold z-10 animate-pulse-soft">
        Audio Session active
      </div>
    </div>
  );
}
