import { getSiteConfig } from "@/lib/site";
import { LoginForm } from "../LoginForm";

export default async function AdminLoginPage() {
    const siteConfig = await getSiteConfig();
    const pageCopy = siteConfig.pages.adminLogin;

    return (
        <section className="c--section c--section-alt">
            <div className="u--container">
                <div className="c--card c--admin-login">
                    <p className="c--eyebrow">{pageCopy.eyebrow}</p>
                    <h1>{pageCopy.title}</h1>
                    <p className="u--muted">{pageCopy.subtitle}</p>
                    <LoginForm />
                </div>
            </div>
        </section>
    );
}
