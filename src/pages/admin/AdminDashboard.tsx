// src/pages/admin/AdminDashboard.tsx - MDIV Business Analytics Suite
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Radio,
  SlidersHorizontal,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { AnalyticsKpiGrid } from "@/components/admin/analytics/AnalyticsKpiGrid";
import { AnalyticsTrafficChart } from "@/components/admin/analytics/AnalyticsTrafficChart";
import { AnalyticsTopPagesTable } from "@/components/admin/analytics/AnalyticsTopPagesTable";
import { AnalyticsGeoSection } from "@/components/admin/analytics/AnalyticsGeoSection";
import { AnalyticsVisitorHistory } from "@/components/admin/analytics/AnalyticsVisitorHistory";
import { AnalyticsUserJourney } from "@/components/admin/analytics/AnalyticsUserJourney";
import { AnalyticsSourcesSection } from "@/components/admin/analytics/AnalyticsSourcesSection";
import { AnalyticsDevicesSection } from "@/components/admin/analytics/AnalyticsDevicesSection";
import { AnalyticsRealtimeWidget } from "@/components/admin/analytics/AnalyticsRealtimeWidget";
import { AnalyticsHomeCountersModal } from "@/components/admin/analytics/AnalyticsHomeCountersModal";
import type { AnalyticsData } from "@/components/admin/analytics/types";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<string>("30d");
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  // 1. Requête principale des Analytics (période sélectionnée)
  const {
    data: analyticsData,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api-analytics.php?action=dashboard&period=${period}`);
      if (!res.ok) throw new Error("Impossible de charger les données analytics");
      const json = await res.json();
      return json;
    },
    staleTime: 10000,
  });

  // 2. Requête du flux temps réel (toutes les 15 secondes)
  const { data: realtimeData, refetch: refetchRealtime } = useQuery({
    queryKey: ["admin-realtime"],
    queryFn: async () => {
      const res = await fetch("/api-analytics.php?action=realtime");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Compte à rebours 15 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    refetch();
    refetchRealtime();
    setSecondsRemaining(15);
    toast({
      title: "Actualisation en cours",
      description: "Les métriques de trafic ont été rafraîchies.",
    });
  };

  const handleExportCsv = () => {
    window.open(`/api-analytics.php?action=export_csv&period=${period}`, "_blank");
  };

  if (isLoading && !analyticsData) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#D4AF37] w-10 h-10" />
        <span className="text-sm font-medium text-slate-400">
          Chargement de la suite Analytics MDIV...
        </span>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Erreur de connexion Analytics
        </h3>
        <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
          Impossible de récupérer les statistiques d'audience. Veuillez vérifier la connexion à la base de données.
        </p>
        <button
          onClick={() => refetch()}
          className="btn-gold px-4 py-2 text-xs uppercase tracking-wider"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Fusionner les données temps réel si disponibles
  const kpis = {
    ...analyticsData.kpis,
    realtime_active: {
      ...analyticsData.kpis.realtime_active,
      value: realtimeData?.activeCount ?? analyticsData.kpis.realtime_active.value,
    },
  };

  const activePages = realtimeData?.activePages || [];
  const recentFeed = realtimeData?.recentFeed || [];

  // Extraire les listes uniques pour les filtres
  const availableCountries = Array.from(
    new Set(analyticsData.countries.map((c) => c.country).filter(Boolean) as string[])
  );
  const availablePages = Array.from(
    new Set(analyticsData.topPages.map((p) => p.page_path).filter(Boolean))
  );

  return (
    <div className="space-y-6 pb-16">
      {/* HEADER DE LA PAGE ANALYTICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#D4AF37]">
              MDIV Business · Analytics Suite
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct actif
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Vue d'ensemble & Tableau de Bord Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Suivi centralisé du trafic, des conversions et du parcours des visiteurs sur l'ensemble du site.
          </p>
        </div>

        {/* ACTIONS DU HEADER */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bouton de mise à jour des compteurs vitrine */}
          <button
            onClick={() => setIsHomeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            title="Modifier les statistiques affichées sur la page d'accueil"
          >
            <Settings size={14} className="text-[#D4AF37]" />
            <span>Compteurs Accueil</span>
          </button>

          {/* Bouton Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Bouton Rafraîchir */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#e5be48] text-black text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
            <span>{isRefetching ? "Actualisation..." : "Rafraîchir"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 9 : VISITEURS EN TEMPS RÉEL (Surveillance en direct) */}
      <AnalyticsRealtimeWidget
        activeCount={kpis.realtime_active.value}
        activePages={activePages}
        recentFeed={recentFeed}
        onRefreshManual={handleManualRefresh}
        secondsRemaining={secondsRemaining}
      />

      {/* SECTION 1 : KPI PRINCIPAUX (8 Cartes Modernes) */}
      <AnalyticsKpiGrid kpis={kpis} isLoading={isRefetching} />

      {/* SECTION 2 : ÉVOLUTION DU TRAFIC (Graphique Interactif) */}
      <AnalyticsTrafficChart
        data={analyticsData.timeline}
        period={period}
        onPeriodChange={(p) => setPeriod(p)}
        isLoading={isRefetching}
      />

      {/* SECTION 3 : PAGES LES PLUS VISITÉES */}
      <AnalyticsTopPagesTable pages={analyticsData.topPages} />

      {/* SECTION 6 : PARCOURS UTILISATEUR & ENTONNOIR (Funnel) */}
      <AnalyticsUserJourney journeys={analyticsData.journeys} />

      {/* SECTION 4 : GÉOLOCALISATION DES VISITEURS */}
      <AnalyticsGeoSection
        countries={analyticsData.countries}
        cities={analyticsData.cities}
      />

      {/* SECTION 7 & 8 : SOURCES DE TRAFIC + APPAREILS / NAVIGATEURS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsSourcesSection sources={analyticsData.sources} />
        <AnalyticsDevicesSection
          devices={analyticsData.devices}
          browsers={analyticsData.browsers}
          os={analyticsData.os}
        />
      </div>

      {/* SECTION 5 : HISTORIQUE DÉTAILLÉ DES VISITEURS (Journal complet & CSV) */}
      <AnalyticsVisitorHistory
        history={analyticsData.history}
        period={period}
        onFilterChange={() => {}}
        availableCountries={availableCountries}
        availablePages={availablePages}
      />

      {/* MODAL / TIROIR DE MODIFICATION DES STATS VITRINE D'ACCUEIL */}
      <AnalyticsHomeCountersModal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
      />
    </div>
  );
}