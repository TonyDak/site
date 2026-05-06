import { Reveal } from "@/components/motion/Reveal";
import { getAboutContent } from "@/lib/content/about";
import { getSiteConfig } from "@/lib/site";

/* ── Inline SVG icons keyed by skill name ─────────────────────────── */
const TECH_ICONS: Record<string, JSX.Element> = {
  "Spring Boot": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#6DB33F" opacity=".15" />
      <path d="M8.5 17c-1.9-1.1-3-3.1-3-5.3 0-3.4 2.8-6.2 6.2-6.2 1.7 0 3.3.7 4.5 1.8" stroke="#6DB33F" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 7.5c1.7 1.1 2.8 3 2.8 5 0 3.4-2.8 6.2-6.2 6.2-1.5 0-3-.6-4.1-1.5" stroke="#6DB33F" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.2" fill="#6DB33F" />
      <circle cx="15" cy="15" r="1.2" fill="#6DB33F" />
    </svg>
  ),
  "ASP.NET Web API": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#512BD4" opacity=".15" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#512BD4">.NET</text>
    </svg>
  ),
  "Next.js": (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.052.54-.052.479 0 .558.019.683.155.03.033 1.353 2.026 2.94 4.428l5.894 8.894.005-.003.042-.027c2.34-1.517 3.917-3.867 4.419-6.685a12.23 12.23 0 0 0 .108-1.748c0-.893-.012-1.088-.108-1.747C21.649 7.535 18.487 3.757 14.2 2.327a11.827 11.827 0 0 0-2.188-.477c-.133-.014-1.528-.03-1.441-.03z" />
    </svg>
  ),
  "React Native": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" fill="#61DAFB" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.4" fill="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke="#61DAFB" strokeWidth="1.4" fill="none" transform="rotate(120 12 12)" />
    </svg>
  ),
  "NestJS": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.131 2.624a2.4 2.4 0 0 0-2.16.002C8.99 4.116 5.75 7.9 5.75 12.5c0 2.254.77 4.326 2.044 5.962.324.41.68.79 1.067 1.132.274.243.626.406.984.406h4.31c.358 0 .71-.163.984-.406a9.877 9.877 0 0 0 1.067-1.132A9.967 9.967 0 0 0 18.25 12.5c0-4.6-3.24-8.384-4.12-9.876z" fill="#E0234E" opacity=".18" />
      <path d="M9 12.5c0-1.8.6-3.45 1.6-4.77M15 12.5c0 1.8-.6 3.45-1.6 4.77" stroke="#E0234E" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12.5" r="2" fill="#E0234E" />
    </svg>
  ),
  "TypeScript": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" opacity=".15" />
      <path d="M4 12h5M6.5 9v6" stroke="#3178C6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 15v-6h5a2 2 0 0 1 0 4h-5" stroke="#3178C6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "PostgreSQL": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="7" rx="7" ry="3.2" stroke="#336791" strokeWidth="1.5" fill="#336791" fillOpacity=".12" />
      <path d="M5 7v5c0 1.77 3.13 3.2 7 3.2s7-1.43 7-3.2V7" stroke="#336791" strokeWidth="1.5" />
      <path d="M5 12v5c0 1.77 3.13 3.2 7 3.2s7-1.43 7-3.2v-5" stroke="#336791" strokeWidth="1.5" />
    </svg>
  ),
  "MongoDB": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3c0 0-5 4.5-5 9.5 0 2.76 2.24 5 5 5s5-2.24 5-5C17 7.5 12 3 12 3z" fill="#47A248" opacity=".15" stroke="#47A248" strokeWidth="1.4" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="#47A248" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  "Redis": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="8" rx="8" ry="3.5" fill="#DC382D" opacity=".15" stroke="#DC382D" strokeWidth="1.4" />
      <path d="M4 8v4c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5V8" stroke="#DC382D" strokeWidth="1.4" />
      <path d="M4 12v4c0 1.93 3.58 3.5 8 3.5s8-1.57 8-3.5v-4" stroke="#DC382D" strokeWidth="1.4" />
    </svg>
  ),
  "AWS": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 14c-2.2-.8-3-2-3-3.5C4 8.57 5.57 7 7.5 7c.17 0 .34.01.5.03A4.5 4.5 0 0 1 16.5 7h.5a3 3 0 0 1 0 6H7z" fill="#FF9900" opacity=".15" stroke="#FF9900" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 19l-2-2 2-2M15 19l2-2-2-2" stroke="#FF9900" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "Docker": (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="11" width="20" height="8" rx="2" fill="#2496ED" opacity=".15" stroke="#2496ED" strokeWidth="1.4" />
      <rect x="4" y="8" width="4" height="3" rx="0.5" stroke="#2496ED" strokeWidth="1.3" />
      <rect x="9" y="8" width="4" height="3" rx="0.5" stroke="#2496ED" strokeWidth="1.3" />
      <rect x="14" y="8" width="4" height="3" rx="0.5" stroke="#2496ED" strokeWidth="1.3" />
      <rect x="9" y="4.5" width="4" height="3" rx="0.5" stroke="#2496ED" strokeWidth="1.3" />
      <path d="M20 13c1-0.5 2.5 0 2.5 1.5" stroke="#2496ED" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity=".12" />
    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default async function AboutPage() {
  const [siteConfig, about] = await Promise.all([getSiteConfig(), getAboutContent()]);
  const pageCopy = siteConfig.pages.about;

  return (
    <section className="c--section">
      <div className="u--container">
        <Reveal className="js--reveal-it">
          <p className="c--eyebrow">{pageCopy.eyebrow}</p>
          <h1>{pageCopy.title}</h1>
          <p className="c--hero-subtitle">{pageCopy.subtitle}</p>
        </Reveal>

        <div className="c--about-grid">
          {/* ── Professional Journey ── */}
          <Reveal className="c--timeline js--reveal-it" delayMs={70}>
            <h2>{pageCopy.timelineHeading}</h2>
            <div className="c--timeline-list">
              {about.timeline.map((item, index) => (
                <article key={`${item.title}-${index}`} className="c--timeline-entry">
                  {/* Left: dot + connector line */}
                  <div className="c--timeline-connector">
                    <div className="c--timeline-dot" />
                    {index < about.timeline.length - 1 && (
                      <div className="c--timeline-line" />
                    )}
                  </div>
                  {/* Right: content */}
                  <div className="c--timeline-body">
                    <span className="c--timeline-label">{item.label}</span>
                    <h3 className="c--timeline-title">{item.title}</h3>
                    <p className="c--timeline-detail">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>

          {/* ── Technical Ecosystem ── */}
          <Reveal className="c--skill-cloud js--reveal-it" delayMs={130}>
            <h2>{pageCopy.skillsHeading}</h2>
            <p className="u--muted" style={{ marginTop: "10px" }}>
              {pageCopy.skillsIntro}
            </p>
            <div className="c--tech-grid">
              {about.skills.map((skill, index) => (
                <div key={`${skill}-${index}`} className="c--tech-card">
                  <span className="c--tech-icon">
                    {TECH_ICONS[skill] ?? DEFAULT_ICON}
                  </span>
                  <span className="c--tech-name">{skill}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
