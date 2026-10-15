// src/components/admin/analytics/AnalyticsDevicesSection.tsx
import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Monitor, Smartphone, Globe2, Cpu, HardDrive } from "lucide-react";
import type { DistributionItem } from "./types";

interface Props {
  devices: DistributionItem[];
  browsers: DistributionItem[];
  os: DistributionItem[];
}

const GOLD_CYAN_PALETTE = [
  "#D4AF37", // Or principal
  "#22d3ee", // Cyan
  "#818cf8", // Indigo
  "#34d399", // Émeraude
  "#fbbf24", // Ambre
  "#f472b6", // Rose
  "#94a3b8", // Slate
];

export function AnalyticsDevicesSection({ devices, browsers, os }: Props) {
  const [activeTab, setActiveTab] = useState<"devices" | "browsers" | "os">("devices");

  const currentList =
    activeTab === "devices" ? devices : activeTab === "browsers" ? browsers : os;

  const total = currentList.reduce((acc, item) => acc + (item.value || 0), 0) || 1;

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header avec Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <Monitor size={14} />
            <span>Technologies & Environnements</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Appareils, Navigateurs & Systèmes
          </h2>
        </div>

        {/* Tabs de bascule */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveTab("devices")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "devices"
                ? "bg-[#D4AF37] text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone size={13} />
            <span>Appareils</span>
          </button>
          <button
            onClick={() => setActiveTab("browsers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "browsers"
                ? "bg-[#D4AF37] text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe2 size={13} />
            <span>Navigateurs</span>
          </button>
          <button
            onClick={() => setActiveTab("os")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "os"
                ? "bg-[#D4AF37] text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu size={13} />
            <span>Systèmes (OS)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* DONUT CHART RECHARTS (5 Colonnes) */}
        <div className="lg:col-span-5 h-[240px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentList}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                stroke="#071526"
                strokeWidth={2}
              >
                {currentList.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GOLD_CYAN_PALETTE[index % GOLD_CYAN_PALETTE.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const pct = ((Number(data.value) / total) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg bg-[#071526]/95 border border-[#D4AF37]/40 p-2.5 shadow-xl text-xs backdrop-blur-md">
                        <div className="font-semibold text-white mb-1 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: data.payload.fill }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="font-mono text-slate-300">
                          {data.value} visites ({pct}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Badge central du Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-display font-bold text-white font-mono">
              {total}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Visites
            </span>
          </div>
        </div>

        {/* LISTE DÉTAILLÉE AVEC BARRES HORIZONTALES (7 Colonnes) */}
        <div className="lg:col-span-7 space-y-3">
          {currentList.map((item, index) => {
            const color = GOLD_CYAN_PALETTE[index % GOLD_CYAN_PALETTE.length];
            const pct = ((item.value / total) * 100).toFixed(1);

            return (
              <div
                key={item.name}
                className="group p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-medium text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                      style={{ background: color }}
                    />
                    <span>{item.name}</span>
                  </div>

                  <div className="font-mono flex items-center gap-3">
                    <span className="text-slate-300">{item.value}</span>
                    <span className="text-slate-400 font-semibold w-12 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Barre de progression avec la couleur exacte */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
