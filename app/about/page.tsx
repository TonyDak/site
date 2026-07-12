"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";

const TECH_LOGOS: Record<string, string> = {
  "Next.js": "nextjs/nextjs-original.svg",
  "React Native": "react/react-original.svg",
  "TypeScript": "typescript/typescript-original.svg",
  "NestJS": "nestjs/nestjs-original.svg",
  "ASP.NET Core": "dot-net/dot-net-original.svg",
  "Spring Boot": "spring/spring-original.svg",
  "PostgreSQL": "postgresql/postgresql-original.svg",
  "MongoDB": "mongodb/mongodb-original.svg",
  "MySQL": "mysql/mysql-original.svg",
  "Docker": "docker/docker-original.svg",
  "Git": "git/git-original.svg",
};

export default function AboutPage() {
  const { content } = useLanguage();
  const { site, about } = content;
  const pageCopy = site.pages.about;

  return (
    <section className="c--section">
      <div className="u--container">
        <Reveal className="js--reveal-it"><p className="c--eyebrow">{pageCopy.eyebrow}</p><h1>{pageCopy.title}</h1><p className="c--hero-subtitle">{pageCopy.subtitle}</p></Reveal>
        <div className="c--about-grid">
          <Reveal className="c--timeline js--reveal-it" delayMs={70}>
            <h2>{pageCopy.timelineHeading}</h2><div className="c--timeline-list">{about.timeline.map((item,index)=><article key={`${item.title}-${index}`} className="c--timeline-entry"><div className="c--timeline-connector"><div className="c--timeline-dot"/>{index<about.timeline.length-1&&<div className="c--timeline-line"/>}</div><div className="c--timeline-body"><span className="c--timeline-label">{item.label}</span><h3 className="c--timeline-title">{item.title}</h3><p className="c--timeline-detail">{item.detail}</p></div></article>)}</div>
          </Reveal>
          <Reveal className="c--skill-cloud js--reveal-it" delayMs={130}>
            <h2>{pageCopy.skillsHeading}</h2><p className="u--muted" style={{marginTop:"10px"}}>{pageCopy.skillsIntro}</p>
            <div className="c--tech-grid">{about.skills.map((skill)=><div key={skill} className="c--tech-card"><span className="c--tech-icon"><Image src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${TECH_LOGOS[skill]}`} alt={`${skill} logo`} width={28} height={28} unoptimized /></span><span className="c--tech-name">{skill}</span></div>)}</div>
          </Reveal>
        </div>
        <section className="c--about-projects" id="featured-projects" aria-labelledby="featured-projects-heading"><Reveal className="js--reveal-it"><h2 id="featured-projects-heading">{pageCopy.projectsHeading}</h2><p className="c--hero-subtitle">{pageCopy.projectsIntro}</p></Reveal></section>
        <section className="c--personal-project" aria-labelledby="personal-project-heading"><Reveal className="js--reveal-it"><h2 id="personal-project-heading">{pageCopy.personalProjectHeading}</h2></Reveal><Reveal className="c--card c--personal-project-card js--reveal-it" delayMs={70}><div><p className="c--tag">{pageCopy.personalProjectRoleLabel}</p><h3>{about.personalProject.title}</h3><p className="u--muted">{about.personalProject.role}</p></div><p className="u--muted">{about.personalProject.description}</p><div><h4 className="c--personal-project-focus-title">{pageCopy.personalProjectFocusLabel}</h4><ul className="c--prose-list">{about.personalProject.focus.map((item)=><li key={item}>{item}</li>)}</ul></div></Reveal></section>
      </div>
    </section>
  );
}
