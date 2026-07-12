import { siteConfig } from "@/lib/content/data";
import type { SiteConfig } from "@/lib/content/types";

export type { SiteConfig } from "@/lib/content/types";

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}
