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
                            {site.name.slice(0, -3)}
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
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
