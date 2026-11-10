import type { Post } from "../content/posts";
import type { createAuthHttp } from "./http";
import { privateJson, readJson } from "./http";

type Gate = Pick<ReturnType<typeof createAuthHttp>, "authorize" | "mutationError">;
export function createPostHandlers({ gate, getPosts, savePost }: {
  gate: Gate;
  getPosts: () => Promise<Post[]>;
  savePost: (post: Post) => Promise<{ success: boolean }>;
}) {
  return {
    async GET(request: Request) {
      const error = await gate.authorize(request);
      if (error) return error;
      try { return privateJson({ posts: await getPosts() }); }
      catch { return privateJson({ error: "Could not load posts. Try again." }, 503); }
    },
    async POST(request: Request) {
      const mutationError = gate.mutationError(request);
      if (mutationError) return mutationError;
      const authError = await gate.authorize(request);
      if (authError) return authError;
      const body = await readJson(request, 128 * 1024);
      if (!body || typeof body.title !== "string" || !body.title.trim() || body.title.length > 200
        || typeof body.content !== "string" || !body.content.trim() || body.content.length > 100000
        || (body.slug !== undefined && typeof body.slug !== "string")
        || (body.excerpt !== undefined && (typeof body.excerpt !== "string" || body.excerpt.length > 500))
        || (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 20 || body.tags.some(t => typeof t !== "string" || t.length > 50)))
        || (body.isPublished !== undefined && typeof body.isPublished !== "boolean")) {
        return privateJson({ error: "Invalid article fields or article too large." }, 400);
      }
      const slug = typeof body.slug === "string" ? body.slug.trim() : body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return privateJson({ error: "Use a slug containing lowercase letters, numbers and hyphens." }, 400);
      const post: Post = {
        slug, title: body.title.trim(), content: body.content,
        excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : body.content.slice(0, 160).replace(/\n/g, " ") + "...",
        tags: Array.isArray(body.tags) ? body.tags as string[] : ["Engineering"],
        publishedAt: new Date().toISOString().split("T")[0],
        readTime: `${Math.max(1, Math.ceil(body.content.split(/\s+/).length / 200))} min read`,
        isPublished: body.isPublished !== false,
      };
      try {
        const existing = (await getPosts()).find(p => p.slug === slug);
        if (existing) {
          post.publishedAt = existing.publishedAt;
          if (body.isPublished === undefined) post.isPublished = existing.isPublished !== false;
        }
        if (!(await savePost(post)).success) return privateJson({ error: "Could not save the article. Try again." }, 503);
        return privateJson({ ok: true, post });
      } catch { return privateJson({ error: "Could not save the article. Try again." }, 503); }
    },
  };
}
