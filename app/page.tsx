"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/TransitionLink";

function CapabilityIcon({ index }: { index: number }) {
  const common = { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (index === 0) return <svg {...common}><rect x="3" y="4" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h18M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  if (index === 1) return <svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2.4" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  return <svg {...common}><ellipse cx="12" cy="6.5" rx="6.5" ry="2.8" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 6.5v10c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8v-10M5.5 11.3c0 1.55 2.9 2.8 6.5 2.8s6.5-1.25 6.5-2.8" stroke="currentColor" strokeWidth="1.5"/></svg>;
}

export default function Home() {
  const { content } = useLanguage();
  const { site } = content;
  const pageCopy = site.pages.home;

  return (
    <>
      <section className="c--hero c--home-hero">
        <div className="u--container">
          <div className="c--hero-split">
            <Reveal className="js--reveal-it c--hero-content">
              <p className="c--eyebrow">{pageCopy.eyebrow}</p>
              <h1>{pageCopy.heroTitle}</h1>
              <p className="c--hero-subtitle">{pageCopy.heroSubtitle}</p>
              <div className="c--button-row">
                <TransitionLink href="/about#featured-projects" className="c--btn c--btn-primary">{pageCopy.primaryCtaLabel}</TransitionLink>
                <TransitionLink href="/contact" className="c--btn c--btn-ghost">{pageCopy.secondaryCtaLabel}</TransitionLink>
              </div>
            </Reveal>

            <Reveal className="js--reveal-it c--hero-portrait-wrap" delayMs={80}>
              <div className="c--hero-portrait-card">
                <div className="c--hero-portrait-glow" aria-hidden="true" />
                <Image src="/hero-portrait.png" alt={`${site.ownerName} — ${site.role}`} width={420} height={420} className="c--hero-portrait-img" priority />
                <div className="c--hero-stat-chip"><strong>1+</strong> {pageCopy.yearsExperienceLabel}</div>
              </div>
            </Reveal>
          </div>

          <Reveal className="c--capability-strip js--reveal-it" delayMs={150}>
            {pageCopy.capabilities.map((label, index) => (
              <div className="c--capability" key={label}>
                <span className="c--capability-icon"><CapabilityIcon index={index} /></span>
                <span>{label}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="c--section c--section-cta">
        <div className="u--container">
          <Reveal className="js--reveal-it c--cta-inner">
            <div className="c--cta-stats">
              <div className="c--cta-stat"><span className="c--cta-stat-num">3</span><span className="c--cta-stat-label">{pageCopy.featuredSystemsLabel}</span></div>
              <div className="c--cta-stat"><span className="c--cta-stat-num">1+</span><span className="c--cta-stat-label">{pageCopy.yearsExperienceLabel}</span></div>
            </div>
            <div className="c--cta-text-col">
              <h2>{pageCopy.ctaHeading}</h2>
              <p>{pageCopy.ctaText}</p>
              <TransitionLink href="/about#featured-projects" className="c--btn c--btn-primary">{pageCopy.primaryCtaLabel}</TransitionLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
