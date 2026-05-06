"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/content/posts";
import {
    blankPostDraft,
    fromPostDraft,
    toPostDraft,
    type PostDraft,
} from "@/lib/admin/editor-utils";
import { useAdminUiStore } from "@/lib/admin/use-admin-ui-store";

type Props = {
    posts: Post[];
};

async function saveJson<T>(url: string, payload: T) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
        throw new Error(data?.error ?? "Save failed");
    }
}

function noteSummary(post: Post) {
    return post.tags.slice(0, 2).join(" · ");
}

export function NotesStudio({ posts }: Props) {
    const router = useRouter();
    const selectedNoteSlug = useAdminUiStore((state) => state.selectedNoteSlug);
    const setSelectedNoteSlug = useAdminUiStore((state) => state.setSelectedNoteSlug);
    const [list, setList] = useState<Post[]>(posts);
    const [draft, setDraft] = useState<PostDraft>(blankPostDraft);
    const [status, setStatus] = useState("");

    const selectedPost = useMemo(
        () => list.find((item) => item.slug === selectedNoteSlug) ?? null,
        [list, selectedNoteSlug]
    );

    function loadPost(post: Post | null) {
        if (!post) {
            setSelectedNoteSlug(null);
            setDraft(blankPostDraft());
            return;
        }

        setSelectedNoteSlug(post.slug);
        setDraft(toPostDraft(post));
    }

    async function persist(nextList: Post[]) {
        await saveJson("/api/admin/posts", nextList);
        setList(nextList);
        router.refresh();
    }

    return (
        <div className="c--admin-note-layout">
            <aside className="c--card">
                <div className="c--admin-headline-row">
                    <div>
                        <p className="c--eyebrow">Notes</p>
                        <h1>Note Studio</h1>
                    </div>
                    <button type="button" className="c--btn c--btn-ghost" onClick={() => loadPost(null)}>
                        New note
                    </button>
                </div>
                <p className="u--muted">Choose an existing note or start a fresh one.</p>
                <div className="c--admin-note-list" style={{ marginTop: "16px" }}>
                    {list.map((post) => (
                        <button
                            key={post.slug}
                            type="button"
                            className={`c--admin-note-item${selectedNoteSlug === post.slug ? " is-active" : ""}`}
                            onClick={() => loadPost(post)}
                        >
                            <strong>{post.title}</strong>
                            <span className="u--muted">{post.excerpt}</span>
                            <span className="c--admin-note-meta">
                                <span>{post.publishedAt}</span>
                                <span>{post.readTime}</span>
                                <span>{noteSummary(post)}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            <section className="c--card">
                <div className="c--admin-headline-row">
                    <div>
                        <p className="c--eyebrow">Compose</p>
                        <h2>{selectedPost ? `Editing: ${selectedPost.title}` : "Write a new note"}</h2>
                    </div>
                    <button
                        type="button"
                        className="c--btn c--btn-ghost"
                        onClick={() => {
                            navigator.clipboard?.writeText(JSON.stringify(fromPostDraft(draft), null, 2));
                        }}
                    >
                        Copy JSON
                    </button>
                </div>

                <form
                    className="c--admin-note-form"
                    onSubmit={async (event) => {
                        event.preventDefault();
                        setStatus("");

                        try {
                            const nextPost = fromPostDraft(draft);
                            const nextList = selectedNoteSlug
                                ? list.map((item) => (item.slug === selectedNoteSlug ? nextPost : item))
                                : [nextPost, ...list];

                            await persist(nextList);
                            setSelectedNoteSlug(nextPost.slug);
                            setDraft(toPostDraft(nextPost));
                            setStatus("Saved successfully.");
                        } catch (error) {
                            setStatus(error instanceof Error ? error.message : "Save failed");
                        }
                    }}
                >
                    <div className="c--admin-two-col">
                        <label className="c--field">
                            Title
                            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                        </label>
                        <label className="c--field">
                            Slug
                            <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
                        </label>
                        <label className="c--field">
                            Published date
                            <input type="date" value={draft.publishedAt} onChange={(event) => setDraft({ ...draft, publishedAt: event.target.value })} />
                        </label>
                        <label className="c--field">
                            Read time
                            <input value={draft.readTime} onChange={(event) => setDraft({ ...draft, readTime: event.target.value })} />
                        </label>
                    </div>

                    <label className="c--field">
                        Excerpt
                        <textarea
                            className="c--admin-textarea c--admin-textarea-sm"
                            value={draft.excerpt}
                            onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
                            rows={3}
                        />
                    </label>

                    <label className="c--field">
                        Tags, one per line or comma separated
                        <textarea
                            className="c--admin-textarea c--admin-textarea-sm"
                            value={draft.tagsText}
                            onChange={(event) => setDraft({ ...draft, tagsText: event.target.value })}
                            rows={3}
                        />
                    </label>

                    <label className="c--field">
                        Article body
                        <textarea
                            className="c--admin-textarea"
                            value={draft.bodyText}
                            onChange={(event) => setDraft({ ...draft, bodyText: event.target.value })}
                            rows={16}
                        />
                    </label>

                    <div className="c--button-row">
                        <button type="submit" className="c--btn c--btn-primary">
                            Save note
                        </button>
                        <button
                            type="button"
                            className="c--btn c--btn-ghost"
                            onClick={() => {
                                if (!selectedNoteSlug) {
                                    setDraft(blankPostDraft());
                                    return;
                                }

                                const nextList = list.filter((item) => item.slug !== selectedNoteSlug);
                                setSelectedNoteSlug(null);
                                setDraft(blankPostDraft());
                                void persist(nextList);
                            }}
                        >
                            Delete note
                        </button>
                        <button type="button" className="c--btn c--btn-ghost" onClick={() => setDraft(blankPostDraft())}>
                            Reset form
                        </button>
                    </div>

                    <p className="c--status-msg u--muted">{status}</p>
                </form>
            </section>
        </div>
    );
}
