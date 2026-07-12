"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { locale, setLocale, content } = useLanguage();
  const nextLocale = locale === "en" ? "vi" : "en";

  return (
    <button
      type="button"
      className="c--language-toggle"
      aria-label={content.navigation.languageLabel}
      onClick={() => setLocale(nextLocale)}
    >
      <span className={locale === "en" ? "is-active" : ""}>EN</span>
      <span aria-hidden="true">/</span>
      <span className={locale === "vi" ? "is-active" : ""}>VI</span>
    </button>
  );
}
