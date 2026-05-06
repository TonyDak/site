import { getSiteConfig } from "@/lib/site";

export async function Footer() {
    const siteConfig = await getSiteConfig();

    return (
        <footer className="c--footer">
            <div className="u--container c--footer-row">
                <p>
                    {siteConfig.ownerName} · {siteConfig.role} · {siteConfig.location}
                </p>
                <div className="c--footer-links">
                    <a href={siteConfig.social.github} target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                    <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn
                    </a>
                    <a href={`mailto:${siteConfig.email}`}>Email</a>
                </div>
            </div>
        </footer>
    );
}
