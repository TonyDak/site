"use client";

import Link, { type LinkProps } from "next/link";
import { type MouseEvent, type ReactNode } from "react";
import { useTransitionNavigate } from "./TransitionProvider";

type Props = LinkProps & {
    className?: string;
    children: ReactNode;
};

export function TransitionLink({ href, className, children, ...props }: Props) {
    const { navigate } = useTransitionNavigate();
    const hrefString = String(href);

    return (
        <Link
            {...props}
            href={href}
            className={className}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                const isModified =
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0;

                if (isModified) {
                    return;
                }

                if (hrefString.startsWith("#")) {
                    return;
                }

                const currentUrl = new URL(window.location.href);
                const nextUrl = new URL(hrefString, window.location.origin);
                if (currentUrl.pathname === nextUrl.pathname && nextUrl.hash) {
                    return;
                }

                event.preventDefault();
                navigate(hrefString);
            }}
        >
            {children}
        </Link>
    );
}
