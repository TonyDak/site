"use client";

import { useEffect, useState, type FormEvent } from "react";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { IdeShell } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";
import type { Post } from "@/lib/content/posts";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Load existing posts
  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.posts)) {
          setPosts(d.posts);
          if (d.posts.length > 0 && !currentSlug) {
            loadPost(d.posts[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const loadPost = (p: Post) => {
    setCurrentSlug(p.slug);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt ?? "");
    setTags((p.tags ?? []).join(", "));
    setContent(p.content ?? "");
    setMsg(null);
  };

  const newPost = () => {
    setCurrentSlug("");
    setTitle("");
    setSlug("");
    setExcerpt("");
    setTags("Architecture, Backend");
    setContent("## Introduction\n\nWrite article content here...");
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

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (password === "admin" || password === "local-dev-only" || password.length >= 4) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Invalid credentials.");
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
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
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          secret: password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      setMsg({ text: "Post saved to MongoDB successfully.", ok: true });

      // Refresh list
      const updated = await fetch("/api/admin/posts").then((r) => r.json());
      if (Array.isArray(updated.posts)) setPosts(updated.posts);
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
              Enter your admin passphrase to access the MongoDB content studio.
            </p>

            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="field">
                <span>PASSPHRASE</span>
                <input
                  type="password"
                  className="input mono"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                />
              </label>

              {authError && <span style={{ color: "#ff8fa3", fontSize: "12px" }}>{authError}</span>}

              <button type="submit" className="btn btn-cobalt" style={{ marginTop: "4px" }}>
                <Icon name="key" size={14} />
                Unlock Studio
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
          <button type="button" className="btn btn-sm btn-ghost" onClick={newPost}>
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
          </div>

          {/* Split Pane: Raw Markdown / Live Preview */}
          <div className="split">
            <textarea
              className="textarea mono"
              required
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="## Section Heading&#10;&#10;Write markdown content here..."
            />
            <div className="preview">
              <div className="label">PREVIEW</div>
              <div className="prose">
                {content.split("\n").map((l, idx) => {
                  if (l.startsWith("## ")) return <h2 key={idx}>{l.replace("## ", "")}</h2>;
                  if (l.startsWith("### ")) return <h3 key={idx}>{l.replace("### ", "")}</h3>;
                  if (l.startsWith("- ")) return <li key={idx}>{l.replace("- ", "")}</li>;
                  if (l.trim().length > 0) return <p key={idx}>{l}</p>;
                  return null;
                })}
              </div>
            </div>
          </div>

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
              <button type="submit" className="btn btn-cobalt" disabled={saving}>
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
