"use client";

import { useLanguage } from "@/components/language/LanguageProvider";

export function Footer() {
    const { content } = useLanguage();
    const { site } = content;

    return (
        <footer className="c--footer">
            <div className="u--container c--footer-row">
                <p>
                    {site.ownerName} · {site.role}
                    {site.location ? ` · ${site.location}` : ""}
                </p>
                <div className="c--footer-links">
                    <a href={site.social.github} target="_blank" rel="noreferrer">GitHub</a>
                    {site.social.linkedin ? (
                        <a href={site.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                    ) : null}
                    <a href={`mailto:${site.email}`}>Email</a>
                </div>
            </div>
        </footer>
    );
}
