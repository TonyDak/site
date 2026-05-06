export type SocialLinks = {
  github: string;
  linkedin: string;
};

export type SitePages = {
  home: {
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    featuredHeading: string;
    ctaHeading: string;
    ctaText: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    cardLinkLabel: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    readMoreLabel: string;
  };
  blog: {
    eyebrow: string;
    title: string;
    description: string;
    readMoreLabel: string;
  };
  about: {
    eyebrow: string;
    title: string;
    subtitle: string;
    timelineHeading: string;
    skillsHeading: string;
    skillsIntro: string;
    recentWritingHeading: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  adminLogin: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
};

export type SiteConfig = {
  name: string;
  ownerName: string;
  role: string;
  description: string;
  location: string;
  email: string;
  social: SocialLinks;
  pages: SitePages;
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  stack: string[];
  outcome: string;
  role: string;
  duration: string;
  challenge: string;
  approach: string[];
  results: string[];
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export type AboutTimelineItem = {
  label: string;
  title: string;
  detail: string;
};

export type AboutContent = {
  timeline: AboutTimelineItem[];
  skills: string[];
  recentWriting: Array<{
    title: string;
    excerpt: string;
    readTime: string;
  }>;
};

export type ContactSubmission = {
  name: string;
  email: string;
  detail: string;
  website?: string;
};

export type MongoDocument<T> = T & {
  _id: string;
};

export type SiteConfigPatch = Partial<Omit<SiteConfig, "social" | "pages">> & {
  social?: Partial<SocialLinks>;
  pages?: Partial<{
    [K in keyof SitePages]: Partial<SitePages[K]>;
  }>;
};

export type AuditLogEntry = {
  kind:
    | "auth.login"
    | "auth.logout"
    | "content.save.site"
    | "content.save.projects"
    | "content.save.posts"
    | "content.save.about";
  actor?: string;
  detail: string;
  createdAt: string;
};

export const COLLECTION_NAMES = {
  site: "site",
  about: "about",
  projects: "projects",
  posts: "posts",
  auditLogs: "audit_logs",
} as const;

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  timeline: [
    {
      label: "2026",
      title: "Full-stack Developer at KAS Technology",
      detail: "Leading end-to-end delivery of high-performance web and mobile solutions using Next.js, React Native, and NestJS.",
    },
    {
      label: "2024-2025",
      title: "Backend Specialization (Spring Boot)",
      detail: "Focused on building robust, scalable microservices and APIs with Java, Spring Boot, and cloud infrastructure.",
    },
    {
      label: "2022-2023",
      title: "Software Engineering Foundation",
      detail: "Established core engineering principles across multiple languages including Java, C++, and C#.",
    },
  ],
  skills: [
    "Spring Boot",
    "ASP.NET Web API",
    "Next.js",
    "React Native",
    "NestJS",
    "TypeScript",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "AWS",
    "Docker",
  ],
  recentWriting: [
    {
      title: "Designing motion that supports conversion",
      excerpt: "A practical system for deciding where motion increases trust and where it adds noise.",
      readTime: "6 min",
    },
    {
      title: "Shipping visual consistency with token-driven CSS",
      excerpt: "How to maintain speed while keeping a distinct brand surface across pages.",
      readTime: "7 min",
    },
  ],
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: "tonydev",
  ownerName: "Đức Nguyễn Hữu",
  role: "Web & Mobile Developer",
  description: "A product-minded Full-stack Developer deliverging comprehensive web and mobile solutions.",
  location: "Ho Chi Minh City, Vietnam",
  email: "[EMAIL_ADDRESS]",
  social: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
  },
  pages: {
    home: {
      eyebrow: "Web & Mobile Developer",
      heroTitle: "Crafting end-to-end digital experiences from robust backends to refined UIs.",
      heroSubtitle:
        "Full-stack Developer at KAS Technology. Specialized in Spring Boot systems, now building high-performance solutions with React Native, Next.js, and NestJS.",
      featuredHeading: "Selected Work",
      ctaHeading: "Ready to build something impactful?",
      ctaText:
        "I help teams bridge the gap between complex backend logic and seamless user experiences, delivering software that is both powerful and intuitive.",
      primaryCtaLabel: "Explore My Work",
      secondaryCtaLabel: "Get In Touch",
      cardLinkLabel: "View project detail",
    },
    projects: {
      eyebrow: "Projects",
      title: "Selected builds and product outcomes",
      description: "Case studies drawn from live MongoDB project records.",
      readMoreLabel: "Read case study",
    },
    blog: {
      eyebrow: "Notes",
      title: "Essays on UI systems, motion, and delivery",
      description: "Writing on UI systems, motion, and frontend delivery.",
      readMoreLabel: "Read note",
    },
    about: {
      eyebrow: "About Me",
      title: "Versatile engineer with a focus on scale and performance",
      subtitle:
        "I started my journey with a deep passion for backend architecture and Java Spring Boot. Since joining KAS Technology, I've evolved into a full-stack engineer, delivering end-to-end solutions that span from mobile applications to cloud-native microservices.",
      timelineHeading: "Professional Journey",
      skillsHeading: "Technical Ecosystem",
      skillsIntro: "A diverse toolkit built on strong backend foundations and modern frontend agility.",
      recentWritingHeading: "Sharing Knowledge",
    },
    contact: {
      eyebrow: "Contact",
      title: "Tell me what you are building",
      subtitle:
        "Share your timeline, goals, and context. I can help with strategy, implementation, or full UI delivery.",
    },
    adminLogin: {
      eyebrow: "Admin",
      title: "Sign in to the content studio",
      subtitle: "Only the owner account can access this area.",
    },
    notFound: {
      eyebrow: "404",
      title: "This page does not exist.",
      subtitle: "The page may have moved, been renamed, or is no longer available.",
      primaryLabel: "Go to home",
      secondaryLabel: "Browse projects",
    },
  },
};

export function mergeSiteConfig(base: SiteConfig, patch: SiteConfigPatch): SiteConfig {
  return {
    ...base,
    ...patch,
    social: {
      ...base.social,
      ...patch.social,
    },
    pages: {
      home: {
        ...base.pages.home,
        ...patch.pages?.home,
      },
      projects: {
        ...base.pages.projects,
        ...patch.pages?.projects,
      },
      blog: {
        ...base.pages.blog,
        ...patch.pages?.blog,
      },
      about: {
        ...base.pages.about,
        ...patch.pages?.about,
      },
      contact: {
        ...base.pages.contact,
        ...patch.pages?.contact,
      },
      adminLogin: {
        ...base.pages.adminLogin,
        ...patch.pages?.adminLogin,
      },
      notFound: {
        ...base.pages.notFound,
        ...patch.pages?.notFound,
      },
    },
  };
}