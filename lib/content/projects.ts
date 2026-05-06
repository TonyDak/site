import { getContentRepository } from "@/lib/admin/content-repository";
import type { Project } from "@/lib/admin/content-models";

export type { Project } from "@/lib/admin/content-models";

export async function getProjects() {
  return getContentRepository().getProjects();
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function saveProjects(value: Project[]) {
  await getContentRepository().saveProjects(value);
}
