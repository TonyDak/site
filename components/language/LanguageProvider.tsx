"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { portfolioContent } from "@/lib/content/data";
import type { Locale, PortfolioContent } from "@/lib/content/types";

type LanguageContextValue = {
  locale: Locale;
  content: PortfolioContent;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "portfolio-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") {
      const restoreLocale = window.setTimeout(() => setLocale(stored), 0);
      return () => window.clearTimeout(restoreLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, content: portfolioContent[locale], setLocale }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
