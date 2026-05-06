import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Notes Hidden | Tony Portfolio",
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    void params;
    notFound();
}
