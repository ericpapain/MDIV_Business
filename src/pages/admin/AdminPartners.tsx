import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Handshake, Trash2, Plus, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPartners() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=partners");
      const json = await res.json();
      return json.data || [];
    },
  });

  const resetForm = () => {
    setName(""); setCategory(""); setCountry(""); setEditingId(null);
  };

  const submitPartner = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_partner" : "add_partner";
      const payload = { id: editingId, name, category, country };
      const res = await fetch(`/api-admin.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      toast({ title: editingId ? "Partenaire modifié" : "Partenaire ajouté" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deletePartner = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Partenaire supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    }
  });

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setCategory(p.category);
    setCountry(p.country);
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display mb-8">Gestion des Partenaires</h1>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-sm p-4">
            <h2 className="text-xl font-display mb-4">Liste des Partenaires</h2>
            <div className="space-y-2">
              {data?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-sm hover:border-gold/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-gold/10 flex items-center justify-center text-gold">
                      <Handshake size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.category} · {p.country}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-gold transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deletePartner.mutate(p.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-sm p-6 h-fit sticky top-8">
          <h2 className="text-xl font-display mb-6">{editingId ? "Modifier Partenaire" : "Nouveau Partenaire"}</h2>
          <form onSubmit={e => { e.preventDefault(); submitPartner.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Nom du partenaire</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Secteur / Catégorie</label>
              <input required value={category} onChange={e => setCategory(e.target.value)} type="text" placeholder="ex: Hôtellerie, Finance..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Pays / Rayonnement</label>
              <input required value={country} onChange={e => setCountry(e.target.value)} type="text" placeholder="ex: International" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" disabled={submitPartner.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                {submitPartner.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Ajouter</>}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 bg-muted border border-border text-foreground font-medium text-xs tracking-wide uppercase rounded-sm">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
