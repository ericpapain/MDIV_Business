import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { COUNTRIES } from "@/data/countries";
import { Handshake, Trash2, Plus, Loader2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useLocation } from "react-router-dom";

export default function AdminPartners() {
  const location = useLocation();
  const prefillData = location.state?.prefillData;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [flag, setFlag] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (prefillData) {
      setName(prefillData.company || prefillData.name || "");
      setSector(prefillData.sector || "");
      if (prefillData.country) {
        const countryName = prefillData.country.split(' ')[1] || prefillData.country;
        const found = COUNTRIES.find(c => c.labelFr.toLowerCase() === countryName.toLowerCase());
        if (found) {
          setCountry(found.code);
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
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_partners");
      const json = await res.json();
      return json.data || [];
    },
  });

  const resetForm = () => {
    setName(""); setCategory(""); setCountry(""); setFlag(""); setSector(""); setWebsite(""); setLogoUrl(""); setEditingId(null);
  };

  const submitPartner = useMutation({
    mutationFn: async () => {
      const action = editingId ? "edit_partner" : "add_partner";
      const payload = { id: editingId, name, category, country, flag, sector, website, logo_url: logoUrl };
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
    setFlag(p.flag || "");
    setSector(p.sector || "");
    setWebsite(p.website || "");
    setLogoUrl(p.logo_url || "");
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Réseau</div>
        <h1 className="font-display text-4xl flex items-center gap-3">
          <Handshake className="text-gold" size={32} /> Gestion des Partenaires
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Liste */}
        <div className="space-y-3">
          <h2 className="text-xl font-display mb-4">Liste des Partenaires ({data?.length || 0})</h2>
          {data?.map((p: any) => (
            <div key={p.id} className="luxe-card p-4 rounded-sm flex items-center justify-between gap-4 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4">
                {p.logo_url ? (
                  <img src={p.logo_url.startsWith('http') || p.logo_url.startsWith('/') ? p.logo_url : `/${p.logo_url}`} alt={p.name} className="w-12 h-12 rounded-sm object-contain border border-gold/20 p-1 bg-black/20" />
                ) : (
                  <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center text-2xl">
                    {p.flag || <Handshake size={20} className="text-gold" />}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <span>{p.flag}</span> {p.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.sector || p.category} · {p.country}</div>
                  {p.website && <div className="text-xs text-gold/60 mt-0.5">{p.website}</div>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-gold transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => { if (confirm("Supprimer ce partenaire ?")) deletePartner.mutate(p.id); }} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <p className="text-muted-foreground text-sm p-8 text-center border border-dashed border-border rounded-sm">
              Aucun partenaire. Ajoutez-en un depuis le formulaire.
            </p>
          )}
        </div>

        {/* Formulaire */}
        <div className="bg-muted/30 border border-border rounded-sm p-6 h-fit sticky top-8">
          <h2 className="text-xl font-display mb-6">{editingId ? "Modifier le Partenaire" : "Nouveau Partenaire"}</h2>
          <form onSubmit={e => { e.preventDefault(); submitPartner.mutate(); }} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Nom de l'entreprise *</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Tech Africa" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Secteur d'activité</label>
                <input value={sector} onChange={e => setSector(e.target.value)} type="text" placeholder="Transformation Digitale" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Catégorie</label>
                <input value={category} onChange={e => setCategory(e.target.value)} type="text" placeholder="Tech, Finance..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Pays / Drapeau</label>
              <select value={country} onChange={e => {
                const code = e.target.value;
                setCountry(code);
                if (code) {
                  const countryObj = COUNTRIES.find(c => c.code === code);
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
                  return <option key={c.code} value={c.code}>{emoji} {c.labelFr}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Site Internet</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} type="text" placeholder="https://..." className="w-full px-3 py-2 bg-muted/30 border border-border rounded-sm text-sm" />
            </div>
            <ImageUpload value={logoUrl} onChange={setLogoUrl} label="Logo de l'entreprise" />

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitPartner.isPending} className="flex-1 py-3 bg-gold text-background font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                {submitPartner.isPending ? <Loader2 size={16} className="animate-spin" /> : editingId ? <><Edit size={16} /> Mettre à jour</> : <><Plus size={16} /> Ajouter</>}
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
