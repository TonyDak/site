import { adminAuth } from "@/lib/auth/server";
import { createUploadHandler } from "@/lib/media/upload-http";
import { r2Storage } from "@/lib/media/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return createUploadHandler({ gate: adminAuth(), storage: r2Storage(process.env) })(request);
}
