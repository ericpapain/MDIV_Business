import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AdminApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const res = await fetch("/api-admin.php?action=get_applications");
      const json = await res.json();
      return json.data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await fetch("/api-admin.php?action=update_application_status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    }
  });

  const handleAccept = (app: any) => {
    // 1. Mettre à jour le statut en base
    updateStatus.mutate({ id: app.id, status: 'accepted' });
    
    // 2. Parser les données JSON
    let parsedData = {};
    try {
      parsedData = JSON.parse(app.data);
    } catch(e) {}

    // 3. Rediriger vers la bonne page avec les données pré-remplies dans l'état de la route
    if (app.type === 'partenaire') {
      navigate('/admin/partners', { state: { prefillData: parsedData } });
    } else {
      navigate('/admin/ambassadors', { state: { prefillData: parsedData } });
    }
  };

  const handleReject = (app: any) => {
    if (confirm("Êtes-vous sûr de vouloir rejeter cette candidature ?")) {
      updateStatus.mutate({ id: app.id, status: 'rejected' });
      toast({ title: "Candidature rejetée" });
    }
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-2">CMS Réseau</div>
        <h1 className="font-display text-4xl flex items-center gap-3">
          <Star className="text-gold" size={32} /> Candidatures & Demandes
        </h1>
      </div>

      <div className="space-y-4">
        {data?.length === 0 && (
          <p className="text-muted-foreground text-sm p-8 text-center border border-dashed border-border rounded-sm">
            Aucune candidature pour le moment.
          </p>
        )}
        
        {data?.map((app: any) => {
          let parsedData: any = {};
          try {
            parsedData = JSON.parse(app.data);
          } catch(e) {}

          const isAccepted = app.status === 'accepted';
          const isRejected = app.status === 'rejected';
          const isPending = app.status === 'pending';

          const name = parsedData.company || parsedData.ambassadorName || parsedData.name || "Candidat Anonyme";
          
          return (
            <div key={app.id} className="luxe-card p-6 rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-gold/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm 
                    ${app.type === 'partenaire' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}
                  `}>
                    {app.type}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={12} /> {new Date(app.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                
                <h3 className="font-display text-xl mb-1">{name}</h3>
                <div className="text-sm text-foreground/80 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                  {parsedData.email && <div><strong className="text-muted-foreground">Email:</strong> {parsedData.email}</div>}
                  {parsedData.phone && <div><strong className="text-muted-foreground">Tél:</strong> {parsedData.phone}</div>}
                  {parsedData.country && <div><strong className="text-muted-foreground">Pays:</strong> {parsedData.country}</div>}
                  {parsedData.sector && <div><strong className="text-muted-foreground">Secteur:</strong> {parsedData.sector}</div>}
                </div>

                <div className="bg-muted/30 p-3 rounded-sm border border-border/50 text-sm italic">
                  "{parsedData.motivation || parsedData.message || 'Aucune motivation fournie.'}"
                </div>
              </div>

              <div className="shrink-0 flex flex-row md:flex-col gap-2 w-full md:w-48">
                {isPending && (
                  <>
                    <button 
                      onClick={() => handleAccept(app)}
                      className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2 transition-colors"
                    >
                      <CheckCircle size={14} /> Accepter
                    </button>
                    <button 
                      onClick={() => handleReject(app)}
                      className="flex-1 py-2 px-4 bg-transparent border border-destructive/50 text-destructive hover:bg-destructive/10 font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2 transition-colors"
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  </>
                )}
                
                {isAccepted && (
                  <div className="flex-1 py-2 px-4 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                    <CheckCircle size={14} /> Acceptée
                  </div>
                )}

                {isRejected && (
                  <div className="flex-1 py-2 px-4 bg-destructive/20 border border-destructive/30 text-destructive font-medium text-xs tracking-wide uppercase rounded-sm flex justify-center items-center gap-2">
                    <XCircle size={14} /> Rejetée
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
