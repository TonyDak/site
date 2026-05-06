"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
    children: ReactNode;
    className?: string;
    delayMs?: number;
};

export function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "-6% 0px" }
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} ${visible ? "js--revealed" : ""}`.trim()}
            style={{ transitionDelay: `${delayMs}ms` }}
        >
            {children}
        </div>
    );
}
