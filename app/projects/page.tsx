import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Projects | Tony Portfolio",
    description: "Selected product, marketing, and design system case studies.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function ProjectsPage() {
    notFound();
}
