"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { useLanguage } from "@/components/language/LanguageProvider";
import { ui } from "@/lib/content/ui";
import { GithubIcon, Icon, LinkedinIcon, type IconKey } from "./icons";
import { IdeTerminal } from "./IdeTerminal";
import { EditorBackdrop } from "./EditorBackdrop";
import { EditorDepth } from "./EditorDepth";

export type OutlineItem = {
  id: string;
  label: string;
  icon?: IconKey;
  depth?: 0 | 1;
};

export type EditorTab = {
  key: string;
  label: string;
  href: string;
  icon: IconKey;
};

type ShellProps = {
  children: ReactNode;
  /** Which explorer entry is current. */
  active: "home" | "blog" | "post" | "admin";
  /** Sections inside the editor; drives tabs (home), right-rail outline and scroll-spy. */
  outline?: OutlineItem[];
  /** Explicit editor tabs for non-home pages. */
  tabs?: EditorTab[];
  activeTab?: string;
  /** Breadcrumb tail, e.g. "blog/my-post.md". */
  crumb?: string;
  showTerminal?: boolean;
};

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getTheme = () => document.documentElement.classList.contains("theme-light") ? "light" : "dark";
const getServerTheme = () => "dark";

function fileIconClass(icon?: IconKey) {
  if (icon === "readme" || icon === "post") return "ico ico-md";
  if (icon === "skills") return "ico ico-json";
  return "ico";
}

