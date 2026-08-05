"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";
import { GravityField } from "@/components/motion/GravityField";
import { TransitionLink } from "@/components/motion/TransitionLink";

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function AboutPage() {
  const { content } = useLanguage();
  const { site, about } = content;
  const pageCopy = site.pages.about;

  return (
    <div className="c--editorial-page c--about-page">
      <GravityField />
      <section className="c--about-hero">
        <div className="u--container c--about-hero-grid">
          <Reveal className="c--about-hero-copy">
            <p className="c--editorial-label">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.title}</h1>
            <p className="c--editorial-lead">{pageCopy.subtitle}</p>
            <div className="c--button-row">
              <TransitionLink href="/contact" className="c--btn c--btn-primary">{site.pages.home.secondaryCtaLabel}<ArrowIcon /></TransitionLink>
              <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="c--editorial-text-link">{content.navigation.cvLabel}<ArrowIcon /></a>
            </div>
          </Reveal>
          <Reveal className="c--editorial-portrait">
            <div className="c--editorial-portrait-frame">
              <Image src="/avatar.jpg" alt={`${site.ownerName} — ${site.role}`} width={600} height={600} priority />
            </div>
            <span className="c--editorial-index" aria-hidden="true">01</span>
          </Reveal>
        </div>
      </section>

      <section className="c--about-system">
        <div className="u--container c--about-system-grid">
          <Reveal className="c--about-experience">
            <p className="c--editorial-label">{pageCopy.timelineHeading}</p>
            <div className="c--editorial-timeline">
              {about.timeline.map((item, index) => (
                <article className="c--editorial-timeline-row" key={`${item.title}-${index}`}>
                  <span className="c--row-index">0{index + 1}</span>
                  <span className="c--timeline-node" aria-hidden="true" />
                  <div>
                    <p className="c--timeline-date">{item.label}</p>
                    <h2>{item.title}</h2>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="c--about-stack">
            <p className="c--editorial-label">{pageCopy.skillsHeading}</p>
            <p className="c--stack-intro">{pageCopy.skillsIntro}</p>
            <div className="c--editorial-tech-list">
              {about.skillGroups.map((group, index) => (
                <div
                  className={`c--editorial-tech-row${index === about.skillGroups.length - 1 ? " is-architecture" : ""}`}
                  key={group.label}
                >
                  <span className="c--row-index">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{group.label}</h3>
                  <div className="c--tech-items">
                    {group.items.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="c--enterprise-band" id="featured-projects" aria-labelledby="featured-projects-heading">
        <div className="u--container c--enterprise-band-grid">
          <p className="c--editorial-label">{pageCopy.projectsHeading}</p>
          <h2 id="featured-projects-heading">{pageCopy.projectsHeading}</h2>
          <p>{pageCopy.projectsIntro}</p>
        </div>
      </section>

      <section className="c--project-dossier" aria-labelledby="personal-project-heading">
        <div className="u--container">
          <div className="c--project-dossier-head">
            <div>
              <p className="c--editorial-label">{pageCopy.personalProjectHeading}</p>
              <h2 id="personal-project-heading">{about.personalProject.title}</h2>
            </div>
            <span className="c--editorial-index" aria-hidden="true">02</span>
          </div>
          <a
            className="c--project-repo-link"
            href="https://github.com/TonyDak/social-networking-microservice"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Social Networking Microservice on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.55 9.55 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
            </svg>
            <span>TonyDak/social-networking-microservice</span>
            <ArrowIcon />
          </a>
          <p className="c--project-description">{about.personalProject.description}</p>
          <p className="c--editorial-label c--focus-label">{pageCopy.personalProjectFocusLabel}</p>
          <ol className="c--focus-list">
            {about.personalProject.focus.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </section>
    </div>
  );
}
