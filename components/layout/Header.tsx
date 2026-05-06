import { TransitionLink } from "@/components/motion/TransitionLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSiteConfig } from "@/lib/site";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export async function Header() {
    const siteConfig = await getSiteConfig();

    return (
        <header className="c--header">
            <div className="u--container c--header-inner">
                <TransitionLink href="/" className="c--brand c--brand-tony">
                    {siteConfig.name.endsWith("dev") ? (
                        <>
                            {siteConfig.name.slice(0, -3)}
                            <span>dev</span>
                        </>
                    ) : (
                        siteConfig.name
                    )}
                </TransitionLink>
                <nav className="c--nav" aria-label="Primary">
                    {navItems.map((item) => (
                        <TransitionLink key={item.href} href={item.href} className="c--nav-link">
                            {item.label}
                        </TransitionLink>
                    ))}
                </nav>
                <ThemeToggle />
            </div>
        </header>
    );
}
