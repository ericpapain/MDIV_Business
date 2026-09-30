import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Trash2, Plus, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminReviews() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [country, setCountry] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=reviews");
      const json = await res.json();
      return json.data || [];
    },
  });

  const resetForm = () => {
    setName(""); setRole(""); setQuote(""); setCountry(""); setEditingId(null);
  };

  const submitReview = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_review" : "add_review";
      const payload = { id: editingId, name, role, quote, country };
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
      toast({ title: editingId ? "Avis modifié" : "Avis ajouté" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteReview = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Avis supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    }
  });

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.name);
    setRole(r.role);
    setQuote(r.quote);
    setCountry(r.country);
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display mb-8">Gestion des Avis & Témoignages</h1>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-sm p-4">
            <h2 className="text-xl font-display mb-4">Liste des Avis</h2>
            <div className="space-y-3">
              {data?.map((r: any) => (
                <div key={r.id} className="p-4 bg-background border border-border/50 rounded-sm hover:border-gold/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-gold w-4 h-4" />
                      <span className="font-semibold text-sm">{r.name}</span>
                      <span className="text-xs text-muted-foreground">· {r.role}</span>
                      {r.country && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm ml-2">{r.country}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="p-1.5 text-muted-foreground hover:text-gold transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteReview.mutate(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs italic text-foreground/80 line-clamp-2">"{r.quote}"</p>
                </div>
              ))}
              {data.length === 0 && <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-sm p-6 h-fit sticky top-8">
          <h2 className="text-xl font-display mb-6">{editingId ? "Modifier l'Avis" : "Nouvel Avis"}</h2>
          <form onSubmit={e => { e.preventDefault(); submitReview.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Nom de l'auteur</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Rôle / Société</label>
              <input required value={role} onChange={e => setRole(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Citation / Avis</label>
              <textarea required value={quote} onChange={e => setQuote(e.target.value)} rows={4} className="w-full px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-sm resize-y min-h-[90px]" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Pays (ex: France, Suisse)</label>
              <input value={country} onChange={e => setCountry(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" disabled={submitReview.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                {submitReview.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Ajouter</>}
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
