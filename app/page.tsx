"use client";

import { useState } from "react";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { useLanguage } from "@/components/language/LanguageProvider";
import { ui } from "@/lib/content/ui";
import { IdeShell, type OutlineItem } from "@/components/ide/IdeShell";
import { Icon, GithubIcon, LinkedinIcon, type IconKey } from "@/components/ide/icons";
import { HeroDepthCard } from "@/components/home/HeroDepthCard";
import { TypewriterText } from "@/components/motion/TypewriterText";
import { ContactForm } from "@/app/contact/ContactForm";

export default function Home() {
  const { locale, content } = useLanguage();
  const t = ui[locale];
  const { site, about } = content;
  const copy = site.pages.home;
  const [copied, setCopied] = useState(false);

  const outline: OutlineItem[] = [
    { id: "readme", label: t.files.readme, icon: "readme" },
    { id: "projects", label: t.files.projects, icon: "projects" },
    { id: "experience", label: t.files.experience, icon: "experience" },
    { id: "skills", label: t.files.skills, icon: "skills" },
    { id: "contact", label: t.files.contact, icon: "contact" },
  ];

  const handleCopyJson = () => {
    const data = {
      name: "@duc/stack",
      version: "2026.1.0",
      capabilities: Object.fromEntries(
        about.skillGroups.map((g) => [
          g.label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          g.items,
        ])
      ),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <IdeShell active="home" outline={outline} showTerminal>
      {/* ── 1. README.md (Hero) ── */}
<section className="section rise" id="readme">
        <div className="comment">
          <span className="idx">01</span>
          <span>README.md — Profile overview</span>
        </div>

        <div className="hero-badges">
          <span className="pill neon">
            <span className="live-dot" /> {t.available}
          </span>
          <span className="pill">Ho Chi Minh City, VN</span>
        </div>

        <div className="hero-layout">
          <div className="hero-copy">
            <p className="hero-identity"><span>{site.ownerName}</span><span>{site.role}</span></p>
            <h1 className="hero-headline"><TypewriterText text={copy.heroTitle} /></h1>
            <p className="hero-desc">{t.shortIntro}</p>
            <div className="cta-row">
              <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="btn btn-neon">
                <Icon name="download" size={15} />{content.navigation.cvLabel}
              </a>
              <a href="#projects" className="btn btn-ghost"><Icon name="projects" size={15} />{t.hero.viewProjects}</a>
            </div>
            <div className="hero-links">
              <a href="#contact">{copy.secondaryCtaLabel}<Icon name="arrowUpRight" size={13} /></a>
              <Link href="/blog">{t.blog.title}<Icon name="arrowRight" size={13} /></Link>
            </div>
          </div>
          <div className="hero-visual">
            <HeroDepthCard ownerName={site.ownerName} role={site.role} />
          </div>
        </div>

        <div className="stats">
          {t.hero.stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-num">
                {s.num}
                <em>{s.suffix}</em>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="projects">
        <div className="comment">
          <span className="idx">02</span>
          <span>projects/ — Architecture &amp; product delivery</span>
        </div>

        <h2 className="h2">{t.sections.projects}</h2>
        <p className="lede">{t.sections.projectsLede}</p>

        {/* Personal Project */}
        <div className="panel" style={{ marginBottom: "28px" }}>
          <div className="project-head">
            <div>
              <h3 className="project-title">{about.personalProject.title}</h3>
              <div className="project-role">{about.personalProject.role}</div>
            </div>
            <a
              href="https://github.com/TonyDak/social-networking-microservice"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-ghost"
            >
              <GithubIcon size={14} />
              TonyDak/social-networking-microservice
              <Icon name="arrowUpRight" size={13} />
            </a>
          </div>

          <p className="project-desc">{about.personalProject.description}</p>

          <dl className="project-story">
            <div><dt>{t.projectChallenge}</dt><dd>{t.projectChallengeText}</dd></div>
            <div><dt>{t.projectContribution}</dt><dd>{t.projectContributionText}</dd></div>
          </dl>
          <details className="architecture-details">
            <summary><Icon name="waypoints" size={14} />{locale === "vi" ? "Khám phá kiến trúc" : "Explore the architecture"}<Icon name="chevronDown" size={14} /></summary>
          <div className="spec-tree">
            <div className="spec-row root">
              <Icon name="waypoints" size={14} className="ico" />
              <span>Spring Cloud API Gateway</span>
              <span className="spec-tag">INGRESS · PORT 8080</span>
            </div>
            <div className="spec-row child">
              <Icon name="key" size={14} className="ico" />
              <span>Keycloak IAM &amp; JWT stateless authentication</span>
              <span className="spec-tag">AUTH SERVICE</span>
            </div>
            <div className="spec-row child">
              <Icon name="radio" size={14} className="ico" />
              <span>Apache Kafka event-driven broker (publish/subscribe topics)</span>
              <span className="spec-tag">EVENT BUS</span>
            </div>
            <div className="spec-row child">
              <Icon name="database" size={14} className="ico" />
              <span>Redis distributed timeline &amp; session cache</span>
              <span className="spec-tag">CACHE LAYER</span>
            </div>
            <div className="spec-row child">
              <Icon name="container" size={14} className="ico" />
              <span>Docker Compose local service orchestration mesh</span>
              <span className="spec-tag">DEVOPS</span>
            </div>
          </div>

          </details>

          <div className="project-foot">
            <div className="label">{t.sections.stack}</div>
            <div className="chip-row">
              {about.personalProject.stack.map((s) => (
                <span className="pill cobalt" key={s}>
                  {s}
                </span>
              ))}
            </div>

            <div className="label" style={{ marginTop: "18px" }}>
              {site.pages.about.personalProjectFocusLabel}
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--text-2)", fontSize: "14px", lineHeight: "1.75" }}>
              {about.personalProject.focus.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enterprise Delivery (KAS Tech) */}
        <div className="nda">
          <Icon name="shield" size={16} className="ico" />
          <div>
            <strong style={{ color: "var(--text)" }}>{site.pages.about.projectsHeading}: </strong>
            <span>{site.pages.about.projectsIntro}</span>
          </div>
        </div>

        <div className="domain-grid">
          {t.domains.map((d, i) => (
            <div className="panel domain" key={i}>
              <div className="domain-ico">
                <Icon name={d.icon as IconKey} size={18} />
              </div>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="experience">
        <div className="comment">
          <span className="idx">03</span>
          <span>experience.log — Git log</span>
        </div>

        <h2 className="h2">{site.pages.about.timelineHeading}</h2>
        <p className="lede">{t.sections.experience}</p>

        <ol className="log">
          {about.timeline.map((item, i) => (
            <li className={`log-item ${i === 0 ? "head" : ""}`} key={i}>
              <span className="log-node" aria-hidden="true" />
              <div className="log-meta">
                <span className="hash">commit c{i + 1}a7e9{i}</span>
                {i === 0 && <span className="ref">(HEAD -&gt; main)</span>}
                <span>·</span>
                <span>{item.label}</span>
              </div>
              <h3 className="log-title">{item.title}</h3>
              <p className="log-detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="skills">
        <div className="comment">
          <span className="idx">04</span>
          <span>skills.json — Core stack &amp; capabilities</span>
        </div>

        <div className="section-title-row">
          <h2 className="h2">{site.pages.about.skillsHeading}</h2>
          <button type="button" className="chip-btn" onClick={handleCopyJson}><Icon name={copied ? "check" : "copy"} size={13} />{copied ? t.copied : t.copyStack}</button>
        </div>
        <p className="lede">{t.skillsNote}</p>

        <div className="skills-grid">
          {about.skillGroups.map((g, idx) => (
            <div className={`panel skill-card ${idx === about.skillGroups.length - 1 ? "wide" : ""}`} key={g.label}>
              <div className="skill-key">
                <span className="k">{g.label}</span>
                <span className="n">{g.items.length} items</span>
              </div>
              <div className="chip-row">
                {g.items.map((it) => (
                  <span className="chip" key={it}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="contact" style={{ paddingBottom: "32px" }}>
        <div className="comment">
          <span className="idx">05</span>
          <span>contact.sh — Dispatch a message</span>
        </div>

        <h2 className="h2">{site.pages.contact.title}</h2>
        <p className="lede">{t.sections.contactLede}</p>

        <div className="contact-grid">
          <div className="panel link-list">
            <a href={`mailto:${site.email}`} className="link-row">
              <span className="lr-ico">
                <Icon name="mail" size={15} />
              </span>
              <div>
                <div className="lr-k">EMAIL</div>
                <div className="lr-v">{site.email}</div>
              </div>
              <Icon name="arrowUpRight" size={14} className="lr-arrow" />
            </a>

            <a href={`tel:${site.phone}`} className="link-row">
              <span className="lr-ico">
                <Icon name="phone" size={15} />
              </span>
              <div>
                <div className="lr-k">PHONE</div>
                <div className="lr-v">{site.phone}</div>
              </div>
              <Icon name="arrowUpRight" size={14} className="lr-arrow" />
            </a>

            <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="link-row">
              <span className="lr-ico">
                <GithubIcon size={15} />
              </span>
              <div>
                <div className="lr-k">GITHUB</div>
                <div className="lr-v">github.com/TonyDak</div>
              </div>
              <Icon name="arrowUpRight" size={14} className="lr-arrow" />
            </a>

            {site.social.linkedin && (
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="link-row">
                <span className="lr-ico">
                  <LinkedinIcon size={14} />
                </span>
                <div>
                  <div className="lr-k">LINKEDIN</div>
                  <div className="lr-v">linkedin.com/in/ducnguyendev</div>
                </div>
                <Icon name="arrowUpRight" size={14} className="lr-arrow" />
              </a>
            )}

            <div className="link-row" style={{ cursor: "default" }}>
              <span className="lr-ico">
                <Icon name="mapPin" size={15} />
              </span>
              <div>
                <div className="lr-k">LOCATION</div>
                <div className="lr-v">{site.location}</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <ContactForm />
          </div>
        </div>
      </section>
    </IdeShell>
  );
}
