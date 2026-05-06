import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Notes | Tony Portfolio",
    description: "Writing on UI systems, motion, and frontend delivery.",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function BlogPage() {
    notFound();
}
