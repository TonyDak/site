export type Locale = "en" | "vi";

export type SocialLinks = {
  github: string;
  linkedin?: string;
};

export type SitePages = {
  home: {
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaHeading: string;
    ctaText: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    featuredSystemsLabel: string;
    yearsExperienceLabel: string;
    capabilities: string[];
  };
  about: {
    eyebrow: string;
    title: string;
    subtitle: string;
    timelineHeading: string;
    skillsHeading: string;
    skillsIntro: string;
    projectsHeading: string;
    projectsIntro: string;
    personalProjectHeading: string;
    personalProjectRoleLabel: string;
    personalProjectFocusLabel: string;
  };
  contact: {
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
  location?: string;
  email: string;
  phone: string;
  social: SocialLinks;
  pages: SitePages;
};

export type AboutTimelineItem = {
  label: string;
  title: string;
  detail: string;
};

export type PersonalProject = {
  title: string;
  role: string;
  description: string;
  focus: string[];
};

export type AboutContent = {
  timeline: AboutTimelineItem[];
  skillGroups: Array<{
    label: string;
    items: string[];
  }>;
  personalProject: PersonalProject;
};

export type PortfolioContent = {
  site: SiteConfig;
  about: AboutContent;
  navigation: {
    home: string;
    about: string;
    contact: string;
    languageLabel: string;
    cvLabel: string;
  };
  contactForm: {
    nameLabel: string;
    emailLabel: string;
    detailsLabel: string;
    submitLabel: string;
    sendingLabel: string;
    successMessage: string;
    genericError: string;
    networkError: string;
  };
};
