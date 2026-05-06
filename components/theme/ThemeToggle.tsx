"use client";

import { useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
    const html = document.documentElement;
    html.classList.remove("theme-light", "theme-dark");
    html.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("portfolio-theme", theme);
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof document === "undefined") {
            return "light";
        }

        return document.documentElement.classList.contains("theme-dark")
            ? "dark"
            : "light";
    });

    return (
        <button
            type="button"
            className="c--theme-toggle"
            aria-label="Toggle color theme"
            onClick={() => {
                const nextTheme = theme === "light" ? "dark" : "light";
                applyTheme(nextTheme);
                setTheme(nextTheme);
            }}
        >
            <div className="c--theme-toggle-icon">
                {theme === "light" ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="m4.93 4.93 1.41 1.41" />
                        <path d="m17.66 17.66 1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="m6.34 17.66-1.41 1.41" />
                        <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                )}
            </div>
        </button>
    );
}
