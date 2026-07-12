"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";

export default function ContactPage() {
    const { content } = useLanguage();
    const siteConfig = content.site;
    const pageCopy = siteConfig.pages.contact;

    return (
        <section className="c--section">
            <div className="u--container">
                <div className="c--contact-split">
                    {/* ── Left: header + form ── */}
                    <Reveal className="js--reveal-it c--contact-left">
                        <p className="c--eyebrow">{pageCopy.eyebrow}</p>
                        <h1>{pageCopy.title}</h1>
                        <p className="c--hero-subtitle">{pageCopy.subtitle}</p>

                        <div className="c--contact-links">
                            <a href={`tel:${siteConfig.phone}`} className="c--contact-link-item">
                                <span className="c--contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <path d="M7.3 3.8 9.8 7l-1.7 2.3c1.1 2.4 3.1 4.4 5.5 5.5l2.3-1.7 3.2 2.5-1.2 3.3c-.2.6-.8 1-1.5.9C9.2 19 5 14.8 4.1 7.6c-.1-.7.3-1.3.9-1.5l2.3-.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <span className="c--contact-link-text">{siteConfig.phone}</span>
                            </a>
                            <a href={`mailto:${siteConfig.email}`} className="c--contact-link-item">
                                {/* Email icon */}
                                <span className="c--contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                                <span className="c--contact-link-text">{siteConfig.email}</span>
                            </a>
                            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="c--contact-link-item">
                                {/* GitHub icon */}
                                <span className="c--contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                                    </svg>
                                </span>
                                <span className="c--contact-link-text">{siteConfig.social.github}</span>
                            </a>
                            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="c--contact-link-item" hidden={!siteConfig.social.linkedin}>
                                {/* LinkedIn icon */}
                                <span className="c--contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </span>
                                <span className="c--contact-link-text">{siteConfig.social.linkedin}</span>
                            </a>
                        </div>

                        <ContactForm />
                    </Reveal>

                    {/* ── Right: avatar ── */}
                    <Reveal className="js--reveal-it c--contact-avatar-col" delayMs={120}>
                        <div className="c--contact-avatar-card">
                            <div className="c--contact-avatar-glow" aria-hidden="true" />
                            <div className="c--contact-avatar-img-wrap">
                                <Image
                                    src="/avatar.jpg"
                                    alt={`${siteConfig.ownerName} — ${siteConfig.role}`}
                                    width={400}
                                    height={500}
                                    className="c--contact-avatar-img"
                                    priority
                                />
                            </div>
                            <div className="c--contact-avatar-info">
                                <p className="c--contact-avatar-name">{siteConfig.ownerName}</p>
                                <p className="c--contact-avatar-role">{siteConfig.role}</p>
                                <p className="c--contact-avatar-loc" hidden={!siteConfig.location}>
                                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: 14, height: 14 }}>
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5"/>
                                        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    {siteConfig.location}
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
