import { Reveal } from "@/components/motion/Reveal";
import { getAboutContent } from "@/lib/content/about";
import { getSiteConfig } from "@/lib/site";

export default async function AboutPage() {
    const [siteConfig, about] = await Promise.all([getSiteConfig(), getAboutContent()]);
    const pageCopy = siteConfig.pages.about;

    return (
        <section className="c--section">
            <div className="u--container">
                <Reveal className="js--reveal-it">
                    <p className="c--eyebrow">{pageCopy.eyebrow}</p>
                    <h1>{pageCopy.title}</h1>
                    <p className="c--hero-subtitle">
                        {pageCopy.subtitle}
                    </p>
                </Reveal>

                <div className="c--about-grid">
                    <Reveal className="c--timeline js--reveal-it" delayMs={70}>
                        <h2>{pageCopy.timelineHeading}</h2>
                        <div style={{ marginTop: "16px" }}>
                            {about.timeline.map((item, index) => (
                                <article key={`${item.title}-${index}`} className="c--timeline-item">
                                    <p className="c--tag">{item.label}</p>
                                    <h3>{item.title}</h3>
                                    <p className="u--muted">{item.detail}</p>
                                </article>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal className="c--skill-cloud js--reveal-it" delayMs={130}>
                        <h2>{pageCopy.skillsHeading}</h2>
                        <p className="u--muted" style={{ marginTop: "10px" }}>
                            {pageCopy.skillsIntro}
                        </p>
                        <div className="c--chip-list">
                            {about.skills.map((skill, index) => (
                                <span key={`${skill}-${index}`} className="c--chip">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
