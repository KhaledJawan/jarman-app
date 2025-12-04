"use client";

import en from "@/data/i18n/en.json";
import fa from "@/data/i18n/fa.json";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isBrowser, load, save } from "./storage";

type Language = "fa" | "en";
type TranslationDict = Record<string, string>;

const translations: Record<Language, TranslationDict> = {
  en,
  fa,
};

type LanguageContextValue = {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: "rtl" | "ltr";
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextValue>({
  currentLanguage: "fa",
  setLanguage: () => {},
  t: (key) => key,
  direction: "rtl",
  isRTL: true,
});

const STORAGE_KEY = "jarman-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("fa");

  useEffect(() => {
    const saved = load<Language>(STORAGE_KEY);
    if (saved === "fa" || saved === "en") {
      setCurrentLanguage(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    if (isBrowser) {
      save(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
      document.documentElement.dataset.dir = lang === "fa" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    if (isBrowser) {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = currentLanguage === "fa" ? "rtl" : "ltr";
      document.documentElement.dataset.dir = currentLanguage === "fa" ? "rtl" : "ltr";
    }
  }, [currentLanguage]);

  const translate = useCallback(
    (key: string) => {
      const value = translations[currentLanguage]?.[key];
      return value ?? key;
    },
    [currentLanguage],
  );

  const value: LanguageContextValue = useMemo(() => {
    const direction: "rtl" | "ltr" = currentLanguage === "fa" ? "rtl" : "ltr";
    return {
      currentLanguage,
      setLanguage,
      t: translate,
      direction,
      isRTL: direction === "rtl",
    };
  }, [currentLanguage, setLanguage, translate]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  return useContext(LanguageContext).t;
}

// Helper for static lookups when context is not available (e.g., server components).
export function t(key: string, lang: Language = "fa") {
  return translations[lang]?.[key] ?? key;
}
