import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar, MapPin, Sparkles, Users, ArrowRight, Crown, Check, Phone } from "lucide-react";
import { computeLeadScore, recommendOffer, computeFinalPrice, experiences, testimonials } from "@/data/mockData";
import type { Profile, Objective } from "@/data/mockData";

export default function Result() {
  const [sp] = useSearchParams();
  const profile = (sp.get("profile") || "entrepreneur") as Profile;
  const objective = (sp.get("objective") || "networking") as Objective;
  const budget = Number(sp.get("budget") || 3000);
  const duration = Number(sp.get("duration") || 3);
  const country = sp.get("country") || "France";
  const interests = (sp.get("interests") || "").split(",").filter(Boolean);

  const offer = useMemo(() => recommendOffer(profile, objective, budget), [profile, objective, budget]);
  const score = useMemo(() => computeLeadScore(profile, objective, budget, interests, duration), [profile, objective, budget, interests, duration]);
  const price = computeFinalPrice(offer);

  const program = [
    { day: "Jour 1", title: "Arrivée & Cercle privé", events: ["Transfert Mercedes Classe S", "Check-in suite signature", "Dîner d'ouverture · 3 invités triés", "Cigar lounge · Networking informel"] },
    { day: "Jour 2", title: "Sourcing & Stratégie", events: ["Petit-déjeuner avec mentor sectoriel", "Pitch privé 5 startups (matin)", "Déjeuner family office", "Yacht & coucher de soleil"] },
    { day: "Jour 3", title: "Closing & Signature", events: ["Brunch face-à-face investisseur", "Salon deal-room privé", "Dîner gastronomique de clôture", "Transfert retour"] },
  ].slice(0, duration <= 2 ? 2 : 3);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <div className="eyebrow mb-4 flex items-center gap-3"><Sparkles size={14} className="text-primary" /> Programme personnalisé par Aria</div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-4">
            Votre expérience <em className="italic gold-text">{offer.name}</em>
          </h1>
          <p className="text-muted-foreground font-serif italic text-lg">
            {duration} jours · {country} · profil {profile} · objectif {objective}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Lead score */}
          <div className="glass-strong p-6 rounded-sm corner-deco relative">
            <div className="eyebrow mb-3">Score Membre</div>
            <div className="flex items-end gap-3 mb-4">
              <div className="font-display text-6xl gold-text">{score}</div>
              <div className="text-sm text-muted-foreground pb-2">/ 100</div>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-gold-deep to-gold-light" style={{ width: `${score}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{score >= 80 ? "Profil VIP · accès prioritaire" : score >= 60 ? "Profil qualifié · réponse 24h" : "Profil intéressant · nurturing"}</p>
          </div>
          {/* Prix */}
          <div className="glass p-6 rounded-sm">
            <div className="eyebrow mb-3">Tarif TTC</div>
            <div className="font-display text-5xl gold-text mb-1">{price.toLocaleString("fr-FR")} €</div>
            <div className="text-xs text-muted-foreground mb-4">par personne · {duration} jours</div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex justify-between"><span>Hôtellerie</span><span className="font-mono">{offer.costBreakdown.hotel} €</span></li>
              <li className="flex justify-between"><span>Gastronomie</span><span className="font-mono">{offer.costBreakdown.dining} €</span></li>
              <li className="flex justify-between"><span>Activités</span><span className="font-mono">{offer.costBreakdown.activity} €</span></li>
              <li className="flex justify-between border-t border-border pt-1.5 mt-1.5"><span>Marge concierge</span><span className="font-mono">+{Math.round(offer.margin * 100)}%</span></li>
            </ul>
          </div>
          {/* Match */}
          <div className="glass p-6 rounded-sm">
            <div className="eyebrow mb-3">Compatibilité IA</div>
            <div className="space-y-3 mt-4">
              {[
                { l: "Réseau", v: 92 },
                { l: "Budget", v: Math.min(95, Math.round((budget / price) * 100)) },
                { l: "Destination", v: 88 },
                { l: "Calendrier", v: 76 },
              ].map((m) => (
                <div key={m.l}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{m.l}</span><span className="text-primary font-mono">{m.v}%</span></div>
                  <div className="h-0.5 bg-border"><div className="h-full bg-gold" style={{ width: `${m.v}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programme jour par jour */}
        <div className="mb-16">
          <div className="eyebrow mb-4">Programme jour par jour</div>
          <h2 className="font-display text-4xl mb-8">Un déroulé orchestré <em className="italic gold-text">à la minute.</em></h2>
          <div className="space-y-4">
            {program.map((d, i) => (
              <div key={i} className="luxe-card p-7 rounded-sm grid md:grid-cols-[180px,1fr] gap-6">
                <div>
                  <div className="eyebrow text-primary mb-2">{d.day}</div>
                  <div className="font-display text-2xl">{d.title}</div>
                </div>
                <ul className="space-y-2.5">
                  {d.events.map((e) => (
                    <li key={e} className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-1 h-1 bg-gold rounded-full" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts suggérés */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow mb-3 flex items-center gap-2"><Users size={12} /> Aria a sélectionné pour vous</div>
              <h2 className="font-display text-4xl">3 contacts <em className="italic gold-text">à rencontrer.</em></h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((c, i) => (
              <div key={i} className="luxe-card p-6 rounded-sm flex gap-4">
                <img src={c.image} alt={c.name} className="w-16 h-16 rounded-sm object-cover gold-border" />
                <div>
                  <div className="font-display text-lg">{c.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{c.role}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-primary"><Sparkles size={10} /> Match {88 + i}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsells */}
        <div className="mb-16">
          <div className="eyebrow mb-3">Surclassements suggérés</div>
          <h2 className="font-display text-4xl mb-8">Ajoutez la <em className="italic gold-text">touche finale.</em></h2>
          <div className="grid md:grid-cols-3 gap-5">
            {experiences.slice(0, 3).map((e) => (
              <div key={e.id} className="luxe-card rounded-sm overflow-hidden group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="eyebrow mb-2">{e.category}</div>
                  <div className="font-display text-lg mb-3">{e.title}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {e.location}</div>
                    <div className="gold-text font-display">+{e.price} €</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-strong rounded-sm p-10 md:p-14 text-center corner-deco relative">
          <Crown size={32} className="mx-auto mb-4 text-primary" />
          <h2 className="font-display text-3xl md:text-5xl mb-4">Prêt à concrétiser ce programme ?</h2>
          <p className="text-muted-foreground mb-8 font-serif italic">Réservation immédiate ou appel privé avec un concierge dédié.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gold px-8 py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3"><Check size={14} /> Réserver maintenant</button>
            <button className="btn-ghost-gold px-8 py-4 text-xs uppercase tracking-[0.22em] rounded-sm flex items-center justify-center gap-3"><Phone size={14} /> Demander un appel privé</button>
          </div>
        </div>
      </div>
    </div>
  );
}