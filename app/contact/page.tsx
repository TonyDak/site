"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ContactIcon({ type }: { type: "phone" | "email" | "github" | "linkedin" }) {
  if (type === "phone") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.3 3.8 9.8 7l-1.7 2.3c1.1 2.4 3.1 4.4 5.5 5.5l2.3-1.7 3.2 2.5-1.2 3.3c-.2.6-.8 1-1.5.9C9.2 19 5 14.8 4.1 7.6c-.1-.7.3-1.3.9-1.5l2.3-.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === "email") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" /></svg>;
  if (type === "linkedin") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.55 9.55 0 0 1 12 6.84a9.6 9.6 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>;
}

export default function ContactPage() {
  const { content } = useLanguage();
  const site = content.site;
  const pageCopy = site.pages.contact;
  const links = [
    { type: "phone" as const, href: `tel:${site.phone}`, label: site.phone },
    { type: "email" as const, href: `mailto:${site.email}`, label: site.email },
    { type: "github" as const, href: site.social.github, label: "GitHub" },
    ...(site.social.linkedin ? [{ type: "linkedin" as const, href: site.social.linkedin, label: "LinkedIn" }] : []),
  ];

  return (
    <section className="c--editorial-page c--contact-page">
      <div className="u--container c--contact-editorial-grid">
        <Reveal className="c--contact-editorial-left">
          <p className="c--editorial-label">{pageCopy.eyebrow}</p>
          <h1>{pageCopy.title}</h1>
          <p className="c--editorial-lead">{pageCopy.subtitle}</p>
          <div className="c--contact-editorial-links">
            {links.map((link) => (
              <a href={link.href} key={link.type} target={link.type === "github" || link.type === "linkedin" ? "_blank" : undefined} rel={link.type === "github" || link.type === "linkedin" ? "noreferrer" : undefined}>
                <span className="c--contact-row-icon"><ContactIcon type={link.type} /></span>
                <span>{link.label}</span>
                <span className="c--contact-row-arrow"><ArrowIcon /></span>
              </a>
            ))}
          </div>
          <div className="c--contact-identity">
            <div className="c--contact-identity-image"><Image src="/avatar-lowpoly-v2.jpg" alt={`${site.ownerName} — ${site.role}`} width={360} height={360} priority /></div>
            <div>
              <h2>{site.ownerName}</h2>
              <p>{site.role}</p>
              <span>{site.location}</span>
            </div>
          </div>
        </Reveal>
        <Reveal className="c--contact-editorial-form"><ContactForm /></Reveal>
      </div>
    </section>
  );
}
