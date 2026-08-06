import { Stethoscope, Handshake, ShieldCheck, ArrowRight } from "lucide-react";

export function AnimatedClip() {
  return (
    <div className="container py-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold-light text-xs font-mono uppercase tracking-[0.2em] mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            Parcours Patient
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            Comment se déroule un <br />
            <span className="gold-text italic">traitement à l’ITID ?</span>
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Chaque prise en charge suit un parcours structuré. L’objectif est que vous compreniez les options possibles, que vous puissiez poser vos questions et que le traitement soit réalisé dans les meilleures conditions de sécurité et de confort.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/0 via-gold/30 to-gold/0 -translate-x-1/2 hidden md:block" />

          <div className="flex flex-col gap-12 md:gap-24">
            
            {/* ETAPE 1 */}
            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex md:justify-end text-left md:text-right animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <div className="max-w-sm">
                  <div className="text-gold-light font-mono text-sm uppercase tracking-widest mb-3">Étape 1</div>
                  <h3 className="text-2xl font-display mb-4">Consultation d’évaluation</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Votre médecin spécialiste de la douleur réalise un bilan complet : type de douleurs, antécédents, examens déjà réalisés, traitements essayés, retentissement sur votre quotidien.
                  </p>
                  <p className="text-foreground/90 text-sm leading-relaxed mb-6 font-serif italic">
                    C’est à cette étape que sont discutées les différentes options thérapeutiques possibles.
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:text-gold-light transition-colors group-hover:translate-x-1 duration-300">
                    Pathologies prises en charge <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              
              {/* Icon Center */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-background border border-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.15)] z-10 group-hover:scale-110 group-hover:border-gold transition-all duration-500">
                <Stethoscope className="text-gold w-6 h-6" />
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-[ping_3s_ease-in-out_infinite]" />
              </div>

              <div className="md:w-1/2 md:pl-16 hidden md:block animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <div className="glass-strong p-6 rounded-sm border-l-2 border-gold/50 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Stethoscope className="w-32 h-32" />
                  </div>
                  <div className="text-sm text-foreground/80 font-mono leading-relaxed">
                    • Bilan complet<br/>
                    • Antécédents<br/>
                    • Options thérapeutiques
                  </div>
                </div>
              </div>
            </div>

            {/* ETAPE 2 */}
            <div className="relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex text-left animate-fade-up" style={{ animationDelay: "0.4s" }}>
                <div className="max-w-sm">
                  <div className="text-gold-light font-mono text-sm uppercase tracking-widest mb-3">Étape 2</div>
                  <h3 className="text-2xl font-display mb-4">Décision partagée</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    En fonction de votre situation et des bénéfices attendus, le médecin vous explique les différents traitements possibles, leurs objectifs et leurs éventuels effets indésirables.
                  </p>
                  <p className="text-foreground/90 text-sm leading-relaxed font-serif italic border-l-2 border-gold/50 pl-4 py-1">
                    La décision de réaliser (ou non) un geste interventionnel est prise avec vous, jamais à votre place.
                  </p>
                </div>
              </div>
              
              {/* Icon Center */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-background border border-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.15)] z-10 group-hover:scale-110 group-hover:border-gold transition-all duration-500">
                <Handshake className="text-gold w-6 h-6" />
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-[ping_3s_ease-in-out_infinite]" style={{ animationDelay: "1s" }} />
              </div>

              <div className="md:w-1/2 md:pr-16 hidden md:flex justify-end animate-fade-up" style={{ animationDelay: "0.6s" }}>
                <div className="glass-strong p-6 rounded-sm border-r-2 border-gold/50 text-right relative overflow-hidden">
                  <div className="absolute -left-4 -bottom-4 opacity-5">
                    <Handshake className="w-32 h-32" />
                  </div>
                  <div className="text-sm text-foreground/80 font-mono leading-relaxed">
                    Explications claires <br/>
                    Bénéfices / Risques <br/>
                    Choix du patient
                  </div>
                </div>
              </div>
            </div>

            {/* ETAPE 3 */}
            <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 group">
              <div className="md:w-1/2 flex md:justify-end text-left md:text-right animate-fade-up" style={{ animationDelay: "0.6s" }}>
                <div className="max-w-sm">
                  <div className="text-gold-light font-mono text-sm uppercase tracking-widest mb-3">Étape 3</div>
                  <h3 className="text-2xl font-display mb-4">Réalisation & Suivi</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Le geste est réalisé dans des conditions de sécurité optimales (salle dédiée, matériel adapté, surveillance si nécessaire).
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Un suivi est organisé pour évaluer l’efficacité du traitement, adapter éventuellement la prise en charge et programmer une consultation de contrôle si besoin.
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary hover:text-gold-light transition-colors group-hover:translate-x-1 duration-300">
                    Infos pratiques ITID Troyes <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              
              {/* Icon Center */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-background border border-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(197,160,89,0.15)] z-10 group-hover:scale-110 group-hover:border-gold transition-all duration-500">
                <ShieldCheck className="text-gold w-6 h-6" />
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-[ping_3s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
              </div>

              <div className="md:w-1/2 md:pl-16 hidden md:block animate-fade-up" style={{ animationDelay: "0.8s" }}>
                <div className="glass-strong p-6 rounded-sm border-l-2 border-gold/50 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <ShieldCheck className="w-32 h-32" />
                  </div>
                  <div className="text-sm text-foreground/80 font-mono leading-relaxed">
                    • Sécurité optimale<br/>
                    • Matériel adapté<br/>
                    • Suivi personnalisé
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
