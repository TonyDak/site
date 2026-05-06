import type { AboutContent, Post, Project, SiteConfigPatch } from "@/lib/admin/content-models";
import { asArray, asObject, asString, asStringArray } from "@/lib/admin/validation";

export function parseSiteConfigDto(input: unknown): SiteConfigPatch {
  const raw = asObject(input, "site");
  const social = typeof raw.social === "undefined" ? undefined : asObject(raw.social, "site.social");
  const pages = typeof raw.pages === "undefined" ? undefined : asObject(raw.pages, "site.pages");

  const parsePageSection = (section: unknown, label: string, keys: string[]) => {
    const value = asObject(section, label);
    return keys.reduce<Record<string, string>>((accumulator, key) => {
      if (typeof value[key] === "string") {
        accumulator[key] = asString(value[key], `${label}.${key}`);
      }
      return accumulator;
    }, {});
  };

  return {
    name: typeof raw.name === "string" ? asString(raw.name, "site.name") : undefined,
    ownerName: typeof raw.ownerName === "string" ? asString(raw.ownerName, "site.ownerName") : undefined,
    role: typeof raw.role === "string" ? asString(raw.role, "site.role") : undefined,
    description: typeof raw.description === "string" ? asString(raw.description, "site.description") : undefined,
    location: typeof raw.location === "string" ? asString(raw.location, "site.location") : undefined,
    email: typeof raw.email === "string" ? asString(raw.email, "site.email") : undefined,
    social: social
      ? {
          github: typeof social.github === "string" ? asString(social.github, "site.social.github") : undefined,
          linkedin: typeof social.linkedin === "string" ? asString(social.linkedin, "site.social.linkedin") : undefined,
        }
      : undefined,
    pages: pages
      ? {
          home: typeof pages.home === "undefined" ? undefined : parsePageSection(pages.home, "site.pages.home", ["eyebrow", "heroTitle", "heroSubtitle", "featuredHeading", "ctaHeading", "ctaText", "primaryCtaLabel", "secondaryCtaLabel", "cardLinkLabel"]),
          projects: typeof pages.projects === "undefined" ? undefined : parsePageSection(pages.projects, "site.pages.projects", ["eyebrow", "title", "description", "readMoreLabel"]),
          blog: typeof pages.blog === "undefined" ? undefined : parsePageSection(pages.blog, "site.pages.blog", ["eyebrow", "title", "description", "readMoreLabel"]),
          about: typeof pages.about === "undefined" ? undefined : parsePageSection(pages.about, "site.pages.about", ["eyebrow", "title", "subtitle", "timelineHeading", "skillsHeading", "skillsIntro", "recentWritingHeading"]),
          contact: typeof pages.contact === "undefined" ? undefined : parsePageSection(pages.contact, "site.pages.contact", ["eyebrow", "title", "subtitle"]),
          adminLogin: typeof pages.adminLogin === "undefined" ? undefined : parsePageSection(pages.adminLogin, "site.pages.adminLogin", ["eyebrow", "title", "subtitle"]),
          notFound: typeof pages.notFound === "undefined" ? undefined : parsePageSection(pages.notFound, "site.pages.notFound", ["eyebrow", "title", "subtitle", "primaryLabel", "secondaryLabel"]),
        }
      : undefined,
  };
}

function parseProjectDto(input: unknown, index: number): Project {
  const raw = asObject(input, `projects[${index}]`);

  return {
    slug: asString(raw.slug, `projects[${index}].slug`),
    title: asString(raw.title, `projects[${index}].title`),
    summary: asString(raw.summary, `projects[${index}].summary`),
    category: asString(raw.category, `projects[${index}].category`),
    stack: asStringArray(raw.stack, `projects[${index}].stack`),
    outcome: asString(raw.outcome, `projects[${index}].outcome`),
    role: asString(raw.role, `projects[${index}].role`),
    duration: asString(raw.duration, `projects[${index}].duration`),
    challenge: asString(raw.challenge, `projects[${index}].challenge`),
    approach: asStringArray(raw.approach, `projects[${index}].approach`),
    results: asStringArray(raw.results, `projects[${index}].results`),
  };
}

export function parseProjectsDto(input: unknown): Project[] {
  const list = asArray(input, "projects");
  return list.map((item, index) => parseProjectDto(item, index));
}

type PostSection = Post["sections"][number];

function parsePostSectionDto(input: unknown, postIndex: number, sectionIndex: number): PostSection {
  const raw = asObject(input, `posts[${postIndex}].sections[${sectionIndex}]`);

  return {
    heading: asString(raw.heading, `posts[${postIndex}].sections[${sectionIndex}].heading`),
    paragraphs: asStringArray(raw.paragraphs, `posts[${postIndex}].sections[${sectionIndex}].paragraphs`),
  };
}

function parsePostDto(input: unknown, index: number): Post {
  const raw = asObject(input, `posts[${index}]`);
  const sectionsRaw = asArray(raw.sections, `posts[${index}].sections`);

  return {
    slug: asString(raw.slug, `posts[${index}].slug`),
    title: asString(raw.title, `posts[${index}].title`),
    excerpt: asString(raw.excerpt, `posts[${index}].excerpt`),
    publishedAt: asString(raw.publishedAt, `posts[${index}].publishedAt`),
    readTime: asString(raw.readTime, `posts[${index}].readTime`),
    tags: asStringArray(raw.tags, `posts[${index}].tags`),
    sections: sectionsRaw.map((section, sectionIndex) => parsePostSectionDto(section, index, sectionIndex)),
  };
}

export function parsePostsDto(input: unknown): Post[] {
  const list = asArray(input, "posts");
  return list.map((item, index) => parsePostDto(item, index));
}

export function parseAboutDto(input: unknown): AboutContent {
  const raw = asObject(input, "about");
  const timelineRaw = asArray(raw.timeline, "about.timeline");
  const recentWritingRaw = asArray(raw.recentWriting, "about.recentWriting");

  return {
    timeline: timelineRaw.map((item, index) => {
      const value = asObject(item, `about.timeline[${index}]`);
      return {
        label: asString(value.label, `about.timeline[${index}].label`),
        title: asString(value.title, `about.timeline[${index}].title`),
        detail: asString(value.detail, `about.timeline[${index}].detail`),
      };
    }),
    skills: asStringArray(raw.skills, "about.skills"),
    recentWriting: recentWritingRaw.map((item, index) => {
      const value = asObject(item, `about.recentWriting[${index}]`);
      return {
        title: asString(value.title, `about.recentWriting[${index}].title`),
        excerpt: asString(value.excerpt, `about.recentWriting[${index}].excerpt`),
        readTime: asString(value.readTime, `about.recentWriting[${index}].readTime`),
      };
    }),
  };
}