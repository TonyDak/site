import type { Project } from "@/lib/content/projects";
import type { Post } from "@/lib/content/posts";
import type { SiteConfig } from "@/lib/site";

export type ProjectDraft = Project & {
  stackText: string;
  approachText: string;
  resultsText: string;
};

export type PostDraft = Post & {
  tagsText: string;
  bodyText: string;
};

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitParagraphs(value: string) {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toProjectDraft(project: Project): ProjectDraft {
  return {
    ...project,
    stackText: project.stack.join("\n"),
    approachText: project.approach.join("\n"),
    resultsText: project.results.join("\n"),
  };
}

export function fromProjectDraft(draft: ProjectDraft): Project {
  return {
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    category: draft.category.trim(),
    stack: splitLines(draft.stackText),
    outcome: draft.outcome.trim(),
    role: draft.role.trim(),
    duration: draft.duration.trim(),
    challenge: draft.challenge.trim(),
    approach: splitLines(draft.approachText),
    results: splitLines(draft.resultsText),
  };
}

export function toPostDraft(post: Post): PostDraft {
  return {
    ...post,
    tagsText: post.tags.join(", "),
    bodyText: post.sections
      .map((section) => [section.heading, ...section.paragraphs].join("\n\n"))
      .join("\n\n---\n\n"),
  };
}

export function fromPostDraft(draft: PostDraft): Post {
  const bodySections = draft.bodyText
    .split(/\n\n---\n\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [heading, ...paragraphs] = chunk.split(/\n\n/).map((item) => item.trim()).filter(Boolean);
      return {
        heading: heading || draft.title.trim(),
        paragraphs: paragraphs.length > 0 ? paragraphs : [draft.excerpt.trim()],
      };
    });

  return {
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    excerpt: draft.excerpt.trim(),
    publishedAt: draft.publishedAt.trim(),
    readTime: draft.readTime.trim(),
    tags: splitLines(draft.tagsText.replace(/,/g, "\n")),
    sections: bodySections.length > 0
      ? bodySections
      : [
          {
            heading: draft.title.trim(),
            paragraphs: splitParagraphs(draft.bodyText),
          },
        ],
  };
}

export function blankProjectDraft(): ProjectDraft {
  return {
    slug: "new-project",
    title: "New Project",
    summary: "Short summary for the case study.",
    category: "Category",
    stack: [],
    outcome: "Expected outcome.",
    role: "Role",
    duration: "4 weeks",
    challenge: "Describe the problem.",
    approach: [],
    results: [],
    stackText: "Next.js\nTypeScript",
    approachText: "Describe the approach.",
    resultsText: "Describe the results.",
  };
}

export function blankPostDraft(): PostDraft {
  return {
    slug: "new-note",
    title: "New Note",
    excerpt: "Short intro for the note.",
    publishedAt: new Date().toISOString().slice(0, 10),
    readTime: "5 min",
    tags: [],
    sections: [
      {
        heading: "New Note",
        paragraphs: ["Write the note here."],
      },
    ],
    tagsText: "Motion, UX",
    bodyText: "New Note\n\nWrite the note here.",
  };
}

export function mergeSiteConfig(
  base: SiteConfig,
  patch: Partial<Omit<SiteConfig, "social">> & {
    social?: Partial<SiteConfig["social"]>;
  }
): SiteConfig {
  return {
    ...base,
    ...patch,
    social: {
      ...base.social,
      ...patch.social,
    },
  };
}
