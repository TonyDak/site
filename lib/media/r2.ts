import "server-only";
import { AwsClient } from "aws4fetch";
import type { MediaStorage } from "./upload-http";

export function r2Storage(env: NodeJS.ProcessEnv): MediaStorage | null {
  const { R2_ACCOUNT_ID: account, R2_BUCKET_NAME: bucket, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey, R2_PUBLIC_URL: publicUrl } = env;
  if (!account || !bucket || !accessKeyId || !secretAccessKey || !publicUrl) return null;
  if (!/^[a-f0-9]{32}$/.test(account) || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) return null;
  let base: URL;
  try { base = new URL(publicUrl); } catch { return null; }
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) return null;
  const root = base.toString().replace(/\/$/, "");
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto", retries: 0 });
  return {
    publicUrl: key => `${root}/${key}`,
    async put(key, bytes, metadata) {
      const headers: Record<string,string> = { "Content-Type": metadata.contentType, "Cache-Control": "public, max-age=31536000, immutable" };
      if (metadata.attachmentName) headers["Content-Disposition"] = `attachment; filename="download.${key.split(".").pop()}"; filename*=UTF-8''${encodeURIComponent(metadata.attachmentName).replace(/['()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}`;
      const response = await client.fetch(`https://${account}.r2.cloudflarestorage.com/${bucket}/${key}`, {
        method: "PUT", headers, body: bytes as BodyInit, signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error("Media storage rejected the upload."); }
      await response.body?.cancel();
    },
  };
}