export function IdeShell({ children, active, outline = [], tabs, activeTab, crumb, showTerminal = false }: ShellProps) {
  const { locale, setLocale, content } = useLanguage();
  const t = ui[locale];
  const site = content.site;

  const editorRef = useRef<HTMLDivElement>(null);
  const tabstripRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState<string>(outline[0]?.id ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  // Scroll-spy: the section with the largest visible ratio wins.
  useEffect(() => {
    const root = editorRef.current;
    if (!root || outline.length === 0) return;
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best: { id: string; r: number } | null = null;
        for (const [id, r] of ratios) if (r > 0 && (!best || r > best.r)) best = { id, r };
        if (best) setCurrent(best.id);
      },
      { root, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "0px 0px -40% 0px" }
    );
    for (const item of outline) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [outline]);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setCurrent(id);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const followHash = () => {
      const id = window.location.hash.slice(1);
      const node = id ? document.getElementById(id) : null;
      if (node && editorRef.current?.contains(node)) {
        node.scrollIntoView({ behavior: "instant", block: "start" });
        setCurrent(id);
      }
    };
    const frame = requestAnimationFrame(followHash);
    window.addEventListener("hashchange", followHash);
    window.addEventListener("popstate", followHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", followHash); window.removeEventListener("popstate", followHash); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(`theme-${next}`);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {}
  };

  const sectionHref = (id: string) => active === "blog" ? `/blog/${id}` : `#${id}`;
  const editorTabs: EditorTab[] = tabs ?? (active === "blog"
    ? [{ key: "blog-index", label: "index.md", href: "/blog", icon: "blog" as const }]
    : outline.filter((o) => (o.depth ?? 0) === 0).map((o) => ({ key: o.id, label: o.label, href: sectionHref(o.id), icon: o.icon ?? "readme" })));
  const currentTab = activeTab ?? (active === "blog" ? "blog-index" : current);
  const crumbTail = crumb ?? outline.find((o) => o.id === current)?.label ?? "README.md";
  const workspaceName = active === "home" ? "portfolio" : active === "admin" ? "studio" : "blog";

  useEffect(() => {
    tabstripRef.current?.querySelector('[aria-current]')?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [currentTab]);

  return (
    <div className="shell">
      <a href="#editor" className="skip-link">
        {t.skip}
      </a>

      {/* ── Titlebar ── */}
      <header className="titlebar">
        <div className="titlebar-left">
          <button type="button" className="icon-btn menu-btn" aria-label={t.toggleMenu} aria-controls="workspace-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <Icon name={menuOpen ? "close" : "menu"} size={17} />
          </button>
          <Link href="/" className="brand-wordmark" aria-label="ducnguyen.dev — home">ducnguyen<span>.dev</span></Link>
          <span className="workspace-title">{workspaceName}</span>
          <div className="workspace-context" title={crumbTail}>
            <Icon name="branch" size={13} />
            <span>workspace/{workspaceName}</span>
            <span className="workspace-origin">· from main</span>
          </div>
        </div>

        <div className="titlebar-right">
          <a className="icon-btn" href={site.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GithubIcon size={15} />
          </a>
          {site.social.linkedin && (
            <a className="icon-btn hide-sm" href={site.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedinIcon size={14} />
            </a>
          )}
          <button type="button" className="chip-btn" onClick={() => setLocale(locale === "en" ? "vi" : "en")} aria-label={content.navigation.languageLabel}>
            <Icon name="languages" size={13} />
            <span className="seg">
              <b className={locale === "en" ? "on" : ""}>EN</b>
              <b>/</b>
              <b className={locale === "vi" ? "on" : ""}>VI</b>
            </span>
          </button>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={t.toggleTheme} aria-pressed={theme === "light"}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
          </button>
        </div>
      </header>

      {/* ── Workbench ── */}
      <div className="workbench">
        <div className={`backdrop ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />

        {/* Explorer */}
        <aside id="workspace-navigation" className={`rail rail-left ${menuOpen ? "open" : ""}`} aria-label={t.explorer}>
          <div className="rail-head">
            <span>{t.explorer}</span>
            <Icon name="plus" size={12} aria-hidden="true" />
          </div>
          <nav className="rail-scroll">
            <div className="tree-folder">
              <Icon name="chevronDown" size={13} />
              <Icon name="folderOpen" size={14} />
              ducnguyen.dev
            </div>
            <div className="tree-workspace"><Icon name="branch" size={13} /><span>{workspaceName}</span></div>
            <Link href="/" className={`tree-row ${active === "home" ? "active" : ""}`} aria-current={active === "home" ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              <Icon name="readme" size={14} className="ico" />
              {t.home}
            </Link>
            <Link href="/blog" className={`tree-row ${active === "blog" || active === "post" ? "active" : ""}`} aria-current={active === "blog" || active === "post" ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              <Icon name="blog" size={14} className="ico" />
              {t.files.blog}
            </Link>
            <Link href="/#contact" className="tree-row" onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; if (active === "home") { e.preventDefault(); jump("contact"); } setMenuOpen(false); }}>
              <Icon name="contact" size={14} className="ico" />
              {t.files.contact}
            </Link>
            <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="tree-row">
              <Icon name="resume" size={14} className="ico" />
              {t.files.resume}
            </a>
          </nav>

          <div className="profile">
            <div className="profile-avatar">
              <Image src="/avatar.jpg" alt="" width={68} height={68} />
            </div>
            <div className="profile-meta">
              <div className="profile-name">{site.ownerName}</div>
              <div className="profile-role">{site.location}</div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <div className="editor-col">
          <nav ref={tabstripRef} className="tabstrip" aria-label="Editor tabs">
            {editorTabs.map((tab) => {
              const isActive = currentTab === tab.key;
              const isAnchor = tab.href.startsWith("#");
              const inner = (
                <>
                  <Icon name={tab.icon} size={13} className={fileIconClass(tab.icon)} />
                  {tab.label}
                </>
              );
              return isAnchor ? (
                <a
                  key={tab.key}
                  href={tab.href}
                  className={`tab ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    jump(tab.key);
                  }}
                >
                  {inner}
                </a>
              ) : (
                <Link key={tab.key} href={tab.href} className={`tab ${isActive ? "active" : ""}`} aria-current={isActive ? "page" : undefined}>
                  {inner}
                </Link>
              );
            })}
          </nav>
          <EditorBackdrop />
          <EditorDepth />
          <main className="editor" id="editor" ref={editorRef} tabIndex={-1}>
            <div className="editor-inner reveal-content">{children}</div>
          </main>
        </div>

        {/* Outline + terminal */}
        <aside className="rail rail-right" aria-label={t.outline}>
          <div className="rail-head">
            <span>{t.outline}</span>
            <Icon name="listTree" size={13} />
          </div>
          <nav className="rail-scroll">
            {outline.length === 0 && <div className="outline-row">—</div>}
            {outline.map((item) => active === "blog" ? (
              <Link key={item.id} href={sectionHref(item.id)} className="outline-row outline-post"><Icon name="post" size={13} /><span>{item.label}</span></Link>
            ) : (
              <a key={item.id} href={`#${item.id}`} className={`outline-row ${item.depth === 1 ? "sub" : ""} ${current === item.id ? "active" : ""}`} aria-current={current === item.id ? "location" : undefined} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; e.preventDefault(); jump(item.id); }}>
                <Icon name={item.icon ?? "readme"} size={13} /><span>{item.label}</span>
              </a>
            ))}
          </nav>
          {showTerminal && <IdeTerminal />}
        </aside>
      </div>

      {/* ── Statusbar ── */}
      <footer className="statusbar">
        <div className="status-group">
          <span className="status-item">
            <Icon name="branch" size={12} /> main
          </span>
          <span className="status-item neon">
            <span className="live-dot" /> {t.available}
          </span>
        </div>
        <div className="status-group">
          <span className="status-item hide-sm">UTF-8</span>
          <span className="status-item hide-sm">TypeScript</span>
          <span className="status-item">© {new Date().getFullYear()} ducnguyen.dev</span>
        </div>
      </footer>
    </div>
  );
}
