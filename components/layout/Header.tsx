"use client";

import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/components/language/LanguageProvider";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
    const { content } = useLanguage();
    const { site, navigation } = content;
    const navItems = [
        { href: "/", label: navigation.home },
        { href: "/about", label: navigation.about },
        { href: "/contact", label: navigation.contact },
    ];

    return (
        <header className="c--header">
            <div className="u--container c--header-inner">
                <TransitionLink href="/" className="c--brand c--brand-tony">
                    {site.name.endsWith("dev") ? (
                        <>
                            ducnguyen.
                            <span>dev</span>
                        </>
                    ) : (
                        site.name
                    )}
                </TransitionLink>
                <nav className="c--nav" aria-label="Primary">
                    {navItems.map((item) => (
                        <TransitionLink key={item.href} href={item.href} className="c--nav-link">
                            {item.label}
                        </TransitionLink>
                    ))}
                </nav>
                <div className="c--header-actions">
                    <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="c--cv-download"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{navigation.cvLabel}</span></a>
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
