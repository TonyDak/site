"use client";

import { useMemo, useState } from "react";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { useLanguage } from "@/components/language/LanguageProvider";
import { ui } from "@/lib/content/ui";
import { Icon } from "@/components/ide/icons";
import type { Post } from "@/lib/content/posts";
import { ArticleCover } from "@/components/blog/ArticleContent";

export function BlogListClient({ posts }: { posts: Post[] }) {
  const { locale } = useLanguage();
  const t = ui[locale].blog;
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => (p.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    if (selectedTag === "all") return posts;
    return posts.filter((p) => p.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  return (
    <>
      {tags.length > 0 && (
        <div className="tag-filter" role="group" aria-label="Filter by tag">
          <button
            type="button"
            className={selectedTag === "all" ? "on" : ""}
            aria-pressed={selectedTag === "all"}
            onClick={() => setSelectedTag("all")}
          >
            {t.all} ({posts.length})
          </button>
          {tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={selectedTag === tag ? "on" : ""}
              aria-pressed={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          <Icon name="book" size={24} className="ico" />
          <p>{t.empty}</p>
        </div>
      ) : (
        <div className="post-list">
          {filtered.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="post-row">
              <div className="post-date">{post.publishedAt}</div>
              <div>
                <ArticleCover url={post.coverImage} alt={post.coverAlt || post.title} />
                <h2 className="post-title">{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="chip-row">
                  {post.tags?.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                  <span className="pill" style={{ marginLeft: "auto", height: "20px", fontSize: "10.5px" }}>
                    <Icon name="clock" size={11} /> {post.readTime}
                  </span>
                </div>
              </div>
              <div className="post-arrow">
                <Icon name="arrowRight" size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
