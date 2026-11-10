import { revalidatePath } from "next/cache";
import { getPosts, savePost } from "@/lib/content/posts";
import { adminAuth } from "@/lib/auth/server";
import { createPostHandlers } from "@/lib/auth/posts-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handlers() {
  return createPostHandlers({ gate: adminAuth(), getPosts: () => getPosts({ includeDrafts: true }), savePost });
}
export async function GET(request: Request) { return handlers().GET(request); }
export async function POST(request: Request) {
  const response = await handlers().POST(request);
  if (response.ok) {
    revalidatePath("/blog", "layout");
    revalidatePath("/sitemap.xml");
  }
  return response;
}
