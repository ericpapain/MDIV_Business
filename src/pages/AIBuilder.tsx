import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import type { Profile, Objective } from "@/data/mockData";

const steps = ["Profil", "Objectif", "Budget", "Intérêts", "Durée", "Destination"];
const profileOpts: { v: Profile; label: string; desc: string }[] = [
  { v: "entrepreneur", label: "Entrepreneur", desc: "Fondateur ou opérateur en croissance" },
  { v: "investor", label: "Investisseur", desc: "VC, family office, business angel" },
  { v: "freelancer", label: "Indépendant", desc: "Consultant, expert, advisor" },
];
const objectiveOpts: { v: Objective; label: string; desc: string }[] = [
  { v: "networking", label: "Réseau", desc: "Élargir mon cercle de pairs et de clients" },
  { v: "investment", label: "Investissement", desc: "Sourcer ou lever des capitaux" },
  { v: "discovery", label: "Découverte", desc: "Voyage premium & inspiration" },
];
const interestOpts = ["Hôtels d'exception", "Gastronomie étoilée", "Yacht & mer", "Art & culture", "Wellness", "Pitchs startups", "Family offices", "Crypto & Web3"];
const countries = ["France", "Suisse", "Monaco", "UAE", "Royaume-Uni", "Maroc", "États-Unis", "Japon"];

export default function AIBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    profile: "" as Profile | "",
    objective: "" as Objective | "",
    budget: 3000,
    interests: [] as string[],
    duration: 3,
    country: "",
  });

  const progress = ((step + 1) / steps.length) * 100;

  const valid = useMemo(() => {
    switch (step) {
      case 0: return !!data.profile;
      case 1: return !!data.objective;
      case 2: return data.budget > 0;
      case 3: return data.interests.length > 0;
      case 4: return data.duration > 0;
      case 5: return !!data.country;
    }
    return false;
  }, [step, data]);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const q = new URLSearchParams({
        profile: data.profile, objective: data.objective, budget: String(data.budget),
        interests: data.interests.join(","), duration: String(data.duration), country: data.country,
      }).toString();
      navigate(`/resultat?${q}`);
    }
  };

  const toggleInterest = (i: string) =>
    setData({ ...data, interests: data.interests.includes(i) ? data.interests.filter((x) => x !== i) : [...data.interests, i] });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container max-w-4xl">
        <div className="text-center mb-12 animate-fade-up">
          <div className="eyebrow mb-4 flex items-center gap-3 justify-center"><Sparkles size={14} className="text-primary" /> Aria · Conciergerie IA</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4 leading-[1.05]">Composons votre <em className="italic gold-text">expérience.</em></h1>
          <p className="text-muted-foreground font-serif italic">6 questions. Un programme exclusif généré en 12 secondes.</p>
        </div>

        <div className="glass-strong rounded-sm p-8 md:p-12 corner-deco relative">
          {/* progress */}
          <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>Étape {step + 1} / {steps.length}</span>
            <span className="text-primary">{steps[step]}</span>
          </div>
          <div className="h-px bg-border mb-10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-light transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>

          {/* steps */}
          <div key={step} className="animate-fade-up min-h-[300px]">
            {step === 0 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Qui êtes-vous ?</h2>
                <p className="text-muted-foreground mb-8">Pour personnaliser chaque interaction.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {profileOpts.map((o) => (
                    <button key={o.v} onClick={() => setData({ ...data, profile: o.v })}
                      className={`text-left p-6 rounded-sm border transition-all ${data.profile === o.v ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"}`}>
                      <div className="font-display text-xl mb-2">{o.label}</div>
                      <div className="text-sm text-muted-foreground">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Quel est votre objectif ?</h2>
                <p className="text-muted-foreground mb-8">Aria orchestrera autour de ce but.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {objectiveOpts.map((o) => (
                    <button key={o.v} onClick={() => setData({ ...data, objective: o.v })}
                      className={`text-left p-6 rounded-sm border transition-all ${data.objective === o.v ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"}`}>
                      <div className="font-display text-xl mb-2">{o.label}</div>
                      <div className="text-sm text-muted-foreground">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Votre enveloppe.</h2>
                <p className="text-muted-foreground mb-8">Aucune offre n'est imposée. Vous gardez le contrôle.</p>
                <div className="text-center my-12">
                  <div className="font-display text-7xl gold-text">{data.budget.toLocaleString("fr-FR")} €</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-2">par personne</div>
                </div>
                <input type="range" min={500} max={20000} step={100} value={data.budget}
                  onChange={(e) => setData({ ...data, budget: +e.target.value })}
                  className="w-full accent-gold" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>500 €</span><span>20 000 €</span>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Vos centres d'intérêt.</h2>
                <p className="text-muted-foreground mb-8">Sélectionnez ce qui vous anime.</p>
                <div className="flex flex-wrap gap-3">
                  {interestOpts.map((i) => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`px-5 py-2.5 text-sm rounded-sm border transition-all ${data.interests.includes(i) ? "border-gold bg-gold/10 text-gold-light" : "border-border hover:border-gold/40"}`}>
                      {data.interests.includes(i) && <Check size={12} className="inline mr-2" />}{i}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Combien de jours ?</h2>
                <p className="text-muted-foreground mb-8">L'idéal se situe entre 2 et 5 jours.</p>
                <div className="grid grid-cols-7 gap-3 max-w-2xl">
                  {[1, 2, 3, 4, 5, 7, 10].map((d) => (
                    <button key={d} onClick={() => setData({ ...data, duration: d })}
                      className={`aspect-square rounded-sm border font-display text-2xl transition-all ${data.duration === d ? "border-gold bg-gold/10 text-gold-light" : "border-border hover:border-gold/40"}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 5 && (
              <div>
                <h2 className="font-display text-3xl mb-2">Quelle destination ?</h2>
                <p className="text-muted-foreground mb-8">Nous opérons dans 47 pays.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {countries.map((c) => (
                    <button key={c} onClick={() => setData({ ...data, country: c })}
                      className={`p-4 rounded-sm border text-sm transition-all ${data.country === c ? "border-gold bg-gold/10 text-gold-light" : "border-border hover:border-gold/40"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* nav */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft size={14} /> Retour
            </button>
            <button onClick={next} disabled={!valid}
              className="btn-gold px-8 py-3.5 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
              {step === steps.length - 1 ? "Générer mon expérience exclusive" : "Continuer"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}