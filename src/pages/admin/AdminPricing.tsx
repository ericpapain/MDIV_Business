import { useState } from "react";
import { offers, computeFinalPrice } from "@/data/mockData";

export default function AdminPricing() {
  const [marginAdj, setMarginAdj] = useState<Record<string, number>>(Object.fromEntries(offers.map((o) => [o.id, o.margin])));
  return (
    <div className="">
      <div className="mb-8">
        <div className="eyebrow mb-2">Moteur de tarification</div>
        <h1 className="font-display text-4xl">Coûts · Marges · Prix final</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {offers.map((o) => {
          const cost = o.costBreakdown.hotel + o.costBreakdown.dining + o.costBreakdown.activity + o.costBreakdown.commission;
          const m = marginAdj[o.id];
          const finalP = Math.round(cost * (1 + m));
          const marginAmount = finalP - cost;
          return (
            <div key={o.id} className="luxe-card p-6 rounded-sm">
              <div className="font-display text-2xl mb-1">{o.name}</div>
              <div className="text-xs text-muted-foreground mb-6">{o.tagline}</div>
              <div className="space-y-2 text-sm font-mono mb-5">
                <Row l="Hôtellerie" v={o.costBreakdown.hotel} />
                <Row l="Gastronomie" v={o.costBreakdown.dining} />
                <Row l="Activités" v={o.costBreakdown.activity} />
                <Row l="Commissions" v={o.costBreakdown.commission} />
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Coût total</span>
                  <span className="text-foreground">{cost.toLocaleString("fr-FR")} €</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  <span>Marge appliquée</span><span className="text-gold-light">{Math.round(m * 100)}%</span>
                </div>
                <input type="range" min={0.1} max={0.6} step={0.01} value={m}
                  onChange={(e) => setMarginAdj({ ...marginAdj, [o.id]: +e.target.value })}
                  className="w-full accent-gold" />
              </div>
              <div className="glass p-4 rounded-sm">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Prix final TTC</div>
                <div className="font-display text-3xl gold-text">{finalP.toLocaleString("fr-FR")} €</div>
                <div className="text-xs text-success mt-1">Marge : +{marginAmount.toLocaleString("fr-FR")} €</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ l, v }: { l: string; v: number }) {
  return <div className="flex justify-between text-muted-foreground"><span>{l}</span><span>{v.toLocaleString("fr-FR")} €</span></div>;
}