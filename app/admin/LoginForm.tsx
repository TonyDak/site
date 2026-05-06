"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setStatus("loading");
        setMessage("");

        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: formData.get("username"),
                password: formData.get("password"),
            }),
        });

        if (response.ok) {
            router.replace("/admin");
            router.refresh();
            return;
        }

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus("error");
        setMessage(payload?.error ?? "Login failed.");
    }

    return (
        <form className="c--admin-form" onSubmit={handleSubmit}>
            <label className="c--field">
                Username
                <input name="username" defaultValue="admin" required />
            </label>
            <label className="c--field">
                Password
                <input name="password" type="password" required />
            </label>
            <button className="c--btn c--btn-primary" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
            <p className="c--status-msg u--muted">{message}</p>
        </form>
    );
}
