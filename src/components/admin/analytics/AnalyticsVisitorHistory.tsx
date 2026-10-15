// src/components/admin/analytics/AnalyticsVisitorHistory.tsx
import { useState, useMemo } from "react";
import {
  History,
  Search,
  Download,
  Filter,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { VisitorHistoryRow } from "./types";

interface Props {
  history: {
    total: number;
    limit: number;
    offset: number;
    rows: VisitorHistoryRow[];
  };
  period: string;
  onFilterChange: (filters: { search?: string; country?: string; page?: string }) => void;
  availableCountries: string[];
  availablePages: string[];
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "< 10s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function maskIp(ip: string): string {
  if (!ip) return "Anonyme";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.substring(0, 8) + "...";
}

const COUNTRY_FLAGS: Record<string, string> = {
  France: "🇫🇷",
  Maroc: "🇲🇦",
  "Côte d'Ivoire": "🇨🇮",
  Belgique: "🇧🇪",
  Suisse: "🇨🇭",
  Sénégal: "🇸🇳",
  Canada: "🇨🇦",
  "Émirats Arabes Unis": "🇦🇪",
  "États-Unis": "🇺🇸",
};

export function AnalyticsVisitorHistory({
  history,
  period,
  onFilterChange,
  availableCountries,
  availablePages,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [pageFilter, setPageFilter] = useState("");
  const [showFullIp, setShowFullIp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const rows = history?.rows || [];

  // Filtrage local immédiat
  const filteredRows = useMemo(() => {
    let list = [...rows];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.ip_address.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.page_path.toLowerCase().includes(q) ||
          (r.page_title && r.page_title.toLowerCase().includes(q)) ||
          r.browser.toLowerCase().includes(q) ||
          r.os.toLowerCase().includes(q) ||
          r.referrer_source.toLowerCase().includes(q)
      );
    }
    if (countryFilter) {
      list = list.filter((r) => r.country === countryFilter);
    }
    if (pageFilter) {
      list = list.filter((r) => r.page_path === pageFilter);
    }
    return list;
  }, [rows, searchTerm, countryFilter, pageFilter]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      // Générer le CSV directement pour garantir le téléchargement immédiat et UTF-8
      const headers = [
        "Date et heure",
        "Adresse IP",
        "Pays",
        "Ville",
        "Page visitée",
        "Titre de page",
        "Navigateur",
        "Système",
        "Appareil",
        "Durée (sec)",
        "Source",
        "Conversion",
      ];

      const csvLines = [headers.join(";")];
      filteredRows.forEach((r) => {
        const line = [
          `"${r.created_at.replace("T", " ").substring(0, 19)}"`,
          `"${r.ip_address}"`,
          `"${r.country}"`,
          `"${r.city}"`,
          `"${r.page_path}"`,
          `"${(r.page_title || "").replace(/"/g, '""')}"`,
          `"${r.browser}"`,
          `"${r.os}"`,
          `"${r.device_type}"`,
          `"${r.duration_seconds || 0}"`,
          `"${r.referrer_source || "Direct"}"`,
          `"${r.conversion_event || ""}"`,
        ];
        csvLines.push(line.join(";"));
      });

      const blob = new Blob(["\uFEFF" + csvLines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mdiv_visiteurs_${period}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const getDeviceIcon = (dev: string) => {
    if (dev === "Mobile") return <Smartphone size={13} className="text-cyan-400" />;
    if (dev === "Tablette") return <Tablet size={13} className="text-indigo-400" />;
    return <Monitor size={13} className="text-slate-400" />;
  };

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <History size={14} />
            <span>Historique Détaillé des Visiteurs</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Journal d'Activité & Profils Individuels
          </h2>
        </div>

        {/* Boutons d'action (Export CSV + Masquage IP) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFullIp(!showFullIp)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
            title="Basculer le masquage des adresses IP"
          >
            {showFullIp ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showFullIp ? "Masquer IP" : "Afficher IP complètes"}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#e5be48] text-black text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Download size={14} />
            <span>{isExporting ? "Export..." : "Exporter CSV"}</span>
          </button>
        </div>
      </div>

      {/* Barre de filtres combinés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-3 rounded-lg bg-black/40 border border-white/5">
        {/* Recherche textuelle */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher (IP, ville, page, OS...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#071526] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>

        {/* Filtre par Pays */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#071526] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="">Tous les pays</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par Page */}
        <div>
          <select
            value={pageFilter}
            onChange={(e) => {
              setPageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#071526] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
          >
            <option value="">Toutes les pages</option>
            {availablePages.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              <th className="py-3 px-3">Date & Heure</th>
              <th className="py-3 px-3">Visiteur / IP</th>
              <th className="py-3 px-3">Localisation</th>
              <th className="py-3 px-3">Page consultée</th>
              <th className="py-3 px-3">Navigateur & Système</th>
              <th className="py-3 px-3">Appareil</th>
              <th className="py-3 px-3">Durée</th>
              <th className="py-3 px-3">Source</th>
              <th className="py-3 px-3 text-right">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Aucun historique visiteur pour ces critères
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const dateObj = new Date(row.created_at);
                const dateStr = dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                const timeStr = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                const flag = COUNTRY_FLAGS[row.country] || "🌍";

                return (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                      <div className="font-semibold text-white">{timeStr}</div>
                      <div className="text-[10px] text-slate-500">{dateStr}</div>
                    </td>

                    {/* Visiteur & IP */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-cyan-400 font-medium text-[11px]">
                        {showFullIp ? row.ip_address : maskIp(row.ip_address)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {row.visitor_id}
                      </div>
                    </td>

                    {/* Localisation */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <span>{flag}</span>
                        <span>{row.city || row.country}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{row.country}</div>
                    </td>

                    {/* Page */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-medium text-white truncate group-hover:text-[#D4AF37] transition-colors">
                        {row.page_title || row.page_path}
                      </div>
                      <div className="font-mono text-cyan-400/80 text-[11px] truncate flex items-center gap-1">
                        <span>{row.page_path}</span>
                      </div>
                    </td>

                    {/* Navigateur & OS */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-200">{row.browser}</div>
                      <div className="text-[10px] text-slate-500">{row.os}</div>
                    </td>

                    {/* Appareil */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {getDeviceIcon(row.device_type)}
                        <span>{row.device_type}</span>
                      </div>
                    </td>

                    {/* Durée */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-300">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} className="text-slate-500" />
                        <span>{formatDuration(row.duration_seconds)}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                        {row.referrer_source || "Direct"}
                      </span>
                    </td>

                    {/* Conversion */}
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      {row.conversion_event ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                          <Zap size={10} />
                          <span>{row.conversion_event}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs text-slate-400">
          <div>
            Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
            {Math.min(currentPage * pageSize, filteredRows.length)} sur {filteredRows.length} visites
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-mono text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
