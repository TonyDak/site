import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";
import { getSiteConfig } from "@/lib/site";

export const metadata: Metadata = {
    title: "Contact | Tony Portfolio",
    description: "Get in touch about product design, frontend implementation, and launch support.",
};

export default async function ContactPage() {
    const siteConfig = await getSiteConfig();
    const pageCopy = siteConfig.pages.contact;

    return (
        <section className="c--section">
            <div className="u--container">
                <Reveal className="js--reveal-it">
                    <p className="c--eyebrow">{pageCopy.eyebrow}</p>
                    <h1>{pageCopy.title}</h1>
                    <p className="c--hero-subtitle">
                        {pageCopy.subtitle}
                    </p>
                    <div className="c--chip-list" style={{ marginTop: "16px" }}>
                        <span className="c--chip">{siteConfig.email}</span>
                        <span className="c--chip">{siteConfig.social.github}</span>
                        <span className="c--chip">{siteConfig.social.linkedin}</span>
                    </div>
                    <ContactForm />
                </Reveal>
            </div>
        </section>
    );
}
