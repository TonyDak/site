import { getContentRepository } from "@/lib/admin/content-repository";
import type { SiteConfig } from "@/lib/admin/content-models";

export type { SiteConfig } from "@/lib/admin/content-models";

export async function getSiteConfig() {
  return getContentRepository().getSiteConfig();
}

export async function saveSiteConfig(value: SiteConfig) {
  await getContentRepository().saveSiteConfig(value);
}
