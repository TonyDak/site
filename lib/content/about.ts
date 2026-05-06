import { getContentRepository } from "@/lib/admin/content-repository";
import type { AboutContent } from "@/lib/admin/content-models";

export type { AboutContent } from "@/lib/admin/content-models";

export async function getAboutContent() {
  return getContentRepository().getAboutContent();
}

export async function saveAboutContent(value: AboutContent) {
  await getContentRepository().saveAboutContent(value);
}
