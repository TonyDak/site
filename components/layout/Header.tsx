"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import { useLanguage } from "@/components/language/LanguageProvider";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const { content } = useLanguage();
    const pathname = usePathname();
    const { site, navigation } = content;
    const navItems = [
        { href: "/", label: navigation.home },
        { href: "/about", label: navigation.about },
        { href: "/contact", label: navigation.contact },
    ];

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <header className={`c--header ${isOpen ? "is-menu-open" : ""}`}>
            <div className="u--container c--header-inner">
                <TransitionLink href="/" className="c--brand c--brand-tony" onClick={() => setIsOpen(false)}>
                    {site.name.endsWith("dev") ? (
                        <>
                            ducnguyen.
                            <span>dev</span>
                        </>
                    ) : (
                        site.name
                    )}
                </TransitionLink>
                
                {/* Desktop Nav */}
                <nav className="c--nav" aria-label="Primary">
                    {navItems.map((item) => (
                        <TransitionLink key={item.href} href={item.href} className={`c--nav-link ${pathname === item.href ? "is-active" : ""}`} aria-current={pathname === item.href ? "page" : undefined}>
                            {item.label}
                        </TransitionLink>
                    ))}
                </nav>

                <div className="c--header-actions">
                    {/* Desktop CV Download */}
                    <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="c--cv-download c--desktop-only">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{navigation.cvLabel}</span>
                    </a>
                    
                    <LanguageToggle />
                    <ThemeToggle />

                    {/* Hamburger Mobile Toggle */}
                    <button 
                        type="button" 
                        className="c--menu-toggle" 
                        aria-label="Toggle menu"
                        aria-expanded={isOpen}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className={`c--hamburger ${isOpen ? "is-active" : ""}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <div className={`c--mobile-menu ${isOpen ? "is-open" : ""}`}>
                <nav className="c--mobile-nav" aria-label="Mobile Navigation">
                    {navItems.map((item) => (
                        <TransitionLink 
                            key={item.href} 
                            href={item.href} 
                            className="c--mobile-nav-link"
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                        </TransitionLink>
                    ))}
                    
                    {/* Mobile CV Download */}
                    <a href="/cv.pdf" download="Nguyen-Huu-Duc-CV.pdf" className="c--cv-download c--mobile-only" onClick={() => setIsOpen(false)}>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18v2h14v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{navigation.cvLabel}</span>
                    </a>
                </nav>
            </div>
        </header>
    );
}
