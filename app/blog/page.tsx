import { getPosts } from "@/lib/content/posts";
import { IdeShell } from "@/components/ide/IdeShell";
import { BlogListClient } from "./BlogListClient";
import { connection } from "next/server";

export default async function BlogPage() {
  await connection();
  const posts = await getPosts();

  const outline = posts.map((p) => ({
    id: p.slug,
    label: p.title,
    icon: "post" as const,
  }));

  return (
    <IdeShell active="blog" crumb="blog/index.md" outline={outline}>
      <div className="section" style={{ paddingBottom: "48px" }}>
        <div className="page-head">
          <div>
            <div className="comment">
              <span className="idx">01</span>
              <span>blog/index.md — Notes &amp; writeups</span>
            </div>
            <h1 className="page-title">
              Engineering <span className="grad">Notes</span>
            </h1>
            <p className="lede" style={{ margin: "10px 0 0" }}>
              Writing on backend architecture, distributed systems, and shipping web &amp; mobile products.
            </p>
          </div>

        </div>

        <BlogListClient posts={posts} />
      </div>
    </IdeShell>
  );
}
