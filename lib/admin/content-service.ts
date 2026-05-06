import { saveAboutContent } from "@/lib/content/about";
import { savePosts } from "@/lib/content/posts";
import { saveProjects } from "@/lib/content/projects";
import { getSiteConfig, saveSiteConfig } from "@/lib/site";
import { parseAboutDto, parsePostsDto, parseProjectsDto, parseSiteConfigDto } from "@/lib/admin/content-dto";
import { appendAuditLog, createAuditLog } from "@/lib/admin/audit";
import { mergeSiteConfig } from "@/lib/admin/content-models";

function assertUniqueSlugs(values: string[], label: string) {
  const seen = new Set<string>();

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate slug found in ${label}: ${value}`);
    }
    seen.add(key);
  }
}

export async function saveSiteConfigFromUnknown(payload: unknown) {
  const current = await getSiteConfig();
  const site = mergeSiteConfig(current, parseSiteConfigDto(payload));
  await saveSiteConfig(site);
  await appendAuditLog(createAuditLog("content.save.site", `Updated site config for ${site.ownerName}`));
}

export async function saveProjectsFromUnknown(payload: unknown) {
  const projects = parseProjectsDto(payload);
  assertUniqueSlugs(
    projects.map((project) => project.slug),
    "projects"
  );
  await saveProjects(projects);
  await appendAuditLog(createAuditLog("content.save.projects", `Saved ${projects.length} project records`));
}

export async function savePostsFromUnknown(payload: unknown) {
  const posts = parsePostsDto(payload);
  assertUniqueSlugs(
    posts.map((post) => post.slug),
    "posts"
  );
  await savePosts(posts);
  await appendAuditLog(createAuditLog("content.save.posts", `Saved ${posts.length} post records`));
}

export async function saveAboutFromUnknown(payload: unknown) {
  const about = parseAboutDto(payload);
  await saveAboutContent(about);
  await appendAuditLog(createAuditLog("content.save.about", `Saved about content with ${about.timeline.length} timeline items`));
}

export async function savePostsFromDto(posts: ReturnType<typeof parsePostsDto>) {
  assertUniqueSlugs(
    posts.map((post) => post.slug),
    "posts"
  );
  await savePosts(posts);
}