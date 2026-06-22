import { motion } from "framer-motion";

export function InvestmentGraph() {
  const width = 300;
  const height = 120;

  // Path representing rising investment returns (high-growth trajectory)
  const pathData = `M 10,${height - 15} C 70,${height - 25} 120,${height - 90} 180,${height - 75} C 220,${height - 65} 250,25 290,15`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-md border border-white/10 relative overflow-hidden h-36 w-full">
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="invChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(231, 196, 106, 0.2)" />
            <stop offset="100%" stopColor="rgba(231, 196, 106, 0)" />
          </linearGradient>
          <linearGradient id="invLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0b153b" />
            <stop offset="60%" stopColor="#1B2DBF" />
            <stop offset="100%" stopColor="#E7C46A" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = 15 + (i * (height - 30)) / 3;
          return (
            <line
              key={i}
              x1="10"
              y1={y}
              x2={width - 10}
              y2={y}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Shaded Area under Curve */}
        <motion.path
          d={`${pathData} L 290,${height - 15} L 10,${height - 15} Z`}
          fill="url(#invChartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        />

        {/* The Curve line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#invLineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
        />

        {/* Interactive Glowing End Dot */}
        <motion.circle
          cx="290"
          cy="15"
          r="4"
          fill="#E7C46A"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            scale: { delay: 2, duration: 0.3 },
            repeat: Infinity,
            repeatDelay: 0.3,
            duration: 1,
          }}
        />

        <motion.circle
          cx="290"
          cy="15"
          r="8"
          fill="none"
          stroke="#E7C46A"
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            delay: 2,
          }}
        />
      </svg>

      <div className="absolute top-2 left-4 text-[9px] uppercase tracking-wider text-white/50">
        Fundraising Curve
      </div>
      <div className="absolute bottom-2 right-4 text-[9px] font-mono font-semibold text-goldLight">
        Target: €15M+
      </div>
    </div>
  );
}
