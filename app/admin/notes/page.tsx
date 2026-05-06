import { getPosts } from "@/lib/content/posts";
import { NotesStudio } from "./NotesStudio";

export default async function AdminNotesPage() {
    const posts = await getPosts();

    return (
        <section className="c--section">
            <div className="u--container">
                <NotesStudio posts={posts} />
            </div>
        </section>
    );
}
