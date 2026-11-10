import { withDb } from "@/lib/db/mongo";
import { safeUrl } from "./markdown";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  coverAlt?: string;
  sections?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  isPublished?: boolean;
};

function normalizePost(raw: Partial<Post>): Post {
  let content = typeof raw.content === "string" ? raw.content : "";
  if (!content && Array.isArray(raw.sections)) {
    content = raw.sections
      .map((sec) => `## ${sec.heading || ""}\n\n${(sec.paragraphs || []).join("\n\n")}`)
      .join("\n\n");
  }

  return {
    slug: raw.slug || "",
    title: raw.title || "",
    excerpt: raw.excerpt || content.slice(0, 160).replace(/\n/g, " ") + "...",
    content: content || "Content currently being edited.",
    publishedAt: raw.publishedAt || "2026-01-01",
    readTime: raw.readTime || "5 min read",
    tags: Array.isArray(raw.tags) ? raw.tags : ["Engineering"],
    coverImage: safeUrl(raw.coverImage) ?? "",
    coverAlt: typeof raw.coverAlt === "string" ? raw.coverAlt : "",
    isPublished: raw.isPublished !== false,
  };
}

export async function getPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  try {
    const posts = await withDb(async (db) => {
      const collection = db.collection<Post>("posts");
      const docs = await collection.find(includeDrafts ? {} : { isPublished: { $ne: false } }).sort({ publishedAt: -1 }).toArray();
      return docs.map(normalizePost);
    });
    if (posts !== null) return posts;
    throw new Error("POST_STORAGE_NOT_CONFIGURED");
  } catch (err) {
    let category = "query_failed";
    if (err instanceof Error) {
      if (err.message === "POST_STORAGE_NOT_CONFIGURED") category = "configuration_missing";
      else if (err.name === "MongoParseError" || err.name === "MongoInvalidArgumentError") category = "invalid_configuration";
      else if (err.name === "MongoServerSelectionError" || err.name === "MongoNetworkError") category = "connection_failed";
      else if ("code" in err && err.code === 18) category = "authentication_failed";
    }
    console.error("[Posts] Article storage unavailable.", { category });
    throw new Error("Article storage is temporarily unavailable.");
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function savePost(post: Post): Promise<{ success: boolean; error?: string }> {
  try {
    const normalized = normalizePost(post);
    const saved = await withDb(async (db) => {
      const collection = db.collection<Post>("posts");
      await collection.updateOne(
        { slug: normalized.slug },
        { $set: normalized },
        { upsert: true }
      );
      return true;
    });
    return saved ? { success: true } : { success: false, error: "Article storage unavailable." };
  } catch (err) {
    return { success: false, error: (err as Error)?.message };
  }
}
