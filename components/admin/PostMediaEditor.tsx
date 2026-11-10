"use client";

/* eslint-disable @next/next/no-img-element -- Uploaded assets are displayed without a server-side image proxy. */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ArticleContent, ArticleCover } from "@/components/blog/ArticleContent";
import { safeUrl, videoEmbedUrl } from "@/lib/content/markdown";
import { filePolicy, MEDIA_ACCEPT, type MediaAsset } from "@/lib/media/policy";

type Props = {
  content: string;
  onChange: Dispatch<SetStateAction<string>>;
  coverImage: string;
  coverAlt: string;
  onCover: (url: string) => void;
  onCoverAlt: (value: string) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
};
const labelText = (value: string) => value.replace(/[\[\]\\\r\n]/g, " ").trim();
const assetMarkdown = (asset: MediaAsset) => asset.kind === "image"
  ? `![${labelText(asset.name)}](${asset.url})`
  : asset.kind === "video" ? `[video](${asset.url})` : `[download: ${labelText(asset.name)}](${asset.url})`;

export function PostMediaEditor({ content, onChange, coverImage, coverAlt, onCover, onCoverAlt, onBusy, disabled }: Props) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [mode, setMode] = useState<"link" | "image" | "video" | "download" | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [caption, setCaption] = useState("");
  const [view, setView] = useState<"split" | "preview">("split");
  useEffect(() => () => { controller.current?.abort(); onBusy(false); }, [onBusy]);

  function insert(snippet: string, selection?: [number, number]) {
    const [start, end] = selection ?? [textarea.current?.selectionStart ?? content.length, textarea.current?.selectionEnd ?? content.length];
    onChange(previous => `${previous.slice(0,start)}\n\n${snippet}\n\n${previous.slice(end)}`);
  }

  async function upload(files: File[], asCover = false) {
    if (disabled || inFlight.current || !files.length) return;
    const selected = asCover ? files.slice(0,1) : files;
    if (selected.length > 10) { setMessage("Upload up to 10 files at a time."); return; }
    for (const file of selected) {
      const policy = filePolicy(file.name);
      if (!policy || (asCover && policy.kind !== "image")) { setMessage(`Unsupported file: ${file.name}. Choose an allowed ${asCover ? "image" : "media file"}.`); return; }
      if (!file.size || file.size > policy.maxBytes) { setMessage(`${file.name}: limit ${policy.maxBytes / 1024 / 1024} MB.`); return; }
    }
    const selection: [number,number] = [textarea.current?.selectionStart ?? content.length, textarea.current?.selectionEnd ?? content.length];
    const uploaded: MediaAsset[] = [];
    const errors: string[] = [];
    const abort = new AbortController(); controller.current = abort;
    inFlight.current = true; setBusy(true); onBusy(true); setMessage("");
    try {
      for (const [index,file] of selected.entries()) {
        setProgress(`Uploading ${index + 1}/${selected.length}: ${file.name}`);
        try {
          const response = await fetch("/api/admin/media", {
            method: "POST", headers: { "Content-Type": "application/octet-stream", "X-File-Name": encodeURIComponent(file.name), "X-File-Type": filePolicy(file.name)!.mime },
            body: file, signal: abort.signal,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Upload failed.");
          uploaded.push(data.asset);
        } catch (error) {
          if (abort.signal.aborted) return;
          errors.push(`${file.name}: ${(error as Error).message}`);
        }
      }
      if (abort.signal.aborted) return;
      setAssets(previous => [...uploaded, ...previous]);
      if (asCover && uploaded[0]) { onCover(uploaded[0].url); onCoverAlt(labelText(uploaded[0].name.replace(/\.[^.]+$/, ""))); }
      else if (uploaded.length) insert(uploaded.map(assetMarkdown).join("\n\n"), selection);
      setMessage(errors.length ? errors.join(" · ") : `Uploaded ${uploaded.length} file${uploaded.length === 1 ? "" : "s"}.`);
    } finally {
      inFlight.current = false;
      if (!abort.signal.aborted) { setBusy(false); setProgress(""); onBusy(false); }
    }
  }

  function insertLink() {
    const safe = safeUrl(url.trim());
    if (!safe || /[()]/.test(safe)) { setMessage("Enter a valid HTTPS URL without unescaped parentheses."); return; }
    if (mode === "video" && !videoEmbedUrl(safe) && !/\.(mp4|webm)(?:[?#]|$)/i.test(safe)) {
      setMessage("Use a YouTube/Vimeo link or a direct MP4/WebM URL."); return;
    }
    const text = labelText(label) || (mode === "image" ? "Image" : "Open link");
    insert(mode === "image" ? `![${text}](${safe}${caption ? ` "${caption.replace(/["\r\n]/g,"'")}"` : ""})`
      : mode === "video" ? `[video](${safe})` : mode === "download" ? `[download: ${text}](${safe})` : `[${text}](${safe})`);
    setMode(null); setUrl(""); setLabel(""); setCaption(""); setMessage("");
  }

  return <div className={`media-editor${dragging ? " is-dragging" : ""}`} onDragOver={event => {
    if (Array.from(event.dataTransfer.types).includes("Files")) { event.preventDefault(); if (!disabled && !busy) setDragging(true); }
  }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={event => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault(); setDragging(false); void upload(Array.from(event.dataTransfer.files));
  }}>
    <div className="media-toolbar">
      <input ref={mediaInput} type="file" multiple accept={MEDIA_ACCEPT} hidden disabled={disabled || busy} onChange={event => { void upload(Array.from(event.target.files ?? [])); event.target.value=""; }} />
      <input ref={coverInput} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.avif" hidden disabled={disabled || busy} onChange={event => { void upload(Array.from(event.target.files ?? []),true); event.target.value=""; }} />
      <button type="button" className="btn btn-sm btn-cobalt" disabled={disabled || busy} onClick={() => mediaInput.current?.click()}>↑ Upload media</button>
      <button type="button" className="btn btn-sm btn-ghost" disabled={disabled || busy} onClick={() => coverInput.current?.click()}>Choose cover</button>
      {(["image","video","link","download"] as const).map(item => <button type="button" className="btn btn-sm btn-ghost" key={item} disabled={disabled || busy} aria-pressed={mode === item} onClick={() => { setMode(mode === item ? null : item); setMessage(""); }}>Insert {item}</button>)}
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setView(view === "split" ? "preview" : "split")} aria-pressed={view === "preview"}>{view === "split" ? "Full preview" : "Split editor"}</button>
    </div>
    <div className="media-hint">Drop files here or paste an image into the editor. Images ≤10 MB · videos ≤25 MB · PDF/ZIP ≤20 MB. Uploaded files are public, including files in drafts.</div>
    {(busy || message) && <p className="media-status" role="status" aria-live="polite">{progress || message}</p>}
    {mode && <div className="media-insert">
      <label className="field"><span>{mode === "video" ? "YOUTUBE / VIMEO / MP4 / WEBM URL" : "URL"}</span><input className="input" type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" /></label>
      {mode !== "video" && <label className="field"><span>{mode === "image" ? "IMAGE DESCRIPTION (ALT)" : "LINK TEXT"}</span><input className="input" value={label} onChange={event => setLabel(event.target.value)} /></label>}
      {mode === "image" && <label className="field"><span>CAPTION</span><input className="input" value={caption} onChange={event => setCaption(event.target.value)} /></label>}
      <button type="button" className="btn btn-sm btn-cobalt" disabled={disabled || busy || !url.trim()} onClick={insertLink}>Insert into article</button>
    </div>}
    {coverImage && <div className="media-cover-control"><ArticleCover url={coverImage} alt={coverAlt} /><label className="field"><span>COVER DESCRIPTION (ALT)</span><input className="input" maxLength={200} value={coverAlt} disabled={disabled || busy} onChange={event => onCoverAlt(event.target.value)} /></label><button type="button" className="btn btn-sm btn-ghost" disabled={disabled || busy} onClick={() => { onCover(""); onCoverAlt(""); }}>Remove cover</button></div>}
    {assets.length > 0 && <div className="media-assets" aria-label="Files uploaded in this editing session">{assets.map(asset => <div key={asset.key} className="media-asset">{asset.kind === "image" && <img src={asset.url} alt="" />}<span title={asset.name}>{asset.name}</span><button type="button" className="btn btn-sm btn-ghost" disabled={disabled || busy} onClick={() => insert(assetMarkdown(asset))}>Insert again</button>{asset.kind === "image" && <button type="button" className="btn btn-sm btn-ghost" disabled={disabled || busy} onClick={() => { onCover(asset.url); onCoverAlt(labelText(asset.name)); }}>Use as cover</button>}</div>)}</div>}
    <div className={`split${view === "preview" ? " preview-only" : ""}`}>
      {view === "split" && <textarea ref={textarea} aria-label="Article Markdown" className="textarea mono" required rows={18} value={content} disabled={disabled || busy} onChange={event => onChange(event.target.value)} onPaste={event => {
        const files = Array.from(event.clipboardData.files).filter(file => file.type.startsWith("image/"));
        if (files.length) { event.preventDefault(); void upload(files); }
      }} placeholder={'## Section Heading\n\nWrite Markdown here. Paste images or drop files to upload.'} />}
      <div className="preview"><div className="label">READER PREVIEW</div><ArticleCover url={coverImage} alt={coverAlt} /><div className="prose"><ArticleContent content={content} /></div></div>
    </div>
  </div>;
}
