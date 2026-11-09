import { notFound } from "next/navigation";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { getPostBySlug, getPosts } from "@/lib/content/posts";
import { IdeShell, type OutlineItem } from "@/components/ide/IdeShell";
import { Icon } from "@/components/ide/icons";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseMarkdown(content: string) {
  const lines = (content || "").split("\n");
  const nodes: React.ReactNode[] = [];
  const outline: OutlineItem[] = [];

  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let listBuffer: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listBuffer.length > 0) {
      nodes.push(
        <ul key={`${keyPrefix}-list`}>
          {listBuffer.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      flushList(`pre-${index}`);
      if (inCode) {
        nodes.push(
          <figure className="codeblock" key={`code-${index}`}>
            <figcaption>
              <span>{codeLang || "code"}</span>
              <span className="muted">{codeBuffer.length} lines</span>
            </figcaption>
            <pre>
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          </figure>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
        codeLang = line.replace("```", "").trim();
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith("- ")) {
      listBuffer.push(line.replace("- ", ""));
      return;
    }

    flushList(`line-${index}`);

    if (line.startsWith("## ")) {
      const text = line.replace("## ", "").trim();
      const id = slugify(text);
      outline.push({ id, label: text, depth: 0 });
      nodes.push(
        <h2 id={id} key={`h2-${index}`}>
          {text}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      const text = line.replace("### ", "").trim();
      const id = slugify(text);
      outline.push({ id, label: text, depth: 1 });
      nodes.push(
        <h3 id={id} key={`h3-${index}`}>
          {text}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      nodes.push(<blockquote key={`quote-${index}`}>{line.replace("> ", "")}</blockquote>);
    } else if (line.trim().length > 0) {
      nodes.push(<p key={`p-${index}`}>{line}</p>);
    }
  });

  flushList("end");

  return { nodes, outline };
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

  const { nodes, outline } = parseMarkdown(post.content);

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

        <div className="prose">{nodes}</div>

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
