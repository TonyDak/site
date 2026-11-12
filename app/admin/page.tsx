"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { PostMediaEditor } from "@/components/admin/PostMediaEditor";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { IdeShell } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";
import type { Post } from "@/lib/content/posts";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  tags: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  isPublished: boolean;
};

const EMPTY_DRAFT: Draft = { title: "", slug: "", excerpt: "", tags: "", content: "## Introduction\n\n", coverImage: "", coverAlt: "", isPublished: false };

const toDraft = (p: Post): Draft => ({
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt ?? "",
  tags: (p.tags ?? []).join(", "),
  content: p.content ?? "",
  coverImage: p.coverImage ?? "",
  coverAlt: p.coverAlt ?? "",
  isPublished: p.isPublished !== false,
});

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [mediaBusy, setMediaBusy] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const snapshot = useMemo(
    () => JSON.stringify({ title, slug, excerpt, tags, content, coverImage, coverAlt, isPublished } satisfies Draft),
    [title, slug, excerpt, tags, content, coverImage, coverAlt, isPublished]
  );
  const dirty = authed && snapshot !== savedSnapshot;
  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");

  const applyDraft = useCallback((d: Draft, slugOfSaved: string) => {
    setCurrentSlug(slugOfSaved);
    setTitle(d.title);
    setSlug(d.slug);
    setExcerpt(d.excerpt);
    setTags(d.tags);
    setContent(d.content);
    setCoverImage(d.coverImage);
    setCoverAlt(d.coverAlt);
    setIsPublished(d.isPublished);
    setEditorRevision((value) => value + 1);
    setSavedSnapshot(JSON.stringify(d));
    setMsg(null);
  }, []);

  const loadPost = useCallback((p: Post) => applyDraft(toDraft(p), p.slug), [applyDraft]);

  const loadPosts = useCallback(async (selectFirst = false, signal?: AbortSignal) => {
    const response = await fetch("/api/admin/posts", { cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        setAuthed(false);
        setPosts([]);
        setAuthError("Your session has expired. Sign in again.");
      }
      throw new Error(data.error || "Could not load posts.");
    }
    setPosts(data.posts);
    if (selectFirst) {
      if (data.posts.length) loadPost(data.posts[0]);
      else applyDraft(EMPTY_DRAFT, "");
    }
  }, [applyDraft, loadPost]);

  useEffect(() => {
    const controller = new AbortController();
    async function restoreSession() {
      try {
        const response = await fetch("/api/admin/auth", { cache: "no-store", signal: controller.signal });
        if (response.ok) {
          await loadPosts(true, controller.signal);
          setAuthed(true);
        } else if (response.status !== 401) {
          const data = await response.json();
          setAuthError(data.error || "Admin service unavailable.");
        }
      } catch (error) {
        if (!controller.signal.aborted) setAuthError((error as Error).message || "Could not check your session.");
      } finally {
        if (!controller.signal.aborted) setCheckingSession(false);
      }
    }
    void restoreSession();
    return () => controller.abort();
  }, [loadPosts]);

  const newPost = () => {
    if (!confirmDiscard()) return;
    applyDraft(EMPTY_DRAFT, "");
  };

  const openPost = (p: Post) => {
    if (p.slug === currentSlug || !confirmDiscard()) return;
    loadPost(p);
  };

  // Warn before closing the browser tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  // Ctrl/Cmd+S saves from anywhere on the page.
  useEffect(() => {
    if (!authed) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authed]);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q) || (p.tags ?? []).some((t) => t.toLowerCase().includes(q)));
  }, [posts, query]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!currentSlug) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setPassword("");
      if (!response.ok) throw new Error(data.error || "Sign-in failed.");
      await loadPosts(true);
      setAuthed(true);
    } catch (error) { setAuthError((error as Error).message || "Sign-in failed."); }
    finally { setPassword(""); setAuthBusy(false); }
  };

  const handleLogout = async () => {
    if (!confirmDiscard()) return;
    setAuthBusy(true);
    try {
      const response = await fetch("/api/admin/auth", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign-out failed.");
      setAuthed(false);
      setPosts([]);
      setPassword("");
      setTitle(""); setSlug(""); setContent(""); setExcerpt(""); setTags(""); setCurrentSlug("");
      setCoverImage(""); setCoverAlt("");
      setSavedSnapshot("");
      setMsg(null);
      setAuthError("");
    } catch (error) { setMsg({ text: (error as Error).message, ok: false }); }
    finally { setAuthBusy(false); }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (mediaBusy || saving) return;
    setSaving(true);
    setMsg(null);
    const savingSnapshot = snapshot;

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          coverImage,
          coverAlt,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAuthed(false);
          setPosts([]);
          setAuthError("Your session has expired. Sign in again.");
        }
        throw new Error(data.error || "Save failed");
      }

      setSavedSnapshot(savingSnapshot);
      setMsg({ text: isPublished ? "Saved & published." : "Draft saved.", ok: true });
      await loadPosts();
      setCurrentSlug(slug);
    } catch (err) {
      setMsg({ text: (err as Error).message || "Save error", ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (!authed) {
    return (
      <IdeShell active="admin" crumb="studio.ts">
        <div className="login-wrap">
          <div className="comment">
            <span className="idx">AUTH</span>
            <span>studio.ts — Access gate</span>
          </div>
          <div className="panel" style={{ padding: "24px" }}>
            <h2 className="h2" style={{ fontSize: "20px" }}>
              Studio Authentication
            </h2>
            <p className="muted" style={{ fontSize: "13px", marginBottom: "18px" }}>
              Sign in to manage your articles.
            </p>

            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="field">
                <span>USERNAME</span>
                <input name="username" className="input mono" autoComplete="username" required maxLength={64}
                  value={username} onChange={(e) => setUsername(e.target.value)} disabled={checkingSession || authBusy} />
              </label>
              <label className="field">
                <span>PASSWORD</span>
                <input
                  type="password"
                  className="input mono"
                  name="password"
                  autoComplete="current-password"
                  required
                  maxLength={256}
                  disabled={checkingSession || authBusy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                />
              </label>

              {authError && <span role="alert" style={{ color: "#ff8fa3", fontSize: "12px" }}>{authError}</span>}

              <button type="submit" disabled={checkingSession || authBusy} className="btn btn-cobalt" style={{ marginTop: "4px" }}>
                <Icon name="key" size={14} />
                {checkingSession ? "Checking session..." : authBusy ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </IdeShell>
    );
  }

  const statusText = saving ? "Saving…" : mediaBusy ? "Uploading…" : dirty ? "Unsaved changes" : currentSlug ? "All changes saved" : "New draft";

  return (
    <IdeShell active="admin" crumb={currentSlug ? `posts/${currentSlug}.md` : "posts/untitled.md"}>
      <div className="studio">
        {/* Post list */}
        <aside className="panel studio-side">
          <div className="studio-side-head">
            <button type="button" className="btn btn-sm btn-cobalt" disabled={saving || mediaBusy} onClick={newPost}>
              <Icon name="plus" size={13} /> New post
            </button>
            <input className="input studio-search" type="search" placeholder={`Search ${posts.length} posts…`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search posts" />
          </div>
          <div className="studio-list">
            {!currentSlug && (
              <div className="studio-item on" aria-current="true">
                <span className="t">{title || "Untitled draft"}</span>
                <span className="m"><span className="badge draft">new</span></span>
              </div>
            )}
            {visiblePosts.map((p) => (
              <button
                type="button"
                key={p.slug}
                className={`studio-item ${currentSlug === p.slug ? "on" : ""}`}
                aria-current={currentSlug === p.slug ? "true" : undefined}
                disabled={saving || mediaBusy}
                onClick={() => openPost(p)}
              >
                <span className="t">{p.title}</span>
                <span className="m">
                  <span className={`badge ${p.isPublished === false ? "draft" : "live"}`}>{p.isPublished === false ? "draft" : "live"}</span>
                  <span>{p.publishedAt}</span>
                </span>
              </button>
            ))}
            {visiblePosts.length === 0 && query && <p className="studio-empty">No posts match “{query}”.</p>}
          </div>
          <div className="studio-side-foot">
            <Link href="/blog" className="btn btn-sm btn-ghost"><Icon name="eye" size={13} /> Blog</Link>
            <button type="button" className="btn btn-sm btn-ghost" disabled={authBusy || saving || mediaBusy} onClick={handleLogout}>
              <Icon name="logout" size={13} /> {authBusy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </aside>

        {/* Editor */}
        <form ref={formRef} className="panel form studio-form" onSubmit={handleSave}>
          <div className="studio-bar">
            <span className={`studio-state ${dirty ? "dirty" : ""}`} role="status" aria-live="polite">
              <i aria-hidden="true" /> {statusText}
            </span>
            {msg && (
              <span className={`form-msg ${msg.ok ? "ok" : "err"}`}>
                <Icon name={msg.ok ? "check" : "close"} size={13} style={{ verticalAlign: "-2px" }} /> {msg.text}
              </span>
            )}
            <div className="studio-bar-actions">
              <label className="studio-toggle" title="When on, the post is visible on the public blog">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                <span className="track" aria-hidden="true"><span /></span>
                {isPublished ? "Published" : "Draft"}
              </label>
              {currentSlug && (
                <Link href={`/blog/${currentSlug}`} target="_blank" className="btn btn-sm btn-ghost">
                  <Icon name="arrowUpRight" size={13} /> View
                </Link>
              )}
              <button type="submit" className="btn btn-sm btn-cobalt" disabled={saving || mediaBusy || (!dirty && !!currentSlug)} title="Save (Ctrl+S)">
                <Icon name="save" size={13} />
                {saving ? "Saving…" : "Save"}
                <kbd className="hide-sm">Ctrl S</kbd>
              </button>
            </div>
          </div>

          <div className="studio-meta">
            <input
              type="text"
              className="studio-title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
              aria-label="Title"
            />
            <input
              type="text"
              className="studio-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One-line summary shown on the blog index…"
              aria-label="Excerpt"
            />
            <div className="form-row">
              <label className="field">
                <span>URL · /blog/</span>
                <input
                  type="text"
                  className="input mono"
                  required
                  value={slug}
                  readOnly={!!currentSlug}
                  title={currentSlug ? "A saved post's slug is fixed: changing it would create a duplicate post." : undefined}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug"
                />
              </label>
              <label className="field">
                <span>TAGS (COMMA-SEPARATED)</span>
                <input
                  type="text"
                  className="input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Architecture, Kafka, Docker"
                />
              </label>
            </div>
          </div>

          <PostMediaEditor key={editorRevision} content={content} onChange={setContent}
            coverImage={coverImage} coverAlt={coverAlt} onCover={setCoverImage} onCoverAlt={setCoverAlt}
            onBusy={setMediaBusy} disabled={saving || authBusy} />
        </form>
      </div>
    </IdeShell>
  );
}
