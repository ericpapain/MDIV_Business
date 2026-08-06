import { useState } from "react";
import { X, Clock, Coffee, Mic, Users, UtensilsCrossed, Plane, Briefcase, PartyPopper, Star, ChevronRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ICONS: Record<string, any> = {
  coffee: Coffee,
  mic: Mic,
  network: Users,
  dinner: UtensilsCrossed,
  transport: Plane,
  workshop: Briefcase,
  party: PartyPopper,
  star: Star,
  default: Clock,
};

interface ProgramSlot {
  time: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  icon?: string;
}

interface ProgramDay {
  day_label: string;
  day_label_en?: string;
  slots: ProgramSlot[];
}

interface ProgramPanelProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventTitleEn?: string;
  program: ProgramDay[];
}

export function ProgramPanel({ isOpen, onClose, eventTitle, eventTitleEn, program }: ProgramPanelProps) {
  const [activeDay, setActiveDay] = useState(0);
  const { t, language } = useLanguage();
  const isEn = language === "en";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
        style={{ animation: "fadeIn 0.3s ease-out" }}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[520px] bg-[#0c0f13]/95 border-l border-gold/20 shadow-[−40px_0_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        style={{ animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gold/10 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2 flex items-center gap-2">
                <span className="w-6 h-px bg-gold/50" /> {isEn ? "Program" : "Programme"}
              </div>
              <h2 className="font-display text-2xl text-foreground leading-tight">
                {isEn && eventTitleEn ? eventTitleEn : eventTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Day Tabs */}
          {program.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {program.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDay(idx)}
                  className={`px-4 py-2 rounded-sm text-[11px] uppercase tracking-[0.15em] font-medium whitespace-nowrap transition-all duration-300 border ${
                    activeDay === idx
                      ? "bg-gold/15 border-gold/40 text-gold-light shadow-[0_0_15px_rgba(197,160,89,0.1)]"
                      : "bg-muted/10 border-border/20 text-muted-foreground hover:border-gold/20 hover:text-foreground"
                  }`}
                >
                  {isEn && day.day_label_en ? day.day_label_en : day.day_label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {program[activeDay] && (
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

              <div className="space-y-0">
                {program[activeDay].slots.map((slot, idx) => {
                  const IconComponent = ICONS[slot.icon || "default"] || ICONS.default;
                  return (
                    <div key={idx} className="relative pl-10 pb-8 group last:pb-0">
                      {/* Node */}
                      <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full border-2 border-gold/30 bg-[#0c0f13] flex items-center justify-center group-hover:border-gold/60 group-hover:bg-gold/10 transition-all duration-500 z-10">
                        <IconComponent size={13} className="text-gold/70 group-hover:text-gold transition-colors duration-500" />
                      </div>

                      {/* Content Card */}
                      <div className="bg-white/[0.02] border border-border/10 rounded-sm p-4 group-hover:border-gold/20 group-hover:bg-gold/[0.03] transition-all duration-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded-sm">
                            {slot.time}
                          </span>
                        </div>
                        <h4 className="font-display text-base text-foreground mb-1 group-hover:text-gold-light transition-colors duration-300">
                          {isEn && slot.title_en ? slot.title_en : slot.title}
                        </h4>
                        {(slot.description || slot.description_en) && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {isEn && slot.description_en ? slot.description_en : slot.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gold/10 shrink-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center">
            {program.length} {program.length > 1 ? (isEn ? "days" : "jours") : (isEn ? "day" : "jour")} · {program.reduce((acc, d) => acc + d.slots.length, 0)} {isEn ? "sessions" : "créneaux"}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197,160,89,0.2); border-radius: 2px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
