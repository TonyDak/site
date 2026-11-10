"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { PostMediaEditor } from "@/components/admin/PostMediaEditor";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { IdeShell } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";
import type { Post } from "@/lib/content/posts";

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

  const loadPost = useCallback((p: Post) => {
    setCurrentSlug(p.slug);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt ?? "");
    setTags((p.tags ?? []).join(", "));
    setContent(p.content ?? "");
    setCoverImage(p.coverImage ?? ""); setCoverAlt(p.coverAlt ?? "");
    setEditorRevision(value => value + 1);
    setIsPublished(p.isPublished !== false);
    setMsg(null);
  }, []);

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
    if (selectFirst && data.posts.length) loadPost(data.posts[0]);
  }, [loadPost]);

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
    setCurrentSlug("");
    setTitle("");
    setSlug("");
    setExcerpt("");
    setTags("Architecture, Backend");
    setContent("## Introduction\n\nWrite article content here...");
    setIsPublished(false);
    setCoverImage(""); setCoverAlt(""); setEditorRevision(value => value + 1);
    setMsg(null);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!currentSlug) {
      setSlug(
        val
          .toLowerCase()
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

      setMsg({ text: "Post saved to MongoDB successfully.", ok: true });

      // Refresh list
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

  return (
    <IdeShell active="admin" crumb="studio.ts">
      <div className="page-head" style={{ marginBottom: "18px" }}>
        <div>
          <div className="comment">
            <span className="idx">STUDIO</span>
            <span>studio.ts — Content management &amp; MongoDB storage</span>
          </div>
          <h1 className="h2" style={{ margin: 0 }}>
            Post Studio
          </h1>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" className="btn btn-sm btn-ghost" disabled={authBusy || saving || mediaBusy} onClick={handleLogout}>
            {authBusy ? "Signing out..." : "Sign out"}
          </button>
          <button type="button" className="btn btn-sm btn-ghost" disabled={saving || mediaBusy} onClick={newPost}>
            <Icon name="plus" size={13} /> New draft
          </button>
          <Link href="/blog" className="btn btn-sm btn-ghost">
            <Icon name="eye" size={13} /> View blog
          </Link>
        </div>
      </div>

      <div className="studio">
        {/* Post List */}
        <div className="panel">
          <div className="panel-head">
            <span>Posts ({posts.length})</span>
            <Icon name="database" size={13} />
          </div>
          <div className="studio-list">
            {posts.map((p) => (
              <button
                type="button"
                key={p.slug}
                className={`studio-item ${currentSlug === p.slug ? "on" : ""}`}
                disabled={saving || mediaBusy}
                onClick={() => loadPost(p)}
              >
                <span className="t">{p.title}</span>
                <span className="m">
                  <span>{p.publishedAt}</span>
                  <span>·</span>
                  <span>{p.readTime}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Form */}
        <form className="panel form" onSubmit={handleSave} style={{ padding: "0" }}>
          <div style={{ padding: "16px 20px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <label className="field">
              <span>TITLE</span>
              <input
                type="text"
                className="input"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title..."
              />
            </label>

            <div className="form-row">
              <label className="field">
                <span>SLUG</span>
                <input
                  type="text"
                  className="input mono"
                  required
                  value={slug}
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

            <label className="field">
              <span>EXCERPT</span>
              <input
                type="text"
                className="input"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary for the index card..."
              />
            </label>
            <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" }}>
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Published — visible on the public blog
            </label>
          </div>

          <PostMediaEditor key={editorRevision} content={content} onChange={setContent}
            coverImage={coverImage} coverAlt={coverAlt} onCover={setCoverImage} onCoverAlt={setCoverAlt}
            onBusy={setMediaBusy} disabled={saving || authBusy} />

          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button type="submit" className="btn btn-cobalt" disabled={saving || mediaBusy}>
                <Icon name="save" size={14} />
                {saving ? "Writing to MongoDB..." : "Save to MongoDB"}
              </button>

              {currentSlug && (
                <Link href={`/blog/${currentSlug}`} target="_blank" className="chip-btn">
                  <Icon name="eye" size={12} /> View live
                </Link>
              )}
            </div>

            {msg && (
              <span className={`form-msg ${msg.ok ? "ok" : "err"}`}>
                <Icon name={msg.ok ? "check" : "close"} size={13} style={{ verticalAlign: "-2px" }} />
                {msg.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </IdeShell>
  );
}
