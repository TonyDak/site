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
          <Reveal className="js--reveal-it">
            <p className="c--eyebrow">{pageCopy.eyebrow}</p>
            <h1>{pageCopy.heroTitle}</h1>
            <p className="c--hero-subtitle">
              {pageCopy.heroSubtitle}
            </p>
            <div className="c--button-row">
              <TransitionLink href="/about" className="c--btn c--btn-primary">
                {pageCopy.primaryCtaLabel}
              </TransitionLink>
              <TransitionLink href="/contact" className="c--btn c--btn-ghost">
                {pageCopy.secondaryCtaLabel}
              </TransitionLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="c--section c--section-cta">
        <div className="u--container">
          <Reveal className="js--reveal-it">
            <h2>{pageCopy.ctaHeading}</h2>
            <p>{pageCopy.ctaText}</p>
            <TransitionLink href="/contact" className="c--btn c--btn-primary">
              {pageCopy.secondaryCtaLabel}
            </TransitionLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
