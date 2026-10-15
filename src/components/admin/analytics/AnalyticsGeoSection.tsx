// src/components/admin/analytics/AnalyticsGeoSection.tsx
import { useState } from "react";
import { Globe, MapPin, Navigation } from "lucide-react";
import type { GeoItem } from "./types";

interface Props {
  countries: GeoItem[];
  cities: GeoItem[];
}

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  MA: "🇲🇦",
  CI: "🇨🇮",
  BE: "🇧🇪",
  CH: "🇨🇭",
  SN: "🇸🇳",
  CA: "🇨🇦",
  AE: "🇦🇪",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  ES: "🇪🇸",
  IT: "🇮🇹",
  DZ: "🇩🇿",
  TN: "🇹🇳",
  CM: "🇨🇲",
};

// Coordonnées approximatives pour l'affichage visuel des points sur la carte SVG (viewBox 0 0 800 400)
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  Paris: { x: 405, y: 110 },
  Lyon: { x: 410, y: 122 },
  Troyes: { x: 408, y: 114 },
  Marseille: { x: 412, y: 132 },
  Lille: { x: 406, y: 104 },
  Bordeaux: { x: 398, y: 124 },
  Casablanca: { x: 382, y: 155 },
  Rabat: { x: 384, y: 153 },
  Tanger: { x: 386, y: 147 },
  Abidjan: { x: 395, y: 220 },
  Bruxelles: { x: 410, y: 105 },
  Genève: { x: 416, y: 120 },
  Dakar: { x: 360, y: 200 },
  Montréal: { x: 250, y: 115 },
  Dubaï: { x: 535, y: 165 },
};

