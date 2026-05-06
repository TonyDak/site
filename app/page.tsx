import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { getSiteConfig } from "@/lib/site";

export default async function Home() {
  const siteConfig = await getSiteConfig();
  const pageCopy = siteConfig.pages.home;

  return (
    <>
      <section className="c--hero">
        <div className="u--container">
          <div className="c--hero-split">
            {/* Left: text content */}
            <Reveal className="js--reveal-it c--hero-content">
              <p className="c--eyebrow">{pageCopy.eyebrow}</p>
              <h1>{pageCopy.heroTitle}</h1>
              <p className="c--hero-subtitle">{pageCopy.heroSubtitle}</p>

              <div className="c--button-row">
                <TransitionLink href="/about" className="c--btn c--btn-primary">
                  {pageCopy.primaryCtaLabel}
                </TransitionLink>
                <TransitionLink href="/contact" className="c--btn c--btn-ghost">
                  {pageCopy.secondaryCtaLabel}
                </TransitionLink>
              </div>
            </Reveal>

            {/* Right: portrait */}
            <Reveal className="js--reveal-it c--hero-portrait-wrap">
              <div className="c--hero-portrait-card">
                <div className="c--hero-portrait-glow" aria-hidden="true" />
                <Image
                  src="/hero-portrait.png"
                  alt="Đức Nguyễn Hữu — Full-stack Developer"
                  width={420}
                  height={420}
                  className="c--hero-portrait-img"
                  priority
                />
                {/* Floating availability badge */}
                {/* <div className="c--hero-avail-badge">
                  <span className="c--hero-avail-dot" />
                  Available for projects
                </div> */}
                {/* Floating stat chip */}
                <div className="c--hero-stat-chip">
                  <strong>1+</strong> yrs exp
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="c--section c--section-cta">
        <div className="u--container">
          <Reveal className="js--reveal-it c--cta-inner">
            <div className="c--cta-stats">
              <div className="c--cta-stat">
                <span className="c--cta-stat-num">5+</span>
                <span className="c--cta-stat-label">Projects shipped</span>
              </div>
              <div className="c--cta-stat">
                <span className="c--cta-stat-num">1+</span>
                <span className="c--cta-stat-label">Years experience</span>
              </div>
            </div>
            <div className="c--cta-text-col">
              <h2>{pageCopy.ctaHeading}</h2>
              <p>{pageCopy.ctaText}</p>
              <TransitionLink href="/contact" className="c--btn c--btn-primary">
                {pageCopy.secondaryCtaLabel}
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
