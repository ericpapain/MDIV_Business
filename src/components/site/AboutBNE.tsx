import { Users, Building, Globe, Shield, Handshake, Diamond, Lightbulb, Search, Briefcase, TrendingUp, Cpu } from "lucide-react";

export function AboutBNE() {
  return (
    <section className="container py-20">
      <div className="text-center mb-16">
        <div className="eyebrow mb-4">Qui sommes-nous</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[1.05] mb-6">
          BUSINESS NETWORK EXPERIENCE
        </h2>
        <p className="text-xl md:text-2xl text-gold-light font-display tracking-widest mb-6">
          CRÉER. CONNECTER. DÉVELOPPER.
        </p>
        <p className="max-w-3xl mx-auto text-muted-foreground text-lg">
          Un écosystème international qui connecte entrepreneurs, entreprises et territoires
          pour créer des opportunités grâce aux rencontres, à la visibilité et à l'innovation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-20">
        {/* VISION */}
        <div className="glass-strong p-8 md:p-10 rounded-sm corner-deco relative">
          <h3 className="font-display text-3xl mb-4 text-white">1. Vision</h3>
          <p className="text-muted-foreground mb-8">
            BNE est un écosystème de développement entrepreneurial qui crée des connexions utiles,
            transforme les rencontres en opportunités et accompagne les acteurs dans leur croissance.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">Rencontres Qualifiées</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">Expériences Immersives</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">Visibilité</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">Opportunités Commerciales</span>
            <span className="text-[10px] uppercase tracking-[0.15em] bg-gold/10 text-gold-light px-3 py-1.5 rounded-sm border border-gold/20">Innovation</span>
          </div>
        </div>

        {/* POUR QUI */}
        <div className="glass-strong p-8 md:p-10 rounded-sm corner-deco relative">
          <h3 className="font-display text-3xl mb-6 text-white">2. Pour qui ?</h3>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-3 bg-background/50">
                  <Users className="text-gold" size={20} />
                </div>
                <h4 className="font-display text-sm uppercase tracking-[0.15em] text-white">Entrepreneurs<br />& Dirigeants</h4>
              </div>
              <ul className="text-[21px] text-muted-foreground space-y-2 list-disc pl-4">
                <li>Développer leur réseau</li>
                <li>Accéder à de nouvelles opportunités</li>
                <li>Trouver des expertises complémentaires</li>
                <li>Découvrir de nouveaux marchés</li>
              </ul>
            </div>
            <div>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center mb-3 bg-background/50">
                  <Building className="text-gold" size={20} />
                </div>
                <h4 className="font-display text-sm uppercase tracking-[0.15em] text-white">Entreprises</h4>
              </div>
              <ul className="text-[21px] text-muted-foreground space-y-2 list-disc pl-4 mt-8 sm:mt-0">
                <li>Renforcer leur visibilité</li>
                <li>Développer leur activité</li>
                <li>Créer des connexions qualifiées</li>
                <li>Bénéficier d'un accompagnement stratégique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PARCOURS D'ENGAGEMENT */}
      <div className="mb-20">
        <h3 className="font-display text-3xl mb-10 text-center text-white">Parcours d'engagement</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gold/20" />
          
          {[
            { step: 1, title: "Découverte", desc: "Événement ou rencontre BNE", icon: Search },
            { step: 2, title: "Expérience", desc: "Participation à un séjour", icon: Briefcase },
            { step: 3, title: "Intégration", desc: "Rejoindre l'écosystème", icon: Users },
            { step: 4, title: "Développement", desc: "Accompagnement entreprise", icon: TrendingUp },
            { step: 5, title: "Optimisation", desc: "Solutions IA Business", icon: Cpu },
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5">
              <div className="w-16 h-16 rounded-full glass border border-gold/40 flex items-center justify-center mb-4 bg-background">
                <item.icon className="text-gold" size={24} />
              </div>
              <div className="w-6 h-6 rounded-full bg-gold text-background font-bold text-xs flex items-center justify-center mb-3">
                {item.step}
              </div>
              <h4 className="font-display text-lg text-white mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VALEURS */}
      <div>
        <h3 className="font-display text-3xl mb-10 text-center text-white">Valeurs Fondamentales</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { title: "Confiance", icon: Shield },
            { title: "Contribution", icon: Handshake },
            { title: "Qualité", icon: Diamond },
            { title: "Ouverture Internationale", icon: Globe },
            { title: "Intelligence Collective", icon: Lightbulb },
          ].map((val) => (
            <div key={val.title} className="flex flex-col items-center text-center w-32">
              <val.icon className="text-gold mb-3" size={32} />
              <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">{val.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
