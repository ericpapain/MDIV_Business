import React, { createContext, useContext, useState, useEffect } from "react";
import fr from "./fr.json";
import en from "./en.json";

type Language = "fr" | "en";
type Translations = typeof fr;

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("mdiv-lang");
    return (saved === "fr" || saved === "en") ? saved : "fr";
  });

  useEffect(() => {
    localStorage.setItem("mdiv-lang", language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    const translations: any = language === "fr" ? fr : en;
    let current = translations;

    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${keyPath} in ${language}`);
        return keyPath;
      }
      current = current[key];
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
