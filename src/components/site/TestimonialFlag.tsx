import { getCountryCode } from "@/data/countries";

export function TestimonialFlag({ type, className = "w-12 h-12" }: { type: string, className?: string }) {
  const base = `shrink-0 rounded-full overflow-hidden shadow-lg border border-border flex items-center justify-center bg-[#0a0d0f] ${className}`;
  
  if (!type || type.toLowerCase() === "autre") {
    return (
      <div className={base}>
        <div className="flex-1 h-full" style={{ background: "#C5A059" }} />
        <div className="flex-1 h-full" style={{ background: "#0A0D0F" }} />
        <div className="flex-1 h-full" style={{ background: "#C5A059" }} />
      </div>
    );
  }

  const code = getCountryCode(type);

  return (
    <div className={base}>
      <img 
        src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`} 
        alt={type} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}
