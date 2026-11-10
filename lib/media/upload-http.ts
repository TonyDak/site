import { privateJson } from "../auth/http";
import type { createAuthHttp } from "../auth/http";
import { filePolicy, matchesSignature } from "./policy";
import type { MediaAsset } from "./policy";

export type MediaStorage = {
  put: (key: string, bytes: Uint8Array, metadata: { contentType: string; attachmentName?: string }) => Promise<void>;
  publicUrl: (key: string) => string;
};
export function createUploadHandler({ gate, storage }: {
  gate: Pick<ReturnType<typeof createAuthHttp>, "authorize" | "mutationError">;
  storage: MediaStorage | null;
}) {
  return async (request: Request) => {
    const mutationError = gate.mutationError(request, "application/octet-stream");
    if (mutationError) return mutationError;
    const authError = await gate.authorize(request);
    if (authError) return authError;
    if (!storage) return privateJson({ error: "Media storage is not configured. Set up R2 first." }, 503);
    let name: string;
    try { name = decodeURIComponent(request.headers.get("x-file-name") ?? "").normalize("NFC"); }
    catch { return privateJson({ error: "Invalid filename." }, 400); }
    const policy = filePolicy(name);
    const suppliedType = request.headers.get("x-file-type")?.toLowerCase();
    if (!policy || (suppliedType && suppliedType !== policy.mime && !(policy.ext === "zip" && suppliedType === "application/x-zip-compressed"))) {
      return privateJson({ error: "Unsupported file type. Use PNG, JPEG, WebP, GIF, AVIF, MP4, WebM, PDF or ZIP." }, 400);
    }
    const tooLarge = () => privateJson({ error: `File exceeds the ${policy.maxBytes / 1024 / 1024} MB limit.` }, 413);
    const declaredSize = request.headers.get("content-length");
    if (declaredSize && Number(declaredSize) > policy.maxBytes) return tooLarge();
    if (!request.body) return privateJson({ error: "File is empty." }, 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > policy.maxBytes) { await reader.cancel(); return tooLarge(); }
        chunks.push(value);
      }
    } catch { return privateJson({ error: "Could not read the file. Try again." }, 400); }
    finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    if (!matchesSignature(bytes, policy.mime)) return privateJson({ error: "The file contents do not match its declared type." }, 400);
    const date = new Date().toISOString();
    const key = `blog/${date.slice(0,4)}/${date.slice(5,7)}/${crypto.randomUUID()}.${policy.ext}`;
    try {
      await storage.put(key, bytes, { contentType: policy.mime, ...(policy.kind === "file" ? { attachmentName: name } : {}) });
      const asset: MediaAsset = { key, url: storage.publicUrl(key), name, kind: policy.kind, contentType: policy.mime, size };
      return privateJson({ asset }, 201);
    } catch { return privateJson({ error: "Could not upload to media storage. Try again." }, 503); }
  };
}
