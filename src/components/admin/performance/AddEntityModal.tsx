import { useState } from "react";
import { Relation, Project, Activity, RelationType, ProjectStatus, ActivityType } from "@/types/performance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Briefcase, Calendar, Plus } from "lucide-react";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  relations: Relation[];
  projects: Project[];
  onSaveRelation: (rel: Partial<Relation>) => void;
  onSaveProject: (proj: Partial<Project>) => void;
  onSaveActivity: (act: Partial<Activity>) => void;
}

export function AddEntityModal({
  isOpen,
  onClose,
  relations,
  projects,
  onSaveRelation,
  onSaveProject,
  onSaveActivity,
}: AddEntityModalProps) {
  const [activeTab, setActiveTab] = useState("relation");

  // FORM RELATION
  const [relName, setRelName] = useState("");
  const [relCompany, setRelCompany] = useState("");
  const [relType, setRelType] = useState<RelationType>("client");
  const [relEmail, setRelEmail] = useState("");
  const [relPhone, setRelPhone] = useState("");
  const [relMonthlyFee, setRelMonthlyFee] = useState<number>(0);
  const [relManager, setRelManager] = useState("Éric MEZATIO");
  const [relNextAction, setRelNextAction] = useState("");
  const [relNextDate, setRelNextDate] = useState("");

  // FORM PROJET
  const [projName, setProjName] = useState("");
  const [projRelId, setProjRelId] = useState<number>(relations[0]?.id || 1);
  const [projBudget, setProjBudget] = useState<number>(1000);
  const [projType, setProjType] = useState("Marketing & Web");
  const [projDesc, setProjDesc] = useState("");
  const [projTargetDate, setProjTargetDate] = useState("");

  // FORM ACTIVITÉ
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState<ActivityType>("call");
  const [actRelId, setActRelId] = useState<number>(relations[0]?.id || 1);
  const [actDate, setActDate] = useState(new Date().toISOString().slice(0, 10));
  const [actComments, setActComments] = useState("");
  const [actNextTitle, setActNextTitle] = useState("");
  const [actNextDate, setActNextDate] = useState("");

  const handleRelationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relName.trim()) return;

    onSaveRelation({
      name: relName,
      company: relCompany,
      type: relType,
      email: relEmail,
      phone: relPhone,
      manager: relManager,
      next_action: relNextAction,
      next_contact_date: relNextDate,
      status: "active",
      contract_details: relMonthlyFee > 0 ? {
        monthly_fee: relMonthlyFee,
        duration: "Indéterminée",
        services: ["Accompagnement MDIV Business"],
      } : undefined,
      is_demo: false,
    });

    onClose();
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    onSaveProject({
      name: projName,
      relation_id: Number(projRelId),
      budget: Number(projBudget),
      type: projType,
      description: projDesc,
      target_end_date: projTargetDate || undefined,
      status: "in_progress",
      priority: "medium",
      progress_percent: 10,
      is_demo: false,
    });

    onClose();
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;

    onSaveActivity({
      title: actTitle,
      type: actType,
      relation_id: Number(actRelId),
      date: actDate,
      manager: "Éric MEZATIO",
      comments: actComments,
      next_action_title: actNextTitle,
      next_action_date: actNextDate || undefined,
      status: "completed",
      is_demo: false,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-[#0d1115] border-border text-foreground p-6">
        <DialogHeader className="border-b border-border/80 pb-4">
          <DialogTitle className="text-xl font-bold font-display text-foreground">
            Création Rapide
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajoutez un nouveau client/partenaire, un projet ou enregistrez une action commerciale.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2 text-xs">
          <TabsList className="grid grid-cols-3 bg-muted/30 p-1 mb-4">
            <TabsTrigger value="relation" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Relation
            </TabsTrigger>
            <TabsTrigger value="project" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
              <Briefcase className="w-3.5 h-3.5 mr-1" /> Projet
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-gold data-[state=active]:text-black">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Action
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: RELATION */}
          <TabsContent value="relation">
            <form onSubmit={handleRelationSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Nom / Titre *</label>
                  <input
                    type="text"
                    required
                    value={relName}
                    onChange={(e) => setRelName(e.target.value)}
                    placeholder="Ex: Institut Santé Plus"
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Société / Entité</label>
                  <input
                    type="text"
                    value={relCompany}
                    onChange={(e) => setRelCompany(e.target.value)}
                    placeholder="Ex: SAS Santé Plus"
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Type de relation</label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value as RelationType)}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    <option value="client">Client</option>
                    <option value="ambassador">Ambassadeur</option>
                    <option value="business_referrer">Apporteur d'Affaires</option>
                    <option value="partner">Partenaire</option>
                    <option value="prospect">Prospect</option>
                    <option value="prescriber">Prescripteur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Forfait mensuel (€ TTC)</label>
                  <input
                    type="number"
                    value={relMonthlyFee}
                    onChange={(e) => setRelMonthlyFee(Number(e.target.value))}
                    placeholder="Ex: 700"
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={relEmail}
                    onChange={(e) => setRelEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={relPhone}
                    onChange={(e) => setRelPhone(e.target.value)}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Prochaine action concrète</label>
                <input
                  type="text"
                  value={relNextAction}
                  onChange={(e) => setRelNextAction(e.target.value)}
                  placeholder="Ex: Relance proposition vidéo"
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold text-xs mt-3">
                Enregistrer la Relation
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: PROJET */}
          <TabsContent value="project">
            <form onSubmit={handleProjectSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Nom du projet *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="Ex: Création de 10 Reels vidéos"
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Client associé</label>
                  <select
                    value={projRelId}
                    onChange={(e) => setProjRelId(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    {relations.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.company || r.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Budget (€)</label>
                  <input
                    type="number"
                    value={projBudget}
                    onChange={(e) => setProjBudget(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Date d'échéance prévue</label>
                <input
                  type="date"
                  value={projTargetDate}
                  onChange={(e) => setProjTargetDate(e.target.value)}
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Description / Objectifs</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold text-xs mt-3">
                Créer le Projet
              </Button>
            </form>
          </TabsContent>

          {/* TAB 3: ACTION */}
          <TabsContent value="activity">
            <form onSubmit={handleActivitySubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Intitulé de l'action *</label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  placeholder="Ex: Point téléphonique de suivi"
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Type d'action</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value as ActivityType)}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    <option value="call">Appel</option>
                    <option value="meeting">Réunion / RDV</option>
                    <option value="email">Email</option>
                    <option value="content_creation">Création Contenu / Vidéo</option>
                    <option value="event">Événement</option>
                    <option value="followup">Relance</option>
                    <option value="proposal">Proposition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Relation liée</label>
                  <select
                    value={actRelId}
                    onChange={(e) => setActRelId(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                  >
                    {relations.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Commentaires / Résumé</label>
                <textarea
                  rows={2}
                  value={actComments}
                  onChange={(e) => setActComments(e.target.value)}
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-700 dark:text-slate-200 font-medium mb-1">Prochaine action à planifier</label>
                <input
                  type="text"
                  value={actNextTitle}
                  onChange={(e) => setActNextTitle(e.target.value)}
                  placeholder="Ex: Envoi du compte-rendu"
                  className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <Button type="submit" className="w-full bg-gold hover:bg-gold-light text-black font-semibold text-xs mt-3">
                Enregistrer l'Action
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
