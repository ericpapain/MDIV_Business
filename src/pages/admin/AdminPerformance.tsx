import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { performanceApi } from "@/services/performanceService";
import { 
  Relation, 
  Project, 
  KPI, 
  Campaign, 
  Activity, 
  SixMonthReview, 
  PeriodFilter, 
  RelationStatus 
} from "@/types/performance";
import { useToast } from "@/hooks/use-toast";
import { PerformanceHeader } from "@/components/admin/performance/PerformanceHeader";
import { KPICardsGrid } from "@/components/admin/performance/KPICardsGrid";
import { RelationsTab } from "@/components/admin/performance/RelationsTab";
import { RelationDetailSheet } from "@/components/admin/performance/RelationDetailSheet";
import { ProjectsTab } from "@/components/admin/performance/ProjectsTab";
import { AmbassadorsSubModule } from "@/components/admin/performance/AmbassadorsSubModule";
import { ReferrersSubModule } from "@/components/admin/performance/ReferrersSubModule";
import { PipelineKanban } from "@/components/admin/performance/PipelineKanban";
import { CampaignsEventsTab } from "@/components/admin/performance/CampaignsEventsTab";
import { ActivitiesTimeline } from "@/components/admin/performance/ActivitiesTimeline";
import { SixMonthReviewTab } from "@/components/admin/performance/SixMonthReviewTab";
import { KPIManagerModal } from "@/components/admin/performance/KPIManagerModal";
import { AddEntityModal } from "@/components/admin/performance/AddEntityModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2, 
  LayoutDashboard, 
  Users, 
  Star, 
  Handshake, 
  Kanban, 
  Briefcase, 
  Megaphone, 
  Clock, 
  FileCheck2,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPerformance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // FILTRES GLOBAUX
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // ÉTATS DES MODALES ET FEUILLES LATÉRALES
  const [selectedRelation, setSelectedRelation] = useState<Relation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);

  // CHARGEMENT DES DONNÉES VIA REACT-QUERY
  const { data, isLoading, error } = useQuery({
    queryKey: ["performance-data"],
    queryFn: performanceApi.getAll,
  });

  // MUTATIONS AVEC RETOUR TOAST ET INVALIDATION DU CACHE
  const saveRelationMutation = useMutation({
    mutationFn: performanceApi.saveRelation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Relation enregistrée avec succès" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const deleteRelationMutation = useMutation({
    mutationFn: performanceApi.deleteRelation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Relation supprimée" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const saveProjectMutation = useMutation({
    mutationFn: performanceApi.saveProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Projet enregistré avec succès" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: performanceApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Projet supprimé" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const saveKPIMutation = useMutation({
    mutationFn: performanceApi.saveKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "KPI enregistré" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const updateKPIValueMutation = useMutation({
    mutationFn: ({ id, val }: { id: number; val: number }) => performanceApi.updateKPIValue(id, val),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Valeur KPI actualisée" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const deleteKPIMutation = useMutation({
    mutationFn: performanceApi.deleteKPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "KPI supprimé" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const saveActivityMutation = useMutation({
    mutationFn: performanceApi.saveActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Action enregistrée" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const saveReviewMutation = useMutation({
    mutationFn: performanceApi.saveSixMonthReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-data"] });
      toast({ title: "Bilan des 6 mois sauvegardé" });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const handleUpdateStatus = (relationId: number, newStatus: RelationStatus) => {
    saveRelationMutation.mutate({ id: relationId, status: newStatus });
  };

  const handleUpdateNextAction = (relationId: number, nextAction: string, nextDate: string) => {
    saveRelationMutation.mutate({
      id: relationId,
      next_action: nextAction,
      next_contact_date: nextDate,
    });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
        <span className="text-xs text-muted-foreground">Chargement des données de pilotage...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center text-xs text-rose-400">
        Une erreur est survenue lors de la récupération des données de performance.
      </div>
    );
  }

  const { relations, projects, kpis, campaigns, activities, sixMonthReviews, summary } = data;

  const ambassadors = relations.filter((r) => r.type === "ambassador");
  const referrers = relations.filter((r) => r.type === "business_referrer");
  const itidClient = relations.find((r) => r.company === "ITID" || r.name.includes("ITID")) || relations[0];

  // Données mensuelles d'évolution pour les graphiques Recharts (Mai à Octobre 2026)
  const evolutionChartData = [
    { month: "Mai", leads: 8, qualified: 4, followers: 320, ca: 700 },
    { month: "Juin", leads: 15, qualified: 9, followers: 450, ca: 1400 },
    { month: "Juil", leads: 28, qualified: 17, followers: 580, ca: 2100 },
    { month: "Août", leads: 42, qualified: 26, followers: 710, ca: 2800 },
    { month: "Sept", leads: 68, qualified: 37, followers: 850, ca: 3500 },
    { month: "Oct (Prév.)", leads: 85, qualified: 50, followers: 1100, ca: 4200 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. EN-TÊTE PRINCIPAL AVEC FILTRES ET ACTIONS */}
      <PerformanceHeader
        period={period}
        setPeriod={setPeriod}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenKPIModal={() => setIsKPIModalOpen(true)}
        onExportCSV={() => performanceApi.exportRelationsCSV(relations)}
      />

      {/* 2. CARTES DE SYNTHÈSE DES KPI CLÉS */}
      <KPICardsGrid summary={summary} selectedType={selectedType} />

      {/* 3. SYSTÈME D'ONGLETS THÉMATIQUES */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/30 p-1 border border-border/60 rounded-lg inline-flex min-w-full sm:min-w-0">
            <TabsTrigger value="dashboard" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="relations" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Users className="w-3.5 h-3.5" /> Relations ({relations.length})
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Kanban className="w-3.5 h-3.5" /> Pipeline
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Star className="w-3.5 h-3.5" /> Ambassadeurs ({ambassadors.length})
            </TabsTrigger>
            <TabsTrigger value="referrers" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Handshake className="w-3.5 h-3.5" /> Apporteurs ({referrers.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Projets ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> Campagnes & Événements
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Actions ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="review_6m" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" /> Bilan 6 Mois (ITID)
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENU ONGLET 1 : DASHBOARD & GRAPHIQUES */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GRAPHIQUE 1 : ÉVOLUTION DES LEADS & CONTACTS QUALIFIÉS */}
            <div className="lg:col-span-2 bg-card/50 border border-border/80 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm text-foreground font-display">
                    Évolution des Contacts Qualifiés & Abonnés (ITID & Réseau)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Progression mensuelle réelle depuis le lancement contractuel de Mai 2026.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Contacts Qualifiés
                  </span>
                  <span className="flex items-center gap-1.5 text-gold">
                    <span className="w-2 h-2 rounded-full bg-gold" /> Abonnés (/10)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolutionChartData}>
                    <defs>
                      <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFoll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262b30" />
                    <XAxis dataKey="month" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f1316", borderColor: "#333", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="qualified" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorQual)" name="Contacts Qualifiés" />
                    <Area type="monotone" dataKey="leads" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorFoll)" name="Leads Bruts" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ENCADRÉ FOCUS CONTRAT ITID */}
            <div className="bg-gold/5 border border-gold/25 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
                    Contrat en Cours
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    700 € TTC / mois
                  </span>
                </div>

                <h4 className="font-bold text-base text-foreground font-display mb-1">
                  Institut ITID
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Accompagnement digital complet : Réseaux sociaux, refonte site web, vidéos/reels, couverture événementielle 24 oct Essoyes & nov Paris, Google Ads.
                </p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Abonnés Réseaux :</span>
                    <strong className="text-foreground font-mono">850 / 1 200</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Contacts Qualifiés :</span>
                    <strong className="text-emerald-400 font-mono">37 / 50</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Adéquation Contenus :</span>
                    <strong className="text-gold font-mono">92 / 95</strong>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Bilan 6 mois :</span>
                    <strong className="text-foreground">Prévu le 01/11/2026</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("review_6m")}
                className="w-full py-2 px-3 rounded bg-gold hover:bg-gold-light text-black text-xs font-semibold transition-all text-center"
              >
                Accéder au Bilan Semestriel ITID →
              </button>
            </div>
          </div>

          {/* TABLEAU RAPIDE DES RELATIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground font-display">
                Dossiers Récents & Actions Prioritaires
              </h3>
              <button
                onClick={() => setActiveTab("relations")}
                className="text-xs text-gold hover:underline"
              >
                Voir toutes les relations →
              </button>
            </div>

            <RelationsTab
              relations={relations.slice(0, 5)}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              onSelectRelation={setSelectedRelation}
              onEditRelation={setSelectedRelation}
              onDeleteRelation={(id) => deleteRelationMutation.mutate(id)}
            />
          </div>
        </TabsContent>

        {/* CONTENU ONGLET 2 : TOUTES LES RELATIONS */}
        <TabsContent value="relations">
          <RelationsTab
            relations={relations}
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onSelectRelation={setSelectedRelation}
            onEditRelation={setSelectedRelation}
            onDeleteRelation={(id) => deleteRelationMutation.mutate(id)}
          />
        </TabsContent>

        {/* CONTENU ONGLET 3 : PIPELINE KANBAN */}
        <TabsContent value="pipeline">
          <PipelineKanban
            relations={relations}
            onSelectRelation={setSelectedRelation}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        {/* CONTENU ONGLET 4 : AMBASSADEURS */}
        <TabsContent value="ambassadors">
          <AmbassadorsSubModule
            ambassadors={ambassadors}
            onSelectRelation={setSelectedRelation}
          />
        </TabsContent>

        {/* CONTENU ONGLET 5 : APPORTEURS D'AFFAIRES */}
        <TabsContent value="referrers">
          <ReferrersSubModule
            referrers={referrers}
            onSelectRelation={setSelectedRelation}
          />
        </TabsContent>

        {/* CONTENU ONGLET 6 : PROJETS */}
        <TabsContent value="projects">
          <ProjectsTab
            projects={projects}
            kpis={kpis}
            onEditProject={(proj) => {
              toast({ title: "Modification de projet", description: `Sélection de "${proj.name}"` });
            }}
            onDeleteProject={(id) => deleteProjectMutation.mutate(id)}
          />
        </TabsContent>

        {/* CONTENU ONGLET 7 : CAMPAGNES & ÉVÉNEMENTS */}
        <TabsContent value="campaigns">
          <CampaignsEventsTab
            campaigns={campaigns}
            onOpenAddCampaign={() => setIsAddModalOpen(true)}
          />
        </TabsContent>

        {/* CONTENU ONGLET 8 : ACTIONS & TIMELINE */}
        <TabsContent value="activities">
          <ActivitiesTimeline
            activities={activities}
            onOpenAddActivity={() => setIsAddModalOpen(true)}
          />
        </TabsContent>

        {/* CONTENU ONGLET 9 : BILAN 6 MOIS */}
        <TabsContent value="review_6m">
          <SixMonthReviewTab
            review={sixMonthReviews[0] || null}
            client={itidClient}
            kpis={kpis}
            onSaveReview={(rev) => saveReviewMutation.mutate(rev)}
          />
        </TabsContent>
      </Tabs>

      {/* VOLET LATÉRAL : FICHE DÉTAILLÉE RELATION */}
      <RelationDetailSheet
        relation={selectedRelation}
        isOpen={!!selectedRelation}
        onClose={() => setSelectedRelation(null)}
        projects={projects}
        kpis={kpis}
        activities={activities}
        onEdit={(rel) => setSelectedRelation(rel)}
        onDelete={(id) => deleteRelationMutation.mutate(id)}
        onUpdateNextAction={handleUpdateNextAction}
      />

      {/* MODALE D'AJOUT RAPIDE */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        relations={relations}
        projects={projects}
        onSaveRelation={(rel) => saveRelationMutation.mutate(rel)}
        onSaveProject={(proj) => saveProjectMutation.mutate(proj)}
        onSaveActivity={(act) => saveActivityMutation.mutate(act)}
      />

      {/* MODALE DE GESTION DES KPIS */}
      <KPIManagerModal
        kpis={kpis}
        isOpen={isKPIModalOpen}
        onClose={() => setIsKPIModalOpen(false)}
        onSaveKPI={(k) => saveKPIMutation.mutate(k)}
        onUpdateKPIValue={(id, val) => updateKPIValueMutation.mutate({ id, val })}
        onDeleteKPI={(id) => deleteKPIMutation.mutate(id)}
      />
    </div>
  );
}
