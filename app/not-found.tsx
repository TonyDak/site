"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/TransitionLink";

export default function NotFound() {
    const { content } = useLanguage();
    const pageCopy = content.site.pages.notFound;

    return (
        <section className="c--section c--section-alt">
            <div className="u--container">
                <Reveal className="c--card js--reveal-it">
                    <p className="c--eyebrow">{pageCopy.eyebrow}</p>
                    <h1>{pageCopy.title}</h1>
                    <p className="c--hero-subtitle">{pageCopy.subtitle}</p>
                    <div className="c--button-row" style={{ marginTop: "24px" }}>
                        <TransitionLink href="/" className="c--btn c--btn-primary">{pageCopy.primaryLabel}</TransitionLink>
                        <TransitionLink href="/about" className="c--btn c--btn-ghost">{pageCopy.secondaryLabel}</TransitionLink>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
