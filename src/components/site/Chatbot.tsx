import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Msg = { from: "bot" | "user"; text: string };

export function Chatbot() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);

  // Reset chat when language changes to show the correct greeting
  useEffect(() => {
    setMsgs([{ from: "bot", text: t("chatbot.greeting") }]);
  }, [language]);

  const quickQuestions = [
    t("chatbot.q1"),
    t("chatbot.q2"),
    t("chatbot.q3"),
  ];

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = t("chatbot.default_reply");
      if (lower.includes("invest")) reply = t("chatbot.invest_reply");
      else if (lower.includes("monaco")) reply = t("chatbot.monaco_reply");
      else if (lower.includes("appel") || lower.includes("call")) reply = t("chatbot.call_reply");
      
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
    }, 700);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-gold flex items-center justify-center group"
        aria-label="Conciergerie IA"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && <span className="absolute inset-0 rounded-full animate-ping bg-gold/40" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] glass-strong rounded-sm overflow-hidden animate-fade-up flex flex-col" style={{ height: 520 }}>
          <div className="p-4 border-b border-gold/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-emerald-deep/60 flex items-center justify-center gold-border">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-base">Aria</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" /> {t("chatbot.status")}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed rounded-sm ${
                  m.from === "user" ? "bg-gold/15 text-foreground gold-border" : "bg-muted/40 text-foreground/90 border border-border"
                }`}>{m.text}</div>
              </div>
            ))}
            {msgs.length <= 1 && (
              <div className="pt-2 space-y-2">
                <div className="eyebrow">{t("chatbot.suggestions")}</div>
                {quickQuestions.map((q) => (
                  <button key={q} onClick={() => send(q)} className="block w-full text-left text-xs px-3 py-2 rounded-sm border border-border hover:border-gold/40 text-foreground/80 hover:text-primary transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t border-gold/15 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatbot.placeholder")}
              className="flex-1 bg-muted/40 border border-border rounded-sm px-3 py-2 text-sm outline-none focus:border-gold/60"
            />
            <button type="submit" className="btn-gold w-10 h-10 rounded-sm flex items-center justify-center">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}