import { notFound } from "next/navigation";
import { parseMarkdown } from "@/lib/content/markdown";
import { ArticleContent, ArticleCover } from "@/components/blog/ArticleContent";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { getPostBySlug, getPosts } from "@/lib/content/posts";
import { IdeShell, type OutlineItem } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { outline } = parseMarkdown(post.content);

  const articleOutline: OutlineItem[] = [
    { id: "top", label: post.title, icon: "post" },
    ...outline,
  ];

  return (
    <IdeShell active="post" crumb={`blog/${post.slug}.md`} outline={articleOutline}>
      <article className="section" id="top" style={{ paddingBottom: "48px" }}>
        <Link href="/blog" className="back-link">
          <Icon name="arrowLeft" size={13} />
          <span>All notes</span>
        </Link>

        <div className="comment">
          <span className="idx">NOTE</span>
          <span>blog/{post.slug}.md</span>
        </div>

        <h1 className="article-title">{post.title}</h1>

        <div className="article-meta">
          <span>
            <Icon name="clock" size={13} />
            {post.publishedAt}
          </span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <div className="chip-row">
            {post.tags?.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="article-divider" />

        <ArticleCover url={post.coverImage} alt={post.coverAlt || post.title} />
        <div className="prose"><ArticleContent content={post.content} /></div>

        <div className="article-divider" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/blog" className="btn btn-sm btn-ghost">
            <Icon name="arrowLeft" size={13} />
            Back to notes
          </Link>
          <a href="#top" className="chip-btn">
            ↑ Top
          </a>
        </div>
      </article>
    </IdeShell>
  );
}
