import { getContentRepository } from "@/lib/admin/content-repository";
import type { Post } from "@/lib/admin/content-models";

export type { Post } from "@/lib/admin/content-models";

export async function getPosts() {
  return getContentRepository().getPosts();
}

export async function getPostBySlug(slug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

export async function savePosts(value: Post[]) {
  await getContentRepository().savePosts(value);
}
