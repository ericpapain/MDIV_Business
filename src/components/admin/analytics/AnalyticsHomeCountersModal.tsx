// src/components/admin/analytics/AnalyticsHomeCountersModal.tsx
import { useState, useEffect } from "react";
import { Settings, Save, Loader2, X, BarChart2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsHomeCountersModal({ isOpen, onClose }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteStats, isLoading } = useQuery({
    queryKey: ["site-stats"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_site_stats");
      const json = await res.json();
      return json.data;
    },
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    ambassadors_count: 0,
    partners_count: 0,
    events_count: 0,
    trips_count: 0,
    participants_count: 0,
    members_count: 10,
    countries_count: 4,
    satisfaction_rate: "87%",
  });

  useEffect(() => {
    if (siteStats) {
      setFormData({
        ambassadors_count: Math.max(siteStats.ambassadors_count || 0, siteStats.auto_ambassadors || 0),
        partners_count: Math.max(siteStats.partners_count || 0, siteStats.auto_partners || 0),
        events_count: Math.max(siteStats.events_count || 0, siteStats.auto_events || 0),
        trips_count: Math.max(siteStats.trips_count || 0, siteStats.auto_trips || 0),
        participants_count: Math.max(siteStats.participants_count || 0, siteStats.auto_participants || 0),
        members_count: siteStats.members_count || 0,
        countries_count: siteStats.countries_count || 0,
        satisfaction_rate: siteStats.satisfaction_rate || "87%",
      });
    }
  }, [siteStats]);

  const updateStats = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api-admin.php?action=update_site_stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      toast({
        title: "Statistiques d'accueil mises à jour",
        description: "La page d'accueil affiche désormais ces nouvelles valeurs.",
      });
      onClose();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-xl bg-[#071526] border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <BarChart2 size={16} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Compteurs Vitrine de l'Accueil</h3>
              <p className="text-xs text-slate-400">Valeurs affichées publiquement sur la page d'accueil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-[#D4AF37] w-6 h-6" />
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateStats.mutate(formData);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Ambassadeurs
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.ambassadors_count}
                  onChange={(e) =>
                    setFormData({ ...formData, ambassadors_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Partenaires
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.partners_count}
                  onChange={(e) =>
                    setFormData({ ...formData, partners_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Événements
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.events_count}
                  onChange={(e) =>
                    setFormData({ ...formData, events_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Séjours
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.trips_count}
                  onChange={(e) =>
                    setFormData({ ...formData, trips_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Membres (Hero)
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.members_count}
                  onChange={(e) =>
                    setFormData({ ...formData, members_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Pays (Hero)
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.countries_count}
                  onChange={(e) =>
                    setFormData({ ...formData, countries_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Satisfaction (Hero)
                </label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.satisfaction_rate}
                  onChange={(e) => setFormData({ ...formData, satisfaction_rate: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Participants Total
                </label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]/60"
                  value={formData.participants_count}
                  onChange={(e) =>
                    setFormData({ ...formData, participants_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={updateStats.isPending}
                className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#e5be48] text-black text-xs font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {updateStats.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
