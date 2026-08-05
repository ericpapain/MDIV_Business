import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si déjà connecté
    fetch("/api-auth.php?action=check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          navigate("/admin");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api-auth.php?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'espace d'administration.",
        });
        navigate("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: data.message || "Identifiants incorrects.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se connecter au serveur.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md luxe-card p-8 rounded-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-muted/30 border border-border rounded-sm flex items-center justify-center mb-4">
            <Shield className="text-gold w-6 h-6" />
          </div>
          <h1 className="font-display text-2xl mb-2 text-center">Espace d'Administration</h1>
          <p className="text-sm text-muted-foreground text-center">Accès sécurisé réservé à la direction</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Identifiant</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-muted/30 border border-border rounded-sm outline-none focus:border-gold/50 transition-colors font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Mot de passe</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-sm outline-none focus:border-gold/50 transition-colors font-mono text-sm"
              />
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-gold text-background font-medium text-sm tracking-wide uppercase hover:bg-gold-light transition-colors rounded-sm flex items-center justify-center"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
