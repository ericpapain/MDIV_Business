import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Trash2, Plus, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMembers() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [flag, setFlag] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const res = await fetch("/api-public.php?action=members");
      const json = await res.json();
      return json.data || [];
    },
  });

  const resetForm = () => {
    setName(""); setRole(""); setImageUrl(""); setFlag(""); setCountryCode(""); setEditingId(null);
  };

  const submitMember = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_member" : "add_member";
      const payload = { id: editingId, name, role, image_url: imageUrl, flag, countryCode };
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
      toast({ title: editingId ? "Membre modifié" : "Membre ajouté" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteMember = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Membre supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    }
  });

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setImageUrl(m.image_url);
    setFlag(m.flag);
    setCountryCode(m.countryCode);
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-display mb-8">Gestion des Membres</h1>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          <div className="bg-muted/30 border border-border rounded-sm p-4">
            <h2 className="text-xl font-display mb-4">Liste des Membres</h2>
            <div className="space-y-2">
              {data?.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-sm hover:border-gold/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {m.image_url && <img src={m.image_url} alt={m.name} className="w-10 h-10 rounded-full object-cover" />}
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {m.name} <span>{m.flag}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-gold transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteMember.mutate(m.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 border border-border rounded-sm p-6 h-fit sticky top-8">
          <h2 className="text-xl font-display mb-6">{editingId ? "Modifier le Membre" : "Nouveau Membre"}</h2>
          <form onSubmit={e => { e.preventDefault(); submitMember.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Nom</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Rôle / Description</label>
              <input required value={role} onChange={e => setRole(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Lien Photo (Optionnel)</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} type="text" placeholder="/assets/profils/cerise.jpg ou https://..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Emoji Drapeau</label>
              <input value={flag} onChange={e => setFlag(e.target.value)} type="text" placeholder="🇫🇷" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Code Pays (ex: FR)</label>
              <input value={countryCode} onChange={e => setCountryCode(e.target.value)} type="text" placeholder="FR" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            
            <div className="flex gap-2">
              <button type="submit" disabled={submitMember.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                {submitMember.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16}/> Mettre à jour</> : <><Plus size={16}/> Ajouter</>}
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
