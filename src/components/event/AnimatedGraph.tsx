import { motion } from "framer-motion";

export function AnimatedGraph() {
  const gridRows = 4;
  const gridCols = 6;

  // SVG dimensions
  const width = 300;
  const height = 120;

  // Path data for the rising growth curve
  const pathData = `M 10,${height - 10} C 60,${height - 20} 100,${height - 60} 150,${height - 50} C 200,${height - 40} 240,15 290,10`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-foreground/5 rounded-md border border-border/10 relative overflow-hidden h-36 w-full">
      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.25)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#293FFF" />
            <stop offset="50%" stopColor="#1B2DBF" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {Array.from({ length: gridRows }).map((_, i) => {
          const y = 10 + (i * (height - 20)) / (gridRows - 1);
          return (
            <line
              key={i}
              x1="10"
              y1={y}
              x2={width - 10}
              y2={y}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical grid lines */}
        {Array.from({ length: gridCols }).map((_, i) => {
          const x = 10 + (i * (width - 20)) / (gridCols - 1);
          return (
            <line
              key={i}
              x1={x}
              y1="10"
              x2={x}
              y2={height - 10}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
            />
          );
        })}

        {/* Area under the path (shaded) */}
        <motion.path
          d={`${pathData} L 290,${height - 10} L 10,${height - 10} Z`}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
        />

        {/* The Animated Line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
        />

        {/* Pulsing End Dot */}
        <motion.circle
          cx="290"
          cy="10"
          r="4.5"
          fill="#D4AF37"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{
            scale: { delay: 1.8, duration: 0.3 },
            repeat: Infinity,
            repeatDelay: 0.2,
            duration: 1.2,
          }}
          className="shadow-[0_0_12px_rgba(212,175,55,1)]"
        />

        <motion.circle
          cx="290"
          cy="10"
          r="9"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 2], opacity: [0.6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            delay: 1.8,
          }}
        />
      </svg>

      {/* Floating Indicators */}
      <div className="absolute top-2 left-4 text-[9px] uppercase tracking-wider text-muted-foreground">
        Capital Flow
      </div>
      <div className="absolute bottom-2 right-4 text-[9px] font-mono font-semibold text-gold">
        +312% Growth
      </div>
    </div>
  );
}