export function AnalyticsGeoSection({ countries, cities }: Props) {
  const [activeTab, setActiveTab] = useState<"countries" | "cities">("countries");
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const totalVisitors = countries.reduce((acc, c) => acc + (c.visitors || 0), 0) || 1;

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header avec Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <Globe size={14} />
            <span>Géolocalisation & Origine du Trafic</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Répartition Internationale des Visiteurs
          </h2>
        </div>

        {/* Tabs Pays / Villes */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/10">
          <button
            onClick={() => setActiveTab("countries")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "countries"
                ? "bg-[#D4AF37] text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Par Pays ({countries.length})
          </button>
          <button
            onClick={() => setActiveTab("cities")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === "cities"
                ? "bg-[#D4AF37] text-black font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Par Ville ({cities.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CARTE MONDIALE INTERACTIVE / HEATMAP (7 Colonnes) */}
        <div className="lg:col-span-7 rounded-xl bg-black/40 border border-white/10 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Navigation size={13} className="text-[#22d3ee]" />
              <span>Carte des Connexions & Points Chauds</span>
            </div>
            {hoveredCity && (
              <div className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
                {hoveredCity}
              </div>
            )}
          </div>

          {/* SVG Carte Stylisée avec Continents en filigrane et Hotspots lumineux */}
          <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center">
            <svg viewBox="0 0 800 400" className="w-full h-full text-slate-800 select-none">
              {/* Graticule subtil */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                </pattern>
                {/* Filtre de glow pour les hotspots */}
                <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="800" height="400" fill="transparent" />
              <rect width="800" height="400" fill="url(#grid)" />

              {/* Lignes de repère des tropiques et équateur */}
              <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="800" y2="130" stroke="rgba(212,175,55,0.05)" strokeDasharray="2 4" />
              <line x1="0" y1="270" x2="800" y2="270" stroke="rgba(34,211,238,0.05)" strokeDasharray="2 4" />

              {/* Silhouettes stylisées simplifiées des continents majeurs */}
              {/* Europe */}
              <path
                d="M380,80 Q420,70 450,90 Q440,140 400,145 Q375,130 380,80 Z"
                fill="rgba(212,175,55,0.07)"
                stroke="rgba(212,175,55,0.2)"
                strokeWidth="1"
              />
              {/* Afrique */}
              <path
                d="M370,150 Q430,150 450,200 Q430,280 400,320 Q360,250 350,190 Z"
                fill="rgba(34,211,238,0.07)"
                stroke="rgba(34,211,238,0.2)"
                strokeWidth="1"
              />
              {/* Amérique du Nord */}
              <path
                d="M150,60 Q280,50 290,140 Q200,210 140,130 Z"
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.8"
              />
              {/* Amérique du Sud */}
              <path
                d="M240,210 Q290,230 270,330 Q240,360 220,270 Z"
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.8"
              />
              {/* Asie & Moyen-Orient */}
              <path
                d="M460,80 Q620,70 660,160 Q550,220 480,180 Q450,140 460,80 Z"
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.8"
              />

              {/* Arcs de flux connecteurs entre Hubs majeurs (Paris -> Casablanca, Paris -> Abidjan, etc.) */}
              <path d="M405,110 Q390,130 382,155" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M405,110 Q390,165 395,220" fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M382,155 Q375,190 395,220" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="2 3" />
              <path d="M405,110 Q320,105 250,115" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 4" />
              <path d="M405,110 Q470,135 535,165" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="2 4" />

              {/* Hotspots interactifs pour les villes */}
              {cities.map((cityItem) => {
                const cityName = cityItem.city || "";
                const coords = CITY_COORDINATES[cityName] || { x: 405 + Math.random() * 20, y: 110 + Math.random() * 20 };
                const isHovered = hoveredCity === cityName;
                const radius = Math.min(10, Math.max(4, Math.round((cityItem.visitors / totalVisitors) * 35)));

                return (
                  <g
                    key={cityName}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredCity(`${cityName} (${cityItem.visitors} visiteurs)`)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Anneau pulsant */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={radius + 4}
                      fill="none"
                      stroke={cityItem.country === "France" ? "#D4AF37" : "#22d3ee"}
                      strokeWidth="1"
                      opacity={isHovered ? 0.9 : 0.4}
                      className="animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                    {/* Point central */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={radius}
                      fill={cityItem.country === "France" ? "#D4AF37" : "#22d3ee"}
                      filter={cityItem.country === "France" ? "url(#glowGold)" : "url(#glowCyan)"}
                      opacity={0.85}
                    />
                    {/* Libellé de ville pour les hubs majeurs */}
                    {["Paris", "Casablanca", "Abidjan", "Montréal", "Dubaï", "Troyes"].includes(cityName) && (
                      <text
                        x={coords.x + 8}
                        y={coords.y + 3}
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        opacity={isHovered ? 1 : 0.75}
                      >
                        {cityName}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /> France</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" /> International</span>
            </div>
            <span>Survolez un point pour inspecter le trafic</span>
          </div>
        </div>

        {/* LISTE DÉTAILLÉE PAYS OU VILLES (5 Colonnes) */}
        <div className="lg:col-span-5 rounded-xl bg-black/40 border border-white/10 p-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 pb-2 border-b border-white/10 flex items-center justify-between">
            <span>{activeTab === "countries" ? "Top Pays" : "Top Villes"}</span>
            <span className="text-[10px] text-slate-500 font-normal">Visiteurs / Part</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {activeTab === "countries" ? (
              countries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">Aucune donnée géographique</div>
              ) : (
                countries.map((c, i) => {
                  const flag = COUNTRY_FLAGS[c.country_code] || "🌍";
                  return (
                    <div key={c.country || i} className="group p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{flag}</span>
                          <span className="font-medium text-white group-hover:text-[#D4AF37] transition-colors">
                            {c.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-300 font-semibold">{c.visitors}</span>
                          <span className="text-[10px] text-slate-500">({c.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-[#D4AF37] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, c.percentage * 1.5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              cities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">Aucune donnée de ville</div>
              ) : (
                cities.map((city, i) => {
                  const flag = COUNTRY_FLAGS[city.country_code] || "📍";
                  return (
                    <div key={city.city || i} className="group p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{flag}</span>
                          <span className="font-medium text-white group-hover:text-[#22d3ee] transition-colors">
                            {city.city}
                          </span>
                          <span className="text-[10px] text-slate-500">({city.country})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-300 font-semibold">{city.visitors}</span>
                          <span className="text-[10px] text-slate-500">({city.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#D4AF37] to-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, city.percentage * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
