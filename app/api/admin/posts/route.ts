import { NextResponse } from "next/server";
import { getPosts } from "@/lib/content/posts";
import { savePostsFromUnknown } from "@/lib/admin/content-service";

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json({ posts }, { status: 200 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await savePostsFromUnknown(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save posts." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
