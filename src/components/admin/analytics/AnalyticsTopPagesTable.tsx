// src/components/admin/analytics/AnalyticsTopPagesTable.tsx
import { useState, useMemo } from "react";
import { Search, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import type { TopPageItem } from "./types";

interface Props {
  pages: TopPageItem[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

type SortField = "views" | "unique_visitors" | "avg_duration" | "exit_rate";

export function AnalyticsTopPagesTable({ pages }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrage et Tri
  const filteredAndSortedPages = useMemo(() => {
    let result = [...pages];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.page_path.toLowerCase().includes(q) ||
          (p.page_title && p.page_title.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortOrder === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [pages, searchTerm, sortField, sortOrder]);

  const maxViews = useMemo(() => {
    return Math.max(...pages.map((p) => p.views), 1);
  }, [pages]);

  const totalPagesCount = Math.ceil(filteredAndSortedPages.length / pageSize) || 1;
  const paginatedPages = filteredAndSortedPages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={12} className="text-[#D4AF37]" />
    ) : (
      <ArrowDown size={12} className="text-[#D4AF37]" />
    );
  };

  return (
    <div className="rounded-xl bg-[#071526]/90 border border-white/10 p-6 backdrop-blur-md mb-8">
      {/* Header avec Titre et Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-1">
            <FileText size={14} />
            <span>Pages les Plus Consultées</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">
            Performance des URLs & Contenus
          </h2>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par URL ou titre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
        </div>
      </div>

      {/* Tableau responsive */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              <th className="py-3 px-3">Page & URL</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort("views")}>
                <div className="flex items-center gap-1.5">
                  <span>Visites</span>
                  {getSortIcon("views")}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort("unique_visitors")}>
                <div className="flex items-center gap-1.5">
                  <span>Visiteurs uniques</span>
                  {getSortIcon("unique_visitors")}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort("avg_duration")}>
                <div className="flex items-center gap-1.5">
                  <span>Temps moyen</span>
                  {getSortIcon("avg_duration")}
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white text-right" onClick={() => toggleSort("exit_rate")}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>Taux de sortie</span>
                  {getSortIcon("exit_rate")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {paginatedPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Aucune page trouvée pour cette recherche
                </td>
              </tr>
            ) : (
              paginatedPages.map((page, idx) => {
                const ratio = Math.min(100, Math.round((page.views / maxViews) * 100));

                return (
                  <tr key={page.page_path + idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-3 max-w-[280px] sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <div className="truncate">
                          <div className="font-medium text-white truncate group-hover:text-[#D4AF37] transition-colors">
                            {page.page_title || page.page_path}
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400/90 truncate flex items-center gap-1">
                            <span>{page.page_path}</span>
                            <a
                              href={page.page_path}
                              target="_blank"
                              rel="noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                              title="Voir la page"
                            >
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Visites avec barre de progression */}
                    <td className="py-3 px-3 w-48">
                      <div className="space-y-1">
                        <div className="font-mono font-semibold text-white">
                          {page.views.toLocaleString("fr-FR")}
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-[#D4AF37] h-full rounded-full transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Visiteurs uniques */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {page.unique_visitors.toLocaleString("fr-FR")}
                    </td>

                    {/* Temps moyen */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatDuration(page.avg_duration)}
                    </td>

                    {/* Taux de sortie */}
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block font-mono px-2 py-0.5 rounded text-[11px] ${
                        page.exit_rate > 50
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {page.exit_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPagesCount > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5 text-xs text-slate-400">
          <div>
            Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedPages.length)} sur{" "}
            {filteredAndSortedPages.length} pages
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
              {currentPage} / {totalPagesCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPagesCount))}
              disabled={currentPage === totalPagesCount}
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
