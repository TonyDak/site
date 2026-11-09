import { NextResponse } from "next/server";
import { getPosts, savePost, type Post } from "@/lib/content/posts";

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json({ posts }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Post> & { secret?: string };

    const expectedSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
    if (expectedSecret && body.secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid admin authorization secret." }, { status: 401 });
    }

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const slug =
      body.slug?.trim() ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newPost: Post = {
      slug,
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || body.content.slice(0, 160).replace(/\n/g, " ") + "...",
      content: body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      readTime: body.readTime || `${Math.max(1, Math.ceil(body.content.split(/\s+/).length / 200))} min read`,
      tags: Array.isArray(body.tags) ? body.tags : ["Engineering"],
      isPublished: body.isPublished !== false,
    };

    const result = await savePost(newPost);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to save post." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, post: newPost }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error." },
      { status: 500 }
    );
  }
}
