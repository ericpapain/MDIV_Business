import { useState } from "react";
import { SixMonthReview, Relation, KPI } from "@/types/performance";
import { formatCurrency, formatNumber, calculateVariance } from "@/services/performanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save,
  Printer
} from "lucide-react";

interface SixMonthReviewTabProps {
  review: SixMonthReview | null;
  client: Relation | null;
  kpis: KPI[];
  onSaveReview: (review: Partial<SixMonthReview>) => void;
}

export function SixMonthReviewTab({
  review,
  client,
  kpis,
  onSaveReview,
}: SixMonthReviewTabProps) {
  // Données initialisées avec le cas réel contractuel ITID
  const [formData, setFormData] = useState<SixMonthReview>(
    review || {
      id: 0,
      relation_id: client ? client.id : 1,
      client_name: client ? client.name : "Institut ITID",
      contract_date: "2026-05-01",
      review_date: "2026-11-01",
      period_label: "Bilan d'Étape Semestriel (6 mois)",
      followers_start: 320,
      followers_current: 850,
      qualified_contacts_target: 50,
      qualified_contacts_real: 37,
      content_adequacy_score: 92,
      contents_produced_summary: "24 publications feed, 16 formats courts reels/shorts, 8 articles orientés expertise médicale.",
      social_media_summary: "Progression de +165% de la communauté. Taux d'engagement moyen de 4.8% sur Instagram.",
      website_seo_summary: "Refonte du site livrée à 70%, formulaires qualifiés intégrés, temps de chargement réduit.",
      events_summary: "Préparation active du BNE Essoyes (24 oct 2026) et du salon Paris (nov 2026).",
      google_ads_summary: "Campagne Search active avec budget financé par le client et coût par contact qualifié maîtrisé.",
      positive_points: [
        "Forte adhésion de l'audience aux vidéos courtes explicatives et valorisation médicale.",
        "Excellente fluidité dans les allers-retours de validation des contenus.",
        "Hausse mesurable de la notoriété locale de l'institut.",
      ],
      challenges_faced: [
        "Disponibilité restreinte de l'équipe médicale pour les créneaux de captation vidéo.",
        "Nécessité d'accélérer le traitement des demandes entrantes sous 24h ouvrées.",
      ],
      client_feedback: "Très grande satisfaction de l'institut quant à la clarté des livrables et à la conformité déontologique.",
      internal_recommendations: [
        "Capitaliser sur les captations d'Essoyes (24 oct) pour produire 12 nouveaux formats courts.",
        "Mettre en place une relance automatisée des leads non contactés sous 48h.",
        "Optimiser le budget Google Ads sur les mots-clés à plus fort taux de conversion.",
      ],
      next_actions_plan: [
        "Déploiement final de la nouvelle version du site au 30 octobre.",
        "Couverture vidéo exhaustive à Essoyes le 24 octobre.",
        "Séance formelle de restitution semestrielle le 15 novembre 2026.",
      ],
      status: "draft",
      is_demo: false,
      created_at: "",
      updated_at: "",
    }
  );

  const [newPositive, setNewPositive] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [newRecommendation, setNewRecommendation] = useState("");
  const [newAction, setNewAction] = useState("");

  const handleAddPositive = () => {
    if (!newPositive.trim()) return;
    setFormData({ ...formData, positive_points: [...formData.positive_points, newPositive] });
    setNewPositive("");
  };

  const handleAddChallenge = () => {
    if (!newChallenge.trim()) return;
    setFormData({ ...formData, challenges_faced: [...formData.challenges_faced, newChallenge] });
    setNewChallenge("");
  };

  const handleAddRecommendation = () => {
    if (!newRecommendation.trim()) return;
    setFormData({ ...formData, internal_recommendations: [...formData.internal_recommendations, newRecommendation] });
    setNewRecommendation("");
  };

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    setFormData({ ...formData, next_actions_plan: [...formData.next_actions_plan, newAction] });
    setNewAction("");
  };

  const contactsVariance = calculateVariance(formData.qualified_contacts_target, formData.qualified_contacts_real);
  const followersGrowth = formData.followers_start > 0 
    ? Math.round(((formData.followers_current - formData.followers_start) / formData.followers_start) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* EN-TÊTE DU BILAN CONTRACTUEL */}
      <div className="bg-card/50 border border-border/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gold" />
            <h3 className="font-bold text-base text-foreground font-display">
              {formData.period_label} — {formData.client_name}
            </h3>
            <Badge className="bg-gold/10 text-gold border-gold/30 text-[10px]">
              Clause Contractuelle des 6 Mois
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Période sous revue : du {formData.contract_date} au {formData.review_date} • Forfait mensuel 700 € TTC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 border-border"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer / PDF
          </Button>

          <Button
            size="sm"
            onClick={() => onSaveReview(formData)}
            className="bg-gold hover:bg-gold-light text-black text-xs font-semibold gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Enregistrer le Bilan
          </Button>
        </div>
      </div>

      {/* 3 INDICATEURS MAJEURS CONTRACTUELS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 : Abonnés Réseaux Sociaux */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-2">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            1. Évolution des Abonnés Réseaux
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground font-display">
              {formatNumber(formData.followers_current)}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              +{followersGrowth}% (+{formData.followers_current - formData.followers_start})
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Base au contrat : {formData.followers_start} abonnés • Source : Instagram, LinkedIn, FB
          </div>
        </div>

        {/* KPI 2 : Contacts Qualifiés */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-2">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            2. Contacts Qualifiés Générés
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-400 font-display">
              {formData.qualified_contacts_real} / {formData.qualified_contacts_target}
            </span>
            <span className="text-xs font-semibold text-amber-400">
              {contactsVariance.percentFormatted} vs cible
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Taux d'atteinte de la cible semestrielle : {Math.round((formData.qualified_contacts_real / formData.qualified_contacts_target) * 100)}%
          </div>
        </div>

        {/* KPI 3 : Adéquation des Contenus */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-2">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            3. Adéquation des Contenus
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gold font-display">
              {formData.content_adequacy_score} / 100
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Conformité Validée
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Indice qualitatif de respect des objectifs et de déontologie médicale
          </div>
        </div>
      </div>

      {/* SYNTHÈSE DES LIVRABLES OPÉRATIONNELS */}
      <div className="bg-card/40 border border-border/80 rounded-lg p-5 space-y-4">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
          Synthèse des Prestations & Livrables Réalisés
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-muted/15 border border-border/50 rounded space-y-1">
            <strong className="text-foreground">Contenus & Vidéos courtes :</strong>
            <p className="text-muted-foreground leading-relaxed">{formData.contents_produced_summary}</p>
          </div>
          <div className="p-3 bg-muted/15 border border-border/50 rounded space-y-1">
            <strong className="text-foreground">Réseaux Sociaux & Visibilité :</strong>
            <p className="text-muted-foreground leading-relaxed">{formData.social_media_summary}</p>
          </div>
          <div className="p-3 bg-muted/15 border border-border/50 rounded space-y-1">
            <strong className="text-foreground">Site Internet & SEO :</strong>
            <p className="text-muted-foreground leading-relaxed">{formData.website_seo_summary}</p>
          </div>
          <div className="p-3 bg-muted/15 border border-border/50 rounded space-y-1">
            <strong className="text-foreground">Événements (Essoyes / Paris) :</strong>
            <p className="text-muted-foreground leading-relaxed">{formData.events_summary}</p>
          </div>
        </div>
      </div>

      {/* POINTS POSITIFS, DIFFICULTÉS, RECOMMANDATIONS ET PROCHAINES ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Points Positifs */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Points Positifs & Réussites Factuelles
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 pl-1">
            {formData.positive_points.map((pt, idx) => (
              <li key={idx} className="leading-snug">{pt}</li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ajouter un point positif..."
              value={newPositive}
              onChange={(e) => setNewPositive(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-gold"
            />
            <Button size="sm" onClick={handleAddPositive} className="h-7 text-xs bg-gold text-black">
              Ajouter
            </Button>
          </div>
        </div>

        {/* Difficultés & Axes d'amélioration */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase">
            <AlertTriangle className="w-4 h-4" />
            Difficultés Rencontrées & Points d'Attention
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 pl-1">
            {formData.challenges_faced.map((ch, idx) => (
              <li key={idx} className="leading-snug">{ch}</li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ajouter une difficulté..."
              value={newChallenge}
              onChange={(e) => setNewChallenge(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-gold"
            />
            <Button size="sm" onClick={handleAddChallenge} className="h-7 text-xs bg-gold text-black">
              Ajouter
            </Button>
          </div>
        </div>

        {/* Recommandations Internes MDIV */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-3">
          <div className="flex items-center gap-1.5 text-gold font-semibold text-xs uppercase">
            <Sparkles className="w-4 h-4" />
            Recommandations Stratégiques Internes
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 pl-1">
            {formData.internal_recommendations.map((rec, idx) => (
              <li key={idx} className="leading-snug">{rec}</li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ajouter une recommandation..."
              value={newRecommendation}
              onChange={(e) => setNewRecommendation(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-gold"
            />
            <Button size="sm" onClick={handleAddRecommendation} className="h-7 text-xs bg-gold text-black">
              Ajouter
            </Button>
          </div>
        </div>

        {/* Plan d'Actions à Venir */}
        <div className="p-4 bg-muted/20 border border-border/70 rounded-lg space-y-3">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs uppercase">
            <Calendar className="w-4 h-4" />
            Plan d'Actions pour le Semestre Suivant
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 pl-1">
            {formData.next_actions_plan.map((act, idx) => (
              <li key={idx} className="leading-snug">{act}</li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ajouter une action future..."
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="flex-1 bg-background border border-border rounded px-2.5 py-1 text-xs text-foreground outline-none focus:border-gold"
            />
            <Button size="sm" onClick={handleAddAction} className="h-7 text-xs bg-gold text-black">
              Ajouter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
