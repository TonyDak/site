/* eslint-disable @next/next/no-img-element -- Media may use any author-selected HTTPS host; avoid server-side image fetching. */
import { Fragment, type ReactNode } from "react";
import { parseMarkdown, safeUrl } from "@/lib/content/markdown";

function inline(text: string): ReactNode[] {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|https?:\/\/[^\s<>]+/g;
  const nodes: ReactNode[] = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index!;
    if (start > end) nodes.push(text.slice(end, start));
    if (match[3]) nodes.push(<strong key={start}>{match[3]}</strong>);
    else if (match[4]) nodes.push(<code key={start}>{match[4]}</code>);
    else {
      const url = safeUrl(match[2] ?? match[0]);
      nodes.push(url ? <a key={start} href={url} target="_blank" rel="noopener noreferrer">{match[1] ?? match[0]}</a> : match[0]);
    }
    end = start + match[0].length;
  }
  if (end < text.length) nodes.push(text.slice(end));
  return nodes;
}

export function ArticleCover({ url, alt = "" }: { url?: string; alt?: string }) {
  const safe = safeUrl(url);
  return safe ? <img className="article-cover" src={safe} alt={alt} decoding="async" /> : null;
}

export function ArticleContent({ content }: { content: string }) {
  const { blocks } = parseMarkdown(content);
  return <>{blocks.map((block, index) => {
    switch (block.type) {
      case "heading": return block.level === 2 ? <h2 key={index} id={block.id}>{inline(block.text)}</h2> : <h3 key={index} id={block.id}>{inline(block.text)}</h3>;
      case "paragraph": return <p key={index}>{inline(block.text)}</p>;
      case "quote": return <blockquote key={index}>{inline(block.text)}</blockquote>;
      case "list": {
        const items = block.items.map((item, i) => <li key={i}>{inline(item)}</li>);
        return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>;
      }
      case "code": return <figure className="codeblock" key={index}><figcaption><span>{block.language || "code"}</span><span className="muted">{block.text.split("\n").length} lines</span></figcaption><pre><code>{block.text}</code></pre></figure>;
      case "image": return <figure className="article-media" key={index}><a href={block.url} target="_blank" rel="noopener noreferrer"><img src={block.url} alt={block.alt} loading="lazy" decoding="async" /></a>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
      case "video": return <figure className="article-media" key={index}><video src={block.url} controls preload="metadata" playsInline aria-label="Article video"><a href={block.url}>Download video</a></video></figure>;
      case "embed": return <figure className="article-media embed" key={index}><iframe src={block.url} title="Embedded article video" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></figure>;
      case "download": return <p key={index}><a className="article-download" href={block.url} download target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↓</span> {block.label}</a></p>;
      default: return <Fragment key={index} />;
    }
  })}</>;
}
