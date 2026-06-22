export function SectionHeading({ eyebrow, title, sub, center = false }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-3xl mb-12`}>
      {eyebrow && <div className="eyebrow mb-4">{eyebrow}</div>}
      <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
        {title}
      </h2>
      {sub && <p className="mt-5 text-base md:text-lg text-muted-foreground font-serif italic leading-relaxed">{sub}</p>}
      <div className={`hairline mt-6 ${center ? "mx-auto max-w-[120px]" : "max-w-[120px]"}`} />
    </div>
  );
}