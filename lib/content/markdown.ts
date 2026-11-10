export type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph" | "quote"; text: string }
  | { type: "code"; text: string; language: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "image"; url: string; alt: string; caption: string }
  | { type: "video" | "embed"; url: string }
  | { type: "download"; url: string; label: string };

export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value || /[\s\x00-\x1f\x7f\\<>]/.test(value)) return null;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function videoEmbedUrl(value: string): string | null {
  const safe = safeUrl(value);
  if (!safe) return null;
  try {
    const url = new URL(safe);
    if (url.protocol !== "https:") return null;
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) {
      id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)$/)?.[1] ?? null;
    }
    if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const videoId = url.pathname.match(/^\/(?:video\/)?(\d+)\/?$/)?.[1];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    return null;
  } catch { return null; }
}

export function parseMarkdown(content: string): { blocks: MarkdownBlock[]; outline: { id: string; label: string; depth: 0 | 1 }[] } {
  const blocks: MarkdownBlock[] = [];
  const outline: { id: string; label: string; depth: 0 | 1 }[] = [];
  const ids = new Map<string, number>();
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) code.push(lines[i]);
      blocks.push({ type: "code", text: code.join("\n"), language });
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const text = heading[2].trim();
      const base = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      const count = (ids.get(base) ?? 0) + 1; ids.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      const level = heading[1].length as 2 | 3;
      blocks.push({ type: "heading", level, text, id });
      outline.push({ id, label: text, depth: level === 2 ? 0 : 1 });
      continue;
    }
    const list = line.match(/^(-|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = list[1] !== "-";
      const items = [list[2]];
      while (i + 1 < lines.length) {
        const next = lines[i+1].match(/^(-|\d+\.)\s+(.+)$/);
        if (!next || (next[1] !== "-") !== ordered) break;
        items.push(next[2]); i++;
      }
      blocks.push({ type: "list", items, ordered }); continue;
    }
    const image = line.trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/);
    if (image && safeUrl(image[2])) {
      blocks.push({ type: "image", url: safeUrl(image[2])!, alt: image[1], caption: image[3] ?? "" }); continue;
    }
    const media = line.trim().match(/^\[(video|embed|download:\s*[^\]]+)\]\((\S+)\)$/i);
    const url = media && safeUrl(media[2]);
    if (media && url) {
      if (media[1].toLowerCase().startsWith("download:")) {
        blocks.push({ type: "download", url, label: media[1].slice(9).trim() || "Download file" }); continue;
      }
      const embed = videoEmbedUrl(url);
      if (embed) { blocks.push({ type: "embed", url: embed }); continue; }
      if (/\.(mp4|webm)(?:[?#]|$)/i.test(url)) { blocks.push({ type: "video", url }); continue; }
    }
    blocks.push(line.startsWith("> ") ? { type: "quote", text: line.slice(2) } : { type: "paragraph", text: line });
  }
  return { blocks, outline };
}
