"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutContent } from "@/lib/content/about";
import type { Project } from "@/lib/content/projects";
import type { Post } from "@/lib/content/posts";
import type { SiteConfig } from "@/lib/site";
import { mergeSiteConfig, fromProjectDraft, toProjectDraft, type ProjectDraft } from "@/lib/admin/editor-utils";
import { useAdminUiStore } from "@/lib/admin/use-admin-ui-store";

type Props = {
    siteConfig: SiteConfig;
    about: AboutContent;
    projects: Project[];
    posts: Post[];
};

async function saveJson<T>(url: string, payload: T) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
        throw new Error(data?.error ?? "Save failed");
    }
}

function createEmptyProject(): ProjectDraft {
    return {
        ...toProjectDraft({
            slug: "new-project",
            title: "New Project",
            summary: "Short summary for the case study.",
            category: "Category",
            stack: ["Next.js", "TypeScript"],
            outcome: "Expected outcome.",
            role: "Role",
            duration: "4 weeks",
            challenge: "Describe the problem.",
            approach: ["Describe the approach."],
            results: ["Describe the results."],
        }),
    };
}

function joinLines(value: string[]) {
    return value.join("\n");
}

function splitLines(value: string) {
    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function AdminPanel({ siteConfig, about, projects, posts }: Props) {
    const router = useRouter();
    const section = useAdminUiStore((state) => state.section);
    const setSection = useAdminUiStore((state) => state.setSection);
    const [siteForm, setSiteForm] = useState(siteConfig);
    const [aboutForm, setAboutForm] = useState(() => ({
        timeline: about.timeline,
        skillsText: joinLines(about.skills),
        recentWriting: about.recentWriting,
    }));
    const [projectsDraft, setProjectsDraft] = useState<ProjectDraft[]>(() => projects.map(toProjectDraft));
    const [siteStatus, setSiteStatus] = useState("");
    const [aboutStatus, setAboutStatus] = useState("");
    const [projectsStatus, setProjectsStatus] = useState("");

    const sitePreview = useMemo(
        () => `${siteForm.ownerName} · ${siteForm.role} · ${siteForm.location}`,
        [siteForm]
    );

    function updateProject(index: number, patch: Partial<ProjectDraft>) {
        setProjectsDraft((current) =>
            current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item))
        );
    }

    function addProject() {
        setProjectsDraft((current) => [...current, createEmptyProject()]);
        setSection("projects");
    }

    function removeProject(index: number) {
        setProjectsDraft((current) => current.filter((_, currentIndex) => currentIndex !== index));
    }

    return (
        <div className="c--admin-stack">
            <section className="c--card">
                <p className="c--eyebrow">Admin</p>
                <h1>Portfolio Content Studio</h1>
                <p className="u--muted">Edit the public portfolio without touching code.</p>
                <div className="c--button-row" style={{ marginTop: "16px" }}>
                    <button
                        type="button"
                        className="c--btn c--btn-ghost"
                        onClick={async () => {
                            await fetch("/api/admin/logout", { method: "POST" });
                            router.replace("/admin/login");
                        }}
                    >
                        Logout
                    </button>
                    <button type="button" className="c--btn c--btn-ghost" onClick={() => router.refresh()}>
                        Refresh data
                    </button>
                    <button type="button" className="c--btn c--btn-primary" onClick={() => setSection("notes")}>
                        Open note studio
                    </button>
                </div>
            </section>

            <section className="c--card">
                <div className="c--admin-tabs" role="tablist" aria-label="Admin sections">
                    {[
                        ["site", "Site settings"],
                        ["about", "About"],
                        ["projects", "Projects"],
                        ["notes", "Notes"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            className={`c--admin-tab${section === value ? " is-active" : ""}`}
                            onClick={() => setSection(value as "site" | "about" | "projects" | "notes")}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {section === "site" ? (
                <section className="c--card c--admin-full">
                    <h2>Site Settings</h2>
                    <p className="u--muted">Brand, owner, role, and social links.</p>
                    <form
                        className="c--admin-form"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            setSiteStatus("");
                            try {
                                await saveJson("/api/admin/site", siteForm);
                                setSiteStatus("Saved successfully.");
                                router.refresh();
                            } catch (error) {
                                setSiteStatus(error instanceof Error ? error.message : "Save failed");
                            }
                        }}
                    >
                        <div className="c--admin-two-col">
                            <label className="c--field">
                                Name
                                <input
                                    value={siteForm.name}
                                    onChange={(event) => setSiteForm((current) => ({ ...current, name: event.target.value }))}
                                />
                            </label>
                            <label className="c--field">
                                Owner name
                                <input
                                    value={siteForm.ownerName}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({ ...current, ownerName: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="c--field">
                                Role
                                <input
                                    value={siteForm.role}
                                    onChange={(event) => setSiteForm((current) => ({ ...current, role: event.target.value }))}
                                />
                            </label>
                            <label className="c--field">
                                Location
                                <input
                                    value={siteForm.location}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({ ...current, location: event.target.value }))
                                    }
                                />
                            </label>
                        </div>

                        <label className="c--field">
                            Description
                            <textarea
                                className="c--admin-textarea c--admin-textarea-sm"
                                value={siteForm.description}
                                onChange={(event) =>
                                    setSiteForm((current) => ({ ...current, description: event.target.value }))
                                }
                                rows={3}
                            />
                        </label>

                        <div className="c--admin-two-col">
                            <label className="c--field">
                                Email
                                <input
                                    value={siteForm.email}
                                    onChange={(event) => setSiteForm((current) => ({ ...current, email: event.target.value }))}
                                />
                            </label>
                            <label className="c--field">
                                GitHub
                                <input
                                    value={siteForm.social.github}
                                    onChange={(event) =>
                                        setSiteForm((current) =>
                                            mergeSiteConfig(current, { social: { github: event.target.value } })
                                        )
                                    }
                                />
                            </label>
                            <label className="c--field">
                                LinkedIn
                                <input
                                    value={siteForm.social.linkedin}
                                    onChange={(event) =>
                                        setSiteForm((current) =>
                                            mergeSiteConfig(current, { social: { linkedin: event.target.value } })
                                        )
                                    }
                                />
                            </label>
                        </div>

                        <hr style={{ margin: "24px 0", border: "0", borderTop: "1px solid var(--border)" }} />
                        <h3>Home Page Content</h3>

                        <div className="c--admin-two-col">
                            <label className="c--field">
                                Hero Eyebrow
                                <input
                                    value={siteForm.pages.home.eyebrow}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, eyebrow: event.target.value },
                                            },
                                        }))
                                    }
                                />
                            </label>
                            <label className="c--field">
                                Featured Heading
                                <input
                                    value={siteForm.pages.home.featuredHeading}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, featuredHeading: event.target.value },
                                            },
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <label className="c--field">
                            Hero Title
                            <input
                                value={siteForm.pages.home.heroTitle}
                                onChange={(event) =>
                                    setSiteForm((current) => ({
                                        ...current,
                                        pages: {
                                            ...current.pages,
                                            home: { ...current.pages.home, heroTitle: event.target.value },
                                        },
                                    }))
                                }
                            />
                        </label>

                        <label className="c--field">
                            Hero Subtitle
                            <textarea
                                className="c--admin-textarea c--admin-textarea-sm"
                                value={siteForm.pages.home.heroSubtitle}
                                onChange={(event) =>
                                    setSiteForm((current) => ({
                                        ...current,
                                        pages: {
                                            ...current.pages,
                                            home: { ...current.pages.home, heroSubtitle: event.target.value },
                                        },
                                    }))
                                }
                                rows={2}
                            />
                        </label>

                        <div className="c--admin-two-col">
                            <label className="c--field">
                                CTA Heading
                                <input
                                    value={siteForm.pages.home.ctaHeading}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, ctaHeading: event.target.value },
                                            },
                                        }))
                                    }
                                />
                            </label>
                            <label className="c--field">
                                CTA Text
                                <textarea
                                    className="c--admin-textarea c--admin-textarea-sm"
                                    value={siteForm.pages.home.ctaText}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, ctaText: event.target.value },
                                            },
                                        }))
                                    }
                                    rows={2}
                                />
                            </label>
                        </div>

                        <div className="c--admin-two-col">
                            <label className="c--field">
                                Primary CTA Label
                                <input
                                    value={siteForm.pages.home.primaryCtaLabel}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, primaryCtaLabel: event.target.value },
                                            },
                                        }))
                                    }
                                />
                            </label>
                            <label className="c--field">
                                Secondary CTA Label
                                <input
                                    value={siteForm.pages.home.secondaryCtaLabel}
                                    onChange={(event) =>
                                        setSiteForm((current) => ({
                                            ...current,
                                            pages: {
                                                ...current.pages,
                                                home: { ...current.pages.home, secondaryCtaLabel: event.target.value },
                                            },
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <button className="c--btn c--btn-primary" type="submit">
                            Save site settings
                        </button>
                        <p className="c--status-msg u--muted">{siteStatus || sitePreview}</p>
                    </form>
                </section>
            ) : null}

            {section === "about" ? (
                <section className="c--card c--admin-full">
                    <div className="c--admin-headline-row">
                        <div>
                            <h2>About content</h2>
                            <p className="u--muted">Dedicated About collection: timeline, skills, and recent writing.</p>
                        </div>
                    </div>

                    <div className="c--admin-cards">
                        {aboutForm.timeline.map((item, index) => (
                            <article key={`${item.title}-${index}`} className="c--admin-editor-card">
                                <div className="c--admin-editor-card__top">
                                    <h3>{item.title || `Timeline ${index + 1}`}</h3>
                                    <button
                                        type="button"
                                        className="c--btn c--btn-ghost"
                                        onClick={() =>
                                            setAboutForm((current) => ({
                                                ...current,
                                                timeline: current.timeline.filter((_, currentIndex) => currentIndex !== index),
                                            }))
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className="c--admin-two-col">
                                    <label className="c--field">
                                        Label
                                        <input
                                            value={item.label}
                                            onChange={(event) =>
                                                setAboutForm((current) => ({
                                                    ...current,
                                                    timeline: current.timeline.map((value, currentIndex) =>
                                                        currentIndex === index ? { ...value, label: event.target.value } : value
                                                    ),
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="c--field">
                                        Title
                                        <input
                                            value={item.title}
                                            onChange={(event) =>
                                                setAboutForm((current) => ({
                                                    ...current,
                                                    timeline: current.timeline.map((value, currentIndex) =>
                                                        currentIndex === index ? { ...value, title: event.target.value } : value
                                                    ),
                                                }))
                                            }
                                        />
                                    </label>
                                </div>
                                <label className="c--field">
                                    Detail
                                    <textarea
                                        className="c--admin-textarea c--admin-textarea-sm"
                                        value={item.detail}
                                        onChange={(event) =>
                                            setAboutForm((current) => ({
                                                ...current,
                                                timeline: current.timeline.map((value, currentIndex) =>
                                                    currentIndex === index ? { ...value, detail: event.target.value } : value
                                                ),
                                            }))
                                        }
                                        rows={3}
                                    />
                                </label>
                            </article>
                        ))}
                    </div>

                    <div className="c--button-row" style={{ marginTop: "16px" }}>
                        <button
                            type="button"
                            className="c--btn c--btn-ghost"
                            onClick={() =>
                                setAboutForm((current) => ({
                                    ...current,
                                    timeline: [...current.timeline, { label: "Now", title: "New milestone", detail: "Add detail" }],
                                }))
                            }
                        >
                            Add timeline item
                        </button>
                    </div>

                    <label className="c--field" style={{ marginTop: "16px" }}>
                        Skills (one per line)
                        <textarea
                            className="c--admin-textarea c--admin-textarea-sm"
                            value={aboutForm.skillsText}
                            onChange={(event) => setAboutForm((current) => ({ ...current, skillsText: event.target.value }))}
                            rows={6}
                        />
                    </label>

                    <div className="c--admin-cards" style={{ marginTop: "16px" }}>
                        {aboutForm.recentWriting.map((item, index) => (
                            <article key={`${item.title}-${index}`} className="c--admin-editor-card">
                                <div className="c--admin-editor-card__top">
                                    <h3>{item.title || `Recent writing ${index + 1}`}</h3>
                                    <button
                                        type="button"
                                        className="c--btn c--btn-ghost"
                                        onClick={() =>
                                            setAboutForm((current) => ({
                                                ...current,
                                                recentWriting: current.recentWriting.filter((_, currentIndex) => currentIndex !== index),
                                            }))
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                                <div className="c--admin-two-col">
                                    <label className="c--field">
                                        Title
                                        <input
                                            value={item.title}
                                            onChange={(event) =>
                                                setAboutForm((current) => ({
                                                    ...current,
                                                    recentWriting: current.recentWriting.map((value, currentIndex) =>
                                                        currentIndex === index ? { ...value, title: event.target.value } : value
                                                    ),
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="c--field">
                                        Read time
                                        <input
                                            value={item.readTime}
                                            onChange={(event) =>
                                                setAboutForm((current) => ({
                                                    ...current,
                                                    recentWriting: current.recentWriting.map((value, currentIndex) =>
                                                        currentIndex === index ? { ...value, readTime: event.target.value } : value
                                                    ),
                                                }))
                                            }
                                        />
                                    </label>
                                </div>
                                <label className="c--field">
                                    Excerpt
                                    <textarea
                                        className="c--admin-textarea c--admin-textarea-sm"
                                        value={item.excerpt}
                                        onChange={(event) =>
                                            setAboutForm((current) => ({
                                                ...current,
                                                recentWriting: current.recentWriting.map((value, currentIndex) =>
                                                    currentIndex === index ? { ...value, excerpt: event.target.value } : value
                                                ),
                                            }))
                                        }
                                        rows={3}
                                    />
                                </label>
                            </article>
                        ))}
                    </div>

                    <div className="c--button-row" style={{ marginTop: "16px" }}>
                        <button
                            type="button"
                            className="c--btn c--btn-ghost"
                            onClick={() =>
                                setAboutForm((current) => ({
                                    ...current,
                                    recentWriting: [
                                        ...current.recentWriting,
                                        { title: "New article", excerpt: "Add excerpt", readTime: "5 min" },
                                    ],
                                }))
                            }
                        >
                            Add recent writing item
                        </button>
                    </div>

                    <div className="c--button-row" style={{ marginTop: "24px" }}>
                        <button
                            type="button"
                            className="c--btn c--btn-primary"
                            onClick={async () => {
                                setAboutStatus("");
                                try {
                                    await saveJson("/api/admin/about", {
                                        timeline: aboutForm.timeline,
                                        skills: splitLines(aboutForm.skillsText),
                                        recentWriting: aboutForm.recentWriting,
                                    });
                                    setAboutStatus("Saved successfully.");
                                    router.refresh();
                                } catch (error) {
                                    setAboutStatus(error instanceof Error ? error.message : "Save failed");
                                }
                            }}
                        >
                            Save about content
                        </button>
                        <p className="c--status-msg u--muted">{aboutStatus}</p>
                    </div>
                </section>
            ) : null}

            {section === "projects" ? (
                <section className="c--card c--admin-full">
                    <div className="c--admin-headline-row">
                        <div>
                            <h2>Projects</h2>
                            <p className="u--muted">Field-based editor for case studies. No JSON textarea.</p>
                        </div>
                        <button type="button" className="c--btn c--btn-ghost" onClick={addProject}>
                            Add project
                        </button>
                    </div>

                    <div className="c--admin-cards">
                        {projectsDraft.map((project, index) => (
                            <article key={`${project.slug}-${index}`} className="c--admin-editor-card">
                                <div className="c--admin-editor-card__top">
                                    <h3>{project.title || `Project ${index + 1}`}</h3>
                                    <button type="button" className="c--btn c--btn-ghost" onClick={() => removeProject(index)}>
                                        Delete
                                    </button>
                                </div>

                                <div className="c--admin-two-col">
                                    <label className="c--field">
                                        Slug
                                        <input value={project.slug} onChange={(event) => updateProject(index, { slug: event.target.value })} />
                                    </label>
                                    <label className="c--field">
                                        Category
                                        <input value={project.category} onChange={(event) => updateProject(index, { category: event.target.value })} />
                                    </label>
                                    <label className="c--field">
                                        Title
                                        <input value={project.title} onChange={(event) => updateProject(index, { title: event.target.value })} />
                                    </label>
                                    <label className="c--field">
                                        Role
                                        <input value={project.role} onChange={(event) => updateProject(index, { role: event.target.value })} />
                                    </label>
                                    <label className="c--field">
                                        Duration
                                        <input value={project.duration} onChange={(event) => updateProject(index, { duration: event.target.value })} />
                                    </label>
                                    <label className="c--field">
                                        Outcome
                                        <input value={project.outcome} onChange={(event) => updateProject(index, { outcome: event.target.value })} />
                                    </label>
                                </div>

                                <label className="c--field">
                                    Summary
                                    <textarea
                                        className="c--admin-textarea c--admin-textarea-sm"
                                        value={project.summary}
                                        onChange={(event) => updateProject(index, { summary: event.target.value })}
                                        rows={3}
                                    />
                                </label>

                                <label className="c--field">
                                    Challenge
                                    <textarea
                                        className="c--admin-textarea c--admin-textarea-sm"
                                        value={project.challenge}
                                        onChange={(event) => updateProject(index, { challenge: event.target.value })}
                                        rows={3}
                                    />
                                </label>

                                <div className="c--admin-two-col">
                                    <label className="c--field">
                                        Stack (one per line)
                                        <textarea
                                            className="c--admin-textarea c--admin-textarea-sm"
                                            value={project.stackText}
                                            onChange={(event) => updateProject(index, { stackText: event.target.value })}
                                            rows={4}
                                        />
                                    </label>
                                    <label className="c--field">
                                        Approach (one per line)
                                        <textarea
                                            className="c--admin-textarea c--admin-textarea-sm"
                                            value={project.approachText}
                                            onChange={(event) => updateProject(index, { approachText: event.target.value })}
                                            rows={4}
                                        />
                                    </label>
                                </div>

                                <label className="c--field">
                                    Results (one per line)
                                    <textarea
                                        className="c--admin-textarea c--admin-textarea-sm"
                                        value={project.resultsText}
                                        onChange={(event) => updateProject(index, { resultsText: event.target.value })}
                                        rows={4}
                                    />
                                </label>
                            </article>
                        ))}
                    </div>

                    <div className="c--button-row" style={{ marginTop: "24px" }}>
                        <button
                            type="button"
                            className="c--btn c--btn-primary"
                            onClick={async () => {
                                try {
                                    const payload = projectsDraft.map(fromProjectDraft);
                                    await saveJson("/api/admin/projects", payload);
                                    setProjectsStatus("Saved successfully.");
                                    router.refresh();
                                } catch (error) {
                                    setProjectsStatus(error instanceof Error ? error.message : "Save failed");
                                }
                            }}
                        >
                            Save projects
                        </button>
                        <p className="c--status-msg u--muted">{projectsStatus}</p>
                    </div>
                </section>
            ) : null}

            {section === "notes" ? (
                <section className="c--card c--admin-full">
                    <div className="c--admin-headline-row">
                        <div>
                            <h2>Notes</h2>
                            <p className="u--muted">Open the dedicated note studio to write and edit posts in a friendly form.</p>
                        </div>
                        <button type="button" className="c--btn c--btn-primary" onClick={() => router.push("/admin/notes")}>
                            Open notes studio
                        </button>
                    </div>
                    <p className="u--muted" style={{ marginTop: "12px" }}>
                        Existing notes currently in the system: {posts.length}
                    </p>
                </section>
            ) : null}
        </div>
    );
}
