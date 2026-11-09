"use client";

import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { useLanguage } from "@/components/language/LanguageProvider";
import { IdeShell } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";

export default function NotFound() {
  const { content } = useLanguage();
  const pageCopy = content.site.pages.notFound;

  return (
    <IdeShell active="home" crumb="404.md">
      <div className="section" style={{ textAlign: "center", padding: "72px 20px" }}>
        <div className="comment" style={{ justifyContent: "center" }}>
          <span className="idx">404</span>
          <span>404.md — File not found</span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(64px, 10vw, 108px)",
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: "var(--text)",
            margin: "12px 0",
          }}
        >
          4<span style={{ color: "var(--neon)" }}>0</span>4
        </h1>

        <h2 className="h2" style={{ margin: "0 auto 12px", maxWidth: "24ch" }}>
          {pageCopy.title}
        </h2>

        <p className="lede" style={{ margin: "0 auto 28px" }}>
          {pageCopy.subtitle}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Link href="/" className="btn btn-cobalt">
            <Icon name="arrowLeft" size={14} />
            {pageCopy.primaryLabel}
          </Link>
          <Link href="/blog" className="btn btn-ghost">
            <Icon name="blog" size={14} />
            Blog
          </Link>
        </div>
      </div>
    </IdeShell>
  );
}
