"use client";

import { IdeShell } from "@/components/ide/IdeShell";
import { useLanguage } from "@/components/language/LanguageProvider";

export default function BlogError({ reset }: { reset: () => void }) {
  const { locale } = useLanguage();
  return <IdeShell active="blog" crumb="blog/index.md">
    <section className="section">
      <h1 className="page-title">{locale === "vi" ? "Tạm thời chưa tải được bài viết" : "Articles are temporarily unavailable"}</h1>
      <p className="lede">{locale === "vi" ? "Vui lòng thử lại sau ít phút." : "Please try again in a few minutes."}</p>
      <button type="button" className="btn btn-neon" onClick={reset}>{locale === "vi" ? "Thử lại" : "Try again"}</button>
    </section>
  </IdeShell>;
}
