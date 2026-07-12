"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";

function TechIcon({ skill }: { skill: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;

  switch (skill) {
    case "Next.js":
      return <svg {...common}><circle cx="12" cy="12" r="10" fill="#111827" /><path d="M8 16V8l7 8V8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "React Native":
      return <svg {...common}><circle cx="12" cy="12" r="2" fill="#61DAFB" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.4" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.4" transform="rotate(120 12 12)" /></svg>;
    case "TypeScript":
      return <svg {...common}><rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" /><path d="M6 8h8M10 8v9M15 17v-5h2.4a2.4 2.4 0 0 1 0 4.8H15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "NestJS":
      return <svg {...common}><path d="M12 2.5 19 7v10l-7 4.5L5 17V7l7-4.5Z" fill="#E0234E" opacity=".16" stroke="#E0234E" strokeWidth="1.5" /><path d="M8.5 15.5v-7l7 7v-7" stroke="#E0234E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "ASP.NET Core":
      return <svg {...common}><rect x="2" y="3" width="20" height="18" rx="4" fill="#512BD4" opacity=".16" /><text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="#512BD4">.NET</text></svg>;
    case "Spring Boot":
      return <svg {...common}><circle cx="12" cy="12" r="9" fill="#6DB33F" opacity=".14" /><path d="M7 15c5.8.2 9-2.8 10-7-4.7-.2-8.8 1.6-10 7Z" fill="#6DB33F" /><path d="M7.5 16.5c2.7-3 5.4-4.9 8.4-6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></svg>;
    case "PostgreSQL":
      return <svg {...common}><ellipse cx="12" cy="6.5" rx="7" ry="3" fill="#336791" opacity=".18" stroke="#336791" strokeWidth="1.4" /><path d="M5 6.5v10c0 1.65 3.13 3 7 3s7-1.35 7-3v-10M5 11.5c0 1.65 3.13 3 7 3s7-1.35 7-3" stroke="#336791" strokeWidth="1.4" /></svg>;
    case "MongoDB":
      return <svg {...common}><path d="M12 2.5c-2.9 3.5-4.4 6.7-4.4 9.3A4.4 4.4 0 0 0 12 16.2a4.4 4.4 0 0 0 4.4-4.4C16.4 9.2 14.9 6 12 2.5Z" fill="#47A248" opacity=".16" stroke="#47A248" strokeWidth="1.4" /><path d="M12 5.5v14" stroke="#47A248" strokeWidth="1.6" strokeLinecap="round" /></svg>;
    case "MySQL":
      return <svg {...common}><ellipse cx="12" cy="7" rx="7" ry="3" fill="#00758F" opacity=".16" stroke="#00758F" strokeWidth="1.4" /><path d="M5 7v9c0 1.65 3.13 3 7 3s7-1.35 7-3V7M5 11.5c0 1.65 3.13 3 7 3s7-1.35 7-3" stroke="#00758F" strokeWidth="1.4" /><path d="M16.5 4.5c1.7-.2 2.8-1 3.5-2" stroke="#F29111" strokeWidth="1.4" strokeLinecap="round" /></svg>;
    case "Docker":
      return <svg {...common}><path d="M3 12h13v6H8a5 5 0 0 1-5-5v-1Z" fill="#2496ED" opacity=".16" stroke="#2496ED" strokeWidth="1.4" /><path d="M6 9h3v3H6zm4 0h3v3h-3zm0-3h3v3h-3zm4 3h3v3h-3zM17 13h2.5c.6 0 1.2-.35 1.5-.9" stroke="#2496ED" strokeWidth="1.2" strokeLinejoin="round" /></svg>;
    case "Git":
      return <svg {...common}><path d="m12 3 8 8-8 8-8-8 8-8Z" fill="#F05032" opacity=".16" stroke="#F05032" strokeWidth="1.4" /><circle cx="9" cy="9" r="1.25" fill="#F05032" /><circle cx="15" cy="15" r="1.25" fill="#F05032" /><path d="M10 9h2v4c0 1.1.9 2 2 2M12 11l2-2" stroke="#F05032" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "REST API":
      return <svg {...common}><circle cx="6" cy="12" r="2.4" fill="#0EA5E9" opacity=".18" stroke="#0EA5E9" strokeWidth="1.4" /><circle cx="18" cy="6" r="2.4" fill="#0EA5E9" opacity=".18" stroke="#0EA5E9" strokeWidth="1.4" /><circle cx="18" cy="18" r="2.4" fill="#0EA5E9" opacity=".18" stroke="#0EA5E9" strokeWidth="1.4" /><path d="m8.1 10.8 7.8-3.6M8.1 13.2l7.8 3.6" stroke="#0EA5E9" strokeWidth="1.4" /></svg>;
    case "WebSocket":
      return <svg {...common}><path d="M6 8h9l-2.5-2.5M18 16H9l2.5 2.5" stroke="#06B6D4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 5v14M19 5v14" stroke="#06B6D4" strokeWidth="1.4" strokeLinecap="round" /></svg>;
    case "Clean Architecture":
      return <svg {...common}><circle cx="12" cy="12" r="9" stroke="#7C3AED" strokeWidth="1.3" /><circle cx="12" cy="12" r="5.5" stroke="#7C3AED" strokeWidth="1.3" /><circle cx="12" cy="12" r="2" fill="#7C3AED" /><path d="M3 12h18M12 3v18" stroke="#7C3AED" strokeWidth="1" opacity=".7" /></svg>;
    default:
      return null;
  }
}

export default function AboutPage() {
  const { content } = useLanguage();
  const { site, about } = content;
  const pageCopy = site.pages.about;

  return (
    <section className="c--section">
      <div className="u--container">
        <Reveal className="js--reveal-it">
          <p className="c--eyebrow">{pageCopy.eyebrow}</p>
          <h1>{pageCopy.title}</h1>
          <p className="c--hero-subtitle">{pageCopy.subtitle}</p>
        </Reveal>

        <div className="c--about-grid">
          <Reveal className="c--timeline js--reveal-it" delayMs={70}>
            <h2>{pageCopy.timelineHeading}</h2>
            <div className="c--timeline-list">
              {about.timeline.map((item, index) => (
                <article key={`${item.title}-${index}`} className="c--timeline-entry">
                  <div className="c--timeline-connector">
                    <div className="c--timeline-dot" />
                    {index < about.timeline.length - 1 && <div className="c--timeline-line" />}
                  </div>
                  <div className="c--timeline-body">
                    <span className="c--timeline-label">{item.label}</span>
                    <h3 className="c--timeline-title">{item.title}</h3>
                    <p className="c--timeline-detail">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="c--skill-cloud js--reveal-it" delayMs={130}>
            <h2>{pageCopy.skillsHeading}</h2>
            <p className="u--muted" style={{ marginTop: "10px" }}>{pageCopy.skillsIntro}</p>
            <div className="c--tech-grid">
              {about.skills.map((skill) => (
                <div key={skill} className="c--tech-card">
                  <span className="c--tech-icon"><TechIcon skill={skill} /></span>
                  <span className="c--tech-name">{skill}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <section className="c--about-projects" id="featured-projects" aria-labelledby="featured-projects-heading">
          <Reveal className="js--reveal-it">
            <h2 id="featured-projects-heading">{pageCopy.projectsHeading}</h2>
            <p className="c--hero-subtitle">{pageCopy.projectsIntro}</p>
          </Reveal>
        </section>

        <section className="c--personal-project" aria-labelledby="personal-project-heading">
          <Reveal className="js--reveal-it">
            <h2 id="personal-project-heading">{pageCopy.personalProjectHeading}</h2>
          </Reveal>
          <Reveal className="c--card c--personal-project-card js--reveal-it" delayMs={70}>
            <div>
              <p className="c--tag">{pageCopy.personalProjectRoleLabel}</p>
              <h3>{about.personalProject.title}</h3>
              <p className="u--muted">{about.personalProject.role}</p>
            </div>
            <p className="u--muted">{about.personalProject.description}</p>
            <div>
              <h4 className="c--personal-project-focus-title">{pageCopy.personalProjectFocusLabel}</h4>
              <ul className="c--prose-list">
                {about.personalProject.focus.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </Reveal>
        </section>
      </div>
    </section>
  );
}
