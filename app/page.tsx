"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { ThreeDepthField } from "@/components/home/ThreeDepthField";
import { HeroDepthCard } from "@/components/home/HeroDepthCard";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/TransitionLink";

function CapabilityIcon({ index }: { index: number }) {
  const common = { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (index === 0) return <svg {...common}><rect x="3" y="4" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h18M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (index === 1) return <svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2.4" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  return <svg {...common}><ellipse cx="12" cy="6.5" rx="6.5" ry="2.8" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 6.5v10c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8v-10M5.5 11.3c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const { content, locale } = useLanguage();
  const { site } = content;
  const pageCopy = site.pages.home;
  const heroTitleLines = locale === "vi"
    ? ["Xây dựng sản phẩm", "web và mobile đáng tin cậy", "từ đầu đến cuối."]
    : ["Building reliable", "web and mobile", "products end to end."];

  return (
    <>
      <ThreeDepthField />
      <section className="c--hero c--home-hero">
        <div className="u--container">
          <div className="c--hero-split">
            <Reveal className="c--hero-content">
              <div className="c--eyebrow">{pageCopy.eyebrow}</div>
              <h1 aria-label={pageCopy.heroTitle}>
                {heroTitleLines.map((line) => <span className="c--hero-title-line" key={line}>{line}</span>)}
              </h1>
              <p className="c--hero-subtitle">{pageCopy.heroSubtitle}</p>
              <div className="c--button-row">
                <TransitionLink href="/about#featured-projects" className="c--btn c--btn-primary">
                  {pageCopy.primaryCtaLabel}
                  <ArrowIcon />
                </TransitionLink>
                <TransitionLink href="/contact" className="c--btn c--btn-ghost">{pageCopy.secondaryCtaLabel}</TransitionLink>
              </div>
            </Reveal>

            <Reveal className="c--hero-portrait-wrap" delayMs={80}>
              <HeroDepthCard ownerName={site.ownerName} role={site.role} />
            </Reveal>
          </div>

          <div className="c--scroll-cue" aria-hidden="true"><span />Scroll</div>

          <Reveal className="c--capability-strip" delayMs={150}>
            {pageCopy.capabilities.map((label, index) => (
              <div className="c--capability" key={label}>
                <span className="c--capability-index">0{index + 1}</span>
                <span className="c--capability-icon"><CapabilityIcon index={index} /></span>
                <span>{label}</span>
                <span className="c--capability-arrow"><ArrowIcon /></span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="c--section c--section-cta">
        <div className="u--container">
          <Reveal className="c--cta-inner">
            <div className="c--cta-text-col">
              <h2>{pageCopy.ctaHeading}</h2>
            </div>
            <div className="c--cta-copy-col">
              <p>{pageCopy.ctaText}</p>
              <TransitionLink href="/contact" className="c--btn c--btn-primary">
                {pageCopy.secondaryCtaLabel}
                <ArrowIcon />
              </TransitionLink>
            </div>
            <div className="c--cta-stats">
              <div className="c--cta-stat"><span className="c--cta-stat-num">3</span><span className="c--cta-stat-label">{pageCopy.featuredSystemsLabel}</span></div>
              <div className="c--cta-stat"><span className="c--cta-stat-num">1+</span><span className="c--cta-stat-label">{pageCopy.yearsExperienceLabel}</span></div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
