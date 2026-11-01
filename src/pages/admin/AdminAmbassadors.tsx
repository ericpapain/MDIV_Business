import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { COUNTRIES } from "@/data/countries";
import { Globe, Trash2, Plus, Loader2, Edit, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useLocation } from "react-router-dom";

export default function AdminAmbassadors() {
  const location = useLocation();
  const prefillData = location.state?.prefillData;

  const [country, setCountry] = useState("");
  const [flag, setFlag] = useState("");
  const [zone, setZone] = useState("");
  const [expertises, setExpertises] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [company, setCompany] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (prefillData) {
      setCompany(prefillData.company || prefillData.ambassadorName || prefillData.name || "");
      if (prefillData.country) {
        const countryName = prefillData.country.split(' ')[1] || prefillData.country;
        const found = COUNTRIES.find(c => c.labelFr.toLowerCase() === countryName.toLowerCase());
        if (found) {
          setCountry(found.labelFr);
          const emoji = [...found.code].map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('');
          setFlag(emoji);
        }
      }
      // On efface le state pour ne pas re-préremplir au rafraichissement
      window.history.replaceState({}, document.title);
    }
  }, [prefillData]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ambassadors"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_ambassadors");
      const json = await res.json();
      return json.data || [];
    },
  });

  const resetForm = () => {
    setCountry(""); setFlag(""); setZone(""); setExpertises(""); setLogoUrl(""); setCompany(""); setEditingId(null);
  };

  const submitAmbassador = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_ambassador" : "add_ambassador";
      const payload = { id: editingId, country, flag, zone, expertises, logo_url: logoUrl, company };
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
      toast({ title: editingId ? "Ambassadeur modifié" : "Ambassadeur ajouté" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-ambassadors"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const deleteAmbassador = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api-admin.php?action=delete_ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ambassadeur supprimé" });
      queryClient.invalidateQueries({ queryKey: ["admin-ambassadors"] });
    }
  });

  const startEdit = (a: any) => {
    setEditingId(a.id);
    setCountry(a.country);
    setFlag(a.flag);
    setZone(a.zone);
    setExpertises(a.expertises);
    setLogoUrl(a.logo_url);
    setCompany(a.company || "");
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Réseau</div>
        <h1 className="font-display text-4xl flex items-center gap-3">
          <Star className="text-gold" size={32} /> Gestion des Ambassadeurs
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Liste */}
        <div className="space-y-3">
          <h2 className="text-xl font-display mb-4">Liste des Ambassadeurs ({data?.length || 0})</h2>
          {data?.map((a: any) => (
            <div key={a.id} className="luxe-card p-4 rounded-sm flex items-center justify-between gap-4 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4">
                {a.logo_url ? (
                  <img src={a.logo_url.startsWith('http') || a.logo_url.startsWith('/') ? a.logo_url : `/${a.logo_url}`} alt={a.country} className="w-12 h-12 rounded-full object-cover border border-gold/20" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl">
                    {a.flag || '🌍'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{a.flag}</span> {a.country}
                  </div>
                  <div className="text-xs text-muted-foreground">{a.zone}</div>
                  {a.expertises && (
                    <div className="text-xs text-gold/70 mt-1 line-clamp-1">{a.expertises}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)} className="p-2 text-muted-foreground hover:text-gold transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => { if (confirm("Supprimer cet ambassadeur ?")) deleteAmbassador.mutate(a.id); }} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="text-muted-foreground text-sm p-8 text-center border border-dashed border-border rounded-sm">
              Aucun ambassadeur. Ajoutez-en un depuis le formulaire.
            </p>
          )}
        </div>

        {/* Formulaire */}
        <div className="bg-muted/30 border border-border rounded-sm p-6 h-fit sticky top-8">
          <h2 className="text-xl font-display mb-6">{editingId ? "Modifier l'Ambassadeur" : "Nouvel Ambassadeur"}</h2>
          <form onSubmit={e => { e.preventDefault(); submitAmbassador.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Pays / Drapeau</label>
              <select value={country} onChange={e => {
                const name = e.target.value;
                setCountry(name);
                if (name) {
                  const countryObj = COUNTRIES.find(c => c.labelFr === name);
                  if (countryObj) {
                    const emoji = [...countryObj.code].map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('');
                    setFlag(emoji);
                  }
                } else {
                  setFlag("");
                }
              }} className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm outline-none focus:border-gold/60">
                <option value="">Sélectionner un pays</option>
                {COUNTRIES.map(c => {
                  const emoji = [...c.code].map(char => String.fromCodePoint(char.charCodeAt(0) + 127397)).join('');
                  return <option key={c.labelFr} value={c.labelFr}>{emoji} {c.labelFr}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Zone géographique couverte</label>
              <input value={zone} onChange={e => setZone(e.target.value)} type="text" placeholder="Afrique de l'Ouest" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Entreprise représentée (Optionnel)</label>
              <input value={company} onChange={e => setCompany(e.target.value)} type="text" placeholder="Nom de l'entreprise" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-slate-700 dark:text-slate-200 font-semibold mb-1 block">Domaines d'expertise (séparés par des virgules)</label>
              <textarea value={expertises} onChange={e => setExpertises(e.target.value)} rows={3} placeholder="Développement Commercial, Commerce International, Investissement" className="w-full px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-sm resize-y min-h-[80px]" />
            </div>
            <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo de l'Ambassadeur / Structure" />

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitAmbassador.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                {submitAmbassador.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16} /> Mettre à jour</> : <><Plus size={16} /> Ajouter</>}
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
