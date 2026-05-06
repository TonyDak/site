"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setStatus("loading");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    email: formData.get("email"),
                    detail: formData.get("detail"),
                    website: formData.get("website"),
                }),
            });

            if (response.ok) {
                setStatus("success");
                setMessage("Message sent. I will reply shortly.");
                form.reset();
                return;
            }

            const payload = (await response.json().catch(() => null)) as
                | { error?: string }
                | null;
            setStatus("error");
            setMessage(payload?.error ?? "Could not send right now. Please try again.");
        } catch {
            setStatus("error");
            setMessage("Network issue. Please try again in a moment.");
        }
    }

    return (
        <form className="c--contact-form" onSubmit={handleSubmit}>
            <label className="c--field">
                Name
                <input name="name" required />
            </label>

            <label className="c--field">
                Email
                <input name="email" type="email" required />
            </label>

            <label className="c--field">
                Project details
                <textarea name="detail" rows={6} required />
            </label>

            <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: "none" }}
            />

            <button className="c--btn c--btn-primary" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send message"}
            </button>

            <p className="u--muted c--status-msg">{status !== "idle" ? message : ""}</p>
        </form>
    );
}
