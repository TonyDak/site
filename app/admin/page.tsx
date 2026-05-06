import { AdminPanel } from "./AdminPanel";
import { getAboutContent } from "@/lib/content/about";
import { getPosts } from "@/lib/content/posts";
import { getProjects } from "@/lib/content/projects";
import { getSiteConfig } from "@/lib/site";

export default async function AdminPage() {
    const [siteConfig, about, projects, posts] = await Promise.all([
        getSiteConfig(),
        getAboutContent(),
        getProjects(),
        getPosts(),
    ]);

    return (
        <section className="c--section">
            <div className="u--container">
                <AdminPanel siteConfig={siteConfig} about={about} projects={projects} posts={posts} />
            </div>
        </section>
    );
}
